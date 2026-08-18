/**
 * Upload generated Diabetes Care kit images to BigCommerce product thumbnails.
 *
 * Run from repo root:
 *   node --env-file=.env.local core/scripts/upload-diabetes-care-kit-images.mjs
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const STORE_HASH = process.env.BIGCOMMERCE_STORE_HASH;
const TOKEN = process.env.CATALYST_PRODUCT_EDIT_TOKEN || process.env.BIGCOMMERCE_ACCESS_TOKEN;

const __dirname = dirname(fileURLToPath(import.meta.url));
const CURSOR_ASSETS =
  'C:\\Users\\loren\\.cursor\\projects\\d-liivv-test-catalyst-app\\assets';
const LOCAL_OUT = join(__dirname, '../public/archive/diabetes-care/kit-products');

const KITS = [
  { id: 8049, file: 'kit-diabetes-day-one.png', name: 'Just Diagnosed: Diabetes Day-One Starter' },
  { id: 8050, file: 'kit-diabetes-onetouch.png', name: 'OneTouch Testing System Starter' },
  { id: 8051, file: 'kit-diabetes-contour-next.png', name: 'Contour Next Testing System Starter' },
  { id: 8052, file: 'kit-diabetes-libre3.png', name: 'FreeStyle Libre 3 CGM Starter' },
  { id: 8053, file: 'kit-diabetes-insulin-injection.png', name: 'Insulin Injection Basics Kit' },
  { id: 8054, file: 'kit-diabetes-pump-medtronic.png', name: 'Insulin Pump Supply Starter (Medtronic)' },
  { id: 8055, file: 'kit-diabetes-low-glucose.png', name: 'Low-Glucose Rescue Kit' },
  { id: 8056, file: 'kit-diabetes-foot-care.png', name: 'Diabetic Foot Care Kit' },
  { id: 8057, file: 'kit-diabetes-skin-comfort.png', name: 'Injection & Finger-Poke Skin Comfort Kit' },
  { id: 8058, file: 'kit-diabetes-travel.png', name: 'Diabetes Travel & On-the-Go Kit' },
  { id: 8059, file: 'kit-diabetes-nutrition.png', name: 'Blood-Sugar Nutrition Support Kit' },
  { id: 8060, file: 'kit-diabetes-type2-starter.png', name: 'Newly Diagnosed: Type 2 Diabetes Starter Kit' },
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
