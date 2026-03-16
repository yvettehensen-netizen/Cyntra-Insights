import type { ReportSection, ReportViewModel } from "./types";
import {
  frameBoardroomShock,
  normalizeBoardroomBullet,
} from "@/aurelius/executive/BoardroomLanguageNormalizer";
import { reportViewStyles } from "./reportViewStyles";
import BestuurlijkeBesliskaartCard from "./BestuurlijkeBesliskaartCard";
import StrategicStoryBridgeCard from "./StrategicStoryBridgeCard";
import { presentReportSectionTitle } from "./reportTitlePresentation";

type StrategyReportViewProps = {
  model: ReportViewModel;
};

type OrderedSection = {
  id: number;
  title: string;
  body: string;
  bullets?: string[];
  hideEmptyState?: boolean;
};

type StructuredBlock = {
  eyebrow: string;
  body: string[];
};

const EMPHASIZED_SECTION_TITLES = new Set(["Bestuurlijke kernsamenvatting", "Aanbevolen keuze"]);
const ACCENT_BULLET_SECTION_TITLES = new Set(["Doorbraakinzichten"]);

const SUPPLEMENTAL_SECTION_TITLES = new Set([
  "STRATEGY DNA",
  "CAUSALE STRATEGIEANALYSE",
  "DOMINANTE HEFBOOMCOMBINATIE",
  "STRATEGISCHE SCENARIO SIMULATIE",
  "STRATEGISCHE STRESSTEST",
]);

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function findSectionBody(sections: ReportSection[], title: string): string {
  return sections.find((section) => section.title.toUpperCase() === title.toUpperCase())?.body?.trim() || "";
}

function findSectionBodyByAliases(sections: ReportSection[], titles: string[]): string {
  const aliases = titles.map((title) => title.toUpperCase());
  return sections.find((section) => aliases.includes(section.title.toUpperCase()))?.body?.trim() || "";
}

function buildBullets(lines: string[], max = 5): string[] {
  return lines.map((line) => normalizeBoardroomBullet(line, 240)).filter(Boolean).slice(0, max);
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
      new Set(insightBlocks.map((item) => frameBoardroomShock(normalizeBoardroomBullet(item, 240), 190)))
    ).slice(0, 7);
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
    .map((item) => normalizeBoardroomBullet(item, 260));
  if (labeledBlocks.length) return labeledBlocks.slice(0, 12);
  const numbered = text
    .split(/\n(?=\d+\.\s+(?:Actie:|Voor ))/g)
    .filter((part) => /^\d+\.\s+/.test(normalize(part)))
    .map((part) => normalizeBoardroomBullet(part.replace(/\n+/g, " - "), 260));
  if (numbered.length) return numbered.slice(0, 12);
  return buildBullets(text.split(/\n+/), 12);
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
      <div>
        <p className={reportViewStyles.section.number}>{String(section.id).padStart(2, "0")}</p>
        <h2 className={reportViewStyles.section.title}>{presentReportSectionTitle(section.title)}</h2>
        <div className={reportViewStyles.section.rule} />
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
        : null}

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

      {!paragraphs.length && !section.bullets?.length && !section.hideEmptyState ? (
        <p className={reportViewStyles.section.muted}>Niet beschikbaar.</p>
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

export default function StrategyReportView({ model }: StrategyReportViewProps) {
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
  const blindSpotsBody = findSectionBodyByAliases(model.strategySections, [
    "STRATEGISCHE BLINDE VLEKKEN",
    "BESTUURLIJKE BLINDE VLEKKEN",
  ]);
  const decisionConsequencesBody = findSectionBodyByAliases(model.strategySections, [
    "BESLUITGEVOLGEN",
    "BESLUITGEVOLGEN SIMULATIE",
    "DECISION CONSEQUENCES",
  ]);
  const strategicLeverageBody = findSectionBodyByAliases(model.strategySections, [
    "STRATEGISCHE HEFBOOMPUNTEN",
    "STRATEGIC LEVERAGE",
  ]);
  const strategicMemoryBody = findSectionBodyByAliases(model.strategySections, [
    "STRATEGISCH GEHEUGEN",
    "STRATEGIC MEMORY",
  ]);
  const boardroomDebateBody = findSectionBodyByAliases(model.strategySections, [
    "BESTUURLIJK DEBAT",
    "BOARDROOM DEBATE",
  ]);
  const structuredInsights: StructuredBlock[] = model.structuredKillerInsights.map((item, index) => ({
    eyebrow: `Inzicht ${index + 1}`,
    body: [
      `KERNINZICHT — ${item.insight}`,
      `ONDERLIGGENDE OORZAAK — ${item.mechanism}`,
      `BESTUURLIJK GEVOLG — ${item.implication}`,
    ],
  }));
  const governanceInterventions: StructuredBlock[] = model.governanceInterventions.map((item, index) => ({
    eyebrow: `Actie ${index + 1}`,
    body: [
      `ACTIE — ${item.action}`,
      `MECHANISME — ${item.mechanism}`,
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
  const decisionPressureBody = boardDecisionPressure.join("\n\n");
  const openQuestionsBody = optionRejections
    .map((item) => (item.optionLabel && item.rationale ? `${item.optionLabel}: ${item.rationale}` : item.optionLabel || item.rationale))
    .filter(Boolean)
    .join("\n\n");
  const reportThesis =
    findSectionBodyByAliases(model.strategySections, ["KERNSTELLING VAN HET RAPPORT", "EXECUTIVE THESIS"])
    || model.executiveSummary
    || model.dominantThesis;
  const coreSections: OrderedSection[] = [];
  const addSection = (section: Omit<OrderedSection, "id">) => {
    coreSections.push({ id: coreSections.length, ...section });
  };

  if (boardroomSummary) {
    addSection({ title: "Bestuurlijke kernsamenvatting", body: boardroomSummary });
  }
  addSection({ title: "Besluitvraag", body: model.boardQuestion });
  addSection({ title: "Kernstelling van het rapport", body: reportThesis });
  addSection({ title: "Feitenbasis", body: findSectionBody(model.strategySections, "FEITENBASIS") });
  addSection({ title: "Keuzerichtingen", body: "", bullets: buildBullets(model.boardOptions, 6) });
  addSection({ title: "Aanbevolen keuze", body: model.recommendedDirection });

  if (structuredInsights.length || killerInsights.length) {
    addSection({
      title: "Doorbraakinzichten",
      body: structuredInsights.length ? "" : killerInsights.join("\n"),
      bullets: structuredInsights.length ? [] : killerInsights,
      hideEmptyState: structuredInsights.length > 0,
    });
  }

  if (governanceInterventions.length || interventionBullets.length) {
    addSection({
      title: "Bestuurlijk actieplan",
      body: governanceInterventions.length ? "" : interventionBullets.join("\n"),
      bullets: governanceInterventions.length ? [] : interventionBullets,
      hideEmptyState: governanceInterventions.length > 0,
    });
  }

  addSection({ title: "Bestuurlijke stresstest", body: model.stressTest || model.noIntervention });

  if (blindSpotsBody) {
    addSection({ title: "Bestuurlijke blinde vlekken", body: blindSpotsBody });
  }

  addSection({
    title: "Vroegsignalering",
    body: findSectionBodyByAliases(model.strategySections, ["VROEGSIGNALERING", "EARLY WARNING SYSTEM"]) || model.strategyAlert,
  });

  if (compactScenarios.length || decisionConsequencesBody) {
    addSection({
      title: "Mogelijke ontwikkelingen",
      body: compactScenarios.length ? "" : decisionConsequencesBody,
      hideEmptyState: compactScenarios.length > 0,
    });
  }

  if (decisionPressureBody) {
    addSection({ title: "Besluitgevolgen", body: decisionPressureBody });
  }

  if (optionRejections.length) {
    addSection({ title: "Open strategische vragen", body: openQuestionsBody, hideEmptyState: optionRejections.length > 0 });
  }

  const supplementalSections: OrderedSection[] = model.strategySections
    .filter((section) => SUPPLEMENTAL_SECTION_TITLES.has(section.title.toUpperCase()))
    .map((section, index) => ({
      id: coreSections.length + index,
      title: section.title,
      body: section.body,
    }));
  const focusedSupplementalView =
    model.strategySections.length > 0 &&
    model.strategySections.every((section) => SUPPLEMENTAL_SECTION_TITLES.has(section.title.toUpperCase()));
  const baseSections = focusedSupplementalView && supplementalSections.length ? supplementalSections : [...coreSections, ...supplementalSections];
  const visibleSections = baseSections
    .filter((section) => section.title !== "BESTUURLIJKE BESLISKAART")
    .map((section, index) => ({
      ...section,
      id: index,
    }));

  return (
    <div className={reportViewStyles.layout.root}>
      <header className={reportViewStyles.layout.header}>
        <p className={reportViewStyles.header.label}>Strategisch rapport</p>
        <h1 className={reportViewStyles.header.title}>{model.organizationName}</h1>
        <p className={reportViewStyles.header.subtitle}>{model.deckSubtitle}</p>
      </header>

      <BestuurlijkeBesliskaartCard data={model.bestuurlijkeBesliskaart} />
      <StrategicStoryBridgeCard model={model} />

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
