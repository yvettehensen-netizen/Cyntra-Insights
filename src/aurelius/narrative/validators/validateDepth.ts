export function validateDepth(text: string) {
  const wordCount = text.split(/\s+/).length;

  if (wordCount < 2500) {
    throw new Error("DEPTH LOCK: Rapport te oppervlakkig");
  }

  const requiredSignals = [
    "verlies",
    "marge",
    "capaciteit",
    "besluit",
    "verantwoordelijkheid",
  ];

  for (const signal of requiredSignals) {
    if (!text.toLowerCase().includes(signal)) {
      throw new Error(`DEPTH LOCK: Mist strategisch signaal -> ${signal}`);
    }
  }
}
