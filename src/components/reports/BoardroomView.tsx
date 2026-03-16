import type {
  ReportSection,
  ReportViewModel,
} from "./types";
import {
  compactBoardroomBody,
  frameBoardroomShock,
  normalizeBoardroomBullet,
} from "@/aurelius/executive/BoardroomLanguageNormalizer";
import { reportViewStyles } from "./reportViewStyles";
import BestuurlijkeBesliskaartCard from "./BestuurlijkeBesliskaartCard";
import StrategicStoryBridgeCard from "./StrategicStoryBridgeCard";
import { presentReportSectionTitle } from "./reportTitlePresentation";

type BoardroomViewProps = {
  model: ReportViewModel;
  compact?: boolean;
  onCopyDecision?: () => void;
};

type OrderedSection = {
  id: number;
  title: string;
  body: string;
  bullets?: string[];
  hideEmptyState?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
};

type StructuredBlock = {
  eyebrow: string;
  body: string[];
};

const EMPHASIZED_SECTION_TITLES = new Set(["Bestuurlijke kernsamenvatting", "Aanbevolen keuze"]);
const ACCENT_BULLET_SECTION_TITLES = new Set([
  "Doorbraakinzichten",
  "Bestuurlijke blinde vlekken",
  "Strategische keuzes met meeste effect",
  "Bestuurlijk debat",
]);

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function toParagraphs(value: string, max = 3): string[] {
  return String(value || "")
    .split(/\n\s*\n|(?<=\.)\s+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, max);
}

function findSectionBody(sections: ReportSection[], title: string): string {
  return sections.find((section) => section.title.toUpperCase() === title.toUpperCase())?.body?.trim() || "";
}

function findSectionBodyByAliases(sections: ReportSection[], titles: string[]): string {
  const aliases = titles.map((title) => title.toUpperCase());
  return sections.find((section) => aliases.includes(section.title.toUpperCase()))?.body?.trim() || "";
}

function buildBullets(lines: string[], max = 5): string[] {
  return lines.map((line) => normalizeBoardroomBullet(line, 220)).filter(Boolean).slice(0, max);
}

function parseKillerInsightBullets(body: string): string[] {
  const text = String(body || "").trim();
  if (!text) return [];
  const chunks = text
    .split(/\n(?=(?:Kerninzicht|Doorbraakinzicht|Inzicht|Strategisch inzicht|Kernmechanisme)(?:\s+\d+)?)/i)
    .map((item) => item.trim())
    .filter(Boolean);
  const insightBlocks = chunks
    .map((chunk) => {
      const explicit = chunk.match(
        /(?:KERNINZICHT|DOORBRAAKINZICHT|INZICHT)\s*\n([\s\S]*?)(?=\n(?:ONDERLIGGENDE OORZAAK|BESTUURLIJK GEVOLG|MECHANISME|IMPLICATIE|BESTUURLIJKE CONSEQUENTIE)\b|$)/i
      )?.[1];
      const fallback = chunk
        .split("\n")
        .map((line) => line.trim())
        .filter(
          (line) =>
            line &&
            !/^(?:Kerninzicht|Doorbraakinzicht|Inzicht|Strategisch inzicht|Kernmechanisme)\s+\d+$/i.test(line) &&
            !/^(KERNINZICHT|DOORBRAAKINZICHT|INZICHT|MECHANISME|IMPLICATIE|BESTUURLIJK GEVOLG|ONDERLIGGENDE OORZAAK)$/i.test(
              line
            )
        )[0];
      return normalize(explicit || fallback || "");
    })
    .filter(Boolean);
  if (insightBlocks.length) {
    return Array.from(
      new Set(insightBlocks.map((item) => frameBoardroomShock(normalizeBoardroomBullet(item, 220), 180)))
    ).slice(0, 5);
  }
  return buildBullets(text.split(/\n+/), 7);
}

function parseInterventionBullets(body: string): string[] {
  const text = String(body || "").trim();
  if (!text) return [];
  const labeledBlocks = text
    .split(/\n(?=Interventie\s+\d+)/i)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const action = normalize(part.match(/Interventie:\s*(.+)/i)?.[1] || "");
      const mechanism = normalize(part.match(/Mechanisme:\s*([\s\S]*?)(?=\n(?:KPI|Risico):|$)/i)?.[1] || "");
      const kpi = normalize(part.match(/KPI:\s*(.+)/i)?.[1] || "");
      return [action, mechanism ? `Mechanisme: ${mechanism}` : "", kpi ? `KPI: ${kpi}` : ""]
        .filter(Boolean)
        .join(" - ");
    })
    .filter(Boolean)
    .map((item) => normalizeBoardroomBullet(item, 240));
  if (labeledBlocks.length) return labeledBlocks.slice(0, 8);
  const numbered = text
    .split(/\n(?=\d+\.\s+(?:Actie:|Voor ))/g)
    .filter((part) => /^\d+\.\s+/.test(normalize(part)))
    .map((part) => normalizeBoardroomBullet(part.replace(/\n+/g, " - "), 240));
  if (numbered.length) return numbered.slice(0, 8);
  return buildBullets(text.split(/\n+/), 8);
}

function sectionBody(paragraphs: string[]): string {
  return paragraphs.filter(Boolean).join("\n\n");
}

function compactSectionBody(title: string, body: string): string {
  const normalizedTitle = normalize(title).toUpperCase();
  if (!body) return "";
  if (normalizedTitle === "BESTUURLIJKE KERNSAMENVATTING") {
    return body.trim();
  }
  if (["KERNSTELLING VAN HET RAPPORT", "EXECUTIVE THESIS", "AANBEVOLEN KEUZE", "STRATEGISCHE SPANNING"].includes(normalizedTitle)) {
    return compactBoardroomBody(body, { maxParagraphs: 2, maxCharsPerParagraph: 240 });
  }
  if (
    [
      "FEITENBASIS",
      "BOARDROOM STRESSTEST",
      "BESTUURLIJKE STRESSTEST",
      "STRATEGISCHE BLINDE VLEKKEN",
      "BESTUURLIJKE BLINDE VLEKKEN",
      "BESTUURSLIJK ACTIEPLAN",
      "BESLUITGEVOLGEN",
      "BESLUITGEVOLGEN SIMULATIE",
      "STRATEGISCHE HEFBOOMPUNTEN",
      "STRATEGISCH GEHEUGEN",
      "BESTUURLIJK DEBAT",
      "VROEGSIGNALERING",
      "MOGELIJKE ONTWIKKELINGEN",
    ].includes(normalizedTitle)
  ) {
    return compactBoardroomBody(body, { maxParagraphs: 2, maxCharsPerParagraph: 320 });
  }
  return compactBoardroomBody(body, { maxParagraphs: 3, maxCharsPerParagraph: 320 });
}

function SectionBlock({ section }: { section: OrderedSection }) {
  const paragraphs = String(section.body || "")
    .split(/\n\s*\n/g)
    .map((part) => part.trim())
    .filter(Boolean);
  const emphasized = EMPHASIZED_SECTION_TITLES.has(section.title);
  const accentBullets = ACCENT_BULLET_SECTION_TITLES.has(section.title);

  return (
    <section className={reportViewStyles.section.root}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className={reportViewStyles.section.number}>{String(section.id).padStart(2, "0")}</p>
          <h2 className={reportViewStyles.section.title}>{presentReportSectionTitle(section.title)}</h2>
          <div className={reportViewStyles.section.rule} />
        </div>
        {section.action ? (
          <button
            type="button"
            onClick={section.action.onClick}
            className={reportViewStyles.section.action}
          >
            {section.action.label}
          </button>
        ) : null}
      </div>

      {paragraphs.length
        ? paragraphs.map((paragraph, index) => (
            <p
              key={`${section.title}-${index}`}
              className={
                emphasized
                  ? reportViewStyles.section.emphasizedParagraph
                  : reportViewStyles.section.paragraph
              }
            >
              {paragraph}
            </p>
          ))
        : !section.bullets?.length && !section.hideEmptyState ? (
          <p className={reportViewStyles.section.muted}>Niet beschikbaar.</p>
        ) : null}

      {section.bullets?.length ? (
        <ul className={accentBullets ? reportViewStyles.section.accentBulletList : reportViewStyles.section.bulletList}>
          {section.bullets.map((bullet) => (
            accentBullets ? (
              <li
                key={`${section.title}-${bullet}`}
                className={reportViewStyles.section.accentBullet}
              >
                {bullet}
              </li>
            ) : (
              <li key={`${section.title}-${bullet}`} className={reportViewStyles.section.bullet}>
                {bullet}
              </li>
            )
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function StructuredList({ items }: { items: StructuredBlock[] }) {
  if (!items.length) return null;
  return (
    <div className="space-y-5">
      {items.map((item) => (
        <div key={`${item.eyebrow}-${item.body[0] || "body"}`} className="space-y-2">
          <p className={reportViewStyles.section.number}>{item.eyebrow}</p>
          {item.body.map((line) => (
            <p key={`${item.eyebrow}-${line}`} className={reportViewStyles.section.paragraph}>
              {line}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function BoardroomView({ model, compact = false, onCopyDecision }: BoardroomViewProps) {
  const boardroomSummary = findSectionBodyByAliases(model.strategySections, [
    "BOARDROOM SUMMARY",
    "BOARDROOM SAMENVATTING",
    "BESTUURLIJKE KERNSAMENVATTING",
  ]);
  const killerInsights = parseKillerInsightBullets(
    findSectionBodyByAliases(model.strategySections, [
      "KILLER INSIGHTS",
      "KILLER INSIGHT",
      "NIEUWE INZICHTEN",
      "DOORBRAAKINZICHTEN",
    ])
  );
  const vroegsignalering =
    findSectionBodyByAliases(model.strategySections, ["VROEGSIGNALERING", "EARLY WARNING SYSTEM"]) || model.strategyAlert;
  const interventionSectionBody = findSectionBodyByAliases(model.strategySections, [
    "STRATEGISCHE INTERVENTIES",
    "90 DAGEN ACTIEPLAN",
    "90-DAGEN INTERVENTIEPLAN",
    "BESTUURLIJK ACTIEPLAN",
  ]);
  const interventionBullets =
    parseInterventionBullets(interventionSectionBody).length > 0
      ? parseInterventionBullets(interventionSectionBody)
      : buildBullets(
          model.topInterventions.map((item, index) =>
            [item.title ? `${index + 1}. ${item.title}` : "", item.mechanism, item.kpi ? `KPI: ${item.kpi}` : ""]
              .filter(Boolean)
              .join(" - ")
          ),
          12
        );
  const blindSpots = findSectionBodyByAliases(model.strategySections, [
    "STRATEGISCHE BLINDE VLEKKEN",
    "BESTUURLIJKE BLINDE VLEKKEN",
  ]);
  const decisionConsequences = findSectionBodyByAliases(model.strategySections, [
    "BESLUITGEVOLGEN",
    "BESLUITGEVOLGEN SIMULATIE",
    "DECISION CONSEQUENCES",
  ]);
  const strategicLeverage = findSectionBodyByAliases(model.strategySections, [
    "STRATEGISCHE HEFBOOMPUNTEN",
    "STRATEGIC LEVERAGE",
  ]);
  const strategicMemory = findSectionBodyByAliases(model.strategySections, [
    "STRATEGISCH GEHEUGEN",
    "STRATEGIC MEMORY",
  ]);
  const boardroomDebate = findSectionBodyByAliases(model.strategySections, [
    "BESTUURLIJK DEBAT",
    "BOARDROOM DEBATE",
  ]);
  const strategicOptionBullets = buildBullets(model.boardOptions, 6);
  const structuredInsights: StructuredBlock[] = model.structuredKillerInsights.map((item, index) => ({
    eyebrow: `Inzicht ${index + 1}`,
    body: [
      `KERNINZICHT — ${item.insight}`,
      `ONDERLIGGENDE OORZAAK — ${item.mechanism}`,
      `BESTUURLIJK GEVOLG — ${item.implication}`,
    ],
  }));
  const governanceInterventions: StructuredBlock[] = model.governanceInterventions.slice(0, compact ? 4 : 8).map((item, index) => ({
    eyebrow: `Actie ${index + 1}`,
    body: [
      `ACTIE — ${item.action}`,
      `BESTUURLIJK BESLUIT — ${item.boardDecision}`,
      `VERANTWOORDELIJKE — ${item.owner} • ${item.deadline}`,
      `KPI — ${item.kpi}`,
    ],
  }));
  const compactScenarios: StructuredBlock[] = model.compactScenarios.map((item) => ({
    eyebrow: item.title,
    body: [
      `MECHANISME — ${item.mechanism}`,
      `RISICO — ${item.risk}`,
      `BESTUURLIJKE IMPLICATIE — ${item.boardImplication}`,
    ],
  }));
  const optionRejections: StructuredBlock[] = model.optionRejections.map((item) => ({
    eyebrow: item.optionLabel,
    body: [item.rationale],
  }));
  const boardDecisionPressure = [
    `OPERATIONEEL GEVOLG — ${model.boardDecisionPressure.operational}`,
    `FINANCIEEL GEVOLG — ${model.boardDecisionPressure.financial}`,
    `ORGANISATORISCH GEVOLG — ${model.boardDecisionPressure.organizational}`,
  ].filter((line) => !/—\s*$/.test(line));
  const reportThesis =
    findSectionBodyByAliases(model.strategySections, ["KERNSTELLING VAN HET RAPPORT", "EXECUTIVE THESIS"])
    || model.executiveSummary
    || model.dominantThesis;

  const orderedSections: OrderedSection[] = [
    ...(boardroomSummary
      ? [
          {
            id: 0,
            title: "Bestuurlijke kernsamenvatting",
            body: compactSectionBody("Bestuurlijke kernsamenvatting", boardroomSummary),
          },
        ]
      : []),
    {
      id: 1,
      title: "Besluitvraag",
      body: model.boardQuestion,
    },
    {
      id: 2,
      title: "Kernstelling van het rapport",
      body: compactSectionBody(
        "Kernstelling van het rapport",
        sectionBody(toParagraphs(reportThesis, 3))
      ),
    },
    {
      id: 3,
      title: "Feitenbasis",
      body: compactSectionBody("Feitenbasis", findSectionBody(model.strategySections, "FEITENBASIS")),
    },
    {
      id: 4,
      title: "Strategische spanning",
      body: compactSectionBody("Strategische spanning", model.strategicConflict),
    },
    {
      id: 5,
      title: "Keuzerichtingen",
      body: strategicOptionBullets.length ? "" : "Niet beschikbaar.",
      bullets: strategicOptionBullets,
    },
    {
      id: 6,
      title: "Aanbevolen keuze",
      body: compactSectionBody("Aanbevolen keuze", sectionBody(toParagraphs(model.recommendedDirection, 2))),
    },
    {
      id: 7,
      title: "Doorbraakinzichten",
      body: structuredInsights.length || killerInsights.length ? "" : findSectionBodyByAliases(model.strategySections, ["KILLER INSIGHTS", "KILLER INSIGHT", "NIEUWE INZICHTEN", "DOORBRAAKINZICHTEN"]),
      bullets: structuredInsights.length ? [] : killerInsights,
      hideEmptyState: structuredInsights.length > 0,
    },
    {
      id: 8,
      title: "Bestuurlijk actieplan",
      body:
        governanceInterventions.length || interventionBullets.length
          ? ""
          : findSectionBody(model.strategySections, "STRATEGISCHE INTERVENTIES"),
      bullets: governanceInterventions.length ? [] : interventionBullets,
      hideEmptyState: governanceInterventions.length > 0,
    },
    {
      id: 9,
      title: "Bestuurlijke stresstest",
      body: compactSectionBody("Bestuurlijke stresstest", model.stressTest || model.noIntervention),
    },
    {
      id: 10,
      title: "Bestuurlijke blinde vlekken",
      body: compactSectionBody("Bestuurlijke blinde vlekken", blindSpots),
    },
    {
      id: 11,
      title: "Vroegsignalering",
      body: compactSectionBody("Vroegsignalering", vroegsignalering),
    },
    {
      id: 12,
      title: "Mogelijke ontwikkelingen",
      body: compactScenarios.length ? "" : compactSectionBody("Mogelijke ontwikkelingen", decisionConsequences),
      hideEmptyState: compactScenarios.length > 0,
    },
    {
      id: 13,
      title: "Strategische keuzes met meeste effect",
      body: compactSectionBody("Strategische keuzes met meeste effect", strategicLeverage),
    },
    {
      id: 14,
      title: "Strategisch geheugen",
      body: compactSectionBody("Strategisch geheugen", strategicMemory),
    },
    {
      id: 15,
      title: "Bestuurlijk debat",
      body: compactSectionBody("Bestuurlijk debat", boardroomDebate),
    },
    {
      id: 16,
      title: "Open strategische vragen",
      body: optionRejections.length ? "" : "",
      hideEmptyState: optionRejections.length > 0,
    },
    {
      id: 17,
      title: "Besluitgevolgen",
      body: boardDecisionPressure.join("\n\n"),
    },
  ];
  const visibleSections = (
    compact
      ? orderedSections.filter((section) => [0, 1, 2, 6, 7, 8, 17].includes(section.id))
      : orderedSections
  )
    .filter((section) => section.title !== "BESTUURLIJKE BESLISKAART")
    .map((section, index) => ({
      ...section,
      id: index,
    }));

  return (
    <div className={reportViewStyles.layout.root}>
      <header className={reportViewStyles.layout.header}>
        <p className={reportViewStyles.header.label}>{compact ? "Bestuurlijk overzicht" : "Board memo"}</p>
        <h1 className={reportViewStyles.header.title}>{model.organizationName}</h1>
        <div className={reportViewStyles.header.meta}>
          <p>{model.sector}</p>
          <p>{model.sessionId}</p>
          <p>{new Date(model.createdAt).toLocaleDateString("nl-NL")}</p>
        </div>
      </header>

      <BestuurlijkeBesliskaartCard data={model.bestuurlijkeBesliskaart} />
      <StrategicStoryBridgeCard model={model} compact={compact} />

      <div className={reportViewStyles.layout.sections}>
        {visibleSections.map((section) => (
          <div key={section.id}>
            <SectionBlock section={section} />
            {section.title === "Doorbraakinzichten" && structuredInsights.length ? <StructuredList items={structuredInsights} /> : null}
            {section.title === "Bestuurlijk actieplan" && governanceInterventions.length ? <StructuredList items={governanceInterventions} /> : null}
            {section.title === "Mogelijke ontwikkelingen" && compactScenarios.length ? <StructuredList items={compactScenarios} /> : null}
            {section.title === "Open strategische vragen" && optionRejections.length ? <StructuredList items={optionRejections} /> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
