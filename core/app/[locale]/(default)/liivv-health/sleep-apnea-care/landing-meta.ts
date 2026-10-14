/*
 * =============================================================================
 * SLEEP APNEA CARE LANDING — STRUCTURE
 * =============================================================================
 * What the landing page is made of, apart from the words. Prose lives in
 * messages/*.json under `SleepApneaCare.ui.landingPage`; the page is Sleep's
 * own landing component (./sa-landing-page.tsx), which reuses the engine's
 * doors, governance block, source lines and Olivia band.
 *
 * From the verified copy record docs/sleep-content/landing.md (section A, with
 * the owner and nurse rulings of 2026-10-13 and the C26 follow-ons of
 * 2026-10-14 applied). Every fact on the page names the register entries it
 * rests on (./chapters/sources-meta.ts); a line about Liivv itself rests on
 * the owner's word, on code on this branch, or on how the page is built, and
 * says which.
 *
 * Lists here are index-matched to the numbered keys in the message tree.
 *
 * No value imports and erasable TypeScript only: the content-review export
 * loads this file under Node's type stripping and checks every door's, chip's
 * and FAQ link's target, every fact's sources and every held line against it.
 * =============================================================================
 */

import type { ChapterSlug, GlyphName } from './chapters/chapters-meta';
import type { PathSlug } from './chapters/paths-meta';
import type { SourceId } from './chapters/sources-meta';

/*
 * =============================================================================
 * WHAT HAS TO BE TRUE BEFORE A LINE GOES LIVE
 * =============================================================================
 * Copy that waits on a closed switch is not rendered and is not sent to the
 * browser either (`heldLandingPaths`, applied in ./layout.tsx).
 * =============================================================================
 */
export type LandingGate =
  /*
   * Trust item 3 and FAQ 5 describe the ad-signal denial in
   * ~/lib/analytics/ad-signals.ts (CARE_PATH) and sensitive-products.ts.
   * True only once deployed and the privacy lead signs off FAQ 5 (D8; ruling
   * B3 "default", 2026-10-13: both stay held).
   */
  | 'adSignalsShipped'
  /*
   * Trust item 2: every listed device has a recorded Health Canada licence
   * number (plan Part G8). The MDALL sweep of 2026-10-13 left 10 products
   * uncertain, so this stays off.
   */
  | 'mdallRecorded'
  /*
   * The C26 prescription check for complete masks (ruling C26 "Option b",
   * 2026-10-13; follow-ons 2026-10-14). The checkout gate is built on this
   * branch (commit 9acebbd7) and the section cannot launch before it deploys.
   * On at build; the owner re-confirms at go-live (spec 7.7). Releases
   * shop.rxMaskLine, faq.items.1.rxMaskLine, shop.badges.prescription and
   * ui.commerce.rxMaskCheck / rxMaskParts. While off, `{rxMaskLine}` is
   * interpolated as an empty string and no line promises a pharmacist check.
   */
  | 'rxMaskGateShipped'
  /*
   * The store's returns and refunds policy page is published (ruling N6,
   * 2026-10-13; legal review D18). The returns line must show before purchase.
   */
  | 'returnsPolicyPublished'
  /* The store brand cleanup (plan Part G1; D14) and logo permissions. */
  | 'brandsReady'
  /* The rotating hero (D12). Off: the static `hero.heading` is the h1. */
  | 'heroRotating'
  /* The Sleep funding page (/liivv-health/sleep-apnea-care/funding), built in this pass. */
  | 'fundingPage'
  /* Any link to /liivv-health/sleep-apnea-care/machine-guide (placement D13 open). */
  | 'machineGuideLinked';

export const LANDING_GATES: Record<LandingGate, boolean> = {
  adSignalsShipped: false,
  mdallRecorded: false,
  rxMaskGateShipped: true,
  returnsPolicyPublished: false,
  brandsReady: false,
  heroRotating: false,
  fundingPage: true,
  machineGuideLinked: false,
};

/*
 * The copy that waits on a switch, by path from the root of the message tree.
 * Only words that make a claim are listed: a door or a button whose target is
 * not there yet simply does not render. `fundingPage` and `machineGuideLinked`
 * gate links, not words, so they hold no paths here.
 */
export const LANDING_GATED_COPY: Array<{ gate: LandingGate; paths: string[] }> = [
  { gate: 'mdallRecorded', paths: ['SleepApneaCare.ui.landingPage.trust.items.2'] },
  {
    gate: 'adSignalsShipped',
    paths: [
      'SleepApneaCare.ui.landingPage.trust.items.3',
      'SleepApneaCare.ui.landingPage.faq.items.5',
    ],
  },
  {
    gate: 'rxMaskGateShipped',
    paths: [
      'SleepApneaCare.ui.landingPage.shop.rxMaskLine',
      'SleepApneaCare.ui.landingPage.faq.items.1.rxMaskLine',
      'SleepApneaCare.ui.landingPage.shop.badges.prescription',
      'SleepApneaCare.ui.commerce.rxMaskCheck',
      'SleepApneaCare.ui.commerce.rxMaskParts',
    ],
  },
  {
    gate: 'returnsPolicyPublished',
    paths: [
      'SleepApneaCare.ui.landingPage.shop.returnsLine',
      'SleepApneaCare.ui.landingPage.shop.returnsLink',
    ],
  },
  {
    gate: 'brandsReady',
    paths: [
      'SleepApneaCare.ui.landingPage.brands',
      'SleepApneaCare.ui.landingPage.governance.brandsNote',
    ],
  },
  {
    gate: 'heroRotating',
    paths: [
      'SleepApneaCare.ui.landingPage.hero.headingLead',
      'SleepApneaCare.ui.landingPage.hero.words',
    ],
  },
];

/*
 * Copy that never goes to /fr, whatever its switch says. None is known for
 * this section (unlike Diabetes' insulin, which may not be advertised to
 * Quebec), so the list is empty and kept for symmetry.
 */
export const FR_HELD_COPY: string[] = [];

/*
 * The landing copy kept out of the browser today: every path whose switch is
 * still off, and on /fr the English-only copy too (none). With no locale, the
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

/* ---------- 3. Situation doors (numbered keys `doors.items.1..8`, by position) ---------- */

export type SituationDoorId =
  | 'urgent'
  | 'mightHave'
  | 'starting'
  | 'mask'
  | 'supplies'
  | 'travel'
  | 'paying'
  | 'helping';

export interface SituationDoor {
  id: SituationDoorId;
  glyph: GlyphName;
  /** A chapter slug from CHAPTER_META. Exactly one of `chapter` and `funding`. */
  chapter?: ChapterSlug;
  /** A fragment on that chapter: `red-flags`, `card-<n>`, or `sa-group-<n>` for a segment band. */
  anchor?: string;
  funding?: true;
  /** Emergency wording. Marked in text and symbol, never in colour alone. */
  urgent?: true;
  /** The quieter second link under a door, for the reader whose case is not urgent. */
  secondary?: { chapter: ChapterSlug; anchor: string };
  /** The door renders only once its target is live. The urgent door never waits. */
  requires?: 'chapterOnEngine' | 'fundingPage';
  /** Onboarding answers this door serves (dashboard sleepLane, plan Part B). */
  serves?: Array<'yes_mask' | 'apnea_discomfort' | 'yes_replacement'>;
  /** A door body that states a fact carries its own chips (door 1's 911 line, ruling C1). */
  sources?: SourceId[];
}

export const SITUATION_DOORS: SituationDoor[] = [
  /*
   * Straight to Ch02's pinned-open #red-flags. NEVER gated: no `requires`.
   * Ch02 goes live with the landing (ruling B2, 2026-10-13). Renders with JS
   * off. Its body ends "In a medical emergency, call 911." (ruling C1,
   * 2026-10-13), chipped to Health811 and HealthLink BC 8-1-1. Secondary:
   * Ch02 card 11, "Who to call".
   */
  {
    id: 'urgent',
    glyph: 'urgent',
    chapter: 'staying-safe',
    anchor: 'red-flags',
    urgent: true,
    sources: ['health811-home', 'hlbc-811'],
    secondary: { chapter: 'staying-safe', anchor: 'card-11' },
  },
  /* Ch01 from the top: the signs, then getting tested. */
  { id: 'mightHave', glyph: 'question', chapter: 'is-it-sleep-apnea', requires: 'chapterOnEngine' },
  /* Ch04 from the top: your setup, then the first weeks. */
  { id: 'starting', glyph: 'calendar', chapter: 'starting-cpap', requires: 'chapterOnEngine' },
  /*
   * Ch04 card 9, "Fix a common problem" (the troubleshooting finder: leaks,
   * dry mouth, marks; when to call your RT), which is what the door's words
   * describe. Ch04's notes point the door at card 3 (mask types): build
   * choice card 9, the alternative is kept for the owner (spec 8.3).
   */
  {
    id: 'mask',
    glyph: 'mask',
    chapter: 'starting-cpap',
    anchor: 'card-9',
    requires: 'chapterOnEngine',
    serves: ['yes_mask', 'apnea_discomfort'],
  },
  /* Ch05 card 3, "When to replace supplies" (the resupply planner; "Clean and replace" segment). */
  {
    id: 'supplies',
    glyph: 'refresh',
    chapter: 'everyday-liivving',
    anchor: 'card-3',
    requires: 'chapterOnEngine',
    serves: ['yes_replacement'],
  },
  /* Ch05 segment 2, "Away from home" (flying card first): the engine's band id `sa-group-2`. */
  {
    id: 'travel',
    glyph: 'plane',
    chapter: 'everyday-liivving',
    anchor: 'sa-group-2',
    requires: 'chapterOnEngine',
  },
  /* /liivv-health/sleep-apnea-care/funding (`fundingPage`, built in this pass). */
  { id: 'paying', glyph: 'coin', funding: true, requires: 'fundingPage' },
  /* Ch06 from the top: children are in segment 1, care and community in segment 2; the door names both. */
  { id: 'helping', glyph: 'hands', chapter: 'this-might-be-you', requires: 'chapterOnEngine' },
];

/*
 * The chapter whose approved `urgentExit` pair the doors fall back to on /fr
 * while the `doors` French gate is closed: one that points at Driving &
 * Staying Safe from elsewhere ("…are in Driving & Staying Safe, under"), so
 * its wording is true on the landing.
 */
export const URGENT_EXIT_CHAPTER: ChapterSlug = 'this-might-be-you';

/* ---------- 4. "Which therapy?" chips (keys `therapies.chips.<id>`, `therapies.hints.<id>`) ---------- */

export type TherapyChipId =
  | 'cpap'
  | 'bilevel'
  | 'travel'
  | 'oralAppliance'
  | 'lifestyle'
  | 'central'
  | 'children';

export interface TherapyChip {
  id: TherapyChipId;
  /* A path page under /chapters/<path>, else a chapter card. */
  path?: PathSlug;
  card?: { chapter: ChapterSlug; anchor: string };
  /* The hint under the chip states a fact, so it carries its own source line. */
  sources: SourceId[];
}

export const THERAPY_CHIPS: TherapyChip[] = [
  /* "CPAP is the most common type of PAP therapy used to treat OSA." */
  { id: 'cpap', path: 'cpap', sources: ['bc-pap-buyers-guide'] },
  /* APAP and BiPAP "significantly more complex … should only be prescribed by a Sleep Specialist." */
  { id: 'bilevel', path: 'bilevel', sources: ['bc-pap-buyers-guide'] },
  /* Portability pros and cons. */
  { id: 'travel', path: 'travel-cpap', sources: ['bc-pap-buyers-guide'] },
  /* Mild to moderate OSA, or intolerant/unwilling to use CPAP. */
  { id: 'oralAppliance', path: 'oral-appliance', sources: ['bcg-osa-adults'] },
  /* Ch03 card 7, "Weight and everyday habits". Not adequate alone if sleepy or moderate to severe (D7, C77 default). */
  {
    id: 'lifestyle',
    card: { chapter: 'treatment-options', anchor: 'card-7' },
    sources: ['bcg-osa-adults'],
  },
  /* Ch03 card 3, "Central and complex sleep apnea". PAP alone can make central apnea worse. */
  {
    id: 'central',
    card: { chapter: 'treatment-options', anchor: 'card-3' },
    sources: ['bc-pap-buyers-guide'],
  },
  /* Child-specific source: "Some children snore but do not have OSA." */
  { id: 'children', path: 'children', sources: ['akh-osa'] },
];

/* The intro's "prescribes your treatment, after an assessment and a sleep test" (`therapies.body`). */
export const THERAPIES_SOURCES: SourceId[] = ['bc-pap-buyers-guide'];

/* ---------- 1. Hero ---------- */

/*
 * `hero.body`'s "Your prescriber sets your treatment" (claims table: the BC
 * guide). Rendered as the hero's source line; the other hero sentence is true
 * by construction of the page.
 */
export const HERO_SOURCES: SourceId[] = ['bc-pap-buyers-guide'];

/* ---------- 5. Fact band (keys `facts.items.1..4`, by position) ---------- */

export const FACT_BAND: Array<{ sources: SourceId[]; dataYear: string }> = [
  /* 6.4% reported a diagnosis by a health care professional. */
  { sources: ['statcan-osa-2018'], dataYear: '2016–2017' },
  /* 12.8% at ages 60 to 79 (Chart 1 data table); "three times as likely" (prose). */
  { sources: ['statcan-osa-2018'], dataYear: '2016–2017' },
  /* 30% of adults at intermediate or high risk (STOP-Bang, adults 18+). */
  { sources: ['statcan-osa-2018'], dataYear: '2016–2017' },
  /* 23% never referred to a sleep lab, labelled "2009 data" (nurse ruling default). */
  { sources: ['phac-osa-2009'], dataYear: '2009' },
];

/* ---------- 2. Trust strip (keys `trust.items.1..3`) ---------- */

/*
 * Every item is checkable; the basis is recorded here for the export and never
 * rendered. The fourth item of the draft (Liivv's sleep support team, Part C)
 * is out of the tree: the service is not live. With today's gates, item 1
 * renders alone.
 */
export const TRUST_ITEMS: Array<{
  basis: 'owner' | 'code' | 'page';
  sources?: SourceId[];
  gate?: LandingGate;
}> = [
  /* Health facts shown with their sources: true by construction (every card has a SourceId or is held). */
  { basis: 'page' },
  /* Every device checked against MDALL; "All PAP equipment sold in Canada must have a valid Medical Device License." */
  { basis: 'code', sources: ['hc-mdall', 'bc-pap-buyers-guide'], gate: 'mdallRecorded' },
  /* Ad tracking off on these pages. */
  { basis: 'code', gate: 'adSignalsShipped' },
];

/* ---------- 6. Shop shelf ---------- */

/* No 'machines' room: Liivv sells no machines (N1, "Hide all 24", 2026-10-13). */
export const SHOP_ROOMS = [
  'all',
  'masks',
  'cushions',
  'tubing',
  'filters',
  'humidifier',
  'cleaning',
  'travel',
] as const;

/*
 * Shelf rules (enforced server-side in ./get-sa-catalog.ts and ./sa-shop-classify.ts):
 * 1. Machines and machine bundles are never shown (N1; prescriptionDeviceKindOf non-null is dropped).
 * 2. ASV is never shown.
 * 3. Discontinued items are withheld (plan Part G2).
 * 4. Any product whose description names another retailer is withheld
 *    (SLEEP_REFUSED_DESCRIPTION), as are service products (the old compliance
 *    report) and unverified kits.
 * 5. Magnet badge (shop.badges.magnets) only where a Health Canada notice names
 *    the mask by catalogue number (N7: MAGNET_NOTICE_MASK_IDS in ./sa-ids.ts).
 *    The magnet warning (shop.magnetWarning) is always shown (C3). Unknown = no
 *    badge and no "magnet-free" claim.
 * 6. Paediatric masks are never on the landing shelf (PAEDIATRIC_MASK_IDS);
 *    Mirage Kidsta (4713) is hidden in the store.
 * 7. Ozone and UV cleaners are never stocked or shown.
 * 8. "In stock" filter only once real stock is confirmed (plan Part G6).
 * 9. The settings notice (shop.settingsNotice) renders above the grid, always.
 * 10. Complete masks (C26): the tile links the product page, never an add
 *     button; badge shop.badges.prescription while rxMaskGateShipped. Parts
 *     and supplies stay one-click, even on a first order.
 * 11. The returns line renders above the grid once returnsPolicyPublished.
 */

/* `shop.settingsNotice` and the context of `shop.rxMaskLine` (owner ruling C26). */
export const SHOP_SOURCES: SourceId[] = ['ab-cpap-buyers-2026', 'bc-pap-buyers-guide'];

/* `shop.magnetWarning` (C3). */
export const SHOP_MAGNET_SOURCES: SourceId[] = [
  'hc-recall-magnet-philips-2022',
  'hc-recall-magnet-resmed-2023',
];

/* `shop.magnetWarning.link` ("Read the warning") goes to Ch02 card 6, "Masks with magnets". */
export const SHOP_MAGNET_LINK: { chapter: ChapterSlug; anchor: string } = {
  chapter: 'staying-safe',
  anchor: 'card-6',
};

/* `shop.badges.magnets`, per notice named in MAGNET_NOTICE_MASK_IDS (./sa-ids.ts). */
export const MAGNET_BADGE_SOURCES: Record<'philips2022' | 'resmed2023', SourceId[]> = {
  philips2022: ['hc-recall-magnet-philips-2022', 'hc-recall-magnet-philips-masks-2022'],
  resmed2023: ['hc-recall-magnet-resmed-2023'],
};

/*
 * `shop.returnsLink` goes to the store's returns and refunds policy page,
 * which does not exist yet (returnsPolicyPublished is false). shop.returnsLine
 * is store policy: its legal basis is in the claims table, never shown as chips.
 */
export const RETURNS_POLICY_HREF: string | null = null;

/* The full Sleep shop: the existing CPAP category page (1031). No store category is created. */
export const SHOP_SLEEP_HREF = '/liivv-your-life/sleep-breath/sleep-apnea-cpap/';

/* ---------- 9. Care band ---------- */

/*
 * The "your sleep team" panel and Olivia. The Liivv sleep support panel of the
 * draft (care.sleepSupport) is out of the tree: Part C is not live.
 * `care.sleepTeam.body`: the prescriber sets treatment and settings; only
 * trained professionals change them; consult before and after a purchase (BC
 * guide); "Get prescription … for your CPAP therapy equipment and your
 * settings" (Alberta). Its last sentence is a voice line.
 */
export const CARE_SLEEP_TEAM_SOURCES: SourceId[] = ['bc-pap-buyers-guide', 'ab-cpap-buyers-2026'];
export const PHARMACIST_CHAT_HREF = '/account/virtual-care';

/* ---------- 10. Brands (names, not copy; never translated) ---------- */

/*
 * Held with the strip (brandsReady). A pill shows only while its brand has a
 * product on the shelf; logos only where permission is on file. The
 * supplies-only re-sort (section 6, landing row 12) asks to remove the two
 * brands whose only catalogue products are machines (the brands of products
 * 4599/5041 and 4991): not done here, the store brand map names them.
 */
export const BRAND_NAMES = [
  'ResMed',
  'Philips Respironics',
  'Fisher & Paykel',
  'Yuwell',
  'Transcend',
  'Breas',
] as const;

/* ---------- 11. FAQs (keys `faq.items.1..5`) ---------- */

/*
 * Where a `<link>…</link>` in an answer goes, in the order the tags appear.
 * The tags wrap words already in the sentence and never add any.
 */
export type LandingLinkTo =
  | { source: SourceId }
  | { tel: string }
  | { chapter: ChapterSlug; anchor?: string }
  | { page: string };

export interface FaqMeta {
  sources: SourceId[];
  /* What a line about Liivv itself rests on; never rendered. */
  basis?: 'owner' | 'code';
  gate?: LandingGate;
  links?: LandingLinkTo[];
  /* ICU values the answer interpolates, each a message key under faq.items.<n>, and the gate that empties it. */
  values?: Array<{ name: string; gate?: LandingGate }>;
}

export const FAQ_META: FaqMeta[] = [
  /*
   * 1 prescription. machineLine is the N10 line, ungated (all machines are
   * hidden, N1; "yet" kept while N10 is open). rxMaskLine waits on
   * rxMaskGateShipped (C26, C17). The Ontario line rests on CRTO.
   */
  {
    sources: ['ab-cpap-buyers-2026', 'bc-pap-buyers-guide', 'crto-community-rt'],
    basis: 'owner',
    values: [{ name: 'machineLine' }, { name: 'rxMaskLine', gate: 'rxMaskGateShipped' }],
  },
  /* 2 flying with CPAP. The link: "Travelling with CPAP" → Ch05 segment 2. On-board use is held (E6). */
  {
    sources: ['catsa-cpap', 'cla-sleep-apnea'],
    links: [{ chapter: 'everyday-liivving', anchor: 'sa-group-2' }],
  },
  /* 3 replacing mask and filter, side by side (nurse ruling default, D5; NIHB wording D6). Link → Ch05 card 4, "Signs a part is worn". */
  {
    sources: ['bc-pap-buyers-guide', 'cla-sleep-apnea', 'nihb-pap'],
    links: [{ chapter: 'everyday-liivving', anchor: 'card-4' }],
  },
  /*
   * 4 recall. No organization is the speaker; the Government of Canada recalls
   * site is a link target only. Magnet sentences follow C3, Option A (D19).
   * Links: the recalls site, then Ch02 card 6 ("Masks with magnets"). The
   * second link is never dropped: Ch02 launches with the landing.
   */
  {
    sources: [
      'hc-recall-philips-ra-76137',
      'cts-css-csrt-philips-2021',
      'hc-recall-magnet-philips-2022',
      'hc-recall-magnet-resmed-2023',
      'hc-recalls-safety-alerts',
    ],
    links: [{ source: 'hc-recalls-safety-alerts' }, { chapter: 'staying-safe', anchor: 'card-6' }],
  },
  /* 5 privacy. Held (B3 "default"; privacy lead sign-off, D8). */
  { sources: [], basis: 'code', gate: 'adSignalsShipped' },
];
/* With FAQ 5 held, four questions render. The page never shows a question whose answer is held. */
