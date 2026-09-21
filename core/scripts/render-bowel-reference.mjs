/**
 * Renders the bowel reference still (C04) from the published HRA 3D reference
 * organs, and prints the marker positions the page needs.
 *
 * Run from the repo root:
 *   node core/scripts/render-bowel-reference.mjs
 *
 * Writes core/public/archive/ostomy-care/figures/bowel-reference-{640,960,1280}
 * .{avif,webp} and prints an `ANATOMY_PARTS` snippet to paste into
 * `chapters/anatomy-meta.ts`. Nothing else in the repo changes.
 *
 * WHAT THIS IS
 * ------------
 * Two openly licensed models — HRA 3D Reference Organs, Large Intestine Male
 * v1.3 and Small Intestine Male v1.2 (Browne K, Schlehlein H; HuBMAP; CC BY
 * 4.0) — drawn together in one flat, transparent, orthographic front view.
 *
 * It is normal anatomy and nothing else. No stoma is drawn, no exit, no
 * "this part is removed" shading, and it is never presented as the reader's own
 * body: which surgery removed what varies far too much for one picture. The
 * three structures the NSWOC decision names — the duodenum, the appendix and
 * the ileocecal valve — are hidden, so the figure shows the parts the chapters
 * talk about and no more.
 *
 * The image carries NO TEXT. Every label is HTML positioned over it from the
 * percentages this script measures, so the labels translate, reflow, scale with
 * the reader's font size and are readable by a screen reader.
 *
 * ATTRIBUTION
 * -----------
 * CC BY 4.0 requires the author, the licence, a link to it and an indication of
 * changes. The rendered files carry that in EXIF, and the page carries it in
 * the DOM beside the figure (`BOWEL_CREDIT` in `chapters/anatomy-meta.ts`).
 * Neither says "NIH" and neither says "expert-approved" — the models come from
 * the Human Reference Atlas and are used courtesy of the U.S. National Library
 * of Medicine, and no clinician has yet signed this figure off.
 *
 * REPRODUCIBILITY
 * ---------------
 * Rendering runs on SwiftShader (a software rasteriser) rather than on whatever
 * GPU the machine happens to have, so two runs on two machines produce the same
 * bytes. Everything else is pinned too: exact GLB sha256 values, three@0.170.0
 * from jsDelivr, a fixed camera, fixed lights and fixed encoder settings. The
 * script prints a sha256 for every file it writes; run it twice and compare.
 *
 * SOURCE MODELS
 * -------------
 * They are downloaded from the pinned humanatlas.io URLs into a cache outside
 * the repo and verified against the sha256 values recorded in the research
 * pass. They are 1.3 MB of third-party geometry that the site never serves, so
 * they are deliberately not committed. Point `--cache` at a directory that
 * already holds them and the models are not fetched again.
 *
 * THIS SCRIPT IS NOT OFFLINE-CAPABLE. `--cache` covers the models and nothing
 * else: three@0.170.0 and its GLTFLoader are resolved from the jsDelivr import
 * map in render-bowel-reference.html on every run, in a fresh Playwright
 * context with no cache carried between runs. Only `https://render.local/**` is
 * served from memory. With no network the module import throws in the page and
 * `main()` rethrows it. Vendoring the two three.js files into the cache and
 * routing them through the same interception would close that; it has not been
 * done, so the models are the only thing `--cache` saves you.
 *
 * Never run `playwright install`: this uses the Microsoft Edge already on the
 * machine (`--channel`), not a downloaded browser build.
 */

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE = join(HERE, '..');

/* @playwright/test and sharp are core dependencies, not root ones. */
const coreRequire = createRequire(join(CORE, 'package.json'));
const { chromium } = coreRequire('@playwright/test');
const sharp = coreRequire('sharp');

/*
 * The two source models, pinned to an exact version and an exact file. The
 * sha256 values are what the research pass downloaded and inspected; a file
 * that does not match them is not the file this figure was reviewed against,
 * so the script stops rather than rendering something else.
 */
const MODELS = [
  {
    key: 'large',
    file: '3d-sbu-m-large-intestine.glb',
    url: 'https://cdn.humanatlas.io/digital-objects/ref-organ/large-intestine-male/v1.3/assets/3d-sbu-m-large-intestine.glb',
    sha256: '908a5c38bf14574a673f2d2619502281f7f9e47c46c4eba837aae2e80e38c489',
    bytes: 687076,
  },
  {
    key: 'small',
    file: '3d-vh-m-small-intestine.glb',
    url: 'https://cdn.humanatlas.io/digital-objects/ref-organ/small-intestine-male/v1.2/assets/3d-vh-m-small-intestine.glb',
    sha256: '5d51b9b102e762f9b64fd1e7d9fbd1f1a23ed9cfdb536a9e756cca3206fbc5bb',
    bytes: 618728,
  },
];

/*
 * Hidden by the NSWOC decision on what this figure is for.
 *
 * The duodenum is a stub in the small-intestine model that ends in mid-air and
 * reads as damage; the appendix and the ileocecal valve are structures the
 * chapters never mention and that many readers no longer have. Hiding them is
 * subtraction, not invention: nothing is drawn in their place.
 */
const HIDE = ['VH_M_duodenum', 'VH_M_vermiform_appendix', 'VH_M_ileocecal_valve'];

/*
 * The master render, 4:5. It is the width of the largest file written, so
 * nothing is ever scaled up: an enlarged 1200 px master would be softer than
 * the 1280 px file it claims to be.
 */
const RENDER_W = 1280;
const RENDER_H = 1600;

/* Written widths. 640 and its 2× (1280), plus 960 for the middle of the range. */
const WIDTHS = [640, 960, 1280];

const OUT_DIR = join(CORE, 'public', 'archive', 'ostomy-care', 'figures');
const OUT_BASE = 'bowel-reference';

/*
 * The attribution that travels with the file. CC BY 4.0 asks for the author,
 * the licence and an indication of changes, and a file that leaves the page
 * should carry them. Fixed strings, so two runs write the same bytes.
 */
const EXIF = {
  IFD0: {
    ImageDescription:
      'Normal small and large intestine, anterior view. Rendered from the HRA 3D Reference Organs.',
    Copyright:
      'HRA 3D Reference Organs: Large Intestine, Male v1.3 (doi:10.48539/HBM487.ZKSN.693) and Small Intestine, Male v1.2 (doi:10.48539/HBM789.XTDK.794). Browne K, Schlehlein H; HuBMAP. CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Modified: recoloured, and the duodenum, appendix and ileocecal valve hidden. Courtesy of the U.S. National Library of Medicine.',
  },
};

const argv = process.argv.slice(2);
const flag = (name, fallback) => {
  const index = argv.indexOf(name);

  return index < 0 ? fallback : argv[index + 1];
};

/*
 * Outside the repo by default, so 1.3 MB of third-party geometry can never be
 * committed by accident and a clean checkout does not carry it.
 */
const CACHE = flag('--cache', join(tmpdir(), 'liivv-hra-glb'));
const CHANNEL = flag('--channel', 'msedge');
const KEEP_PNG = argv.includes('--keep-png');

const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex');

/*
 * The cached model, or a fresh download of it. Either way the bytes are checked
 * against the pinned hash before anything is rendered from them.
 */
async function loadModel(model) {
  const path = join(CACHE, model.file);

  if (existsSync(path)) {
    const cached = readFileSync(path);

    if (sha256(cached) === model.sha256) {
      console.log(`  ${model.file} — cached, sha256 ok (${cached.length} bytes)`);

      return cached;
    }

    console.log(`  ${model.file} — cached copy does not match its sha256; downloading again`);
  }

  console.log(`  ${model.file} — GET ${model.url}`);

  const response = await fetch(model.url);

  if (!response.ok) throw new Error(`${model.url} returned ${response.status}`);

  const downloaded = Buffer.from(await response.arrayBuffer());
  const digest = sha256(downloaded);

  if (digest !== model.sha256) {
    throw new Error(
      `${model.file}: sha256 ${digest} does not match the pinned ${model.sha256}. ` +
        'The published model has changed, or the download is not the published model. ' +
        'Nothing has been rendered.',
    );
  }

  mkdirSync(CACHE, { recursive: true });
  writeFileSync(path, downloaded);
  console.log(`  ${model.file} — downloaded, sha256 ok (${downloaded.length} bytes)`);

  return downloaded;
}

/* The marker table, ready to paste into anatomy-meta.ts. */
function partsSnippet(markers) {
  const rows = Object.entries(markers).map(([key, marker]) =>
    marker
      ? `  { key: '${key}', x: ${marker.x}, y: ${marker.y} },`
      : `  /* ⚠ '${key}' has no visible pixels in this render */`,
  );

  return [
    'export const ANATOMY_PARTS: AnatomyPart[] = [',
    ...rows,
    '];',
    '',
    `/* Rendered ${RENDER_W}×${RENDER_H}; x and y are percentages of the frame, y from the top. */`,
  ].join('\n');
}

async function render(models) {
  const files = {
    '/render.html': [readFileSync(join(HERE, 'render-bowel-reference.html')), 'text/html'],
    ...Object.fromEntries(
      models.map(({ key, bytes }) => [`/glb/${key}.glb`, [bytes, 'model/gltf-binary']]),
    ),
  };

  /*
   * SwiftShader, not the machine's GPU: the same pixels on every machine, which
   * is what makes a re-render comparable to the file in the repo.
   */
  const browser = await chromium.launch({
    channel: CHANNEL,
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  });

  try {
    const page = await browser.newPage({ viewport: { width: 800, height: 600 } });

    page.on('console', (message) => console.log(`  [page] ${message.type()} ${message.text()}`));

    /*
     * Only render.local is served from memory. three comes from the pinned
     * jsDelivr URLs in the import map and is left to load normally.
     */
    await page.route('https://render.local/**', (route) => {
      const entry = files[new URL(route.request().url()).pathname];

      if (!entry) return route.fulfill({ status: 404, body: 'not found' });

      return route.fulfill({
        status: 200,
        body: entry[0],
        headers: { 'content-type': entry[1] },
      });
    });

    const query = new URLSearchParams({
      w: String(RENDER_W),
      h: String(RENDER_H),
      hide: HIDE.join(','),
    });

    await page.goto(`https://render.local/render.html?${query.toString()}`);
    await page.waitForFunction(() => window.__result, null, { timeout: 120000 });

    const result = await page.evaluate(() => window.__result);

    if (result.error) throw new Error(result.error);

    return { ...result, version: browser.version() };
  } finally {
    await browser.close();
  }
}

async function main() {
  console.log('source models:');

  const loaded = [];

  for (const model of MODELS) {
    loaded.push({ key: model.key, bytes: await loadModel(model) });
  }

  console.log(`\nrendering ${RENDER_W}×${RENDER_H}, hiding ${HIDE.join(', ')}`);

  const result = await render(loaded);

  console.log(`  Edge ${result.version}`);
  console.log(`  ${result.gl} · ${result.renderer}`);
  console.log(`  model bounding box (m): ${result.bboxMeters.join(' × ')}`);

  const png = Buffer.from(result.png.split(',')[1], 'base64');
  const meta = await sharp(png).metadata();

  if (!meta.hasAlpha) throw new Error('the render has no alpha channel, so it is not transparent');

  mkdirSync(OUT_DIR, { recursive: true });

  if (KEEP_PNG) writeFileSync(join(OUT_DIR, `${OUT_BASE}.png`), png);

  console.log('\nwritten:');

  /*
   * No trim: the frame is the frame the markers were measured in, and trimming
   * it would move every one of them.
   */
  for (const width of WIDTHS) {
    const resized = () => sharp(png).resize({ width }).withExifMerge(EXIF);
    const encoders = [
      ['avif', resized().avif({ quality: 55, effort: 6 })],
      ['webp', resized().webp({ quality: 80, alphaQuality: 90 })],
    ];

    for (const [extension, pipeline] of encoders) {
      const path = join(OUT_DIR, `${OUT_BASE}-${width}.${extension}`);

      await pipeline.toFile(path);

      const bytes = readFileSync(path);

      console.log(
        `  ${OUT_BASE}-${width}.${extension}  ${String(bytes.length).padStart(7)} B  ${sha256(bytes)}`,
      );
    }
  }

  console.log(`\npaste into core/app/.../ostomy-care/chapters/anatomy-meta.ts:\n`);
  console.log(partsSnippet(result.markers));

  const missing = Object.entries(result.markers).filter(([, marker]) => !marker);

  if (missing.length) {
    console.log(`\n⚠ no visible pixels for: ${missing.map(([key]) => key).join(', ')}`);
    process.exitCode = 1;
  }
}

await main();
