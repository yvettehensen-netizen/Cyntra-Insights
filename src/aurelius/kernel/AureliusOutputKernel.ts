export type BoardSlot =
  | "dominantThese"
  | "coreConflict"
  | "tradeOff"
  | "costOfDelay"
  | "governance"
  | "power"
  | "executionRisk"
  | "interventionPlan"
  | "decisionContract";

export type BoardKernel = Record<BoardSlot, string>;

export function createEmptyKernel(): BoardKernel {
  return {
    dominantThese: "",
    coreConflict: "",
    tradeOff: "",
    costOfDelay: "",
    governance: "",
    power: "",
    executionRisk: "",
    interventionPlan: "",
    decisionContract: "",
  };
}

export function fillSlot(kernel: BoardKernel, slot: BoardSlot, content: string): void {
  if (kernel[slot] !== "") {
    throw new Error(`Kernel v3: Slot ${slot} al gevuld.`);
  }
  kernel[slot] = String(content ?? "").trim();
}

function stableHash(input: string): string {
  let hash = 5381;
  const source = String(input ?? "");
  for (let i = 0; i < source.length; i += 1) {
    hash = ((hash << 5) + hash) ^ source.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}

export function validateKernel(kernel: BoardKernel): void {
  const values = Object.values(kernel);

  if (values.some((value) => !String(value ?? "").trim())) {
    throw new Error("Kernel v3: Onvolledig — niet alle 9 secties gevuld.");
  }

  for (const section of values) {
    const matches = section.match(/Kernzin:/g);
    if (matches && matches.length > 1) {
      throw new Error("Kernel v3: Dubbele Kernzin gedetecteerd.");
    }
  }

  for (const section of values) {
    if (!/[.!?]\s*$/.test(String(section ?? "").trim())) {
      throw new Error("Kernel v3: Afgeknotte zin gedetecteerd.");
    }
  }

  const hashes = values.map((value) => stableHash(value));
  if (new Set(hashes).size !== hashes.length) {
    throw new Error("Kernel v3: Dubbele sectie-inhoud gedetecteerd.");
  }
}

export function assembleBoard(kernel: BoardKernel): string {
  validateKernel(kernel);
  Object.freeze(kernel);

  return `
1. Dominante These
${kernel.dominantThese}

2. Structurele Kernspanning
${kernel.coreConflict}

3. Keerzijde van de keuze
${kernel.tradeOff}

4. De Prijs van Uitstel
${kernel.costOfDelay}

5. Mandaat & Besluitrecht
${kernel.governance}

6. Onderstroom & Informele Macht
${kernel.power}

7. Faalmechanisme
${kernel.executionRisk}

8. 90-Dagen Interventieontwerp
${kernel.interventionPlan}

9. Besluitkader
${kernel.decisionContract}
`.trim();
}
