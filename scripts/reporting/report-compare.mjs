#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

function arg(name) {
  const idx = process.argv.indexOf(`--${name}`);
  return idx >= 0 ? process.argv[idx + 1] : '';
}

function read(p) {
  return fs.readFileSync(path.resolve(process.cwd(), p), 'utf-8');
}

function norm(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9\s]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function ngrams(text, n = 4) {
  const w = norm(text).split(' ').filter(Boolean);
  const set = new Set();
  for (let i = 0; i <= w.length - n; i += 1) set.add(w.slice(i, i + n).join(' '));
  return set;
}

function overlap(a, b) {
  const A = ngrams(a);
  const B = ngrams(b);
  if (!A.size || !B.size) return 0;
  let c = 0;
  for (const g of A) if (B.has(g)) c += 1;
  return c / Math.min(A.size, B.size);
}

function anchors(text) {
  const roles = text.match(/\b(ceo|cfo|coo|rvb|directeur|manager|igj|wachttijd|dashboard|intake|planning|contract)\b/gi) ?? [];
  const names = text.match(/\b[A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,})*\b/g) ?? [];
  const numbers = text.match(/(?:€\s*\d[\d.,]*|\d+(?:[.,]\d+)?\s*%|\b\d+(?:[.,]\d+)?\b)/g) ?? [];
  return [...new Set([...roles, ...names, ...numbers].map((x) => x.toLowerCase()))];
}

function section8Uniqueness(text) {
  const m = [...text.matchAll(/^###\s*8\.\s*[^\n]+$/gm)][0];
  if (!m) return 0;
  const start = (m.index ?? 0) + m[0].length;
  const rest = text.slice(start);
  const next = rest.search(/^###\s*9\./m);
  const section = next >= 0 ? rest.slice(0, next) : rest;
  const actions = section.split(/\bActie:/g).map((s) => norm(s).slice(0, 180)).filter(Boolean);
  if (!actions.length) return 0;
  return new Set(actions).size / actions.length;
}

const aPath = arg('a');
const bPath = arg('b');
const inputPath = arg('input');
if (!aPath || !bPath) {
  console.error('Usage: node scripts/reporting/report-compare.mjs --a <path> --b <path> [--input <path>]');
  process.exit(1);
}

const a = read(aPath);
const b = read(bPath);
const input = inputPath ? read(inputPath) : '';
const baseAnchors = input ? anchors(input) : anchors(a);
const bAnchors = anchors(b);
let shared = 0;
for (const anchor of baseAnchors) if (bAnchors.includes(anchor)) shared += 1;

const result = {
  repetitionRatio: overlap(a, b),
  anchorOverlap: baseAnchors.length ? shared / baseAnchors.length : 0,
  section8InterventionUniquenessA: section8Uniqueness(a),
  section8InterventionUniquenessB: section8Uniqueness(b),
};

console.log(JSON.stringify(result, null, 2));
