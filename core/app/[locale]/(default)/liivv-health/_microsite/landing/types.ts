/*
 * =============================================================================
 * MICROSITE LANDING — WHAT A SITE HANDS ITS LANDING PAGE
 * =============================================================================
 * The landing page is a client component (./landing-page.tsx), so everything it
 * is given crosses from the server as data. A site's own route (its page.tsx)
 * builds a LandingSetup from its landing-meta.ts, its source register, its
 * chapters and its catalogue, and hands it over with the doors as a server
 * slot. Nothing here names a site: the words are the site's own
 * `ui.landingPage` messages, read on the client through the SiteProvider.
 *
 * Plain serialisable data only — no functions, no gates — because all of it
 * is written into the page's payload. Whatever a gate decides has been decided
 * on the server by the time it gets here.
 * =============================================================================
 */

import type { Citation } from '../chapters/compose';

/* One product or curated kit on the shelf preview. */
export interface LandingItem {
  entityId: number;
  name: string;
  path: string;
  image?: { src: string; alt: string };
  priceLabel?: string;
  isKit: boolean;
  /* The shop room the site filed it in, a key into `shop.rooms`. Kits have none. */
  room?: string;
  /* Shows the site's `shop.reviewNotice`: an item a pharmacist reviews before it ships. */
  reviewNotice?: boolean;
}

/*
 * A maker on the brand row: its name, and a logo file the site has permission
 * to show. Without one the name shows as text. The name is the logo's alt
 * text. Not copy, and never translated.
 */
export interface LandingBrand {
  name: string;
  logo?: string;
}

/* A published source, in the page locale. */
export interface LandingCitation extends Citation {
  hrefLang: 'en' | 'fr';
}

/* One card on the chapter rail. `word` is the chapter number already in the page language. */
export interface LandingChapterCard {
  slug: string;
  num: string;
  word: string;
  title: string;
  blurb: string;
  href: string;
  image: string;
}

/* A "which type?" chip: its key into `types.chips` (and `types.hints`), and where it goes. */
export interface LandingChip {
  id: string;
  href: string;
}

/* A numbered item that rests on sources: a fact in the fact band, or a question. */
export interface LandingSourced {
  /* The numbered message key. */
  key: string;
  sources: LandingCitation[];
}

/*
 * A question. `links` are the hrefs of the `<link>…</link>` phrases in its
 * answer, in order; null renders that phrase as plain text.
 */
export interface LandingFaq extends LandingSourced {
  links: Array<string | null>;
}

export interface LandingSetup {
  /* The page root's id, which the site's landing stylesheet is scoped under. */
  rootId: string;
  /* The prefix of every class the page renders, matching that stylesheet. */
  classPrefix: string;
  images: { heroPoster: string; heroVideo: string; care: string; closing: string };
  /* The full shop, and the shelf section's id, which other pages link to. */
  shopHref: string;
  shopAnchor: string;
  /* The pharmacist chat panel's link. */
  chatHref: string;
  /* The pharmacist CDE's request link; null until it can take the request. */
  cdeRequestHref: string | null;
  subscribeDemoPath: string;
  /* Keys into `trust.items`, in order, with the gated ones already left out. */
  trustKeys: string[];
  chips: LandingChip[];
  /* Sources of the type chips' intro (`types.body`). */
  typesSources: LandingCitation[];
  facts: LandingSourced[];
  chapters: LandingChapterCard[];
  /* Keys into `shop.rooms`, in order, 'all' and 'kits' included. */
  shopRooms: string[];
  products: LandingItem[];
  /* Listed curated kits only; none means every kit surface stays off. */
  kits: LandingItem[];
  featuredKitId: number | null;
  /* The brand row, in order. */
  brands: readonly LandingBrand[];
  /* Questions in order, with the gated ones already left out. */
  faqs: LandingFaq[];
  /* Every source the rendered page names, once each, for the governance block. */
  pageSources: LandingCitation[];
  /* Whether the landing's French shows the draft marker (previews only). */
  frDraft: boolean;
}
