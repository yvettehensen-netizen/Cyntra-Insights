#!/usr/bin/env node
import express from "express";

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

  let json = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  return { status: res.status, json };
}

async function main() {
  delete process.env.SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.VITE_SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.SERVICE_ROLE_KEY;

  const { createServer } = await import("../../src/server/server.js");

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

    const createRes = await httpJson(base, "/api/analyses", {
      method: "POST",
      body: JSON.stringify({
        organization: "Continuity Org",
        description:
          "Capaciteit, marge en besluitdiscipline staan onder druk door parallelle prioriteiten.",
        context: {
          analysis_type: "strategy",
        },
        runImmediately: true,
      }),
    });

    assert(createRes.status === 201, "POST /api/analyses moet 201 teruggeven");
    assert(createRes.json?.analysis?.id, "analysis.id ontbreekt");
    assert(createRes.json?.analysis?.status === "done", "analyse moet inline afronden");
    assert(
      createRes.json?.analysis?.result_payload?.executive_summary,
      "result_payload.executive_summary ontbreekt"
    );

    const analysisId = String(createRes.json.analysis.id);

    const detailsRes = await httpJson(base, `/api/analyses/${encodeURIComponent(analysisId)}`);
    assert(detailsRes.status === 200, "GET /api/analyses/:id moet werken in continuity mode");
    assert(detailsRes.json?.analysis?.id === analysisId, "verkeerde analyse opgehaald");

    const reportRes = await httpJson(base, `/api/reports/${encodeURIComponent(analysisId)}`);
    assert(reportRes.status === 200, "GET /api/reports/:id moet werken in continuity mode");
    assert(reportRes.json?.report?.html_content, "fallback rapport ontbreekt");

    console.log("analysis route consolidation regression passed");
  } finally {
    server.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
