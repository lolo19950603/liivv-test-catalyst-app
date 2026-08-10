/**
 * Create remaining Women's Health curated kits in BigCommerce.
 * Skips First Cycle Starter Kit (already created).
 *
 * Run from repo root:
 *   node --env-file=.env.local core/scripts/create-womens-health-kits.mjs
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

const SKIP_KITS = new Set(['First Cycle Starter Kit']);

/** Kit display name → SKU + short PDP description */
const KIT_META = {
  'Cycle Comfort Cramp-Relief Kit': {
    sku: 'KIT-CYCLE-COMFORT-CRAMP',
    description:
      '<p>Heat, magnesium, and pain-relief essentials for cramp-heavy cycle days — curated so you can dial quantities up or down before checkout.</p><ul><li>Heat therapy and topical comfort</li><li>Magnesium support and OTC relief options</li><li>Customize quantities or remove items before checkout</li></ul>',
  },
  'Clear Skin Hormonal-Acne Kit': {
    sku: 'KIT-CLEAR-SKIN-HORMONAL-ACNE',
    description:
      '<p>A La Roche-Posay–led routine for hormonal breakouts — cleanse, treat, matte, and protect in one customizable kit.</p><ul><li>Purifying cleanse and clay mask</li><li>Acne treatment and oil-control moisturizer</li><li>Daily SPF to finish the routine</li></ul>',
  },
  'Teen Energy & Iron Support Kit': {
    sku: 'KIT-TEEN-ENERGY-IRON',
    description:
      '<p>Daily nutrition support for teens — multis, omega-3, magnesium, iron, and B12 in one editable starter kit.</p><ul><li>Teen and women’s multivitamin options</li><li>Omega-3, magnesium, iron, and B12</li><li>Customize quantities or remove items before checkout</li></ul>',
  },
  'Trying to Conceive Starter Kit': {
    sku: 'KIT-TRYING-TO-CONCEIVE',
    description:
      '<p>Preconception essentials — fertility-minded nutrition, ovulation and pregnancy tests, and supportive extras in one kit.</p><ul><li>Preconception and women’s multi support</li><li>Ovulation and early pregnancy tests</li><li>CoQ10, folate, and intimacy support</li></ul>',
  },
  'Prenatal by Trimester System': {
    sku: 'KIT-PRENATAL-TRIMESTER',
    description:
      '<p>Stage-by-stage prenatal nutrition — trimester formulas plus omega-3/DHA support you can tailor to your needs.</p><ul><li>Prenatal Ease Stages 1–3</li><li>CanPrev prenatal multi option</li><li>Omega-3 and prenatal DHA support</li></ul>',
  },
  'Morning Sickness Rescue Kit': {
    sku: 'KIT-MORNING-SICKNESS-RESCUE',
    description:
      '<p>Gentle nausea-support staples — ginger, lemon balm, electrolytes, and acupressure options in one rescue kit.</p><ul><li>Ginger tablets, lozenges, and candy</li><li>Electrolyte rehydration sticks</li><li>Sea-Band and lemon balm support</li></ul>',
  },
  'Preeclampsia Home Monitoring Kit (Monitoring Only)': {
    sku: 'KIT-PREECLAMPSIA-MONITORING',
    description:
      '<p>Home blood-pressure monitoring options for clinician-guided preeclampsia watch — choose the monitor that fits your home setup.</p><ul><li>Upper-arm automatic BP monitors</li><li>Monitoring-only kit (no treatment products)</li><li>Customize which monitor to keep before checkout</li></ul>',
  },
  'Bedrest Comfort & Circulation Kit': {
    sku: 'KIT-BEDREST-COMFORT',
    description:
      '<p>Comfort and circulation support for bedrest days — compression, positioning, skin care, heat, and hydration.</p><ul><li>Compression socks and bed wedge</li><li>Pressure-relief cushion and skin protectant</li><li>Heat and electrolyte hydration</li></ul>',
  },
  'Pregnancy Nutrient Deficiency Support Kit': {
    sku: 'KIT-PREGNANCY-NUTRIENT',
    description:
      '<p>Targeted pregnancy nutrition add-ons — omega-3/DHA, magnesium, iron, vitamin D, calcium, and fibre support.</p><ul><li>Omega-3 and prenatal DHA</li><li>Gentle iron, D3, calcium + magnesium</li><li>Fibre and magnesium support</li></ul>',
  },
  'The Fourth Trimester Recovery Kit': {
    sku: 'KIT-FOURTH-TRIMESTER',
    description:
      '<p>Postpartum recovery essentials — maternity pads, peri care, soothing wipes, and gentle cleansing in one kit.</p><ul><li>Maternity pads and peri bottle</li><li>Herbal perineal spray and soothing wipes</li><li>Epsom salts for comfort soaks</li></ul>',
  },
  'Nourish the Nursing Journey Kit': {
    sku: 'KIT-NOURISH-NURSING',
    description:
      '<p>Nursing support essentials — lactation and nursing nutrition, nipple care, pads, pump, and storage bags.</p><ul><li>More Milk Plus and nursing prenatal</li><li>Lanolin, reusable nursing pads</li><li>Silicone pump and storage bags</li></ul>',
  },
  'Postpartum Wellness Watch (Monitoring & Comfort) Kit': {
    sku: 'KIT-POSTPARTUM-WELLNESS',
    description:
      '<p>Postpartum monitoring and comfort — BP check, thermometer, magnesium, heat, and hydration in one kit.</p><ul><li>Blood pressure and temperature monitoring</li><li>Magnesium and heat comfort</li><li>Hydration mix for recovery days</li></ul>',
  },
  'Reset & Recharge: Hormone Balance + Energy Kit': {
    sku: 'KIT-RESET-RECHARGE',
    description:
      '<p>Hormone-balance and energy support — women’s multi, magnesium, Estrosmart, B12, and ashwagandha.</p><ul><li>Women’s multi and magnesium</li><li>Estrosmart hormone support</li><li>B12 and ashwagandha for energy</li></ul>',
  },
  'Rhythm & Balance: Intimate Microbiome Kit': {
    sku: 'KIT-RHYTHM-BALANCE',
    description:
      '<p>Intimate microbiome care — targeted probiotics, cranberry support, and a gentle intimate wash.</p><ul><li>Feminine and vaginal health probiotics</li><li>Cranberry / D-mannose support</li><li>Chamomile intimate wash</li></ul>',
  },
  'Transition & Relief: Hot-Flash, Sleep + Mood Kit': {
    sku: 'KIT-TRANSITION-HOT-FLASH',
    description:
      '<p>Midlife transition comfort for hot flashes, sleep, and mood — L-theanine, restful sleep, magnesium, and black cohosh.</p><ul><li>L-theanine with magnesium</li><li>Restful sleep gummies</li><li>Black cohosh support</li></ul>',
  },
  'Transition & Relief: Intimate Comfort + Dryness Kit': {
    sku: 'KIT-TRANSITION-INTIMATE',
    description:
      '<p>Intimate comfort for dryness — moisturizers, lubricant, and a gentle intimate wash in one customizable kit.</p><ul><li>Vaginal moisturizers</li><li>Personal lubricant</li><li>Chamomile intimate wash</li></ul>',
  },
  'Transition & Relief: Midlife Bones + Vitality Kit': {
    sku: 'KIT-TRANSITION-MIDLIFE',
    description:
      '<p>Bone and vitality support for midlife — collagen bone formula, omega-3, women’s multi, D3/K2, and calcium.</p><ul><li>Collagen bone support</li><li>Omega-3 and women’s multi</li><li>D3/K2 and calcium + magnesium</li></ul>',
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
    // kit,condition,component_id,component_name,source
    const parts = parseCsvRow(line);
    if (parts.length < 5) continue;
    const kit = parts[0];
    const condition = parts[1];
    const componentId = Number(parts[2]);
    if (condition !== "Women's Health" || !Number.isFinite(componentId)) continue;
    if (!byKit.has(kit)) byKit.set(kit, []);
    byKit.get(kit).push(componentId);
  }

  return byKit;
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

  const kitVariantsValue = JSON.stringify(kitVariants);
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

async function upsertKit({ name, sku, description, componentIds, categoryId, kitVariants = {} }) {
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
    return { id: existing?.id ?? null, sku, action: existing ? 'update' : 'create', dryRun: true };
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
    await ensureCustomFields(existing.id, existing.custom_fields, kitVariants);
    await bc('/v3/catalog/products/channel-assignments', {
      method: 'PUT',
      body: JSON.stringify([{ product_id: existing.id, channel_id: CHANNEL_ID }]),
    });
    console.log(`  updated product ${existing.id}`);
    return { id: existing.id, sku, action: 'updated' };
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
        { name: 'kit_variants', value: JSON.stringify(kitVariants) },
      ],
    }),
  });

  const productId = created.data.id;
  await bc('/v3/catalog/products/channel-assignments', {
    method: 'PUT',
    body: JSON.stringify([{ product_id: productId, channel_id: CHANNEL_ID }]),
  });
  console.log(`  created product ${productId}`);
  return { id: productId, sku, action: 'created' };
}

async function main() {
  const byKit = parseCsvKits();
  console.log("Looking up Shop Women's Health category…");
  const category = await findWomensHealthCategoryId();
  if (!category) {
    throw new Error("Could not find Shop Women's Health category");
  }
  console.log('Category:', category);
  if (DRY_RUN) console.log('DRY RUN mode — no writes');

  const results = [];
  const errors = [];

  for (const [name, componentIds] of byKit) {
    if (SKIP_KITS.has(name)) {
      console.log(`\nSkipping ${name} (already created)`);
      continue;
    }
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
        kitVariants: {},
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
