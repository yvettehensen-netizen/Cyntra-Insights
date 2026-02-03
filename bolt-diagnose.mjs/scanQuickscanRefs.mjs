// scanQuickscanRefs.mjs
// 🔍 Script om alle verwijzingen naar "Quickscan" te vinden in je project

import fs from "fs";
import path from "path";

const rootDir = path.resolve("./src");
const searchTerm = /quickscan/gi;
let matches = [];

function scanDir(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      scanDir(fullPath);
    } else if (stats.isFile() && /\.(tsx|ts|jsx|js|html|json)$/.test(file)) {
      const content = fs.readFileSync(fullPath, "utf8");
      if (searchTerm.test(content)) {
        matches.push({
          file: fullPath,
          count: (content.match(searchTerm) || []).length,
        });
      }
    }
  }
}

console.log("🔍 Scannen naar 'Quickscan' verwijzingen...");
scanDir(rootDir);

if (matches.length > 0) {
  console.log(`\n📄 Gevonden in ${matches.length} bestanden:\n`);
  matches.forEach((m) => {
    console.log(`➡️ ${m.file} (${m.count} keer)`);
  });

  console.log(`
---------------------------------------------------------
💡 Tip: wil je deze automatisch vervangen met "PerformanceScan"?
Voeg dan deze regel toe onderaan dit script:

replaceAll("Quickscan", "PerformanceScan");

---------------------------------------------------------
`);
} else {
  console.log("✅ Geen verwijzingen meer naar 'Quickscan' gevonden!");
}

// (optioneel) vervangfunctie
function replaceAll(from, to) {
  matches.forEach(({ file }) => {
    let content = fs.readFileSync(file, "utf8");
    const newContent = content.replace(new RegExp(from, "g"), to);
    fs.writeFileSync(file, newContent, "utf8");
    console.log(`📝 ${file} → vervangen`);
  });
}
