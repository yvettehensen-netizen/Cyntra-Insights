#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const designTokensPath = path.resolve(process.cwd(), "src/design/cyntraDesignTokens.ts");
const designSystemPath = path.resolve(process.cwd(), "src/design/reportDesignSystem.ts");
const designBiblePath = path.resolve(process.cwd(), "docs/CYNTRA_DESIGN_BIBLE.md");
const reportViewStylesPath = path.resolve(process.cwd(), "src/components/reports/reportViewStyles.ts");
const reportPdfPath = path.resolve(process.cwd(), "src/services/reportPdf.ts");

const designTokens = fs.readFileSync(designTokensPath, "utf8");
const designSystem = fs.readFileSync(designSystemPath, "utf8");
const designBible = fs.readFileSync(designBiblePath, "utf8");
const reportViewStyles = fs.readFileSync(reportViewStylesPath, "utf8");
const reportPdf = fs.readFileSync(reportPdfPath, "utf8");

assert(/CyntraDesignTokens/.test(designTokens), "cyntra design tokens ontbreken");
assert(/blue: "#0B1F3A"/.test(designTokens), "design tokens missen Cyntra blue");
assert(/fontPrimary: "Aptos, 'Aptos Display', 'Segoe UI', Inter, system-ui, sans-serif"/.test(designTokens), "design tokens missen primaire font");
assert(/reportDesignSystem/.test(designSystem), "report design system ontbreekt");
assert(/import \{ CyntraDesignTokens \} from/.test(designSystem), "report design system gebruikt tokens niet");
assert(/useCardsForParagraphs: false/.test(designSystem), "design system laat boxed paragrafen nog toe");
assert(/allowedAccentLists/.test(designSystem), "design system mist accentregels");
assert(/import \{ CyntraDesignTokens \} from/.test(reportViewStyles), "report view styles gebruikt tokens niet");
assert(!/#C6A461|#D7B56D|#0B1F3A|#F5F6F8/.test(reportViewStyles), "report view styles bevatten nog eigen hardcoded kleuren");
assert(/import \{ CyntraDesignTokens \} from/.test(reportPdf), "pdf renderer gebruikt tokens niet");

assert(/AI rapport = boxes\./.test(designBible), "design bible mist boardroom-principe");
assert(/Forbidden UI Patterns/.test(designBible), "design bible mist forbidden patterns");
assert(/PDF Principles/.test(designBible), "design bible mist pdf-richtlijnen");
assert(/cyntraDesignTokens\.ts/.test(designBible), "design bible verwijst niet naar centrale tokens");

console.log("report design bible regression passed");
