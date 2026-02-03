#!/usr/bin/env node
/**
 * 🧩 Cyntra Diagnose v16 — Predictive IDE Agent
 * ---------------------------------------------
 * 🧠 Realtime AI-assistent in je editor
 * 💬 Inline feedback en live refactoring
 * ⚙️ Lokaal, snel en zonder internet
 */

import { WebSocketServer } from "ws";
import fs from "fs";
import path from "path";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";

const projectRoot = process.cwd();
const PORT = 6060;
let activeUsers = new Map();
let issues = [];

/* ---------------------------------------------------------
 * ⚙️ WebSocket Bridge – verbindt met VS Code / Bolt plugin
 * --------------------------------------------------------- */
const wss = new WebSocketServer({ port: PORT });
wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    const data = JSON.parse(message);
    if (data.type === "CODE_UPDATE") handleCodeUpdate(ws, data);
  });
  ws.send(JSON.stringify({ type: "CONNECTED", msg: "Cyntra IDE Agent actief 🧠" }));
});

console.log(`🧩 Cyntra IDE Agent v16 draait op ws://localhost:${PORT}`);

/* ---------------------------------------------------------
 * 🧠 Analyseer code bij elke wijziging
 * --------------------------------------------------------- */
function handleCodeUpdate(ws, { file, code }) {
  const ast = parse(code, { sourceType: "module", plugins: ["jsx", "typescript"] });
  const localIssues = [];

  traverse(ast, {
    Identifier(path) {
      if (path.node.name === "teh" || path.node.name === "datta") {
        localIssues.push({
          type: "typo",
          message: `Typo gevonden: "${path.node.name}" → mogelijk bedoelde je "the" of "data"`,
        });
      }
    },
    FunctionDeclaration(path) {
      const name = path.node.id?.name;
      if (name && name.match(/test|tmp/gi)) {
        localIssues.push({
          type: "naming",
          message: `Functienaam "${name}" lijkt tijdelijk of onduidelijk.`,
        });
      }
    },
    CallExpression(path) {
      if (path.node.callee.name === "eval") {
        localIssues.push({
          type: "security",
          message: `Gebruik van eval() gevonden — onveilig. Vermijd dit.`,
        });
      }
    },
  });

  issues = localIssues;
  sendFeedback(ws, localIssues);
}

/* ---------------------------------------------------------
 * 💬 Feedback direct naar IDE sturen
 * --------------------------------------------------------- */
function sendFeedback(ws, issues) {
  if (issues.length === 0) {
    ws.send(JSON.stringify({ type: "FEEDBACK", msg: "✅ Geen problemen gedetecteerd" }));
  } else {
    ws.send(
      JSON.stringify({
        type: "FEEDBACK",
        msg: `⚠️ ${issues.length} potentiële problemen gevonden`,
        details: issues,
      })
    );
  }
}

/* ---------------------------------------------------------
 * 🧩 Mini Dashboard
 * --------------------------------------------------------- */
import express from "express";
const app = express();
app.get("/ide-status", (req, res) => {
  res.send(`
    <html>
      <head><title>Cyntra v16 – IDE Agent</title></head>
      <body style="background:#0E0E0E;color:#D6B48E;font-family:Inter;text-align:center;padding:40px;">
        <h1>🧩 Cyntra Diagnose v16 – Predictive IDE Agent</h1>
        <p>Live verbindingen: ${activeUsers.size}</p>
        <p>Laatste scan: ${issues.length} issues</p>
        <pre>${issues.map((i) => "- " + i.message).join("\\n")}</pre>
      </body>
    </html>
  `);
});
app.listen(5050, () =>
  console.log("🌐 IDE Dashboard: http://localhost:5050/ide-status")
);
