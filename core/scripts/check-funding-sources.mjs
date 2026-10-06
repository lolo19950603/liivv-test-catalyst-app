/**
 * Re-checks every official page behind the Diabetes Care Funding & Coverage
 * page (/liivv-health/diabetes-care/funding) against the copy taken on the
 * day its facts were last verified.
 *
 * Run from the repo root:
 *   node core/scripts/check-funding-sources.mjs
 *   node core/scripts/check-funding-sources.mjs --json
 *   node core/scripts/check-funding-sources.mjs --update-baseline
 *
 * For every register entry the page cites (each program's sources, the phone
 * numbers' sources, the provincial drug plans it names, the private-insurance
 * rows and the page's own sentences, Diabetes Canada's included: everything in
 * diabetes-care/funding/funding-meta.ts that is a SourceId), it fetches the
 * page and, where the publisher has one, its French version. It follows
 * redirects with a browser-like user agent and a timeout, and records:
 *   - the HTTP status and the address it ended on;
 *   - the <title> (or a PDF's Title);
 *   - any "last modified / updated / date modified" text the page prints, or
 *     a PDF's modification date;
 *   - a hash of the page's visible text (its <main> where it has one), with
 *     tags, scripts and spacing taken out, so a re-styled page is not a change;
 *   - for each program row, whether its `checkPhrases` (short phrases copied
 *     exactly from the official page) are all still there.
 *
 * It compares that with core/scripts/data/funding-sources-baseline.json and
 * prints one line per page:
 *   OK              nothing recorded has changed
 *   CHANGED         the status, address, title, date or text differs: re-read
 *                   the page and update the program's copy and `verifiedOn`
 *   MISSING PHRASE  a program's phrase is gone from its page (listed per row)
 *   BLOCKED         the site refused the request (a bot check, a CAPTCHA, a
 *                   403, a timeout). Nothing here tries to get past one: read
 *                   the page in a browser instead
 *   NEW             not in the baseline yet
 * It exits 1 when anything is CHANGED or MISSING PHRASE, so a scheduled run
 * flags it; BLOCKED and NEW alone exit 0.
 *
 * --update-baseline writes today's results as the new baseline, after a
 * person has re-read the pages that changed and updated the copy.
 * --json prints the full report as JSON instead of the table.
 * --only=<id,id> checks just those register entries.
 * --dump=<dir> also saves each page's visible text there, for reading.
 * --url=<address> fetches one address that is not registered yet and prints
 * what it found (with --dump, its text too): how a page is read before it is
 * added to the register.
 *
 * Reads only public pages. It never sends anything about a reader, and it
 * never writes outside the baseline file and the --dump folder.
 */

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const DC = join(HERE, '..', 'app', '[locale]', '(default)', 'liivv-health', 'diabetes-care');
const BASELINE = join(HERE, 'data', 'funding-sources-baseline.json');

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';
const TIMEOUT_MS = 45_000;
const CONCURRENCY = 4;

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const option = (name) => args.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3);

/* ------------------------------------------------------------------------- */
/* Reading a page                                                             */
/* ------------------------------------------------------------------------- */

const ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  rsquo: '’',
  lsquo: '‘',
  ldquo: '“',
  rdquo: '”',
  ndash: '–',
  mdash: '—',
  hellip: '…',
  laquo: '«',
  raquo: '»',
  agrave: 'à',
  acirc: 'â',
  ccedil: 'ç',
  eacute: 'é',
  Eacute: 'É',
  egrave: 'è',
  ecirc: 'ê',
  euml: 'ë',
  icirc: 'î',
  iuml: 'ï',
  ocirc: 'ô',
  ugrave: 'ù',
  ucirc: 'û',
  reg: '®',
  trade: '™',
  copy: '©',
};

function decodeEntities(text) {
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(
      /&([a-z]+);/gi,
      (match, name) => ENTITIES[name] ?? ENTITIES[name.toLowerCase()] ?? match,
    );
}

/* Spacing, quotes and dashes made uniform, so a phrase matches however the page typesets it. */
export function normalise(text) {
  return text
    .replace(/[\u2018\u2019\u02bc]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2010-\u2015\u2212]/g, '-')
    .replace(/[\u00a0\u2009\u202f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function visibleText(html) {
  const mainHtml = /<main\b[^>]*>([\s\S]*?)<\/main>/i.exec(html)?.[1];

  return decodeEntities(
    (mainHtml ?? html)
      .replace(/<(script|style|noscript|svg|template)\b[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|li|h\d|tr|section|article)>/gi, '\n')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/[ \t\f\v\u00a0]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n')
    .trim();
}

/* The dates a page prints about itself, as printed. */
function modifiedMarks(html, text) {
  const marks = new Set();
  const meta =
    /<meta[^>]+(?:name|property)=["'](?:dcterms\.modified|article:modified_time|dateModified|last-modified)["'][^>]*>/gi;

  (html.match(meta) ?? []).forEach((tag) => {
    const content = /content=["']([^"']+)["']/i.exec(tag)?.[1];

    if (content) marks.add(`meta ${content}`);
  });

  const printed =
    /(?:date modified|last modified|last updated(?: on)?|last update|updated(?: on)?|modifié(?:e)? le|mis à jour(?: le)?|dernière mise à jour|date de modification)\s*:?\s*([0-9]{4}-[0-9]{2}-[0-9]{2}|[0-9]{1,2}(?:er)? [a-zéû]+ [0-9]{4}|[a-z]+\.? [0-9]{1,2},? [0-9]{4})/gi;

  Array.from(text.matchAll(printed)).forEach((match) =>
    marks.add(match[0].replace(/\s+/g, ' ').trim()),
  );

  return [...marks].slice(0, 6);
}

function pdfFacts(buffer) {
  const raw = buffer.toString('latin1');
  const title =
    /\/Title\s*\(([^)]*)\)/.exec(raw)?.[1] ??
    /<dc:title>[\s\S]*?<rdf:li[^>]*>([^<]*)</.exec(raw)?.[1];
  const modified = [
    /\/ModDate\s*\(D:(\d{8})/.exec(raw)?.[1],
    /xmp:ModifyDate[>=]["']?(\d{4}-\d{2}-\d{2})/.exec(raw)?.[1],
  ].filter(Boolean);
  let text = '';
  const dir = mkdtempSync(join(tmpdir(), 'funding-pdf-'));

  try {
    const file = join(dir, 'page.pdf');

    writeFileSync(file, buffer);

    const run = spawnSync('pdftotext', ['-layout', '-enc', 'UTF-8', file, '-'], {
      encoding: 'utf8',
    });

    text = run.status === 0 ? run.stdout : '';
  } catch {
    text = '';
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }

  return {
    title: title?.trim() || undefined,
    modified: modified.map((date) => `pdf ${date}`),
    text: text.replace(/[ \t]+/g, ' ').trim(),
    textRead: text !== '',
  };
}

const BOT_CHECK =
  /just a moment\.\.\.|verifying your browser|attention required|captcha|cf-chl|radware|access denied|request unsuccessful/i;

async function readPage(href) {
  const started = Date.now();

  try {
    const response = await fetch(href, {
      redirect: 'follow',
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        'User-Agent': UA,
        Accept: 'text/html,application/xhtml+xml,application/pdf;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-CA,en;q=0.9,fr-CA;q=0.8,fr;q=0.7',
      },
    });
    const buffer = Buffer.from(await response.arrayBuffer());
    const type = response.headers.get('content-type') ?? '';
    const isPdf = /pdf/i.test(type) || buffer.subarray(0, 5).toString() === '%PDF-';
    const base = { status: response.status, finalUrl: response.url, ms: Date.now() - started };

    if (isPdf) {
      const pdf = pdfFacts(buffer);

      return {
        ...base,
        kind: 'pdf',
        title: pdf.title,
        modified: pdf.modified,
        text: pdf.text,
        textRead: pdf.textRead,
      };
    }

    /* Some provincial sites still serve Windows-1252: read each page in the charset it declares. */
    const declared =
      /charset=([\w-]+)/i.exec(type)?.[1] ??
      /<meta[^>]+charset=["']?([\w-]+)/i.exec(buffer.subarray(0, 4096).toString('latin1'))?.[1];
    const charset = /^(?:iso-8859-1|windows-1252|latin1)$/i.test(declared ?? '')
      ? 'windows-1252'
      : 'utf-8';
    const html = new TextDecoder(charset).decode(buffer);
    const title = decodeEntities(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? '')
      .replace(/\s+/g, ' ')
      .trim();
    const text = visibleText(html);
    const blocked =
      [401, 403, 429, 503].includes(response.status) ||
      (BOT_CHECK.test(title) && text.length < 4000) ||
      (BOT_CHECK.test(text.slice(0, 600)) && text.length < 2500);

    return {
      ...base,
      kind: 'html',
      title: title || undefined,
      modified: modifiedMarks(html, text),
      text,
      textRead: !blocked,
      blocked,
    };
  } catch (error) {
    return {
      status: 0,
      finalUrl: href,
      ms: Date.now() - started,
      kind: 'error',
      error: String(error?.cause?.code ?? error?.name ?? error),
      text: '',
      textRead: false,
      blocked: true,
    };
  }
}

const hashOf = (text) => createHash('sha256').update(normalise(text)).digest('hex').slice(0, 16);

/* ------------------------------------------------------------------------- */
/* What the Funding page cites                                                */
/* ------------------------------------------------------------------------- */

async function loadRegister() {
  const load = (file) => import(pathToFileURL(file).href);
  const funding = await load(join(DC, 'funding', 'funding-meta.ts'));
  const { SOURCE_META } = await load(join(DC, 'chapters', 'sources-meta.ts'));

  return { funding, SOURCE_META };
}

/* Every SourceId in funding-meta.ts, in page order, once each. */
function citedSources(funding) {
  const ids = [
    ...funding.PROGRAM_META.flatMap((meta) => [
      ...meta.sources,
      ...(meta.phones ?? []).map((phone) => phone.source),
      ...(meta.checkPhrases ?? []).flatMap((entry) =>
        typeof entry === 'string' ? [] : [entry.source],
      ),
    ]),
    ...(funding.DIRECT_BILLING ?? []).map((entry) => entry.source),
    ...Object.values(funding.PRIVATE_FIRST ?? {}).map((entry) => entry.source),
    ...(funding.PAY_LATER?.sources ?? []),
    ...Object.values(funding.PAGE_SOURCES ?? {}).flat(),
  ];

  return [...new Set(ids.filter(Boolean))];
}

/* The addresses to read: each register entry, and its French page where it has one. */
function targetsFor(ids, SOURCE_META) {
  return ids.flatMap((id) => {
    const meta = SOURCE_META[id];

    if (!meta) return [{ key: id, id, href: undefined, missing: true }];

    return [
      { key: id, id, href: meta.href },
      ...(meta.hrefFr ? [{ key: `${id}#fr`, id, href: meta.hrefFr }] : []),
    ];
  });
}

/* ------------------------------------------------------------------------- */
/* Comparing with the baseline                                                */
/* ------------------------------------------------------------------------- */

const COMPARED = ['status', 'finalUrl', 'title', 'modified', 'hash'];

function compare(now, before) {
  if (now.blocked) return { verdict: 'BLOCKED', changes: [] };
  if (!before) return { verdict: 'NEW', changes: [] };

  const changes = COMPARED.filter(
    (field) => JSON.stringify(now[field] ?? null) !== JSON.stringify(before[field] ?? null),
  ).map((field) => ({ field, before: before[field] ?? null, now: now[field] ?? null }));

  return { verdict: changes.length ? 'CHANGED' : 'OK', changes };
}

/* Each program row's phrases, against the text of the page each one names (its first source by default). */
function phraseResults(funding, pages) {
  return funding.PROGRAM_META.flatMap((meta) =>
    (meta.checkPhrases ?? []).map((entry) => {
      const source = typeof entry === 'string' ? meta.sources[0] : entry.source;
      const phrase = typeof entry === 'string' ? entry : entry.phrase;
      const french = typeof entry !== 'string' && entry.fr === true;
      const page = pages.get(french ? `${source}#fr` : source);

      if (!page?.textRead) return { program: meta.id, source, phrase, found: null };

      return {
        program: meta.id,
        source,
        phrase,
        ...(french ? { french } : {}),
        found: normalise(page.text).includes(normalise(phrase)),
      };
    }),
  );
}

/* A few pages at a time, so no site sees a burst of requests; results keep the input order. */
async function inBatches(items, worker) {
  const results = new Array(items.length);
  let next = 0;

  const lane = async () => {
    if (next >= items.length) return;

    const index = next;

    next += 1;
    results[index] = await worker(items[index]);
    await lane();
  };

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, lane));

  return results;
}

/* What the report prints after a page's verdict. */
function detailOf(row) {
  if (row.verdict === 'CHANGED') {
    return row.changes
      .map(
        (change) =>
          `${change.field}: ${JSON.stringify(change.before)} -> ${JSON.stringify(change.now)}`,
      )
      .join('; ');
  }

  if (row.verdict === 'BLOCKED') return `${row.now.status || row.now.error} ${row.now.finalUrl}`;

  return row.now?.title ?? '';
}

function dumpText(dir, key, page) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, `${key.replace(/[^a-z0-9#-]+/gi, '_').replace('#', '.')}.txt`),
    `URL: ${page.finalUrl}\nSTATUS: ${page.status}\nTITLE: ${page.title ?? ''}\nMODIFIED: ${(page.modified ?? []).join(' | ')}\n\n${page.text}\n`,
  );
}

/* ------------------------------------------------------------------------- */
/* Main                                                                       */
/* ------------------------------------------------------------------------- */

async function checkOneUrl(href) {
  const page = await readPage(href);
  const dump = option('dump');

  if (dump) dumpText(dump, 'url', page);

  const { text, ...rest } = page;

  console.log(
    JSON.stringify(
      { ...rest, hash: page.textRead ? hashOf(text) : null, chars: text.length },
      null,
      2,
    ),
  );
}

async function main() {
  const url = option('url');

  if (url) {
    await checkOneUrl(url);

    return 0;
  }

  const { funding, SOURCE_META } = await loadRegister();
  const only = option('only')?.split(',');
  const ids = citedSources(funding).filter((id) => !only || only.includes(id));
  const targets = targetsFor(ids, SOURCE_META);
  const baseline = existsSync(BASELINE)
    ? JSON.parse(readFileSync(BASELINE, 'utf8'))
    : { pages: {} };
  const dump = option('dump');

  const read = await inBatches(targets, async (target) => {
    if (target.missing) return { ...target, page: undefined };

    const page = await readPage(target.href);

    if (dump) dumpText(dump, target.key, page);

    return { ...target, page };
  });

  /* Keyed `<id>`, or `<id>#fr` for a French page. */
  const pages = new Map(read.filter((entry) => entry.page).map((entry) => [entry.key, entry.page]));

  const rows = read.map((entry) => {
    if (entry.missing) {
      return {
        key: entry.key,
        verdict: 'CHANGED',
        changes: [{ field: 'register', before: 'registered', now: 'not in sources-meta.ts' }],
      };
    }

    const { page } = entry;
    const now = {
      href: entry.href,
      status: page.status,
      finalUrl: page.finalUrl,
      title: page.title ?? null,
      modified: page.modified ?? [],
      hash: page.textRead ? hashOf(page.text) : null,
      kind: page.kind,
      ...(page.error ? { error: page.error } : {}),
      blocked: Boolean(page.blocked),
    };
    const { verdict, changes } = compare(now, baseline.pages?.[entry.key]);

    return { key: entry.key, verdict, changes, now };
  });

  const phrases = phraseResults(funding, pages);
  const missingPhrases = phrases.filter((result) => result.found === false);
  const uncheckedPhrases = phrases.filter((result) => result.found === null);
  const counts = rows.reduce(
    (tally, row) => ({ ...tally, [row.verdict]: (tally[row.verdict] ?? 0) + 1 }),
    {},
  );
  const today = new Date().toISOString().slice(0, 10);
  const failed = rows.some((row) => row.verdict === 'CHANGED') || missingPhrases.length > 0;

  if (flag('update-baseline')) {
    const pagesOut = { ...(only ? baseline.pages : {}) };

    rows.forEach((row) => {
      if (row.now) pagesOut[row.key] = { ...row.now, checkedOn: today };
    });

    mkdirSync(dirname(BASELINE), { recursive: true });
    writeFileSync(
      BASELINE,
      `${JSON.stringify(
        {
          note: 'Written by core/scripts/check-funding-sources.mjs --update-baseline. One entry per register page the Funding & Coverage page cites (`<id>` and `<id>#fr`). Update it only after a person has re-read every page that changed and updated the copy.',
          updatedOn: today,
          nextCheck: funding.NEXT_CHECK,
          pages: Object.fromEntries(
            Object.entries(pagesOut).sort(([a], [b]) => a.localeCompare(b)),
          ),
        },
        null,
        2,
      )}\n`,
    );
  }

  if (flag('json')) {
    console.log(JSON.stringify({ checkedOn: today, counts, rows, phrases }, null, 2));
  } else {
    console.log(
      `Funding & Coverage sources, checked ${today} (baseline ${baseline.updatedOn ?? 'none'}; next scheduled check ${funding.NEXT_CHECK})`,
    );
    console.log('');
    rows.forEach((row) => {
      const detail = detailOf(row);

      console.log(`${row.verdict.padEnd(15)} ${row.key.padEnd(46)} ${detail}`);
    });
    console.log('');
    missingPhrases.forEach((result) =>
      console.log(
        `MISSING PHRASE  ${result.program.padEnd(22)} ${result.source}: "${result.phrase}"`,
      ),
    );
    uncheckedPhrases.forEach((result) =>
      console.log(`(not checked)   ${result.program.padEnd(22)} ${result.source}: page not read`),
    );
    console.log('');
    console.log(
      `${rows.length} pages: ${Object.entries(counts)
        .map(([verdict, n]) => `${n} ${verdict}`)
        .join(
          ', ',
        )}. Phrases: ${phrases.length - missingPhrases.length - uncheckedPhrases.length} found, ${missingPhrases.length} missing, ${uncheckedPhrases.length} not checked.`,
    );
    if (flag('update-baseline')) console.log(`Baseline written: ${BASELINE}`);
  }

  return failed && !flag('update-baseline') ? 1 : 0;
}

process.exitCode = await main();
