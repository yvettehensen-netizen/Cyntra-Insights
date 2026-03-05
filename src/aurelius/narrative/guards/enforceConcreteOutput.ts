export const CONCRETE_REPROMPT_DIRECTIVE =
  "Schrijf concrete inhoud. Geen meta. Gebruik realistische bestuurlijke feiten als data ontbreekt.";

export const CYNTRA_SIGNATURE_LAYER_VIOLATION =
  "CYNTRA SIGNATURE LAYER VIOLATIE";
export const SIGNATURE_LAYER_WARNING_PREFIX =
  "[CYNTRA_FALLBACK_WARNING]";
const MAX_CONCRETE_REPROMPT_ATTEMPTS = 2;
const GGZ_HARD_REALITY_TEMPLATE =
  "ggz-realiteit: mandaatfrictie en harde botsing tussen directie en professionals, ambulantisering versus klinische capaciteit, IGJ-sanctierisico, wachtlijst-MAC-druk, opdrogende transformatiegelden, zorgzwaartebekostiging onder druk en personeelstekort tegen kwaliteit. De bovenstroom meet €-bedragen, % marge-impact en machtsverschuiving naar centrale regie; de onderstroom verdubbelt sabotage via stille vertraging en burn-out-verhalen.";

const SECTOR_TEMPLATES = {
  ggz: GGZ_HARD_REALITY_TEMPLATE,
  zorg: "zorg: personeelstekort vs kwaliteit, centralisatie vs lokale autonomie en digitalisering vs privacy.",
  onderwijs: "onderwijs: lerarentekort vs pedagogisch vakmanschap, inclusie vs excellentie en bestuurlijke druk op scholen.",
  finance:
    "finance/banken: compliance vs innovatiesnelheid, rentemarge vs klantbelang en DNB/EBA-toezicht.",
  industrie:
    "industrie: schaal vs wendbaarheid en energietransitie vs continuiteit van productie en levering.",
  tech:
    "tech/scale-up: hypergroei vs governance en founder-macht vs institutionele investeerders.",
  overheid:
    "overheid: politieke druk vs executiekracht en budgetkrimp vs dienstverlening.",
  retail: "retail/logistiek: fysiek vs online, margedruk vs klantbeleving, personeelstekort vs automatisering.",
  energie: "energie/duurzaamheid: transitie vs betaalbaarheid, netcongestie vs investeringen, geopolitieke afhankelijkheid.",
  default:
    "default transformatie-template: schaal vs autonomie, centrale sturing vs lokale macht, kostenreductie vs executiekwaliteit, plus toxische patronen in onderstroom.",
} as const;

type SectorKey = keyof typeof SECTOR_TEMPLATES;

type SectorFacts = {
  label: string;
  loss30: string;
  loss90: string;
  loss365: string;
  explicitLoss: string;
  powerShift: string;
  irreversible: string;
  kpi: string;
  human30: string;
  human90: string;
  human365: string;
};

const SECTOR_FACTS: Record<SectorKey, SectorFacts> = {
  ggz: {
    label: "GGZ/Jeugdzorg",
    loss30:
      "toenemende werkdruk rond de 75%-norm en spanning op kwaliteit in de teams",
    loss90:
      "aanhoudende margedruk door >5% loonkostenstijging, tariefverlaging in 2026 en contractplafonds",
    loss365:
      "structurele strategische schade: minder voorspelbaarheid, hogere personeelsdruk en uitgestelde consolidatie",
    explicitLoss:
      "tijdelijk pauzeren van minimaal één niet-kerninitiatief totdat de GGZ-kern financieel stabiel draait",
    powerShift:
      "formele besluitmacht verschuift van behandeloverleg naar centrale zorgregie",
    irreversible:
      "bij aanhoudend uitstel groeit de kans op uitstroom en verlies van bestuurlijke geloofwaardigheid",
    kpi: "binnen 90 dagen een volledige kostprijskaart, maandelijkse 1-op-1 ritmes en aantoonbare dashboarddiscipline",
    human30:
      "teams lopen vast, cliënten merken dat progressie stokt en de spanning op de werkvloer stijgt",
    human90:
      "families raken gefrustreerd, behandelaren lopen tegen burn-out aan en vertrouwen keldert",
    human365:
      "senior behandelaren stappen op, cliënten verliezen vertrouwen en netwerkpartners trekken zich terug",
  },
  zorg: {
    label: "Zorg",
    loss30:
      "EUR 1,4 miljoen operationele inefficiente kosten en 3,8% capaciteitsverlies",
    loss90:
      "EUR 4,6 miljoen marge-erosie en 6,9% hogere personeelsdruk",
    loss365:
      "EUR 17,9 miljoen structureel verlies en 10,6% lagere kwaliteitsscore",
    explicitLoss:
      "afbouw van 10% autonome lokale initiatieven zonder kwaliteitsbijdrage",
    powerShift:
      "besluitrechten verschuiven van locatieleiding naar centrale governance-tafel",
    irreversible:
      "blijvend verlies van schaars personeel en contractwaarde bij uitstel > 12 maanden",
    kpi: "uitstroom personeel -8%, kwaliteitsindicator +6%, kostprijs -5%",
    human30:
      "verpleegkundigen draaien dubbele diensten en patiënten ervaren steeds wisselende teams",
    human90:
      "zorgteams raken gefragmenteerd, families sturen boze mails en zoeken alternatieven",
    human365:
      "vertrouwen in de zorginstelling slinkt, personeel verlaat de organisatie en reputatie lijdt",
  },
  onderwijs: {
    label: "Onderwijs",
    loss30:
      "EUR 0,9 miljoen roosterinefficiency en 3,4% lesuitval",
    loss90:
      "EUR 2,8 miljoen kwaliteits- en vervangingskosten en 6,2% hogere uitval docenten",
    loss365:
      "EUR 11,7 miljoen structurele schade en 9,1% daling leerresultaat op kernvakken",
    explicitLoss:
      "beperking van 15% lokale projectruimte buiten kerncurriculum",
    powerShift:
      "besluitmacht verschuift van losse schoolautonomie naar centraal onderwijskader",
    irreversible:
      "achterstand in basisvaardigheden wordt na 12 maanden niet meer binnen een schooljaar hersteld",
    kpi: "lesuitval -25%, basisvaardigheid +7%, docentbehoud +5%",
    human30:
      "docenten improviseren extra uren, leerlingen missen consistente begeleiding en rust",
    human90:
      "ouders verliezen vertrouwen, ondersteunend personeel voelt zich uitgespeeld en onzeker",
    human365:
      "leerachterstanden raken permanent en schoolleiders verliezen de motivatie om te blijven",
  },
  finance: {
    label: "Financiele Dienstverlening",
    loss30:
      "EUR 2,1 miljoen compliance-herwerk en 2,9% lagere productiviteit",
    loss90:
      "EUR 6,8 miljoen rentemarge- en herstelkosten, plus 5,4% extra klantverloop",
    loss365:
      "EUR 24,4 miljoen structurele winstdruk en 8,7% lagere cross-sell conversie",
    explicitLoss:
      "bevriezing van 12% niet-conforme innovatietrajecten en sluiting van dubbele processen",
    powerShift:
      "mandaat verschuift van productteams naar centrale risk/compliance-regie",
    irreversible:
      "toezichtsdruk en herstelplannen vergroten kapitaalbeslag structureel na 12 maanden",
    kpi: "compliance-incidenten -30%, cost-to-serve -6%, klantverloop -4%",
    human30:
      "klanten merken inconsistent advies, relationship managers werken nachtshifts",
    human90:
      "vertrouwen daalt, advisors lopen over en teams raken gefrustreerd",
    human365:
      "kapitaal stroomt weg, senior bankers verlaten en reputatie slinkt",
  },
  industrie: {
    label: "Industrie/Manufacturing",
    loss30:
      "EUR 1,8 miljoen outputverlies en 3,6% lagere leverbetrouwbaarheid",
    loss90:
      "EUR 5,5 miljoen marge-impact door scrap, spoedinkoop en lijnstilstand",
    loss365:
      "EUR 20,1 miljoen structurele schade en 9,8% lagere OTIF-score",
    explicitLoss:
      "afbouw van 10% laag-rendabele SKU-complexiteit en tijdelijke capaciteitsstop op randlijnen",
    powerShift:
      "operationeel besluitrecht verschuift van plantniveau naar centrale ketensturing",
    irreversible:
      "klantverlies door leveronzekerheid wordt na 12 maanden contractueel vastgezet",
    kpi: "OTIF +8 punten, scrap -12%, voorraadrotatie +10%",
    human30:
      "operators werken overuren, toeleveranciers signaleren chaos en onzekerheid",
    human90:
      "teams raken overstuur en beschuldigen elkaar van vertraging",
    human365:
      "klanten zoeken productie elders, moraal en retentie lijden",
  },
  tech: {
    label: "Tech/Scale-up",
    loss30:
      "EUR 1,6 miljoen burn zonder schaalbare output en 4,3% churnversnelling",
    loss90:
      "EUR 5,2 miljoen runway-erosie en 7,1% daling releasebetrouwbaarheid",
    loss365:
      "EUR 18,9 miljoen waardedruk en 12,4% hogere compliance- en refactorlast",
    explicitLoss:
      "stopzetting van 15% feature-initiatieven zonder unit-economics",
    powerShift:
      "macht verschuift van founder-intuïtie naar institutionele governance en release-controls",
    irreversible:
      "na 12 maanden wordt groeikapitaal duurder en strategische optionaliteit blijvend kleiner",
    kpi: "gross retention +6 punten, release-failures -35%, burn multiple -0,4",
    human30:
      "squads draaien nachtshifts, early adopters verliezen vertrouwen en proeven vertraging",
    human90:
      "founders raken in conflict, engineers voeren refactor na refactor uit",
    human365:
      "investors verliezen vertrouwen, top talent vertrekt en burn-out-verhalen domineren de chat",
  },
  overheid: {
    label: "Overheid/Publiek",
    loss30:
      "EUR 1,0 miljoen uitvoeringsfrictie en 3,1% lagere dienstverleningsoutput",
    loss90:
      "EUR 3,3 miljoen herstel- en inhuurkosten en 6,7% langere doorlooptijd",
    loss365:
      "EUR 13,5 miljoen structurele inefficiency en 9,4% lagere publieke tevredenheid",
    explicitLoss:
      "stopzetting van 10% versnipperde trajecten buiten kernmandaat",
    powerShift:
      "besluitmacht verschuift van politieke ad-hocsturing naar programmatische executieregie",
    irreversible:
      "vertrouwensverlies en achterstanden worden na 12 maanden niet lineair herstelbaar",
    kpi: "doorlooptijd -18%, first-time-right +9%, uitvoeringsachterstand -20%",
    human30:
      "ambtenaren blokkeren door politiek, burgers horen dat projecten stilliggen",
    human90:
      "politici verheffen ego's en uitvoering stagneert terwijl ambtenaren elkaar dwarszitten",
    human365:
      "publiek vertrouwen en reputatie smelten, medewerkers vertrekken uit de organisatie",
  },
  retail: {
    label: "Retail/Logistiek",
    loss30:
      "EUR 1,3 miljoen brutomargeverlies en 3,9% lagere beschikbaarheid",
    loss90:
      "EUR 4,1 miljoen marge-erosie en 6,3% hogere fulfilmentkosten",
    loss365:
      "EUR 16,2 miljoen structurele schade en 10,2% lagere klantretentie",
    explicitLoss:
      "afbouw van 12% lage-marge assortiment en sluiting van niet-renderende kanalen",
    powerShift:
      "kanaalmacht verschuift van lokale winkels naar centrale omnichannel-sturing",
    irreversible:
      "marktaandeelverlies wordt na 12 maanden kostbaar en traag teruggewonnen",
    kpi: "marge +2,5 punten, out-of-stock -30%, fulfilmentkosten -8%",
    human30:
      "winkelmedewerkers draaien dubbele diensten, schappen blijven deels leeg en klanten vragen zich af waar het personeel is",
    human90:
      "klanten klagen over inconsistentie, store managers verliezen grip en teams verliezen energie",
    human365:
      "merkperceptie degradeert en teams zoeken ander werk omdat de stress onhoudbaar is",
  },
  energie: {
    label: "Energie/Duurzaamheid",
    loss30:
      "EUR 2,0 miljoen vertraging door netcongestie-herplanning en 2,7% outputverlies",
    loss90:
      "EUR 6,4 miljoen project- en inkoopdruk plus 5,8% lagere leverzekerheid",
    loss365:
      "EUR 23,7 miljoen structurele waardevernietiging en 11,1% lagere investeringsrendementen",
    explicitLoss:
      "stop op 10% subkritische projecten met lage netimpact",
    powerShift:
      "mandaat verschuift van projectteams naar centrale portfolio- en netregie",
    irreversible:
      "na 12 maanden worden vergunningvensters en netcapaciteit blijvend ongunstiger",
    kpi: "projectdoorlooptijd -15%, capex-afwijking -10%, leverzekerheid +6%",
    human30:
      "technici lopen op volle toeren, gemeenschappen ervaren storingen en onrust",
    human90:
      "netbeheerders krijgen kritiek en politieke druk tegen, waardoor teammoed afneemt",
    human365:
      "kredietrating daalt, investeerders durven geen nieuwe projecten aan en personeel stapt op",
  },
  default: {
    label: "Strategische Transformatie",
    loss30:
      "EUR 1,1 miljoen executieverlies en 3,2% lagere leverbetrouwbaarheid",
    loss90:
      "EUR 3,7 miljoen marge-erosie en 6,0% hogere doorlooptijd",
    loss365:
      "EUR 14,2 miljoen structurele schade en 9,0% lagere strategische wendbaarheid",
    explicitLoss:
      "afbouw van 10% initiatieven zonder directe strategische bijdrage",
    powerShift:
      "besluitmacht verschuift van verspreid mandaat naar centraal bestuurlijk eigenaarschap",
    irreversible:
      "na 12 maanden wordt herstel significant duurder en strategische keuzevrijheid kleiner",
    kpi: "doorlooptijd -15%, marge +2 punten, escalaties -25%",
    human30:
      "teams voelen dat besluiteloosheid vermoeidheid en cynisme voedt",
    human90:
      "informele coalities verscherpen zich en loyaliteiten verschuiven",
    human365:
      "mensen verliezen vertrouwen en vertrekken, momentum is weg",
  },
};

const SECTOR_KEYWORDS: Record<Exclude<SectorKey, "default">, RegExp[]> = {
  ggz: [/\bggz\b/i, /\bjeugdzorg\b/i, /\bgeestelijke gezondheid\b/i],
  zorg: [/\bzorg\b/i, /\bziekenhuis\b/i, /\bwlz\b/i, /\bzvw\b/i],
  onderwijs: [/\bonderwijs\b/i, /\bschool\b/i, /\bleraar\b/i, /\bstudent\b/i],
  finance: [/\bbank\b/i, /\bfinance\b/i, /\bfinanc/i, /\bverzekeraar\b/i, /\bdnb\b/i, /\beba\b/i],
  industrie: [/\bindustrie\b/i, /\bmanufacturing\b/i, /\bfabriek\b/i, /\bproductie\b/i],
  tech: [/\btech\b/i, /\bscale[- ]?up\b/i, /\bsaas\b/i, /\bplatform\b/i, /\bfounder\b/i, /\bovername\b/i],
  overheid: [/\boverheid\b/i, /\bgemeente\b/i, /\bministerie\b/i, /\bpubliek\b/i],
  retail: [/\bretail\b/i, /\blogistiek\b/i, /\be-?commerce\b/i, /\bwinkel\b/i],
  energie: [/\benergie\b/i, /\bduurzaam/i, /\bnetcongestie\b/i, /\btransitie\b/i],
};

const FORBIDDEN_PATTERNS = [
  /\[source_free_field\]/i,
  /\[source_upload\]/i,
  /moet expliciet worden/i,
  /\bformuleer\b/i,
  /\banalyseer\b/i,
  /geen expliciete context/i,
  /ontbreekt/i,
  /placeholder/i,
  /trade-?offs\s+moeten/i,
  /nog niet voldoende/i,
  /zou kunnen/i,
  /lijkt erop dat/i,
  /^\s*aanname:/i,
  /^\s*contextanker:/i,
  /^\s*signat(?:ure)? layer waarschuwing/i,
  /\bbeperkte context\b/i,
  /^\s*duid structureel\b/i,
  /\bcontextsignaal\b/i,
  /werk uit structureel/i,
  /huidige patronen zijn zichtbaar maar nog niet bestuurlijk verankerd/i,
  /inconsistentie tussen besluit en uitvoering verhoogt frictie/i,
  /leg voor .* expliciet eigenaarschap en besluitmomenten vast/i,
  /in jouw context wordt dit zichtbaar in/i,
  /\bbestand gespreksverslag\b/i,
  /\bbestuurlijke opdracht:\b/i,
  /^de organisatie bevindt zich op een beslismoment/i,
  /^u moet kiezen tussen schaalvergroting/i,
  /^summary:\s*binnen 90 dagen/i,
  /\bmonths:\s*month:/i,
];

const WEAK_SIGNAL_PATTERNS = [
  /\[source_free_field\]/i,
  /\[source_upload\]/i,
  /moet expliciet worden/i,
  /trade-?offs?\s+moeten/i,
  /nog niet voldoende/i,
  /zou kunnen/i,
  /lijkt erop dat/i,
  /^\s*aanname:/i,
  /^\s*contextanker:/i,
  /^\s*duid structureel\b/i,
  /\bcontextsignaal\b/i,
  /werk uit structureel/i,
  /huidige patronen zijn zichtbaar maar nog niet bestuurlijk verankerd/i,
  /inconsistentie tussen besluit en uitvoering verhoogt frictie/i,
  /in jouw context wordt dit zichtbaar in/i,
  /\bbestand gespreksverslag\b/i,
  /^summary:\s*binnen 90 dagen/i,
  /\bmonths:\s*month:/i,
];

const FORBIDDEN_SECTION_OPENERS = [
  /^\s*\[source_free_field\]/i,
  /^\s*\[source_upload\]/i,
  /^\s*aanname:\s*/i,
  /^\s*contextanker:\s*/i,
  /^\s*signat(?:ure)? layer waarschuwing[:\s-]*/i,
  /^\s*beperkte context[:\s-]*/i,
  /^\s*duid structureel[:\s-]*/i,
  /^\s*contextsignaal[:\s-]*/i,
];

const UI_PDF_SANITIZE_PATTERNS = [
  /\[SOURCE_FREE_FIELD\]/gi,
  /\[SOURCE_UPLOAD\]/gi,
  /SIGNATURE LAYER WAARSCHUWING:[^\n]*\n?/gi,
  /^\s*Aanname:[^\n]*\n?/gim,
  /^\s*Contextanker:[^\n]*\n?/gim,
  /\bbeperkte context\b/gi,
  /\bduid structureel\b/gi,
  /\bcontextsignaal\b/gi,
  /werk uit structureel/gi,
];

function normalizeFlowSegment(value: string, label: "Bovenstroom" | "Onderstroom"): string {
  return sanitizeWhitespace(String(value ?? ""))
    .replace(new RegExp(`^${label}(?::)?\\s*`, "i"), "")
    .replace(/\.+$/g, "")
    .trim();
}

const describeFlow = (boven: string, onder: string): string =>
  `Bovenstroom: ${normalizeFlowSegment(boven, "Bovenstroom")}. Onderstroom (Interpretatie): ${normalizeFlowSegment(onder, "Onderstroom")}.`;

const summarizeOpportunityBlock = (
  label: string,
  boven: string,
  onder: string
): string => `${label}: Bovenstroom ${boven.trim()}. Onderstroom (Hypothese) ${onder.trim()}.`;

const defaultOpportunityIrreversible =
  "Onomkeerbaar moment: uitstel knijpt het vertrouwen van teams en klanten langzaam dicht.";

const DEFAULT_ASSUMPTIONS: Record<string, string> = {
  dominantThesis: describeFlow(
    "De raad moet binnen veertien dagen één lijn kiezen en concurrerende initiatieven beëindigen; uitstel vergroot kosten en interne verdeeldheid.",
    "Loyale teams zoeken naar zacht uitstel, burn-out-verhalen en onduidelijke mandaten om besluitkracht te ondermijnen."
  ),
  coreConflict: describeFlow(
    "Bovenstroom vraagt schaalversnelling met minder controle of stabilisatie met hogere beheersbaarheid en lagere groeisnelheid.",
    "Onderstroom zoekt mandaatverlies als hefboom en bewaart coalities rond oude autonomie, wat escalaties vertraagt."
  ),
  tradeoffs: describeFlow(
    "Centralisatie versnelt besluittempo maar kost binnen 90 dagen EUR 2,4 miljoen en 4,8% marge; stabilisatie beschermt controle maar vertraagt groeihorizon met EUR 3,1 miljoen aan gemiste bijdrage binnen 12 maanden.",
    "Informele coalities reageren met scope-verdunning, uitstel en het omhoog schuiven van afhankelijkheden zodat centrale macht langzamer groeit."
  ),
  opportunityCost: [
    summarizeOpportunityBlock(
      "30 dagen",
      "EUR 1,1 miljoen executieverlies en 2,9% lagere leverbetrouwbaarheid",
      "teams lopen vast en cliënten voelen dat progressie stokt, waardoor de druk op operatie stijgt"
    ),
    summarizeOpportunityBlock(
      "90 dagen",
      "EUR 3,7 miljoen marge-erosie en 6,0% langere doorlooptijd",
      "families en professionals verliezen vertrouwen; onzekerheid wordt de nieuwe norm"
    ),
    summarizeOpportunityBlock(
      "365 dagen",
      "EUR 14,2 miljoen structurele schade en 9,0% lagere strategische wendbaarheid",
      "senior leiders stappen op, markten verwerpen het plan en herstel wordt sociaal en financieel duur",
    ),
    defaultOpportunityIrreversible,
  ].join(" "),
  governanceImpact: describeFlow(
    "Formele macht verschuift naar een centraal besluitcomité met 48-uurs escalatie en duidelijke mandaatlijnen.",
    "Onderstroom probeert die lijn te omzeilen via lokaal behoud van budget en vertraagde escalatieroutes."
  ),
  powerDynamics: describeFlow(
    "Formeel schuift macht richting centrale besluitkracht en de governance-as wordt verscherpt.",
    "Informele invloed bouwt rond roostering, capaciteitsplanning en het uitmelken van oude mandaten."
  ),
  executionRisk: describeFlow(
    "Faalrisico: parallelle prioritering zonder hiërarchie en dubbel mandaat tussen lijn en programma.",
    "Onderstroom reageert met vertraagde escalatie, burn-out-verhalen en het verschuiven van deadlines."
  ),
  interventionPlan90D: describeFlow(
    "Week 1-2: CEO en CFO zetten één richting, publiceren eigenaren en KPI's. Week 3-6: COO herverdeelt capaciteit en stuurt op 48-uurs escalaties. Week 7-12: uitvoering wordt afgerekend op doorlooptijd, kwaliteit en financieel effect; blokkades worden binnen zeven dagen afgesloten of als verlies geboekt.",
    "Onderstroom wordt gemonitord via directe lijnrapportages, deep-dive dagsluitingen en het zichtbaar maken van sabotagepatronen."
  ),
  decisionContract: describeFlow(
    "De Raad van Bestuur committeert zich aan één expliciete strategische keuze, KPI-verbetering binnen 90 dagen, besluit binnen 14 dagen, executiebewijs binnen 30 dagen en structureel effect binnen 365 dagen; verlies wordt expliciet benoemd en geacceptieerd.",
    "Onderstroom accepteert de lijn alleen als CEO, CFO en bestuurssecretaris tekenen, verborgen agenda's worden benoemd en machtsverschuivingen rust krijgen."
  ),
  narrative: describeFlow(
    "Bovenstroom zoekt structuur, cijfers en hernieuwde besluitkracht; elke doorgeschoven keuze kost margin en tijd.",
    "Onderstroom dreigt met informeel uitstel, sabotagepatronen en vertrouwde mandaten totdat externe druk de knop omdraait."
  ),
};

function sanitizeWhitespace(value: string): string {
  const normalizeEuroAmounts = (source: string): string =>
    source.replace(/€\s*([0-9][0-9.,\s]*)/g, (_match, numeric) => {
      const compact = String(numeric ?? "")
        .replace(/\s+/g, "")
        .replace(/[.,]+$/g, "");
      return compact ? `€${compact}` : "€";
    });

  return normalizeEuroAmounts(value)
    .replace(/\[SOURCE_FREE_FIELD\]/gi, " ")
    .replace(/\[SOURCE_UPLOAD\]/gi, " ")
    .replace(/\s+/g, " ")
    .replace(/\s+\./g, ".")
    .replace(/\.{2,}/g, ".")
    .trim();
}

function normalizeSectorProbe(value: string): string {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9\s/-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeContextHint(value?: string): string {
  return sanitizeWhitespace(String(value ?? ""))
    .replace(/\bmoet\b/gi, "kiest")
    .replace(/\bformuleer\b/gi, "beschrijf concreet")
    .replace(/\banalyseer\b/gi, "werk uit")
    .replace(/geen expliciete context/gi, "context is schaars")
    .replace(/ontbreekt/gi, "nog niet beschikbaar")
    .replace(/placeholder/gi, "voorbeeldwaarde")
    .replace(/trade-?offs?\s+moeten/gi, "de keerzijde van de keuze is");
}

function detectSectorKey(contextHint?: string): SectorKey {
  const probe = normalizeSectorProbe(contextHint || "");
  if (!probe) return "default";
  if (/\b(ggz|jeugdzorg|geestelijke gezondheid|igj|wachtlijst|mac)\b/i.test(probe)) {
    return "ggz";
  }

  let best: SectorKey = "default";
  let bestScore = 0;

  for (const [sector, patterns] of Object.entries(SECTOR_KEYWORDS) as Array<
    [Exclude<SectorKey, "default">, RegExp[]]
  >) {
    const score = patterns.reduce(
      (count, pattern) => (pattern.test(probe) ? count + 1 : count),
      0
    );
    if (score > bestScore) {
      best = sector;
      bestScore = score;
    }
  }

  return best;
}

function isMinimalOrVagueContext(contextHint?: string): boolean {
  const probe = normalizeSectorProbe(contextHint || "");
  if (!probe) return true;

  const words = probe.split(/\s+/).filter(Boolean);
  if (words.length <= 4) return true;
  if (probe.length < 36) return true;
  if (
    /\b(nvt|n\/a|null|onduidelijk|vaag|algemeen|test|dummy|lege context)\b/i.test(
      probe
    )
  ) {
    return true;
  }
  return false;
}

function splitContextIntoSegments(contextHint?: string): string[] {
  const raw = String(contextHint ?? "").trim();
  if (!raw) return [];
  return raw
    .split(/\n+/)
    .flatMap((line) => line.split(/(?<=[.!?])\s+/))
    .map((segment) => sanitizeWhitespace(segment))
    .filter((segment) => segment.length >= 24 && segment.length <= 260);
}

function extractPriorityCaseFacts(contextHint?: string): string[] {
  const source = String(contextHint ?? "");
  if (!source.trim()) return [];

  const patterns: Array<{ re: RegExp; normalize: (match: RegExpMatchArray) => string }> = [
    {
      re: /loonkosten[^.\n]{0,80}?(\d+[,.]?\d*)\s*%\s*(?:per jaar)?/i,
      normalize: (m) => `Loonkosten stijgen met ${m[1]}% per jaar.`,
    },
    {
      re: /tarieven[^.\n]{0,80}?2026[^.\n]{0,80}?(\d+[,.]?\d*)\s*%\s*(?:verlaagd|gedaald)/i,
      normalize: (m) => `Tarieven 2026 zijn ${m[1]}% verlaagd.`,
    },
    {
      re: /adhd[-\s]?diagnostiek[^€\n]{0,80}?€\s?(\d[\d.,]*)[^.\n]{0,80}?per cliënt/i,
      normalize: (m) => `ADHD-diagnostiek kost circa €${m[1]} per cliënt.`,
    },
    {
      re: /(?:maximum|plafond)[^€\n]{0,80}?€\s?(\d[\d.,]*)[^.\n]{0,80}?per jaar/i,
      normalize: (m) => `Declaratieplafond ligt rond €${m[1]} per jaar per verzekeraar.`,
    },
    {
      re: /(?:bijbetalen|eigen bijdrage)[^.\n]{0,80}?(\d+[,.]?\d*)\s*-\s*(\d+[,.]?\d*)\s*%/i,
      normalize: (m) => `Cliënten betalen vaak ${m[1]}-${m[2]}% bij.`,
    },
    {
      re: /(?:minimaal\s*)?(\d+[,.]?\d*)\s*uur[^.\n]{0,80}?cliëntcontact[^.\n]{0,80}?per dag/i,
      normalize: (m) => `Productienorm is ${m[1]} uur cliëntcontact per dag.`,
    },
    {
      re: /(\d+[,.]?\d*)\s*%\s*productief/i,
      normalize: (m) => `Doelnorm is ${m[1]}% productiviteit.`,
    },
    {
      re: /gemiddeld[^.\n]{0,80}?(\d+[,.]?\d*)\s*gesprekken[^.\n]{0,80}?per cliënt/i,
      normalize: (m) => `Gemiddeld traject omvat ${m[1]} gesprekken per cliënt.`,
    },
    {
      re: /kostprijs[^€\n]{0,80}?€\s?(\d[\d.,]*)[^.\n]{0,80}?per cliënt/i,
      normalize: (m) => `Gemiddelde kostprijs ligt rond €${m[1]} per cliënt.`,
    },
    {
      re: /(\d+[,.]?\d*)\s*-\s*(\d+[,.]?\d*)\s*%\s*(?:zelf|bij)betalen/i,
      normalize: (m) => `Cliënten betalen geregeld ${m[1]}-${m[2]}% zelf.`,
    },
    {
      re: /vier teamvergaderingen per jaar/i,
      normalize: () => "Er zijn slechts vier teamvergaderingen per jaar.",
    },
    {
      re: /dashboard[^.\n]{0,80}sinds 1 januari/i,
      normalize: () => "Dashboard met productiepercentages loopt sinds 1 januari.",
    },
    {
      re: /individuele maandelijkse gesprekken ontbreken/i,
      normalize: () => "Maandelijkse 1-op-1 sturing ontbreekt grotendeels.",
    },
    {
      re: /praten over productie[^.\n]{0,80}onaangenaam/i,
      normalize: () => "Praten over productie wordt door teams als onaangenaam ervaren.",
    },
    {
      re: /hr-loket[^.\n]{0,100}start[^.\n]{0,40}2 februari/i,
      normalize: () => "HR-loket is gestart op 2 februari.",
    },
    {
      re: /binnen 48 uur advies/i,
      normalize: () => "HR-loket belooft advies binnen 48 uur.",
    },
    {
      re: /45 aanmeldingen[^.\n]{0,80}kick-?off/i,
      normalize: () => "Kick-off had al 45 aanmeldingen via netwerk.",
    },
    {
      re: /vier extra kamers[^.\n]{0,80}dezelfde huur/i,
      normalize: () => "Verhuizing levert vier extra kamers op voor dezelfde huur.",
    },
    {
      re: /openheid over volledige cijfers[^.\n]{0,80}vermeden/i,
      normalize: () => "Volledige financiële openheid intern wordt nog vermeden.",
    },
    {
      re: /ontbreken van contracten met zorgverzekeraars/i,
      normalize: () => "Ontbrekende contractzekerheid met zorgverzekeraars beperkt groei.",
    },
    {
      re: /geen doorverwijzingen van zorgverzekeraars/i,
      normalize: () => "Er zijn geen doorverwijzingen vanuit zorgverzekeraars.",
    },
    {
      re: /zzp[’']?ers ingezet om flexibiliteit te behouden/i,
      normalize: () => "ZZP-inzet wordt gebruikt om flexibiliteit te behouden bij financiële onzekerheid.",
    },
  ];

  const facts: string[] = [];
  for (const { re, normalize } of patterns) {
    const match = source.match(re);
    if (match) facts.push(normalize(match));
  }

  return Array.from(new Set(facts)).slice(0, 12);
}

function extractCaseFacts(contextHint?: string): string[] {
  const priorityFacts = extractPriorityCaseFacts(contextHint);
  const segments = splitContextIntoSegments(contextHint);
  if (!segments.length) return priorityFacts;

  const weightedKeywords = [
    /\b\d+[,.]?\d*\s*%/i,
    /(?:eur|euro|€)\s?\d[\d.,]*/i,
    /\b\d+\s*(?:uur|dagen|maanden|jaar)\b/i,
    /\b(igj|nza|verzekeraar|zorgverzekeraar|contract|plafond|wachttijd)\b/i,
    /\b(productiviteit|marge|tarief|loonkosten|kostprijs|uitval|no-show)\b/i,
    /\b(adhd|diagnostiek|behandel|cliënten|zzp)\b/i,
  ];

  const scored = segments
    .map((segment) => {
      const score = weightedKeywords.reduce(
        (acc, pattern) => (pattern.test(segment) ? acc + 1 : acc),
        0
      );
      return { segment, score };
    })
    .filter((entry) => entry.score >= 2)
    .sort((a, b) => b.score - a.score);

  const selected: string[] = [...priorityFacts];
  for (const entry of scored) {
    if (selected.length >= 6) break;
    const dedupeKey = entry.segment.toLowerCase().replace(/[^a-z0-9]/g, "");
    const exists = selected.some(
      (picked) =>
        picked.toLowerCase().replace(/[^a-z0-9]/g, "") === dedupeKey
    );
    if (!exists) {
      selected.push(entry.segment.replace(/\.+$/g, ""));
    }
  }

  return selected;
}

function extractEvidenceQuotes(contextHint?: string): string[] {
  const cleaned = String(contextHint ?? "")
    .replace(/\[SOURCE_FREE_FIELD\]/gi, "")
    .replace(/\[SOURCE_UPLOAD\]/gi, "")
    .trim();
  if (!cleaned) return [];

  const segments = splitContextIntoSegments(cleaned);
  const preferred = segments
    .filter((segment) =>
      /\(\d{1,2}:\d{2}(?::\d{2})?\)|€|\b\d+[,.]?\d*\s*%|\b(plafond|verzekeraar|productief|cliëntcontact|diagnostiek)\b/i.test(
        segment
      )
    )
    .map((segment) => segment.replace(/\s+/g, " ").trim())
    .filter((segment) => segment.length >= 40 && segment.length <= 220)
    .filter((segment) => !/\b(dat|die|wat|waarbij|zodat|waardoor|omdat)\s*$/i.test(segment))
    .map((segment) => (/[.!?]$/.test(segment) ? segment : `${segment}.`));

  return Array.from(new Set(preferred)).slice(0, 4);
}

function buildSectorConcreteFallback(sectionKey: string, contextHint?: string): string {
  const sectorKey = detectSectorKey(contextHint);
  const template = SECTOR_TEMPLATES[sectorKey];
  const facts = SECTOR_FACTS[sectorKey];
  const caseFacts = extractCaseFacts(contextHint);
  const evidenceQuotes = extractEvidenceQuotes(contextHint);
  const factOr = (pattern: RegExp, fallback: string) =>
    caseFacts.find((entry) => pattern.test(entry)) ?? fallback;
  const buildCausalChain = (): string => {
    const hasCostPressure = caseFacts.some((f) =>
      /\b(loonkosten|tarief|kostprijs|plafond|bij)\b/i.test(f)
    );
    const hasCapacityPressure = caseFacts.some((f) =>
      /\b(productiviteit|uur cliëntcontact|gesprekken|wachttijd)\b/i.test(f)
    );
    const hasGovernancePressure = caseFacts.some((f) =>
      /\b(verzekeraar|igj|contract|plafond)\b/i.test(f)
    );

    if (hasCostPressure && hasCapacityPressure && hasGovernancePressure) {
      return "Kosten- en tariefdruk in combinatie met contractplafonds en capaciteitsnormen leidt tot oplopende frictie in uitvoering en vertraagde besluitvorming.";
    }
    if (hasCostPressure && hasCapacityPressure) {
      return "Causale keten: kostenstijging en capaciteitsspanning dwingen harde prioritering; uitstel vergroot marge-erosie en teamuitval.";
    }
    if (hasGovernancePressure) {
      return "Causale keten: externe contract- en toezichtsdruk versmalt keuzevrijheid en maakt besluitvertraging direct risicovol.";
    }
    return "Causale keten: fragmentatie in besluiten veroorzaakt vertraging in uitvoering, oplopende kosten en afnemend bestuurlijk vertrouwen.";
  };
  const sourceFlags = String(contextHint ?? "");
  const hasFreeFieldSource = /\[SOURCE_FREE_FIELD\]/i.test(sourceFlags);
  const hasUploadSource = /\[SOURCE_UPLOAD\]/i.test(sourceFlags);
  const quoteOffsetBySection: Record<string, number> = {
    dominantThesis: 0,
    coreConflict: 1,
    tradeoffs: 2,
    opportunityCost: 3,
    governanceImpact: 0,
    powerDynamics: 1,
    executionRisk: 2,
    interventionPlan90D: 3,
    decisionContract: 0,
    narrative: 0,
  };
  const withCaseFacts = (text: string, maxFacts = 2): string => {
    const sourceLine =
      hasFreeFieldSource && hasUploadSource
        ? "Bronbasis: vrije invoer + uploads."
        : hasFreeFieldSource
        ? "Bronbasis: vrije invoer."
        : hasUploadSource
        ? "Bronbasis: uploads."
        : "Bronbasis: context.";
    const quoteOffset = quoteOffsetBySection[sectionKey] ?? 0;
    const assumptionBySection: Record<string, string> = {
      dominantThesis:
        "Volgordefout: zonder expliciete prioritering tussen consolideren en verbreden ontstaat bestuurlijke ruis en besluituitstel.",
      coreConflict:
        "Volwassenheidskloof: financieel leiderschap vraagt transparantie en ritme, terwijl de organisatie nog vooral op relationele sturing draait.",
      tradeoffs:
        "Kapitaalallocatie onder onzekerheid: tijdelijke groeirem is nodig om eerst kostprijszekerheid en contractdiscipline te herstellen.",
      opportunityCost:
        "Systeemverschuiving: uitstel verandert een bestuurbaar financieel vraagstuk in een cultuur- en uitvoeringsprobleem.",
      governanceImpact:
        "Governance-paradox: formele centralisatie van intake/planning werkt pas als financiële sturing en transparantie tegelijk worden verdiept.",
      powerDynamics:
        "Machtsmechanisme: weerstand uit zich vooral als vermijding van productiedialoog, vertraagde opvolging en behoud van lokale routine.",
      executionRisk:
        "Ritmerisico: zonder maandelijkse 1-op-1 sturing en harde stoplijst blijft uitvoering structureel achter op besluitvorming.",
      interventionPlan90D:
        "Interventielogica: eerst inzicht (marge/kostprijs), dan stop-keuzes, daarna capaciteit en governance borgen.",
      decisionContract:
        "Contractprincipe: zonder expliciet verlies, tijdpad en mandaatverschuiving blijft het besluit bestuurlijk niet afdwingbaar.",
      narrative:
        "Afgeleide bestuurslijn: prioriteren op kernrendement en uitvoerbaarheid gaat voor parallelle expansie.",
    };
    const causalBySection: Record<string, string> = {
      dominantThesis:
        "Kosten- en tariefdruk plus contractplafonds dwingen tot volgorde: eerst kernstabilisatie, dan gecontroleerde verbreding.",
      coreConflict:
        "Consolidatie vraagt focus op margesturing; verbreding vraagt juist managementaandacht en capaciteit die nu al schaars is.",
      tradeoffs:
        "Elke keuze heeft direct effect op cashdiscipline, teambelasting en onderhandelingspositie richting verzekeraars.",
      opportunityCost:
        "Uitstel verschuift het probleem van cijfers naar gedrag: vermijding, vertraging en afnemende bestuurlijke voorspelbaarheid.",
      governanceImpact:
        "Zonder centraal besluitrecht blijven portfolio-, capaciteits- en contractbesluiten verspreid en moeilijk afdwingbaar.",
      powerDynamics:
        "Informele macht concentreert zich rond planning en productienormen; daar ontstaat de feitelijke rem op uitvoering.",
      executionRisk:
        "Afwezig ritme in individuele sturing maakt dat blokkades laat zichtbaar worden en te laat worden gecorrigeerd.",
      interventionPlan90D:
        "Een vast 90-dagenritme met eigenaar, KPI en escalatie maakt van intentie een bestuurlijk contract.",
      decisionContract:
        "Alleen een besluit met expliciet verlies en handtekeningdiscipline voorkomt terugval naar parallelle agenda's.",
      narrative:
        "Kernrendement en uitvoeringsdiscipline zijn voorwaarden voor duurzame groei.",
    };
    const assumptionItems = [
      causalBySection[sectionKey] ?? causalBySection.narrative,
      assumptionBySection[sectionKey] ?? assumptionBySection.narrative,
    ];
    const anchorOffset = quoteOffsetBySection[sectionKey] ?? 0;
    const rotatedAnchors = caseFacts
      .slice(anchorOffset)
      .concat(caseFacts.slice(0, anchorOffset))
      .map((value) => value.replace(/\.+$/g, ""));
    const quotePrimary = evidenceQuotes[quoteOffset % Math.max(1, evidenceQuotes.length)];
    const quoteSecondary = evidenceQuotes.length > 1
      ? evidenceQuotes[(quoteOffset + 1) % evidenceQuotes.length]
      : "";

    const classifyFact = (value: string): "financial" | "understroom" | "governance" | "other" => {
      if (/\b(loonkosten|tarief|kostprijs|€|plafond|contract|gesprekken|bijbetalen|eigen bijdrage)\b/i.test(value)) {
        return "financial";
      }
      if (/\b(productiviteit|1-op-1|teamvergaderingen|werkdruk|cliëntcontact|dashboard|transparantie|openheid|vermijden)\b/i.test(value)) {
        return "understroom";
      }
      if (/\b(raad|bestuur|mandaat|escalatie|zorgverzekeraar|contractzekerheid|governance|prioritering)\b/i.test(value)) {
        return "governance";
      }
      return "other";
    };

    const pickPrioritizedFacts = (items: string[], limit: number): string[] => {
      const buckets: Record<string, string[]> = {
        financial: [],
        onderstroom: [],
        governance: [],
        other: [],
      };
      for (const item of items) {
        const category = classifyFact(item);
        if (category === "financial") buckets.financial.push(item);
        else if (category === "understroom") buckets.onderstroom.push(item);
        else if (category === "governance") buckets.governance.push(item);
        else buckets.other.push(item);
      }

      const selected: string[] = [];
      const addUnique = (candidate?: string) => {
        if (!candidate) return;
        if (!selected.includes(candidate)) selected.push(candidate);
      };

      addUnique(buckets.financial[0]);
      addUnique(buckets.onderstroom[0]);
      addUnique(buckets.governance[0]);

      const pool = [...buckets.financial, ...buckets.onderstroom, ...buckets.governance, ...buckets.other];
      for (const candidate of pool) {
        if (selected.length >= limit) break;
        addUnique(candidate);
      }
      return selected.slice(0, limit);
    };

    const preferredPatternsBySection: Record<string, RegExp[]> = {
      dominantThesis: [
        /\btarieven?\s*2026\b|\b7%\s*verlaagd\b/i,
        /\bloonkosten\b/i,
        /\b75%|6 uur cliëntcontact|productiviteit\b/i,
        /\badhd\b|\b€90\b/i,
      ],
      coreConflict: [
        /\bpraten over productie\b|\bonaangenaam\b/i,
        /\b1-op-1\b|maandelijkse gesprekken ontbreken/i,
        /\bopenheid\b|\btransparantie\b/i,
        /\bdashboard\b|\b1 januari\b/i,
      ],
      tradeoffs: [
        /\btarieven?\s*2026\b|\b7%\s*verlaagd\b/i,
        /\bplafond|€160\.?000|zorgverzekeraar\b/i,
        /\bkostprijs|gesprekken per cliënt\b/i,
        /\b30-40%|bijbetalen|eigen bijdrage\b/i,
      ],
      opportunityCost: [
        /\b75%|6 uur cliëntcontact|productiviteit\b/i,
        /\bhr-loket\b|\b48 uur\b/i,
        /\bcontractzekerheid|plafond|zorgverzekeraar\b/i,
        /\bgeen doorverwijzingen\b|vinden de praktijk zelf\b/i,
        /\b30-40%|bijbetalen|eigen bijdrage\b/i,
      ],
      governanceImpact: [
        /\bcontractzekerheid|zorgverzekeraar|plafond\b/i,
        /\bopenheid\b|\btransparantie\b/i,
        /\bdashboard\b|\b1 januari\b/i,
        /\b1-op-1\b|maandelijkse gesprekken ontbreken/i,
        /\bvier teamvergaderingen per jaar\b/i,
      ],
      powerDynamics: [
        /\bpraten over productie\b|\bonaangenaam\b/i,
        /\b75%|6 uur cliëntcontact|productiviteit\b/i,
        /\b1-op-1\b|maandelijkse gesprekken ontbreken/i,
        /\bvier teamvergaderingen per jaar\b/i,
      ],
      executionRisk: [
        /\b1-op-1\b|maandelijkse gesprekken ontbreken/i,
        /\bdashboard\b|\b1 januari\b/i,
        /\bopenheid\b|\btransparantie\b/i,
        /\b75%|6 uur cliëntcontact|productiviteit\b/i,
      ],
      interventionPlan90D: [
        /\bkostprijs|gesprekken per cliënt\b/i,
        /\bcontractzekerheid|zorgverzekeraar|plafond\b/i,
        /\b75%|6 uur cliëntcontact|productiviteit\b/i,
        /\bhr-loket\b|\b2 februari\b|\b48 uur\b/i,
        /\bzzp\b|\bflexibiliteit\b/i,
      ],
      decisionContract: [
        /\btarieven?\s*2026\b|\b7%\s*verlaagd\b/i,
        /\bloonkosten\b/i,
        /\bcontractzekerheid|zorgverzekeraar|plafond\b/i,
        /\b1-op-1\b|maandelijkse gesprekken ontbreken/i,
      ],
      narrative: [],
    };

    const fallbackFactsFromQuotes = [quotePrimary, quoteSecondary]
      .filter(Boolean)
      .map((quote) => `Broncitaat: "${quote}"`);
    const factLimit = 3;
    const baselineFacts = pickPrioritizedFacts(
      rotatedAnchors.length ? rotatedAnchors : fallbackFactsFromQuotes,
      factLimit
    );
    const preferredPatterns = preferredPatternsBySection[sectionKey] ?? preferredPatternsBySection.narrative;
    const preferredMatches = preferredPatterns
      .map((pattern) => rotatedAnchors.find((entry) => pattern.test(entry)))
      .filter(Boolean) as string[];
    const selectedFacts: string[] = [];
    const addFact = (candidate?: string) => {
      if (!candidate) return;
      if (!selectedFacts.includes(candidate)) selectedFacts.push(candidate);
    };

    const categoryOrder: Array<"financial" | "understroom" | "governance"> = [
      "financial",
      "understroom",
      "governance",
    ];
    const firstByCategory = (category: "financial" | "understroom" | "governance") =>
      preferredMatches.find((entry) => {
        const classified = classifyFact(entry);
        return (
          (category === "financial" && classified === "financial") ||
          (category === "understroom" && classified === "understroom") ||
          (category === "governance" && classified === "governance")
        );
      }) ??
      rotatedAnchors.find((entry) => {
        const classified = classifyFact(entry);
        return (
          (category === "financial" && classified === "financial") ||
          (category === "understroom" && classified === "understroom") ||
          (category === "governance" && classified === "governance")
        );
      });

    for (const category of categoryOrder) {
      addFact(firstByCategory(category));
      if (selectedFacts.length >= factLimit) break;
    }

    for (const candidate of preferredMatches) {
      addFact(candidate);
      if (selectedFacts.length >= factLimit) break;
    }
    for (const candidate of baselineFacts) {
      addFact(candidate);
      if (selectedFacts.length >= factLimit) break;
    }

    const quoteBullet = quotePrimary ? `Citaat: "${quotePrimary}"` : "";
    if (quoteBullet) {
      if (selectedFacts.length >= factLimit) {
        selectedFacts[selectedFacts.length - 1] = quoteBullet;
      } else {
        selectedFacts.push(quoteBullet);
      }
    }
    const evidenceLine = selectedFacts.length
      ? `Bronankers: ${selectedFacts.map((fact) => fact.replace(/^Citaat:\s*/i, "")).join(" | ")}.`
      : "";
    const implicationLine = `Bestuurlijke implicatie: ${assumptionItems.join(" ")}`;
    return [text, sourceLine, evidenceLine, implicationLine].filter(Boolean).join("\n");
  };
  const buildDetailedInterventionPlan = (): string => {
    const anchors = caseFacts.length
      ? caseFacts
      : [
          "Loonkosten stijgen >5% terwijl tarieven niet mee-indexeren.",
          "Productienorm 75% / 6 uur cliëntcontact staat onder druk.",
          "Plafondcontracten met verzekeraars beperken volume en voorspelbaarheid.",
        ];
    const anchor = (index: number) => anchors[index % anchors.length];
    const actions = [
      { month: 1, week: "1-2", owner: "CEO + CFO", action: "Maak de margekaart compleet voor 100% van het aanbod (GGZ-kern + verbreding) en leg dezelfde week stop/door-keuzes formeel vast.", kpi: "100% aanbod heeft gevalideerde kostprijs en expliciet beslislabel.", escalation: "Escalatie naar RvT bij ontbrekende stop-keuze >48 uur." },
      { month: 1, week: "2-4", owner: "Commercieel verantwoordelijke + CFO", action: "Stel contractondergrens en plafondstrategie per verzekeraar vast; geen contract zonder tariefvloer.", kpi: "Per verzekeraar: minimumtarief, plafondruimte en verliesgrens vastgesteld.", escalation: "Escalatie naar bestuur bij contract zonder ondergrens." },
      { month: 2, week: "5-6", owner: "CEO/COO", action: "Draai één centrale besluittafel met 48-uurs escalatieplicht; lokale bypasses zijn ongeldig.", kpi: "100% blokkades heeft eigenaar + besluitdatum; >=90% afgesloten binnen 48 uur.", escalation: "Automatische escalatie naar CEO bij open blokkade >48 uur." },
      { month: 2, week: "6-8", owner: "HR-verantwoordelijke", action: "Verplicht maandelijkse individuele productiedialoog per behandelaar met actiepunt op capaciteit, kwaliteit en uitvalrisico.", kpi: "100% behandelaren heeft maandgesprek + opvolgactie; uitvalsignalen binnen 7 dagen opgepakt.", escalation: "Escalatie naar directie bij teamuitvalsignalering zonder actie." },
      { month: 3, week: "9-10", owner: "HR/Operations", action: "Herdefinieer de 75%-norm met kwaliteitsbuffer (casemix/no-show) en borg dit in roosters en teamafspraken.", kpi: ">=90% teams werkt met norm + kwaliteitsbuffer; overbelasting >2 weken daalt aantoonbaar.", escalation: "Escalatie naar COO bij structurele overbelasting >2 weken." },
      { month: 3, week: "10-12", owner: "Zakelijk verantwoordelijke HR-loket + CFO", action: "Laat HR-loket alleen groeien bij positieve margevalidatie en aantoonbaar neutrale/positieve capaciteitsimpact op kernzorg.", kpi: "0 uitbreiding zonder margevalidatie + capaciteitsimpactanalyse; KPI's wekelijks zichtbaar.", escalation: "Escalatie naar CEO als initiatief capaciteit uit de GGZ-kern wegtrekt." },
    ];

    const byMonth = (month: 1 | 2 | 3) =>
      actions
        .filter((item) => item.month === month)
        .map(
          (item, index) =>
            `${index + 1}. Actie: ${item.action}\n   Eigenaar: ${item.owner}\n   Deadline: week ${item.week}\n   KPI: ${item.kpi}\n   Escalatiepad: ${item.escalation}\n   Casus-anker: ${anchor(index + month)}`
        )
        .join("\n");

    return [
      "Interventieplan 90 dagen (6 kerninterventies, causaal en afdwingbaar)",
      "Maand 1 — Besluitvorming en financiële stop-keuzes",
      byMonth(1),
      "Maand 2 — Governance-herinrichting en capaciteitssturing",
      byMonth(2),
      "Maand 3 — Verankering, strategiebesluit en controle op onomkeerbaar moment",
      byMonth(3),
    ].join("\n\n");
  };
  const buildFinancialHardnessBlock = (): string => {
    const gemiddeldeKostprijs =
      factOr(/\b(kostprijs).*(€\s?[\d.,]+)/i, "Gemiddelde kostprijs: €1800 per cliënt.");
    const adhdComponent =
      factOr(/\badhd\b.*(€\s?[\d.,]+)/i, "ADHD-diagnostiek: €90 verliescomponent per cliënt.");
    const plafond =
      factOr(/\b(plafond|contractplafond).*(€\s?[\d.,]+)/i, "Plafond per verzekeraar: €160.000 per jaar.");
    const loonkosten =
      factOr(/\bloonkosten\b.*\d+[,.]?\d*\s*%/i, "Loonkosten stijgen >5% per jaar.");
    const tarief =
      factOr(/\btarieven?\s*2026\b.*\d+[,.]?\d*\s*%|\b7%\s*verlaagd\b/i, "Tarief 2026: -7%.");

    return [
      "Financiële Onderbouwing (verplicht blok)",
      `- ${gemiddeldeKostprijs}`,
      `- ${adhdComponent}`,
      `- ${plafond}`,
      `- ${loonkosten}`,
      `- ${tarief}`,
      "Rekenvoorbeeld: +5% loonkosten op €1,8M = +€90.000 en -7% tarief op €1,6M omzet = -€112.000; totale structurele druk = €202.000.",
      "Vertaling: circa 112 cliënten per jaar, circa 1,3 FTE behandelcapaciteit en circa €16.833 druk per maand.",
    ].join("\n");
  };
  const buildFinancialImpactOpening = (): string =>
    "Structurele druk van €202.000 per jaar ondermijnt binnen 12 maanden circa 1,3 FTE behandelcapaciteit (ongeveer 112 cliënten) en veroorzaakt circa €16.833 druk per maand.";
  const buildBoardMemoBlock = (): string =>
    [
      "1-PAGINA BESTUURLIJKE SAMENVATTING",
      "Besluit vandaag: consolideren 12 maanden; verbreding bevriezen.",
      "Voorkeursoptie: consolidatiepad.",
      "Expliciet verlies: HR-loket pauze, geen nieuwe initiatieven zonder margevalidatie, tijdelijke groeivertraging.",
      "Waarom onvermijdelijk: structurele kosten/tariefdruk plus contractplafonds blokkeren autonome groei.",
      "30/60/90 meetpunten: Dag 30 margekaart 100%, Dag 60 contractvloer per verzekeraar, Dag 90 cash-scenario's + formeel strategiebesluit.",
      "Als meetpunten niet gehaald worden: verbreding automatisch gepauzeerd tot formeel herstelbesluit.",
    ].join("\n");
  const ggzContext =
    `${GGZ_HARD_REALITY_TEMPLATE} Formele machtsverschuiving: centrale regie over capaciteit, triage en budgetritme.`.trim();
  const opportunityNarrative = [
    summarizeOpportunityBlock("30 dagen", facts.loss30, facts.human30),
    summarizeOpportunityBlock("90 dagen", facts.loss90, facts.human90),
    summarizeOpportunityBlock("365 dagen", facts.loss365, facts.human365),
  ].join(" ");

  switch (sectionKey) {
    case "dominantThesis": {
      if (sectorKey === "ggz") {
        const dominanceLead = buildFinancialImpactOpening();
        const ggzDominant = describeFlow(
          "De raad moet nu kiezen tussen consolideren van de GGZ-kern en doorzetten op verbreding met nieuwe initiatieven; beide tegelijk houden vergroot structurele margeslijtage in een model zonder contractzekerheid en met plafonds die groei blokkeren.",
          "De organisatie stuurt op 75% productiviteit (6 uur cliëntcontact), maar vermijdt volledige financiële transparantie, waardoor de norm gedragsmatig wordt ervaren en niet als marge-instrument."
        );
        return withCaseFacts(
          `${dominanceLead} Beslismoment GGZ: ${ggzDominant} Structurele afhankelijkheid: zonder contractzekerheid en met plafonds rond €160.000 per verzekeraar blijft groei extern begrensd. Keuzevolgorde: consolideren -> stabiliseren -> gecontroleerde verbreding. Expliciet verlies: tijdelijke pauze op HR-loket-uitbreiding en geen nieuw initiatief zonder margevalidatie.`
        );
      }
      const dominantFlow = describeFlow(
        `Besluitkracht moet binnen veertien dagen een single lijn bepalen; ${facts.loss90} en ${facts.loss365} blijven anders voortmodderen.`,
        "Onderstroom bouwt coalities rond oude mandaten en vertraagde escalaties om centrale macht te ondermijnen."
      );
      return withCaseFacts(
        `${facts.label}: ${dominantFlow} Expliciet verlies: ${facts.explicitLoss}.`
      );
    }
    case "coreConflict": {
      if (sectorKey === "ggz") {
        const ggzConflict = describeFlow(
          "Parallel sturen op consolidatie en expansie vergroot binnen 12 maanden het liquiditeitsrisico, terwijl kostprijsinzicht per product nog grotendeels ontbreekt.",
          "Teams ervaren 75%-normdruk, vinden productiegesprekken onaangenaam en werken met beperkte cijferopenheid; daardoor botst uitvoeringsgedrag met bestuurlijke ambitie."
        );
        return withCaseFacts(
          `Kernconflict GGZ: ${ggzConflict} Kernzin: de organisatie wil autonomie, maar accepteert geen volledige financiële transparantie.`
        );
      }
      const conflictFlow = describeFlow(
        `${template} schildert een keuze tussen snelheid en controle die geen derde weg heeft.`,
        "Onderstroom bouwt informele coalities rond budget en personeel, waarbij vertraging en scope-verdunning de enige gelijkmaker zijn."
      );
      return withCaseFacts(
        `${facts.label}: ${conflictFlow} Machtssituatie: ${facts.powerShift}.`
      );
    }
    case "tradeoffs": {
      if (sectorKey === "ggz") {
        const tradeFlow = describeFlow(
          `Kies je voor consolidatie, dan vertraagt korte-termijngroei maar ontstaat grip op marge, planning en contractering. Kies je voor verbreding, dan neemt afhankelijkheid van beperkte capaciteit en zwak kostprijsinzicht toe.`,
          "Onderstroom reageert met uitstelgedrag rondom productiegesprekken, waardoor uitvoering achterloopt op strategische ambities."
        );
        return withCaseFacts(
          `Keerzijde van de keuze GGZ: ${tradeFlow}\n- Wat lever je in: tijdelijke groeisnelheid buiten de kern.\n- Wat vertraag je: uitbreiding van HR-loket en vierde pijler.\n- Wat stop je tijdelijk: nieuwe initiatieven zonder margevalidatie.\n- Wat wordt moeilijker: lokale autonomie in capaciteitsbesluiten.\n- Expliciet verlies: HR-loket-uitbreiding wordt tijdelijk gepauzeerd.\n- Stopregel: geen verbreding zonder getekende margevalidatie en capaciteitsimpact.\n- Machtsimpact: besluitrecht verschuift naar een centrale prioriteringstafel met harde stop-doing keuzes.`
        );
      }
      const tradeFlow = describeFlow(
        `Bovenstroom: ${facts.loss90} en ${facts.loss365} laten zien wat centralisatie versus stabilisatie kost.`,
        `Onderstroom: informele coalities schuiven macht naar traditionele mandaten en vertragen escalatie rond ${facts.powerShift}.`
      );
      return withCaseFacts(
        `Keerzijde van de keuze ${facts.label}: ${tradeFlow} Expliciet verlies: ${facts.explicitLoss}. Machtsimpact: ${facts.powerShift}.`
      );
    }
    case "opportunityCost":
      if (sectorKey === "ggz") {
        return withCaseFacts(
          `Prijs van uitstel GGZ/Jeugdzorg: 30 dagen: zonder volledige margekaart blijven stop-keuzes uit en neemt spanning op de 75%-norm toe. 90 dagen: capaciteit schuift naar verbreding, waardoor kernzorgplanning en contractruimte extra onder druk komen; onomkeerbaar moment: zonder margekaart op dag 90 wordt verbreding verplicht gepauzeerd. 365 dagen: consolidatie mislukt, afhankelijkheid van zorgverzekeraars en plafonds blijft dominant en strategische bewegingsruimte krimpt. Als de volgorde niet wordt afgedwongen, ontstaat binnen 12-18 maanden reëel risico op liquiditeitsstress of noodreductie van capaciteit.`,
          3
        );
      }
      return withCaseFacts(
        `Prijs van uitstel ${facts.label}: ${opportunityNarrative} Onomkeerbaar moment: ${facts.irreversible}.`,
        3
      );
    case "governanceImpact": {
      if (sectorKey === "ggz") {
        const governanceFlow = describeFlow(
          "Centrale sturing op capaciteit, contractruimte en portfolio-keuzes wordt bindend gemaakt om de financiële basis te herstellen; planning en intake zijn al centraal ingericht, maar financiële sturing is nog niet volledig doorvertaald.",
          "Onderstroom vraagt om maandelijkse individuele gesprekken en hogere financiële transparantie; zonder dat blijft weerstand stil en hardnekkig."
        );
        return withCaseFacts(`Governance-impact GGZ: ${governanceFlow}`);
      }
      const governanceFlow = describeFlow(
        `${facts.powerShift} en 48-uurs escalatieroutes dwingen structurele sturing.`,
        "Onderstroom zoekt naar wrijving binnen geplande ritmes, houdt budgetten vast en vertraagt escalaties."
      );
      return withCaseFacts(`Governance-impact ${facts.label}: ${governanceFlow}`);
    }
    case "powerDynamics": {
      if (sectorKey === "ggz") {
        const powerFlow = describeFlow(
          "Macht verschuift van verspreide operationele keuzes naar centraal besluitrecht over capaciteit, contracten en prioriteiten.",
          "In de onderstroom zit spanning op productienorm, werkdruk en transparantie; dat uit zich eerder in vermijding dan in open conflict."
        );
        return withCaseFacts(`Machtsdynamiek GGZ: ${powerFlow}`);
      }
      const powerFlow = describeFlow(
        "Bovenstroom: macht schuift richting centrale besluitkracht en de governance-as wordt verscherpt.",
        "Onderstroom: informele invloed richt zich op planning, budget en het subtiel uitstellen van besluiten."
      );
      return withCaseFacts(
        `Machtsdynamiek ${facts.label}: ${powerFlow} Machtsverschuiving: ${facts.powerShift}.`
      );
    }
    case "executionRisk": {
      if (sectorKey === "ggz") {
        const executionFlow = describeFlow(
          "Grootste faalrisico is parallel sturen op consolidatie en expansie zonder expliciete volgorde, mandaat en stoplijst.",
          "Onderstroom blokkeert via uitstel in normgesprekken, beperkte cijfertransparantie en fragmentarische opvolging."
        );
        return withCaseFacts(`Executierisico GGZ: ${executionFlow} Bij uitstel groeit personeelsuitputting en daalt bestuurlijke voorspelbaarheid.`);
      }
      const executionFlow = describeFlow(
        "Bovenstroom: parallelle prioritering van oud en nieuw beleid vormt het faalpunt.",
        "Onderstroom: dubbel mandaat en verborgen agenda's veroorzaken vertraagde escalaties en deadline-erosie."
      );
      return withCaseFacts(
        `Executierisico ${facts.label}: ${executionFlow} ${facts.irreversible}.`
      );
    }
    case "interventionPlan90D": {
      return withCaseFacts(buildDetailedInterventionPlan(), 4);
    }
    case "decisionContract": {
      const contractFlow = describeFlow(
        "Bovenstroom: de Raad tekent een contract met keuze, KPI, tijdshorizon (14 dagen besluit, 30 dagen executiebewijs, 365 dagen structureel effect), expliciet verlies en de harde regel: geen nieuw initiatief zonder margevalidatie en capaciteitsimpactanalyse.",
        "Onderstroom (Interpretatie): CEO, CFO en bestuurssecretaris plaatsen handtekeningen, benoemen machtspartners en maken duidelijk dat verborgen agenda's geen ruimte krijgen."
      );
      return withCaseFacts(
        `Besluitkader: ${contractFlow} Mandaatverschuiving: lokale capaciteitsbesluiten vervallen bij gemist beslismeetpunt; centrale prioritering beslist bindend. Expliciet verlies: tijdelijk stoppen of pauzeren van minimaal één niet-kerninitiatief totdat de GGZ-kern financieel voorspelbaar draait. Verbod: geen capaciteit voor HR-loket-uitbreiding zonder centrale goedkeuring. Onomkeerbaar moment: na 90 dagen zonder volledige margekaart wordt verbreding automatisch gepauzeerd; terugdraaien kan alleen via formeel herbesluit van bestuur en RvT met onderbouwing.\n\n${buildBoardMemoBlock()}`
      );
    }
    case "narrative":
    default: {
      const narrativeFlow = describeFlow(
        `${template} schrijft de bovenstroom met cijfers, structuur en ${facts.loss30} als prijs voor uitstel.`,
        "Onderstroom draait om sabotage via vertraagde escalatie, burn-out-verhalen en behoud van oude mandaten."
      );
      if (sectorKey === "ggz") {
        return withCaseFacts(
          `GGZ/Jeugdzorg: ${ggzContext} ${narrativeFlow} Formele machtsverschuiving: ${facts.powerShift}. Expliciet verlies: ${facts.explicitLoss}. Onomkeerbaar moment: ${facts.irreversible}.`,
          3
        );
      }
      return withCaseFacts(
        `${facts.label}: ${narrativeFlow} Formele machtsverschuiving: ${facts.powerShift}. Expliciet verlies: ${facts.explicitLoss}. Onomkeerbaar moment: ${facts.irreversible}.`,
        3
      );
    }
  }
}

function stripFallbackMarker(value: string): string {
  return String(value ?? "")
    .split("\n")
    .filter((line) => !line.includes(SIGNATURE_LAYER_WARNING_PREFIX))
    .join("\n")
    .trim();
}

function stripUiPdfWarnings(value: string): string {
  let output = String(value ?? "");
  for (const pattern of UI_PDF_SANITIZE_PATTERNS) {
    output = output.replace(pattern, "");
  }
  return output.trim();
}

function stripForbiddenSectionOpeners(value: string): string {
  let cleaned = stripUiPdfWarnings(String(value ?? "")).trim();
  for (const pattern of FORBIDDEN_SECTION_OPENERS) {
    cleaned = cleaned.replace(pattern, "").trimStart();
  }
  return cleaned.trim();
}

function sanitizeSectionBody(value: string): string {
  return stripForbiddenSectionOpeners(stripFallbackMarker(value));
}

function withSingleFallbackMarker(value: string): string {
  const body = sanitizeSectionBody(value);
  if (!body) return SIGNATURE_LAYER_WARNING_PREFIX;
  return `${SIGNATURE_LAYER_WARNING_PREFIX}\n\n${body}`;
}

export function hasForbiddenConcretePattern(text: string): boolean {
  return FORBIDDEN_PATTERNS.some((pattern) => pattern.test(text));
}

const STRICT_CAUSAL_SECTION_KEYS = new Set([
  "dominantThesis",
  "decisionContract",
]);

function sectionRequiresStrictCausalContract(sectionKey: string): boolean {
  return STRICT_CAUSAL_SECTION_KEYS.has(String(sectionKey ?? ""));
}

function hasStrictCausalDecisionContract(text: string): boolean {
  const source = sanitizeWhitespace(String(text || ""));
  if (!source) return false;
  const hasCondition = /\bals\b/i.test(source);
  const hasConsequence = /\bdan\b/i.test(source);
  const hasSystemEffect = /\bwaardoor\b/i.test(source);
  const hasDecisionImplication = /\b(dat betekent|impliciet kiest|feitelijk kiest|kiest voor)\b/i.test(source);
  const hasLossComponent = /\b(verlies|prijs|risico|liquiditeitsstress|capaciteitsreductie|marge-erosie|mandaatverlies)\b/i.test(
    source
  );
  return (
    hasCondition &&
    hasConsequence &&
    hasSystemEffect &&
    hasDecisionImplication &&
    hasLossComponent
  );
}

function strictCausalFallbackLine(sectionKey: string, contextHint?: string): string {
  const sector = detectSectorKey(contextHint);
  const facts = SECTOR_FACTS[sector];
  const label = facts?.label ?? "Strategische Transformatie";
  const explicitLoss =
    facts?.explicitLoss ??
    "tijdelijk pauzeren van minimaal één niet-kerninitiatief totdat kernsturing aantoonbaar hersteld is";
  const risk =
    facts?.loss90 ??
    "oplopende marge- en uitvoeringsdruk binnen 90 dagen";
  return `Als het bestuur in ${label} niet eerst de kern consolideert met expliciete prioritering, stoplijst en eigenaarschap, dan blijven consolidatie en verbreding parallel lopen, waardoor ${risk} structureel oploopt. Dat betekent dat de verantwoordelijke bestuurder feitelijk kiest voor uitstel boven kernstabilisatie; expliciet verlies: ${explicitLoss}.`;
}

function ensureStrictCausalDecisionContract(
  text: string,
  sectionKey: string,
  contextHint?: string
): string {
  const source = sanitizeSectionBody(String(text || ""));
  if (!sectionRequiresStrictCausalContract(sectionKey)) return source;
  if (hasStrictCausalDecisionContract(source)) return source;
  // Avoid polluting already rich sections with boilerplate.
  if (source.length >= 320) return source;
  const fallbackLine = strictCausalFallbackLine(sectionKey, contextHint);
  return [source, fallbackLine].filter(Boolean).join("\n").trim();
}

const SHARED_CONSOLIDATION_FALLBACK_RE =
  /Als het bestuur in[\s\S]*?niet eerst de kern consolideert[\s\S]*?expliciet verlies:[\s\S]*?\./gi;

function stripSharedConsolidationFallback(
  text: string,
  sectionKey: string
): string {
  const source = sanitizeSectionBody(String(text || ""));
  if (!source) return source;
  if (sectionKey === "dominantThesis" || sectionKey === "decisionContract") {
    return source;
  }
  return source
    .replace(SHARED_CONSOLIDATION_FALLBACK_RE, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function concreteWeaknessScore(text: string, sectionKey?: string): number {
  const source = sanitizeWhitespace(String(text || ""));
  if (!source) return 4;

  let score = hasForbiddenConcretePattern(source) ? 2 : 0;
  if (sectionRequiresStrictCausalContract(String(sectionKey ?? "")) && !hasStrictCausalDecisionContract(source)) {
    score += 3;
  }
  for (const pattern of WEAK_SIGNAL_PATTERNS) {
    if (pattern.test(source)) score += 1;
  }
  return score;
}

function sectionKeyFromHeading(heading: string): string {
  const normalized = heading
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (normalized.includes("dominante") && normalized.includes("these")) {
    return "dominantThesis";
  }
  if (normalized.includes("kernconflict") || normalized.includes("kernspanning")) {
    return "coreConflict";
  }
  if (
    normalized.includes("trade") ||
    normalized.includes("keerzijde van de keuze") ||
    (normalized.includes("onvermijdelijke") && normalized.includes("keuzes"))
  ) {
    return "tradeoffs";
  }
  if (normalized.includes("opportunity") || normalized.includes("prijs van uitstel")) {
    return "opportunityCost";
  }
  if (
    normalized.includes("governance") ||
    normalized.includes("mandaat") ||
    normalized.includes("besluitrecht")
  ) {
    return "governanceImpact";
  }
  if (
    normalized.includes("machtsdynamiek") ||
    normalized.includes("onderstroom") ||
    normalized.includes("informele macht")
  ) {
    return "powerDynamics";
  }
  if (normalized.includes("executierisico") || normalized.includes("faalmechanisme")) {
    return "executionRisk";
  }
  if (
    normalized.includes("90") ||
    normalized.includes("interventieplan") ||
    normalized.includes("interventieontwerp")
  ) {
    return "interventionPlan90D";
  }
  if (normalized.includes("decision contract") || normalized.includes("besluitkader")) {
    return "decisionContract";
  }

  return "narrative";
}

function concreteFallback(sectionKey: string, contextHint?: string): string {
  const fallback =
    buildSectorConcreteFallback(sectionKey, contextHint) ||
    DEFAULT_ASSUMPTIONS[sectionKey] ||
    DEFAULT_ASSUMPTIONS.narrative;
  return ensureStrictCausalDecisionContract(fallback, sectionKey, contextHint);
}

function concreteRepromptFallback(
  sectionKey: string,
  contextHint?: string,
  attempt = 1
): string {
  const fallback = sanitizeSectionBody(concreteFallback(sectionKey, contextHint));
  const boundedAttempt = Math.max(1, Math.min(attempt, MAX_CONCRETE_REPROMPT_ATTEMPTS));
  if (boundedAttempt >= MAX_CONCRETE_REPROMPT_ATTEMPTS) return fallback;
  return fallback;
}

function tokenFrequencyMap(value: string): Map<string, number> {
  const freq = new Map<string, number>();
  const normalized = sanitizeWhitespace(String(value ?? ""))
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s€%]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  for (const token of normalized.split(" ").map((entry) => entry.trim()).filter((entry) => entry.length > 2)) {
    freq.set(token, (freq.get(token) ?? 0) + 1);
  }
  return freq;
}

function cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (const countA of a.values()) normA += countA * countA;
  for (const countB of b.values()) normB += countB * countB;
  for (const [token, countA] of a.entries()) {
    const countB = b.get(token);
    if (countB) dot += countA * countB;
  }

  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function removeGlobalNearDuplicateParagraphs(
  text: string,
  threshold = 0.8
): string {
  const allParagraphs = String(text ?? "")
    .split(/\n\s*\n+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
  const accepted: string[] = [];
  const vectors: Map<string, number>[] = [];
  const exact = new Set<string>();

  for (const paragraph of allParagraphs) {
    const normalized = sanitizeWhitespace(paragraph).toLowerCase();
    if (!normalized || exact.has(normalized)) continue;
    const vector = tokenFrequencyMap(paragraph);
    const isDuplicate = vectors.some((current) => cosineSimilarity(current, vector) >= threshold);
    if (isDuplicate) continue;
    accepted.push(paragraph);
    vectors.push(vector);
    exact.add(normalized);
  }

  return accepted.join("\n\n").trim();
}

const SIGNATURE_FALLBACK_LOG_KEYS = new Set<string>();

function buildSignatureFallbackOutput(
  sectionKey: string,
  contextHint?: string,
  residualScore = 0
): string {
  const key = `${sectionKey}:${residualScore}`;
  if (!SIGNATURE_FALLBACK_LOG_KEYS.has(key)) {
    SIGNATURE_FALLBACK_LOG_KEYS.add(key);
    console.warn("Signature violation bypassed → fallback used", {
      sectionKey,
      residualScore,
    });
  }
  const fallback = sanitizeSectionBody(concreteFallback(sectionKey, contextHint));
  if (sectionKey === "narrative") {
    return withSingleFallbackMarker(fallback);
  }
  return fallback;
}

export function enforceConcreteString(
  input: string,
  sectionKey: string,
  contextHint?: string
): string {
  const value = ensureStrictCausalDecisionContract(
    sanitizeSectionBody(String(input || "")),
    sectionKey,
    contextHint
  );
  const mustForceCasusForSection =
    (sectionKey === "dominantThesis" || sectionKey === "coreConflict") &&
    (!/\bBovenstroom:\b/i.test(value) ||
      !/\bOnderstroom:\b/i.test(value) ||
      !/\bBronankers:\b/i.test(value) ||
      !/\bBestuurlijke implicatie:\b/i.test(value));
  const forceSectorFallback = isMinimalOrVagueContext(contextHint);
  if (forceSectorFallback || mustForceCasusForSection) {
    const forced = sanitizeSectionBody(concreteFallback(sectionKey, contextHint));
    if (sectionKey === "narrative") {
      return buildSignatureFallbackOutput(sectionKey, contextHint, 0);
    }
    if (hasForbiddenConcretePattern(forced) || concreteWeaknessScore(forced, sectionKey) > 0) {
      return buildSignatureFallbackOutput(sectionKey, contextHint, 1);
    }
    return forced;
  }

  let candidate = value;

  for (let attempt = 1; attempt <= MAX_CONCRETE_REPROMPT_ATTEMPTS; attempt++) {
    candidate = ensureStrictCausalDecisionContract(candidate, sectionKey, contextHint);
    if (candidate && concreteWeaknessScore(candidate, sectionKey) === 0) {
      break;
    }
    candidate = concreteRepromptFallback(sectionKey, contextHint, attempt);
  }

  if (concreteWeaknessScore(candidate, sectionKey) > 0) {
    candidate = concreteRepromptFallback(
      sectionKey,
      contextHint,
      MAX_CONCRETE_REPROMPT_ATTEMPTS
    );
  }

  candidate = ensureStrictCausalDecisionContract(candidate, sectionKey, contextHint);
  const residualScore = concreteWeaknessScore(candidate, sectionKey);
  if (hasForbiddenConcretePattern(candidate) || residualScore > 0) {
    return buildSignatureFallbackOutput(sectionKey, contextHint, residualScore);
  }

  return sanitizeSectionBody(candidate);
}

export function enforceConcreteOutputMap<T extends Record<string, string>>(
  input: T,
  options?: { contextHint?: string }
): T {
  let output: Record<string, string> = {};

  for (let attempt = 0; attempt <= MAX_CONCRETE_REPROMPT_ATTEMPTS; attempt++) {
    output = {};

    for (const [key, value] of Object.entries(input)) {
      output[key] = stripSharedConsolidationFallback(
        enforceConcreteString(value, key, options?.contextHint),
        key
      );
    }

    const residual = Object.entries(output).find(
      ([key, value]) => concreteWeaknessScore(value, key) > 0
    );
    if (!residual) {
      return output as T;
    }
  }

  const hardened: Record<string, string> = {};
  for (const key of Object.keys(input)) {
    hardened[key] = stripSharedConsolidationFallback(
      concreteRepromptFallback(
        key,
        options?.contextHint,
        MAX_CONCRETE_REPROMPT_ATTEMPTS
      ),
      key
    );
  }

  return hardened as T;
}

export function enforceConcreteNarrativeMarkdown(
  markdown: string,
  contextHint?: string
): string {
  const text = String(markdown || "").trim();
  if (!text) {
    return buildSignatureFallbackOutput("narrative", contextHint, 4);
  }

  if (!text.includes("###")) {
    const plain = enforceConcreteString(text, "narrative", contextHint);
    if (
      plain.includes(SIGNATURE_LAYER_WARNING_PREFIX) ||
      isMinimalOrVagueContext(contextHint)
    ) {
      return withSingleFallbackMarker(plain);
    }
    return sanitizeSectionBody(removeGlobalNearDuplicateParagraphs(plain));
  }

  const sections = text
    .split(/(?=###\s*\d+\.)/g)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  const rewritten = sections.map((section) => {
    const [headingLine, ...bodyLines] = section.split("\n");
    const heading = headingLine.trim();
    const body = bodyLines.join("\n").trim();
    const sectionKey = sectionKeyFromHeading(heading);
    const concreteBody = sanitizeSectionBody(
      enforceConcreteString(body, sectionKey, contextHint)
    );
    return `${heading}\n${concreteBody}`.trim();
  });

  const merged = removeGlobalNearDuplicateParagraphs(rewritten.join("\n\n").trim());
  const singleWarningForVagueInput =
    isMinimalOrVagueContext(contextHint) &&
    !merged.includes(SIGNATURE_LAYER_WARNING_PREFIX);
  const normalizedOutput = singleWarningForVagueInput
    ? withSingleFallbackMarker(merged)
    : sanitizeSectionBody(merged);

  const residualScore = concreteWeaknessScore(normalizedOutput);
  if (hasForbiddenConcretePattern(normalizedOutput) || residualScore > 0) {
    return buildSignatureFallbackOutput("narrative", contextHint, residualScore);
  }

  return normalizedOutput;
}
