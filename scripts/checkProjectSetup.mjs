#!/usr/bin/env node
import { access } from "node:fs/promises";
import process from "node:process";

const requiredFiles = [
  "package.json",
  "vite.config.ts",
  "index.html",
  "src/main.tsx",
  "src/App.tsx",
];

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const missing = [];

  for (const file of requiredFiles) {
    const ok = await exists(file);
    if (!ok) missing.push(file);
  }

  if (missing.length > 0) {
    console.error("Project setup check failed. Missing files:");
    for (const file of missing) {
      console.error(`- ${file}`);
    }
    process.exit(1);
  }

  console.log("Project setup check passed");
}

main().catch((error) => {
  console.error("Project setup check failed with an unexpected error:");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
