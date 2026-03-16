// src/aurelius/engine/validate/governanceCheck.ts

export function governanceCheck(text: string) {
  const mustHave = [
    "stop",
    "verliest",
    "mandaat",
    "bestuur",
    "onomkeerbaar",
  ];

  const missing = mustHave.filter(
    k => !text.toLowerCase().includes(k)
  );

  if (missing.length) {
    throw new Error(
      `Governance-failure. Ontbreekt: ${missing.join(", ")}`
    );
  }
}
