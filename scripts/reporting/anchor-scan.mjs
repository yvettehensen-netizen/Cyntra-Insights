#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

function arg(name) {
  const idx = process.argv.indexOf(`--${name}`);
  return idx >= 0 ? process.argv[idx + 1] : '';
}

function read(p) {
  const abs = path.resolve(process.cwd(), p);
  return fs.readFileSync(abs, 'utf-8');
}

function uniq(a) { return [...new Set(a.filter(Boolean))]; }

function extractAnchors(text) {
  const roles = text.match(/\b(ceo|cfo|coo|chro|cto|rvb|raad van bestuur|directeur|manager|teamlead|planner|projectleider|igj|wachttijd|dashboard|intake|planning|instroomkader|consolidatie)\b/gi) ?? [];
  const names = text.match(/\b[A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,})*\b/g) ?? [];
  const numbers = text.match(/(?:€\s*\d[\d.,]*|\d+(?:[.,]\d+)?\s*%|\b\d+(?:[.,]\d+)?\b)/g) ?? [];
  return uniq([...roles, ...names, ...numbers]).slice(0, 200);
}

function contains(text, anchor) {
  return text.toLowerCase().includes(anchor.toLowerCase());
}

function sectionScores(output, anchors) {
  const matches = [...output.matchAll(/^###\s*(\d+)\.\s*([^\n]+)$/gm)];
  return matches.map((m, i) => {
    const start = (m.index ?? 0) + m[0].length;
    const end = matches[i + 1]?.index ?? output.length;
    const body = output.slice(start, end);
    const hits = anchors.filter((a) => contains(body, a)).length;
    return { section: Number(m[1]), heading: m[2], hits, score: anchors.length ? hits / anchors.length : 0 };
  });
}

const inputPath = arg('input');
const outputPath = arg('output');
if (!inputPath || !outputPath) {
  console.error('Usage: node scripts/reporting/anchor-scan.mjs --input <path> --output <path>');
  process.exit(1);
}

const input = read(inputPath);
const output = read(outputPath);
const inputAnchors = extractAnchors(input);
const outputAnchors = extractAnchors(output);

const missing = inputAnchors.filter((a) => !contains(output, a));
const unsupported = outputAnchors.filter((a) => !contains(input, a));

const result = {
  inputAnchorCount: inputAnchors.length,
  outputAnchorCount: outputAnchors.length,
  recall: inputAnchors.length ? (inputAnchors.length - missing.length) / inputAnchors.length : 1,
  precision: outputAnchors.length ? (outputAnchors.length - unsupported.length) / outputAnchors.length : 1,
  missingInputAnchors: missing.slice(0, 50),
  unsupportedOutputAnchors: unsupported.slice(0, 50),
  perSection: sectionScores(output, inputAnchors),
};

console.log(JSON.stringify(result, null, 2));
