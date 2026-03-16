import type { StrategicDatasetRecord } from "@/aurelius/data";
import {
  clampConfidence,
  uniqueLines,
  type StrategicEngineResult,
} from "@/aurelius/engine/contracts/StrategicEngineResult";

export type StrategicSignal = {
  type: "marktverandering" | "tariefdruk" | "capaciteitsdruk" | "regelgeving";
  severity: "laag" | "middel" | "hoog";
  bewijs: string;
  implicatie: string;
};

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim().toLowerCase();
}

export class StrategicSignalEngine {
  readonly name = "Strategic Signal Engine";

  detect(records: StrategicDatasetRecord[]): StrategicSignal[] {
    const source = records
      .map((row) => `${row.probleemtype} ${(row.mechanismen || []).join(" ")} ${(row.interventies || []).join(" ")}`)
      .join(" ")
      .toLowerCase();

    const signals: StrategicSignal[] = [];

    if (/(markt|concurrent|vraag)/.test(source)) {
      signals.push({
        type: "marktverandering",
        severity: "middel",
        bewijs: "Toenemende signalen van marktdruk en veranderende vraagpatronen.",
        implicatie: "Herijk positionering en prioriteer adaptieve portfolio-keuzes.",
      });
    }

    if (/(tarief|marge|kostprijs|verzekeraar|contract)/.test(source)) {
      signals.push({
        type: "tariefdruk",
        severity: "hoog",
        bewijs: "Herhaalde patronen in tarief- en margedruk over cases.",
        implicatie: "Versnel contractdiscipline, prijsvalidatie en margeherstel.",
      });
    }

    if (/(capaciteit|wachtlijst|planning|productiviteit)/.test(source)) {
      signals.push({
        type: "capaciteitsdruk",
        severity: "hoog",
        bewijs: "Veel cases tonen capaciteitsfrictie in planning en uitvoering.",
        implicatie: "Voer capaciteitsherstructurering en strakker ritme in.",
      });
    }

    if (/(regelgeving|compliance|wet)/.test(source)) {
      signals.push({
        type: "regelgeving",
        severity: "middel",
        bewijs: "Indicaties van veranderende regels en compliance-eisen.",
        implicatie: "Veranker governance checks en versnel besluitvertaling.",
      });
    }

    if (!signals.length) {
      signals.push({
        type: "marktverandering",
        severity: "laag",
        bewijs: "Nog beperkt signaalvolume in dataset.",
        implicatie: "Blijf signalen monitoren en vergroot datadekking.",
      });
    }

    return signals.slice(0, 6);
  }

  analyzeStandard(records: StrategicDatasetRecord[]): StrategicEngineResult {
    const signals = this.detect(records);
    return {
      insights: uniqueLines(signals.map((item) => item.type)),
      risks: uniqueLines(signals.map((item) => `${item.type}: ${item.bewijs}`)),
      opportunities: uniqueLines(
        signals.map((item) => `${item.type}: ${item.implicatie}`)
      ),
      recommendations: uniqueLines(
        signals.map((item) => `Neem actie op signaal '${item.type}' met urgentie ${item.severity}.`)
      ),
      confidence: clampConfidence(signals.length >= 3 ? 0.73 : 0.52),
    };
  }
}
