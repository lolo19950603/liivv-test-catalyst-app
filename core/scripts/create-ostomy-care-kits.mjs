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
 * MATCHED-SYSTEM TABLE. WRITTEN 2026-09-29.
 * =============================================================================
 *
 * A confirmed run creates the eight kits in KIT_META (or updates them when the
 * SKU already exists). 8041-8048 were deleted from the catalogue on 2026-09-29,
 * so this script no longer hides them. 8036-8040 stay hidden; --retire-old is
 * the only path that touches them.
 *
 * A two-piece pouch is paired only with a barrier from the same product line
 * and the same flange size. New Image uses a colour code (green 44 mm, red
 * 57 mm, blue 70 mm). SenSura Click, Natura, and Assura do not interchange.
 * Convex pieces, powder, paste, rings, wipes, belts, and clamp 4406 are not
 * in these kits. Prices are the sum of the locked variants' calculated_price,
 * re-read on the run.
 *
 * Created on 2026-09-29:
 *   8061  KIT-OSTOMY-NI-DRAIN-57     85.30
 *   8062  KIT-OSTOMY-NI-DRAIN-70     86.00
 *   8063  KIT-OSTOMY-NI-CLOSED-57   105.44
 *   8064  KIT-OSTOMY-SC-DRAIN-50     99.57
 *   8065  KIT-OSTOMY-SC-ONE-PIECE    71.88
 *   8066  KIT-OSTOMY-NI-URO-70       83.84
 *   8067  KIT-OSTOMY-SC-URO-50      100.07
 *   8068  KIT-OSTOMY-POUCHKINS-44    67.70
 *
 * OWNER_CONFIRMED is false again. While it is false every non-GET is refused
 * before it is sent, so a mistaken run only reads the catalogue and prints.
 *
 * VERIFIED AGAINST THE LIVE CATALOGUE — GET only, 2026-09-22:
 *
 *   4541  New Image Flat FlexWear Skin Barrier (Tape) (Cut To Fit)
 *         variant 702134 exists (id 5500): Box of 5 / 70 mm / Colour Match
 *         Blue, calculated_price 35.05, purchasing_disabled false. The other
 *         variant, 702133, is Box of 5 / 57 mm / Red at 34.35 — the 57 mm the
 *         page lands on today. 'Flat', not convex: every convex New Image
 *         barrier is a separate product (4204, 4512, 4613, 4806, 4856, 5034),
 *         from a sweep of every product name in the catalogue for 'convex'.
 *   4691  New Image Two-Piece Drainable Ostomy Pouch (Clamp Closure) (Opaque)
 *         variant 702148 exists (id 5815) and is the only variant: Box of 10 /
 *         70 mm / Blue, calculated_price 38.31, purchasing_disabled false. A
 *         pouch, so convexity does not apply; nothing in its name or
 *         description says convex.
 *   4891  SenSura 1-Piece Drainable Pouch (Flat) (Transparent)
 *         variant 702524 exists (id 6225) and is the only variant: Box of 10 /
 *         Size 10 - 76 mm / Length 30 cm, calculated_price 71.88,
 *         purchasing_disabled false. 'Flat', not convex.
 *
 * Stock: all three products are is_visible true and availability 'available',
 * and each locked variant reports purchasing_disabled false. Read the variant
 * for that answer, not the product: the v3 product payload leaves
 * purchasing_disabled out entirely, even when it is asked for by name in
 * include_fields, so a product-level reading of it would be reading an absent
 * field as if it were false. And inventory_tracking is 'none' on all three, so
 * inventory_level 0 means untracked, not sold out, and BigCommerce will sell
 * them without limit. There is no real stock figure in the catalogue to check.
 *
 * The two clamp questions, answered only as far as the catalogue answers them:
 *
 *   - 4691 (in 8041). Its name is 'Clamp Closure', its description says 'To
 *     close the pouch, use the curved, beige clamp', and 'Curved, beige pouch
 *     clamp' is the first entry in its own feature list — so the clamp is
 *     described as part of this product, and no separate clamp is added to
 *     8041. What the catalogue does NOT say is how many clamps a box of 10
 *     contains, or whether any ship at all. Not guessed here.
 *   - 4891 (in 8048). The catalogue cannot answer this one. Its whole
 *     description is two sentences about the adhesive being fixed to the pouch;
 *     it says nothing about the outlet or the closure, it has no metafields and
 *     no spec fields, and its name says only 'Flat' and 'Transparent'. So
 *     whether it has an integrated closure is unknown, and clamp 4406 is NOT
 *     added on a guess — 4406's own description ('to seal the bottom of a
 *     drainable ostomy pouch that does not have an integrated closure', box of
 *     20, 4.21) would decide the question if 4891's description named its
 *     closure, and it does not. This is the one open question in the table, and
 *     it needs Coloplast's own product page or the box, not the catalogue.
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
 * A create sets is_visible true, category 1150, and the storefront channel.
 * An update of an existing SKU re-adds category 1150 and the channel, and does
 * not send is_visible. The dry run prints both in `would write:`.
 *
 * Descriptions name the two pieces and say the fit is the nurse's decision.
 * Nothing is "leak-free" and nothing "prevents" anything.
 *
 * See oc-ids.ts for the ids the shop, search, landing, and chapters use.
 */
const STORE_HASH = process.env.BIGCOMMERCE_STORE_HASH;
const TOKEN = process.env.CATALYST_PRODUCT_EDIT_TOKEN || process.env.BIGCOMMERCE_ACCESS_TOKEN;
const CHANNEL_ID = Number(process.env.BIGCOMMERCE_CHANNEL_ID || '1');

/**
 * Flip to true only for a new write the owner has just approved. The matched
 * table was written on 2026-09-29. See the header. Set this back to false after.
 */
const OWNER_CONFIRMED = false;

/** Earlier invented kits to hide when --retire-old is passed. */
const OLD_AI_KIT_IDS = [8036, 8037, 8038, 8039, 8040];

/** 8041-8048 were deleted on 2026-09-29. Nothing left here to hide. */
const PREVIOUS_KIT_IDS = [];

/**
 * The kits, by SKU.
 *
 *   id            the live BigCommerce product, for reference in the plan
 *   name          the product name to write
 *   componentIds  related_products, in the order they should read
 *   kitVariants   component product id -> variant SKU, written to kit_variants
 *   gaps          what the kit still needs and the catalogue does not stock
 *   open          questions the catalogue cannot answer, printed by a dry run
 *   hold          set when the kit is not to be rebuilt, and why
 */
const nurseLine =
  'Which system and which size suit your stoma is a decision for your NSWOC or your clinic. This is one pairing the store stocks, not a recommendation.';

const KIT_META = {
  'KIT-OSTOMY-NI-DRAIN-57': {
    id: 8061,
    name: 'New Image Two-Piece Drainable Kit (Flat, 57 mm Red)',
    componentIds: [4541, 4878],
    kitVariants: { 4541: '702133', 4878: '702146' },
    description:
      '<p>A two-piece drainable kit. Both pieces are New Image, flat, and locked to the red 57&nbsp;mm flange, so they couple. The pouch closes with Lock &#8217;n Roll.</p><ul><li>New Image flat cut-to-fit FlexWear skin barrier with a tape border, 57&nbsp;mm red &mdash; box of 5</li><li>New Image two-piece drainable pouch, Lock &#8217;n Roll closure, opaque, 57&nbsp;mm red &mdash; box of 10</li><li>Change the quantities, or remove an item, before checkout</li></ul><p>' +
      nurseLine +
      '</p>',
  },
  'KIT-OSTOMY-NI-DRAIN-70': {
    id: 8062,
    name: 'New Image Two-Piece Drainable Kit (Flat, 70 mm Blue)',
    componentIds: [4541, 4878],
    kitVariants: { 4541: '702134', 4878: '702147' },
    description:
      '<p>A two-piece drainable kit. Both pieces are New Image, flat, and locked to the blue 70&nbsp;mm flange, so they couple. The pouch closes with Lock &#8217;n Roll.</p><ul><li>New Image flat cut-to-fit FlexWear skin barrier with a tape border, 70&nbsp;mm blue &mdash; box of 5</li><li>New Image two-piece drainable pouch, Lock &#8217;n Roll closure, opaque, 70&nbsp;mm blue &mdash; box of 10</li><li>Change the quantities, or remove an item, before checkout</li></ul><p>' +
      nurseLine +
      '</p>',
  },
  'KIT-OSTOMY-NI-CLOSED-57': {
    id: 8063,
    name: 'New Image Two-Piece Closed Kit (Flat, 57 mm Red)',
    componentIds: [4541, 4571],
    kitVariants: { 4541: '702133', 4571: '702637' },
    description:
      '<p>A two-piece closed kit. Both pieces are New Image, flat, and locked to the red 57&nbsp;mm flange, so they couple. The pouch is closed: it comes off whole and is replaced, rather than emptied.</p><ul><li>New Image flat cut-to-fit FlexWear skin barrier with a tape border, 57&nbsp;mm red &mdash; box of 5</li><li>New Image two-piece closed pouch, filter, opaque, 57&nbsp;mm red &mdash; box of 30</li><li>Change the quantities, or remove an item, before checkout</li></ul><p>' +
      nurseLine +
      '</p>',
  },
  'KIT-OSTOMY-SC-DRAIN-50': {
    id: 8064,
    name: 'SenSura Click Two-Piece Drainable Kit (Flat, 50 mm)',
    componentIds: [4583, 4438],
    kitVariants: { 4583: '702199', 4438: '702200' },
    description:
      '<p>A two-piece drainable kit. Both pieces are SenSura Click, flat, and locked to the 50&nbsp;mm coupling, so they click together. They do not fit a New Image or Natura flange.</p><ul><li>SenSura Click flat flange, 50&nbsp;mm coupling, cut to fit 10&ndash;45&nbsp;mm &mdash; box of 5</li><li>SenSura Click two-piece drainable pouch, wide outlet, filter, 50&nbsp;mm, 30&nbsp;cm &mdash; box of 10</li><li>Change the quantities, or remove an item, before checkout</li></ul><p>' +
      nurseLine +
      '</p>',
  },
  'KIT-OSTOMY-SC-ONE-PIECE': {
    id: 8065,
    name: 'SenSura One-Piece Drainable Kit (Flat, Transparent)',
    componentIds: [4891],
    kitVariants: { 4891: '702524' },
    open: [
      'whether pouch 4891 has an integrated closure — the catalogue does not say, so clamp 4406 is not in this kit',
    ],
    description:
      '<p>A one-piece drainable kit: the skin barrier is built into the pouch, so there is no second piece to match. The pouch is flat and transparent, cut to fit 10&ndash;76&nbsp;mm.</p><ul><li>SenSura one-piece drainable pouch, flat, transparent, 30&nbsp;cm long &mdash; box of 10</li><li>Change the quantity, or remove the item, before checkout</li></ul><p>' +
      nurseLine +
      '</p>',
  },
  'KIT-OSTOMY-NI-URO-70': {
    id: 8066,
    name: 'New Image Two-Piece Urostomy Kit (Flat, 70 mm Blue)',
    componentIds: [4541, 4581],
    kitVariants: { 4541: '702134', 4581: '702157' },
    description:
      '<p>A two-piece urostomy kit. Both pieces are New Image, flat, and locked to the blue 70&nbsp;mm flange, so they couple. The pouch is a urostomy pouch, not a fecal pouch.</p><ul><li>New Image flat cut-to-fit FlexWear skin barrier with a tape border, 70&nbsp;mm blue &mdash; box of 5</li><li>New Image two-piece urostomy pouch, 70&nbsp;mm blue &mdash; box of 10</li><li>Change the quantities, or remove an item, before checkout</li></ul><p>' +
      nurseLine +
      '</p>',
  },
  'KIT-OSTOMY-SC-URO-50': {
    id: 8067,
    name: 'SenSura Click Two-Piece Urostomy Kit (Flat, 50 mm)',
    componentIds: [4583, 4365],
    kitVariants: { 4583: '702199', 4365: '702263' },
    description:
      '<p>A two-piece urostomy kit. Both pieces are SenSura Click, flat, and locked to the 50&nbsp;mm coupling, so they click together. The pouch is a urostomy pouch, not a fecal pouch.</p><ul><li>SenSura Click flat flange, 50&nbsp;mm coupling, cut to fit 10&ndash;45&nbsp;mm &mdash; box of 5</li><li>SenSura Click urostomy pouch, opaque, 50&nbsp;mm, 26&nbsp;cm &mdash; box of 10</li><li>Change the quantities, or remove an item, before checkout</li></ul><p>' +
      nurseLine +
      '</p>',
  },
  'KIT-OSTOMY-POUCHKINS-44': {
    id: 8068,
    name: 'Pouchkins Two-Piece Kit (Flat, 44 mm Green)',
    componentIds: [4899, 4968],
    kitVariants: { 4899: '702227', 4968: '702229' },
    description:
      '<p>A two-piece pediatric kit. Both pieces are Pouchkins, flat, and locked to the green 44&nbsp;mm flange, so they couple. Hollister states that a Pouchkins pouch fits a 44&nbsp;mm New Image or Pouchkins barrier.</p><ul><li>Pouchkins pediatric flat skin barrier, 44&nbsp;mm green &mdash; box of 5</li><li>Pouchkins two-piece pediatric pouch, Lock &#8217;n Roll closure, 44&nbsp;mm green &mdash; box of 10</li><li>Change the quantities, or remove an item, before checkout</li></ul><p>' +
      nurseLine +
      '</p>',
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
    'Refusing to run: OWNER_CONFIRMED is false.\n' +
      'The matched-system table is in this file. Set OWNER_CONFIRMED = true only after it is approved.\n' +
      'Use --dry-run to read the plan now.',
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

function describeList(list) {
  return list && list.length ? list.join(', ') : '(none)';
}

/* A description is HTML; the owner needs to recognise it, not read it here. */
function firstLine(text) {
  const flat = String(text ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!flat) return '(empty)';

  return flat.length > 150 ? `${flat.slice(0, 150)}…` : flat;
}

/*
 * Everything a confirmed run would send, printed before the owner approves it.
 *
 * The dry run used to print the components, the kit_variants, the rename and a
 * price sum, then "DRY RUN — would update product". The PUT behind that line
 * also rewrites the description, REPLACES related_products outright, adds the
 * kit back to the ostomy category, and assigns it to the storefront channel.
 * None of that appeared anywhere in the output.
 *
 * An update re-adds Shop Ostomy Care and the storefront channel. The dry run
 * prints that so an approval covers the whole change.
 */
function printPlannedChanges({
  existing,
  name,
  price,
  componentIds,
  categoryId,
  description,
  kitVariants,
}) {
  const declaredVariants = kitVariants && Object.keys(kitVariants).length > 0;

  console.log('  would write:');

  if (!existing) {
    console.log(`    name:             ${name}`);
    console.log(`    price:            ${price}`);
    console.log(`    related_products: ${describeList(componentIds)}`);
    console.log(`    categories:       ${categoryId}`);
    console.log('    channel:          assign to the storefront channel (BIGCOMMERCE_CHANNEL_ID)');
    console.log(`    kit_variants:     ${JSON.stringify(kitVariants ?? {})}`);
    console.log(`    description:      ${firstLine(description)}`);
    console.log('    is_visible:       true');

    return;
  }

  const currentCategories = existing.categories || [];
  const nextCategories = Array.from(new Set([...currentCategories, categoryId]));
  const addedCategories = nextCategories.filter((id) => !currentCategories.includes(id));
  const currentVariants =
    (existing.custom_fields || []).find((field) => field.name === 'kit_variants')?.value ??
    '(unset)';

  console.log(`    name:             ${existing.name}  ->  ${name}`);
  console.log(`    price:            ${existing.price}  ->  ${price}`);
  console.log(
    `    related_products: ${describeList(existing.related_products)}  ->  ${describeList(componentIds)}   (replaced, not merged)`,
  );
  console.log(
    `    categories:       ${describeList(currentCategories)}  ->  ${describeList(nextCategories)}`,
  );

  if (addedCategories.length) {
    console.log(
      `      ADDS CATEGORY ${addedCategories.join(', ')} — a confirmed update puts this kit back in Shop Ostomy Care.`,
    );
  }

  console.log(`    channel:          assign product ${existing.id} to the storefront channel (BIGCOMMERCE_CHANNEL_ID)`);
  console.log(
    `    kit_variants:     ${currentVariants}  ->  ${declaredVariants ? JSON.stringify(kitVariants) : '(unchanged — none declared)'}`,
  );
  console.log(`    description now:  ${firstLine(existing.description)}`);
  console.log(`    description next: ${firstLine(description)}`);
  console.log(`    is_visible:       not sent (currently ${existing.is_visible})`);
}

async function upsertKit({ sku, meta, categoryId }) {
  const { name, description, componentIds, kitVariants, gaps, open } = meta;

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
  for (const question of open ?? []) console.log(`  OPEN QUESTION: ${question}`);

  if (DRY_RUN) {
    printPlannedChanges({
      existing,
      name,
      price,
      componentIds,
      categoryId,
      description,
      kitVariants,
    });
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
      is_visible: true,
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
  console.log(
    `  created product ${productId} path=${created.data.custom_url?.url ?? '(no path yet)'}`,
  );

  return { id: productId, sku, name, action: 'created' };
}

/*
 * 8041-8048 were deleted on 2026-09-29. The list is empty, so a confirmed run
 * does not look them up. Kept as a function so a later retire list can use it.
 */
async function hidePreviousKits() {
  if (!PREVIOUS_KIT_IDS.length) return;
  console.log('\n=== Hiding the previous eight kits ===');

  for (const id of PREVIOUS_KIT_IDS) {
    if (DRY_RUN) {
      console.log(`  DRY RUN — would hide product ${id} (is_visible false; categories unchanged)`);
      continue;
    }

    await bc(`/v3/catalog/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ is_visible: false }),
    });
    console.log(`  hid product ${id}`);
  }
}
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

  if (!ONLY_SKU && !errors.length) {
    await hidePreviousKits();
  } else if (!ONLY_SKU && errors.length) {
    console.log('\nPrevious eight kits left visible: this run did not create every new kit.');
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
      'OWNER_CONFIRMED is false. This run wrote nothing.',
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
