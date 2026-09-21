/**
 * Exports every word of the ostomy microsite to Markdown for accuracy review.
 *
 * Run from the repo root:
 *   node --env-file-if-exists=.env.local core/scripts/export-content-review.mjs
 *
 * Writes docs/content-review/README.md plus one file per page, per locale, under
 * docs/content-review/en and docs/content-review/fr.
 *
 * With --check it builds every document and runs every check but writes
 * nothing and fetches nothing, and exits 1 on any failure. Run it after any
 * change to the messages or the chapter structure.
 *
 * --check also names the files in docs/content-review that no longer match
 * what the sources now say. That is a report, not a failure: the pack is
 * rebuilt once, at the end of the branch, and the stamp inside each file says
 * which commit it was built from.
 *
 * Generated, never hand-written. The documents are built from the same sources
 * the site renders — messages/*.json, chapters-meta.ts, funding-meta.ts — so the
 * text a reviewer approves is the text that ships. Every line carries a short
 * reference; a correction quotes the reference and is made in the source, then
 * this script is run again.
 *
 * The run ends with a coverage check: every string under OstomyCare in the
 * message file must appear in the output, or the script exits non-zero. A review
 * document that silently skips a string is worse than none.
 *
 * It also checks structure the page would otherwise get wrong silently: meta
 * arrays index-matched to numbered message keys (a drift renders a blank label
 * or drops a link), source ids against the register, and French review gates
 * that must never hide the crisis line.
 *
 * Product names are looked up from BigCommerce when BIGCOMMERCE_STORE_HASH and
 * BIGCOMMERCE_ACCESS_TOKEN are set; without them the document shows ids.
 */

import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE = join(HERE, '..');
const REPO = join(CORE, '..');
const OC = join(CORE, 'app', '[locale]', '(default)', 'liivv-health', 'ostomy-care');
const OUT = join(REPO, 'docs', 'content-review');

const require = createRequire(import.meta.url);

/* Writes nothing and fetches nothing; see the header. */
const CHECK = process.argv.includes('--check');

/* Node 24 strips TypeScript types natively, so the structure files load as-is. */
const { CHAPTER_META } = await import(pathToFileURL(join(OC, 'chapters', 'chapters-meta.ts')).href);
const { PROGRAM_META } = await import(pathToFileURL(join(OC, 'funding', 'funding-meta.ts')).href);
const { SOURCE_META } = await import(pathToFileURL(join(OC, 'chapters', 'sources-meta.ts')).href);
/*
 * The reviewer-only half of the source register: publisher, type and the
 * paraphrase of the passage each source is cited for. It is a separate file so
 * that nothing the browser loads can pull the paraphrases into a page bundle,
 * and this script is the one caller it has.
 */
const { SOURCE_REVIEW } = await import(
  pathToFileURL(join(OC, 'chapters', 'sources-review.ts')).href
);
/*
 * The bowel reference still (C04): where its numbered markers sit, and the
 * credit beside it. The credit is fixed English in both locales, like
 * COMMERCIAL_DISCLOSURE, so it is read out of the source rather than restated
 * here — a review pack that quoted its own copy of an attribution could drift
 * from the one the page actually shows.
 */
const { ANATOMY_PARTS, BOWEL_CREDIT, BOWEL_STILL } = await import(
  pathToFileURL(join(OC, 'chapters', 'anatomy-meta.ts')).href
);
const { awaitsFrReview, figureGate, keepsFigure } = await import(
  pathToFileURL(join(OC, 'chapters', 'review-gates.ts')).href
);
/*
 * The message subtrees a held figure owns, which the root layout removes from
 * the client payload so a hold covers shipping and not only rendering. Read
 * here to check it against the holds themselves — see heldClientProblems().
 */
const { HELD_CLIENT_MESSAGES } = await import(
  pathToFileURL(join(OC, 'chapters', 'held-messages.ts')).href
);
/*
 * Liivv's own commercial record for the supply list (C02). It is read here so
 * the review shows what the shop band would actually link to and add, rather
 * than describing an intention. It is empty today, and the documents say so.
 */
const { SUPPLY_CART_PRODUCTS, SUPPLY_COLLECTIONS, SUPPLY_KIT_LINKS } = await import(
  pathToFileURL(join(OC, 'chapters', 'supply-list-merchandising.ts')).href
);
/* The curated-kit allowlist every Ostomy Care surface filters on. */
const { OSTOMY_KIT_IDS, OSTOMY_LISTED_KIT_IDS, OSTOMY_WITHHELD_KIT_IDS } = await import(
  pathToFileURL(join(OC, 'oc-ids.ts')).href
);
/*
 * The landing page's situation doors (C13): where each one sends a reader. The
 * only part of the landing that lives in the message tree, and the only part of
 * it that exists in French, so it is the only part this pack can review as
 * copy rather than read out of the component's source.
 */
const { SITUATION_DOORS } = await import(pathToFileURL(join(OC, 'landing-meta.ts')).href);
/* The symbol set, so a door can never name a symbol nothing draws. */
const { GLYPH_PATHS } = await import(pathToFileURL(join(OC, 'chapters', 'glyph-paths.ts')).href);

const MESSAGES = {
  en: JSON.parse(readFileSync(join(CORE, 'messages', 'en.json'), 'utf8')).OstomyCare,
  fr: JSON.parse(readFileSync(join(CORE, 'messages', 'fr.json'), 'utf8')).OstomyCare,
};

/*
 * =============================================================================
 * THE COMMERCIAL DISCLOSURE IS ASSERTED, NOT HIDDEN
 * =============================================================================
 * It used to be a hardcoded English string in `chapters-data.ts`, read out of
 * the source here — deliberately outside the message tree so a copy edit could
 * not soften the one sentence written to protect the reader from the
 * publisher's own interest. The cost of that was larger than the protection:
 * the sentence rendered in English on every French page, unreadable to the
 * reader it exists for.
 *
 * It lives in both message files now, and the protection is this check instead.
 * Each locale's disclosure has to keep saying that Liivv sells these products
 * and that nothing here is an endorsement or a recommendation to buy — in
 * English AND in French, which the old arrangement could never check.
 *
 * Matched on meaning-bearing words rather than on a whole sentence, so the
 * wording can still be improved; what cannot happen is a clause quietly going
 * missing.
 * =============================================================================
 */
const DISCLOSURE_MUST_SAY = {
  en: {
    sells: [/\bLiivv sells\b/i],
    notEndorsement: [
      /\b(?:not|nothing)\b[^.]*\bendorsement\b/i,
      /\b(?:not|nothing)\b[^.]*\brecommendation to buy\b/i,
    ],
  },
  fr: {
    sells: [/\bLiivv vend\b/i],
    notEndorsement: [
      /\b(?:pas|rien)\b[^.]*\bapprobation\b/i,
      /\b(?:pas|rien)\b[^.]*\brecommandation d[’']acheter\b/i,
    ],
  },
};

function disclosureProblems() {
  return ['en', 'fr'].flatMap((locale) => {
    const node = MESSAGES[locale].ui?.governance?.disclosure;

    if (!node) return [`${locale}.json: no ui.governance.disclosure`];

    const problems = [];
    const rules = DISCLOSURE_MUST_SAY[locale];

    if (!rules.sells.every((re) => re.test(String(node.sells ?? '')))) {
      problems.push(
        `${locale}.json ui.governance.disclosure.sells no longer says that Liivv sells these products`,
      );
    }

    for (const key of ['reviewMeaning', 'notEndorsement']) {
      const value = String(node[key] ?? '');

      if (!rules.notEndorsement.every((re) => re.test(value))) {
        problems.push(
          `${locale}.json ui.governance.disclosure.${key} no longer says it is neither an endorsement nor a recommendation to buy`,
        );
      }
    }

    return problems;
  });
}

/*
 * Figure kinds that pin their card open (figures.tsx MODULE_KINDS), read out of
 * the source for the same reason: figures.tsx is TSX and cannot be imported.
 */
const MODULE_KINDS_SOURCE = readFileSync(join(OC, 'chapters', 'figures.tsx'), 'utf8').match(
  /MODULE_KINDS[^=]*=\s*new Set<[^>]*>\(\[([^\]]*)\]\)/,
);
const MODULE_KINDS = new Set(MODULE_KINDS_SOURCE?.[1]?.match(/[\w-]+/g) ?? []);

/*
 * Holds. A figure marked `held` in chapters-meta.ts is built but not allowed to
 * render — on no page, in either locale — until the decision named by its
 * reason is recorded. That is not the same as a French review gate, and a
 * reviewer reading a figure's labels has to be told which one they are looking
 * at, so every held figure says so and names what it waits on.
 *
 * The reasons are read out of the source rather than listed again here, and a
 * reason with no sentence below is a structure problem: a hold nobody can
 * explain to a reviewer is how a held figure quietly ships.
 */
const FIGURE_HOLDS_SOURCE = readFileSync(join(OC, 'chapters', 'chapters-meta.ts'), 'utf8').match(
  /export type FigureHold =([^;]*);/,
);
const FIGURE_HOLDS = new Set(
  (FIGURE_HOLDS_SOURCE?.[1]?.match(/'[^']+'/g) ?? []).map((quoted) => quoted.slice(1, -1)),
);

const HELD_REASONS = {
  writtenRuling:
    'the owner and the NSWOC have to rule in writing that an unbranded schematic is not "product imagery in an explanatory figure", and IP counsel has to check the drawing for trade dress',
  nswocSignoff: 'an NSWOC has to sign off what the figure shows clinically',
  ch03Card2Rewrite:
    "Chapter 03 card 2's second sentence has to be rewritten first, because the figure beside it would otherwise contradict it",
};

const COMMIT = execSync('git rev-parse --short HEAD', { cwd: REPO }).toString().trim();
const TODAY = new Date().toISOString().slice(0, 10);

const words = (s) => String(s).trim().split(/\s+/).filter(Boolean).length;
const ordered = (node) =>
  Object.keys(node ?? {})
    .sort((a, b) => Number(a) - Number(b))
    .map((k) => [k, node[k]]);
const pad = (n) => String(n).padStart(2, '0');

/* ------------------------------------------------------------------------- */
/* Product names                                                              */
/* ------------------------------------------------------------------------- */

const productIds = [
  ...new Set([
    ...CHAPTER_META.flatMap((c) => c.categories.flatMap((x) => x.products ?? [])),
    ...Object.values(SUPPLY_CART_PRODUCTS).flatMap((ids) => ids ?? []),
    ...SUPPLY_KIT_LINKS.map((kit) => kit.productId),
  ]),
];
const productNames = {};

if (
  !CHECK &&
  process.env.BIGCOMMERCE_STORE_HASH &&
  process.env.BIGCOMMERCE_ACCESS_TOKEN &&
  productIds.length
) {
  const url = `https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v3/catalog/products?id:in=${productIds.join(',')}&include_fields=name&limit=250`;

  try {
    const res = await fetch(url, {
      headers: { 'X-Auth-Token': process.env.BIGCOMMERCE_ACCESS_TOKEN, Accept: 'application/json' },
    });

    if (res.ok) {
      for (const p of (await res.json()).data) productNames[p.id] = p.name;
    }
  } catch {
    // Offline or unauthorised: fall back to ids below rather than failing the export.
  }
}

const productLabel = (id) => (productNames[id] ? `${productNames[id]} (#${id})` : `product #${id}`);

/* ------------------------------------------------------------------------- */
/* Coverage tracking                                                          */
/* ------------------------------------------------------------------------- */

const seen = { en: new Set(), fr: new Set() };

/*
 * French that shows on /fr right now with no review gate in front of it, and
 * that no francophone reviewer has read. Two kinds end up here, and a reviewer
 * treats them the same way, so they carry one mark and one list:
 *
 *  - French rewritten in step with a correction to the English (T1, the
 *    Chapter 01 timings; F1, the urostomy sentence on Chapter 03 card 2), or
 *    rewritten in the French pass because it broke the glossary beside a new
 *    module. It replaces French that was already live.
 *  - French written for this build on a line that cannot be gated — a chapter's
 *    emergency signpost, which D8 never lets a gate drop.
 *
 * Everything else new is inside a module that waits behind a gate in
 * review-gates.ts, so /fr does not show it until the owner opens that gate.
 *
 * Take a key out only after a francophone reviewer has signed it off. A key
 * that no longer names a message fails the structure checks, so a stale flag
 * cannot linger.
 */
const FR_REVIEW_MARK = '⚑';
const FR_AWAITING_REVIEW = new Set([
  'chapters.new-to-the-journey.categories.1.items.2',
  'chapters.new-to-the-journey.categories.1.items.3',
  'chapters.new-to-the-journey.categories.4.items.3',
  'chapters.new-to-the-journey.categories.6.items.3',
  'chapters.new-to-the-journey.programsBand.heading',
  'chapters.new-to-the-journey.programsBand.cards.1.heading',
  'chapters.new-to-the-journey.programsBand.cards.1.body',
  'chapters.new-to-the-journey.programsBand.cards.2.heading',
  'chapters.new-to-the-journey.programsBand.cards.2.body',
  'chapters.new-to-the-journey.programsBand.cards.3.heading',
  'chapters.new-to-the-journey.programsBand.cards.3.body',
  'chapters.everyday-liivving.categories.2.items.3',
  /* C14's Chapter 03 guardrail: the two sentences added to the programs group. */
  'chapters.everyday-liivving.resources.2.body',
  /*
   * Card 8 and card 9's first sentences. The supply list put a second French
   * word for "pouch" on the same card as these — the band below them says
   * "Poches et barrières" where the bullet said "Sacs et barrières", and "sacs"
   * is what the card calls disposal bags two lines further down. Both sentences
   * now follow the glossary ("poche", "une pièce"), and both need a francophone
   * reviewer because they were already live.
   */
  'chapters.new-to-the-journey.categories.8.items.1',
  'chapters.new-to-the-journey.categories.9.items.1',
  /*
   * The Chapter 02 re-measuring timings, rewritten in step with the English
   * correction below. Same reason as T1: the French was already live.
   */
  'chapters.get-to-know-your-stoma.categories.7.items.1',
  'chapters.get-to-know-your-stoma.categories.9.note',
  'chapters.get-to-know-your-stoma.categories.15.sections.1.items.1',
  /*
   * One French name for Ostomy Canada Society. The French pages named it four
   * ways at once — "Ostomy Canada Society" untranslated in the help band,
   * "Société Ostomy Canada" (a hybrid of neither name) in two resource
   * groups, "Ostomy Canada Society." with a stray period in three more, and
   * the registered "Société canadienne des personnes stomisées" in the
   * Chapter 01 shelf — so a reader met the same organisation under different
   * names on one page. They now all read the registered French name, which is
   * what NSWOCC's French guides and the society's own French brochure use.
   * The short form "Ostomy Canada" stays as it is wherever it runs inside a
   * sentence: that is the name on the English page the links open.
   */
  'ui.help.groupOrg',
  'chapters.everyday-liivving.resources.1.links.1.org',
  'chapters.everyday-liivving.resources.1.links.2.org',
  /* Same page, same slot: "NSWOCC." lost its stray period beside "NSWOCC". */
  'chapters.everyday-liivving.resources.1.links.3.org',
  'chapters.everyday-liivving.resources.1.links.4.org',
  'chapters.everyday-liivving.resources.3.links.1.org',
  'chapters.everyday-liivving.resources.4.links.3.org',
  /*
   * The French pass (W4-02). Every line below is French that was already live
   * and broke the glossary beside a module this build put on the same card, so
   * a reader met two French words for one thing in one place. The English is
   * untouched in all of them.
   *
   * Chapter 01 card 1 said the same English sentence two ways: the note asked
   * for "une recommandation" from "votre chapitre local" while the routes
   * figure beside it asked for "une référence" from "votre section locale".
   * Both now say "de vous orienter" and "votre section locale" — "référence"
   * is not a medical referral in French, and "chapitre" is what this site
   * calls Chapitre 01–04.
   */
  'chapters.new-to-the-journey.categories.1.note',
  'chapters.new-to-the-journey.categories.1.figure.routes.2.detail',
  /*
   * Cards 6, 8, 9 and 10, which the supply list and the finder restyle: they
   * show these sentences by number, so their words sit inside the new modules.
   * "kit de départ" beside the list's "Trousse de départ"; "Lingette
   * protectrice pour la peau" beside "Lingette de protecteur cutané"; "sac
   * d'urgence" and "Sacs d'urgence" beside "Trousse de rechange", where
   * "urgence" is also the word the emergency signposts use; "Détachant"
   * (a stain remover) beside "Dissolvant pour adhésif"; "récupération" beside
   * the map's "rétablissement"; and card 10's NSWOC expansion, which named
   * only a nurse who is a woman.
   */
  'chapters.new-to-the-journey.categories.6.items.1',
  'chapters.new-to-the-journey.categories.6.items.2',
  'chapters.new-to-the-journey.categories.8.items.2',
  'chapters.new-to-the-journey.categories.8.items.3',
  'chapters.new-to-the-journey.categories.9.title',
  'chapters.new-to-the-journey.categories.9.items.2',
  'chapters.new-to-the-journey.categories.10.items.1',
  'chapters.new-to-the-journey.categories.10.items.2',
  /*
   * One French name for the Chapter 02 emergency list. Chapter 01's signpost
   * called it "Certaines choses ne sont pas une question de site web" while
   * the heading it points at read "…ne relèvent pas d'une question sur le site
   * web", so the link named a heading that was not there. All four lines now
   * read the heading's own wording. The two Chapter 02 and Chapter 03 signpost
   * lines are new French, not a rewrite: D8 never lets a gate drop a signpost,
   * so they ship on /fr the day they are written and are flagged here instead.
   */
  'chapters.new-to-the-journey.urgentExit.link',
  'chapters.get-to-know-your-stoma.urgent.heading',
  'chapters.get-to-know-your-stoma.urgentExit.lead',
  'chapters.get-to-know-your-stoma.urgentExit.link',
  'chapters.everyday-liivving.urgentExit.lead',
  'chapters.everyday-liivving.urgentExit.link',
  /*
   * Chapter 02 card 3, the card C08 names the parts on. Its own two sentences
   * still carried the English "wafer" and "flange" and called the system an
   * "appareil"; they now use the figure's words — plaque, bride, appareillage,
   * système de collecte, barrière cutanée.
   */
  'chapters.get-to-know-your-stoma.categories.3.sections.1.items.1',
  'chapters.get-to-know-your-stoma.categories.3.sections.1.items.2',
  /*
   * Chapter 02 card 9, the card C07 draws the gap on. Its three sentences
   * treated "stomie" as masculine four times ("du stomie", "le stomie", "Tous
   * les stomies") where the figure beside them says "la stomie", and rendered
   * output as "la sortie", which is French for an exit or an outing.
   */
  'chapters.get-to-know-your-stoma.categories.9.items.1',
  'chapters.get-to-know-your-stoma.categories.9.items.2',
  'chapters.get-to-know-your-stoma.categories.9.items.3',
  /*
   * Chapter 04's referral band, where C12 added the children's links: the band
   * called a referral "la référence" in its heading and in the card the new
   * links hang under. The sentence that introduces the band, two keys up the
   * same page, called it "une référence spécifique" — so changing only the
   * band would have left one page naming one thing two ways. It now reads
   * "une orientation précise", and it is flagged here with the other two.
   */
  'chapters.this-might-be-you.categoriesIntro.body',
  'chapters.this-might-be-you.programsBand.heading',
  'chapters.this-might-be-you.programsBand.cards.1.body',
  /*
   * Shared labels the new modules print. "Ouvre sur leur site" was missing its
   * pronoun, and the two peer labels agreed with a masculine noun for "one",
   * where the thing someone has is une stomie.
   */
  'ui.chapter.opensOnTheirSite',
  'ui.chapter.ask.peer',
  'ui.chapter.roleNames.peer',
]);

/*
 * Whole subtrees of new French, rather than one key at a time.
 *
 * The landing page's prose moved into the message tree in this build and was
 * translated with it — about 120 strings, all of them new, none of them behind
 * a review gate, and all of them live on /fr the moment this ships. Listing
 * them individually would be a list nobody could keep correct; naming the
 * subtree cannot fall behind it.
 *
 * `landingPage.doors` is the exception: that French was written and reviewed
 * earlier, and it is gated separately (`doors` in review-gates.ts).
 */
const FR_AWAITING_REVIEW_PREFIXES = ['ui.landingPage.'];
const FR_REVIEWED_PREFIXES = ['ui.landingPage.doors.'];

const awaitsFrenchReview = (path) =>
  FR_AWAITING_REVIEW.has(path) ||
  (FR_AWAITING_REVIEW_PREFIXES.some((prefix) => path.startsWith(prefix)) &&
    !FR_REVIEWED_PREFIXES.some((prefix) => path.startsWith(prefix)));

/*
 * Wording changed in the source because it was wrong, and now waiting to be
 * read again by the RN who writes this content and the NSWOC who signs it off.
 * A correction is not a review: the line is already live in both locales, so it
 * is marked ✎ wherever it appears and listed at the end of its own file with
 * what it used to say.
 *
 * Take an entry out only after that re-review. A path that no longer names a
 * string fails the structure checks, so a stale entry cannot linger.
 */
const RE_REVIEW_MARK = '✎';

/*
 * =============================================================================
 * THE LIST IS THE DIFF, NOT A LIST SOMEBODY REMEMBERED TO UPDATE
 * =============================================================================
 * This used to be a hand-written map with three entries in it. Sixteen strings
 * under `OstomyCare` had actually been rewritten by then, so thirteen changed
 * lines — four of them carrying new numbers about healing, lifting and food —
 * were put in front of the RN and the NSWOC with no mark on them at all, as if
 * they were copy somebody had already approved. In the French pack the same
 * lines carried ⚑, so the francophone reviewer was told they had changed and
 * the clinical reviewer was not.
 *
 * So the entries are computed. `content-review-baseline.en.json` is the English
 * `OstomyCare` subtree as it stood before this build, flattened to one
 * path → string map, and every path whose text differs from it today is a
 * correction waiting on re-review — no exceptions, no list to keep in step.
 * NOTES below only supplies the reasoning for the ones worth explaining; a
 * changed line with no note still gets marked, still gets listed, and still
 * shows the reviewer exactly what it used to say.
 *
 * New strings (paths the baseline does not have) are not corrections. They are
 * new copy, and the whole pack is their review.
 *
 * WHEN A RE-REVIEW HAS ACTUALLY HAPPENED, move the baseline forward for that
 * path — that is what records the sign-off, and it is deliberately a change to
 * a checked-in file rather than the deletion of a line from a list.
 * =============================================================================
 */
const RE_REVIEW_BASELINE = JSON.parse(
  readFileSync(join(CORE, 'scripts', 'content-review-baseline.en.json'), 'utf8'),
);

/* Why a line was changed, for the ones where "Was …" is not the whole story. */
const RE_REVIEW_NOTES = {
  'chapters.get-to-know-your-stoma.categories.7.items.1':
    'Canadian sources put a period on it: measure at every change while the stoma shrinks over the first six to eight weeks after surgery, then again after a weight change (NSWOCC ileostomy guide; Kingston Health Sciences ileostomy booklet; CLWK one-piece procedure). "The first months" also contradicted Chapter 01 step 7, which the same sources wrote. The weight change is named here as well, so this line, 9.note, 15.s1.1 and the figure line on card 9 all say the same thing. Please also settle whether re-measuring should be said to STOP at eight weeks: the NSWOCC colostomy guide says "measure at each full change" with no end date, and card 14 lists weight change, a new bulge, pregnancy and further surgery as ongoing reasons to have the fit looked at.',
  'chapters.get-to-know-your-stoma.categories.9.note':
    'Same correction, on the card Chapter 01\'s walk-through links to for the gap. The second sentence changed with it: it used to name "a size from two months ago" as the common failure, which is eight to nine weeks — the point at which the corrected first sentence stops asking for routine re-measuring, so the two sentences called the same cut both correct and a common fault. It now names the thing that actually changes the size, "a size from before your last weight change". PLEASE READ BOTH SENTENCES TOGETHER. The weight change and the hernia are otherwise unchanged.',
  'chapters.get-to-know-your-stoma.categories.15.sections.1.items.1':
    'Same correction, and the weight change is now named here too, because this line is the one a reader reaches while chasing a leak.',
  'chapters.get-to-know-your-stoma.urgent.signs.6':
    'One presentation had two thresholds on one page. This line sat under "Go to your nearest emergency department or call 911" and said a reservoir that cannot be drained "will not wait", while card 2\'s note gives a bowel reservoir such as a Kock pouch a graded instruction — stop, rest an hour, try again, and get advice that day. The list now keeps only the case that is unambiguously an emergency, and points at the card for the rest instead of restating it differently. The NSWOC still has to set the threshold for each diversion type.',
  'chapters.new-to-the-journey.categories.1.items.3':
    'The numbers were dropped rather than reworded. "The main healing usually takes six to eight weeks" is the stoma-shrinkage window carried across into a healing claim, and the three months is one Ontario hospital\'s guidance for intensive core exercise — which the recovery map states with that qualifier attached, and this card stated flatly with no source. The card now says the pace is the surgeon\'s; the map keeps the numbers and their chips.',
  'chapters.new-to-the-journey.programsBand.cards.1.body':
    'The cited source (AHS, Eating Well After Colostomy Surgery, January 2025) says softer foods may be easier for the first 2 to 4 weeks; it does not say lower-fibre, and only the ileostomy guidance gives a lower-fibre stretch. This band is what /fr renders while the recovery map\'s French gate is closed, so a francophone colostomy reader was the one seeing an unsplit "lower-fibre" instruction.',
  'chapters.this-might-be-you.categories.1.sections.3.items.1':
    'A child\'s dusky stoma was given "call urgently", while Chapter 02 sends the same sign to an emergency department and says not to wait for a callback and not to troubleshoot it at home. The two now match. Chapter 04 also gains the emergency signpost it had no version of, pointing at that list.',
};

/*
 * Every English string that differs from the pre-build baseline, with what it
 * used to say and why. Built, not maintained.
 */
const RE_REVIEWS_PENDING = new Map(
  Object.entries(RE_REVIEW_BASELINE).flatMap(([path, was]) => {
    const now = path.split('.').reduce((node, key) => node?.[key], MESSAGES.en);

    if (typeof now !== 'string' || now === was) return [];

    const note = RE_REVIEW_NOTES[path];

    return [[path, `Was: “${was}”${note ? ` — ${note}` : ''}`]];
  }),
);

/* The re-review entries that belong to one chapter file, in message order. */
const reReviewsFor = (slug) =>
  [...RE_REVIEWS_PENDING].filter(([path]) => path.startsWith(`chapters.${slug}.`));

/*
 * A chapter message path as the short reference the rest of the pack prints
 * beside the line, so a reviewer can find the correction where it renders:
 *
 *   categories.7.items.1                      7.1
 *   categories.15.sections.1.items.1          15.s1.1
 *   categories.9.note                         9.note
 *   categories.9.figure.mouldable             9.fig.mouldable
 *   programsBand.cards.1.body                 band.1
 *   recoveryMap.stages.4.lanes.3.items.1      map.4.activity.1
 *   urgent.signs.6                            urgent.6
 *
 * The recovery map's lane is named rather than numbered wherever it renders, so
 * the lane key is looked up in `chapters-meta.ts` by position — the same pairing
 * `writeRecoveryMap` makes. A path this cannot translate is returned as it
 * stands rather than mangled into a reference that points nowhere.
 */
function reReviewRef(path, slug) {
  const rest = path.slice(`chapters.${slug}.`.length);

  if (rest.startsWith('categories.')) {
    return rest
      .slice('categories.'.length)
      .replace(/\.sections\.(\d+)\.items\./, '.s$1.')
      .replace(/\.figure\./, '.fig.')
      .replace(/\.items\./, '.');
  }

  if (rest === 'programsBand.heading') return 'band.heading';

  /*
   * The band prints a card's heading and its body on one line under one
   * reference, so a correction to either has to say which half it is or two
   * entries appear with the same reference and no way to tell them apart.
   */
  const band = /^programsBand\.cards\.(\d+)\.(\w+)$/.exec(rest);

  if (band) return band[2] === 'body' ? `band.${band[1]}` : `band.${band[1]} · ${band[2]}`;

  const urgent = /^urgent\.signs\.(\d+)$/.exec(rest);

  if (urgent) return `urgent.${urgent[1]}`;

  const resource = /^resources\.(\d+)\.(\w+)$/.exec(rest);

  if (resource) return `res.${resource[1]}${resource[2] === 'heading' ? '' : ` · ${resource[2]}`}`;

  const resourceLink = /^resources\.(\d+)\.links\.(\d+)\.(\w+)$/.exec(rest);

  if (resourceLink) return `res.${resourceLink[1]}.${resourceLink[2]} · ${resourceLink[3]}`;

  const map = /^recoveryMap\.stages\.(\d+)\.lanes\.(\d+)\.items\.(\d+)$/.exec(rest);

  if (map) {
    const [, stage, lane, item] = map;
    const meta = CHAPTER_META.find((c) => c.slug === slug);
    const key = meta?.recoveryMap?.stages[Number(stage) - 1]?.lanes[Number(lane) - 1]?.lane;

    return key ? `map.${stage}.${key}.${item}` : `map.${stage}.lane${lane}.${item}`;
  }

  return rest;
}

function makeWriter(locale) {
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
    const value = path.split('.').reduce((node, key) => node?.[key], MESSAGES[locale]);

    if (typeof value === 'string') {
      take(path, value);

      let shown = value;

      if (RE_REVIEWS_PENDING.has(path)) {
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
      const english = path.split('.').reduce((node, key) => node?.[key], MESSAGES.en);

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
}

const ref = (r) => `\`${r}\``;

/*
 * Every string leaf under a message subtree, one line each, with a short
 * reference built from its key path. Numbered keys come out in order because
 * Object.keys lists integer keys ascending.
 */
function emitTree(w, out, node, path, short) {
  for (const [k, v] of Object.entries(node ?? {})) {
    if (v && typeof v === 'object') emitTree(w, out, v, `${path}.${k}`, `${short}.${k}`);
    else out(`- ${w.text(`${path}.${k}`)} ${ref(`${short}.${k}`)}`);
  }
}

function header(w, { title, route, source, locale, note }) {
  w.push(`# ${title}`);
  w.push(`**Route:** \`${locale === 'fr' ? `/fr${route}` : route}\`  `);
  w.push(`**Source:** ${source}  `);
  w.push(
    `**Generated:** ${TODAY} from commit \`${COMMIT}\` — do not edit this file by hand; see [README](../README.md).`,
  );
  w.push('');

  if (locale === 'fr') {
    w.push(
      '> **French is machine translated with partial human correction.** It has not had a francophone clinical review. Review it against the English file with the same name — references match line for line.',
    );
    w.push('');

    /* Optional: the French landing stub passes a bare line collector. */
    if (w.frReviewsMarked?.()) {
      w.push(
        `> ${FR_REVIEW_MARK} **French nobody has reviewed, showing on /fr now.** Lines marked ${FR_REVIEW_MARK} are either French rewritten to follow a correction to the English or to match the glossary beside a new module, or French written for a line no gate may hide — a chapter's emergency signpost. Either way there is no review gate in front of them. Review them first. Everything else new on /fr is behind a gate listed in README.md.`,
      );
      w.push('');
    }
  }

  /* Optional: the French landing stub passes a bare line collector. */
  if (w.reReviewsMarked?.()) {
    w.push(
      `> ${RE_REVIEW_MARK} **Corrected wording, waiting on the RN and the NSWOC.** Lines marked ${RE_REVIEW_MARK} were changed in the source because they contradicted the Canadian guides this page is written from, and they are already live in both locales. What each one used to say is at the end of this file, under "Corrections waiting on re-review".`,
    );
    w.push('');
  }

  if (note) {
    w.push(`> ${note}`);
    w.push('');
  }
}

/* ------------------------------------------------------------------------- */
/* Chapters                                                                   */
/* ------------------------------------------------------------------------- */

const ASK_NOTE = {
  assessment: ' *(warning tone — do not act on this page alone)*',
  urgent: ' *(warning tone — do not act on this page alone)*',
};

/*
 * What the NSWOC still has to settle on the pouch change walk-through (C01),
 * beyond the steps marked pending in meta. Reviewer-only, so it lives here
 * rather than in the message tree.
 */
const CHANGE_ROUTINE_OPEN_DECISIONS = [
  'The two hand-washing lines, which are new in this pass and have had no clinical read: step 1 sentence 4 ("before you start") and step 8 sentence 7 ("again when you have finished"). The walk-through carried no hand hygiene at all until now, in either locale, although its own cited nursing checklists both open and close with it. What is open is where the first one belongs — TRU Checklist 89 performs hand hygiene BEFORE gathering supplies, CLWK washes after the workspace is set up and before the gloves go on, so the sentence sits at the end of "Get ready" and says only "before you start" — and whether an alcohol-based hand rub should be named as an alternative for someone changing a pouch away from a sink.',
  'The three lines above the steps, including the stents and rod wording.',
  'Cut the new barrier before removing the old one, or after cleaning.',
  'Two-piece: attach the pouch before or after the barrier goes on.',
  'Firm, gentle or light pressure, and how to word the hold time.',
  'The tell-your-NSWOC list, reconciled with Chapter 02 `urgent.1`–`urgent.3`.',
];

/*
 * =============================================================================
 * A SOURCE IS NOT JUST ITS TITLE
 * =============================================================================
 * This printed titles and nothing else, while `sources-review.ts` held the
 * three fields a nurse actually needs — publisher, type, and a paraphrase of
 * the passage the claim rests on — and the export imported that file only to
 * check it was complete. So the provenance of the evidence base was disclosed
 * nowhere: that the WOCN skin-care guide behind three walk-through steps and
 * the gap figure is American and was updated under a Hollister grant, on a site
 * that sells Hollister pouches; that the BC decision support tool behind three
 * more steps and three recovery-map stages is endorsement pending; that the
 * Nova Scotia work instruction is one zone's and is due for review in July
 * 2026; that some of the NSWOCC colostomy guide's exercise content is credited
 * to Coloplast Canada.
 *
 * Two changes. Every inline mention now carries its publisher, because that is
 * where funding and jurisdiction show. And every file ends with a table of the
 * sources it named, with type, the locator paraphrase, and the link — so a
 * reviewer can check a claim against the passage it came from without opening
 * the code.
 *
 * `namedSources` records what each file actually cited as it is written, rather
 * than listing every source in the register, so the table at the foot of a file
 * is that file's evidence base and nothing else.
 * =============================================================================
 */
let namedSources = new Set();

const sourceTitles = (ids, locale) =>
  (ids ?? [])
    .map((id) => {
      const source = SOURCE_META[id];

      if (!source) return `⚠ unknown source '${id}'`;

      namedSources.add(id);

      const label = locale === 'fr' && source.labelFr ? source.labelFr : source.label;
      const publisher = SOURCE_REVIEW[id]?.publisher;

      return publisher ? `${label} (${publisher})` : label;
    })
    .join('; ');

/* How a source's kind reads in the table at the foot of a file. */
const SOURCE_TYPE_LABEL = {
  'canadian-patient-education': 'Canadian patient education',
  'canadian-guideline': 'Canadian guideline or position statement',
  'international-guideline': 'International guideline',
  other: 'Other',
};

/*
 * The evidence base of one file: everything it cited, with who publishes it,
 * what kind of document it is, the passage the citation rests on, and the link.
 * Reviewer-only — none of this renders on a page.
 */
function sourceTable(locale) {
  const ids = [...namedSources].sort((a, b) =>
    String(SOURCE_META[a]?.label ?? a).localeCompare(String(SOURCE_META[b]?.label ?? b), 'en'),
  );

  if (!ids.length) return [];

  const rows = ids.map((id) => {
    const source = SOURCE_META[id] ?? {};
    const review = SOURCE_REVIEW[id] ?? {};
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
}

/* One review line per walk-through step: what it leads with, who it is for, where it comes from. */
function changeRoutineStepLine(step, index, num, locale) {
  const parts = [`step ${index + 1} (key ${step.key})`];

  if (step.lead !== undefined) parts.push(`lead ${num}.${step.lead}`);
  if (step.continues !== undefined) parts.push(`continues ${num}.${step.continues}`);
  if (step.nswocDecides) parts.push('**pending NSWOC decision**');

  if (step.conditional?.length) {
    const lines = step.conditional.map(
      (c) => `${ref(`${num}.fig.steps.${step.key}.items.${c.sentence}`)} ${c.systems.join('/')}`,
    );

    parts.push(`systems: ${lines.join(', ')}`);
  }

  parts.push(`sources: ${sourceTitles(step.sources, locale)}`);

  return `- ${parts.join(' · ')}`;
}

/*
 * Structure a reviewer cannot see in the labels: the step order, which card
 * sentence leads each step, which sentences the system filter can hide, what
 * the NSWOC still decides, and the sources. Printed, never rendered.
 */
function changeRoutineNotes(figure, num, locale, card) {
  const pending = figure.steps.flatMap((step, index) => (step.nswocDecides ? [index + 1] : []));
  const inMeta = new Set(figure.steps.map((step) => String(step.key)));
  const stored = Object.keys(card.figure?.steps ?? {}).filter((key) => !inMeta.has(key));
  const gapChapter = CHAPTER_META.find((c) => c.slug === figure.gap.chapter);

  return [
    '',
    '*Walk-through steps, from `chapters-meta.ts`. The step number is what the reader sees; the key is the message key.*',
    '',
    ...figure.steps.map((step, index) => changeRoutineStepLine(step, index, num, locale)),
    `- lines above the steps · sources: ${sourceTitles(figure.framingSources, locale)}`,
    `- tell-your-NSWOC list · sources: ${sourceTitles(figure.tellSources, locale)}`,
    `- Find an NSWOC link (same tab, page in ${figure.findNswocHrefLang === 'fr' ? 'French' : 'English'}) → <${figure.findNswocHref}>`,
    `- gap link, on step key ${figure.gap.step} → Chapter ${gapChapter?.num ?? '?'}, card ${figure.gap.card}`,
    ...(stored.length
      ? [`- *Stored but not rendered: step keys ${stored.join(', ')} (not in chapters-meta.ts).*`]
      : []),
    '',
    '*Still for the NSWOC to decide:*',
    '',
    ...(pending.length
      ? [`- Whether to keep step${pending.length > 1 ? 's' : ''} ${pending.join(' and ')}.`]
      : []),
    ...CHANGE_ROUTINE_OPEN_DECISIONS.map((decision) => `- ${decision}`),
  ];
}

/*
 * Beside a card's figures: whether a module pins the card open, and which
 * figures wait on French review (production rule, no preview override).
 */
/*
 * Gaps in the approved recovery-map spec that a clinical reviewer has to close.
 * Reviewer-only, never rendered. The map is built exactly as approved; these
 * are questions about what the approved content leaves out, so they belong in
 * front of the RN and the NSWOC rather than being filled in from the code.
 */
const RECOVERY_MAP_OPEN_QUESTIONS = [
  'Food and fluids carries no urostomy line in Weeks 1 to 2, Weeks 3 to 5 or Weeks 6 to 8, so a reader who ticks Urostomy alone is told "Nothing specific to this ostomy type here." for all three stages. Chapter 03, card 2, sentence 3 tells the same reader they need more fluid than before, steadily through the day. Decide whether an early fluid line belongs on this map for urostomy — the Canadian Urinary Diversions Position Statement (1st ed., January 2022) is already cited on the "After you go home" stage — or whether leaving it out is deliberate.',
  'Stages 4 and 5 show their Fit and Activity lines to every reader, and until this pass both stages were sourced from ileostomy documents alone (the NSWOCC ileostomy guide, the Kingston ileostomy booklet, AHS Eating Well After Ileostomy Surgery). The NSWOCC colostomy guide and the CUA position statement have been added to the stage source lists so a colostomy or urostomy reader is not shown a line whose only evidence is about someone else’s operation. Confirm that is the right answer, rather than typing those lines `ileo` and showing a colostomy or urostomy reader nothing at all for two stages.',
  'Stage 4’s activity line was "Strenuous activity waits at least 6 to 8 weeks", which none of its sources gives: 6 to 8 weeks is this stage’s stoma-shrinkage and lower-fibre window, and the Kingston booklet says no abdominal exercises for 4 to 6 weeks and intensive core no sooner than 3 months. It now reads "Ask your surgeon before you go back to heavier work or sport. Core exercise waits longer." Please confirm that is the right thing to say at six to eight weeks, and whether a number belongs there at all.',
  'Stage 1’s supplies line said "People often leave with two or three extra pouching systems", which no stage-1 source gives. It now says only what the NSWOCC colostomy guide gives — that the NSWOC provides a detailed supply list before discharge. If a number is worth giving, please supply the passage it comes from.',
  'Stage 7’s urostomy fit line said "Weight often changes", dropping both the direction and the size of the change the CUA position statement records. It now names the finding: a weight loss of about 5 to 15 kg in the three months after discharge. Confirm the wording, and whether it belongs under Fit alone or also under Food and fluids.',
];

/* What each recovery-map stage counts from. Reviewer-only, never rendered. */
const RECOVERY_ANCHORS = {
  surgery: 'Counted from surgery',
  discharge: 'Counted from going home',
  none: 'Not on a calendar',
};

/* One recovery-map line: its ostomy-type tags, and the card sentence where it reuses one. */
function recoveryItemLine(w, item, k, at) {
  const tags = (item.types ?? [])
    .map((type) => w.text(`ui.chapter.recoveryMap.types.${type}`))
    .join(', ');
  const prefix = tags ? `**${tags}** · ` : '';

  if (item.cardRef) {
    const { card, item: sentence } = item.cardRef;

    return `  - ${prefix}*reuses ${ref(`${card}.${sentence}`)}:* ${w.text(`${at.cards}.${card}.items.${sentence}`)}`;
  }

  return `  - ${prefix}${w.text(`${at.lane}.items.${k}`)} ${ref(`${at.short}.${k}`)}`;
}

/*
 * The recovery map (C03). Stages, lanes, ostomy types and per-stage sources
 * come from chapters-meta.ts; the words from the message file. A line that
 * reuses a card sentence has no message of its own, so it is printed with the
 * reference of the card it belongs to.
 */
function writeRecoveryMap(w, out, meta, locale) {
  const map = meta.recoveryMap;
  const base = `chapters.${meta.slug}`;
  const copy = MESSAGES.en.chapters[meta.slug]?.recoveryMap;

  if (!map || !copy) return;

  out('## Recovery map', '');
  out(
    '*Replaces the referral band on this chapter. Stages, lanes, ostomy types and sources come from `chapters-meta.ts`; the words are below. Lane labels are shared — see `00-shared.md`. References: `map.2.food.1` is stage 2, the food lane, item 1.*',
    '',
  );

  if (awaitsFrReview('recoveryMap', 'fr')) {
    out(
      `*French review gate \`recoveryMap\`: on /fr the map stays hidden until a francophone reviewer signs off its French, and the referral band below renders in its place.${locale === 'fr' ? ' **The French below is a draft that no one has reviewed.**' : ''}*`,
      '',
    );
  }

  out(`**${w.text(`${base}.recoveryMap.heading`)}** ${ref('map.heading')}`, '');
  out(`${w.text(`${base}.recoveryMap.intro`)} ${ref('map.intro')}`, '');

  map.stages.forEach((stage, index) => {
    const n = index + 1;
    const stagePath = `${base}.recoveryMap.stages.${n}`;
    const qualifier = w.text(`${stagePath}.qualifier`);

    out(`### Stage ${n} · ${w.text(`${stagePath}.heading`)} ${ref(`map.${n}.heading`)}`);
    out(
      [
        RECOVERY_ANCHORS[stage.anchor] ?? `anchor '${stage.anchor}'`,
        qualifier ? `Qualifier: ${qualifier} ${ref(`map.${n}.qualifier`)}` : null,
      ]
        .filter(Boolean)
        .join(' · '),
      '',
    );

    stage.lanes.forEach((lane, laneIndex) => {
      const at = {
        cards: `${base}.categories`,
        lane: `${stagePath}.lanes.${laneIndex + 1}`,
        short: `map.${n}.${lane.lane}`,
      };

      out(`- **${w.text(`ui.chapter.recoveryMap.lanes.${lane.lane}`)}**`);
      lane.items.forEach((item, itemIndex) => out(recoveryItemLine(w, item, itemIndex + 1, at)));
    });

    out('', `*Sources for this stage:* ${sourceTitles(stage.sources, locale)}`, '');
  });

  out('*Still for the RN and the NSWOC to decide:*', '');
  RECOVERY_MAP_OPEN_QUESTIONS.forEach((question) => out(`- ${question}`));
  out('');
}

/* What a held shelf link is waiting on. Reviewer-only: a held link never renders. */
const SHELF_HOLDS = {
  nswocViewed: 'held until an NSWOC has watched it and confirmed the captions',
};

const LINK_LANGUAGE = { en: 'an English page', fr: 'a French page' };

/* One shelf link: its organisation, where it goes, what language it opens in, and any hold. */
function shelfLinkLines(w, link, linkWords, at, locale) {
  const french = locale === 'fr';
  const href = french && link.hrefFr ? link.hrefFr : link.href;
  const org = french && link.orgFr ? link.orgFr : link.org;
  const notes = [`same tab, ${LINK_LANGUAGE[link.hrefLang] ?? link.hrefLang}`];

  if (link.fileNote) notes.push('a file, not a page — the note must state its type and size');

  if (link.heldUntil) {
    notes.push(`**${SHELF_HOLDS[link.heldUntil] ?? link.heldUntil}, so it does not render**`);
  }

  return [
    `- **${w.text(`${at.path}.title`)}** — ${org} ${ref(at.short)}  `,
    `  ${w.text(`${at.path}.body`)}${linkWords?.note === undefined ? '' : ` *(${w.text(`${at.path}.note`)})*`}  `,
    `  <${href}> · ${notes.join(' · ')}  `,
    `  *Register:* ${sourceTitles(link.sources, locale)}`,
  ];
}

/*
 * The resources shelf (C14). Organisations, URLs, link languages and holds come
 * from chapters-meta.ts; the words from the message file. A held link is printed
 * with what it is waiting on, because holding a resource is a decision the
 * reviewer has to be able to see and reverse.
 */
function writeShelf(w, out, meta, locale) {
  const shelf = meta.shelf;
  const base = `chapters.${meta.slug}`;
  const copy = MESSAGES.en.chapters[meta.slug]?.shelf;

  if (!shelf || !copy) return;

  out('## Resources shelf', '');
  out(
    '*Between the band and the pharmacist panel. Outward links only: nothing here is embedded, framed or reproduced, no manufacturer enrolment program is on it, and it sits outside every shop band. Organisations, URLs, link languages and holds come from `chapters-meta.ts`; the language notes are shared — see `00-shared.md`. References: `shelf.2.1` is group 2, link 1.*',
    '',
  );

  if (awaitsFrReview('shelf', 'fr')) {
    out(
      `*French review gate \`shelf\`: on /fr the shelf stays hidden until a francophone reviewer signs off its French.${locale === 'fr' ? ' **The French below is a draft that no one has reviewed.**' : ''}*`,
      '',
    );
  }

  out(`**${w.text(`${base}.shelf.heading`)}** ${ref('shelf.heading')}`, '');

  shelf.groups.forEach((group, index) => {
    const g = index + 1;
    const groupPath = `${base}.shelf.groups.${g}`;

    out(`### ${w.text(`${groupPath}.heading`)} ${ref(`shelf.${g}`)}`);
    out(`*Symbol: ${group.glyph}.*`, '');

    group.links.forEach((link, linkIndex) => {
      const l = linkIndex + 1;

      out(
        ...shelfLinkLines(
          w,
          link,
          copy.groups?.[String(g)]?.links?.[String(l)],
          { path: `${groupPath}.links.${l}`, short: `shelf.${g}.${l}` },
          locale,
        ),
      );
    });

    out('');
  });
}

/* Where the recovery map has taken the band's slot, the band is only its fallback. */
const bandFallbackNote = (meta) =>
  meta.recoveryMap
    ? [
        '*Stored, and rendered only where the recovery map above is not: on /fr until the `recoveryMap` review gate opens, or if the map is held. Keep these lines until the map is signed off in both locales.*',
        '',
      ]
    : [];

/* The page locales a band link is offered in, in words. */
const BAND_LINK_LOCALES = {
  en: 'shown on /en only',
  fr: 'shown on /fr only',
  'en,fr': 'shown on /en and /fr',
};

/*
 * C12's plain links under the band's cards: what they are, and the gate the
 * labels wait on. Printed only where a chapter actually has some.
 */
const bandLinksNote = (meta, locale) => {
  if (!meta.programsBandLinks?.some((links) => links.length)) return [];

  return [
    '*Plain links under the cards, from `chapters-meta.ts`: same tab, no framing, nothing embedded or reproduced, and no product anywhere in this band. Which page locales show a link is a separate decision from the language it opens in — a page the publisher does not maintain in French is not offered to French readers as though it were, and a page in the other language says so in its own link text. References: `band.1.link.1` is card 1, link 1.*',
    '',
    ...(awaitsFrReview('childLinks', 'fr')
      ? [
          `*French review gate \`childLinks\`: on /fr these links stay hidden until a francophone reviewer signs off their French. The cards' own reviewed sentences are not gated, so /fr loses a link rather than a referral.${locale === 'fr' ? ' **The French below is a draft that no one has reviewed.**' : ''}*`,
          '',
        ]
      : []),
  ];
};

/*
 * The links under one band card. URLs, link languages and the page locales that
 * show them come from chapters-meta.ts; the labels from the message file. The
 * two sides are index-matched, so either half alone renders nothing — and says
 * so here rather than being printed as though it were live.
 */
function bandLinkLines(w, links, cardWords, at, locale) {
  const labels = cardWords?.links ?? {};
  const total = Math.max(Object.keys(labels).length, links.length);

  return Array.from({ length: total }, (_, index) => {
    const l = index + 1;
    const link = links[index];
    const label = labels[String(l)]?.label;

    if (label === undefined) {
      return `  - ⚠ *<${link.href}> has no label in \`${locale}.json\`, so it does not render*`;
    }

    const head = `  - **${w.text(`${at.path}.links.${l}.label`)}** ${ref(`${at.short}.link.${l}`)}`;

    if (!link) {
      return `${head}  \n    ⚠ *no link at this position in \`chapters-meta.ts\`, so this label does not render*`;
    }

    const where = BAND_LINK_LOCALES[[...link.locales].sort().join(',')] ?? link.locales.join(', ');

    return [
      `${head}  `,
      `    <${link.href}> · same tab, ${LINK_LANGUAGE[link.hrefLang] ?? link.hrefLang} · ${where}  `,
      `    *Register:* ${sourceTitles(link.sources, locale)}`,
    ].join('\n');
  });
}

/*
 * Who to ask (C09): what each lane is marked for, where its link goes, and
 * which parts of the card wait on the French `finder` gate. Printed, never
 * rendered.
 */
function lanesNotes(figure, num, locale) {
  const topics = (figure.topicKeys ?? []).map(
    (key, index) => `${key} ${ref(`${num}.fig.topics.${index + 1}.label`)}`,
  );
  const lanes = figure.lanes.map((lane, index) => {
    const n = index + 1;
    const parts = [
      lane.item === undefined
        ? `new text ${ref(`${num}.fig.lanes.${n}.body`)}`
        : `card sentence ${ref(`${num}.${lane.item}`)}`,
      `marked for: ${(lane.topics ?? []).join(', ') || 'nothing'}`,
    ];

    if (lane.service) parts.push('a Liivv service, in its own row');

    if (lane.href)
      parts.push(`link ${ref(`${num}.fig.lanes.${n}.linkLabel`)} (same tab) → <${lane.href}>`);

    const head = `- **${n}** ${ref(`${num}.fig.lanes.${n}.label`)} · ${parts.join(' · ')}`;
    const register = [];

    if (lane.sources?.length) {
      register.push(`    *Register:* ${sourceTitles(lane.sources, locale)}`);
    }

    if (lane.linkSources?.length) {
      const titles = sourceTitles(lane.linkSources, locale);

      register.push(`    *Register (where the link goes):* ${titles}`);
    }

    return register.length ? [`${head}  `, register.join('  \n')].join('\n') : head;
  });

  return [
    '',
    '*Lanes, from `chapters-meta.ts`. Ticking a topic marks the lanes that fit and does nothing else: no lane is reordered, hidden or ranked, and Liivv’s own lane can only ever be marked by the product topic.*',
    '',
    `- tick boxes ${ref(`${num}.fig.legend`)}: ${topics.join(' · ')}`,
    ...lanes,
    ...(awaitsFrReview('finder', 'fr')
      ? [
          '',
          `*French review gate \`finder\`: on /fr the tick boxes, the link labels and every lane that has no sentence of the card's own stay hidden until a francophone reviewer signs off their French. The lanes that were already reviewed render as before.${locale === 'fr' ? ' **The French for the gated lines below is a draft that no one has reviewed.**' : ''}*`,
        ]
      : []),
  ];
}

/*
 * My supply list (C02): where every row came from, which Liivv shelf — if any
 * — it would link to, and what could be added to a cart from it.
 *
 * Read out of chapters-meta.ts and the merchandising record rather than
 * written, so a reviewer is looking at what the band would really do. Nothing
 * here renders.
 */
const SUPPLY_CRITERIA = Object.keys(SUPPLY_COLLECTIONS);

/* A figure that takes over the card's shop band, instead of a product band. */
const SHOP_BAND_KINDS = {
  supplyList: 'supply list',
  goBag: 'link to the supply list',
};

/* Who the card sends the reader to: a chip, the routes figure, or no one. */
const referralLine = (ask, askKey, figures) => {
  if (ask) return `Referral chip: **${ask}**${ASK_NOTE[askKey] ?? ''}`;
  if (figures.some((f) => f.kind === 'routes')) {
    return 'Referral: *shown as routes in the figure below*';
  }

  return 'Referral chip: *none — orientation card*';
};

/* What the card offers to sell: a figure's own band, a product band, or nothing. */
const shopLine = (shopKind, products) => {
  if (shopKind) return `Shop band: **${SHOP_BAND_KINDS[shopKind.kind]}**`;
  if (products.length) return `Products shown: ${products.join('; ')}`;

  return 'Products shown: *none*';
};

function collectionNote(key) {
  if (key === 'powder') return 'no shelf and no cart, in any state';

  const criteria = key === 'pouch' || key === 'spareSystem' ? ['pouchOne', 'pouchTwo'] : [key];

  return criteria
    .map((criterion) => {
      const collection = SUPPLY_COLLECTIONS[criterion];
      const cart = (SUPPLY_CART_PRODUCTS[criterion] ?? []).map(productLabel);
      const french = collection?.frenchContent
        ? 'French content'
        : 'no French content, so hidden on /fr';
      const shelf = collection
        ? `<${collection.href}> (${collection.manufacturers.join(', ')}; ${french})`
        : 'no collection yet';

      return `${criterion}: ${shelf}; ${cart.length ? `addable: ${cart.join('; ')}` : 'nothing addable'}`;
    })
    .join(' · ');
}

function supplyRowNote(item, index, group, num, groupName) {
  const at = `${num}.fig.${group}.${index + 1}`;
  const parts = [`split from ${ref(`${item.card}.${item.item}`)}`];

  if (item.textOnly) parts.push('**text only** — no tick box, no link, no cart');

  if (item.conditional) parts.push(`condition ${ref(`${at}.condition`)}`);

  if (item.alsoGoBag) parts.push('listed once, marked as also for the go-bag');

  parts.push(collectionNote(item.key));

  return `- **${groupName} ${index + 1}** ${ref(`${at}.label`)} · ${parts.join(' · ')}`;
}

function supplyListNotes(figure, num, locale) {
  const kits = SUPPLY_KIT_LINKS.length
    ? SUPPLY_KIT_LINKS.map((kit) => `${kit.system} → ${productLabel(kit.productId)} <${kit.path}>`)
        .join('; ')
    : 'none (K1 pending)';

  return [
    '',
    '*The shop band on this card is a supply list, from `chapters-meta.ts` and the Liivv merchandising record. Nothing is ticked for the reader, there is no default pouching system, and no row shows a price, a brand or an image. What a reader ticks stays in their browser: it never reaches the URL, analytics, ad tags or a server.*',
    '',
    `- system question: the card's own sentence ${ref(`${num}.${figure.system.item}`)}`,
    ...figure.items.map((item, index) => supplyRowNote(item, index, 'supplies', num, 'starter')),
    ...figure.goBagItems.map((item, index) =>
      supplyRowNote(item, index, 'goBagItems', num, 'go-bag'),
    ),
    `- kits offered at the end of the optional shop section: ${kits}`,
    ...(awaitsFrReview('supplyList', 'fr')
      ? [
          '',
          `*The same gate holds card 9's link, so /fr never shows a link to a list that is not there. The two sales notes ("Try The Fresh Start kit…", "Explore curated go-bag kits…") are gone from both locales, and the kit cards with them.${locale === 'fr' ? ' **The French below is a draft that no one has reviewed.**' : ''}*`,
        ]
      : []),
  ];
}

/*
 * The gap comparison (C07). What a reviewer cannot see from the labels: what
 * the three drawings are, what the figure deliberately refuses to do, and the
 * sources behind the captions. The drawings themselves carry no words.
 */
function gapCompareNotes(figure, num, locale) {
  return [
    '',
    `*Three drawings side by side, in this order: an opening touching the stoma, a small gap, a large gap. They are abstract outlines — no millimetres, no tissue texture, no products, no colour zones, and none of them is marked correct or highlighted. ${ref(`${num}.fig.notToScale`)} sits above them and stays visible.*`,
    '',
    '- The only control is a round / oval pair that redraws all three. It changes the drawn shape and nothing else: no caption changes, nothing is selected or scored, and nothing is stored or sent. Labels and its status line are in `00-shared.md` under "Opening gap comparison".',
    '- No slider and no gap the reader can set. Canadian guides differ (NSWOCC 1–2 mm, Kingston about 3 mm), so a control with a "right" zone would pick one answer, and on-screen millimetres would invite measuring a real stoma against a screen.',
    `- ${ref(`${num}.fig.mouldable`)} below the drawings covers mouldable barriers and re-measuring; the card's own note ${ref(`${num}.note`)} carries the weight change and the hernia.`,
    "- The line under the figure points at this chapter's own emergency list, one section up the same page.",
    `- sources: ${sourceTitles(figure.sources, locale)}`,
    '',
    '*Still for the NSWOC to decide:*',
    '',
    '- The three captions, and whether any number should appear anywhere in this figure.',
    '- Whether the drawings show the gap the way this reader base is taught it.',
  ];
}

/*
 * The lower-fibre clocks (C11). What a reviewer cannot see from the labels:
 * which surgery each row is for, how far along the scale its bar fades, and the
 * three things the figure deliberately refuses to do.
 */
function fibreClocksNotes(figure, num, locale) {
  const rows = figure.rows.map((row, index) => {
    const n = index + 1;

    return [
      `- **row ${n}** · ostomy type \`${row.type}\``,
      `label \`chapter.recoveryMap.types.${row.type}\` in 00-shared.md`,
      `sentence ${ref(`${num}.fig.clocks.${n}.body`)}`,
      `bar solid to about week ${row.fadeFromWeek}, faded to nothing by about week ${row.fadeToWeek}`,
    ].join(' · ');
  });

  return [
    '',
    `*One row per ostomy type. The card's own note ${ref(`${num}.note`)} renders above them and nowhere else on this card, so "your surgical team's call" is read before either duration. Under each row is a bar on a scale running from ${ref(`${num}.fig.axis.start`)} to ${ref(`${num}.fig.axis.end`)}: it fades out rather than stopping at a line, and it is hidden from screen readers because every duration is written out in the sentence above it.*`,
    '',
    ...rows,
    '- No urostomy row. No Canadian source gives a lower-fibre period after urostomy surgery, and a third bar drawn for symmetry would invent one.',
    '- No dates, no food lists, no products, and no control of any kind. Every word of the figure is in the server HTML, and no script adds, changes or reveals any of it — so a reader with JavaScript off sees the whole figure. See "These pages render without JavaScript" in `README.md`.',
    `- sources: ${sourceTitles(figure.sources, locale)}`,
    '',
    '*Still for the dietitian and the NSWOC to decide:*',
    '',
    '- Whether both ranges are what this reader base is taught, and whether "about 3 months" is the right far end of the scale.',
    '- Whether a colostomy row belongs beside an ileostomy row at all, given how differently the two are counselled. The colostomy sentence used to read "Softer, **lower-fibre** foods may be easier in about the first 2 to 4 weeks", which its source does not say — AHS, Eating Well After Colostomy Surgery (January 2025) gives softer foods, not lower-fibre — and it contradicted its own second clause. It now says "Softer foods". The bar beside it still draws a 2-to-4-week fade on the same axis as the ileostomy row, so please say whether a colostomy reader should be shown a duration on a fibre figure at all.',
  ];
}

/*
 * The parts of a pouching system (C08). What a reviewer cannot see from the
 * four terms: what is drawn beside them, which of this card's own sentences two
 * of the terms are the short form of, and what the drawing refuses to show.
 */
function partsOfSystemNotes(figure, num, locale) {
  return [
    '',
    '*An abstract line drawing beside the four terms below. It is wordless and hidden from screen readers — no labels, no leaders, no numbers, no colour coding — and nothing in it is marked as the part to buy. The terms are the content; a reader who never sees the drawing loses nothing.*',
    '',
    `- ${ref(`${num}.fig.terms.1.term`)} and ${ref(`${num}.fig.terms.2.term`)} are the short forms of this card's own sentences ${ref(`${num}.s1.1`)} and ${ref(`${num}.s1.2`)}. The warning about checking what your brand means stays in ${ref(`${num}.s1.2`)} and is not repeated in the figure.`,
    `- ${ref(`${num}.fig.terms.3.def`)} covers all three pouch kinds in one sentence, and ${ref(`${num}.fig.terms.4.def`)} covers both systems. The view controls therefore never rewrite a definition: every word is in the page at once, whatever is drawn.`,
    '- Two view pairs redraw the same parts — one-piece / two-piece, and drainable / closed / urostomy. They change the drawn shape and nothing else: nothing is selected, ranked or scored, and nothing is stored or sent. Their labels and status lines are in `00-shared.md` under "Parts of a pouching system". The drawing the server sends is a two-piece system with a drainable pouch, and a reader who never touches a control — including a reader with JavaScript off — sees that one. See "These pages render without JavaScript" in `README.md`.',
    `- Not drawn: convexity, which stays a sentence in ${ref(`${num}.s1.3`)} because it is an assessment rather than a shape; any coupling mechanism, click ring or tab; and any outline or proportion belonging to a real product. Where the two parts meet is a dashed outline and ${ref(`${num}.fig.terms.4.term`)}, nothing more.`,
    '- No product band on this card, in either locale.',
    `- sources: ${sourceTitles(figure.sources, locale)}`,
    '',
    '*Still to be settled before this figure can be unheld:*',
    '',
    '- The written ruling itself, and IP counsel on the drawing.',
    '- Whether these four terms are the four worth drawing, and whether the drawing shows them the way this reader base is taught them.',
    "- The French. The card's own sentences and this figure now use the same terms — *barrière cutanée*, *plaque*, *bride* — harmonised on the NSWOCC guide wording by the W4-02 French pass, so the conflict an earlier draft of this pack described no longer exists. What is still open is narrower: the figure's short definition says only *Les guides l'appellent aussi bride*, while the card's own sentence 2 warns that on some two-piece systems *bride* is the plastic ring the pouch clicks onto, not the barrier. Decide whether the figure should carry that caveat, drop the word, or leave it to the card.",
  ];
}

/*
 * The bowel reference still (C04). What a reviewer cannot see from the labels:
 * that the picture carries no words at all, what is deliberately absent from
 * it, and which three structures were hidden.
 */
function bowelReferenceNotes(figure, locale) {
  const parts = ANATOMY_PARTS.map((part) => part.key).join(', ');

  return [
    '',
    `*One flat picture of normal bowel anatomy, rendered ahead of time from two openly licensed models — it is not a 3D viewer, and there is no control of any kind. **The image itself carries no text.** Every word is HTML: ${ref('chapter.anatomy.alt')} is the alt text, ${ref('chapter.anatomy.orientation')} sits under the picture, and the eight part names are an ordered list beside it, numbered to match the markers drawn on it. The markers themselves are hidden from screen readers, because the list already numbers them.*`,
    '',
    `- parts named, in list order: ${parts}. Labels are shared (\`chapter.anatomy.parts\` in \`00-shared.md\`), because the same picture names the same parts wherever it is placed.`,
    '- Marker positions are measured, not drawn by hand: `core/scripts/render-bowel-reference.mjs` paints each part a flat colour, reads the frame back and takes the visible pixel nearest that part’s centre. Re-running the script prints the list `anatomy-meta.ts` holds.',
    '- Hidden in the render, by the NSWOC decision on what this figure is for: the duodenum, the appendix and the ileocecal valve.',
    `- Not drawn at all: any stoma, any pouch, any exit, and any shading that says a part was removed. ${ref('chapter.anatomy.caption')} is what carries that instead — a colostomy can be made at several points along the colon, and an ileostomy may or may not leave the colon in place. The figure is never introduced as the reader’s own body.`,
    '- No product band on this card, in either locale.',
    `- credit beside the figure: identifiers fixed in both locales, its three sentences translated — see **Figure credits** below.${locale === 'fr' ? ' **The French below is a draft that no one has reviewed.**' : ''}`,
    `- sources: ${sourceTitles(figure.sources, locale)}`,
    '',
    '*Still to be settled:*',
    '',
    '- The NSWOC on whether the colon — which is built mainly from colonoscopy data — reads as resting anatomy rather than as an inflated one.',
    '- Whether these eight are the parts worth naming, and whether the alt text describes what a reader who cannot see it needs.',
    '- Regulatory and IP review on the credit wording, and on whether it should have an official French rendering rather than staying English on /fr.',
  ];
}

/*
 * A held figure, at the top of its notes: what it is, that it renders nowhere,
 * and what lifts it. It is deliberately the first thing said about the figure,
 * so nothing below it can be read as describing a live page.
 */
function heldNote(figure) {
  const reason = HELD_REASONS[figure.held] ?? '⚠ no reason recorded for this hold';

  return [
    '',
    `*Held — **this figure renders on no page, in either locale**, and the card is exactly the list above. It is built and waiting: ${reason}. Lifting the hold is one line in \`chapters-meta.ts\`. The labels below are here so the ruling can be made on the words as well as the drawing.*`,
  ];
}

/*
 * The credit that has to sit beside the bowel reference still, exactly as the
 * page renders it, on every chapter that places the figure — including a
 * chapter where it is held, because the ruling that lifts the hold is made on
 * the whole thing and the credit is part of it.
 *
 * It is read out of `anatomy-meta.ts` rather than restated here, so the pack
 * cannot show a reviewer an attribution the page does not carry. CC BY 4.0
 * asks for the creator, the licence, a link to it and an indication that the
 * work was changed; the same wording goes into the image files' EXIF, so it
 * travels with a file that leaves the page.
 */
function creditLine(locale) {
  const works = BOWEL_CREDIT.works
    .map((work) => `${work.title} ${work.version} (doi:${work.doi})`)
    .join(' and ');
  const credit = MESSAGES[locale].ui?.chapter?.anatomy?.credit ?? {};
  const gloss = locale === 'en' ? null : `(${credit.courtesyGloss})`;

  return [
    `${BOWEL_CREDIT.lead}: ${BOWEL_CREDIT.collection} — ${works}.`,
    `${BOWEL_CREDIT.authors}; ${BOWEL_CREDIT.consortium}.`,
    `${BOWEL_CREDIT.licence}.`,
    credit.modification,
    BOWEL_CREDIT.courtesy,
    gloss,
    credit.purpose,
  ]
    .filter(Boolean)
    .join(' ');
}

function writeFigureCredits(out, meta, locale) {
  const placements = meta.categories.flatMap((structure, index) =>
    (structure.figures ?? [])
      .filter((figure) => figure.kind === 'bowelReference')
      .map((figure) => ({ card: index + 1, held: figure.held })),
  );

  if (!placements.length) return;

  const where = placements
    .map((p) => `card ${p.card}${p.held ? ' *(held — renders nowhere)*' : ''}`)
    .join(', ');

  out('## Figure credits', '');
  out(
    `*The bowel reference still (C04), on ${where}. This is the credit as it renders beside the figure in this locale. The **identifiers** — the collection, the two work titles with their versions and DOIs, the author surnames, the consortium and the licence code — are fixed in both locales, because they are the names of published things and translating a name misattributes it. The three **sentences** beside them are not, and they used to be English on the French page for no better reason than sitting in the same constant as the DOIs; \`chapter.anatomy.credit\` in \`00-shared.md\` is where they are now. The NLM courtesy sentence stays verbatim English because the NLM asks for those words, with a French gloss after it on /fr — whether an official French rendering would be accepted instead is still an open question for regulatory and IP review.*`,
    '',
  );
  out(`> ${creditLine(locale)}`, '');
  out(`- licence link, in the credit: <${BOWEL_CREDIT.licenceHref}>`);
  out(
    `- the same wording is written into the image files' EXIF by \`core/scripts/render-bowel-reference.mjs\`, so it travels with a file that leaves the page`,
  );
  out(
    `- image files: \`${BOWEL_STILL.src}-{${BOWEL_STILL.widths.join(',')}}.{avif,webp}\` — one flat picture with no text in it, and no 3D model is served to the reader`,
  );
  out('');
}

function figureReviewNotes(structure, num, locale, card) {
  const figures = structure.figures ?? [];
  const lines = [];
  const shown = (figure) =>
    !figure.held && (locale !== 'fr' || keepsFigure(figure, structure, 'fr', awaitsFrReview));

  if (figures.some((figure) => MODULE_KINDS.has(figure.kind) && shown(figure))) {
    lines.push('', 'Rendered open (module).');
  }

  figures.forEach((figure) => {
    const gate = figureGate(figure.kind);

    if (figure.held) lines.push(...heldNote(figure));

    if (gate && !figure.held && !keepsFigure(figure, structure, 'fr', awaitsFrReview)) {
      lines.push(
        '',
        `*French review gate \`${gate}\`: on /fr this figure stays hidden until a francophone reviewer signs off its French, and the card shows its plain list instead.${locale === 'fr' ? ' **The French below is a draft that no one has reviewed.**' : ''}*`,
      );
    }

    if (figure.kind === 'changeRoutine') {
      lines.push(...changeRoutineNotes(figure, num, locale, card));
    }

    if (figure.kind === 'lanes') {
      lines.push(...lanesNotes(figure, num, locale));
    }

    if (figure.kind === 'supplyList') {
      lines.push(...supplyListNotes(figure, num, locale));
    }

    if (figure.kind === 'gapCompare') {
      lines.push(...gapCompareNotes(figure, num, locale));
    }

    if (figure.kind === 'fibreClocks') {
      lines.push(...fibreClocksNotes(figure, num, locale));
    }

    if (figure.kind === 'partsOfSystem') {
      lines.push(...partsOfSystemNotes(figure, num, locale));
    }

    if (figure.kind === 'bowelReference') {
      lines.push(...bowelReferenceNotes(figure, locale));
    }

    if (figure.kind === 'goBag') {
      lines.push(
        '',
        `*The shop band on this card is one same-page link ${ref(`${num}.fig.goBagLink`)} to the supply list on card 8, which already holds the go-bag rows. There is one list, so a reader never keeps two.*`,
      );
    }
  });

  return lines;
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
    out('', '## Start-here map', '');
    out(
      '*Card titles and the referral line under each half are generated from the cards themselves; only these labels are written.*',
      '',
    );
    out(`- **Pivot** ${ref('startHere.pivot')} — ${w.text(`${base}.startHere.pivot`)}`);

    for (const [i] of ordered(chapter.startHere.segments)) {
      out(
        `- **Segment ${i}** ${ref(`startHere.${i}`)} — ${w.text(`${base}.startHere.segments.${i}.label`)}`,
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
    const products = (structure.products ?? []).map(productLabel);
    /* A held figure's band is not on the page, so the card shows what it always showed. */
    const shopKind = (structure.figures ?? []).find((f) => SHOP_BAND_KINDS[f.kind] && !f.held);

    out(`### ${pad(num)} · ${w.text(`${cardPath}.title`)}`);
    out(
      [
        group ? `Group: **${group}**` : 'Group: *none*',
        referralLine(ask, structure.ask, structure.figures ?? []),
        shopLine(shopKind, products),
      ].join(' · '),
    );
    out('');

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

    if (card.note !== undefined)
      out('', `> **Note** ${ref(`${num}.note`)} — ${w.text(`${cardPath}.note`)}`);

    /*
     * Figures. A restyle figure carries the card's own sentences above, so only
     * the short labels it adds are new wording; they are listed for review.
     */
    const figures = structure.figures ?? [];
    const allHeld = figures.length > 0 && figures.every((f) => f.held);

    if (figures.length) {
      out(
        '',
        `*Visual figure: ${figures.map((f) => (f.held ? `${f.kind} (held: ${f.held})` : f.kind)).join(', ')}.*`,
      );
      out(...figureReviewNotes(structure, num, locale, card));
    }

    if (card.figure) {
      out(
        '',
        allHeld
          ? '*New labels this figure adds — written, reviewable, and rendered nowhere while the figure is held:*'
          : '*New labels this figure adds:*',
        '',
      );
      emitTree(w, out, card.figure, `${cardPath}.figure`, `${num}.fig`);
    }

    out('');
  }

  if (chapter.urgent) {
    out('## Emergency red flags', '');
    out(`**${w.text(`${base}.urgent.heading`)}** ${ref('urgent.heading')}`, '');
    out(`${w.text(`${base}.urgent.intro`)} ${ref('urgent.intro')}`, '');

    for (const [i] of ordered(chapter.urgent.signs)) {
      out(`${i}. ${w.text(`${base}.urgent.signs.${i}`)} ${ref(`urgent.${i}`)}`);
    }

    out('', `**Action** ${ref('urgent.action')} — ${w.text(`${base}.urgent.action`)}`, '');
  }

  writeRecoveryMap(w, out, meta, locale);

  if (chapter.programsBand) {
    out('## Referral band', '');

    out(...bandFallbackNote(meta));
    out(...bandLinksNote(meta, locale));

    if (chapter.programsBand.heading !== undefined) {
      out(`**${w.text(`${base}.programsBand.heading`)}** ${ref('band.heading')}`, '');
    }

    for (const [i, card] of ordered(chapter.programsBand.cards)) {
      out(
        `- **${w.text(`${base}.programsBand.cards.${i}.heading`)}** ${ref(`band.${i}`)} — ${w.text(`${base}.programsBand.cards.${i}.body`)}`,
      );
      out(
        ...bandLinkLines(
          w,
          meta.programsBandLinks?.[Number(i) - 1] ?? [],
          card,
          { path: `${base}.programsBand.cards.${i}`, short: `band.${i}` },
          locale,
        ),
      );
    }

    out('');
  }

  if (chapter.resources) {
    out('## Resources', '');

    for (const [g, group] of ordered(chapter.resources)) {
      const urls = meta.resourceLinks[Number(g) - 1] ?? [];

      out(`### ${w.text(`${base}.resources.${g}.heading`)} ${ref(`res.${g}`)}`);
      out(`*${w.text(`${base}.resources.${g}.eyebrow`)}*`, '');

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

  writeShelf(w, out, meta, locale);

  out('## Pharmacist panel', '');

  for (const key of ['eyebrow', 'heading', 'body', 'cta']) {
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
      "*Citation titles are the documents' own titles and are not translated, except where a publisher issues an official French title.*",
      '',
    );

    meta.citations.forEach((c, i) => {
      const label = locale === 'fr' && c.labelFr ? c.labelFr : c.label;
      const href = locale === 'fr' && c.hrefFr ? c.hrefFr : c.href;

      out(`${i + 1}. ${label} — <${href}>`);
    });

    out('');
  }

  writeFigureCredits(out, meta, locale);

  const reReviews = reReviewsFor(meta.slug);

  if (reReviews.length) {
    out('## Corrections waiting on re-review', '');
    out(
      `*Marked ${RE_REVIEW_MARK} above. These lines were corrected in the source and are live now; they need the RN and the NSWOC to read them again and either keep or reword them. No figure or link is held on this — the wording is what is in question.*`,
      '',
    );

    reReviews.forEach(([path, was]) => out(`- ${ref(reReviewRef(path, meta.slug))} — ${was}`));

    out('');
  }

  const file = `${meta.num}-${meta.slug}.md`;

  header(w, {
    title: `Chapter ${meta.num} — ${title}`,
    route: `/liivv-health/ostomy-care/chapters/${meta.slug}`,
    source: `\`core/messages/${locale}.json\` → \`OstomyCare.${base}\`, structure in \`chapters-meta.ts\``,
    locale,
    note: `About ${w.words().toLocaleString('en-CA')} words on this page. References: \`18.3\` is card 18, item 3 · \`18.s2.1\` is card 18, section 2, item 1 · \`18.note\` is card 18's closing note · \`7.fig.steps.3.title\` is a label inside card 7's figure, here step 3's title · \`10.fig.topics.1.label\` is the first tick box on card 10's figure · \`map.2.food.1\` is the recovery map, stage 2, the food lane, item 1 · \`shelf.2.1\` is the resources shelf, group 2, link 1. A reference that starts with a number belongs to that card; the rest belong to a section of the page.`,
  });

  w.push(...body);

  return {
    file,
    title: `Chapter ${meta.num} — ${title}`,
    words: w.words(),
    content: w.lines.join('\n'),
  };
}

/* ------------------------------------------------------------------------- */
/* Funding                                                                    */
/* ------------------------------------------------------------------------- */

const MODEL_ORDER = ['flat-grant', 'cost-share', 'supplies-in-kind', 'categorical', 'none'];

function writeFunding(locale) {
  const w = makeWriter(locale);
  const F = MESSAGES.en.funding;
  const body = [];
  const out = (...l) => body.push(...l);

  out('## Page copy', '');
  out(
    '*In the order the keys appear in the message file, which follows the page top to bottom.*',
    '',
  );

  for (const key of Object.keys(MESSAGES.en.ui.fundingPage)) {
    out(`- ${ref(key)} — ${w.text(`ui.fundingPage.${key}`)}`);
  }

  out('', '## The coverage models', '');

  for (const model of [
    ...MODEL_ORDER,
    ...Object.keys(F.models).filter((m) => !MODEL_ORDER.includes(m)),
  ]) {
    if (!F.models[model]) continue;

    out(
      `- **${w.text(`funding.models.${model}.label`)}** ${ref(`model.${model}`)} — ${w.text(`funding.models.${model}.blurb`)}`,
    );
  }

  out('', '## Jurisdictions', '');
  out(
    '*Program names, official links, coverage model and verification dates come from `funding-meta.ts` and are never machine translated. Prose below them comes from the message file. "Publishes an amount" is a guard: where it is No, the site cannot show a dollar figure even if one is written in.*',
    '',
  );

  for (const code of Object.keys(PROGRAM_META)) {
    const meta = PROGRAM_META[code];
    const prose = F.programs[code] ?? {};
    const name = w.text(`funding.provinceLabels.${code}`);
    const programName =
      locale === 'fr' && meta.programNameFr ? meta.programNameFr : meta.programName;

    out(`### ${name} (${code})`, '');
    out('| Field | Value |', '|---|---|');
    out(`| Program | ${programName} |`);
    out(`| Coverage model | ${w.text(`funding.models.${meta.model}.label`) ?? meta.model} |`);
    out(`| Official source | [${meta.officialLabel}](${meta.officialUrl}) |`);
    out(`| Last verified | ${meta.verifiedOn} |`);
    out(`| Publishes an amount | ${meta.hasAmount ? 'Yes' : '**No** — no figure may be shown'} |`);

    if (meta.coversSenior || meta.coversPermanence) {
      out(
        `| Copy already answers | ${[meta.coversSenior && 'age 65+', meta.coversPermanence && 'temporary vs permanent'].filter(Boolean).join(', ')} |`,
      );
    }

    out('');

    for (const key of ['name', 'amount', 'howToApply', 'gatekeeper', 'deadlines', 'notes']) {
      if (prose[key] === undefined) continue;

      const value = w.text(`funding.programs.${code}.${key}`);
      const hidden =
        key === 'amount' && !meta.hasAmount
          ? ' *(not rendered: this jurisdiction publishes no amount)*'
          : '';
      const unused = key === 'notes' ? ' *(stored but not currently rendered on the page)*' : '';

      out(`- **${key}** ${ref(`${code}.${key}`)} — ${value}${hidden}${unused}`);
    }

    out('');
  }

  for (const [ns, label] of [
    ['checker', 'Checker — questions and labels'],
    ['results', 'Checker — result cards'],
  ]) {
    out(`## ${label}`, '');

    for (const key of Object.keys(MESSAGES.en.ui[ns])) {
      out(`- ${ref(`${ns}.${key}`)} — ${w.text(`ui.${ns}.${key}`)}`);
    }

    out('');
  }

  out('## Funding disclaimer', '');

  for (const key of Object.keys(F.governance ?? {})) {
    out(`${w.text(`funding.governance.${key}`)} ${ref(`governance.${key}`)}`, '');
  }

  header(w, {
    title: 'Funding & Coverage',
    route: '/liivv-health/ostomy-care/funding',
    source: `\`core/messages/${locale}.json\` → \`OstomyCare.funding\` and \`OstomyCare.ui.fundingPage\`, structure in \`funding-meta.ts\``,
    locale,
    note: `About ${w.words().toLocaleString('en-CA')} words. Figures and eligibility rules change: check each against its official source before approving, and update \`verifiedOn\` when you do.`,
  });

  w.push(...body);

  return {
    file: '05-funding.md',
    title: 'Funding & Coverage',
    words: w.words(),
    content: w.lines.join('\n'),
  };
}

/* ------------------------------------------------------------------------- */
/* Shared interface strings                                                   */
/* ------------------------------------------------------------------------- */

function writeShared(locale) {
  const w = makeWriter(locale);
  const body = [];
  const out = (...l) => body.push(...l);

  out('## Commercial disclosure', '');
  out(
    '*The paragraph at the foot of every chapter page and the funding page. Two sentences: the first always renders, the second depends on whether the page carries a clinical review. Until this pass it was one hardcoded English string — so it read in English to a French reader, and its review sentence asserted that "the information on this page was checked for accuracy against published sources" on pages whose reviewer field is deliberately empty because no review has happened. The byline and the machine-readable schema were already gated on a review existing; this paragraph now is too.*',
    '',
  );
  out(
    `**Always:** ${w.text('ui.governance.disclosure.sells')} ${ref('governance.disclosure.sells')}`,
    '',
  );
  out(
    `**Where the page carries a clinical review:** ${w.text('ui.governance.disclosure.reviewMeaning')} ${ref('governance.disclosure.reviewMeaning')}`,
    '',
  );
  out(
    `**Where it does not — which is every page today:** ${w.text('ui.governance.disclosure.notEndorsement')} ${ref('governance.disclosure.notEndorsement')}`,
    '',
  );
  out(
    '*Both halves are asserted by this export rather than protected by being unreachable: the check below fails if either locale loses the clause that says Liivv sells these products, or the clause that says nothing here is an endorsement or a recommendation to buy. That holds for the French as well, which keeping the sentence in code never did.*',
    '',
  );

  /*
   * [namespace, heading, the French review gate whose module it belongs to, the
   * hold that keeps that module off every page]. A held module's strings are
   * still listed: the ruling is made on the words as well as the drawing.
   */
  const SECTIONS = [
    ['chapter.ask', 'Referral chips'],
    ['chapter.groups', 'Card groups'],
    ['chapter.words', 'Chapter numbers in words (hero kicker)'],
    ['chapter.crisis', 'Crisis line (9-8-8)'],
    ['chapter.roleNames', 'Role names used in generated referral lines'],
    ['chapter.startHere', 'Start-here map'],
    ['chapter.takeIn', 'Take-in card'],
    ['chapter.changeRoutine', 'Pouch change walk-through — controls', 'changeRoutine'],
    ['chapter.changeRoutine.systems', 'Pouch change walk-through — system labels', 'changeRoutine'],
    ['chapter.gap', 'Opening gap comparison — shape pair and its status line', 'gapCompare'],
    [
      'chapter.parts',
      'Parts of a pouching system — view controls and their status lines',
      'partsOfSystem',
      'writtenRuling',
    ],
    [
      'chapter.anatomy',
      'Bowel reference still — alt text, orientation and caption',
      'bowelReference',
    ],
    ['chapter.anatomy.parts', 'Bowel reference still — part names', 'bowelReference'],
    [
      'chapter.anatomy.credit',
      'Bowel reference still — the sentences in the credit',
      'bowelReference',
    ],
    ['chapter.supplyList', 'My supply list — labels and controls', 'supplyList'],
    ['chapter.supplyList.systems', 'My supply list — system choices', 'supplyList'],
    ['chapter.supplyList.kits', 'My supply list — kit links (none listed yet)', 'supplyList'],
    ['chapter.recoveryMap', 'Recovery map — labels', 'recoveryMap'],
    ['chapter.recoveryMap.types', 'Recovery map — ostomy types', 'recoveryMap'],
    ['chapter.recoveryMap.lanes', 'Recovery map — lane labels', 'recoveryMap'],
    ['chapter.shelf', 'Resources shelf — language notes', 'shelf'],
    ['chapter', 'Chapter page labels'],
    ['help', 'Help band — shown on every page'],
    ['discovery', 'Discovery band'],
    ['governance', 'Byline and review notices'],
  ];

  for (const [ns, label, gate, held] of SECTIONS) {
    const node = ns.split('.').reduce((n, k) => n?.[k], MESSAGES.en.ui);

    out(`## ${label}`, '');

    if (held) {
      out(
        `*Held — the figure these belong to renders on no page, in either locale: ${HELD_REASONS[held] ?? '⚠ no reason recorded for this hold'}. The strings are here so the wording can be ruled on with the drawing.*`,
        '',
      );
    }

    if (gate && !held && locale === 'fr' && awaitsFrReview(gate, 'fr')) {
      out(
        `*French review gate \`${gate}\`: this module is hidden on /fr until a francophone reviewer signs off its French. **The French below is a draft that no one has reviewed.***`,
        '',
      );
    }

    for (const [key, value] of Object.entries(node)) {
      if (typeof value !== 'string') continue;

      out(`- ${ref(`${ns}.${key}`)} — ${w.text(`ui.${ns}.${key}`)}`);
    }

    out('');
  }

  header(w, {
    title: 'Shared interface text',
    route: '/liivv-health/ostomy-care',
    source: `\`core/messages/${locale}.json\` → \`OstomyCare.ui\`, and \`chapters-data.ts\``,
    locale,
    note: 'Text that appears on more than one page: referral chips, group names, the help band, and the notices around clinical review.',
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
/* Landing — the doors from messages, the rest extracted from the component   */
/* ------------------------------------------------------------------------- */

const LANDING_ROUTE = '/liivv-health/ostomy-care';

/*
 * Where a door sends a reader, named the way the page names it.
 *
 * The chapter, card and funding titles are read straight off the message tree
 * rather than through `w.text`: each is reviewed on its own page, so quoting it
 * here would count its words twice and would put a correction mark on a line
 * this file is not asking anyone to correct.
 */
function doorTarget(target, locale) {
  const say = (path) => path.split('.').reduce((node, key) => node?.[key], MESSAGES[locale]);

  if (target.funding) {
    const name = say('ui.fundingPage.title') ?? '⚠ no funding page title';

    return `the funding page — "${name}" (\`${LANDING_ROUTE}/funding\`)`;
  }

  const meta = CHAPTER_META.find((chapter) => chapter.slug === target.chapter);

  if (!meta) return `⚠ unknown chapter '${target.chapter}'`;

  const chapterName = `Chapter ${meta.num} — ${say(`chapters.${meta.slug}.title`) ?? meta.slug}`;
  const href = `\`${LANDING_ROUTE}/chapters/${meta.slug}${target.anchor ? `#${target.anchor}` : ''}\``;

  if (!target.anchor) return `${chapterName}, from the top (${href})`;

  if (target.anchor === 'red-flags') {
    const heading =
      say(`chapters.${meta.slug}.urgent.heading`) ?? '⚠ no emergency list on this chapter';

    return `${chapterName}, straight to the emergency list — "${heading}" (${href})`;
  }

  const card = Number(String(target.anchor).replace('card-', ''));
  const cardName = say(`chapters.${meta.slug}.categories.${card}.title`) ?? `⚠ no card ${card}`;

  return `${chapterName}, card ${card} — "${cardName}" (${href})`;
}

/*
 * The situation doors (C13): the only part of the landing that lives in the
 * message tree, and so the only part of it that exists in French at all.
 */
function writeDoors(w, out, locale) {
  out('## Where are you right now? — the situation doors', '');
  out(
    '*Five plain links, above every shop surface on the page, named after where the reader is rather than after a section of this site. They hold the slot the guest quiz and the kit flow demo used to. Nothing here has to be opened, ticked or answered first: each is an ordinary link, and each lands on a heading that is already on screen when the page opens.*',
    '',
  );

  if (awaitsFrReview('doors', locale)) {
    out(
      `*French review gate \`doors\`: on /fr the doors stay hidden until a francophone reviewer signs off their French. The reason the gate was set has gone — the rest of this page used to be hardcoded English, so five French doors would have stood alone on an English page, and every word of it is now in the message tree and translated. Worth knowing while the gate is still closed: the emergency door is the one thing /fr does not get. It takes nothing away — this page has never carried an emergency signpost in either language, and Chapter 02's list is a click from the chapter cards — but it is the reason to review this French first, and to say whether the gate should now simply be opened with the rest.${locale === 'fr' ? ' **The French below is a draft that no one has reviewed.**' : ''}*`,
      '',
    );
  }

  out(
    `**${w.text('ui.landingPage.doors.heading') ?? '⚠ no heading'}** ${ref('doors.heading')}`,
    '',
  );

  SITUATION_DOORS.forEach((door, index) => {
    const num = index + 1;
    const path = `ui.landingPage.doors.items.${num}`;
    const urgent = door.urgent
      ? ' *(emergency wording — told apart by its symbol, its rule and its second link, never by colour alone)*'
      : '';

    out(
      `- **${w.text(`${path}.label`) ?? `⚠ no label for door ${num}`}** ${ref(`doors.${num}.label`)}${urgent}`,
    );
    out(
      `  - ${w.text(`${path}.body`) ?? `⚠ no body for door ${num}`} ${ref(`doors.${num}.body`)}`,
    );
    out(`  - Opens ${doorTarget(door, locale)}`);

    if (door.secondary) {
      out(
        `  - Second link: ${w.text(`${path}.secondary`) ?? `⚠ no secondary line for door ${num}`} ${ref(`doors.${num}.secondary`)}`,
      );
      out(`    - Opens ${doorTarget(door.secondary, locale)}`);
    }
  });

  out('');
}

/*
 * =============================================================================
 * THE LANDING PAGE, FROM THE MESSAGE TREE
 * =============================================================================
 * This used to parse `ostomy-care-page.tsx` with the TypeScript compiler and
 * pull the copy out of its JSX, because the copy was hardcoded English in the
 * component — the only part of the page in the message tree was the five
 * situation doors, and the French pack had nothing to review at all.
 *
 * The page now reads `OstomyCare.ui.landingPage.*` like every other page in
 * this microsite, so this reads the same keys, in both locales, and the
 * francophone reviewer gets the French landing page instead of a note
 * explaining why there is none.
 *
 * SECTIONS is the page top to bottom. Each entry is [key, heading, note]; the
 * note says what a reviewer cannot see from the words alone. What is NOT here
 * is deliberate: product names and prices come from BigCommerce, and the
 * manufacturer names on the brand row are names, not copy.
 * =============================================================================
 */

const LANDING_SECTIONS = [
  ['hero', 'Hero', 'The word after the heading rotates through the five in `hero.words`, one every 2.6 seconds, and stops moving for a reader who has asked for reduced motion. `hero.kitsCta` is a kit surface.'],
  ['trust', 'Trust strip', 'Four claims, scrolling. Each is a promise about the service, so each is a claim someone has to stand behind.'],
  ['ways', 'Ways in', 'Five doors down the page, numbered 01–05 by rendered position rather than by key — the "Curated kits" one is a kit surface, and a list that jumped from 01 to 03 would be a bug.'],
  ['kits', 'Curated kits and the carousel', 'A kit surface in full: with no kit listed, none of this renders.'],
  ['shop', 'The shelf', 'Live catalogue, filtered into rooms. "Curated kits" is a kit surface; the other five rooms render.'],
  ['subscribe', 'Subscriptions band', 'The shared subscribe band, with this page\'s own words. The demo inside it is a shared component and carries its own English — see the note under this table.'],
  ['chapters', 'Life chapters', 'The four chapter cards. Their titles and blurbs are the chapters\' own, reviewed on their own pages, so they are not repeated here.'],
  ['care', 'Pharmacist care, and Olivia', 'The pharmacist panel and the Olivia band. Both say what the pharmacist is NOT for; please read them against Chapter 04\'s `pharmacist.body`.'],
  ['brands', 'Preferred brands', 'Coloplast, Hollister and Convatec are named in the markup, not in the message tree: they are names. The sentence beside them is what says this is not a clinical endorsement.'],
  ['faq', 'Questions', 'Five questions, the first open. Question 2 is a kit surface. These are the only clinical claims on this page.'],
  ['closing', 'Closing', 'Four links out. `closing.kits` is a kit surface.'],
];

/*
 * Keys the page does not render while every curated kit is withheld
 * (`OSTOMY_LISTED_KIT_IDS` in oc-ids.ts is empty). Listed rather than derived,
 * and checked: `landingProblems` fails if one of these is not a string in both
 * message files, so a renamed key cannot quietly drop out of the warning.
 */
const LANDING_KIT_SURFACES = new Set([
  'hero.kitsCta',
  'ways.items.kits.title',
  'ways.items.kits.body',
  'kits.label',
  'kits.eyebrow',
  'kits.heading',
  'kits.body',
  'kits.count',
  'kits.carouselLabel',
  'kits.previous',
  'kits.next',
  'kits.show',
  'kits.featuredBadge',
  'kits.customBadge',
  'kits.featuredBody',
  'kits.cardBody',
  'kits.cta',
  'shop.rooms.kits',
  'shop.kitBadge',
  'faq.items.2.q',
  'faq.items.2.a',
  'closing.kits',
]);

/* Every string under one landing section, as `key → value` pairs in key order. */
function landingStrings(section) {
  const root = MESSAGES.en.ui?.landingPage?.[section];
  const out = [];

  (function walk(node, prefix) {
    if (node === undefined) return;

    for (const [key, value] of ordered(node)) {
      const path = prefix ? `${prefix}.${key}` : key;

      if (typeof value === 'string') out.push(path);
      else if (typeof value === 'object') walk(value, path);
    }
  })(root, '');

  return out.map((path) => `${section}.${path}`);
}

function writeLanding(locale) {
  const file = '06-landing.md';
  const title = 'Landing page';
  const w = makeWriter(locale);
  const body = [];
  const out = (...l) => body.push(...l);
  const kitsWithheld = OSTOMY_LISTED_KIT_IDS.length === 0;

  writeDoors(w, out, locale);

  for (const [section, heading, note] of LANDING_SECTIONS) {
    const paths = landingStrings(section);

    if (!paths.length) continue;

    out(`## ${heading}`, '');
    out(`*${note}*`, '');

    for (const path of paths) {
      const withheld = kitsWithheld && LANDING_KIT_SURFACES.has(path);
      const line = `- ${ref(path)} — ${w.text(`ui.landingPage.${path}`)}`;

      out(withheld ? `${line} *(kit surface — renders nowhere today)*` : line);
    }

    out('');
  }

  if (kitsWithheld) {
    out(
      `*Lines marked **kit surface** do not render. Every one of the ${OSTOMY_KIT_IDS.length} curated ostomy kits is withheld until the K1 rebuilds are applied (\`OSTOMY_LISTED_KIT_IDS\` in \`oc-ids.ts\` is empty), so the page draws no kits section, no carousel, no "Curated kits" way in or shop room, no kit buttons and no customize answer. The wording stays in the message files and comes back on its own when the allowlist is repopulated — it is marked here so it is not read as copy that is live.*`,
      '',
    );
  }

  out(
    '*Not in this file, and not for review here: product names and prices, which come from BigCommerce; the manufacturer names on the brand row, which are names rather than copy; and the subscription demo inside the subscriptions band, which is a shared component used by other micro-sites and still carries its own English on /fr. That last one is a recorded residual, not a decision.*',
    '',
  );

  header(w, {
    title,
    route: LANDING_ROUTE,
    source: `\`core/messages/${locale}.json\` → \`OstomyCare.ui.landingPage\``,
    locale,
    note:
      locale === 'fr'
        ? 'Every word of this page is now in the message tree, so this is the French landing page in full. Until this build only the five situation doors existed in French, and that section is behind a review gate that is closed in production — which would have shipped /fr/liivv-health/ostomy-care, the entry point of the French microsite, with no French on it at all. **All of the French below is new and nobody has reviewed it.**'
        : 'Every word of this page, from the message tree. It used to be hardcoded English in `ostomy-care-page.tsx` and had to be extracted from the component\'s source; it is ordinary copy now, and it exists in French.',
  });

  w.push(...body);

  return { file, title, words: w.words(), content: w.lines.join('\n') };
}

/* ------------------------------------------------------------------------- */
/* Structure checks                                                           */
/* ------------------------------------------------------------------------- */

/* The value at a numbered-key position, the way chapters-data.ts ordered() reads it. */
const nth = (node, index) => ordered(node)[index]?.[1];
const count = (node) => Object.keys(node ?? {}).length;

/*
 * Meta arrays that chapters-data.ts pairs with numbered message keys by
 * position. A drift renders a blank label, a label with no symbol, or drops a
 * link, and nothing on the page says so.
 */
/* A walk-through step: its message key, the card items it names, and its sentences. */
function changeRoutineStepProblems(step, text, items, at) {
  const problems = [];
  const where = `${at} changeRoutine step key ${step.key}`;
  const stepText = text?.steps?.[String(step.key)];

  if (!Number.isInteger(step.key) || step.key < 1) {
    problems.push(`${where}: key is not a positive integer`);
  }

  if (!stepText) problems.push(`${where}: no figure.steps.${step.key} in messages`);
  if (!step.sources?.length) problems.push(`${where}: no sources`);

  [step.lead, step.continues]
    .filter((item) => item !== undefined)
    .forEach((item) => {
      if (!Number.isInteger(item) || item < 1 || item > items) {
        problems.push(`${where}: item ${item} does not exist (card has ${items} items)`);
      }
    });

  (step.conditional ?? []).forEach(({ sentence, systems }) => {
    if (!Object.hasOwn(stepText?.items ?? {}, String(sentence))) {
      problems.push(`${where}: conditional sentence ${sentence} does not exist`);
    }

    if (!systems?.length) {
      problems.push(`${where}: conditional sentence ${sentence} names no system`);
    }
  });

  return problems;
}

/*
 * The walk-through restyles the card, so every card sentence must lead exactly
 * one step (or it would vanish, or show twice), and its links must resolve.
 */
function changeRoutineProblems(figure, text, card, at) {
  const items = count(card.items);
  const keys = figure.steps.map((step) => step.key);
  const gapChapter = CHAPTER_META.find((c) => c.slug === figure.gap.chapter);
  const problems = figure.steps.flatMap((step) => changeRoutineStepProblems(step, text, items, at));

  if (new Set(keys).size !== keys.length) problems.push(`${at} changeRoutine: duplicate step keys`);

  Array.from({ length: items }, (_, i) => i + 1).forEach((item) => {
    const leads = figure.steps.filter((step) => step.lead === item).length;

    if (leads !== 1) problems.push(`${at} changeRoutine: item ${item} leads ${leads} steps, not 1`);
  });

  if (!keys.includes(figure.gap.step)) {
    problems.push(`${at} changeRoutine: gap link names step key ${figure.gap.step}, not a step`);
  }

  if (!gapChapter || figure.gap.card < 1 || figure.gap.card > gapChapter.categories.length) {
    problems.push(
      `${at} changeRoutine: gap link to unknown card ${figure.gap.chapter} #${figure.gap.card}`,
    );
  }

  if (!String(figure.findNswocHref).startsWith('https://')) {
    problems.push(`${at} changeRoutine: findNswocHref is not https`);
  }

  if (!figure.framingSources?.length || !figure.tellSources?.length) {
    problems.push(`${at} changeRoutine: framingSources and tellSources need at least one source`);
  }

  if (!count(text?.framing) || !count(text?.tell?.items) || typeof text?.gapLink !== 'string') {
    problems.push(
      `${at} changeRoutine: messages need figure.framing, figure.tell and figure.gapLink`,
    );
  }

  return problems;
}

/*
 * Who to ask (C09). A lane either carries one of the card's own reviewed
 * sentences or brings its own `body`; a lane with a link needs a label that
 * says where the link goes; every topic a lane answers has to be one of the
 * tick boxes; and Liivv's own lane may only ever answer the product topic.
 */
function lanesProblems(figure, text, itemExists, expect, at) {
  const problems = [];
  const keys = figure.topicKeys ?? [];

  expect('lanes', figure.lanes.length, count(text?.lanes));
  expect('lane topics', keys.length, count(text?.topics));

  figure.lanes.forEach((lane, index) => {
    /*
     * `laneWords`, not `words`: the module-level `words` is the word counter,
     * and shadowing it here would make any count taken inside this function
     * silently return a message node instead of a number.
     */
    const laneWords = nth(text?.lanes, index);
    const where = `${at} lanes.${index + 1}`;

    if (lane.item === undefined) {
      if (typeof laneWords?.body !== 'string') {
        problems.push(`${where}: no card sentence and no figure.lanes.${index + 1}.body`);
      }

      /* New text of its own, so it needs a source: a card sentence brings the chapter's. */
      if (!lane.sources?.length) problems.push(`${where}: new text with no sources`);
    } else {
      itemExists(lane.item);
    }

    if (lane.href !== undefined && typeof laneWords?.linkLabel !== 'string') {
      problems.push(`${where}: a link with no figure.lanes.${index + 1}.linkLabel`);
    }

    if (lane.href !== undefined && !lane.linkSources?.length) {
      problems.push(`${where}: a link with no linkSources`);
    }

    if (lane.href !== undefined && !String(lane.href).startsWith('https://')) {
      problems.push(`${where}: link is not https`);
    }

    const unknown = (lane.topics ?? []).filter((topic) => !keys.includes(topic));

    if (unknown.length) {
      problems.push(`${where}: topic(s) ${unknown.join(', ')} are not in topicKeys`);
    }

    if (lane.service && (lane.topics ?? []).some((topic) => topic !== 'product')) {
      problems.push(`${where}: a Liivv service lane may only answer the product topic`);
    }
  });

  if (keys.length && (typeof text?.legend !== 'string' || typeof text?.fits !== 'string')) {
    problems.push(`${at} lanes: messages need figure.legend and figure.fits`);
  }

  if (
    keys.length &&
    (typeof text?.statusFitsOne !== 'string' ||
      typeof text?.statusFitsMany !== 'string' ||
      typeof text?.statusNone !== 'string')
  ) {
    problems.push(
      `${at} lanes: messages need figure.statusFitsOne, figure.statusFitsMany and figure.statusNone`,
    );
  }

  /* The count goes in both plural forms, and nowhere else says how many fit. */
  ['statusFitsOne', 'statusFitsMany'].forEach((key) => {
    if (typeof text?.[key] === 'string' && !text[key].includes('{count}')) {
      problems.push(`${at} lanes: figure.${key} has no {count}`);
    }
  });

  return problems;
}

/*
 * One supply-list row. Every row names the reviewed sentence it was split out
 * of, so the wording still has one source; a row marked conditional carries its
 * condition in the message tree and nowhere else; and the powder row can never
 * stop being text only or acquire a shelf, which is the whole point of it.
 */
function supplyRowProblems(item, rowWords, cards, at) {
  /* `rowWords`, not `words`: the module-level `words` counts words. */
  const problems = [];
  const special = ['pouch', 'spareSystem', 'powder'];

  if (!SUPPLY_CRITERIA.includes(item.key) && !special.includes(item.key)) {
    problems.push(`${at}: unknown supply key '${item.key}'`);
  }

  if (typeof rowWords?.label !== 'string') problems.push(`${at}: no label in messages`);

  if (item.conditional && typeof rowWords?.condition !== 'string') {
    problems.push(`${at}: marked conditional but carries no condition in messages`);
  }

  if (!item.conditional && rowWords?.condition !== undefined) {
    problems.push(`${at}: carries a condition in messages but is not marked conditional`);
  }

  if (!nth(nth(cards, item.card - 1)?.items, item.item - 1)) {
    problems.push(`${at}: card ${item.card} sentence ${item.item} does not exist`);
  }

  if (item.key === 'powder' && !item.textOnly) {
    problems.push(`${at}: the powder row must be text only`);
  }

  if (item.textOnly && (SUPPLY_COLLECTIONS[item.key] || SUPPLY_CART_PRODUCTS[item.key])) {
    problems.push(`${at}: a text-only row must never carry a collection or a cart product`);
  }

  return problems;
}

function supplyListProblems(figure, text, cards, at) {
  const problems = [];
  const groups = [
    ['supplies', figure.items],
    ['goBagItems', figure.goBagItems],
  ];

  for (const [group, items] of groups) {
    if (items.length !== count(text?.[group])) {
      problems.push(
        `${at} ${group}: ${items.length} in chapters-meta.ts, ${count(text?.[group])} in messages`,
      );
    }

    items.forEach((item, index) =>
      problems.push(
        ...supplyRowProblems(item, nth(text?.[group], index), cards, `${at} ${group}.${index + 1}`),
      ),
    );
  }

  for (const key of ['intro', 'systemLegend', 'starterHeading', 'goBagHeading', 'alsoGoBag']) {
    if (typeof text?.[key] !== 'string') problems.push(`${at} supplyList: no figure.${key}`);
  }

  return problems;
}

/*
 * The gap comparison (C07). Three panels, no more and no fewer: the figure is
 * an opening that touches, a small gap and a large gap, and dropping one of
 * them would leave a reader with only one way for it to go wrong. The panel
 * captions and both notes are the figure's only words, so each has to be there.
 */
const GAP_PANELS = 3;

function gapCompareProblems(text, at) {
  const problems = [];
  const panels = count(text?.panels);

  if (panels !== GAP_PANELS) {
    problems.push(`${at} gapCompare: ${panels} panels in messages, ${GAP_PANELS} expected`);
  }

  for (const [index, panel] of ordered(text?.panels)) {
    for (const key of ['title', 'body']) {
      if (typeof panel?.[key] !== 'string') {
        problems.push(`${at} gapCompare: no figure.panels.${index}.${key} in messages`);
      }
    }
  }

  for (const key of ['notToScale', 'mouldable']) {
    if (typeof text?.[key] !== 'string') {
      problems.push(`${at} gapCompare: no figure.${key} in messages`);
    }
  }

  return problems;
}

/*
 * The parts of a pouching system (C08). Four terms, no more and no fewer: the
 * drawing shows a barrier, a pouch, the place the two meet and the whole of
 * them together, and being able to name each one is the entire point of the
 * figure. The drawing is wordless, so a term with no definition — or a
 * definition with no term — would leave part of it with nothing to read at all.
 */
const PARTS_TERMS = 4;

function partsOfSystemProblems(figure, text, at) {
  const problems = [];
  const terms = count(text?.terms);

  if (terms !== PARTS_TERMS) {
    problems.push(`${at} partsOfSystem: ${terms} terms in messages, ${PARTS_TERMS} expected`);
  }

  ordered(text?.terms).forEach(([index, term]) =>
    ['term', 'def']
      .filter((key) => typeof term?.[key] !== 'string')
      .forEach((key) =>
        problems.push(`${at} partsOfSystem: no figure.terms.${index}.${key} in messages`),
      ),
  );

  if (!figure.sources?.length) problems.push(`${at} partsOfSystem: no sources`);

  return problems;
}

/*
 * The lower-fibre clocks (C11).
 *
 * The scale the bars are drawn on, in weeks. It is also in
 * fibre-clocks-figure.tsx, which is TSX and cannot be imported here; if the two
 * ever disagree, this check is the one that says so, because a range past the
 * end of the scale would draw a bar that never finishes fading.
 */
const CLOCK_AXIS_WEEKS = 12;

/*
 * One row: its sentence, a label it shares with the recovery map, and a range
 * that runs forwards and fits the scale. A urostomy row is refused outright —
 * no Canadian source gives a lower-fibre period after urostomy surgery, and the
 * decision to leave it out is the kind that gets quietly undone for symmetry.
 */
function fibreClockRowProblems(row, index, text, at) {
  const where = `${at} fibreClocks row ${index + 1}`;
  const types = MESSAGES.en.ui.chapter.recoveryMap?.types ?? {};
  const problems = [];

  if (!Object.hasOwn(types, row.type)) {
    problems.push(`${where}: no ui.chapter.recoveryMap.types.${row.type}`);
  }

  if (row.type === 'uro') {
    problems.push(
      `${where}: a urostomy row needs a source for a lower-fibre period after urostomy surgery`,
    );
  }

  if (typeof nth(text?.clocks, index)?.body !== 'string') {
    problems.push(`${where}: no figure.clocks.${index + 1}.body in messages`);
  }

  if (!(row.fadeFromWeek > 0) || !(row.fadeToWeek > row.fadeFromWeek)) {
    problems.push(`${where}: weeks ${row.fadeFromWeek}–${row.fadeToWeek} do not run forwards`);
  }

  if (row.fadeToWeek > CLOCK_AXIS_WEEKS) {
    problems.push(
      `${where}: week ${row.fadeToWeek} is past the ${CLOCK_AXIS_WEEKS}-week scale the axis names`,
    );
  }

  return problems;
}

function fibreClocksProblems(figure, text, at) {
  const problems = figure.rows.flatMap((row, index) => fibreClockRowProblems(row, index, text, at));
  const types = figure.rows.map((row) => row.type);

  if (figure.rows.length !== count(text?.clocks)) {
    problems.push(
      `${at} fibreClocks rows: ${figure.rows.length} in chapters-meta.ts, ${count(text?.clocks)} in messages`,
    );
  }

  if (new Set(types).size !== types.length) {
    problems.push(`${at} fibreClocks: the same ostomy type has more than one row`);
  }

  ['start', 'end']
    .filter((key) => typeof text?.axis?.[key] !== 'string')
    .forEach((key) => problems.push(`${at} fibreClocks: no figure.axis.${key} in messages`));

  if (!figure.sources?.length) problems.push(`${at} fibreClocks: no sources`);

  return problems;
}

function figureProblems(figure, text, card, at, cards) {
  const problems = [];
  const expect = (what, metaLength, messageLength) => {
    if (metaLength !== messageLength) {
      problems.push(`${at} ${what}: ${metaLength} in chapters-meta.ts, ${messageLength} in messages`);
    }
  };
  const items = count(card.items);
  const itemExists = (item) => {
    if (!Number.isInteger(item) || item < 1 || item > items) {
      problems.push(`${at} ${figure.kind}: item ${item} does not exist (card has ${items} items)`);
    }
  };

  switch (figure.kind) {
    case 'routes':
      expect('routes', figure.routes.length, count(text?.routes));
      figure.routes.forEach((route, i) =>
        expect(`routes.${i + 1}.chips`, route.glyphs.length, count(nth(text?.routes, i)?.chips)),
      );
      break;

    case 'criteria':
      expect(
        'criteria labels (items + more)',
        figure.glyphs.length,
        count(text?.items) + (text?.more === undefined ? 0 : 1),
      );
      break;

    case 'columns':
      expect('columns', figure.columns.length, count(text?.columns));
      [...figure.columns.flat(), ...(figure.neutral ?? [])].forEach(itemExists);
      break;

    case 'containers':
      expect('containers', figure.containers.length, count(text?.containers));
      figure.containers.forEach((container) => container.items.forEach((e) => itemExists(e.item)));
      break;

    case 'lanes':
      problems.push(...lanesProblems(figure, text, itemExists, expect, at));
      break;

    case 'doors':
      expect('doors', figure.doors.length, count(text?.doors));
      figure.doors.forEach((door) => {
        itemExists(door.item);

        if (!CHAPTER_META.some((c) => c.slug === door.chapter)) {
          problems.push(`${at} doors: unknown chapter '${door.chapter}'`);
        }
      });
      break;

    case 'changeRoutine':
      problems.push(...changeRoutineProblems(figure, text, card, at));
      break;

    case 'supplyList':
      itemExists(figure.system.item);
      problems.push(...supplyListProblems(figure, text, cards, at));
      break;

    case 'goBag':
      if (typeof text?.goBagLink !== 'string') {
        problems.push(`${at} goBag: no figure.goBagLink in messages`);
      }

      break;

    case 'gapCompare':
      problems.push(...gapCompareProblems(text, at));
      break;

    case 'fibreClocks':
      problems.push(...fibreClocksProblems(figure, text, at));
      break;

    case 'partsOfSystem':
      problems.push(...partsOfSystemProblems(figure, text, at));
      break;

    default:
      break;
  }

  return problems;
}

const RECOVERY_ANCHOR_KINDS = new Set(Object.keys(RECOVERY_ANCHORS));

/*
 * One recovery-map lane: its label exists, it appears once in its stage, every
 * ostomy type it tags has a label, and meta and messages hold the same lines.
 * A line that reuses a card sentence must have no message of its own, or the
 * same sentence would exist twice and could drift.
 */
function recoveryLaneProblems(lane, laneWords, cards, lanesSeen, at) {
  const problems = [];
  const ui = MESSAGES.en.ui.chapter.recoveryMap;
  const items = laneWords?.items ?? {};

  if (!Object.hasOwn(ui.lanes ?? {}, lane.lane)) {
    problems.push(`${at}: no ui.chapter.recoveryMap.lanes.${lane.lane}`);
  }

  if (lanesSeen.has(lane.lane)) {
    problems.push(`${at}: lane '${lane.lane}' appears twice in this stage`);
  }

  lanesSeen.add(lane.lane);

  lane.items.forEach((item, index) => {
    const k = index + 1;

    (item.types ?? []).forEach((type) => {
      if (!Object.hasOwn(ui.types ?? {}, type)) {
        problems.push(`${at} item ${k}: no ui.chapter.recoveryMap.types.${type}`);
      }
    });

    if (item.cardRef) {
      const card = nth(cards, item.cardRef.card - 1);

      if (!Object.hasOwn(card?.items ?? {}, String(item.cardRef.item))) {
        problems.push(
          `${at} item ${k}: card ${item.cardRef.card} has no item ${item.cardRef.item} to reuse`,
        );
      }

      if (Object.hasOwn(items, String(k))) {
        problems.push(`${at} item ${k}: reuses a card sentence, so it takes no message of its own`);
      }

      return;
    }

    if (typeof items[String(k)] !== 'string') problems.push(`${at}: no message for item ${k}`);
  });

  Object.keys(items).forEach((key) => {
    const item = lane.items[Number(key) - 1];

    if (!item || item.cardRef) {
      problems.push(`${at}: message item ${key} is not a line in chapters-meta.ts`);
    }
  });

  return problems;
}

function recoveryStageProblems(stage, stageWords, cards, at) {
  const problems = [];
  const lanesSeen = new Set();
  const laneKeys = Object.keys(stageWords?.lanes ?? {});

  if (typeof stageWords?.heading !== 'string') problems.push(`${at}: no heading in messages`);

  if (!RECOVERY_ANCHOR_KINDS.has(stage.anchor)) {
    problems.push(`${at}: unknown anchor '${stage.anchor}'`);
  }

  if (!stage.sources?.length) problems.push(`${at}: no sources`);

  laneKeys
    .filter((key) => !stage.lanes[Number(key) - 1])
    .forEach((key) =>
      problems.push(`${at}: message lane ${key} is not a lane in chapters-meta.ts`),
    );

  stage.lanes.forEach((lane, index) =>
    problems.push(
      ...recoveryLaneProblems(
        lane,
        stageWords?.lanes?.[String(index + 1)],
        cards,
        lanesSeen,
        `${at} lane ${index + 1} (${lane.lane})`,
      ),
    ),
  );

  return problems;
}

/* The recovery map: meta and messages describe the same stages, lanes and lines. */
function recoveryMapProblems(meta, locale) {
  const chapter = MESSAGES[locale].chapters?.[meta.slug];
  const copy = chapter?.recoveryMap;
  const map = meta.recoveryMap;
  const at = `${locale} ${meta.slug} recoveryMap`;

  if (!map && !copy) return [];
  if (!map) return [`${at}: messages carry a recovery map that chapters-meta.ts does not`];
  if (!copy) return [`${at}: no recoveryMap in ${locale}.json`];

  const problems = [];

  if (typeof copy.heading !== 'string' || typeof copy.intro !== 'string') {
    problems.push(`${at}: needs a heading and an intro`);
  }

  if (count(copy.stages) !== map.stages.length) {
    problems.push(
      `${at} stages: ${map.stages.length} in chapters-meta.ts, ${count(copy.stages)} in messages`,
    );
  }

  map.stages.forEach((stage, index) =>
    problems.push(
      ...recoveryStageProblems(
        stage,
        copy.stages?.[String(index + 1)],
        chapter.categories,
        `${at} stage ${index + 1}`,
      ),
    ),
  );

  return problems;
}

function chapterProblems(meta, locale) {
  const chapter = MESSAGES[locale].chapters?.[meta.slug];
  const at = `${locale} ${meta.slug}`;

  if (!chapter) return [`${at}: chapter missing from ${locale}.json`];

  const problems = [];
  const expect = (what, metaLength, messageLength) => {
    if (metaLength !== messageLength) {
      problems.push(`${at} ${what}: ${metaLength} in chapters-meta.ts, ${messageLength} in messages`);
    }
  };

  expect('categories', meta.categories.length, count(chapter.categories));

  meta.categories.forEach((structure, index) => {
    const card = nth(chapter.categories, index) ?? {};

    (structure.figures ?? []).forEach((figure) =>
      problems.push(
        ...figureProblems(
          figure,
          card.figure,
          card,
          `${at} card ${index + 1}`,
          chapter.categories,
        ),
      ),
    );
  });

  expect('resource groups', meta.resourceLinks.length, count(chapter.resources));
  meta.resourceLinks.forEach((urls, g) =>
    expect(`resources.${g + 1}.links`, urls.length, count(nth(chapter.resources, g)?.links)),
  );

  return problems;
}

/*
 * One shelf link (C14). A link to a file rather than a page has to say so:
 * "any direct PDF link states its file type and size" is a guardrail we
 * accepted, and the file note lives in the link's own `note` message.
 */
function shelfLinkProblems(link, linkWords, at) {
  const https = (url) => typeof url === 'string' && url.startsWith('https://');
  const checks = [
    [!https(link.href), 'href is not https'],
    [link.hrefFr !== undefined && !https(link.hrefFr), 'hrefFr is not https'],
    [!['en', 'fr'].includes(link.hrefLang), `hrefLang '${link.hrefLang}'`],
    [!String(link.org ?? '').trim(), 'no org, so the link is unattributed'],
    [/\.pdf(\?|$)/i.test(link.href) && !link.fileNote, 'opens a file and does not set fileNote'],
    [
      Boolean(link.fileNote) && !linkWords?.note,
      'fileNote is set, so its note must state the file type and size',
    ],
    [
      link.heldUntil !== undefined && !Object.hasOwn(SHELF_HOLDS, link.heldUntil),
      `unknown hold '${link.heldUntil}'`,
    ],
  ];

  return checks.filter(([failed]) => failed).map(([, problem]) => `${at}: ${problem}`);
}

/*
 * The resources shelf. Groups and links in chapters-meta.ts are index-matched
 * to the numbered message keys, and a drift renders a blank heading or drops a
 * link without a word.
 */
function shelfProblems(meta, locale) {
  const shelf = meta.shelf;
  const copy = MESSAGES[locale].chapters?.[meta.slug]?.shelf;
  const at = `${locale} ${meta.slug} shelf`;

  if (!shelf) return [];

  if (!copy) return [`${at}: missing from ${locale}.json`];

  const problems = [];

  if (shelf.groups.length !== count(copy.groups)) {
    problems.push(
      `${at} groups: ${shelf.groups.length} in chapters-meta.ts, ${count(copy.groups)} in messages`,
    );
  }

  shelf.groups.forEach((group, index) => {
    const groupWords = nth(copy.groups, index);

    /*
     * A group with links but no heading would be a headed list with nothing
     * above it. composeShelf drops such a group rather than render a blank
     * <h3>, so without this the page would quietly lose a group of links.
     */
    if (typeof groupWords?.heading !== 'string' || !groupWords.heading.trim()) {
      problems.push(`${at} group ${index + 1}: no heading in messages, so the group is dropped`);
    }

    if (group.links.length !== count(groupWords?.links)) {
      problems.push(
        `${at} group ${index + 1} links: ${group.links.length} in chapters-meta.ts, ${count(groupWords?.links)} in messages`,
      );
    }

    group.links.forEach((link, l) =>
      problems.push(
        ...shelfLinkProblems(link, nth(groupWords?.links, l), `${at} ${index + 1}.${l + 1}`),
      ),
    );
  });

  return problems;
}

/*
 * One band link (C12). It has to be a real https page, name the language it
 * opens in, render somewhere, be backed by the register, and have a label in
 * every message file that will show it — a link with no label renders nothing,
 * and a label with no link is a promise the page does not keep.
 */
function bandLinkProblems(link, linkWords, at, locale) {
  const https = (url) => typeof url === 'string' && url.startsWith('https://');
  const locales = link.locales ?? [];
  const checks = [
    [!https(link.href), 'href is not https'],
    [!['en', 'fr'].includes(link.hrefLang), `hrefLang '${link.hrefLang}'`],
    [!locales.length, 'no locales, so it renders nowhere'],
    [locales.some((l) => !['en', 'fr'].includes(l)), `locales '${locales.join(', ')}'`],
    [!link.sources?.length, 'no register sources'],
    [
      locales.includes(locale) && !linkWords?.label,
      `no label in ${locale}.json, so it does not render on /${locale}`,
    ],
  ];

  return checks.filter(([failed]) => failed).map(([, problem]) => `${at}: ${problem}`);
}

/*
 * The referral band's links. The outer array is index-matched to the band's
 * numbered cards and the inner arrays to the numbered `links` keys under each
 * card, so a drift silently drops a link or leaves a label with nowhere to go.
 */
function bandProblems(meta, locale) {
  const cards = meta.programsBandLinks;
  const copy = MESSAGES[locale].chapters?.[meta.slug]?.programsBand;
  const at = `${locale} ${meta.slug} band links`;

  if (!cards) return [];

  if (!copy)
    return [`${at}: chapters-meta.ts places links on a band that is not in ${locale}.json`];

  const problems = [];

  if (cards.length !== count(copy.cards)) {
    problems.push(
      `${at}: ${cards.length} card(s) in chapters-meta.ts, ${count(copy.cards)} in messages`,
    );
  }

  cards.forEach((links, index) => {
    const cardWords = nth(copy.cards, index);
    const where = `${at} card ${index + 1}`;

    if (links.length !== count(cardWords?.links)) {
      problems.push(
        `${where}: ${links.length} in chapters-meta.ts, ${count(cardWords?.links)} in messages`,
      );
    }

    links.forEach((link, l) =>
      problems.push(
        ...bandLinkProblems(link, nth(cardWords?.links, l), `${where} link ${l + 1}`, locale),
      ),
    );
  });

  return problems;
}

/* Every `sources` (or `…Sources`) array anywhere in the chapter structure, with where it sits. */
function sourceRefs(node, path, found = []) {
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

function sourceProblems() {
  const problems = [];
  const https = (url) => typeof url === 'string' && url.startsWith('https://');

  const empty = (node, fields) => fields.filter((f) => !String(node?.[f] ?? '').trim());

  Object.entries(SOURCE_META).forEach(([id, s]) => {
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
  Object.keys(SOURCE_META).forEach((id) => {
    if (!Object.hasOwn(SOURCE_REVIEW, id)) {
      problems.push(`sources-review.ts: no entry for '${id}'`);

      return;
    }

    const fields = empty(SOURCE_REVIEW[id], ['publisher', 'type', 'locator']);

    if (fields.length) problems.push(`sources-review.ts ${id}: empty ${fields.join(', ')}`);
  });

  Object.keys(SOURCE_REVIEW)
    .filter((id) => !Object.hasOwn(SOURCE_META, id))
    .forEach((id) => problems.push(`sources-review.ts: '${id}' is not in sources-meta.ts`));

  sourceRefs(CHAPTER_META, 'CHAPTER_META').forEach(([path, ids]) =>
    ids
      .filter((id) => !Object.hasOwn(SOURCE_META, id))
      .forEach((id) => problems.push(`${path}: unknown source id '${id}'`)),
  );

  return problems;
}

/*
 * French review gates, as production applies them (no preview override). The
 * crisis strip, the routes to help and any figure on an urgent card never drop.
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
      }),
    ),
  );

  /*
   * A gated chapter-level module must leave something in its place. The recovery
   * map takes the band's slot, so the band's messages stay until its French is
   * reviewed — otherwise /fr would lose the timing band altogether.
   */
  CHAPTER_META.filter((meta) => meta.recoveryMap && awaitsFrReview('recoveryMap', 'fr')).forEach(
    (meta) => {
      if (!MESSAGES.fr.chapters?.[meta.slug]?.programsBand) {
        problems.push(
          `fr ${meta.slug}: the recovery map waits on French review and there is no programs band left to fall back to`,
        );
      }

      /*
       * The map puts the emergency signpost above itself, so on /fr something
       * else has to. Every stand-in reads the same `urgentExit` on the chapter:
       * the line at the top of the page, any card whose module carries one, and
       * the fallback band — which renders it only where no card already does
       * (ChapterBand in chapter-page.tsx), so on Chapter 01, where the
       * who-to-ask lanes are not gated and carry it, the band stays quiet.
       * Without `urgentExit` there is nothing for any of them to render, and
       * /fr would lose a signpost /en keeps.
       */
      if (!meta.urgentExit) {
        problems.push(
          `fr ${meta.slug}: the recovery map renders the emergency signpost, so the chapter needs an urgentExit for the page to keep it without the map`,
        );
      }
    },
  );

  /*
   * The fibre clocks are the only thing on their chapter that points at an
   * emergency list: high-roughage foods can cause a blockage, and the signs are
   * on another page. The module waits on a French gate, so wherever it is
   * hidden the chapter must still carry that signpost — and carry it where the
   * approved sheets put it, on the card the clocks were on, never above the
   * band about how provinces pay for supplies. That needs an `urgentExit` on
   * the chapter for the signpost to say, and `exitWhenGated` on the figure for
   * the card to print it in the clocks' place. The band behind both stays a
   * last resort (D7), so it has to exist too.
   */
  CHAPTER_META.map((meta) => ({
    meta,
    gatedClocks: meta.categories.flatMap((structure) =>
      (structure.figures ?? []).filter(
        (figure) =>
          figure.kind === 'fibreClocks' && !keepsFigure(figure, structure, 'fr', awaitsFrReview),
      ),
    ),
  }))
    .filter(({ gatedClocks }) => gatedClocks.length > 0)
    .forEach(({ meta, gatedClocks }) => {
      if (!meta.urgentExit) {
        problems.push(
          `fr ${meta.slug}: the fibre clocks render the emergency signpost and wait on a French gate, so the chapter needs an urgentExit`,
        );
      }

      if (!gatedClocks.every((figure) => figure.exitWhenGated === true)) {
        problems.push(
          `fr ${meta.slug}: the fibre clocks wait on a French gate and point at another page's emergency list, so the figure needs exitWhenGated or the signpost falls to the band after the cards`,
        );
      }

      if (!MESSAGES.fr.chapters?.[meta.slug]?.programsBand) {
        problems.push(
          `fr ${meta.slug}: the fibre clocks wait on a French gate and there is no programs band left behind them`,
        );
      }
    });

  /*
   * The go-bag card's band is one link to the supply list. If the two ever
   * waited on different gates, /fr could show a link to a list that is not
   * there.
   */
  if (figureGate('goBag') !== figureGate('supplyList')) {
    problems.push(
      'review-gates.ts: the go-bag link and the supply list must wait on the same French gate',
    );
  }

  const first = CHAPTER_META.find((meta) => meta.slug === 'new-to-the-journey')?.categories[0];
  const crisis = first?.figures?.find((figure) => figure.kind === 'crisis');

  if (!crisis || !keepsFigure(crisis, first, 'fr', awaitsFrReview)) {
    problems.push('fr new-to-the-journey card 1: the 9-8-8 crisis strip must render on /fr');
  }

  return problems;
}

/*
 * Holds, as the pages apply them: a held figure is dropped before anything else
 * looks at it (`gateFigures` in chapters-data.ts), so it renders on no page in
 * either locale. The checks are about what a hold could hide, and about telling
 * a reviewer the truth about it.
 *
 * - The reason has to be one chapters-meta.ts declares and one this file can
 *   explain, or the pack prints a hold nobody can act on.
 * - Every reason chapters-meta.ts declares needs a sentence here, so a new hold
 *   cannot ship unlabelled.
 * - A hold must never be what removes urgent content. The crisis strip, the
 *   routes to help and every figure on a card carrying a same-day, emergency or
 *   crisis line are refused outright, exactly as the French gates refuse them.
 */
function heldProblems() {
  const problems = FIGURE_HOLDS_SOURCE
    ? []
    : ['chapters-meta.ts: FigureHold not found, so held figures go unchecked'];
  const declared = (hold) => !FIGURE_HOLDS.size || FIGURE_HOLDS.has(hold);

  [...FIGURE_HOLDS]
    .filter((hold) => !HELD_REASONS[hold])
    .forEach((hold) =>
      problems.push(`export-content-review.mjs: no sentence for the '${hold}' hold`),
    );

  Object.keys(HELD_REASONS)
    .filter((hold) => !declared(hold))
    .forEach((hold) =>
      problems.push(`export-content-review.mjs: '${hold}' is not a FigureHold in chapters-meta.ts`),
    );

  CHAPTER_META.forEach((meta) =>
    meta.categories.forEach((structure, index) =>
      (structure.figures ?? [])
        .filter((figure) => figure.held)
        .forEach((figure) => {
          const at = `${meta.slug} card ${index + 1}`;

          if (!declared(figure.held)) {
            problems.push(`${at}: '${figure.held}' is not a FigureHold in chapters-meta.ts`);
          }

          if (figure.kind === 'crisis' || figure.kind === 'routes' || structure.urgentContent) {
            problems.push(`${at}: ${figure.kind} carries urgent content and must not be held`);
          }
        }),
    ),
  );

  return problems;
}

/*
 * The bowel reference still (C04).
 *
 * The picture carries no words at all, so every label it shows is a message
 * that has to exist: a missing part name leaves a numbered marker pointing at
 * nothing, in a figure whose whole job is naming parts. The rest of these are
 * the guardrails the figure was approved under, written where they can fail
 * rather than left in a comment.
 *
 * The banned words are the sharpest of them. The models come from the Human
 * Reference Atlas, distributed through an NIH library, and "expert-approved" is
 * how the upstream collection describes its own review process. Either word
 * beside health advice claims a sign-off Liivv does not have — so neither may
 * appear in the figure's copy, in its credit, or in the file metadata the
 * render script writes.
 */
const BANNED_FIGURE_WORDS = [
  [/\bNIH\b/, 'NIH'],
  [/expert[\s-]?approved/i, 'expert-approved'],
];

const inFrame = (percentage) =>
  typeof percentage === 'number' && percentage > 0 && percentage < 100;

/* Every card that places the still, held or not, with where it is. */
function anatomyPlacements() {
  return CHAPTER_META.flatMap((meta) =>
    meta.categories.flatMap((structure, index) =>
      (structure.figures ?? [])
        .filter((figure) => figure.kind === 'bowelReference')
        .map((figure) => ({
          meta,
          structure,
          figure,
          card: index + 1,
          at: `${meta.slug} card ${index + 1}`,
        })),
    ),
  );
}

/* Every string the figure or its credit can show, with where it is written. */
function anatomyStrings() {
  const credit = Object.entries(BOWEL_CREDIT)
    .filter(([, value]) => typeof value === 'string')
    .map(([key, value]) => [`anatomy-meta.ts BOWEL_CREDIT.${key}`, value]);
  const works = BOWEL_CREDIT.works.flatMap((work, index) =>
    Object.entries(work).map(([key, value]) => [
      `anatomy-meta.ts BOWEL_CREDIT.works[${index}].${key}`,
      String(value),
    ]),
  );
  const copy = ['en', 'fr'].flatMap((locale) => {
    const node = MESSAGES[locale].ui?.chapter?.anatomy ?? {};
    const own = Object.entries(node).filter(([, value]) => typeof value === 'string');
    const parts = Object.entries(node.parts ?? {}).map(([key, value]) => [
      `parts.${key}`,
      String(value),
    ]);
    /*
     * The credit's three sentences moved out of `anatomy-meta.ts` into the
     * message tree so they could be read in French. The banned-word scan
     * follows them: "NIH" and "expert-approved" must be as impossible to write
     * in a message file as they were in the constant, in either locale.
     */
    const credits = Object.entries(node.credit ?? {}).map(([key, value]) => [
      `credit.${key}`,
      String(value),
    ]);

    return [...own, ...parts, ...credits].map(([key, value]) => [
      `${locale}.json ui.chapter.anatomy.${key}`,
      value,
    ]);
  });

  return [...credit, ...works, ...copy];
}

function anatomyMessageProblems(keys) {
  return ['en', 'fr'].flatMap((locale) => {
    const node = MESSAGES[locale].ui?.chapter?.anatomy;

    if (!node) return [`${locale}.json: no ui.chapter.anatomy, so the figure has no labels at all`];

    /* `missingKeys`, not `missing`: that name is the run's list of uncovered message paths. */
    const missingKeys = ['alt', 'caption', 'orientation', 'partsHeading']
      .filter((key) => typeof node[key] !== 'string')
      .map((key) => `${locale}.json: no ui.chapter.anatomy.${key}`);
    const unnamed = keys
      .filter((key) => typeof node.parts?.[key] !== 'string')
      .map((key) => `${locale}.json: no ui.chapter.anatomy.parts.${key}, so marker is unnamed`);
    const orphans = Object.keys(node.parts ?? {})
      .filter((key) => !keys.includes(key))
      .map(
        (key) =>
          `${locale}.json: ui.chapter.anatomy.parts.${key} has no marker in anatomy-meta.ts`,
      );

    return [...missingKeys, ...unnamed, ...orphans];
  });
}

function anatomyProblems() {
  const placements = anatomyPlacements();

  if (!placements.length) return [];

  const keys = ANATOMY_PARTS.map((part) => part.key);
  const problems = anatomyStrings().flatMap(([where, value]) =>
    BANNED_FIGURE_WORDS.filter(([pattern]) => pattern.test(value)).map(
      ([, word]) => `${where}: must never say '${word}'`,
    ),
  );

  if (!ANATOMY_PARTS.length) problems.push('anatomy-meta.ts: ANATOMY_PARTS is empty');

  if (new Set(keys).size !== keys.length) {
    problems.push('anatomy-meta.ts: a part is listed more than once');
  }

  ANATOMY_PARTS.filter((part) => !inFrame(part.x) || !inFrame(part.y)).forEach((part) =>
    problems.push(
      `anatomy-meta.ts ${part.key}: marker ${part.x},${part.y} is outside the picture`,
    ),
  );

  if (!String(BOWEL_CREDIT.licenceHref).startsWith('https://creativecommons.org/licenses/by/4.0/')) {
    problems.push('anatomy-meta.ts: BOWEL_CREDIT.licenceHref is not the CC BY 4.0 deed');
  }

  BOWEL_CREDIT.works
    .filter((work) => !/^10\.\d+\/\S+$/.test(String(work.doi)))
    .forEach((work) =>
      problems.push(`anatomy-meta.ts BOWEL_CREDIT: '${work.title}' carries no DOI`),
    );

  /* A file that is not there is a broken picture the pack would call a figure. */
  for (const width of BOWEL_STILL.widths) {
    for (const type of ['avif', 'webp']) {
      const file = join(CORE, 'public', `${BOWEL_STILL.src}-${width}.${type}`.replace(/\//g, sep));

      if (!existsSync(file)) {
        problems.push(
          `${BOWEL_STILL.src}-${width}.${type} is not in core/public — run core/scripts/render-bowel-reference.mjs`,
        );
      }
    }
  }

  problems.push(...anatomyMessageProblems(keys));

  placements.forEach(({ meta, structure, card, figure, at }) => {
    if (!figure.sources?.length) problems.push(`${at} bowelReference: no sources`);

    if (structure.products?.length) {
      problems.push(
        `${at} bowelReference: the card places products, and this figure goes only on cards with no product band`,
      );
    }

    /*
     * The alt text describes the picture. A reader who cannot see it has
     * already been read the card's own sentences, so repeating one of them
     * spends their time telling them nothing new.
     */
    ['en', 'fr'].forEach((locale) => {
      const alt = MESSAGES[locale].ui?.chapter?.anatomy?.alt;
      const items = Object.values(
        MESSAGES[locale].chapters?.[meta.slug]?.categories?.[String(card)]?.items ?? {},
      );

      if (typeof alt !== 'string') return;

      items
        .filter((item) => typeof item === 'string' && item.length > 20 && alt.includes(item))
        .forEach(() =>
          problems.push(`${locale} ${at} bowelReference: the alt text repeats a card sentence`),
        );
    });
  });

  return problems;
}

/*
 * Curated kits placed by the microsite.
 *
 * Every Ostomy Care surface filters the catalogue through OSTOMY_LISTED_KIT_IDS
 * (get-oc-catalog.ts), and that list is empty today. So a kit id left in a card
 * band, in the supply list's kit links, or in the one-click add allowlist would
 * render nothing on the page while this pack told a reviewer it was there —
 * which is exactly the drift these documents exist to prevent. It is an error,
 * not a warning: the fix is to list the kit, or to stop placing it.
 */
function kitProblems() {
  const listed = new Set(OSTOMY_LISTED_KIT_IDS);
  const withheld = new Set(OSTOMY_WITHHELD_KIT_IDS);
  const kits = new Set(OSTOMY_KIT_IDS);
  const problems = [];
  const why = (id) =>
    withheld.has(id) ? 'withheld from ostomy surfaces' : 'not in OSTOMY_LISTED_KIT_IDS';
  const check = (id, at) => {
    if (listed.has(id)) return;
    if (!kits.has(id) && !withheld.has(id)) return;

    problems.push(`${at}: kit #${id} is ${why(id)}, so nothing renders`);
  };

  CHAPTER_META.forEach((meta) =>
    meta.categories.forEach((structure, index) =>
      (structure.products ?? []).forEach((id) => check(id, `${meta.slug} card ${index + 1}`)),
    ),
  );

  SUPPLY_KIT_LINKS.forEach((kit, index) =>
    check(kit.productId, `supply-list-merchandising.ts SUPPLY_KIT_LINKS[${index}]`),
  );

  Object.entries(SUPPLY_CART_PRODUCTS).forEach(([criterion, ids]) =>
    (ids ?? []).forEach((id) =>
      check(id, `supply-list-merchandising.ts SUPPLY_CART_PRODUCTS.${criterion}`),
    ),
  );

  /* A withheld id must never also be listed; the allowlist would win silently. */
  [...withheld]
    .filter((id) => listed.has(id))
    .forEach((id) => problems.push(`oc-ids.ts: kit #${id} is both listed and withheld`));

  return problems;
}

/*
 * The situation doors (C13).
 *
 * A door is a promise that a named thing is one click away, made to someone who
 * may be frightened — so every target is checked here rather than trusted. The
 * anchor has to exist in the message tree for the locale the door renders in,
 * and it has to be a thing that is on screen when the page opens: `#red-flags`
 * is Chapter 02's own section, and `#card-N` is the card article itself, which
 * carries its heading and first sentence whether or not its "more" is open. A
 * door may never point inside a disclosure, a collapsed row, or a lane a filter
 * can hide.
 */
function doorTargetProblems(target, at, problems) {
  const meta = CHAPTER_META.find((chapter) => chapter.slug === target.chapter);

  if (!meta) {
    problems.push(`${at}: unknown chapter '${target.chapter}'`);

    return;
  }

  const has = (locale, path) =>
    typeof path.split('.').reduce((node, key) => node?.[key], MESSAGES[locale]) === 'string';

  if (!target.anchor) return;

  if (target.anchor === 'red-flags') {
    ['en', 'fr'].forEach((locale) => {
      if (!has(locale, `chapters.${meta.slug}.urgent.heading`)) {
        problems.push(
          `${at}: ${locale} ${meta.slug} has no emergency list, so #red-flags is not there`,
        );
      }
    });

    return;
  }

  const card = Number(/^card-(\d+)$/.exec(String(target.anchor))?.[1]);

  if (!Number.isInteger(card)) {
    problems.push(`${at}: anchor '${target.anchor}' is neither 'red-flags' nor 'card-<n>'`);

    return;
  }

  if (card < 1 || card > meta.categories.length) {
    problems.push(
      `${at}: card ${card} is not on ${meta.slug} (it has ${meta.categories.length} cards)`,
    );

    return;
  }

  ['en', 'fr'].forEach((locale) => {
    if (!has(locale, `chapters.${meta.slug}.categories.${card}.title`)) {
      problems.push(
        `${at}: ${locale} ${meta.slug} card ${card} has no title, so #card-${card} is not there`,
      );
    }
  });
}

function doorProblems() {
  const problems = [];
  const ids = SITUATION_DOORS.map((door) => door.id);

  if (new Set(ids).size !== ids.length) {
    problems.push('landing-meta.ts: duplicate situation door id');
  }

  SITUATION_DOORS.forEach((door, index) => {
    const num = index + 1;
    const at = `landing-meta.ts door ${num} (${door.id})`;

    if (Boolean(door.funding) === Boolean(door.chapter)) {
      problems.push(`${at}: needs exactly one of 'funding' and 'chapter'`);
    }

    if (!Object.hasOwn(GLYPH_PATHS, door.glyph)) {
      problems.push(`${at}: glyph '${door.glyph}' is not drawn in glyph-paths.ts`);
    }

    if (door.chapter) doorTargetProblems(door, at, problems);
    if (door.secondary) doorTargetProblems(door.secondary, `${at} second link`, problems);

    /* An emergency door and an emergency list are the same claim, said twice. */
    if (Boolean(door.urgent) !== (door.anchor === 'red-flags')) {
      problems.push(`${at}: 'urgent' and an anchor of 'red-flags' go together or not at all`);
    }

    ['en', 'fr'].forEach((locale) => {
      const text = MESSAGES[locale].ui?.landingPage?.doors?.items?.[String(num)];

      if (!text) {
        problems.push(`${at}: no ${locale} ui.landingPage.doors.items.${num}`);

        return;
      }

      ['label', 'body'].forEach((key) => {
        if (typeof text[key] !== 'string') problems.push(`${at}: no ${locale} ${key}`);
      });

      if (Boolean(door.secondary) !== (typeof text.secondary === 'string')) {
        problems.push(
          `${at}: ${locale} 'secondary' is in the messages or in the meta, not in both`,
        );
      }
    });
  });

  ['en', 'fr'].forEach((locale) => {
    const items = MESSAGES[locale].ui?.landingPage?.doors?.items;

    if (count(items) !== SITUATION_DOORS.length) {
      problems.push(
        `${locale} ui.landingPage.doors.items has ${count(items)} doors, SITUATION_DOORS has ${SITUATION_DOORS.length}`,
      );
    }

    if (typeof MESSAGES[locale].ui?.landingPage?.doors?.heading !== 'string') {
      problems.push(`${locale} ui.landingPage.doors: no heading`);
    }
  });

  return problems;
}

/*
 * A French review flag must name a string in both message files. The coverage
 * check then guarantees it is emitted, so its mark reaches the reviewer.
 */
function frReviewFlagProblems() {
  const at = (locale, path) => path.split('.').reduce((node, key) => node?.[key], MESSAGES[locale]);

  return [...FR_AWAITING_REVIEW]
    .filter((path) => typeof at('en', path) !== 'string' || typeof at('fr', path) !== 'string')
    .map((path) => `FR_AWAITING_REVIEW: '${path}' is not a string in en.json and fr.json`);
}

/*
 * The same rule for the ✎ corrections, which its own comment already promises:
 * a re-review flag must name a string in both message files, or the mark stops
 * appearing while "Corrections waiting on re-review" keeps printing a reference
 * that is marked nowhere in the document — on clinically corrected wording.
 */
function reReviewFlagProblems() {
  const at = (locale, path) => path.split('.').reduce((node, key) => node?.[key], MESSAGES[locale]);

  return [
    ...[...RE_REVIEWS_PENDING.keys()]
      .filter((path) => typeof at('en', path) !== 'string' || typeof at('fr', path) !== 'string')
      .map((path) => `RE_REVIEWS_PENDING: '${path}' is not a string in en.json and fr.json`),
    /*
     * A note for a path that is not a correction explains nothing and rots
     * quietly: either the baseline never had that path (so the line is new copy,
     * which the whole pack reviews) or its wording has been put back. Either way
     * the note goes.
     */
    ...Object.keys(RE_REVIEW_NOTES)
      .filter((path) => !RE_REVIEWS_PENDING.has(path))
      .map(
        (path) =>
          `RE_REVIEW_NOTES: '${path}' is not a correction — it is unchanged from content-review-baseline.en.json, or not in it at all`,
      ),
    /*
     * "Corrections waiting on re-review" is printed per chapter file, so a
     * correction outside `chapters.<slug>.` — a shared UI string, say — would be
     * marked ✎ in the text and then listed in no file at all. That is the exact
     * failure this whole mechanism replaced, so it is a check rather than a
     * thing to remember.
     */
    ...[...RE_REVIEWS_PENDING.keys()]
      .filter((path) => !CHAPTER_META.some((meta) => path.startsWith(`chapters.${meta.slug}.`)))
      .map(
        (path) =>
          `RE_REVIEWS_PENDING: '${path}' is not under a chapter, so it is marked ✎ but listed in no file`,
      ),
  ];
}

/*
 * =============================================================================
 * THE LANDING PAGE'S OWN CHECKS
 * =============================================================================
 * Its copy moved out of the component and into the message tree in this build,
 * and two things have to stay true afterwards.
 *
 * Every section this pack prints has to exist in both locales, or the French
 * landing page silently falls back to the English it was written to replace —
 * `core/i18n/request.ts` deep-merges fr over en, so a missing French key shows
 * English rather than failing.
 *
 * And every path in LANDING_KIT_SURFACES has to name a real string, because
 * those are the lines the pack marks as rendering nowhere while the curated
 * kits are withheld. A renamed key would quietly stop being marked, and a
 * reviewer would read copy that is not on the page as copy that is.
 * =============================================================================
 */
function landingProblems() {
  const problems = [];

  for (const [section] of LANDING_SECTIONS) {
    for (const locale of ['en', 'fr']) {
      if (MESSAGES[locale].ui?.landingPage?.[section] === undefined) {
        problems.push(`${locale}.json: no ui.landingPage.${section}`);
      }
    }
  }

  const known = new Set(LANDING_SECTIONS.flatMap(([section]) => landingStrings(section)));

  for (const path of LANDING_KIT_SURFACES) {
    if (!known.has(path)) {
      problems.push(
        `export-content-review.mjs LANDING_KIT_SURFACES: '${path}' is not a string under ui.landingPage`,
      );
    }
  }

  for (const [locale, node] of ['en', 'fr'].map((l) => [l, MESSAGES[l].ui?.landingPage ?? {}])) {
    for (const section of Object.keys(node)) {
      if (section !== 'doors' && !LANDING_SECTIONS.some(([key]) => key === section)) {
        problems.push(
          `${locale}.json ui.landingPage.${section} is on the page but in no section of 06-landing.md`,
        );
      }
    }
  }

  return problems;
}

/*
 * =============================================================================
 * A HOLD THAT COVERS SHIPPING HAS TO STAY IN STEP WITH THE HOLDS
 * =============================================================================
 * `HELD_CLIENT_MESSAGES` in `held-messages.ts` names the message subtrees the
 * root layout keeps out of the client payload, so a held figure's unapproved
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
 * =============================================================================
 */
function heldClientProblems() {
  const placements = new Map();

  for (const meta of CHAPTER_META) {
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

  const listed = new Set(HELD_CLIENT_MESSAGES.map((group) => group.kind));
  const problems = [];

  for (const [kind, { total, held }] of placements) {
    if (held === total && !listed.has(kind)) {
      problems.push(
        `held-messages.ts: '${kind}' is held on all ${total} of its placements, so its copy renders nowhere and must not ship — add it to HELD_CLIENT_MESSAGES`,
      );
    }
  }

  for (const group of HELD_CLIENT_MESSAGES) {
    const at = placements.get(group.kind);

    if (!at) {
      problems.push(`held-messages.ts: '${group.kind}' is not placed on any chapter`);
    } else if (at.held < at.total) {
      problems.push(
        `held-messages.ts: '${group.kind}' renders on ${at.total - at.held} of its ${at.total} placements, so removing its messages would break the page — take it out of HELD_CLIENT_MESSAGES`,
      );
    }

    for (const path of group.paths) {
      const rest = path.replace(/^OstomyCare\./, '');

      for (const locale of ['en', 'fr']) {
        const node = rest.split('.').reduce((n, key) => n?.[key], MESSAGES[locale]);

        if (node === undefined) {
          problems.push(`held-messages.ts: '${path}' is not in ${locale}.json`);
        }
      }
    }
  }

  return problems;
}

const structureProblems = [
  ...(MODULE_KINDS_SOURCE
    ? []
    : ['figures.tsx: MODULE_KINDS not found, so pinned cards go unreported']),
  ...['en', 'fr'].flatMap((locale) => CHAPTER_META.flatMap((meta) => chapterProblems(meta, locale))),
  ...['en', 'fr'].flatMap((locale) =>
    CHAPTER_META.flatMap((meta) => recoveryMapProblems(meta, locale)),
  ),
  ...['en', 'fr'].flatMap((locale) => CHAPTER_META.flatMap((meta) => shelfProblems(meta, locale))),
  ...['en', 'fr'].flatMap((locale) => CHAPTER_META.flatMap((meta) => bandProblems(meta, locale))),
  ...sourceProblems(),
  ...gateProblems(),
  ...heldProblems(),
  ...anatomyProblems(),
  ...kitProblems(),
  ...doorProblems(),
  ...frReviewFlagProblems(),
  ...reReviewFlagProblems(),
  ...disclosureProblems(),
  ...heldClientProblems(),
  ...landingProblems(),
];

/* ------------------------------------------------------------------------- */
/* Run                                                                        */
/* ------------------------------------------------------------------------- */

const results = {};
const finish = (content) => `${content.replace(/\n{3,}/g, '\n\n').trimEnd()}\n`;

/*
 * Whether the copy in docs/content-review still says what the sources say.
 *
 * Two lines are dropped from both sides before comparing. The `Generated:`
 * stamp changes on every run by design. Any line naming a product is dropped
 * because `--check` deliberately asks BigCommerce for nothing, so it prints an
 * id where a full run prints the product's name — a difference in this run, not
 * a difference in the pack.
 *
 * This reports; it never fails the run. The generated pack is rebuilt once, at
 * the end of the branch, by the export task that owns docs/content-review —
 * until then these files are expected to lag the sources, and a reviewer is
 * told which ones by the stamp inside each file.
 */
const comparable = (content) =>
  content
    .split('\n')
    .filter((line) => !line.startsWith('**Generated:**') && !/\(#\d|product #\d/.test(line))
    .join('\n')
    .trim();

const staleDocs = [];

const compareOnDisk = (path, built) => {
  const have = existsSync(path) ? readFileSync(path, 'utf8') : '';

  if (comparable(have) !== comparable(built)) {
    staleDocs.push(path.slice(REPO.length + 1).split(sep).join('/'));
  }
};

/*
 * One file, with the table of everything it cited appended. `namedSources` is
 * cleared first so each file's table is its own evidence base and not the
 * register in full.
 */
const writeDoc = (locale, build) => {
  namedSources = new Set();

  const doc = build();
  const table = sourceTable(locale);

  return table.length ? { ...doc, content: `${doc.content}\n${table.join('\n')}` } : doc;
};

for (const locale of ['en', 'fr']) {
  results[locale] = [
    writeDoc(locale, () => writeShared(locale)),
    ...CHAPTER_META.map((meta) => writeDoc(locale, () => writeChapter(meta, locale))),
    writeDoc(locale, () => writeFunding(locale)),
    writeDoc(locale, () => writeLanding(locale)),
  ];

  const dir = join(OUT, locale);

  if (CHECK) {
    for (const doc of results[locale]) compareOnDisk(join(dir, doc.file), finish(doc.content));
  } else {
    mkdirSync(dir, { recursive: true });

    for (const doc of results[locale]) writeFileSync(join(dir, doc.file), finish(doc.content), 'utf8');
  }
}

/* Coverage: every OstomyCare string in the English file must have been emitted. */
const allPaths = [];

(function walk(node, prefix) {
  for (const [k, v] of Object.entries(node)) {
    const p = prefix ? `${prefix}.${k}` : k;

    if (v && typeof v === 'object') walk(v, p);
    else allPaths.push(p);
  }
})(MESSAGES.en, '');

const missing = allPaths.filter((p) => !seen.en.has(p));

/* Readable names for the figure kinds that carry a hold or a French gate. */
const FIGURE_NAMES = {
  bowelReference: 'the bowel reference still',
  changeRoutine: 'the pouch change walk-through',
  fibreClocks: 'the lower-fibre clocks',
  gapCompare: 'the opening gap comparison',
  goBag: 'the go-bag link to the supply list',
  lanes: 'the who-to-ask finder',
  partsOfSystem: 'the parts of a pouching system',
  supplyList: 'my supply list',
};

const figureName = (kind) => FIGURE_NAMES[kind] ?? `\`${kind}\``;

/* Every hold in one chapter: held figures first, then held shelf links. */
const heldInChapter = (meta) => [
  ...(meta.categories ?? []).flatMap((structure, index) =>
    (structure.figures ?? [])
      .filter((figure) => figure.held)
      .map((figure) => {
        const reason = HELD_REASONS[figure.held] ?? '⚠ no reason recorded for this hold';
        const at = `Chapter ${meta.num}, card ${index + 1}`;

        return `${figureName(figure.kind)} on ${at} — \`${figure.held}\`: ${reason}`;
      }),
  ),
  ...(meta.shelf?.groups ?? []).flatMap((group, g) =>
    (group.links ?? []).flatMap((link, l) => {
      if (!link.heldUntil) return [];

      const reason = SHELF_HOLDS[link.heldUntil] ?? link.heldUntil;
      const at = `Chapter ${meta.num}, \`shelf.${g + 1}.${l + 1}\` (${link.org})`;

      return [`a resources-shelf link on ${at} — ${reason}`];
    }),
  ),
];

/* Every hold in the sources: held figures, and held shelf links. */
const heldEntries = () => CHAPTER_META.flatMap(heldInChapter);

/*
 * Every French gate the site actually applies, and what waits behind each one.
 * A held figure is left out: it renders nowhere in either locale, so it is not
 * waiting on French.
 */
function gateEntries() {
  const gates = new Map();
  const place = (id, where) => {
    if (!gates.has(id)) gates.set(id, []);

    gates.get(id).push(where);
  };

  const placeFigure = (meta, figure, index) => {
    if (figure.held) return;

    const at = `${figureName(figure.kind)}, Chapter ${meta.num}, card ${index + 1}`;
    const gate = figureGate(figure.kind);

    if (gate) place(gate, at);

    /* The finder gate takes part of a lanes figure, not the whole kind. */
    if (figure.kind === 'lanes') {
      const parts =
        "its tick boxes, its link labels and every lane with no sentence of the card's own";

      place('finder', `${at} — ${parts}`);
    }
  };

  CHAPTER_META.forEach((meta) => {
    (meta.categories ?? []).forEach((structure, index) => {
      (structure.figures ?? []).forEach((figure) => placeFigure(meta, figure, index));
    });

    if (meta.recoveryMap) place('recoveryMap', `the recovery map, Chapter ${meta.num}`);
    if (meta.shelf) place('shelf', `the resources shelf, Chapter ${meta.num}`);

    if (meta.programsBandLinks?.some((links) => links.length)) {
      place('childLinks', `the referral band's links, Chapter ${meta.num}`);
    }
  });

  if (SITUATION_DOORS.length) {
    /*
     * The one gate that hides emergency wording, so it has to say so here: the
     * paragraph above this list promises only that no gate takes an urgent line
     * off a page, and this is where that distinction is drawn. Read out of the
     * doors themselves, so a door that stops being urgent takes the note with
     * it — the same reasoning is in situation-doors.tsx and in fr/06-landing.md.
     */
    const emergency = SITUATION_DOORS.some((door) => door.urgent)
      ? ', the emergency door among them — while this gate is closed /fr shows no doors at all, which takes nothing away because this page carried no emergency signpost before the doors existed'
      : '';

    place('doors', `the landing page's ${SITUATION_DOORS.length} situation doors${emergency}`);
  }

  return [...gates.entries()].map(([id, where]) => {
    const state = awaitsFrReview(id, 'fr') ? '' : ' *(signed off — live on /fr)*';

    return `- \`${id}\`${state} — ${where.join('; ')}`;
  });
}

const heldModules = heldEntries();

const readme = [
  '# Ostomy microsite — content review',
  `**Prepared for:** Liivv management and clinical review  `,
  `**Covers:** every page of \`/liivv-health/ostomy-care\`, in English and French  `,
  `**Generated:** ${TODAY} from commit \`${COMMIT}\``,
  '',
  "> **These files are generated from the site's own sources.** Do not edit them. Mark corrections against the reference beside each line — the change is made in the source, and the files are generated again. That way the text you approve is the text that ships, and the two cannot drift apart.",
  '',
  '## How to review',
  '',
  '1. Start with the English files. The French is machine translated with partial human correction and needs a separate francophone clinical review.',
  `   In the French files, lines marked ${FR_REVIEW_MARK} show on /fr now with no review gate in front of them — French rewritten to follow a correction to the English or to match the glossary beside a new module, and the emergency signposts, which no gate may hide. Review those first; everything else new on /fr waits behind one of the gates listed below.`,
  '2. For each correction, give the file and the reference — for example *02, card 18, `18.s1.2`* — and the corrected wording.',
  '3. Check the **Referral chip** and **Products shown** lines under each card as well as the text. A product beside a card is a claim too.',
  '4. Funding figures change. Check each against its official source and note the date you checked.',
  '',
  '## These pages render without JavaScript',
  '',
  '**This was a ship blocker on the last pack, and it is fixed.** With JavaScript disabled or blocked, a reader now gets the page: the heading, every card, the walk-through steps, Chapter 02’s emergency red-flag list with all of its signs, and the 9-8-8 crisis line on Chapter 01. That was checked page by page, in a browser with scripts switched off, on every page in this pack in both languages.',
  '',
  'What changed: one file, `core/app/[locale]/(default)/loading.tsx`, wrapped every route in this part of the store in a Suspense boundary, so the body of each page arrived in the HTML inside a `<div hidden>` that only an inline script moved into view. That file has been removed. Measured the same way as before — stripping scripts and styles from the served HTML and comparing the text inside those containers against the text outside them — the share of each page that sits inside them has gone from between 84% and 95% to between 3.8% and 14.7%. What is left inside is the site header and the footer, which this pack does not cover; see "What is not in these files". That is the same block of words on every page, so it is a larger share of a short page than of a long chapter — 14.7% on the landing page, 3.8% on the longest French chapters. Every word this review covers is now outside.',
  '',
  '**The second copy of the emergency wording is gone, and that is the point.** Chapter 02’s emergency list and the 9-8-8 crisis sentence used to be rendered a second time inside a `<noscript>` on every `/liivv-health/ostomy-care/**` page, because they were the two things a reader could not afford to lose while the rest of the page stayed hidden. They are in the page itself now, so that duplicate has been removed rather than left to show twice; the one sentence it owned — "This page needs JavaScript to show its content…" — is gone from the site and from these files. Every page in this pack except Funding & Coverage also carries its own link to Chapter 02’s red-flag list, and those are plain links that work with scripts off.',
  '',
  '**Not fixed everywhere.** Outside this microsite, the category listings, the product pages and the cart still deliver their main content inside a streaming boundary, and still show little or nothing with scripts off. None of those pages is in this pack, and they are tracked separately.',
  '',
  'What that means for this review. Where these files say a figure is "the same server HTML" or describe what is drawn "before any control is touched", it means the words are in the page rather than built by a script, so nothing can rewrite them and no control is needed to read them — and a reader with JavaScript off now sees them too.',
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
  '## What is not in these files',
  '',
  '- Product names, descriptions and prices, which come from BigCommerce.',
  '- The site header and navigation, managed separately.',
  `- Kit contents. None of the ${OSTOMY_KIT_IDS.length} curated ostomy kits is shown on the landing page, the Liivv Health hub, any chapter, or the Shop Ostomy Care shelf at /liivv-health/ostomy-care/shop-ostomy-care, so no kit is described in these files. Each contradicts the guidance it would sit beside — a starter kit whose barrier and pouch do not couple, a go-bag of moisturising wipes, a pediatric kit carrying convex barrier rings and a lotion — and ${OSTOMY_WITHHELD_KIT_IDS.length} are held further for their names, three of them also for carrying drugs or natural health products. Two things the site cannot withhold from here, and both are owner steps in BigCommerce: the kits' own product pages stay live, and that shelf's facet counts, total and pagination still count the filtered kits. Removing 8041–8048 from category 1150, or setting is_visible = false, closes both. The rebuild that would make any of these kits safe to list is written as a draft in \`core/scripts/create-ostomy-care-kits.mjs\` — explicit components per SKU, a locked variant for every component sold in more than one size, and descriptions with no outcome claims — and it is pending owner approval. It has not been run: \`OWNER_CONFIRMED\` in that file is false, and while it is, the script refuses every request that is not a read. No kit in BigCommerce has been changed.`,
  '',
  '## Written, but not on a page yet',
  '',
  'Both lists below are read out of `chapters-meta.ts` and `review-gates.ts` each time this pack is generated, so neither can fall behind the code.',
  '',
  heldModules.length
    ? '**Held — built, and rendering on no page, in either locale.** The wording is still in these files, because the ruling that lifts a hold is made on the words as well as on the drawing. Lifting one is a single flag in the source.'
    : '**Held — nothing is held.** Every figure in these files renders.',
  '',
  ...heldModules.map((entry) => `- ${entry}`),
  ...(heldModules.length ? [''] : []),
  '**Waiting on French review — on /en now, hidden on /fr until a francophone reviewer signs off the French.** In each case the card or the page keeps the wording a reviewer had already approved, so /fr loses a module rather than a referral, and no gate removes an urgent, emergency or crisis line that the card or the page already carried. The owner opens a gate by adding its id to `FR_REVIEWED` in `review-gates.ts` after the sign-off; a gate with no note beside it is still closed. On local development and on Vercel previews every gate is open so the French can be read in context, each gated module carrying a visible draft marker — production never opens one that way.',
  '',
  ...gateEntries(),
  '',
  '## Regenerating',
  '',
  '```bash',
  'node --env-file-if-exists=.env.local core/scripts/export-content-review.mjs',
  '```',
  '',
  `Coverage check on this run: **${allPaths.length - missing.length} of ${allPaths.length}** English strings under \`OstomyCare\` appear in these files.`,
  '',
].join('\n');

if (CHECK) compareOnDisk(join(OUT, 'README.md'), readme);
else writeFileSync(join(OUT, 'README.md'), readme, 'utf8');

for (const locale of ['en', 'fr']) {
  console.log(`\n${locale}:`);

  for (const d of results[locale])
    console.log(`  ${d.file.padEnd(34)} ${String(d.words).padStart(6)} words`);
}

console.log(
  CHECK
    ? '\n--check: no files written, product names not fetched'
    : `\nproducts named from BigCommerce: ${Object.keys(productNames).length}/${productIds.length}`,
);
console.log(
  `coverage: ${allPaths.length - missing.length}/${allPaths.length} English strings emitted`,
);
console.log(
  `structure: ${structureProblems.length ? `${structureProblems.length} problem(s)` : 'meta and messages line up; sources and gates ok'}`,
);

if (CHECK) {
  console.log(
    `review pack: ${staleDocs.length ? `${staleDocs.length} of ${results.en.length + results.fr.length + 1} file(s) behind the sources` : 'every file matches the sources'}`,
  );

  if (staleDocs.length) {
    console.log('\nBEHIND THE SOURCES — run the export without --check to rebuild:');
    staleDocs.forEach((path) => console.log(`  ${path}`));
  }
}

if (missing.length) {
  console.log('\nNOT EMITTED:');
  missing.forEach((p) => console.log(`  ${p}`));
  process.exitCode = 1;
}

if (structureProblems.length) {
  console.log('\nSTRUCTURE CHECKS FAILED:');
  structureProblems.forEach((p) => console.log(`  ${p}`));
  process.exitCode = 1;
}
