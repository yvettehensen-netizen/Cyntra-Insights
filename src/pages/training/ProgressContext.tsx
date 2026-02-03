import React, { createContext, useState, useContext, ReactNode } from "react";

interface ProgressContextType {
  progress: Record<string, boolean>;
  markComplete: (moduleId: string) => void;
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<Record<string, boolean>>({});

  const markComplete = (moduleId: string) => {
    setProgress((prev) => ({ ...prev, [moduleId]: true }));
  };

  const resetProgress = () => setProgress({});

  return (
    <ProgressContext.Provider value={{ progress, markComplete, resetProgress }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) throw new Error("useProgress must be used within a ProgressProvider");
  return context;
}
