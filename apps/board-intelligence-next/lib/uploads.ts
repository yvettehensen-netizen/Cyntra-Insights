import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { normalizeUploadRow, type AnalysisUploadRow } from "@/lib/types";

const TEXT_MIME_TYPES = new Set([
  "text/plain",
  "text/csv",
  "text/markdown",
  "application/json",
  "application/xml",
  "text/xml",
]);
const UPLOAD_BUCKET = "analysis-uploads";

async function ensureUploadBucket(supabase: SupabaseClient): Promise<void> {
  const { data: existingBucket } = await supabase.storage.getBucket(UPLOAD_BUCKET);
  if (existingBucket) return;

  const { error } = await supabase.storage.createBucket(UPLOAD_BUCKET, {
    public: false,
    fileSizeLimit: 10 * 1024 * 1024,
  });

  if (error && !String(error.message).toLowerCase().includes("already exists")) {
    throw new Error(`Failed to ensure upload bucket: ${error.message}`);
  }
}

export function extractTextFromUpload(file: File, bytes: Uint8Array): string | null {
  if (!TEXT_MIME_TYPES.has(file.type)) {
    return null;
  }

  const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  const normalized = text.replace(/\u0000/g, "").trim();

  if (!normalized) return null;
  return normalized.length > 20_000 ? `${normalized.slice(0, 20_000)}\n...[truncated]` : normalized;
}

export async function saveUploadToSupabase(options: {
  organizationId: string;
  file: File;
  supabase?: SupabaseClient;
}): Promise<AnalysisUploadRow> {
  const supabase = options.supabase ?? getSupabaseAdmin();
  const file = options.file;
  await ensureUploadBucket(supabase);

  const bytes = new Uint8Array(await file.arrayBuffer());
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const storagePath = `${options.organizationId}/${timestamp}-${randomUUID()}-${file.name}`;

  const { error: storageError } = await supabase.storage
    .from(UPLOAD_BUCKET)
    .upload(storagePath, bytes, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (storageError) {
    throw new Error(`Upload to storage failed: ${storageError.message}`);
  }

  const extractedText = extractTextFromUpload(file, bytes);

  const { data, error } = await supabase
    .from("analysis_uploads")
    .insert({
      organization_id: options.organizationId,
      file_name: file.name,
      mime_type: file.type || "application/octet-stream",
      size_bytes: bytes.byteLength,
      storage_path: storagePath,
      extracted_text: extractedText,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(`Insert upload metadata failed: ${error?.message ?? "unknown"}`);
  }

  return normalizeUploadRow(data);
}

export async function resolveUploadsById(options: {
  organizationId: string;
  uploadIds: string[];
  supabase?: SupabaseClient;
}): Promise<AnalysisUploadRow[]> {
  if (!options.uploadIds.length) return [];

  const supabase = options.supabase ?? getSupabaseAdmin();
  const { data, error } = await supabase
    .from("analysis_uploads")
    .select("*")
    .eq("organization_id", options.organizationId)
    .in("id", options.uploadIds);

  if (error) {
    throw new Error(`Failed to resolve uploadIds: ${error.message}`);
  }

  return (data ?? []).map(normalizeUploadRow);
}

export async function linkUploadsToAnalysis(options: {
  uploadIds: string[];
  analysisId: string;
  supabase?: SupabaseClient;
}): Promise<void> {
  if (!options.uploadIds.length) return;

  const supabase = options.supabase ?? getSupabaseAdmin();
  const { error } = await supabase
    .from("analysis_uploads")
    .update({ analysis_id: options.analysisId })
    .in("id", options.uploadIds);

  if (error) {
    throw new Error(`Failed to link uploads to analysis: ${error.message}`);
  }
}

export async function getUploadsForAnalysis(options: {
  analysisId: string;
  supabase?: SupabaseClient;
}): Promise<AnalysisUploadRow[]> {
  const supabase = options.supabase ?? getSupabaseAdmin();
  const { data, error } = await supabase
    .from("analysis_uploads")
    .select("*")
    .eq("analysis_id", options.analysisId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch analysis uploads: ${error.message}`);
  }

  return (data ?? []).map(normalizeUploadRow);
}
