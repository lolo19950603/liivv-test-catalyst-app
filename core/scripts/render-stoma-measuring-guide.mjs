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
 * The page is landscape US Letter and the background stays white. A full-bleed
 * colour makes some printers switch to "fit" and the holes stop being true.
 * The largest openings sit on their own row so a 76 mm disk is never scaled
 * down to fit a line of smaller ones. Olivia sits in the top corner; she is
 * the mascot, not a measuring mark.
 *
 * Standard fonts only, so the file has no embedded typeface to reflow the
 * layout. WinAnsi covers the French accents used here; an em dash does not,
 * so the sentences use a hyphen.
 */

import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
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

const PAGE_W = 11 * 72;
const PAGE_H = 8.5 * 72;
const MARGIN = mm(7);

const INK = rgb(0x31 / 255, 0x2f / 255, 0x2f / 255);
const SAND = rgb(0xd7 / 255, 0xcf / 255, 0xc7 / 255);
const BLUSH = rgb(0xf3 / 255, 0xc7 / 255, 0xbe / 255);
const CREAM = rgb(0xf5 / 255, 0xf2 / 255, 0xed / 255);
const SAGE = rgb(0x6b / 255, 0x7f / 255, 0x5c / 255);
const DISK = rgb(0xe7 / 255, 0xdb / 255, 0xd4 / 255);

/** Visible pixels of olivia-mascot-hi.png (1024 square, transparent padding). */
const OLIVIA_PATH = join(CORE, 'components', 'account-dashboard', 'olivia-mascot-hi.png');
const OLIVIA_FRAME = 1024;
const OLIVIA_CONTENT = { left: 180, top: 99, right: 840, bottom: 905 };

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
  [13, 14, 15, 16],
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
    scaleNote: 'Check this with a ruler',
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
    scaleNote: 'V\u00e9rifiez avec une r\u00e8gle',
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

function loadOliviaPng() {
  const out = join(tmpdir(), 'liivv-olivia-guide.png');
  const py = [
    'from PIL import Image',
    `im = Image.open(${JSON.stringify(OLIVIA_PATH)}).convert("RGBA")`,
    'im.thumbnail((520, 520), Image.Resampling.LANCZOS)',
    `im.save(${JSON.stringify(out)}, "PNG", optimize=True)`,
  ].join('\n');

  try {
    execFileSync('python', ['-c', py], { stdio: 'pipe' });
    return readFileSync(out);
  } catch {
    return readFileSync(OLIVIA_PATH);
  }
}
function roundedRectPath(width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);

  return [
    `M ${r} 0`,
    `H ${width - r}`,
    `Q ${width} 0 ${width} ${r}`,
    `V ${height - r}`,
    `Q ${width} ${height} ${width - r} ${height}`,
    `H ${r}`,
    `Q 0 ${height} 0 ${height - r}`,
    `V ${r}`,
    `Q 0 0 ${r} 0`,
    'Z',
  ].join(' ');
}
function circlesOverlap(a, b, pad = 0.4) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;

  return Math.hypot(dx, dy) < a.r + b.r + pad;
}

async function render(copy) {
  const doc = await PDFDocument.create();
  const page = doc.addPage([PAGE_W, PAGE_H]);
  const helv = await doc.embedFont(StandardFonts.Helvetica);
  const helvBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const times = await doc.embedFont(StandardFonts.TimesRoman);
  const olivia = await doc.embedPng(loadOliviaPng());

  doc.setTitle(`Liivv - ${copy.title}`);
  doc.setAuthor('Liivv');
  doc.setSubject(copy.subject);

  const innerRight = PAGE_W - MARGIN;

  // Image box is square. The sprout and feet are inset, so the collision box
  // is the visible character, and the transparent padding may hang past it.
  const imageSize = 102;
  const contentW = imageSize * ((OLIVIA_CONTENT.right - OLIVIA_CONTENT.left) / OLIVIA_FRAME);
  const contentH = imageSize * ((OLIVIA_CONTENT.bottom - OLIVIA_CONTENT.top) / OLIVIA_FRAME);
  const imageX = innerRight - imageSize * (OLIVIA_CONTENT.right / OLIVIA_FRAME);
  const imageTop = PAGE_H - MARGIN;
  const imageY = imageTop - imageSize * ((OLIVIA_FRAME - OLIVIA_CONTENT.top) / OLIVIA_FRAME);
  const oliviaBox = {
    left: imageX + imageSize * (OLIVIA_CONTENT.left / OLIVIA_FRAME),
    right: imageX + imageSize * (OLIVIA_CONTENT.right / OLIVIA_FRAME),
    top: imageY + imageSize * ((OLIVIA_FRAME - OLIVIA_CONTENT.top) / OLIVIA_FRAME),
    bottom: imageY + imageSize * ((OLIVIA_FRAME - OLIVIA_CONTENT.bottom) / OLIVIA_FRAME),
  };

  if (Math.abs(oliviaBox.right - oliviaBox.left - contentW) > 0.5) {
    throw new Error('Olivia content width drifted');
  }
  if (Math.abs(oliviaBox.top - oliviaBox.bottom - contentH) > 0.5) {
    throw new Error('Olivia content height drifted');
  }

  const textW = oliviaBox.left - MARGIN - 18;
  const brandSize = 17;
  const titleSize = 11.5;
  const textTop = PAGE_H - MARGIN;

  function measureCopy(size, lead) {
    const lines = [];
    copy.paragraphs.forEach((paragraph, paragraphIndex) => {
      const font = paragraphIndex === 0 ? helvBold : helv;
      const wrapped = wrap(paragraph, font, size, textW);
      wrapped.forEach((line, lineIndex) => {
        lines.push({
          line,
          font,
          size,
          gap: lineIndex === wrapped.length - 1 ? lead + 1.6 : lead,
        });
      });
    });

    // Matches the draw order: brand, blush rule, gap, then each line.
    let cursor = textTop - brandSize - 6 - 11;
    for (const item of lines) cursor -= item.gap;
    return { lines, bottom: cursor };
  }

  let bodySize = 7.6;
  let fitted = measureCopy(bodySize, 9.3);
  if (fitted.bottom < oliviaBox.bottom) {
    bodySize = 7.15;
    fitted = measureCopy(bodySize, 8.7);
  }

  const textLines = fitted.lines;
  const textBottom = fitted.bottom;
  const boxPadTop = 8;
  const boxPadBottom = 8;
  const boxBottom = textBottom - boxPadBottom;
  const boxTop = textTop + boxPadTop;

  const boxLeft = MARGIN - 8;
  const boxWidth = textW + 16;
  const boxHeight = boxTop - boxBottom;

  page.drawSvgPath(roundedRectPath(boxWidth, boxHeight, 10), {
    x: boxLeft,
    y: boxTop,
    color: CREAM,
  });

  let y = textTop - brandSize;
  page.drawText('Liivv', { x: MARGIN, y, size: brandSize, font: times, color: INK });

  const brandW = times.widthOfTextAtSize('Liivv', brandSize);
  const dotY = y + brandSize + 1.6;
  const stem = (left, right) => MARGIN + (left + right) / 2;
  page.drawCircle({
    x: stem(times.widthOfTextAtSize('L', brandSize), times.widthOfTextAtSize('Li', brandSize)),
    y: dotY,
    size: 1.7,
    color: SAGE,
  });
  page.drawCircle({
    x: stem(times.widthOfTextAtSize('Li', brandSize), times.widthOfTextAtSize('Lii', brandSize)),
    y: dotY,
    size: 1.7,
    color: BLUSH,
  });

  page.drawText(copy.title, {
    x: MARGIN + brandW + 12,
    y: y + 2,
    size: titleSize,
    font: helv,
    color: INK,
  });

  y -= 6;
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: MARGIN + mm(32), y },
    thickness: 2.4,
    color: BLUSH,
  });

  y -= 11;
  for (const item of textLines) {
    page.drawText(item.line, { x: MARGIN, y, size: item.size, font: item.font, color: INK });
    y -= item.gap;
  }

  const labelSize = 6.6;
  const labelGap = 7;
  const minGap = mm(2.2);
  const holeGap = mm(4);

  const rows = ROWS.map((indexes) => {
    const cells = indexes.map((index) => {
      const opening = OPENINGS[index];
      const diameter = mm(opening.mm);
      const label = labelOf(opening);
      const labelW = helv.widthOfTextAtSize(label, labelSize);

      return { opening, diameter, label, labelW, cell: Math.max(diameter, labelW + 2) };
    });
    const height = Math.max(...cells.map((cell) => cell.diameter)) + labelGap;

    return { cells, height };
  });

  const rulerY = MARGIN + 13;
  const captionY = rulerY + 11;
  const footerTop = captionY + 6;
  const circleTop = Math.min(boxBottom, oliviaBox.bottom) - 8;
  const blockHeight = rows.reduce((total, row) => total + row.height, 0);
  const slack = circleTop - footerTop - blockHeight;
  const bottomPad = 6;

  if (slack < bottomPad) {
    throw new Error(
      `${copy.file}: circles need more room (${slack.toFixed(1)}pt slack, lines ${textLines.length}, block ${blockHeight.toFixed(0)})`,
    );
  }

  const rowGap = Math.min(mm(3.2), (slack - bottomPad) / Math.max(1, rows.length - 1));
  let rowTop = circleTop;
  const drawn = [];
  const innerW = innerRight - MARGIN;

  for (const row of rows) {
    const rowBottom = rowTop - row.height;
    const width = innerW;
    const sum = row.cells.reduce((total, cell) => total + cell.cell, 0);
    const gaps = row.cells.length - 1;
    const gap = gaps === 0 ? 0 : Math.min(holeGap, (width - sum) / gaps);

    if (gap < minGap - 0.01) {
      throw new Error(`${copy.file}: a row is ${(sum + minGap * gaps - width).toFixed(1)}pt too wide`);
    }

    const diameter = Math.max(...row.cells.map((cell) => cell.diameter));
    const rowWidth = sum + gap * gaps;
    let x = MARGIN + (width - rowWidth) / 2;

    for (const cell of row.cells) {
      const radius = cell.diameter / 2;
      const cx = x + cell.cell / 2;
      const cy = rowTop - diameter / 2;
      const stroke = 0.85;

      page.drawCircle({ x: cx, y: cy, size: radius, color: DISK });
      page.drawCircle({
        x: cx,
        y: cy,
        size: radius - stroke / 2,
        borderColor: INK,
        borderWidth: stroke,
      });

      page.drawText(cell.label, {
        x: cx - cell.labelW / 2,
        y: cy - radius - labelGap,
        size: labelSize,
        font: helv,
        color: INK,
      });

      if (Math.abs(radius - mm(cell.opening.mm) / 2) > 0.001) {
        throw new Error(`${copy.file}: ${cell.opening.mm} mm disk is not that size`);
      }

      const disk = { x: cx, y: cy, r: radius, mm: cell.opening.mm };
      for (const other of drawn) {
        if (circlesOverlap(disk, other)) {
          throw new Error(`${copy.file}: ${disk.mm} mm overlaps ${other.mm} mm`);
        }
      }
      const nearestX = Math.max(oliviaBox.left, Math.min(cx, oliviaBox.right));
      const nearestY = Math.max(oliviaBox.bottom, Math.min(cy, oliviaBox.top));
      if (Math.hypot(cx - nearestX, cy - nearestY) < radius + 2) {
        throw new Error(`${copy.file}: ${disk.mm} mm overlaps Olivia`);
      }

      drawn.push(disk);
      x += cell.cell + gap;
    }

    rowTop = rowBottom - rowGap;
  }

  if (rowTop + rowGap < footerTop - 0.5) {
    throw new Error(`${copy.file}: circles overlap the scale bar`);
  }

  const rulerLen = mm(150);
  const barLen = mm(100);
  const barX = MARGIN + rulerLen + 22;

  if (Math.abs(barLen - 100 * MM) > 0.001) throw new Error('scale bar is not 100 mm');
  if (Math.abs(rulerLen - 150 * MM) > 0.001) throw new Error('ruler is not 150 mm');
  if (barX + barLen > innerRight + 0.5) throw new Error(`${copy.file}: scale bar runs off the page`);

  page.drawLine({
    start: { x: MARGIN, y: footerTop },
    end: { x: innerRight, y: footerTop },
    thickness: 0.4,
    color: SAND,
  });

  page.drawText(copy.ruler, {
    x: MARGIN,
    y: captionY,
    size: 7.5,
    font: helv,
    color: INK,
  });
  const rulerNoteW = helv.widthOfTextAtSize(copy.ruler, 7.5);
  if (MARGIN + rulerNoteW > barX - 10) {
    throw new Error(`${copy.file}: ruler caption runs into the scale bar`);
  }
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
      end: { x, y: rulerY + (major ? 4.2 : 2.4) },
      thickness: major ? 0.7 : 0.45,
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

  page.drawText(copy.scaleNote, {
    x: barX,
    y: captionY,
    size: 7.5,
    font: helv,
    color: INK,
  });
  page.drawRectangle({
    x: barX,
    y: rulerY - 2.1,
    width: barLen,
    height: 4.2,
    color: BLUSH,
  });
  page.drawLine({
    start: { x: barX, y: rulerY },
    end: { x: barX + barLen, y: rulerY },
    thickness: 1.15,
    color: INK,
  });
  for (const tick of [barX, barX + barLen]) {
    page.drawLine({
      start: { x: tick, y: rulerY - 5 },
      end: { x: tick, y: rulerY + 5 },
      thickness: 1.35,
      color: INK,
    });
  }
  const scaleLabelW = helv.widthOfTextAtSize(copy.scale, 8);
  page.drawText(copy.scale, {
    x: barX + barLen / 2 - scaleLabelW / 2,
    y: rulerY - 15,
    size: 8,
    font: helv,
    color: INK,
  });

  page.drawImage(olivia, { x: imageX, y: imageY, width: imageSize, height: imageSize });

  const bytes = await doc.save();
  const path = join(OUT_DIR, copy.file);

  try {
    writeFileSync(path, bytes);
  } catch (error) {
    if (error?.code !== 'EBUSY') throw error;
    const fallback = path.replace(/\.pdf$/, '.next.pdf');
    writeFileSync(fallback, bytes);
    console.log(`${copy.file} is open, wrote ${fallback}`);
    return { file: fallback, bytes: bytes.length };
  }

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
