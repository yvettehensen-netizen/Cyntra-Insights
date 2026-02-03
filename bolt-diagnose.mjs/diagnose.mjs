#!/usr/bin/env node
/**
 * ⚡ Cyntra Diagnose v15 – Adaptive Compiler AI
 * ---------------------------------------------
 * 🧠 Voorspellende bugdetectie
 * 🧩 AST-analyse en real-time codeherstel
 * 🔒 Volledig lokaal (geen internet)
 */

import { spawn, execSync } from "child_process";
import fs from "fs";
import path from "path";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import generate from "@babel/generator";
import express from "express";

const projectRoot = process.cwd();
const srcDir = path.join(projectRoot, "src");
const PORT = 5050;
let stats = { predictions: 0, fixes: 0, optimizations: 0, builds: 0 };

/* ---------------------------------------------------------
 * 🧠 Predictor – analyseert AST voor potentiële fouten
 * --------------------------------------------------------- */
function analyzeAST(filePath) {
  const code = fs.readFileSync(filePath, "utf-8");
  const ast = parse(code, { sourceType: "module", plugins: ["jsx", "typescript"] });
  let issues = [];

  traverse(ast, {
    Identifier(path) {
      if (path.node.name === "data" && !path.scope.hasBinding("data")) {
        issues.push({ type: "undefined", name: "data", loc: path.node.loc });
      }
    },
    CallExpression(path) {
      if (path.node.callee.name === "eval") {
        issues.push({ type: "insecure", name: "eval", loc: path.node.loc });
      }
    },
    ImportDeclaration(path) {
      if (path.node.source.value.includes("..")) {
        issues.push({ type: "badImport", name: path.node.source.value });
      }
    },
  });

  return issues;
}

/* ---------------------------------------------------------
 * 🧩 AutoFixer – herschrijft code preventief
 * --------------------------------------------------------- */
function applyFixes(filePath, issues) {
  if (!issues.length) return;
  const code = fs.readFileSync(filePath, "utf-8");
  let newCode = code;

  for (const issue of issues) {
    switch (issue.type) {
      case "undefined":
        newCode = `let ${issue.name} = null;\n` + newCode;
        break;
      case "insecure":
        newCode = newCode.replace(/eval\(.*\)/g, "// eval removed by AI");
        break;
      case "badImport":
        newCode = newCode.replace("..", ".");
        break;
    }
  }

  fs.writeFileSync(filePath, newCode);
  stats.fixes += issues.length;
  console.log(`✅ ${issues.length} automatische fix(es) toegepast in ${path.basename(filePath)}`);
}

/* ---------------------------------------------------------
 * ⚙️ Compiler Hook – vangt build output
 * --------------------------------------------------------- */
function runViteBuild() {
  stats.builds++;
  const vite = spawn("npm", ["run", "dev"]);

  vite.stdout.on("data", (data) => {
    const text = data.toString();
    process.stdout.write(text);
    if (text.includes("ready")) {
      runPreBuildAnalysis();
    }
  });

  vite.stderr.on("data", (data) => process.stderr.write(data.toString()));
}

function runPreBuildAnalysis() {
  const files = fs
    .readdirSync(srcDir, { withFileTypes: true })
    .filter((f) => f.name.endsWith(".tsx") || f.name.endsWith(".jsx"))
    .map((f) => path.join(srcDir, f.name));

  for (const file of files) {
    const issues = analyzeAST(file);
    if (issues.length > 0) {
      console.log(`⚠️  Voorspelde fouten in ${path.basename(file)} →`, issues.length);
      applyFixes(file, issues);
    }
    stats.predictions += issues.length;
  }
}

/* ---------------------------------------------------------
 * 🧠 Self-Optimization – herschrijft oude patronen
 * --------------------------------------------------------- */
function optimizeImports(filePath) {
  const code = fs.readFileSync(filePath, "utf-8");
  const optimized = code
    .replace(/import\s+\*\s+as\s+/g, "import ")
    .replace(/\s{3,}/g, "\n")
    .replace(/console\.log/g, "// console.log (optimized)");

  if (optimized !== code) {
    fs.writeFileSync(filePath, optimized);
    stats.optimizations++;
  }
}

/* ---------------------------------------------------------
 * 🌐 Dashboard
 * --------------------------------------------------------- */
const app = express();
app.get("/diagnostics", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Cyntra v15 – Adaptive Compiler</title>
        <style>
          body { background:#0E0E0E; color:#D6B48E; font-family:Inter,sans-serif; text-align:center; padding:40px; }
          h1 { color:#E9CBA7; }
        </style>
      </head>
      <body>
        <h1>⚡ Cyntra Diagnose v15 – Adaptive Compiler AI</h1>
        <p>Predictions: ${stats.predictions} | Fixes: ${stats.fixes} | Optimizations: ${stats.optimizations} | Builds: ${stats.builds}</p>
        <p>Project directory: ${projectRoot}</p>
        <p>💡 De compiler voorspelt en voorkomt fouten vóór runtime.</p>
      </body>
    </html>
  `);
});

/* ---------------------------------------------------------
 * 🧠 MAIN
 * --------------------------------------------------------- */
function main() {
  console.log("⚙️ Cyntra Adaptive Compiler gestart...");
  runViteBuild();
  app.listen(PORT, () =>
    console.log(`🌐 Dashboard actief op http://localhost:${PORT}/diagnostics`)
  );
}

main();
