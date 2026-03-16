import type { StrategicLeverInsight } from "@/aurelius/strategy/StrategicLeverDetector";

export function predictOperationalEffect(input: StrategicLeverInsight): string {
  switch (input.mechanismCluster) {
    case "omzetgroei":
      return "Vraaggroei wordt selectiever toegelaten en beter verdeeld over het operating model.";
    case "efficiency":
      return "Meer output wordt gerealiseerd zonder proportionele uitbreiding van teams of overhead.";
    case "rendement":
      return "De organisatie verschuift capaciteit naar proposities en contracten met hogere economische kwaliteit.";
    case "marktmacht":
      return "Toegang, adoptie en partnerbereik groeien sneller dan lineaire commerciële inspanning.";
    case "executiekracht":
      return "Besluiten worden consistenter uitgevoerd en minder afgezwakt in de operatie.";
    case "strategische snelheid":
      return "Afwijkingen worden sneller gedetecteerd en leiden sneller tot bestuurlijke correctie.";
  }
}

export function predictFinancialEffect(input: StrategicLeverInsight): string {
  switch (input.mechanismCluster) {
    case "omzetgroei":
      return "Omzet groeit sneller wanneer schaal niet volledig afhankelijk is van extra interne capaciteit.";
    case "efficiency":
      return "Marginale kosten per eenheid output dalen zodra throughput sneller stijgt dan overhead.";
    case "rendement":
      return "Marge en kapitaalrendement verbeteren doordat middelen selectiever worden ingezet.";
    case "marktmacht":
      return "Prijsdruk neemt af en contractkwaliteit stijgt door sterkere marktpositie.";
    case "executiekracht":
      return "Strategische keuzes renderen beter doordat uitval, vertraging en herwerk afnemen.";
    case "strategische snelheid":
      return "Financiële schade van late correcties daalt omdat interventies eerder worden ingezet.";
  }
}
