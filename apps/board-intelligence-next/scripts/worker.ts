import { runWorkerLoop } from "@/lib/worker";

const controller = new AbortController();

process.on("SIGINT", () => controller.abort());
process.on("SIGTERM", () => controller.abort());

const poll = Number(process.env.WORKER_POLL_INTERVAL_MS || 2500);

console.log(`[worker] started with poll interval ${poll}ms`);
runWorkerLoop({ pollIntervalMs: poll, signal: controller.signal })
  .then(() => {
    console.log("[worker] stopped");
  })
  .catch((error) => {
    console.error("[worker] fatal", error);
    process.exitCode = 1;
  });
