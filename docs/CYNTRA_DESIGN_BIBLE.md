# Cyntra Design Bible

## Purpose

Cyntra rapporten en boardroom views moeten voelen als een executive memo, niet als een SaaS-dashboard.

Dit document borgt de visuele regels voor:

- portal rapportweergave
- PDF-export
- boardroom memo output

## Core Principle

AI rapport = boxes.

Boardroom rapport = typografie.

Cyntra kiest dus standaard voor:

- witruimte boven kaderwerk
- hiërarchie boven decoratie
- typografie boven cards
- accentlijnen boven panelen

## Visual Identity

### Primary Colors

- Cyntra Blue: `#0B1F3A`
- Gold: `#C6A461`
- Executive Grey: `#4A4A4A`
- Light Grey: `#F5F6F8`

### Font Direction

- UI/report web: `Manrope`
- display/headings: `Sora`
- PDF-safe fallback: `Helvetica`

## Typography

### Scale

- H1: 36px
- H2: 28px
- H3: 22px
- Body: 16px
- Meta/labels: 12px uppercase

### Rules

- Gebruik korte, harde titels.
- Maximaal 75 tekens per regel waar mogelijk.
- Gebruik geen lange tekstblokken zonder witruimte.
- Gebruik geen decoratieve fontwissels binnen het rapport.

## Layout Rules

### Sections

Elke sectie volgt dit ritme:

1. sectienummer
2. titel
3. subtiele horizontale lijn
4. content

### Spacing

- Sectieafstand: 48px
- Titel naar content: 16px
- Paragraafafstand: 12px
- PDF marge: 42pt
- Maximale contentbreedte: 900px

## Forbidden UI Patterns

Deze mogen niet rond paragrafen of gewone sectietekst:

- border boxes
- cards
- shadows
- rounded panels
- dashboard-achtige containers

## Allowed Emphasis

### Accent line only

Toegestaan voor:

- Boardroom summary
- Aanbevolen keuze
- Stopregel
- Killer insights
- Strategische blinde vlekken
- Strategische hefboompunten
- Bestuurlijk debat

Vorm:

- linker accentlijn
- eventueel zeer lichte achtergrond
- nooit een volledige rand rondom de hele paragraaf

## PDF Principles

### Cover

De cover bevat:

- `CYNTRA INSIGHTS`
- documenttitel
- organisatie
- sector
- datum
- tagline: `Strategisch besluitdocument voor directie en Raad van Toezicht`

### Summary Page

De eerste inhoudspagina bevat:

- Dominant risico
- Aanbevolen besluit
- Keerzijde van de keuze
- Stopregel

### Section Rendering

- geen boxed paragrafen
- wel subtiele sectielijnen
- highlights alleen met linker accentlijn
- printvriendelijk A4

## Report Modes

### Kort dossier

Doel:

- scanbaar in minder dan 30 seconden
- alleen besluitinformatie

### Volledig dossier

Doel:

- strategische diepgang
- scenario’s
- technische onderbouwing

## Writing Identity

Gebruik:

- dominante systeemfout
- bestuurlijke blinde vlek
- hefboombesluit
- keerzijde van de keuze

Vermijd:

- trade-off
- optimaliseren
- mogelijk
- generieke AI-labels

## Encoding Hygiene

De renderer moet ongewenste artefacten verwijderen zoals:

- `Ø=Ý`
- `Ø=ß`
- `&ª`
- replacement characters

## Governance

Wijzigingen aan rapportdesign moeten:

1. add-only zijn waar mogelijk
2. geen analyse-engine logica wijzigen
3. typecheck, build en regressies behouden
4. zowel UI als PDF consistent houden

## Source of Truth

Codebron:

- [cyntraDesignTokens.ts](/Users/yvettehensen/Desktop/Cyntra%20Insights/src/design/cyntraDesignTokens.ts)
- [reportDesignSystem.ts](/Users/yvettehensen/Desktop/Cyntra%20Insights/src/design/reportDesignSystem.ts)

Belangrijk:

`cyntraDesignTokens.ts` is de primaire bron van kleuren, typografie, spacing en layout.

Nieuwe report/presentatiecomponenten moeten eerst op deze designregels worden uitgelijnd voordat afwijkende lokale styling wordt toegevoegd.
