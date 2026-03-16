const PRESENTATION_TITLES: Record<string, string> = {
  "BESTUURLIJKE KERNSAMENVATTING": "Kernsamenvatting voor bestuur",
  "BESLUITVRAAG": "Besluitvraag",
  "KERNSTELLING VAN HET RAPPORT": "Kernstelling",
  "FEITENBASIS": "Feitenbasis",
  "KEUZERICHTINGEN": "Keuzerichtingen",
  "AANBEVOLEN KEUZE": "Voorgestelde keuze",
  "DOORBRAAKINZICHTEN": "Kerninzichten",
  "BESTUURLIJK ACTIEPLAN": "Bestuurlijke acties",
  "BESTUURLIJKE STRESSTEST": "Stressproef",
  "BESTUURLIJKE BLINDE VLEKKEN": "Blinde vlekken",
  "VROEGSIGNALERING": "Vroege signalen",
  "MOGELIJKE ONTWIKKELINGEN": "Scenario-overzicht",
  "OPEN STRATEGISCHE VRAGEN": "Open bestuursvragen",
  "BESLUITGEVOLGEN": "Gevolgen van het besluit",
  "STRATEGISCHE SPANNING": "Strategische spanning",
  "STRATEGISCHE SIGNALEN": "Signalen in de onderstroom",
  "STRATEGISCH PATROON": "Herkenbaar patroon",
  "STRATEGISCHE ERVARING": "Eerdere lessen",
  "PARADOX KWALITEITSCONTROLE": "Toets op scherpte",
  "ONGEMAKKELIJKE WAARHEID": "Wat niet langer ontweken kan worden",
  "BESTUURLIJK DEBAT": "Bestuurlijk debat",
  "STRATEGISCH NARRATIEF": "Bestuurlijk verhaal",
  "BOARD DECISION BRIEF": "Besluitbrief",
  "TECHNISCHE ANALYSE": "Uitvoerings- en kwaliteitsanalyse",
  "HGBCO VERHAALLIJN": "Bestuurlijke logica (HGBCO)",
  "HOE CYNTRA KAN HELPEN": "Waar Cyntra van betekenis kan zijn",
};

export function presentReportSectionTitle(title: string): string {
  const key = String(title || "").trim().toUpperCase();
  return PRESENTATION_TITLES[key] || title;
}
