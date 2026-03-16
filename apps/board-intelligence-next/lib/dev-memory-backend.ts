import { randomUUID } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { buildExecutiveReportHtml } from "@/lib/report-template";
import { runOpenAiAnalysis } from "@/lib/openai";
import {
  type AnalysisInputPayload,
  type AnalysisResultPayload,
  type AnalysisRow,
  type AnalysisUploadRow,
  type ReportRow,
} from "@/lib/types";
import { extractTextFromUpload } from "@/lib/uploads";

type Org = { id: string; name: string };

type MemoryState = {
  orgs: Org[];
  uploads: AnalysisUploadRow[];
  analyses: AnalysisRow[];
  reports: ReportRow[];
};

const STATE_FILE = path.join(os.tmpdir(), "cyntra-board-memory-backend.json");

function now(): string {
  return new Date().toISOString();
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function createEmptyState(): MemoryState {
  return { orgs: [], uploads: [], analyses: [], reports: [] };
}

function readState(): MemoryState {
  try {
    if (!fs.existsSync(STATE_FILE)) return createEmptyState();
    const raw = fs.readFileSync(STATE_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<MemoryState>;
    return {
      orgs: Array.isArray(parsed.orgs) ? parsed.orgs : [],
      uploads: Array.isArray(parsed.uploads) ? parsed.uploads : [],
      analyses: Array.isArray(parsed.analyses) ? parsed.analyses : [],
      reports: Array.isArray(parsed.reports) ? parsed.reports : [],
    };
  } catch {
    return createEmptyState();
  }
}

function writeState(state: MemoryState): void {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state), "utf8");
}

function withState<T>(updater: (state: MemoryState) => T): T {
  const state = readState();
  const result = updater(state);
  writeState(state);
  return result;
}

export function isMemoryBackendEnabled(): boolean {
  return process.env.CYNTRA_USE_MEMORY_BACKEND === "true";
}

function ensureOrganization(input: { organizationId?: string; organization?: string }): Org {
  return withState((state) => {
    if (input.organizationId) {
      const existing = state.orgs.find((org) => org.id === input.organizationId);
      if (existing) return existing;
      const created = {
        id: input.organizationId,
        name: input.organization ?? "Organization",
      };
      state.orgs.push(created);
      return created;
    }

    const name = (input.organization ?? "").trim();
    if (!name) {
      throw new Error("organizationId of organization is verplicht");
    }

    const existing = state.orgs.find((org) => org.name.toLowerCase() === name.toLowerCase());
    if (existing) return existing;

    const created = { id: randomUUID(), name };
    state.orgs.push(created);
    return created;
  });
}

export async function saveUploadInMemory(input: {
  organizationId?: string;
  organization?: string;
  file: File;
}): Promise<AnalysisUploadRow> {
  const org = ensureOrganization({
    organizationId: input.organizationId,
    organization: input.organization,
  });
  const createdAt = now();
  const bytes = new Uint8Array(await input.file.arrayBuffer());

  const row: AnalysisUploadRow = {
    id: randomUUID(),
    organization_id: org.id,
    analysis_id: null,
    file_name: input.file.name,
    mime_type: input.file.type || "application/octet-stream",
    size_bytes: bytes.byteLength,
    storage_path: `memory://${org.id}/${Date.now()}-${input.file.name}`,
    extracted_text: extractTextFromUpload(input.file, bytes),
    created_at: createdAt,
    updated_at: createdAt,
  };

  return withState((state) => {
    state.uploads.push(row);
    return row;
  });
}

function getUploadsByIds(organizationId: string, uploadIds: string[]): AnalysisUploadRow[] {
  const state = readState();
  return uploadIds
    .map((id) => state.uploads.find((row) => row.id === id))
    .filter((row): row is AnalysisUploadRow => Boolean(row && row.organization_id === organizationId));
}

function linkUploadsToAnalysis(uploadIds: string[], analysisId: string): void {
  withState((state) => {
    for (const uploadId of uploadIds) {
      const idx = state.uploads.findIndex((row) => row.id === uploadId);
      if (idx < 0) continue;
      state.uploads[idx] = {
        ...state.uploads[idx],
        analysis_id: analysisId,
        updated_at: now(),
      };
    }
  });
}

export async function createAnalysisInMemory(input: {
  organizationId?: string;
  organization?: string;
  description: string;
  context?: Record<string, unknown>;
  uploadIds?: string[];
  runImmediately?: boolean;
}): Promise<AnalysisRow> {
  const org = ensureOrganization({
    organizationId: input.organizationId,
    organization: input.organization,
  });
  const createdAt = now();
  const uploads = getUploadsByIds(org.id, input.uploadIds ?? []);

  const payload: AnalysisInputPayload = {
    organization_name: org.name,
    description: input.description.trim(),
    context: input.context ?? {},
    uploads: uploads.map((upload) => ({
      upload_id: upload.id,
      file_name: upload.file_name,
      mime_type: upload.mime_type,
      size_bytes: upload.size_bytes,
      extracted_text: upload.extracted_text,
    })),
    requested_at: createdAt,
  };

  const analysisId = randomUUID();
  const baseRow: AnalysisRow = {
    id: analysisId,
    organization_id: org.id,
    status: "pending",
    input_payload: payload,
    result_payload: null,
    error_message: null,
    started_at: null,
    finished_at: null,
    created_at: createdAt,
    updated_at: createdAt,
  };

  withState((state) => {
    state.analyses.push(baseRow);
  });
  linkUploadsToAnalysis(input.uploadIds ?? [], analysisId);

  if (!input.runImmediately) {
    return baseRow;
  }

  const startedAt = now();
  withState((state) => {
    const idx = state.analyses.findIndex((row) => row.id === analysisId);
    if (idx >= 0) {
      state.analyses[idx] = {
        ...baseRow,
        status: "running",
        started_at: startedAt,
        updated_at: startedAt,
      };
    }
  });

  const result: AnalysisResultPayload = await runOpenAiAnalysis(payload);
  const finishedAt = now();
  const doneRow: AnalysisRow = {
    ...baseRow,
    status: "done",
    result_payload: result,
    started_at: startedAt,
    finished_at: finishedAt,
    updated_at: finishedAt,
  };

  withState((state) => {
    const idx = state.analyses.findIndex((row) => row.id === analysisId);
    if (idx >= 0) {
      state.analyses[idx] = doneRow;
    } else {
      state.analyses.push(doneRow);
    }
  });

  const title = `Executive Rapport · ${new Date().toLocaleDateString("nl-NL")}`;
  const report: ReportRow = {
    id: randomUUID(),
    analysis_id: analysisId,
    organization_id: org.id,
    title,
    summary: result.executive_summary,
    html_content: buildExecutiveReportHtml({
      title,
      organizationName: org.name,
      analysisId,
      result,
      uploads: uploads.map((upload) => ({
        file_name: upload.file_name,
        mime_type: upload.mime_type,
        size_bytes: upload.size_bytes,
      })),
    }),
    pdf_path: null,
    metadata: {
      model: result.model,
      generated_at: result.generated_at,
      mode: "memory_backend",
    },
    created_at: finishedAt,
    updated_at: finishedAt,
  };

  withState((state) => {
    const idx = state.reports.findIndex((entry) => entry.analysis_id === analysisId);
    if (idx >= 0) {
      state.reports[idx] = report;
    } else {
      state.reports.push(report);
    }
  });

  return doneRow;
}

export function getAnalysisWithOptionalReportInMemory(analysisId: string): {
  analysis: AnalysisRow;
  report: ReportRow | null;
  uploads: AnalysisUploadRow[];
} {
  const state = readState();
  const analysis = state.analyses.find((entry) => entry.id === analysisId);
  if (!analysis) {
    throw new Error(`Analysis ${analysisId} not found`);
  }

  return {
    analysis,
    report: state.reports.find((entry) => entry.analysis_id === analysisId) ?? null,
    uploads: state.uploads.filter((upload) => upload.analysis_id === analysisId),
  };
}

export function getReportByAnalysisIdInMemory(analysisId: string): ReportRow | null {
  const state = readState();
  return state.reports.find((entry) => entry.analysis_id === analysisId) ?? null;
}

export function resolveUploadsForQueryInMemory(input: {
  analysisId?: string;
  organizationId?: string;
  uploadIds?: string[];
}): AnalysisUploadRow[] {
  const state = readState();
  if (input.analysisId) {
    return state.uploads.filter((upload) => upload.analysis_id === input.analysisId);
  }

  if (input.organizationId && input.uploadIds?.length) {
    return getUploadsByIds(input.organizationId, input.uploadIds);
  }

  return [];
}

export function getOrganizationIdInMemory(input: {
  organizationId?: string;
  organization?: string;
}): string {
  if (input.organizationId && !isUuid(input.organizationId)) {
    throw new Error(`Organization not found: ${input.organizationId}`);
  }
  return ensureOrganization(input).id;
}

export function buildMemoryPdf(analysisId: string): Uint8Array {
  const content = [
    "%PDF-1.1",
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 300 144] /Contents 4 0 R /Resources << >> >> endobj",
    "4 0 obj << /Length 62 >> stream",
    "BT /F1 12 Tf 20 90 Td (Executive report ready) Tj 20 70 Td (Analysis ID:) Tj 90 70 Td (" +
      analysisId.slice(0, 12) +
      ") Tj ET",
    "endstream endobj",
    "xref",
    "0 5",
    "0000000000 65535 f ",
    "0000000010 00000 n ",
    "0000000060 00000 n ",
    "0000000117 00000 n ",
    "0000000226 00000 n ",
    "trailer << /Size 5 /Root 1 0 R >>",
    "startxref",
    "360",
    "%%EOF",
  ].join("\n");
  return new TextEncoder().encode(content);
}
