#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";

const EXIT_BREACH = 1;
const EXIT_CONFIG = 2;

function argValue(flag, fallback = "") {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return fallback;
  return process.argv[idx + 1] ?? fallback;
}

function hasFlag(flag) {
  return process.argv.includes(flag);
}

function fail(message, code = EXIT_BREACH) {
  console.error(`[FAIL] ${message}`);
  process.exit(code);
}

function info(message) {
  process.stdout.write(`${message}\n`);
}

function hasCommand(command, args = ["--version"]) {
  const result = spawnSync(command, args, {
    stdio: "ignore",
  });
  return result.status === 0;
}

function toDockerDatabaseUrl(databaseUrl) {
  try {
    const parsed = new URL(databaseUrl);
    if (
      parsed.hostname === "127.0.0.1" ||
      parsed.hostname === "localhost" ||
      parsed.hostname === "::1"
    ) {
      parsed.hostname = "host.docker.internal";
    }
    return parsed.toString();
  } catch {
    return databaseUrl
      .replace("@127.0.0.1", "@host.docker.internal")
      .replace("@localhost", "@host.docker.internal")
      .replace("@[::1]", "@host.docker.internal");
  }
}

function runPsql(databaseUrl, args) {
  if (hasCommand("psql")) {
    return execFileSync("psql", [databaseUrl, ...args], {
      stdio: ["ignore", "pipe", "pipe"],
    });
  }

  if (hasCommand("docker")) {
    const dockerUrl = toDockerDatabaseUrl(databaseUrl);
    return execFileSync(
      "docker",
      ["run", "--rm", "-i", "postgres:16-alpine", "psql", dockerUrl, ...args],
      {
        stdio: ["ignore", "pipe", "pipe"],
      }
    );
  }

  fail("Geen SQL client beschikbaar: installeer psql of docker.", EXIT_CONFIG);
}

function runScalar(databaseUrl, sql) {
  return runPsql(databaseUrl, ["-At", "-c", sql]).toString().trim();
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function readFileSafe(filePath) {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return "";
  }
}

async function listJsonFiles(dirPath) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
      const full = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        const nested = await listJsonFiles(full);
        files.push(...nested);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".json")) {
        files.push(full);
      }
    }
    return files;
  } catch {
    return [];
  }
}

function extractNarrative(payload) {
  if (!payload || typeof payload !== "object") return "";
  if (typeof payload.narrative === "string") return payload.narrative;
  if (payload.report && typeof payload.report === "object") {
    if (typeof payload.report.narrative === "string") return payload.report.narrative;
  }
  return "";
}

async function validateHgbcoSections(reportsDir, sourceFileContent) {
  const requiredHeadings = [
    "### Samenvatting",
    "### Huidige situatie",
    "### Gewenste situatie",
    "### Belemmeringen",
    "### Centrale vraag",
    "### Oplossingsrichtingen",
    "### Mogelijke interventies",
  ];

  const sourceHasAll = requiredHeadings.every((heading) => sourceFileContent.includes(heading));
  const files = reportsDir ? await listJsonFiles(reportsDir) : [];
  const hgbcoFiles = files.filter((f) => /hgbco/i.test(path.basename(f)));

  if (hgbcoFiles.length === 0) {
    return {
      ok: sourceHasAll,
      detail: sourceHasAll
        ? "HGBCO sectiecontract aanwezig in source (runtime sample niet aangeleverd)."
        : "HGBCO sectiecontract ontbreekt in source.",
    };
  }

  for (const file of hgbcoFiles) {
    try {
      const raw = await fs.readFile(file, "utf8");
      const parsed = JSON.parse(raw);
      const narrative = extractNarrative(parsed);
      if (!narrative) {
        return { ok: false, detail: `Geen narrative gevonden in ${file}` };
      }
      const missing = requiredHeadings.filter((heading) => !narrative.includes(heading));
      if (missing.length > 0) {
        return {
          ok: false,
          detail: `HGBCO headings ontbreken in ${file}: ${missing.join(", ")}`,
        };
      }
    } catch {
      return { ok: false, detail: `Ongeldige JSON in HGBCO report: ${file}` };
    }
  }

  return { ok: true, detail: `HGBCO headings gevalideerd in ${hgbcoFiles.length} report(s).` };
}

async function main() {
  if (hasFlag("--help") || hasFlag("-h")) {
    process.stdout.write(
      [
        "Usage:",
        "  node scripts/predeploy/validate-contract.mjs [--database-url <url>] [--reports-dir <dir>] [--max-422-rate <pct>] [--base-ref <git-ref>]",
      ].join("\n")
    );
    return;
  }

  const databaseUrl =
    argValue("--database-url") || process.env.DATABASE_URL || "";
  if (!databaseUrl) {
    fail("DATABASE_URL ontbreekt", EXIT_CONFIG);
  }

  const reportsDir = argValue("--reports-dir", "");
  const max422Rate = toNumber(argValue("--max-422-rate", "2"), 2);
  const baseRef = argValue("--base-ref", "origin/main");

  const runCanonicalContent = await readFileSafe(
    path.join("src", "cyntra", "stabilization", "runCyntraAnalysis.ts")
  );
  const edgeContent = await readFileSafe(
    path.join("supabase", "functions", "aurelius-analyze", "index.ts")
  );

  const checks = [];

  checks.push({
    name: "single_call_mode enforced",
    ok: edgeContent.includes("single_call_mode vereist in stabilisatiemodus"),
    detail: "edge guard aanwezig",
  });

  checks.push({
    name: "no repair loops",
    ok:
      runCanonicalContent.includes("const MAX_REPAIR_ATTEMPTS = 0;") &&
      !edgeContent.includes("repairPrompt"),
    detail: "MAX_REPAIR_ATTEMPTS=0 en geen repairPrompt",
  });

  checks.push({
    name: "no multi-call orchestrator",
    ok:
      !edgeContent.includes("runClassicOrchestrator") &&
      !edgeContent.includes("runClassicFallbackSingle"),
    detail: "legacy multi-call markers afwezig",
  });

  const hgbcoSectionCheck = await validateHgbcoSections(reportsDir, edgeContent);
  checks.push({
    name: "HGBCO sections present",
    ok: hgbcoSectionCheck.ok,
    detail: hgbcoSectionCheck.detail,
  });

  const invalidHashRows = toNumber(
    runScalar(
      databaseUrl,
      `
      select count(*)
      from public.decision_memory
      where decision_hash is null
         or company_hash is null
         or length(decision_hash) <> 64
         or length(company_hash) <> 64
      `
    )
  );

  checks.push({
    name: "no invalid hashes",
    ok: invalidHashRows === 0,
    detail: `invalid_hash_rows=${invalidHashRows}`,
  });

  const singleCallRegressions = toNumber(
    runScalar(
      databaseUrl,
      `
      select count(*)
      from public.analysis_audit_log
      where "timestamp" >= now() - interval '7 day'
        and single_call_mode = false
      `
    )
  );

  checks.push({
    name: "single_call_mode always true",
    ok: singleCallRegressions === 0,
    detail: `single_call_regressions_7d=${singleCallRegressions}`,
  });

  const repairLoopCount = toNumber(
    runScalar(
      databaseUrl,
      `
      select count(*)
      from public.analysis_audit_log
      where "timestamp" >= now() - interval '7 day'
        and repair_attempts > 0
      `
    )
  );

  checks.push({
    name: "repair loop count",
    ok: repairLoopCount === 0,
    detail: `repair_loop_count_7d=${repairLoopCount}`,
  });

  const contract422Rate = toNumber(
    runScalar(
      databaseUrl,
      `
      select coalesce(avg(contract_422_rate_pct), 0)
      from ops.v_contract_fail_daily
      where day >= current_date - interval '7 day'
      `
    )
  );

  checks.push({
    name: "422 rate threshold",
    ok: contract422Rate < max422Rate,
    detail: `contract_422_rate_avg_pct_7d=${contract422Rate.toFixed(2)} threshold<${max422Rate.toFixed(2)}`,
  });

  // Keep same base-ref semantics as existing predeploy invariants script.
  const invariantRun = spawnSync("bash", ["scripts/check-level2-invariants.sh", baseRef], {
    stdio: "pipe",
    encoding: "utf8",
  });

  checks.push({
    name: "no multi-call + authorized UI/API drift invariant gate",
    ok: invariantRun.status === 0,
    detail: invariantRun.status === 0 ? "check-level2-invariants PASS" : "check-level2-invariants FAIL",
  });

  info("[INFO] Contract validation results");
  for (const check of checks) {
    info(`${check.ok ? "[PASS]" : "[FAIL]"} ${check.name} (${check.detail})`);
  }

  const failed = checks.filter((check) => !check.ok);
  if (failed.length > 0) {
    fail(`Contract validation failed (${failed.map((c) => c.name).join(", ")})`);
  }

  info("[PASS] Contract validation passed");
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});
