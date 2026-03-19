import { Fragment } from "react";
import { reportViewStyles } from "./reportViewStyles";
import { sanitizeReportOutput } from "@/utils/sanitizeReportOutput";

type ReportStructuredContentProps = {
  body: string;
  compact?: boolean;
};

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\r/g, "").trim();
}

function compactSpacing(value: string): string {
  return normalize(value).replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n");
}

function isSubtitle(line: string): boolean {
  const text = normalize(line);
  return !!text && text.length <= 48 && !/[.:]$/.test(text) && !/^[-•]/.test(text) && text === text.toUpperCase();
}

function splitBlocks(body: string): string[] {
  return compactSpacing(body).split(/\n\s*\n/g).map((part) => part.trim()).filter(Boolean);
}

export default function ReportStructuredContent({ body, compact = false }: ReportStructuredContentProps) {
  const blocks = splitBlocks(sanitizeReportOutput(body));

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      {blocks.map((block, index) => {
        const lines = block.split(/\n+/).map((line) => line.trim()).filter(Boolean);
        return (
          <Fragment key={`paragraph-${index}`}>
            {lines.map((line, lineIndex) =>
              isSubtitle(line) ? (
                <p key={`${index}-${lineIndex}`} className={reportViewStyles.section.subheading}>
                  {line}
                </p>
              ) : (
                <p key={`${index}-${lineIndex}`} className={reportViewStyles.section.paragraphCompact}>
                  {line}
                </p>
              ),
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
