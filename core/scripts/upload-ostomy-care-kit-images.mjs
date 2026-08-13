/**
 * Upload generated Ostomy Care kit images to BigCommerce product thumbnails.
 *
 * Run from repo root:
 *   node --env-file=.env.local core/scripts/upload-ostomy-care-kit-images.mjs
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const STORE_HASH = process.env.BIGCOMMERCE_STORE_HASH;
const TOKEN = process.env.CATALYST_PRODUCT_EDIT_TOKEN || process.env.BIGCOMMERCE_ACCESS_TOKEN;

const __dirname = dirname(fileURLToPath(import.meta.url));
const CURSOR_ASSETS =
  'C:\\Users\\loren\\.cursor\\projects\\d-liivv-test-catalyst-app\\assets';
const LOCAL_OUT = join(__dirname, '../public/archive/ostomy-care/kit-products');

const KITS = [
  { id: 8041, file: 'kit-ostomy-fresh-start.png', name: 'The Fresh Start (New Ostomate Starter Kit)' },
  { id: 8042, file: 'kit-ostomy-skin-shield.png', name: 'Skin Shield' },
  { id: 8043, file: 'kit-ostomy-inner-balance.png', name: 'Inner Balance' },
  { id: 8044, file: 'kit-ostomy-stay-hydrated.png', name: 'Stay Hydrated' },
  { id: 8045, file: 'kit-ostomy-leak-free.png', name: 'Leak-Free Confidence' },
  { id: 8046, file: 'kit-ostomy-everyday-living.png', name: 'Everyday Living' },
  { id: 8047, file: 'kit-ostomy-little-ostomate.png', name: 'Little Ostomate' },
  { id: 8048, file: 'kit-ostomy-newly-diagnosed.png', name: 'Newly Diagnosed: New Ostomy Starter Kit' },
];

if (!STORE_HASH || !TOKEN) {
  console.error('Missing BIGCOMMERCE_STORE_HASH or product edit token');
  process.exit(1);
}

mkdirSync(LOCAL_OUT, { recursive: true });

async function uploadImage(productId, filePath, filename) {
  const buf = readFileSync(filePath);
  const blob = new Blob([buf], { type: 'image/png' });
  const form = new FormData();
  form.append('image_file', blob, filename);

  const response = await fetch(
    `https://api.bigcommerce.com/stores/${STORE_HASH}/v3/catalog/products/${productId}/images`,
    {
      method: 'POST',
      headers: {
        'X-Auth-Token': TOKEN,
        Accept: 'application/json',
      },
      body: form,
    },
  );
  const text = await response.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }
  if (!response.ok) {
    throw new Error(`Upload ${productId} -> ${response.status}: ${text}`);
  }

  const imageId = json.data?.id;
  if (imageId) {
    const put = await fetch(
      `https://api.bigcommerce.com/stores/${STORE_HASH}/v3/catalog/products/${productId}/images/${imageId}`,
      {
        method: 'PUT',
        headers: {
          'X-Auth-Token': TOKEN,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_thumbnail: true, sort_order: 0, description: filename }),
      },
    );
    if (!put.ok) {
      const putText = await put.text();
      console.warn(`  warn: could not set thumbnail for ${productId}: ${putText}`);
    }
  }

  return json.data;
}

async function main() {
  const results = [];
  const errors = [];

  for (const kit of KITS) {
    const src = join(CURSOR_ASSETS, kit.file);
    if (!existsSync(src)) {
      console.error(`MISSING file: ${src}`);
      errors.push({ ...kit, error: 'file missing' });
      continue;
    }

    const dest = join(LOCAL_OUT, kit.file);
    copyFileSync(src, dest);
    console.log(`\n${kit.id} ${kit.name}`);
    console.log(`  file: ${kit.file}`);

    try {
      const uploaded = await uploadImage(kit.id, dest, kit.file);
      console.log(`  uploaded image id=${uploaded.id} thumbnail=${uploaded.is_thumbnail}`);
      console.log(`  url: ${uploaded.url_standard}`);
      results.push({ id: kit.id, imageId: uploaded.id, url: uploaded.url_standard });
    } catch (error) {
      console.error(`  FAILED: ${error.message}`);
      errors.push({ ...kit, error: error.message });
    }
  }

  console.log('\n========== SUMMARY ==========');
  console.log(`Uploaded: ${results.length}, Errors: ${errors.length}`);
  for (const r of results) {
    console.log(`  ${r.id} image=${r.imageId}`);
  }
  if (errors.length) {
    for (const e of errors) {
      console.log(`  FAIL ${e.id} ${e.file}: ${e.error}`);
    }
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
