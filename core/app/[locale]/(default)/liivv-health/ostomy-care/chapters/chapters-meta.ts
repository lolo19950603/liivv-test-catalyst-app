/*
 * =============================================================================
 * OSTOMY CARE CHAPTERS — STRUCTURE
 * =============================================================================
 * Prose lives in messages/*.json under OstomyCare.chapters, so it can be
 * translated by scripts/fill-fr-messages.mjs like the rest of the Liivv copy.
 * This file holds only what is not language-dependent: slugs, image paths,
 * accents, and the outward URLs.
 *
 * Lists here are index-matched to the numbered keys in the message tree.
 * buildChapters() checks the lengths line up and fails loudly if they drift.
 * =============================================================================
 */

const IMG = '/archive/ostomy-care';
const PHARMACIST_HREF = '/account/virtual-care';

export interface ChapterMeta {
  slug: string;
  num: string;
  chapterWord: string;
  heroImage: string;
  accent: string;
  categoryImages: string[];
  pharmacistImage: string;
  pharmacistHref: string;
  /** One inner array per resource group, in message order. */
  resourceLinks: string[][];
  citationHrefs: string[];
}

export const CHAPTER_META: ChapterMeta[] = [
  {
    slug: 'new-to-the-journey',
    num: '01',
    chapterWord: 'one',
    heroImage: `${IMG}/chapter-new.png`,
    accent: '#a89c94',
    categoryImages: [
      `${IMG}/chapter-new.png`,
      `${IMG}/care-chat-desk.png`,
      `${IMG}/care-chat-main.png`,
      `${IMG}/door-shop.png`,
      `${IMG}/care-chat-moment.png`,
      `${IMG}/chapter-new.png`,
      `${IMG}/door-care.png`,
      `${IMG}/door-shop.png`,
      `${IMG}/door-care.png`,
      `${IMG}/care-chat-main.png`,
      `${IMG}/door-chapters.png`,
    ],
    pharmacistImage: `${IMG}/care-chat-main.png`,
    pharmacistHref: PHARMACIST_HREF,
    resourceLinks: [],
    citationHrefs: [
      'https://www.nswoc.ca/',
      'https://www.nswoc.ca/guides',
      'https://rnao.ca/bpg/guidelines/fact-sheets/getting-ready-ostomy-surgery-fact-sheet-adults',
    ],
  },
  {
    slug: 'get-to-know-your-stoma',
    num: '02',
    chapterWord: 'two',
    heroImage: `${IMG}/chapter-stoma.png`,
    accent: '#f3c7be',
    categoryImages: [
      `${IMG}/chapter-stoma.png`,
      `${IMG}/door-chapters.png`,
      `${IMG}/care-chat-desk.png`,
      `${IMG}/door-shop.png`,
      `${IMG}/door-care.png`,
      `${IMG}/door-chapters.png`,
      `${IMG}/care-chat-desk.png`,
      `${IMG}/care-chat-moment.png`,
      `${IMG}/door-care.png`,
      `${IMG}/door-chapters.png`,
      `${IMG}/door-shop.png`,
      `${IMG}/care-chat-desk.png`,
      `${IMG}/care-chat-moment.png`,
      `${IMG}/door-care.png`,
      `${IMG}/chapter-everyday.png`,
      `${IMG}/door-shop.png`,
      `${IMG}/door-chapters.png`,
      `${IMG}/care-chat-moment.png`,
      `${IMG}/door-care.png`,
      `${IMG}/chapter-everyday.png`,
    ],
    pharmacistImage: `${IMG}/care-chat-main.png`,
    pharmacistHref: PHARMACIST_HREF,
    resourceLinks: [],
    citationHrefs: [
      'https://rnao.ca/bpg/guidelines/ostomy',
      'https://www.nswoc.ca/guides',
      'https://www.woundscanada.ca/',
    ],
  },
  {
    slug: 'food-and-digestion',
    num: '03',
    chapterWord: 'three',
    heroImage: `${IMG}/door-care.png`,
    accent: '#b08968',
    categoryImages: [
      `${IMG}/chapter-stoma.png`,
      `${IMG}/door-care.png`,
      `${IMG}/door-shop.png`,
      `${IMG}/door-chapters.png`,
      `${IMG}/care-chat-desk.png`,
      `${IMG}/care-chat-moment.png`,
      `${IMG}/chapter-everyday.png`,
      `${IMG}/care-chat-main.png`,
    ],
    pharmacistImage: `${IMG}/care-chat-main.png`,
    pharmacistHref: PHARMACIST_HREF,
    resourceLinks: [],
    citationHrefs: [
      'https://www.nswoc.ca/guides',
      'https://www.ostomy.org/practical-guidance-for-eating-well-after-ostomy-surgery/',
      'https://rnao.ca/bpg/guidelines/ostomy',
    ],
  },
  {
    slug: 'everyday-liivving',
    num: '04',
    chapterWord: 'four',
    heroImage: `${IMG}/chapter-everyday.png`,
    accent: '#8ea78b',
    categoryImages: [
      `${IMG}/chapter-everyday.png`,
      `${IMG}/door-care.png`,
      `${IMG}/door-shop.png`,
      `${IMG}/door-chapters.png`,
      `${IMG}/care-chat-moment.png`,
    ],
    pharmacistImage: `${IMG}/care-chat-main.png`,
    pharmacistHref: PHARMACIST_HREF,
    resourceLinks: [
      [
        'https://www.ostomycanada.ca/find-a-chapter-peer-support-group/',
        'https://www.ostomycanada.ca/ostomy-canada-visitor-program/',
        'https://www.nswoc.ca/',
        'https://www.ostomycanada.ca/youth-camp/',
      ],
      [
        'https://www.hollister.ca/en-ca/securestartconsumer',
        'https://www.coloplast.ca/care-/',
        'https://www.convatec.com/en-ca/ostomy-care/me-plus-patient-support/',
      ],
      [
        'https://www.ostomycanada.ca/provincial-government-programs/',
        'https://www.canada.ca/en/revenue-agency/services/tax/individuals/segments/tax-credits-deductions-persons-disabilities/disability-tax-credit/eligible-dtc/eliminating.html',
        'https://www.sac-isc.gc.ca/eng/1579620079031/1579620259238',
      ],
      [
        'https://www.nswoc.ca/guides',
        'https://www.ostomy.org/new-ostomy-patient-guide/',
        'https://www.ostomycanada.ca/events/world-ostomy-day/',
      ],
    ],
    citationHrefs: [
      'https://www.ostomycanada.ca/provincial-government-programs/',
      'https://www.ostomycanada.ca/blog/2025/ontario-adp-grant-why-975-a-year-isnt-enough/',
      'https://www.canada.ca/en/revenue-agency/services/tax/individuals/segments/tax-credits-deductions-persons-disabilities/disability-tax-credit/eligible-dtc/eliminating.html',
      'https://www.ostomy.org/world-ostomy-day/',
    ],
  },
];
