#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function loadKernelRuntime(repoRoot) {
  const entry = path.join(
    repoRoot,
    "src/aurelius/synthesis/kernel/AureliusSlotKernelV4.ts"
  );
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "slot-kernel-v4-"));
  const outFile = path.join(outDir, "AureliusSlotKernelV4.mjs");

  await build({
    entryPoints: [entry],
    outfile: outFile,
    format: "esm",
    platform: "node",
    target: ["node18"],
    bundle: true,
    sourcemap: false,
    logLevel: "silent",
  });

  return import(pathToFileURL(outFile).href);
}

async function main() {
  const repoRoot = process.cwd();
  const runtime = await loadKernelRuntime(repoRoot);
  const { AureliusSlotKernelV4 } = runtime;

  // 1) Double write on same slot should throw.
  {
    const kernel = new AureliusSlotKernelV4();
    kernel.writeSlot("dominanteThese", "Kernzin: Eerste inhoud.");
    let thrown = "";
    try {
      kernel.writeSlot("dominanteThese", "Kernzin: Tweede inhoud.");
    } catch (error) {
      thrown = String(error?.message ?? error);
    }
    assert(/slot dominanteThese is vergrendeld|bevat al inhoud/i.test(thrown), "Double write op zelfde slot moet throwen");
  }

  // 2) Write after freeze should throw.
  {
    const kernel = new AureliusSlotKernelV4();
    kernel.writeSlot("dominanteThese", "Kernzin: Eerste inhoud.");
    kernel.freeze();
    let thrown = "";
    try {
      kernel.writeSlot("kernspanning", "Kernzin: Tweede inhoud.");
    } catch (error) {
      thrown = String(error?.message ?? error);
    }
    assert(/schrijven geblokkeerd na freeze/i.test(thrown), "Write na freeze moet throwen");
  }

  // 3) Identical content across two slots should throw.
  {
    const kernel = new AureliusSlotKernelV4();
    kernel.writeSlot("dominanteThese", "Kernzin: Exact gelijk.");
    let thrown = "";
    try {
      kernel.writeSlot("kernspanning", "Kernzin: Exact gelijk.");
    } catch (error) {
      thrown = String(error?.message ?? error);
    }
    assert(/Identieke sectie-inhoud gedetecteerd/i.test(thrown), "Identieke cross-slot content moet throwen");
  }

  // 4) Assemble without all 9 slots should throw.
  {
    const kernel = new AureliusSlotKernelV4();
    kernel.writeSlot("dominanteThese", "Kernzin: Eerste inhoud.");
    let thrown = "";
    try {
      kernel.assembleDocument();
    } catch (error) {
      thrown = String(error?.message ?? error);
    }
    assert(/onvolledig document/i.test(thrown), "Assemble met ontbrekende slots moet throwen");
  }

  console.log("slot-lock v4 regression tests passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

