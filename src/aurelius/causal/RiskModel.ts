import type { StrategicLeverInsight } from "@/aurelius/strategy/StrategicLeverDetector";

export function deriveStrategicRisk(input: StrategicLeverInsight): string {
  if (input.lever === "netwerkstrategieën") return "Verlies van kwaliteitscontrole over partneruitvoering.";
  if (input.lever === "capaciteitsbenutting") return "Diagnose- of kwaliteitsdruk door te agressieve throughput-sturing.";
  if (input.lever === "governance") return "Formele besluitmacht blijft te diffuus om koersafwijkingen te corrigeren.";
  if (input.lever === "data-infrastructuur") return "Schijnzekerheid door onvolledige of te late stuurinformatie.";
  if (input.lever === "prijsstrategie") return "Prijsdiscipline faalt wanneer commerciële keuzes niet bestuurlijk worden afgedwongen.";
  return input.risk;
}
