/**
 * The machinery every care site's content-review pass shares.
 *
 * export-content-review.mjs is the Ostomy pass and the command line;
 * diabetes-care.mjs is the Diabetes pass. What they have in common is here:
 * loading the structure files, the writer that records which message paths a
 * document emitted (the coverage walk reads that), the source register's
 * citations and checks, the re-review baseline diff, the held-message cross
 * check, and the stamp each file carries.
 *
 * Nothing in this file knows which site it is working for. A pass hands it its
 * own messages, its own register and its own namespace.
 */

import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { dirname, join, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

export const CORE = join(HERE, '..', '..');
export const REPO = join(CORE, '..');
export const LIIVV_HEALTH = join(CORE, 'app', '[locale]', '(default)', 'liivv-health');
export const DOCS = join(REPO, 'docs', 'content-review');

/*
 * Node 24 strips TypeScript types natively, so a structure file loads as it
 * stands. What it cannot do is follow an import written the way the app writes
 * them, with no extension (chapter-shop.ts imports '../oc-ids'). This resolves
 * such a specifier to its .ts file, and only for a .ts parent, so nothing
 * outside the structure files resolves any differently.
 */
registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context);
    } catch (error) {
      if (/^\.\.?\//.test(specifier) && context.parentURL?.endsWith('.ts')) {
        return nextResolve(`${specifier}.ts`, context);
      }

      throw error;
    }
  },
});

/* A structure file, loaded under type stripping. */
export const loadTs = (file) => import(pathToFileURL(file).href);

/* One namespace of the message files, in both locales. */
export function loadMessages(ns) {
  const read = (locale) =>
    JSON.parse(readFileSync(join(CORE, 'messages', `${locale}.json`), 'utf8'))[ns] ?? {};

  return { en: read('en'), fr: read('fr') };
}

/* ------------------------------------------------------------------------- */
/* The stamp                                                                  */
/* ------------------------------------------------------------------------- */

export const COMMIT = execSync('git rev-parse --short HEAD', { cwd: REPO }).toString().trim();
export const TODAY = new Date().toISOString().slice(0, 10);

/* What every generated file says about where it came from. */
export const stamp = () => `**Generated:** ${TODAY} from commit \`${COMMIT}\``;

/* ------------------------------------------------------------------------- */
/* Small helpers                                                              */
/* ------------------------------------------------------------------------- */

export const words = (s) => String(s).trim().split(/\s+/).filter(Boolean).length;
export const ordered = (node) =>
  Object.keys(node ?? {})
    .sort((a, b) => Number(a) - Number(b))
    .map((k) => [k, node[k]]);
export const pad = (n) => String(n).padStart(2, '0');
export const ref = (r) => `\`${r}\``;

/* The value at a numbered-key position, the way chapters-data.ts ordered() reads it. */
export const nth = (node, index) => ordered(node)[index]?.[1];
export const count = (node) => Object.keys(node ?? {}).length;

/* A dotted message path, looked up in one locale's tree. */
export const valueAt = (node, path) => path.split('.').reduce((n, key) => n?.[key], node);

/* ------------------------------------------------------------------------- */
/* The writer, and the coverage walk                                          */
/* ------------------------------------------------------------------------- */

/* French nobody has reviewed, showing on /fr now. */
export const FR_REVIEW_MARK = '⚑';
/* English corrected in the source, waiting to be read again. */
export const RE_REVIEW_MARK = '✎';

/*
 * The writer a pass builds its documents with. `text` looks a path up in the
 * locale, marks it, and records it in `seen` — the set the coverage walk
 * checks every message leaf against, so a string no document printed is
 * caught rather than skipped.
 */
export function writerFactory({
  messages,
  seen,
  reReviewsPending: corrections,
  awaitsFrenchReview,
}) {
  return function makeWriter(locale) {
    const lines = [];
    let wordCount = 0;
    let frReviewsMarked = 0;
    let reReviewsMarked = 0;

    const take = (path, value) => {
      seen[locale].add(path);
      wordCount += words(value);
    };

    /* A string looked up in this locale, with a visible fallback note when missing. */
    const text = (path) => {
      const value = valueAt(messages[locale], path);

      if (typeof value === 'string') {
        take(path, value);

        let shown = value;

        if (corrections.has(path)) {
          reReviewsMarked += 1;
          shown = `${shown} ${RE_REVIEW_MARK}`;
        }

        if (locale === 'fr' && awaitsFrenchReview(path)) {
          frReviewsMarked += 1;
          shown = `${shown} ${FR_REVIEW_MARK}`;
        }

        return shown;
      }

      if (locale === 'fr') {
        const english = valueAt(messages.en, path);

        if (typeof english === 'string') {
          return `⚠ *Missing in French — the site shows the English:* ${english}`;
        }
      }

      return null;
    };

    return {
      lines,
      push: (...l) => lines.push(...l),
      text,
      words: () => wordCount,
      frReviewsMarked: () => frReviewsMarked,
      reReviewsMarked: () => reReviewsMarked,
    };
  };
}

/*
 * Every string leaf under a message subtree, one line each, with a short
 * reference built from its key path. Numbered keys come out in order because
 * Object.keys lists integer keys ascending.
 */
export function emitTree(w, out, node, path, short) {
  for (const [k, v] of Object.entries(node ?? {})) {
    if (v && typeof v === 'object') emitTree(w, out, v, `${path}.${k}`, `${short}.${k}`);
    else out(`- ${w.text(`${path}.${k}`)} ${ref(`${short}.${k}`)}`);
  }
}

/* Every leaf path under a message tree, in key order. */
export function leafPaths(node, prefix = '', found = []) {
  for (const [k, v] of Object.entries(node ?? {})) {
    const p = prefix ? `${prefix}.${k}` : k;

    if (v && typeof v === 'object') leafPaths(v, p, found);
    else found.push(p);
  }

  return found;
}

/* ------------------------------------------------------------------------- */
/* Re-review: the baseline diff                                               */
/* ------------------------------------------------------------------------- */

/*
 * Every English string that differs from a site's pre-build baseline, with
 * what it used to say and why. Built, not maintained: the baseline is a flat
 * path → string map of the namespace as it stood, and every path whose text
 * differs from it today is a correction waiting on re-review. New paths are
 * not corrections; they are new copy, and the whole pack is their review.
 */
export function reReviewsPending(baseline, english, notes) {
  return new Map(
    Object.entries(baseline).flatMap(([path, was]) => {
      const now = valueAt(english, path);

      if (typeof now !== 'string' || now === was) return [];

      const note = notes[path];

      return [[path, `Was: “${was}”${note ? ` — ${note}` : ''}`]];
    }),
  );
}

/* ------------------------------------------------------------------------- */
/* Sources                                                                    */
/* ------------------------------------------------------------------------- */

/* How a source's kind reads in the table at the foot of a file. */
export const SOURCE_TYPE_LABEL = {
  'canadian-patient-education': 'Canadian patient education',
  'canadian-guideline': 'Canadian guideline or position statement',
  'canadian-government': 'Canadian government program or notice',
  'international-guideline': 'International guideline',
  'international-patient-education': 'International patient education',
  industry: 'Industry (manufacturer-run; never the only source for a claim)',
  other: 'Other',
};

/*
 * A site's citations: the inline mention with its publisher, and the table at
 * the foot of a file. `reset` starts a new file, so each file's table is the
 * evidence base that file actually cited and not the register in full.
 */
export function sourceCiter({ sourceMeta, sourceReview }) {
  let named = new Set();

  const titles = (ids, locale) =>
    (ids ?? [])
      .map((id) => {
        const source = sourceMeta[id];

        if (!source) return `⚠ unknown source '${id}'`;

        named.add(id);

        const label = locale === 'fr' && source.labelFr ? source.labelFr : source.label;
        const publisher = sourceReview[id]?.publisher;

        return publisher ? `${label} (${publisher})` : label;
      })
      .join('; ');

  /*
   * The evidence base of one file: everything it cited, with who publishes it,
   * what kind of document it is, the passage the citation rests on, and the
   * link. Reviewer-only — none of this renders on a page.
   */
  const table = (locale) => {
    const ids = [...named].sort((a, b) =>
      String(sourceMeta[a]?.label ?? a).localeCompare(String(sourceMeta[b]?.label ?? b), 'en'),
    );

    if (!ids.length) return [];

    const rows = ids.map((id) => {
      const source = sourceMeta[id] ?? {};
      const review = sourceReview[id] ?? {};
      const label = locale === 'fr' && source.labelFr ? source.labelFr : source.label;
      const href = locale === 'fr' && source.hrefFr ? source.hrefFr : source.href;
      const cell = (value) => String(value ?? '⚠ missing').replace(/\|/g, '\\|');

      return `| \`${id}\` | ${cell(label)} | ${cell(review.publisher)} | ${SOURCE_TYPE_LABEL[review.type] ?? cell(review.type)} | ${cell(review.locator)} | <${href}> |`;
    });

    return [
      '## Sources named in this file',
      '',
      '*Everything this file cites, with who publishes it and the passage each citation rests on. Please read the publisher column: it is where a manufacturer grant, a single province or a single hospital shows. "Locator" is the reviewer-only paraphrase kept in `sources-review.ts` — it is never rendered on a page, and it is what a claim in this file should be checked against.*',
      '',
      '| id | Title | Publisher | Type | Locator (paraphrase of the passage cited) | Link |',
      '|---|---|---|---|---|---|',
      ...rows,
      '',
    ];
  };

  return {
    titles,
    table,
    reset: () => {
      named = new Set();
    },
  };
}

/* Every `sources` (or `…Sources`) array anywhere in the chapter structure, with where it sits. */
export function sourceRefs(node, path, found = []) {
  if (Array.isArray(node)) {
    node.forEach((v, i) => sourceRefs(v, `${path}[${i}]`, found));
  } else if (node && typeof node === 'object') {
    Object.entries(node).forEach(([k, v]) => {
      if (/^sources$|Sources$/.test(k) && Array.isArray(v)) found.push([`${path}.${k}`, v]);
      else sourceRefs(v, `${path}.${k}`, found);
    });
  }

  return found;
}

/*
 * The register, checked: every source has a title, an https link and a page
 * language; the reviewer-only half (sources-review.ts) has the same ids with a
 * publisher, a type and a locator; and every id the chapter structure cites is
 * in the register.
 */
export function sourceProblems({ sourceMeta, sourceReview, chapterMeta }) {
  const problems = [];
  const https = (url) => typeof url === 'string' && url.startsWith('https://');

  const empty = (node, fields) => fields.filter((f) => !String(node?.[f] ?? '').trim());

  Object.entries(sourceMeta).forEach(([id, s]) => {
    const fields = empty(s, ['label']);

    if (fields.length) problems.push(`sources-meta.ts ${id}: empty ${fields.join(', ')}`);
    if (!https(s.href)) problems.push(`sources-meta.ts ${id}: href is not https`);
    if (s.hrefFr !== undefined && !https(s.hrefFr))
      problems.push(`sources-meta.ts ${id}: hrefFr is not https`);
    if (!['en', 'fr'].includes(s.hrefLang))
      problems.push(`sources-meta.ts ${id}: hrefLang '${s.hrefLang}'`);
  });

  /*
   * The reviewer-only fields, in their own file (sources-review.ts) so they
   * never reach a page bundle. Same ids, same order: a source that gains an
   * entry in one file and not the other leaves a reviewer with a citation they
   * cannot check, or a paraphrase for something nothing cites.
   */
  Object.keys(sourceMeta).forEach((id) => {
    if (!Object.hasOwn(sourceReview, id)) {
      problems.push(`sources-review.ts: no entry for '${id}'`);

      return;
    }

    const fields = empty(sourceReview[id], ['publisher', 'type', 'locator']);

    if (fields.length) problems.push(`sources-review.ts ${id}: empty ${fields.join(', ')}`);
  });

  Object.keys(sourceReview)
    .filter((id) => !Object.hasOwn(sourceMeta, id))
    .forEach((id) => problems.push(`sources-review.ts: '${id}' is not in sources-meta.ts`));

  sourceRefs(chapterMeta, 'CHAPTER_META').forEach(([path, ids]) =>
    ids
      .filter((id) => !Object.hasOwn(sourceMeta, id))
      .forEach((id) => problems.push(`${path}: unknown source id '${id}'`)),
  );

  return problems;
}

/* ------------------------------------------------------------------------- */
/* Holds that cover shipping                                                  */
/* ------------------------------------------------------------------------- */

/*
 * =============================================================================
 * A HOLD THAT COVERS SHIPPING HAS TO STAY IN STEP WITH THE HOLDS
 * =============================================================================
 * `HELD_CLIENT_MESSAGES` in a site's `held-messages.ts` names the message
 * subtrees kept out of the client payload, so a held figure's unapproved
 * wording is not retrievable from the HTML of every page on the store. It is a
 * hand-written list of paths, and a hand-written list drifts, so both
 * directions are checked here.
 *
 * Grow: a figure kind that is held at every placement it has, with no entry.
 * Its copy would ship on every page while rendering on none.
 * Shrink: an entry for a kind that renders somewhere — the bowel reference is
 * held on one card and live on another — which would strip the strings a live
 * figure needs and print "MISSING_MESSAGE" on the page.
 *
 * Plus the ordinary hygiene: a path has to name something that exists in both
 * message files, or the entry removes nothing and says it removed something.
 * Paths are written from the root of the message tree, so `ns` is the prefix
 * stripped before looking them up in this site's namespace.
 * =============================================================================
 */
export function heldClientProblems({ chapterMeta, heldClientMessages, messages, ns }) {
  const placements = new Map();

  for (const meta of chapterMeta) {
    for (const structure of meta.categories) {
      for (const figure of structure.figures ?? []) {
        const seen = placements.get(figure.kind) ?? { total: 0, held: 0 };

        placements.set(figure.kind, {
          total: seen.total + 1,
          held: seen.held + (figure.held ? 1 : 0),
        });
      }
    }
  }

  const listed = new Set(heldClientMessages.map((group) => group.kind));
  const problems = [];

  for (const [kind, { total, held }] of placements) {
    if (held === total && !listed.has(kind)) {
      problems.push(
        `held-messages.ts: '${kind}' is held on all ${total} of its placements, so its copy renders nowhere and must not ship — add it to HELD_CLIENT_MESSAGES`,
      );
    }
  }

  for (const group of heldClientMessages) {
    const at = placements.get(group.kind);

    if (!at) {
      problems.push(`held-messages.ts: '${group.kind}' is not placed on any chapter`);
    } else if (at.held < at.total) {
      problems.push(
        `held-messages.ts: '${group.kind}' renders on ${at.total - at.held} of its ${at.total} placements, so removing its messages would break the page — take it out of HELD_CLIENT_MESSAGES`,
      );
    }

    for (const path of group.paths) {
      if (!path.startsWith(`${ns}.`)) {
        problems.push(`held-messages.ts: '${path}' is not under ${ns}`);
      }

      const rest = path.slice(ns.length + 1);

      for (const locale of ['en', 'fr']) {
        if (valueAt(messages[locale], rest) === undefined) {
          problems.push(`held-messages.ts: '${path}' is not in ${locale}.json`);
        }
      }
    }
  }

  return problems;
}

/* ------------------------------------------------------------------------- */
/* Writing the pack, or checking it against what is on disk                   */
/* ------------------------------------------------------------------------- */

export const finish = (content) => `${content.replace(/\n{3,}/g, '\n\n').trimEnd()}\n`;

/*
 * Whether the copy in docs/content-review still says what the sources say.
 *
 * Two lines are dropped from both sides before comparing. The `Generated:`
 * stamp changes on every run by design. Any line naming a product is dropped
 * because `--check` deliberately asks BigCommerce for nothing, so it prints an
 * id where a full run prints the product's name — a difference in this run, not
 * a difference in the pack.
 */
const comparable = (content) =>
  content
    .split('\n')
    .filter((line) => !line.startsWith('**Generated:**') && !/\(#\d|product #\d/.test(line))
    .join('\n')
    .trim();

/* Records each file whose copy on disk no longer matches what was built. */
export function staleTracker() {
  const stale = [];

  return {
    stale,
    compare: (path, built) => {
      const have = existsSync(path) ? readFileSync(path, 'utf8') : '';

      if (comparable(have) !== comparable(built)) {
        stale.push(
          path
            .slice(REPO.length + 1)
            .split(sep)
            .join('/'),
        );
      }
    },
  };
}
