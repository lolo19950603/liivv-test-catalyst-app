/*
 * =============================================================================
 * DIABETES CARE PATH PAGES — STRUCTURE
 * =============================================================================
 * The five path pages at /liivv-health/diabetes-care/chapters/<path>: one
 * reading list per type, generated from the chapters (the engine's renderer is
 * ../../_microsite/paths). Prose lives in messages/*.json under
 * `DiabetesCare.paths.<slug>`, with the shared labels under `ui.path`; this
 * file holds only what is not language-dependent: which card each entry
 * opens, its stage, and the register entries behind every fact.
 *
 * From the verified copy record of 2026-10-05 (paths.md, sections A to D).
 * Entries are index-matched to `list.reasons.<n>`; `introSources` to
 * `intro.body.<n>`. A reason that states a fact names its sources; one that is
 * navigation names none. Every Liivv line (pay and claim, the CDE band) rests
 * on the owner's word (2026-10-05, and the answers of 2026-10-06 for the CDE
 * band, which also rests on `bep-about`).
 *
 * Four of the slugs were older chapter pages (type-1, type-2, gestational,
 * prediabetes) and keep their URLs; less-common-types is new. The old
 * "Your Diabetes Journey" hub redirects to the landing's #which-diabetes
 * (next.config.ts).
 *
 * What a path never has: a kit, a product chosen for prediabetes (the shop
 * strip between the list and the funding door is never filled there; the
 * others are in ./chapter-shop.ts, PATH_SHELVES), a program Liivv bills
 * directly or anything paid for later (none is confirmed), or a dose.
 * Prediabetes has no supply framing at all: no meter, tool or pharmacist band.
 *
 * No value imports and erasable TypeScript only: the content-review export
 * loads this file directly under Node's type stripping.
 * =============================================================================
 */

import type { PathMeta } from '../../_microsite/paths/types';

import type { ChapterSlug } from './chapters-meta';
import type { SourceId } from './sources-meta';

export type PathSlug = 'type-1' | 'type-2' | 'gestational' | 'prediabetes' | 'less-common-types';

/*
 * =============================================================================
 * WHAT HAS TO BE TRUE BEFORE A LINE GOES LIVE
 * =============================================================================
 * The CDE band (`paths.<slug>.pharmacist`) waited on two release gates
 * (paths.md E.1). Gate 2, the owner confirming its wording (who answers, and
 * how callers in Quebec and the territories are served; Q16, Q17), is
 * `cdeBand`: on since 2026-10-06, when the owner answered A1, A2, B5, B9 and
 * B11. The CDEs at Bayshore Express Pharmacy answer from anywhere in Canada
 * and pass people to the Liivv pharmacy in their province, so the band
 * renders with their general phone line, email, hours and About page
 * (DIABETES_SITE.contact) in place of a button. Gate 1, the appointment page
 * offering the reason (`cdeRequestReason` in ../landing-meta.ts), now holds
 * only the band's "Request a call", as everywhere else (B6). While `cdeBand`
 * is off the band's words are not only not rendered but not sent to the
 * browser either (`heldPathPaths`, applied in ../layout.tsx).
 * =============================================================================
 */
export const PATH_GATES = {
  cdeBand: true,
};

const IMG = '/archive/diabetes-care';

/* Placeholder until the Diabetes image set and palette are chosen (Q10), as on the funding page. */
const ACCENT = '#c9dcc0';

export const PATH_META: Array<PathMeta<PathSlug, ChapterSlug, SourceId>> = [
  {
    slug: 'type-1',
    heroImage: `${IMG}/chapter-type1.png`,
    accent: ACCENT,
    introSources: [
      /* Pancreas makes no insulin; 5 to 10%; adulthood. About 71% diagnosed as adults, an estimate (C39). */
      ['dc-type-1', 'bt1d-facts-and-figures'],
      /* The 2025 type 1 guideline prefers automated insulin delivery (Q15: check the CJD addendum). */
      ['dc-cpg-ch41-t1d-lifespan-2025'],
    ],
    /* The DTC life-sustaining therapy test, 2021 on; help differs by province. How paying works:
     * as on the Funding page, the provincial drug plan billed directly, not in Quebec (owner, A6 and B13,
     * 2026-10-06; qc-stays-outside-quebec); others pay their own way (receipts: MFHP; pharmacy or
     * vendor only: NB IPP). */
    fundingSources: [
      'cra-dtc-life-sustaining-therapy',
      'cra-rc4064-2025',
      'dc-comparisons-by-province',
      'dc-ontario-monitoring-for-health',
      'nb-insulin-pump-program',
      'qc-stays-outside-quebec',
    ],
    pharmacist: true,
    entries: [
      { chapter: 'know-your-type', card: 1, stage: 'start' },
      { chapter: 'new-to-the-journey', card: 1, stage: 'start' },
      { chapter: 'new-to-the-journey', card: 3, stage: 'start' },
      { chapter: 'new-to-the-journey', card: 8, stage: 'start' },
      { chapter: 'new-to-the-journey', card: 10, stage: 'start' },
      { chapter: 'staying-safe', card: 1, stage: 'safe' },
      { chapter: 'staying-safe', card: 2, stage: 'safe' },
      { chapter: 'staying-safe', card: 3, stage: 'safe' },
      { chapter: 'staying-safe', card: 7, stage: 'safe', sources: ['bt1d-dka-and-ketones'] },
      { chapter: 'staying-safe', card: 8, stage: 'safe' },
      { chapter: 'staying-safe', card: 9, stage: 'safe' },
      {
        chapter: 'staying-safe',
        card: 10,
        stage: 'safe',
        sources: ['dc-managing-emergency-situations'],
      },
      { chapter: 'staying-safe', card: 11, stage: 'safe' },
      { chapter: 'your-tools', card: 4, stage: 'tools' },
      { chapter: 'your-tools', card: 5, stage: 'tools' },
      { chapter: 'your-tools', card: 9, stage: 'tools' },
      { chapter: 'your-tools', card: 10, stage: 'tools' },
      { chapter: 'your-tools', card: 11, stage: 'tools' },
      {
        chapter: 'your-tools',
        card: 12,
        stage: 'tools',
        sources: ['dc-cpg-ch41-t1d-lifespan-2025'],
      },
      { chapter: 'your-tools', card: 13, stage: 'tools' },
      { chapter: 'your-tools', card: 14, stage: 'tools' },
      { chapter: 'every-day-living', card: 2, stage: 'everyday' },
      {
        chapter: 'every-day-living',
        card: 3,
        stage: 'everyday',
        sources: ['dc-exercise-and-activity'],
      },
      {
        chapter: 'every-day-living',
        card: 4,
        stage: 'everyday',
        sources: ['dc-cannabis-position-2020'],
      },
      { chapter: 'every-day-living', card: 5, stage: 'everyday' },
      { chapter: 'every-day-living', card: 7, stage: 'everyday' },
      {
        chapter: 'every-day-living',
        card: 9,
        stage: 'everyday',
        sources: ['dc-cpg-ch30-retinopathy'],
      },
      {
        chapter: 'every-day-living',
        card: 10,
        stage: 'everyday',
        sources: ['dc-cpg-ch29-ckd-2025', 'dc-kidney-disease'],
      },
      { chapter: 'this-might-be-you', card: 1, stage: 'season' },
      { chapter: 'this-might-be-you', card: 2, stage: 'season' },
      { chapter: 'this-might-be-you', card: 3, stage: 'season' },
      { chapter: 'know-your-type', card: 5, stage: 'season', sources: ['bt1d-trialnet'] },
      { chapter: 'this-might-be-you', card: 6, stage: 'season', sources: ['isc-nihb-updates'] },
    ],
  },
  {
    slug: 'type-2',
    heroImage: `${IMG}/chapter-type2.png`,
    accent: ACCENT,
    introSources: [
      /* 90 to 95%; may cause no symptoms. Many with type 2 need insulin to stay healthy. */
      ['dc-type-2', 'dc-getting-started-with-insulin'],
      /* LADA, a type 1 that starts slowly in adults, is often first treated as type 2. */
      ['bt1d-lada'],
    ],
    /* The ODB strip limits, as an example; each province's own rules. How paying works:
     * as on the Funding page, the provincial drug plan billed directly, not in Quebec (owner, A6 and B13,
     * 2026-10-06; qc-stays-outside-quebec); others pay their own way (receipts: MFHP; pharmacy or
     * vendor only: NB IPP). */
    fundingSources: [
      'on-odb-coverage',
      'dc-comparisons-by-province',
      'dc-ontario-monitoring-for-health',
      'nb-insulin-pump-program',
      'qc-stays-outside-quebec',
    ],
    pharmacist: true,
    entries: [
      { chapter: 'know-your-type', card: 2, stage: 'start' },
      { chapter: 'know-your-type', card: 6, stage: 'start' },
      { chapter: 'new-to-the-journey', card: 1, stage: 'start' },
      { chapter: 'new-to-the-journey', card: 3, stage: 'start' },
      { chapter: 'new-to-the-journey', card: 4, stage: 'start' },
      {
        chapter: 'new-to-the-journey',
        card: 6,
        stage: 'start',
        sources: ['dc-cpg-ch9-monitoring-2021', 'dc-checking-blood-sugar'],
      },
      { chapter: 'new-to-the-journey', card: 7, stage: 'start' },
      {
        chapter: 'new-to-the-journey',
        card: 8,
        stage: 'start',
        sources: ['dc-getting-started-with-insulin'],
      },
      { chapter: 'staying-safe', card: 1, stage: 'safe' },
      { chapter: 'staying-safe', card: 2, stage: 'safe' },
      {
        chapter: 'staying-safe',
        card: 4,
        stage: 'safe',
        sources: ['dc-alcohol-and-diabetes-2018', 'dc-cpg-ch11-nutrition-therapy'],
      },
      {
        chapter: 'staying-safe',
        card: 6,
        stage: 'safe',
        sources: ['dc-cpg-ch15-hyperglycemic-emergencies'],
      },
      {
        chapter: 'staying-safe',
        card: 8,
        stage: 'safe',
        sources: ['dc-stay-safe-sick-days-sheet'],
      },
      { chapter: 'staying-safe', card: 11, stage: 'safe' },
      { chapter: 'your-tools', card: 1, stage: 'tools' },
      { chapter: 'your-tools', card: 3, stage: 'tools' },
      { chapter: 'your-tools', card: 7, stage: 'tools' },
      {
        chapter: 'every-day-living',
        card: 1,
        stage: 'everyday',
        sources: ['dc-cpg-ch11-nutrition-therapy'],
      },
      { chapter: 'every-day-living', card: 3, stage: 'everyday' },
      { chapter: 'every-day-living', card: 5, stage: 'everyday' },
      {
        chapter: 'every-day-living',
        card: 7,
        stage: 'everyday',
        sources: ['dc-cpg-ch21-driving', 'dc-drive-safe-card'],
      },
      { chapter: 'every-day-living', card: 8, stage: 'everyday' },
      {
        chapter: 'every-day-living',
        card: 9,
        stage: 'everyday',
        sources: ['dc-cpg-ch30-retinopathy'],
      },
      {
        chapter: 'every-day-living',
        card: 10,
        stage: 'everyday',
        sources: ['dc-cpg-ch29-ckd-2025', 'dc-kidney-disease'],
      },
      {
        chapter: 'every-day-living',
        card: 11,
        stage: 'everyday',
        sources: ['dc-heart-disease-and-stroke'],
      },
      { chapter: 'this-might-be-you', card: 1, stage: 'season' },
      { chapter: 'this-might-be-you', card: 4, stage: 'season' },
      { chapter: 'this-might-be-you', card: 6, stage: 'season', sources: ['isc-nihb-updates'] },
    ],
  },
  {
    slug: 'gestational',
    heroImage: `${IMG}/chapter-gestational.png`,
    accent: ACCENT,
    introSources: [
      /*
       * First found in pregnancy; 3 to 20%, usually goes away; screening at 24 to
       * 28 weeks, earlier at higher risk. Many manage it with healthy eating and
       * activity, and some also need medicine, such as insulin (ruling C28;
       * H-G1 released): DC's page and Ch36's key messages.
       */
      ['dc-cpg-ch36-pregnancy', 'dc-gestational-diabetes', 'sogc-glucose-testing'],
      /* Type 2 later, for you and your child; the test 6 weeks to 6 months after the birth. */
      ['dc-gestational-diabetes', 'dc-cpg-ch36-pregnancy'],
    ],
    /* Ontario's Monitoring for Health Program, as an example; other programs. How paying works:
     * as on the Funding page, the provincial drug plan billed directly, not in Quebec (owner, A6 and B13,
     * 2026-10-06; qc-stays-outside-quebec); others pay their own way (receipts: MFHP; pharmacy or
     * vendor only: NB IPP). */
    fundingSources: [
      'dc-ontario-monitoring-for-health',
      'on-preventing-and-living-with-diabetes',
      'dc-comparisons-by-province',
      'nb-insulin-pump-program',
      'qc-stays-outside-quebec',
    ],
    /* Kept, with its heading matched to pumps and sensors; whether it belongs here is Q19. */
    pharmacist: true,
    entries: [
      { chapter: 'know-your-type', card: 4, stage: 'start' },
      { chapter: 'new-to-the-journey', card: 1, stage: 'start' },
      {
        chapter: 'new-to-the-journey',
        card: 3,
        stage: 'start',
        sources: ['dc-cpg-ch36-pregnancy'],
      },
      { chapter: 'new-to-the-journey', card: 4, stage: 'start' },
      {
        chapter: 'new-to-the-journey',
        card: 6,
        stage: 'start',
        sources: ['dc-checking-blood-sugar', 'dc-cpg-ch36-pregnancy'],
      },
      { chapter: 'new-to-the-journey', card: 7, stage: 'start' },
      { chapter: 'your-tools', card: 1, stage: 'tools' },
      { chapter: 'your-tools', card: 3, stage: 'tools' },
      /* Rows 9 to 13 are for a reader whose team has started insulin, and each says so (Q12). */
      { chapter: 'new-to-the-journey', card: 8, stage: 'tools' },
      { chapter: 'your-tools', card: 9, stage: 'tools' },
      { chapter: 'your-tools', card: 11, stage: 'tools' },
      { chapter: 'staying-safe', card: 1, stage: 'safe' },
      { chapter: 'staying-safe', card: 2, stage: 'safe' },
      {
        chapter: 'staying-safe',
        card: 6,
        stage: 'safe',
        sources: ['dc-cpg-ch15-hyperglycemic-emergencies'],
      },
      { chapter: 'staying-safe', card: 11, stage: 'safe' },
      { chapter: 'every-day-living', card: 1, stage: 'everyday' },
      { chapter: 'every-day-living', card: 2, stage: 'everyday' },
      { chapter: 'every-day-living', card: 3, stage: 'everyday' },
      {
        chapter: 'every-day-living',
        card: 4,
        stage: 'everyday',
        sources: ['dc-alcohol-and-diabetes-2018'],
      },
      { chapter: 'every-day-living', card: 5, stage: 'everyday' },
      /* The one international sentence on the paths: guidance "from the UK", named in it. */
      {
        chapter: 'know-your-type',
        card: 8,
        stage: 'season',
        sources: ['exeter-gck-pregnancy-2018'],
        international: true,
      },
      {
        chapter: 'every-day-living',
        card: 11,
        stage: 'season',
        sources: ['dc-gestational-diabetes'],
      },
    ],
  },
  {
    slug: 'prediabetes',
    heroImage: `${IMG}/chapter-prediabetes.png`,
    accent: ACCENT,
    introSources: [
      /* Higher than normal, not yet type 2; not everyone goes on to type 2, but many do. */
      ['dc-prediabetes', 'dc-cpg-ch3-classification-diagnosis'],
      /*
       * If losing weight is right for you, a 5% loss can delay or prevent type
       * 2; activity and a dietitian help (ruling C38; H-P1 released, framed as
       * conditional). What your numbers mean, and when to test again, is
       * navigation and states no fact.
       */
      ['dc-cpg-ch5-reducing-risk', 'dc-prediabetes-treatment'],
    ],
    /* Coverage differs by province and territory. No supply claim. */
    fundingSources: ['dc-comparisons-by-province'],
    /* Never on prediabetes: the band is for pump and CGM questions (Q3). */
    pharmacist: false,
    entries: [
      { chapter: 'know-your-type', card: 3, stage: 'start' },
      {
        chapter: 'know-your-type',
        card: 2,
        stage: 'start',
        sources: ['dc-cpg-ch3-classification-diagnosis'],
      },
      { chapter: 'new-to-the-journey', card: 4, stage: 'everyday' },
      {
        chapter: 'every-day-living',
        card: 1,
        stage: 'everyday',
        sources: ['dc-cpg-ch11-nutrition-therapy'],
      },
      { chapter: 'every-day-living', card: 3, stage: 'everyday' },
      /*
       * The row to This Might Be You card 6 (Ch38's check every 6 to 12 months
       * for Indigenous adults with other risk factors) is gone: that card now
       * keeps only NIHB program facts (owner answers B1 and B2, 2026-10-06).
       */
      /*
       * Your heart, the ABCDEs: heart disease may begin during prediabetes (DC's
       * patient page; Ch4 as backup), and the card is written for people with
       * diabetes, so ask which parts apply (ruling C38; H-P3 released, Q5
       * closed). The Highs card is not listed here (C28; Q2).
       */
      {
        chapter: 'every-day-living',
        card: 11,
        stage: 'season',
        sources: ['dc-prediabetes-treatment', 'dc-cpg-ch4-screening'],
      },
    ],
  },
  {
    slug: 'less-common-types',
    /* No image of its own yet: Know Your Type's (Q10). */
    heroImage: `${IMG}/chapter-journey.png`,
    accent: ACCENT,
    introSources: [
      /* Hard to classify; LADA and MODY; the pancreas, CF, iron overload, medicines; after a transplant. */
      [
        'dc-cpg-ch3-classification-diagnosis',
        'bt1d-lada',
        'dc-cpg-appendix-2-classification',
        'dc-cpg-ch20-transplantation',
      ],
      /* The right type may change your treatment. The insulin line is safety framing and states no fact. */
      ['dc-cpg-ch3-classification-diagnosis'],
    ],
    /* Ontario's pump program is for type 1; NIHB's sensor coverage needs prior approval. How
     * paying works: as on the Funding page, the provincial drug plan billed directly, not in Quebec (owner, A6 and B13,
     * 2026-10-06; qc-stays-outside-quebec); others pay their own way (receipts: MFHP; pharmacy or
     * vendor only: NB IPP). */
    fundingSources: [
      'on-diabetes-equipment-and-supplies',
      'isc-nihb-updates',
      'dc-ontario-monitoring-for-health',
      'nb-insulin-pump-program',
      'qc-stays-outside-quebec',
    ],
    pharmacist: true,
    entries: [
      { chapter: 'know-your-type', card: 6, stage: 'start' },
      /*
       * Canadian only. The record also lists `diabetes-uk-lada`, but the reason
       * does not name it, and an international source is cited only where the
       * sentence names it; `bt1d-lada` carries the whole fact.
       */
      { chapter: 'know-your-type', card: 7, stage: 'types', sources: ['bt1d-lada'] },
      { chapter: 'know-your-type', card: 8, stage: 'types' },
      {
        chapter: 'know-your-type',
        card: 9,
        stage: 'types',
        sources: ['dc-cpg-ch3-classification-diagnosis'],
      },
      /*
       * International (ISPAD) and not named in the reason: the card it opens
       * carries the international badge, which the intro points to. Flagged
       * for the nurse in the review pack.
       */
      {
        chapter: 'know-your-type',
        card: 10,
        stage: 'types',
        sources: ['ispad-2022-ch4-monogenic'],
        international: true,
      },
      { chapter: 'know-your-type', card: 11, stage: 'types' },
      {
        chapter: 'know-your-type',
        card: 12,
        stage: 'types',
        sources: ['cf-canada-cfrd-guideline-2024'],
      },
      {
        chapter: 'know-your-type',
        card: 13,
        stage: 'types',
        sources: ['dc-cpg-appendix-2-classification', 'dc-cpg-ch20-transplantation'],
      },
      {
        chapter: 'know-your-type',
        card: 1,
        stage: 'types',
        sources: ['dc-cpg-ch3-classification-diagnosis'],
      },
      { chapter: 'staying-safe', card: 2, stage: 'safe' },
      /*
       * The guideline's own scope (people on insulin and their families or
       * carers), and the site's glucagon line: someone else gives it (ruling C43).
       */
      {
        chapter: 'staying-safe',
        card: 3,
        stage: 'safe',
        sources: ['cf-canada-cfrd-guideline-2024', 'bt1d-what-is-glucagon'],
      },
      { chapter: 'staying-safe', card: 7, stage: 'safe', sources: ['bt1d-dka-and-ketones'] },
      { chapter: 'staying-safe', card: 11, stage: 'safe' },
      /* After Staying Safe on purpose, so the safety cards follow the type cards (Q9: row order). */
      { chapter: 'new-to-the-journey', card: 7, stage: 'start' },
      { chapter: 'new-to-the-journey', card: 11, stage: 'start' },
      { chapter: 'your-tools', card: 1, stage: 'tools' },
      { chapter: 'your-tools', card: 9, stage: 'tools' },
      {
        chapter: 'every-day-living',
        card: 5,
        stage: 'everyday',
        sources: ['dc-taking-care-of-mental-health'],
      },
    ],
  },
];

/* The chapter whose governance disclaimer a path page carries: every path starts there. */
export const PATH_DISCLAIMER_CHAPTER: ChapterSlug = 'know-your-type';

/* The pharmacist band's image, as on the chapters and the funding page. */
export const PATH_PHARMACIST_IMAGE = `${IMG}/care-chat-main.png`;

/*
 * The path copy kept out of the browser today, by path from the root of the
 * message tree: every path's pharmacist band while `cdeBand` is off.
 */
export function heldPathPaths(): string[] {
  return PATH_GATES.cdeBand
    ? []
    : PATH_META.filter((meta) => meta.pharmacist).map(
        (meta) => `DiabetesCare.paths.${meta.slug}.pharmacist`,
      );
}
