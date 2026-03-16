export const CYNTRA_HEADINGS = [
  "### 1. DOMINANTE THESE",
  "### 2. KERNCONFLICT",
  "### 3. KEERZIJDE VAN DE KEUZE",
  "### 4. PRIJS VAN UITSTEL",
  "### 5. GOVERNANCE IMPACT",
  "### 6. MACHTSDYNAMIEK",
  "### 7. EXECUTIERISICO",
  "### 8. INTERVENTIEONTWERP",
  "### 9. BESLUITKADER",
] as const;

export function buildStructuralSkeleton(): string {
  return `${CYNTRA_HEADINGS[0]}

Omdat ... ontstaat ... en leidt dit tot ...
Menselijk effect: ... cliënten verliezen behandelcontinuïteit of komen op de wachtlijst, met impact op behandeluitkomst en verwijzersvertrouwen.
Onvermijdelijkheid: De combinatie van vaste tarieven, stijgende loonkosten en plafondcontracten maakt autonome groei rekenkundig onmogelijk zonder margeherstel.

${CYNTRA_HEADINGS[1]}

Omdat ... ontstaat ... en leidt dit tot ...
Dit conflict kan niet worden opgelost zonder verlies.

${CYNTRA_HEADINGS[2]}

Omdat ... ontstaat ... en leidt dit tot ...

${CYNTRA_HEADINGS[3]}

Omdat ... ontstaat ... en leidt dit tot ...
Binnen 30 dagen:
Binnen 90 dagen:
Binnen 365 dagen:

${CYNTRA_HEADINGS[4]}

Omdat ... ontstaat ... en leidt dit tot ...
Dan is het escalatiemoment geen marktrisico meer, maar een bestuurlijke keuze.

${CYNTRA_HEADINGS[5]}

Omdat ... ontstaat ... en leidt dit tot ...

${CYNTRA_HEADINGS[6]}

Omdat ... ontstaat ... en leidt dit tot ...

${CYNTRA_HEADINGS[7]}

MAAND 1 (dag 1-30): STABILISEREN EN KNOPEN DOORHAKKEN
Actie:
Eigenaar:
Deadline:
KPI:
Escalatiepad:
Effect organisatie:
Effect cliënt:
Direct zichtbaar effect:
Casus-anker:

MAAND 2 (dag 31-60): HERONTWERPEN EN HERALLOCEREN
Actie:
Eigenaar:
Deadline:
KPI:
Escalatiepad:
Effect organisatie:
Effect cliënt:
Direct zichtbaar effect:
Casus-anker:

MAAND 3 (dag 61-90): VERANKEREN EN CONTRACTEREN
Actie:
Eigenaar:
Deadline:
KPI:
Escalatiepad:
Effect organisatie:
Effect cliënt:
Direct zichtbaar effect:
Casus-anker:

1-PAGINA BESTUURLIJKE SAMENVATTING
Besluit vandaag:
Voorkeursoptie:
Expliciet verlies:
30/60/90 meetpunten:

${CYNTRA_HEADINGS[8]}

De Raad van Bestuur committeert zich aan:
Keuze:
Expliciet verlies:
Besluitrecht ligt bij:
Stoppen per direct:
Niet meer escaleren:
Maandelijkse KPI:
Failure trigger:
Point of no return:
Na dag 90 zonder volledige margekaart vervalt het mandaat om nieuwe initiatieven te starten automatisch, tenzij RvT schriftelijk herbevestigt.
Herijkingsmoment:
Dit betekent dat het bestuur nu moet kiezen voor ...`;
}
