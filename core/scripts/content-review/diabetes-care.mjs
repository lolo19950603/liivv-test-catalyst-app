/**
 * The Diabetes Care pass of the content-review export.
 *
 * Run through export-content-review.mjs, which calls exportDiabetesCare() after
 * the Ostomy pass (or on its own, with --site=diabetes-care):
 *   node --env-file-if-exists=.env.local core/scripts/export-content-review.mjs --site=diabetes-care
 *
 * Writes docs/content-review/diabetes-care/README.md plus one file per page,
 * per locale, under docs/content-review/diabetes-care/en and /fr — the Ostomy
 * pack's layout, in a folder of its own, so the two sites' chapter files can
 * never collide.
 *
 * Every page under /liivv-health/diabetes-care has its copy in the
 * DiabetesCare namespace of the message files, and every one is here: the
 * chapters the shared engine serves (diabetes-care/chapters/chapters-meta.ts),
 * the landing page (diabetes-care/landing-meta.ts), the Funding & Coverage
 * page and the five path pages (diabetes-care/chapters/paths-meta.ts). Their
 * open questions and held wording live in ./diabetes-care.<page>.mjs.
 *
 * The rules are Ostomy's. Every DiabetesCare string must appear in the pack
 * (or be listed below as structural, with the reason), or the run fails; the
 * structure is checked against the messages it is index-matched to; every
 * source a card cites must be in the register; the two message files must
 * carry the same strings; and the start-here map has exactly two sides.
 *
 * What the nurse still has to rule on is printed on the chapter it concerns,
 * under "Questions for the nurse", with what the copy holds back for want of a
 * source. Both lists are reviewer-only. Staying Safe's live here, as Ostomy's
 * open decisions do; a later chapter's live in a data file of its own beside
 * this one (diabetes-care.<slug>.mjs), merged in below. Every place a ruling
 * names is checked against the messages, so a ruling cannot point at a line
 * that has gone.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/* Reviewer-only rulings, checks and held wording, one data file per later chapter. */
import { EVERY_DAY_LIVING } from './diabetes-care.every-day-living.mjs';
import { FUNDING } from './diabetes-care.funding.mjs';
import { KNOW_YOUR_TYPE } from './diabetes-care.know-your-type.mjs';
import { LANDING } from './diabetes-care.landing.mjs';
import { NEW_TO_THE_JOURNEY } from './diabetes-care.new-to-the-journey.mjs';
import { PATHS } from './diabetes-care.paths.mjs';
import { THIS_MIGHT_BE_YOU } from './diabetes-care.this-might-be-you.mjs';
import { YOUR_TOOLS } from './diabetes-care.your-tools.mjs';
import {
  CORE,
  count,
  DOCS,
  emitTree,
  finish,
  FR_REVIEW_MARK,
  heldClientProblems,
  leafPaths,
  LIIVV_HEALTH,
  loadMessages,
  loadTs,
  nth,
  ordered,
  pad,
  RE_REVIEW_MARK,
  ref,
  reReviewsPending,
  sourceCiter,
  sourceProblems,
  sourceRefs,
  staleTracker,
  stamp,
  valueAt,
  writerFactory,
} from './lib.mjs';

const DC = join(LIIVV_HEALTH, 'diabetes-care');
const NS = 'DiabetesCare';
const OUT = join(DOCS, 'diabetes-care');
const ROUTE = '/liivv-health/diabetes-care/chapters/';
const BASELINE_FILE = 'content-review-baseline.diabetes-care.en.json';

/* The engine's own kind sets, so a module kind is read rather than restated. */
const { BASE_FIGURE_KINDS, BASE_MODULE_KINDS, BASE_WHOLE_CARD_KINDS } = await loadTs(
  join(LIIVV_HEALTH, '_microsite', 'chapters', 'kinds.ts'),
);
const { CHAPTER_META } = await loadTs(join(DC, 'chapters', 'chapters-meta.ts'));
const { PUBLISHERS, SOURCE_META } = await loadTs(join(DC, 'chapters', 'sources-meta.ts'));
/* Reviewer-only: publisher, type and the paraphrase of the passage cited. */
const { SOURCE_REVIEW } = await loadTs(join(DC, 'chapters', 'sources-review.ts'));
const { awaitsFrReview, figureGate, GATED_KINDS, keepsFigure } = await loadTs(
  join(DC, 'chapters', 'review-gates.ts'),
);
const { HELD_CLIENT_MESSAGES } = await loadTs(join(DC, 'chapters', 'held-messages.ts'));
/* Your Tools' devices: what pairs with what, and the facts its pickers print. */
const DEVICES = await loadTs(join(DC, 'chapters', 'device-pairings.ts'));
/* The merchandising record: which card, path and page shows which products (B21). */
const SHOP = await loadTs(join(DC, 'chapters', 'chapter-shop.ts'));
/*
 * The site config, for what the engine is told about this site's own kinds and
 * gates. It imports values (with the app's extensionless specifiers), which
 * lib.mjs resolves; nothing in it reads a browser global.
 */
const { DIABETES_SITE } = await loadTs(join(DC, 'chapters', 'site.ts'));
/* The landing page's structure, and how its linked phrases are read. */
const {
  BRANDS,
  FACT_BAND,
  FAQ_META,
  FR_HELD_COPY,
  heldLandingPaths,
  LANDING_GATED_COPY,
  LANDING_GATES,
  SHOP_ROOMS,
  SITUATION_DOORS,
  TRUST_ITEMS,
  TYPE_CHIPS,
  TYPE_CHIPS_CHAPTER,
  TYPES_SOURCES,
  URGENT_EXIT_CHAPTER,
} = await loadTs(join(DC, 'landing-meta.ts'));
const { linkCount, linkParts } = await loadTs(
  join(LIIVV_HEALTH, '_microsite', 'landing', 'links.ts'),
);
/* The Funding & Coverage page's structure: its programs, groups and the register entries behind its lines. */
const {
  AGE_BANDS: FUNDING_AGE_BANDS,
  CHANGES_ORDER: FUNDING_CHANGES_ORDER,
  DIABETES_TYPES: FUNDING_TYPES,
  DIRECT_BILLING: FUNDING_DIRECT_BILLING,
  FEDERAL_ROWS: FUNDING_FEDERAL_ROWS,
  HELD_PROGRAM_IDS: FUNDING_HELD_PROGRAM_IDS,
  NEXT_CHECK: FUNDING_NEXT_CHECK,
  OWNER_LINES: FUNDING_OWNER_LINES,
  PAGE_SOURCES: FUNDING_PAGE_SOURCES,
  PAY_LATER: FUNDING_PAY_LATER,
  PRIVATE_FIRST: FUNDING_PRIVATE_FIRST,
  PROGRAM_META: FUNDING_PROGRAMS,
  PROVINCE_CODES: FUNDING_PROVINCES,
  RECHECK_OWNER: FUNDING_RECHECK_OWNER,
  RESULT_GROUPS: FUNDING_RESULT_GROUPS,
  THERAPIES: FUNDING_THERAPIES,
} = await loadTs(join(DC, 'funding', 'funding-meta.ts'));
const FUNDING_OPTIONS = { type: FUNDING_TYPES, therapy: FUNDING_THERAPIES, age: FUNDING_AGE_BANDS };
/* The chapter whose approved urgentExit pair the funding page carries, as the landing does. */
const FUNDING_EXIT_CHAPTER = URGENT_EXIT_CHAPTER;
/* The five path pages: their reading lists, the sources behind them, and what they hold back. */
const { heldPathPaths, PATH_DISCLAIMER_CHAPTER, PATH_GATES, PATH_META } = await loadTs(
  join(DC, 'chapters', 'paths-meta.ts'),
);
const PATH_SLUGS = PATH_META.map((meta) => meta.slug);

/*
 * A card sentence may wrap the words of a link in `<link>…</link>` (CardLinkMeta
 * in _microsite/chapters/types.ts): tags around words already there, never new
 * words. The page shows the sentence without them, so the pack prints it the
 * same way and says beside the card where each link goes (cardLinkNotes).
 * `RAW_MESSAGES` keeps the tags, for that note and for the checks on it;
 * everything else, the English re-review baseline included, reads the
 * sentences without them, so adding a link is never mistaken for a wording
 * change.
 */
const LINK_TAGS = /<\/?link>/g;

function untaggedTree(node) {
  if (typeof node === 'string') return node.replace(LINK_TAGS, '');
  if (!node || typeof node !== 'object') return node;

  return Object.fromEntries(Object.entries(node).map(([key, value]) => [key, untaggedTree(value)]));
}

const RAW_MESSAGES = loadMessages(NS);
const MESSAGES = { en: untaggedTree(RAW_MESSAGES.en), fr: untaggedTree(RAW_MESSAGES.fr) };
const FEATURES = DIABETES_SITE.gates.features;
const SERVICE_TOPICS = DIABETES_SITE.serviceLaneTopics ?? [];

/*
 * Kinds that pin their card open: the engine's own (none of the generic kinds
 * is one) and this site's, from the config the engine is handed.
 */
const MODULE_KINDS = new Set([...BASE_MODULE_KINDS, ...(DIABETES_SITE.kinds?.module ?? [])]);
const NOTE_CARRYING_KINDS = new Set(DIABETES_SITE.kinds?.noteCarrying ?? []);
/* Kinds that draw the card's sections and note themselves (the clues checklist). */
const WHOLE_CARD_KINDS = new Set([
  ...(BASE_WHOLE_CARD_KINDS ?? []),
  ...(DIABETES_SITE.kinds?.wholeCard ?? []),
]);
const BASE_KINDS = new Set(BASE_FIGURE_KINDS);

/*
 * Site figures that keep their words under a key of their own inside the
 * card's `figure` messages, so a gate that drops one takes only that key off
 * /fr and leaves the rest of the card's figure words (a take-in card's fields)
 * where they are.
 */
const OWN_FIGURE_WORDS = { glucoseRange: 'ruler', familyTree: 'familyTree' };

/* ------------------------------------------------------------------------- */
/* What the nurse still has to rule on                                        */
/* ------------------------------------------------------------------------- */

/*
 * =============================================================================
 * THE COPY USES A DEFAULT; THE NURSE HAS NOT RULED
 * =============================================================================
 * Where the Canadian sources disagree, or a line needed a clinical judgement
 * the source check could not make, the copy went with a default and recorded
 * the alternative. These are those defaults, from the chapter's copy record
 * (section D, "Open rulings"). None of them is settled: each is a question for
 * the nurse, and the page shows the default until she answers.
 *
 * `where` is message paths under the chapter, printed as the pack's own
 * references. Each one is checked against en.json, so a ruling cannot keep
 * pointing at a line that has been cut or renumbered; an empty `where` is a
 * default that touches no line of the chapter (it is said elsewhere, or the
 * chapter leaves the topic out). When a ruling is made, the copy changes (or
 * stays) and the entry comes out. One the source check answered itself is
 * marked `settled` and printed for the record, apart from the open ones.
 * =============================================================================
 */
const OPEN_RULINGS = {
  'new-to-the-journey': NEW_TO_THE_JOURNEY.openRulings,
  'your-tools': YOUR_TOOLS.openRulings,
  'every-day-living': EVERY_DAY_LIVING.openRulings,
  'know-your-type': KNOW_YOUR_TYPE.openRulings,
  'this-might-be-you': THIS_MIGHT_BE_YOU.openRulings,
  'staying-safe': [],
};

/*
 * Factual checks to make before the chapter is published. Not clinical
 * rulings: each is a fact about a source that someone has to look up.
 */
const PRE_PUBLISH_CHECKS = {
  'new-to-the-journey': NEW_TO_THE_JOURNEY.prePublishChecks,
  'your-tools': YOUR_TOOLS.prePublishChecks,
  'every-day-living': EVERY_DAY_LIVING.prePublishChecks,
  'know-your-type': KNOW_YOUR_TYPE.prePublishChecks,
  'this-might-be-you': THIS_MIGHT_BE_YOU.prePublishChecks,
  'staying-safe': [
    'Glucagon forms in Canada (`3.2`): confirm against Health Canada’s Drug Product Database that nasal and injectable glucagon are marketed, and no auto-injector.',
    'CPS position statement (2015) on type 1 diabetes in school: confirm it has not been retired.',
    'DC "Alcohol and diabetes" PDF (04/18, reflects 2018 CPG): confirm it is still DC’s current sheet.',
    'DC Technology & Devices: re-read the backup line cited in `9.1` against the live page (the wording is recorded in the source check only; there is no saved copy).',
  ],
};

/*
 * =============================================================================
 * HELD FOR WANT OF A SOURCE
 * =============================================================================
 * Wording the chapter would carry if a source could be confirmed, or that is
 * out of scope until someone decides otherwise. None of it is in the message
 * files and none of it renders anywhere; it is here so the nurse can see what
 * was left out and why (the copy record's section E). `cards` are the cards
 * it would sit on, checked against the chapter.
 * =============================================================================
 */
const HELD_COPY = {
  'new-to-the-journey': NEW_TO_THE_JOURNEY.heldCopy,
  'your-tools': YOUR_TOOLS.heldCopy,
  'every-day-living': EVERY_DAY_LIVING.heldCopy,
  'know-your-type': KNOW_YOUR_TYPE.heldCopy,
  'this-might-be-you': THIS_MIGHT_BE_YOU.heldCopy,
  'staying-safe': {
    released:
      'Released after the source check, and now in the copy: nothing by mouth for someone who can’t swallow (das-glucagon); DKA symptoms and "ketones build up when there isn’t enough insulin" (bt1d-dka-and-ketones); fast sugar in the emergency kit (dc-managing-emergency-situations); medical ID in general (dc-exercise-and-activity + DC Alcohol PDF); checking glucagon’s expiry date (bt1d-what-is-glucagon). Released by the owner’s answers of 2026-10-06 (A2, B5, B9, B12): the CDE contact, the general phone line, email, hours and About page of Bayshore Express Pharmacy, in the CDE panel and the CDE lane (`ui.contact`).',
    items: [
      {
        topic: 'FIT: unexplained high on a pump',
        cards: [9],
        why: 'FIT is the only source and is industry-run (ruling C14, 2026-10-06: FIT-only lines stay held)',
        wording:
          '"A sudden high you can’t explain, especially with nausea or vomiting, needs action fast: DKA can develop quickly when a pump stops delivering insulin. Follow your team’s backup plan for giving insulin another way, and check your infusion set, tubing and reservoir"',
        check: 'A non-industry Canadian source (DC Technology & Devices, Breakthrough pump pages)',
      },
      {
        topic: 'FIT: no infusion-set change at bedtime',
        cards: [9],
        why: 'As above',
        wording:
          '"Try not to change your infusion set just before bed, so you can check it’s working"',
        check: 'As above',
      },
      {
        topic: 'FIT disclosure',
        cards: [9],
        why: 'Only needed if either FIT line is released',
        wording:
          '"The FIT guide is published on a website run by embecta, a company that makes pen needles and syringes. Your pump team’s plan comes first."',
        check: '—',
      },
      {
        topic: 'Sick-day medicine list (stays held: ruling C17, 2026-10-06)',
        cards: [8],
        why: 'Drug-class stop advice is out of scope; the pharmacist fills in the person’s list. Card 6 names SGLT2 inhibitors only, as a question for the pharmacist (C17)',
        wording:
          '"If you’re eating less for more than 24 hours, it lists medicines that make your body release more insulin. If you’re dehydrated for more than 24 hours, it also lists metformin, SGLT2 inhibitors, ACE inhibitors and ARBs, water pills (diuretics) and anti-inflammatory pain relievers (NSAIDs). It doesn’t list combination pills"',
        check: 'DC Stay Safe sheet (verified; held for scope, not source)',
      },
      {
        topic: 'Symptoms of a low (shaky, sweaty, etc.)',
        cards: [1],
        why: 'Not in the verified claims. The saved Diabetes@School page lists shakiness, sweating, hunger, confusion, irritability, blurry vision, weakness, dizziness, headache and pale skin, but it was not part of this check',
        wording: '"Signs of a low can include feeling shaky, sweaty, hungry or confused"',
        check: 'DC 02/24 hypo sheet; das-low-blood-sugar (re-check)',
      },
      {
        topic: 'Symptoms of a high (not DKA)',
        cards: [6],
        why: 'DC Hyperglycemia recorded only as "symptoms when fasting ≥11"',
        wording: 'A short list after `6.2`',
        check: 'DC Hyperglycemia',
      },
      {
        topic: 'HHS',
        cards: [6],
        why: 'No patient-facing Canadian source; CPG Ch15 is clinician-only',
        wording: 'None. Keep it out of patient copy unless the nurse wants a CPG-based line',
        check: '—',
      },
      {
        topic: 'Hypoglycemia unawareness',
        cards: [4],
        why: 'Only clinician driving rules mention it',
        wording: '"If you’ve stopped feeling your lows, tell your team"',
        check: 'CPG Ch14 2023 (re-check)',
      },
      {
        topic: 'Overnight lows in general',
        cards: [4],
        why: 'Only "check before bed after drinking" (and the Alcohol PDF’s night alarm) is sourced',
        wording: '—',
        check: 'CPG Ch10 (clinician-level)',
      },
      {
        topic: 'Urine strips expire 6 months after opening',
        cards: [7],
        why: 'Optional add from the source check, not applied (sourced: bt1d-dka-and-ketones)',
        wording:
          '"If you use urine strips, throw out a container that’s been open more than 6 months"',
        check: 'bt1d-dka-and-ketones (verified)',
      },
      {
        topic: 'Pump / sensor maker 24-hour lines',
        cards: [11],
        why: 'Manufacturer pages only (policy 4)',
        wording: '"Your pump or sensor maker: device faults, any time"',
        check: 'Each maker’s page, plus a neutral source',
      },
      {
        topic: 'Glucagon in the card 3 shop strip',
        cards: [3],
        why: 'Placed (B21, chapter-shop.ts) with the pharmacist notice, but Baqsimi’s product description still gives another retailer’s phone number, so the catalogue check leaves it out and the strip renders nothing (B3)',
        wording: '—',
        check: 'Operations: fix the Baqsimi description in the store',
      },
      {
        topic: 'Glucagon doses',
        cards: [3],
        why: 'Out of scope (no dosing). If ever added, use the sources exactly',
        wording: '—',
        check: 'CPG Ch14, DC 02/24 sheet, Ch41 (never one injectable dose for all ages)',
      },
    ],
  },
};

/* ------------------------------------------------------------------------- */
/* French review, and the re-review baseline                                  */
/* ------------------------------------------------------------------------- */

const seen = { en: new Set(), fr: new Set() };

/*
 * =============================================================================
 * EVERY WORD OF THIS FRENCH IS NEW, AND NOBODY HAS REVIEWED IT
 * =============================================================================
 * Ostomy flags French one key at a time, because most of its French had been
 * read by a francophone reviewer and only the new lines needed a mark. Nothing
 * in DiabetesCare has: it was machine translated with the English, and the
 * chapter route serves it on /fr as soon as it is in fr.json.
 *
 * So the whole namespace awaits review, and a line is marked ⚑ wherever /fr
 * shows it today. The lines a French review gate keeps off /fr in production
 * are left unmarked — the gate is what holds them, and each one says so where
 * it is printed. When a francophone reviewer signs a part off, add its prefix
 * to FR_REVIEWED_PREFIXES; a prefix that names nothing fails the checks.
 *
 * FR_AWAITING_REVIEW is for single keys, as on Ostomy: French rewritten later,
 * after a part has been signed off. It is empty until something is.
 * =============================================================================
 */
const FR_AWAITING_REVIEW = new Set([]);
const FR_AWAITING_REVIEW_PREFIXES = ['ui.', 'chapters.', 'funding.', 'paths.'];
const FR_REVIEWED_PREFIXES = [];

/*
 * The message paths production keeps off /fr, each with the gate that holds
 * it: the figure messages of a gated module, a module's own `ui.<kind>` labels
 * where every placement of it is gated, and the parts of the who-to-ask lanes
 * the `laneExtras` gate takes (link labels, the topic filter, and every lane
 * with no sentence of the card's own). Read from the gates, so it cannot drift.
 */
function frGatedPrefixes() {
  const gated = [];
  const kindPlacements = new Map();

  for (const meta of CHAPTER_META) {
    meta.categories.forEach((structure, index) => {
      const card = `chapters.${meta.slug}.categories.${index + 1}`;
      const figures = structure.figures ?? [];
      const dropped = figures.filter(
        (figure) => !keepsFigure(figure, structure, 'fr', awaitsFrReview),
      );

      figures.forEach((figure) => {
        const seenKind = kindPlacements.get(figure.kind) ?? { total: 0, dropped: 0 };

        kindPlacements.set(figure.kind, {
          total: seenKind.total + 1,
          dropped: seenKind.dropped + (dropped.includes(figure) ? 1 : 0),
        });
      });

      /* A card's figure messages are shared by its figures, so only an all-gated card counts. */
      if (figures.length && dropped.length === figures.length) {
        gated.push([`${card}.figure.`, figureGate(figures[0].kind)]);
      }

      /* Except for a site figure that keeps its words under a key of its own. */
      dropped
        .filter((figure) => Object.hasOwn(OWN_FIGURE_WORDS, figure.kind))
        .forEach((figure) =>
          gated.push([`${card}.figure.${OWN_FIGURE_WORDS[figure.kind]}.`, figureGate(figure.kind)]),
        );

      const lanes = figures.find((figure) => figure.kind === 'lanes');

      if (lanes && awaitsFrReview(FEATURES.laneExtras, 'fr')) {
        const gate = FEATURES.laneExtras;

        ['legend', 'topics.', 'fits', 'statusFitsOne', 'statusFitsMany', 'statusNone'].forEach(
          (key) => gated.push([`${card}.figure.${key}`, gate]),
        );
        lanes.lanes.forEach((lane, l) => {
          const at = `${card}.figure.lanes.${l + 1}.`;

          gated.push(lane.item === undefined ? [at, gate] : [`${at}linkLabel`, gate]);
        });
      }
    });

    if (meta.shelf && awaitsFrReview(FEATURES.shelf, 'fr')) {
      gated.push([`chapters.${meta.slug}.shelf.`, FEATURES.shelf]);
    }

    if (awaitsFrReview(FEATURES.bandLinks, 'fr')) {
      (meta.programsBandLinks ?? []).forEach((links, c) => {
        if (links.length) {
          gated.push([
            `chapters.${meta.slug}.programsBand.cards.${c + 1}.links.`,
            FEATURES.bandLinks,
          ]);
        }
      });
    }
  }

  for (const [kind, { total, dropped }] of kindPlacements) {
    if (!BASE_KINDS.has(kind) && total === dropped) gated.push([`ui.${kind}.`, figureGate(kind)]);
  }

  /* The landing's situation doors. The emergency route they fall back to is a chapter's own words. */
  if (awaitsFrReview(FEATURES.doors, 'fr')) gated.push(['ui.landingPage.doors.', FEATURES.doors]);

  /*
   * The funding checker. While its gate is closed, /fr shows the plain list of
   * each province's programs instead (FundingProvinceList in
   * diabetes-care/funding/funding-checker.tsx), which still reads the province
   * names, the check-date and "partly confirmed" lines, the caveat, and the
   * "still checking" line and link. The federal programs' own words render in
   * the federal section, which no gate holds.
   */
  if (awaitsFrReview('fundingChecker', 'fr')) {
    const gate = 'fundingChecker';
    const keptChecker = ['verifiedOn', 'confirm', 'caveat'];
    const keptResults = ['noConfirmedBody', 'noConfirmedLink'];

    Object.keys(valueAt(MESSAGES.en, 'ui.fundingChecker') ?? {})
      .filter((key) => !keptChecker.includes(key))
      .forEach((key) => gated.push([`ui.fundingChecker.${key}`, gate]));
    Object.keys(valueAt(MESSAGES.en, 'ui.fundingResults') ?? {})
      .filter((key) => !keptResults.includes(key))
      .forEach((key) => gated.push([`ui.fundingResults.${key}`, gate]));
    gated.push(['ui.fundingPage.toolIntro', gate]);
    [
      'options.',
      'groups.',
      'privateFirst.',
      'liivv.askUs',
      'liivv.quebec',
      'liivv.territory',
    ].forEach((prefix) => gated.push([`funding.${prefix}`, gate]));
    FUNDING_PROGRAMS.filter((meta) => meta.jurisdiction !== 'CA').forEach((meta) =>
      gated.push([`funding.programs.${meta.id}.`, gate]),
    );
  }

  return gated;
}

const FR_GATED = frGatedPrefixes();

/* The gate that keeps a line off /fr in production, if one does. */
const frGateFor = (path) =>
  FR_GATED.find(([prefix]) => path === prefix || path.startsWith(prefix))?.[1];

/*
 * The words of a held figure (held-messages.ts), which render on no page in
 * either locale, so no French reader sees them today.
 */
const HELD_PREFIXES = HELD_CLIENT_MESSAGES.flatMap((group) =>
  group.paths.map((path) => `${path.slice(NS.length + 1)}.`),
);

const isHeldPath = (path) => HELD_PREFIXES.some((prefix) => path.startsWith(prefix));

/*
 * The landing copy that waits on a switch in landing-meta.ts (trust item 4,
 * FAQ 2 and FAQ 5): in the message files, on no page, and not sent to the
 * browser, so no French reader sees it today either.
 */
const LANDING_HELD_PATHS = heldLandingPaths().map((path) => path.slice(NS.length + 1));

const isLandingHeld = (path) =>
  LANDING_HELD_PATHS.some((held) => path === held || path.startsWith(`${held}.`));

/*
 * The path pages' pharmacist band while `cdeBand` is off (paths-meta.ts): in
 * the message files, on no page, and not sent to the browser.
 */
const PATHS_HELD = heldPathPaths().map((path) => path.slice(NS.length + 1));

const isPathsHeld = (path) =>
  PATHS_HELD.some((held) => path === held || path.startsWith(`${held}.`));

const awaitsFrenchReview = (path) =>
  !frGateFor(path) &&
  !isHeldPath(path) &&
  !isLandingHeld(path) &&
  !isPathsHeld(path) &&
  (FR_AWAITING_REVIEW.has(path) ||
    (FR_AWAITING_REVIEW_PREFIXES.some((prefix) => path.startsWith(prefix)) &&
      !FR_REVIEWED_PREFIXES.some((prefix) => path.startsWith(prefix))));

/*
 * The English DiabetesCare subtree as it stood when this pack was first built,
 * flattened to one path → string map. A line whose English differs from it
 * today is a correction waiting on the nurse, marked ✎ and listed with what it
 * used to say. Move the baseline forward for a path once she has re-read it:
 * that is what records the sign-off.
 */
const BASELINE_PATH = join(CORE, 'scripts', BASELINE_FILE);
const RE_REVIEW_BASELINE = existsSync(BASELINE_PATH)
  ? JSON.parse(readFileSync(BASELINE_PATH, 'utf8'))
  : null;

/* Why a line was changed, for the ones where "Was …" is not the whole story. */
const RE_REVIEW_NOTES = {};

const RE_REVIEWS_PENDING = reReviewsPending(RE_REVIEW_BASELINE ?? {}, MESSAGES.en, RE_REVIEW_NOTES);

const makeWriter = writerFactory({
  messages: MESSAGES,
  seen,
  reReviewsPending: RE_REVIEWS_PENDING,
  awaitsFrenchReview,
});

const citer = sourceCiter({ sourceMeta: SOURCE_META, sourceReview: SOURCE_REVIEW });
const sourceTitles = citer.titles;

/*
 * Message leaves that are deliberately not printed, each with the reason. A
 * leaf here is exempt from the coverage check; a path that names nothing fails
 * it. Empty: every DiabetesCare string is a word a reader can see, so every
 * one is in the pack.
 */
const STRUCTURAL = {};

/* ------------------------------------------------------------------------- */
/* References                                                                 */
/* ------------------------------------------------------------------------- */

/*
 * A path under a chapter as the short reference the pack prints beside the
 * line: `categories.8.sections.4.items.1` is `8.s4.1`, `categories.2.figure.x`
 * is `2.fig.x`, `programsBand.cards.4` is `band.4`, `urgent.signs.2` is
 * `urgent.2`. Anything else is returned as it stands.
 */
function shortRef(rest) {
  if (rest.startsWith('categories.')) {
    return rest
      .slice('categories.'.length)
      .replace(/\.sections\.(\d+)\.items\./, '.s$1.')
      .replace(/\.sections\.(\d+)/, '.s$1')
      .replace(/\.figure(\.|$)/, '.fig$1')
      .replace(/\.items\./, '.');
  }

  return rest
    .replace(/^programsBand\.cards\.(\d+)/, 'band.$1')
    .replace(/^programsBand\.heading$/, 'band.heading')
    .replace(/^urgent\.signs\./, 'urgent.');
}

/*
 * One shop strip, for the review pack: its heading line's key, the products
 * it names (the catalogue's names of 2026-10-06, PLACED_PRODUCT_NAMES), its
 * shelf link and its notices. Which of them a reader sees is decided on the
 * day by the catalogue.
 */
function shelfSummary(shelf, locale) {
  const offers = shelf.offers.map((offer) => {
    const names = offer.productIds
      .map((id) => `${SHOP.PLACED_PRODUCT_NAMES[id] ?? 'unnamed'} (${id})`)
      .join(', ');

    return offer.line ? `\`${offer.line}\`: ${names}` : names;
  });
  const linkShown =
    shelf.collection && (!shelf.collection.locales || shelf.collection.locales.includes(locale));
  const notices = [
    ...(shelf.notices ?? []),
    ...(linkShown ? (shelf.collection.notices ?? []) : []),
  ];
  const link = shelf.collection
    ? linkShown
      ? `a link to the shop shelf ${shelf.collection.href} (\`${shelf.collection.label}\`)`
      : `no shelf link on /${locale} (${shelf.collection.href} shows on /${shelf.collection.locales.join(', /')} only)`
    : null;

  return [
    `\`${shelf.occasion}\` — ${offers.join('; ')}`,
    ...(link ? [link] : []),
    ...(notices.length ? [`notices: ${notices.map((key) => `\`ui.commerce.${key}\``).join(', ')}`] : []),
  ].join('; ');
}

/* What the card's shop strip names, or why it has none. */
function productsShown(slug, card, locale) {
  const shelf = SHOP.shelfForCard(slug, card);

  if (!shelf) {
    return SHOP.PLACEMENTS_ON
      ? 'Products shown: *none*'
      : 'Products shown: *none — placements are switched off*';
  }

  return `Products shown (shop strip after the referral chip; each only while the store shows it, sells it and has it in stock, and never one whose description names or links another retailer): ${shelfSummary(shelf, locale)}`;
}

const ASK_NOTE = {
  assessment: ' *(warning tone — do not act on this page alone)*',
  urgent: ' *(warning tone — do not act on this page alone)*',
};

const LINK_LANGUAGE = { en: 'an English page', fr: 'a French page' };

/* ------------------------------------------------------------------------- */
/* Header                                                                     */
/* ------------------------------------------------------------------------- */

function header(w, { title, route, source, locale, note }) {
  w.push(`# ${title}`);
  w.push(`**Route:** \`${locale === 'fr' ? `/fr${route}` : route}\`  `);
  w.push(`**Source:** ${source}  `);
  w.push(`${stamp()} — do not edit this file by hand; see [README](../README.md).`);
  w.push('');

  if (locale === 'fr') {
    w.push(
      '> **French is machine translated, and nobody has reviewed it** — neither a francophone reviewer nor the nurse. Review it against the English file with the same name — references match line for line.',
    );
    w.push('');

    if (w.frReviewsMarked()) {
      w.push(
        `> ${FR_REVIEW_MARK} **French nobody has reviewed, showing on /fr now.** Lines marked ${FR_REVIEW_MARK} have no review gate in front of them, so a French reader sees them today. Unmarked lines sit behind a French review gate, named where they are printed, and do not show on /fr in production. Review the marked lines first.`,
      );
      w.push('');
    }
  }

  if (w.reReviewsMarked()) {
    w.push(
      `> ${RE_REVIEW_MARK} **Corrected wording, waiting on the nurse.** Lines marked ${RE_REVIEW_MARK} have changed since the English baseline (\`${BASELINE_FILE}\`), and they are already live. What each one used to say is at the end of this file, under "Corrections waiting on re-review".`,
    );
    w.push('');
  }

  if (note) {
    w.push(`> ${note}`);
    w.push('');
  }
}

/* ------------------------------------------------------------------------- */
/* Figures                                                                    */
/* ------------------------------------------------------------------------- */

/* What a reviewer cannot see from the labels: which of the card's sentences go where. */
function columnsNotes(figure, num) {
  const items = (list) => list.map((item) => ref(`${num}.${item}`)).join(', ');

  return [
    '',
    "*Columns, from `chapters-meta.ts`. They restyle the card: every sentence below is one of the card's own, placed by number.*",
    '',
    ...(figure.lead?.length ? [`- above the columns: ${items(figure.lead)}`] : []),
    ...figure.columns.map(
      (column, c) =>
        `- column ${c + 1} ${ref(`${num}.fig.columns.${c + 1}.heading`)}: ${items(column)}`,
    ),
    ...(figure.neutral?.length ? [`- beneath the columns: ${items(figure.neutral)}`] : []),
  ];
}

function containersNotes(figure, num) {
  return [
    '',
    "*Where things go, from `chapters-meta.ts`. Generic symbols only, never a product. They restyle the card: every sentence is one of the card's own, placed by number.*",
    '',
    ...figure.containers.map(
      (container, c) =>
        `- ${ref(`${num}.fig.containers.${c + 1}.label`)} (symbol ${container.glyph}): ${container.items
          .map((entry) => `${ref(`${num}.${entry.item}`)} (${entry.glyph})`)
          .join(', ')}`,
    ),
  ];
}

function takeInNotes(figure, num) {
  return [
    '',
    `*A printable card of this card's own list${figure.fields ? `, with ${figure.fields} blank lines under ${ref(`${num}.fig.heading`)} for the reader to fill in with their team (\`${num}.fig.fields.1\`–\`${num}.fig.fields.${figure.fields}\`). The count is structural, so a translation can neither add a line nor drop one` : ''}. It restyles the card. The print button and its hint are shared — see \`00-shared.md\`.*`,
  ];
}

/*
 * A lane's link: a Liivv page (a path), an outward page (https), or the CDE
 * contact's own phone line (tel:, never another number, A9). A page names its
 * language; a phone number has none.
 */
function laneHrefProblems(lane, where) {
  const { href } = lane;
  const tel = href.startsWith('tel:');
  const problems = [];

  if (!tel && !['en', 'fr'].includes(lane.hrefLang)) {
    problems.push(`${where}: a link with no hrefLang`);
  }

  if (!href.startsWith('/') && !href.startsWith('https://') && !tel) {
    problems.push(`${where}: link is neither a Liivv path, a phone number nor https`);
  }

  if (tel && href !== `tel:${DIABETES_SITE.contact?.tel}`) {
    problems.push(`${where}: dials ${href}, not the site's CDE contact`);
  }

  return problems;
}

/* Liivv's own service can only be marked for the topics the site allows it. */
const laneTopics = (lane) =>
  lane.service ? lane.topics.filter((topic) => SERVICE_TOPICS.includes(topic)) : lane.topics;

function lanesNotes(figure, num, locale) {
  const topics = figure.topicKeys.map(
    (key, index) => `${key} ${ref(`${num}.fig.topics.${index + 1}.label`)}`,
  );
  const lanes = figure.lanes.map((lane, index) => {
    const n = index + 1;
    const parts = [
      lane.item === undefined
        ? `new text ${ref(`${num}.fig.lanes.${n}.body`)}`
        : `card sentence ${ref(`${num}.${lane.item}`)}`,
      `marked for: ${laneTopics(lane).join(', ') || 'nothing'}`,
    ];

    if (lane.service) {
      parts.push(
        `a Liivv service, in its own row, which can only ever be marked for ${SERVICE_TOPICS.join(', ')}`,
      );
    }

    if (lane.href) {
      let where = `same tab, ${LINK_LANGUAGE[lane.hrefLang] ?? lane.hrefLang}`;

      if (lane.href.startsWith('/')) where = 'a Liivv page; /fr gets the /fr prefix';
      if (lane.href.startsWith('tel:')) where = 'dials the number; no language';

      const target = lane.href.startsWith('https://') ? `<${lane.href}>` : ref(lane.href);

      parts.push(`link ${ref(`${num}.fig.lanes.${n}.linkLabel`)} (${where}) → ${target}`);
    }

    if (lane.contact) {
      parts.push(
        `under its words, the contact of Liivv’s Certified Diabetes Educators, as on every CDE panel: phone (dials the number) and hours (\`DIABETES_SITE.contact\`, worded in ${ref('ui.contact')})`,
      );
    }

    const head = `- **${n}** ${ref(`${num}.fig.lanes.${n}.label`)} · ${parts.join(' · ')}`;
    const register = [];

    if (lane.sources?.length)
      register.push(`    *Register:* ${sourceTitles(lane.sources, locale)}`);

    if (lane.linkSources?.length) {
      register.push(
        `    *Register (where the link goes):* ${sourceTitles(lane.linkSources, locale)}`,
      );
    }

    if (lane.service && !lane.sources?.length) {
      register.push("    *No source: it describes Liivv's own service, as the owner supplied it.*");
    }

    return register.length ? [`${head}  `, register.join('  \n')].join('\n') : head;
  });
  const gate = FEATURES.laneExtras;

  return [
    '',
    '*Lanes, from `chapters-meta.ts`. Ticking a topic marks the lanes that fit and does nothing else: no lane is reordered, hidden or ranked.*',
    '',
    `- tick boxes ${ref(`${num}.fig.legend`)}: ${topics.join(' · ')}`,
    ...lanes,
    ...(awaitsFrReview(gate, 'fr')
      ? [
          '',
          `*French review gate \`${gate}\`: on /fr the tick boxes, the link labels and every lane with no sentence of the card's own stay hidden until a francophone reviewer signs off their French. The lanes that carry the card's own sentences render.${locale === 'fr' ? ' **The French for the gated lines below is a draft that no one has reviewed.**' : ''}*`,
        ]
      : []),
  ];
}

/* An age band of the children's table, in words. */
function ageBand(row) {
  if (row.ageBelow !== undefined) return `under ${row.ageBelow}`;
  if (row.ageAbove !== undefined) return `over ${row.ageAbove}`;

  return `${row.ageFrom} to ${row.ageTo}`;
}

function ruleOf15Notes(figure, num, locale, card) {
  const steps = figure.steps.map((step, index) => {
    const bodies = card.figure?.stepBodies ?? {};
    let lead;

    if (step.item !== undefined) {
      lead = `led by the card's own sentence ${ref(`${num}.${step.item}`)}`;
    } else if (Object.hasOwn(bodies, String(step.key))) {
      lead = `no card sentence; its line is ${ref(`${num}.fig.stepBodies.${step.key}`)}`;
    } else {
      lead = 'no card sentence: the title alone';
    }

    return `- step ${index + 1} (key ${step.key}) ${ref(`${num}.fig.steps.${step.key}`)} · ${lead}`;
  });

  return [
    '',
    '*The Rule of 15 as a walk-through that can also be read whole. It restyles the card: each of the card’s sentences leads a step or follows the loop, so none is said twice. An Adult / Child pair shows or hides the children’s table; it never scales the 15 g list, because the source gives no amounts for children. With JavaScript off, every part is in the page as a list. Its controls are shared — see `00-shared.md`.*',
    '',
    ...steps,
    `- after the loop: the card's own sentence ${ref(`${num}.${figure.then}`)}, under ${ref('ruleOf15.then')}`,
    ...figure.child.map(
      (row, index) =>
        `- children's table, row ${index + 1}: ${ageBand(row)} years → ${row.grams} g ${ref(`${num}.fig.childRows.${index + 1}.age`)} ${ref(`${num}.fig.childRows.${index + 1}.amount`)}`,
    ),
    `- hidden while "A child" is selected: ${figure.hideWhenChild.map((option) => ref(`${num}.fig.options.${option}`)).join(', ')}`,
    ...(typeof card.figure?.childOptionsNote === 'string'
      ? [
          `- under the 15 g list, shown wherever the children's table is (the child view, and with JavaScript off): ${ref(`${num}.fig.childOptionsNote`)}, which says why an option is missing for a child`,
        ]
      : []),
    ...(figure.aidNote
      ? [`- the automated-system line ${ref(`${num}.fig.aidNote`)} shows under both choices`]
      : []),
    `- sources: ${sourceTitles(figure.sources, locale)}`,
  ];
}

/* A ketone edge as the source prints it, with one decimal: 3.0, not 3. */
const edge = (value) => (Number.isInteger(value) ? value.toFixed(1) : String(value));

/* A ketone rung's edges, from chapters-meta.ts, in words. */
function rungRange(rung) {
  /* A rung with a lower edge and an open upper one (ruling C5: "0.6 to under 1.5"). */
  if (rung.from !== undefined && rung.below !== undefined) {
    return `${edge(rung.from)} to under ${edge(rung.below)}`;
  }
  if (rung.below !== undefined) return `below ${edge(rung.below)}`;
  if (rung.above !== undefined) return `above ${edge(rung.above)}`;

  return `${edge(rung.from)} to ${edge(rung.to)}`;
}

function ketoneLadderNotes(figure, num, locale) {
  const last = figure.blood.length;

  return [
    '',
    '*Ketone ranges, with their edges exactly as the source publishes them. It augments the card: the card’s own sentences stay as they are. Labelled in the figure itself as written for type 1, not only in the note. Nothing to type in, and nothing reads a number back to the reader.*',
    '',
    ...figure.blood.map(
      (rung, index) =>
        `- blood rung ${index + 1}: ${rungRange(rung)} mmol/L ${ref(`${num}.fig.blood.rungs.${index + 1}.range`)} ${ref(`${num}.fig.blood.rungs.${index + 1}.action`)}${index + 1 === last ? ' · **urgent colour**' : ''}`,
    ),
    ...figure.urine.map(
      (rung, index) =>
        `- urine rung ${index + 1}: ${rung} ${ref(`${num}.fig.urine.rungs.${index + 1}.range`)} ${ref(`${num}.fig.urine.rungs.${index + 1}.action`)}${rung === 'large' ? ' · **urgent colour**' : ''}`,
    ),
    `- written for: ${figure.writtenFor === 'type1' ? 'type 1 diabetes' : figure.writtenFor} ${ref(`${num}.fig.writtenFor`)}`,
    `- sources: ${sourceTitles(figure.sources, locale)}`,
  ];
}

/* A zone of the target-range ruler, from chapters-meta.ts, in words. */
function zoneRange(zone) {
  if (zone.below !== undefined) return `below ${edge(zone.below)}`;

  return `${edge(zone.from)} to ${edge(zone.to)}`;
}

function glucoseRangeNotes(figure, num, locale) {
  return [
    '',
    '*Target ranges as labelled bars over one mmol/L scale, edges exactly as published. It augments the card: the card’s own sentences, which carry every number, stay as they are, and it sits above the printable card. Each bar is labelled in words, so none is told by colour alone; the drawing is hidden from screen readers, which read the same labels as a list, and the list is what prints. Nothing to type in, and nothing reads a number back to the reader.*',
    '',
    `- scale: ${edge(figure.scale.min)} to ${edge(figure.scale.max)} mmol/L ${ref(`${num}.fig.ruler.unit`)}`,
    ...figure.zones.map(
      (zone) =>
        `- ${zone.key}: ${zoneRange(zone)} mmol/L ${ref(`${num}.fig.ruler.zones.${zone.key}`)}${zone.item === undefined ? '' : ` · from the card's own sentence ${ref(`${num}.${zone.item}`)}`}${zone.key === 'low' ? ' · **warning tone**' : ''}`,
    ),
    `- the low bar's link ${ref(`${num}.fig.ruler.lowLink`)} → Chapter ${CHAPTER_META.find((c) => c.slug === figure.lowLink.chapter)?.num ?? '?'}, card ${figure.lowLink.card} (\`${ROUTE}${figure.lowLink.chapter}#card-${figure.lowLink.card}\`)`,
    `- always visible under the ruler: ${ref(`${num}.fig.ruler.teamNote`)}`,
    `- sources: ${sourceTitles(figure.sources, locale)}`,
  ];
}

/*
 * The clues checklist draws the whole card. What a reviewer cannot see from
 * the words: which section becomes tick boxes, where the note goes, and what
 * the print button puts on paper.
 */
function cluesChecklistNotes(figure, num, locale) {
  const last = `${num}.fig.questions.${figure.questions}`;

  return [
    '',
    `*The clues checklist. It draws the whole card: the card's note ${ref(`${num}.note`)} first, as a fixed banner that never collapses and has no close control; then every section in order, with section ${figure.section} ${ref(`${num}.s${figure.section}`)} as tick boxes under ${ref(`${num}.fig.legend`)}, each labelled with the item's own sentence; then the ${figure.questions} questions (\`${num}.fig.questions.1\`–\`${last}\`) under ${ref(`${num}.fig.printHeading`)}. The count is structural, so a translation can neither add a question nor drop one. Ticking changes nothing else on the page: no score, no count, no result, and nothing is saved or sent. The print button prints one sheet under that heading: the banner, the clues ticked (every clue, in an empty box, when none is), and the questions, each with a line to write the answer on. With JavaScript off the sections are plain lists and no tick box renders. Its controls and the sheet's labels are shared — see \`00-shared.md\`.*`,
    '',
    `- sources: ${sourceTitles(figure.sources, locale)}`,
  ];
}

function testGlossaryNotes(figure, num, locale) {
  const total = figure.terms.length;

  return [
    '',
    `*Test names in plain words, beneath the checklist: ${total} terms (\`${num}.fig.terms.1\`–\`${num}.fig.terms.${total}\`), each a disclosure that opens with or without JavaScript, under ${ref(`${num}.fig.glossaryHeading`)} and the line on international meanings ${ref(`${num}.fig.glossaryNote`)}. One button opens or closes every term at once; its labels are shared — see \`00-shared.md\`. The count is structural. It augments the card: section 3 already names and explains the tests.*`,
    '',
    `- anchors, in order: ${figure.terms.map(({ slug }, index) => `${ref(`${num}.fig.terms.${index + 1}`)} \`#dc-term-${slug}\``).join(', ')}`,
    `- sources: ${sourceTitles(figure.sources, locale)}`,
  ];
}

/*
 * A place a door or a card link opens, named as a reader meets it: the
 * chapter's title, then the card's (or the red-flag list's heading), then the
 * fragment it opens at.
 */
function placeName(to, locale) {
  if (to.page !== undefined)
    return 'the site’s ' + to.page + ' page · ' + LANDING_ROUTE + '/' + to.page;

  if (to.source !== undefined) {
    const href = locale === 'fr' && to.hrefFr ? to.hrefFr : to.href;

    return `${sourceTitles([to.source], locale)}, outward, same tab · <${href}>`;
  }

  const chapter = MESSAGES[locale].chapters?.[to.chapter];
  const chapterTitle = chapter?.title ?? to.chapter;

  if (to.card !== undefined) {
    const card = chapter?.categories?.[String(to.card)]?.title;

    const view = to.view ? `?view=${to.view}` : '';
    const opens = to.view ? `, opened on its figure's "${to.view}" view` : '';

    return `${chapterTitle}, card ${to.card}${card ? ` (${card})` : ''}${opens} · \`${to.chapter}${view}#card-${to.card}\``;
  }

  if (to.anchor !== undefined) {
    const heading =
      to.anchor === DIABETES_SITE.anchors.redFlags.id ? chapter?.urgent?.heading : undefined;

    return `${chapterTitle}${heading ? `, ${heading}` : ''} · \`${to.chapter}#${to.anchor}\``;
  }

  return `${chapterTitle} · \`${to.chapter}\``;
}

/* Where each door opens. The door is the link; its sentence is the card's own. */
function doorsNotes(figure, num, locale) {
  return [
    '',
    '*Each door is the card sentence as a link onward, under its door label:*',
    '',
    ...figure.doors.map((door, index) => {
      const to =
        door.card === undefined
          ? { chapter: door.chapter }
          : { chapter: door.chapter, card: door.card };

      return `- ${ref(`${num}.${door.item}`)} ${ref(`${num}.fig.doors.${index + 1}.label`)} → ${placeName(to, locale)}`;
    }),
  ];
}

/*
 * The links in a card's own sentences (meta `links`), with the words each one
 * covers in this locale: the phrase inside the message's `<link>` tags, or the
 * whole sentence where it has none.
 */
function cardLinkNotes(structure, num, cardPath, locale) {
  const links = structure.links ?? [];

  if (!links.length) return [];

  return [
    '',
    '*Links in the card’s own sentences. Navigation only: the link tags go around words already there and add none, so no French review gate holds them back.*',
    '',
    ...links.map((link) => {
      const raw = valueAt(RAW_MESSAGES[locale], `${cardPath}.${link.at}`);
      const phrase = /<link>(.*?)<\/link>/.exec(String(raw ?? ''))?.[1];
      const short = link.at === 'note' ? `${num}.note` : `${num}.${link.at.slice('items.'.length)}`;

      return `- ${ref(short)}: ${phrase ? `“${phrase}”` : 'the whole sentence'} → ${placeName(link.to, locale)}`;
    }),
  ];
}

function familyTreeNotes(figure, num, locale) {
  const at = `${num}.fig.familyTree`;

  return [
    '',
    `*The family diabetes tree, beneath the columns, under ${ref(`${at}.heading`)} and ${ref(`${at}.intro`)}. Since owner note 2 (2026-10-07) it starts closed, with one "Start my family tree" button; started, it is "Me" and a bar of Add buttons grouped by side, one per person below (${ref(`${at}.people`)}; brothers and sisters, children and a parent's brothers and sisters can be added more than once, the others once; at most ${figure.maxPeople} people). Each person answers in one tap: diabetes ${ref(`${at}.answers`)}; after a Yes, the age it was found, the type (${ref(`${at}.types`)}, where "other" opens a box for the type as told) and insulin within 2 years; and hearing loss, asked of everyone. It works nothing out (no risk, no colour, no pattern), and the answers stay in the browser tab: never stored, never sent. Its print button prints one portrait page: the people added, grouped by side, with their answers in words, then three blank "Anyone else" rows; before anyone is added, and with JavaScript off (in a closed disclosure), the blank table of every row below. Its controls are shared — see \`00-shared.md\`.*`,
    '',
    ...figure.sides.map(
      (group) =>
        `- ${ref(`${at}.sides.${group.side}`)}: ${group.rows.map((row) => ref(`${at}.rows.${row}`)).join(', ')}`,
    ),
    `- columns, in order: ${figure.columns.map((key) => ref(`${at}.columns.${key}`)).join(', ')}`,
    `- added more than once: ${figure.repeatable.map((row) => ref(`${at}.people.${row}`)).join(', ')}`,
    `- type choices, in order: ${figure.types.map((key) => ref(`${at}.types.${key}`)).join(', ')}`,
    `- sources: ${sourceTitles(figure.sources, locale)}`,
  ];
}

/*
 * Your Tools' pickers and calculator read their devices from
 * device-pairings.ts, not from chapters-meta.ts, so a pairing is stated once
 * for both pickers. These print what a reviewer cannot see from the labels:
 * every device, what each line rests on, and who confirms each pairing.
 */
const deviceSensor = (id) => DEVICES.SENSORS.find((sensor) => sensor.id === id);
const devicePump = (id) => DEVICES.PUMPS.find((pump) => pump.id === id);
const sensorLabel = (id) => deviceSensor(id)?.name ?? `⚠ unknown sensor '${id}'`;
const pumpLabel = (id, paired = false, locale = 'en') => {
  const pump = devicePump(id);

  if (!pump) return `⚠ unknown pump '${id}'`;

  if (!paired) return pump.name;

  return (locale === 'fr' ? pump.pairedNameFr : undefined) ?? pump.pairedName ?? pump.name;
};

/*
 * A sensor's notice where the sensor is named outside the sensor picker (the
 * pump picker's lists, the calculator's presets), for a notice marked
 * `everywhere` in device-pairings.ts: a recall.
 */
const everywhereNotice = (sensorId, num, locale) => {
  const notice = deviceSensor(sensorId)?.notice;

  return notice?.everywhere
    ? [
        `    - notice ${ref(`${num}.fig.notices.${notice.key}`)} (shown wherever this sensor is named) · ${sourceTitles(notice.sources, locale)}`,
      ]
    : [];
};

/* The `everywhere` notices a figure that names these sensors has to word. */
const everywhereNoticeKeys = (sensorIds) => [
  ...new Set(
    sensorIds.flatMap((id) => {
      const notice = deviceSensor(id)?.notice;

      return notice?.everywhere ? [`notices.${notice.key}`] : [];
    }),
  ),
];

/* One pairing as a picker lists it, from either end. */
function pairingNote(pairing, name, num, locale) {
  return `  - with **${name}** · ${ref(`${num}.fig.basis.${pairing.basis}`)}${pairing.caveat ? ` · ${ref(`${num}.fig.caveats.${pairing.caveat}`)}` : ''} · ${sourceTitles(pairing.sources, locale)}`;
}

/* Review only: the Canadian programs that list a device. Never rendered. */
const listedByNote = (ids, locale) =>
  ids?.length
    ? [`  - *listed by (review only, never rendered): ${sourceTitles(ids, locale)}*`]
    : [];

const PICKER_NOTE =
  'One radio button per device, nothing picked at first, with a status line that says which is shown. Every line ends with the register titles it rests on, and the entry ends with where its facts come from. With JavaScript off, every device’s entry is in the page, each in a closed disclosure. The device picked is remembered for the tab (sessionStorage); nothing else is kept. Device names are structural and never translated.';

function sensorPickerNotes(figure, num, locale) {
  return [
    '',
    `*The sensor picker, from \`device-pairings.ts\` (checked ${DEVICES.DEVICES_CHECKED_ON}). It augments the card: the card's own sentences stay as they are. ${PICKER_NOTE} A pairing is stated once in that file, and the pump picker (card 13) reads the same list from the other end. The source line is \`sensorPicker.sources\` — see \`00-shared.md\`.*`,
    '',
    ...DEVICES.SENSORS.flatMap((sensor) => {
      const { wear } = sensor;
      let wearLine = `wear: not confirmed on any registered page ${ref(`${num}.fig.wearNotConfirmed`)} (held)`;

      if (wear) {
        wearLine = `wear: up to ${wear.upToDays} days${wear.graceHours === undefined ? ` ${ref(`${num}.fig.wearUpTo`)}` : `, with a ${wear.graceHours}-hour grace period ${ref(`${num}.fig.wearDays`)}`}${wear.fromAge === undefined ? '' : `, from age ${wear.fromAge} ${ref(`${num}.fig.fromAge`)}`} · ${sourceTitles(wear.sources, locale)}`;
      }

      const pairings = DEVICES.PAIRINGS.filter((pairing) => pairing.sensor === sensor.id);
      const unconfirmed = DEVICES.NOT_CONFIRMED.filter((pair) => pair.sensor === sensor.id);

      return [
        `- **${sensor.name}**${sensor.forPump ? ` · labelled ${ref(`${num}.fig.forPump`)} ${pumpLabel(sensor.forPump)}` : ''}`,
        `  - ${wearLine}`,
        ...(pairings.length
          ? pairings.map((pairing) =>
              pairingNote(pairing, pumpLabel(pairing.pump, true, locale), num, locale),
            )
          : [`  - no pump pairing ${ref(`${num}.fig.noPumps`)}`]),
        ...(unconfirmed.length
          ? [
              `  - not confirmed ${ref(`${num}.fig.notConfirmed`)}: ${unconfirmed.map((pair) => pumpLabel(pair.pump, true, locale)).join(', ')}`,
            ]
          : []),
        ...(sensor.notice
          ? [
              `  - notice ${ref(`${num}.fig.notices.${sensor.notice.key}`)}${sensor.notice.everywhere ? ' (also shown wherever this sensor is named: the pump picker, the calculator)' : ''} · ${sourceTitles(sensor.notice.sources, locale)}`,
            ]
          : []),
        ...listedByNote(sensor.listedBy, locale),
      ];
    }),
  ];
}

function pumpPickerNotes(figure, num, locale) {
  const values = (fact) =>
    Object.entries(fact.values ?? {})
      .map(([key, value]) => `${key} = ${value}`)
      .join(', ');

  return [
    '',
    `*The "My pump" picker, from \`device-pairings.ts\` (checked ${DEVICES.DEVICES_CHECKED_ON}). It augments the card: the card's own sentences stay as they are. ${PICKER_NOTE} Its pairings are the sensor picker's (card 4), read from the other end, so the two cannot disagree. Each entry ends with a link to reach Liivv’s Certified Diabetes Educators (\`pumpPicker.askCde\`), which opens the CDE panel at the foot of the same page, with their phone line and hours → ${ref(figure.askHref)}. Its shared labels are in \`00-shared.md\`.*`,
    '',
    ...DEVICES.PUMPS.flatMap((pump) => {
      const pairings = DEVICES.PAIRINGS.filter((pairing) => pairing.pump === pump.id);
      const unconfirmed = DEVICES.NOT_CONFIRMED.filter((pair) => pair.pump === pump.id);

      return [
        `- **${pump.name}**`,
        ...pairings.flatMap((pairing) => [
          pairingNote(pairing, sensorLabel(pairing.sensor), num, locale),
          ...everywhereNotice(pairing.sensor, num, locale),
        ]),
        ...unconfirmed.flatMap((pair) => [
          `  - ${sensorLabel(pair.sensor)} ${ref(`${num}.fig.notConfirmedSensor`)}`,
          ...everywhereNotice(pair.sensor, num, locale),
        ]),
        ...(pairings.length || unconfirmed.length
          ? []
          : [`  - no sensor ${ref(`${num}.fig.noSensors`)}`]),
        ...pump.facts.map(
          (fact) =>
            `  - fact ${ref(`${num}.fig.factLines.${fact.key}`)}${fact.values ? ` (${values(fact)})` : ''} · ${sourceTitles(fact.sources, locale)}`,
        ),
        ...(pump.openQuestions.length
          ? [
              `  - not confirmed here, under ${ref(`${num}.fig.openQuestionsLead`)}: ${pump.openQuestions.map((key) => ref(`${num}.fig.openQuestions.${key}`)).join(', ')}`,
            ]
          : []),
        ...listedByNote(pump.listedBy, locale),
      ];
    }),
  ];
}

function meterMatchNotes(figure, num, locale) {
  const row = (label, value, ids) =>
    value ? `${label}: ${value} · ${sourceTitles(ids, locale)}` : `${label}: not confirmed`;

  return [
    '',
    `*The meter picker, from \`device-pairings.ts\`. Pick a meter, and see its test strips, its lancing device and lancets, and its control solution; a row no registered page confirms reads ${ref(`${num}.fig.notConfirmed`)}. Its source line is \`meterMatch.sources\`, held with it.*`,
    '',
    ...DEVICES.METER_FAMILIES.map(
      (family) =>
        `- **${family.meters.join(', ')}** — ${[
          row('strips', family.strips?.products.join(', '), family.strips?.sources),
          row('lancing', family.lancing?.inBox.join(', '), family.lancing?.sources),
          row('control solution', family.control?.product, family.control?.sources),
        ].join(' · ')}`,
    ),
  ];
}

function restockCalcNotes(figure, num, locale) {
  return [
    '',
    `*The restock calculator: arithmetic only. Sensors you have ${ref(`${num}.fig.haveLabel`)} × days each ${ref(`${num}.fig.daysLabel`)} gives ${ref(`${num}.fig.result`)}, with the date that many days from today in the page's own date format; with days to cover ${ref(`${num}.fig.coverLabel`)}, it needs the days ÷ days each, rounded up, and says ${ref(`${num}.fig.needMore`)} or ${ref(`${num}.fig.enough`)}. Anything but a whole number from 1 to ${figure.maxSensors} sensors, ${figure.maxDays} days each or ${figure.maxCover} days to cover shows ${ref(`${num}.fig.invalid`)} and no result. "Another sensor" ${ref(`${num}.fig.otherSensor`)} is picked at first, so no brand is put forward; a preset fills in the days and shows ${ref(`${num}.fig.graceNote`)}. Nothing is stored or sent, and nothing is compared with coverage. With JavaScript off it is ${ref(`${num}.fig.noJs`)}.*`,
    '',
    ...figure.presets.flatMap((id) => {
      const wear = deviceSensor(id)?.wear;

      return [
        wear
          ? `- preset **${sensorLabel(id)}**: up to ${wear.upToDays} days (no grace period counted) · ${sourceTitles(wear.sources, locale)}`
          : `- preset **${sensorLabel(id)}**: ⚠ no wear time in device-pairings.ts`,
        ...everywhereNotice(id, num, locale).map((line) => line.slice(2)),
      ];
    }),
  ];
}

function rotationMapNotes(figure, num) {
  return [
    '',
    `*The rotation map: a drawing, hidden from screen readers, of one injection area in ${figure.zones} zones ${ref(`${num}.fig.zones`)}, a week each (${figure.weeksPerZone} per zone), with the belly button at the centre and a dashed circle about ${figure.clearCm} cm round it to keep clear of ${ref(`${num}.fig.centre`)}; the first zone shows three injection points at least ${figure.spacingCmAtLeast.join(' to ')} cm (a finger width) apart. It augments the card, whose own sentences carry every fact. Under it, always visible: ${ref(`${num}.fig.caption`)}.*`,
  ];
}

/* Beside a card's figures: what each one does to the card, and what waits on French review. */
function figureReviewNotes(structure, num, locale, card) {
  const figures = structure.figures ?? [];
  const lines = [];
  /* A held figure renders nowhere, so it pins nothing open. */
  const shown = (figure) =>
    !figure.held && (locale !== 'fr' || keepsFigure(figure, structure, 'fr', awaitsFrReview));

  if (figures.some((figure) => MODULE_KINDS.has(figure.kind) && shown(figure))) {
    lines.push('', 'Rendered open (module).');
  }

  figures.forEach((figure) => {
    const gate = figureGate(figure.kind);

    if (figure.held) {
      lines.push(
        '',
        `***Held: \`${figure.held}\`.** This ${figure.kind} figure renders on no page, in either locale, and its labels are not sent to the browser (\`held-messages.ts\`). The card shows its own sentences as a plain list until the hold is lifted. See the open rulings below.*`,
      );
    }

    if (gate && awaitsFrReview(gate, 'fr')) {
      const draft =
        locale === 'fr' ? ' **The French below is a draft that no one has reviewed.**' : '';

      lines.push(
        '',
        keepsFigure(figure, structure, 'fr', awaitsFrReview)
          ? `*French review gate \`${gate}\`: this card carries urgent content, so the figure renders on /fr whatever the gate says, and its French is live.${draft}*`
          : `*French review gate \`${gate}\`: on /fr this figure stays hidden until a francophone reviewer signs off its French, and ${figures.some((other) => other !== figure && !other.held && keepsFigure(other, structure, 'fr', awaitsFrReview)) ? 'the rest of the card stays as it is' : 'the card shows its plain list instead'}.${draft}*`,
      );
    }

    if (
      NOTE_CARRYING_KINDS.has(figure.kind) &&
      !WHOLE_CARD_KINDS.has(figure.kind) &&
      card.note !== undefined
    ) {
      lines.push('', `*It prints the card's own note ${ref(`${num}.note`)} just above itself.*`);
    }

    if (figure.kind === 'columns') lines.push(...columnsNotes(figure, num));
    if (figure.kind === 'containers') lines.push(...containersNotes(figure, num));
    if (figure.kind === 'takeIn') lines.push(...takeInNotes(figure, num));
    if (figure.kind === 'lanes') lines.push(...lanesNotes(figure, num, locale));
    if (figure.kind === 'doors') lines.push(...doorsNotes(figure, num, locale));
    if (figure.kind === 'ruleOf15') lines.push(...ruleOf15Notes(figure, num, locale, card));
    if (figure.kind === 'ketoneLadder') lines.push(...ketoneLadderNotes(figure, num, locale));
    if (figure.kind === 'glucoseRange') lines.push(...glucoseRangeNotes(figure, num, locale));
    if (figure.kind === 'cluesChecklist') lines.push(...cluesChecklistNotes(figure, num, locale));
    if (figure.kind === 'testGlossary') lines.push(...testGlossaryNotes(figure, num, locale));
    if (figure.kind === 'familyTree') lines.push(...familyTreeNotes(figure, num, locale));
    if (figure.kind === 'sensorPicker') lines.push(...sensorPickerNotes(figure, num, locale));
    if (figure.kind === 'pumpPicker') lines.push(...pumpPickerNotes(figure, num, locale));
    if (figure.kind === 'meterMatch') lines.push(...meterMatchNotes(figure, num, locale));
    if (figure.kind === 'restockCalc') lines.push(...restockCalcNotes(figure, num, locale));
    if (figure.kind === 'rotationMap') lines.push(...rotationMapNotes(figure, num));
  });

  return lines;
}

/* ------------------------------------------------------------------------- */
/* Chapters                                                                   */
/* ------------------------------------------------------------------------- */

/* The nurse's open rulings for one chapter, with every place each one touches. */
function writeRulings(out, meta) {
  const all = OPEN_RULINGS[meta.slug] ?? [];
  const rulings = all.filter((entry) => !entry.settled);
  const settled = all.filter((entry) => entry.settled);
  const checks = PRE_PUBLISH_CHECKS[meta.slug] ?? [];

  if (!all.length && !checks.length) return;

  const writeRuling = (entry) => {
    out(`- **${entry.id}.** Default used: ${entry.default}  `);
    out(
      `  *Where:* ${entry.where.length ? entry.where.map((path) => ref(shortRef(path))).join(', ') : 'no line of this chapter'}  `,
    );
    out(`  *Alternative:* ${entry.alternative}`);
  };

  out('## Questions for the nurse', '');

  if (rulings.length) {
    out(
      '*Where the Canadian sources disagree, or a line needed a clinical judgement, the copy above uses a default. None of these is settled: each line named under "Where" renders the default today, in both locales. Rule on each one — keep the default, or take the alternative — and the copy is changed to match. Reviewer-only: none of this renders on a page.*',
      '',
    );
    rulings.forEach(writeRuling);
    out('');
  } else {
    out(
      '*None open. The nurse ruled on every default this chapter used (the clinical rulings of 2026-10-06, docs/diabetes-content/clinical-rulings-2026-10-06.md), and the copy above follows the rulings.*',
      '',
    );
  }

  if (settled.length) {
    out(
      '**Settled by the source check, for the record** — the copy already reflects these; the alternative is still open to the nurse:',
      '',
    );
    settled.forEach(writeRuling);
    out('');
  }

  if (checks.length) {
    out('**Before publishing — factual checks, not clinical rulings:**', '');
    checks.forEach((check, index) => out(`${index + 1}. ${check}`));
    out('');
  }
}

/* What the chapter leaves out for want of a source. None of it is in the message files. */
function writeHeldCopy(out, meta) {
  const held = HELD_COPY[meta.slug];

  if (!held?.items.length) return;

  const cell = (value) => String(value).replace(/\|/g, '\\|');

  out('## Held for want of a source', '');
  out(
    '*Wording the chapter would carry if a source could be confirmed, or that waits on a decision. **None of it is in the message files, and none of it renders on any page.** It is listed so the nurse can see what was left out, and why.*',
    '',
  );
  out('| Topic | Card | Why it is held | Proposed wording, if sourced | Source to check |');
  out('|---|---|---|---|---|');
  held.items.forEach((item) =>
    out(
      `| ${cell(item.topic)} | ${[...item.cards, ...(item.also ? [item.also] : [])].join(', ')} | ${cell(item.why)} | ${cell(item.wording)} | ${cell(item.check)} |`,
    ),
  );
  out('');

  if (held.released) out(`*${held.released}*`, '');
}

function writeChapter(meta, locale) {
  const base = `chapters.${meta.slug}`;
  const w = makeWriter(locale);
  const chapter = MESSAGES.en.chapters[meta.slug];
  const title = w.text(`${base}.title`);

  const body = [];
  const out = (...l) => body.push(...l);

  out('## Page framing', '');

  for (const [key, label] of [
    ['heroBody', 'Hero'],
    ['focus', 'Focus'],
    ['vibe', 'Vibe'],
    ['categoriesIntro.eyebrow', 'Cards intro — eyebrow'],
    ['categoriesIntro.heading', 'Cards intro — heading'],
    ['categoriesIntro.body', 'Cards intro — body'],
  ]) {
    const value = w.text(`${base}.${key}`);

    if (value) out(`- **${label}** ${ref(key)} — ${value}`);
  }

  if (chapter.startHere) {
    const groups = meta.startHere?.groups ?? [];

    out('', '## Start-here map', '');
    out(
      '*Two sides, one for each group named in `chapters-meta.ts`. Card titles and the referral line under each side are generated from the cards themselves; only these labels are written.*',
      '',
    );

    if (chapter.startHere.heading !== undefined) {
      out(`- **Heading** ${ref('startHere.heading')} — ${w.text(`${base}.startHere.heading`)}`);
    }

    out(`- **Pivot** ${ref('startHere.pivot')} — ${w.text(`${base}.startHere.pivot`)}`);

    for (const [i] of ordered(chapter.startHere.segments)) {
      const group = groups[Number(i) - 1];

      out(
        `- **Segment ${i}** ${ref(`startHere.${i}`)} — ${w.text(`${base}.startHere.segments.${i}.label`)}${group ? ` · the cards in group \`${group}\`` : ''}`,
      );
    }
  }

  if (chapter.urgentExit) {
    out('', '## Emergency signpost', '');
    out(
      `${w.text(`${base}.urgentExit.lead`)} **${w.text(`${base}.urgentExit.link`)}** ${ref('urgentExit')}`,
    );
  }

  out('', '## Cards', '');

  for (const [num, card] of ordered(chapter.categories)) {
    const structure = meta.categories[Number(num) - 1] ?? {};
    const cardPath = `${base}.categories.${num}`;
    const group = structure.group ? w.text(`ui.chapter.groups.${structure.group}`) : null;
    const ask = structure.ask ? w.text(`ui.chapter.ask.${structure.ask}`) : null;

    out(`### ${pad(num)} · ${w.text(`${cardPath}.title`)}`);
    out(
      [
        group ? `Group: **${group}**` : 'Group: *none*',
        ask
          ? `Referral chip: **${ask}**${ASK_NOTE[structure.ask] ?? ''}`
          : 'Referral chip: *none — orientation card*',
        productsShown(meta.slug, Number(num), locale),
      ].join(' · '),
    );
    out('');

    if (structure.urgentContent) {
      out(
        '*Carries an emergency or same-day line: rendered open, never collapsed, and every figure on it renders in both locales.*',
        '',
      );
    }

    if (card.badge !== undefined)
      out(`- **Badge** ${ref(`${num}.badge`)} — ${w.text(`${cardPath}.badge`)}`);

    for (const [i] of ordered(card.items)) {
      out(`- ${w.text(`${cardPath}.items.${i}`)} ${ref(`${num}.${i}`)}`);
    }

    for (const [s, section] of ordered(card.sections)) {
      out('', `**${w.text(`${cardPath}.sections.${s}.heading`)}** ${ref(`${num}.s${s}`)}`, '');

      for (const [i] of ordered(section.items)) {
        out(`- ${w.text(`${cardPath}.sections.${s}.items.${i}`)} ${ref(`${num}.s${s}.${i}`)}`);
      }

      if (section.note !== undefined) {
        out(
          '',
          `> **Note** ${ref(`${num}.s${s}.note`)} — ${w.text(`${cardPath}.sections.${s}.note`)}`,
        );
      }
    }

    if (card.note !== undefined) {
      const visible = structure.noteVisible
        ? ' *(kept outside the collapsed part of the card)*'
        : '';

      out('', `> **Note** ${ref(`${num}.note`)} — ${w.text(`${cardPath}.note`)}${visible}`);
    }

    out('', `*Sources for this card:* ${sourceTitles(structure.sources, locale) || '*none*'}`);
    out(...cardLinkNotes(structure, num, cardPath, locale));

    const figures = structure.figures ?? [];

    if (figures.length) {
      out('', `*Visual figure: ${figures.map((f) => f.kind).join(', ')}.*`);
      out(...figureReviewNotes(structure, num, locale, card));
    }

    if (card.figure) {
      out('', '*New labels this figure adds:*', '');
      emitTree(w, out, card.figure, `${cardPath}.figure`, `${num}.fig`);
    }

    out('');
  }

  if (chapter.urgent) {
    out('## Emergency red flags', '');
    out('*Pinned open, and never behind a French review gate.*', '');
    out(`**${w.text(`${base}.urgent.heading`)}** ${ref('urgent.heading')}`, '');
    out(`${w.text(`${base}.urgent.intro`)} ${ref('urgent.intro')}`, '');

    for (const [i] of ordered(chapter.urgent.signs)) {
      out(`${i}. ${w.text(`${base}.urgent.signs.${i}`)} ${ref(`urgent.${i}`)}`);
    }

    out('', `**Action** ${ref('urgent.action')} — ${w.text(`${base}.urgent.action`)}`, '');
  }

  if (chapter.programsBand) {
    out('## Referral band', '');

    if (meta.bandSources?.length) {
      out(`*Sources for the band:* ${sourceTitles(meta.bandSources, locale)}`, '');
    }

    if (chapter.programsBand.heading !== undefined) {
      out(`**${w.text(`${base}.programsBand.heading`)}** ${ref('band.heading')}`, '');
    }

    for (const [i, bandCard] of ordered(chapter.programsBand.cards)) {
      const target = meta.programsBandCards?.[Number(i) - 1];
      const links = meta.programsBandLinks?.[Number(i) - 1] ?? [];

      out(
        `- **${w.text(`${base}.programsBand.cards.${i}.heading`)}** ${ref(`band.${i}`)} — ${w.text(`${base}.programsBand.cards.${i}.body`)}`,
      );

      if (target) {
        out(`  - *Where card ${target}'s title appears in this body, it links to card ${target}.*`);
      }

      links.forEach((link, l) => {
        const label = bandCard.links?.[String(l + 1)]?.label;

        out(
          `  - **${label === undefined ? `⚠ no label in \`${locale}.json\`` : w.text(`${base}.programsBand.cards.${i}.links.${l + 1}.label`)}** ${ref(`band.${i}.link.${l + 1}`)}  `,
          link.href.startsWith('/')
            ? `    <${locale === 'fr' ? `/fr${link.href}` : link.href}> · same tab, a Liivv page in the page language · shown on /${link.locales.join(' and /')}  `
            : locale === 'fr' && link.hrefFr
              ? `    <${link.hrefFr}> · same tab, ${LINK_LANGUAGE.fr ?? 'fr'} (the publisher's French page; English: <${link.href}>) · shown on /${link.locales.join(' and /')}  `
              : `    <${link.href}> · same tab, ${LINK_LANGUAGE[link.hrefLang] ?? link.hrefLang} · shown on /${link.locales.join(' and /')}  `,
          link.sources.length
            ? `    *Register:* ${sourceTitles(link.sources, locale)}`
            : '    *Register:* none — a Liivv page, which cites its own sources',
        );
      });
    }

    out('');
  }

  if (chapter.resources) {
    out('## Resources', '');

    for (const [g, group] of ordered(chapter.resources)) {
      const urls = meta.resourceLinks[Number(g) - 1] ?? [];

      out(`### ${w.text(`${base}.resources.${g}.heading`)} ${ref(`res.${g}`)}`);

      if (group.eyebrow !== undefined) out(`*${w.text(`${base}.resources.${g}.eyebrow`)}*`, '');
      if (group.body !== undefined) out(`${w.text(`${base}.resources.${g}.body`)}`, '');

      for (const [l, link] of ordered(group.links)) {
        const p = `${base}.resources.${g}.links.${l}`;
        const url = urls[Number(l) - 1];

        out(
          `- **${w.text(`${p}.title`)}** — ${w.text(`${p}.org`)} ${ref(`res.${g}.${l}`)}  `,
          `  ${w.text(`${p}.body`)}${link.note !== undefined ? ` *(${w.text(`${p}.note`)})*` : ''}  `,
          `  ${url ? `<${url}>` : '⚠ *no URL in chapters-meta.ts — this link does not render*'}`,
        );
      }

      out('');
    }
  }

  if (meta.shelf && chapter.shelf) {
    out('## Resources shelf', '');
    out(`**${w.text(`${base}.shelf.heading`)}** ${ref('shelf.heading')}`, '');

    meta.shelf.groups.forEach((shelfGroup, index) => {
      const g = index + 1;
      const groupPath = `${base}.shelf.groups.${g}`;

      out(`### ${w.text(`${groupPath}.heading`)} ${ref(`shelf.${g}`)}`, '');

      shelfGroup.links.forEach((link, linkIndex) => {
        const at = `${groupPath}.links.${linkIndex + 1}`;
        const linkWords = valueAt(MESSAGES.en, at);

        out(
          `- **${w.text(`${at}.title`)}** — ${locale === 'fr' && link.orgFr ? link.orgFr : link.org} ${ref(`shelf.${g}.${linkIndex + 1}`)}  `,
          `  ${w.text(`${at}.body`)}${linkWords?.note === undefined ? '' : ` *(${w.text(`${at}.note`)})*`}  `,
          `  <${locale === 'fr' && link.hrefFr ? link.hrefFr : link.href}> · same tab, ${LINK_LANGUAGE[link.hrefLang] ?? link.hrefLang}${link.heldUntil ? ` · **held: ${link.heldUntil}, so it does not render**` : ''}  `,
          `  *Register:* ${sourceTitles(link.sources, locale)}`,
        );
      });

      out('');
    });
  }

  out('## CDE panel', '');
  out(
    DIABETES_SITE.contact
      ? `*The panel at the foot of the page (\`#chapter-cde\`), which the hero’s "Ask a pharmacist" button opens (${ref(meta.pharmacistHref)}). It shows the CDE contact (\`contact\` in 00-shared.md: phone and hours) in place of a button; "Request a call" stays held (B6). Rests on the owner’s answers of 2026-10-06, and on owner note 5 of 2026-10-07 (the service is Liivv’s).*`
      : `*The button opens ${ref(meta.pharmacistHref)}, a Liivv page.*`,
    '',
  );

  /* A panel with the CDE contact has no request button, so no `cta`. */
  for (const key of ['eyebrow', 'heading', 'body', 'cta'].filter(
    (field) => valueAt(MESSAGES.en, `${base}.pharmacist.${field}`) !== undefined,
  )) {
    out(`- **${key}** ${ref(`pharmacist.${key}`)} — ${w.text(`${base}.pharmacist.${key}`)}`);
  }

  out('', '## Closing', '');
  out(`**${w.text(`${base}.closing.heading`)}** ${ref('closing.heading')}`, '');
  out(`${w.text(`${base}.closing.body`)} ${ref('closing.body')}`, '');

  out('## Disclaimer', '');
  out(`${w.text(`${base}.governance.disclaimer`)} ${ref('disclaimer')}`, '');

  if (meta.citations?.length) {
    out('## Sources cited', '');
    out(
      "*The list at the foot of the page. Citation titles are the documents' own titles and are not translated, except where a publisher issues an official French title.*",
      '',
    );

    meta.citations.forEach((c, i) => {
      const label = locale === 'fr' && c.labelFr ? c.labelFr : c.label;
      const href = locale === 'fr' && c.hrefFr ? c.hrefFr : c.href;

      out(`${i + 1}. ${label} — <${href}>`);
    });

    out('');
  }

  writeRulings(out, meta);
  writeHeldCopy(out, meta);

  const reReviews = [...RE_REVIEWS_PENDING].filter(([path]) => path.startsWith(`${base}.`));

  if (reReviews.length) {
    out('## Corrections waiting on re-review', '');
    out(
      `*Marked ${RE_REVIEW_MARK} above. These lines changed after the English baseline was taken and are live now; they need the nurse to read them again and either keep or reword them.*`,
      '',
    );

    reReviews.forEach(([path, was]) =>
      out(`- ${ref(shortRef(path.slice(base.length + 1)))} — ${was}`),
    );

    out('');
  }

  const fullTitle = `Chapter ${meta.num} — ${title}`;

  header(w, {
    title: fullTitle,
    route: `${ROUTE}${meta.slug}`,
    source: `\`core/messages/${locale}.json\` → \`${NS}.${base}\`, structure in \`diabetes-care/chapters/chapters-meta.ts\``,
    locale,
    note: `About ${w.words().toLocaleString('en-CA')} words on this page. References: \`8.3\` is card 8, item 3 · \`8.s4.1\` is card 8, section 4, item 1 · \`2.note\` is card 2's closing note · \`2.fig.steps.4\` is a label inside card 2's figure, here step 4 · \`band.2\` is the referral band's card 2 · \`urgent.3\` is the third emergency red flag. A reference that starts with a number belongs to that card; the rest belong to a section of the page.`,
  });

  w.push(...body);

  return {
    file: `${meta.num}-${meta.slug}.md`,
    title: fullTitle,
    words: w.words(),
    content: w.lines.join('\n'),
  };
}

/* ------------------------------------------------------------------------- */
/* Shared interface strings                                                   */
/* ------------------------------------------------------------------------- */

/*
 * The shared sections, in page order, by path under `ui`. Each prints the
 * strings directly under its node. A `ui` subtree that is not listed here is
 * printed nowhere, so the coverage check names it: a new module's labels have
 * to be given a heading in this pack before the run passes, as on Ostomy.
 */
const SHARED_SECTIONS = {
  'chapter.ask': 'Referral chips',
  'chapter.groups': 'Card groups',
  'chapter.words': 'Chapter numbers in words (hero kicker)',
  'chapter.crisis': 'Crisis line — the words around the numbers',
  'chapter.roleNames': 'Role names used in generated referral lines',
  'chapter.startHere': 'Start-here map',
  'chapter.takeIn': 'Take-in card',
  'chapter.print':
    'Printed sheets — the header and footer every print button adds, on paper only (owner note 2, 2026-10-07): the site, a line for a name, the date printed, the card’s sources by group, and the page address',
  ruleOf15: 'The Rule of 15 — controls and labels',
  ketoneLadder: 'Ketone ladder — labels',
  cluesChecklist: 'Clues checklist — controls and print sheet',
  testGlossary: 'Test glossary — controls',
  familyTree: 'Family diabetes tree — controls',
  sensorPicker: 'Sensor picker — source line',
  pumpPicker: 'Pump picker — source line and the link to ask',
  meterMatch: 'Meter picker — source line',
  'chapter.shelf': 'Resources shelf — language notes',
  'chapter.sources':
    'Sources — the line under every card, path intro, landing fact and answer, and the groups of the foot list',
  'chapter.shop': 'Shop strips — buttons and the note under every strip',
  'chapter.shop.occasions': 'Shop strips — the line that heads each strip',
  'chapter.shop.offers': 'Shop strips — the lines above a group of products, and the shelf link',
  chapter: 'Chapter page labels',
  help: 'Help band — shown on every page',
  contact:
    'How to reach Liivv’s Certified Diabetes Educators (every CDE panel, the landing’s care band, the funding page)',
  commerce:
    'Insulin and glucagon — the product page notice, the checkout’s Quebec line, and the "View product" link that replaces a one-click add on every listing (owner note 9, 2026-10-07)',
  shopPage:
    'Diabetes Essentials shop (Shop Diabetes Care, category 1151) — headings and filters (owner note 9, 2026-10-07; French review gate `shop`). Brand and device names are not copy: they are in diabetes-care/shop-classify.ts. On the English insulin filter the shelf repeats the three `commerce` notices above its products; the French shelf lists no insulin',
  'shopPage.types': 'Diabetes Essentials shop — the "What you need" product types (one scheme with the landing’s shop rooms)',
  discovery: 'Discovery band',
  governance: 'Byline and review notices',
  'governance.disclosure': 'Commercial disclosure',
};

/*
 * The register's display fields (owner note 1, 2026-10-07): every entry names
 * a publisher in PUBLISHERS, and the group a Sources list puts it in agrees
 * with the reviewer's type in sources-review.ts (an international type is
 * international, an industry page is a maker's, any other type is Canadian;
 * the type `other` may sit in either of the first two). A brand-named insulin
 * monograph or alert is never shown (ruling C7), nor is the UncoverT1D page
 * (C36).
 */
const MUST_NOT_SHOW = [
  'hc-dpd-pm-toujeo',
  'hc-dpd-pm-humalog',
  'hc-dpd-pm-tresiba',
  'hc-dpd-pm-awiqli',
  'hc-dpd-pm-entuzity',
  'hc-alert-humalog-200-2015',
  'sanofi-uncovert1d-screening',
];

function registerDisplayProblems() {
  const problems = [];

  Object.entries(SOURCE_META).forEach(([id, entry]) => {
    const publisher = PUBLISHERS[entry.publisher];

    if (!publisher) {
      problems.push(`sources-meta.ts ${id}: publisher '${entry.publisher}' is not in PUBLISHERS`);

      return;
    }

    const scope = entry.scope ?? publisher.scope;
    const type = String(SOURCE_REVIEW[id]?.type ?? '');
    const expected = type.startsWith('international')
      ? ['international']
      : type === 'industry'
        ? ['industry']
        : type === 'other'
          ? ['canadian', 'international']
          : ['canadian'];

    if (!expected.includes(scope)) {
      problems.push(`sources-meta.ts ${id}: shown as ${scope}, but sources-review.ts types it ${type}`);
    }

    if (entry.year !== undefined && !(entry.year >= 1990 && entry.year <= 2030)) {
      problems.push(`sources-meta.ts ${id}: year ${entry.year} is not a year`);
    }
  });

  MUST_NOT_SHOW.filter((id) => SOURCE_META[id]?.display !== 'reviewOnly').forEach((id) =>
    problems.push(`sources-meta.ts ${id}: must be display: 'reviewOnly' (rulings C7, C36)`),
  );

  return problems;
}

/* Every figure kind a chapter places. */
const placedKinds = () =>
  new Set(
    CHAPTER_META.flatMap((meta) =>
      meta.categories.flatMap((structure) =>
        (structure.figures ?? []).map((figure) => figure.kind),
      ),
    ),
  );

/* What a reviewer cannot see from a shared section's words: where it renders, and what holds it. */
function sharedNote(path, locale) {
  const kinds = placedKinds();

  if (path === 'chapter.crisis' && !kinds.has('crisis')) {
    return '*No chapter places the crisis strip, so these lines render nowhere today.*';
  }

  if (isHeldPath(`ui.${path}.`)) {
    return '*Held with the figure that reads it: renders on no page, in either locale, and is not sent to the browser (`held-messages.ts`).*';
  }

  if (path === 'chapter.sources') {
    return '*Owner note 1 (2026-10-07): the copy states the fact and the element names its sources. `line` is the closed Sources disclosure at the foot of every chapter card and under the referral band (up to three publishers, then `more`), the line under each path intro, and the open line under each landing fact, the type chips and each answer; it is the same message as the pickers’ `sensorPicker.sources`. Open, each entry reads "Title, Publisher (year)", with "(en anglais)" inside the link where the page it opens is English. `canadian`, `international` and `industry` head the groups of the foot list ("Where this comes from"), which lists every source the page names; `note` closes it on the chapters, paths and funding page (the landing has its own `sourcesNote`). Governance furniture: never behind a French review gate. Entries marked `display: \'reviewOnly\'` in sources-meta.ts (brand-named insulin monographs and the Humalog alert, ruling C7; the UncoverT1D page, C36) never show.*';
  }

  if (path === 'contact') {
    const contact = DIABETES_SITE.contact;

    return contact
      ? `*The general contact of Liivv’s Certified Diabetes Educators (owner answers A2, B5, B9, B10, B12, 2026-10-06; presented as Liivv’s own service, owner note 5, 2026-10-07). Dials \`tel:${contact.tel}\`${contact.email ? `; writes to \`${contact.email}\`` : '; no email line (none set)'}${contact.aboutHref ? `; the About link opens <${contact.aboutHref}>${contact.aboutHrefFr ? ` (on /fr, <${contact.aboutHrefFr}>)` : ''}, same tab` : '; no About link (none set)'}. Never a named person. Shown in place of "Request a call", which stays held until a booking page can take the request (\`cdeRequestReason\` is ${LANDING_GATES.cdeRequestReason ? 'on' : 'off'}; B6).*`
      : '*No contact in site.ts: these lines render nowhere.*';
  }

  if (path === 'commerce') {
    return '*Outside the Diabetes Care pages, on the store’s own pages. Read on the server and passed down, so the browser’s message bundle does not change. `pharmacistNotice` sits under the buy box of every insulin and glucagon product page, and `insulinColdChain` and `quebecInsulin` under it on insulin only (glucagon, Baqsimi, is kept at room temperature, so cold-chain is said of insulin alone, since the full-site review of 2026-10-06; insulin is category 1116 plus Trurapi 4719 and 5002; glucagon is Baqsimi 4555: `dc-ids.ts`). The same two lines print under the shop strips that need them (`notices` in chapter-shop.ts): `pharmacistNotice` under Staying Safe card 3’s glucagon strip, and all three under New to the Journey card 8’s link to the insulin shelf, on English pages only, once that link is shown again (`INSULIN_SHELF.linked`, held since 2026-10-06 while products on the shelf carry another retailer’s link or name; B3). `quebecInsulinCheckout` shows in the checkout’s payment section, under a pay button that stays off, when the cart has insulin and the shipping province is Quebec; `{phone}` is `contact.phone`. The server also refuses that order (`buildCheckoutSnapshot`). Rests on the owner’s answers of 2026-10-06 (A1, A8, B3, B11, B29); the phone is the CDE line (`contact.phone`), and the line names Liivv (owner note 5, 2026-10-07). Not behind a French review gate: on /fr the French draft shows, as a notice, not an offer. Subscription renewals to Quebec are not checked (operations, OPEN-QUESTIONS B11).*';
  }

  if (path === 'chapter.shop') {
    return `*Every shop strip: under a chapter card's referral chip, and between a path's reading list and its funding door (\`chapter-shop.ts\`; owner answer B21, 2026-10-06). The funding page has none since the owner removed its pump-supplies strip (note 7, 2026-10-07). ${SHOP.PLACEMENTS_ON ? 'Placements are on' : 'Placements are switched off (`PLACEMENTS_ON`), so none of this renders'}. A product is shown only while the store shows it, sells it and has it in stock, and never one whose description names or links another retailer. \`add\` adds one product in one click where there is nothing to choose; a product with a required option or modifier gets \`chooseOptions\`, a link to its page, instead. \`addFor\` and \`chooseOptionsFor\` are the buttons' accessible names. No kit is listed (A4).*`;
  }

  if (path === 'chapter.shop.occasions') {
    return '*One per strip, by key (`occasion` in chapter-shop.ts). Merchandising, not teaching: none states a clinical fact. Not behind a French review gate, as Ostomy’s strips are not: the French is a draft.*';
  }

  if (path === 'chapter.shop.offers') {
    return "*A line above a group of products (`line` in chapter-shop.ts), and the label of the one shelf link. `insulinShelf` labels New to the Journey card 8's link to the insulin shelf, on English pages only, and only while `INSULIN_SHELF.linked` is on (held since 2026-10-06; B3): insulin may not be advertised to Quebec (B11), so on /fr the link is not drawn and its label is not sent to the browser (`FR_HELD_COPY` in landing-meta.ts). No strip names an insulin product.*";
  }

  if (path === 'governance.disclosure') {
    return `*The paragraph about Liivv's own commercial interest, at the foot of every chapter page (\`disclosure\` is ${DIABETES_SITE.governance?.disclosure ? 'on' : 'off'} in \`site.ts\`).*`;
  }

  const gated = FR_GATED.find(([prefix]) => prefix === `ui.${path}.`);

  if (gated && locale === 'fr') {
    return `*French review gate \`${gated[1]}\`: hidden on /fr until a francophone reviewer signs off its French. **The French below is a draft that no one has reviewed.***`;
  }

  if (!BASE_KINDS.has(path) && Object.hasOwn(GATED_KINDS, path) && !kinds.has(path)) {
    return '*No chapter places this module yet, so these lines render nowhere today.*';
  }

  return null;
}

function writeShared(locale) {
  const w = makeWriter(locale);
  const body = [];
  const out = (...l) => body.push(...l);

  /* A listed section with nothing in it prints no heading; flagProblems names it instead. */
  Object.entries(SHARED_SECTIONS)
    .map(([path, label]) => {
      const node = valueAt(MESSAGES.en.ui, path) ?? {};

      return {
        path,
        label,
        keys: Object.keys(node).filter((key) => typeof node[key] === 'string'),
      };
    })
    .filter(({ keys }) => keys.length)
    .forEach(({ path, label, keys }) => {
      const note = sharedNote(path, locale);

      out(`## ${label}`, '');

      if (note) out(note, '');

      keys.forEach((key) => out(`- ${ref(`${path}.${key}`)} — ${w.text(`ui.${path}.${key}`)}`));
      out('');
    });

  const sharedReviews = [...RE_REVIEWS_PENDING].filter(([path]) => path.startsWith('ui.'));

  if (sharedReviews.length) {
    out('## Corrections waiting on re-review', '');
    out(
      `*Marked ${RE_REVIEW_MARK} above. These shared lines changed after the English baseline was taken and are live now; they need the nurse to read them again.*`,
      '',
    );

    sharedReviews.forEach(([path, was]) => out(`- \`${path}\` — ${was}`));
    out('');
  }

  header(w, {
    title: 'Shared interface text',
    route: '/liivv-health/diabetes-care',
    source: `\`core/messages/${locale}.json\` → \`${NS}.ui\``,
    locale,
    note: 'Text that appears on more than one page: referral chips, group names, the help band, the module controls, and the notices around clinical review. References drop the leading `ui.`.',
  });

  w.push(...body);

  return {
    file: '00-shared.md',
    title: 'Shared interface text',
    words: w.words(),
    content: w.lines.join('\n'),
  };
}

/* ------------------------------------------------------------------------- */
/* Structure checks                                                           */
/* ------------------------------------------------------------------------- */

/* A number as either locale writes it: 0.6 in English, 0,6 in French. */
const mentions = (text, value) => {
  const n = String(value);

  return [n, n.replace('.', ',')].some((form) => String(text ?? '').includes(form));
};

/*
 * A restyling figure carries the card's own sentences by number, so each one
 * has to be placed exactly once: a sentence placed nowhere vanishes from the
 * page, and one placed twice is said twice.
 */
function placedOnce(items, total, at, what) {
  const problems = [];

  items
    .filter((item) => !Number.isInteger(item) || item < 1 || item > total)
    .forEach((item) =>
      problems.push(`${at} ${what}: item ${item} does not exist (card has ${total})`),
    );

  Array.from({ length: total }, (_, i) => i + 1).forEach((item) => {
    const times = items.filter((placed) => placed === item).length;

    if (times !== 1)
      problems.push(`${at} ${what}: item ${item} is placed ${times} times, not once`);
  });

  return problems;
}

function lanesProblems(figure, text, card, at) {
  const problems = [];
  const items = count(card.items);
  const keys = figure.topicKeys ?? [];

  if (figure.lanes.length !== count(text?.lanes)) {
    problems.push(
      `${at} lanes: ${figure.lanes.length} in chapters-meta.ts, ${count(text?.lanes)} in messages`,
    );
  }

  if (keys.length !== count(text?.topics)) {
    problems.push(
      `${at} lane topics: ${keys.length} in chapters-meta.ts, ${count(text?.topics)} in messages`,
    );
  }

  figure.lanes.forEach((lane, index) => {
    const laneWords = nth(text?.lanes, index);
    const where = `${at} lanes.${index + 1}`;

    if (typeof laneWords?.label !== 'string') problems.push(`${where}: no label in messages`);

    if (lane.item === undefined) {
      if (typeof laneWords?.body !== 'string') {
        problems.push(`${where}: no card sentence and no figure.lanes.${index + 1}.body`);
      }

      /* New text needs a source, unless it describes Liivv's own service. */
      if (!lane.sources?.length && !lane.service)
        problems.push(`${where}: new text with no sources`);
    } else if (!Number.isInteger(lane.item) || lane.item < 1 || lane.item > items) {
      problems.push(`${where}: item ${lane.item} does not exist (card has ${items})`);
    }

    if (lane.contact && (lane.href !== undefined || !lane.service)) {
      problems.push(`${where}: a contact lane is a Liivv service lane with no href of its own`);
    }

    if (lane.href !== undefined) {
      if (typeof laneWords?.linkLabel !== 'string')
        problems.push(`${where}: a link with no linkLabel`);

      problems.push(...laneHrefProblems(lane, where));
    }

    const unknown = lane.topics.filter((topic) => !keys.includes(topic));

    if (unknown.length)
      problems.push(`${where}: topic(s) ${unknown.join(', ')} are not in topicKeys`);

    if (lane.service && lane.topics.some((topic) => !SERVICE_TOPICS.includes(topic))) {
      problems.push(
        `${where}: a Liivv service lane may only answer ${SERVICE_TOPICS.join(', ')} (serviceLaneTopics in site.ts)`,
      );
    }
  });

  if (keys.length) {
    ['legend', 'fits', 'statusFitsOne', 'statusFitsMany', 'statusNone']
      .filter((key) => typeof text?.[key] !== 'string')
      .forEach((key) => problems.push(`${at} lanes: no figure.${key} in messages`));

    ['statusFitsOne', 'statusFitsMany']
      .filter((key) => typeof text?.[key] === 'string' && !text[key].includes('{count}'))
      .forEach((key) => problems.push(`${at} lanes: figure.${key} has no {count}`));
  }

  return problems;
}

function ruleOf15Problems(figure, text, card, at) {
  const problems = [];
  const keys = figure.steps.map((step) => step.key);

  if (new Set(keys).size !== keys.length) problems.push(`${at} ruleOf15: duplicate step keys`);

  figure.steps
    .filter((step) => typeof text?.steps?.[String(step.key)] !== 'string')
    .forEach((step) => problems.push(`${at} ruleOf15: no figure.steps.${step.key} in messages`));

  Object.keys(text?.steps ?? {})
    .filter((key) => !keys.includes(Number(key)))
    .forEach((key) =>
      problems.push(`${at} ruleOf15: figure.steps.${key} is not a step in chapters-meta.ts`),
    );

  problems.push(
    ...placedOnce(
      [
        ...figure.steps.flatMap((step) => (step.item === undefined ? [] : [step.item])),
        figure.then,
      ],
      count(card.items),
      at,
      'ruleOf15',
    ),
  );

  if (figure.child.length !== count(text?.childRows)) {
    problems.push(
      `${at} ruleOf15 child rows: ${figure.child.length} in chapters-meta.ts, ${count(text?.childRows)} in messages`,
    );
  }

  /* The numbers in meta are for parity with the words; the figure prints the words. */
  figure.child.forEach((row, index) => {
    const rowWords = nth(text?.childRows, index);

    if (!mentions(rowWords?.amount, row.grams)) {
      problems.push(
        `${at} ruleOf15 child row ${index + 1}: the amount does not say ${row.grams} g`,
      );
    }

    [row.ageBelow, row.ageFrom, row.ageTo, row.ageAbove]
      .filter((age) => age !== undefined && !mentions(rowWords?.age, age))
      .forEach((age) =>
        problems.push(`${at} ruleOf15 child row ${index + 1}: the age does not say ${age}`),
      );
  });

  figure.hideWhenChild
    .filter((option) => typeof text?.options?.[String(option)] !== 'string')
    .forEach((option) =>
      problems.push(`${at} ruleOf15: hideWhenChild names option ${option}, which does not exist`),
    );

  if (figure.aidNote && typeof text?.aidNote !== 'string') {
    problems.push(`${at} ruleOf15: aidNote is set and there is no figure.aidNote`);
  }

  if (!figure.sources?.length) problems.push(`${at} ruleOf15: no sources`);

  return problems;
}

function ketoneLadderProblems(figure, text, at) {
  const problems = [];

  for (const [side, rungs] of [
    ['blood', figure.blood],
    ['urine', figure.urine],
  ]) {
    if (rungs.length !== count(text?.[side]?.rungs)) {
      problems.push(
        `${at} ketoneLadder ${side}: ${rungs.length} rungs in chapters-meta.ts, ${count(text?.[side]?.rungs)} in messages`,
      );
    }

    if (typeof text?.[side]?.heading !== 'string')
      problems.push(`${at} ketoneLadder: no figure.${side}.heading`);
  }

  figure.blood.forEach((rung, index) => {
    const range = nth(text?.blood?.rungs, index)?.range;

    [rung.below, rung.from, rung.to, rung.above]
      .filter((value) => value !== undefined && !mentions(range, edge(value)))
      .forEach((value) =>
        problems.push(
          `${at} ketoneLadder blood rung ${index + 1}: the range does not say ${edge(value)}`,
        ),
      );
  });

  if (typeof text?.writtenFor !== 'string')
    problems.push(`${at} ketoneLadder: no figure.writtenFor`);
  if (!figure.sources?.length) problems.push(`${at} ketoneLadder: no sources`);

  return problems;
}

/*
 * The ruler's zones against their labels and the card: each zone has a label
 * that says its own edges (the bars are drawn from the meta, the words from
 * the messages, so the two must agree), names a card sentence that exists, and
 * sits on the scale; the low link goes to a card that exists.
 */
function glucoseRangeProblems(figure, text, card, at) {
  const problems = [];
  const ruler = text?.ruler;
  const items = count(card.items);
  const keys = figure.zones.map((zone) => zone.key);

  if (new Set(keys).size !== keys.length) problems.push(`${at} glucoseRange: duplicate zone keys`);

  ['heading', 'unit', 'lowLink', 'teamNote']
    .filter((key) => typeof ruler?.[key] !== 'string')
    .forEach((key) => problems.push(`${at} glucoseRange: no figure.ruler.${key}`));

  Object.keys(ruler?.zones ?? {})
    .filter((key) => !keys.includes(key))
    .forEach((key) =>
      problems.push(
        `${at} glucoseRange: figure.ruler.zones.${key} is not a zone in chapters-meta.ts`,
      ),
    );

  figure.zones.forEach((zone) => {
    const label = ruler?.zones?.[zone.key];
    const where = `${at} glucoseRange zone ${zone.key}`;

    if (typeof label !== 'string') {
      problems.push(`${where}: no figure.ruler.zones.${zone.key}`);

      return;
    }

    [zone.below, zone.from, zone.to]
      .filter((value) => value !== undefined)
      .forEach((value) => {
        if (!mentions(label, edge(value))) {
          problems.push(`${where}: the label does not say ${edge(value)}`);
        }

        if (value < figure.scale.min || value > figure.scale.max) {
          problems.push(`${where}: ${edge(value)} is off the scale`);
        }
      });

    if (
      zone.item !== undefined &&
      (!Number.isInteger(zone.item) || zone.item < 1 || zone.item > items)
    ) {
      problems.push(`${where}: item ${zone.item} does not exist (card has ${items})`);
    }
  });

  const target = CHAPTER_META.find((meta) => meta.slug === figure.lowLink.chapter);

  if (!target) {
    problems.push(
      `${at} glucoseRange lowLink: '${figure.lowLink.chapter}' is not an engine chapter`,
    );
  } else if (figure.lowLink.card < 1 || figure.lowLink.card > target.categories.length) {
    problems.push(
      `${at} glucoseRange lowLink: ${figure.lowLink.chapter} has no card ${figure.lowLink.card}`,
    );
  }

  if (!figure.sources?.length) problems.push(`${at} glucoseRange: no sources`);

  return problems;
}

/*
 * The checklist against its card: the section it ticks exists and has items,
 * the questions in the messages are exactly the meta's count, and the banner
 * (the card's note) and the labels the sheet prints are there.
 */
function cluesChecklistProblems(figure, text, card, at) {
  const problems = [];
  const section = nth(card.sections, figure.section - 1);

  if (!section) {
    problems.push(`${at} cluesChecklist: section ${figure.section} does not exist`);
  } else if (!count(section.items)) {
    problems.push(`${at} cluesChecklist: section ${figure.section} has no items to tick`);
  }

  if (figure.questions !== count(text?.questions)) {
    problems.push(
      `${at} cluesChecklist questions: ${figure.questions} in chapters-meta.ts, ${count(text?.questions)} in messages`,
    );
  }

  ['legend', 'printHeading']
    .filter((key) => typeof text?.[key] !== 'string')
    .forEach((key) => problems.push(`${at} cluesChecklist: no figure.${key}`));

  if (typeof card.note !== 'string') {
    problems.push(`${at} cluesChecklist: no note for its "Not a diagnostic tool" banner`);
  }

  if (!figure.sources?.length) problems.push(`${at} cluesChecklist: no sources`);

  return problems;
}

function testGlossaryProblems(figure, text, at) {
  const problems = [];

  if (figure.terms.length !== count(text?.terms)) {
    problems.push(
      `${at} testGlossary terms: ${figure.terms.length} in chapters-meta.ts, ${count(text?.terms)} in messages`,
    );
  }

  /* Each slug is a term's anchor (#dc-term-<slug>): lower-case words and hyphens, once each. */
  figure.terms
    .filter(
      ({ slug }, index) =>
        !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(String(slug)) ||
        figure.terms.findIndex((other) => other.slug === slug) !== index,
    )
    .forEach(({ slug }) =>
      problems.push(`${at} testGlossary: slug '${slug}' is malformed or repeated`),
    );

  ordered(text?.terms).forEach(([n, term]) =>
    ['term', 'meaning']
      .filter((key) => typeof term?.[key] !== 'string')
      .forEach((key) => problems.push(`${at} testGlossary term ${n}: no ${key}`)),
  );

  ['glossaryHeading', 'glossaryNote']
    .filter((key) => typeof text?.[key] !== 'string')
    .forEach((key) => problems.push(`${at} testGlossary: no figure.${key}`));

  if (!figure.sources?.length) problems.push(`${at} testGlossary: no sources`);

  return problems;
}

/* Every relative in the messages sits on exactly one side, and every label is there. */
function familyTreeProblems(figure, text, at) {
  const problems = [];
  const tree = text?.familyTree;

  problems.push(
    ...placedOnce(
      figure.sides.flatMap((group) => group.rows),
      count(tree?.rows),
      at,
      'familyTree rows',
    ),
  );

  figure.sides
    .filter((group) => typeof tree?.sides?.[group.side] !== 'string')
    .forEach((group) =>
      problems.push(`${at} familyTree: no figure.familyTree.sides.${group.side}`),
    );

  figure.columns
    .filter((key) => typeof tree?.columns?.[key] !== 'string')
    .forEach((key) => problems.push(`${at} familyTree: no figure.familyTree.columns.${key}`));

  [
    ['sides', figure.sides.map((group) => group.side), tree?.sides],
    ['columns', figure.columns, tree?.columns],
  ].forEach(([what, keys, node]) => {
    if (new Set(keys).size !== keys.length) problems.push(`${at} familyTree: duplicate ${what}`);

    Object.keys(node ?? {})
      .filter((key) => !keys.includes(key))
      .forEach((key) =>
        problems.push(`${at} familyTree: ${what}.${key} is not in chapters-meta.ts`),
      );
  });

  ['heading', 'intro']
    .filter((key) => typeof tree?.[key] !== 'string')
    .forEach((key) => problems.push(`${at} familyTree: no figure.familyTree.${key}`));

  /* Every row names one person, for the Add buttons and each person's group. */
  const rows = figure.sides.flatMap((group) => group.rows);

  problems.push(...placedOnce(rows, count(tree?.people), at, 'familyTree people'));

  figure.repeatable
    .filter((row) => !rows.includes(row) || row === rows[0])
    .forEach((row) => problems.push(`${at} familyTree: repeatable row ${row} is not a relative`));

  [
    ['answers', ['yes', 'no', 'notSure'], tree?.answers],
    ['types', figure.types, tree?.types],
  ].forEach(([what, keys, node]) => {
    keys
      .filter((key) => typeof node?.[key] !== 'string')
      .forEach((key) => problems.push(`${at} familyTree: no figure.familyTree.${what}.${key}`));

    Object.keys(node ?? {})
      .filter((key) => !keys.includes(key))
      .forEach((key) =>
        problems.push(`${at} familyTree: ${what}.${key} is not in chapters-meta.ts`),
      );
  });

  if (!(figure.maxPeople >= rows.length)) {
    problems.push(`${at} familyTree: maxPeople is under the number of rows`);
  }

  if (!figure.sources?.length) problems.push(`${at} familyTree: no sources`);

  return problems;
}

/*
 * The labels a figure reads from its card's `figure` messages are there, and
 * each one that takes a value names it, so nothing prints a bare "{days}".
 */
function labelProblems(text, at, what, keys, placeholders = {}) {
  return [
    ...keys
      .filter((key) => typeof valueAt(text ?? {}, key) !== 'string')
      .map((key) => `${at} ${what}: no figure.${key}`),
    ...Object.entries(placeholders).flatMap(([key, names]) => {
      const message = valueAt(text ?? {}, key);

      return typeof message === 'string'
        ? names
            .filter((name) => !message.includes(`{${name}`))
            .map((name) => `${at} ${what}: figure.${key} has no {${name}}`)
        : [];
    }),
  ];
}

/* Every basis and caveat the pairings use has its label. */
const pairingLabelKeys = () => [
  ...new Set(DEVICES.PAIRINGS.map((pairing) => `basis.${pairing.basis}`)),
  ...new Set(
    DEVICES.PAIRINGS.filter((pairing) => pairing.caveat).map(
      (pairing) => `caveats.${pairing.caveat}`,
    ),
  ),
];

function sensorPickerProblems(text, at) {
  return labelProblems(
    text,
    at,
    'sensorPicker',
    [
      'legend',
      'wear',
      'wearNotConfirmed',
      'pumps',
      'noPumps',
      'fromMaker',
      'statusNone',
      ...pairingLabelKeys(),
      ...DEVICES.SENSORS.filter((sensor) => sensor.notice).map(
        (sensor) => `notices.${sensor.notice.key}`,
      ),
    ],
    {
      wearDays: ['days', 'hours'],
      wearUpTo: ['days'],
      fromAge: ['age'],
      notConfirmed: ['pumps'],
      forPump: ['pump'],
      status: ['sensor'],
    },
  );
}

function pumpPickerProblems(figure, text, at) {
  const problems = labelProblems(
    text,
    at,
    'pumpPicker',
    [
      'legend',
      'sensors',
      'noSensors',
      'facts',
      'notConfirmedHeading',
      'openQuestionsLead',
      'fromMaker',
      'statusNone',
      ...pairingLabelKeys(),
      ...new Set(
        DEVICES.PUMPS.flatMap((pump) => pump.openQuestions.map((key) => `openQuestions.${key}`)),
      ),
      ...everywhereNoticeKeys([
        ...DEVICES.PAIRINGS.map((pairing) => pairing.sensor),
        ...DEVICES.NOT_CONFIRMED.map((pair) => pair.sensor),
      ]),
    ],
    {
      notConfirmedSensor: ['sensor'],
      status: ['pump'],
      ...Object.fromEntries(
        DEVICES.PUMPS.flatMap((pump) =>
          pump.facts.map((fact) => [`factLines.${fact.key}`, Object.keys(fact.values ?? {})]),
        ),
      ),
    },
  );

  const askHref = String(figure.askHref);

  /* The CDE panel on the same page, or a Liivv page (which then names its language). */
  if (askHref.startsWith('#')) {
    if (askHref !== '#chapter-cde' || !DIABETES_SITE.contact) {
      problems.push(`${at} pumpPicker: askHref ${askHref} is not the CDE panel's anchor`);
    }
  } else if (!askHref.startsWith('/')) {
    problems.push(`${at} pumpPicker: askHref is not a Liivv path`);
  } else if (!['en', 'fr'].includes(figure.askHrefLang)) {
    problems.push(`${at} pumpPicker: askHref has no hrefLang`);
  }

  return problems;
}

function meterMatchProblems(text, at) {
  const facts = DEVICES.METER_FAMILIES.flatMap((family) =>
    family.control ? [family.control.fact] : [],
  );

  return labelProblems(
    text,
    at,
    'meterMatch',
    ['legend', 'strips', 'lancing', 'control', 'notConfirmed', 'fromMaker', 'statusNone'],
    {
      inBox: ['products'],
      status: ['meter'],
      ...Object.fromEntries(facts.map((fact) => [fact, ['product']])),
    },
  );
}

/*
 * The presets have a wear time to fill in, a preset's recall notice is worded,
 * and the "invalid" line states the meta's limits, every one of them.
 */
function restockCalcProblems(figure, text, at) {
  const problems = labelProblems(
    text,
    at,
    'restockCalc',
    [
      'sensorLabel',
      'otherSensor',
      'daysLabel',
      'haveLabel',
      'coverLabel',
      'coverNone',
      'coverOther',
      'coverOtherLabel',
      'graceNote',
      'invalid',
      'noJs',
      ...everywhereNoticeKeys(figure.presets),
    ],
    {
      result: ['count', 'days', 'date'],
      needMore: ['cover', 'need', 'more'],
      enough: ['cover'],
      less: ['field'],
      more: ['field'],
      coverDays: ['days'],
    },
  );

  if (!figure.coverPresets?.length) problems.push(`${at} restockCalc: no coverPresets`);

  figure.coverPresets
    ?.filter((days) => days > figure.maxCover)
    .forEach((days) =>
      problems.push(`${at} restockCalc: cover chip ${days} is over maxCover ${figure.maxCover}`),
    );

  figure.presets
    .filter((id) => !deviceSensor(id)?.wear)
    .forEach((id) =>
      problems.push(`${at} restockCalc: preset '${id}' has no wear time in device-pairings.ts`),
    );

  [figure.maxSensors, figure.maxDays, figure.maxCover]
    .filter((limit) => !mentions(text?.invalid, limit))
    .forEach((limit) => problems.push(`${at} restockCalc: figure.invalid does not say ${limit}`));

  return problems;
}

/* One label per zone, and the keep-clear line says the meta's distance. */
function rotationMapProblems(figure, text, at) {
  const problems = labelProblems(text, at, 'rotationMap', ['heading', 'centre', 'caption']);

  if (figure.zones !== count(text?.zones)) {
    problems.push(
      `${at} rotationMap zones: ${figure.zones} in chapters-meta.ts, ${count(text?.zones)} in messages`,
    );
  }

  if (!mentions(text?.centre, figure.clearCm)) {
    problems.push(`${at} rotationMap: figure.centre does not say ${figure.clearCm}`);
  }

  return problems;
}

/*
 * Your Tools' device file against itself and the register: every id is used
 * once, every pairing names a sensor and a pump that exist, a pair is not both
 * paired and "not confirmed", and every source it cites, review-only ones
 * included, is in the register.
 */
function deviceProblems() {
  const problems = [];
  const sensors = DEVICES.SENSORS.map((sensor) => sensor.id);
  const pumps = DEVICES.PUMPS.map((pump) => pump.id);
  const pair = (entry) => `${entry.sensor} + ${entry.pump}`;
  const paired = DEVICES.PAIRINGS.map(pair);

  [
    ['sensor', sensors],
    ['pump', pumps],
    ['pairing', paired],
  ].forEach(([what, ids]) =>
    ids
      .filter((id, index) => ids.indexOf(id) !== index)
      .forEach((id) => problems.push(`device-pairings.ts: ${what} '${id}' is listed twice`)),
  );

  [...DEVICES.PAIRINGS, ...DEVICES.NOT_CONFIRMED].forEach((entry) => {
    if (!sensors.includes(entry.sensor)) {
      problems.push(`device-pairings.ts: '${pair(entry)}' names an unknown sensor`);
    }

    if (!pumps.includes(entry.pump)) {
      problems.push(`device-pairings.ts: '${pair(entry)}' names an unknown pump`);
    }
  });

  DEVICES.NOT_CONFIRMED.filter((entry) => paired.includes(pair(entry))).forEach((entry) =>
    problems.push(`device-pairings.ts: '${pair(entry)}' is both paired and not confirmed`),
  );

  DEVICES.SENSORS.filter((sensor) => sensor.forPump && !pumps.includes(sensor.forPump)).forEach(
    (sensor) => problems.push(`device-pairings.ts: ${sensor.id} is for an unknown pump`),
  );

  const cited = [
    ...sourceRefs(DEVICES, 'device-pairings.ts'),
    ...[...DEVICES.SENSORS, ...DEVICES.PUMPS]
      .filter((device) => device.listedBy)
      .map((device) => [`device-pairings.ts ${device.id}.listedBy`, device.listedBy]),
  ];

  cited.forEach(([where, ids]) =>
    ids
      .filter((id) => !Object.hasOwn(SOURCE_META, id))
      .forEach((id) => problems.push(`${where}: unknown source id '${id}'`)),
  );

  return problems;
}

function figureProblems(figure, text, card, at) {
  const items = count(card.items);
  const expect = (what, metaLength, messageLength) =>
    metaLength === messageLength
      ? []
      : [`${at} ${what}: ${metaLength} in chapters-meta.ts, ${messageLength} in messages`];

  switch (figure.kind) {
    case 'routes':
      return expect('routes', figure.routes.length, count(text?.routes));

    case 'criteria':
      return expect(
        'criteria labels (items + more)',
        figure.glyphs.length,
        count(text?.items) + (text?.more === undefined ? 0 : 1),
      );

    case 'columns':
      return [
        ...expect('columns', figure.columns.length, count(text?.columns)),
        ...placedOnce(
          [...(figure.lead ?? []), ...figure.columns.flat(), ...(figure.neutral ?? [])],
          items,
          at,
          'columns',
        ),
      ];

    case 'containers':
      return [
        ...expect('containers', figure.containers.length, count(text?.containers)),
        ...placedOnce(
          figure.containers.flatMap((container) => container.items.map((entry) => entry.item)),
          items,
          at,
          'containers',
        ),
      ];

    case 'takeIn':
      return [
        ...expect('takeIn fields', figure.fields ?? 0, count(text?.fields)),
        ...(figure.fields && typeof text?.heading !== 'string'
          ? [`${at} takeIn: fields to fill in, and no figure.heading above them`]
          : []),
      ];

    case 'lanes':
      return lanesProblems(figure, text, card, at);

    case 'doors':
      return [
        ...expect('doors', figure.doors.length, count(text?.doors)),
        ...doorPlaceProblems(figure, at),
      ];

    case 'ruleOf15':
      return ruleOf15Problems(figure, text, card, at);

    case 'ketoneLadder':
      return ketoneLadderProblems(figure, text, at);

    case 'glucoseRange':
      return glucoseRangeProblems(figure, text, card, at);

    case 'cluesChecklist':
      return cluesChecklistProblems(figure, text, card, at);

    case 'testGlossary':
      return testGlossaryProblems(figure, text, at);

    case 'familyTree':
      return familyTreeProblems(figure, text, at);

    case 'sensorPicker':
      return sensorPickerProblems(text, at);

    case 'pumpPicker':
      return pumpPickerProblems(figure, text, at);

    case 'meterMatch':
      return meterMatchProblems(text, at);

    case 'restockCalc':
      return restockCalcProblems(figure, text, at);

    case 'rotationMap':
      return rotationMapProblems(figure, text, at);

    default:
      return [];
  }
}

/*
 * The views a figure's controls open on from a link's `?view=`
 * (CardLinkMeta.to.view): the Rule of 15's amounts for a child
 * (rule-of-15-controls.tsx).
 */
const FIGURE_VIEWS = { ruleOf15: ['child'] };

/*
 * A place a door or a card link opens: an engine chapter, and a card it has or
 * an anchor it renders. The only anchor a chapter renders beyond its cards is
 * its red-flag list, and only where it has one.
 */
function placeProblems(to, at, locale) {
  /* One of the site's own pages: it must exist as a route under the site. */
  if (to.page !== undefined) {
    return existsSync(join(DC, to.page, 'page.tsx'))
      ? []
      : [`${at}: the site has no '${to.page}' page (diabetes-care/${to.page}/page.tsx)`];
  }

  /* An outward page: a registered source, at the register's own addresses. */
  if (to.source !== undefined) {
    const meta = SOURCE_META[to.source];

    if (!meta) return [`${at}: '${to.source}' is not in the register`];

    return [
      ...(to.href === meta.href ? [] : [`${at}: ${to.href} is not ${to.source}'s address`]),
      ...((to.hrefFr ?? null) === (meta.hrefFr ?? null)
        ? []
        : [`${at}: hrefFr does not match ${to.source}'s French address`]),
    ];
  }

  const target = CHAPTER_META.find((c) => c.slug === to.chapter);

  if (!target) return [`${at}: '${to.chapter}' is not an engine chapter`];

  if (to.card !== undefined) {
    if (!(Number.isInteger(to.card) && to.card >= 1 && to.card <= target.categories.length)) {
      return [`${at}: ${to.chapter} has no card ${to.card}`];
    }

    const kinds = (target.categories[to.card - 1].figures ?? []).map((figure) => figure.kind);

    return to.view === undefined ||
      Object.entries(FIGURE_VIEWS).some(
        ([kind, views]) => kinds.includes(kind) && views.includes(to.view),
      )
      ? []
      : [`${at}: ${to.chapter} card ${to.card} has no figure with a "${to.view}" view`];
  }

  if (to.anchor !== undefined) {
    const urgent = MESSAGES[locale].chapters?.[to.chapter]?.urgent;

    return to.anchor === DIABETES_SITE.anchors.redFlags.id && urgent
      ? []
      : [`${at}: ${to.chapter} renders no #${to.anchor}`];
  }

  return [];
}

/*
 * Every door opens an engine chapter, and the card it names there. A held door
 * opens nothing, so it may point at a chapter still to come.
 */
function doorPlaceProblems(figure, at) {
  if (figure.held) return [];

  return figure.doors.flatMap((door) =>
    placeProblems(
      door.card === undefined
        ? { chapter: door.chapter }
        : { chapter: door.chapter, card: door.card },
      `${at} door ${door.item}`,
      'en',
    ),
  );
}

/*
 * A card's links (meta `links`): each names a sentence the card has, wraps at
 * most one phrase in `<link>` tags, tags it in both locales or in neither, and
 * opens a place that exists. A tag that no link names is a fault too: the page
 * drops it silently, so the phrase it marks would link nowhere.
 */
function cardLinkProblems(structure, rawCards, where, locale) {
  const problems = [];
  const rawCard = rawCards[locale] ?? {};
  const named = new Set();

  (structure.links ?? []).forEach((link) => {
    const at = `${where} link ${link.at}`;
    const raw = valueAt(rawCard, link.at);

    named.add(link.at);

    if (!/^(note|items\.\d+)$/.test(String(link.at))) {
      problems.push(`${at}: 'at' must be 'note' or 'items.<n>'`);
    } else if (typeof raw !== 'string') {
      problems.push(`${at}: no such message in ${locale}.json`);
    } else {
      const opens = raw.split('<link>').length - 1;
      const closes = raw.split('</link>').length - 1;

      if (opens > 1 || opens !== closes || raw.indexOf('</link>') < raw.indexOf('<link>')) {
        problems.push(`${at}: at most one <link>…</link> pair, opened before it is closed`);
      }

      const otherRaw = valueAt(rawCards[locale === 'en' ? 'fr' : 'en'] ?? {}, link.at);

      if (typeof otherRaw === 'string' && otherRaw.includes('<link>') !== raw.includes('<link>')) {
        problems.push(`${at}: tagged in one locale and not the other`);
      }
    }

    problems.push(...placeProblems(link.to, at, locale));
  });

  leafPaths(rawCard)
    .filter((path) => /<\/?link>/.test(String(valueAt(rawCard, path))) && !named.has(path))
    .forEach((path) =>
      problems.push(`${where} ${path}: a <link> tag that no link in chapters-meta.ts names`),
    );

  return problems;
}

/* The start-here map is drawn as a before and an after: two sides, never one or three. */
function startHereProblems(meta, chapter, at) {
  if (!meta.startHere && !chapter.startHere) return [];

  const problems = [];
  const groups = meta.startHere?.groups ?? [];
  const segments = count(chapter.startHere?.segments);

  if (groups.length !== 2)
    problems.push(`${at} startHere: ${groups.length} groups in chapters-meta.ts, 2 expected`);
  if (segments !== 2)
    problems.push(`${at} startHere: ${segments} segments in messages, 2 expected`);

  ordered(chapter.startHere?.segments).forEach(([i, segment]) => {
    if (typeof segment?.label !== 'string') problems.push(`${at} startHere segment ${i}: no label`);
  });

  if (typeof chapter.startHere?.pivot !== 'string') problems.push(`${at} startHere: no pivot`);

  groups
    .filter((group) => !meta.categories.some((structure) => structure.group === group))
    .forEach((group) => problems.push(`${at} startHere: no card is in group '${group}'`));

  return problems;
}

function bandProblems(meta, chapter, locale, at) {
  const band = chapter.programsBand;
  const cards = count(band?.cards);
  const problems = [];

  for (const [what, list] of [
    ['programsBandLinks', meta.programsBandLinks],
    ['programsBandCards', meta.programsBandCards],
  ]) {
    if (list && list.length !== cards) {
      problems.push(
        `${at} ${what}: ${list.length} in chapters-meta.ts, ${cards} band cards in messages`,
      );
    }
  }

  /* The link to a card is made where its title appears in the band card's body. */
  (meta.programsBandCards ?? []).forEach((target, index) => {
    if (target === null || target === undefined) return;

    const title = chapter.categories?.[String(target)]?.title;
    const body = nth(band?.cards, index)?.body;

    if (typeof title !== 'string') {
      problems.push(`${at} band card ${index + 1}: points at card ${target}, which has no title`);
    } else if (!String(body ?? '').includes(title)) {
      problems.push(
        `${at} band card ${index + 1}: its body does not contain card ${target}'s title, so the link to it does not render on /${locale}`,
      );
    }
  });

  (meta.programsBandLinks ?? []).forEach((links, index) => {
    const labels = count(nth(band?.cards, index)?.links);

    if (links.length !== labels) {
      problems.push(
        `${at} band card ${index + 1} links: ${links.length} in chapters-meta.ts, ${labels} in messages`,
      );
    }

    /* A Liivv page is a path, opened in the page locale; anything else has to be https. */
    links
      .filter((link) =>
        String(link.href).startsWith('/')
          ? link.hrefFr !== undefined
          : !String(link.href).startsWith('https://') ||
            (link.hrefFr !== undefined && !String(link.hrefFr).startsWith('https://')),
      )
      .forEach(() =>
        problems.push(`${at} band card ${index + 1}: a link is neither a Liivv path nor https`),
      );
  });

  return problems;
}

function chapterProblems(meta, locale) {
  const chapter = MESSAGES[locale].chapters?.[meta.slug];
  const at = `${locale} ${meta.slug}`;

  if (!chapter) return [`${at}: chapter missing from ${locale}.json`];

  const problems = [];
  const ui = MESSAGES[locale].ui?.chapter ?? {};

  if (meta.categories.length !== count(chapter.categories)) {
    problems.push(
      `${at} categories: ${meta.categories.length} in chapters-meta.ts, ${count(chapter.categories)} in messages`,
    );
  }

  meta.categories.forEach((structure, index) => {
    const card = nth(chapter.categories, index) ?? {};
    const where = `${at} card ${index + 1}`;

    if (structure.ask && typeof ui.ask?.[structure.ask] !== 'string') {
      problems.push(`${where}: no ui.chapter.ask.${structure.ask}`);
    }

    if (structure.group && typeof ui.groups?.[structure.group] !== 'string') {
      problems.push(`${where}: no ui.chapter.groups.${structure.group}`);
    }

    (structure.figures ?? []).forEach((figure) =>
      problems.push(...figureProblems(figure, card.figure, card, where)),
    );

    problems.push(
      ...cardLinkProblems(
        structure,
        {
          en: nth(RAW_MESSAGES.en.chapters?.[meta.slug]?.categories, index),
          fr: nth(RAW_MESSAGES.fr.chapters?.[meta.slug]?.categories, index),
        },
        where,
        locale,
      ),
    );
  });

  problems.push(...startHereProblems(meta, chapter, at));
  problems.push(...bandProblems(meta, chapter, locale, at));

  if (meta.resourceLinks.length !== count(chapter.resources)) {
    problems.push(
      `${at} resource groups: ${meta.resourceLinks.length} in chapters-meta.ts, ${count(chapter.resources)} in messages`,
    );
  }

  if (meta.urgentExit) {
    const target = MESSAGES[locale].chapters?.[meta.urgentExit.chapter];

    if (!CHAPTER_META.some((c) => c.slug === meta.urgentExit.chapter)) {
      problems.push(`${at} urgentExit: '${meta.urgentExit.chapter}' is not an engine chapter`);
    } else if (typeof target?.urgent?.heading !== 'string') {
      problems.push(
        `${at} urgentExit: ${meta.urgentExit.chapter} has no emergency list in ${locale}.json`,
      );
    }

    if (
      typeof chapter.urgentExit?.lead !== 'string' ||
      typeof chapter.urgentExit?.link !== 'string'
    ) {
      problems.push(`${at} urgentExit: needs urgentExit.lead and urgentExit.link`);
    }
  }

  return problems;
}

/* The two message files carry the same strings, so neither locale falls back silently. */
function parityProblems() {
  const en = new Set(leafPaths(MESSAGES.en));
  const fr = new Set(leafPaths(MESSAGES.fr));

  return [
    ...[...en]
      .filter((path) => !fr.has(path))
      .map((path) => `fr.json ${NS}: no '${path}' (en.json has it)`),
    ...[...fr]
      .filter((path) => !en.has(path))
      .map((path) => `en.json ${NS}: no '${path}' (fr.json has it)`),
    ...[...en]
      .filter(
        (path) =>
          fr.has(path) && typeof valueAt(MESSAGES.fr, path) !== typeof valueAt(MESSAGES.en, path),
      )
      .map((path) => `${NS} '${path}' is a string in one locale and not the other`),
  ];
}

/*
 * French review gates, as production applies them: the crisis strip, the
 * routes to help and every figure on a card with urgent content never drop.
 * And every one of this site's own kinds waits on a gate of its own, as
 * chapters-meta.ts promises.
 */
function gateProblems() {
  const problems = [];

  CHAPTER_META.forEach((meta) =>
    meta.categories.forEach((structure, index) =>
      (structure.figures ?? []).forEach((figure) => {
        const protectedFigure =
          figure.kind === 'crisis' || figure.kind === 'routes' || structure.urgentContent;

        if (protectedFigure && !keepsFigure(figure, structure, 'fr', awaitsFrReview)) {
          problems.push(`fr ${meta.slug} card ${index + 1}: ${figure.kind} is hidden by a gate`);
        }

        if (!BASE_KINDS.has(figure.kind) && !figureGate(figure.kind)) {
          problems.push(
            `review-gates.ts: '${figure.kind}' is a Diabetes Care kind with no gate in GATED_KINDS`,
          );
        }
      }),
    ),
  );

  return problems;
}

/* The nurse's rulings and the held list point at things that exist. */
function rulingProblems() {
  const problems = [];
  const slugs = new Set(CHAPTER_META.map((meta) => meta.slug));

  [OPEN_RULINGS, HELD_COPY, PRE_PUBLISH_CHECKS].forEach((list, index) =>
    Object.keys(list)
      .filter((slug) => !slugs.has(slug))
      .forEach((slug) =>
        problems.push(
          `${['OPEN_RULINGS', 'HELD_COPY', 'PRE_PUBLISH_CHECKS'][index]}: '${slug}' is not an engine chapter`,
        ),
      ),
  );

  Object.entries(OPEN_RULINGS).forEach(([slug, rulings]) => {
    const ids = rulings.map((ruling) => ruling.id);

    if (new Set(ids).size !== ids.length) {
      problems.push(`OPEN_RULINGS ${slug}: duplicate ruling id`);
    }

    rulings.forEach((ruling) =>
      ruling.where
        .filter((path) => valueAt(MESSAGES.en, `chapters.${slug}.${path}`) === undefined)
        .forEach((path) =>
          problems.push(`OPEN_RULINGS ${slug} ${ruling.id}: '${path}' is not in en.json`),
        ),
    );
  });

  Object.entries(HELD_COPY).forEach(([slug, held]) => {
    const cards = CHAPTER_META.find((meta) => meta.slug === slug)?.categories.length ?? 0;

    held.items.forEach((item) =>
      item.cards
        .filter((card) => card < 1 || card > cards)
        .forEach((card) => problems.push(`HELD_COPY ${slug} '${item.topic}': no card ${card}`)),
    );
  });

  return problems;
}

/* French flags, re-review notes and structural exemptions name real strings. */
function flagProblems() {
  const isString = (locale, path) => typeof valueAt(MESSAGES[locale], path) === 'string';
  const leaves = leafPaths(MESSAGES.en);

  return [
    ...(RE_REVIEW_BASELINE
      ? []
      : [`core/scripts/${BASELINE_FILE} is missing, so corrections go unmarked`]),
    ...[...FR_AWAITING_REVIEW]
      .filter((path) => !isString('en', path) || !isString('fr', path))
      .map((path) => `FR_AWAITING_REVIEW: '${path}' is not a string in en.json and fr.json`),
    ...[...FR_AWAITING_REVIEW_PREFIXES, ...FR_REVIEWED_PREFIXES]
      .filter((prefix) => !leaves.some((path) => path.startsWith(prefix)))
      .map((prefix) => `French review prefix '${prefix}' names no ${NS} string`),
    ...Object.keys(RE_REVIEW_NOTES)
      .filter((path) => !RE_REVIEWS_PENDING.has(path))
      .map(
        (path) =>
          `RE_REVIEW_NOTES: '${path}' is not a correction — it is unchanged from ${BASELINE_FILE}, or not in it at all`,
      ),
    ...[...RE_REVIEWS_PENDING.keys()]
      .filter((path) => !isString('fr', path))
      .map((path) => `RE_REVIEWS_PENDING: '${path}' is not a string in fr.json`),
    ...Object.keys(STRUCTURAL)
      .filter((path) => !isString('en', path))
      .map((path) => `STRUCTURAL: '${path}' is not a string in en.json`),
    ...Object.keys(SHARED_SECTIONS)
      .filter((path) => typeof valueAt(MESSAGES.en.ui, path) !== 'object')
      .map((path) => `SHARED_SECTIONS: 'ui.${path}' is not in en.json`),
  ];
}

/* ------------------------------------------------------------------------- */
/* The landing page                                                           */
/* ------------------------------------------------------------------------- */

/*
 * =============================================================================
 * THE LANDING PAGE, AS ITS READER MEETS IT
 * =============================================================================
 * Every string under `ui.landingPage`, section by section in the order the
 * page renders, with what a reviewer cannot see from the words alone: where
 * each door and chip opens, which sources each fact and answer names, what a
 * line about Liivv itself rests on, and what is switched off today and why.
 * Then the landing's open questions and the wording it holds back, from
 * ./diabetes-care.landing.mjs.
 *
 * The structure is diabetes-care/landing-meta.ts, loaded as it ships; the
 * page itself is the shared engine's (_microsite/landing).
 * =============================================================================
 */

const LP = 'ui.landingPage';
const LANDING_ROUTE = '/liivv-health/diabetes-care';

/* The landing's sections, in render order: message key, heading, and what renders it. */
const LANDING_SECTIONS = [
  ['meta', 'Page title and search description', 'The browser tab and search results.'],
  [
    'hero',
    'Hero',
    'The word after the heading rotates through the five in `hero.words`, and stops for a reader who has asked for reduced motion. The first button opens the chapter rail (#where-are-you). The second opens the curated kits when a kit is listed (`kitsCta`) and the shelf (#shop-diabetes-care) otherwise (`shopCta`), so it never links to an anchor that is not on the page.',
  ],
  ['trust', 'Trust strip', null],
  ['doors', 'Where are you right now? — the situation doors (#doors)', null],
  ['types', 'Which diabetes? — the type chips (#which-diabetes)', null],
  ['facts', 'The fact band (#facts)', null],
  ['kits', 'Curated kits (#build-your-kit)', null],
  ['shop', 'The shelf (#shop-diabetes-care)', null],
  [
    'subscribe',
    'Subscribe & save (#subscriptions)',
    'The existing subscriptions band, with this page’s words. Subscriptions are on site-wide, and the owner says anything can be subscribed (B18, 2026-10-06); feature 3 is Ostomy’s plain-packaging feature, now that operations has confirmed plain packaging (B29).',
  ],
  [
    'chapters',
    'The chapter rail (#where-are-you)',
    'Every chapter the engine serves, in reading order, each with its own title and one-line description from its chapter messages. Every chapter’s back link comes here. The skip line renders only when the shelf does.',
  ],
  ['care', 'Care band (#care)', null],
  ['brands', 'Brands (#brands)', null],
  ['faq', 'Questions (#faq)', null],
  [
    'closing',
    'Closing (#manifesto)',
    'The kits button renders only when a kit is listed. "Subscribe & save" opens #subscriptions, and "Open a chapter" the chapter rail.',
  ],
  [
    'governance',
    'About this page — the governance block (#governance)',
    'The last section. It also carries the shared byline and review lines, the machine-translation notice on /fr and the commercial disclosure (`ui.governance`, in 00-shared.md), and lists every source the page names, once each. No byline or review line renders until a clinician is named (D18).',
  ],
];

const landingGateFor = (path) =>
  LANDING_GATED_COPY.find((group) =>
    group.paths.some((held) => {
      const rest = held.slice(NS.length + 1);

      return path === rest || path.startsWith(`${rest}.`);
    }),
  )?.gate;

const switchState = (gate) =>
  LANDING_GATES[gate] ? `\`${gate}\` is on — live` : `held until \`${gate}\` is switched on`;

/* A door's anchor as a place: `card-<n>` is a card, anything else a section of the chapter. */
function doorPlace(chapter, anchor) {
  const card = /^card-(\d+)$/.exec(anchor ?? '')?.[1];

  if (card) return { chapter, card: Number(card) };

  return anchor ? { chapter, anchor } : { chapter };
}

const engineServes = (slug) => CHAPTER_META.some((meta) => meta.slug === slug);

/* Whether a door renders today, and if not, why not. */
function doorState(door) {
  if (door.urgent) return 'renders always — the emergency route is never gated';
  if (door.funding) {
    return LANDING_GATES.fundingPage
      ? `renders (${switchState('fundingPage')})`
      : `${switchState('fundingPage')}: hidden until the Funding page exists`;
  }
  if (door.requires === 'chapterOnEngine' && !engineServes(door.chapter)) {
    return `hidden until \`${door.chapter}\` is on the chapter engine`;
  }

  return 'renders';
}

/* Whether a chip renders today, and where it goes. */
function chipTarget(chip, locale) {
  if (engineServes(TYPE_CHIPS_CHAPTER)) {
    return `opens ${placeName({ chapter: TYPE_CHIPS_CHAPTER, card: chip.card }, locale)}`;
  }

  if (chip.path && PATH_SLUGS.includes(chip.path)) {
    return `opens the path page \`${chip.path}\` until ${TYPE_CHIPS_CHAPTER} is on the engine`;
  }

  return `hidden: ${TYPE_CHIPS_CHAPTER} is not on the engine and there is no path page`;
}

const BASIS_NOTE = {
  owner: 'the owner’s word (2026-10-05, and the answers of 2026-10-06)',
  code: 'how the code on this branch behaves',
  page: 'how this page is built',
};

/* Where a linked phrase in an answer goes. */
function linkTargetNote(to, locale) {
  if (to.source) return `the source \`${to.source}\` (${sourceTitles([to.source], locale)})`;
  if (to.tel) return `\`tel:${to.tel}\``;
  if (to.email) return `\`mailto:${to.email}\``;
  if (to.page) return `a Liivv page, \`${to.page}\` (/fr gets the /fr prefix)`;

  return placeName(doorPlace(to.chapter, to.anchor), locale);
}

/* The words inside each `<link>` of an answer, in this locale. */
const linkedPhrases = (path, locale) =>
  linkParts(String(valueAt(RAW_MESSAGES[locale], path) ?? ''))
    .filter((part) => part.link !== undefined)
    .map((part) => part.text);

/* Every string under one landing section, with the notes its structure needs. */
function writeLandingSection(w, out, key, locale) {
  const base = `${LP}.${key}`;
  const node = valueAt(MESSAGES.en, base) ?? {};
  const line = (path) => out(`- ${ref(path.slice(LP.length + 1))} — ${w.text(path)}`);
  const all = (path) =>
    leafPaths(valueAt(MESSAGES.en, path) ?? {}).forEach((rest) => line(`${path}.${rest}`));
  const heldNote = (path) => {
    const gate = landingGateFor(path);

    return gate
      ? ` *(${switchState(gate)} — not rendered, and not sent to the browser while held)*`
      : '';
  };

  if (key === 'trust') {
    out(
      '*Four claims, in a row. Each is a promise about the service, so each says what it rests on. The basis is reviewer-only.*',
      '',
    );
    line(`${base}.label`);
    TRUST_ITEMS.forEach((item, index) => {
      const path = `${base}.items.${index + 1}`;

      out(
        `- ${ref(`trust.items.${index + 1}`)} — ${w.text(path)}  \n  *Rests on ${BASIS_NOTE[item.basis]}.*${heldNote(path)}`,
      );
    });

    return;
  }

  if (key === 'doors') {
    const gated = awaitsFrReview(FEATURES.doors, 'fr');

    out(
      '*Plain links above every shop surface, named after where the reader is. Nothing has to be opened, ticked or answered first. A door whose page is not live yet is left off rather than linked to an older page or to nowhere.*',
      '',
    );

    if (locale === 'fr' && gated) {
      out(
        `*French review gate \`${FEATURES.doors}\`: on /fr in production the doors stay off, and the section shows only the emergency route, in the approved words of ${URGENT_EXIT_CHAPTER}'s \`urgentExit\` ("${MESSAGES.fr.chapters?.[URGENT_EXIT_CHAPTER]?.urgentExit?.lead ?? '⚠ missing'}" → "${MESSAGES.fr.chapters?.[URGENT_EXIT_CHAPTER]?.urgentExit?.link ?? '⚠ missing'}"), linked to Staying Safe’s emergency list. **The French below is a draft that no one has reviewed.***`,
        '',
      );
    }

    out(`**${w.text(`${base}.heading`)}** ${ref('doors.heading')}`, '');
    SITUATION_DOORS.forEach((door, index) => {
      const at = `${base}.items.${index + 1}`;
      const target = door.funding
        ? `the Funding page (\`${LANDING_ROUTE}/funding\`)`
        : placeName(doorPlace(door.chapter, door.anchor), locale);

      out(
        `- **${w.text(`${at}.label`)}** ${ref(`doors.items.${index + 1}.label`)}${door.urgent ? ' *(emergency wording — told apart by its symbol, its rule and its second link, never by colour alone)*' : ''}`,
      );
      out(`  - ${w.text(`${at}.body`)} ${ref(`doors.items.${index + 1}.body`)}`);
      out(`  - Opens ${target}; ${doorState(door)}`);

      if (door.secondary) {
        out(
          `  - Second link: ${w.text(`${at}.secondary`)} ${ref(`doors.items.${index + 1}.secondary`)}`,
        );
        out(
          `    - Opens ${placeName(doorPlace(door.secondary.chapter, door.secondary.anchor), locale)}`,
        );
      }
    });

    return;
  }

  if (key === 'types') {
    out(
      `*A row of chips, one per type, each opening its Know Your Type card. The intro names its source: ${sourceTitles(TYPES_SOURCES, locale)}. The hints are link labels and state no fact; the MODY card they open carries the "International guidance" label.*`,
      '',
    );
    ['label', 'eyebrow', 'heading', 'body'].forEach((field) => line(`${base}.${field}`));
    TYPE_CHIPS.forEach((chip) => {
      const hint = valueAt(MESSAGES.en, `${base}.hints.${chip.id}`);

      out(
        `- ${ref(`types.chips.${chip.id}`)} — ${w.text(`${base}.chips.${chip.id}`)}${hint === undefined ? '' : `  \n  ${ref(`types.hints.${chip.id}`)} — ${w.text(`${base}.hints.${chip.id}`)}`}  \n  *${chipTarget(chip, locale)}*`,
      );
    });

    return;
  }

  if (key === 'facts') {
    out(
      '*Four numbers, each with the sources it rests on printed under it on the page. They replace the unsourced "10k+", "24/7", "19+" and "1 calm place" band.*',
      '',
    );
    ['label', 'eyebrow', 'heading', 'sourcesLabel'].forEach((field) => line(`${base}.${field}`));
    FACT_BAND.forEach((fact, index) => {
      const at = `${base}.items.${index + 1}`;

      out(
        `- **${w.text(`${at}.value`)}** ${ref(`facts.items.${index + 1}.value`)} ${w.text(`${at}.label`)} ${ref(`facts.items.${index + 1}.label`)}  \n  *Sources: ${sourceTitles(fact.sources, locale)}*`,
      );
    });

    return;
  }

  if (key === 'kits') {
    out(
      '*Renders only when a kit is listed in `DIABETES_LISTED_KIT_IDS` (dc-ids.ts), and none is: placements resumed on 2026-10-06 (B21), but no kit is listed until the owner verifies each one in kits-for-review.md (A4, E6). With no kit, the section, the hero’s kits button, the "Kits" shop room and the closing kits button all stay off. The walkthrough steps (`demo`) render with the kit walkthrough, which waits on an approved kit’s contents. The nurse-check sentence is held (E14).*',
      '',
    );
    all(base);

    return;
  }

  if (key === 'shop') {
    out(
      `*The existing shelf: up to 12 products from Shop Diabetes Care, filtered by room. Rooms are read from product names (shop-classify.ts; D16). The "Kits" room renders only with a listed kit. Insulin and glucagon ${LANDING_GATES.insulinReviewConfirmed ? 'have their own room, and each of their tiles carries `shop.reviewNotice`' : 'are left out of this preview'} (${switchState('insulinReviewConfirmed')}; E5). On /fr the insulin room and its products are always left out: insulin may not be advertised to Quebec (B11). They stay in the full shop.*`,
      '',
    );
    all(base);

    return;
  }

  if (key === 'care') {
    out(
      `*Two panels and Olivia. The first says who answers: Liivv’s Certified Diabetes Educators, for all of Canada (owner, A2, B5, B10; owner note 5, 2026-10-07). Its "Request a call" button (\`care.cde.cta\`, \`care.cde.ctaNote\`) is ${LANDING_GATES.cdeRequestReason ? 'live' : `off until \`cdeRequestReason\` is switched on (D3; B6)`}. The second, "Speak to a CDE" (\`care.chat\`), shows the CDEs’ general phone line and hours (\`contact\` in 00-shared.md; B9), then the existing chat button, which opens /account/virtual-care (B12: no "Available in Ontario" label). What CDE stands for is held (E13). Olivia helps with orders and restocks; she does not answer fit questions.*`,
      '',
    );
    all(base);

    return;
  }

  if (key === 'brands') {
    out(
      `*One pill per shopping brand family, each a link to the Diabetes Essentials shop filtered to that brand (\`shop-diabetes-care?brand=<slug>\`, in the page locale; its accessible name is \`brands.shop\`), shown only while that brand has a product on the shop shelf (on /fr, counted without insulin) (owner notes 9 and 10, 2026-10-07). In order: ${BRANDS.map((brand) => `${brand.name} (\`?brand=${brand.slug}\`, ${brand.logo ? `logo \`${brand.logo.split('/').pop()}\`, alt "${brand.name}"` : 'text'})`).join(', ')}. The logo files are the six the owner approved on 2026-10-07, from each maker’s own page (docs/diabetes-content/logo-sources.md); \`omnipod-trimmed.png\` is the Omnipod file with its white margins trimmed, and the Omnipod and Contour logos (the latter with its tagline) are shown taller. A brand with no file shows as its name, in a pill styled to match. The pill says mylife, not Ypsomed: the YpsoPump’s maker is mylife Diabetes Care Canada Inc. (\`mylife-about-ca\`). Not copy and never translated.*`,
      '',
    );
    all(base);

    return;
  }

  if (key === 'faq') {
    out(
      '*The first question is open; the rest are closed. Each answer lists its sources under it on the page. A question whose answer waits on a switch is left out whole — the page never shows a question without its answer.*',
      '',
    );
    ['label', 'heading', 'note'].forEach((field) => line(`${base}.${field}`));
    out('');
    FAQ_META.forEach((faq, index) => {
      const at = `${base}.items.${index + 1}`;
      const phrases = linkedPhrases(`${at}.a`, locale);

      out(`**${w.text(`${at}.q`)}** ${ref(`faq.items.${index + 1}.q`)}${heldNote(at)}`, '');
      out(`${w.text(`${at}.a`)} ${ref(`faq.items.${index + 1}.a`)}`, '');

      if (faq.sources.length) out(`*Sources: ${sourceTitles(faq.sources, locale)}*  `);
      if (faq.basis) out(`*About Liivv, rests on ${BASIS_NOTE[faq.basis]}.*  `);

      if (faq.locales) {
        out(
          `*Shown on /${faq.locales.join(' and /')} only${FR_HELD_COPY.includes(`${NS}.${at}`) ? ': insulin may not be advertised to Quebec (B11), so the question is not rendered on /fr and not sent to the French browser' : ''}.*  `,
        );
      }

      (faq.links ?? []).forEach((to, l) =>
        out(`*Link: "${phrases[l] ?? '⚠ no tagged phrase'}" → ${linkTargetNote(to, locale)}*  `),
      );
      out('');
    });

    return;
  }

  if (node && typeof node === 'object') all(base);
}

function writeLandingQuestions(out) {
  out('## Open questions', '');
  out(
    '*From the landing’s copy record (section D). Each is for the person named; the page shows the default described until it is answered. Reviewer-only: none of this renders on a page.*',
    '',
  );
  LANDING.openQuestions.forEach((q) => {
    out(`- **${q.id}** (${q.who}). ${q.question}  `);
    out(
      `  *Where:* ${q.where.length ? q.where.map((path) => ref(path)).join(', ') : 'no line of this page'}`,
    );
  });
  out('');
  out('**Answered by the source check, for the record:**', '');
  LANDING.settled.forEach((entry) => out(`- **${entry.id}.** ${entry.note}`));
  out('');

  const cell = (value) => String(value).replace(/\|/g, '\\|');

  out('## Held items', '');
  out(
    '*Wording the page would carry once the condition on the right is met (section E). Trust item 4, FAQ 2 and FAQ 5 are written and printed above, and are kept off the page and out of the browser by a switch in landing-meta.ts; **everything else here is in no message file, and renders on no page.***',
    '',
  );
  out('| # | Item | Where it goes | Draft wording | Releases when |');
  out('|---|---|---|---|---|');
  LANDING.heldItems.forEach((item) =>
    out(
      `| ${item.id} | ${cell(item.item)} | ${cell(item.where)} | ${cell(item.wording)} | ${cell(item.releases)} |`,
    ),
  );
  out('');
}

function writeLanding(locale) {
  const w = makeWriter(locale);
  const body = [];
  const out = (...l) => body.push(...l);

  LANDING_SECTIONS.forEach(([key, label, note]) => {
    out(`## ${label}`, '');

    if (note) out(`*${note}*`, '');

    writeLandingSection(w, out, key, locale);
    out('');
  });

  writeLandingQuestions(out);

  header(w, {
    title: 'Landing page',
    route: LANDING_ROUTE,
    source: `\`core/messages/${locale}.json\` → \`${NS}.ui.landingPage\`; structure in \`diabetes-care/landing-meta.ts\``,
    locale,
    note: `Every word of the landing, in the order the page renders it. References drop the leading \`ui.landingPage.\`. There are no testimonials and no unsourced numbers on the page: the four invented "voices" and the "10k+ / 24/7 / 19+ / 1 calm place" band are gone, and every number now names its source. On /fr the landing’s French ships flagged as machine translated (French review gate \`${FEATURES.landing}\` decides the draft marker on previews).`,
  });

  w.push(...body);

  return {
    file: '07-landing.md',
    title: 'Landing page',
    words: w.words(),
    content: w.lines.join('\n'),
  };
}

/* The landing's structure against its messages, its sources and its targets. */
function landingProblems() {
  const problems = [];
  const at = (path) => `landing-meta.ts: ${path}`;
  const lp = (locale) => valueAt(MESSAGES[locale], LP) ?? {};
  const cardCount = (slug) =>
    CHAPTER_META.find((meta) => meta.slug === slug)?.categories.length ?? 0;

  const checkPlace = (where, chapter, anchor) => {
    if (!chapter) return;

    if (!engineServes(chapter) && !PATH_SLUGS.includes(chapter)) {
      problems.push(at(`${where} opens '${chapter}', which no route serves`));
    }

    const card = /^card-(\d+)$/.exec(anchor ?? '')?.[1];

    if (card && engineServes(chapter) && (Number(card) < 1 || Number(card) > cardCount(chapter))) {
      problems.push(at(`${where} opens ${chapter} card ${card}, which does not exist`));
    }

    if (
      anchor &&
      !card &&
      !(
        anchor === DIABETES_SITE.anchors.redFlags.id &&
        chapter === DIABETES_SITE.anchors.redFlags.chapter
      )
    ) {
      problems.push(at(`${where} opens #${anchor} on ${chapter}, which is not a known anchor`));
    }
  };

  const checkSources = (where, ids) =>
    ids
      .filter((id) => !Object.hasOwn(SOURCE_META, id))
      .forEach((id) => problems.push(at(`${where}: unknown source id '${id}'`)));

  ['en', 'fr'].forEach((locale) => {
    const copy = lp(locale);
    const pairs = [
      ['SITUATION_DOORS', SITUATION_DOORS.length, 'doors.items'],
      ['FACT_BAND', FACT_BAND.length, 'facts.items'],
      ['FAQ_META', FAQ_META.length, 'faq.items'],
      ['TRUST_ITEMS', TRUST_ITEMS.length, 'trust.items'],
    ];

    pairs.forEach(([name, length, path]) => {
      if (count(valueAt(copy, path)) !== length) {
        problems.push(
          `${locale}.json ${LP}.${path} has ${count(valueAt(copy, path))} entries; ${name} has ${length}`,
        );
      }
    });

    SITUATION_DOORS.forEach((door, index) => {
      const hasSecondary = valueAt(copy, `doors.items.${index + 1}.secondary`) !== undefined;

      if (Boolean(door.secondary) !== hasSecondary) {
        problems.push(
          `${locale}.json ${LP}.doors.items.${index + 1}.secondary: ${door.secondary ? 'missing' : 'has no second link to label'}`,
        );
      }
    });

    TYPE_CHIPS.forEach((chip) => {
      if (valueAt(copy, `types.chips.${chip.id}`) === undefined) {
        problems.push(`${locale}.json ${LP}.types.chips.${chip.id}: missing`);
      }
    });

    Object.keys(valueAt(copy, 'types.hints') ?? {})
      .filter((id) => !TYPE_CHIPS.some((chip) => chip.id === id))
      .forEach((id) => problems.push(`${locale}.json ${LP}.types.hints.${id}: no such chip`));

    Object.keys(valueAt(copy, 'shop.rooms') ?? {})
      .filter((room) => !SHOP_ROOMS.includes(room))
      .forEach((room) =>
        problems.push(`${locale}.json ${LP}.shop.rooms.${room}: not in SHOP_ROOMS`),
      );

    SHOP_ROOMS.filter((room) => valueAt(copy, `shop.rooms.${room}`) === undefined).forEach((room) =>
      problems.push(`${locale}.json ${LP}.shop.rooms.${room}: missing`),
    );

    FAQ_META.forEach((faq, index) => {
      const tagged = linkCount(
        String(valueAt(RAW_MESSAGES[locale], `${LP}.faq.items.${index + 1}.a`) ?? ''),
      );

      if (tagged !== (faq.links ?? []).length) {
        problems.push(
          `${locale}.json ${LP}.faq.items.${index + 1}.a has ${tagged} <link> phrases; FAQ_META[${index}] names ${(faq.links ?? []).length} targets`,
        );
      }
    });

    if (!MESSAGES[locale].chapters?.[URGENT_EXIT_CHAPTER]?.urgentExit) {
      problems.push(
        `${locale}.json: ${URGENT_EXIT_CHAPTER} has no urgentExit for the doors' fallback`,
      );
    }
  });

  SITUATION_DOORS.forEach((door, index) => {
    const where = `SITUATION_DOORS[${index}] '${door.id}'`;

    if (Boolean(door.chapter) === Boolean(door.funding)) {
      problems.push(at(`${where} needs exactly one of chapter and funding`));
    }

    if (door.urgent && door.requires) {
      problems.push(at(`${where} is the emergency route and may not wait on anything`));
    }

    if (door.urgent && door.chapter !== DIABETES_SITE.anchors.redFlags.chapter) {
      problems.push(at(`${where} is the emergency route but does not open the red-flag chapter`));
    }

    checkPlace(where, door.chapter, door.anchor);

    if (door.secondary)
      checkPlace(`${where} secondary`, door.secondary.chapter, door.secondary.anchor);
  });

  TYPE_CHIPS.forEach((chip) => {
    if (chip.card < 1 || chip.card > cardCount(TYPE_CHIPS_CHAPTER)) {
      problems.push(
        at(
          `TYPE_CHIPS '${chip.id}' opens ${TYPE_CHIPS_CHAPTER} card ${chip.card}, which does not exist`,
        ),
      );
    }
  });

  checkSources('TYPES_SOURCES', TYPES_SOURCES);
  FACT_BAND.forEach((fact, index) => {
    if (!fact.sources.length) problems.push(at(`FACT_BAND[${index}] names no source`));

    checkSources(`FACT_BAND[${index}]`, fact.sources);
  });
  FAQ_META.forEach((faq, index) => {
    if (!faq.sources.length && !faq.basis) {
      problems.push(at(`FAQ_META[${index}] names no source and no basis`));
    }

    checkSources(`FAQ_META[${index}]`, faq.sources);
    (faq.links ?? [])
      .filter((to) => to.source)
      .forEach((to) => checkSources(`FAQ_META[${index}].links`, [to.source]));
    (faq.links ?? [])
      .filter((to) => to.chapter)
      .forEach((to) => checkPlace(`FAQ_META[${index}].links`, to.chapter, to.anchor));
    (faq.links ?? [])
      .filter((to) => to.page !== undefined && !String(to.page).startsWith('/'))
      .forEach((to) =>
        problems.push(at(`FAQ_META[${index}].links: '${to.page}' is not a Liivv path`)),
      );
    (faq.links ?? [])
      .filter((to) => to.tel !== undefined && to.tel !== '911')
      .filter((to) => `tel:${to.tel}` !== `tel:${DIABETES_SITE.contact?.tel}`)
      .forEach((to) =>
        problems.push(at(`FAQ_META[${index}].links: ${to.tel} is not 911 or the CDE contact`)),
      );

    if (faq.gate && !Object.hasOwn(LANDING_GATES, faq.gate)) {
      problems.push(at(`FAQ_META[${index}] waits on unknown switch '${faq.gate}'`));
    }
  });

  LANDING_GATED_COPY.forEach((group) => {
    if (!Object.hasOwn(LANDING_GATES, group.gate)) {
      problems.push(at(`LANDING_GATED_COPY: unknown switch '${group.gate}'`));
    }

    group.paths.forEach((path) => {
      ['en', 'fr'].forEach((locale) => {
        if (
          !path.startsWith(`${NS}.`) ||
          valueAt(MESSAGES[locale], path.slice(NS.length + 1)) === undefined
        ) {
          problems.push(at(`LANDING_GATED_COPY: '${path}' is not in ${locale}.json`));
        }
      });
    });
  });

  /* A gated question or trust item keeps its copy out of the browser too. */
  [
    ...FAQ_META.map((faq, index) => [faq.gate, `faq.items.${index + 1}`]),
    ...TRUST_ITEMS.map((item, index) => [item.gate, `trust.items.${index + 1}`]),
  ]
    .filter(([gate]) => gate)
    .forEach(([gate, path]) => {
      const full = `${NS}.${LP}.${path}`;

      if (!LANDING_GATED_COPY.some((group) => group.gate === gate && group.paths.includes(full))) {
        problems.push(at(`'${path}' waits on '${gate}' but is not in LANDING_GATED_COPY`));
      }
    });

  const entryIds = [
    ...LANDING.openQuestions.map((q) => q.id),
    ...LANDING.heldItems.map((e) => e.id),
  ];

  if (new Set(entryIds).size !== entryIds.length)
    problems.push('diabetes-care.landing.mjs: duplicate id');

  LANDING.openQuestions.forEach((q) =>
    q.where
      .filter((path) => valueAt(MESSAGES.en, `${LP}.${path}`) === undefined)
      .forEach((path) =>
        problems.push(`diabetes-care.landing.mjs ${q.id}: '${path}' is not in en.json`),
      ),
  );

  return problems;
}

/* ------------------------------------------------------------------------- */
/* The Funding & Coverage page                                                */
/* ------------------------------------------------------------------------- */

/*
 * =============================================================================
 * FUNDING & COVERAGE, AS ITS READER MEETS IT
 * =============================================================================
 * Every string under `funding` and `ui.funding{Page,Checker,Results}`, section
 * by section in the order the page renders, with what a reviewer cannot see
 * from the words alone: which register entries each line rests on, which
 * lines rest on the owner's word, every program on record with its official
 * page, check date and who it applies to, how the checker orders its results,
 * and what is switched off or held. Then the page's open questions, the
 * wording it holds back and the sources proposed to release it, from
 * ./diabetes-care.funding.mjs.
 *
 * The structure is diabetes-care/funding/funding-meta.ts, loaded as it ships.
 * =============================================================================
 */

const FUNDING_ROUTE = '/liivv-health/diabetes-care/funding';
const FUNDING_PAGE_FILE = join(DC, 'funding', 'page.tsx');

const YES_NO = { true: 'yes', false: 'no' };

/* What a program applies to, in words, for the reviewer. */
function appliesNote(rule) {
  const parts = [];

  if (rule.types) parts.push(`types: ${rule.types.join(', ')}`);
  if (rule.therapies) parts.push(`therapies: ${rule.therapies.join(', ')}`);
  if (rule.ages) parts.push(`ages: ${rule.ages.join(', ')}`);
  if (rule.alsoIfConsideringPump) parts.push('also shown, quieter, to a reader on injections');

  return parts.length ? parts.join('; ') : 'anyone in the jurisdiction';
}

const fundingCell = (value) => String(value).replace(/\|/g, '\\|');

function writeFundingSections(w, out, locale) {
  const line = (path) => {
    const sources = FUNDING_PAGE_SOURCES[path];
    const owner = FUNDING_OWNER_LINES.includes(path);
    const notes = [
      ...(sources ? [`Sources: ${sourceTitles(sources, locale)}`] : []),
      ...(owner ? ['About Liivv, rests on the owner’s word (2026-10-05)'] : []),
    ];

    out(`- ${ref(path)} — ${w.text(path)}${notes.length ? `  \n  *${notes.join('. ')}.*` : ''}`);
  };
  const lines = (base, keys) => keys.forEach((key) => line(`${base}.${key}`));
  const all = (base) =>
    leafPaths(valueAt(MESSAGES.en, base) ?? {}).forEach((rest) => line(`${base}.${rest}`));
  const programs = (ids) => FUNDING_PROGRAMS.filter((meta) => ids.includes(meta.id));
  const FP = 'ui.fundingPage';
  const gated = (gate) =>
    locale === 'fr' && awaitsFrReview(gate, 'fr')
      ? `*French review gate \`${gate}\`: on /fr in production this does not render. **The French below is a draft that no one has reviewed.***`
      : null;

  out('## Page title and search description', '');
  lines(FP, ['metaTitle', 'metaDescription']);
  out('');

  out('## Hero', '');
  out(
    `*The two buttons open the checker (#find-your-coverage) and the federal programs (#federal). On a preview, /fr shows the draft marker under the lead (French review gate \`funding\`).*`,
    '',
  );
  lines(FP, ['kicker', 'title', 'lead', 'ctaFind', 'ctaFederal']);
  out('');

  out('## Focus, vibe and the urgent signpost', '');
  out(
    `*Under the two notes, the page’s one urgent signpost, in the approved words of ${FUNDING_EXIT_CHAPTER}’s \`urgentExit\` ("${valueAt(MESSAGES[locale], `chapters.${FUNDING_EXIT_CHAPTER}.urgentExit.lead`) ?? '⚠ missing'}" → "${valueAt(MESSAGES[locale], `chapters.${FUNDING_EXIT_CHAPTER}.urgentExit.link`) ?? '⚠ missing'}"), linked to Staying Safe’s emergency list (#red-flags). Printed with that chapter. No review gate may hide it.*`,
    '',
  );
  lines(FP, ['focus', 'vibe']);
  out('');

  out('## How paying works (#paying)', '');
  out(
    `*Part 1 lists the provincial drug plans Liivv bills directly (\`DIRECT_BILLING\` in funding-meta.ts; owner answers A6 and B13, 2026-10-06: each Liivv pharmacy is enrolled with its own province's plan), each by the government's own name (\`directPlan\`, French only where the government prints one), linked to the page that names it; then why Quebec is not on it, and that no federal program, territorial plan or private insurer is. Part 2 is the programs that pay you back: Liivv gives an invoice for the claim (finance team, B13) and promises no claim will be accepted. Part 3, ${FUNDING_PAY_LATER.enabled ? `"${FUNDING_PAY_LATER.name}" (owner answer A5, ${FUNDING_PAY_LATER.approvedOn}), for insulin pump supplies, Omnipod pods included, after customer service checks eligibility; its terms mirror the owner's program, it never uses another company's program name, and under it is the general contact of Bayshore Express Pharmacy (\`contact\` in 00-shared.md), which passes the question on (B10). In a province, the checker's pump group also says it once, after its intro (\`ui.fundingResults.pumpPayLater\`), as Liivv's own option, separate from any program; no program card mentions it` : 'pay-later, has no markup and no copy while `PAY_LATER.enabled` is false (E-20)'}. No shop strip follows it: the owner removed the pump-supplies strip from this page on 2026-10-07 (note 7); Your Tools card 13 keeps it.*`,
    '',
  );
  lines(FP, [
    'payingEyebrow',
    'payingHeading',
    'payingIntro',
    'directHeading',
    'directBody',
    'directPlan',
  ]);
  FUNDING_DIRECT_BILLING.forEach((entry) =>
    out(
      `  - ${valueAt(MESSAGES[locale], `funding.provinceLabels.${entry.province}`) ?? entry.province}: **${locale === 'fr' && entry.planFr ? entry.planFr : entry.plan}**${entry.planFr ? ` (French name: ${entry.planFr})` : ''} — ${sourceTitles([entry.source], locale)}; enrolment confirmed by the owner ${entry.confirmedOn}`,
    ),
  );
  lines(FP, ['directQuebec', 'directOther', 'claimHeading', 'claimBody', 'claimCheck']);
  if (FUNDING_PAY_LATER.enabled) {
    out(
      '',
      `**${FUNDING_PAY_LATER.name}** (its heading is the program's name, from funding-meta.ts)`,
      '',
    );
    lines(FP, ['payLaterBody']);
    Object.keys(valueAt(MESSAGES.en, `${FP}.payLaterTerms`) ?? {}).forEach((key) =>
      line(`${FP}.payLaterTerms.${key}`),
    );
    lines(FP, ['payLaterContact']);
  }
  out('');

  out('## The checker (#find-your-coverage)', '');
  out(
    `*Seven questions; only the province is needed, and results show as soon as it is chosen. The progress line counts all seven, province included. The results are grouped in the owner’s order — ${FUNDING_RESULT_GROUPS.map((group) => `\`${group}\``).join(', ')} — after a Liivv card for Quebec or a territory, and end with "Can we bill your program for you?". An unanswered or "not sure" answer never hides a card; a program that does not take the reader’s type, therapy or age is left out; a group with programs on record that none of the answers fits says so, with each program’s own \`who\` line (and its note, where age ruled it out) and a link to the first one’s page; a group with nothing on record says "we’re still checking" and links Diabetes Canada’s 2024 comparisons. The sensor group says sensor programs are mostly for insulin users, and the pump group that pump programs are for people who use insulin, when the reader uses none. The Ontario Drug Benefit strips card is shown quieter for a reader aged 25 to 64, or 24 and under with a private plan, who would qualify only through another ODB route. Every program card shows the date its page was checked, and "Partly confirmed" where the check was partial. The answers stay in the page; nothing is saved or sent, and the page makes no promise about it yet (E-26). "Request a call" renders only once \`cdeRequestReason\` is on (landing D3).*`,
    '',
  );

  const checkerGate = gated('fundingChecker');

  if (checkerGate) {
    out(
      `${checkerGate} *In its place /fr shows every province and territory with its programs by their legal names, each linked to its official page with the date it was checked (and "Partly confirmed" where it applies), or the "still checking" line for one with none, then the caveat.*`,
      '',
    );
  }

  lines(FP, ['toolEyebrow', 'toolHeading', 'toolIntro']);
  out('', '**Questions and controls**', '');
  all('ui.fundingChecker');
  out('', '**Answer options**', '');
  all('funding.options');
  out('', '**Province and territory names** (the select, and the result titles)', '');
  all('funding.provinceLabels');
  out(
    '',
    '**Province and territory names with a preposition** (`provinceIn`, `provinceFor` in the result lines; French needs the article, so it cannot build them from the name. The English result lines print the plain name)',
    '',
  );
  all('funding.provinceForms');
  out('', '**Result group headings**', '');
  FUNDING_RESULT_GROUPS.forEach((group) => line(`funding.groups.${group}`));
  out('', '**Result cards that are not a program’s own**', '');
  all('ui.fundingResults');
  out('', '**Private insurance first, by province** (`PRIVATE_FIRST`)', '');
  all('funding.privateFirst');
  out('', '**Liivv’s own cards**', '');
  all('funding.liivv');
  out('');

  out('## Programs on record', '');
  out(
    `*Every program the checker can show and the federal section prints, in \`PROGRAM_META\` order. The name is the legal one and is never translated; an official French name, from the government's own site, shows on /fr where there is one (owner answer B25). "Pays" is how the program pays, from its own page — never how Liivv bills — and is reviewer-only. The first source is the card’s link. Phone numbers are the program's own, as its page prints them, each dialled as a tel: link (owner answer B22). Next recheck ${FUNDING_NEXT_CHECK}: ${FUNDING_RECHECK_OWNER} (core/scripts/check-funding-sources.mjs, which looks for each row's recheck phrases on its pages; owner answer B20).*`,
    '',
  );

  FUNDING_PROGRAMS.forEach((meta) => {
    const base = `funding.programs.${meta.id}`;

    out(`### ${meta.programName} \`${meta.id}\``, '');

    if (meta.programNameFr) out(`*Official French name:* ${meta.programNameFr}  `);

    out(
      `*${meta.jurisdiction === 'CA' ? 'Federal' : (valueAt(MESSAGES.en, `funding.provinceLabels.${meta.jurisdiction}`) ?? meta.jurisdiction)} · groups: ${meta.groups.join(', ')} · pays: ${meta.pays} · applies to: ${appliesNote(meta.appliesTo)} · checked ${meta.verifiedOn}${meta.confirm ? ' · **partly confirmed** (the card says to check with the program)' : ''}*  `,
      `*Sources: ${sourceTitles(meta.sources, locale)}*  `,
      ...(meta.phones ?? []).map(
        (group) =>
          `*Phone${group.office ? ` (${group.office}${group.officeFr ? ` / ${group.officeFr}` : ''})` : ''}: ${group.numbers
            .map(
              (phone) =>
                `${phone.number}${phone.ext?.length ? `, ext. ${phone.ext.join(' or ')}` : ''} (${phone.kind}${phone.area ? `, ${phone.area}` : ''})`,
            )
            .join(', ')} — as printed on ${sourceTitles([group.source], locale)}*  `,
      ),
      `*Recheck phrases: ${meta.checkPhrases.map((entry) => (typeof entry === 'string' ? `"${entry}"` : `"${entry.phrase}" on ${entry.source}${entry.fr ? ' (French)' : ''}`)).join('; ')}*`,
      '',
    );

    if (checkerGate && meta.jurisdiction !== 'CA') {
      out(
        '*On /fr in production only the name and link show, in the plain list (gate `fundingChecker`).*',
        '',
      );
    }

    ['covered', 'who', 'howToApply', 'notes'].forEach((key) => {
      if (valueAt(MESSAGES.en, `${base}.${key}`) !== undefined) line(`${base}.${key}`);
    });
    out('');
  });

  out(
    '**Held programs** — no row and no copy on the page; their wording is under "Held items" below:',
    '',
  );
  out(FUNDING_HELD_PROGRAM_IDS.map((id) => `\`${id}\``).join(', '), '');

  out('## Federal (#federal)', '');
  out(
    `*${FUNDING_FEDERAL_ROWS.length} rows, in the owner’s order: ${programs(
      FUNDING_FEDERAL_ROWS.map((row) => row.program),
    )
      .map((meta) => `\`${meta.id}\``)
      .join(
        ', ',
      )}. Each prints its heading, then the program’s own words (under "Programs on record" above), its phone numbers, its official page and the date it was checked. Never behind a gate.*`,
    '',
  );
  lines(FP, ['federalEyebrow', 'federalHeading']);
  FUNDING_FEDERAL_ROWS.forEach((row) => {
    line(`${FP}.${row.heading}`);

    if (row.program === 'fed-dtc') line(`${FP}.dtcNote`);
    if (row.program === 'fed-pharmacare') line(`${FP}.pharmacareSigned`);
  });
  out('');

  out('## What changed lately', '');
  lines(FP, ['changesEyebrow', 'changesHeading']);
  /* In the page's order, oldest first (CHANGES_ORDER in funding-meta.ts). */
  FUNDING_CHANGES_ORDER.forEach((key) => line(`${FP}.changes.${key}`));
  out('');

  out('## Quebec and the territories', '');
  lines(FP, ['whereEyebrow', 'whereHeading', 'whereBody']);
  out('');

  out('## When it isn’t enough', '');
  out('*Three cards. The second links its two sources under it.*', '');
  lines(FP, [
    'enoughEyebrow',
    'enoughHeading',
    'enough1Heading',
    'enough1Body',
    'enough2Heading',
    'enough2Body',
    'enough3Heading',
    'enough3Body',
  ]);
  out('');

  out('## If you change provinces', '');
  lines(FP, [
    'movingEyebrow',
    'movingHeading',
    'movingIntro',
    'beforeHeading',
    'before1',
    'before2',
    'arriveHeading',
    'arrive1',
    'arrive2',
  ]);
  out('');

  out('## CDE band (#cde)', '');
  out(
    `*National, with no "Available in Ontario" label. Under the body, the contact of Liivv’s Certified Diabetes Educators (\`contact\` in 00-shared.md: phone and hours; owner answers A2, B5, B9, B10, 2026-10-06; owner note 5, 2026-10-07). The "Request a call" button is ${LANDING_GATES.cdeRequestReason ? 'live' : 'off until `cdeRequestReason` is switched on (landing D3; B6)'}.*`,
    '',
  );
  lines(FP, ['cdeEyebrow', 'cdeHeading', 'cdeBody', 'cdeCta']);
  out('');

  out('## Closing', '');
  out(
    '*"Back to Diabetes Care" is the shared chapter label; the second button opens Your Tools.*',
    '',
  );
  lines(FP, ['closingHeading', 'closingBody', 'closingCta']);
  out('');

  out('## About this page — the governance block', '');
  out(
    '*It also carries the shared machine-translation notice on /fr and the commercial disclosure (`ui.governance`, in 00-shared.md), and lists every source the page names, once each. No byline or review line renders until a clinician is named.*',
    '',
  );
  line('funding.governance.disclaimer');
  out('');
}

function writeFundingRecord(out) {
  out('## Open questions', '');
  out(
    '*From the page’s copy record (section D). Each is for the person named; the page shows the default described until it is answered. Reviewer-only: none of this renders on a page.*',
    '',
  );
  FUNDING.openQuestions.forEach((q) => {
    out(`- **${q.id}** (${q.who}). ${q.question}  `);
    out(
      `  *Where:* ${q.where.length ? q.where.map((path) => ref(path)).join(', ') : 'no line of this page'}`,
    );
  });
  out('');
  out('**Answered, for the record:**', '');
  FUNDING.settled.forEach((entry) => out(`- **${entry.id}.** ${entry.note}`));
  out('');
  out('**Where the build had to choose:**', '');
  FUNDING.buildNotes.forEach((note) => out(`- ${note}`));
  out('');

  out('## Held items', '');
  out(
    '*Wording the page would carry once the source on the right is registered (section E). **None of it is in a message file, and none of it renders on any page.***',
    '',
  );
  out('| # | Item | Draft wording | Why held | Releases when |');
  out('|---|---|---|---|---|');
  FUNDING.heldItems.forEach((item) =>
    out(
      `| ${item.id} | ${fundingCell(item.item)} | ${fundingCell(item.wording)} | ${fundingCell(item.why)} | ${fundingCell(item.releases)} |`,
    ),
  );
  out('');

  out('## Sources proposed for the register', '');
  out(
    '*From the copy record (section F). None is registered: each needs its printed title recorded and a saved copy first. Registering one is what releases the held wording that names it.*',
    '',
  );
  out('| # | Proposed id | Link | Would back |');
  out('|---|---|---|---|');
  FUNDING.proposedSources.forEach((entry) =>
    out(
      `| ${entry.id} | \`${fundingCell(entry.source)}\` | ${entry.url.startsWith('https://') ? `<${entry.url}>` : fundingCell(entry.url)} | ${fundingCell(entry.backs)} |`,
    ),
  );
  out('');
}

function writeFunding(locale) {
  const w = makeWriter(locale);
  const body = [];
  const out = (...l) => body.push(...l);

  writeFundingSections(w, out, locale);
  writeFundingRecord(out);

  header(w, {
    title: 'Funding & Coverage',
    route: FUNDING_ROUTE,
    source: `\`core/messages/${locale}.json\` → \`${NS}.funding\` and \`${NS}.ui.funding{Page,Checker,Results}\`; structure in \`diabetes-care/funding/funding-meta.ts\``,
    locale,
    note: `Every word of the page, in the order it renders. References are paths under \`${NS}\`. The only plans named as billed directly by Liivv are the nine provincial drug plans (owner answer B13); pay-later is offered for insulin pump supplies only (owner answer A5); there is no product on the page. Every program links to the official page it rests on, with the date it was checked and its phone numbers. On /fr the page’s French ships flagged as machine translated (French review gate \`funding\` decides the draft marker on previews); the checker waits on its own gate, \`fundingChecker\`.`,
  });

  w.push(...body);

  return {
    file: '08-funding.md',
    title: 'Funding & Coverage',
    words: w.words(),
    content: w.lines.join('\n'),
  };
}

/* The page's structure against its messages, its sources and the record. */
function fundingProblems() {
  const problems = [];
  const at = (what) => `funding-meta.ts: ${what}`;
  const known = (id) => Object.hasOwn(SOURCE_META, id);
  const ids = FUNDING_PROGRAMS.map((meta) => meta.id);

  if (new Set(ids).size !== ids.length) problems.push(at('duplicate program id'));

  if (LANDING_GATES.fundingPage && !existsSync(FUNDING_PAGE_FILE)) {
    problems.push(
      'landing-meta.ts: `fundingPage` is on, but diabetes-care/funding/page.tsx is missing',
    );
  }

  FUNDING_PROGRAMS.forEach((meta) => {
    const where = `PROGRAM_META '${meta.id}'`;

    meta.sources
      .filter((id) => !known(id))
      .forEach((id) => problems.push(at(`${where}: unknown source id '${id}'`)));

    if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.verifiedOn))
      problems.push(at(`${where}: verifiedOn is not a date`));
    if (meta.jurisdiction !== 'CA' && !FUNDING_PROVINCES.includes(meta.jurisdiction)) {
      problems.push(at(`${where}: unknown jurisdiction '${meta.jurisdiction}'`));
    }

    meta.groups
      .filter((group) => !FUNDING_RESULT_GROUPS.includes(group))
      .forEach((group) => problems.push(at(`${where}: unknown group '${group}'`)));

    ['en', 'fr'].forEach((locale) => {
      const words = valueAt(MESSAGES[locale], `funding.programs.${meta.id}`);

      if (!words) {
        problems.push(`${locale}.json ${NS}.funding.programs.${meta.id}: missing`);

        return;
      }

      ['covered', 'who', 'howToApply', 'notes'].forEach((key) => {
        if (Boolean(meta.has[key]) !== (typeof words[key] === 'string')) {
          problems.push(
            `${locale}.json ${NS}.funding.programs.${meta.id}.${key}: ${meta.has[key] ? 'missing' : 'present, but `has` says it is not'}`,
          );
        }
      });
    });
  });

  ['en', 'fr'].forEach((locale) => {
    const copy = MESSAGES[locale].funding ?? {};

    Object.keys(copy.programs ?? {})
      .filter((id) => !ids.includes(id))
      .forEach((id) =>
        problems.push(`${locale}.json ${NS}.funding.programs.${id}: no row in PROGRAM_META`),
      );

    const sameKeys = (path, expected) => {
      const actual = Object.keys(valueAt(copy, path) ?? {});

      if (actual.length !== expected.length || expected.some((key) => !actual.includes(key))) {
        problems.push(
          `${locale}.json ${NS}.funding.${path}: keys ${actual.join(', ')}; expected ${expected.join(', ')}`,
        );
      }
    };

    sameKeys('provinceLabels', FUNDING_PROVINCES);
    sameKeys('groups', [...FUNDING_RESULT_GROUPS]);
    sameKeys('privateFirst', Object.keys(FUNDING_PRIVATE_FIRST));
    sameKeys('options.type', FUNDING_OPTIONS.type);
    sameKeys('options.therapy', FUNDING_OPTIONS.therapy);
    sameKeys('options.age', FUNDING_OPTIONS.age);
  });

  Object.entries(FUNDING_PRIVATE_FIRST).forEach(([province, rule]) => {
    if (!ids.includes(rule.program))
      problems.push(at(`PRIVATE_FIRST ${province}: no program '${rule.program}'`));
    if (!known(rule.source))
      problems.push(at(`PRIVATE_FIRST ${province}: unknown source id '${rule.source}'`));
  });

  /*
   * Direct billing: provincial drug plans only (owner answer B13), one per
   * province where Liivv has a pharmacy; never Quebec, a territory or a
   * federal program.
   */
  FUNDING_DIRECT_BILLING.forEach((entry) => {
    const where = `DIRECT_BILLING ${entry.province}`;

    if (
      !FUNDING_PROVINCES.includes(entry.province) ||
      ['QC', 'YT', 'NT', 'NU'].includes(entry.province)
    ) {
      problems.push(
        at(
          `${where}: only the provinces where Liivv has a pharmacy (Quebec's plan pays only Quebec pharmacies)`,
        ),
      );
    }
    if (!entry.plan) problems.push(at(`${where}: no plan name`));
    if (!known(entry.source)) problems.push(at(`${where}: unknown source id '${entry.source}'`));
    if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.confirmedOn))
      problems.push(at(`${where}: confirmedOn is not a date`));
  });

  if (
    new Set(FUNDING_DIRECT_BILLING.map((entry) => entry.province)).size !==
    FUNDING_DIRECT_BILLING.length
  )
    problems.push(at('DIRECT_BILLING: a province listed twice'));

  /* Phones (owner answer B22): as printed, from a registered page, never another retailer's line (A9). */
  FUNDING_PROGRAMS.forEach((meta) => {
    (meta.phones ?? []).forEach((group) => {
      if (!known(group.source))
        problems.push(at(`PROGRAM_META '${meta.id}' phone: unknown source id '${group.source}'`));

      group.numbers.forEach((phone) => {
        if (!/^(?:1-)?\d{3}-\d{3}-\d{4}$/.test(phone.number))
          problems.push(
            at(
              `PROGRAM_META '${meta.id}' phone '${phone.number}': not written as printed (1-800-555-0100)`,
            ),
          );
        if (phone.number.replace(/\D/g, '').endsWith('8664183392'))
          problems.push(
            at(`PROGRAM_META '${meta.id}' phone '${phone.number}': another retailer's line`),
          );
        if (phone.kind === 'tollFreeIn' && meta.jurisdiction === 'CA')
          problems.push(
            at(
              `PROGRAM_META '${meta.id}' phone: a federal number can't be toll-free in one province only`,
            ),
          );
      });
    });

    if (!meta.checkPhrases?.length)
      problems.push(at(`PROGRAM_META '${meta.id}': no recheck phrases (checkPhrases)`));

    (meta.checkPhrases ?? [])
      .filter((entry) => typeof entry !== 'string' && !known(entry.source))
      .forEach((entry) =>
        problems.push(
          at(`PROGRAM_META '${meta.id}' checkPhrases: unknown source id '${entry.source}'`),
        ),
      );
  });

  if (!/^\d{4}-\d{2}-\d{2}$/.test(FUNDING_NEXT_CHECK))
    problems.push(at('NEXT_CHECK is not a date'));

  FUNDING_FEDERAL_ROWS.forEach((row) => {
    if (!FUNDING_PROGRAMS.some((meta) => meta.id === row.program && meta.jurisdiction === 'CA')) {
      problems.push(at(`FEDERAL_ROWS: '${row.program}' is not a federal program`));
    }
  });

  Object.entries(FUNDING_PAGE_SOURCES).forEach(([path, sources]) => {
    if (typeof valueAt(MESSAGES.en, path) !== 'string')
      problems.push(at(`PAGE_SOURCES: '${path}' is not in en.json`));

    sources
      .filter((id) => !known(id))
      .forEach((id) => problems.push(at(`PAGE_SOURCES '${path}': unknown source id '${id}'`)));
  });

  FUNDING_OWNER_LINES.filter((path) => typeof valueAt(MESSAGES.en, path) !== 'string').forEach(
    (path) => problems.push(at(`OWNER_LINES: '${path}' is not in en.json`)),
  );

  const changes = Object.keys(valueAt(MESSAGES.en, 'ui.fundingPage.changes') ?? {});

  changes
    .filter((key) => !FUNDING_PAGE_SOURCES[`ui.fundingPage.changes.${key}`]?.length)
    .forEach((key) => problems.push(at(`PAGE_SOURCES: dated change ${key} names no source`)));

  /*
   * Pay-later stays out of the words until the owner switches it on, and is
   * never called by another company's program name.
   */
  leafPaths(MESSAGES.en)
    .concat(leafPaths(MESSAGES.fr))
    .filter((path) =>
      /pump now,? pay later/i.test(
        String(valueAt(MESSAGES.en, path) ?? '') + String(valueAt(MESSAGES.fr, path) ?? ''),
      ),
    )
    .forEach((path) =>
      problems.push(`${NS}.${path}: uses another company's pay-later program name`),
    );

  if (!FUNDING_PAY_LATER.enabled) {
    leafPaths(MESSAGES.en)
      .filter((path) => path.startsWith('funding.') || path.startsWith('ui.funding'))
      .filter((path) => /pay later|pay-later|buy now/i.test(String(valueAt(MESSAGES.en, path))))
      .forEach((path) =>
        problems.push(`en.json ${NS}.${path}: mentions paying later while PAY_LATER is off`),
      );
  }

  const entryIds = [
    ...FUNDING.openQuestions.map((q) => q.id),
    ...FUNDING.settled.map((s) => s.id),
    ...FUNDING.heldItems.map((e) => e.id),
    ...FUNDING.proposedSources.map((f) => f.id),
  ];

  if (new Set(entryIds).size !== entryIds.length)
    problems.push('diabetes-care.funding.mjs: duplicate id');

  FUNDING.openQuestions.forEach((q) =>
    q.where
      .filter((path) => valueAt(MESSAGES.en, path) === undefined)
      .forEach((path) =>
        problems.push(`diabetes-care.funding.mjs ${q.id}: '${path}' is not in en.json`),
      ),
  );

  return problems;
}

/* ------------------------------------------------------------------------- */
/* The path pages                                                             */
/* ------------------------------------------------------------------------- */

/*
 * =============================================================================
 * THE FIVE PATH PAGES, AS THEIR READERS MEET THEM
 * =============================================================================
 * Every string under `paths` and `ui.path`, path by path in the order the page
 * renders: the hero, the intro with the register entries behind each
 * paragraph, the reading list with the card each entry opens and the sources
 * behind each reason that states a fact, the Funding door and the pharmacist
 * band. Then the paths' open questions, what they hold back, the sources
 * proposed to release it and the locator notes due, from
 * ./diabetes-care.paths.mjs.
 *
 * A card's title, and its chapter's, are printed beside each entry for the
 * reviewer: they are that chapter's own words, reviewed in its own file, and
 * the page reads them from there rather than retyping them.
 *
 * The structure is diabetes-care/chapters/paths-meta.ts, loaded as it ships.
 * =============================================================================
 */

const PATHS_FILE = '09-paths.md';
const PATH_STAGES = ['start', 'types', 'safe', 'tools', 'everyday', 'season'];
/* Words that would promise billing or credit Liivv has not confirmed (paths-meta.ts). */
const PATH_FORBIDDEN =
  /pay later|pay-later|buy now|bills? (?:your program )?directly|direct[- ]bill/i;

const pathCell = (value) => String(value).replace(/\|/g, '\\|');

/* The card an entry opens, as the reviewer needs it: chapter, number, title and link. */
function pathCardNote(entry, locale) {
  const meta = CHAPTER_META.find((chapter) => chapter.slug === entry.chapter);
  const chapterTitle =
    valueAt(MESSAGES[locale], `chapters.${entry.chapter}.title`) ?? `⚠ ${entry.chapter}`;
  const title =
    valueAt(MESSAGES[locale], `chapters.${entry.chapter}.categories.${entry.card}.title`) ??
    '⚠ no such card';

  return `Chapter ${meta?.num ?? '?'} · ${chapterTitle}, card ${entry.card}: “${title}” (\`${entry.chapter}#card-${entry.card}\`)`;
}

function writePathsShared(w, out) {
  const line = (path) => out(`- ${ref(path)} — ${w.text(path)}`);

  out('## Labels every path page shares', '');
  out(
    '*The kicker over the hero, the reading list and the rail; the rail’s heading; each entry’s chapter label and link text; and the stage headings over the reading list.*',
    '',
  );
  ['kicker', 'allPaths', 'chapterLabel', 'readCard'].forEach((key) => line(`ui.path.${key}`));
  PATH_STAGES.forEach((stage) => line(`ui.path.stages.${stage}`));
  out('');

  out('## The emergency signpost on every path', '');
  out(
    '*Under the intro on every path, Prediabetes included, linked to Staying Safe’s emergency list (`staying-safe#red-flags`). Know Your Type’s approved `urgentExit` lead, with the link naming the list. Never gated and never collapsible.*',
    '',
  );
  line('ui.path.safety.lead');
  line('ui.path.safety.link');
  out('');
}

function writePath(w, out, meta, locale) {
  const base = `paths.${meta.slug}`;
  const sourced = (ids, fallback) => {
    if (ids?.length) return `  \n  *Sources: ${sourceTitles(ids, locale)}.*`;

    return fallback ? `  \n  *${fallback}*` : '';
  };
  const line = (path, ids, fallback) =>
    out(`- ${ref(path)} — ${w.text(path)}${sourced(ids, fallback)}`);
  const held = !PATH_GATES.cdeBand;

  out(`## ${valueAt(MESSAGES.en, `${base}.title`)} — \`${ROUTE}${meta.slug}\``, '');

  out('### Hero and intro', '');
  out(
    '*The hero’s one button reads the list heading and jumps to the list. The emergency signpost (above) follows the intro.*',
    '',
  );
  line(`${base}.title`);
  line(`${base}.heroBody`);
  line(`${base}.intro.eyebrow`);
  line(`${base}.intro.heading`);
  Object.keys(valueAt(MESSAGES.en, `${base}.intro.body`) ?? {}).forEach((key, index) =>
    line(
      `${base}.intro.body.${key}`,
      meta.introSources[index],
      'Navigation and framing; states no fact.',
    ),
  );
  out('');

  out('### Reading list', '');
  out(
    `*${meta.entries.length} cards, in this order, under the stage headings shown. Each links to the card in the page locale; the card’s title is its chapter’s own.*`,
    '',
  );
  line(`${base}.list.heading`);
  line(`${base}.list.intro`);

  let stage = null;

  meta.entries.forEach((entry, index) => {
    if (entry.stage !== stage) {
      stage = entry.stage;
      out('', `**${valueAt(MESSAGES[locale], `ui.path.stages.${stage}`) ?? stage}**`, '');
    }

    const path = `${base}.list.reasons.${index + 1}`;
    const facts = entry.sources?.length
      ? `Sources: ${sourceTitles(entry.sources, locale)}${entry.international ? ' — international guidance' : ''}.`
      : 'Navigation; states no fact.';

    out(`${index + 1}. ${pathCardNote(entry, locale)}  `);
    out(`   ${ref(path)} — ${w.text(path)}  `);
    out(`   *${facts}*`);
  });
  out('');

  out('### Funding & Coverage door', '');
  out(
    `*${LANDING_GATES.fundingPage ? 'Renders, and opens /liivv-health/diabetes-care/funding in the page locale' : 'Hidden until the Funding page exists'}. Nothing is paid for later. ${meta.slug === 'prediabetes' ? 'No supply claim (Q3).' : '"At Liivv, our pharmacy in your province bills your provincial drug plan for what it covers, except in Quebec…" is the Funding page’s how-paying-works fact (owner answers A6 and B13, 2026-10-06; DIRECT_BILLING in funding-meta.ts), and it promises no claim route for other programs (P2).'} ${SHOP.pathShelf(meta.slug) ? `Just above it, the path's shop strip (\`#path-shop\`, PATH_SHELVES in chapter-shop.ts; B21): ${shelfSummary(SHOP.pathShelf(meta.slug), locale)}.` : 'No shop strip above it: Prediabetes never gets one.'}*`,
    '',
  );
  line(`${base}.funding.heading`);
  line(`${base}.funding.body`, meta.fundingSources);
  line(`${base}.funding.cta`);
  out('');

  out('### Pharmacist CDE band', '');

  if (!meta.pharmacist) {
    out('*None on this path: the band is for pump and CGM questions (Q3).*', '');

    return;
  }

  out(
    held
      ? '*Rests on the owner’s word. **Held, and not sent to the browser**, while `cdeBand` is off (paths-meta.ts).*'
      : `*Rests on the owner’s answers of 2026-10-06 (A1, A2, B5, B9, B10, B11), and on owner note 5 of 2026-10-07 (the service is Liivv’s). Renders (\`cdeBand\` is on), with the contact of Liivv’s Certified Diabetes Educators under the body (\`contact\` in 00-shared.md: phone and hours). Its "Request a call" (\`cta\`) ${LANDING_GATES.cdeRequestReason ? 'renders, opening the appointment page' : 'stays off until `cdeRequestReason` is switched on (landing D3; B6)'}.*`,
    '',
  );
  ['eyebrow', 'heading', 'body', 'cta'].forEach((key) => line(`${base}.pharmacist.${key}`));
  out('');
}

function writePathsRecord(out) {
  out('## Open questions', '');
  out(
    '*From the paths’ copy record (section G), and two raised by the build (P1, P2). Each is for the person named; the pages show the default described until it is answered. Reviewer-only: none of this renders on a page.*',
    '',
  );
  PATHS.openQuestions.forEach((q) => {
    out(`- **${q.id}** (${q.who}). ${q.question}  `);
    out(
      `  *Where:* ${q.where.length ? q.where.map((path) => ref(path)).join(', ') : 'no line of these pages'}`,
    );
  });
  out('');
  out('**Answered, for the record:**', '');
  PATHS.settled.forEach((entry) => out(`- **${entry.id}.** ${entry.note}`));
  out('');
  out('**Where the build had to choose:**', '');
  PATHS.buildNotes.forEach((note) => out(`- ${note}`));
  out('');

  out('## Held items', '');
  out(
    '*Held by policy, or for want of a source (section E). **None of it is in a message file, and none of it renders on any page.** The CDE band above was held here until `cdeBand` was switched on (2026-10-06).*',
    '',
  );
  out('| # | Item | Where it goes | Draft wording | Releases when |');
  out('|---|---|---|---|---|');
  PATHS.heldItems.forEach((item) =>
    out(
      `| ${item.id} | ${pathCell(item.item)} | ${pathCell(item.where)} | ${pathCell(item.wording)} | ${pathCell(item.releases)} |`,
    ),
  );
  out('');

  out('## Sources proposed for the register', '');
  out(
    '*From the copy record (section F.1–F.3). None is registered, and nothing on the pages depends on one; registering one is what releases the held wording that names it.*',
    '',
  );
  out('| # | Proposed id | Link | Would back |');
  out('|---|---|---|---|');
  PATHS.proposedSources.forEach((entry) =>
    out(
      `| ${entry.id} | \`${pathCell(entry.source)}\` | <${entry.url}> | ${pathCell(entry.backs)} |`,
    ),
  );
  out('');

  out('## Locator notes due before release', '');
  out(
    '*From the copy record (section F.4): notes for sources already registered, to add in `diabetes-care/chapters/sources-review.ts`. The lines they back ship now, because the source check read each fact on the live page.*',
    '',
  );
  out('| Source | Add or change | Backs |');
  out('|---|---|---|');
  PATHS.locatorNotes.forEach((entry) =>
    out(`| \`${pathCell(entry.source)}\` | ${pathCell(entry.note)} | ${pathCell(entry.backs)} |`),
  );
  out('');
}

function writePaths(locale) {
  const w = makeWriter(locale);
  const body = [];
  const out = (...l) => body.push(...l);

  writePathsShared(w, out);
  PATH_META.forEach((meta) => writePath(w, out, meta, locale));
  writePathsRecord(out);

  header(w, {
    title: 'Path pages',
    route: `${ROUTE}{${PATH_SLUGS.join(', ')}}`,
    source: `\`core/messages/${locale}.json\` → \`${NS}.paths\` and \`${NS}.ui.path\`; structure in \`diabetes-care/chapters/paths-meta.ts\``,
    locale,
    note: `Every word of the five path pages, in the order each renders. References are paths under \`${NS}\`. A path writes no card of its own: each entry is a card’s title as its chapter holds it, with the reason it is on this path. There is no product on any path and nothing paid for later; the only billing the doors describe is Liivv’s pharmacy in each province billing that province’s drug plan (owner answer B13). Every reason that states a fact names its sources. On /fr the paths’ French ships flagged as machine translated (French review gate \`paths\` decides the draft marker on previews).`,
  });

  w.push(...body);

  return {
    file: PATHS_FILE,
    title: 'Path pages',
    words: w.words(),
    content: w.lines.join('\n'),
  };
}

/* The paths' structure against their messages, the chapters they open, their sources and the record. */
function pathsProblems() {
  const problems = [];
  const at = (what) => `paths-meta.ts: ${what}`;
  const known = (id) => Object.hasOwn(SOURCE_META, id);
  const international = (id) => String(SOURCE_REVIEW[id]?.type ?? '').startsWith('international');
  const slugs = new Set(PATH_SLUGS);

  if (slugs.size !== PATH_SLUGS.length) problems.push(at('duplicate path slug'));

  PATH_SLUGS.filter((slug) => CHAPTER_META.some((meta) => meta.slug === slug)).forEach((slug) =>
    problems.push(at(`'${slug}' is also a chapter slug`)),
  );

  if (
    !PATH_DISCLAIMER_CHAPTER ||
    !CHAPTER_META.some((meta) => meta.slug === PATH_DISCLAIMER_CHAPTER)
  ) {
    problems.push(at(`PATH_DISCLAIMER_CHAPTER '${PATH_DISCLAIMER_CHAPTER}' is not a chapter`));
  }

  ['en', 'fr'].forEach((locale) => {
    const copy = MESSAGES[locale].paths ?? {};

    Object.keys(copy)
      .filter((slug) => !slugs.has(slug))
      .forEach((slug) => problems.push(`${locale}.json ${NS}.paths.${slug}: no row in PATH_META`));

    PATH_STAGES.forEach((stage) => {
      if (typeof valueAt(MESSAGES[locale], `ui.path.stages.${stage}`) !== 'string') {
        problems.push(`${locale}.json ${NS}.ui.path.stages.${stage}: missing`);
      }
    });
  });

  PATH_META.forEach((meta) => {
    const where = `'${meta.slug}'`;
    const ids = [
      ...meta.introSources.flat(),
      ...meta.fundingSources,
      ...meta.entries.flatMap((entry) => entry.sources ?? []),
    ];

    ids
      .filter((id) => !known(id))
      .forEach((id) => problems.push(at(`${where}: unknown source id '${id}'`)));

    ['en', 'fr'].forEach((locale) => {
      const words = valueAt(MESSAGES[locale], `paths.${meta.slug}`);

      if (!words) {
        problems.push(`${locale}.json ${NS}.paths.${meta.slug}: missing`);

        return;
      }

      const reasons = Object.keys(words.list?.reasons ?? {});
      const expected = meta.entries.map((_, index) => String(index + 1));

      if (reasons.join() !== expected.join()) {
        problems.push(
          `${locale}.json ${NS}.paths.${meta.slug}.list.reasons: keys ${reasons.join(', ')}; PATH_META has ${meta.entries.length} entries`,
        );
      }

      const paragraphs = Object.keys(words.intro?.body ?? {}).length;

      if (paragraphs !== meta.introSources.length) {
        problems.push(
          at(
            `${where}: ${meta.introSources.length} introSources for ${paragraphs} intro paragraphs (${locale})`,
          ),
        );
      }

      if (Boolean(words.pharmacist) !== meta.pharmacist) {
        problems.push(
          `${locale}.json ${NS}.paths.${meta.slug}.pharmacist: ${meta.pharmacist ? 'missing' : 'present, but PATH_META says the path has no band'}`,
        );
      }
    });

    meta.entries.forEach((entry, index) => {
      const row = `${where} row ${index + 1}`;
      const chapter = CHAPTER_META.find((item) => item.slug === entry.chapter);

      if (!PATH_STAGES.includes(entry.stage))
        problems.push(at(`${row}: unknown stage '${entry.stage}'`));

      if (!chapter) {
        problems.push(at(`${row}: '${entry.chapter}' is not an engine chapter`));

        return;
      }

      if (entry.card < 1 || entry.card > chapter.categories.length) {
        problems.push(at(`${row}: ${entry.chapter} has no card ${entry.card}`));
      }

      ['en', 'fr'].forEach((locale) => {
        if (
          typeof valueAt(
            MESSAGES[locale],
            `chapters.${entry.chapter}.categories.${entry.card}.title`,
          ) !== 'string'
        ) {
          problems.push(
            `${locale}.json ${NS}.chapters.${entry.chapter}.categories.${entry.card}.title: missing (${row})`,
          );
        }
      });

      /* An international source is cited only where the reason says so, and says so only with one. */
      const intl = (entry.sources ?? []).filter(international);

      if (intl.length && !entry.international) {
        problems.push(
          at(`${row}: cites ${intl.join(', ')} (international) but is not marked international`),
        );
      }

      if (entry.international && !intl.length) {
        problems.push(at(`${row}: marked international but cites no international source`));
      }
    });

    /* Prediabetes has no supply framing: no tools, no band, no Your Tools card. */
    if (meta.slug === 'prediabetes') {
      if (meta.pharmacist) problems.push(at(`${where}: no pharmacist band on prediabetes`));

      meta.entries
        .filter((entry) => entry.stage === 'tools' || entry.chapter === 'your-tools')
        .forEach(() => problems.push(at(`${where}: a tools or Your Tools entry on prediabetes`)));
    }
  });

  ['en', 'fr'].forEach((locale) =>
    leafPaths(MESSAGES[locale])
      .filter((path) => path.startsWith('paths.') || path.startsWith('ui.path.'))
      .forEach((path) => {
        const value = String(valueAt(MESSAGES[locale], path));

        if (PATH_FORBIDDEN.test(value)) {
          problems.push(`${locale}.json ${NS}.${path}: promises direct billing or paying later`);
        }

        if (/diabetes express/i.test(value)) {
          problems.push(`${locale}.json ${NS}.${path}: names Diabetes Express`);
        }
      }),
  );

  heldPathPaths()
    .filter((path) => valueAt(MESSAGES.en, path.slice(NS.length + 1)) === undefined)
    .forEach((path) => problems.push(at(`heldPathPaths: '${path}' is not in en.json`)));

  const entryIds = [
    ...PATHS.openQuestions.map((q) => q.id),
    ...PATHS.settled.map((s) => s.id),
    ...PATHS.heldItems.map((e) => e.id),
    ...PATHS.proposedSources.map((f) => f.id),
  ];

  if (new Set(entryIds).size !== entryIds.length) {
    problems.push('diabetes-care.paths.mjs: duplicate id');
  }

  PATHS.openQuestions.forEach((q) =>
    q.where
      .filter((path) => valueAt(MESSAGES.en, path) === undefined)
      .forEach((path) =>
        problems.push(`diabetes-care.paths.mjs ${q.id}: '${path}' is not in en.json`),
      ),
  );

  PATHS.proposedSources
    .filter((entry) => known(entry.source))
    .forEach((entry) =>
      problems.push(
        `diabetes-care.paths.mjs ${entry.id}: '${entry.source}' is registered now; move it out of proposedSources`,
      ),
    );

  return problems;
}

/* ------------------------------------------------------------------------- */
/* Run                                                                        */
/* ------------------------------------------------------------------------- */

/* Every gate a placed module or a chapter section waits on, and what waits behind it. */
function gateEntries() {
  const gates = new Map();
  const place = (id, where) => {
    if (!gates.has(id)) gates.set(id, []);

    gates.get(id).push(where);
  };

  CHAPTER_META.forEach((meta) => {
    meta.categories.forEach((structure, index) =>
      (structure.figures ?? []).forEach((figure) => {
        const at = `\`${figure.kind}\`, Chapter ${meta.num}, card ${index + 1}`;
        const gate = figureGate(figure.kind);

        if (gate) {
          place(
            gate,
            keepsFigure(figure, structure, 'fr', awaitsFrReview)
              ? `${at} — on an urgent card, so it renders on /fr anyway and its French is live; the gate decides only the draft marker on previews`
              : at,
          );
        }

        if (figure.kind === 'lanes') {
          place(
            FEATURES.laneExtras,
            `${at} — its tick boxes, its link labels and every lane with no sentence of the card's own`,
          );
        }
      }),
    );

    if (meta.shelf) place(FEATURES.shelf, `the resources shelf, Chapter ${meta.num}`);

    if (meta.programsBandLinks?.some((links) => links.length)) {
      place(FEATURES.bandLinks, `the referral band's links, Chapter ${meta.num}`);
    }
  });

  place(
    FEATURES.doors,
    'the situation doors on the landing page — on /fr in production the section shows only the emergency route, in words the chapters already carry',
  );
  place(
    FEATURES.landing,
    "the landing page's own French — it ships on /fr flagged as machine translated, so this gate decides only the draft marker on previews",
  );
  place(
    'funding',
    "the Funding & Coverage page's own French — it ships on /fr flagged as machine translated, so this gate decides the draft marker on previews, and whether the page's /fr URL is in the sitemap",
  );
  place(
    'fundingChecker',
    "the funding checker — on /fr in production the section shows a plain list of each province's programs instead, each linked to its official page with the date it was checked",
  );
  place(
    'paths',
    "the five path pages' own French — it ships on /fr flagged as machine translated, so this gate decides the draft marker on previews, and whether the paths' /fr URLs are in the sitemap",
  );
  place(
    'shop',
    "the Diabetes Essentials shop's own French (its headings, filter labels and product-type names) — it ships on /fr, so this gate decides only the draft marker on previews",
  );

  return [...gates.entries()].map(([id, where]) => {
    const state = awaitsFrReview(id, 'fr') ? '' : ' *(signed off — live on /fr)*';

    return `- \`${id}\`${state} — ${where.join('; ')}`;
  });
}

function readme(results, coverage) {
  const rulings = CHAPTER_META.flatMap((meta) => {
    const open = (OPEN_RULINGS[meta.slug] ?? []).filter((ruling) => !ruling.settled);

    return open.length
      ? [
          `- [${meta.num}-${meta.slug}.md](en/${meta.num}-${meta.slug}.md): ${open.length} open rulings (${open.map((r) => r.id).join(', ')}), ${(HELD_COPY[meta.slug]?.items ?? []).length} held items`,
        ]
      : [];
  });

  return [
    '# Diabetes Care microsite — content review',
    '**Prepared for:** Liivv management and clinical review  ',
    `**Covers:** the landing page of \`/liivv-health/diabetes-care\`, the chapters the shared chapter engine serves, the Funding & Coverage page and the five path pages, in English and French  `,
    stamp(),
    '',
    "> **These files are generated from the site's own sources.** Do not edit them. Mark corrections against the reference beside each line — the change is made in the source, and the files are generated again. That way the text you approve is the text that ships, and the two cannot drift apart.",
    '',
    '## How to review',
    '',
    '1. Start with the English files. The English has been checked against its sources, and no clinician has signed it off yet: no page carries a byline or a review date.',
    '2. Each chapter file ends with **Questions for the nurse** — the defaults the copy uses where the sources disagree, each with where it appears and the alternative — and **Held for want of a source**, the wording left out and why. Rule on those first.',
    `3. The French is machine translated and nobody has reviewed any of it. In the French files, lines marked ${FR_REVIEW_MARK} show on /fr now with no review gate in front of them; the rest wait behind one of the gates listed below.`,
    '4. For each correction, give the file and the reference — for example *02, card 8, `8.s4.1`* — and the corrected wording.',
    '5. Every card lists the sources its sentences rest on, and every file ends with a table of them: publisher, type and the passage cited. A manufacturer-run (industry) source is never the only source for a claim.',
    '',
    '## Files',
    '',
    '| File | Page | Words (EN) |',
    '|---|---|---|',
    ...results.en.map(
      (d) =>
        `| [${d.file}](en/${d.file}) · [FR](fr/${d.file}) | ${d.title} | ${d.words.toLocaleString('en-CA')} |`,
    ),
    `| | **Total** | **${results.en.reduce((a, d) => a + d.words, 0).toLocaleString('en-CA')}** |`,
    '',
    '## Open with the nurse',
    '',
    ...(rulings.length ? rulings : ['- Nothing is open.']),
    `- [07-landing.md](en/07-landing.md): ${LANDING.openQuestions.length} open questions for the owner, the nurse, operations and engineering (${LANDING.openQuestions.map((q) => q.id).join(', ')}), ${LANDING.heldItems.length} held items`,
    `- [08-funding.md](en/08-funding.md): ${FUNDING.openQuestions.length} open questions for the owner, the nurse, operations and engineering (${FUNDING.openQuestions.map((q) => q.id).join(', ')}), ${FUNDING.heldItems.length} held items, ${FUNDING.proposedSources.length} sources proposed for the register`,
    `- [${PATHS_FILE}](en/${PATHS_FILE}): ${PATHS.openQuestions.length} open questions for the owner, the nurse and content (${PATHS.openQuestions.map((q) => q.id).join(', ')}), ${PATHS.heldItems.length} held items, ${PATHS.proposedSources.length} sources proposed for the register`,
    '',
    '## What is not in these files',
    '',
    '- The site header.',
    '- What the shop strips show on the day. Each chapter card, path and the funding page lists the products its strip names (chapter-shop.ts; B21), but the catalogue decides on each request which of them render: only products the store shows, sells and has in stock, and never one whose description names or links another retailer. No kit is listed (A4).',
    '',
    '## Waiting on French review',
    '',
    'On /en now, hidden on /fr until a francophone reviewer signs off the French. The card keeps its plain list, so /fr loses a module rather than a sentence, and no gate removes an urgent, emergency or crisis line. The owner opens a gate by adding its id to `FR_REVIEWED` in `diabetes-care/chapters/review-gates.ts` after the sign-off. On local development and Vercel previews every gate is open, with a visible draft marker.',
    '',
    ...gateEntries(),
    '',
    "`chapter:<slug>` gates are declared in `review-gates.ts`, but no page checks them today: a chapter's French shows on /fr as soon as it is in `fr.json`, as the landing's does, which is why every line of either outside the gates above is marked " +
      `${FR_REVIEW_MARK}.`,
    '',
    '## Regenerating',
    '',
    '```bash',
    'node --env-file-if-exists=.env.local core/scripts/export-content-review.mjs --site=diabetes-care',
    '```',
    '',
    `Coverage check on this run: **${coverage.emitted} of ${coverage.total}** English strings under \`${NS}\` appear in these files${coverage.structural ? `, and ${coverage.structural} more are structural and listed in \`diabetes-care.mjs\`` : ''}.`,
    '',
  ].join('\n');
}

/*
 * Build the pack, write it (or, with `check`, compare it with what is on
 * disk), and report. Sets the exit code to 1 on any uncovered string or any
 * structure problem, and says which.
 */
export async function exportDiabetesCare({ check }) {
  const results = {};
  const { stale, compare } = staleTracker();

  const writeDoc = (locale, build) => {
    citer.reset();

    const doc = build();
    const table = citer.table(locale);

    return table.length ? { ...doc, content: `${doc.content}\n${table.join('\n')}` } : doc;
  };

  for (const locale of ['en', 'fr']) {
    results[locale] = [
      writeDoc(locale, () => writeShared(locale)),
      ...CHAPTER_META.map((meta) => writeDoc(locale, () => writeChapter(meta, locale))),
      writeDoc(locale, () => writeLanding(locale)),
      writeDoc(locale, () => writeFunding(locale)),
      writeDoc(locale, () => writePaths(locale)),
    ];

    const dir = join(OUT, locale);

    if (check) {
      for (const doc of results[locale]) compare(join(dir, doc.file), finish(doc.content));
    } else {
      mkdirSync(dir, { recursive: true });

      for (const doc of results[locale])
        writeFileSync(join(dir, doc.file), finish(doc.content), 'utf8');
    }
  }

  /* Coverage: every DiabetesCare string in the English file was emitted, or is listed as structural. */
  const allPaths = leafPaths(MESSAGES.en);
  const missing = allPaths.filter((p) => !seen.en.has(p) && !Object.hasOwn(STRUCTURAL, p));
  const structural = allPaths.filter((p) => Object.hasOwn(STRUCTURAL, p) && !seen.en.has(p)).length;

  const problems = [
    ...['en', 'fr'].flatMap((locale) =>
      CHAPTER_META.flatMap((meta) => chapterProblems(meta, locale)),
    ),
    ...parityProblems(),
    ...sourceProblems({
      sourceMeta: SOURCE_META,
      sourceReview: SOURCE_REVIEW,
      chapterMeta: CHAPTER_META,
    }),
    ...registerDisplayProblems(),
    ...gateProblems(),
    ...deviceProblems(),
    ...heldClientProblems({
      chapterMeta: CHAPTER_META,
      heldClientMessages: HELD_CLIENT_MESSAGES,
      messages: MESSAGES,
      ns: NS,
    }),
    ...rulingProblems(),
    ...flagProblems(),
    ...landingProblems(),
    ...fundingProblems(),
    ...pathsProblems(),
  ];

  const index = readme(results, {
    emitted: allPaths.length - missing.length - structural,
    total: allPaths.length,
    structural,
  });

  if (check) compare(join(OUT, 'README.md'), index);
  else writeFileSync(join(OUT, 'README.md'), index, 'utf8');

  for (const locale of ['en', 'fr']) {
    console.log(`\n${locale}:`);

    for (const d of results[locale]) {
      console.log(`  ${d.file.padEnd(34)} ${String(d.words).padStart(6)} words`);
    }
  }

  console.log(check ? '\n--check: no files written' : '');
  console.log(
    `coverage: ${allPaths.length - missing.length}/${allPaths.length} English strings emitted`,
  );
  console.log(
    `structure: ${problems.length ? `${problems.length} problem(s)` : 'meta and messages line up; sources, gates and rulings ok'}`,
  );

  if (check) {
    console.log(
      `review pack: ${stale.length ? `${stale.length} of ${results.en.length + results.fr.length + 1} file(s) behind the sources` : 'every file matches the sources'}`,
    );

    if (stale.length) {
      console.log('\nBEHIND THE SOURCES — run the export without --check to rebuild:');
      stale.forEach((path) => console.log(`  ${path}`));
    }
  }

  if (missing.length) {
    console.log('\nNOT EMITTED:');
    missing.forEach((p) => console.log(`  ${p}`));
    process.exitCode = 1;
  }

  if (problems.length) {
    console.log('\nSTRUCTURE CHECKS FAILED:');
    problems.forEach((p) => console.log(`  ${p}`));
    process.exitCode = 1;
  }
}
