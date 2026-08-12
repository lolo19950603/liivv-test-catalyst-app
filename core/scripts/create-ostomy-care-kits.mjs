/**
 * Create Ostomy Care curated kits in BigCommerce.
 *
 * Run from repo root:
 *   node --env-file=.env.local core/scripts/create-ostomy-care-kits.mjs
 *
 * Optional:
 *   --dry-run   validate components / print plan only
 *   --only=SKU  create/update a single kit by SKU
 */
const STORE_HASH = process.env.BIGCOMMERCE_STORE_HASH;
const TOKEN = process.env.CATALYST_PRODUCT_EDIT_TOKEN || process.env.BIGCOMMERCE_ACCESS_TOKEN;
const CHANNEL_ID = Number(process.env.BIGCOMMERCE_CHANNEL_ID || '1');

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const ONLY_SKU = args.find((a) => a.startsWith('--only='))?.slice('--only='.length);

/** @type {Array<{ name: string; sku: string; description: string; componentIds: number[] }>} */
const KITS = [
  {
    name: 'New Journey Starter Kit',
    sku: 'KIT-OSTOMY-NEW-JOURNEY',
    description:
      '<p>A calm first-weeks edit — drainable pouching, skin protectant, powder, and odor care you can tune before checkout.</p><ul><li>One-piece drainable pouching</li><li>Protective barrier wipe and stoma powder</li><li>Odor eliminator drops</li><li>Customize quantities or remove items before checkout</li></ul>',
    componentIds: [4441, 4531, 4610, 8012],
  },
  {
    name: 'Two-Piece Everyday Restock Kit',
    sku: 'KIT-OSTOMY-TWO-PIECE-RESTOCK',
    description:
      '<p>Everyday restock for two-piece routines — pouch, flange, and barrier ring essentials in one customizable kit.</p><ul><li>Two-piece drainable pouch</li><li>Flat flange</li><li>Barrier ring for a closer seal</li><li>Customize quantities or remove items before checkout</li></ul>',
    componentIds: [4361, 4583, 4560],
  },
  {
    name: 'Skin Comfort & Seal Kit',
    sku: 'KIT-OSTOMY-SKIN-COMFORT',
    description:
      '<p>Peristomal skin comfort staples — powder, paste, protective wipe, adhesive remover, and a barrier ring.</p><ul><li>Stoma powder and strip paste</li><li>Protective barrier wipe</li><li>Adhesive remover wipes</li><li>Barrier ring for fit support</li></ul>',
    componentIds: [4610, 4598, 4439, 7998, 5067],
  },
  {
    name: 'Go-Bag Essentials Kit',
    sku: 'KIT-OSTOMY-GO-BAG',
    description:
      '<p>A discreet go-bag edit — spare pouching support, belt, odor drops, and skin wipe for days away from home.</p><ul><li>One-piece drainable pouch</li><li>Ostomy belt</li><li>Odor eliminator drops</li><li>Protective barrier wipe</li></ul>',
    componentIds: [4891, 4647, 8012, 4531],
  },
  {
    name: 'Urostomy Care Kit',
    sku: 'KIT-OSTOMY-UROSTOMY',
    description:
      '<p>Urostomy-focused essentials — pouching, drain adapter, and skin protectant in one customizable kit.</p><ul><li>Two-piece urostomy pouch</li><li>Drain tube adapter</li><li>Protective barrier wipe</li><li>Customize quantities or remove items before checkout</li></ul>',
    componentIds: [4581, 4207, 8014],
  },
];

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

async function findOstomyShopCategoryId() {
  const matchers = ['/liivv-health/ostomy-care/shop-ostomy-care', '/shop-ostomy-care'];

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
        name === 'shop ostomy care'
      ) {
        return { id: cat.category_id, name: cat.name, path: cat.url?.path };
      }
    }
    if (!res.meta?.pagination || page >= res.meta.pagination.total_pages) break;
    page += 1;
  }
  return null;
}

async function findExistingKit(sku) {
  const res = await bc(
    `/v3/catalog/products?sku=${encodeURIComponent(sku)}&include=custom_fields`,
  );
  return res.data?.[0] ?? null;
}

async function sumComponentPrices(componentIds) {
  let total = 0;
  const missing = [];
  for (const id of componentIds) {
    try {
      const res = await bc(
        `/v3/catalog/products/${id}?include_fields=id,name,price,calculated_price`,
      );
      const p = res.data;
      if (!p) {
        missing.push(id);
        continue;
      }
      const price = Number(p.calculated_price ?? p.price ?? 0);
      total += price;
      console.log(`    component ${id} ${p.name}: ${price}`);
    } catch (error) {
      missing.push(id);
      console.warn(`    MISSING component ${id}: ${error.message}`);
    }
  }
  return { total: Math.round(total * 100) / 100, missing };
}

async function ensureCustomFields(productId, existingFields) {
  const fields = existingFields || [];
  const hasKitType = fields.some(
    (f) => f.name === 'kit_type' && String(f.value).toLowerCase() === 'curated',
  );
  if (!hasKitType) {
    await bc(`/v3/catalog/products/${productId}/custom-fields`, {
      method: 'POST',
      body: JSON.stringify({ name: 'kit_type', value: 'curated' }),
    });
  }

  const kitVariantsValue = '{}';
  const variantsField = fields.find((f) => f.name === 'kit_variants');
  if (!variantsField) {
    await bc(`/v3/catalog/products/${productId}/custom-fields`, {
      method: 'POST',
      body: JSON.stringify({ name: 'kit_variants', value: kitVariantsValue }),
    });
  } else if (variantsField.value !== kitVariantsValue) {
    await bc(`/v3/catalog/products/${productId}/custom-fields/${variantsField.id}`, {
      method: 'PUT',
      body: JSON.stringify({ name: 'kit_variants', value: kitVariantsValue }),
    });
  }
}

async function upsertKit({ name, sku, description, componentIds, categoryId }) {
  console.log(`\n=== ${name} (${sku}) ===`);
  console.log(`  components: ${componentIds.join(', ')}`);

  const existing = await findExistingKit(sku);
  const { total: price, missing } = await sumComponentPrices(componentIds);
  if (missing.length) {
    throw new Error(`${name}: missing component products: ${missing.join(', ')}`);
  }
  console.log(`  price sum: ${price}`);

  if (DRY_RUN) {
    console.log(`  DRY RUN — would ${existing ? 'update' : 'create'} product`);
    return { id: existing?.id ?? null, sku, name, action: existing ? 'update' : 'create', dryRun: true };
  }

  if (existing) {
    await bc(`/v3/catalog/products/${existing.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name,
        price,
        related_products: componentIds,
        categories: Array.from(new Set([...(existing.categories || []), categoryId])),
        is_visible: true,
        description,
      }),
    });
    await ensureCustomFields(existing.id, existing.custom_fields);
    await bc('/v3/catalog/products/channel-assignments', {
      method: 'PUT',
      body: JSON.stringify([{ product_id: existing.id, channel_id: CHANNEL_ID }]),
    });
    console.log(`  updated product ${existing.id}`);
    return { id: existing.id, sku, name, action: 'updated' };
  }

  const created = await bc('/v3/catalog/products', {
    method: 'POST',
    body: JSON.stringify({
      name,
      type: 'physical',
      weight: 1,
      price,
      sku,
      description,
      categories: [categoryId],
      related_products: componentIds,
      is_visible: true,
      inventory_tracking: 'none',
      custom_fields: [
        { name: 'kit_type', value: 'curated' },
        { name: 'kit_variants', value: '{}' },
      ],
    }),
  });

  const productId = created.data.id;
  await bc('/v3/catalog/products/channel-assignments', {
    method: 'PUT',
    body: JSON.stringify([{ product_id: productId, channel_id: CHANNEL_ID }]),
  });
  console.log(`  created product ${productId}`);
  return { id: productId, sku, name, action: 'created' };
}

async function main() {
  console.log('Looking up Shop Ostomy Care category…');
  const category = await findOstomyShopCategoryId();
  if (!category) {
    throw new Error('Could not find Shop Ostomy Care category');
  }
  console.log('Category:', category);

  const kits = ONLY_SKU ? KITS.filter((k) => k.sku === ONLY_SKU) : KITS;
  if (!kits.length) {
    throw new Error(`No kits matched --only=${ONLY_SKU}`);
  }

  const results = [];
  for (const kit of kits) {
    results.push(
      await upsertKit({
        ...kit,
        categoryId: category.id,
      }),
    );
  }

  console.log('\n=== SUMMARY ===');
  for (const r of results) {
    console.log(`${r.action}\t${r.id}\t${r.sku}\t${r.name}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
