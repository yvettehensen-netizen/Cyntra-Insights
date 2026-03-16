import { create } from "zustand";
import type { StrategicReport } from "@/platform/types";
import type { Intervention } from "@/aurelius/interventions/types";

export interface AnalysisSession {
  id: string;
  organization: string;
  sector: string;
  createdAt: string;
  input: string;
  report?: StrategicReport;
  interventions?: Intervention[];
}

interface AnalysisStoreState {
  analyses: AnalysisSession[];
  currentSession: AnalysisSession | null;
  createAnalysis: (input: Omit<AnalysisSession, "createdAt"> & { createdAt?: string }) => AnalysisSession;
  saveReport: (sessionId: string, report: StrategicReport, interventions?: Intervention[]) => AnalysisSession | null;
  getAnalyses: () => AnalysisSession[];
  getAnalysisById: (sessionId: string) => AnalysisSession | undefined;
  setCurrentSession: (sessionId: string | null) => void;
}

export const useAnalysisStore = create<AnalysisStoreState>((set, get) => ({
  analyses: [],
  currentSession: null,

  createAnalysis: (input) => {
    const created: AnalysisSession = {
      id: input.id,
      organization: input.organization,
      sector: input.sector,
      createdAt: input.createdAt ?? new Date().toISOString(),
      input: input.input,
      report: input.report,
      interventions: input.interventions,
    };

    const next = [created, ...get().analyses.filter((row) => row.id !== created.id)].sort((a, b) =>
      a.createdAt < b.createdAt ? 1 : -1
    );
    set({ analyses: next, currentSession: created });
    return created;
  },

  saveReport: (sessionId, report, interventions) => {
    let updated: AnalysisSession | null = null;
    const next = get().analyses.map((row) => {
      if (row.id !== sessionId) return row;
      updated = {
        ...row,
        report,
        interventions: interventions ?? row.interventions,
      };
      return updated;
    });
    if (!updated) return null;
    set({ analyses: next, currentSession: updated });
    return updated;
  },

  getAnalyses: () => get().analyses,

  getAnalysisById: (sessionId) => get().analyses.find((row) => row.id === sessionId),

  setCurrentSession: (sessionId) => {
    if (!sessionId) {
      set({ currentSession: null });
      return;
    }
    const found = get().analyses.find((row) => row.id === sessionId) ?? null;
    set({ currentSession: found });
  },
}));
