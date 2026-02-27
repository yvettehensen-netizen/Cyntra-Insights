import { scanAnchorsFromContext } from "@/aurelius/narrative/anchors/anchorScan";

export function anchorScan(inputContext: string, narrative: string) {
  return scanAnchorsFromContext(inputContext, narrative);
}
