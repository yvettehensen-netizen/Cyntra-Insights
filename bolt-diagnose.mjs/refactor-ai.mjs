#!/usr/bin/env node
/**
 * ⚙️ Cyntra Diagnose v17 — Autonomous Refactor AI
 * -----------------------------------------------
 * 🧠 Detecteert codepatronen en voert zelf commits uit.
 * 💬 Elk commit bevat een AI-uitleg over de wijziging.
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import generate from "@babel/generator";
import express from "express";

const projectRoot = process.cwd();
const srcDir = path.join(projectRoot, "src");
const PORT = 5050;
let report = [];

/* ---------------------------------------------------------
 * 🧠 Refactor Engine
 * --------------------------------------------------------- */
function refactorFile(filePath) {
  const code = fs.readFileSync(filePath, "utf-8");
  const ast = parse(code, { sourceType: "module", plugins: ["jsx", "typescript"] });
  let changed = false;

  traverse(ast, {
    Identifier(path) {
      if (path.node.name === "tmp" || path.node.name === "dataa") {
        path.node.name = "data";
        changed = true;
        report.push(`🧩 ${path.basename(filePath)}: variabele hernoemd → 'data'`);
      }
    },
    CallExpression(path) {
      if (path.node.callee.name === "console" && path.node.arguments.length > 0) {
        path.replaceWithSourceString("// console.log verwijderd door AI-optimalisatie");
        changed = true;
        report.push(`📉 Logging verwijderd in ${path.basename(filePath)}`);
      }
    },
  });

  if (changed) {
    const output = generate(ast, {}, code).code;
    fs.writeFileSync(filePath, output);
  }

  return changed;
}

/* ---------------------------------------------------------
 * 🪶 Git Integration
 * --------------------------------------------------------- */
function commitChanges() {
  try {
    execSync("git add .");
    const summary = report.map((r) => "- " + r).join("\n");
    const message = `🤖 Cyntra Refactor AI: ${report.length} wijzigingen\n\n${summary}`;
    execSync(`git commit -m "${message}"`);
    console.log(`✅ ${report.length} wijzigingen gecommit.`);
  } catch (err) {
    console.warn("⚠️ Git commit mislukt (geen repo of geen veranderingen).");
  }
}

/* ---------------------------------------------------------
 * ⚙️ Scan & Refactor Routine
 * --------------------------------------------------------- */
function scanAndRefactor() {
  console.log("🔍 Scannen op optimalisaties...");
  const files = fs
    .readdirSync(srcDir, { withFileTypes: true })
    .filter((f) => f.name.endsWith(".tsx") || f.name.endsWith(".jsx"))
    .map((f) => path.join(srcDir, f.name));

  let totalChanges = 0;
  report = [];

  for (const file of files) {
    const changed = refactorFile(file);
    if (changed) totalChanges++;
  }

  if (totalChanges > 0) {
    commitChanges();
  } else {
    console.log("✅ Geen aanpassingen nodig.");
  }
}

/* ---------------------------------------------------------
 * 🌐 Dashboard
 * --------------------------------------------------------- */
const app = express();
app.get("/refactor-report", (req, res) => {
  res.send(`
    <html>
      <head><title>Cyntra v17 – Refactor AI</title></head>
      <body style="background:#0E0E0E;color:#D6B48E;font-family:Inter;text-align:center;padding:40px;">
        <h1>⚙️ Cyntra Diagnose v17 — Autonomous Refactor AI</h1>
        <p>${report.length} aanpassingen gedetecteerd</p>
        <pre style="text-align:left;width:80%;margin:auto;background:#111;padding:20px;border-radius:10px;">
${report.join("\n")}
        </pre>
        <p>Elke wijziging is automatisch gecommit met uitleg.</p>
      </body>
    </html>
  `);
});

/* ---------------------------------------------------------
 * 🚀 Start Routine
 * --------------------------------------------------------- */
function main() {
  console.log("⚙️ Cyntra Autonomous Refactor AI gestart...");
  scanAndRefactor();
  app.listen(PORT, () =>
    console.log(`🌐 Dashboard actief op http://localhost:${PORT}/refactor-report`)
  );
}

main();
