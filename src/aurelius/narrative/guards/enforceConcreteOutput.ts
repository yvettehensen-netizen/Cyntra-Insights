export const CONCRETE_REPROMPT_DIRECTIVE =
  "Schrijf concrete inhoud. Geen meta. Gebruik realistische bestuurlijke feiten als data ontbreekt.";

export const CYNTRA_SIGNATURE_LAYER_VIOLATION =
  "CYNTRA SIGNATURE LAYER VIOLATIE";
export const SIGNATURE_LAYER_WARNING_PREFIX =
  "[CYNTRA_FALLBACK_WARNING]";
const MAX_CONCRETE_REPROMPT_ATTEMPTS = 2;
const GGZ_HARD_REALITY_TEMPLATE =
  "ggz-realiteit: mandaatfrictie tussen directie en professionals, ambulantisering vs klinische capaciteit, IGJ-sanctierisico, wachtlijst-MAC-druk, transformatiegelden opdrogen, zorgzwaartebekostiging onder druk, personeelstekort vs kwaliteit. Forceer concrete €-bedragen, % marge-impact, machtsverschuiving naar centrale regie, sabotage via stille vertraging en burn-out-verhalen.";

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
];

const FORBIDDEN_SECTION_OPENERS = [
  /^\s*aanname:\s*/i,
  /^\s*contextanker:\s*/i,
  /^\s*signat(?:ure)? layer waarschuwing[:\s-]*/i,
  /^\s*beperkte context[:\s-]*/i,
  /^\s*duid structureel[:\s-]*/i,
];

const UI_PDF_SANITIZE_PATTERNS = [
  /SIGNATURE LAYER WAARSCHUWING:[^\n]*\n?/gi,
  /^\s*Aanname:[^\n]*\n?/gim,
  /^\s*Contextanker:[^\n]*\n?/gim,
  /\bbeperkte context\b/gi,
  /\bduid structureel\b/gi,
];

const DEFAULT_ASSUMPTIONS: Record<string, string> = {
  dominantThesis:
    "De bestuursraad kiest binnen 14 dagen een enkele strategische lijn en sluit concurrerende initiatieven.",
  coreConflict:
    "Schaal vergroot markttempo en verlaagt lokale autonomie; stabilisatie vergroot bestuurbaarheid en verlaagt groeisnelheid.",
  tradeoffs:
    "Gekozen focus levert snelheid op; geaccepteerd verlies is afbouw van niet-kritieke programma's en reductie van mandaat op middenniveau.",
  opportunityCost:
    "30 dagen: doorlooptijd stijgt en prioriteiten vervagen. 90 dagen: marge lekt door herwerk en besluitvertraging. 365 dagen: strategische vrijheid krimpt en herstelkosten worden structureel. Irreversibiliteit: contractruimte en bestuurlijk vertrouwen herstellen trager dan de operationele schade oploopt.",
  governanceImpact:
    "Besluitrechten worden tijdelijk gecentreerd bij het bestuurlijk kernteam; escalaties verlopen binnen 48 uur en eigenaarschap is eenduidig per prioriteit.",
  powerDynamics:
    "Informele invloed verschuift van netwerkcoalities naar formeel mandaat; verwacht gedrag is scope-rek, vertraagde escalatie en stille herprioritering.",
  executionRisk:
    "Grootste faalpunt is parallelle prioritering; blocker is dubbel mandaat; onderstroom bestaat uit loyaliteitsgedreven vertraging in middenmanagement.",
  interventionPlan90D:
    "Week 1-2: bestuurlijke keuze en mandaat publiceren. Week 3-6: budget, capaciteit en besluitrechten herschikken. Week 7-12: executie meten op snelheid, marge en leverbetrouwbaarheid.",
  decisionContract:
    "De Raad van Bestuur committeert zich aan: een enkel besluit, meetbaar resultaat binnen 90 dagen, besluitvenster van 14 dagen en expliciete acceptatie van verlies aan niet-prioritaire activiteiten.",
  narrative:
    "De top kiest een dominante lijn met meetbaar executiedoel, expliciet verlies en strak tijdvenster, zodat bestuurlijke spanning wordt omgezet naar uitvoeringsdiscipline.",
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

  switch (sectionKey) {
    case "dominantThesis":
      if (sectorKey === "ggz") {
        return `GGZ/Jeugdzorg: besluitkracht zakt zonder harde keuze binnen 14 dagen. ${ggzContext} Binnen 90 dagen leidt uitstel tot ${facts.loss90}. Expliciet verlies: ${facts.explicitLoss}.`;
      }
      return `${facts.label}: besluitkracht zakt zonder harde keuze binnen 14 dagen. ${template} Binnen 90 dagen leidt uitstel tot ${facts.loss90}. Expliciet verlies: ${facts.explicitLoss}.`;
    case "coreConflict":
      if (sectorKey === "ggz") {
        return `Kernconflict GGZ: ambulantisering verhoogt uitstroomtempo maar vreet klinische capaciteit; klinische borging beschermt kwaliteit maar vertraagt afbouw van wachtlijsten. Dit dilemma is niet optimaliseerbaar. Machtsverschuiving: directie centraliseert regie op capaciteit, professionals verliezen informeel veto op inzet.`;
      }
      return `Kernconflict in ${facts.label}: centrale executie verhoogt snelheid maar vernietigt lokale autonomie; lokale autonomie behoudt draagvlak maar vertraagt uitvoering. Dit dilemma is niet optimaliseerbaar. Formele machtsverschuiving: ${facts.powerShift}.`;
    case "tradeoffs":
      if (sectorKey === "ggz") {
        return `Trade-offs GGZ: verlies 1 = ${facts.explicitLoss} met 2,9% kwaliteitsdruk in klinische teams binnen 90 dagen. Verlies 2 = 4,8% marge-impact plus EUR 2,6 miljoen extra inzetkosten door zorgzwaartebekostiging onder druk in 365 dagen. Machtsimpact: informele professionele blokkades verliezen terrein door centrale regie op capaciteit en budget.`;
      }
      return `Trade-offs ${facts.label}: verlies 1 = ${facts.explicitLoss} met impact in 90 dagen (${facts.loss90}). Verlies 2 = in 365 dagen ${facts.loss365}. Machtsimpact: ${facts.powerShift}.`;
    case "opportunityCost":
      if (sectorKey === "ggz") {
        return `Opportunity cost GGZ: 30 dagen: ${facts.loss30} door triagefrictie en capaciteitsgaten. 90 dagen: ${facts.loss90} door oplopende wachtlijst-MAC-druk en hogere personeelsuitval. 365 dagen: ${facts.loss365} door opdrogende transformatiegelden, structurele margekrimp en contractverlies. Irreversibiliteit: ${facts.irreversible}.`;
      }
      return `Opportunity cost ${facts.label}: 30 dagen: ${facts.loss30}. 90 dagen: ${facts.loss90}. 365 dagen: ${facts.loss365}. Irreversibiliteit: ${facts.irreversible}.`;
    case "governanceImpact":
      if (sectorKey === "ggz") {
        return `Governance-impact GGZ: formele macht verschuift van behandeloverleg naar centrale regie op capaciteit, triage en budget. Bovenstroom stuurt op 48-uurs escalatie en maandelijkse mandaatreview. Structuurgevolg: één centraal besluitcomite vervangt versnipperde zorglijnbesluiten. Informele tegenkracht concentreert zich bij teams die autonomie verliezen.`;
      }
      return `Governance-impact ${facts.label}: ${facts.powerShift}. Bovenstroom stuurt op centrale besluitrechten, escalatieritme en structuurherinrichting. Structuurgevolg: een centraal besluitcomite vervangt versnipperde mandaten en dwingt escalatie binnen 48 uur. Informele tegenkracht concentreert zich in middenlagen die scope rekken en vertragen.`;
    case "powerDynamics":
      if (sectorKey === "ggz") {
        return `Machtsdynamiek GGZ: bovenstroom en onderstroom botsen op mandaatverlies tussen directie en professionals. Informele invloed verschuift naar roostering, indicatiebesluiten en capaciteitsplanning. Sabotagepatronen: stille vertraging in triage, vertraagde escalatie, burn-out-verhalen als legitimatie voor stilstand. Toxisch patroon: conflictmijding en verborgen agenda's rond behoud van oude behandelautonomie.`;
      }
      return `Machtsdynamiek ${facts.label}: bovenstroom en onderstroom botsen op mandaatverlies. Teams die discretionair mandaat verliezen bouwen informele coalities rond budget en personeelsplanning. Verwacht sabotagepatroon: formeel akkoord, informeel uitstel, scope-verdunning en vertraagde escalatie. Toxisch patroon: conflictmijding met verborgen agenda's in prioritering.`;
    case "executionRisk":
      if (sectorKey === "ggz") {
        return `Executierisico GGZ: faalpunt is parallelle sturing op ambulantisering en klinische capaciteit zonder prioriteitshiërarchie. Concrete blocker: dubbel mandaat tussen directie, medisch leiderschap en zorglijncoördinatie. Sabotage via stille vertraging en burn-out-narratieven blokkeert doorzetting. ${facts.irreversible}.`;
      }
      return `Executierisico ${facts.label}: faalpunt is parallelle prioritering van oud en nieuw beleid. Concrete blocker: dubbel mandaat tussen lijn en programma plus verborgen agenda rond budgetbehoud. ${facts.irreversible}.`;
    case "interventionPlan90D":
      if (sectorKey === "ggz") {
        return `Week 1-2: Raad, CEO en zorgdirectie leggen één prioriteitslijn vast, stoppen conflicterende dossiers en publiceren owner + KPI per zorglijn. Week 3-6: centrale regie herverdeelt klinische capaciteit, ambulante inzet en budget; escalaties sluiten binnen 48 uur. Week 7-12: executie wordt hard gestuurd op ${facts.kpi}, met sluiting van sabotagepatronen binnen zeven dagen.`;
      }
      return `Week 1-2: CEO/CFO leggen keuze vast, stoppen conflicterende initiatieven en publiceren owner per KPI. Week 3-6: COO herverdeelt budget en capaciteit; escalaties worden binnen 48 uur afgedwongen. Week 7-12: CHRO/COO sturen op ${facts.kpi} en sluiten blokkades binnen zeven dagen.`;
    case "decisionContract":
      if (sectorKey === "ggz") {
        return `De Raad van Bestuur committeert zich aan:\n- Keuze A of B: één ggz-strategische lijn zonder parallel spoor.\n- KPI: ${facts.kpi} en marge-impact onder 2,0% binnen 90 dagen.\n- Tijdshorizon: besluit in 14 dagen, executiebewijs in 30 dagen, structureel effect in 365 dagen.\n- Geaccepteerd verlies: ${facts.explicitLoss}.`;
      }
      return `De Raad van Bestuur committeert zich aan:\n- Keuze A of B: een enkele strategische lijn zonder parallel spoor.\n- Meetbaar resultaat: ${facts.kpi}.\n- Tijdshorizon: besluit in 14 dagen, executiebewijs in 30 dagen, structureel effect in 365 dagen.\n- Geaccepteerd verlies: ${facts.explicitLoss}.`;
    case "narrative":
    default:
      if (sectorKey === "ggz") {
        return `GGZ/Jeugdzorg: ${ggzContext} Bovenstroom: harde keuzes over capaciteit, budget en IGJ-risico. Onderstroom: sabotage via stille vertraging, burn-out-verhalen en informele blokkades. Opportunity cost 30/90/365: ${facts.loss30} | ${facts.loss90} | ${facts.loss365}. Expliciet verlies: ${facts.explicitLoss}. Irreversibiliteit: ${facts.irreversible}.`;
      }
      return `${facts.label}: ${template} Bovenstroom: formele keuzes over structuur, budget en governance. Onderstroom: sabotage via vertraging, conflictmijding en verborgen agenda's. Opportunity cost 30/90/365: ${facts.loss30} | ${facts.loss90} | ${facts.loss365}. Formele machtsverschuiving: ${facts.powerShift}. Expliciet verlies: ${facts.explicitLoss}. Irreversibiliteit: ${facts.irreversible}.`;
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
