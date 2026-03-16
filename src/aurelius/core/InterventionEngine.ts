import type { StrategicInterventionMapItem } from "@/aurelius/analysis/StrategicAnalysisMap";

function normalize(value: string): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function findLine(source: string, label: string): string {
  return (
    source.match(new RegExp(`\\b${label}\\b\\s*[:—-]\\s*(.+)$`, "im"))?.[1]?.trim() || ""
  );
}

export class InterventionEngine {
  generateInterventions(interventionText: string): StrategicInterventionMapItem[] {
    const blocks = String(interventionText ?? "")
      .split(/\n\s*\n+/)
      .map((block) => block.trim())
      .filter((block) => /\b(ACTIE|Actie|Maand)\b/.test(block));

    const interventions = blocks.map((block, index) => ({
      action: findLine(block, "ACTIE") || findLine(block, "Actie") || `Interventie ${index + 1}`,
      reason:
        findLine(block, "WAAROM DEZE INTERVENTIE") ||
        "Interventie gekoppeld aan gekozen richting en uitvoeringsdruk.",
      risk:
        findLine(block, "RISICO VAN NIET HANDELEN") ||
        "Uitstel houdt druk op uitvoering en bestuurlijke beheersbaarheid in stand.",
      stopRule:
        findLine(block, "STOPREGEL") ||
        "Herzie direct als wachttijd > 12 weken, marge < 4% of caseload > 18 gedurende twee meetperiodes.",
      owner: findLine(block, "Eigenaar") || findLine(block, "VERANTWOORDELIJKE") || undefined,
      deadline: findLine(block, "Deadline") || undefined,
      KPI: findLine(block, "KPI") || undefined,
    }));

    const filtered = interventions.filter((item) => normalize(item.action));
    const padded = [...filtered];
    while (padded.length < 10) {
      const index = padded.length + 1;
      padded.push({
        action: `Interventie ${index}`,
        reason: "Interventie gekoppeld aan gekozen richting en uitvoeringsdruk.",
        risk: "Uitstel houdt druk op uitvoering en bestuurlijke beheersbaarheid in stand.",
        stopRule: "Herzie direct als wachttijd > 12 weken, marge < 4% of caseload > 18 gedurende twee meetperiodes.",
        owner: "Bestuur",
        deadline: `${Math.min(180, 15 * index)} dagen`,
        KPI: "Meetbare verbetering op wachtdruk, marge of teamstabiliteit",
      });
    }
    return padded.slice(0, 10);
  }

  assignOwner(intervention: StrategicInterventionMapItem): StrategicInterventionMapItem {
    return {
      ...intervention,
      owner: intervention.owner || "Bestuur",
    };
  }

  generateStopRules(intervention: StrategicInterventionMapItem): StrategicInterventionMapItem {
    return {
      ...intervention,
      stopRule:
        intervention.stopRule ||
        "Herzie direct als wachttijd > 12 weken, marge < 4% of caseload > 18 gedurende twee meetperiodes.",
    };
  }

  generateKPIs(intervention: StrategicInterventionMapItem): StrategicInterventionMapItem {
    return {
      ...intervention,
      KPI: intervention.KPI || "Meetbare verbetering op wachtdruk, marge of teamstabiliteit",
    };
  }
}
