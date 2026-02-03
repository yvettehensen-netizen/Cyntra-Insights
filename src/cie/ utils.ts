// src/cie/utils.ts

export async function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export function clean(str: string) {
  return str.replace(/\s+/g, " ").trim();
}
