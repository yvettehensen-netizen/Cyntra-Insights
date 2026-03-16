#!/usr/bin/env node
import express from "express";
import fs from "node:fs";

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
  const platformModule = await import("../../src/server/platform.js");
  platformModule.resetPlatformRuntimeStore();

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

    const orgRes = await httpJson(base, "/api/platform/organizations", {
      method: "POST",
      body: JSON.stringify({
        organisatie_naam: "Persistence Org",
        sector: "Zorg/GGZ",
        organisatie_grootte: "120 medewerkers",
        abonnementstype: "Starter",
      }),
    });
    assert(orgRes.status === 200 && orgRes.json.success, "organisatie aanmaken mislukt");

    const sessionRes = await httpJson(base, "/api/platform/sessions/start", {
      method: "POST",
      body: JSON.stringify({
        organization_id: orgRes.json.data.organization_id,
        input_data: "Marge en capaciteit staan onder druk, contractplafonds vertragen besluiten.",
        analysis_type: "Strategische analyse",
      }),
    });
    assert(sessionRes.status === 200 && sessionRes.json.success, "sessie starten mislukt");

    const sessionId = String(sessionRes.json.data.session_id || "");
    assert(sessionId, "session_id ontbreekt");

    const storePath = platformModule.getPlatformRuntimeStorePath();
    assert(fs.existsSync(storePath), "platform runtime store is niet naar disk geschreven");

    const persisted = JSON.parse(fs.readFileSync(storePath, "utf8"));
    assert(
      Array.isArray(persisted.sessions) &&
        persisted.sessions.some((row) => row.session_id === sessionId),
      "gestarte sessie ontbreekt in persistente runtime-store"
    );

    console.log("platform session persistence regression passed");
  } finally {
    server.close();
    platformModule.resetPlatformRuntimeStore();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
