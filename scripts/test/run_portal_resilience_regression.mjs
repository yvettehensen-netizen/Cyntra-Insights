#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const main = read("src/main.tsx");
assert(main.includes("<GlobalErrorBoundary>"), "main mist GlobalErrorBoundary");
assert(main.includes("<ChunkRecovery />"), "main mist ChunkRecovery");

const app = read("src/App.tsx");
assert(app.includes('import PortalErrorBoundary from "./components/PortalErrorBoundary";'), "App mist PortalErrorBoundary import");
assert(app.includes("<PortalErrorBoundary><PortalLayout /></PortalErrorBoundary>"), "PortalLayout draait niet achter PortalErrorBoundary");

const portalGuard = read("src/aurelius/guards/PortalGuard.tsx");
assert(portalGuard.includes("AUTH_BOOTSTRAP_TIMEOUT_MS = 4000"), "PortalGuard mist auth-timeout");
assert(portalGuard.includes("to={AUTH_LOGIN_PATH}"), "PortalGuard gebruikt AUTH_LOGIN_PATH niet");
assert(portalGuard.includes("Authenticatie kon niet stabiel worden geladen."), "PortalGuard mist recovery-state");

const globalBoundary = read("src/components/GlobalErrorBoundary.tsx");
assert(globalBoundary.includes('window.addEventListener("unhandledrejection"'), "GlobalErrorBoundary mist rejection recovery");
assert(globalBoundary.includes('window.addEventListener("error"'), "GlobalErrorBoundary mist global error recovery");

console.log("portal resilience regression passed");
