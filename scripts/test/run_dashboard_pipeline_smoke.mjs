#!/usr/bin/env node
import express from "express";
import { createServer } from "../../src/server/server.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function http(base, path, init) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const res = await fetch(`${base}${path}`, {
        headers: {
          "Content-Type": "application/json",
          ...(init?.headers || {}),
        },
        ...init,
      });
      return res;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 120 * (attempt + 1)));
    }
  }
  throw lastError;
}

async function httpJson(base, path, init) {
  const res = await http(base, path, init);
  const json = await res.json();
  return { res, json };
}

async function expectExport(base, path, expectedTypePart) {
  const res = await http(base, path);
  assert(res.status === 200, `export endpoint faalt: ${path}`);
  const contentType = res.headers.get("content-type") || "";
  assert(contentType.includes(expectedTypePart), `fout content-type voor ${path}: ${contentType}`);
  const body = await res.text();
  assert(body.length > 0, `lege export voor ${path}`);
}

async function main() {
  const app = express();
  app.use("/api", createServer());
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });

  try {
    const addr = server.address();
    const port = typeof addr === "object" && addr ? addr.port : 0;
    const base = `http://127.0.0.1:${port}`;

    const orgRes = await httpJson(base, "/api/platform/organizations", {
      method: "POST",
      body: JSON.stringify({
        organisatie_naam: "Dashboard Smoke Org",
        sector: "Zorg/GGZ",
        organisatie_grootte: "100 medewerkers",
        abonnementstype: "Starter",
      }),
    });
    assert(orgRes.res.status === 200 && orgRes.json.success, "organisatie aanmaken mislukt");
    const org = orgRes.json.data;

    const analyseRes = await httpJson(base, "/api/platform/sessions/start", {
      method: "POST",
      body: JSON.stringify({
        organization_id: org.organization_id,
        input_data: "Marge daalt, capaciteit onder druk, contractplafonds blokkeren groei.",
        analysis_type: "Strategische analyse",
      }),
    });
    assert(analyseRes.res.status === 200 && analyseRes.json.success, "analyse pipeline mislukt");
    const session = analyseRes.json.data;

    const sessionsRes = await httpJson(base, "/api/platform/sessions");
    const sessions = sessionsRes.json.data || [];
    const storedSession = sessions.find((item) => item.session_id === session.session_id);
    assert(Boolean(storedSession?.board_report), "rapport niet opgeslagen na analyse");
    assert(Boolean(storedSession?.strategic_report?.report_id), "StrategicReport ontbreekt");

    const interventionsRes = await httpJson(base, "/api/platform/interventions");
    const interventions = interventionsRes.json.data || [];
    assert(interventions.some((row) => row.source_case_id === session.session_id), "interventies niet gekoppeld aan case");

    const casesRes = await httpJson(base, "/api/platform/cases");
    const cases = casesRes.json.data || [];
    const storedCase = cases.find((row) => row.case_id === session.session_id);
    assert(Boolean(storedCase), "historische case ontbreekt");
    assert(Boolean(storedCase?.interventions?.length), "case bevat geen interventies");

    const benchmarkRes = await httpJson(base, "/api/platform/dataset/benchmark?sector=Zorg%2FGGZ");
    assert(benchmarkRes.res.status === 200 && benchmarkRes.json.success, "benchmark endpoint faalt");

    const signalenRes = await httpJson(base, "/api/platform/signalen");
    assert(signalenRes.res.status === 200 && signalenRes.json.success, "signalen endpoint faalt");
    assert((signalenRes.json.data || []).length > 0, "geen signalen gegenereerd");

    await expectExport(base, "/api/export/report?format=json&resource=report", "application/json");
    await expectExport(base, "/api/export/interventions?format=csv", "text/csv");
    await expectExport(base, "/api/export/cases?format=json", "application/json");
    await expectExport(base, "/api/export/benchmark?format=json", "application/json");
    await expectExport(base, "/api/export/dataset?format=json&resource=dataset", "application/json");

    console.log("dashboard pipeline smoke test passed");
  } finally {
    server.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
