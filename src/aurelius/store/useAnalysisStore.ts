import { create } from "zustand";

interface AnalysisState {
  runId: string | null;
  status: "idle" | "running" | "completed" | "error";
  progress: number;
  result: any | null;

  startRun: (runId: string) => void;
  setProgress: (value: number) => void;
  setResult: (result: any) => void;
  completeRun: (result: any) => void;
  failRun: () => void;
  reset: () => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  runId: null,
  status: "idle",
  progress: 0,
  result: null,

  startRun: (runId) =>
    set({
      runId,
      status: "running",
      progress: 0,
      result: null,
    }),

  setProgress: (value) =>
    set({
      progress: Math.max(0, Math.min(100, Number(value) || 0)),
    }),

  setResult: (result) =>
    set({
      result,
    }),

  completeRun: (result) =>
    set({
      status: "completed",
      result,
      progress: 100,
    }),

  failRun: () =>
    set({
      status: "error",
    }),

  reset: () =>
    set({
      runId: null,
      status: "idle",
      progress: 0,
      result: null,
    }),
}));
