/**
 * Bulk-fill French (fr) store content translations via BigCommerce Translations Admin GraphQL API.
 *
 * Run from repo root:
 *   node --env-file=.env.local core/scripts/bulk-translate-fr.mjs
 *
 * Options:
 *   --dry-run          Fetch + translate, but do not write to BigCommerce
 *   --overwrite        Retranslate fields that already have a translation (Canadian French rewrite)
 *   --types=A,B        Limit to resource types (comma-separated)
 *   --limit-entities=N Cap entities updated per resource type (for smoke tests)
 *
 * Requires: BIGCOMMERCE_STORE_HASH, BIGCOMMERCE_CHANNEL_ID, CATALYST_TRANSLATIONS_TOKEN, OPENAI_API_KEY
 */
import { createHash } from 'node:crypto';

const STORE_HASH = process.env.BIGCOMMERCE_STORE_HASH;
const CHANNEL_ID = process.env.BIGCOMMERCE_CHANNEL_ID;
const TOKEN = process.env.CATALYST_TRANSLATIONS_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.VIRTUAL_CARE_BOT_MODEL || 'gpt-4.1-nano';
const LOCALE = 'fr';

const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');
const overwrite = args.has('--overwrite');
const typesArg = [...args].find((a) => a.startsWith('--types='));
const limitArg = [...args].find((a) => a.startsWith('--limit-entities='));
const typeFilter = typesArg ? typesArg.slice('--types='.length).split(',').filter(Boolean) : null;
const limitEntities = limitArg ? Number(limitArg.slice('--limit-entities='.length)) : null;

/** Supported resource types that returned data on this store (skip unsupported / URL paths). */
const RESOURCE_TYPES = [
  'PRODUCTS',
  'PRODUCT_OPTIONS',
  'PRODUCT_OPTION_VALUES',
  'PRODUCT_CUSTOM_FIELDS',
  'PRODUCT_MODIFIERS',
  'PRODUCT_MODIFIER_VALUES',
  'CATEGORIES',
  'BRANDS',
  'PRODUCT_FILTERS',
  'INVENTORY_LOCATIONS',
  'SHIPPING_METHODS',
  'SHIPPING_SETTINGS',
  'TAX_RATES',
  'ORDER_STATUSES',
  'PROMOTIONS',
  'PAYMENT_METHODS',
  'ADDRESS_FORM_FIELDS',
  'CUSTOMER_FORM_FIELDS',
  'PICKUP_METHODS',
];

/** Fields that should stay in original language (addresses, region codes). */
const SKIP_FIELDS_BY_TYPE = {
  INVENTORY_LOCATIONS: new Set(['city', 'state', 'address1', 'address2']),
};

const GQL_URL = `https://api.bigcommerce.com/stores/${STORE_HASH}/graphql`;
const PAGE_SIZE = 50;
const UPDATE_BATCH = 25;
const TRANSLATE_BATCH = overwrite ? 20 : 40;

if (!STORE_HASH || !CHANNEL_ID || !TOKEN || !OPENAI_API_KEY) {
  console.error(
    'Missing required env: BIGCOMMERCE_STORE_HASH, BIGCOMMERCE_CHANNEL_ID, CATALYST_TRANSLATIONS_TOKEN, OPENAI_API_KEY',
  );
  process.exit(1);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function gql(query) {
  for (let attempt = 1; attempt <= 5; attempt++) {
    const response = await fetch(GQL_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Auth-Token': TOKEN,
      },
      body: JSON.stringify({ query }),
    });

    const text = await response.text();
    let json;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      throw new Error(`Non-JSON GraphQL response (${response.status}): ${text.slice(0, 300)}`);
    }

    if (response.status === 429 || response.status >= 500) {
      const wait = attempt * 1500;
      console.warn(`  GraphQL ${response.status}, retry in ${wait}ms…`);
      await sleep(wait);
      continue;
    }

    if (!response.ok) {
      throw new Error(`GraphQL HTTP ${response.status}: ${text.slice(0, 500)}`);
    }

    if (json.errors?.length) {
      const msg = json.errors.map((e) => e.message).join('; ');
      // Soft-fail empty/unsupported pages handled by caller when data is null
      if (!json.data) {
        throw new Error(msg);
      }
      console.warn(`  GraphQL warnings: ${msg}`);
    }

    return json.data;
  }

  throw new Error('GraphQL failed after retries');
}

async function fetchAllMissing(resourceType) {
  const skipFields = SKIP_FIELDS_BY_TYPE[resourceType] ?? new Set();
  const entities = new Map(); // resourceId -> fields[]
  let after = null;
  let pages = 0;

  for (;;) {
    const afterArg = after ? `, after: ${JSON.stringify(after)}` : '';
    const query = `
      query {
        store {
          translations(
            filters: {
              resourceType: ${resourceType}
              channelId: "bc/store/channel/${CHANNEL_ID}"
              localeId: "bc/store/locale/${LOCALE}"
            }
            first: ${PAGE_SIZE}
            ${afterArg}
          ) {
            edges {
              cursor
              node {
                resourceId
                fields { fieldName original translation }
              }
            }
            pageInfo { hasNextPage endCursor }
          }
        }
      }
    `;

    const data = await gql(query);
    const conn = data?.store?.translations;
    if (!conn) break;

    pages += 1;
    for (const edge of conn.edges ?? []) {
      const { resourceId, fields } = edge.node;
      const missing = [];
      for (const field of fields ?? []) {
        const original = (field.original ?? '').trim();
        const translation = (field.translation ?? '').trim();
        if (!original) continue;
        if (!overwrite && translation) continue;
        if (skipFields.has(field.fieldName)) continue;
        missing.push({ fieldName: field.fieldName, original: field.original });
      }
      if (missing.length) {
        entities.set(resourceId, missing);
      }
    }

    if (limitEntities != null && entities.size >= limitEntities) {
      // Trim to limit
      const kept = [...entities.entries()].slice(0, limitEntities);
      entities.clear();
      for (const [id, fields] of kept) entities.set(id, fields);
      break;
    }

    if (!conn.pageInfo?.hasNextPage) break;
    after = conn.pageInfo.endCursor;
    if (pages % 10 === 0) {
      console.log(`  …${resourceType} scanned ${pages} pages, ${entities.size} entities need work`);
    }
  }

  return entities;
}

function escapeGraphQLString(value) {
  return JSON.stringify(value ?? '');
}

async function updateTranslations(resourceType, entityEntries) {
  if (!entityEntries.length) return { errors: [] };

  const entitiesLiteral = entityEntries
    .map(([resourceId, fields]) => {
      const fieldsLiteral = fields
        .map(
          (f) =>
            `{ fieldName: ${escapeGraphQLString(f.fieldName)}, value: ${escapeGraphQLString(f.value)} }`,
        )
        .join('\n');
      return `{
        resourceId: ${escapeGraphQLString(resourceId)}
        fields: [${fieldsLiteral}]
      }`;
    })
    .join('\n');

  const mutation = `
    mutation {
      translation {
        updateTranslations(input: {
          resourceType: ${resourceType}
          channelId: "bc/store/channel/${CHANNEL_ID}"
          localeId: "bc/store/locale/${LOCALE}"
          entities: [${entitiesLiteral}]
        }) {
          __typename
          errors {
            __typename
            ... on Error { message }
          }
        }
      }
    }
  `;

  const data = await gql(mutation);
  return data?.translation?.updateTranslations ?? { errors: [] };
}

async function translateTexts(items) {
  // items: [{ id, text }]
  if (!items.length) return new Map();

  const system = `You are a professional Canadian French (fr-CA / français canadien) translator for a Canadian healthcare ecommerce store (Liivv).
Translate shopper-facing store content from English into Canadian French — NOT Metropolitan (France) French.
Prefer Canadian terms: courriel, abonnement, rabais, magasinage, fin de semaine, cellulaire, facture, panier, livraison.
Avoid France-only wording (week-end, portable for cellphone, mél, souscription for shopper subscriptions).
Rules:
- Preserve HTML tags, attributes, URLs, and email addresses exactly.
- Preserve brand names, product model numbers, SKUs, medical device names, and proper nouns typically left in English (e.g. Tegaderm, Hollister, Magellan).
- Keep acronyms like GST, HST, HIV, IV as-is unless a standard Canadian French form is clearly better.
- Do not add commentary. Return ONLY valid JSON: { "items": [ { "id": string, "translation": string } ] } matching every input id.`;

  const user = JSON.stringify(
    items.map((i) => ({ id: i.id, text: i.text })),
    null,
    0,
  );

  for (let attempt = 1; attempt <= 5; attempt++) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          {
            role: 'user',
            content: `Translate these strings into Canadian French (fr-CA). Respond with JSON object: { "items": [ { "id", "translation" } ] }\n${user}`,
          },
        ],
      }),
    });

    const text = await response.text();
    if (response.status === 429 || response.status >= 500) {
      const wait = attempt * 2000;
      console.warn(`  OpenAI ${response.status}, retry in ${wait}ms…`);
      await sleep(wait);
      continue;
    }
    if (!response.ok) {
      throw new Error(`OpenAI HTTP ${response.status}: ${text.slice(0, 400)}`);
    }

    const json = JSON.parse(text);
    const content = json.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty OpenAI content');

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      // Models sometimes wrap JSON in markdown fences or truncate; retry.
      const fenced = content.match(/\{[\s\S]*\}/);
      if (fenced) {
        try {
          parsed = JSON.parse(fenced[0]);
        } catch {
          if (attempt < 5) {
            console.warn(`  OpenAI JSON parse failed, retry ${attempt}…`);
            await sleep(attempt * 1500);
            continue;
          }
          throw new Error(`OpenAI returned non-JSON: ${content.slice(0, 300)}`);
        }
      } else if (attempt < 5) {
        console.warn(`  OpenAI JSON parse failed, retry ${attempt}…`);
        await sleep(attempt * 1500);
        continue;
      } else {
        throw new Error(`OpenAI returned non-JSON: ${content.slice(0, 300)}`);
      }
    }

    const list = Array.isArray(parsed) ? parsed : parsed.items;
    if (!Array.isArray(list)) {
      throw new Error(`Unexpected OpenAI JSON shape: ${content.slice(0, 300)}`);
    }

    const map = new Map();
    for (const row of list) {
      if (row?.id != null && typeof row.translation === 'string') {
        map.set(String(row.id), row.translation);
      }
    }
    return map;
  }

  throw new Error('OpenAI failed after retries');
}

function fieldKey(resourceId, fieldName) {
  return createHash('sha1').update(`${resourceId}::${fieldName}`).digest('hex').slice(0, 16);
}

async function processResourceType(resourceType) {
  console.log(`\n=== ${resourceType} ===`);
  const entities = await fetchAllMissing(resourceType);
  console.log(`  Entities needing translation: ${entities.size}`);

  if (!entities.size) return { resourceType, entities: 0, fields: 0, written: 0, errors: [] };

  // Flatten fields for translation batches
  const flat = [];
  for (const [resourceId, fields] of entities) {
    for (const field of fields) {
      flat.push({
        id: fieldKey(resourceId, field.fieldName),
        resourceId,
        fieldName: field.fieldName,
        text: field.original,
      });
    }
  }
  console.log(`  Fields to translate: ${flat.length}`);

  const translatedById = new Map();
  for (let i = 0; i < flat.length; i += TRANSLATE_BATCH) {
    const chunk = flat.slice(i, i + TRANSLATE_BATCH);
    console.log(
      `  Translating ${i + 1}-${Math.min(i + chunk.length, flat.length)} / ${flat.length}…`,
    );
    try {
      const map = await translateTexts(chunk.map((c) => ({ id: c.id, text: c.text })));
      for (const [id, translation] of map) translatedById.set(id, translation);
    } catch (err) {
      console.warn(
        `  Batch translate failed (${i + 1}-${i + chunk.length}): ${err.message || err}`,
      );
    }
    await sleep(200);
  }

  // Rebuild entity updates
  const updates = [];
  let missingTranslations = 0;
  for (const [resourceId, fields] of entities) {
    const outFields = [];
    for (const field of fields) {
      const id = fieldKey(resourceId, field.fieldName);
      const value = translatedById.get(id);
      if (!value) {
        missingTranslations += 1;
        continue;
      }
      outFields.push({ fieldName: field.fieldName, value });
    }
    if (outFields.length) updates.push([resourceId, outFields]);
  }

  if (missingTranslations) {
    console.warn(`  Warning: ${missingTranslations} fields missing from OpenAI response`);
  }

  let written = 0;
  const errors = [];

  if (dryRun) {
    console.log(`  DRY RUN — would write ${updates.length} entities`);
    if (updates[0]) {
      console.log(`  Sample: ${updates[0][0]}`, updates[0][1].slice(0, 2));
    }
    return { resourceType, entities: entities.size, fields: flat.length, written: 0, errors };
  }

  for (let i = 0; i < updates.length; i += UPDATE_BATCH) {
    const batch = updates.slice(i, i + UPDATE_BATCH);
    console.log(
      `  Writing ${i + 1}-${Math.min(i + batch.length, updates.length)} / ${updates.length}…`,
    );
    try {
      const result = await updateTranslations(resourceType, batch);
      const batchErrors = result.errors ?? [];
      if (batchErrors.length) {
        for (const err of batchErrors) {
          errors.push(err.message || JSON.stringify(err));
          console.warn(`  Update error: ${err.message || JSON.stringify(err)}`);
        }
      }
      written += batch.length;
    } catch (err) {
      errors.push(String(err.message || err));
      console.error(`  Batch failed:`, err.message || err);
    }
    await sleep(250);
  }

  return { resourceType, entities: entities.size, fields: flat.length, written, errors };
}

async function main() {
  const types = (typeFilter ?? RESOURCE_TYPES).filter((t) => RESOURCE_TYPES.includes(t));
  console.log(
    `Bulk FR-CA translations | channel=${CHANNEL_ID} locale=${LOCALE} overwrite=${overwrite} dryRun=${dryRun} model=${OPENAI_MODEL}`,
  );
  console.log(`Resource types: ${types.join(', ')}`);

  const summary = [];
  for (const type of types) {
    try {
      summary.push(await processResourceType(type));
    } catch (err) {
      console.error(`Failed ${type}:`, err.message || err);
      summary.push({
        resourceType: type,
        entities: 0,
        fields: 0,
        written: 0,
        errors: [String(err.message || err)],
      });
    }
  }

  console.log('\n========== SUMMARY ==========');
  for (const row of summary) {
    console.log(
      `${row.resourceType}: entities=${row.entities} fields=${row.fields} written=${row.written} errors=${row.errors.length}`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
