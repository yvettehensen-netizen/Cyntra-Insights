export type StabilityWarning = {
  guard: string;
  message: string;
  layer?: string;
  timestamp: string;
};

export type OutputContractGuardResult<T> = {
  value: T;
  warnings: StabilityWarning[];
};

const OUTPUT_CONTRACTS: Record<string, string[]> = {
  "Context Layer": ["context_state"],
  "Diagnosis Layer": ["diagnosis"],
  "Contradiction Engine": ["contradiction"],
  "Mechanism Engine": ["mechanisms"],
  "Strategic Insight Engine": ["strategic_insights"],
  "Strategic Pattern Engine": ["historical_patterns"],
  "Strategic Leverage Engine": ["leverage_points"],
  "Decision Engine": ["decision"],
  "Strategic Simulation Engine": ["simulation_results"],
  "Strategic OS Layer": ["strategic_os"],
  "Narrative Layer": ["board_report"],
};

const STABILITY_LOG_FILE = "/logs/cyntra_stability.log";
const STABILITY_DEBUG_FLAG = "VITE_CYNTRA_STABILITY_DEBUG";

function nowIso(): string {
  return new Date().toISOString();
}

function toSafeErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function canWriteNodeStabilityLog(): boolean {
  const processRef = (globalThis as { process?: { versions?: { node?: string } } }).process;
  return Boolean(processRef?.versions?.node) && typeof window === "undefined";
}

function readDebugFlag(): boolean {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
  const viteEnv = (globalThis as { import_meta_env?: Record<string, string | boolean | undefined> })
    .import_meta_env;
  const rawValue = env?.[STABILITY_DEBUG_FLAG] ?? viteEnv?.[STABILITY_DEBUG_FLAG];
  return rawValue === "1" || rawValue === "true" || rawValue === true;
}

export function shouldEmitStabilityConsoleWarnings(): boolean {
  return readDebugFlag();
}

export function logStabilityWarning(warning: StabilityWarning): void {
  const line = `${warning.timestamp} [${warning.guard}] [${warning.layer ?? "n/a"}] ${warning.message}`;
  if (shouldEmitStabilityConsoleWarnings()) {
    console.warn(line);
  }

  if (!canWriteNodeStabilityLog()) {
    return;
  }

  void (async () => {
    try {
      const fsModuleId = "node:fs/promises";
      const pathModuleId = "node:path";
      const fs = await import(/* @vite-ignore */ fsModuleId);
      const path = await import(/* @vite-ignore */ pathModuleId);
      const processRef = (globalThis as { process?: { cwd?: () => string } }).process;
      const cwd = processRef?.cwd ? processRef.cwd() : ".";
      const absolutePath = path.join(cwd, "logs", "cyntra_stability.log");
      await fs.mkdir(path.dirname(absolutePath), { recursive: true });
      await fs.appendFile(absolutePath, `${line}\n`, "utf8");
    } catch (error) {
      const fallback = `${nowIso()} [StabilityLogger] [n/a] Log write skipped: ${toSafeErrorMessage(error)}`;
      if (shouldEmitStabilityConsoleWarnings()) {
        console.warn(fallback);
      }
    }
  })();
}

export function getStabilityLogFilePath(): string {
  return STABILITY_LOG_FILE;
}

export function runOutputContractGuard<T extends Record<string, unknown>>(
  layer: string,
  value: T
): OutputContractGuardResult<T> {
  const requiredKeys = OUTPUT_CONTRACTS[layer] ?? [];
  const warnings: StabilityWarning[] = [];

  for (const requiredKey of requiredKeys) {
    if (!(requiredKey in value)) {
      const warning: StabilityWarning = {
        guard: "OutputContractGuard",
        layer,
        message: `Contract mismatch: expected key '${requiredKey}' ontbreekt in output.`,
        timestamp: nowIso(),
      };
      warnings.push(warning);
      logStabilityWarning(warning);
    }
  }

  return {
    value,
    warnings,
  };
}
