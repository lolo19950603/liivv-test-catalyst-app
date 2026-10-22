/**
 * The Sleep Apnea Care pass of the content-review export
 * (../export-content-review.mjs --site sleep-apnea-care).
 *
 * Writes docs/content-review/sleep-apnea-care/{en,fr}/: README.md, 00-shared.md,
 * one file per chapter (01–06), 07-landing.md, 08-funding.md, 09-paths.md and
 * 10-machine-guide.md. Every string under SleepApneaCare in the message files
 * is printed, with its reference; held-in-tree strings are printed under
 * "Held", with what releases them. Reviewer data (open rulings with their
 * defaults and alternatives, pre-publish checks, held copy that is not in the
 * message files) comes from ./sleep-apnea-care.<page>.mjs.
 *
 * With `check` it writes nothing and fails (exit code 1) on any of the checks
 * in sleep-build spec 9: coverage, parity, the engine contract, structure,
 * sources, safety, holds, forbidden words, paths, landing and funding; and,
 * with integration part 2, the site figures (their words in both locales,
 * their sources, and every card sentence a restyling figure carries), the
 * machine guide (its words, cell sources and links, nothing sold) and the
 * plan's shop rules (chapters/chapter-shop.ts shelfRuleProblems).
 *
 * Generated, never hand-written: the documents are built from the files the
 * site renders, so the text a reviewer approves is the text that ships.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  CORE,
  DOCS,
  emitTree,
  finish,
  FR_REVIEW_MARK,
  heldClientProblems,
  leafPaths,
  LIIVV_HEALTH,
  loadMessages,
  loadTs,
  pad,
  ref,
  reReviewsPending,
  sourceCiter,
  sourceProblems,
  staleTracker,
  stamp,
  valueAt,
  writerFactory,
} from './lib.mjs';

const NS = 'SleepApneaCare';
const SA = join(LIIVV_HEALTH, 'sleep-apnea-care');
const OUT = join(DOCS, 'sleep-apnea-care');
const BASELINE = join(CORE, 'scripts', 'content-review-baseline.sleep-apnea-care.en.json');
const SOURCES_MD = join(CORE, '..', 'docs', 'sleep-content', 'sources.md');

/* The whole namespace is machine-translated French awaiting review (spec 6). */
const FR_AWAITING_REVIEW_PREFIXES = ['ui.', 'chapters.', 'funding.', 'paths.', 'machineGuide.'];

/* Spec 0.3: never in SleepApneaCare copy, in either language, nor in any meta href. */
const FORBIDDEN = [
  [/cpap\s*outlet/i, 'another retailer'],
  [/diabetes\s*express|diabetesexpress/i, 'another retailer'],
  [/cm\s*h2o|cmh2o/i, 'pressure figure'],
  [/\bramp\b/i, 'settings word (ramp)'],
  [/\bEPR\b/, 'settings word (EPR)'],
  [/pressure setting/i, 'settings phrase'],
  [/set your pressure/i, 'settings phrase'],
  [/\bTBD\b|card-\?|GATED \(|Proposed:/, 'drafting marker'],
];

const isRecord = (v) => typeof v === 'object' && v !== null && !Array.isArray(v);
const placeholders = (s) =>
  [...String(s).matchAll(/\{\s*([A-Za-z0-9_]+)/g)]
    .map((m) => m[1])
    .sort()
    .join(',');
const linkTags = (s) => (String(s).match(/<\/?link>/g) ?? []).length;
const numberedCount = (node) => Object.keys(node ?? {}).filter((k) => /^\d+$/.test(k)).length;

/* ------------------------------------------------------------------ load */

async function load() {
  const at = (rel) => loadTs(join(SA, rel));
  const [
    chapters,
    sources,
    review,
    gates,
    held,
    paths,
    landing,
    site,
    funding,
    guideMeta,
    guideData,
    shop,
    ids,
    devices,
  ] = await Promise.all([
    at('chapters/chapters-meta.ts'),
    at('chapters/sources-meta.ts'),
    at('chapters/sources-review.ts'),
    at('chapters/review-gates.ts'),
    at('chapters/held-messages.ts'),
    at('chapters/paths-meta.ts'),
    at('landing-meta.ts'),
    at('chapters/site.ts'),
    at('funding/funding-meta.ts'),
    at('machine-guide/machine-guide-meta.ts'),
    at('machine-guide/machine-guide-data.ts'),
    at('chapters/chapter-shop.ts'),
    at('sa-ids.ts'),
    loadTs(join(CORE, 'lib', 'catalog', 'prescription-devices.ts')),
  ]);
  const pages = {};

  for (const page of [
    'shared',
    'landing',
    'paths',
    'funding',
    'machine-guide',
    ...chapters.CHAPTER_META.map((c) => c.slug),
  ]) {
    pages[page] = (await import(`./sleep-apnea-care.${page}.mjs`)).REVIEW;
  }

  return {
    chapters,
    sources,
    review,
    gates,
    held,
    paths,
    landing,
    site,
    funding,
    guide: { ...guideMeta, ...guideData },
    shop,
    ids,
    devices,
    pages,
  };
}

/* ---------------------------------------------------------------- checks */

function parityProblems(messages) {
  const problems = [];
  const en = new Set(leafPaths(messages.en));
  const fr = new Set(leafPaths(messages.fr));

  for (const p of en) {
    if (!fr.has(p)) {
      problems.push(`parity: fr is missing ${p}`);
      continue;
    }

    const a = valueAt(messages.en, p);
    const b = valueAt(messages.fr, p);

    if (placeholders(a) !== placeholders(b)) problems.push(`parity: ${p}: ICU placeholders differ`);
    if (linkTags(a) !== linkTags(b)) problems.push(`parity: ${p}: <link> tag count differs`);
  }

  for (const p of fr) if (!en.has(p)) problems.push(`parity: fr has extra ${p}`);

  return problems;
}

function contractProblems(messages) {
  const dc = loadMessages('DiabetesCare').en.ui;
  const skip = /^(chapter\.(ask|roleNames|groups|shop\.occasions|shop\.offers)|discovery\.doors)(\.|$)/;

  return ['chapter', 'governance', 'discovery'].flatMap((sub) =>
    leafPaths(dc[sub], sub)
      .filter((p) => !skip.test(p))
      .filter((p) => typeof valueAt(messages.en.ui, p) !== 'string')
      .map((p) => `contract: SleepApneaCare.ui.${p} is missing (the engine reads it)`),
  );
}

/* Every item number a figure names must exist on its card. */
function figureItemProblems(where, figure, items) {
  const numbers = [
    ...(figure.kind === 'columns' ? figure.columns.flat() : []),
    ...(figure.lead ?? []),
    ...(figure.neutral ?? []),
    ...(figure.kind === 'tripList' ? (figure.items ?? []) : []),
    ...(figure.tabs ?? []).flatMap((tab) => tab.items),
    ...(figure.steps ?? []).map((step) => step.item),
    ...(figure.zones ?? []).flatMap((zone) => (zone.item === undefined ? [] : [zone.item])),
    ...(figure.lanes ?? []).flatMap((lane) => (lane.item === undefined ? [] : [lane.item])),
  ];

  return numbers
    .filter((n) => !(String(n) in (items ?? {})))
    .map((n) => `structure: ${where} ${figure.kind} names item ${n}, which the card does not have`);
}

function laneProblems(where, figure, words) {
  if (figure.kind !== 'lanes') return [];

  const problems = [];

  if (figure.lanes.length !== numberedCount(words?.lanes)) {
    problems.push(`structure: ${where} lanes ${figure.lanes.length} ≠ figure.lanes ${numberedCount(words?.lanes)}`);
  }
  if (figure.topicKeys.length !== numberedCount(words?.topics)) {
    problems.push(`structure: ${where} topicKeys ${figure.topicKeys.length} ≠ figure.topics ${numberedCount(words?.topics)}`);
  }

  return problems;
}

function cardProblems(slug, meta, words, sourceMeta) {
  const problems = [];
  const where = `${slug} card`;

  meta.categories.forEach((card, index) => {
    const n = index + 1;
    const message = words.categories?.[String(n)];

    if (!message) {
      problems.push(`structure: ${where} ${n} has no messages`);
      return;
    }

    if (card.held === undefined && !(card.sources ?? []).length) {
      problems.push(`sources: ${where} ${n} has no sources`);
    }

    const scopes = (card.sources ?? []).map((id) => sourceMeta[id]?.scope ?? 'canadian');
    if (scopes.length && scopes.every((s) => s !== 'canadian')) {
      problems.push(`sources: ${where} ${n} rests only on ${scopes[0]} sources`);
    }

    (card.figures ?? []).forEach((figure) => {
      problems.push(...figureItemProblems(`${where} ${n}`, figure, message.items));
      problems.push(...laneProblems(`${where} ${n}`, figure, message.figure));
    });

    (card.links ?? [])
      .filter((link) => link.label)
      .forEach((link) => {
        const key = link.key ?? (link.at === 'note' ? 'note' : link.at.slice('items.'.length));

        if (!message.links?.[key]) {
          problems.push(`structure: ${where} ${n} labelled link '${key}' has no words`);
        }
      });
  });

  if (meta.categories.length !== numberedCount(words.categories)) {
    problems.push(
      `structure: ${slug} has ${meta.categories.length} meta cards and ${numberedCount(words.categories)} message cards`,
    );
  }

  return problems;
}

function chapterProblems(ctx, messages) {
  const { CHAPTER_META } = ctx.chapters;
  const sourceMeta = ctx.sources.SOURCE_META;
  const groups = messages.en.ui.chapter.groups;
  const problems = [];

  for (const meta of CHAPTER_META) {
    const words = messages.en.chapters[meta.slug];

    if (!words) {
      problems.push(`structure: ${meta.slug} has no messages`);
      continue;
    }

    problems.push(...cardProblems(meta.slug, meta, words, sourceMeta));

    const bandCards = numberedCount(words.programsBand?.cards);

    if (meta.programsBandLinks && meta.programsBandLinks.length !== bandCards) {
      problems.push(`structure: ${meta.slug} programsBandLinks ${meta.programsBandLinks.length} ≠ band cards ${bandCards}`);
    }
    if (meta.programsBandCards && meta.programsBandCards.length !== bandCards) {
      problems.push(`structure: ${meta.slug} programsBandCards ${meta.programsBandCards.length} ≠ band cards ${bandCards}`);
    }
    if (meta.startHere) {
      if (meta.startHere.groups.length !== 2) problems.push(`structure: ${meta.slug} startHere needs two groups`);
      meta.startHere.groups
        .filter((g) => !(g in groups))
        .forEach((g) => problems.push(`structure: ${meta.slug} startHere group '${g}' is not in ui.chapter.groups`));
    }

    /* Safety: one red-flag block; every other chapter signposts it. */
    if (meta.slug === ctx.site.SLEEP_SITE.anchors.redFlags.chapter) {
      if (!words.urgent?.tiers) problems.push(`safety: ${meta.slug} has no urgent.tiers`);
      for (const tier of meta.urgentTiers ?? []) {
        const signs = numberedCount(words.urgent?.tiers?.[tier.key]?.signs);

        if (signs !== tier.signs.length) problems.push(`structure: urgent tier ${tier.key} signs ${tier.signs.length} ≠ messages ${signs}`);
        tier.signs.forEach((sign, i) => {
          if (!sign.sources.length) problems.push(`sources: urgent tier ${tier.key} sign ${i + 1} has no source`);
          if (sign.sources.every((id) => sourceMeta[id]?.scope && sourceMeta[id].scope !== 'canadian')) {
            problems.push(`sources: urgent tier ${tier.key} sign ${i + 1} rests only on non-Canadian sources`);
          }
        });
      }
    } else if (meta.urgentExit?.chapter !== 'staying-safe') {
      problems.push(`safety: ${meta.slug} does not signpost staying-safe#red-flags (urgentExit)`);
    }

    /* Safety: an urgentContent card keeps every figure on /fr in production. */
    meta.categories.forEach((card, i) =>
      (card.figures ?? []).forEach((figure) => {
        if (
          card.urgentContent &&
          !ctx.gates.keepsFigure(figure, card, 'fr', ctx.gates.awaitsFrReview)
        ) {
          problems.push(`safety: ${meta.slug} card ${i + 1} (urgent) loses ${figure.kind} on /fr`);
        }
      }),
    );
  }

  return problems;
}

function holdProblems(ctx, messages) {
  const problems = [
    ...heldClientProblems({
      chapterMeta: ctx.chapters.CHAPTER_META,
      heldClientMessages: ctx.held.HELD_CLIENT_MESSAGES,
      messages,
      ns: NS,
    }),
  ];
  const paths = [
    ...ctx.held.HELD_CARD_PATHS.flatMap((g) => g.paths),
    ...ctx.landing.LANDING_GATED_COPY.flatMap((g) => g.paths),
  ];

  for (const path of paths) {
    for (const locale of ['en', 'fr']) {
      if (valueAt(messages[locale], path.slice(NS.length + 1)) === undefined) {
        problems.push(`holds: '${path}' is not in ${locale}.json`);
      }
    }
  }

  const heldCards = new Map(
    ctx.chapters.CHAPTER_META.flatMap((meta) =>
      meta.categories.flatMap((card, i) =>
        card.held !== undefined ? [[`${meta.slug}#${i + 1}`, card.held]] : [],
      ),
    ),
  );
  const heldGroups = new Map(ctx.held.HELD_CARD_PATHS.map((g) => [g.hold, g.paths]));

  /*
   * A path entry may point at a held card only when its reason, paired by
   * number, is held under the same hold: the engine leaves the entry out
   * while the card is held, and the reason never reaches the browser.
   */
  for (const path of ctx.paths.PATH_META) {
    path.entries.forEach((e, i) => {
      const hold = heldCards.get(`${e.chapter}#${e.card}`);
      const reason = `${NS}.paths.${path.slug}.list.reasons.${i + 1}`;

      if (hold !== undefined && !(heldGroups.get(hold) ?? []).includes(reason)) {
        problems.push(`holds: path ${path.slug} points at held card ${e.chapter} ${e.card} without holding ${reason} under '${hold}'`);
      }
    });
  }

  return problems;
}

function wordProblems(messages, ctx) {
  const problems = [];

  for (const locale of ['en', 'fr']) {
    for (const p of leafPaths(messages[locale])) {
      const v = valueAt(messages[locale], p);

      FORBIDDEN.forEach(([re, why]) => {
        if (re.test(v)) problems.push(`words: ${locale} ${p}: ${why}`);
      });
    }
  }

  const hrefs = JSON.stringify([ctx.chapters.CHAPTER_META, ctx.paths.PATH_META]).match(/https?:\/\/[^"]+/g) ?? [];

  hrefs.forEach((href) =>
    FORBIDDEN.forEach(([re, why]) => {
      if (re.test(href)) problems.push(`words: meta href ${href}: ${why}`);
    }),
  );

  return problems;
}

function pathProblems(ctx, messages) {
  const problems = [];
  const chapters = new Map(ctx.chapters.CHAPTER_META.map((m) => [m.slug, m.categories.length]));
  const heldReasons = ctx.held.HELD_CARD_PATHS.flatMap((g) => g.paths).filter((p) =>
    p.includes('.paths.'),
  );

  for (const meta of ctx.paths.PATH_META) {
    const words = messages.en.paths?.[meta.slug];

    if (!words) {
      problems.push(`paths: ${meta.slug} has no messages`);
      continue;
    }

    meta.entries.forEach((e) => {
      if (!chapters.has(e.chapter) || e.card < 1 || e.card > chapters.get(e.chapter)) {
        problems.push(`paths: ${meta.slug} entry ${e.chapter} card ${e.card} does not exist`);
      }
    });

    /* Reasons pair with entries by number: entry n is `list.reasons.<n>`, held or not. */
    const reasons = numberedCount(words.list?.reasons);

    if (reasons !== meta.entries.length) {
      problems.push(`paths: ${meta.slug} has ${reasons} reasons for ${meta.entries.length} entries`);
    }

    heldReasons
      .filter((p) => p.includes(`.paths.${meta.slug}.list.reasons.`))
      .forEach((p) => {
        const n = Number(p.split('.').pop());
        const entry = meta.entries[n - 1];

        if (!entry) problems.push(`paths: held reason ${p} has no entry ${n}`);
      });
    if (meta.introSources.length !== numberedCount(words.intro?.body)) {
      problems.push(`paths: ${meta.slug} introSources ${meta.introSources.length} ≠ intro.body ${numberedCount(words.intro?.body)}`);
    }
  }

  return problems;
}

function landingProblems(ctx, messages) {
  const problems = [];
  const { SITUATION_DOORS, THERAPY_CHIPS, FAQ_META, TRUST_ITEMS } = ctx.landing;
  const chapters = new Map(ctx.chapters.CHAPTER_META.map((m) => [m.slug, m.categories.length]));
  const sourceMeta = ctx.sources.SOURCE_META;
  const landing = messages.en.ui.landingPage;
  const placeOk = (chapter, anchor) => {
    if (!chapters.has(chapter)) return false;
    if (anchor?.includes('?')) return false;

    const card = anchor?.match(/^card-(\d+)$/);

    return !card || Number(card[1]) <= chapters.get(chapter);
  };

  SITUATION_DOORS.forEach((door) => {
    if (door.chapter && !placeOk(door.chapter, door.anchor)) problems.push(`landing: door ${door.id} target does not exist`);
    if (door.secondary && !placeOk(door.secondary.chapter, door.secondary.anchor)) problems.push(`landing: door ${door.id} secondary target does not exist`);
    if (door.urgent && door.requires) problems.push(`safety: the urgent door must never wait (requires '${door.requires}')`);
    (door.sources ?? []).filter((id) => !sourceMeta[id]).forEach((id) => problems.push(`landing: door ${door.id} cites unknown '${id}'`));
  });

  THERAPY_CHIPS.forEach((chip) => {
    if (chip.card && !placeOk(chip.card.chapter, chip.card.anchor)) problems.push(`landing: chip ${chip.id} target does not exist`);
    if (chip.path && !ctx.paths.PATH_META.some((p) => p.slug === chip.path)) problems.push(`landing: chip ${chip.id} path does not exist`);
  });

  FAQ_META.forEach((faq, i) => {
    (faq.links ?? []).forEach((to) => {
      if ('chapter' in to && !placeOk(to.chapter, to.anchor)) problems.push(`landing: FAQ ${i + 1} link target does not exist`);
      if ('source' in to && !sourceMeta[to.source]) problems.push(`landing: FAQ ${i + 1} link cites unknown '${to.source}'`);
    });

    const a = landing.faq.items[String(i + 1)]?.a ?? '';

    if (linkTags(a) / 2 !== (faq.links ?? []).length) problems.push(`landing: FAQ ${i + 1} has ${linkTags(a) / 2} links in its answer, ${(faq.links ?? []).length} in its meta`);
  });

  if (TRUST_ITEMS.length !== numberedCount(landing.trust.items)) {
    problems.push(`landing: TRUST_ITEMS ${TRUST_ITEMS.length} ≠ trust.items ${numberedCount(landing.trust.items)}`);
  }

  return problems;
}

function fundingProblems(ctx, messages) {
  const problems = [];
  const programs = messages.en.funding?.programs ?? {};
  const sourceMeta = ctx.sources.SOURCE_META;

  for (const program of ctx.funding.PROGRAM_META) {
    const words = programs[program.id];

    if (!words) {
      problems.push(`funding: ${program.id} has no messages`);
      continue;
    }

    Object.entries(program.has ?? {}).forEach(([key, has]) => {
      if (Boolean(has) !== (key in words)) problems.push(`funding: ${program.id}.${key}: has=${has} but the message ${key in words ? 'exists' : 'is missing'}`);
    });

    (program.sources ?? []).filter((id) => !sourceMeta[id]).forEach((id) => problems.push(`funding: ${program.id} cites unknown '${id}'`));
  }

  Object.keys(programs)
    .filter((id) => !ctx.funding.PROGRAM_META.some((p) => p.id === id))
    .forEach((id) => problems.push(`funding: messages have program '${id}' with no meta`));

  return problems;
}

/*
 * The site's own figures (chapters/site-figures.tsx): every word key a figure
 * reads exists on its card, every source it names is registered, and a figure
 * that restyles its card (it carries the card's sentences, so the plain list
 * is not repeated) carries every one of them.
 */
const has = (node, key) => typeof node?.[key] === 'string' && node[key] !== '';

const FIGURE_WORDS = {
  signsChecklist: (figure, words, message) => [
    ...(message.sections?.[String(figure.section)] ? [] : [`section ${figure.section} does not exist`]),
    ...(numberedCount(words?.questions) === figure.questions ? [] : [`questions ${figure.questions} ≠ figure.questions ${numberedCount(words?.questions)}`]),
    ...['legend', 'printHeading'].filter((k) => !has(words, k)).map((k) => `figure.${k} is missing`),
  ],
  ahiScale: (figure, words) =>
    figure.zones.filter((zone) => !has(words?.scale?.zones, zone.key)).map((zone) => `figure.scale.zones.${zone.key} is missing`),
  licenceClasses: (figure, words) => [
    ...figure.tabs.filter((tab) => !has(words?.tabs?.[tab.key], 'label')).map((tab) => `figure.tabs.${tab.key}.label is missing`),
    ...['measureNote', 'decides'].filter((k) => !has(words, k)).map((k) => `figure.${k} is missing`),
  ],
  followUpTimeline: (figure, words) =>
    figure.steps.filter((step) => !has(words?.steps, String(step.label))).map((step) => `figure.steps.${step.label} is missing`),
  maskPicker: (figure, words) => [
    ...(numberedCount(words?.questions) === figure.questions.length ? [] : [`questions ${figure.questions.length} ≠ figure.questions ${numberedCount(words?.questions)}`]),
    ...figure.questions.filter((q) => !has(words?.reasons, String(q.id))).map((q) => `figure.reasons.${q.id} is missing`),
    ...figure.types.filter((type) => !has(words?.types?.[type], 'label')).map((type) => `figure.types.${type}.label is missing`),
    ...['bilevelNote', 'magnetNote', 'privacy', 'statusNone', 'statusOne', 'statusMany'].filter((k) => !has(words, k)).map((k) => `figure.${k} is missing`),
  ],
  usageExplainer: (figure, words) => [
    ...figure.rows.flatMap((row) => ['label', 'value', 'foot'].filter((k) => !has(words?.rows?.[row.id], k)).map((k) => `figure.rows.${row.id}.${k} is missing`)),
    ...(has(words, 'always') ? [] : ['figure.always is missing']),
  ],
  troubleshootFinder: (figure, words) => [
    ...figure.problems.filter((p) => !has(words?.chips, String(p.id))).map((p) => `figure.chips.${p.id} is missing`),
    ...(has(words, 'always') ? [] : ['figure.always is missing']),
  ],
  resupplyPlanner: (figure, words) => [
    ...figure.rows.filter((part) => !has(words?.rows, part)).map((part) => `figure.rows.${part} is missing`),
    ...figure.columns.flatMap((col) => ['label', 'kind'].filter((k) => !has(words?.schedules?.[col], k)).map((k) => `figure.schedules.${col}.${k} is missing`)),
    ...figure.columns
      .filter((col) => col !== 'manual')
      .flatMap((col) => figure.rows.filter((part) => !has(words?.cells?.[col], part)).map((part) => `figure.cells.${col}.${part} is missing`)),
    /* 05 G.1 rules counts whose 12 ÷ count is whole, or under a month; any other is the nurse's call. */
    ...Object.entries(figure.perYear).flatMap(([col, parts]) =>
      Object.entries(parts ?? {})
        .filter(([, n]) => 12 / n >= 1 && !Number.isInteger(12 / n))
        .map(([part, n]) => `BLOCKER perYear ${col}.${part} = ${n}: 12 ÷ ${n} is not a whole number of months (05 G.1)`),
    ),
  ],
  tripList: () => [],
};

/* The card sentences a restyling figure carries: every one of them must be on it. */
function carriedItems(figure, message) {
  switch (figure.kind) {
    case 'licenceClasses':
      return figure.tabs.flatMap((tab) => tab.items);
    case 'followUpTimeline':
      return figure.steps.map((step) => step.item);
    case 'troubleshootFinder':
      return figure.problems.map((p) => p.id);
    case 'tripList':
      return [...figure.lead, ...figure.items];
    case 'signsChecklist':
      return Object.keys(message.items ?? {}).map(Number);
    default:
      return undefined;
  }
}

function siteFigureProblems(ctx, messages) {
  const problems = [];
  const sourceMeta = ctx.sources.SOURCE_META;
  const restyle = new Set(ctx.site.SLEEP_SITE.kinds.restyle ?? []);

  for (const meta of ctx.chapters.CHAPTER_META) {
    meta.categories.forEach((card, index) => {
      const n = index + 1;

      (card.figures ?? [])
        .filter((figure) => figure.kind in FIGURE_WORDS)
        .forEach((figure) => {
          const where = `figures: ${meta.slug} card ${n} ${figure.kind}`;

          for (const locale of ['en', 'fr']) {
            const message = messages[locale].chapters?.[meta.slug]?.categories?.[String(n)] ?? {};

            FIGURE_WORDS[figure.kind](figure, message.figure, message).forEach((p) =>
              problems.push(`${where} (${locale}): ${p}`),
            );
          }

          [...new Set(collectIds(figure))]
            .filter((id) => !sourceMeta[id])
            .forEach((id) => problems.push(`${where}: cites unknown source '${id}'`));

          if (restyle.has(figure.kind)) {
            const items = Object.keys(messages.en.chapters?.[meta.slug]?.categories?.[String(n)]?.items ?? {}).map(Number);
            const carried = new Set(carriedItems(figure, messages.en.chapters[meta.slug].categories[String(n)]) ?? items);

            items
              .filter((item) => !carried.has(item))
              .forEach((item) => problems.push(`${where} restyles the card but does not carry item ${item}`));
          }
        });
    });
  }

  return problems;
}

/* Every register id a structure names under a `sources`, `columnSources` or `source` key. */
function collectIds(node) {
  if (Array.isArray(node)) return node.flatMap(collectIds);
  if (!isRecord(node)) return [];

  return Object.entries(node).flatMap(([key, value]) => {
    if (key === 'sources' && Array.isArray(value)) return value;
    if (key === 'source' && typeof value === 'string') return [value];
    if (key === 'columnSources' && isRecord(value)) return Object.values(value).flat();

    return collectIds(value);
  });
}

/* The machine guide: every card has its words, every cited source is registered, nothing is sold. */
function guideProblems(ctx, messages) {
  const problems = [];
  const sourceMeta = ctx.sources.SOURCE_META;
  const { MACHINE_GUIDE, CHART_A, CHART_B } = ctx.guide;

  for (const locale of ['en', 'fr']) {
    const guide = messages[locale].machineGuide ?? {};

    MACHINE_GUIDE.cards.forEach((card) => {
      if (!guide.cards?.[card.key]?.title) problems.push(`guide: ${locale} card ${card.key} has no words`);
      (card.links ?? [])
        .filter((link) => !guide.cards?.[card.key]?.links?.[link.key])
        .forEach((link) => problems.push(`guide: ${locale} card ${card.key} link '${link.key}' has no words`));
    });
    ['title', 'notSold', 'intro'].filter((k) => !guide[k]).forEach((k) => problems.push(`guide: ${locale} machineGuide.${k} is missing`));
  }

  [...new Set(collectIds([MACHINE_GUIDE, CHART_A, CHART_B]))]
    .filter((id) => !sourceMeta[id])
    .forEach((id) => problems.push(`guide: cites unknown source '${id}'`));

  [...CHART_A, ...CHART_B].forEach((row) =>
    Object.values(row)
      .filter(isRecord)
      .forEach((cell) => {
        if (!cell.sources?.length) problems.push(`guide: ${row.id} has a cell with no source`);
        (cell.links ?? [])
          .filter((link) => !String(cell.text).includes(link.text))
          .forEach((link) => problems.push(`guide: ${row.id} links '${link.text}', which its cell does not say`));
        FORBIDDEN.forEach(([re, why]) => {
          if (re.test(cell.text)) problems.push(`guide: ${row.id} cell: ${why}`);
        });
      }),
  );

  /* "Not sold by Liivv": the guide links no product, price or cart (N1). */
  if (/\/(?:cart|checkout)\b|\$\s?\d/.test(JSON.stringify([MACHINE_GUIDE, CHART_A, CHART_B]))) {
    problems.push('guide: the record names a price, cart or checkout');
  }

  return problems;
}

/* The plan's shop rules, run on the real record (chapters/chapter-shop.ts shelfRuleProblems). */
function shopProblems(ctx) {
  const masks = readFileSync(join(CORE, 'lib', 'catalog', 'cpap-masks.ts'), 'utf8');
  const block = masks.slice(masks.indexOf('RX_MASK_IDS'), masks.indexOf('};', masks.indexOf('RX_MASK_IDS')));
  const rxMasks = new Map([...block.matchAll(/^\s*(\d+): '(adult|paediatric)'/gm)].map((m) => [Number(m[1]), m[2]]));
  const urgent = (chapter, card) =>
    ctx.chapters.CHAPTER_META.find((m) => m.slug === chapter)?.categories[card - 1]?.urgentContent === true;

  if (!rxMasks.size) return ['shop: could not read RX_MASK_IDS from lib/catalog/cpap-masks.ts'];

  return ctx.shop.shelfRuleProblems({
    isMachine: ctx.devices.isPapDeviceId,
    isPaediatricMask: (id) => rxMasks.get(id) === 'paediatric' || ctx.ids.PAEDIATRIC_MASK_IDS.includes(id),
    isCompleteMask: (id) => rxMasks.has(id),
    isUrgentCard: urgent,
  });
}

/* ------------------------------------------------------------- documents */

function reviewerSections(out, data, w) {
  if (data.openRulings?.length) {
    out('', '## Open rulings (each ships its default until ruled)', '');
    data.openRulings.forEach((r) => {
      out(`- **${r.id}** — default: ${r.default}`);
      if (r.alternative) out(`  - Alternative: ${r.alternative}`);
      if (r.where?.length) out(`  - Where: ${r.where.map(ref).join(', ')}`);
    });
  }

  if (data.prePublishChecks?.length) {
    out('', '## Checks before publishing', '');
    data.prePublishChecks.forEach((c) => out(`- ${c}`));
  }

  if (data.heldCopy?.items?.length) {
    out('', '## Held copy (not in the message files; ships only once released)', '');
    if (data.heldCopy.released) out(`*${data.heldCopy.released}*`, '');
    data.heldCopy.items.forEach((item) => {
      out(`- **${item.topic}**${item.cards?.length ? ` (cards ${item.cards.join(', ')})` : ''} — ${item.why}`);
      if (item.wording) out(`  - Wording: ${item.wording}`);
      if (item.check) out(`  - Check: ${item.check}`);
    });
  }

  return w;
}

function chapterDoc(ctx, meta, index, w, cite, locale) {
  const out = (...l) => w.push(...l);
  const base = `${NS}.chapters.${meta.slug}`;
  const words = valueAt(ctx.messages[locale], `chapters.${meta.slug}`) ?? {};

  out(`# ${pad(index + 1)} · ${words.title ?? meta.slug}`, '', stamp(), '');
  out(`- ${w.text(`chapters.${meta.slug}.title`)} ${ref('title')}`);

  for (const key of ['heroBody', 'focus', 'vibe']) out(`- ${w.text(`chapters.${meta.slug}.${key}`)} ${ref(key)}`);

  for (const key of ['categoriesIntro', 'startHere']) {
    if (words[key]) emitTree(w, out, words[key], `chapters.${meta.slug}.${key}`, key);
  }

  if (words.urgent) {
    out('', '## The red-flag block (never gated, every locale)', '');
    out(`- ${w.text(`chapters.${meta.slug}.urgent.heading`)} ${ref('urgent.heading')}`);
    out(`- ${w.text(`chapters.${meta.slug}.urgent.intro`)} ${ref('urgent.intro')}`);
    for (const tier of meta.urgentTiers ?? []) {
      const at = `chapters.${meta.slug}.urgent.tiers.${tier.key}`;

      out('', `### Tier \`${tier.key}\``, '');
      out(`- ${w.text(`${at}.label`)} ${ref(`${tier.key}.label`)}`);
      if (valueAt(ctx.messages[locale], `${at}.lead`)) out(`- ${w.text(`${at}.lead`)} ${ref(`${tier.key}.lead`)}`);
      if (tier.sources?.length) out(`  - Sources: ${cite.titles(tier.sources, locale)}`);
      tier.signs.forEach((sign, i) => {
        out(`- ${w.text(`${at}.signs.${i + 1}`)} ${ref(`${tier.key}.signs.${i + 1}`)}`);
        out(`  - Sources: ${cite.titles(sign.sources, locale)}`);
      });
    }
    if (words.urgent.note) out(`- ${w.text(`chapters.${meta.slug}.urgent.note`)} ${ref('urgent.note')}`);
  }

  meta.categories.forEach((card, i) => {
    const n = i + 1;
    const at = `chapters.${meta.slug}.categories.${n}`;
    const message = valueAt(ctx.messages[locale], at);

    out('', `## Card ${n}${card.held ? ` — HELD (\`${card.held}\`${card.heldNote ? ': title and held note only' : ''})` : ''}`, '');
    out(`*Group \`${card.group ?? '—'}\` · ask \`${card.ask ?? '—'}\`${card.urgentContent ? ' · urgent: pinned open, figures kept in every locale' : ''}${(card.figures ?? []).length ? ` · figures: ${card.figures.map((f) => `\`${f.kind}\``).join(', ')}` : ''}*`, '');
    if (message) emitTree(w, out, message, at, `card ${n}`);
    const ids = card.heldNote ? card.heldNote.sources : [...(card.sources ?? [])];
    if (ids.length) out(`- Sources: ${cite.titles(ids, locale)}`);
  });

  for (const key of ['programsBand', 'closing', 'governance', 'urgentExit']) {
    if (words[key]) {
      out('', `## ${key}`, '');
      emitTree(w, out, words[key], `chapters.${meta.slug}.${key}`, key);
    }
  }

  if (meta.bandSources?.length) out(`- Band sources: ${cite.titles(meta.bandSources, locale)}`);

  reviewerSections(out, ctx.pages[meta.slug] ?? {}, w);
  out('', ...cite.table(locale));

  return base;
}

function subtreeDoc(ctx, w, title, roots, page, locale, cite, heldPaths) {
  const out = (...l) => w.push(...l);

  out(`# ${title}`, '', stamp(), '');
  for (const root of roots) {
    const node = valueAt(ctx.messages[locale], root);

    if (!node) continue;
    out('', `## \`${root}\``, '');
    if (typeof node === 'string') out(`- ${w.text(root)} ${ref(root)}`);
    else emitTree(w, out, node, root, root);
  }

  const held = heldPaths.filter((p) => roots.some((r) => p.startsWith(`${NS}.${r}`)));

  if (held.length) {
    out('', '## Held in the message files (not sent to a browser until released)', '');
    held.forEach((p) => out(`- ${ref(p)}`));
  }

  reviewerSections(out, ctx.pages[page] ?? {}, w);
  out('', ...cite.table(locale));
}

function registerChecks() {
  const text = readFileSync(SOURCES_MD, 'utf8');
  const at = text.indexOf('## Checks this register needs');

  return at < 0
    ? []
    : text
        .slice(at)
        .split('\n')
        .filter((l) => l.startsWith('- '))
        .map((l) => l.slice(2));
}

function buildDocs(ctx, makeWriter, cite, locale) {
  const files = [];
  const heldPaths = [
    ...ctx.held.HELD_CARD_PATHS.flatMap((g) => g.paths),
    ...ctx.landing.LANDING_GATED_COPY.flatMap((g) => g.paths),
  ];
  const add = (name, build) => {
    const w = makeWriter(locale);

    cite.reset();
    build(w);
    files.push({ name, content: finish(w.lines.join('\n')), w });
  };

  add('00-shared.md', (w) => {
    const shared = { ...ctx.pages.shared, prePublishChecks: [...(ctx.pages.shared?.prePublishChecks ?? []), ...registerChecks()] };

    subtreeDoc({ ...ctx, pages: { ...ctx.pages, shared } }, w, 'Shared words (engine chrome, governance, discovery, commerce, checklist controls)', ['ui.chapter', 'ui.governance', 'ui.discovery', 'ui.commerce', 'ui.signsChecklist'], 'shared', locale, cite, heldPaths);
  });

  ctx.chapters.CHAPTER_META.forEach((meta, i) =>
    add(`${pad(i + 1)}-${meta.slug}.md`, (w) => chapterDoc(ctx, meta, i, w, cite, locale)),
  );

  add('07-landing.md', (w) => subtreeDoc(ctx, w, 'Landing', ['ui.landingPage'], 'landing', locale, cite, heldPaths));
  add('08-funding.md', (w) => subtreeDoc(ctx, w, 'Funding & Coverage', ['ui.fundingPage', 'ui.fundingChecker', 'ui.fundingResults', 'funding'], 'funding', locale, cite, heldPaths));
  add('09-paths.md', (w) => subtreeDoc(ctx, w, 'Path pages', ['ui.path', 'paths'], 'paths', locale, cite, heldPaths));
  add('10-machine-guide.md', (w) => subtreeDoc(ctx, w, 'Machine guide', ['machineGuide'], 'machine-guide', locale, cite, heldPaths));

  return files;
}

function readme(files, locale) {
  return finish(
    [
      `# Sleep Apnea Care — content review (${locale === 'en' ? 'English' : 'French'})`,
      '',
      stamp(),
      '',
      'Every string under `SleepApneaCare` in the message files, with its reference, the sources each card rests on, the open rulings (each ships its default until ruled), the checks before publishing and the copy held out of the message files.',
      '',
      locale === 'fr'
        ? `Every French string is a machine translation awaiting review (${FR_REVIEW_MARK}).`
        : 'The section is linked from the hub and the header since the soft launch of 2026-10-21 (SLEEP_APNEA_CARE_LISTED), but it stays noindex and out of the sitemap until the owner flips SLEEP_APNEA_CARE_LIVE.',
      '',
      ...files.map((f) => `- [${f.name}](./${f.name})`),
    ].join('\n'),
  );
}

export async function exportSleepApneaCare({ check }) {
  const ctx = await load();
  const messages = loadMessages(NS);

  ctx.messages = messages;

  const baseline = existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, 'utf8')) : {};
  const seen = { en: new Set(), fr: new Set() };
  const makeWriter = writerFactory({
    messages,
    seen,
    reReviewsPending: reReviewsPending(baseline, messages.en, {}),
    awaitsFrenchReview: (path) => FR_AWAITING_REVIEW_PREFIXES.some((p) => path.startsWith(p)),
  });
  const cite = sourceCiter({ sourceMeta: ctx.sources.SOURCE_META, sourceReview: ctx.review.SOURCE_REVIEW });
  const stale = staleTracker();
  const problems = [
    ...parityProblems(messages),
    ...contractProblems(messages),
    ...chapterProblems(ctx, messages),
    ...sourceProblems({
      sourceMeta: ctx.sources.SOURCE_META,
      sourceReview: ctx.review.SOURCE_REVIEW,
      chapterMeta: ctx.chapters.CHAPTER_META,
    }),
    ...holdProblems(ctx, messages),
    ...wordProblems(messages, ctx),
    ...pathProblems(ctx, messages),
    ...landingProblems(ctx, messages),
    ...fundingProblems(ctx, messages),
    ...siteFigureProblems(ctx, messages),
    ...guideProblems(ctx, messages),
    ...shopProblems(ctx),
  ];

  for (const locale of ['en', 'fr']) {
    const files = buildDocs(ctx, makeWriter, cite, locale);
    const dir = join(OUT, locale);

    files.push({ name: 'README.md', content: readme(files, locale) });

    for (const file of files) {
      const path = join(dir, file.name);

      stale.compare(path, file.content);

      if (!check) {
        mkdirSync(dir, { recursive: true });
        writeFileSync(path, file.content);
      }
    }
  }

  const missing = leafPaths(messages.en).filter((p) => !seen.en.has(p));

  missing.forEach((p) => problems.push(`coverage: en ${p} was not emitted`));

  if (!check && !existsSync(BASELINE)) {
    const flat = Object.fromEntries(leafPaths(messages.en).map((p) => [p, valueAt(messages.en, p)]));

    writeFileSync(BASELINE, `${JSON.stringify(flat, null, 2)}\n`);
    console.log(`wrote ${BASELINE.slice(CORE.length + 1)}`);
  }

  console.log(
    `${check ? 'checked' : 'wrote'} the Sleep Apnea Care pack: ${leafPaths(messages.en).length} strings, ${ctx.chapters.CHAPTER_META.length} chapters`,
  );

  if (check && stale.stale.length) {
    console.log(`\n${stale.stale.length} file(s) in docs/content-review/sleep-apnea-care no longer match (rebuild the pack at the end of the branch).`);
  }

  if (problems.length) {
    console.log(`\nSLEEP APNEA CARE CHECKS FAILED (${problems.length}):`);
    problems.forEach((p) => console.log(`  ${p}`));
    process.exitCode = 1;
  }
}
