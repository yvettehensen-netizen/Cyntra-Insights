// src/cie/aureliusMetrics.ts

export function generateConfidenceScore(paths: { score: number }[]) {
  const avg = paths.reduce((acc, p) => acc + p.score, 0) / paths.length;
  return Number(avg.toFixed(2));
}

export function pickBestPath(paths: any[]) {
  return paths.sort((a, b) => b.score - a.score)[0];
}
