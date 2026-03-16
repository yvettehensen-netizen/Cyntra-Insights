import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function formatInline(value) {
  let out = escapeHtml(value);
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return out;
}

function closeLists(state, blocks) {
  if (state.inUl) {
    blocks.push('</ul>');
    state.inUl = false;
  }
  if (state.inOl) {
    blocks.push('</ol>');
    state.inOl = false;
  }
}

function markdownToHtml(markdown) {
  const lines = String(markdown ?? '').replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  const state = { inUl: false, inOl: false, inCode: false };

  for (const rawLine of lines) {
    const line = rawLine ?? '';

    if (line.trim().startsWith('```')) {
      closeLists(state, blocks);
      if (!state.inCode) {
        state.inCode = true;
        blocks.push('<pre><code>');
      } else {
        state.inCode = false;
        blocks.push('</code></pre>');
      }
      continue;
    }

    if (state.inCode) {
      blocks.push(`${escapeHtml(line)}\n`);
      continue;
    }

    if (!line.trim()) {
      closeLists(state, blocks);
      blocks.push('<div class="spacer"></div>');
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      closeLists(state, blocks);
      const level = heading[1].length;
      blocks.push(`<h${level}>${formatInline(heading[2])}</h${level}>`);
      continue;
    }

    const checklist = line.match(/^\s*[-*]\s+\[( |x|X)\]\s+(.*)$/);
    if (checklist) {
      if (state.inOl) {
        blocks.push('</ol>');
        state.inOl = false;
      }
      if (!state.inUl) {
        state.inUl = true;
        blocks.push('<ul>');
      }
      const box = checklist[1].toLowerCase() === 'x' ? '&#x2611;' : '&#x2610;';
      blocks.push(`<li>${box} ${formatInline(checklist[2])}</li>`);
      continue;
    }

    const ul = line.match(/^\s*[-*]\s+(.*)$/);
    if (ul) {
      if (state.inOl) {
        blocks.push('</ol>');
        state.inOl = false;
      }
      if (!state.inUl) {
        state.inUl = true;
        blocks.push('<ul>');
      }
      blocks.push(`<li>${formatInline(ul[1])}</li>`);
      continue;
    }

    const ol = line.match(/^\s*\d+\.\s+(.*)$/);
    if (ol) {
      if (state.inUl) {
        blocks.push('</ul>');
        state.inUl = false;
      }
      if (!state.inOl) {
        state.inOl = true;
        blocks.push('<ol>');
      }
      blocks.push(`<li>${formatInline(ol[1])}</li>`);
      continue;
    }

    closeLists(state, blocks);
    blocks.push(`<p>${formatInline(line)}</p>`);
  }

  closeLists(state, blocks);

  return `<!doctype html>
<html lang="nl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    :root { color-scheme: light; }
    body {
      margin: 0;
      padding: 28px 34px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
      color: #111827;
      line-height: 1.45;
      font-size: 11.2pt;
      background: #ffffff;
    }
    h1 { font-size: 18pt; margin: 0 0 10px 0; }
    h2 { font-size: 14pt; margin: 18px 0 8px 0; }
    h3 { font-size: 12pt; margin: 14px 0 6px 0; }
    h4, h5, h6 { font-size: 11.5pt; margin: 12px 0 6px 0; }
    p { margin: 0 0 6px 0; }
    ul, ol { margin: 4px 0 8px 18px; padding: 0; }
    li { margin: 0 0 4px 0; }
    code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 10pt;
      background: #f3f4f6;
      padding: 1px 4px;
      border-radius: 4px;
    }
    pre {
      white-space: pre-wrap;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      padding: 10px;
      border-radius: 8px;
      overflow-wrap: anywhere;
      margin: 6px 0;
    }
    .spacer { height: 6px; }
    @page { size: A4; margin: 14mm; }
  </style>
</head>
<body>
${blocks.join('\n')}
</body>
</html>`;
}

async function main() {
  const [inputPath, outputPathArg] = process.argv.slice(2);
  if (!inputPath) {
    console.error('Usage: node scripts/export-md-pdf.mjs <input.md> [output.pdf]');
    process.exit(1);
  }

  const inputAbs = path.resolve(process.cwd(), inputPath);
  const outputAbs = outputPathArg
    ? path.resolve(process.cwd(), outputPathArg)
    : inputAbs.replace(/\.md$/i, '.pdf');

  const markdown = await fs.readFile(inputAbs, 'utf8');
  const html = markdownToHtml(markdown);

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.pdf({
      path: outputAbs,
      format: 'A4',
      printBackground: true,
      margin: { top: '14mm', bottom: '14mm', left: '14mm', right: '14mm' },
    });
  } finally {
    await browser.close();
  }

  console.log(`PDF generated: ${outputAbs}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
