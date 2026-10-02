/**
 * Create the Ostomy Care accessory kits.
 *
 * These are extras that do not depend on stoma opening size. They are not
 * pouch-and-barrier pairings.
 *
 *   node --env-file=.env.local core/scripts/create-ostomy-accessory-kits.mjs
 *   node --env-file=.env.local core/scripts/create-ostomy-accessory-kits.mjs --confirm
 *
 * A run without --confirm only reads the catalogue and prints the plan.
 * The pouch comfort kit uses the live catalogue price of Adapt Lubricating
 * Deodorant (8016). The owner accepted that price and unhid the product.
 */
const STORE_HASH = process.env.BIGCOMMERCE_STORE_HASH;
const TOKEN = process.env.CATALYST_PRODUCT_EDIT_TOKEN || process.env.BIGCOMMERCE_ACCESS_TOKEN;
const CHANNEL_ID = Number(process.env.BIGCOMMERCE_CHANNEL_ID || '1');
const CONFIRM = process.argv.includes('--confirm');

const KITS = [
  {
    sku: 'KIT-OSTOMY-STARTER-ACCESSORY',
    name: 'Starter Accessory Kit',
    componentIds: [4937, 4439],
    description:
      '<p>Extras for a pouch change and a go-bag. Neither item depends on the size of the opening.</p><ul><li>Adhesive remover wipes, box of 50</li><li>Protective barrier wipes</li><li>Remove either item before checkout</li></ul><p>A barrier wipe is for someone whose nurse recommended one, or who already uses one.</p>',
  },
  {
    sku: 'KIT-OSTOMY-SKIN-COMFORT',
    name: 'Skin Comfort Kit',
    componentIds: [8014, 4890],
    description:
      '<p>A barrier film and a protective sheet. Both sit on the skin and fit any opening size.</p><ul><li>SKIN-PREP protective barrier wipes</li><li>Brava protective sheet, box of 10</li><li>Remove either item before checkout</li></ul><p>Add only what you need. Which of these suits your skin is a question for your NSWOC.</p>',
  },
  {
    sku: 'KIT-OSTOMY-POUCH-COMFORT',
    name: 'Pouch Comfort Kit',
    componentIds: [8012, 8016],
    revealHiddenComponents: true,
    description:
      '<p>For odour and for output that sits at the top of the pouch. Neither item depends on the size of the opening.</p><ul><li>m9 odor eliminator drops</li><li>Adapt lubricating deodorant</li><li>Remove either item before checkout</li></ul>',
  },
];

if (!STORE_HASH || !TOKEN) {
  console.error('Missing BIGCOMMERCE_STORE_HASH or an access token');
  process.exit(1);
}

async function bc(path, init = {}) {
  const method = init.method || 'GET';

  if (method !== 'GET' && !CONFIRM) {
    throw new Error(`refused ${method} ${path}: pass --confirm to write`);
  }

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
    throw new Error(`${method} ${path} -> ${response.status}: ${text.slice(0, 400)}`);
  }

  return json;
}

async function findBySku(sku) {
  const res = await bc(
    `/v3/catalog/products?sku=${encodeURIComponent(sku)}&include=custom_fields&include_fields=id,name,sku,price,categories,is_visible`,
  );

  return (res.data || [])[0] ?? null;
}

async function componentPrice(id) {
  const res = await bc(`/v3/catalog/products/${id}?include_fields=id,name,price,is_visible`);

  return res.data;
}

async function upsert(kit) {
  const parts = [];

  for (const id of kit.componentIds) {
    const product = await componentPrice(id);

    if (!product) throw new Error(`${kit.sku}: missing product ${id}`);

    if (kit.revealHiddenComponents && product.is_visible === false) {
      console.log(`  ${product.id} is still hidden; setting it visible`);

      if (CONFIRM) {
        await bc(`/v3/catalog/products/${product.id}`, {
          method: 'PUT',
          body: JSON.stringify({ is_visible: true }),
        });
      }
    }

    parts.push(product);
  }

  const price = Number(parts.reduce((sum, product) => sum + Number(product.price), 0).toFixed(2));
  const existing = await findBySku(kit.sku);

  console.log(`\n=== ${kit.name} (${kit.sku}) ===`);
  console.log(`  components: ${parts.map((product) => `${product.id} ${product.name} ${product.price}`).join(' | ')}`);
  console.log(`  price sum: ${price}`);
  console.log(`  ${existing ? `update ${existing.id}` : 'create'}`);

  if (!CONFIRM) {
    console.log('  DRY RUN');

    return existing?.id ?? null;
  }

  if (existing) {
    await bc(`/v3/catalog/products/${existing.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: kit.name,
        price,
        related_products: kit.componentIds,
        categories: Array.from(new Set([...(existing.categories || []), 1150])),
        description: kit.description,
        is_visible: true,
      }),
    });
    const fields = existing.custom_fields || [];

    if (!fields.some((field) => field.name === 'kit_type' && String(field.value).toLowerCase() === 'curated')) {
      await bc(`/v3/catalog/products/${existing.id}/custom-fields`, {
        method: 'POST',
        body: JSON.stringify({ name: 'kit_type', value: 'curated' }),
      });
    }

    await bc('/v3/catalog/products/channel-assignments', {
      method: 'PUT',
      body: JSON.stringify([{ product_id: existing.id, channel_id: CHANNEL_ID }]),
    });
    console.log(`  updated ${existing.id}`);

    return existing.id;
  }

  const created = await bc('/v3/catalog/products', {
    method: 'POST',
    body: JSON.stringify({
      name: kit.name,
      type: 'physical',
      weight: 1,
      price,
      sku: kit.sku,
      description: kit.description,
      categories: [1150],
      related_products: kit.componentIds,
      inventory_tracking: 'none',
      is_visible: true,
      custom_fields: [{ name: 'kit_type', value: 'curated' }],
    }),
  });
  const productId = created.data.id;

  await bc('/v3/catalog/products/channel-assignments', {
    method: 'PUT',
    body: JSON.stringify([{ product_id: productId, channel_id: CHANNEL_ID }]),
  });
  console.log(`  created ${productId}`);

  return productId;
}

for (const kit of KITS) {
  const id = await upsert(kit);

  console.log(`  RESULT ${kit.sku} ${id ?? '(not created)'}`);
}
