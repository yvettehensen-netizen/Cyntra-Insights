// src/aurelius/types/PainKernel.ts
export interface PainKernel {
  statement: string;          // De ene zin die alles verklaart
  root_causes: string[];      // Max 3 structurele oorzaken
  symptoms: string[];         // Wat ziet men dagelijks?
  consequence_12m: string;    // Wat gebeurt er als men niets doet?
}
