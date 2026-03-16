export type SlotId =
  | "dominanteThese"
  | "kernspanning"
  | "keerzijde"
  | "prijsUitstel"
  | "mandaat"
  | "onderstroom"
  | "faalmechanisme"
  | "interventie"
  | "besluitkader";

interface SlotState {
  content: string | null;
  locked: boolean;
  hash: string | null;
}

type KernelStateSnapshot = {
  frozen: boolean;
  complete: boolean;
};

const SLOT_ORDER: SlotId[] = [
  "dominanteThese",
  "kernspanning",
  "keerzijde",
  "prijsUitstel",
  "mandaat",
  "onderstroom",
  "faalmechanisme",
  "interventie",
  "besluitkader",
];

function normalizeContent(value: string): string {
  return String(value ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Deterministic SHA-256 implementation (sync, no Node crypto dependency).
function sha256(input: string): string {
  function rightRotate(value: number, amount: number): number {
    return (value >>> amount) | (value << (32 - amount));
  }
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let result = "";
  const words: number[] = [];
  const asciiBitLength = input.length * 8;
  let hash = (sha256 as unknown as { _hash?: number[] })._hash;
  let k = (sha256 as unknown as { _k?: number[] })._k;
  let primeCounter = k ? k.length : 0;

  if (!hash || !k) {
    hash = [];
    k = [];
    const isComposite: Record<number, boolean> = {};
    for (let candidate = 2; primeCounter < 64; candidate += 1) {
      if (!isComposite[candidate]) {
        for (let i = 0; i < 313; i += candidate) isComposite[i] = true;
        hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
        k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      }
    }
    (sha256 as unknown as { _hash?: number[] })._hash = hash;
    (sha256 as unknown as { _k?: number[] })._k = k;
  }

  input += "\x80";
  while ((input.length % 64) - 56) input += "\x00";
  for (let i = 0; i < input.length; i += 1) {
    const j = input.charCodeAt(i);
    words[i >> 2] |= j << (((3 - i) % 4) * 8);
  }
  words[words.length] = (asciiBitLength / maxWord) | 0;
  words[words.length] = asciiBitLength;

  for (let j = 0; j < words.length; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash.slice(0);
    for (let i = 0; i < 64; i += 1) {
      const w15 = w[i - 15];
      const w2 = w[i - 2];
      const a: number = hash[0];
      const e: number = hash[4];
      const temp1: number =
        hash[7] +
        (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
        ((e & hash[5]) ^ (~e & hash[6])) +
        k[i] +
        (w[i] =
          i < 16
            ? w[i]
            : (w[i - 16] +
                (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
                w[i - 7] +
                (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) |
              0);
      const temp2: number =
        (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
        ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
      hash.pop();
    }
    for (let i = 0; i < 8; i += 1) hash[i] = (hash[i] + oldHash[i]) | 0;
  }

  for (let i = 0; i < 8; i += 1) {
    for (let j = 3; j + 1; j -= 1) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? "0" : "") + b.toString(16);
    }
  }
  return result;
}

export class AureliusSlotKernelV4 {
  private static latestState: KernelStateSnapshot = {
    frozen: false,
    complete: false,
  };

  private slots: Record<SlotId, SlotState>;
  private frozen = false;
  private readonly hashIndex = new Set<string>();

  constructor() {
    this.slots = {
      dominanteThese: { content: null, locked: false, hash: null },
      kernspanning: { content: null, locked: false, hash: null },
      keerzijde: { content: null, locked: false, hash: null },
      prijsUitstel: { content: null, locked: false, hash: null },
      mandaat: { content: null, locked: false, hash: null },
      onderstroom: { content: null, locked: false, hash: null },
      faalmechanisme: { content: null, locked: false, hash: null },
      interventie: { content: null, locked: false, hash: null },
      besluitkader: { content: null, locked: false, hash: null },
    };
    this.syncGlobalState();
  }

  static getLatestState(): KernelStateSnapshot {
    return { ...AureliusSlotKernelV4.latestState };
  }

  isFrozen(): boolean {
    return this.frozen;
  }

  isComplete(): boolean {
    return SLOT_ORDER.every((slotId) => Boolean(this.slots[slotId].content));
  }

  writeSlot(slotId: SlotId, content: string, options?: { override?: boolean }): void {
    if (this.frozen) {
      throw new Error("Kernel v4: schrijven geblokkeerd na freeze().");
    }

    const state = this.slots[slotId];
    const override = Boolean(options?.override);
    if (state.locked && !override) {
      throw new Error(`Kernel v4: slot ${slotId} is vergrendeld.`);
    }
    if (state.content !== null && !override) {
      throw new Error(`Kernel v4: slot ${slotId} bevat al inhoud.`);
    }

    const normalized = normalizeContent(content);
    if (!normalized) {
      throw new Error(`Kernel v4: lege inhoud niet toegestaan voor slot ${slotId}.`);
    }

    const hash = sha256(normalized);
    if (state.hash && this.hashIndex.has(state.hash)) {
      this.hashIndex.delete(state.hash);
    }
    if (this.hashIndex.has(hash)) {
      throw new Error("Identieke sectie-inhoud gedetecteerd in meerdere slots.");
    }

    this.hashIndex.add(hash);
    state.content = normalized;
    state.hash = hash;
    state.locked = true;
    this.syncGlobalState();
  }

  overrideSlot(slotId: SlotId, content: string): void {
    this.writeSlot(slotId, content, { override: true });
    console.info("[slot_kernel_v4_override]", { slotId, hash: this.slots[slotId].hash });
  }

  assembleDocument(): string {
    if (!this.isComplete()) {
      throw new Error("Kernel v4: onvolledig document, niet alle 9 slots gevuld.");
    }

    const blocks = [
      `1. Dominante These\n${this.slots.dominanteThese.content ?? ""}`,
      `2. Structurele Kernspanning\n${this.slots.kernspanning.content ?? ""}`,
      `3. Keerzijde van de keuze\n${this.slots.keerzijde.content ?? ""}`,
      `4. De Prijs van Uitstel\n${this.slots.prijsUitstel.content ?? ""}`,
      `5. Mandaat & Besluitrecht\n${this.slots.mandaat.content ?? ""}`,
      `6. Onderstroom & Informele Macht\n${this.slots.onderstroom.content ?? ""}`,
      `7. Faalmechanisme\n${this.slots.faalmechanisme.content ?? ""}`,
      `8. 90-Dagen Interventieontwerp\n${this.slots.interventie.content ?? ""}`,
      `9. Besluitkader\n${this.slots.besluitkader.content ?? ""}`,
    ];
    return blocks.join("\n\n").trim();
  }

  freeze(): void {
    this.frozen = true;
    this.syncGlobalState();
  }

  private syncGlobalState(): void {
    AureliusSlotKernelV4.latestState = {
      frozen: this.frozen,
      complete: this.isComplete(),
    };
  }
}
