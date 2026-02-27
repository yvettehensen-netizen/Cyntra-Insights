import type { Sector } from "@/aurelius/sector/types";
import { computeSectorScores } from "@/aurelius/sector/sectorScores";
import { readSectorCache, writeSectorCache } from "@/aurelius/sector/sectorCache";

const CURATED_SIGNALS: Record<Sector, string[]> = {
  gezondheidszorg: [
    "Toezichtdruk op toegankelijkheid en kwaliteit vraagt versnelde governance-cadence.",
    "Arbeidsmarktkrapte verhoogt roosterfrictie en operationele uitvaldruk.",
    "Contractering met verzekeraars verschuift contractmacht naar meetbare uitkomsten.",
  ],
  advies_consultancy: [
    "Inkoopdiscipline verschuift prijsmacht naar aantoonbare impact op klantresultaat.",
    "Schaarste op senior profielen verhoogt leverings- en retentierisico.",
    "Automatisering drukt marge op standaardwerk en vergroot specialisatiedruk.",
  ],
  bouw: [
    "Regelgeving en vergunningtempo bepalen uitvoerbaarheid van projectportfolio.",
    "Materiaalprijsvolatiliteit verhoogt contractrisico in vaste prijsafspraken.",
    "Arbeidsmarktkrapte vergroot afhankelijkheid van onderaannemers.",
  ],
  cultuur: [
    "Subsidiecycli vergroten onzekerheid in meerjarige capaciteitsplanning.",
    "Platformmacht beïnvloedt contractpositie en distributie-inkomsten.",
    "Personele schaarste verhoogt kans op productie- en planningsfrictie.",
  ],
  energie: [
    "Regulatoire druk en netcapaciteit beïnvloeden investeringsvolgorde.",
    "Prijsvolatiliteit vergroot contract- en portefeuillerisico.",
    "Arbeidsmarktkrapte vertraagt uitvoering van transitieprogramma's.",
  ],
  financiele_dienstverlening: [
    "Toezichtdruk verhoogt compliance- en rapportagebelasting.",
    "Rente- en liquiditeitsdynamiek verscherpen contractvoorwaarden.",
    "Schaarste op risk/compliance-profielen remt verandercapaciteit.",
  ],
  detailhandel: [
    "Koopkrachtvolatiliteit verhoogt druk op marge en assortimentskeuzes.",
    "Kanaalverschuiving wijzigt contractmacht in de keten.",
    "Arbeidsmarktdruk in logistiek verhoogt verstoringskans in operatie.",
  ],
  industrie: [
    "Ketenvolatiliteit beïnvloedt leveringszekerheid en contractkosten.",
    "Grondstofschommelingen verschuiven onderhandelingsruimte in contracten.",
    "Technische arbeidsmarktkrapte beperkt schaalbaarheid van productie.",
  ],
  onderwijs: [
    "Bekostigingskaders en toezicht bepalen bestuurlijk handelingsritme.",
    "Docentenschaarste verhoogt roosterdruk en continuiteitsrisico.",
    "Digitale leveranciers verschuiven contractmacht in leermiddelenketen.",
  ],
};

export type SectorSignalsPayload = {
  sector: Sector;
  source: "cache" | "curated";
  fetchedAt: string;
  signals: string[];
  sectorRiskIndex: number;
  regulatorPressureIndex: number;
  contractPowerScore: number;
  arbeidsmarktdrukIndex: number;
  rubric: Record<string, string>;
};

export async function getSectorSignals(sector: Sector): Promise<SectorSignalsPayload> {
  const cached = readSectorCache<SectorSignalsPayload>(sector);
  if (cached) {
    return {
      ...cached,
      source: "cache",
    };
  }

  const signals = CURATED_SIGNALS[sector] ?? [];
  const scores = computeSectorScores({ signals });

  const payload: SectorSignalsPayload = {
    sector,
    source: "curated",
    fetchedAt: new Date().toISOString(),
    signals,
    ...scores,
  };

  writeSectorCache(sector, payload);
  return payload;
}
