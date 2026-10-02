/**
 * Build accessory-kit photos from the real catalogue images of their parts.
 *
 *   node core/scripts/compose-ostomy-accessory-kit-images.mjs
 *
 * Writes JPEGs under public/archive/ostomy-care/kit-products/.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../public/archive/ostomy-care/kit-products');

const KITS = [
  {
    file: 'kit-starter-accessory.jpg',
    parts: [
      'https://cdn11.bigcommerce.com/s-nlnnk9gqdk/products/4937/images/4489/4937__1844__81708.1784636201.1280.1280.png?c=1',
      'https://cdn11.bigcommerce.com/s-nlnnk9gqdk/products/4439/images/4095/4439__1867__21851.1784636103.1280.1280.png?c=1',
    ],
  },
  {
    file: 'kit-skin-comfort.jpg',
    parts: [
      'https://cdn11.bigcommerce.com/s-nlnnk9gqdk/products/8014/images/5877/8014__5825__87860.1785380537.1280.1280.png?c=1',
      'https://cdn11.bigcommerce.com/s-nlnnk9gqdk/products/4890/images/4450/4890__2301__74387.1784636191.1280.1280.png?c=1',
    ],
  },
  {
    file: 'kit-pouch-comfort.jpg',
    parts: [
      'https://cdn11.bigcommerce.com/s-nlnnk9gqdk/products/8012/images/5875/8012__5823__66077.1785380536.1280.1280.png?c=1',
      'https://cdn11.bigcommerce.com/s-nlnnk9gqdk/products/8016/images/5879/8016__5827__94830.1785380537.1280.1280.png?c=1',
    ],
  },
];

const SIZE = 1600;
const MARGIN = 140;
const GAP = 96;

function isArtwork(r, g, b, a) {
  if (a < 80) return false;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lum = (r + g + b) / 3;

  return max - min >= 28 || lum <= 150;
}

function dilate(mask, width, height, radius) {
  const count = width * height;
  const horizontal = new Uint8Array(count);
  const out = new Uint8Array(count);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const x0 = Math.max(0, x - radius);
      const x1 = Math.min(width - 1, x + radius);
      let on = 0;

      for (let xx = x0; xx <= x1; xx += 1) {
        if (mask[y * width + xx]) {
          on = 1;
          break;
        }
      }

      horizontal[y * width + x] = on;
    }
  }

  for (let y = 0; y < height; y += 1) {
    const y0 = Math.max(0, y - radius);
    const y1 = Math.min(height - 1, y + radius);

    for (let x = 0; x < width; x += 1) {
      let on = 0;

      for (let yy = y0; yy <= y1; yy += 1) {
        if (horizontal[yy * width + x]) {
          on = 1;
          break;
        }
      }

      out[y * width + x] = on;
    }
  }

  return out;
}

function sealSilhouette(data, width, height, radius) {
  const count = width * height;
  const mask = new Uint8Array(count);

  for (let index = 0; index < count; index += 1) {
    mask[index] = data[index * 4 + 3] >= 40 ? 1 : 0;
  }

  const grown = dilate(mask, width, height, radius);
  const inverse = new Uint8Array(count);

  for (let index = 0; index < count; index += 1) inverse[index] = grown[index] ? 0 : 1;

  const opened = dilate(inverse, width, height, radius);

  for (let index = 0; index < count; index += 1) {
    if (!opened[index] && data[index * 4 + 3] < 40) data[index * 4 + 3] = 1;
  }
}

function fillHoles(data, width, height) {
  sealSilhouette(data, width, height, 42);

  const count = width * height;
  const outside = new Uint8Array(count);
  const stack = [];

  const pushOutside = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;

    const index = y * width + x;

    if (outside[index] || data[index * 4 + 3] >= 40) return;

    outside[index] = 1;
    stack.push(index);
  };

  for (let x = 0; x < width; x += 1) {
    pushOutside(x, 0);
    pushOutside(x, height - 1);
  }

  for (let y = 0; y < height; y += 1) {
    pushOutside(0, y);
    pushOutside(width - 1, y);
  }

  while (stack.length) {
    const index = stack.pop();
    const x = index % width;
    const y = (index / width) | 0;

    pushOutside(x - 1, y);
    pushOutside(x + 1, y);
    pushOutside(x, y - 1);
    pushOutside(x, y + 1);
  }

  let holes = [];

  for (let index = 0; index < count; index += 1) {
    if (data[index * 4 + 3] < 40 && !outside[index]) holes.push(index);
  }

  for (let pass = 0; pass < 160 && holes.length; pass += 1) {
    const next = [];

    for (const index of holes) {
      const x = index % width;
      const y = (index / width) | 0;
      let red = 0;
      let green = 0;
      let blue = 0;
      let found = 0;

      for (const [dx, dy] of [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ]) {
        const nx = x + dx;
        const ny = y + dy;

        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;

        const neighbor = (ny * width + nx) * 4;

        if (data[neighbor + 3] < 200) continue;

        red += data[neighbor];
        green += data[neighbor + 1];
        blue += data[neighbor + 2];
        found += 1;
      }

      if (!found) {
        next.push(index);
        continue;
      }

      const pixel = index * 4;

      data[pixel] = Math.round(red / found);
      data[pixel + 1] = Math.round(green / found);
      data[pixel + 2] = Math.round(blue / found);
      data[pixel + 3] = 255;
    }

    holes = next;
  }
}

function dropSpecks(data, width, height) {
  const count = width * height;
  const seen = new Uint8Array(count);

  for (let start = 0; start < count; start += 1) {
    if (seen[start] || data[start * 4 + 3] < 40) continue;

    const stack = [start];
    const members = [start];

    seen[start] = 1;

    while (stack.length) {
      const index = stack.pop();
      const x = index % width;
      const y = (index / width) | 0;

      for (const next of [index - 1, index + 1, index - width, index + width]) {
        if (next < 0 || next >= count || seen[next]) continue;
        if (Math.abs((next % width) - x) > 1) continue;
        if (data[next * 4 + 3] < 40) continue;

        seen[next] = 1;
        stack.push(next);
        members.push(next);
      }
    }

    if (members.length >= 500) continue;

    for (const index of members) data[index * 4 + 3] = 0;
  }
}

function clearPaleMargins(data, width, height) {
  const columnHits = new Uint32Array(width);
  const rowHits = new Uint32Array(height);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixel = (y * width + x) * 4;

      if (!isArtwork(data[pixel], data[pixel + 1], data[pixel + 2], data[pixel + 3])) continue;

      columnHits[x] += 1;
      rowHits[y] += 1;
    }
  }

  let minX = width;
  let maxX = -1;
  let minY = height;
  let maxY = -1;

  for (let x = 0; x < width; x += 1) {
    if (columnHits[x] < 12) continue;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
  }

  for (let y = 0; y < height; y += 1) {
    if (rowHits[y] < 12) continue;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  if (maxX < minX || maxY < minY) return;

  const pad = 10;

  minX = Math.max(0, minX - pad);
  maxX = Math.min(width - 1, maxX + pad);
  minY = Math.max(0, minY - pad);
  maxY = Math.min(height - 1, maxY + pad);

  const sideIsHalo = (xs, ys, axis) => {
    let lum = 0;
    let count = 0;
    let min = axis === 'x' ? width : height;
    let max = 0;

    for (let i = 0; i < xs.length; i += 1) {
      const pixel = (ys[i] * width + xs[i]) * 4;

      if (data[pixel + 3] < 40) continue;

      const position = axis === 'x' ? xs[i] : ys[i];

      lum += (data[pixel] + data[pixel + 1] + data[pixel + 2]) / 3;
      count += 1;
      if (position < min) min = position;
      if (position > max) max = position;
    }

    const thickness = count ? max - min : 0;

    return count > 80 && thickness < 110 && lum / count < 228;
  };

  const leftX = [];
  const leftY = [];
  const rightX = [];
  const rightY = [];
  const topX = [];
  const topY = [];
  const bottomX = [];
  const bottomY = [];

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (x < minX) {
        leftX.push(x);
        leftY.push(y);
      } else if (x > maxX) {
        rightX.push(x);
        rightY.push(y);
      } else if (y < minY) {
        topX.push(x);
        topY.push(y);
      } else if (y > maxY) {
        bottomX.push(x);
        bottomY.push(y);
      }
    }
  }

  const clearLeft = sideIsHalo(leftX, leftY, 'x');
  const clearRight = sideIsHalo(rightX, rightY, 'x');
  const clearTop = sideIsHalo(topX, topY, 'y');
  const clearBottom = sideIsHalo(bottomX, bottomY, 'y');

  if (!clearLeft && !clearRight && !clearTop && !clearBottom) return;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (
        (clearLeft && x < minX) ||
        (clearRight && x > maxX) ||
        (clearTop && y < minY && x >= minX && x <= maxX) ||
        (clearBottom && y > maxY && x >= minX && x <= maxX)
      ) {
        data[(y * width + x) * 4 + 3] = 0;
      }
    }
  }
}

async function cutout(url) {
  const response = await fetch(url);

  if (!response.ok) throw new Error(`image ${response.status} ${url}`);

  const input = Buffer.from(await response.arrayBuffer());
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  fillHoles(data, info.width, info.height);
  dropSpecks(data, info.width, info.height);
  clearPaleMargins(data, info.width, info.height);

  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim({ threshold: 12 })
    .png()
    .toBuffer();
}

async function compose(kit) {
  const parts = await Promise.all(kit.parts.map(cutout));
  const cellWidth = Math.floor((SIZE - MARGIN * 2 - GAP) / parts.length);
  const cellHeight = SIZE - MARGIN * 2;
  const layers = [];

  for (let index = 0; index < parts.length; index += 1) {
    const fitted = await sharp(parts[index])
      .resize(cellWidth, cellHeight, { fit: 'inside', withoutEnlargement: false })
      .png()
      .toBuffer();
    const meta = await sharp(fitted).metadata();
    const left = MARGIN + index * (cellWidth + GAP) + Math.floor((cellWidth - meta.width) / 2);
    const top = MARGIN + Math.floor((cellHeight - meta.height) / 2);

    layers.push({ input: fitted, left, top });
  }

  const jpeg = await sharp({
    create: { width: SIZE, height: SIZE, channels: 3, background: '#ffffff' },
  })
    .composite(layers)
    .jpeg({ quality: 90, mozjpeg: true })
    .toBuffer();

  const dest = join(OUT, kit.file);

  writeFileSync(dest, jpeg);
  console.log(`${kit.file} ${jpeg.length}`);
}

mkdirSync(OUT, { recursive: true });

for (const kit of KITS) {
  await compose(kit);
}
