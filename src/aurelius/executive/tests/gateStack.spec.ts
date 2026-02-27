import { validateExecutiveGateStack } from "@/aurelius/executive/ExecutiveGateStack";

const context = "CEO Anna en CFO Bas sturen intake en planning; wachttijd 30 dagen, KPI 12%, IGJ-druk en contractmacht.";

const sample = `### 1. DOMINANTE BESTUURLIJKE THESE
Omdat contractmacht verschuift ontstaat interne frictie en leidt dit tot verlies in tempo. Voor deze casus zijn CEO Anna en CFO Bas direct geraakt.

### 2. HET KERNCONFLICT
Omdat intake en planning niet in één mandaat vallen ontstaat dubbelsturing en leidt dit tot wachttijd op 30 dagen.

### 3. EXPLICIETE TRADE-OFFS
Omdat schaarste toeneemt ontstaat keuzeverlies en leidt dit tot expliciete stop-doing op parallelle initiatieven.

### 4. OPPORTUNITY COST
Omdat uitstel structureel wordt ontstaat dag 30 schade en leidt dit op dag 60 tot contractmachtverlies en op dag 90 tot onomkeerbare reputatieschade.

### 5. GOVERNANCE IMPACT
Omdat formele macht verschuift ontstaat duidelijk besluitrecht en leidt dit tot minder informele bypasses.

### 6. MACHTSDYNAMIEK & ONDERSTROOM
Omdat conflictmijding groeit ontstaat informele bypass en leidt dit tot vertraging in planning.

### 7. EXECUTIERISICO
Omdat halfbesluiten blijven ontstaan ontstaat terugval en leidt dit tot doorlooptijdverlies.

### 8. 90-DAGEN INTERVENTIEPLAN
MAAND 1 (dag 1–30): STABILISEREN EN KNOPEN DOORHAKKEN
Actie: IGJ-signaal vertalen naar intakepoorten.
Eigenaar: CEO
Deadline: Dag 10
KPI: Meetwijze op wachttijdtrend
Escalatiepad: CEO beslist binnen 48 uur
Direct zichtbaar effect: Binnen 7 dagen minder wachtrijfrictie

MAAND 2 (dag 31–60): HERONTWERPEN EN HERALLOCEREN
Actie: Contractmacht en planning koppelen in één ritme.
Eigenaar: CFO
Deadline: Dag 40
KPI: Meetwijze op contractdoorlooptijd
Escalatiepad: CFO beslist bij conflict
Direct zichtbaar effect: Binnen 7 dagen minder contractruis

MAAND 3 (dag 61–90): VERANKEREN EN CONTRACTEREN
Actie: Mandaat en dashboard formaliseren.
Eigenaar: COO
Deadline: Dag 80
KPI: Meetwijze op dashboard-adoptie
Escalatiepad: RvB beslist bij blokkade
Direct zichtbaar effect: Binnen 7 dagen stabieler besluitritme

Dag 30 gates: ja
Dag 60 gates: ja
Dag 90 gates: ja
BOVENSTROOM-DOELEN
ONDERSTROOM-DOELEN

### 9. DECISION CONTRACT
De Raad van Bestuur committeert zich aan:
Keuze: intakeprioriteit
Accepted loss: lokale autonomie tijdelijk lager
Besluitrecht ligt bij: CEO
Stoppen per direct: parallelle prioriteiten
Niet meer escaleren: buiten formele lijn
Maandelijkse KPI: wachttijdtrend
Failure trigger: twee gemiste gates
Point of no return: na dag 90 onomkeerbaar
Herijkingsmoment: maandelijkse boardreview`;

export function compileOnlyGateStackSpec(): void {
  try {
    validateExecutiveGateStack({ text: sample, context });
  } catch {
    // compile-only guard
  }
}
