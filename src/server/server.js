import express from "express";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sendReportRouter from "./sendReport.js";
import aiRouter from "./ai.js";
import intelligenceRouter from "./intelligence.js";
import analysesRouter from "./analyses.js";
import domainPersistenceRouter from "./domainPersistence.js";

dotenv.config();

function attachApiRoutes(app) {
  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/", sendReportRouter);
  app.use("/", aiRouter);
  app.use("/", analysesRouter);
  app.use("/", domainPersistenceRouter);
  app.use("/intelligence", intelligenceRouter);
}

export function createServer() {
  const app = express();

  app.disable("x-powered-by");
  app.use(express.json({ limit: "12mb" }));
  app.use(express.urlencoded({ extended: true, limit: "12mb" }));

  attachApiRoutes(app);

  app.use((err, _req, res, _next) => {
    const message = err instanceof Error ? err.message : String(err || "Onbekende fout");
    res.status(500).json({ error: message });
  });

  return app;
}

function isExecutedDirectly() {
  const entryFile = process.argv[1] ? path.resolve(process.argv[1]) : "";
  const thisFile = fileURLToPath(import.meta.url);
  return entryFile === thisFile;
}

function createStandaloneApp() {
  const app = express();
  const apiApp = createServer();

  app.disable("x-powered-by");
  app.use("/api", apiApp);

  const distDir = path.resolve(process.cwd(), "dist");
  const indexPath = path.join(distDir, "index.html");

  if (fs.existsSync(indexPath)) {
    app.use(express.static(distDir));
    app.get("*", (_req, res) => {
      res.sendFile(indexPath);
    });
  } else {
    app.get("/", (_req, res) => {
      res.status(200).json({
        status: "ok",
        message: "Frontend dist ontbreekt. Run eerst `npm run build`.",
      });
    });
  }

  return app;
}

if (isExecutedDirectly()) {
  const app = createStandaloneApp();
  const port = Number(process.env.PORT || 5173);

  app.listen(port, () => {
    console.log(`[server] running on http://localhost:${port}`);
  });
}

