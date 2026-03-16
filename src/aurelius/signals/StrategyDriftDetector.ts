import type { KPIThreshold } from "@/aurelius/monitoring/KPITracker";

export type StrategyDriftSignal = {
  signal: string;
  risk: string;
  boardAction: string;
  norm: string;
  trigger: string;
  currentValue: string;
  alert: string;
  requiresAction: boolean;
};

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function parseNumber(value: string): number | null {
  const match = normalize(value).match(/-?\d+(?:[.,]\d+)?/);
  if (!match) return null;
  const parsed = Number(match[0].replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function compareAgainstTrigger(currentValue: string, trigger: string): boolean {
  const current = parseNumber(currentValue);
  const threshold = parseNumber(trigger);
  if (current == null || threshold == null) return false;

  if (/<=/.test(trigger)) return current <= threshold;
  if (/>=/.test(trigger)) return current >= threshold;
  if (/</.test(trigger)) return current < threshold;
  if (/>/.test(trigger)) return current > threshold;
  return current >= threshold;
}

function hasTextualBreach(currentValue: string): boolean {
  return /\b(kritisch|overschrijding|boven norm|onder norm|achterstand|stagnatie|rood)\b/i.test(currentValue);
}

function buildRisk(signal: string, norm: string, trigger: string, breached: boolean): string {
  if (breached) {
    return `${signal} wijkt af van norm ${norm}; trigger ${trigger} is geraakt en de strategie dreigt uit koers te raken.`;
  }
  return `${signal} blijft onder observatie; nog geen harde strategie-afwijking ten opzichte van norm ${norm}.`;
}

function buildAlert(risk: string, action: string, breached: boolean): string {
  return [
    "STRATEGIE ALERT",
    "",
    "Risico",
    risk,
    "",
    "Actie",
    breached ? `actie vereist: ${action}` : `monitoren: ${action}`,
  ].join("\n");
}

export function detectStrategyDrift(thresholds: KPIThreshold[]): StrategyDriftSignal[] {
  return thresholds.map((item) => {
    const signal = normalize(item.indicator) || "Onbekende indicator";
    const norm = normalize(item.norm) || "Norm ontbreekt";
    const trigger = normalize(item.trigger) || "Trigger ontbreekt";
    const currentValue = normalize(item.currentValue) || "Waarde ontbreekt";
    const action = normalize(item.action) || "bestuurlijke herbesluitvorming";
    const breached = compareAgainstTrigger(currentValue, trigger) || hasTextualBreach(currentValue);
    const risk = buildRisk(signal, norm, trigger, breached);

    return {
      signal,
      risk,
      boardAction: breached ? action : `Blijf ${signal.toLowerCase()} volgen via reguliere bestuursreview.`,
      norm,
      trigger,
      currentValue,
      alert: buildAlert(risk, action, breached),
      requiresAction: breached,
    };
  });
}
