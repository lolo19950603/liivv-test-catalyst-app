/**
 * Prewarm the chapter voice-over and its read-along timings: asks
 * /api/chapter-audio for every stop of every chapter in every locale, so each
 * one is generated (and paid for) once
 * up front instead of on the first reader's click. Stops already in storage
 * are skipped by the route at no cost, so this is safe to re-run after edits.
 *
 * Needs a running app with CHAPTER_AUDIO_ENABLED=true. From the repo root:
 *   node core/scripts/generate-chapter-audio.mjs
 *   node core/scripts/generate-chapter-audio.mjs --base=https://staging.example.com --locale=fr --slug=new-to-the-journey
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MESSAGES_DIR = join(__dirname, '..', 'messages');

const arg = (name) =>
  process.argv.find((value) => value.startsWith(`--${name}=`))?.slice(name.length + 3);

const BASE = (arg('base') ?? 'http://localhost:3000').replace(/\/$/, '');
const LOCALES = arg('locale') ? [arg('locale')] : ['en', 'fr'];
// Stays well under the API gateway's 120 requests per minute per IP.
const PAUSE_MS = 600;
// A stop can span several OpenAI calls when it is not in storage yet.
const TIMEOUT_MS = 180_000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function chapterSlugs(locale) {
  const messages = JSON.parse(readFileSync(join(MESSAGES_DIR, `${locale}.json`), 'utf8'));
  const slugs = Object.keys(messages.OstomyCare?.chapters ?? {});

  return arg('slug') ? slugs.filter((slug) => slug === arg('slug')) : slugs;
}

// Timings make the audio first if it is missing, so one request warms both.
async function warm(locale, slug, stop) {
  const url = `${BASE}/api/chapter-audio?${new URLSearchParams({ locale, slug, stop: String(stop), format: 'timings' })}`;
  const started = Date.now();
  const response = await fetch(url, {
    redirect: 'manual',
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const seconds = ((Date.now() - started) / 1000).toFixed(1);

  if (response.status === 302) {
    console.log(`  ok    ${locale} ${slug} stop ${stop} (${seconds}s)`);

    return 'ok';
  }

  const body = await response.json().catch(() => ({}));

  if (response.status === 404 && body.error === 'unknown_stop') return 'done';

  console.error(`  fail  ${locale} ${slug} stop ${stop}: ${response.status} ${body.error ?? ''}`);

  return response.status === 503 && body.error === 'audio_disabled' ? 'disabled' : 'fail';
}

let failures = 0;

for (const locale of LOCALES) {
  for (const slug of chapterSlugs(locale)) {
    console.log(`${locale} / ${slug}`);

    // Stops are the intro (0) then the cards numbered from 1, without gaps.
    for (let stop = 0; ; stop += 1) {
      const result = await warm(locale, slug, stop);

      if (result === 'done') break;

      if (result === 'disabled') {
        console.error('Voice-over is disabled: set CHAPTER_AUDIO_ENABLED=true and restart the app.');
        process.exit(1);
      }

      if (result === 'fail') failures += 1;

      await sleep(PAUSE_MS);
    }
  }
}

if (failures) {
  console.error(`${failures} stop(s) failed; re-run to retry them.`);
  process.exit(1);
}

console.log('All stops are generated.');
