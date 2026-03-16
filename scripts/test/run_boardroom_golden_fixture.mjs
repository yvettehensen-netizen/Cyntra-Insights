#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function parseSections(markdown) {
  const headingRe = /^###\s+(\d+)\.\s+(.+)$/gm;
  const matches = [...markdown.matchAll(headingRe)];
  return matches.map((m, i) => {
    const start = (m.index ?? 0) + m[0].length;
    const end = matches[i + 1]?.index ?? markdown.length;
    return {
      number: Number(m[1]),
      title: m[2].trim(),
      body: markdown.slice(start, end).trim(),
    };
  });
}

function countOccurrences(text, pattern) {
  const matches = text.match(pattern);
  return matches ? matches.length : 0;
}

function validateGoldenFixture(markdown) {
  const sections = parseSections(markdown);
  const requiredTitles = [
    'Dominante These',
    'Structurele Kernspanning',
    'Keerzijde van de keuze',
    'Financiële Onderbouwing',
    'Prijs van Uitstel',
    'Mandaatverschuiving',
    'Faalmechanisme',
    '90-Dagen Interventieontwerp',
    'Besluitkader',
  ];

  assert(sections.length === 9, `Expected 9 sections, got ${sections.length}`);
  for (let i = 0; i < requiredTitles.length; i += 1) {
    assert(
      sections[i].title === requiredTitles[i],
      `Section ${i + 1} must be '${requiredTitles[i]}', got '${sections[i].title}'`
    );
  }

  const financial = sections[3].body;
  const requiredFinancialLines = [
    /Gemiddelde kostprijs:\s*€\s?\d+/i,
    /ADHD-diagnostiek:\s*€\s?\d+/i,
    /Plafond per verzekeraar:\s*€\s?[\d.,]+/i,
    /Loonkosten stijgen met\s*\d+[,.]?\d*%/i,
    /Tarieven?\s*2026.*\d+[,.]?\d*%/i,
    /€202\.000 structurele druk/i,
    /druk per maand/i,
    /FTE behandelcapaciteit/i,
  ];
  for (const re of requiredFinancialLines) {
    assert(re.test(financial), `Financial block missing required line: ${re}`);
  }

  const interventions = sections[7].body;
  assert(/Maand 1/i.test(interventions), 'Intervention section missing Maand 1');
  assert(/Maand 2/i.test(interventions), 'Intervention section missing Maand 2');
  assert(/Maand 3/i.test(interventions), 'Intervention section missing Maand 3');

  const actionCount = countOccurrences(interventions, /Actie:/g);
  assert(actionCount === 6, `Expected exactly 6 interventions, got ${actionCount}`);

  const fields = [
    /Eigenaar:/g,
    /Deadline:/g,
    /KPI:/g,
    /Escalatiepad:/g,
    /Direct zichtbaar effect:/g,
    /Casus-anker:/g,
  ];
  for (const re of fields) {
    const count = countOccurrences(interventions, re);
    assert(count === 6, `Expected 6 occurrences for ${re}, got ${count}`);
  }

  assert(/Dag\s*30\s*meetpunt/i.test(interventions), 'Missing Day 30 meetpunt');
  assert(/Dag\s*60\s*meetpunt/i.test(interventions), 'Missing Day 60 meetpunt');
  assert(/Dag\s*90\s*meetpunt/i.test(interventions), 'Missing Day 90 meetpunt');

  const decisionContract = sections[8].body;
  assert(/1-PAGINA BESTUURLIJKE SAMENVATTING/i.test(decisionContract), 'Missing 1-PAGINA BESTUURLIJKE SAMENVATTING block');
  assert(/Besluit vandaag:/i.test(decisionContract), 'Missing Besluit vandaag');
  assert(/Voorkeursoptie:/i.test(decisionContract), 'Missing Voorkeursoptie');
  assert(/Expliciet verlies:/i.test(decisionContract), 'Missing Expliciet verlies');
  assert(/30\/60\/90 meetpunten:/i.test(decisionContract), 'Missing 30/60/90 meetpunten');
  assert(/Bij gemist meetpunt:/i.test(decisionContract), 'Missing meetpunt-breach consequence');
  assert(/Mandaatverschuiving:/i.test(decisionContract), 'Missing Mandaatverschuiving in memo');
  assert(/Na 90 dagen zonder volledige margekaart/i.test(decisionContract), 'Missing point of no return sentence');

  const weakWords = [
    /\bwellicht\b/i,
    /\bmogelijk\b/i,
    /\bhet lijkt\b/i,
    /\bzou kunnen\b/i,
    /\bwaarschijnlijk\b/i,
    /\bmen denkt\b/i,
  ];
  for (const re of weakWords) {
    assert(!re.test(markdown), `Weak language found: ${re}`);
  }

  assert(/Onderstroom \(Interpretatie\)/i.test(markdown), 'Missing Onderstroom (Interpretatie) label');
  assert(/Onderstroom \(Hypothese\)/i.test(markdown), 'Missing Onderstroom (Hypothese) label');
}

function validateGeneratorGuards(repoRoot) {
  const enforcePath = path.join(repoRoot, 'src/aurelius/narrative/guards/enforceConcreteOutput.ts');
  const dualLayerPath = path.join(repoRoot, 'src/aurelius/synthesis/dualLayer.ts');
  const interventionGatePath = path.join(repoRoot, 'src/aurelius/executive/gates/InterventionGates.ts');
  const hgbcoSpecPath = path.join(repoRoot, 'src/aurelius/narrative/guards/hgbcoMcKinseySpec.ts');
  const synthPath = path.join(repoRoot, 'src/aurelius/synthesis/synthesizeBoardroomBrief.ts');
  const narrativePath = path.join(repoRoot, 'src/aurelius/narrative/generateBoardroomNarrative.ts');
  const skeletonPath = path.join(repoRoot, 'src/aurelius/narrative/harden/buildStructuralSkeleton.ts');

  const enforceSrc = read(enforcePath);
  const dualSrc = read(dualLayerPath);
  const gateSrc = read(interventionGatePath);
  const hgbcoSrc = read(hgbcoSpecPath);
  const synthSrc = read(synthPath);
  const narrativeSrc = read(narrativePath);
  const skeletonSrc = read(skeletonPath);

  assert(enforceSrc.includes('Interventieplan 90 dagen (6 kerninterventies, causaal en afdwingbaar)'), 'Guard source missing 6-kerninterventies marker');
  assert(enforceSrc.includes('Financiële Onderbouwing (verplicht blok)'), 'Guard source missing mandatory financial block marker');
  assert(enforceSrc.includes('1-PAGINA BESTUURLIJKE SAMENVATTING'), 'Guard source missing bestuurlijke samenvatting marker');
  assert(dualSrc.includes('totale structurele druk = €202.000'), 'Dual layer source missing structural pressure formula marker');
  assert(gateSrc.includes('minder dan 6 kerninterventies'), 'Intervention gate still references old threshold');
  assert(gateSrc.includes('minimaal 2 interventies per maand (6 totaal)'), 'Intervention gate missing monthly 2 interventions rule');
  assert(
    hgbcoSrc.includes('autonome groei rekenkundig onmogelijk zonder margeherstel'),
    'HGBCO spec missing inevitability doctrine'
  );
  assert(
    hgbcoSrc.includes('geen marktrisico meer, maar een bestuurlijke keuze'),
    'HGBCO spec missing governance choice doctrine'
  );
  assert(
    hgbcoSrc.includes('vervalt het mandaat om nieuwe initiatieven te starten automatisch'),
    'HGBCO spec missing irreversible mandate doctrine'
  );
  assert(
    synthSrc.includes('behandelcontinuiteit, wachtlijst, behandeluitkomst en verwijzersvertrouwen'),
    'Synthesis prompt missing human impact translation'
  );
  assert(
    narrativeSrc.includes('behandelcontinuiteit, wachtlijst, behandeluitkomst en verwijzersvertrouwen'),
    'Narrative prompt missing human impact translation'
  );
  assert(
    skeletonSrc.includes('autonome groei rekenkundig onmogelijk zonder margeherstel'),
    'Structural skeleton missing inevitability anchor'
  );
}

function main() {
  const repoRoot = process.cwd();
  const fixturePath = path.join(repoRoot, 'scripts/test/fixtures/ggz_boardroom_elite.golden.md');
  const markdown = read(fixturePath);

  validateGoldenFixture(markdown);
  validateGeneratorGuards(repoRoot);

  console.log('boardroom golden fixture tests passed');
}

main();
