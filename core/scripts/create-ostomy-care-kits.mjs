/**
 * Rebuild the Ostomy Care curated kits in BigCommerce.
 *
 * Run from repo root:
 *   node --env-file=.env.local core/scripts/create-ostomy-care-kits.mjs --dry-run
 *
 * Flags:
 *   --dry-run     read the catalogue and print the plan. Writes are refused.
 *   --only=SKU    limit the run to one kit
 *   --retire-old  hide the earlier invented kits (8036-8040)
 *
 * =============================================================================
 * DRAFT — PENDING OWNER CONFIRMATION. DO NOT RUN WITHOUT IT.
 * =============================================================================
 *
 * The contents below are a recommendation, not an approved kit list, and
 * OWNER_CONFIRMED is false. While it is false this script writes nothing: every
 * non-GET request is refused before it is sent, so the worst a mistaken run can
 * do is read the catalogue and print a plan. Confirming means the owner has read
 * the component list, the locked variants and the descriptions in KIT_META and
 * accepts them as the kits Liivv will sell.
 *
 * What changed from the version that created these kits, and why:
 *
 *   - The component list is written here, per SKU, instead of being parsed from
 *     liivv_kit_components_final.csv. That file is not in the repo, so the old
 *     script threw before it reached the catalogue; and a kit's contents are a
 *     merchandising decision that belongs in a file someone can review, not in a
 *     spreadsheet nobody can find.
 *
 *   - Each kit carries `kitVariants`. A component sold in several sizes has to
 *     be locked to one, or the storefront picks the first option value: that is
 *     how kit 8041 came to pair a 57 mm barrier with a pouch that is only made
 *     in 70 mm. The lock is written once here and never reset (see
 *     ensureCustomFields) — the old script overwrote kit_variants with '{}' on
 *     every run, which silently undid any lock set by hand in the admin.
 *
 *   - The price is the sum of the locked variants' calculated_price, not the
 *     product-level price. They differ: 4541 is 34.35 at product level and 35.05
 *     for the 70 mm variant this kit actually ships.
 *
 *   - A rebuild never sends `is_visible`. Whether a product is live in the store
 *     is the owner's decision in the store, and a script that forces it true can
 *     bring a withheld kit back without anyone asking for it. The single
 *     exception is --retire-old, which only ever hides, and only the five ids in
 *     OLD_AI_KIT_IDS.
 *
 *   - The two starter kits are renamed to say what is in the box rather than who
 *     Liivv imagines is buying it: 'The Fresh Start (New Ostomate Starter Kit)'
 *     and 'Newly Diagnosed: New Ostomy Starter Kit' become 'Two-Piece Starter
 *     Kit (Flat, Cut-to-Fit)' and 'One-Piece Starter Kit (Flat, Cut-to-Fit)'.
 *     A dry run prints each rename, so the owner sees it before confirming.
 *
 *   - Descriptions say what is in the box. No outcome claims (nothing is
 *     "leak-free", nothing "prevents" anything) and no clinician names.
 *
 * Five kits are held and are not rebuilt here: 8042, 8043, 8044, 8045 and 8047.
 * Their names make claims Liivv cannot substantiate, and three of them carry
 * drugs or natural health products. They need renaming and a fresh contents
 * decision before any script touches them. 8046 is held too: a go-bag needs
 * disposal bags, dry wipes and a liner, and the catalogue stocks none of them.
 *
 * See core/app/[locale]/(default)/liivv-health/ostomy-care/oc-ids.ts for the
 * allowlist that keeps all of them off the microsite in the meantime.
 *
 * =============================================================================
 * WHAT IS STILL WRONG IN THE STORE WHILE THIS IS UNCONFIRMED — OPEN OWNER ACTION
 * =============================================================================
 *
 * Nothing in the repo can close the 8041 coupling defect. The storefront can
 * lock a kit component to one variant, but only by reading the `kit_variants`
 * custom field off the kit, and that field is empty on every live kit. Read on
 * 2026-09-16 with GET /v3/catalog/products/{id}?include=custom_fields:
 *
 *   8041  kit_variants = {}   is_visible = true   price 115.27
 *   8046  kit_variants = {}   is_visible = true   price 74.86
 *   8048  kit_variants = {}   is_visible = true   price 175.19
 *
 * So for 8041 as it is sold today: barrier 4541 has two Size values, 57 mm and
 * 70 mm, and neither is marked default, so the page offers a Size select and
 * lands on 57 mm; pouch 4691 is made only in 70 mm. A shopper can still buy a
 * 57 mm barrier with a pouch that cannot couple to it. The product page is
 * live and the allowlist in oc-ids.ts does not cover it — that list only keeps
 * kits off the Ostomy Care surfaces.
 *
 * That defect closes when, and only when, an owner approves KIT_META, sets
 * OWNER_CONFIRMED = true and runs this script without --dry-run, which writes
 * kit_variants = {"4541":"702134","4691":"702148"} onto 8041. Until then the
 * storefront's lock has nothing to read and is inert.
 */
const STORE_HASH = process.env.BIGCOMMERCE_STORE_HASH;
const TOKEN = process.env.CATALYST_PRODUCT_EDIT_TOKEN || process.env.BIGCOMMERCE_ACCESS_TOKEN;
const CHANNEL_ID = Number(process.env.BIGCOMMERCE_CHANNEL_ID || '1');

/** Flip to true only when the owner has approved KIT_META as it stands. */
const OWNER_CONFIRMED = false;

/** Earlier invented kits to hide when --retire-old is passed. */
const OLD_AI_KIT_IDS = [8036, 8037, 8038, 8039, 8040];

/**
 * The kits, by SKU.
 *
 *   id            the live BigCommerce product, for reference in the plan
 *   name          the product name to write
 *   componentIds  related_products, in the order they should read
 *   kitVariants   component product id -> variant SKU, written to kit_variants
 *   gaps          what the kit still needs and the catalogue does not stock
 *   hold          set when the kit is not to be rebuilt, and why
 */
const KIT_META = {
  'KIT-OSTOMY-FRESH-START': {
    id: 8041,
    // Renamed from 'The Fresh Start (New Ostomate Starter Kit)': a name should
    // say what is in the box, so someone shopping for a system they were told
    // to use can recognise it without opening the kit.
    name: 'Two-Piece Starter Kit (Flat, Cut-to-Fit)',
    componentIds: [4541, 4691],
    kitVariants: { 4541: '702134', 4691: '702148' },
    gaps: ['disposal bags — no product in the catalogue'],
    description:
      '<p>A two-piece starter: a flat cut-to-fit skin barrier and a drainable pouch that couples to it. Both are locked to 70&nbsp;mm so the two pieces fit together.</p><ul><li>New Image flat cut-to-fit skin barrier (tape), 70&nbsp;mm</li><li>New Image two-piece drainable pouch, 70&nbsp;mm, clamp closure, opaque</li><li>Change the quantities, or remove an item, before checkout</li></ul><p>Which system and which size suit your stoma is a decision for your NSWOC or your clinic. This is one pairing the store stocks, not a recommendation.</p>',
  },
  'KIT-OSTOMY-NEWLY-DIAGNOSED': {
    id: 8048,
    // Renamed from 'Newly Diagnosed: New Ostomy Starter Kit'. The old name sorts
    // people by their diagnosis instead of by the system they were given, and a
    // product name is not the place to tell someone how new they are.
    name: 'One-Piece Starter Kit (Flat, Cut-to-Fit)',
    componentIds: [4891],
    kitVariants: { 4891: '702524' },
    gaps: [
      'disposal bags — no product in the catalogue',
      'whether this pouch has an integrated closure, which decides if a clamp belongs here',
    ],
    description:
      '<p>A one-piece starter: a flat cut-to-fit drainable pouch with the skin barrier built in, cut to your own stoma size.</p><ul><li>SenSura one-piece drainable pouch, flat, transparent, cut to fit 10&ndash;76&nbsp;mm</li><li>Change the quantity, or remove the item, before checkout</li></ul><p>Which system and which size suit your stoma is a decision for your NSWOC or your clinic. This is one pouch the store stocks, not a recommendation.</p>',
  },
  'KIT-OSTOMY-EVERYDAY-LIVING': {
    id: 8046,
    name: 'Everyday Living (Ostomy Daily Care & Disposal)',
    hold: 'A go-bag needs disposal bags, a dry wipe without moisturisers and a spare liner. The catalogue stocks none of the three, and the kit as sold carries moisturising wipes and a belt instead.',
  },
  'KIT-OSTOMY-SKIN-SHIELD': {
    id: 8042,
    hold: 'Name claims infection prevention; no substantiation on file.',
  },
  'KIT-OSTOMY-INNER-BALANCE': {
    id: 8043,
    hold: 'Probiotics, fibre and antacids — drugs and natural health products, not ostomy supplies.',
  },
  'KIT-OSTOMY-STAY-HYDRATED': {
    id: 8044,
    hold: 'Name claims dehydration rescue, and the kit contains loperamide.',
  },
  'KIT-OSTOMY-LEAK-FREE': {
    id: 8045,
    hold: '"Leak-Free" is an outcome claim.',
  },
  'KIT-OSTOMY-LITTLE-OSTOMATE': {
    id: 8047,
    hold: 'Pediatric kit carrying convex barrier rings and a baby lotion.',
  },
};

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const RETIRE_OLD = args.includes('--retire-old');
const ONLY_SKU = args.find((a) => a.startsWith('--only='))?.slice('--only='.length);

if (!STORE_HASH || !TOKEN) {
  console.error(
    'Missing BIGCOMMERCE_STORE_HASH or CATALYST_PRODUCT_EDIT_TOKEN / BIGCOMMERCE_ACCESS_TOKEN',
  );
  process.exit(1);
}

if (!DRY_RUN && !OWNER_CONFIRMED) {
  console.error(
    'Refusing to run: KIT_META is a draft and OWNER_CONFIRMED is false.\n' +
      'Read the kit contents at the top of this file, get the owner to approve them,\n' +
      'set OWNER_CONFIRMED = true, and run again. Use --dry-run to read the plan now.',
  );
  process.exit(1);
}

/*
 * One door to BigCommerce, and it only opens outward on a confirmed run. A
 * --dry-run that sent a single PUT would be a broken promise, so the refusal is
 * here rather than at each call site, where a later edit could forget it.
 */
async function bc(path, init = {}) {
  const method = init.method || 'GET';

  if (method !== 'GET' && (DRY_RUN || !OWNER_CONFIRMED)) {
    throw new Error(`refused ${method} ${path}: this run is read-only`);
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
    throw new Error(`${method} ${path} -> ${response.status}: ${text}`);
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
  const res = await bc(`/v3/catalog/products?sku=${encodeURIComponent(sku)}&include=custom_fields`);

  return res.data?.[0] ?? null;
}

/**
 * The price of the variant the kit actually ships.
 *
 * Product-level calculated_price is the price of whichever variant BigCommerce
 * happens to consider default, and on these components that is often not the
 * one the kit locks. Where a lock exists, read the variant.
 */
async function lockedVariantPrice(productId, variantSku) {
  const res = await bc(
    `/v3/catalog/products/${productId}/variants?sku:in=${encodeURIComponent(variantSku)}&limit=10`,
  );
  const variant = res.data?.[0];

  if (!variant) {
    return null;
  }

  const price = Number(variant.calculated_price ?? variant.price ?? 0);

  return Number.isFinite(price) && price > 0 ? { price, id: variant.id } : null;
}

async function sumComponentPrices(componentIds, kitVariants) {
  let total = 0;
  const missing = [];
  const unlocked = [];

  for (const id of componentIds) {
    const variantSku = kitVariants?.[id];

    try {
      const res = await bc(
        `/v3/catalog/products/${id}?include_fields=id,name,price,calculated_price`,
      );
      const product = res.data;

      if (!product) {
        missing.push(id);
        continue;
      }

      const locked = variantSku ? await lockedVariantPrice(id, variantSku) : null;

      if (variantSku && !locked) {
        unlocked.push(`${id} (no variant with SKU ${variantSku})`);
      }

      if (!variantSku) {
        unlocked.push(`${id} (no lock in kitVariants)`);
      }

      const price = locked?.price ?? Number(product.calculated_price ?? product.price ?? 0);

      total += price;
      console.log(
        `    component ${id} ${product.name}: ${price}` +
          (locked ? ` (variant ${variantSku}, id ${locked.id})` : ' (product level)'),
      );
    } catch (error) {
      missing.push(id);
      console.warn(`    MISSING component ${id}: ${error.message}`);
    }
  }

  return { total: Math.round(total * 100) / 100, missing, unlocked };
}

/**
 * kit_type and kit_variants.
 *
 * kit_variants is written only when this file names the locks, and an existing
 * value is never replaced with an empty one. A lock set by hand in the admin is
 * worth more than this script's silence about it.
 */
async function ensureCustomFields(productId, existingFields, kitVariants) {
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

  if (!kitVariants || Object.keys(kitVariants).length === 0) {
    return;
  }

  const value = JSON.stringify(kitVariants);
  const variantsField = fields.find((f) => f.name === 'kit_variants');

  if (!variantsField) {
    await bc(`/v3/catalog/products/${productId}/custom-fields`, {
      method: 'POST',
      body: JSON.stringify({ name: 'kit_variants', value }),
    });

    return;
  }

  if (variantsField.value !== value) {
    await bc(`/v3/catalog/products/${productId}/custom-fields/${variantsField.id}`, {
      method: 'PUT',
      body: JSON.stringify({ name: 'kit_variants', value }),
    });
  }
}

async function upsertKit({ sku, meta, categoryId }) {
  const { name, description, componentIds, kitVariants, gaps } = meta;

  console.log(`\n=== ${name} (${sku}) ===`);
  console.log(`  components: ${componentIds.join(', ')}`);
  console.log(`  kit_variants: ${JSON.stringify(kitVariants ?? {})}`);

  const existing = await findExistingKit(sku);

  /*
   * The SKU decided which product to write to; KIT_META said which product this
   * kit IS. If those two disagree, a SKU has been moved or reused in the store,
   * and a confirmed run would rename, reprice, rewrite the description and
   * replace related_products on a product nobody meant to touch. This is the
   * only script authorised to write to BigCommerce, so it stops instead. The
   * throw is caught per kit, so one mismatch fails that kit and not the run.
   */
  if (existing && meta.id && existing.id !== meta.id) {
    throw new Error(
      `${sku}: SKU resolves to product ${existing.id}, but KIT_META declares ${meta.id}`,
    );
  }

  if (existing && existing.name !== name) {
    console.log(`  rename: ${existing.name}  ->  ${name}`);
  }

  const { total: price, missing, unlocked } = await sumComponentPrices(componentIds, kitVariants);

  if (missing.length) {
    throw new Error(`${name}: missing component products: ${missing.join(', ')}`);
  }

  console.log(`  price sum: ${price}`);

  for (const note of unlocked) console.log(`  UNLOCKED component ${note}`);
  for (const gap of gaps ?? []) console.log(`  STILL MISSING: ${gap}`);

  if (DRY_RUN) {
    console.log(`  DRY RUN — would ${existing ? 'update' : 'create'} product`);

    return { id: existing?.id ?? null, sku, name, action: existing ? 'update' : 'create' };
  }

  if (existing) {
    // No is_visible: whether this kit is live is the owner's call in the store.
    await bc(`/v3/catalog/products/${existing.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name,
        price,
        related_products: componentIds,
        categories: Array.from(new Set([...(existing.categories || []), categoryId])),
        description,
      }),
    });
    await ensureCustomFields(existing.id, existing.custom_fields, kitVariants);
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
      inventory_tracking: 'none',
      custom_fields: [
        { name: 'kit_type', value: 'curated' },
        ...(kitVariants && Object.keys(kitVariants).length
          ? [{ name: 'kit_variants', value: JSON.stringify(kitVariants) }]
          : []),
      ],
    }),
  });

  const productId = created.data.id;

  await bc('/v3/catalog/products/channel-assignments', {
    method: 'PUT',
    body: JSON.stringify([{ product_id: productId, channel_id: CHANNEL_ID }]),
  });
  console.log(`  created product ${productId} (visibility left at the store default)`);

  return { id: productId, sku, name, action: 'created' };
}

/*
 * The one place this script touches is_visible, and it only ever hides. It runs
 * on --retire-old alone, never as part of a rebuild, and only on the five ids
 * listed above. A rebuild never sends is_visible at all: see upsertKit.
 */
async function retireOldAiKits() {
  console.log('\n=== Retiring old invented kits ===');

  for (const id of OLD_AI_KIT_IDS) {
    if (DRY_RUN) {
      console.log(`  DRY RUN — would hide product ${id}`);
      continue;
    }

    try {
      await bc(`/v3/catalog/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_visible: false }),
      });
      console.log(`  hid product ${id}`);
    } catch (error) {
      console.warn(`  could not hide ${id}: ${error.message}`);
    }
  }
}

async function main() {
  console.log(
    DRY_RUN
      ? 'DRY RUN — reads only; every write is refused before it is sent.'
      : 'CONFIRMED RUN — this will write to BigCommerce.',
  );
  console.log('Looking up Shop Ostomy Care category…');

  const category = await findOstomyShopCategoryId();

  if (!category) {
    throw new Error('Could not find Shop Ostomy Care category');
  }

  console.log('Category:', category);

  if (RETIRE_OLD) {
    await retireOldAiKits();
  }

  const results = [];
  const errors = [];
  const held = [];

  for (const [sku, meta] of Object.entries(KIT_META)) {
    if (ONLY_SKU && sku !== ONLY_SKU) continue;

    if (meta.hold) {
      held.push({ sku, id: meta.id, reason: meta.hold });
      continue;
    }

    try {
      results.push(await upsertKit({ sku, meta, categoryId: category.id }));
    } catch (error) {
      console.error(`FAILED ${sku}:`, error.message);
      errors.push({ sku, error: error.message });
    }
  }

  console.log('\n========== SUMMARY ==========');

  for (const r of results) {
    console.log(`${r.action.toUpperCase()}  ${r.sku}  id=${r.id}  ${r.name}`);
  }

  if (held.length) {
    console.log('\nHELD — not rebuilt:');

    for (const h of held) console.log(`  ${h.sku} (#${h.id}): ${h.reason}`);
  }

  if (errors.length) {
    console.log('\nERRORS:');

    for (const e of errors) console.log(`  ${e.sku}: ${e.error}`);

    process.exitCode = 1;
  }

  console.log(
    `\nDone. ${results.length} kit(s) processed, ${held.length} held, ${errors.length} error(s).`,
  );

  if (!OWNER_CONFIRMED) {
    console.log(
      'KIT_META is still a draft (OWNER_CONFIRMED = false). Nothing was written, and nothing will be until the owner approves it.',
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
