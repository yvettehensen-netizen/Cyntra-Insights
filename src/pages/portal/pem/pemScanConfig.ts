import {
  Heart,
  Scale,
  Shield,
  Brain,
  Sparkles,
  Users,
  Compass,
  Zap,
  Target,
  TrendingUp,
  Workflow,
  Crown,
  Activity,
  AlertTriangle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type PemFieldType = "text" | "textarea" | "select" | "number";

export type PemFieldDefinition = {
  key: string;
  label: string;
  type: PemFieldType;
  placeholder?: string;
  options?: string[];
  minLength?: number;
  required?: boolean;
  rows?: number;
  min?: number;
  max?: number;
};

export type PemScanDefinition = {
  id: string;
  label: string;
  tagline: string;
  headline: string;
  description: string;
  badges: { icon: LucideIcon; text: string }[];
  mode: string;
  contextKey: string;
  storageKey: string;
  resultTitle: string;
  ctaIdle: string;
  ctaLoading: string;
  accent: keyof typeof ACCENT_STYLES;
  fields: PemFieldDefinition[];
};

export const ACCENT_STYLES = {
  teal: {
    accentText: "text-teal-300",
    accentTextStrong: "text-teal-200",
    accentBorder: "border-teal-400/40",
    button:
      "border border-teal-400/40 text-teal-200 hover:bg-teal-400 hover:text-black",
  },
  violet: {
    accentText: "text-violet-300",
    accentTextStrong: "text-violet-200",
    accentBorder: "border-violet-400/40",
    button:
      "border border-violet-400/40 text-violet-200 hover:bg-violet-400 hover:text-black",
  },
  amber: {
    accentText: "text-amber-300",
    accentTextStrong: "text-amber-200",
    accentBorder: "border-amber-400/40",
    button:
      "border border-amber-400/40 text-amber-200 hover:bg-amber-400 hover:text-black",
  },
  sky: {
    accentText: "text-sky-300",
    accentTextStrong: "text-sky-200",
    accentBorder: "border-sky-400/40",
    button:
      "border border-sky-400/40 text-sky-200 hover:bg-sky-400 hover:text-black",
  },
  emerald: {
    accentText: "text-emerald-300",
    accentTextStrong: "text-emerald-200",
    accentBorder: "border-emerald-400/40",
    button:
      "border border-emerald-400/40 text-emerald-200 hover:bg-emerald-400 hover:text-black",
  },
  orange: {
    accentText: "text-orange-300",
    accentTextStrong: "text-orange-200",
    accentBorder: "border-orange-400/40",
    button:
      "border border-orange-400/40 text-orange-200 hover:bg-orange-400 hover:text-black",
  },
  fuchsia: {
    accentText: "text-fuchsia-300",
    accentTextStrong: "text-fuchsia-200",
    accentBorder: "border-fuchsia-400/40",
    button:
      "border border-fuchsia-400/40 text-fuchsia-200 hover:bg-fuchsia-400 hover:text-black",
  },
  rose: {
    accentText: "text-rose-300",
    accentTextStrong: "text-rose-200",
    accentBorder: "border-rose-400/40",
    button:
      "border border-rose-400/40 text-rose-200 hover:bg-rose-400 hover:text-black",
  },
  lime: {
    accentText: "text-lime-300",
    accentTextStrong: "text-lime-200",
    accentBorder: "border-lime-400/40",
    button:
      "border border-lime-400/40 text-lime-200 hover:bg-lime-400 hover:text-black",
  },
  indigo: {
    accentText: "text-indigo-300",
    accentTextStrong: "text-indigo-200",
    accentBorder: "border-indigo-400/40",
    button:
      "border border-indigo-400/40 text-indigo-200 hover:bg-indigo-400 hover:text-black",
  },
} as const;

export const PEM_SCANS: PemScanDefinition[] = [
  {
    id: "vitalfit",
    label: "Cyntra VitalFit™ Organisatiescan",
    tagline: "Cyntra VitalFit™ — Organisatiescan",
    headline: "Employability zonder ruis. Relevantie die standhoudt.",
    description:
      "VitalFit herdefinieert employability vanuit persoonlijke relevantie. Je ziet waar economische waarde en betekenis samenvallen — en waar de mismatch bestuurlijke spanning creëert.",
    badges: [
      { icon: Heart, text: "Persoonlijke relevantie" },
      { icon: Scale, text: "Economische relevantie" },
      { icon: Shield, text: "VRR-analyse" },
    ],
    mode: "pem-vrr",
    contextKey: "pem_context",
    storageKey: "pem_vitalfit_report",
    resultTitle: "VitalFit™ Organisatiescan",
    ctaIdle: "Genereer VitalFit™ rapport",
    ctaLoading: "VitalFit™ analyse wordt gebouwd…",
    accent: "teal",
    fields: [
      {
        key: "currentRole",
        label: "Huidige rol / functie",
        type: "text",
        placeholder: "Senior Consultant, Product Owner, Founder",
        minLength: 5,
        required: true,
      },
      {
        key: "organisation",
        label: "Organisatie / sector",
        type: "text",
        placeholder: "Bedrijf, sector, context",
      },
      {
        key: "valuedSkills",
        label: "Wat wordt er nu van je gewaardeerd?",
        type: "textarea",
        placeholder: "Waar word je op afgerekend of beloond?",
        minLength: 20,
        required: true,
      },
      {
        key: "underutilizedTalents",
        label: "Wat blijft onderbenut of voelt niet als 'echt van jou'?",
        type: "textarea",
        placeholder: "Talenten, inzichten of rollen die weinig ruimte krijgen",
      },
      {
        key: "meaningInWork",
        label: "Wanneer ervaar je betekenis of flow in je werk?",
        type: "textarea",
        placeholder: "Beschrijf momenten waarop het werk echt klopt",
        minLength: 30,
        required: true,
      },
      {
        key: "biggestTension",
        label: "Wat is de grootste spanning die je nu voelt?",
        type: "textarea",
        placeholder: "Bijv. te weinig autonomie, waardering, richting",
        minLength: 20,
        required: true,
      },
      {
        key: "energySources",
        label: "Wat geeft je energie?",
        type: "text",
        placeholder: "Mensen, taken, omgevingen, waarden",
      },
      {
        key: "futureUncertainty",
        label: "Grootste onzekerheid over de toekomst",
        type: "text",
        placeholder: "Wat voelt kwetsbaar of instabiel?",
      },
    ],
  },
  {
    id: "identityfit",
    label: "Cyntra IdentityFit",
    tagline: "Cyntra IdentityFit — Imposter & Identity",
    headline: "Van onzichtbare twijfel naar erkende autoriteit",
    description:
      "IdentityFit benadert imposter-gevoelens als systeemsignaal. Je ziet waar erkenning ontbreekt, waar autoriteit verschuift en hoe je opnieuw eigenaarschap bouwt.",
    badges: [
      { icon: Brain, text: "Imposter signalen" },
      { icon: Shield, text: "Systemisch profiel" },
      { icon: Sparkles, text: "Herijking" },
    ],
    mode: "pem-imposter",
    contextKey: "imposter_context",
    storageKey: "pem_identityfit_report",
    resultTitle: "IdentityFit Profiel",
    ctaIdle: "Genereer IdentityFit rapport",
    ctaLoading: "IdentityFit analyse wordt gebouwd…",
    accent: "violet",
    fields: [
      {
        key: "currentRole",
        label: "Huidige rol / functie",
        type: "text",
        placeholder: "Bijv. Teamlead, Consultant, Manager",
        minLength: 5,
        required: true,
      },
      {
        key: "organisation",
        label: "Organisatie / context",
        type: "text",
        placeholder: "Bedrijf, sector, omgeving",
      },
      {
        key: "imposterThoughts",
        label: "Herken je gedachten als 'ik hoor hier niet thuis'?",
        type: "textarea",
        placeholder: "Beschrijf de stem of momenten waarop dit opkomt",
        minLength: 20,
        required: true,
      },
      {
        key: "triggerContexts",
        label: "Welke contexten versterken dit gevoel het meest?",
        type: "textarea",
        placeholder: "Bijv. boardroom, performance reviews, nieuwe teams",
        minLength: 20,
        required: true,
      },
      {
        key: "authorityHistory",
        label: "Hoe was je relatie met autoriteit en erkenning vroeger?",
        type: "textarea",
        placeholder: "Beschrijf kort je geschiedenis met erkenning",
      },
      {
        key: "recognitionMeaning",
        label: "Wat zou erkenning voor jou nu echt betekenen?",
        type: "textarea",
        placeholder: "Welke vorm van bevestiging voelt wél waar?",
        minLength: 20,
        required: true,
      },
      {
        key: "belongingTension",
        label: "Waar voel je nu het grootste belonging- of identiteitsgat?",
        type: "textarea",
        placeholder: "Wat ontbreekt er in aansluiting of veiligheid?",
      },
    ],
  },
  {
    id: "leaderfit",
    label: "Cyntra LeaderFit™ Leiderschapsscan",
    tagline: "Cyntra LeaderFit™ — Leiderschapsscan",
    headline: "Leiderschapsspanning → expliciet eigenaarschap",
    description:
      "LeaderFit maakt zichtbaar waar jouw leiderschap botst met het systeem. Het benoemt spanning, risico en de precieze herijking die nodig is.",
    badges: [
      { icon: Crown, text: "Leiderschapsmodus" },
      { icon: Compass, text: "Kompaspositie" },
      { icon: Shield, text: "VRR" },
    ],
    mode: "pem-leaderfit",
    contextKey: "pem_context",
    storageKey: "pem_leaderfit_report",
    resultTitle: "LeaderFit™ Leiderschapsscan",
    ctaIdle: "Genereer LeaderFit™ rapport",
    ctaLoading: "LeaderFit™ analyse wordt gebouwd…",
    accent: "amber",
    fields: [
      {
        key: "leadershipRole",
        label: "Hoe zou je je leiderschapsrol omschrijven?",
        type: "text",
        placeholder: "Bijv. MT-lid, CEO, Director, Teamlead",
        minLength: 5,
        required: true,
      },
      {
        key: "biggestTension",
        label: "Welke spanning voel je het sterkst in je leiderschap?",
        type: "textarea",
        placeholder: "Waar wringt het nu het meest?",
        minLength: 30,
        required: true,
      },
      {
        key: "valuesUnderPressure",
        label: "Welke kernwaarde staat nu het meest onder druk?",
        type: "textarea",
        placeholder: "Bijv. integriteit, menselijkheid, snelheid",
        minLength: 20,
        required: true,
      },
      {
        key: "lastCongruentMoment",
        label: "Wanneer voelde je je voor het laatst congruent als leider?",
        type: "textarea",
        placeholder: "Beschrijf een moment van echte alignment",
      },
      {
        key: "repeatingPattern",
        label: "Welk leiderschapspatroon herhaal je terwijl het niet klopt?",
        type: "textarea",
        placeholder: "Bijv. pleasen, controle, vermijden",
      },
      {
        key: "isolationLevel",
        label: "Hoe geïsoleerd voel je je in je rol? (0-10)",
        type: "number",
        min: 0,
        max: 10,
      },
      {
        key: "stalledDecision",
        label: "Welk belangrijk leiderschapsbesluit stel je uit?",
        type: "textarea",
        placeholder: "Waar zit de blokkade?",
      },
      {
        key: "futureFear",
        label: "Wat is je grootste onzekerheid voor de komende 12-24 maanden?",
        type: "textarea",
        placeholder: "Beschrijf de angst of het risico",
      },
    ],
  },
  {
    id: "teamfit",
    label: "Cyntra TeamFit™ Teamspanningsscan",
    tagline: "Cyntra TeamFit™ — Teamspanningsscan",
    headline: "Teamspanning zichtbaar maken zonder schuld",
    description:
      "TeamFit laat zien waar samenwerking stagneert, welke laag domineert en welke kleine verschuiving het team weer in beweging zet.",
    badges: [
      { icon: Users, text: "Teamdynamiek" },
      { icon: Activity, text: "Psychologisch" },
      { icon: Shield, text: "VRR" },
    ],
    mode: "pem-teamfit",
    contextKey: "pem_context",
    storageKey: "pem_teamfit_report",
    resultTitle: "TeamFit™ Teamspanningsscan",
    ctaIdle: "Genereer TeamFit™ rapport",
    ctaLoading: "TeamFit™ analyse wordt gebouwd…",
    accent: "sky",
    fields: [
      {
        key: "teamName",
        label: "Team of afdeling",
        type: "text",
        placeholder: "Bijv. Growth team, Operations, Product",
      },
      {
        key: "biggestTension",
        label: "Wat is de grootste spanning in dit team?",
        type: "textarea",
        placeholder: "Waar stokt het het meest?",
        minLength: 30,
        required: true,
      },
      {
        key: "dominantEmotion",
        label: "Dominante emotie in het team",
        type: "select",
        options: [
          "Frustratie",
          "Machteloosheid",
          "Eenzaamheid",
          "Cynisme",
          "Boosheid",
          "Leegte",
          "Angst",
          "Hoop",
        ],
      },
      {
        key: "lastSeenMoment",
        label: "Wanneer voelde je je echt gezien of veilig?",
        type: "textarea",
        placeholder: "Beschrijf het moment",
      },
      {
        key: "valueUnderPressure",
        label: "Welke waarde krijgt nu het minst ruimte?",
        type: "textarea",
        placeholder: "Bijv. autonomie, transparantie, verbinding",
        minLength: 20,
        required: true,
      },
      {
        key: "repeatingPattern",
        label: "Welk patroon herhaalt zich steeds?",
        type: "textarea",
        placeholder: "Bijv. micromanagement, conflict vermijden",
      },
      {
        key: "honestySafety",
        label: "Hoe veilig voelt het om eerlijk te zijn? (0-10)",
        type: "number",
        min: 0,
        max: 10,
      },
      {
        key: "stalledDecision",
        label: "Welk gesprek of besluit wordt uitgesteld?",
        type: "textarea",
        placeholder: "Wat blijft liggen?",
        minLength: 10,
        required: true,
      },
      {
        key: "desiredChange",
        label: "Wat zou nu al verlichting geven?",
        type: "textarea",
        placeholder: "Welke kleine verschuiving helpt?",
      },
    ],
  },
  {
    id: "culturefit",
    label: "Cyntra CultureFit",
    tagline: "Cyntra CultureFit — Organisatiecultuur",
    headline: "Van cultuurfrictie naar betekenisvolle correctie",
    description:
      "CultureFit benoemt waar de organisatie uit koers is geraakt, welke laag de cultuur spanning geeft en wat nodig is om congruentie te herstellen.",
    badges: [
      { icon: Sparkles, text: "Cultuurkompas" },
      { icon: Workflow, text: "Systemische laag" },
      { icon: Shield, text: "VRR" },
    ],
    mode: "pem-culturefit",
    contextKey: "pem_context",
    storageKey: "pem_culturefit_report",
    resultTitle: "CultureFit Profiel",
    ctaIdle: "Genereer CultureFit rapport",
    ctaLoading: "CultureFit analyse wordt gebouwd…",
    accent: "emerald",
    fields: [
      {
        key: "organisationContext",
        label: "Organisatie / context",
        type: "text",
        placeholder: "Bedrijf, sector, scale",
      },
      {
        key: "strongestTension",
        label: "Welke cultuurspanning voel je het sterkst?",
        type: "textarea",
        placeholder: "Waar zit de cultuurwrijving?",
        minLength: 30,
        required: true,
      },
      {
        key: "dominantEmotion",
        label: "Dominante emotie in de cultuur",
        type: "select",
        options: [
          "Cynisme",
          "Machteloosheid",
          "Angst",
          "Frustratie",
          "Leegte",
          "Hoop",
        ],
      },
      {
        key: "lastCongruentMoment",
        label: "Wanneer voelde de cultuur zich voor het laatst levend?",
        type: "textarea",
        placeholder: "Beschrijf kort het moment",
      },
      {
        key: "valueUnderPressure",
        label: "Welke oorspronkelijke waarde staat nu onder druk?",
        type: "textarea",
        placeholder: "Bijv. menselijkheid, vakmanschap, snelheid",
        minLength: 20,
        required: true,
      },
      {
        key: "repeatingPattern",
        label: "Welk patroon frustreert het meest?",
        type: "textarea",
        placeholder: "Bijv. vergadercultuur, blame, stilte",
      },
      {
        key: "honestySafety",
        label: "Hoe veilig voelt het om eerlijk te zijn? (0-10)",
        type: "number",
        min: 0,
        max: 10,
      },
      {
        key: "riskIfIgnored",
        label: "Wat dreigt er als dit blijft liggen?",
        type: "textarea",
        placeholder: "Beschrijf het risico",
        minLength: 10,
        required: true,
      },
      {
        key: "desiredShift",
        label: "Welke verschuiving zou al verlichting geven?",
        type: "textarea",
        placeholder: "Ritme, mandaat, beloning, structuur",
      },
    ],
  },
  {
    id: "changefit",
    label: "Cyntra ChangeFit",
    tagline: "Cyntra ChangeFit — Veranderkracht",
    headline: "Van veranderfrictie naar gerichte herijking",
    description:
      "ChangeFit toont waar het verandertraject kraakt, welke laag domineert en welke snelle herijking nodig is om momentum te herstellen.",
    badges: [
      { icon: Workflow, text: "Verandering" },
      { icon: AlertTriangle, text: "Risico" },
      { icon: Shield, text: "VRR" },
    ],
    mode: "pem-changefit",
    contextKey: "pem_context",
    storageKey: "pem_changefit_report",
    resultTitle: "ChangeFit Profiel",
    ctaIdle: "Genereer ChangeFit rapport",
    ctaLoading: "ChangeFit analyse wordt gebouwd…",
    accent: "orange",
    fields: [
      {
        key: "changeName",
        label: "Naam of thema van de verandering",
        type: "text",
        placeholder: "Bijv. digitalisering, reorganisatie",
      },
      {
        key: "biggestTension",
        label: "Welke spanning voel je het sterkst in het traject?",
        type: "textarea",
        placeholder: "Waar zit het meeste verzet of onrust?",
        minLength: 30,
        required: true,
      },
      {
        key: "dominantEmotion",
        label: "Dominante emotie rond de verandering",
        type: "select",
        options: [
          "Weerstand",
          "Cynisme",
          "Angst",
          "Vermoeidheid",
          "Onrust",
          "Hoop",
        ],
      },
      {
        key: "meaningScore",
        label: "Hoe betekenisvol voelt deze verandering? (0-10)",
        type: "number",
        min: 0,
        max: 10,
      },
      {
        key: "valueUnderPressure",
        label: "Welke waarde of behoefte krijgt nu te weinig ruimte?",
        type: "textarea",
        placeholder: "Bijv. duidelijkheid, veiligheid, tempo",
        minLength: 20,
        required: true,
      },
      {
        key: "repeatingPattern",
        label: "Welk patroon herhaalt zich steeds?",
        type: "textarea",
        placeholder: "Bijv. top-down besluiten, te weinig mandaat",
      },
      {
        key: "ownershipGap",
        label: "Waar ontbreekt eigenaarschap of mandaat?",
        type: "textarea",
        placeholder: "Wat wordt niet gedragen?",
      },
      {
        key: "biggestRisk",
        label: "Wat is het grootste risico als dit zo doorgaat?",
        type: "textarea",
        placeholder: "Beschrijf het risico",
        minLength: 10,
        required: true,
      },
      {
        key: "desiredShift",
        label: "Welke snelle verschuiving zou helpen?",
        type: "textarea",
        placeholder: "Ritme, scope, communicatie",
      },
    ],
  },
  {
    id: "growthfit",
    label: "Cyntra GrowthFit",
    tagline: "Cyntra GrowthFit — Commercial Growth",
    headline: "Van commerciële frictie naar duurzame tractie",
    description:
      "GrowthFit legt bloot waar commerciële energie weglekt, welke propositie uit koers raakt en welke decisions de groei blokkeren.",
    badges: [
      { icon: TrendingUp, text: "Commerciële tractie" },
      { icon: Target, text: "Waardepropositie" },
      { icon: Shield, text: "VRR" },
    ],
    mode: "pem-growthfit",
    contextKey: "pem_context",
    storageKey: "pem_growthfit_report",
    resultTitle: "GrowthFit Profiel",
    ctaIdle: "Genereer GrowthFit rapport",
    ctaLoading: "GrowthFit analyse wordt gebouwd…",
    accent: "fuchsia",
    fields: [
      {
        key: "companyStage",
        label: "Fase van commerciële groei",
        type: "select",
        options: [
          "Pre-product market fit",
          "Early traction",
          "Scaling revenue",
          "Mature growth",
          "Plateau / herpositionering",
        ],
      },
      {
        key: "biggestCommercialTension",
        label: "Wat is de grootste commerciële spanning?",
        type: "textarea",
        placeholder: "Waar stokt groei of conversie?",
        minLength: 30,
        required: true,
      },
      {
        key: "valuePropDrift",
        label: "Welke waardepropositie voelt niet meer congruent?",
        type: "textarea",
        placeholder: "Wat ooit werkte maar nu schuurt",
        minLength: 20,
        required: true,
      },
      {
        key: "dominantEmotion",
        label: "Dominante emotie in het commerciële team",
        type: "select",
        options: [
          "Frustratie",
          "Cynisme",
          "Targetdruk",
          "Machteloosheid",
          "Onrust",
          "Hoop",
        ],
      },
      {
        key: "incentiveConflict",
        label: "Welke prikkel of target staat haaks op wat klopt?",
        type: "textarea",
        placeholder: "Waar botst incentive met realiteit?",
      },
      {
        key: "stalledDecision",
        label: "Welk commercieel besluit wordt uitgesteld?",
        type: "textarea",
        placeholder: "Pricing, segment, kanaal, pakket",
        minLength: 10,
        required: true,
      },
      {
        key: "biggestRisk",
        label: "Grootste risico als dit blijft liggen",
        type: "textarea",
        placeholder: "Churn, prijsdruk, reputatie",
      },
      {
        key: "quickShift",
        label: "Welke kleine aanpassing geeft snel meer flow?",
        type: "textarea",
        placeholder: "Propositie, proces, ritme",
      },
    ],
  },
  {
    id: "salesfit",
    label: "Cyntra SalesFit",
    tagline: "Cyntra SalesFit — Sales Alignment",
    headline: "Van sales-spanning naar coherente go-to-market",
    description:
      "SalesFit analyseert waar alignment tussen sales, marketing en product breekt en welke structurele correcties nodig zijn.",
    badges: [
      { icon: Target, text: "Alignment" },
      { icon: Users, text: "Samenwerking" },
      { icon: Shield, text: "VRR" },
    ],
    mode: "pem-salesfit",
    contextKey: "pem_context",
    storageKey: "pem_salesfit_report",
    resultTitle: "SalesFit Profiel",
    ctaIdle: "Genereer SalesFit rapport",
    ctaLoading: "SalesFit analyse wordt gebouwd…",
    accent: "rose",
    fields: [
      {
        key: "alignmentTension",
        label: "Wat is de grootste alignment-spanning?",
        type: "textarea",
        placeholder: "Waar lopen sales en marketing uit elkaar?",
        minLength: 30,
        required: true,
      },
      {
        key: "dominantEmotion",
        label: "Dominante emotie in het commerciële team",
        type: "select",
        options: [
          "Frustratie",
          "Machteloosheid",
          "Cynisme",
          "Boosheid",
          "Wantrouwen",
          "Hoop",
        ],
      },
      {
        key: "valueUnderPressure",
        label: "Welke prioriteit krijgt te weinig ruimte?",
        type: "textarea",
        placeholder: "Bijv. kwaliteit leads, klantwaarde",
        minLength: 20,
        required: true,
      },
      {
        key: "repeatingPattern",
        label: "Welk patroon herhaalt zich steeds?",
        type: "textarea",
        placeholder: "Bijv. blame-game, slechte hand-off",
      },
      {
        key: "lastAlignedMoment",
        label: "Wanneer was de laatste echte alignment?",
        type: "textarea",
        placeholder: "Beschrijf een moment dat werkte",
      },
      {
        key: "honestySafety",
        label: "Hoe veilig voelt het om eerlijk te zijn? (0-10)",
        type: "number",
        min: 0,
        max: 10,
      },
      {
        key: "stalledDecision",
        label: "Welk commercieel besluit wordt uitgesteld?",
        type: "textarea",
        placeholder: "Pricing, segment, incentive",
        minLength: 10,
        required: true,
      },
      {
        key: "desiredChange",
        label: "Wat zou direct verlichting geven?",
        type: "textarea",
        placeholder: "Welke kleine correctie helpt?",
      },
    ],
  },
  {
    id: "successfit",
    label: "Cyntra SuccessFit",
    tagline: "Cyntra SuccessFit — Customer Success",
    headline: "Van klantspanning naar duurzame waarde",
    description:
      "SuccessFit maakt zichtbaar waar klantwaarde stokt, waar churn ontstaat en welke systemische ingrepen nodig zijn.",
    badges: [
      { icon: Heart, text: "Customer value" },
      { icon: Shield, text: "Retention" },
      { icon: Sparkles, text: "Herstel" },
    ],
    mode: "pem-successfit",
    contextKey: "pem_context",
    storageKey: "pem_successfit_report",
    resultTitle: "SuccessFit Profiel",
    ctaIdle: "Genereer SuccessFit rapport",
    ctaLoading: "SuccessFit analyse wordt gebouwd…",
    accent: "lime",
    fields: [
      {
        key: "csTension",
        label: "Welke spanning voel je in Customer Success?",
        type: "textarea",
        placeholder: "Brandjes blussen, churn, gebrek aan mandaat",
        minLength: 30,
        required: true,
      },
      {
        key: "dominantEmotion",
        label: "Dominante emotie in het CS-team",
        type: "select",
        options: [
          "Machteloosheid",
          "Frustratie",
          "Cynisme",
          "Trots",
          "Leegte",
          "Hoop",
        ],
      },
      {
        key: "neglectedNeed",
        label: "Welke klantbehoefte krijgt te weinig ruimte?",
        type: "textarea",
        placeholder: "Waar schiet het proces tekort?",
        minLength: 20,
        required: true,
      },
      {
        key: "lastImpactMoment",
        label: "Wanneer voelde je echt impact op klantwaarde?",
        type: "textarea",
        placeholder: "Beschrijf kort het moment",
      },
      {
        key: "churnPattern",
        label: "Welk patroon zie je bij churn of retentie?",
        type: "textarea",
        placeholder: "Waar haakt de klant af?",
      },
      {
        key: "honestySafety",
        label: "Hoe veilig voelt het om eerlijk te zijn? (0-10)",
        type: "number",
        min: 0,
        max: 10,
      },
      {
        key: "stalledDecision",
        label: "Welk CS-besluit wordt uitgesteld?",
        type: "textarea",
        placeholder: "Renewal, escalatie, segment",
        minLength: 10,
        required: true,
      },
      {
        key: "desiredChange",
        label: "Welke verschuiving geeft direct meer energie?",
        type: "textarea",
        placeholder: "Proces, ritme, feedback-loop",
      },
    ],
  },
  {
    id: "productfit",
    label: "Cyntra ProductFit",
    tagline: "Cyntra ProductFit — Product Compass",
    headline: "Van productspanning naar scherpe prioritering",
    description:
      "ProductFit brengt scherpte in roadmap, discovery en alignment. Het toont waar het product-systeem uit koers raakt.",
    badges: [
      { icon: Target, text: "Prioritering" },
      { icon: Sparkles, text: "Discovery" },
      { icon: Shield, text: "VRR" },
    ],
    mode: "pem-productfit",
    contextKey: "pem_context",
    storageKey: "pem_productfit_report",
    resultTitle: "ProductFit Profiel",
    ctaIdle: "Genereer ProductFit rapport",
    ctaLoading: "ProductFit analyse wordt gebouwd…",
    accent: "indigo",
    fields: [
      {
        key: "currentRole",
        label: "Huidige rol",
        type: "text",
        placeholder: "Product Manager, Head of Product, CPO",
        minLength: 5,
        required: true,
      },
      {
        key: "productArea",
        label: "Product / productgebied",
        type: "text",
        placeholder: "Bijv. Core Platform, Mobile App",
      },
      {
        key: "biggestTension",
        label: "Wat is nu de grootste productspanning?",
        type: "textarea",
        placeholder: "Scope-creep, stakeholderdruk, gebrek aan discovery",
        minLength: 40,
        required: true,
      },
      {
        key: "emotionDominant",
        label: "Dominante emotie in het productteam",
        type: "select",
        options: [
          "Machteloosheid",
          "Frustratie",
          "Cynisme",
          "Stress",
          "Leegte",
          "Trots",
        ],
      },
      {
        key: "valueUnderPressure",
        label: "Welke klantwaarde krijgt te weinig ruimte?",
        type: "textarea",
        placeholder: "Wat wordt structureel ondergeprioriteerd?",
        minLength: 20,
        required: true,
      },
      {
        key: "lastImpactMoment",
        label: "Wanneer voelde je laatst echte impact?",
        type: "textarea",
        placeholder: "Beschrijf kort het moment",
      },
      {
        key: "repeatingPattern",
        label: "Welk patroon herhaalt zich steeds?",
        type: "textarea",
        placeholder: "Bijv. te laat valideren, politieke roadmap",
      },
      {
        key: "safetyHonesty",
        label: "Hoe veilig voelt het om eerlijk te zijn? (0-10)",
        type: "number",
        min: 0,
        max: 10,
      },
      {
        key: "stalledDecision",
        label: "Welk product-besluit wordt uitgesteld?",
        type: "textarea",
        placeholder: "Kill decision, pricing, focus",
        minLength: 10,
        required: true,
      },
      {
        key: "desiredChange",
        label: "Wat zou nu al verlichting geven?",
        type: "textarea",
        placeholder: "Welke verschuiving helpt?",
      },
    ],
  },
];

export const CORE_PEM_FITS = ["vitalfit", "leaderfit", "teamfit"] as const;

export function isCoreFit(id?: string | null) {
  if (!id) return false;
  return CORE_PEM_FITS.includes(id as (typeof CORE_PEM_FITS)[number]);
}

export function getPemScanById(id?: string) {
  if (!id) return null;
  return PEM_SCANS.find((scan) => scan.id === id) ?? null;
}
