/**
 * One-off: create Clair Health Wristband (pre-order) in BigCommerce.
 * Run from core/: node --env-file=../.env.local scripts/create-clair-wristband.mjs
 */
const STORE_HASH = process.env.BIGCOMMERCE_STORE_HASH;
const TOKEN = process.env.CATALYST_PRODUCT_EDIT_TOKEN || process.env.BIGCOMMERCE_ACCESS_TOKEN;
const CHANNEL_ID = Number(process.env.BIGCOMMERCE_CHANNEL_ID || '1');

const PRODUCT_NAME = 'Clair Health Wristband';
const PRODUCT_SKU = 'CLAIR-WRISTBAND';
const PRICE = 369;
const CATEGORY_ID = 1152; // Shop Women's Health
const RELEASE_DATE = '2026-11-01T00:00:00+00:00';

const DESCRIPTION = [
  "<p>Clair is a wearable continuous hormone monitor from Clair Health — the first of its kind. It reads your body's key signals (including estrogen, progesterone, LH, and FSH) without blood or urine, so you can see the shape of your cycle in real time.</p>",
  '<p>No pinpricks. No waiting on a lab. Just a clear, gentle picture of your rhythm, checked like a glance at your wrist.</p>',
  '<p><strong>Pre-order through Liivv</strong> — expected shipping around November 2026. Stay first in line as dates firm up.</p>',
  '<ul>',
  '<li>Continuous, non-invasive hormone insights</li>',
  '<li>Worn like jewellery — light and familiar</li>',
  '<li>See patterns across sleep, energy, skin, and mood</li>',
  '<li>No lab appointment required to wear Clair</li>',
  '</ul>',
].join('');

if (!STORE_HASH || !TOKEN) {
  console.error(
    'Missing BIGCOMMERCE_STORE_HASH or CATALYST_PRODUCT_EDIT_TOKEN / BIGCOMMERCE_ACCESS_TOKEN',
  );
  process.exit(1);
}

async function bc(path, init = {}) {
  const response = await fetch(`https://api.bigcommerce.com/stores/${STORE_HASH}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Auth-Token': TOKEN,
      ...(init.headers || {}),
    },
  });
  const text = await response.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }
  if (!response.ok) {
    throw new Error(`${init.method || 'GET'} ${path} -> ${response.status}: ${text}`);
  }
  return json;
}

async function ensureBrandId() {
  const brands = await bc(`/v3/catalog/brands?name=${encodeURIComponent('Clair Health')}`);
  if (brands.data?.[0]) {
    console.log('Using existing brand', brands.data[0].id, brands.data[0].name);
    return brands.data[0].id;
  }
  const created = await bc('/v3/catalog/brands', {
    method: 'POST',
    body: JSON.stringify({ name: 'Clair Health' }),
  });
  console.log('Created brand', created.data.id);
  return created.data.id;
}

async function main() {
  const existing = await bc(`/v3/catalog/products?sku=${encodeURIComponent(PRODUCT_SKU)}`);
  if (existing.data?.[0]) {
    console.log('Already exists:', existing.data[0].id, existing.data[0].name, existing.data[0].sku);
    return existing.data[0].id;
  }

  const brandId = await ensureBrandId();

  const created = await bc('/v3/catalog/products', {
    method: 'POST',
    body: JSON.stringify({
      name: PRODUCT_NAME,
      type: 'physical',
      weight: 0.2,
      price: PRICE,
      sku: PRODUCT_SKU,
      description: DESCRIPTION,
      categories: [CATEGORY_ID],
      brand_id: brandId,
      is_visible: true,
      inventory_tracking: 'none',
      availability: 'preorder',
      is_preorder_only: true,
      preorder_release_date: RELEASE_DATE,
      preorder_message:
        'Expected to ship around November 2026. Pre-order now to stay first in line.',
      custom_url: { url: '/clair-health-wristband/', is_customized: true },
      search_keywords:
        'clair, clair health, wristband, hormone, wearable, cycle, estrogen, progesterone',
    }),
  });

  const productId = created.data.id;
  console.log('Created product', productId, created.data.name, created.data.sku);

  await bc('/v3/catalog/products/channel-assignments', {
    method: 'PUT',
    body: JSON.stringify([{ product_id: productId, channel_id: CHANNEL_ID }]),
  });
  console.log('Assigned to channel', CHANNEL_ID);

  const verify = await bc(
    `/v3/catalog/products/${productId}?include_fields=id,name,sku,price,availability,is_preorder_only,preorder_release_date,preorder_message,categories,brand_id,custom_url,is_visible`,
  );
  console.log(JSON.stringify(verify.data, null, 2));
  console.log('DONE product_id=', productId);
  return productId;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
