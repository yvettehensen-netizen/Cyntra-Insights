import type { StrategicDecisionOption } from "./DecisionOptionGenerator";

export type DecisionTradeoff = {
  option: StrategicDecisionOption;
  advantages: string;
  disadvantages: string;
  risks: string;
  impactOrganisation: string;
  impactCustomers: string;
  impactFinancials: string;
  explicitGiveUp: string;
  initiativesStopped: string;
  growthDeferred: string;
};

export function analyzeDecisionTradeoffs(
  options: StrategicDecisionOption[]
): DecisionTradeoff[] {
  return options.map((option) => {
    if (option.code === "A") {
      return {
        option,
        advantages: "Verhoogt financiële stabiliteit en uitvoerbaarheid van kernprocessen.",
        disadvantages: "Beperkt commerciële expansie op korte termijn.",
        risks: "Verlies van momentum buiten de kern en interne frustratie over groeirem.",
        impactOrganisation: "Meer focus, duidelijkere prioriteiten, lagere coördinatiedruk.",
        impactCustomers: "Betere continuïteit in kernzorg, maar trager nieuw aanbod.",
        impactFinancials: "Sneller margeherstel en lagere volatiliteit in cashflow.",
        explicitGiveUp: "Tijdelijke opgave van parallelle verbredingsambities.",
        initiativesStopped: "Nieuwe niet-kerninitiatieven zonder margevalidatie worden gestopt.",
        growthDeferred: "Verbredingsgroei wordt uitgesteld tot na stabilisatiefase.",
      };
    }
    if (option.code === "B") {
      return {
        option,
        advantages: "Vergroot omzetpotentieel en strategische spreiding.",
        disadvantages: "Verhoogt complexiteit en vraagt extra managementcapaciteit.",
        risks: "Snellere margeslijtage en liquiditeitsstress bij onvoldoende basisdiscipline.",
        impactOrganisation: "Meer veranderdruk en kans op versnipperde aandacht.",
        impactCustomers: "Meer aanbodopties, maar risico op minder stabiele kerncontinuïteit.",
        impactFinancials: "Hoger opwaarts potentieel met groter neerwaarts risico.",
        explicitGiveUp: "Opgeven van tijdelijke rust en focus op kernstabiliteit.",
        initiativesStopped: "Minder stopzetting; juist doorzetten van verbredingsprojecten.",
        growthDeferred: "Kernoptimalisatie wordt uitgesteld door prioriteit op uitbreiding.",
      };
    }
    return {
      option,
      advantages: "Creëert snelle kostencontrole en dwingt scherpere allocatie af.",
      disadvantages: "Kan draagvlak en cultuur onder druk zetten.",
      risks: "Kwaliteitsverlies of uitval bij te agressieve ingrepen.",
      impactOrganisation: "Hoge veranderintensiteit met duidelijke besluitdiscipline.",
      impactCustomers: "Mogelijke tijdelijke frictie in dienstverlening tijdens transitie.",
      impactFinancials: "Directe kostenverlaging met transitiekosten op korte termijn.",
      explicitGiveUp: "Opgeven van comfort in bestaande werkwijzen en routines.",
      initiativesStopped: "Niet-kritieke projecten en dubbele structuren worden afgebouwd.",
      growthDeferred: "Groei die extra overhead vraagt wordt uitgesteld.",
    };
  });
}
