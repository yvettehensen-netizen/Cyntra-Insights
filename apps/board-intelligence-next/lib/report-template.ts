import type { AnalysisResultPayload } from "@/lib/types";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function scoreBars(scores: AnalysisResultPayload["scores"]): string {
  const max = Math.max(100, ...scores.map((score) => score.value));

  return `
    <div class="score-grid">
      ${scores
        .map((score) => {
          const width = Math.max(4, Math.round((score.value / max) * 100));
          const trendClass =
            score.trend === "up"
              ? "trend-up"
              : score.trend === "down"
              ? "trend-down"
              : "trend-flat";

          return `
            <div class="score-row">
              <div class="score-label">${escapeHtml(score.name)}</div>
              <div class="score-track"><span class="score-fill ${trendClass}" style="width:${width}%"></span></div>
              <div class="score-value">${score.value.toFixed(0)}</div>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function scoreTable(scores: AnalysisResultPayload["scores"]): string {
  return `
    <table class="score-table">
      <thead>
        <tr>
          <th>Metric</th>
          <th>Score</th>
          <th>Trend</th>
        </tr>
      </thead>
      <tbody>
        ${scores
          .map(
            (score) => `
              <tr>
                <td>${escapeHtml(score.name)}</td>
                <td>${score.value.toFixed(0)}</td>
                <td>${escapeHtml(score.trend)}</td>
              </tr>
            `
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function bulletList(items: string[]): string {
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

export function buildExecutiveReportHtml(input: {
  title: string;
  organizationName: string;
  analysisId: string;
  result: AnalysisResultPayload;
  uploads?: Array<{
    file_name: string;
    mime_type: string;
    size_bytes: number;
  }>;
}): string {
  const { title, organizationName, analysisId, result } = input;
  const uploads = input.uploads ?? [];

  return `
<!doctype html>
<html lang="nl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <style>
      body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        background: #f6f8fc;
        color: #0b1220;
      }
      .page {
        padding: 32px;
      }
      .hero {
        background: linear-gradient(135deg, #0b1220, #1e293b);
        color: #f8fafc;
        padding: 28px;
        border-radius: 14px;
      }
      h1 {
        margin: 0;
        font-size: 28px;
      }
      .muted {
        opacity: 0.8;
        margin-top: 6px;
        font-size: 13px;
      }
      .grid {
        margin-top: 20px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
      .card {
        background: white;
        border-radius: 12px;
        padding: 18px;
        box-shadow: 0 6px 18px rgba(15, 23, 42, 0.08);
      }
      .card h2 {
        margin-top: 0;
        margin-bottom: 10px;
        font-size: 17px;
      }
      ul {
        margin: 0;
        padding-left: 18px;
      }
      li {
        margin-bottom: 8px;
        line-height: 1.45;
      }
      .summary {
        margin-top: 20px;
        background: #ecfeff;
        border-left: 5px solid #0ea5e9;
        padding: 16px;
        border-radius: 10px;
        line-height: 1.6;
      }
      .score-grid {
        display: grid;
        gap: 10px;
      }
      .score-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 14px;
      }
      .uploads-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
      }
      .uploads-table th,
      .uploads-table td {
        text-align: left;
        border-bottom: 1px solid #e2e8f0;
        padding: 8px 6px;
        font-size: 12px;
      }
      .score-table th,
      .score-table td {
        text-align: left;
        border-bottom: 1px solid #e2e8f0;
        padding: 8px 6px;
        font-size: 12px;
      }
      .score-table th {
        color: #334155;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-size: 11px;
      }
      .score-row {
        display: grid;
        grid-template-columns: 180px 1fr 45px;
        align-items: center;
        gap: 10px;
      }
      .score-label {
        font-size: 13px;
        color: #334155;
      }
      .score-track {
        height: 10px;
        background: #e2e8f0;
        border-radius: 999px;
        overflow: hidden;
      }
      .score-fill {
        display: block;
        height: 100%;
      }
      .trend-up {
        background: linear-gradient(90deg, #22c55e, #16a34a);
      }
      .trend-flat {
        background: linear-gradient(90deg, #0ea5e9, #0284c7);
      }
      .trend-down {
        background: linear-gradient(90deg, #ef4444, #dc2626);
      }
      .score-value {
        text-align: right;
        font-weight: 700;
      }
      .footer {
        margin-top: 22px;
        font-size: 11px;
        color: #64748b;
      }
      @media print {
        .page {
          padding: 12px;
        }
      }
    </style>
  </head>
  <body>
    <main class="page">
      <section class="hero">
        <h1>${escapeHtml(title)}</h1>
        <div class="muted">Organisatie: ${escapeHtml(organizationName)} • Analyse-ID: ${escapeHtml(
    analysisId
  )}</div>
        <div class="muted">Gegenereerd op: ${escapeHtml(new Date(result.generated_at).toLocaleString("nl-NL"))}</div>
      </section>

      <section class="summary">
        <strong>Executive Summary</strong>
        <p>${escapeHtml(result.executive_summary)}</p>
      </section>

      <section class="grid">
        <article class="card">
          <h2>Kernbevindingen</h2>
          ${bulletList(result.key_findings)}
        </article>
        <article class="card">
          <h2>Directe acties</h2>
          ${bulletList(result.actions)}
        </article>
        <article class="card">
          <h2>Risico's</h2>
          ${bulletList(result.risks)}
        </article>
        <article class="card">
          <h2>Kansen</h2>
          ${bulletList(result.opportunities)}
        </article>
      </section>

      <section class="card" style="margin-top: 16px;">
        <h2>Bestuurlijke scorekaart</h2>
        ${scoreBars(result.scores)}
        ${scoreTable(result.scores)}
      </section>

      ${
        uploads.length
          ? `
      <section class="card" style="margin-top: 16px;">
        <h2>Bronbestanden</h2>
        <table class="uploads-table">
          <thead>
            <tr>
              <th>Bestand</th>
              <th>Type</th>
              <th>Grootte (bytes)</th>
            </tr>
          </thead>
          <tbody>
            ${uploads
              .map(
                (upload) => `
              <tr>
                <td>${escapeHtml(upload.file_name)}</td>
                <td>${escapeHtml(upload.mime_type)}</td>
                <td>${upload.size_bytes}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </section>
      `
          : ""
      }

      <footer class="footer">
        Model: ${escapeHtml(result.model)} • Board Intelligence Pipeline
      </footer>
    </main>
  </body>
</html>
  `.trim();
}
