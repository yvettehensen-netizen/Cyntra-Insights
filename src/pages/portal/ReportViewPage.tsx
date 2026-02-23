import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

function extractNarrativeMarkdown(report: any): string {
  const candidates = [
    report?.content?.raw_markdown,
    report?.content?.narrative,
    report?.content?.report?.narrative,
    report?.content?.text,
    report?.raw_markdown,
    report?.narrative,
    report?.result?.raw_markdown,
    report?.result?.narrative,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  return "";
}

function normalizeHeadingLine(line: string): string {
  return line.replace(/^#{1,6}\s*/, "").trim();
}

function renderNarrativeMarkdown(markdown: string) {
  const lines = String(markdown || "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.map((line, index) => {
    const cleanLine = normalizeHeadingLine(line);
    if (
      /^(\d+)\.\s+/i.test(cleanLine) ||
      /^###\s*(\d+)\.\s+/i.test(line)
    ) {
      return (
        <h2
          key={`h2-${index}-${cleanLine.slice(0, 24)}`}
          className="mt-8 text-2xl font-semibold text-[#d4af37]"
        >
          {cleanLine}
        </h2>
      );
    }

    if (
      /^([A-E])\.\s+/i.test(cleanLine) ||
      /^(Bovenstroom|Onderstroom)\b/i.test(cleanLine)
    ) {
      return (
        <h4
          key={`h4-${index}-${cleanLine.slice(0, 24)}`}
          className="mt-5 text-lg font-semibold text-white"
        >
          {cleanLine}
        </h4>
      );
    }

    return (
      <p
        key={`p-${index}-${cleanLine.slice(0, 24)}`}
        className="mt-3 leading-relaxed text-white/80"
      >
        {cleanLine}
      </p>
    );
  });
}

export default function ReportViewPage() {
  const { id } = useParams();
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("reports")
        .select("*")
        .eq("id", id)
        .single();

      if (data) setReport(data);
    }

    load();
  }, [id]);

  if (!report) return <p className="text-white">Loading...</p>;
  const narrativeMarkdown = extractNarrativeMarkdown(report);

  return (
    <div className="min-h-screen bg-black text-white px-10 py-20">
      <h1 className="text-3xl text-[#d4af37] mb-6">{report.title}</h1>

      {narrativeMarkdown ? (
        <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
          {renderNarrativeMarkdown(narrativeMarkdown)}
        </article>
      ) : (
        <pre className="text-white/70 whitespace-pre-wrap">
          {JSON.stringify(report.content, null, 2)}
        </pre>
      )}
    </div>
  );
}
