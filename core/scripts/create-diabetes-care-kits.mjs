/**
 * Create Diabetes Care curated kits in BigCommerce from liivv_kit_components_final.csv.
 *
 * Run from repo root:
 *   node --env-file=.env.local core/scripts/create-diabetes-care-kits.mjs
 *
 * Optional:
 *   --dry-run   validate components / print plan only
 *   --only=SKU  create/update a single kit by SKU
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const STORE_HASH = process.env.BIGCOMMERCE_STORE_HASH;
const TOKEN = process.env.CATALYST_PRODUCT_EDIT_TOKEN || process.env.BIGCOMMERCE_ACCESS_TOKEN;
const CHANNEL_ID = Number(process.env.BIGCOMMERCE_CHANNEL_ID || '1');

const __dirname = dirname(fileURLToPath(import.meta.url));
const CSV_PATH = join(__dirname, '../../liivv_kit_components_final.csv');

/** Kit display name → SKU + short PDP description */
const KIT_META = {
  'Just Diagnosed: Diabetes Day-One Starter': {
    sku: 'KIT-DIABETES-DAY-ONE',
    description:
      '<p>A calm day-one diabetes edit — meter, strips, lancets, rescue glucose, medical ID, and disposal staples you can tune before checkout.</p><ul><li>FreeStyle Lite meter, strips, and lancets</li><li>Dex4 glucose tablets and diabetic medical ID</li><li>Sharps container and alcohol swabs</li><li>Customize quantities or remove items before checkout</li></ul>',
  },
  'OneTouch Testing System Starter': {
    sku: 'KIT-DIABETES-ONETOUCH',
    description:
      '<p>A complete OneTouch testing starter — meter, strips, lancets, and control solution in one customizable kit.</p><ul><li>OneTouch Verio Reflect meter</li><li>Verio test strips and Delica Plus lancets</li><li>OneTouch Ultra control solution</li><li>Customize quantities or remove items before checkout</li></ul>',
  },
  'Contour Next Testing System Starter': {
    sku: 'KIT-DIABETES-CONTOUR-NEXT',
    description:
      '<p>A Contour Next testing starter — meter, strips, and lancets together so the first checks feel simpler.</p><ul><li>Contour NEXT ONE meter</li><li>Contour Next test strips</li><li>Bayer Microlet lancets</li><li>Customize quantities or remove items before checkout</li></ul>',
  },
  'FreeStyle Libre 3 CGM Starter': {
    sku: 'KIT-DIABETES-LIBRE3',
    description:
      '<p>A Libre 3 CGM starter — sensor, reader, overlay patch, and reader case for a calmer first wear.</p><ul><li>FreeStyle Libre 3 Plus sensor and reader</li><li>Libre oval overlay patch</li><li>Silicone reader case</li><li>Customize quantities or remove items before checkout</li></ul>',
  },
  'Insulin Injection Basics Kit': {
    sku: 'KIT-DIABETES-INSULIN-INJECTION',
    description:
      '<p>Everyday injection staples — pen needles, site care, cooling, disposal, and a medical ID you can tailor.</p><ul><li>NovoFine Plus pen needles and alcohol swabs</li><li>Sharps container and Insul-Cap</li><li>Frio cooling wallet and diabetic medical ID</li><li>Customize quantities or remove items before checkout</li></ul>',
  },
  'Insulin Pump Supply Starter (Medtronic)': {
    sku: 'KIT-DIABETES-PUMP-MEDTRONIC',
    description:
      '<p>A Medtronic pump supply starter — infusion set, reservoir, site dressing, barrier wipes, and cooling wallet.</p><ul><li>Medtronic Quick-Set and 3.0ml reservoir</li><li>IV 3000 infusion set dressing</li><li>Cavilon no-sting wipes and Frio pump wallet</li><li>Customize quantities or remove items before checkout</li></ul>',
  },
  'Low-Glucose Rescue Kit': {
    sku: 'KIT-DIABETES-LOW-GLUCOSE',
    description:
      '<p>Fast-acting rescue staples for lows — tablets, gels, keychain glucose, glucagon, and a medical ID.</p><ul><li>Dex4 tablets, gel, and Tropical Gel Blast</li><li>Dex4 key chain for on-the-go rescue</li><li>Baqsimi and diabetic medical ID</li><li>Customize quantities or remove items before checkout</li></ul>',
  },
  'Diabetic Foot Care Kit': {
    sku: 'KIT-DIABETES-FOOT-CARE',
    description:
      '<p>Daily diabetic foot comfort — neuropathy cream, urea balm, file, and warming socks in one kit.</p><ul><li>MagniLife neuropathy cream and Flexitol heel balm</li><li>Atrac-Tain urea cream</li><li>Amope foot file and Infracare socks</li><li>Customize quantities or remove items before checkout</li></ul>',
  },
  'Injection & Finger-Poke Skin Comfort Kit': {
    sku: 'KIT-DIABETES-SKIN-COMFORT',
    description:
      '<p>Skin comfort for pokes and sites — swabs, vibration, bruise care, numbing cream, moisturizer, and scar gel.</p><ul><li>Alcohol swabs and Buzzy LadyBuzz</li><li>Arnicare bruise care and Emla cream</li><li>CeraVe moisturizer and New-Skin silicone gel</li><li>Customize quantities or remove items before checkout</li></ul>',
  },
  'Diabetes Travel & On-the-Go Kit': {
    sku: 'KIT-DIABETES-TRAVEL',
    description:
      '<p>A compact travel edit — cooling wallet, pen case, sharps, rescue glucose, and sanitizer for days away from home.</p><ul><li>Frio mini cooling wallet and Pen Plus travel case</li><li>1L sharps container</li><li>Dex4 key chain and hand sanitizer</li><li>Customize quantities or remove items before checkout</li></ul>',
  },
  'Blood-Sugar Nutrition Support Kit': {
    sku: 'KIT-DIABETES-NUTRITION',
    description:
      '<p>Nutrition support staples — blood-sugar formulas, fibre, omega-3, chromium, and alpha-lipoic acid you can tailor.</p><ul><li>CanPrev Blood Sugar Support and AOR GlucoSupport</li><li>Fibre Feel powder and NutraSea omega-3</li><li>Chromium picolinate and alpha-lipoic acid</li><li>Customize quantities or remove items before checkout</li></ul>',
  },
  'Newly Diagnosed: Type 2 Diabetes Starter Kit': {
    sku: 'KIT-DIABETES-TYPE2-STARTER',
    description:
      '<p>A Type 2 starter edit — meter, strips, lancing, rescue glucose, disposal, and a medical ID.</p><ul><li>Contour NEXT ONE meter and test strips</li><li>Accu-Chek Softclix and Dex4 tablets</li><li>Sharps container and diabetic medical ID</li><li>Customize quantities or remove items before checkout</li></ul>',
  },
};

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
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
    const isDiabetes =
      condition === 'Diabetes' || (condition === 'Cross-condition' && /diabetes/i.test(kit));
    if (!isDiabetes || !Number.isFinite(componentId)) continue;
    if (!byKit.has(kit)) byKit.set(kit, []);
    byKit.get(kit).push(componentId);
  }

  return byKit;
}

async function findDiabetesShopCategoryId() {
  const matchers = ['/liivv-health/diabetes-care/shop-diabetes-care', '/shop-diabetes-care'];

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
        name === 'shop diabetes care'
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
  const byKit = parseCsvKits();
  console.log(`Parsed ${byKit.size} diabetes-related kits from CSV`);
  console.log('Looking up Shop Diabetes Care category…');
  const category = await findDiabetesShopCategoryId();
  if (!category) {
    throw new Error('Could not find Shop Diabetes Care category');
  }
  console.log('Category:', category);
  if (DRY_RUN) console.log('DRY RUN mode — no writes');

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
