import { useState, useEffect } from "react";

export const useProgress = (trainingId) => {
  const key = `progress_${trainingId}`;
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(progress));
  }, [progress]);

  const markCompleted = (moduleId) => {
    setProgress((prev) => ({ ...prev, [moduleId]: true }));
  };

  const getCompletionRate = (modules) => {
    const completed = Object.keys(progress).filter((k) => progress[k]).length;
    return Math.round((completed / modules.length) * 100);
  };

  return { progress, markCompleted, getCompletionRate };
};
