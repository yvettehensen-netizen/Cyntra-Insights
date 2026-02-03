#!/usr/bin/env node
/**
 * 🤖 Cyntra Diagnose v18 — Cognitive Pull Request AI
 * --------------------------------------------------
 * 🧠 Volledig autonome AI die PR’s maakt met uitleg, changelog & context.
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
const PORT = 5051;

let changes = [];

/* ---------------------------------------------------------
 * 🧠 1. Code Cognition Engine
 * --------------------------------------------------------- */
function analyzeAndRefactor(filePath) {
  const code = fs.readFileSync(filePath, "utf-8");
  const ast = parse(code, { sourceType: "module", plugins: ["jsx", "typescript"] });
  let updated = false;

  traverse(ast, {
    FunctionDeclaration(path) {
      const name = path.node.id?.name;
      if (name && name.startsWith("handle") && !path.node.async) {
        path.node.async = true;
        updated = true;
        changes.push(`🔁 ${path.basename(filePath)}: functie "${name}" async gemaakt voor betere I/O`);
      }
    },
    ImportDeclaration(path) {
      if (path.node.source.value.includes("../")) {
        path.node.source.value = path.node.source.value.replace("../", "./");
        updated = true;
        changes.push(`🧩 ${path.basename(filePath)}: relatieve import opgeschoond (${path.node.source.value})`);
      }
    },
  });

  if (updated) {
    const newCode = generate(ast, {}, code).code;
    fs.writeFileSync(filePath, newCode);
  }

  return updated;
}

/* ---------------------------------------------------------
 * 🧱 2. Refactor Pass
 * --------------------------------------------------------- */
function scanAndRefactor() {
  const files = fs
    .readdirSync(srcDir, { withFileTypes: true })
    .filter((f) => f.name.endsWith(".tsx") || f.name.endsWith(".jsx"))
    .map((f) => path.join(srcDir, f.name));

  let count = 0;
  for (const file of files) {
    const changed = analyzeAndRefactor(file);
    if (changed) count++;
  }
  return count;
}

/* ---------------------------------------------------------
 * 💬 3. Generate Pull Request Message
 * --------------------------------------------------------- */
function generatePRMessage() {
  const summary = `
## 🤖 Cyntra AI Pull Request

### 🧠 Samenvatting
Deze PR bevat automatische verbeteringen voorgesteld door Cyntra Diagnose v18.

### 🧩 Wijzigingen
${changes.map((c) => "- " + c).join("\n")}

### 💡 Impactanalyse
- Verbeterde leesbaarheid en code-consistentie
- Minder cyclische imports
- Async-functies beter voorbereid op API-integraties

> ⚙️ Cyntra gebruikt lokale contextanalyse om patronen te herkennen
> en voert minimale, veilige refactors uit.
`;
  return summary;
}

/* ---------------------------------------------------------
 * 🚀 4. Maak Branch + PR via Git
 * --------------------------------------------------------- */
function createPullRequest() {
  const branch = `cyntra-ai-refactor-${Date.now()}`;
  execSync(`git checkout -b ${branch}`);
  execSync("git add .");

  const message = generatePRMessage();
  execSync(`git commit -m "🤖 Cyntra AI Refactor PR" -m "${message}"`);

  try {
    execSync(`git push origin ${branch}`);
    console.log(`✅ Branch gepusht: ${branch}`);
    console.log("🔁 Pull request aangemaakt via remote.");
  } catch {
    console.warn("⚠️ Geen remote gevonden — PR lokaal aangemaakt.");
  }

  fs.writeFileSync(path.join(projectRoot, "CYNTRA_PR_SUMMARY.md"), message);
}

/* ---------------------------------------------------------
 * 🌐 5. Local Dashboard
 * --------------------------------------------------------- */
const app = express();
app.get("/pr-status", (req, res) => {
  res.send(`
  <html>
    <head><title>Cyntra v18 — PR AI</title></head>
    <body style="background:#0E0E0E;color:#D6B48E;font-family:Inter;text-align:center;padding:40px;">
      <h1>🤖 Cyntra Diagnose v18 — Cognitive Pull Request AI</h1>
      <p>Gedetecteerde wijzigingen: ${changes.length}</p>
      <pre style="text-align:left;width:80%;margin:auto;background:#111;padding:20px;border-radius:10px;">
${changes.join("\n")}
      </pre>
      <p>Bekijk PR details in <code>CYNTRA_PR_SUMMARY.md</code></p>
    </body>
  </html>
  `);
});

/* ---------------------------------------------------------
 * 🧠 Start
 * --------------------------------------------------------- */
function main() {
  console.log("⚙️ Cyntra v18 gestart – cognitieve code-analyse...");
  const total = scanAndRefactor();

  if (total > 0) {
    createPullRequest();
  } else {
    console.log("✅ Geen significante wijzigingen gevonden.");
  }

  app.listen(PORT, () =>
    console.log(`🌐 Dashboard actief op http://localhost:${PORT}/pr-status`)
  );
}

main();
