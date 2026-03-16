import { isSessionCompleted } from "./types";
import type {
  AnalysisSession,
  AnonymizedStrategicRecord,
  StrategicCaseRecord,
} from "./types";
import { createId, normalize, readArray, writeArray } from "./storage";
import { InterventionStore, StrategicCaseIntelligenceStore } from "@/aurelius/data";
import { StrategicRelationshipEngine } from "@/aurelius/knowledge";
import { StrategicSignalEngine } from "@/aurelius/network";
import { CompanyDatasetBuilder } from "./CompanyDatasetBuilder";

const KEY = "cyntra_platform_dataset_v1";
const CASE_KEY = "cyntra_platform_strategic_cases_v1";

function inferProblemType(session: AnalysisSession): string {
  const source = `${session.board_report} ${session.strategic_metadata?.probleemtype ?? ""}`.toLowerCase();
  if (/(marge|liquiditeit|cash|kostprijs|tarief)/.test(source)) return "financiele druk";
  if (/(capaciteit|wachtlijst|productiviteit|fte|planning)/.test(source)) return "capaciteitsprobleem";
  if (/(contract|plafond|verzekeraar)/.test(source)) return "contractbeperking";
  if (/(parallel|versnipper|prioritering|focus)/.test(source)) return "strategische versnippering";
  return "overig";
}

function readRows(): AnonymizedStrategicRecord[] {
  return readArray<AnonymizedStrategicRecord>(KEY);
}

function writeRows(rows: AnonymizedStrategicRecord[]): void {
  writeArray(KEY, rows);
}

function readCases(): StrategicCaseRecord[] {
  return readArray<StrategicCaseRecord>(CASE_KEY);
}

function writeCases(rows: StrategicCaseRecord[]): void {
  writeArray(CASE_KEY, rows);
}

export class StrategicDatasetCollector {
  readonly name = "Strategic Dataset Collector";
  private readonly interventionStore = new InterventionStore();
  private readonly intelligenceCaseStore = new StrategicCaseIntelligenceStore();
  private readonly relationshipEngine = new StrategicRelationshipEngine();
  private readonly signalEngine = new StrategicSignalEngine();
  private readonly companyDatasetBuilder = new CompanyDatasetBuilder();

  listRecords(): AnonymizedStrategicRecord[] {
    return readRows().sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  }

  listStrategicCases(): StrategicCaseRecord[] {
    return readCases().sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  }

  collectFromSession(session: AnalysisSession): AnonymizedStrategicRecord | null {
    if (!isSessionCompleted(session.status)) return null;
    const normalizedCase = this.companyDatasetBuilder.fromSession(session);
    if (!normalizedCase) return null;

    const metadata = session.strategic_metadata;
    const record: AnonymizedStrategicRecord = {
      record_id: createId("ds"),
      session_id: session.session_id,
      sector: normalize(metadata?.sector) || "Onbekende sector",
      probleemtype: normalize(metadata?.probleemtype) || inferProblemType(session),
      mechanismen: (metadata?.mechanismen ?? []).map((item) => normalize(item)).filter(Boolean).slice(0, 8),
      interventies: (metadata?.interventies ?? []).map((item) => normalize(item)).filter(Boolean).slice(0, 8),
      strategische_opties: (metadata?.strategische_opties ?? []).map((item) => normalize(item)).filter(Boolean).slice(0, 6),
      gekozen_strategie: normalize(metadata?.gekozen_strategie) || "Niet expliciet geregistreerd",
      created_at: new Date().toISOString(),
    };

    const rows = this.listRecords();
    rows.push(record);
    writeRows(rows);

    this.upsertStrategicCase({
      case_id: `case-${session.session_id}`,
      organisation_name: normalize(session.organization_name) || session.organization_id,
      sector: normalize(metadata?.sector) || "Onbekende sector",
      probleemtype: normalize(metadata?.probleemtype) || inferProblemType(session),
      dominante_these: normalize(session.executive_summary) || "Dominante these niet expliciet beschikbaar.",
      mechanismen: (metadata?.mechanismen ?? []).map((item) => normalize(item)).filter(Boolean).slice(0, 8),
      strategische_opties: (metadata?.strategische_opties ?? []).map((item) => normalize(item)).filter(Boolean).slice(0, 6),
      gekozen_strategie: normalize(metadata?.gekozen_strategie) || "Niet expliciet geregistreerd",
      interventieplan: normalize(session.board_report).slice(0, 3000),
      created_at: new Date().toISOString(),
    });

    const interventions = (metadata?.interventies ?? [])
      .map((item) => normalize(item))
      .filter(Boolean)
      .slice(0, 8);

    interventions.forEach((interventie, index) => {
      this.interventionStore.upsert({
        intervention_id: `int-${session.session_id}-${index + 1}`,
        sector: normalize(metadata?.sector) || "Onbekende sector",
        probleemtype: normalize(metadata?.probleemtype) || inferProblemType(session),
        interventie,
        impact: "Positieve impact verwacht op strategische stabiliteit.",
        risico: "Implementatierisico bij beperkte capaciteit of governance-ruis.",
        succes_score: isSessionCompleted(session.status) ? 0.7 : 0.5,
        created_at: new Date().toISOString(),
      });
    });

    this.intelligenceCaseStore.upsert({
      case_id: normalizedCase.id,
      organisation_name: normalizedCase.organisatie,
      sector: normalizedCase.sector,
      probleemtype: normalizedCase.probleem,
      dominante_these:
        normalize(session.executive_summary) || "Dominante these niet expliciet beschikbaar.",
      gekozen_strategie: normalizedCase.strategie,
      interventie: normalizedCase.interventie,
      resultaat:
        normalizedCase.resultaat ||
        (isSessionCompleted(session.status)
          ? "Analyse voltooid met rapportoutput."
          : "Resultaat nog niet beschikbaar."),
      created_at: new Date().toISOString(),
    });

    const cases = this.intelligenceCaseStore.list();
    const interventionRows = this.interventionStore.list();
    const records = this.listRecords();
    const signals = this.signalEngine
      .detect(
        records.map((item) => ({
          dataset_id: item.record_id,
          sector: item.sector,
          probleemtype: item.probleemtype,
          mechanismen: item.mechanismen,
          interventies: item.interventies,
          outcomes: [],
          created_at: item.created_at,
        }))
      )
      .map((item) => ({
        sector: "Multi-sector",
        signaal: item.type,
        impact: item.implicatie,
        urgentie: item.severity,
      }));
    this.relationshipEngine.connect({
      records,
      cases,
      interventions: interventionRows,
      signals,
    });

    return record;
  }

  upsertStrategicCase(record: StrategicCaseRecord): StrategicCaseRecord {
    const isValid = Boolean(
      normalize(record.case_id) &&
      normalize(record.organisation_name) &&
      normalize(record.sector) &&
      normalize(record.probleemtype) &&
      normalize(record.gekozen_strategie)
    );
    if (!isValid) return record;
    const rows = this.listStrategicCases();
    const idx = rows.findIndex((row) => row.case_id === record.case_id);
    if (idx >= 0) rows[idx] = record;
    else rows.push(record);
    writeCases(rows);
    return record;
  }

  sectorBenchmark(sector: string): {
    sector: string;
    totaal_cases: number;
    dominante_problemen: Array<{ probleemtype: string; count: number }>;
    dominante_interventies: Array<{ interventie: string; count: number }>;
    strategische_posities: Array<{ strategie: string; count: number }>;
  } {
    const normalizedSector = normalize(sector).toLowerCase();
    const rows = this.listRecords().filter((row) => {
      if (!normalizedSector) return true;
      return row.sector.toLowerCase() === normalizedSector;
    });

    const countMap = (values: string[]) => {
      const map = new Map<string, number>();
      for (const value of values.filter(Boolean)) {
        map.set(value, (map.get(value) ?? 0) + 1);
      }
      return Array.from(map.entries())
        .map(([key, count]) => ({ key, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    };

    const problemen = countMap(rows.map((row) => row.probleemtype));
    const interventies = countMap(rows.flatMap((row) => row.interventies));
    const posities = countMap(rows.map((row) => row.gekozen_strategie));

    return {
      sector: sector || "Alle sectoren",
      totaal_cases: rows.length,
      dominante_problemen: problemen.map((item) => ({ probleemtype: item.key, count: item.count })),
      dominante_interventies: interventies.map((item) => ({ interventie: item.key, count: item.count })),
      strategische_posities: posities.map((item) => ({ strategie: item.key, count: item.count })),
    };
  }
}
