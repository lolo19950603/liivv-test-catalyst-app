// @ts-check
/**
 * Writes `public/archive/diabetes-care-head.css` from `<style>` tags in the
 * `<head>` region of `public/archive/diabetes-care.html` (SingleFile export).
 *
 * Keeps megabytes of CSS out of the React Server Components tree on
 * `/diabetes-care-editable`, which avoids huge Flight payloads and dev OOMs.
 */
const { existsSync, readFileSync, writeFileSync, mkdirSync } = require('fs');
const { dirname, join } = require('path');

const root = join(__dirname, '..');
const archiveDir = join(root, 'public', 'archive');
const htmlPath = join(archiveDir, 'diabetes-care.html');
const cssPath = join(archiveDir, 'diabetes-care-head.css');

if (!existsSync(htmlPath)) {
  process.stdout.write(
    '[extract-diabetes-care-head-css] Skip: no public/archive/diabetes-care.html\n',
  );
  process.exit(0);
}

const html = readFileSync(htmlPath, 'utf-8');
const bodyOpens = [...html.matchAll(/<body[^>]*>/gi)];
const firstOpen = bodyOpens.at(0);

if (firstOpen == null) {
  process.stderr.write('[extract-diabetes-care-head-css] Error: no <body> in archive\n');
  process.exit(1);
}

const firstBodyStart = html.indexOf(firstOpen[0]);

if (firstBodyStart === -1) {
  process.stderr.write('[extract-diabetes-care-head-css] Error: invalid <body> match\n');
  process.exit(1);
}

const headFragment = html.slice(0, firstBodyStart);
const headStyles = [];
const styleRe = /<style[^>]*>([\s\S]*?)<\/style>/gi;
let styleMatch = styleRe.exec(headFragment);

while (styleMatch !== null) {
  headStyles.push(styleMatch[1] ?? '');
  styleMatch = styleRe.exec(headFragment);
}

const out = headStyles.join('\n\n');

if (!existsSync(archiveDir)) {
  mkdirSync(archiveDir, { recursive: true });
}

writeFileSync(cssPath, out, 'utf-8');
process.stdout.write(
  `[extract-diabetes-care-head-css] Wrote ${cssPath} (${headStyles.length} style blocks, ${out.length} bytes)\n`,
);
