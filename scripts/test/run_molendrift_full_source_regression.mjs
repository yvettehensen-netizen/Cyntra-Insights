#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function installMemoryStorage() {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => {
      store.set(key, String(value));
    },
    removeItem: (key) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
    key: (index) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
  };
}

async function loadPlatformRuntime(repoRoot) {
  const entry = path.join(repoRoot, "src/platform/index.ts");
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "molendrift-full-source-"));
  const outFile = path.join(outDir, "platform.mjs");

  await build({
    entryPoints: [entry],
    outfile: outFile,
    format: "esm",
    platform: "browser",
    target: ["es2020"],
    bundle: true,
    sourcemap: false,
    logLevel: "silent",
  });

  return import(pathToFileURL(outFile).href);
}

function compact(value, max = 220) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}...`;
}

async function main() {
  const repoRoot = process.cwd();
  installMemoryStorage();
  const platform = await loadPlatformRuntime(repoRoot);
  const { SaaSPlatformFacade } = platform;
  assert(typeof SaaSPlatformFacade === "function", "SaaSPlatformFacade ontbreekt.");

  const source = `• Organisatiecultuur en Eigenaarschap: Medewerkers besteden 70% van hun tijd aan zorg en 30% aan ontwikkelprojecten, wat betrokkenheid bevordert.
• Beperkte groei en vergrijzing: Groei van maximaal 5 FTE per jaar; vergrijzing verhoogt loonkosten met 30%.
• Zorgverlening en Wachttijdbeheer: Experimenten met kortere trajecten voor cliënten verminderen wachttijden en verbeteren tevredenheid.
• Financiële en Strategische Positionering: Molendrift werkt met alle verzekeraars in Noord-Nederland, behoudt financieel resultaat zonder volumegroei.
• Beweging van Nul: Activiteiten gericht op jeugdbeleid om uithuisplaatsingen te verminderen en stevige samenwerking te bevorderen.
• Leiderschap en Talentmanagement: Laag ziekteverzuim van 5%, met aandacht voor werkplezier en directe ondersteuning door management.

Notes
Organisatiecultuur en Eigenaarschap
De organisatiecultuur van Molendrift is stevig verankerd in eigenaarschap en persoonlijke betrokkenheid van medewerkers, wat de kwaliteit en continuiteit van zorg waarborgt.
• Medewerkers als eigenaren met 70% zorgverleningstijd (03:13)
o Medewerkers besteden gemiddeld 70% van hun tijd aan clientenzorg en mogen tot 30% tijd besteden aan ontwikkelprojecten.
o Projecten versterken de kennisbasis en verbeteren het zorgveld, vaak in samenwerking met externe partners.
o Deze werkwijze zorgt voor een gevoel van zingeving en werkplezier bij medewerkers.
o De openheid en transparantie in projecten bouwen vertrouwen op bij gemeenten en zorgverzekeraars.
• Beperkte groei en vergrijzing als kostenuitdaging (07:14)
o De organisatie groeit maximaal met 5 FTE per jaar, nu ongeveer van 100 naar mogelijk 120 medewerkers.
o Vergrijzing verhoogt de loonkosten significant, doordat oudere medewerkers gemiddeld 30% meer kosten dan jongere.
o Molendrift kiest bewust voor stabiliteit in omvang om de cultuur en kwaliteit te borgen.
o De strategische keuze is om via een netwerkorganisatie en licentieproducten financiele marge te creeren voor duurzaamheid.
• Platte structuur met dichtbij management (16:21)
o Het managementteam bestaat uit twee directeuren en drie MT-leden die ook clienten behandelen en medewerkers begeleiden.
o Management is zichtbaar en actief op de werkvloer, wat het eigenaarschap en de betrokkenheid versterkt.
o Er is een brede laag van coordinerend werkbegeleiders die medewerkers ondersteunen.
o Deze structuur helpt de cultuur levendig te houden en snelle feedback mogelijk te maken.
• Sturen op kwaliteit en netwerk in plaats van alleen declarabiliteit (17:39)
o Sturing vindt niet primair plaats op declarabiliteit, maar op een balans tussen clientenzorg en ontwikkelactiviteiten.
o Er is aandacht voor de kwaliteit van het netwerk en samenwerkingen die schaalvergroting mogelijk maken zonder personeelsuitbreiding.
o Monitoring van clientcontacten helpt signaleren van medewerkers die minder goed in hun vel zitten.
o De focus ligt op duurzame kwaliteit en het versterken van samenwerkingsverbanden.
Zorgverlening en Wachttijdbeheer
Molendrift ontwikkelt innovatieve modellen om wachttijden te verminderen en clientgerichte zorg te verbeteren, ondanks toenemende druk en complexiteit in het zorgveld.
• Experiment met directe zorg bij wachttijden van een jaar (26:28)
o Clienten op de wachtlijst worden direct gebeld door een behandelaar om hun situatie te peilen.
o Ongeveer 8% van clienten kiest voor een kort traject van 3-4 gesprekken als alternatief voor langdurige behandeling.
o Dit bespaart capaciteit en voorkomt verzuurde situaties bij clienten.
o Clienten mogen zonder wachttijd terugkomen indien het kort traject niet slaagt.
• Zwaardere clienten en druk op ervaren medewerkers (20:10)
o Wachttijden zijn vooral aanwezig buiten Veendam, met clienten van hogere urgentie.
o Ervaren medewerkers krijgen druk vanwege minder beschikbare tijd voor werkbegeleiding.
o Molendrift heeft de flexibiliteit om clienten te verschuiven tussen regios en zorgverzekeraars.
o De organisatie behoudt hiermee een zekere vrijheid in clienttoewijzing ondanks druk.
• Samenwerking in netwerk om wachtlijstproblemen aan te pakken (09:31)
o Molendrift kiest bewust voor samenwerking met aanbieders beschermd wonen in plaats van eigen vastgoed te kopen.
o Dit voorkomt concurrentie om personeel en versterkt het netwerk.
o Het netwerkprincipe ondersteunt spreiding van zorgcapaciteit en kennisdeling.
o Langzame groei en partnerschap zorgen voor betere balans tussen kwaliteit en capaciteit.
• Intensieve begeleiding bij langdurige GGZ-zorg (27:40)
o Voor clienten die langdurige zorg nodig hebben, wordt ingezet op ACT-principes en groepsbegeleiding.
o Groepen bespreken samen het leren omgaan met blijvende beperkingen.
o Deze aanpak helpt trajecten eerder af te ronden en creeert capaciteit.
o Het vermindert stagnatie en verhoogt de kwaliteit van leven voor clienten.
Financiele en Strategische Positionering
Molendrift kiest een stabiele, kwalitatief gerichte groeistrategie in een complex en krimpend zorglandschap, ondersteund door innovatie en netwerkpartners.
• Bewuste keuze tegen snelle personeelsgroei, focus op marge en netwerk (08:18)
o Groei in medewerkers is beperkt vanwege toenemende loonkosten en vergrijzing.
o Netwerkorganisatie en licentie-inkomsten bieden extra marge om kosten te drukken.
o Deze aanpak helpt Molendrift financieel gezond te blijven zonder volumegroei.
o Vertrouwen en erkenning van het netwerk versterken de marktpositie.
• Contracten met bijna alle verzekeraars en gemeenten in Noord-Nederland (10:59)
o Molendrift werkt met alle zorgverzekeraars behalve Karesk, waar afscheid van is genomen.
o Contracten met gemeenten in Groningen, Friesland en Drenthe zijn volledig.
o Innovaties en extra inspanningen richten zich vooral op gemeenten met open blik voor samenwerking.
o Dit geeft ruimte voor experimenten en versterkt regionale invloed.
• Druk op tarieven en zorgkosten als constante uitdaging (13:28)
o Zorgverzekeraars verlagen tarieven gemiddeld met 5-7% ten opzichte van vorig jaar.
o Molendrift ervaart minder druk door haar kleine omvang en eigen ontwikkelprojecten.
o Keuzes voor samenwerking en netwerk zorgen voor financiele veerkracht.
o De organisatie vermijdt langdurige conflictrelaties met verzekeraars en gemeenten.
• Innovatieve aanpak om wachttijden en zorgkosten te reduceren (20:10 & 26:28)
o Veendam werkt wachttijdvrij met zes partijen en lagere kosten dan in 2021 (-10%).
o Direct contact en kortdurende interventies verminderen langdurige trajecten.
o Deze strategie levert positieve impact op clienttevredenheid en kostenbeheersing.
o Resultaten dienen als voorbeeld voor grotere organisaties en beleidsmakers.
Beweging van Nul en Sectorale Innovatie
Molendrift participeert actief in de Beweging van Nul, die zich inzet voor het verbeteren van jeugd- en jeugdhulp door inhoudelijke samenwerking en beleidsbeinvloeding.
• Beweging van Nul bevordert gedeelde visie op jeugdbeleid (31:09)
o De beweging bestaat uit zorgprofessionals die kennis en ervaring bundelen.
o Zij pushen gemeenten om minder korte termijn te denken en meer kennis te benutten.
o Het doel is nul kinderen die onveilig thuis opgroeien, met minder uithuisplaatsingen.
o De beweging werkt bottom-up, omdat landelijke beleidsvorming traag en versnipperd is.
• Actieve rol in complexe samenwerkingsverbanden en beleidsdiscussies (46:57)
o Molendrift helpt bij juridische en organisatorische verbeteringen rond uithuisplaatsingen.
o De beweging confronteert ook verzuurde partijen in de jeugdbescherming.
o Activiteiten zijn inhoudelijk gericht, met steun van communicatieprofessionals en ambassadeurs.
o Resultaten worden zichtbaar in landelijke pilots en verbeterprojecten.
• Uitdagingen in beleidslandschap en besluitvorming (36:01)
o Complexe besluitvormingsstructuren leggen onbewust druk op medewerkers.
o Er is behoefte aan krachtig leiderschap om bureaucratische obstakels te verminderen.
o Politieke en financiele belangen vertragen innovatie en vergroten regeldruk.
o Molendrift ervaart dit als een belangrijke uitdaging voor het hele veld.
• Invloed en netwerk zonder institutionalisering (45:45)
o De beweging is bewust geen formele organisatie met leden, maar een open netwerk.
o Er wordt gewerkt met een kerngroep die regelmatig digitaal bijeenkomt.
o Molendrift ziet dit als een krachtig instrument om inhoudelijke verandering te stimuleren.
o De beweging wil uiteindelijk overgedragen worden aan beroepsverenigingen.
Leiderschap, Talentmanagement en Werkklimaat
Molendrift combineert een platte organisatie met actief leiderschap en sterke aandacht voor werkplezier en teamdynamiek.
• Laag ziekteverzuim en aandacht voor onderstroom (12:07 & 23:49)
o Het ziekteverzuim ligt rond 5,0% exclusief zwangerschapsverlof.
o Er is continue aandacht voor spanningen en gedragsveranderingen onder personeel.
o Kleinere organisatiegrootte helpt om cultuur en werkplezier te behouden.
o Medewerkers voelen zich betrokken en verantwoordelijk voor het samen oplossen van problemen.
• Talentmanagement via werkvloergericht MT en werkbegeleiders (16:21)
o MT-leden combineren managementtaken met directe clientenzorg en begeleiding.
o Coordinerend werkbegeleiders ondersteunen medewerkers dagelijks.
o Deze aanpak bevordert directe communicatie en snelle signalering van problemen.
o Het versterkt de verbinding tussen strategie en uitvoering.
• Eigenaarschap en academische achtergrond als kracht (24:08)
o 90% van medewerkers is academisch of postacademisch opgeleid, wat betrokkenheid vergroot.
o Eigenaarschap wordt actief gestimuleerd om samen druk en veranderingen te managen.
o Hoge opleiding helpt complexe zorgvraagstukken beter te begrijpen en aan te pakken.
o Dit draagt bij aan een cultuur waar medewerkers zich verantwoordelijk voelen.
• Balans tussen werkdruk en innovatie (23:49 & 29:53)
o Molendrift ervaart de werkdruk niet als toenemend, mede door cultuur en betrokkenheid.
o Innovaties en openheid naar externe partijen zorgen voor voortdurende verbetering.
o Exposure en kennisdeling versterken positie zonder de organisatie te groot te maken.
o Hierdoor blijft het werk uitdagend en aantrekkelijk voor medewerkers.`;

  const { SaaSPlatformFacade, isSessionCompleted } = platform;
  const facade = new SaaSPlatformFacade();
  const org = facade.ensureOrganization({
    organisatie_naam: "Molendrift",
    sector: "GGZ",
    organisatie_grootte: "100-120 medewerkers",
    abonnementstype: "Professional",
  });

  const session = await facade.startStrategischeAnalyse({
    organization_id: org.organization_id,
    input_data: source,
    analysis_type: "Strategische analyse",
  });

  assert(session?.session_id, "session_id ontbreekt");
  assert(isSessionCompleted(session.status), "Analyse is niet voltooid.");
  assert((session.quality_score || 0) >= 85, "Kwaliteitsscore onder publicatiedrempel.");

  const fetched = facade.sessions.getSession(session.session_id);
  assert(fetched, "Sessie niet terugvindbaar via getSession.");
  const listed = facade.sessions.listSessions();
  assert(listed.some((row) => row.session_id === session.session_id), "Sessie ontbreekt in listSessions.");

  const executive = facade.reports.createExecutiveSummary(fetched);
  const memo = facade.reports.createBoardMemo(fetched);
  const pdf = await facade.reports.createPdf(fetched);

  assert(executive?.content, "Executive summary ontbreekt.");
  assert(memo?.content, "Board memo ontbreekt.");
  assert(pdf?.content, "PDF content ontbreekt.");

  console.log(JSON.stringify({
    session_id: session.session_id,
    status: session.status,
    quality_score: session.quality_score,
    quality_tier: session.quality_tier,
    executive_summary: compact(session.executive_summary, 420),
    board_memo_excerpt: compact(session.board_memo, 700),
    board_report_excerpt: compact(session.board_report, 700),
    interventions: (session.intervention_predictions || []).slice(0, 3).map((item) => ({
      interventie: item?.interventie || "",
      impact: compact(item?.impact || "", 180),
      risico: compact(item?.risico || "", 160),
      kpi_effect: compact(item?.kpi_effect || "", 160),
      confidence: item?.confidence || "",
    })),
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
