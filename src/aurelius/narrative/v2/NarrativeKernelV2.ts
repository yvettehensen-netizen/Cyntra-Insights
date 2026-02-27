import { generateBoardroomNarrative, type BoardroomInput } from "@/aurelius/narrative/generateBoardroomNarrative";

export async function runNarrativeKernelV2(input: BoardroomInput, options?: {
  minWords?: number;
  maxWords?: number;
  temperature?: number;
}) {
  return generateBoardroomNarrative(input, options);
}

export const generateStrictBoardroomNarrative = runNarrativeKernelV2;
