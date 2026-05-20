// @ts-check
/**
 * Extracts logo-list images from `diabetes-care.html` (--sf-img-30 … 34) into
 * `public/archive/diabetes-care-logos/` as PNG for Makeswift defaults.
 */
const { existsSync, mkdirSync, readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

const root = join(__dirname, '..');
const htmlPath = join(root, 'public', 'archive', 'diabetes-care.html');
const outDir = join(root, 'public', 'archive', 'diabetes-care-logos');

if (!existsSync(htmlPath)) {
  process.stderr.write('[extract-diabetes-care-logo-images] Missing diabetes-care.html\n');
  process.exit(1);
}

const html = readFileSync(htmlPath, 'utf-8');
const ids = ['30', '31', '32', '33', '34'];
const labels = ['dexcom', 'brand-2', 'brand-3', 'brand-4', 'brand-5'];

if (!existsSync(outDir)) {
  mkdirSync(outDir, { recursive: true });
}

for (let i = 0; i < ids.length; i += 1) {
  const id = ids[i];
  const re = new RegExp(`--sf-img-${id}:\\s*url\\("([^"]+)"\\)`);
  const m = html.match(re);

  if (m == null || m[1] == null) {
    process.stderr.write(`[extract-diabetes-care-logo-images] Missing --sf-img-${id}\n`);
    process.exit(1);
  }

  const dataUrl = m[1];

  if (!dataUrl.startsWith('data:image/')) {
    process.stderr.write(`[extract-diabetes-care-logo-images] Unexpected format for --sf-img-${id}\n`);
    process.exit(1);
  }

  const comma = dataUrl.indexOf(',');
  const header = dataUrl.slice(0, comma);
  const payload = dataUrl.slice(comma + 1);
  const ext = header.includes('avif')
    ? 'avif'
    : header.includes('webp')
      ? 'webp'
      : header.includes('png')
        ? 'png'
        : 'bin';
  const outPath = join(outDir, `${labels[i]}.${ext}`);

  writeFileSync(outPath, Buffer.from(payload, 'base64'));
  process.stdout.write(`[extract-diabetes-care-logo-images] Wrote ${outPath}\n`);
}
