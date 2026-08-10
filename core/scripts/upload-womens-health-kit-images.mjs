/**
 * Upload generated Women's Health kit images to BigCommerce product thumbnails.
 *
 * Run from repo root:
 *   node --env-file=.env.local core/scripts/upload-womens-health-kit-images.mjs
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const STORE_HASH = process.env.BIGCOMMERCE_STORE_HASH;
const TOKEN = process.env.CATALYST_PRODUCT_EDIT_TOKEN || process.env.BIGCOMMERCE_ACCESS_TOKEN;

const __dirname = dirname(fileURLToPath(import.meta.url));
const CURSOR_ASSETS =
  'C:\\Users\\loren\\.cursor\\projects\\d-liivv-test-catalyst-app\\assets';
const LOCAL_OUT = join(__dirname, '../public/archive/womens-health/kit-products');

const KITS = [
  { id: 8019, file: 'kit-cycle-comfort-cramp.png', name: 'Cycle Comfort Cramp-Relief Kit' },
  { id: 8020, file: 'kit-clear-skin-hormonal-acne.png', name: 'Clear Skin Hormonal-Acne Kit' },
  { id: 8021, file: 'kit-teen-energy-iron.png', name: 'Teen Energy & Iron Support Kit' },
  { id: 8022, file: 'kit-trying-to-conceive.png', name: 'Trying to Conceive Starter Kit' },
  { id: 8023, file: 'kit-prenatal-trimester.png', name: 'Prenatal by Trimester System' },
  { id: 8024, file: 'kit-morning-sickness-rescue.png', name: 'Morning Sickness Rescue Kit' },
  { id: 8025, file: 'kit-preeclampsia-monitoring.png', name: 'Preeclampsia Home Monitoring Kit' },
  { id: 8026, file: 'kit-bedrest-comfort.png', name: 'Bedrest Comfort & Circulation Kit' },
  { id: 8027, file: 'kit-pregnancy-nutrient.png', name: 'Pregnancy Nutrient Deficiency Support Kit' },
  { id: 8028, file: 'kit-fourth-trimester.png', name: 'The Fourth Trimester Recovery Kit' },
  { id: 8029, file: 'kit-nourish-nursing.png', name: 'Nourish the Nursing Journey Kit' },
  { id: 8030, file: 'kit-postpartum-wellness.png', name: 'Postpartum Wellness Watch Kit' },
  { id: 8031, file: 'kit-reset-recharge.png', name: 'Reset & Recharge Kit' },
  { id: 8032, file: 'kit-rhythm-balance.png', name: 'Rhythm & Balance Kit' },
  { id: 8033, file: 'kit-transition-hot-flash.png', name: 'Hot-Flash Sleep + Mood Kit' },
  { id: 8034, file: 'kit-transition-intimate.png', name: 'Intimate Comfort + Dryness Kit' },
  { id: 8035, file: 'kit-transition-midlife.png', name: 'Midlife Bones + Vitality Kit' },
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
