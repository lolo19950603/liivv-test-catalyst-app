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
    componentIds: [4937, 4439, 4936, 4378, 4250, 4700, 4370],
    // One variant each. Locks the cart line so a required option does not sit open.
    kitVariants: {
      4937: 'RP-403120',
      4439: 'CON37439',
      4936: 'CAV-001',
      4378: '701216',
      4700: '701373',
      4370: '700894',
    },
    description:
      '<p>Extras for a pouch change and a go-bag. None of these depend on the size of the opening.</p><ul><li>Adhesive remover wipes, box of 50</li><li>Protective barrier wipes</li><li>Cavilon no-sting barrier spray</li><li>Lister bandage scissors</li><li>Vinyl exam gloves, medium, box of 100</li><li>Sterile gauze sponges, 10&nbsp;cm, box of 100</li><li>Hand sanitizer, 540&nbsp;ml</li><li>Remove any item before checkout</li></ul><p>A barrier wipe or spray is for someone whose nurse recommended one, or who already uses one. The gloves are medium.</p>',
  },
  {
    sku: 'KIT-OSTOMY-SKIN-COMFORT',
    name: 'Skin Comfort Kit',
    componentIds: [8014, 4890, 4703, 4610, 4820],
    kitVariants: {
      8014: 'SN59420425',
      4890: '701514',
      4703: '701490',
      4610: '701488',
      4820: '600070',
    },
    description:
      '<p>A barrier film, a protective sheet, paste, powder, and a barrier cream. All of them sit on the skin and fit any opening size.</p><ul><li>SKIN-PREP protective barrier wipes</li><li>Brava protective sheet, box of 10</li><li>Stomahesive paste</li><li>Stomahesive powder, for moist skin</li><li>Cavilon barrier cream</li><li>Remove any item before checkout</li></ul><p>Add only what you need. Which of these suits your skin is a question for your NSWOC.</p>',
  },
  {
    sku: 'KIT-OSTOMY-POUCH-COMFORT',
    name: 'Pouch Comfort Kit',
    componentIds: [8012, 8016, 4406, 4647],
    revealHiddenComponents: true,
    kitVariants: {
      8012: 'HOL-7715',
      8016: 'HOL-78501',
      4406: '702635',
      4647: '702486',
    },
    description:
      '<p>For odour, for output that sits at the top of the pouch, a clamp if the pouch closes with one, and a belt if the pouch has belt tabs. None of these depend on the size of the opening.</p><ul><li>m9 odor eliminator drops</li><li>Adapt lubricating deodorant</li><li>Drainable pouch clamp, for clamp-closure pouches</li><li>Adapt ostomy belt, adjustable 58&ndash;109&nbsp;cm, for pouches with belt tabs</li><li>Remove any item before checkout</li></ul>',
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
  const res = await bc(
    `/v3/catalog/products/${id}?include=variants&include_fields=id,name,price,is_visible`,
  );
  const product = res.data;
  const sellingPrice = await storefrontPrice(id);

  // The kit total on the product page uses the storefront price, including
  // a sale price. The catalogue base price can be a different number.
  if (sellingPrice != null) {
    product.price = sellingPrice;
  } else if (product?.variants?.length === 1 && product.variants[0].price != null) {
    product.price = product.variants[0].price;
  }

  return product;
}

async function storefrontPrice(id) {
  const token = process.env.BIGCOMMERCE_STOREFRONT_TOKEN;

  if (!token) return null;

  const response = await fetch(`https://store-${STORE_HASH}.mybigcommerce.com/graphql`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `query($id: Int!) { site { product(entityId: $id) { prices(currencyCode: CAD) { price { value } salePrice { value } } } } }`,
      variables: { id },
    }),
  });
  const json = await response.json();
  const prices = json.data?.site?.product?.prices;

  return prices?.salePrice?.value ?? prices?.price?.value ?? null;
}

async function upsertCustomField(productId, fields, name, value) {
  const field = fields.find((entry) => entry.name === name);

  if (field) {
    if (String(field.value) === value) return;

    await bc(`/v3/catalog/products/${productId}/custom-fields/${field.id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, value }),
    });

    return;
  }

  await bc(`/v3/catalog/products/${productId}/custom-fields`, {
    method: 'POST',
    body: JSON.stringify({ name, value }),
  });
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

    if (kit.kitVariants) {
      await upsertCustomField(existing.id, fields, 'kit_variants', JSON.stringify(kit.kitVariants));
    }

    const detail = await bc(`/v3/catalog/products/${existing.id}?include=variants`);
    const variants = detail.data?.variants || [];

    if (variants.length === 1) {
      await bc(`/v3/catalog/products/${existing.id}/variants/${variants[0].id}`, {
        method: 'PUT',
        body: JSON.stringify({ price }),
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
      custom_fields: [
        { name: 'kit_type', value: 'curated' },
        ...(kit.kitVariants ? [{ name: 'kit_variants', value: JSON.stringify(kit.kitVariants) }] : []),
      ],
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
