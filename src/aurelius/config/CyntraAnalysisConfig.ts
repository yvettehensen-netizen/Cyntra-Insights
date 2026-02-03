// ============================================================
// CYNTRA ANALYSIS CONFIG — CANONICAL TYPE
// Pad: src/aurelius/config/CyntraAnalysisConfig.ts
// ============================================================

import type { LucideIcon } from "lucide-react";
import type { AnalysisType } from "@/aurelius/types";

export type CyntraDepth =
  | "executive"
  | "full"
  | "boardroom"
  | "strategic";

export interface CyntraAnalysisConfig {
  /** UI */
  title: string;
  subtitle: string;
  accent: string;
  icon: LucideIcon;

  /** Canonical engine identifier */
  analysisType: AnalysisType;

  /** Engine & strategy metadata */
  minWords: number;
  depthDefault: CyntraDepth;
  strategicWeight: number;

  /* ✅ ADDITION — EXECUTIVE INTAKE QUESTIONS */
  intakeQuestions?: string[];
}


