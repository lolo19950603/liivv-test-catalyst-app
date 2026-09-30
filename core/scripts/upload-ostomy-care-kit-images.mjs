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
  'C:\\Users\\loren\\.cursor\\projects\\c-Users-loren-OneDrive-Desktop-Bayshore-liivv-test-catalyst-app\\assets';
const LOCAL_OUT = join(__dirname, '../public/archive/ostomy-care/kit-products');

const KITS = [
  { id: 8061, file: 'kit-ni-drain-57.jpg', name: 'New Image Two-Piece Drainable Kit (Flat, 57 mm Red)' },
  { id: 8062, file: 'kit-ni-drain-70.jpg', name: 'New Image Two-Piece Drainable Kit (Flat, 70 mm Blue)' },
  { id: 8063, file: 'kit-ni-closed-57.jpg', name: 'New Image Two-Piece Closed Kit (Flat, 57 mm Red)' },
  { id: 8064, file: 'kit-sc-drain-50.jpg', name: 'SenSura Click Two-Piece Drainable Kit (Flat, 50 mm)' },
  { id: 8065, file: 'kit-sc-one-piece.jpg', name: 'SenSura One-Piece Drainable Kit (Flat, Transparent)' },
  { id: 8066, file: 'kit-ni-uro-70.jpg', name: 'New Image Two-Piece Urostomy Kit (Flat, 70 mm Blue)' },
  { id: 8067, file: 'kit-sc-uro-50.jpg', name: 'SenSura Click Two-Piece Urostomy Kit (Flat, 50 mm)' },
  { id: 8068, file: 'kit-pouchkins-44.jpg', name: 'Pouchkins Two-Piece Kit (Flat, 44 mm Green)' },
];

if (!STORE_HASH || !TOKEN) {
  console.error('Missing BIGCOMMERCE_STORE_HASH or product edit token');
  process.exit(1);
}

mkdirSync(LOCAL_OUT, { recursive: true });

async function uploadImage(productId, filePath, filename) {
  const buf = readFileSync(filePath);
  const type = filename.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
  const blob = new Blob([buf], { type });
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
