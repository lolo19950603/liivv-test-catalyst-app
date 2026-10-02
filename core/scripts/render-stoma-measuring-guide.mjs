/**
 * Draws the Liivv paper stoma measuring guide.
 *
 * Run from the repo root:
 *   node core/scripts/render-stoma-measuring-guide.mjs
 *
 * Writes:
 *   core/public/archive/ostomy-care/stoma-measuring-guide-en.pdf
 *   core/public/archive/ostomy-care/stoma-measuring-guide-fr.pdf
 *
 * The shaded disk of each opening is the labelled millimetre, in PDF points
 * (72 points = 1 inch). The inch name is the trade name pouch makers use for
 * that opening, not a second measurement. A 100 mm bar is the check: if a
 * ruler does not read 100 mm, the sheet was scaled and must not be cut.
 *
 * The page is portrait US Letter and the background stays white. A full-bleed
 * colour makes some printers switch to "fit" and the holes stop being true.
 * The largest openings sit on their own rows so a 76 mm disk is never scaled
 * down to fit a line of smaller ones.
 *
 * Standard fonts only, so the file has no embedded typeface to reflow the
 * layout. WinAnsi covers the French accents used here; an em dash does not,
 * so the sentences use a hyphen.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE = join(HERE, '..');
const OUT_DIR = join(CORE, 'public', 'archive', 'ostomy-care');

const coreRequire = createRequire(join(CORE, 'package.json'));
const { PDFDocument, StandardFonts, rgb } = coreRequire('pdf-lib');

/** 1 mm in PDF points. Every hole and the scale bar go through this. */
const MM = 72 / 25.4;
const mm = (value) => value * MM;

const PAGE_W = 8.5 * 72;
const PAGE_H = 11 * 72;
const MARGIN = mm(9);

const INK = rgb(0x31 / 255, 0x2f / 255, 0x2f / 255);
const SAND = rgb(0xd7 / 255, 0xcf / 255, 0xc7 / 255);
const BLUSH = rgb(0xf3 / 255, 0xc7 / 255, 0xbe / 255);

/*
 * Trade opening sizes. The disk is drawn at `mm`, which is the size printed
 * under it. `inch` is only the name.
 */
const OPENINGS = [
  { mm: 6, inch: '1/4' },
  { mm: 10, inch: '3/8' },
  { mm: 13, inch: '1/2' },
  { mm: 16, inch: '5/8' },
  { mm: 19, inch: '3/4' },
  { mm: 22, inch: '7/8' },
  { mm: 25, inch: '1' },
  { mm: 29, inch: '1-1/8' },
  { mm: 32, inch: '1-1/4' },
  { mm: 35, inch: '1-3/8' },
  { mm: 38, inch: '1-1/2' },
  { mm: 41, inch: '1-5/8' },
  { mm: 44, inch: '1-3/4' },
  { mm: 51, inch: '2' },
  { mm: 57, inch: '2-1/4' },
  { mm: 64, inch: '2-1/2' },
  { mm: 76, inch: '3' },
];

const ROWS = [
  [0, 1, 2, 3, 4, 5, 6, 7],
  [8, 9, 10, 11, 12],
  [13, 14],
  [15, 16],
];

const COPY = {
  en: {
    file: 'stoma-measuring-guide-en.pdf',
    title: 'Stoma measuring guide',
    subject: 'Paper stoma measuring guide. Print at actual size.',
    paragraphs: [
      'Print at 100% (Actual size). Do not choose Fit to page. If the 100 mm bar is not 100 mm on a ruler, do not cut this sheet.',
      'Cut out each shaded circle. Hold the sheet over the stoma and pick the closest hole that does not sit on the stoma. Your nurse sets how much gap is right. These holes are opening sizes, not a recommended gap.',
      'This does not replace the guide in the box, or a measurement by an NSWOC.',
    ],
    scale: '100 mm',
    ruler: 'Length and width, for an oval stoma',
  },
  fr: {
    file: 'stoma-measuring-guide-fr.pdf',
    title: 'Guide de mesure de la stomie',
    subject: 'Guide de mesure en papier. Imprimer a taille reelle.',
    paragraphs: [
      'Imprimez \u00e0 100 % (taille r\u00e9elle). Ne choisissez pas Ajuster \u00e0 la page. Si la barre de 100 mm ne mesure pas 100 mm avec une r\u00e8gle, ne d\u00e9coupez pas cette feuille.',
      "D\u00e9coupez chaque cercle ombr\u00e9. Tenez la feuille au-dessus de la stomie et choisissez le trou le plus proche qui ne repose pas sur la stomie. Votre infirmi\u00e8re ou votre infirmier d\u00e9cide de l'espace. Ces trous sont des tailles d'ouverture, pas un espace recommand\u00e9.",
      'Ceci ne remplace pas le guide fourni dans la bo\u00eete, ni une mesure faite par une NSWOC.',
    ],
    scale: '100 mm',
    ruler: 'Longueur et largeur, pour une stomie ovale',
  },
};

function wrap(text, font, size, maxWidth) {
  const lines = [];
  let line = '';

  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word;

    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      line = next;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }

  if (line) lines.push(line);

  return lines;
}

function labelOf(opening) {
  return `${opening.inch}" (${opening.mm} mm)`;
}

async function render(copy) {
  const doc = await PDFDocument.create();
  const page = doc.addPage([PAGE_W, PAGE_H]);
  const helv = await doc.embedFont(StandardFonts.Helvetica);
  const times = await doc.embedFont(StandardFonts.TimesRoman);

  doc.setTitle(`Liivv - ${copy.title}`);
  doc.setAuthor('Liivv');
  doc.setSubject(copy.subject);

  const innerW = PAGE_W - MARGIN * 2;
  let y = PAGE_H - MARGIN;

  const brandSize = 16;
  y -= brandSize;
  page.drawText('Liivv', {
    x: MARGIN,
    y,
    size: brandSize,
    font: times,
    color: INK,
  });
  page.drawText(copy.title, {
    x: MARGIN + times.widthOfTextAtSize('Liivv', brandSize) + 12,
    y: y + 1,
    size: 13,
    font: helv,
    color: INK,
  });

  y -= 7;
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: MARGIN + mm(28), y },
    thickness: 2.2,
    color: BLUSH,
  });

  y -= 12;
  for (const paragraph of copy.paragraphs) {
    for (const line of wrap(paragraph, helv, 8, innerW)) {
      page.drawText(line, { x: MARGIN, y, size: 8, font: helv, color: INK });
      y -= 10;
    }
    y -= 2;
  }

  const footerTop = MARGIN + mm(13);
  const labelSize = 7;
  const labelGap = 6.5;
  const rowGap = mm(0.35);
  const minGap = mm(1);

  const rows = ROWS.map((indexes) => {
    const openings = indexes.map((index) => OPENINGS[index]);
    const cells = openings.map((opening) => {
      const diameter = mm(opening.mm);
      const label = labelOf(opening);
      const labelW = helv.widthOfTextAtSize(label, labelSize);

      return { opening, diameter, label, labelW, cell: Math.max(diameter, labelW) };
    });
    const sum = cells.reduce((total, cell) => total + cell.cell, 0);
    const gaps = cells.length - 1;
    const gap = gaps === 0 ? 0 : Math.min(mm(8), (innerW - sum) / gaps);

    if (gap < minGap - 0.01) {
      throw new Error(`${copy.file}: a row is ${(sum + minGap * gaps - innerW).toFixed(1)}pt too wide`);
    }

    const height = Math.max(...cells.map((cell) => cell.diameter)) + labelGap;

    return { cells, gap, height };
  });

  const blockHeight = rows.reduce((total, row) => total + row.height, 0) + rowGap * (rows.length - 1);
  const room = y - footerTop;

  if (blockHeight > room) {
    throw new Error(
      `${copy.file}: circles need ${blockHeight.toFixed(1)}pt and ${room.toFixed(1)}pt is free`,
    );
  }

  let rowTop = y;

  rows.forEach((row, index) => {
    const diameter = Math.max(...row.cells.map((cell) => cell.diameter));
    const rowWidth =
      row.cells.reduce((total, cell) => total + cell.cell, 0) + row.gap * (row.cells.length - 1);
    let x = MARGIN + (innerW - rowWidth) / 2;

    for (const cell of row.cells) {
      const radius = cell.diameter / 2;
      const cx = x + cell.cell / 2;
      const cy = rowTop - diameter / 2;
      const stroke = 0.9;

      page.drawCircle({ x: cx, y: cy, size: radius, color: SAND });
      page.drawCircle({
        x: cx,
        y: cy,
        size: radius - stroke / 2,
        borderColor: INK,
        borderWidth: stroke,
      });

      const labelW = cell.labelW;
      page.drawText(cell.label, {
        x: cx - labelW / 2,
        y: cy - radius - labelGap,
        size: labelSize,
        font: helv,
        color: INK,
      });

      if (Math.abs(radius - mm(cell.opening.mm) / 2) > 0.001) {
        throw new Error(`${copy.file}: ${cell.opening.mm} mm disk is not that size`);
      }

      x += cell.cell + row.gap;
    }

    rowTop -= row.height + (index < rows.length - 1 ? rowGap : 0);
  });

  if (rowTop < footerTop - 0.5) {
    throw new Error(`${copy.file}: circles overlap the scale bar`);
  }

  const barY = MARGIN + mm(11);
  const barLen = mm(100);

  if (Math.abs(barLen - 100 * MM) > 0.001) {
    throw new Error('scale bar is not 100 mm');
  }

  page.drawLine({
    start: { x: MARGIN, y: barY },
    end: { x: MARGIN + barLen, y: barY },
    thickness: 1.6,
    color: INK,
  });
  for (const tick of [MARGIN, MARGIN + barLen]) {
    page.drawLine({
      start: { x: tick, y: barY - 4.5 },
      end: { x: tick, y: barY + 4.5 },
      thickness: 1.3,
      color: INK,
    });
  }
  page.drawText(copy.scale, {
    x: MARGIN + barLen + 8,
    y: barY - 3,
    size: 8.5,
    font: helv,
    color: INK,
  });

  const rulerNoteW = helv.widthOfTextAtSize(copy.ruler, 8);
  page.drawText(copy.ruler, {
    x: PAGE_W - MARGIN - rulerNoteW,
    y: barY - 3,
    size: 8,
    font: helv,
    color: INK,
  });

  const rulerY = MARGIN + mm(4.2);
  const rulerLen = mm(150);
  page.drawLine({
    start: { x: MARGIN, y: rulerY },
    end: { x: MARGIN + rulerLen, y: rulerY },
    thickness: 0.8,
    color: INK,
  });

  for (let mark = 0; mark <= 150; mark += 5) {
    const x = MARGIN + mm(mark);
    const major = mark % 10 === 0;
    page.drawLine({
      start: { x, y: rulerY },
      end: { x, y: rulerY + (major ? 7 : 3.5) },
      thickness: 0.6,
      color: INK,
    });

    if (major) {
      const text = String(mark);
      const width = helv.widthOfTextAtSize(text, 6.5);
      page.drawText(text, {
        x: x - width / 2,
        y: rulerY - 9,
        size: 6.5,
        font: helv,
        color: INK,
      });
    }
  }

  const bytes = await doc.save();
  const path = join(OUT_DIR, copy.file);
  writeFileSync(path, bytes);

  return { file: copy.file, bytes: bytes.length };
}

mkdirSync(OUT_DIR, { recursive: true });

const written = [];
for (const copy of Object.values(COPY)) {
  written.push(await render(copy));
}

for (const file of written) {
  console.log(`${file.file}  ${file.bytes} bytes`);
}
