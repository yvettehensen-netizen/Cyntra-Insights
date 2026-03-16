import { useEffect } from "react";

const RELOAD_KEY = "cyntra_chunk_reload_once";

function isChunkLoadMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("failed to fetch dynamically imported module") ||
    lower.includes("importing a module script failed") ||
    lower.includes("loading chunk")
  );
}

function attemptSingleReload() {
  if (typeof window === "undefined") return;

  const alreadyRetried = sessionStorage.getItem(RELOAD_KEY) === "1";
  if (alreadyRetried) return;

  sessionStorage.setItem(RELOAD_KEY, "1");
  window.location.reload();
}

export default function ChunkRecovery() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Clear retry flag after a stable boot so future deploys can recover once again.
    const timer = window.setTimeout(() => {
      sessionStorage.removeItem(RELOAD_KEY);
    }, 4000);

    const onError = (event: ErrorEvent) => {
      const message = String(event.message || event.error?.message || "");
      if (isChunkLoadMessage(message)) {
        attemptSingleReload();
      }
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message = String(reason?.message || reason || "");
      if (isChunkLoadMessage(message)) {
        attemptSingleReload();
      }
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
