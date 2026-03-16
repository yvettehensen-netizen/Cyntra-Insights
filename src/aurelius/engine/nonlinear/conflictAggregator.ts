import {
  LensSignalBundle,
  SystemConflictObject,
} from "./types";

// ============================================================
// NON-LINEAR CONFLICT AGGREGATOR
// ADD ONLY — PURE FUNCTION
// ============================================================

export function aggregateConflicts(
  bundles: LensSignalBundle[]
): SystemConflictObject[] {
  const conflictMap: Record<
    string,
    {
      lenses: Set<string>;
      severity: number;
    }
  > = {};

  for (const bundle of bundles) {
    for (const tension of bundle.tensions) {
      const axis = tension.axis.trim();

      if (!conflictMap[axis]) {
        conflictMap[axis] = {
          lenses: new Set(),
          severity: 0,
        };
      }

      conflictMap[axis].lenses.add(bundle.lens_id);
      conflictMap[axis].severity += tension.severity;
    }
  }

  return Object.entries(conflictMap).map(([axis, data]) => {
    const severity_score = data.severity;

    let structural_depth: "surface" | "mid" | "core" = "surface";

    if (severity_score >= 8) structural_depth = "core";
    else if (severity_score >= 4) structural_depth = "mid";

    return {
      axis,
      lenses_involved: Array.from(data.lenses),
      severity_score,
      structural_depth,
      board_risk:
        severity_score >= 8
          ? "Systemische blokkade in besluitvorming."
          : "Bestuurlijke frictie aanwezig.",
      if_unresolved_consequence:
        severity_score >= 8
          ? "Strategische verlamming."
          : "Besluitvertraging en energieverlies.",
    };
  });
}
