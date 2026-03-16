import type { StrategicLeverInsight } from "@/aurelius/strategy/StrategicLeverDetector";

export const DNA_ARCHETYPES = [
  "professional partnership",
  "scale operator",
  "platform ecosystem",
  "network orchestrator",
  "innovation driven",
  "mission institution",
  "capital allocator",
  "hybrid organization",
] as const;

export type StrategyDNAArchetype = (typeof DNA_ARCHETYPES)[number];

export type DNAArchetypeDefinition = {
  archetype: StrategyDNAArchetype;
  patterns: RegExp[];
  preferredLevers: StrategicLeverInsight["lever"][];
  coreMechanism: string;
  growthModel: string;
  strategicRisk: string;
  strategyPreference: string;
};

export const DNA_ARCHETYPE_MATRIX: DNAArchetypeDefinition[] = [
  {
    archetype: "professional partnership",
    patterns: [/\bexpertise\b/i, /\bprofessionals?\b/i, /\bpartners?\b/i, /\bcultuur\b/i, /\beigenaarschap\b/i],
    preferredLevers: ["cultuur", "talentstrategie", "leiderschap", "governance"],
    coreMechanism: "Waardecreatie loopt via expertise, professionele autonomie en culturele samenhang.",
    growthModel: "Groeien via zorgvuldige replicatie van teams, partners en methodiek.",
    strategicRisk: "Cultuurverlies of kwaliteitsverlies zodra groei sneller gaat dan sociale borging.",
    strategyPreference: "Partnerschappen, kwaliteitskaders en selectieve schaal.",
  },
  {
    archetype: "scale operator",
    patterns: [/\bvolume\b/i, /\boperatie\b/i, /\bthroughput\b/i, /\bcapaciteit\b/i, /\befficiency\b/i],
    preferredLevers: ["volumegroei", "productiviteit", "capaciteitsbenutting", "procesoptimalisatie"],
    coreMechanism: "Waarde ontstaat door consistente uitvoering op schaal met voorspelbare throughput.",
    growthModel: "Interne opschaling via capaciteit, standaardisatie en benuttingsverbetering.",
    strategicRisk: "Lineaire groei trekt kosten, werkdruk en kwaliteitsvariatie harder op dan verwacht.",
    strategyPreference: "Capaciteitssturing, procesdiscipline en schaalbare operatie.",
  },
  {
    archetype: "platform ecosystem",
    patterns: [/\bplatform\b/i, /\becosysteem\b/i, /\bknooppunt\b/i, /\bcoalitie\b/i],
    preferredLevers: ["ecosystemen", "distributiemacht", "data-infrastructuur", "governance"],
    coreMechanism: "Waardecreatie ontstaat doordat de organisatie een coördinerend platform in een breder ecosysteem wordt.",
    growthModel: "Groeien via meer deelnemers, betere koppelingen en hogere netwerkdichtheid.",
    strategicRisk: "Diffuse governance en rolonduidelijkheid kunnen het platform politiek en operationeel verzwakken.",
    strategyPreference: "Ecosysteemregie, standaardinterfaces en scherp mandaat.",
  },
  {
    archetype: "network orchestrator",
    patterns: [/\bnetwerk\b/i, /\bpartner\b/i, /\blicentie\b/i, /\borchestr/i, /\bsamenwerking\b/i],
    preferredLevers: ["netwerkstrategieën", "governance", "positionering", "besluitritme"],
    coreMechanism: "Impact groeit doordat partners hetzelfde model uitvoeren binnen een bestuurlijk kader.",
    growthModel: "Netwerkreplicatie via partners, licenties en kwaliteitsborging.",
    strategicRisk: "Partnergroei kan sneller gaan dan kwaliteitscontrole en governance aankunnen.",
    strategyPreference: "Partnerselectie, audits en expliciete escalatieregels.",
  },
  {
    archetype: "innovation driven",
    patterns: [/\binnovatie\b/i, /\br&d\b/i, /\bexperiment\b/i, /\bnieuw model\b/i],
    preferredLevers: ["data-infrastructuur", "automatisering", "positionering", "leiderschap"],
    coreMechanism: "Waarde ontstaat uit het ontwikkelen en sneller commercialiseren van nieuwe oplossingen.",
    growthModel: "Groeien via portfolio-innovatie, leercycli en vroege schaalvalidatie.",
    strategicRisk: "Te veel experimenten zonder prioriteit verzwakken executie en rendement.",
    strategyPreference: "Portfoliofocus, testdiscipline en beschermde innovatieruimte.",
  },
  {
    archetype: "mission institution",
    patterns: [/\bmaatschappelijk\b/i, /\bmissie\b/i, /\bpubliek\b/i, /\bbeleid\b/i, /\binstitutioneel\b/i],
    preferredLevers: ["governance", "merkautoriteit", "ecosystemen", "besluitritme"],
    coreMechanism: "Waardecreatie komt uit legitimiteit, publieke impact en institutionele verankering.",
    growthModel: "Groeien via beleidsadoptie, legitimiteit en regionale of publieke spreiding.",
    strategicRisk: "Missiedruk kan strategie diffuus maken en economische discipline verzwakken.",
    strategyPreference: "Beleidsinvloed, institutionele coalities en bestuurlijke legitimiteit.",
  },
  {
    archetype: "capital allocator",
    patterns: [/\bkapitaal\b/i, /\binvestering\b/i, /\bportfolio\b/i, /\brendement\b/i, /\ballocatie\b/i],
    preferredLevers: ["kapitaalallocatie", "investeringsdiscipline", "margeverbetering", "schaalvoordelen"],
    coreMechanism: "Waarde ontstaat doordat middelen sneller naar de best renderende strategische paden gaan.",
    growthModel: "Groeien via scherpe allocatie, stopbesluiten en rendementsgedreven schaal.",
    strategicRisk: "Financiële rationaliteit kan strategische samenhang of cultuur ondergraven.",
    strategyPreference: "Portfoliosturing, investeringskaders en harde stopregels.",
  },
  {
    archetype: "hybrid organization",
    patterns: [/\bhybride\b/i, /\bcombinatie\b/i, /\bdubbel\b/i, /\bmix\b/i],
    preferredLevers: ["governance", "cultuur", "positionering", "besluitritme"],
    coreMechanism: "Waardecreatie komt uit het combineren van meerdere logica's zonder bestuurlijke fragmentatie.",
    growthModel: "Groeien via gefaseerde combinatie van interne schaal, partners en selectieve innovatie.",
    strategicRisk: "Rolconflicten en prioriteitsstrijd maken het model bestuurlijk instabiel.",
    strategyPreference: "Heldere ontwerpkeuzes, governance-scheiding en besluitdiscipline.",
  },
];
