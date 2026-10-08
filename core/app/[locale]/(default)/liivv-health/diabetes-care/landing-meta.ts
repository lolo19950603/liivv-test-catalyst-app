/*
 * =============================================================================
 * DIABETES CARE LANDING — STRUCTURE
 * =============================================================================
 * What the landing page is made of, apart from the words. Prose lives in
 * messages/*.json under `DiabetesCare.ui.landingPage`, the way the chapters
 * hold theirs, and the page itself is the shared engine's
 * (../_microsite/landing), drawn by ./page.tsx from this file.
 *
 * From the verified copy record of 2026-10-05 (section A). Every fact on the
 * page names the register entries it rests on (./chapters/sources-meta.ts);
 * a line about Liivv itself rests on the owner's word, on code on this branch,
 * or on how the page is built, and says which.
 *
 * Lists here are index-matched to the numbered keys in the message tree, so a
 * door added here without a label, or a label with no door, is a structure
 * problem the content-review export reports.
 *
 * No value imports and erasable TypeScript only: the content-review export
 * loads this file directly under Node's type stripping, exactly as it loads
 * chapters-meta.ts, and checks every door's and chip's target, every fact's
 * sources and every held line against it.
 * =============================================================================
 */

import type { ChapterSlug, GlyphName } from './chapters/chapters-meta';
import type { PathSlug } from './chapters/paths-meta';
import type { SourceId } from './chapters/sources-meta';

/*
 * =============================================================================
 * WHAT HAS TO BE TRUE BEFORE A LINE GOES LIVE
 * =============================================================================
 * Some of the copy is written and checked, but rests on something that is not
 * true yet: code that is not deployed, a step operations has not confirmed, a
 * page that does not exist. Each such condition is one switch here, false
 * until the named person says otherwise.
 *
 * Copy that waits on a closed switch is not only not rendered, it is not sent
 * to the browser either (`heldLandingPaths`, applied in ./layout.tsx): a hold
 * is a promise that nobody outside the review has seen the wording yet.
 * =============================================================================
 */
export type LandingGate =
  /*
   * E8. Trust item 4 and FAQ 2 describe the ad-signal denial in
   * ~/lib/analytics/ad-signals.ts and sensitive-products.ts. True only once
   * those are committed, deployed and the preview checks pass (consent denial
   * before page_view on Diabetes pages, category 1151 products, /compare and
   * wish lists), and the privacy lead has signed off FAQ 2 (D5).
   */
  | 'adSignalsShipped'
  /*
   * E4. FAQ 5 says a pharmacist reviews and dispenses every insulin and
   * glucagon order. On since 2026-10-06: the owner confirmed it (A8, "pharmacist
   * reviews and dispenses"; B3, "the pharmacist reviews all insulin and
   * glucagon orders - we ship coldchain - insulin is not available for
   * purchase online for Quebec"). Insulin is never offered on /fr, because it
   * may not be advertised to Quebec (B11): see FR_HELD_COPY below and the
   * shelf filter in ./page.tsx.
   */
  | 'insulinReviewConfirmed'
  /*
   * D3. The care band's "Request a call" opens the appointment page, which
   * does not offer a CDE reason yet and saves nothing, and a guest who signs
   * in from it lands on the dashboard. Stays off: Microsoft Bookings, or
   * a booking page of the CDEs' own, could switch it on later (B6).
   * Meanwhile every CDE panel shows their general phone line and hours
   * (DIABETES_SITE.contact).
   */
  | 'cdeRequestReason'
  /*
   * The Diabetes funding page (/liivv-health/diabetes-care/funding). On since
   * 2026-10-06, when the page was built from its verified copy record.
   */
  | 'fundingPage';

export const LANDING_GATES: Record<LandingGate, boolean> = {
  adSignalsShipped: false,
  insulinReviewConfirmed: true,
  cdeRequestReason: false,
  fundingPage: true,
};

/*
 * The copy that waits on a switch, by path from the root of the message tree.
 * Only words that make a claim are listed: a door or a button whose target is
 * not there yet simply does not render, and its label is not a claim.
 */
export const LANDING_GATED_COPY: Array<{ gate: LandingGate; paths: string[] }> = [
  {
    gate: 'adSignalsShipped',
    paths: ['DiabetesCare.ui.landingPage.trust.items.4', 'DiabetesCare.ui.landingPage.faq.items.2'],
  },
  { gate: 'insulinReviewConfirmed', paths: ['DiabetesCare.ui.landingPage.faq.items.5'] },
];

/*
 * Copy that never goes to /fr, whatever its switch says: insulin may not be
 * advertised to Quebec (owner answer B11, 2026-10-06, "Insulin cant be
 * advertised to Quebec, can be billed and shipped there (if person is
 * privately paying)"), so the insulin question is English-only. It is left
 * off the French page and out of the French browser bundle. So is the label
 * of the insulin shelf link under New to the Journey card 8
 * (../chapters/chapter-shop.ts), which renders on English pages only.
 */
export const FR_HELD_COPY: string[] = [
  'DiabetesCare.ui.landingPage.faq.items.5',
  'DiabetesCare.ui.chapter.shop.offers.insulinShelf',
];

/*
 * The landing copy kept out of the browser today: every path whose switch is
 * still off, and on /fr the English-only copy too. With no locale, the
 * English list, which is what the content-review export describes.
 */
export function heldLandingPaths(locale = 'en'): string[] {
  return [
    ...LANDING_GATED_COPY.filter((group) => !LANDING_GATES[group.gate]).flatMap(
      (group) => group.paths,
    ),
    ...(locale === 'fr' ? FR_HELD_COPY : []),
  ];
}

/* ---------- 3. Situation doors (numbered keys `doors.items.1..6`, by position) ---------- */

export type SituationDoorId =
  | 'justTold'
  | 'lowHighSick'
  | 'startingTools'
  | 'typeRight'
  | 'money'
  | 'helping';

export interface SituationDoor {
  id: SituationDoorId;
  glyph: GlyphName;
  /** A chapter slug from CHAPTER_META. Exactly one of `chapter` and `funding`. */
  chapter?: ChapterSlug;
  /** A fragment on that chapter: `red-flags`, or `card-<n>` for a card. */
  anchor?: string;
  funding?: true;
  /** Emergency wording. Marked in text and symbol, never in colour alone. */
  urgent?: true;
  /** The quieter second link under a door, for the reader whose case is not urgent. */
  secondary?: { chapter: ChapterSlug; anchor: string };
  /*
   * The door renders only once its target is live: its chapter served by the
   * engine, or the funding page built. The urgent door never waits on anything.
   */
  requires?: 'chapterOnEngine' | 'fundingPage';
}

export const SITUATION_DOORS: SituationDoor[] = [
  /* Ch01 from the top: the whole chapter is "Just been told, or setting up?" */
  { id: 'justTold', glyph: 'calendar', chapter: 'new-to-the-journey', requires: 'chapterOnEngine' },
  /*
   * Straight to Ch02's pinned-open #red-flags (never gated, renders with JS
   * off). Secondary: Ch02 card 11, "Who to call, and when". The source check
   * (P8) found it safer than card 2, the Rule of 15, which could read as an
   * invitation to self-treat a severe low. Nurse to confirm (D11).
   */
  {
    id: 'lowHighSick',
    glyph: 'urgent',
    chapter: 'staying-safe',
    anchor: 'red-flags',
    urgent: true,
    secondary: { chapter: 'staying-safe', anchor: 'card-11' },
  },
  /* Ch03 from the top: meters, sensors, pens, syringes, pumps. */
  { id: 'startingTools', glyph: 'sensor', chapter: 'your-tools', requires: 'chapterOnEngine' },
  /* Ch05 card 6, "Could my type be different?" (first card of the less common types). */
  {
    id: 'typeRight',
    glyph: 'list',
    chapter: 'know-your-type',
    anchor: 'card-6',
    requires: 'chapterOnEngine',
  },
  /* /liivv-health/diabetes-care/funding (`fundingPage`, on since 2026-10-06). */
  { id: 'money', glyph: 'coin', funding: true, requires: 'fundingPage' },
  /* Ch06 card 5, "Caring for someone with diabetes". */
  {
    id: 'helping',
    glyph: 'hands',
    chapter: 'this-might-be-you',
    anchor: 'card-5',
    requires: 'chapterOnEngine',
  },
];

/*
 * The approved "emergency signs are in Staying Safe" pair the doors fall back
 * to on /fr while the `doors` gate is closed. This chapter's `urgentExit`
 * points at Staying Safe from elsewhere, which is what the landing needs;
 * Staying Safe's own says "at the top of this page".
 */
export const URGENT_EXIT_CHAPTER: ChapterSlug = 'this-might-be-you';

/* ---------- 4. "Which diabetes?" chips (keys `types.chips.<id>`, `types.hints.<id>`) ---------- */

export type TypeChipId =
  | 'type1'
  | 'type2'
  | 'gestational'
  | 'prediabetes'
  | 'lada'
  | 'mody'
  | 'other';

export interface TypeChip {
  id: TypeChipId;
  /* Know Your Type card. The chip's target while that chapter is on the engine. */
  card: number;
  /*
   * The path page of the same type under /chapters/<path> (./chapters/paths-meta.ts),
   * used only while Know Your Type is not on the engine. With neither, the
   * chip is dropped. Whether the owner prefers the generated reading lists as
   * the chips' targets is D12.
   */
  path?: PathSlug;
}

/* The chapter the chips open. */
export const TYPE_CHIPS_CHAPTER: ChapterSlug = 'know-your-type';

export const TYPE_CHIPS: TypeChip[] = [
  { id: 'type1', card: 1, path: 'type-1' },
  { id: 'type2', card: 2, path: 'type-2' },
  { id: 'gestational', card: 4, path: 'gestational' },
  { id: 'prediabetes', card: 3, path: 'prediabetes' },
  /* No path page of their own: hidden unless Know Your Type is served. */
  { id: 'lada', card: 7 },
  { id: 'mody', card: 8 },
  /* Opens Know Your Type card 6, which duplicates the "Is my type right?" door (D12). */
  { id: 'other', card: 6, path: 'less-common-types' },
];

/* The intro's "hard to tell at first" clause (`types.body`). */
export const TYPES_SOURCES: SourceId[] = ['dc-cpg-ch3-classification-diagnosis'];

/* ---------- 5. Fact band (keys `facts.items.1..4`, by position) ---------- */

export const FACT_BAND: Array<{ sources: SourceId[] }> = [
  /* 5 to 10% have type 1; it can start in adulthood. */
  { sources: ['dc-type-1'] },
  /* 90 to 95% of cases in Canada are type 2; some have no symptoms at all. */
  { sources: ['dc-type-2'] },
  /* 3 to 20% of pregnant people, depending on risk factors. */
  { sources: ['dc-gestational-diabetes'] },
  /* About 71% of people with type 1 in Canada were diagnosed as adults (a T1D Index estimate; D13). */
  { sources: ['bt1d-facts-and-figures'] },
];

/* ---------- 2. Trust strip (keys `trust.items.1..4`) ---------- */

/* Every item is checkable; the basis is recorded here for the export and never rendered. */
export const TRUST_ITEMS: Array<{ basis: 'owner' | 'code' | 'page'; gate?: LandingGate }> = [
  /*
   * Liivv's Certified Diabetes Educators, for all of Canada (owner, A2 and
   * B5, 2026-10-06; presented as Liivv's own service, owner note 5,
   * 2026-10-07).
   */
  { basis: 'owner' },
  /*
   * Liivv's pharmacies serve all of Canada, Quebec and the territories
   * included (owner, A1 and B11, 2026-10-06). The insulin exception for
   * Quebec is in FAQ 1, right under the strip.
   */
  { basis: 'owner' },
  /* Health facts shown with their sources: true by construction of the page. */
  { basis: 'page' },
  /* Ad tracking off on these pages. */
  { basis: 'code', gate: 'adSignalsShipped' },
];

/* ---------- 6. Curated kits ---------- */

/*
 * The section, the hero's kits button, the "Kits" shop room and the closing
 * kits button render only when a kit is listed (DIABETES_LISTED_KIT_IDS in
 * ./dc-ids.ts), and none is until the owner signs one off. The kit
 * walkthrough's tray and search lines are written from the first approved
 * kit's contents (E6), so this page has none to give it yet, and the section
 * renders without the walkthrough until it does.
 */

/* ---------- 7. Shop rooms (keys `shop.rooms.<id>`) ---------- */

/*
 * 'kits' only when a kit is listed. Rooms are read from product names
 * (./shop-classify.ts) until the server-side rooms exist (D16). Insulin and
 * glucagon have their own room since the owner confirmed the pharmacist review
 * (E5, `insulinReviewConfirmed`), and each of their tiles carries
 * `shop.reviewNotice`. On /fr the room and its products are left out:
 * insulin may not be advertised to Quebec (B11). They stay in the full shop.
 */
export const SHOP_ROOMS = [
  'all',
  'kits',
  'meters',
  'sensors',
  'injection',
  'insulin',
  'pump',
  'accessories',
] as const;

/* ---------- 10. Care band ---------- */

/*
 * Two panels. The first says who answers: Liivv's Certified Diabetes
 * Educators, for questions from anywhere in Canada (owner answers A2, B5, B10,
 * 2026-10-06; presented as Liivv's own service, owner note 5, 2026-10-07). Its
 * "Request a call" renders once a booking page can take the request
 * (`cdeRequestReason`, D3; B6). The second, "Speak to a CDE" (`care.chat`),
 * gives their general phone line and hours (DIABETES_SITE.contact; B9),
 * then the existing chat as the secondary way in. It no longer says "Available
 * in Ontario" (B12, "chat can be general - speak to a CDE").
 */
export const PHARMACIST_CDE_REQUEST_HREF = '/account/virtual-care/appointment';
export const PHARMACIST_CHAT_HREF = '/account/virtual-care';

/*
 * The full shop, Shop Diabetes Care (category 1151, rewritten to its category
 * page by the routing proxy). Every shop button on the landing opens it.
 */
export const SHOP_DIABETES_HREF = '/liivv-health/diabetes-care/shop-diabetes-care';

/* ---------- 11. Brands (not copy, never translated) ---------- */

/*
 * One pill per shopping brand family, matching the Diabetes Essentials shop's
 * brand filter slug for slug (./shop-classify.ts), and each one a link to the
 * shop filtered to it (owner notes 9 and 10, 2026-10-07). The landing shows a
 * pill only while that brand has something on the shelf (./page.tsx).
 *
 * Logos: the owner gave permission to use every current maker logo (B16,
 * 2026-10-06) and approved downloading six official files (2026-10-07). They
 * are in /archive/diabetes-care-logos, each from the maker's own Canadian or
 * press-kit page, recorded in docs/diabetes-content/logo-sources.md:
 *   - omnipod-trimmed.png is omnipod.png (Insulet's press kit, no tagline)
 *     with its wide white margins trimmed and scaled to 200 px high, so the
 *     mark fills its pill; the original stays beside it;
 *   - contour.png carries Ascensia's "Evolving with you" tagline, so it and
 *     the Omnipod mark are shown taller (`logoFit: 'tall'`);
 *   - tandem.svg, minimed.png and onetouch.png as downloaded;
 *   - insulet.png is on file but not shown: the row is by shopping brand, and
 *     Insulet's pods are the Omnipod pill.
 * Dexcom, FreeStyle Libre, mylife, Accu-Chek and FreeStyle stay names in
 * pills styled to match until the owner supplies their files. The old files
 * are no longer shown: abbott.avif (Abbott's corporate mark, not FreeStyle
 * Libre), insulet.avif, ypsomed.avif (the maker's old name), dexcom.avif
 * (despite its name, Insulet's wordmark; still a Makeswift default in
 * archive-default-logos.ts), brand-2.webp (an older Dexcom mark) and
 * brand-3.webp (the Medtronic corporate mark).
 *
 * mylife: the YpsoPump's maker is mylife Diabetes Care Canada Inc., which
 * owns the mylife trademarks (its Canadian "About us" page, read 2026-10-08,
 * `mylife-about-ca`), so the pill says mylife, not Ypsomed.
 *
 * A logo's alt text, and a text pill's words, are the brand's name. Names,
 * not copy, and never translated.
 */
const LOGOS = '/archive/diabetes-care-logos';

export interface LandingBrandMeta {
  /* The shop's brand filter slug (`?brand=`). */
  slug: string;
  name: string;
  logo?: string;
  /* A logo whose mark is small in its file (a tagline, a tall shape) is shown taller. */
  logoFit?: 'tall';
  /* The register entry that backs the name, where it is not the obvious one. */
  source?: SourceId;
}

export const BRANDS: readonly LandingBrandMeta[] = [
  { slug: 'dexcom', name: 'Dexcom' },
  { slug: 'freestyle-libre', name: 'FreeStyle Libre' },
  { slug: 'omnipod', name: 'Omnipod', logo: `${LOGOS}/omnipod-trimmed.png`, logoFit: 'tall' },
  { slug: 'minimed', name: 'MiniMed', logo: `${LOGOS}/minimed.png` },
  { slug: 'tandem', name: 'Tandem', logo: `${LOGOS}/tandem.svg` },
  { slug: 'mylife', name: 'mylife', source: 'mylife-about-ca' },
  { slug: 'onetouch', name: 'OneTouch', logo: `${LOGOS}/onetouch.png` },
  { slug: 'contour', name: 'Contour', logo: `${LOGOS}/contour.png`, logoFit: 'tall' },
  { slug: 'accu-chek', name: 'Accu-Chek' },
  { slug: 'freestyle', name: 'FreeStyle' },
];

/* ---------- 12. FAQs (keys `faq.items.1..5`) ---------- */

/*
 * Where a `<link>…</link>` in an answer goes, in the order the tags appear.
 * The tags wrap words already in the sentence and never add any.
 */
export type LandingLinkTo =
  | { source: SourceId }
  | { tel: string }
  /* An email address, opened as a mailto: link. */
  | { email: string }
  | { chapter: ChapterSlug; anchor?: string }
  /* A storefront page, such as the account's pharmacy, given the /fr prefix on /fr. */
  | { page: string };

export interface FaqMeta {
  sources: SourceId[];
  /* What a line about Liivv itself rests on; never rendered. */
  basis?: 'owner' | 'code';
  gate?: LandingGate;
  /* The locales the question shows in, where it is not every locale. */
  locales?: Array<'en' | 'fr'>;
  links?: LandingLinkTo[];
}

export const FAQ_META: FaqMeta[] = [
  /*
   * 1 supplies and coverage. Where Liivv's pharmacies serve, and the insulin
   * exception for Quebec (owner, A1 and B11, 2026-10-06). How to send a
   * prescription, from the account's pharmacy page (B14: "We have the online
   * dashboard account features"; Account, Pharmacy, Add prescription, by
   * transfer or doctor fax). The comparisons; the two government pages back
   * "coverage changes". How paying works is the Funding page's (owner answers
   * A6 and B13, 2026-10-06): the Liivv pharmacy in each province bills that
   * province's drug plan directly (funding-meta.ts, DIRECT_BILLING), not in
   * Quebec, whose public plan does not cover drugs bought outside Quebec; an
   * invoice for a claim elsewhere (receipts: MFHP), and no claim route
   * promised (pharmacy or vendor only: NB IPP). "Ask the CDEs" names the
   * channel for billing and claims questions (B10; D8), plain text because the
   * care band with their contact is further down the page.
   */
  {
    sources: [
      'dc-comparisons-by-province',
      'hc-pharmacare-bilateral-agreements',
      'bc-national-pharmacare',
      'qc-stays-outside-quebec',
      'dc-ontario-monitoring-for-health',
      'nb-insulin-pump-program',
    ],
    basis: 'owner',
    links: [{ page: '/account/pharmacy' }, { source: 'dc-comparisons-by-province' }],
  },
  /* 2 privacy. */
  { sources: [], basis: 'code', gate: 'adSignalsShipped' },
  /*
   * 3 sensor fails. The 911 line uses Staying Safe's sourced wording
   * (`urgent.signs.1`); it stays word for word, and CPG Ch14 2023 backs it too
   * (ruling C12, 2026-10-06). The CDE line names Liivv's Certified Diabetes
   * Educators and dials their general line, as every CDE panel does (C12 for
   * the business group; B9; presented as Liivv's own service with no email or
   * About link, owner note 5, 2026-10-07).
   */
  {
    sources: [
      'dc-technology-and-devices',
      'bt1d-what-is-glucagon',
      'das-glucagon',
      'dc-cpg-ch14-hypoglycemia-2023',
    ],
    basis: 'owner',
    links: [{ tel: '+18445611254' }, { tel: '911' }, { chapter: 'staying-safe' }],
  },
  /* 4 sharps. */
  { sources: ['hpsa-returning-medical-sharps', 'dc-getting-started-with-insulin'] },
  /*
   * 5 insulin. The pharmacist-review notice is the owner's (A8, B3,
   * 2026-10-06). English only: insulin may not be advertised to Quebec (B11).
   */
  {
    sources: ['dc-getting-started-with-insulin'],
    basis: 'owner',
    gate: 'insulinReviewConfirmed',
    locales: ['en'],
  },
];
/*
 * With FAQ 2 off, four questions render in English and three in French. The
 * page never shows a question whose answer is held.
 */
