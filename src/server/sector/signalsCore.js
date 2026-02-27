import fs from "node:fs";
import path from "node:path";

export const SECTOR_SOURCE_CONFIG = {
  gezondheidszorg: [
    "https://www.igj.nl/actueel/rss",
    "https://www.rijksoverheid.nl/onderwerpen/geestelijke-gezondheidszorg",
    "https://www.cbs.nl/nl-nl/nieuws",
  ],
  advies_consultancy: ["https://www.ser.nl/nl/thema/arbeidsmarkt", "https://www.cbs.nl/nl-nl/nieuws"],
  bouw: ["https://www.rijksoverheid.nl/onderwerpen/bouwregelgeving", "https://www.cbs.nl/nl-nl/nieuws"],
  cultuur: ["https://www.rijksoverheid.nl/onderwerpen/kunst-en-cultuur", "https://www.cbs.nl/nl-nl/nieuws"],
  energie: ["https://www.acm.nl/nl/publicaties", "https://www.rijksoverheid.nl/onderwerpen/energiebeleid"],
  financiele_dienstverlening: ["https://www.dnb.nl/nieuws/", "https://www.afm.nl/nl-nl/nieuws"],
  detailhandel: ["https://www.cbs.nl/nl-nl/nieuws", "https://www.rijksoverheid.nl/onderwerpen/ondernemen-en-innovatie"],
  industrie: ["https://www.cbs.nl/nl-nl/nieuws", "https://www.rijksoverheid.nl/onderwerpen/industrie"],
  onderwijs: ["https://www.onderwijsinspectie.nl/actueel", "https://www.rijksoverheid.nl/onderwerpen/onderwijs"],
};

const FALLBACK_SIGNALS = {
  gezondheidszorg: [
    "Toezichtdruk op toegankelijkheid en kwaliteit verhoogt bestuurlijke regielast.",
    "Arbeidsmarktkrapte verhoogt operationele druk op planning en continuiteit.",
    "Contractering verschuift contractmacht richting financiers en toezichthouders.",
  ],
  advies_consultancy: [
    "Inkoopdiscipline verschuift prijsmacht naar aantoonbare impact.",
    "Schaarste op senior profielen verhoogt leverings- en retentierisico.",
    "Automatisering verlaagt marge op standaardwerk en dwingt specialisatie.",
  ],
  bouw: [
    "Vergunningstrajecten en regelgeving bepalen uitvoerbaarheidstempo.",
    "Materiaalprijsvolatiliteit verhoogt contractrisico in vaste prijsafspraken.",
    "Arbeidsmarktkrapte versterkt afhankelijkheid van onderaannemers.",
  ],
  cultuur: [
    "Subsidiecycli vergroten onzekerheid in lange termijn planning.",
    "Platformmacht beïnvloedt contractpositie in distributiekanalen.",
    "Schaarste op specialistische functies verhoogt uitvoeringsfrictie.",
  ],
  energie: [
    "Regulatoire druk en netcongestie sturen investeringsvolgorde.",
    "Prijsvolatiliteit vergroot contract- en portefeuillerisico.",
    "Arbeidsmarktkrapte vertraagt uitvoering van transitieprogramma's.",
  ],
  financiele_dienstverlening: [
    "Toezichtdruk verhoogt compliance- en rapportagebelasting.",
    "Rente- en liquiditeitsdynamiek beïnvloeden contract- en risicobesluiten.",
    "Schaarste op risk/compliance-profielen remt transformatietempo.",
  ],
  detailhandel: [
    "Koopkrachtvolatiliteit verhoogt druk op marge en assortiment.",
    "Kanaalverschuiving wijzigt contractmacht in de keten.",
    "Arbeidsmarktdruk in logistiek vergroot operationele verstoringskans.",
  ],
  industrie: [
    "Handelsdynamiek beïnvloedt ketenkosten en leveringszekerheid.",
    "Grondstofvolatiliteit verschuift onderhandelingsmacht in contracten.",
    "Technische arbeidsmarktkrapte beperkt opschaling en continuiteit.",
  ],
  onderwijs: [
    "Bekostigingskaders en toezicht beïnvloeden bestuurlijk tempo.",
    "Docentenschaarste verhoogt roosterdruk en continuiteitsrisico.",
    "Digitale leveranciers verschuiven contractmacht in leermiddelenketen.",
  ],
};

const CACHE_PATH = path.resolve(process.cwd(), "sector-signals-cache.json");
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function scoreSignals(signals = []) {
  const regulator = signals.filter((signal) => /toezicht|regelgeving|beleid|inspectie|compliance|igj|afm|dnb|acm/i.test(signal)).length;
  const contract = signals.filter((signal) => /contract|tarief|verzekeraar|prijs|inkoop|macht/i.test(signal)).length;
  const labor = signals.filter((signal) => /arbeidsmarkt|personeel|schaarste|krapte|uitval|rooster/i.test(signal)).length;
  const risk = signals.length;

  return {
    sectorRiskIndex: Math.min(100, risk * 20),
    regulatorPressureIndex: Math.min(100, regulator * 30),
    contractPowerScore: Math.min(100, contract * 30),
    arbeidsmarktdrukIndex: Math.min(100, labor * 30),
    rubric: {
      sectorRisk: `20 * aantal signalen (${risk})`,
      regulatorPressure: `30 * regulator-items (${regulator})`,
      contractPower: `30 * contract-items (${contract})`,
      arbeidsmarktdruk: `30 * arbeidsmarkt-items (${labor})`,
    },
  };
}

export function readSectorCache() {
  if (!fs.existsSync(CACHE_PATH)) return {};
  try {
    const parsed = JSON.parse(fs.readFileSync(CACHE_PATH, "utf-8"));
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function writeSectorCache(cache) {
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
}

export async function fetchSectorSignals(sector) {
  const fallback = FALLBACK_SIGNALS[sector] ?? [];
  const sources = SECTOR_SOURCE_CONFIG[sector] ?? [];
  const signals = [];

  for (const source of sources.slice(0, 3)) {
    try {
      const response = await fetch(source);
      if (!response.ok) continue;
      const text = await response.text();
      const line = `${source}: ${text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 220)}`;
      signals.push(line);
    } catch {
      // skip network failures
    }
  }

  if (!signals.length) {
    return {
      signals: fallback,
      source: "fallback",
      sources,
    };
  }

  return {
    signals: signals.slice(0, 8),
    source: "live",
    sources,
  };
}

export async function resolveSectorSignals(sector) {
  const cache = readSectorCache();
  const cached = cache[sector];

  if (cached && Date.now() - Number(cached.cachedAtEpoch || 0) < ONE_WEEK_MS) {
    return { ...cached, source: "cache" };
  }

  const fetched = await fetchSectorSignals(sector);
  const scores = scoreSignals(fetched.signals);
  const payload = {
    sector,
    signals: fetched.signals,
    sources: fetched.sources,
    fetchedAt: new Date().toISOString(),
    cachedAtEpoch: Date.now(),
    source: fetched.source,
    ...scores,
  };

  cache[sector] = payload;
  writeSectorCache(cache);

  return payload;
}
