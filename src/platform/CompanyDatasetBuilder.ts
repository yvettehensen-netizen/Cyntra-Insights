import { isSessionCompleted } from "./types";
import type { AnalysisSession } from "./types";
import { normalize } from "./storage";

export interface StrategicCase {
  id: string;
  organisatie: string;
  sector: string;
  probleem: string;
  strategie: string;
  interventie: string;
  resultaat?: string;
  confidence: number;
}

function clampConfidence(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return Number(value.toFixed(3));
}

export function isValidStrategicCase(caseRecord: StrategicCase): boolean {
  return Boolean(
    normalize(caseRecord.id) &&
      normalize(caseRecord.organisatie) &&
      normalize(caseRecord.sector) &&
      normalize(caseRecord.probleem) &&
      normalize(caseRecord.strategie) &&
      normalize(caseRecord.interventie) &&
      Number.isFinite(caseRecord.confidence) &&
      caseRecord.confidence >= 0 &&
      caseRecord.confidence <= 1
  );
}

export class CompanyDatasetBuilder {
  readonly name = "Company Dataset Builder";

  fromSession(session: AnalysisSession): StrategicCase | null {
    const metadata = session.strategic_metadata;
    const intervention = (metadata?.interventies ?? []).find((item) => normalize(item));

    const caseRecord: StrategicCase = {
      id: `case-${normalize(session.session_id)}`,
      organisatie: normalize(session.organization_name) || normalize(session.organization_id),
      sector: normalize(metadata?.sector),
      probleem: normalize(metadata?.probleemtype),
      strategie: normalize(metadata?.gekozen_strategie),
      interventie: normalize(intervention),
      resultaat: isSessionCompleted(session.status)
        ? normalize(session.executive_summary) || "Analyse voltooid."
        : undefined,
      confidence: clampConfidence(isSessionCompleted(session.status) ? 0.7 : 0.45),
    };

    return isValidStrategicCase(caseRecord) ? caseRecord : null;
  }
}
