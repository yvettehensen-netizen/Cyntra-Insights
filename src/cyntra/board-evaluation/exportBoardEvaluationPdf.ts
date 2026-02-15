import type {
  BoardEvaluationAggregate,
  BoardEvaluationOutput,
} from "@/cyntra/board-evaluation";

function formatDate(iso: string | null): string {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("nl-NL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function safeFilename(input: string): string {
  return input
    .replace(/[^\w-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export async function exportBoardEvaluationPdf(params: {
  organisationId: string;
  aggregate: BoardEvaluationAggregate;
  rows: BoardEvaluationOutput[];
}): Promise<void> {
  const [{ jsPDF }, autoTableModule] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const autoTable = autoTableModule.default as unknown as (
    doc: InstanceType<typeof jsPDF>,
    options: {
      startY?: number;
      head: string[][];
      body: (string | number)[][];
      styles?: Record<string, unknown>;
      headStyles?: Record<string, unknown>;
    }
  ) => void;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Cyntra Board Adoption & Legitimiteitsindex", 40, 50);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Organisatie: ${params.organisationId}`, 40, 72);
  doc.text(`Laatste update: ${formatDate(params.aggregate.latest_timestamp)}`, 40, 88);
  doc.text(`Respondenten: ${params.aggregate.sample_size}`, 40, 104);

  doc.setFont("helvetica", "bold");
  doc.text("Kernmetingen", 40, 130);
  doc.setFont("helvetica", "normal");

  const metricsBody: (string | number)[][] = [
    ["Board gemiddelde", params.aggregate.overall_average.toFixed(2)],
    [
      "Spreiding (min/max)",
      `${params.aggregate.spread.min.toFixed(2)} / ${params.aggregate.spread.max.toFixed(2)}`,
    ],
    [
      "Confidence band",
      `${params.aggregate.confidence_band.lower.toFixed(2)} - ${params.aggregate.confidence_band.upper.toFixed(2)}`,
    ],
    [
      "Board Adoption & Legitimiteitsindex",
      params.aggregate.board_adoption_legitimacy_index.toFixed(2),
    ],
    ["Classificatie", params.aggregate.board_adoption_legitimacy_classification],
  ];

  autoTable(doc, {
    startY: 140,
    head: [["Metriek", "Waarde"]],
    body: metricsBody,
    styles: {
      fontSize: 9,
      cellPadding: 5,
      textColor: [15, 23, 42],
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
  });

  const scoreBody: (string | number)[][] = [
    ["Helderheid", params.aggregate.averages.clarity_score.toFixed(2)],
    ["Besluitzekerheid", params.aggregate.averages.decision_certainty.toFixed(2)],
    ["Risicobegrip", params.aggregate.averages.risk_understanding.toFixed(2)],
    ["Governance-vertrouwen", params.aggregate.averages.governance_trust.toFixed(2)],
    ["Instrument-perceptie", params.aggregate.averages.instrument_perception.toFixed(2)],
  ];

  autoTable(doc, {
    startY: 290,
    head: [["Categorie", "Gemiddelde"]],
    body: scoreBody,
    styles: {
      fontSize: 9,
      cellPadding: 5,
      textColor: [15, 23, 42],
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
  });

  const rows = params.rows.slice(0, 100);
  const rowBody = rows.map((row) => [
    row.board_member_id.slice(0, 8),
    row.clarity_score.toFixed(1),
    row.decision_certainty.toFixed(1),
    row.risk_understanding.toFixed(1),
    row.governance_trust.toFixed(1),
    row.instrument_perception.toFixed(1),
    row.overall_score.toFixed(1),
    formatDate(row.timestamp),
  ]);

  autoTable(doc, {
    startY: 430,
    head: [
      [
        "Board lid",
        "Clarity",
        "Besluit",
        "Risico",
        "Governance",
        "Instrument",
        "Overall",
        "Tijdstip",
      ],
    ],
    body: rowBody,
    styles: {
      fontSize: 8,
      cellPadding: 4,
      textColor: [15, 23, 42],
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
  });

  const filename = safeFilename(
    `cyntra_board_adoption_legitimiteitsindex_${params.organisationId}_${new Date().toISOString().slice(0, 10)}`
  );
  doc.save(`${filename}.pdf`);
}
