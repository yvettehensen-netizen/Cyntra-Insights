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
      "EUR 1,2 miljoen productiviteitsverlies en 4,1% lagere behandelcapaciteit",
    loss90:
      "EUR 3,9 miljoen omzetdruk, 7,4% extra wachtlijstopbouw en 2,6 procentpunt hogere uitval",
    loss365:
      "EUR 15,6 miljoen structurele schade en 11,8% langere doorlooptijd",
    explicitLoss:
      "stopzetting van 8-12% niet-kritieke zorglijnen en afbouw van lokale mandaten",
    powerShift:
      "formele besluitmacht verschuift van behandeloverleg naar centrale zorgregie",
    irreversible:
      "na 12 maanden ontstaat onomkeerbare uitstroom van senior behandelaren en contractverlies",
    kpi: "wachttijd -15%, no-show -10%, doorlooptijd -12% binnen 90 dagen",
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
  /\bmoet\b/i,
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
];

const WEAK_SIGNAL_PATTERNS = [
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
];

const FORBIDDEN_SECTION_OPENERS = [
  /^\s*aanname:\s*/i,
  /^\s*contextanker:\s*/i,
  /^\s*signat(?:ure)? layer waarschuwing[:\s-]*/i,
  /^\s*beperkte context[:\s-]*/i,
  /^\s*duid structureel[:\s-]*/i,
  /^\s*contextsignaal[:\s-]*/i,
];

const UI_PDF_SANITIZE_PATTERNS = [
  /SIGNATURE LAYER WAARSCHUWING:[^\n]*\n?/gi,
  /^\s*Aanname:[^\n]*\n?/gim,
  /^\s*Contextanker:[^\n]*\n?/gim,
  /\bbeperkte context\b/gi,
  /\bduid structureel\b/gi,
  /\bcontextsignaal\b/gi,
  /werk uit structureel/gi,
];

const describeFlow = (boven: string, onder: string): string =>
  `Bovenstroom: ${boven.trim()}. Onderstroom: ${onder.trim()}.`;

const summarizeOpportunityBlock = (
  label: string,
  boven: string,
  onder: string
): string => `${label}: Bovenstroom ${boven.trim()}. Onderstroom ${onder.trim()}.`;

const defaultOpportunityIrreversible =
  "Irreversibiliteit: uitstel knijpt het vertrouwen van teams en klanten langzaam dicht.";

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
    "Onderstroom accepteert de lijn alleen als CEO, CFO en boardsecretaris tekenen, verborgen agenda's worden benoemd en machtsverschuivingen krijgen expliciete rustpunten."
  ),
  narrative: describeFlow(
    "Bovenstroom zoekt structuur, cijfers en hernieuwde besluitkracht; elke doorgeschoven keuze kost margin en tijd.",
    "Onderstroom dreigt met informeel uitstel, sabotagepatronen en vertrouwde mandaten totdat externe druk de knop omdraait."
  ),
};

function sanitizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
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
    .replace(/trade-?offs?\s+moeten/gi, "trade-offs zijn");
}

function detectSectorKey(contextHint?: string): SectorKey {
  const probe = normalizeSectorProbe(contextHint || "");
  if (!probe) return "default";

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

function buildSectorConcreteFallback(sectionKey: string, contextHint?: string): string {
  const sectorKey = detectSectorKey(contextHint);
  const template = SECTOR_TEMPLATES[sectorKey];
  const facts = SECTOR_FACTS[sectorKey];
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
        const ggzDominant = describeFlow(
          `De raad moet binnen veertien dagen kiezen tussen ambulantisering en klinische capaciteit; ${facts.loss90} vergroot IGJ-risico wanneer beslissingen uitgesteld worden.`,
          "Onderstroom mobiliseert mandaatverlies, burn-out-verhalen en stille vertraging om harde keuzes te blokkeren."
        );
        return `GGZ/Jeugdzorg: ${ggzDominant} Expliciet verlies: ${facts.explicitLoss}.`;
      }
      const dominantFlow = describeFlow(
        `Besluitkracht moet binnen veertien dagen een single lijn bepalen; ${facts.loss90} en ${facts.loss365} blijven anders voortmodderen.`,
        "Onderstroom bouwt coalities rond oude mandaten en vertraagde escalaties om centrale macht te ondermijnen."
      );
      return `${facts.label}: ${dominantFlow} Expliciet verlies: ${facts.explicitLoss}.`;
    }
    case "coreConflict": {
      if (sectorKey === "ggz") {
        const ggzConflict = describeFlow(
          `Ambulantisering versus klinische capaciteit is een onoplosbaar spanningsveld dat wachtlijsten, IGJ en budget onder druk zet; uitstel maakt ${facts.loss90} en ${facts.loss365} alleen maar groter.`,
          "Onderstroom zet mandaatverlies en burn-out-verhalen in als sabotagepatronen, terwijl professionals vasthouden aan oude behandelautonomie."
        );
        return `Kernconflict GGZ: ${ggzConflict}`;
      }
      const conflictFlow = describeFlow(
        `${template} schildert een keuze tussen snelheid en controle die geen derde weg heeft.`,
        "Onderstroom bouwt informele coalities rond budget en personeel, waarbij vertraging en scope-verdunning de enige gelijkmaker zijn."
      );
      return `${facts.label}: ${conflictFlow} Machtssituatie: ${facts.powerShift}.`;
    }
    case "tradeoffs": {
      if (sectorKey === "ggz") {
        const tradeFlow = describeFlow(
          `Bovenstroom: ${facts.loss90} en ${facts.loss365} ontstaan door ambulantisering, zorgzwaarte en tariefdruk die centrale marge ondermijnen.`,
          "Onderstroom: professionele blokkades, stille vertraging en burn-out-verhalen verdedigen lokale autonomie en vertragen centrale regie."
        );
        return `Trade-offs GGZ: ${tradeFlow} Expliciet verlies: ${facts.explicitLoss}. Machtsimpact: ${facts.powerShift}.`;
      }
      const tradeFlow = describeFlow(
        `Bovenstroom: ${facts.loss90} en ${facts.loss365} laten zien wat centralisatie versus stabilisatie kost.`,
        "Onderstroom: informele coalities schuiven macht naar traditionele mandaten en vertragen escalatie rond ${facts.powerShift}."
      );
      return `Trade-offs ${facts.label}: ${tradeFlow} Expliciet verlies: ${facts.explicitLoss}. Machtsimpact: ${facts.powerShift}.`;
    }
    case "opportunityCost":
      return `Opportunity cost ${facts.label}: ${opportunityNarrative} Irreversibiliteit: ${facts.irreversible}.`;
    case "governanceImpact": {
      if (sectorKey === "ggz") {
        const governanceFlow = describeFlow(
          "Bovenstroom: centrale regie op capaciteit, triage en budget verhoogt IGJ-controle en dwingt 48-uurs escalatie.",
          "Onderstroom: teams die autonomie verliezen bouwen tegenkracht rond oude zorglijnbesluiten en vertragen implementatie."
        );
        return `Governance-impact GGZ: ${governanceFlow}`;
      }
      const governanceFlow = describeFlow(
        `${facts.powerShift} en 48-uurs escalatieroutes dwingen structurele sturing.`,
        "Onderstroom zoekt naar wrijving binnen geplande ritmes, houdt budgetten vast en vertraagt escalaties."
      );
      return `Governance-impact ${facts.label}: ${governanceFlow}`;
    }
    case "powerDynamics": {
      if (sectorKey === "ggz") {
        const powerFlow = describeFlow(
          "Bovenstroom: mandaat verschuift van behandeloverleg naar centrale zorgregie en het vrijmaken van capaciteit.",
          "Onderstroom: informele invloed richt zich op roostering, indicatiebesluiten en capaciteitsplanning; sabotagepatronen zitten in stille vertraging en burn-out-verhalen."
        );
        return `Machtsdynamiek GGZ: ${powerFlow}`;
      }
      const powerFlow = describeFlow(
        "Bovenstroom: macht schuift richting centrale besluitkracht en de governance-as wordt verscherpt.",
        "Onderstroom: informele invloed richt zich op planning, budget en het subtiel uitstellen van besluiten."
      );
      return `Machtsdynamiek ${facts.label}: ${powerFlow} Machtsverschuiving: ${facts.powerShift}.`;
    }
    case "executionRisk": {
      if (sectorKey === "ggz") {
        const executionFlow = describeFlow(
          "Bovenstroom: parallelle sturing op ambulantisering en klinische capaciteit zonder prioriteitshiërarchie is het faalrisico.",
          "Onderstroom: dubbel mandaat, burn-out-verhalen en vertraagde escalatie vormen blockers voor doorzetting."
        );
        return `Executierisico GGZ: ${executionFlow} ${facts.irreversible}.`;
      }
      const executionFlow = describeFlow(
        "Bovenstroom: parallelle prioritering van oud en nieuw beleid vormt het faalpunt.",
        "Onderstroom: dubbel mandaat en verborgen agenda's veroorzaken vertraagde escalaties en deadline-erosie."
      );
      return `Executierisico ${facts.label}: ${executionFlow} ${facts.irreversible}.`;
    }
    case "interventionPlan90D": {
      const planFlow = describeFlow(
        `Week 1-2: CEO en CFO gooien conflicterende dossiers dicht, publiceren owner, mandaat en KPI per prioriteit. Week 3-6: COO herverdeelt capaciteit, budget en besluitrechten; escalaties worden binnen 48 uur afgedwongen. Week 7-12: uitvoering wordt afgerekend op ${facts.kpi}; blokkades worden binnen zeven dagen gesloten of als verlies geboekt.`,
        "Onderstroom wordt gemonitord via lijnrapportages en dagelijkse afsluitingen die sabotagepatronen zichtbaar maken."
      );
      return `Interventieplan 90 dagen: ${planFlow}`;
    }
    case "decisionContract": {
      const contractFlow = describeFlow(
        "Bovenstroom: de Raad tekent een contract met keuze, KPI, tijdshorizon (14 dagen besluit, 30 dagen executiebewijs, 365 dagen structureel effect) en expliciet verlies.",
        "Onderstroom: CEO, CFO en boardsecretaris plaatsen handtekeningen, benoemen machtspartners en maken duidelijk dat verborgen agenda's geen ruimte krijgen."
      );
      return `Decision Contract: ${contractFlow} Expliciet verlies: ${facts.explicitLoss}.`;
    }
    case "narrative":
    default: {
      const narrativeFlow = describeFlow(
        `${template} schrijft de bovenstroom met cijfers, structuur en ${facts.loss30} als prijs voor uitstel.`,
        "Onderstroom draait om sabotage via vertraagde escalatie, burn-out-verhalen en behoud van oude mandaten."
      );
      if (sectorKey === "ggz") {
        return `GGZ/Jeugdzorg: ${ggzContext} ${narrativeFlow} Formele machtsverschuiving: ${facts.powerShift}. Expliciet verlies: ${facts.explicitLoss}. Irreversibiliteit: ${facts.irreversible}.`;
      }
      return `${facts.label}: ${narrativeFlow} Formele machtsverschuiving: ${facts.powerShift}. Expliciet verlies: ${facts.explicitLoss}. Irreversibiliteit: ${facts.irreversible}.`;
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

function concreteWeaknessScore(text: string): number {
  const source = sanitizeWhitespace(String(text || ""));
  if (!source) return 4;

  let score = hasForbiddenConcretePattern(source) ? 2 : 0;
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
  if (normalized.includes("kernconflict")) return "coreConflict";
  if (normalized.includes("trade")) return "tradeoffs";
  if (normalized.includes("opportunity")) return "opportunityCost";
  if (normalized.includes("governance")) return "governanceImpact";
  if (normalized.includes("machtsdynamiek") || normalized.includes("onderstroom")) {
    return "powerDynamics";
  }
  if (normalized.includes("executierisico")) return "executionRisk";
  if (normalized.includes("90") || normalized.includes("interventieplan")) {
    return "interventionPlan90D";
  }
  if (normalized.includes("decision contract")) return "decisionContract";

  return "narrative";
}

function concreteFallback(sectionKey: string, contextHint?: string): string {
  const fallback =
    buildSectorConcreteFallback(sectionKey, contextHint) ||
    DEFAULT_ASSUMPTIONS[sectionKey] ||
    DEFAULT_ASSUMPTIONS.narrative;
  const safeContext = sanitizeContextHint(contextHint);
  if (!safeContext || isMinimalOrVagueContext(contextHint)) return fallback;

  const contextSignal = `Contextsignaal: ${safeContext.slice(0, 180)}.`;
  const merged = `${fallback} ${contextSignal}`.trim();
  if (hasForbiddenConcretePattern(merged)) return fallback;
  return merged;
}

function concreteRepromptFallback(
  sectionKey: string,
  contextHint?: string,
  attempt = 1
): string {
  const fallback = sanitizeWhitespace(concreteFallback(sectionKey, contextHint));
  const boundedAttempt = Math.max(1, Math.min(attempt, MAX_CONCRETE_REPROMPT_ATTEMPTS));
  if (boundedAttempt >= MAX_CONCRETE_REPROMPT_ATTEMPTS) return fallback;
  return sanitizeWhitespace(
    `${fallback} Besluitvenster blijft 14 dagen; uitstel vergroot verlies en verkleint keuzevrijheid.`
  );
}

function buildSignatureFallbackOutput(
  sectionKey: string,
  contextHint?: string,
  residualScore = 0
): string {
  console.warn("Signature violation bypassed → fallback used", {
    sectionKey,
    residualScore,
  });
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
  const value = sanitizeSectionBody(sanitizeWhitespace(String(input || "")));
  const forceSectorFallback = isMinimalOrVagueContext(contextHint);
  if (forceSectorFallback) {
    const forced = sanitizeSectionBody(concreteFallback(sectionKey, contextHint));
    if (sectionKey === "narrative") {
      return buildSignatureFallbackOutput(sectionKey, contextHint, 0);
    }
    if (hasForbiddenConcretePattern(forced) || concreteWeaknessScore(forced) > 0) {
      return buildSignatureFallbackOutput(sectionKey, contextHint, 1);
    }
    return forced;
  }

  let candidate = value;

  for (let attempt = 1; attempt <= MAX_CONCRETE_REPROMPT_ATTEMPTS; attempt++) {
    if (candidate && concreteWeaknessScore(candidate) === 0) {
      break;
    }
    candidate = concreteRepromptFallback(sectionKey, contextHint, attempt);
  }

  if (concreteWeaknessScore(candidate) > 0) {
    candidate = concreteRepromptFallback(
      sectionKey,
      contextHint,
      MAX_CONCRETE_REPROMPT_ATTEMPTS
    );
  }

  const residualScore = concreteWeaknessScore(candidate);
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
      output[key] = enforceConcreteString(value, key, options?.contextHint);
    }

    const residual = Object.values(output).find(
      (value) => concreteWeaknessScore(value) > 0
    );
    if (!residual) {
      return output as T;
    }
  }

  const hardened: Record<string, string> = {};
  for (const key of Object.keys(input)) {
    hardened[key] = concreteRepromptFallback(
      key,
      options?.contextHint,
      MAX_CONCRETE_REPROMPT_ATTEMPTS
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
    return sanitizeSectionBody(plain);
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

  const merged = rewritten.join("\n\n").trim();
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
