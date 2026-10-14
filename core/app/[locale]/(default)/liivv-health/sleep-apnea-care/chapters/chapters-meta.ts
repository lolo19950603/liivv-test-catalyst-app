/*
 * =============================================================================
 * SLEEP APNEA CARE CHAPTERS — STRUCTURE
 * =============================================================================
 * The six chapters' structure, in reading order: which register entries back
 * each card, the figures that draw it, who it sends a reader to, and the
 * holds and links it carries. Prose lives in messages/*.json under
 * `SleepApneaCare.chapters.<slug>` (copied verbatim from section B of
 * docs/sleep-content/01–06); this file is assembled from the build's chapter
 * fragments (sleep-build spec 3.2), normalised to the engine's types
 * (../../_microsite/chapters/types.ts).
 *
 * The one red-flag block is Driving & Staying Safe's (#red-flags, three
 * tiers since ruling C1). Every other chapter signposts it (`urgentExit`).
 * It is never collapsible, never gated, and renders in every locale.
 *
 * No care panel on any chapter: Liivv's sleep support service (Part C) is not
 * live, so `pharmacistImage`/`pharmacistHref` are left out (engine E-8).
 * No machine is sold, linked or placed anywhere (ruling N1).
 *
 * Erasable TypeScript and statement-form `import type` only: the
 * content-review export loads this file under Node's type stripping.
 * =============================================================================
 */

import type {
  CategoryMeta as EngineCategoryMeta,
  ChapterMeta as EngineChapterMeta,
  FigureMeta as EngineFigureMeta,
  EngineGlyph,
} from '../../_microsite/chapters/types';

import type { SourceId } from './sources-meta';

export type ChapterSlug =
  | 'is-it-sleep-apnea'
  | 'staying-safe'
  | 'treatment-options'
  | 'starting-cpap'
  | 'everyday-liivving'
  | 'this-might-be-you';

/*
 * Who a card sends a reader to, labelled from `ui.chapter.ask.<role>`. Every
 * chapter's roles, keys kept as each chapter wrote them (E2 open: `team` and
 * `sleepTeam`, `rt` and `rrt` are not merged; spec 8.3).
 */
export type AskRole =
  | 'doctor'
  | 'sleepTeam'
  | 'team'
  | 'rrt'
  | 'rt'
  | 'provider'
  | 'dentist'
  | 'prescriber'
  | 'childProvider'
  | 'childTeam'
  | 'nihb'
  | 'urgent';

/* The site's symbols (./glyph-paths.ts), plus the engine's own. */
export type GlyphName =
  | EngineGlyph
  | 'team'
  | 'primaryCare'
  | 'service'
  | 'home'
  | 'list'
  | 'hands'
  | 'people'
  | 'book'
  | 'calendar'
  | 'coin'
  | 'pin'
  | 'mask'
  | 'plane'
  | 'shield'
  | 'refresh'
  | 'question';

/* What the who-to-ask lanes can be ticked for (`topicKeys`, `figure.topics`). */
export type SleepLaneTopic =
  | 'symptoms'
  | 'testing'
  | 'results'
  | 'equipment'
  | 'driving'
  | 'device'
  | 'magnets'
  | 'problem'
  | 'child'
  | 'emergency'
  | 'machine'
  | 'mask'
  | 'oral'
  | 'habits'
  | 'supplies'
  | 'settings'
  | 'urgent'
  | 'cleaning'
  | 'parts'
  | 'paying'
  | 'travel'
  | 'recall';

/* Release holds (not French gates). Deleting a `held:` line releases, as on Diabetes. */
export type SleepHold =
  | 'childTreatmentRuling' // 06 card 3, ruling C6 "default" (2026-10-13): Chapter 06 launches without it
  | 'indigenousPartnerReview'; // 06 card 9, R8 / ruling B1 "default" (2026-10-13): title + heldNote only;

export type MaskType = 'pillows' | 'nasal' | 'fullFace';
export type LicenceTab = 'all' | 'private' | 'commercial';
export type ResupplyPart =
  | 'mask'
  | 'cushion'
  | 'headgear'
  | 'tubing'
  | 'filter'
  | 'chamber'
  | 'chinStrap'
  | 'machine';
export type ResupplyColumn = 'manual' | 'general' | 'nihb' | 'bcea' | 'ontario' | 'maker';
export type ResupplyPayer = 'nihb' | 'bcea' | 'ontario' | 'plan' | 'self';

/*
 * Sleep's own figure kinds (spec 5.2). The engine hands each to the site's
 * registry (./site-figures.tsx).
 */
export type SleepFigureMeta =
  /* 01 card 4. Port of cluesChecklist. WHOLE CARD: sections 1–3 in order, section `section` as native
     checkboxes (44px), the card note as a fixed role="note" banner (never collapses, prints). Print =
     banner + ticked signs (or all, with ui.signsChecklist.noneTicked) + `questions` lines with ruled
     answer space. Words: sections.*, note, figure.legend, figure.printHeading, figure.questions.1..n,
     ui.signsChecklist.{print,signsTicked,noneTicked,answer,clear}. "Clear my ticks" resets and focuses box 1. */
  | { kind: 'signsChecklist'; section: number; questions: number; sources: SourceId[] }
  /* 01 card 9. Port of glucoseRange. AUGMENTS. Static SVG bar, role="img" + aria-label, four labelled
     segments (labels from figure.scale.zones.<key>, never colour alone); severe runs off the end with an
     arrow; figure.scale.adultsNote and teamNote always visible; zones also printed as a plain list. */
  | {
      kind: 'ahiScale';
      scale: { min: number; max: number };
      zones: Array<{
        key: 'normal' | 'mild' | 'moderate' | 'severe';
        below?: number;
        from?: number;
        to?: number;
        item?: number;
      }>;
      adultsOnly: true;
      sources: SourceId[];
    }
  /* 02 card 3. MODULE. Tabs (default 'all'); each tab lists its card items with its own chips;
     figure.measureNote and figure.decides fixed under every tab; print = all tabs in order. */
  | {
      kind: 'licenceClasses';
      tabs: Array<{ key: LicenceTab; items: number[]; sources: SourceId[] }>;
      sources: SourceId[];
    }
  /* 04 card 1. AUGMENTS. Ordered timeline of steps; `item` = the card sentence it rests on, `label` =
     figure.steps.<label>. Service lines are out of tree (Part C). */
  | { kind: 'followUpTimeline'; steps: Array<{ item: number; label: number }>; sources: SourceId[] }
  /* 04 card 3. MODULE, session-only. Ticks highlight the mask types each question's sources tie to it;
     never ranks or picks; unticked shows all three; bilevel note and magnet note always visible. */
  | {
      kind: 'maskPicker';
      types: MaskType[];
      questions: Array<{
        id: number;
        suggests: MaskType[];
        also?: 'chinStrap';
        sources: SourceId[];
      }>;
      bilevelNote: { sources: SourceId[] };
      /* `to`: the card the note's tagged phrase ("Driving & Staying Safe") opens. */
      magnetNote: { always: true; sources: SourceId[]; to?: { chapter: ChapterSlug; card: number } };
    }
  /* 04 card 8. AUGMENTS, static, nothing entered. Rows 'driving' and 'severe'; footer line ("not a
     health target") under every row. */
  | {
      kind: 'usageExplainer';
      rows: Array<{ id: 'driving' | 'severe'; sources: SourceId[] }>;
      footerAlways: true;
      sources: SourceId[];
    }
  /* 04 card 9. MODULE, session-only. One chip per problem; the matching answer opens (native <details>
     without JS); figure.always under every answer; problem 10 links staying-safe#red-flags. */
  | {
      kind: 'troubleshootFinder';
      problems: Array<{
        id: number;
        sources: SourceId[];
        link?: { chapter: ChapterSlug; anchor: string };
      }>;
      always: true;
    }
  /* 05 card 3. MODULE, session-only. Real <table> (th scope); columns with kind badges and their own
     chips; payer radio chips outline a column (never hide/rank); "Maker" credit always shown; arithmetic
     only (resupply-math.ts); dateCalc.disclaimer under any result; figure.noJs without JS. */
  | {
      kind: 'resupplyPlanner';
      rows: ResupplyPart[];
      columns: ResupplyColumn[];
      columnSources: Record<ResupplyColumn, SourceId[]>;
      perYear: Partial<Record<ResupplyColumn, Partial<Record<ResupplyPart, number>>>>;
      periodMonths: Partial<
        Record<ResupplyColumn, Partial<Record<ResupplyPart, number | readonly [number, number]>>>
      >;
      payers: ResupplyPayer[];
    }
  /* 05 card 8. RESTYLES (+ module ticks). `lead` items plain, `items` tick boxes; figure.hint; "Clear
     ticks"; prints with empty boxes; no products, no battery row. */
  | { kind: 'tripList'; lead: number[]; items: number[] };

export type FigureMeta = EngineFigureMeta<
  SourceId,
  GlyphName,
  SleepFigureMeta,
  SleepLaneTopic,
  SleepHold
>;
export type CategoryMeta = EngineCategoryMeta<
  SourceId,
  AskRole,
  GlyphName,
  SleepFigureMeta,
  SleepLaneTopic,
  SleepHold
>;
export interface ChapterMeta
  extends EngineChapterMeta<
    SourceId,
    AskRole,
    GlyphName,
    SleepFigureMeta,
    SleepLaneTopic,
    SleepHold
  > {
  slug: ChapterSlug;
}

/* Images: no Sleep image set yet (landing D12). Placeholders that exist today. */
const IMG = '/archive/liivv-home/corner-sleep.png';
/* Lavender placeholder; the owner chooses the palette (landing D12). */
const ACCENT = '#b9aecf';

/* from ch01 */
/*
 * Sleepwell's CBT-I page, under the `mysleepwell` register entry
 * (https://mysleepwell.ca/, with /insomnia/, /cbti/ and /about-us/). The only
 * outward link in Is It Sleep Apnea? (card 5, route 2). A literal, as this
 * file may not import a value; the content-review export checks it.
 */
const SLEEPWELL_CBTI_HREF = 'https://mysleepwell.ca/cbti/';

/* from ch03 */
/*
 * Same address as hc-mdall in sources-meta.ts (MDALL_HREF there); a literal, as this file may not
 * import a value. 02's fragment declares the same const with the same value: keep one.
 */
const MDALL_HREF = 'https://health-products.canada.ca/mdall-limh/';

/* from ch06 */
/*
 * Same addresses as nihb-eligibility in sources-meta.ts (its href and its recorded French twin);
 * literals, as this file may not import a value. The export compares a card link's href and hrefFr
 * with the register entry, so if the register leaves hrefFr off nihb-eligibility, drop
 * NIHB_ELIGIBILITY_HREF_FR here too. The funding fragment may declare the same const: keep one.
 */
const NIHB_ELIGIBILITY_HREF = 'https://www.sac-isc.gc.ca/eng/1574187596083/1576511384063';
const NIHB_ELIGIBILITY_HREF_FR = 'https://www.sac-isc.gc.ca/fra/1574187596083/1576511384063';

export const CHAPTER_META: ChapterMeta[] = [
  /*
   * 01 · Is It Sleep Apnea? Copy: SleepApneaCare.chapters.is-it-sleep-apnea
   * (docs/sleep-content/01-is-it-sleep-apnea.md, draft of 2026-10-13, source
   * checked the same day). No red-flag block of its own: card 4's banner,
   * card 11's fourth lane and the urgentExit signpost point to Driving &
   * Staying Safe's (staying-safe#red-flags). No shop strip anywhere in this
   * chapter (plan Part B: never on testing cards), so chapter-shop.ts has no
   * entry for it. The clinical defaults S1–S16 (OPEN-QUESTIONS C10, C11, C14,
   * C23, C28, C29, C35–C45, all "before launch", default safe to publish)
   * ship as drafted until the nurse rules. No care panel: the Liivv sleep
   * support service (Part C) is not live, so pharmacistImage/pharmacistHref
   * are left out (E-8). Section E's lanes and lines are held out of tree.
   */
  {
    slug: 'is-it-sleep-apnea',
    num: '01',
    chapterWord: 'one',
    heroImage: IMG,
    accent: ACCENT,
    rail: false,
    majorSections: true,
    /* Exactly two segments: the signs (cards 1–6), then getting tested (cards 7–11). */
    startHere: { groups: ['theSigns', 'gettingTested'] },
    urgentExit: { chapter: 'staying-safe' },
    categories: [
      /* ---------- The signs ---------- */
      {
        // 1 What sleep apnea is. The definition leads (items 1–2); obstructive
        // and central side by side; the risks and "it can be treated" beneath.
        image: IMG,
        group: 'theSigns',
        ask: 'doctor',
        figures: [{ kind: 'columns', columns: [[3], [4]], lead: [1, 2], neutral: [5, 6] }],
        sources: [
          'cla-sleep-apnea',
          'phac-osa-2009',
          'bcg-osa-adults',
          'lhf-sleep-apnea',
          'akh-osa',
        ],
      },
      {
        // 2 Signs others notice first.
        image: IMG,
        group: 'theSigns',
        ask: 'doctor',
        figures: [{ kind: 'columns', columns: [[3, 4, 5]], lead: [1, 2], neutral: [6] }],
        sources: ['lhf-sleep-apnea', 'bcg-osa-adults', 'cla-sleep-apnea'],
      },
      {
        // 3 How common it is. Numbers only from StatCan (2016 and 2017 survey,
        // archived page, C23) and the BC guideline; the sex difference as
        // "twice as likely" only (S9).
        image: IMG,
        group: 'theSigns',
        ask: 'doctor',
        sources: ['statcan-osa-2018', 'bcg-osa-adults', 'cla-sleep-apnea'],
      },
      {
        // 4 The signs checklist. Draws the whole card; the note is its fixed
        // "Not a diagnostic tool" banner, which carries the drowsy-driving
        // signpost, so the card is pinned open in every locale (S3) and
        // keepsFigure keeps the checklist on /fr. No score, no count, no
        // STOP-Bang, no neck, BMI or age cut-offs (S2).
        image: IMG,
        group: 'theSigns',
        ask: 'doctor',
        urgentContent: true,
        noteVisible: true,
        /* The banner's tagged "Driving & Staying Safe" opens the red-flag block (its stop tier). */
        links: [{ at: 'note', to: { chapter: 'staying-safe', anchor: 'red-flags' } }],
        figures: [
          {
            kind: 'signsChecklist',
            section: 2,
            questions: 5,
            sources: ['bcg-osa-adults', 'cla-sleep-apnea', 'lhf-sleep-apnea', 'statcan-osa-2018'],
          },
        ],
        sources: [
          'bcg-osa-adults',
          'cla-sleep-apnea',
          'lhf-sleep-apnea',
          'statcan-osa-2018',
          'phac-osa-2009',
        ],
      },
      {
        // 5 Signpost: trouble falling or staying asleep → CBT-I. No products.
        // Route 2's chip opens Sleepwell's CBT-I page (E-6 route link); route 1
        // has no link (S13, S14).
        image: IMG,
        group: 'theSigns',
        ask: 'doctor',
        figures: [
          {
            kind: 'routes',
            routes: [
              { glyphs: ['primaryCare'] },
              {
                glyphs: ['book'],
                link: { href: SLEEPWELL_CBTI_HREF, hrefLang: 'en', linkSources: ['mysleepwell'] },
              },
            ],
          },
        ],
        sources: ['oh-insomnia-qs-2025', 'mysleepwell', 'phac-sleep-adults'],
      },
      {
        // 6 Signpost: more than snoring? No products. Item 2 is the chapter's
        // one international line, labelled in its own words (S7); the card also
        // rests on CLA, BC and AboutKidsHealth, so it never stands alone.
        image: IMG,
        group: 'theSigns',
        ask: 'doctor',
        /* 6.note s1 also rests on PHAC (section C). */
        sources: [
          'cla-sleep-apnea',
          'hlbc-snoring-osa',
          'bcg-osa-adults',
          'akh-osa',
          'phac-osa-2009',
        ],
      },

      /* ---------- Getting tested ---------- */
      {
        // 7 Talking to your doctor, and the referral. A printable "before your
        // appointment" list.
        image: IMG,
        group: 'gettingTested',
        ask: 'doctor',
        figures: [{ kind: 'takeIn' }],
        sources: [
          'cla-sleep-apnea',
          'bcg-osa-adults',
          'cts-sdb-2011',
          'phac-osa-2009',
          'on-adp-respiratory',
          'nihb-pap',
        ],
      },
      {
        // 8 Lab or home test. Never a shop strip. CTS 2011 stays on the card for
        // items 2, 3 and 6, never for item 9 (S6).
        image: IMG,
        group: 'gettingTested',
        ask: 'doctor',
        figures: [
          {
            kind: 'columns',
            columns: [
              [1, 2, 3],
              [4, 5, 6, 7, 8],
            ],
            neutral: [9, 10],
          },
        ],
        sources: [
          'bcg-osa-adults',
          'bcg-osa-adults-appx-e',
          'cla-sleep-apnea',
          'cts-sdb-2011',
          'cts-css-peds-dx-2026',
        ],
      },
      {
        // 9 Your results: the AHI scale. Labelled bands only, edges exactly as
        // the BC guideline's Table 1 (S1); nothing entered. Adults only.
        image: IMG,
        group: 'gettingTested',
        ask: 'sleepTeam',
        figures: [
          {
            kind: 'ahiScale',
            scale: { min: 0, max: 40 },
            zones: [
              { key: 'normal', below: 5, item: 3 },
              { key: 'mild', from: 5, to: 14, item: 4 },
              { key: 'moderate', from: 15, to: 29, item: 4 },
              // "30 or more": open-ended, runs off the end of the bar.
              { key: 'severe', from: 30, item: 4 },
            ],
            adultsOnly: true,
            sources: ['bcg-osa-adults'],
          },
        ],
        sources: ['bcg-osa-adults', 'cla-sleep-apnea'],
      },
      {
        // 10 What happens next.
        image: IMG,
        group: 'gettingTested',
        ask: 'sleepTeam',
        figures: [
          {
            kind: 'columns',
            columns: [
              [1, 2],
              [3, 4, 5],
            ],
            neutral: [6],
          },
        ],
        sources: [
          'cla-sleep-apnea',
          'bcg-osa-adults',
          'lhf-sleep-apnea',
          'phac-osa-2009',
          'ab-cpap-buyers-2026',
        ],
      },
      {
        // 11 Who to ask. Four lanes, each on a card sentence. No pharmacist lane
        // (no source; C28). The Liivv sleep support lane, the provincial health
        // line lane and the dentist lane are held out of tree (01 section E).
        image: IMG,
        group: 'gettingTested',
        ask: 'doctor',
        figures: [
          {
            kind: 'lanes',
            lanes: [
              { glyph: 'primaryCare', item: 1, topics: ['symptoms', 'testing'] },
              { glyph: 'team', item: 2, topics: ['testing', 'results'] },
              // A registered respiratory therapist anywhere, not a Liivv-only lane.
              { glyph: 'service', item: 3, topics: ['equipment'] },
              // Navigation to the red-flag block (E-7). Its words are the card's
              // item 4 and `figure.lanes.4.linkLabel`.
              {
                glyph: 'urgent',
                item: 4,
                topics: ['driving'],
                to: { chapter: 'staying-safe', anchor: 'red-flags' },
              },
            ],
            topicKeys: ['symptoms', 'testing', 'results', 'equipment', 'driving'],
          },
        ],
        sources: [
          'cla-sleep-apnea',
          'bcg-osa-adults',
          'ab-cpap-buyers-2026',
          'nihb-pap',
          'csrt-rrt',
        ],
      },
    ],
    /*
     * Band "From first signs to a plan": four steps, no links, no new claims
     * (each line repeats a card: 4, 7, 8, 9). A band card links its card only
     * where that card's title appears in its body.
     */
    programsBandLinks: [[], [], [], []],
    programsBandCards: [4, 7, 8, 9],
    bandSources: ['cla-sleep-apnea', 'bcg-osa-adults'],
    resourceLinks: [],
    /* As the chapter file gives them (labels are titles; never translated). */
    citations: [
      {
        label: 'Canadian Lung Association — Sleep apnea',
        href: 'https://www.lung.ca/lung-diseases/sleep-apnea/',
      },
      {
        label: 'BC Guidelines — Obstructive Sleep Apnea: Assessment and Management in Adults',
        href: 'https://www2.gov.bc.ca/gov/content/health/practitioner-professional-resources/bc-guidelines/sleep-apnea',
      },
      {
        label: 'Statistics Canada — Sleep apnea in Canada, 2016 and 2017',
        href: 'https://www150.statcan.gc.ca/n1/pub/82-625-x/2018001/article/54979-eng.htm',
      },
      {
        label:
          'Canadian Thoracic Society — 2011 Guideline Update: Diagnosis and Treatment of Sleep Disordered Breathing',
        href: 'https://hdl.handle.net/1880/108433',
      },
      {
        label: 'Ontario Health — Insomnia Disorder: Care for Adults (2025)',
        href: 'https://ontariohealth.ca/content/dam/ontariohealth/documents/filter-list/qs/qs-insomnia-disorder-en.pdf',
      },
    ],
  },
  /*
   * 02 · Driving & Staying Safe. Copy: SleepApneaCare.chapters.staying-safe, from
   * docs/sleep-content/02-staying-safe.md section B (version of 2026-10-13, owner and
   * nurse rulings C1–C7, N7 and B2 applied). The site's ONLY red-flag block,
   * #red-flags, three tiers since ruling C1: emergency (6 signs), stop (1), soon (1).
   * Pinned open, never gated, never collapsed, every locale. Every other chapter
   * signposts it through `urgentExit: { chapter: 'staying-safe' }`. Goes live with the
   * landing (ruling B2). No shop strip on any card; no entry in chapter-shop.ts.
   * Held out of the tree (02 E): the Liivv sleep support lane and band (H1, Part C),
   * the railway tab (H15), drowsy-driving tips (H4), child CPR (H14), the 811 line
   * (H18), card 6 Option B (H17), the every-device ozone/UV line (H16) and H5–H13.
   * Open rulings keep the copy's defaults (R5, R7, R9–R13): listed in the review pack.
   */
  {
    slug: 'staying-safe',
    num: '02',
    chapterWord: 'two',
    heroImage: IMG,
    accent: ACCENT,
    rail: false,
    majorSections: true,
    /* Exactly two segments: sleepiness and the road, then your device. */
    startHere: { groups: ['road', 'device'] },
    /* The start-here map's signpost to this chapter's own block, as Diabetes Ch02 does. */
    urgentExit: { chapter: 'staying-safe' },
    /* The block's closing note: its tagged "Chapter 06 covers children." opens Signs in children. */
    urgentNoteLink: { chapter: 'this-might-be-you', card: 1 },
    /*
     * The red-flag block as tiers (engine E-3), in render order. Every sign carries its
     * own chips; every 911 in labels, leads and signs renders as tel:911. The soon tier's
     * label is framing (no chip). Healthwise (US) is labelled and never alone.
     */
    urgentTiers: [
      {
        key: 'emergency',
        // Label and lead: Call 911 or your local emergency number right away.
        sources: ['hlbc-811', 'phac-heart-attack', 'health811-home'],
        signs: [
          // 1 Chest pain or discomfort, or other signs of a heart attack
          { sources: ['phac-heart-attack', 'on-er', 'ab-mha-emergency'] },
          // 2 Stroke (FAST)
          { sources: ['phac-stroke'] },
          // 3 Trouble breathing
          { sources: ['ab-mha-emergency', 'on-er'] },
          // 4 Passed out, cannot be woken up, or confused (R12 item 4: C-star)
          { sources: ['on-er'] },
          // 5 Anyone hurt in a crash. ICBC chip labelled as a BC Crown corporation
          { sources: ['icbc-crash-card', 'on-mto-handbook-emergencies'] },
          // 6 Child line (was urgent.signs.3). AboutKidsHealth, CA-org. Ruled fine (C2)
          { sources: ['akh-child-emergency'] },
        ],
      },
      {
        key: 'stop',
        // Label: Stop now, then tell your doctor.
        sources: ['rsbc-ccmta-18-6-1', 'ab-osa-pathway-2026'],
        signs: [
          // 1 Asleep at the wheel, or nearly (C4: every driver), or a sleepy crash.
          // The Ontario handbook chip backs the near miss only.
          {
            sources: [
              'rsbc-ccmta-18-6-1',
              'cts-css-driving-2014',
              'bcg-osa-adults',
              'on-mto-handbook-drowsy',
            ],
          },
        ],
      },
      {
        key: 'soon',
        signs: [
          // 1 Pauses, gasping or choking in sleep. Healthwise (US) chip third, never alone.
          { sources: ['ab-osa-pathway-2026', 'hlbc-sleep-apnea'] },
        ],
      },
    ],
    categories: [
      /* ---------- A. Sleepiness and the road ---------- */
      {
        // 1 Sleepiness and driving. Pinned: its note sends the reader to the stop tier.
        image: IMG,
        group: 'road',
        ask: 'doctor',
        urgentContent: true,
        figures: [
          {
            kind: 'columns',
            columns: [
              [1, 2, 3],
              [4, 5],
            ],
          },
        ],
        sources: ['cla-sleep-apnea', 'lhf-sleep-apnea', 'cts-css-driving-2014', 'bcg-osa-adults'],
      },
      {
        // 2 Who decides if you can drive. Item 5 is Ontario (form 5108E), item 6 BC's
        // licence condition (not the national standard).
        image: IMG,
        group: 'road',
        ask: 'doctor',
        sources: ['cts-css-driving-2014', 'on-mto-reporting', 'on-mto-5108e', 'rsbc-ccmta-18-6-1'],
      },
      {
        // 3 What's checked, by licence class. Site figure licenceClasses. The note
        // ("licensing measures, not health targets", R5) is never behind a disclosure.
        // The railway tab (items 8, 9) is HELD out of tree (H15, R9).
        image: IMG,
        group: 'road',
        ask: 'sleepTeam',
        noteVisible: true,
        figures: [
          {
            kind: 'licenceClasses',
            tabs: [
              // Item 4 sits here since the source check (CTS/CSS KM4 is for everyone on CPAP).
              {
                key: 'all',
                items: [1, 2, 4, 3],
                sources: ['rsbc-ccmta-18-6-1', 'cts-css-driving-2014'],
              },
              { key: 'private', items: [5], sources: ['cts-css-driving-2014'] },
              // Item 6 s2 cites the 2011 CTS guideline through the 2014 paper only; that
              // guideline is not chipped here (02 F: not re-read for this chapter).
              {
                key: 'commercial',
                items: [6, 7],
                sources: ['cts-css-driving-2014', 'rsbc-ccmta-18-6-1'],
              },
            ],
            sources: ['rsbc-ccmta-18-6-1', 'cts-css-driving-2014'],
          },
        ],
        sources: ['rsbc-ccmta-18-6-1', 'cts-css-driving-2014'],
      },
      {
        // 4 While you start treatment. The settings line stays outside the disclosure.
        image: IMG,
        group: 'road',
        ask: 'sleepTeam',
        noteVisible: true,
        sources: ['cts-css-driving-2014', 'rsbc-ccmta-18-6-1', 'bc-pap-buyers-guide'],
      },

      /* ---------- B. Your device, safely ---------- */
      {
        // 5 Recalls: what to do. Philips Respironics is named because the recall is
        // published under that name (R7). The live notice's number is RA-62729.
        image: IMG,
        group: 'device',
        ask: 'doctor',
        sources: [
          'hc-recall-philips-ra-76137',
          'hc-recall-philips-ra-75887',
          'cts-css-csrt-philips-2021',
        ],
      },
      {
        // 6 Masks with magnets: the magnet WARNING card (ruling C3), pinned open in every
        // state and locale. Option A of R13 is in the copy (Option B is H17, out of tree).
        // Health Canada notices only (N7). Items 1-2 lead the columns (what magnets do).
        image: IMG,
        group: 'device',
        ask: 'doctor',
        urgentContent: true,
        figures: [
          {
            kind: 'columns',
            columns: [
              [3, 4],
              [5, 6, 7],
            ],
            lead: [1, 2],
          },
        ],
        // The note's <link> opens the Government of Canada recalls site (no French twin recorded).
        links: [
          {
            at: 'note',
            to: {
              source: 'hc-recalls-safety-alerts',
              href: 'https://recalls-rappels.canada.ca/en',
            },
          },
        ],
        sources: [
          'hc-recall-magnet-philips-2022',
          'hc-recall-magnet-philips-masks-2022',
          'hc-recall-magnet-resmed-2023',
          'hc-recalls-safety-alerts',
        ],
      },
      {
        // 7 Cleaning the approved way (ruling C5): the ozone/UV line is scoped to the
        // 2021 Philips recall; the every-device line is HELD out of tree (H16).
        image: IMG,
        group: 'device',
        ask: 'provider',
        sources: [
          'hc-recall-philips-ra-76137',
          'cts-css-csrt-philips-2021',
          'pmra-uv-ozone',
          'cla-sleep-apnea',
        ],
      },
      {
        // 8 Buying a device safely. General advice; Liivv sells no machines.
        image: IMG,
        group: 'device',
        ask: 'doctor',
        sources: [
          'ab-cpap-buyers-2026',
          'bc-pap-buyers-guide',
          'hc-buying-devices-online',
          'hc-mdall',
        ],
      },
      {
        // 9 Choosing a supplier. The printable card: its items, then the five
        // questions to ask a supplier as write-in lines (figure.fields).
        image: IMG,
        group: 'device',
        ask: 'provider',
        figures: [{ kind: 'takeIn', fields: 5 }],
        sources: [
          'bc-pap-buyers-guide',
          'ab-cpap-buyers-2026',
          'crto-standard-5',
          'crto-community-rt',
          // Question 5 (licensed by Health Canada?), per 02 C row 9.figure.lines.
          'hc-mdall',
        ],
      },
      {
        // 10 Reporting a device problem.
        image: IMG,
        group: 'device',
        ask: 'doctor',
        sources: [
          'hc-report-device-problem',
          'hc-about-device-problems',
          'hc-device-problem-form',
          'hc-recall-magnet-philips-2022',
          // Item 5, per 02 C row 10.items.5.
          'hc-recall-philips-ra-76137',
        ],
      },
      {
        // 11 Who to call. Pinned: lane 5 repeats the block's 911 tier (ruling C1).
        // The Liivv sleep support lane (B lane 6) is HELD out of tree (H1, Part C).
        image: IMG,
        group: 'device',
        ask: 'urgent',
        urgentContent: true,
        figures: [
          {
            kind: 'lanes',
            lanes: [
              { glyph: 'team', item: 1, topics: ['driving', 'device', 'magnets'] },
              { glyph: 'service', item: 2, topics: ['driving'] },
              { glyph: 'team', item: 3, topics: ['device'] },
              {
                glyph: 'service',
                item: 4,
                topics: ['problem'],
                href: 'https://www.canada.ca/en/health-canada/services/drugs-health-products/medeffect-canada/adverse-reaction-reporting/medical-device/consumer.html',
                hrefLang: 'en',
                linkSources: ['hc-report-device-problem'],
              },
              // 911 for adults; for a child, 911 or the emergency department (C1, C2).
              { glyph: 'urgent', item: 5, topics: ['emergency', 'child', 'driving'] },
            ],
            topicKeys: ['driving', 'device', 'magnets', 'problem', 'child', 'emergency'],
          },
        ],
        sources: [
          'cts-css-driving-2014',
          'rsbc-ccmta-18-6-1',
          'bc-pap-buyers-guide',
          'hc-report-device-problem',
          'akh-child-emergency',
          'hc-recall-magnet-philips-2022',
          'phac-heart-attack',
          'phac-stroke',
          'ab-mha-emergency',
          'on-er',
          'icbc-crash-card',
          // Items 1 and 3, per 02 C rows 11.items.1 and 11.items.3.
          'hc-recall-philips-ra-76137',
          'ab-cpap-buyers-2026',
        ],
      },
    ],
    /* Band "Four checks for your device": card 1 links MDALL (label programsBand.cards.1.links.1.label). */
    programsBandLinks: [
      [
        {
          href: 'https://health-products.canada.ca/mdall-limh/',
          hrefLang: 'en',
          locales: ['en', 'fr'],
          sources: ['hc-mdall'],
        },
      ],
      [],
      [],
      [],
    ],
    /* Review only. Ruling C5: card 4 no longer rests on the 2021 CTS/CSS/CSRT statement. */
    bandSources: [
      'hc-mdall',
      'bc-pap-buyers-guide',
      'hc-recall-philips-ra-76137',
      'hc-recall-magnet-philips-2022',
      'hc-recall-magnet-resmed-2023',
    ],
    resourceLinks: [],
    /* Titles and links as 02 A.2 gives them. Never translated. */
    citations: [
      {
        label:
          'Canadian Thoracic Society and Canadian Sleep Society — Obstructive sleep apnea and driving (2014)',
        href: 'https://cts-sct.ca/wp-content/uploads/2018/02/1-CTS_CSS_Position_Paper_OSA_Driving_2014.pdf',
      },
      {
        label: 'RoadSafetyBC — 18 - Sleep disorders - CCMTA Medical Standards',
        href: 'https://www2.gov.bc.ca/gov/content/transportation/driving-and-cycling/roadsafetybc/medical-fitness/medical-prof/med-standards/18-sleep-disorders',
      },
      {
        label:
          'Health Canada — Magnets in certain Philips Respironics sleep therapy masks may cause serious injury to some individuals (RA-64582)',
        href: 'https://recalls-rappels.canada.ca/en/alert-recall/magnets-certain-philips-respironics-sleep-therapy-masks-may-cause-serious-injury-some',
      },
      {
        label: 'BC Ministry of Health — Positive Airway Pressure (PAP) Buyer’s Guide',
        href: 'https://www2.gov.bc.ca/assets/gov/health/practitioner-pro/medical-services-plan/diagnostic-facilities/announcements/pap_buyers_guide.pdf',
      },
      {
        label: 'Health Canada — Buying Medical Devices from the Internet',
        href: 'https://www.canada.ca/en/health-canada/services/healthy-living/your-health/medical-information/buying-medical-devices-over-internet.html',
      },
    ],
  },
  /*
   * 03 · Your Treatment Options. Copy: SleepApneaCare.chapters.treatment-options, after the source
   * check of 2026-10-13 and the owner rulings of 2026-10-13 (C7 in 5.note; N1, supplies-only: the
   * card 1 and card 4 machine strips are deleted, rows 20–21). No red-flag block of its own: the
   * start-here map signposts Driving & Staying Safe's. The clinical defaults R1–R9 stay open with
   * the nurse (OPEN-QUESTIONS C18, C19, C21, C22, C24, C48, C49, C50, B8); each ships its drafted
   * default. Nothing here gives a pressure or a setting. No care panel (E-8): the Liivv sleep
   * support service (Part C) is not live, so its words (5.serviceNote, lane 5, support.*) are out
   * of tree. Held treatments (positional therapy, surgery, nerve stimulation, tirzepatide, EPAP
   * valves) are section E and never enter the messages.
   */
  {
    slug: 'treatment-options',
    num: '03',
    chapterWord: 'three',
    heroImage: IMG,
    accent: ACCENT,
    rail: false,
    majorSections: true,
    /* Exactly two segments: breathing machines, and without a machine. */
    startHere: { groups: ['machines', 'withoutMachine'] },
    urgentExit: { chapter: 'staying-safe' },
    categories: [
      /* ---------- Breathing machines ---------- */
      {
        // 1 CPAP and APAP. No shop strip: Liivv sells no machines (N1).
        image: IMG,
        group: 'machines',
        ask: 'team',
        figures: [{ kind: 'columns', lead: [1, 2], columns: [[3], [4, 5]], neutral: [6] }],
        sources: [
          'bcg-osa-adults',
          'lhf-sleep-apnea',
          'cadth-osa-2017',
          'bc-pap-buyers-guide',
          'cla-sleep-apnea',
          'ab-cpap-buyers-2026',
          'cts-sdb-2011',
        ],
      },
      {
        // 2 Bilevel. No shop strip. "see Paying for it" in item 5 opens the funding page (03 copy
        // note). The item carries no <link> tags in section B, so the whole sentence is the link.
        image: IMG,
        group: 'machines',
        ask: 'team',
        links: [{ at: 'items.5', to: { page: 'funding' } }],
        sources: [
          'bc-pap-buyers-guide',
          'ab-cpap-buyers-2026',
          'cla-sleep-apnea',
          'lhf-sleep-apnea',
          'cts-sdb-2011',
        ],
      },
      {
        // 3 Central and complex sleep apnea. The ASV and heart-failure note (RA-53771) never sits
        // behind a disclosure. No shop strip, ever.
        image: IMG,
        group: 'machines',
        ask: 'team',
        noteVisible: true,
        sources: [
          'cla-sleep-apnea',
          'lhf-sleep-apnea',
          'bc-pap-buyers-guide',
          'bcg-osa-adults',
          'cts-sdb-2011',
          'hc-recall-asv-2015',
        ],
      },
      {
        // 4 Travel machines. Pros and cons. No shop strip (N1).
        image: IMG,
        group: 'machines',
        ask: 'provider',
        figures: [{ kind: 'columns', columns: [[1], [2]], neutral: [3, 4, 5, 6] }],
        sources: [
          'bc-pap-buyers-guide',
          'ab-cpap-buyers-2026',
          'cla-sleep-apnea',
          'lhf-sleep-apnea',
        ],
      },
      {
        // 5 Renting, trying or buying. The buying note (any supplier, online or in person; C7) is
        // never collapsed. "Check a licence" follows item 6 and opens MDALL (E-5 labelled link).
        image: IMG,
        group: 'machines',
        ask: 'provider',
        noteVisible: true,
        figures: [
          {
            kind: 'containers',
            containers: [
              {
                glyph: 'list',
                items: [
                  { item: 1, glyph: 'home' },
                  { item: 2, glyph: 'check' },
                  { item: 3, glyph: 'list' },
                ],
              },
              {
                glyph: 'people',
                items: [
                  { item: 4, glyph: 'people' },
                  { item: 8, glyph: 'hands' },
                ],
              },
              {
                glyph: 'book',
                items: [
                  { item: 5, glyph: 'book' },
                  { item: 6, glyph: 'check' },
                  { item: 7, glyph: 'list' },
                ],
              },
            ],
          },
        ],
        links: [
          {
            at: 'items.6',
            key: 'licence',
            label: true,
            to: { source: 'hc-mdall', href: MDALL_HREF },
          },
        ],
        sources: [
          'ab-cpap-buyers-2026',
          'bc-pap-buyers-guide',
          'cla-sleep-apnea',
          'hc-mdall',
          'crto-standard-5',
        ],
      },

      /* ---------- Without a machine ---------- */
      {
        // 6 Oral appliances. No shop strip (the oral-appliance path has no shop). Sources per the
        // claims table after the 2026-10-13 check: lhf-sleep-apnea no longer backs any card 6 line.
        image: IMG,
        group: 'withoutMachine',
        ask: 'dentist',
        figures: [
          {
            kind: 'columns',
            lead: [1, 2],
            columns: [
              [3, 4, 5],
              [6, 7],
            ],
            neutral: [8],
          },
        ],
        sources: [
          'bcg-osa-oral-devices-2021',
          'bcg-osa-adults',
          'cla-sleep-apnea',
          'cadth-osa-2017',
          'cda-oat',
          'bcg-osa-options-2021',
        ],
      },
      {
        // 7 Weight and everyday habits. Positional therapy, bariatric surgery and tirzepatide are
        // HELD (section E; C25), out of tree.
        image: IMG,
        group: 'withoutMachine',
        ask: 'team',
        figures: [
          {
            kind: 'columns',
            lead: [1, 2, 3],
            columns: [
              [4, 5],
              [6, 7],
            ],
            neutral: [8, 9],
          },
        ],
        sources: ['cadth-osa-2017', 'bcg-osa-adults', 'cla-sleep-apnea', 'lhf-sleep-apnea'],
      },
      {
        // 8 Comparing your options. Ships as `columns`; the therapyCompare figure (03 G.1) is not
        // built in this pass (spec 5.4).
        image: IMG,
        group: 'withoutMachine',
        ask: 'team',
        figures: [
          {
            kind: 'columns',
            columns: [
              [1, 2],
              [3, 4],
            ],
            neutral: [5, 6, 7],
          },
        ],
        sources: [
          'cadth-osa-2017',
          'bcg-osa-options-2021',
          'bcg-osa-oral-devices-2021',
          'bcg-osa-adults',
        ],
      },
      {
        // 9 Shop fixes and new treatments: check first. No shop strip, ever. "Is It Sleep Apnea?"
        // follows the note and opens Chapter 01 at its first band (8.1). Adult surgery, nerve
        // stimulation and EPAP valves are HELD (section E; C25), out of tree.
        image: IMG,
        group: 'withoutMachine',
        ask: 'team',
        links: [
          {
            at: 'note',
            key: 'note',
            label: true,
            to: { chapter: 'is-it-sleep-apnea', anchor: 'chapter-care' },
          },
        ],
        sources: ['bcg-osa-oral-devices-2021', 'cla-sleep-apnea', 'cda-oat'],
      },
      {
        // 10 Who to ask. Four lanes, each the card's own sentence; the Liivv sleep support lane
        // (Part C) is out of tree, so no lane is a service lane.
        image: IMG,
        group: 'withoutMachine',
        ask: 'team',
        figures: [
          {
            kind: 'lanes',
            lanes: [
              { glyph: 'team', item: 1, topics: ['machine', 'habits'] },
              { glyph: 'service', item: 2, topics: ['oral'] },
              { glyph: 'service', item: 3, topics: ['mask', 'machine', 'supplies'] },
              { glyph: 'team', item: 4, topics: ['habits'] },
            ],
            topicKeys: ['machine', 'mask', 'oral', 'habits', 'supplies'],
          },
        ],
        sources: [
          'ab-cpap-buyers-2026',
          'bc-pap-buyers-guide',
          'bcg-osa-adults',
          'cda-oat',
          'cla-sleep-apnea',
        ],
      },
    ],
    /* Band "Before you choose": four cards; card 4 links MDALL ("Check a licence"). */
    programsBandLinks: [
      [],
      [],
      [],
      [
        {
          href: MDALL_HREF,
          hrefLang: 'en',
          locales: ['en', 'fr'],
          sources: ['hc-mdall'],
        },
      ],
    ],
    /* No band body names a card title of this chapter. */
    programsBandCards: [null, null, null, null],
    bandSources: ['bc-pap-buyers-guide', 'ab-cpap-buyers-2026', 'hc-mdall'],
    resourceLinks: [],
    /* Titles and links as the register has them (sources-meta.ts). */
    citations: [
      {
        label: 'BC Guidelines — Obstructive Sleep Apnea (OSA): Assessment and Management in Adults',
        href: 'https://www2.gov.bc.ca/gov/content/health/practitioner-professional-resources/bc-guidelines/sleep-apnea',
      },
      {
        label: 'BC Ministry of Health — Positive Airway Pressure (PAP) Buyer’s Guide',
        href: 'https://www2.gov.bc.ca/assets/gov/health/practitioner-pro/medical-services-plan/diagnostic-facilities/announcements/pap_buyers_guide.pdf',
      },
      {
        label:
          'CADTH — Interventions for the Treatment of Obstructive Sleep Apnea in Adults (2017, archived)',
        href: 'https://www.inahta.org/upload/2017/17017_Interventions%20for%20the%20Treatment%20of%20Obstructive%20Sleep%20Apnea%20in%20Adults.pdf',
      },
      {
        label: 'MyHealth Alberta — Buyer’s Information for CPAP Therapy Equipment',
        href: 'https://myhealth.alberta.ca/Alberta/Pages/Buyers-Information-for-CPAP-Therapy-Equipment.aspx',
      },
      {
        label: 'Canadian Lung Association — Sleep apnea',
        href: 'https://www.lung.ca/lung-diseases/sleep-apnea/',
      },
      {
        label: 'Health Canada — Adaptive Servo-Ventilation therapy devices recall (2015)',
        href: 'https://recalls-rappels.canada.ca/en/alert-recall/adaptive-servo-ventilation-avs-therapy-devices-2015-05-13',
      },
    ],
  },
  /*
   * 04 · Starting CPAP. Copy: SleepApneaCare.chapters.starting-cpap, first sourced draft of
   * 2026-10-13, after its source check (SC1–SC13) and the owner and nurse rulings of 2026-10-13
   * (C3, S26, N7, C7, C26, C17, C1, N6). No red-flag block of its own: the start-here map's
   * signpost, card 9's last answer and card 11's lane 4 point at Driving & Staying Safe's.
   * Clinical defaults S1–S12 stay open with the nurse (content review). Out of the tree: every
   * Part C service line (setup call, check-ins, data reviews, mask-fit help, usage report, the
   * Liivv lane and the RT panel; the Liivv sleep support service is not live) and card 6's note
   * (its last sentence implies Liivv sells machines; supplies-only row 26, N2/N10).
   */
  {
    slug: 'starting-cpap',
    num: '04',
    chapterWord: 'four',
    heroImage: IMG,
    accent: ACCENT,
    rail: false,
    majorSections: true,
    /* Exactly two segments: your setup, then the first weeks. */
    startHere: { groups: ['yourSetup', 'firstWeeks'] },
    urgentExit: { chapter: 'staying-safe' },
    categories: [
      /* ---------- Your setup ---------- */
      {
        // 1 Setup and follow-up. The schedule is shown for every province, with its basis in the
        // note, which never sits behind a disclosure (S4 / C12).
        image: IMG,
        group: 'yourSetup',
        ask: 'rt',
        figures: [
          {
            kind: 'followUpTimeline',
            steps: [
              { item: 1, label: 1 }, // setup
              { item: 2, label: 2 }, // about 7 days
              { item: 3, label: 3 }, // 2 to 4 weeks
              { item: 4, label: 4 }, // 30 days
              { item: 4, label: 5 }, // 60 days
              { item: 5, label: 6 }, // every year
            ],
            sources: ['bc-pap-buyers-guide', 'ab-osa-pathway-2026', 'bcg-osa-adults'],
          },
        ],
        noteVisible: true,
        sources: [
          'bc-pap-buyers-guide',
          'ab-cpap-buyers-2026',
          'ab-osa-pathway-2026',
          'bcg-osa-adults',
        ],
      },
      {
        // 2 Your prescription and settings. Never a shop strip. The note ("Liivv never advises on
        // pressure or settings") is never behind a disclosure.
        image: IMG,
        group: 'yourSetup',
        ask: 'prescriber',
        noteVisible: true,
        sources: [
          'cla-sleep-apnea',
          'lhf-sleep-apnea',
          'ab-cpap-buyers-2026',
          'bc-pap-buyers-guide',
          'crto-standard-5',
        ],
      },
      {
        // 3 Mask types to ask your RT about. The picker never ranks or picks a mask: each tick
        // highlights the types the row's own sources tie to it; unticked, all three show. The
        // magnet line is always visible (C3 / S26 / N7: a warning, no stop rule; Health Canada
        // notices only). Shop strip: none while placements are off (never paediatric masks here).
        image: IMG,
        group: 'yourSetup',
        ask: 'rt',
        figures: [
          {
            kind: 'maskPicker',
            types: ['pillows', 'nasal', 'fullFace'],
            questions: [
              {
                id: 1,
                suggests: ['fullFace'],
                also: 'chinStrap',
                sources: ['bc-pap-buyers-guide', 'cla-sleep-apnea'],
              },
              { id: 2, suggests: ['nasal', 'pillows'], sources: ['bc-pap-buyers-guide'] },
              {
                id: 3,
                suggests: ['pillows', 'nasal'],
                sources: ['cla-sleep-apnea', 'bcg-osa-adults', 'bc-pap-buyers-guide'],
              },
              {
                id: 4,
                suggests: ['pillows'],
                sources: ['bc-pap-buyers-guide', 'ab-osa-pathway-2026'],
              },
              {
                id: 5,
                suggests: ['pillows'],
                also: 'chinStrap',
                sources: ['bc-pap-buyers-guide', 'cla-sleep-apnea'],
              },
              {
                id: 6,
                suggests: ['fullFace'],
                sources: ['bc-pap-buyers-guide', 'cla-sleep-apnea', 'bcg-osa-adults'],
              },
              { id: 7, suggests: ['nasal'], sources: ['cla-sleep-apnea'] },
              { id: 8, suggests: ['pillows'], sources: ['bc-pap-buyers-guide'] },
            ],
            bilevelNote: { sources: ['bc-pap-buyers-guide'] },
            magnetNote: {
              always: true,
              /* Masks with magnets, the warning card. */
              to: { chapter: 'staying-safe', card: 6 },
              sources: [
                'hc-recall-magnet-philips-2022',
                'hc-recall-magnet-resmed-2023',
                'hc-recall-magnet-philips-masks-2022',
              ],
            },
          },
        ],
        noteVisible: true,
        sources: [
          'ab-osa-pathway-2026',
          'bc-pap-buyers-guide',
          'cla-sleep-apnea',
          'ab-cpap-buyers-2026',
          'hc-recall-magnet-philips-2022',
          'hc-recall-magnet-resmed-2023',
          // Section C cites RA-64545 for 3.items.5 too (change log 23, ruling C3).
          'hc-recall-magnet-philips-masks-2022',
        ],
      },
      {
        // 4 Getting the fit right. The Liivv mask-fit line is out of the tree (Part C; N5 default no).
        image: IMG,
        group: 'yourSetup',
        ask: 'rt',
        sources: ['cla-sleep-apnea', 'bc-pap-buyers-guide', 'ab-cpap-buyers-2026', 'akh-pap'],
      },
      {
        // 5 Humidifier and distilled water. Humidity counts as a setting (S8 / C32).
        image: IMG,
        group: 'yourSetup',
        ask: 'rt',
        sources: ['bc-pap-buyers-guide', 'cla-sleep-apnea', 'ab-osa-pathway-2026'],
      },
      {
        // 6 Your starter list, as two columns. No note in the tree (see the header). No machine
        // link of any kind: Liivv sells no machines (N1).
        image: IMG,
        group: 'yourSetup',
        ask: 'rt',
        figures: [
          {
            kind: 'columns',
            columns: [
              [1, 2, 3],
              [4, 5, 6],
            ],
          },
        ],
        sources: ['bc-pap-buyers-guide', 'cla-sleep-apnea', 'ab-osa-pathway-2026'],
      },

      /* ---------- The first weeks ---------- */
      {
        // 7 Your first nights. Never a shop strip.
        image: IMG,
        group: 'firstWeeks',
        ask: 'sleepTeam',
        sources: [
          'cla-sleep-apnea',
          'ab-osa-pathway-2026',
          'bcg-osa-adults',
          'rsbc-ccmta-18-6-1',
          // Healthwise (US), second source only (7.items.6).
          'hlbc-cpap',
          'akh-pap',
        ],
      },
      {
        // 8 What your usage numbers mean. Never a shop strip (driving content). Licensing measures
        // only, never a health target (S1 / C9). Rows after the source check: 'driving' (CTS/CSS)
        // and 'severe' (18.6.1 applies to all drivers; the BC proof line says "In BC"). The rail
        // row is held (E.16 / C20).
        image: IMG,
        group: 'firstWeeks',
        ask: 'sleepTeam',
        figures: [
          {
            kind: 'usageExplainer',
            rows: [
              { id: 'driving', sources: ['cts-css-driving-2014'] },
              { id: 'severe', sources: ['rsbc-ccmta-18-6-1'] },
            ],
            footerAlways: true,
            sources: ['cts-css-driving-2014', 'rsbc-ccmta-18-6-1'],
          },
        ],
        noteVisible: true,
        sources: [
          'bc-pap-buyers-guide',
          'bcg-osa-adults',
          'ab-cpap-buyers-2026',
          'cts-css-driving-2014',
          'rsbc-ccmta-18-6-1',
        ],
      },
      {
        // 9 Fix a common problem. Never a shop strip (keeps "call your RT" first). Every answer is
        // the card's own item; figure.always ("don't change your pressure or settings yourself")
        // shows under every one. Problem 10 links the red-flag block.
        image: IMG,
        group: 'firstWeeks',
        ask: 'rt',
        figures: [
          {
            kind: 'troubleshootFinder',
            problems: [
              { id: 1, sources: ['cla-sleep-apnea'] },
              { id: 2, sources: ['cla-sleep-apnea', 'bcg-osa-adults'] },
              { id: 3, sources: ['cla-sleep-apnea', 'ab-osa-pathway-2026'] },
              // Alberta first; Healthwise (US) second only.
              { id: 4, sources: ['ab-osa-pathway-2026', 'hlbc-cpap'] },
              { id: 5, sources: ['ab-osa-pathway-2026', 'bcg-osa-adults', 'cla-sleep-apnea'] },
              { id: 6, sources: ['cla-sleep-apnea'] },
              { id: 7, sources: ['bc-pap-buyers-guide', 'cla-sleep-apnea'] },
              { id: 8, sources: ['cla-sleep-apnea'] },
              { id: 9, sources: ['bc-pap-buyers-guide'] },
              {
                id: 10,
                sources: ['cla-sleep-apnea'],
                link: { chapter: 'staying-safe', anchor: 'red-flags' },
              },
            ],
            always: true,
          },
        ],
        sources: [
          'cla-sleep-apnea',
          'bcg-osa-adults',
          'ab-osa-pathway-2026',
          'bc-pap-buyers-guide',
          'hlbc-cpap',
        ],
      },
      {
        // 10 If you can't get used to it. Its note names Your Treatment Options.
        image: IMG,
        group: 'firstWeeks',
        ask: 'sleepTeam',
        sources: ['cla-sleep-apnea', 'bcg-osa-adults', 'ab-osa-pathway-2026', 'hlbc-cpap'],
      },
      {
        // 11 Who to ask. Lane 4 points at the red flags, so the card is pinned open and keeps its
        // figure in every locale. Every lane is a card sentence, so /fr keeps all four. The Liivv
        // lane (B lane 5) is out of the tree (Part C, not live).
        image: IMG,
        group: 'firstWeeks',
        ask: 'sleepTeam',
        urgentContent: true,
        figures: [
          {
            kind: 'lanes',
            lanes: [
              { glyph: 'team', item: 1, topics: ['settings', 'symptoms'] },
              // The reader's own RT or CPAP provider, not a Liivv lane.
              { glyph: 'service', item: 2, topics: ['mask', 'machine'] },
              { glyph: 'phone', item: 3, topics: ['symptoms'] },
              // In-site link (E-7). B gives no figure.lanes.4.linkLabel (see notes.md).
              {
                glyph: 'urgent',
                item: 4,
                topics: ['urgent'],
                to: { chapter: 'staying-safe', anchor: 'red-flags' },
              },
            ],
            topicKeys: ['settings', 'mask', 'machine', 'symptoms', 'urgent'],
          },
        ],
        sources: [
          'bc-pap-buyers-guide',
          'ab-cpap-buyers-2026',
          'crto-pap',
          'nihb-pap',
          'cla-sleep-apnea',
          'hlbc-cpap',
          'ab-osa-pathway-2026',
        ],
      },
    ],
    /* Band "Four things to remember": four cards, no links. */
    programsBandLinks: [[], [], [], []],
    /* Card 4 also rests on BC Guidelines (as 10.items.2), per section C. */
    bandSources: [
      'cla-sleep-apnea',
      'bc-pap-buyers-guide',
      'ab-osa-pathway-2026',
      'bcg-osa-adults',
    ],
    resourceLinks: [],
    /* Titles as A.2 gives them; the Lung Association's address is the register's current one. */
    citations: [
      {
        label: 'BC Ministry of Health — Positive Airway Pressure (PAP) Buyer’s Guide',
        href: 'https://www2.gov.bc.ca/assets/gov/health/practitioner-pro/medical-services-plan/diagnostic-facilities/announcements/pap_buyers_guide.pdf',
      },
      {
        label: 'MyHealth Alberta — Your journey with obstructive sleep apnea (patient pathway)',
        href: 'https://myhealth.alberta.ca/HealthTopics/obstructive-sleep-apnea-pathway/Documents/obstructive-sleep-apnea-pathway.pdf',
      },
      {
        label: 'Canadian Lung Association — Sleep apnea (FAQs about using a CPAP machine)',
        href: 'https://www.lung.ca/lung-diseases/sleep-apnea/',
      },
      {
        label: 'BC Guidelines — Obstructive Sleep Apnea: Assessment and Management in Adults',
        href: 'https://www2.gov.bc.ca/gov/content/health/practitioner-professional-resources/bc-guidelines/sleep-apnea',
      },
    ],
  },
  /*
   * 05 · Everyday Liivving. Copy: SleepApneaCare.chapters.everyday-liivving
   * (docs/sleep-content/05-everyday-liivving.md, source check and rulings of
   * 2026-10-13). No red-flag block of its own: urgentExit signposts Chapter 02's.
   * Card 5's sick-child line is a note that is always visible. Clinical defaults
   * R1 and R3-R13 are open with the nurse and ship on their default (spec 0.1);
   * R2 was answered (C5). Nothing in this chapter gives a pressure or a setting.
   * Out of tree (spec 8.4): the Part C service note (card 6), service lane
   * (card 10 lane 6) and support panel; the card shop strips (placements off).
   */
  {
    slug: 'everyday-liivving',
    num: '05',
    chapterWord: 'five',
    heroImage: IMG,
    accent: ACCENT,
    rail: false,
    majorSections: true,
    startHere: { groups: ['cleanReplace', 'away'] },
    urgentExit: { chapter: 'staying-safe' },
    categories: [
      /* ---------- A. Clean and replace ---------- */
      {
        // 1 Your cleaning routine. Shop (later, placements off): cleaning supplies, never ozone or UV.
        image: IMG,
        group: 'cleanReplace',
        ask: 'provider',
        figures: [{ kind: 'columns', lead: [1], columns: [[2, 3, 4, 5], [6]], neutral: [7, 8, 9] }],
        sources: [
          'cla-sleep-apnea',
          'hc-recall-philips-ra-76137',
          'bc-pap-buyers-guide',
          'ab-cpap-buyers-2026',
        ],
      },
      {
        // 2 Ozone and UV cleaners (ruling C5, "default": Philips-scoped line only;
        // the every-device line is held out of tree, E15). Never a shop strip.
        image: IMG,
        group: 'cleanReplace',
        ask: 'provider',
        // The "don't stop a recalled machine on your own" line is never collapsed.
        noteVisible: true,
        // "Driving & Staying Safe" after the note, opening the card the note means
        // (Recalls: what to do, Ch02 card 5) rather than the chapter's first band.
        links: [
          {
            at: 'note',
            key: 'note',
            label: true,
            to: { chapter: 'staying-safe', card: 5 },
          },
        ],
        sources: ['cts-css-csrt-philips-2021', 'hc-recall-philips-ra-76137', 'pmra-uv-ozone'],
      },
      {
        // 3 When to replace supplies: the resupply planner. Landing door `supplies`
        // lands here (everyday-liivving#card-3).
        image: IMG,
        group: 'cleanReplace',
        ask: 'provider',
        // The magnet line (rulings C3, S26, N7) is never collapsed.
        noteVisible: true,
        figures: [
          {
            // Site figure (spec 5.2). Gated on /fr: the card keeps its seven items
            // and its note. Words: categories.3.figure.* (column words under
            // `schedules`, remapped off the engine's `columns` shape).
            kind: 'resupplyPlanner',
            rows: [
              'mask',
              'cushion',
              'headgear',
              'tubing',
              'filter',
              'chamber',
              'chinStrap',
              'machine',
            ],
            columns: ['manual', 'general', 'nihb', 'bcea', 'ontario', 'maker'],
            // Each column header's own chips. The maker column is industry,
            // labelled "Maker" by its kind badge, and sits beside official columns.
            columnSources: {
              manual: ['cla-sleep-apnea', 'bc-pap-buyers-guide'],
              general: ['bc-pap-buyers-guide', 'cla-sleep-apnea'],
              nihb: ['nihb-pap'],
              bcea: ['bc-bcea-breathing'],
              ontario: ['on-adp-respiratory', 'on-adp-resp-manual-2024', 'on-odsp-msn'],
              maker: ['resmed-ca-tipsheet-2021'],
            },
            // NIHB funding maximums, as counts a year (arithmetic: figure.perYear).
            perYear: { nihb: { mask: 2, cushion: 2, tubing: 2, filter: 14, chinStrap: 2 } },
            // Periods in months for the optional date arithmetic. `general` is
            // added from G.1 ("Ranges (3 to 12 months; 3 to 5 years) show both
            // ends"); its "When worn" cells (headgear, tubing) get no result.
            periodMonths: {
              general: {
                mask: [3, 12],
                cushion: [3, 12],
                filter: 2,
                chamber: [3, 12],
                chinStrap: [3, 12],
                machine: [36, 60],
              },
              bcea: {
                mask: 12,
                cushion: 12,
                headgear: 12,
                tubing: 12,
                filter: 12,
                chamber: 12,
                chinStrap: 12,
                machine: 60,
              },
              nihb: { machine: 60 },
              ontario: { machine: 60 },
              maker: {
                mask: 6,
                cushion: 3,
                headgear: 3,
                tubing: 3,
                filter: 1,
                chamber: 6,
                machine: 60,
              },
            },
            payers: ['nihb', 'bcea', 'ontario', 'plan', 'self'],
          },
        ],
        // "Driving & Staying Safe" after the magnet note, opening the warning card itself
        // (Masks with magnets, Ch02 card 6).
        links: [
          {
            at: 'note',
            key: 'note',
            label: true,
            to: { chapter: 'staying-safe', card: 6 },
          },
        ],
        sources: [
          'bc-pap-buyers-guide',
          'cla-sleep-apnea',
          'nihb-pap',
          'bc-bcea-breathing',
          'on-adp-respiratory',
          'on-adp-resp-manual-2024',
          'on-odsp-msn',
          'resmed-ca-tipsheet-2021',
          'hc-recall-magnet-philips-2022',
          'hc-recall-magnet-resmed-2023',
        ],
      },
      {
        // 4 Signs a part is worn. Landing FAQ 3 links here (everyday-liivving#card-4).
        image: IMG,
        group: 'cleanReplace',
        ask: 'provider',
        figures: [
          {
            kind: 'columns',
            lead: [1],
            columns: [
              [2, 3, 4],
              [5, 6, 7],
            ],
            neutral: [8],
          },
        ],
        // "Report a device problem" (links.item8) after item 8: Health Canada's consumer form
        // (no French address recorded in the register).
        links: [
          {
            at: 'items.8',
            key: 'item8',
            label: true,
            to: {
              source: 'hc-device-problem-form',
              href: 'https://www.canada.ca/en/health-canada/services/drugs-health-products/compliance-enforcement/problem-reporting/medical-device-consumer.html',
            },
          },
        ],
        sources: [
          'cla-sleep-apnea',
          'ab-cpap-buyers-2026',
          'bc-pap-buyers-guide',
          'nihb-pap',
          'on-adp-respiratory',
          'hc-device-problem-form',
        ],
      },
      {
        // 5 Caring for a child's CPAP. Child-specific source only (akh-pap). No
        // shop strip, ever: the note is urgent (R5; C17 answered).
        image: IMG,
        group: 'cleanReplace',
        ask: 'childProvider',
        // Urgent: a sick child's breathing. Never hidden.
        noteVisible: true,
        sources: ['akh-pap'],
      },
      {
        // 6 Your machine's data and follow-ups. No shop strip. The Part C
        // service note is out of tree (spec 8.4).
        image: IMG,
        group: 'cleanReplace',
        ask: 'team',
        figures: [
          {
            kind: 'columns',
            columns: [
              [1, 2, 3],
              [4, 5, 6],
            ],
            neutral: [7, 8],
          },
        ],
        // "Starting CPAP" (links.item6) after item 6, "Driving & Staying Safe" (links.item7) after item 7.
        links: [
          {
            at: 'items.6',
            key: 'item6',
            label: true,
            to: { chapter: 'starting-cpap', anchor: 'chapter-care' },
          },
          {
            at: 'items.7',
            key: 'item7',
            label: true,
            to: { chapter: 'staying-safe', anchor: 'chapter-care' },
          },
        ],
        sources: ['bc-pap-buyers-guide', 'bcg-osa-adults', 'cts-css-driving-2014'],
      },

      /* ---------- B. Away from home ---------- */
      {
        // 7 Flying with CPAP. Landing door `travel` and FAQ 2 land on segment 2
        // (everyday-liivving#sa-group-2), this card first.
        image: IMG,
        group: 'away',
        ask: 'provider',
        figures: [
          {
            kind: 'columns',
            lead: [1],
            columns: [
              [2, 3, 4, 5, 6, 7],
              [8, 9],
            ],
          },
        ],
        sources: [
          'catsa-cpap',
          'catsa-respiratory-2025',
          'catsa-medical-items',
          'cla-sleep-apnea',
          'lhf-sleep-apnea',
          'cta-mobility-aids',
          'cta-assistive-devices-guide-2020',
          'gac-travel-medical-device',
        ],
      },
      {
        // 8 Travel checklist. No shop strip, no battery row (E1 held).
        image: IMG,
        group: 'away',
        ask: 'provider',
        // Site figure (spec 5.2). Gated on /fr: the card keeps its items as a plain list.
        figures: [{ kind: 'tripList', lead: [1], items: [2, 3, 4, 5, 6, 7] }],
        // "Hospital stays" after the note: the next card, in this chapter.
        links: [
          {
            at: 'note',
            key: 'note',
            label: true,
            to: { chapter: 'everyday-liivving', card: 9 },
          },
        ],
        sources: [
          'cla-sleep-apnea',
          'lhf-sleep-apnea',
          'catsa-cpap',
          'bc-pap-buyers-guide',
          'cta-mobility-aids',
          'cta-assistive-devices-guide-2020',
        ],
      },
      {
        // 9 Hospital stays, tests and procedures. Released: sourced (R4, default).
        image: IMG,
        group: 'away',
        ask: 'team',
        sources: ['cla-sleep-apnea', 'lhf-sleep-apnea'],
      },
      {
        // 10 Who to ask. Lane 6 (Liivv's sleep support team, Part C) is out of tree.
        image: IMG,
        group: 'away',
        ask: 'provider',
        figures: [
          {
            kind: 'lanes',
            lanes: [
              { glyph: 'service', item: 1, topics: ['cleaning', 'parts'] },
              { glyph: 'team', item: 2, topics: ['parts'] },
              { glyph: 'coin', item: 3, topics: ['paying'] },
              { glyph: 'plane', item: 4, topics: ['travel'] },
              {
                glyph: 'shield',
                item: 5,
                topics: ['recall', 'parts'],
                href: 'https://recalls-rappels.canada.ca/en',
                hrefLang: 'en',
                linkSources: ['hc-recalls-safety-alerts'],
              },
            ],
            topicKeys: ['cleaning', 'parts', 'paying', 'travel', 'recall'],
          },
        ],
        sources: [
          'ab-cpap-buyers-2026',
          'cla-sleep-apnea',
          'bc-pap-buyers-guide',
          'nihb-pap',
          'catsa-medical-items',
          'cta-mobility-aids',
          'cta-assistive-devices-guide-2020',
          'hc-recalls-safety-alerts',
          'hc-device-problem-form',
        ],
      },
    ],
    /* Band "Before you reorder": four cards; card 4 links the recalls list
     (words: programsBand.cards.4.links.1.label). */
    programsBandLinks: [
      [],
      [],
      [],
      [
        {
          href: 'https://recalls-rappels.canada.ca/en',
          hrefLang: 'en',
          locales: ['en', 'fr'],
          sources: ['hc-recalls-safety-alerts'],
        },
      ],
    ],
    programsBandCards: [null, null, null, null],
    bandSources: [
      'bc-pap-buyers-guide',
      'nihb-pap',
      'cla-sleep-apnea',
      'hc-recalls-safety-alerts',
      'hc-recall-magnet-philips-2022',
      'hc-recall-magnet-resmed-2023',
    ],
    resourceLinks: [],
    citations: [
      {
        label: 'Canadian Lung Association — Sleep apnea',
        href: 'https://www.lung.ca/lung-diseases/sleep-apnea/',
      },
      {
        label: 'BC Ministry of Health — Positive Airway Pressure (PAP) Buyer’s Guide',
        href: 'https://www2.gov.bc.ca/assets/gov/health/practitioner-pro/medical-services-plan/diagnostic-facilities/announcements/pap_buyers_guide.pdf',
      },
      {
        label:
          'Indigenous Services Canada — NIHB 8.0 Respiratory equipment and supplies benefits list',
        href: 'https://www.sac-isc.gc.ca/eng/1585323161648/1585323186650',
      },
      {
        label: 'Government of BC — BCEA manual: Medical Equipment – Breathing Devices',
        href: 'https://www2.gov.bc.ca/gov/content/governments/policies-for-government/bcea-policy-and-procedure-manual/health-supplements-and-programs/medical-equipment-breathing-devices',
      },
      {
        label: 'Government of Ontario — Respiratory equipment and supplies (ADP)',
        href: 'https://www.ontario.ca/page/respiratory-equipment-and-supplies',
      },
      {
        label: 'CATSA — Continuous Positive Airway Pressure (CPAP) device',
        href: 'https://www.catsa-acsta.gc.ca/en/what-can-bring/item/continuous-positive-airway-pressure-cpap-device',
      },
      {
        label: 'AboutKidsHealth (SickKids) — Positive airway pressure (PAP): CPAP and BPAP',
        href: 'https://www.aboutkidshealth.ca/healthaz/respiratory/positive-airway-pressure-pap-cpap-and-bpap/',
      },
      {
        label:
          'CTS, CSS and CSRT — Position statement on the Philips Respironics device recall (2021)',
        href: 'https://css-scs.ca/society-news/position-statement-from-the-canadian-thoracic-society-canadian-sleep-society-and-the-canadian-society-of-respiratory-therapists-philips-respironics-device-recall/',
      },
    ],
  },
  /*
   * 06 · This Might Be You. Copy: SleepApneaCare.chapters.this-might-be-you, after the source check
   * of 2026-10-13 and the owner and nurse rulings of 2026-10-13 (C3, S26, N7: card 7's magnet lines;
   * C6: card 3 held; B1: card 9 held to its heldNote; C17: paediatric masks sold online, still no
   * strip here). No red-flag block of its own: the child's breathing emergency is in Driving &
   * Staying Safe's block (urgentExit). Cards 4 and 7 carry their own urgent or safety lines and are
   * pinned open in every locale. No shop strips (placements are off; an urgent card never carries
   * one). No care panel (E-8): the Liivv sleep support service (Part C) is not live, so
   * 10.serviceNote and support.* are out of tree. Every other open ruling (R1–R7, R10, R11) ships
   * its drafted default and is listed in the content-review pack.
   */
  {
    slug: 'this-might-be-you',
    num: '06',
    chapterWord: 'six',
    heroImage: IMG,
    accent: ACCENT,
    rail: false,
    majorSections: true,
    /* Exactly two segments: seasons of life (cards 1–6), care and community (cards 7–10). */
    startHere: { groups: ['seasonsOfLife', 'careAndCommunity'] },
    urgentExit: { chapter: 'staying-safe' },
    categories: [
      /* ---------- Seasons of life ---------- */
      {
        // 1 Signs in children. Child-specific source (AboutKidsHealth); the Lung Association's
        // children section is the second source, and the only one for item 6 (R2 / C15).
        image: IMG,
        group: 'seasonsOfLife',
        ask: 'doctor',
        figures: [{ kind: 'columns', lead: [1], columns: [[2, 3], [4]], neutral: [5, 6, 7] }],
        sources: ['akh-osa', 'cla-sleep-apnea'],
      },
      {
        // 2 Testing for children. The printable card: the six items, then four blank question lines
        // (figure.fields). Never a shop strip.
        image: IMG,
        group: 'seasonsOfLife',
        ask: 'doctor',
        figures: [{ kind: 'takeIn', fields: 4 }],
        sources: [
          'cts-css-peds-dx-2026',
          'cts-css-peds-infographic-2026',
          'akh-osa',
          'cla-sleep-apnea',
        ],
      },
      {
        // 3 Treatment for children. HELD (ruling C6, 2026-10-13, "default"): the card renders nothing
        // and Chapter 06 launches without it; card numbers stay as they are. Its after-surgery
        // medicine warning (911) is section E and out of tree. When released: pinned open, items 6
        // and 7 are the after-surgery call and emergency-department lines. Sources per section C
        // (akh-pap added: 3.items.3 s1 and 3.items.5 cite it).
        image: IMG,
        group: 'seasonsOfLife',
        ask: 'childTeam',
        urgentContent: true,
        held: 'childTreatmentRuling',
        figures: [
          {
            kind: 'columns',
            lead: [1],
            columns: [
              [2, 3],
              [4, 5],
            ],
            neutral: [6, 7],
          },
        ],
        sources: ['hlbc-ta-osa', 'akh-osa', 'akh-tonsillectomy-osa', 'cla-sleep-apnea', 'akh-pap'],
      },
      {
        // 4 A child on CPAP. Pinned open: item 8 (a sick child, worried about breathing → provider or
        // local emergency department). The note (one steady pressure; auto-adjusting machines are
        // not for children; the magnet warnings) is never collapsed. No shop strip (R3, C17).
        image: IMG,
        group: 'seasonsOfLife',
        ask: 'childTeam',
        urgentContent: true,
        noteVisible: true,
        figures: [
          {
            kind: 'columns',
            columns: [
              [1, 2, 3],
              [4, 5, 6, 7],
            ],
            neutral: [8],
          },
        ],
        sources: [
          'akh-pap',
          'ab-cpap-buyers-2026',
          'cla-sleep-apnea',
          'hc-recall-magnet-philips-2022',
        ],
      },
      {
        // 5 Later life. The survey figures carry their years; the StatCan page is archived (C23).
        image: IMG,
        group: 'seasonsOfLife',
        ask: 'sleepTeam',
        figures: [
          {
            kind: 'columns',
            lead: [1, 2],
            columns: [
              [3, 4],
              [5, 6],
            ],
            neutral: [7],
          },
        ],
        sources: ['statcan-osa-2018', 'cla-sleep-apnea', 'on-adp-respiratory'],
      },
      {
        // 6 Women: the signs can look different. Pregnancy is HELD (section E; R12), out of tree.
        image: IMG,
        group: 'seasonsOfLife',
        ask: 'doctor',
        sources: ['statcan-osa-2018'],
      },

      /* ---------- Care and community ---------- */
      {
        // 7 Partners and household. Pinned open: the magnet and implant lines (items 3–5) and the
        // note are never hidden. A warning, not a stop rule (ruling C3): Health Canada's "stop" only
        // for the masks its 2022 advisory names (Option A, as Driving & Staying Safe card 6).
        image: IMG,
        group: 'careAndCommunity',
        ask: 'provider',
        urgentContent: true,
        noteVisible: true,
        figures: [
          {
            kind: 'columns',
            columns: [
              [1, 2],
              [3, 4, 5],
            ],
            neutral: [6],
          },
        ],
        sources: [
          'cla-sleep-apnea',
          'hc-recall-magnet-philips-2022',
          'hc-recall-magnet-resmed-2023',
          'ab-cpap-buyers-2026',
        ],
      },
      {
        // 8 Helping someone. The note points to Driving & Staying Safe's red-flag block in words only.
        image: IMG,
        group: 'careAndCommunity',
        ask: 'sleepTeam',
        figures: [{ kind: 'columns', columns: [[1], [2, 3, 4, 5]], neutral: [6, 7] }],
        sources: ['cla-sleep-apnea', 'statcan-osa-2018'],
      },
      {
        // 9 First Nations and Inuit: NIHB coverage. HELD to its title and heldNote (R8; ruling B1,
        // 2026-10-13, "default") until an Indigenous health partner reviews it. Its items, note,
        // link and figure stay in the message files and are stripped before the browser
        // (HELD_CARD_PATHS). When released: "Who is eligible for NIHB" follows item 2 and opens
        // ISC's eligibility page (E-5 labelled link). The columns figure covers the card's 7 items.
        image: IMG,
        group: 'careAndCommunity',
        ask: 'nihb',
        held: 'indigenousPartnerReview',
        heldNote: { sources: ['nihb-eligibility'] },
        figures: [
          {
            kind: 'columns',
            columns: [
              [1, 2, 3],
              [4, 5, 6, 7],
            ],
          },
        ],
        links: [
          {
            at: 'items.2',
            key: 'item2',
            label: true,
            to: {
              source: 'nihb-eligibility',
              href: NIHB_ELIGIBILITY_HREF,
              hrefFr: NIHB_ELIGIBILITY_HREF_FR,
            },
          },
        ],
        sources: ['nihb-pap', 'nihb-eligibility'],
      },
      {
        // 10 Paying for it. "See every program, province by province" is a door on its own line at
        // the end of the card, opening the Funding page (LANDING_GATES.fundingPage, true: built).
        // 10.serviceNote (Part C, and B4/B5) is out of tree, so the card ends at its note, then the
        // door. Sources per section C: nihb-pap is not cited for any card 10 line (10.note s1 only
        // points to card 9).
        image: IMG,
        group: 'careAndCommunity',
        ask: 'provider',
        figures: [
          {
            kind: 'columns',
            columns: [
              [1, 2, 3],
              [4, 5, 6, 7],
            ],
          },
        ],
        links: [{ at: 'after', key: 'door', label: true, to: { page: 'funding' } }],
        sources: [
          'cra-rc4065-2025',
          'cla-sleep-apnea',
          'ab-cpap-buyers-2026',
          'on-adp-respiratory',
          'fed-vac-poc9',
        ],
      },
    ],
    /*
     * Band "Who to bring in": four cards. Card 4 would link ISC's NIHB eligibility page, the
     * link card 9 holds (item 2): ruling B1 (2026-10-13, "default") shows NIHB cards only
     * "Contact your NIHB regional office" until the Indigenous partner review, so it is offered
     * in no locale, and its words are held (HELD_CARD_PATHS). Release both with card 9:
     * locales ['en', 'fr'].
     */
    programsBandLinks: [
      [],
      [],
      [],
      [
        {
          href: NIHB_ELIGIBILITY_HREF,
          hrefFr: NIHB_ELIGIBILITY_HREF_FR,
          hrefLang: 'en',
          locales: [],
          sources: ['nihb-eligibility'],
        },
      ],
    ],
    /*
     * Each band body names a card title in its last sentence: Signs in children (1), A child on CPAP
     * (4), Partners and household (7). Band card 4 says "See First Nations and Inuit.", which is not
     * card 9's full title, so it points at no card (null); card 9 is held to its heldNote anyway.
     */
    programsBandCards: [1, 4, 7, null],
    /* Per section C: band 1 akh-osa; band 2 ab-cpap-buyers-2026, akh-pap; band 3 the 2022 magnet
       advisory; band 4 nihb-eligibility. Review only. */
    bandSources: [
      'akh-osa',
      'ab-cpap-buyers-2026',
      'akh-pap',
      'hc-recall-magnet-philips-2022',
      'nihb-eligibility',
    ],
    resourceLinks: [],
    /* Labels and links as given in 06 A.2 (titles; never translated). */
    citations: [
      {
        label: 'AboutKidsHealth (SickKids) — Obstructive sleep apnea (OSA)',
        href: 'https://www.aboutkidshealth.ca/obstructive-sleep-apnea',
      },
      {
        label: 'AboutKidsHealth (SickKids) — Positive airway pressure (PAP): CPAP and BPAP',
        href: 'https://www.aboutkidshealth.ca/healthaz/respiratory/positive-airway-pressure-pap-cpap-and-bpap/',
      },
      {
        // Full guideline blocked 2026-10-13; switch to the DOI once read (pre-publish check 1).
        label:
          'Canadian Thoracic Society / Canadian Sleep Society — 2026 Guideline on the Diagnosis of Obstructive Sleep Apnea in Children (announcement)',
        href: 'https://cts-sct.ca/wp-content/uploads/2026/03/Pediatric-OSA-Guideline-Press-Release_EN_Final.pdf',
      },
      {
        label: 'Statistics Canada — Sleep Apnea in Canada, 2016 and 2017 (archived page)',
        href: 'https://www150.statcan.gc.ca/n1/pub/82-625-x/2018001/article/54979-eng.htm',
      },
      {
        label: 'Canadian Lung Association — Sleep apnea',
        href: 'https://www.lung.ca/lung-diseases/sleep-apnea/',
      },
      {
        label: 'Health Canada — Magnets in certain sleep therapy masks (public advisory, 2022)',
        href: 'https://recalls-rappels.canada.ca/en/alert-recall/magnets-certain-philips-respironics-sleep-therapy-masks-may-cause-serious-injury-some',
      },
      {
        label: 'Indigenous Services Canada — NIHB respiratory equipment and supplies benefits list',
        href: 'https://www.sac-isc.gc.ca/eng/1585323161648/1585323186650',
      },
    ],
  },
];
