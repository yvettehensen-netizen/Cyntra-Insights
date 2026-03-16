import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import { usePlatformApiBridge } from "./usePlatformApiBridge";

type DownloadTarget = "analysis" | "report" | "interventions" | "cases" | "benchmark" | "dataset";

function routeToTarget(pathname: string): { target: DownloadTarget; label: string } {
  if (pathname.includes("/portal/analyse") || pathname.includes("/saas/analyse")) {
    return { target: "analysis", label: "analyse" };
  }
  if (pathname.includes("/portal/rapporten") || pathname.includes("/saas/rapporten")) {
    return { target: "report", label: "rapport" };
  }
  if (pathname.includes("/portal/interventies") || pathname.includes("/saas/interventies")) {
    return { target: "interventies", label: "interventies" };
  }
  if (pathname.includes("/portal/cases") || pathname.includes("/saas/cases")) {
    return { target: "cases", label: "cases" };
  }
  if (pathname.includes("/portal/benchmark") || pathname.includes("/saas/benchmark")) {
    return { target: "benchmark", label: "benchmark" };
  }
  return { target: "dataset", label: "dataset" };
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Delay revoke to avoid browser races during download handoff.
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function DownloadBar() {
  const api = usePlatformApiBridge();
  const location = useLocation();
  const [status, setStatus] = useState("");
  const { target, label } = routeToTarget(location.pathname);

  async function runDownload() {
    setStatus(`Download gestart (${label}.pdf)`);
    try {
      let response: Response;

      if (target === "analysis") {
        response = await api.exportReport({ format: "pdf", resource: "analysis" });
      } else if (target === "report") {
        response = await api.exportReport({ format: "pdf", resource: "report" });
      } else if (target === "interventies") {
        response = await api.exportInterventions({ format: "pdf" });
      } else if (target === "cases") {
        response = await api.exportCases({ format: "pdf" });
      } else if (target === "benchmark") {
        response = await api.exportBenchmark({ format: "pdf" });
      } else {
        response = await api.exportDataset({ format: "pdf", resource: "dataset" });
      }

      if (!response.ok) {
        throw new Error(`Download mislukt (${response.status})`);
      }

      const blob = await response.blob();
      triggerBlobDownload(blob, `${label}.pdf`);
      setStatus(`Download voltooid (${label}.pdf)`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : `Download mislukt (${label}.pdf)`);
    }
  }

  return (
    <div className="portal-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="portal-kicker">Export</p>
          <p className="mt-2 text-sm text-gray-300">Download {label} als geconsolideerde PDF.</p>
        </div>
        <button className="portal-button-secondary px-4 py-2 text-xs" onClick={() => void runDownload()}>
          PDF
        </button>
      </div>
      {status ? <p className="mt-2 text-xs text-gray-400">{status}</p> : null}
    </div>
  );
}

export function PageShell(props: { title: string; subtitle: string; children: ReactNode; showDownloadBar?: boolean }) {
  const showDownloadBar = props.showDownloadBar ?? true;
  return (
    <div className="space-y-6">
      <header className="portal-card relative overflow-hidden p-6">
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[#D4AF37]/10 blur-3xl" />
        <div>
          <p className="portal-kicker relative">Aurelius Workspace</p>
          <h1 className="relative mt-3 text-3xl font-semibold text-white">{props.title}</h1>
          <p className="relative mt-3 text-sm leading-7 text-gray-300">{props.subtitle}</p>
        </div>
      </header>
      {showDownloadBar ? <DownloadBar /> : null}
      {props.children}
    </div>
  );
}

export function Panel(props: { title: string; children: ReactNode }) {
  return (
    <section className="portal-card p-5">
      <h2 className="text-lg font-medium tracking-[0.01em] text-[#D4AF37]">{props.title}</h2>
      <div className="mt-4">{props.children}</div>
    </section>
  );
}

export function EmptyState(props: { text: string }) {
  return <p className="portal-card-soft border-dashed p-5 text-sm text-gray-300">{props.text}</p>;
}

export function StatCard(props: { label: string; value: ReactNode; hint?: string; tone?: "gold" | "blue" | "green" }) {
  const toneClass =
    props.tone === "blue"
      ? "text-sky-300"
      : props.tone === "green"
        ? "text-emerald-300"
        : "text-[#D4AF37]";
  return (
    <div className="portal-stat-card">
      <p className="text-[11px] uppercase tracking-[0.16em] text-gray-400">{props.label}</p>
      <div className={`mt-3 text-2xl font-semibold ${toneClass}`}>{props.value}</div>
      {props.hint ? <p className="mt-2 text-xs leading-5 text-gray-400">{props.hint}</p> : null}
    </div>
  );
}

export function SurfaceCard(props: { title: string; eyebrow?: string; children: ReactNode; accent?: string }) {
  return (
    <article className={`portal-card-soft p-5 ${props.accent || ""}`}>
      {props.eyebrow ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">{props.eyebrow}</p>
      ) : null}
      <h3 className="mt-2 text-lg font-semibold text-white">{props.title}</h3>
      <div className="mt-3 text-sm leading-6 text-gray-300">{props.children}</div>
    </article>
  );
}
