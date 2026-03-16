import { build } from "esbuild";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function bundleBuilder() {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "aurelius-brain-"));
  const outfile = path.join(tempDir, "buildStrategicBrainReport.bundle.mjs");

  await build({
    entryPoints: [path.resolve(process.cwd(), "src/aurelius/engine/buildStrategicBrainReport.ts")],
    outfile,
    bundle: true,
    platform: "node",
    format: "esm",
    target: "node20",
    sourcemap: false,
    logLevel: "silent",
  });

  return { outfile, tempDir };
}

async function main() {
  const raw = await readStdin();
  const payload = JSON.parse(raw || "{}");
  const { outfile, tempDir } = await bundleBuilder();

  try {
    const module = await import(pathToFileURL(outfile).href);
    const report = module.buildStrategicBrainReport(payload);
    process.stdout.write(JSON.stringify(report));
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  process.stderr.write(String(error instanceof Error ? error.stack || error.message : error));
  process.exitCode = 1;
});
