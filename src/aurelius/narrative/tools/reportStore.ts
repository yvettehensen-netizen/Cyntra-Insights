const store = new Map<string, string>();

export function getPreviousReport(key: string): string | undefined {
  return store.get(key);
}

export function setPreviousReport(key: string, report: string): void {
  if (!key) return;
  store.set(key, String(report ?? ""));
}
