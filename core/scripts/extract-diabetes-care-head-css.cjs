// @ts-check
/**
 * Writes `public/archive/diabetes-care-head.css` with every `<style>` from the **storefront**
 * slice of `diabetes-care.html`: from the start of the file through the end of the first `<body>`
 * (before a second `<body>` when SingleFile includes Shopify admin). Includes head **and** in-body
 * section `<style>` blocks — not head-only.
 */
const { existsSync, readFileSync, writeFileSync, mkdirSync } = require('fs');
const { join } = require('path');

const root = join(__dirname, '..');
const archiveDir = join(root, 'public', 'archive');
const htmlPath = join(archiveDir, 'diabetes-care.html');
const cssPath = join(archiveDir, 'diabetes-care-head.css');

if (!existsSync(htmlPath)) {
  process.stderr.write('[extract-diabetes-care-head-css] Missing public/archive/diabetes-care.html\n');
  process.exit(1);
}

const html = readFileSync(htmlPath, 'utf-8');
const bodyOpens = [...html.matchAll(/<body[^>]*>/gi)];
const firstOpen = bodyOpens.at(0);

if (firstOpen == null) {
  process.stderr.write('[extract-diabetes-care-head-css] No <body> in archive\n');
  process.exit(1);
}

const firstBodyStart = html.indexOf(firstOpen[0]);

if (firstBodyStart === -1) {
  process.stderr.write('[extract-diabetes-care-head-css] Invalid <body> match\n');
  process.exit(1);
}

const afterFirstBody = firstBodyStart + firstOpen[0].length;
const secondOpen = bodyOpens[1];
const secondBodyStart =
  secondOpen !== undefined ? html.indexOf(secondOpen[0], afterFirstBody) : -1;

const sliceEnd = secondBodyStart !== -1 ? secondBodyStart : html.length;
const storefrontHtml = html.slice(0, sliceEnd);

const blocks = [];
const styleRe = /<style[^>]*>([\s\S]*?)<\/style>/gi;
let m = styleRe.exec(storefrontHtml);

while (m !== null) {
  blocks.push(m[1] ?? '');
  m = styleRe.exec(storefrontHtml);
}

const out = blocks.join('\n\n');

if (!existsSync(archiveDir)) {
  mkdirSync(archiveDir, { recursive: true });
}

/** Skip write when unchanged so `pnpm dev` (which runs this script) does not bump mtime / confuse git. */
if (existsSync(cssPath) && readFileSync(cssPath, 'utf-8') === out) {
  process.stdout.write(
    `[extract-diabetes-care-head-css] Up to date ${cssPath} (${blocks.length} <style> blocks)\n`,
  );
} else {
  writeFileSync(cssPath, out, 'utf-8');
  process.stdout.write(
    `[extract-diabetes-care-head-css] Wrote ${cssPath} (${blocks.length} <style> blocks, ${out.length} bytes; storefront slice 0..${sliceEnd})\n`,
  );
}
