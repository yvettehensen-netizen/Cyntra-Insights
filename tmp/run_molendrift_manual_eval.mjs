#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

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
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "molendrift-manual-"));
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

const source = `Organisatiecultuur en Eigenaarschap: Medewerkers besteden 70% van hun tijd aan zorg en 30% aan ontwikkelprojecten, wat betrokkenheid bevordert.
Beperkte groei en vergrijzing: Groei van maximaal 5 FTE per jaar; vergrijzing verhoogt loonkosten met 30%.
Zorgverlening en Wachttijdbeheer: Experimenten met kortere trajecten voor cliënten verminderen wachttijden en verbeteren tevredenheid.
Financiële en Strategische Positionering: Molendrift werkt met alle verzekeraars in Noord-Nederland, behoudt financieel resultaat zonder volumegroei.
Beweging van Nul: Activiteiten gericht op jeugdbeleid om uithuisplaatsingen te verminderen en stevige samenwerking te bevorderen.
Leiderschap en Talentmanagement: Laag ziekteverzuim van 5%, met aandacht voor werkplezier en directe ondersteuning door management.

Notes
Organisatiecultuur en Eigenaarschap
De organisatiecultuur van Molendrift is stevig verankerd in eigenaarschap en persoonlijke betrokkenheid van medewerkers, wat de kwaliteit en continuïteit van zorg waarborgt.
Medewerkers als eigenaren met 70% zorgverleningstijd. Medewerkers besteden gemiddeld 70% van hun tijd aan cliëntenzorg en mogen tot 30% tijd besteden aan ontwikkelprojecten. Projecten versterken de kennisbasis en verbeteren het zorgveld, vaak in samenwerking met externe partners. Deze werkwijze zorgt voor een gevoel van zingeving en werkplezier bij medewerkers. De openheid en transparantie in projecten bouwen vertrouwen op bij gemeenten en zorgverzekeraars.
Beperkte groei en vergrijzing als kostenuitdaging. De organisatie groeit maximaal met 5 FTE per jaar, nu ongeveer van 100 naar mogelijk 120 medewerkers. Vergrijzing verhoogt de loonkosten significant, doordat oudere medewerkers gemiddeld 30% meer kosten dan jongere. Molendrift kiest bewust voor stabiliteit in omvang om de cultuur en kwaliteit te borgen. De strategische keuze is om via een netwerkorganisatie en licentieproducten financiële marge te creëren voor duurzaamheid.
Platte structuur met dichtbij management. Het managementteam bestaat uit twee directeuren en drie MT-leden die ook cliënten behandelen en medewerkers begeleiden. Management is zichtbaar en actief op de werkvloer, wat het eigenaarschap en de betrokkenheid versterkt. Er is een brede laag van coördinerend werkbegeleiders die medewerkers ondersteunen. Deze structuur helpt de cultuur levendig te houden en snelle feedback mogelijk te maken.
Sturen op kwaliteit en netwerk in plaats van alleen declarabiliteit. Sturing vindt niet primair plaats op declarabiliteit, maar op een balans tussen cliëntenzorg en ontwikkelactiviteiten. Er is aandacht voor de kwaliteit van het netwerk en samenwerkingen die schaalvergroting mogelijk maken zonder personeelsuitbreiding. Monitoring van cliëntcontacten helpt signaleren van medewerkers die minder goed in hun vel zitten. De focus ligt op duurzame kwaliteit en het versterken van samenwerkingsverbanden.

Zorgverlening en Wachttijdbeheer
Molendrift ontwikkelt innovatieve modellen om wachttijden te verminderen en cliëntgerichte zorg te verbeteren, ondanks toenemende druk en complexiteit in het zorgveld.
Experiment met directe zorg bij wachttijden van een jaar. Cliënten op de wachtlijst worden direct gebeld door een behandelaar om hun situatie te peilen. Ongeveer 8% van cliënten kiest voor een kort traject van 3-4 gesprekken als alternatief voor langdurige behandeling. Dit bespaart capaciteit en voorkomt verzuurde situaties bij cliënten. Cliënten mogen zonder wachttijd terugkomen indien het kort traject niet slaagt.
Zwaardere cliënten en druk op ervaren medewerkers. Wachttijden zijn vooral aanwezig buiten Veendam, met cliënten van hogere urgentie. Ervaren medewerkers krijgen druk vanwege minder beschikbare tijd voor werkbegeleiding. Molendrift heeft de flexibiliteit om cliënten te verschuiven tussen regio’s en zorgverzekeraars. De organisatie behoudt hiermee een zekere vrijheid in cliënttoewijzing ondanks druk.
Samenwerking in netwerk om wachtlijstproblemen aan te pakken. Molendrift kiest bewust voor samenwerking met aanbieders beschermd wonen in plaats van eigen vastgoed te kopen. Dit voorkomt concurrentie om personeel en versterkt het netwerk. Het netwerkprincipe ondersteunt spreiding van zorgcapaciteit en kennisdeling. Langzame groei en partnerschap zorgen voor betere balans tussen kwaliteit en capaciteit.
Intensieve begeleiding bij langdurige GGZ-zorg. Voor cliënten die langdurige zorg nodig hebben, wordt ingezet op ACT-principes en groepsbegeleiding. Groepen bespreken samen het leren omgaan met blijvende beperkingen. Deze aanpak helpt trajecten eerder af te ronden en creëert capaciteit. Het vermindert stagnatie en verhoogt de kwaliteit van leven voor cliënten.

Financiële en Strategische Positionering
Molendrift kiest een stabiele, kwalitatief gerichte groeistrategie in een complex en krimpend zorglandschap, ondersteund door innovatie en netwerkpartners.
Bewuste keuze tegen snelle personeelsgroei, focus op marge en netwerk. Groei in medewerkers is beperkt vanwege toenemende loonkosten en vergrijzing. Netwerkorganisatie en licentie-inkomsten bieden extra marge om kosten te drukken. Deze aanpak helpt Molendrift financieel gezond te blijven zonder volumegroei. Vertrouwen en erkenning van het netwerk versterken de marktpositie.
Contracten met bijna alle verzekeraars en gemeenten in Noord-Nederland. Molendrift werkt met alle zorgverzekeraars behalve Karesk, waar afscheid van is genomen. Contracten met gemeenten in Groningen, Friesland en Drenthe zijn volledig. Innovaties en extra inspanningen richten zich vooral op gemeenten met open blik voor samenwerking. Dit geeft ruimte voor experimenten en versterkt regionale invloed.
Druk op tarieven en zorgkosten als constante uitdaging. Zorgverzekeraars verlagen tarieven gemiddeld met 5-7% ten opzichte van vorig jaar. Molendrift ervaart minder druk door haar kleine omvang en eigen ontwikkelprojecten. Keuzes voor samenwerking en netwerk zorgen voor financiële veerkracht. De organisatie vermijdt langdurige conflictrelaties met verzekeraars en gemeenten.
Innovatieve aanpak om wachttijden en zorgkosten te reduceren. Veendam werkt wachttijdvrij met zes partijen en lagere kosten dan in 2021 (-10%). Direct contact en kortdurende interventies verminderen langdurige trajecten. Deze strategie levert positieve impact op cliënttevredenheid en kostenbeheersing. Resultaten dienen als voorbeeld voor grotere organisaties en beleidsmakers.

Beweging van Nul en Sectorale Innovatie
Molendrift participeert actief in de Beweging van Nul, die zich inzet voor het verbeteren van jeugd- en jeugdhulp door inhoudelijke samenwerking en beleidsbeïnvloeding.
Beweging van Nul bevordert gedeelde visie op jeugdbeleid. De beweging bestaat uit zorgprofessionals die kennis en ervaring bundelen. Zij pushen gemeenten om minder korte termijn te denken en meer kennis te benutten. Het doel is nul kinderen die onveilig thuis opgroeien, met minder uithuisplaatsingen. De beweging werkt bottom-up, omdat landelijke beleidsvorming traag en versnipperd is.
Actieve rol in complexe samenwerkingsverbanden en beleidsdiscussies. Molendrift helpt bij juridische en organisatorische verbeteringen rond uithuisplaatsingen. De beweging confronteert ook verzuurde partijen in de jeugdbescherming. Activiteiten zijn inhoudelijk gericht, met steun van communicatieprofessionals en ambassadeurs. Resultaten worden zichtbaar in landelijke pilots en verbeterprojecten.
Uitdagingen in beleidslandschap en besluitvorming. Complexe besluitvormingsstructuren leggen onbewust druk op medewerkers. Er is behoefte aan krachtig leiderschap om bureaucratische obstakels te verminderen. Politieke en financiële belangen vertragen innovatie en vergroten regeldruk. Molendrift ervaart dit als een belangrijke uitdaging voor het hele veld.
Invloed en netwerk zonder institutionalisering. De beweging is bewust geen formele organisatie met leden, maar een open netwerk. Er wordt gewerkt met een kerngroep die regelmatig digitaal bijeenkomt. Molendrift ziet dit als een krachtig instrument om inhoudelijke verandering te stimuleren. De beweging wil uiteindelijk overgedragen worden aan beroepsverenigingen.

Leiderschap, Talentmanagement en Werkklimaat
Molendrift combineert een platte organisatie met actief leiderschap en sterke aandacht voor werkplezier en teamdynamiek.
Laag ziekteverzuim en aandacht voor onderstroom. Het ziekteverzuim ligt rond 5,0% exclusief zwangerschapsverlof. Er is continue aandacht voor spanningen en gedragsveranderingen onder personeel. Kleinere organisatiegrootte helpt om cultuur en werkplezier te behouden. Medewerkers voelen zich betrokken en verantwoordelijk voor het samen oplossen van problemen.
Talentmanagement via werkvloergericht MT en werkbegeleiders. MT-leden combineren managementtaken met directe cliëntenzorg en begeleiding. Coördinerend werkbegeleiders ondersteunen medewerkers dagelijks. Deze aanpak bevordert directe communicatie en snelle signalering van problemen. Het versterkt de verbinding tussen strategie en uitvoering.
Eigenaarschap en academische achtergrond als kracht. 90% van medewerkers is academisch of postacademisch opgeleid, wat betrokkenheid vergroot. Eigenaarschap wordt actief gestimuleerd om samen druk en veranderingen te managen. Hoge opleiding helpt complexe zorgvraagstukken beter te begrijpen en aan te pakken. Dit draagt bij aan een cultuur waar medewerkers zich verantwoordelijk voelen.
Balans tussen werkdruk en innovatie. Molendrift ervaart de werkdruk niet als toenemend, mede door cultuur en betrokkenheid. Innovaties en openheid naar externe partijen zorgen voor voortdurende verbetering. Exposure en kennisdeling versterken positie zonder de organisatie te groot te maken. Hierdoor blijft het werk uitdagend en aantrekkelijk voor medewerkers.

Action items
Peter Dijkshoorn: debriefing sturen per mail en een vervolginterview plannen.
Open acties: uitwisseling organiseren over jaarplannen, besluitvormingsmechanismen en kennisborging; vervolgcontact met Beweging van Nul en partners; blijven investeren in netwerkprojecten en pilots.`;

async function main() {
  const repoRoot = process.cwd();
  installMemoryStorage();
  const platform = await loadPlatformRuntime(repoRoot);
  const { SaaSPlatformFacade } = platform;
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

  console.log(
    JSON.stringify(
      {
        session_id: session.session_id,
        status: session.status,
        error_message: session.error_message || null,
        quality_score: session.quality_score ?? null,
        quality_flags: session.quality_flags ?? [],
        executive_summary: String(session.executive_summary || "").slice(0, 3000),
        board_memo: String(session.board_memo || "").slice(0, 8000),
        board_report: String(session.board_report || "").slice(0, 8000),
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
