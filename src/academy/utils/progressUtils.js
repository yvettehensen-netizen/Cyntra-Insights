// 🧠 Helpers voor voortgangsbeheer
export function getProgress(trainingId) {
  const stored = localStorage.getItem("academyProgress");
  if (!stored) return {};
  const data = JSON.parse(stored);
  return data[trainingId] || {};
}

export function setModuleCompleted(trainingId, moduleId) {
  const stored = localStorage.getItem("academyProgress");
  const data = stored ? JSON.parse(stored) : {};

  if (!data[trainingId]) data[trainingId] = {};
  data[trainingId][moduleId] = true;

  localStorage.setItem("academyProgress", JSON.stringify(data));
}

export function calculateTrainingProgress(trainingId, totalModules) {
  const progress = getProgress(trainingId);
  const completed = Object.values(progress).filter(Boolean).length;
  return Math.round((completed / totalModules) * 100);
}
