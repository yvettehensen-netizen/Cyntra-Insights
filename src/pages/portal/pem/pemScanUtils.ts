import { supabase } from "@/lib/supabaseClient";

export type UploadedDocument = {
  id: string;
  name: string;
  type: string;
  size: number;
  text: string;
};

export const MAX_DOC_TEXT_CHARS = 6000;
export const MAX_SUMMARY_CHARS = 14000;
export const UPLOAD_BUCKET = "cyntra-uploads";

const TEXT_MIME_TYPES = new Set([
  "application/json",
  "application/xml",
  "application/csv",
  "application/x-csv",
  "text/plain",
  "text/markdown",
  "text/csv",
  "text/xml",
]);

const TEXT_EXTENSIONS = [
  ".txt",
  ".md",
  ".markdown",
  ".csv",
  ".json",
  ".xml",
  ".log",
];

export async function resolveOrganisationId(sessionRes: any) {
  let organisationId =
    typeof localStorage !== "undefined"
      ? localStorage.getItem("active_org_id")
      : null;

  if (organisationId) {
    return String(organisationId);
  }

  const userId = sessionRes?.data?.session?.user?.id ?? null;
  if (!userId) return null;

  const { data: membership, error } = await supabase
    .from("organisation_memberships")
    .select("organisation_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!error && membership?.organisation_id) {
    organisationId = String(membership.organisation_id);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("active_org_id", organisationId);
    }
    return organisationId;
  }

  return null;
}

export function isTextLike(file: File) {
  if (file.type && file.type.startsWith("text/")) return true;
  if (file.type && TEXT_MIME_TYPES.has(file.type)) return true;
  const lower = file.name.toLowerCase();
  return TEXT_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export function truncateText(value: string, max: number) {
  if (!value) return "";
  if (value.length <= max) return value.trim();
  return `${value.slice(0, max).trim()}…`;
}

export function compactWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export async function readFileText(file: File) {
  if (!isTextLike(file)) return "";
  const raw = await file.text();
  return truncateText(compactWhitespace(raw), MAX_DOC_TEXT_CHARS);
}

export async function buildDocumentPayload(
  files: File[]
): Promise<UploadedDocument[]> {
  const docs = await Promise.all(
    files.map(async (file, idx) => {
      let text = "";
      try {
        text = await readFileText(file);
      } catch {
        text = "";
      }

      return {
        id: `${idx}-${file.name}`,
        name: file.name,
        type: file.type || "onbekend",
        size: file.size,
        text,
      };
    })
  );

  return docs;
}

export function safeFileName(value: string) {
  return value.replace(/[^a-z0-9._-]+/gi, "_").replace(/_+/g, "_");
}

export async function uploadDocuments(
  files: File[],
  organisationId: string,
  userId?: string | null
) {
  const uid = userId ?? "anonymous";
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const prefix = `${organisationId}/${uid}/${timestamp}`;

  const uploads = [];

  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];
    const safeName = safeFileName(file.name);
    const path = `${prefix}/${i}-${safeName}`;
    const { error } = await supabase.storage
      .from(UPLOAD_BUCKET)
      .upload(path, file, {
        upsert: true,
        contentType: file.type || "application/octet-stream",
      });

    if (error) {
      throw new Error(
        `Upload mislukt voor ${file.name}: ${error.message}. Controleer of bucket '${UPLOAD_BUCKET}' bestaat.`
      );
    }

    const { data: publicData } = supabase.storage
      .from(UPLOAD_BUCKET)
      .getPublicUrl(path);
    const publicUrl = publicData?.publicUrl ?? null;

    uploads.push({
      bucket: UPLOAD_BUCKET,
      path,
      name: file.name,
      type: file.type || "onbekend",
      size: file.size,
      public_url: publicUrl,
    });
  }

  return uploads;
}

export function buildDocumentsSummary(docs: UploadedDocument[]) {
  if (!docs.length) return "";

  const blocks = docs.map((doc, idx) => {
    const header = `DOC ${idx + 1}: ${doc.name} (${doc.type}, ${formatBytes(
      doc.size
    )})`;
    const body = doc.text ? doc.text : "Geen tekstextractie beschikbaar.";
    return `${header}\n${body}`;
  });

  return truncateText(blocks.join("\n\n"), MAX_SUMMARY_CHARS);
}

export function formatBytes(bytes: number) {
  if (!bytes || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const idx = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / Math.pow(1024, idx);
  return `${value.toFixed(value >= 10 || idx === 0 ? 0 : 1)} ${units[idx]}`;
}
