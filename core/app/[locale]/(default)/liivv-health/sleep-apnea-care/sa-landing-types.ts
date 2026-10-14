/*
 * =============================================================================
 * SLEEP APNEA CARE LANDING — WHAT THE ROUTE HANDS THE PAGE
 * =============================================================================
 * The landing page is a client component (./sa-landing-page.tsx), so everything
 * it is given crosses from the server as data: built in ./page.tsx from
 * ./landing-meta.ts, the register, the chapters and the catalogue, with the
 * situation doors as a server slot. Plain serialisable data only — no
 * functions, no gates: whatever a gate decides has been decided on the server.
 *
 * Sleep's own shape, not the engine's LandingSetup: the engine's landing is
 * Diabetes-shaped (kits, subscriptions, a CDE panel), and Sleep has none of
 * those (spec 3.9.2).
 * =============================================================================
 */

import type {
  LandingChapterCard,
  LandingCitation,
  LandingFaq,
  LandingItem,
  LandingSourced,
} from '../_microsite/landing/types';

/* One product on the shelf preview. */
export interface SaLandingItem extends LandingItem {
  /* A complete mask (C26): the tile links its product page, never an add button. */
  rxMask?: true;
  /* Named in a Health Canada magnet notice (N7). */
  magnetNotice?: true;
}

/* A "Which therapy?" chip: its key into `therapies.chips` / `.hints`, where it goes, and its hint's sources. */
export interface SaTherapyChip {
  id: string;
  href: string;
  sources: LandingCitation[];
}

export interface SaLandingSetup {
  rootId: 'sleep-apnea-care';
  classPrefix: 'sa-';
  images: { hero: string; care: string; closing: string };
  /* The full shop (the CPAP category page), and the shelf section's id. */
  shopHref: string;
  shopAnchor: 'shop-sleep-apnea-care';
  /* Keys into `trust.items`, in order, with the gated ones already left out. */
  trustKeys: string[];
  /* `hero.body`'s "Your prescriber sets your treatment". */
  heroSources: LandingCitation[];
  /* Chips whose target is live, in order. */
  chips: SaTherapyChip[];
  therapiesSources: LandingCitation[];
  facts: LandingSourced[];
  chapters: LandingChapterCard[];
  /* Keys into `shop.rooms`, in order, 'all' included. */
  shopRooms: string[];
  products: SaLandingItem[];
  shop: {
    /* `shop.body`'s {rxMaskLine} and the prescription badge, while the C26 check is live. */
    rxMaskLine: boolean;
    /* The returns line and its link, once the policy page exists; null until then. */
    returnsHref: string | null;
    /* "Read the warning": Driving & Staying Safe card 6, in the page locale. */
    magnetHref: string;
    settingsSources: LandingCitation[];
    magnetSources: LandingCitation[];
  };
  /* The care band's "your sleep team" panel. */
  careSources: LandingCitation[];
  /*
   * Questions in order, the gated ones left out. `values` names the ICU values
   * of the answer whose switch is on (each a message key under the question);
   * any other value in the answer is left empty.
   */
  faqs: Array<LandingFaq & { values: string[] }>;
  /* Every source the rendered page names, once each, for the governance block. */
  pageSources: LandingCitation[];
  /* Whether the landing's French shows the draft marker (previews only). */
  frDraft: boolean;
}
