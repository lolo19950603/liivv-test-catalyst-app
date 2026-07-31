/**
 * One-off script: create First Cycle Starter Kit in BigCommerce.
 * Run from core/: node --env-file=../.env.local scripts/create-first-cycle-kit.mjs
 * (or load env manually)
 */
const STORE_HASH = process.env.BIGCOMMERCE_STORE_HASH;
// Prefer write-scoped token; keep app BIGCOMMERCE_ACCESS_TOKEN unchanged.
const TOKEN = process.env.CATALYST_PRODUCT_EDIT_TOKEN || process.env.BIGCOMMERCE_ACCESS_TOKEN;
const CHANNEL_ID = Number(process.env.BIGCOMMERCE_CHANNEL_ID || '1');

const COMPONENT_IDS = [7828, 7847, 7810, 7876, 7849, 7970, 7971, 7972];
/** Component product id → locked variant SKU for this kit. */
const KIT_VARIANTS = { 7828: 'WC-211157' };
const KIT_NAME = 'First Cycle Starter Kit';
const KIT_SKU = 'KIT-FIRST-CYCLE-STARTER';

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

function normalizePath(path) {
  const trimmed = path.trim().toLowerCase();
  return trimmed.length > 1 && trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
}

async function findWomensHealthCategoryId() {
  const matchers = [
    '/shop-womens-health',
    '/liivv-health/womens-health/liivv-health-shop/shop-womens-health',
  ];

  let page = 1;
  for (;;) {
    const res = await bc(
      `/v3/catalog/trees/categories?limit=250&page=${page}&include_fields=category_id,name,url`,
    );
    const categories = res.data || [];
    for (const cat of categories) {
      const urlPath = normalizePath(cat.url?.path || '');
      const name = (cat.name || '').toLowerCase();
      if (
        matchers.some((m) => urlPath === normalizePath(m) || urlPath.endsWith(normalizePath(m))) ||
        name.includes("women's health") ||
        name.includes('womens health')
      ) {
        return { id: cat.category_id, name: cat.name, path: cat.url?.path };
      }
    }
    if (!res.meta?.pagination || page >= res.meta.pagination.total_pages) {
      break;
    }
    page += 1;
  }
  return null;
}

async function findExistingKit() {
  const res = await bc(
    `/v3/catalog/products?sku=${encodeURIComponent(KIT_SKU)}&include=custom_fields`,
  );
  return res.data?.[0] ?? null;
}

async function sumComponentPrices() {
  let total = 0;
  for (const id of COMPONENT_IDS) {
    const res = await bc(`/v3/catalog/products/${id}?include_fields=id,name,price,calculated_price`);
    const p = res.data;
    if (!p) {
      console.warn(`Missing component product ${id}`);
      continue;
    }
    const price = Number(p.calculated_price ?? p.price ?? 0);
    total += price;
    console.log(`  component ${id} ${p.name}: ${price}`);
  }
  return Math.round(total * 100) / 100;
}

async function main() {
  console.log('Looking up Shop Women\'s Health category…');
  const category = await findWomensHealthCategoryId();
  if (!category) {
    throw new Error('Could not find Shop Women\'s Health category');
  }
  console.log('Category:', category);

  const existing = await findExistingKit();
  if (existing) {
    console.log('Kit already exists:', existing.id, existing.name, existing.sku);
    // Ensure related products + custom field + category + channel
    await bc(`/v3/catalog/products/${existing.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        related_products: COMPONENT_IDS,
        categories: Array.from(new Set([...(existing.categories || []), category.id])),
        is_visible: true,
        description:
          '<p>A thoughtfully curated starter set for first-period care — gentle, practical essentials chosen to help you feel prepared from day one.</p><p>Review what’s included, remove anything you don’t need, or adjust quantities before adding the kit to your cart. Everything ships as one kit so packing and fulfillment stay simple.</p><ul><li>Organic and skin-kind period care staples</li><li>Pads, liners, tampons, wipes, wash, and reusable underwear</li><li>Customize quantities or remove items before checkout</li></ul>',
      }),
    });
    const fields = existing.custom_fields || [];
    const hasKitType = fields.some(
      (f) => f.name === 'kit_type' && String(f.value).toLowerCase() === 'curated',
    );
    if (!hasKitType) {
      await bc(`/v3/catalog/products/${existing.id}/custom-fields`, {
        method: 'POST',
        body: JSON.stringify({ name: 'kit_type', value: 'curated' }),
      });
    }
    const kitVariantsValue = JSON.stringify(KIT_VARIANTS);
    const variantsField = fields.find((f) => f.name === 'kit_variants');
    if (!variantsField) {
      await bc(`/v3/catalog/products/${existing.id}/custom-fields`, {
        method: 'POST',
        body: JSON.stringify({ name: 'kit_variants', value: kitVariantsValue }),
      });
    } else if (variantsField.value !== kitVariantsValue) {
      await bc(`/v3/catalog/products/${existing.id}/custom-fields/${variantsField.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: 'kit_variants', value: kitVariantsValue }),
      });
    }
    await bc('/v3/catalog/products/channel-assignments', {
      method: 'PUT',
      body: JSON.stringify([{ product_id: existing.id, channel_id: CHANNEL_ID }]),
    });
    console.log('Updated existing kit product', existing.id);
    return existing.id;
  }

  console.log('Summing component prices…');
  const price = await sumComponentPrices();
  console.log('Kit price (sum of components):', price);

  const created = await bc('/v3/catalog/products', {
    method: 'POST',
    body: JSON.stringify({
      name: KIT_NAME,
      type: 'physical',
      weight: 1,
      price,
      sku: KIT_SKU,
      description:
        '<p>A thoughtfully curated starter set for first-period care — gentle, practical essentials chosen to help you feel prepared from day one.</p><p>Review what’s included, remove anything you don’t need, or adjust quantities before adding the kit to your cart. Everything ships as one kit so packing and fulfillment stay simple.</p><ul><li>Organic and skin-kind period care staples</li><li>Pads, liners, tampons, wipes, wash, and reusable underwear</li><li>Customize quantities or remove items before checkout</li></ul>',
      categories: [category.id],
      related_products: COMPONENT_IDS,
      is_visible: true,
      inventory_tracking: 'none',
      custom_fields: [
        { name: 'kit_type', value: 'curated' },
        { name: 'kit_variants', value: JSON.stringify(KIT_VARIANTS) },
      ],
    }),
  });

  const productId = created.data.id;
  console.log('Created product', productId);

  await bc('/v3/catalog/products/channel-assignments', {
    method: 'PUT',
    body: JSON.stringify([{ product_id: productId, channel_id: CHANNEL_ID }]),
  });
  console.log('Assigned to channel', CHANNEL_ID);
  console.log('DONE product_id=', productId);
  return productId;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
