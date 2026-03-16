import { detectBlindSpots } from "@/aurelius/blindspots/BlindSpotDetector";

export type BlindSpotNodeInput = {
  executiveThesis?: string;
  strategicOptions?: string[];
  sectorContext?: string | string[];
  facts?: string[];
  interventions?: string[];
  boardroomStressTest?: string;
  organizationName?: string;
};

export type BlindSpot = {
  title: string;
  insight: string;
  assumption: string;
  risk: string;
  boardQuestion: string;
};

export type BlindSpotNodeOutput = {
  blindSpots: BlindSpot[];
  block: string;
};

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function toList(value?: string | string[]): string[] {
  if (Array.isArray(value)) return value.map((item) => normalize(item)).filter(Boolean);
  return normalize(value)
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatBlock(blindSpots: BlindSpot[]): string {
  return blindSpots
    .map((item, index) =>
      [
        `Blinde vlek ${index + 1} — ${item.title}`,
        "INZICHT",
        item.insight,
        "ONDERLIGGENDE AANNAME",
        item.assumption,
        "WAAROM DIT GEVAARLIJK IS",
        item.risk,
        "BESTUURLIJKE TESTVRAAG",
        item.boardQuestion,
      ].join("\n")
    )
    .join("\n\n");
}

function hasSignal(source: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(source));
}

function dedupeBlindSpots(items: BlindSpot[]): BlindSpot[] {
  const seen = new Set<string>();
  const result: BlindSpot[] = [];
  for (const item of items) {
    const key = normalize(`${item.title} ${item.insight}`.toLowerCase());
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push({
      title: normalize(item.title),
      insight: normalize(item.insight),
      assumption: normalize(item.assumption),
      risk: normalize(item.risk),
      boardQuestion: normalize(item.boardQuestion),
    });
  }
  return result;
}

function generateFallbackBlindSpots(input: BlindSpotNodeInput): BlindSpot[] {
  const organization = normalize(input.organizationName) || "De organisatie";
  return [
    {
      title: "Contractstructuur boven activiteit",
      insight:
        `${organization} behandelt groei snel als uitvoeringsvraagstuk, terwijl contractruimte en financieringslogica vaak de echte grens zetten.`,
      assumption: "Meer activiteit of meer professionals vertaalt zich automatisch in meer effectieve capaciteit.",
      risk:
        "Als contractruimte of vergoedingsstructuur niet meebeweegt, stijgen kosten en druk sneller dan bestuurlijke ruimte.",
      boardQuestion: "Welke contract- of financieringsgrens maakt extra activiteit vandaag verlieslatend of bestuurlijk onhoudbaar?",
    },
    {
      title: "Positionering zonder scherpe keuze",
      insight:
        "De organisatie kan te breed geprofileerd blijven terwijl de markt of publieke opdrachtgever juist specialistische onderscheidingskracht beloont.",
      assumption: "Een breder aanbod vergroot de kans op vraag, contractering en continuiteit.",
      risk:
        "Zonder expliciete niche verliest de organisatie onderhandelingskracht, focus en uitvoerbaarheid tegenover grotere spelers.",
      boardQuestion: "Waarom zou een opdrachtgever of partner juist deze organisatie kiezen boven een grotere of meer gespecialiseerde aanbieder?",
    },
    {
      title: "Bestuurlijke inertie als verborgen kostenpost",
      insight:
        "Het grootste risico zit niet alleen in externe druk, maar in het uitblijven van scherpe prioritering wanneer spanning toeneemt.",
      assumption: "Tijd winnen en opties openhouden verlaagt bestuurlijk risico.",
      risk:
        "Als keuzes te laat expliciet worden gemaakt, stapelen werkdruk, frictie en kwaliteitsverlies zich sneller op dan herstelvermogen.",
      boardQuestion: "Welke keuze wordt nu vermeden omdat het bestuur de prijs van uitstel nog niet expliciet heeft gemaakt?",
    },
  ];
}

export function runBlindSpotNode(input: BlindSpotNodeInput): BlindSpotNodeOutput {
  const facts = toList(input.facts);
  const sectorContext = toList(input.sectorContext);
  const interventions = toList(input.interventions);
  const strategicOptions = toList(input.strategicOptions);
  const thesis = normalize(input.executiveThesis);
  const stress = normalize(input.boardroomStressTest);
  const source = [thesis, facts.join("\n"), sectorContext.join("\n"), interventions.join("\n"), strategicOptions.join("\n"), stress]
    .filter(Boolean)
    .join("\n\n");

  const detected = detectBlindSpots({
    contextText: [facts.join("\n"), sectorContext.join("\n")].filter(Boolean).join("\n\n"),
    memoryText: interventions.join("\n"),
    graphText: strategicOptions.join("\n"),
    hypothesisText: thesis,
    causalText: stress,
  });

  const mapped = detected.items.map((item) => ({
    title: item.blindSpot,
    insight: item.reality,
    assumption: item.whatOrgThinks,
    risk: item.risk,
    boardQuestion: `Waar testen we bestuurlijk of "${item.whatOrgThinks}" feitelijk klopt?`,
  }));

  const heuristicBlindSpots: BlindSpot[] = [];

  if (
    hasSignal(source, [
      /\bgemeente|gemeentelijke|contract|contractering|inkoop|tarief|budgetdruk|plafond/i,
      /\bjeugdzorg|jeugdwet|zorgverzekeraar/i,
    ])
  ) {
    heuristicBlindSpots.push({
      title: "Contractlogica vermomd als capaciteitsprobleem",
      insight:
        "De organisatie probeert druk te reduceren via capaciteit of extra activiteit, terwijl contractstructuur, plafonds of tariefdruk de echte grens zetten.",
      assumption: "Meer professionals of meer productie vertaalt zich direct in meer bestuurlijk houdbare capaciteit.",
      risk:
        "Als financiering en contractruimte niet meegroeien, neemt uitvoeringsdruk toe terwijl marge, onderhandelingskracht en teamstabiliteit verslechteren.",
      boardQuestion: "Wordt extra capaciteit daadwerkelijk vergoed en bestuurlijk gedragen binnen de huidige contractmix?",
    });
  }

  if (hasSignal(source, [/\bpersoneel|wachtdruk|caseload|werkdruk|retentie|administratieve druk|uitval/i])) {
    heuristicBlindSpots.push({
      title: "Personeel als schijnoplossing",
      insight:
        "De organisatie kan personeelskrapte als hoofdoorzaak behandelen terwijl coördinatie, administratieve belasting en instroomdiscipline de effectieve capaciteit sterker bepalen.",
      assumption: "Meer mensen verlagen automatisch wachtdruk en verhogen uitvoerbaarheid.",
      risk:
        "Bij een foutieve aanname groeit de coördinatielast sneller dan de productieve tijd, waardoor druk en kwaliteitsvariatie juist oplopen.",
      boardQuestion: "Welke proces- of bestuurlijke bottleneck blijft bestaan, zelfs als morgen extra professionals starten?",
    });
  }

  if (hasSignal(source, [/\bspecialisatie|positionering|breed|generalistisch|niche|onderscheid/i])) {
    heuristicBlindSpots.push({
      title: "Breedte zonder verdedigbare propositie",
      insight:
        "De organisatie kan breedte als marktkans zien, terwijl opdrachtgevers en partners juist kiezen voor expliciet onderscheidend profiel en bewezen focus.",
      assumption: "Een breder aanbod vergroot de kans op contracten, verwijzingen of groei.",
      risk:
        "Zonder scherpe positionering verdunt de propositie en verzwakt de organisatie tegenover grotere of specialistische spelers.",
      boardQuestion: "Wat is de reden dat een opdrachtgever, gemeente of partner juist deze organisatie kiest en niet een groter alternatief?",
    });
  }

  if (hasSignal(source, [/\bprioriteit|verbreding|consolideren|parallel|uitstel|inertie|governance/i])) {
    heuristicBlindSpots.push({
      title: "Parallelle prioriteiten maskeren besluitverlies",
      insight:
        "Het bestuur behandelt meerdere richtingen tegelijk als prudentie, terwijl parallelle prioriteiten in werkelijkheid executiekracht, eigenaarschap en stopdiscipline aantasten.",
      assumption: "Opties openhouden verlaagt risico zolang er nog geen definitieve keuze is gemaakt.",
      risk:
        "Als prioriteiten niet worden versmald, groeit bestuurlijke ruis sneller dan de organisatie onzekerheid kan absorberen.",
      boardQuestion: "Welke activiteit of verbreding stopt het bestuur deze maand expliciet om de gekozen richting bestuurlijk geloofwaardig te maken?",
    });
  }

  if (hasSignal(source, [/\bpartner|netwerk|samenwerking|ketenpartner|alliantie/i])) {
    heuristicBlindSpots.push({
      title: "Netwerkgroei zonder kwaliteitsrem",
      insight:
        "De organisatie kan netwerk- of partnergroei als risicoloze schaal zien, terwijl kwaliteitsborging, governance en besluitrechten dan juist kritischer worden.",
      assumption: "Samenwerking vergroot impact zonder dat de bestuurlijke complexiteit wezenlijk verandert.",
      risk:
        "Zonder harde kwaliteits- en escalatieregels verschuift schaalrisico van interne capaciteit naar partnerkwaliteit en reputatieschade.",
      boardQuestion: "Welke governancegrens bepaalt wanneer partnergroei waarde toevoegt en wanneer zij bestuurlijke controle ondermijnt?",
    });
  }

  const merged = dedupeBlindSpots([...heuristicBlindSpots, ...mapped]);
  const blindSpots = merged.length >= 3
    ? merged.slice(0, 5)
    : dedupeBlindSpots([...merged, ...generateFallbackBlindSpots(input)]).slice(0, 5);

  return {
    blindSpots,
    block: formatBlock(blindSpots),
  };
}
