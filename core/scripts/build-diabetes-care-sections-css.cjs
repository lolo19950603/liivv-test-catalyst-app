// @ts-check
/**
 * Builds `public/archive/diabetes-care-sections.css` from `diabetes-care-head.css`.
 *
 * The head export concatenates every storefront `<style>` block, including global utilities
 * (`.hidden`, `.flex`, …) that collide with Tailwind on the Catalyst header. This script keeps
 * only blocks needed for the diabetes-care React sections + companion rules, and strips the
 * known utility burst from the main theme chunk.
 */
const { existsSync, readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

const root = join(__dirname, '..');
const archiveDir = join(root, 'public', 'archive');
const inputPath = join(archiveDir, 'diabetes-care-head.css');
const outputPath = join(archiveDir, 'diabetes-care-sections.css');

const DIABETES_TEMPLATE = 'shopify-section-template--26520397447459';

/** Start of Dawn “utility” run that overlaps Tailwind class names (see diabetes-care page investigation). */
const UTILITY_STRIP_START = '.sr-only{clip:rect(0,0,0,0)';
const UTILITY_STRIP_END = '.hidden,[hidden]{display:none}';

/**
 * @param {string} css
 * @returns {string}
 */
function stripTailwindCollidingUtilities(css) {
  const start = css.indexOf(UTILITY_STRIP_START);
  const end = css.indexOf(UTILITY_STRIP_END);

  if (start === -1 || end === -1 || end < start) {
    return css;
  }

  return css.slice(0, start) + css.slice(end + UTILITY_STRIP_END.length);
}

/**
 * @param {string} block
 * @param {number} index
 * @returns {boolean}
 */
function shouldKeepBlock(block, index) {
  if (index <= 2) {
    return true;
  }

  if (block.includes(DIABETES_TEMPLATE)) {
    return true;
  }

  if (block.includes('/*! blog-posts */')) {
    return true;
  }

  if (block.includes('/*! compact-product-bundle */')) {
    return true;
  }

  if (block.includes(':host{display:inline-block') && block.includes('--color-placeholder')) {
    return true;
  }

  return false;
}

if (!existsSync(inputPath)) {
  process.stderr.write(
    '[build-diabetes-care-sections-css] Missing diabetes-care-head.css — run extract-diabetes-care-head-css first.\n',
  );
  process.exit(1);
}

const full = readFileSync(inputPath, 'utf-8');
const blocks = full.split('\n\n');
const kept = [];

for (let i = 0; i < blocks.length; i += 1) {
  const raw = blocks[i];

  if (!shouldKeepBlock(raw, i)) {
    continue;
  }

  const processed =
    raw.includes(UTILITY_STRIP_START) && raw.includes(UTILITY_STRIP_END)
      ? stripTailwindCollidingUtilities(raw)
      : raw;

  if (processed.trim().length > 0) {
    kept.push(processed);
  }
}

const out = kept.join('\n\n');

if (existsSync(outputPath) && readFileSync(outputPath, 'utf-8') === out) {
  process.stdout.write(
    `[build-diabetes-care-sections-css] Up to date ${outputPath} (${kept.length} blocks, ${out.length} bytes)\n`,
  );
} else {
  writeFileSync(outputPath, out, 'utf-8');
  process.stdout.write(
    `[build-diabetes-care-sections-css] Wrote ${outputPath} (${kept.length} blocks from ${blocks.length}, ${out.length} bytes)\n`,
  );
}
