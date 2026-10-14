/*
 * =============================================================================
 * SLEEP APNEA CARE — THE SITE THE CHAPTER ENGINE IS DRAWING
 * =============================================================================
 * Everything the shared engine (../../_microsite) needs to know about Sleep
 * Apnea Care: its message namespace, where it lives, the keys it keeps in a
 * reader's browser (none yet), the anchors other pages link to, its
 * furniture, its schema, its own figure kinds, its chapters, symbols and
 * French review gates.
 *
 * It reaches the engine two ways and no others: the 'use client' wrapper
 * (./sa-chapter-page.tsx) hands it to SiteProvider, and the server route
 * ([slug]/page.tsx) passes it to ../../_microsite/chapters/route.ts. It is
 * never a prop from a server component. ../../_microsite/site.ts says why.
 *
 * Not live yet: the section is reachable at its URL but unlinked, out of the
 * sitemap and noindex until the owner flips SLEEP_APNEA_CARE_LIVE
 * (../launch.ts). No audio, no contact line (Liivv's sleep support service,
 * Part C, is not live), no help band (no sourced specialist directory), and
 * no care panel on any chapter (E-8).
 * =============================================================================
 */

import {
  type GovernancePerson,
  type SiteConfig,
  type SiteGates,
  SLEEP_STORAGE,
} from '../../_microsite/site';

import { SLEEP_SHOP } from './chapter-shop';
import { CHAPTER_META, type SleepLaneTopic } from './chapters-meta';
import { GLYPH_PATHS } from './glyph-paths';
import { type GateId, isFrGated, keepsFigure, showsFrDraftMarker } from './review-gates';

/*
 * Nobody is credited yet. The byline, the review line and the schema's author
 * and reviewer all stay off until a named clinician has written and reviewed
 * the copy; ../../_microsite/site.ts (SiteGovernance) has the rule.
 */
const NOBODY: GovernancePerson = {
  name: '',
  credential: '',
  registration: '',
  registryUrl: '',
};

export const SLEEP_SITE: SiteConfig = {
  ns: 'SleepApneaCare',
  basePath: '/liivv-health/sleep-apnea-care',
  rootId: 'oc-chapter',
  /* Site CSS (./sa-figures.css) is scoped under #oc-chapter[data-site='sleep-apnea-care']. */
  rootAttr: 'sleep-apnea-care',
  idPrefix: 'sa-',
  storage: SLEEP_STORAGE,
  anchors: {
    /* The site's one red-flag block (three tiers, ruling C1). */
    redFlags: { chapter: 'staying-safe', id: 'red-flags' },
    /* The six-chapter rail on the landing. */
    whereAreYou: 'where-are-you',
  },
  /* The page title's suffix is in the messages, per locale (`ui.chapter.titleSuffix`). */
  schema: {
    about: 'Sleep apnea',
    audience: 'People living with sleep apnea or using CPAP, and the people who care for them',
  },
  furniture: {
    hubDoorId: 'sleep_rest',
    /* No sourced specialist directory: the help band is off (E-9). */
    directoryHref: '',
    directoryKey: 'directory',
    pharmacistHref: '/account/virtual-care',
    helpBand: false,
  },
  /*
   * The site's own figure kinds (./site-figures.tsx), by what each does to its card.
   * Wherever a figure is dropped (a French gate on /fr), its card falls back to
   * its own sentences and note as plain lists.
   */
  kinds: {
    /*
     * Figures that carry the card's own sentences, so the plain list is not
     * repeated under them: the checklist (its sections), the trip list (its
     * items) and three that sort or lay out every item the card has: the
     * licence-class tabs (items 1-7), the follow-up timeline (items 1-5) and
     * the troubleshooting answers (items 1-10). The card note stays visible
     * under each (noteVisible), except the checklist's, which it draws.
     */
    restyle: [
      'signsChecklist',
      'tripList',
      'licenceClasses',
      'followUpTimeline',
      'troubleshootFinder',
    ],
    /* The checklist draws its card's note as its fixed "Not a diagnostic tool" banner. */
    noteCarrying: ['signsChecklist'],
    /* …and its card's three sections, so the row prints neither. */
    wholeCard: ['signsChecklist'],
    /* Controls of their own, so their cards render open with no toggle. */
    module: [
      'signsChecklist',
      'licenceClasses',
      'maskPicker',
      'troubleshootFinder',
      'resupplyPlanner',
      'tripList',
    ],
    /*
     * The mask picker's types (nasal pillows, nasal mask, full-face) are defined
     * by its card's sentences, so all of them come before it, not only the first.
     */
    listFirst: ['maskPicker'],
    fullWidth: [
      'signsChecklist',
      'licenceClasses',
      'followUpTimeline',
      'maskPicker',
      'usageExplainer',
      'troubleshootFinder',
      'resupplyPlanner',
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
    /* Liivv sells CPAP masks and supplies, so every page says so (`ui.governance.disclosure`). */
    disclosure: true,
  },
  /*
   * The topics a lane for Liivv's own service could ever answer. No Sleep
   * chapter has a service lane yet (Part C is out of tree); a future one can
   * never answer a clinical topic, whatever the meta says.
   */
  serviceLaneTopics: [
    'equipment',
    'device',
    'mask',
    'machine',
    'supplies',
    'parts',
    'paying',
  ] satisfies SleepLaneTopic[],
  /* "911" in the red-flag block, its tiers and signs, can be tapped to dial. */
  emergency: { tel: '911', written: '911' },
  audio: false,
  /* Placements are off (./chapter-shop.ts): no card places a product. */
  shop: SLEEP_SHOP,
};
