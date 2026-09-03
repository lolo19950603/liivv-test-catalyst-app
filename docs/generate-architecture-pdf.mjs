/**
 * Build docs/Liivv-Architecture.html and docs/Liivv-Architecture.pdf
 * from docs/Liivv-Architecture.md (single IT pack).
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const documents = [
  {
    md: 'Liivv-Architecture.md',
    html: 'Liivv-Architecture.html',
    pdf: 'Liivv-Architecture.pdf',
    title: 'Liivv — Architecture (IT)',
  },
];

function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function inlineFormat(text) {
  let out = escapeHtml(text);
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return out;
}

function parseTable(rows) {
  const parsed = rows.map((row) =>
    row
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((cell) => cell.trim()),
  );
  const header = parsed[0] ?? [];
  const body = parsed.slice(2);
  const thead = `<tr>${header.map((c) => `<th>${inlineFormat(c)}</th>`).join('')}</tr>`;
  const tbody = body
    .map((cols) => `<tr>${cols.map((c) => `<td>${inlineFormat(c)}</td>`).join('')}</tr>`)
    .join('\n');

  return `<table><thead>${thead}</thead><tbody>${tbody}</tbody></table>`;
}

function markdownToBody(md) {
  const lines = md.replaceAll('\r\n', '\n').split('\n');
  const html = [];
  let i = 0;
  let inList = false;
  let listTag = 'ul';

  const closeList = () => {
    if (inList) {
      html.push(`</${listTag}>`);
      inList = false;
    }
  };

  while (i < lines.length) {
    const line = lines[i] ?? '';

    if (line.startsWith('```mermaid')) {
      closeList();
      const chunk = [];
      i += 1;
      while (i < lines.length && lines[i] !== '```') {
        chunk.push(lines[i]);
        i += 1;
      }
      html.push(`<div class="mermaid">${chunk.join('\n')}</div>`);
      i += 1;
      continue;
    }

    if (line.startsWith('```')) {
      closeList();
      const chunk = [];
      i += 1;
      while (i < lines.length && lines[i] !== '```') {
        chunk.push(lines[i]);
        i += 1;
      }
      html.push(`<pre class="code"><code>${escapeHtml(chunk.join('\n'))}</code></pre>`);
      i += 1;
      continue;
    }

    if (line.startsWith('| ')) {
      closeList();
      const rows = [];
      while (i < lines.length && lines[i]?.startsWith('|')) {
        rows.push(lines[i] ?? '');
        i += 1;
      }
      html.push(parseTable(rows));
      continue;
    }

    const img = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (img) {
      closeList();
      const src = img[2] ?? '';
      const caption = img[1] ?? '';
      const svgPath = join(root, 'docs', src);
      if (src.endsWith('.svg') && existsSync(svgPath)) {
        const svg = readFileSync(svgPath, 'utf8')
          .replace(/^\uFEFF/, '')
          .replace(/<\?xml[^>]*>/, '');
        html.push(
          `<figure class="diagram">${svg}<figcaption>${escapeHtml(caption)}</figcaption></figure>`,
        );
      } else {
        html.push(
          `<figure class="diagram"><p><strong>Diagram:</strong> ${escapeHtml(caption)}</p></figure>`,
        );
      }
      i += 1;
      continue;
    }

    if (line === '---') {
      closeList();
      html.push('<hr />');
      i += 1;
      continue;
    }

    if (line.startsWith('# ')) {
      closeList();
      html.push(`<h1>${inlineFormat(line.slice(2))}</h1>`);
      i += 1;
      continue;
    }

    if (line.startsWith('## ')) {
      closeList();
      html.push(`<h2>${inlineFormat(line.slice(3))}</h2>`);
      i += 1;
      continue;
    }

    if (line.startsWith('### ')) {
      closeList();
      html.push(`<h3>${inlineFormat(line.slice(4))}</h3>`);
      i += 1;
      continue;
    }

    const ul = line.match(/^[-*] (.+)$/);
    if (ul) {
      if (!inList || listTag !== 'ul') {
        closeList();
        html.push('<ul>');
        inList = true;
        listTag = 'ul';
      }
      html.push(`<li>${inlineFormat(ul[1] ?? '')}</li>`);
      i += 1;
      continue;
    }

    const ol = line.match(/^(\d+)\. (.+)$/);
    if (ol) {
      if (!inList || listTag !== 'ol') {
        closeList();
        html.push('<ol>');
        inList = true;
        listTag = 'ol';
      }
      html.push(`<li>${inlineFormat(ol[2] ?? '')}</li>`);
      i += 1;
      continue;
    }

    if (line.trim() === '') {
      closeList();
      i += 1;
      continue;
    }

    closeList();
    html.push(`<p>${inlineFormat(line)}</p>`);
    i += 1;
  }

  closeList();

  return html.join('\n');
}

const css = `
  @page { size: letter; margin: 0.65in 0.7in; }
  * { box-sizing: border-box; }
  body {
    font-family: "Segoe UI", Calibri, Helvetica, Arial, sans-serif;
    font-size: 10.5pt;
    line-height: 1.42;
    color: #1a1a1a;
    max-width: 760px;
    margin: 0 auto;
  }
  h1 { font-size: 20pt; font-weight: 650; margin: 0 0 10pt; letter-spacing: -0.02em; }
  h2 { font-size: 13.5pt; font-weight: 650; margin: 20pt 0 8pt; page-break-after: avoid; }
  h3 { font-size: 11.5pt; font-weight: 650; margin: 14pt 0 6pt; page-break-after: avoid; }
  p, ul, ol { margin: 0 0 8pt; }
  li { margin-bottom: 2pt; }
  hr { border: 0; border-top: 1px solid #d0d0d0; margin: 14pt 0; }
  table { width: 100%; border-collapse: collapse; margin: 8pt 0 12pt; font-size: 9pt; page-break-inside: auto; }
  th, td { text-align: left; vertical-align: top; padding: 5pt 6pt; border-bottom: 1px solid #e2e2e2; }
  th { font-weight: 650; border-bottom: 1.5px solid #1a1a1a; }
  strong { font-weight: 650; }
  code { font-family: Consolas, "Courier New", monospace; font-size: 9pt; }
  pre.code { background: #f6f5f2; padding: 8pt 10pt; overflow: hidden; font-size: 8pt; }
  .mermaid { margin: 10pt 0 14pt; page-break-inside: avoid; }
  svg { max-width: 100%; }
  figure.diagram { margin: 10pt 0 14pt; page-break-inside: avoid; }
  figure.diagram svg { width: 100%; height: auto; display: block; }
  figcaption { font-size: 9pt; color: #555; margin-top: 4pt; }
`;

function buildHtml(title, body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>${css}</style>
</head>
<body>
${body}
<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
  mermaid.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'strict' });
  try {
    await mermaid.run({ querySelector: '.mermaid' });
  } catch (error) {
    console.error(error);
  }
  window.__mermaidDone = true;
</script>
</body>
</html>
`;
}

const built = documents.map((doc) => {
  const mdPath = join(root, 'docs', doc.md);
  const htmlPath = join(root, 'docs', doc.html);
  const pdfPath = join(root, 'docs', doc.pdf);
  const md = readFileSync(mdPath, 'utf8');
  const html = buildHtml(doc.title, markdownToBody(md));

  writeFileSync(htmlPath, html, 'utf8');
  process.stdout.write(`Wrote ${htmlPath}\n`);

  return { htmlPath, pdfPath };
});

const playwrightDir = join(
  root,
  'node_modules',
  '.pnpm',
  'playwright@1.52.0',
  'node_modules',
  'playwright',
);

if (!existsSync(join(playwrightDir, 'package.json'))) {
  process.stderr.write('Playwright not found; skipped PDF generation.\n');
  process.exit(0);
}

const require = createRequire(join(playwrightDir, 'package.json'));
const { chromium } = require(playwrightDir);

const browser = await chromium.launch({ channel: 'msedge' });

for (const doc of built) {
  const page = await browser.newPage();
  page.setDefaultTimeout(60_000);
  await page.goto(pathToFileURL(doc.htmlPath).href, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__mermaidDone === true);
  await page.evaluate(async () => {
    await Promise.all(
      [...document.images].map((image) =>
        image.complete
          ? Promise.resolve()
          : new Promise((resolve) => {
              image.addEventListener('load', resolve, { once: true });
              image.addEventListener('error', resolve, { once: true });
            }),
      ),
    );
  });
  let pdfPath = doc.pdfPath;
  try {
    await page.pdf({
      path: pdfPath,
      format: 'Letter',
      printBackground: true,
      margin: { top: '0.55in', bottom: '0.55in', left: '0.6in', right: '0.6in' },
    });
  } catch (error) {
    if (error && error.code === 'EBUSY') {
      pdfPath = doc.pdfPath.replace(/\.pdf$/i, '-refresh.pdf');
      await page.pdf({
        path: pdfPath,
        format: 'Letter',
        printBackground: true,
        margin: { top: '0.55in', bottom: '0.55in', left: '0.6in', right: '0.6in' },
      });
      process.stderr.write(`Locked ${doc.pdfPath}; wrote ${pdfPath} instead. Close the PDF and replace the original.\n`);
    } else {
      throw error;
    }
  }
  await page.close();

  process.stdout.write(`Wrote ${pdfPath}\n`);
}

await browser.close();
