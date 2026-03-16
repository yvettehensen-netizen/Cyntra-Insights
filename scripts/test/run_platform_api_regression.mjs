#!/usr/bin/env node
import express from "express";
import { createServer } from "../../src/server/server.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function httpJson(base, path, init) {
  const res = await fetch(`${base}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  });
  const json = await res.json();
  return { status: res.status, json };
}

async function main() {
  const app = express();
  app.use("/api", createServer());
  const server = app.listen(0, "127.0.0.1");

  try {
    const addr = server.address();
    const port = typeof addr === "object" && addr ? addr.port : 0;
    const base = `http://127.0.0.1:${port}`;

    const health = await httpJson(base, "/api/platform/health");
    assert(health.status === 200 && health.json.success, "platform health endpoint faalt");

    const orgRes = await httpJson(base, "/api/platform/organizations", {
      method: "POST",
      body: JSON.stringify({
        organisatie_naam: "API Regression Org",
        sector: "Zorg/GGZ",
        organisatie_grootte: "80 medewerkers",
        abonnementstype: "Starter",
      }),
    });
    assert(orgRes.status === 200 && orgRes.json.success, "organisatie upsert faalt");

    const org = orgRes.json.data;
    assert(org.organization_id, "organization_id ontbreekt");

    const startRes = await httpJson(base, "/api/platform/sessions/start", {
      method: "POST",
      body: JSON.stringify({
        organization_id: org.organization_id,
        input_data: "Strategische context met marge- en capaciteitsdruk.",
        analysis_type: "Strategische analyse",
      }),
    });
    assert(startRes.status === 200 && startRes.json.success, "session start faalt");

    const session = startRes.json.data;
    assert(session.session_id && session.board_report, "session output onvolledig");

    const summaryRes = await httpJson(base, `/api/platform/reports/${encodeURIComponent(session.session_id)}/executive-summary`);
    assert(summaryRes.status === 200 && summaryRes.json.success, "executive summary endpoint faalt");

    const discoveryRes = await httpJson(base, "/api/platform/discovery?sector=Zorg&zoekterm=GGZ");
    assert(discoveryRes.status === 200 && discoveryRes.json.success, "discovery endpoint faalt");

    const scannerRes = await httpJson(base, "/api/platform/scanner/analyze", {
      method: "POST",
      body: JSON.stringify({
        organisation_name: "Scanner Org",
        sector: "Zorg/GGZ",
      }),
    });
    assert(scannerRes.status === 200 && scannerRes.json.success, "scanner analyze endpoint faalt");

    const benchmarkRes = await httpJson(base, "/api/platform/dataset/benchmark?sector=Zorg%2FGGZ");
    assert(benchmarkRes.status === 200 && benchmarkRes.json.success, "dataset benchmark endpoint faalt");

    console.log("platform api regression tests passed");
  } finally {
    server.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
