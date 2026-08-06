/**
 * Fill / rewrite next-intl keys in fr.json as Canadian French (fr-CA) from en.json.
 *
 * Run from repo root:
 *   node --env-file=.env.local core/scripts/fill-fr-messages.mjs
 *   node --env-file=.env.local core/scripts/fill-fr-messages.mjs --all
 *
 * --all  Retranslate every key from English into Canadian French (not only missing).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MESSAGES_DIR = join(__dirname, '..', 'messages');
const EN_PATH = join(MESSAGES_DIR, 'en.json');
const FR_PATH = join(MESSAGES_DIR, 'fr.json');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.VIRTUAL_CARE_BOT_MODEL || 'gpt-4.1-nano';
const BATCH = 50;
const rewriteAll = process.argv.includes('--all');

const FR_CA_SYSTEM = `You translate UI strings for a Canadian healthcare ecommerce storefront (Liivv) from English into Canadian French (fr-CA / français canadien, Quebec-Canada).
Use Canadian French vocabulary and phrasing — NOT Metropolitan (France) French.
Prefer Canadian terms such as: courriel (not e-mail/mél), abonnement/s'abonner (not souscription for shopper subscriptions), rabais (for save/discount when natural), magasinage, fin de semaine, cellulaire (mobile phone), facture, panier, livraison.
Avoid France-only wording (e.g. week-end, portable for cellphone, mél).
Rules:
- Preserve ICU MessageFormat exactly: {name}, {count, plural, ...}, {var, number}, select, etc.
- Preserve XML/HTML-like tags used by next-intl rich text: <cartLink>, </cartLink>, <link>, etc. Do not translate tag names.
- Preserve brand names (Liivv, Stripe, BigCommerce) and medical/product proper nouns typically left in English.
- Return ONLY JSON: { "items": [ { "id": string, "translation": string } ] } covering every input id.`;

if (!OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY');
  process.exit(1);
}

function flatten(obj, prefix = '', out = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      flatten(v, path, out);
    } else {
      out[path] = v;
    }
  }
  return out;
}

function setPath(obj, path, value) {
  const parts = path.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (cur[p] == null || typeof cur[p] !== 'object' || Array.isArray(cur[p])) {
      cur[p] = {};
    }
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function translateBatch(items) {
  // items: [{ id, text }]
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
          { role: 'system', content: FR_CA_SYSTEM },
          {
            role: 'user',
            content: `Translate these UI strings into Canadian French (fr-CA):\n${JSON.stringify(items)}`,
          },
        ],
      }),
    });

    const text = await response.text();
    if (response.status === 429 || response.status >= 500) {
      const wait = attempt * 2000;
      console.warn(`OpenAI ${response.status}, retry in ${wait}ms…`);
      await sleep(wait);
      continue;
    }
    if (!response.ok) {
      throw new Error(`OpenAI HTTP ${response.status}: ${text.slice(0, 400)}`);
    }

    const json = JSON.parse(text);
    const content = json.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty OpenAI content');
    const parsed = JSON.parse(content);
    const list = Array.isArray(parsed) ? parsed : parsed.items;
    if (!Array.isArray(list)) {
      throw new Error(`Unexpected shape: ${content.slice(0, 300)}`);
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

async function main() {
  const en = JSON.parse(readFileSync(EN_PATH, 'utf8'));
  const fr = JSON.parse(readFileSync(FR_PATH, 'utf8'));

  const enFlat = flatten(en);
  const frFlat = flatten(fr);

  const targets = rewriteAll
    ? Object.entries(enFlat)
    : Object.entries(enFlat).filter(([k]) => !(k in frFlat));
  console.log(
    `mode=${rewriteAll ? 'all→fr-CA' : 'missing-only'} en=${Object.keys(enFlat).length} fr=${Object.keys(frFlat).length} targets=${targets.length}`,
  );

  if (!targets.length) {
    console.log('Nothing to do.');
    return;
  }

  const translated = new Map();
  for (let i = 0; i < targets.length; i += BATCH) {
    const chunk = targets.slice(i, i + BATCH).map(([id, text], idx) => ({
      id: String(i + idx),
      key: id,
      text: String(text),
    }));
    console.log(`Translating ${i + 1}-${Math.min(i + chunk.length, targets.length)} / ${targets.length}…`);

    const map = await translateTextsWithKeys(chunk);
    for (const item of chunk) {
      const value = map.get(item.id);
      if (value != null) translated.set(item.key, value);
      else console.warn(`  missing translation for ${item.key}`);
    }
    await sleep(200);
  }

  let applied = 0;
  for (const [key, value] of translated) {
    setPath(fr, key, value);
    applied += 1;
  }

  writeFileSync(FR_PATH, `${JSON.stringify(fr, null, 4)}\n`, 'utf8');

  const frAfter = flatten(JSON.parse(readFileSync(FR_PATH, 'utf8')));
  const stillMissing = Object.keys(enFlat).filter((k) => !(k in frAfter));
  console.log(`Applied ${applied}. Still missing: ${stillMissing.length}`);
  if (stillMissing.length) {
    console.log(stillMissing.slice(0, 30).join('\n'));
  }
}

async function translateTextsWithKeys(chunk) {
  // Map numeric ids for the model; keep keys locally
  return translateBatch(chunk.map((c) => ({ id: c.id, text: c.text })));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
