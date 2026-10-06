/*
 * =============================================================================
 * DIABETES CARE — THE SITE THE CHAPTER ENGINE IS DRAWING
 * =============================================================================
 * Everything the shared engine (../../_microsite) needs to know about Diabetes
 * Care: its message namespace, where it lives, the keys it keeps in a reader's
 * browser, the anchors other pages link to, its furniture, its schema, its own
 * figure kinds, its chapters, symbols and French review gates.
 *
 * It reaches the engine two ways and no others: the 'use client' wrapper
 * (./dc-chapter-page.tsx) hands it to SiteProvider, and the server route
 * ([slug]/page.tsx) passes it to ../../_microsite/chapters/route.ts. It is
 * never a prop from a server component, so none of it is serialised into the
 * page's payload. ../../_microsite/site.ts says why.
 *
 * Phase 1: no audio (nothing here can reach the Listen API, whose blob paths
 * are still Ostomy's). The shop is the merchandising record in
 * ./chapter-shop.ts (owner answer B21, 2026-10-06), with its one switch.
 * =============================================================================
 */

import {
  DIABETES_STORAGE,
  type GovernancePerson,
  type SiteConfig,
  type SiteGates,
} from '../../_microsite/site';

import { DIABETES_SHOP } from './chapter-shop';
import { CHAPTER_META, type DiabetesLaneTopic } from './chapters-meta';
import { GLYPH_PATHS } from './glyph-paths';
import { type GateId, isFrGated, keepsFigure, showsFrDraftMarker } from './review-gates';
import { BEP_ABOUT_HREF, BEP_ABOUT_HREF_FR, EDUCATOR_DIRECTORY_HREF } from './sources-meta';

/*
 * Nobody is credited yet. The byline, the review line and the schema's
 * author and reviewer all stay off until a named clinician has written and
 * reviewed the copy; ../../_microsite/site.ts (SiteGovernance) has the rule.
 */
const NOBODY: GovernancePerson = {
  name: '',
  credential: '',
  registration: '',
  registryUrl: '',
};

export const DIABETES_SITE: SiteConfig = {
  ns: 'DiabetesCare',
  basePath: '/liivv-health/diabetes-care',
  rootId: 'oc-chapter',
  /* Site CSS (./dc-figures.css) is scoped under #oc-chapter[data-site='diabetes-care']. */
  rootAttr: 'diabetes-care',
  idPrefix: 'dc-',
  storage: DIABETES_STORAGE,
  anchors: {
    redFlags: { chapter: 'staying-safe', id: 'red-flags' },
    /* The six-chapter rail on the landing (../landing-meta.ts). */
    whereAreYou: 'where-are-you',
  },
  /* The page title's suffix is in the messages, per locale (`ui.chapter.titleSuffix`). */
  schema: {
    about: 'Diabetes',
    audience: 'People living with diabetes, and the people who care for them',
  },
  furniture: {
    hubDoorId: 'diabetes_care_everyday',
    /*
     * The Canadian Diabetes Educator Certification Board's "Find a CDE®"
     * search, the one Canada-wide public finder for a diabetes educator,
     * registered as `cdecb-find-a-cde` in ./sources-meta.ts. It lists only the
     * educators who opted in; the owner should confirm it is the directory
     * they want here.
     */
    directoryHref: EDUCATOR_DIRECTORY_HREF,
    directoryKey: 'educator',
    /* No Canada-wide peer finder is confirmed yet, so the help band leaves that card out. */
    pharmacistHref: '/account/virtual-care',
  },
  kinds: {
    /*
     * The walk-through, the clues checklist, the family tree, and Your Tools'
     * three pickers and its restock calculator have controls, so their cards
     * render open with no toggle.
     */
    module: [
      'ruleOf15',
      'cluesChecklist',
      'familyTree',
      'meterMatch',
      'sensorPicker',
      'pumpPicker',
      'restockCalc',
    ],
    /* The Rule of 15 carries all four of the card's sentences; the checklist, every section. */
    restyle: ['ruleOf15', 'cluesChecklist'],
    /*
     * The ladder prints the card's note just above itself, where the note says
     * it is; the checklist prints it as its fixed banner, on screen and on paper.
     */
    noteCarrying: ['ketoneLadder', 'cluesChecklist'],
    /* The checklist draws the card's sections and its note itself (Know Your Type card 6). */
    wholeCard: ['cluesChecklist'],
    /* Your Tools' pickers and calculator too; its rotation map is neither a module nor full width. */
    fullWidth: [
      'ruleOf15',
      'ketoneLadder',
      'cluesChecklist',
      'familyTree',
      'meterMatch',
      'sensorPicker',
      'pumpPicker',
      'restockCalc',
    ],
  },
  chapters: CHAPTER_META,
  glyphs: GLYPH_PATHS,
  gates: {
    features: {
      shelf: 'shelf',
      laneExtras: 'laneExtras',
      bandLinks: 'bandLinks',
      doors: 'doors',
      landing: 'landing',
    } satisfies SiteGates<GateId>['features'],
    isFrGated,
    showsFrDraftMarker,
    keepsFigure,
  },
  governance: {
    author: NOBODY,
    reviewer: NOBODY,
    reviewedOn: '',
    /* Liivv sells diabetes supplies, so every chapter says so (`ui.governance.disclosure`). */
    disclosure: true,
  },
  /*
   * The CDE lane (Bayshore Express Pharmacy, Liivv's pharmacy) answers
   * questions about pumps, sensors and supplies, never a low, a high or a sick
   * day, whatever the meta says.
   */
  serviceLaneTopics: ['device', 'supplies'] satisfies DiabetesLaneTopic[],
  /*
   * The Certified Diabetes Educators at Bayshore Express Pharmacy, the Liivv
   * pharmacy in Markham, Ontario: its general line and email, never a named
   * person (owner answers A2, B5, B9, B10 and B12, 2026-10-06). The details are
   * the pharmacy's own, from its About page (`bep-about` in ./sources-meta.ts),
   * opened 2026-10-06. Every pharmacist panel shows these in place of "Request
   * a call", which stays held until a booking page can take the request
   * (`cdeRequestReason` in ../landing-meta.ts; B6).
   */
  contact: {
    tel: '+18445611254',
    email: 'BayshoreExpress@bayshore.ca',
    aboutHref: BEP_ABOUT_HREF,
    aboutHrefFr: BEP_ABOUT_HREF_FR,
  },
  /*
   * "Call 911" in each chapter's red-flag block can be tapped to dial, as the
   * landing's and New to the Journey's 911 lines can (full-site review,
   * 2026-10-06). Written 911, as the crisis strips write it.
   */
  emergency: { tel: '911', written: '911' },
  audio: false,
  /*
   * Which card shows which products, with the one switch (SHOP_SWITCH.placements) that
   * turns every placement off: ./chapter-shop.ts (owner answer B21).
   */
  shop: DIABETES_SHOP,
};
