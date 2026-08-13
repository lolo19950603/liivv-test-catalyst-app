/**
 * Create Ostomy Care curated kits in BigCommerce from liivv_kit_components_final.csv.
 *
 * Run from repo root:
 *   node --env-file=.env.local core/scripts/create-ostomy-care-kits.mjs
 *
 * Optional:
 *   --dry-run   validate components / print plan only
 *   --only=SKU  create/update a single kit by SKU
 *   --retire-old  hide previously AI-invented kits (8036–8040)
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const STORE_HASH = process.env.BIGCOMMERCE_STORE_HASH;
const TOKEN = process.env.CATALYST_PRODUCT_EDIT_TOKEN || process.env.BIGCOMMERCE_ACCESS_TOKEN;
const CHANNEL_ID = Number(process.env.BIGCOMMERCE_CHANNEL_ID || '1');

const __dirname = dirname(fileURLToPath(import.meta.url));
const CSV_PATH = join(__dirname, '../../liivv_kit_components_final.csv');

/** Previously AI-invented kits to hide when --retire-old is passed. */
const OLD_AI_KIT_IDS = [8036, 8037, 8038, 8039, 8040];

/** Kit display name → SKU + short PDP description */
const KIT_META = {
  'The Fresh Start (New Ostomate Starter Kit)': {
    sku: 'KIT-OSTOMY-FRESH-START',
    description:
      '<p>A calm new-ostomate starter edit — barrier, drainable pouch, paste, skin prep, and a support belt you can tune before checkout.</p><ul><li>Two-piece pouching and flat FlexWear barrier</li><li>Stomahesive paste and Skin-Prep wipe</li><li>Brava ostomy belt for extra security</li><li>Customize quantities or remove items before checkout</li></ul>',
  },
  'Skin Shield (Peristomal Skin Health & Infection Prevention)': {
    sku: 'KIT-OSTOMY-SKIN-SHIELD',
    description:
      '<p>Peristomal skin comfort staples — powder, protective wipe, barrier ring, adhesive remover, and barrier cream.</p><ul><li>Stomahesive powder and AllKare wipe</li><li>Eakin barrier ring and antibacterial ring</li><li>Tac Away remover and Cavilon barrier cream</li><li>Customize quantities or remove items before checkout</li></ul>',
  },
  'Inner Balance (Gut Health & Output Management)': {
    sku: 'KIT-OSTOMY-INNER-BALANCE',
    description:
      '<p>Everyday gut and output support — probiotic, fibre, and gentle gas relief options in one customizable kit.</p><ul><li>Probiotic and Benefiber prebiotic fibre</li><li>TUMS Chewy Bites with gas relief</li><li>Phazyme Ultra Strength SoftGels</li><li>Customize quantities or remove items before checkout</li></ul>',
  },
  'Stay Hydrated (High-Output & Dehydration Rescue)': {
    sku: 'KIT-OSTOMY-STAY-HYDRATED',
    description:
      '<p>High-output and dehydration rescue staples — electrolytes, thickener, and loperamide support you can tailor.</p><ul><li>Hydralyte and Organika electrolyte options</li><li>Resource ThickenUp Clear</li><li>Option+ loperamide for clinician-guided use</li><li>Customize quantities or remove items before checkout</li></ul>',
  },
  'Leak-Free Confidence (Leak & Odor Control)': {
    sku: 'KIT-OSTOMY-LEAK-FREE',
    description:
      '<p>Leak and odor control essentials — barrier ring, strip paste, protective sheet, filtered pouch, and belt.</p><ul><li>Eakin ring and Brava strip paste</li><li>Brava protective sheet</li><li>Filtered closed pouch and ostomy belt</li><li>Customize quantities or remove items before checkout</li></ul>',
  },
  'Everyday Living (Ostomy Daily Care & Disposal)': {
    sku: 'KIT-OSTOMY-EVERYDAY-LIVING',
    description:
      '<p>Daily care and disposal comfort — belt, skin gel wipes, soft wipes, and gloves for an easier change routine.</p><ul><li>Adapt ostomy belt</li><li>Hollister Skin Gel Wipes</li><li>Tena ProSkin Ultra Wipes and nitrile gloves</li><li>Customize quantities or remove items before checkout</li></ul>',
  },
  'Little Ostomate (Pediatric Ostomy Kit)': {
    sku: 'KIT-OSTOMY-LITTLE-OSTOMATE',
    description:
      '<p>Pediatric ostomy essentials — Pouchkins pouching, pediatric barrier, CeraPlus rings, and gentle baby lotion.</p><ul><li>One-piece and two-piece Pouchkins options</li><li>Pediatric flat skin barrier</li><li>CeraPlus convex barrier rings</li><li>SoluPrep swabstick and CeraVe Baby lotion</li></ul>',
  },
  'Newly Diagnosed: New Ostomy Starter Kit': {
    sku: 'KIT-OSTOMY-NEWLY-DIAGNOSED',
    description:
      '<p>Newly diagnosed starter essentials — one-piece drainable pouch, barrier rings, protective wipe, belt, and clamp.</p><ul><li>SenSura 1-piece drainable pouch</li><li>Adapt barrier rings and AllKare wipe</li><li>Adapt belt and drainable pouch clamp</li><li>Customize quantities or remove items before checkout</li></ul>',
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

/** Minimal CSV row parser (handles quoted fields with commas). */
function parseCsvRow(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === ',' && !inQuotes) {
      fields.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  fields.push(current);
  return fields;
}

function parseCsvKits() {
  const raw = readFileSync(CSV_PATH, 'utf8');
  const lines = raw.split(/\r?\n/).filter(Boolean).slice(1);
  /** @type {Map<string, number[]>} */
  const byKit = new Map();

  for (const line of lines) {
    const parts = parseCsvRow(line);
    if (parts.length < 5) continue;
    const kit = parts[0];
    const condition = parts[1];
    const componentId = Number(parts[2]);
    const isOstomy =
      condition === 'Ostomy' ||
      (condition === 'Cross-condition' && /ostomy/i.test(kit));
    if (!isOstomy || !Number.isFinite(componentId)) continue;
    if (!byKit.has(kit)) byKit.set(kit, []);
    byKit.get(kit).push(componentId);
  }

  return byKit;
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

async function retireOldAiKits() {
  console.log('\n=== Retiring old AI-invented kits ===');
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
  const byKit = parseCsvKits();
  console.log(`Parsed ${byKit.size} ostomy-related kits from CSV`);
  console.log('Looking up Shop Ostomy Care category…');
  const category = await findOstomyShopCategoryId();
  if (!category) {
    throw new Error('Could not find Shop Ostomy Care category');
  }
  console.log('Category:', category);
  if (DRY_RUN) console.log('DRY RUN mode — no writes');

  if (RETIRE_OLD) {
    await retireOldAiKits();
  }

  const results = [];
  const errors = [];

  for (const [name, componentIds] of byKit) {
    const meta = KIT_META[name];
    if (!meta) {
      errors.push({ name, error: 'Missing KIT_META entry' });
      console.error(`No KIT_META for: ${name}`);
      continue;
    }
    if (ONLY_SKU && meta.sku !== ONLY_SKU) continue;

    try {
      const result = await upsertKit({
        name,
        sku: meta.sku,
        description: meta.description,
        componentIds,
        categoryId: category.id,
      });
      results.push({ name, ...result });
    } catch (error) {
      console.error(`FAILED ${name}:`, error.message);
      errors.push({ name, sku: meta.sku, error: error.message });
    }
  }

  console.log('\n========== SUMMARY ==========');
  for (const r of results) {
    console.log(`${r.action.toUpperCase()}  ${r.sku}  id=${r.id}  ${r.name}`);
  }
  if (errors.length) {
    console.log('\nERRORS:');
    for (const e of errors) {
      console.log(`  ${e.name}: ${e.error}`);
    }
    process.exitCode = 1;
  }
  console.log(`\nDone. ${results.length} kits processed, ${errors.length} errors.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
