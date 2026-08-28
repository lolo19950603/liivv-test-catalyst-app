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

/*
 * A source backing a factual claim.
 *
 * The label is the document’s own title and never goes through the message
 * tree, because a translation pass would otherwise rename a published
 * document — the journal Inflammatory Bowel Diseases came back as "Maladies
 * inflammatoires de l’intestin", which is not a thing a reader can find.
 * Same rule as programName in funding-meta.ts.
 */
export interface CitationMeta {
  /** The title as its publisher prints it. Never translated. */
  label: string;
  /**
   * Official French title, only where the publisher actually publishes one.
   * Leave undefined and the English title shows in both locales, which is
   * honest: that is the language of the page the link opens.
   */
  labelFr?: string;
  href: string;
  /** Official French URL, only where the publisher maintains a separate one. */
  hrefFr?: string;
}

/*
 * Per-category structure. Index-matched to the numbered keys under
 * `categories` in the message tree.
 */
export interface CategoryMeta {
  image: string;
  /**
   * Which cluster this card belongs to, as a key into `ui.chapter.groups`.
   * A key rather than a label so a translation cannot split one group into
   * two by rendering its name inconsistently in different cards.
   */
  group?: string;
  /**
   * Who this card sends you to. Drives the ask chip. The label is
   * translated from `ui.chapter.ask.<role>`; the role itself is structural,
   * so a translation cannot change who a reader is told to consult.
   */
  ask?: 'nswoc' | 'team' | 'pharmacist' | 'dietitian' | 'gi' | 'peer' | 'assessment' | 'urgent';
  /**
   * Products shown beneath this card. Empty on any card where the copy
   * argues against buying something — see the blocklist in the generator
   * comment. Commerce sits in its own labelled band, never inside the
   * clinical list.
   */
  products?: number[];
}

export interface ChapterMeta {
  slug: string;
  num: string;
  chapterWord: string;
  heroImage: string;
  accent: string;
  /** One per numbered category in the message tree, in the same order. */
  categories: CategoryMeta[];
  pharmacistImage: string;
  pharmacistHref: string;
  /** One inner array per resource group, in message order. */
  resourceLinks: string[][];
  citations: CitationMeta[];
}

export const CHAPTER_META: ChapterMeta[] = [
  {
    slug: 'new-to-the-journey',
    num: '01',
    chapterWord: 'one',
    heroImage: `${IMG}/chapter-new.png`,
    accent: '#a89c94',
    categories: [
      {
        image: `${IMG}/chapter-new.png`,
        group: 'beforeSurgery',
        ask: 'peer',
      },
      {
        image: `${IMG}/care-chat-desk.png`,
        group: 'beforeSurgery',
        ask: 'nswoc',
      },
      {
        image: `${IMG}/care-chat-main.png`,
        group: 'beforeSurgery',
        ask: 'team',
      },
      {
        image: `${IMG}/door-shop.png`,
        group: 'beforeSurgery',
      },
      {
        image: `${IMG}/care-chat-moment.png`,
        group: 'beforeSurgery',
        ask: 'peer',
      },
      {
        image: `${IMG}/chapter-new.png`,
        group: 'afterSurgery',
        ask: 'nswoc',
      },
      {
        image: `${IMG}/door-care.png`,
        group: 'afterSurgery',
        ask: 'nswoc',
      },
      {
        image: `${IMG}/door-shop.png`,
        group: 'afterSurgery',
        products: [8041, 8048],
      },
      {
        image: `${IMG}/door-care.png`,
        group: 'afterSurgery',
        products: [8046],
      },
      {
        image: `${IMG}/care-chat-main.png`,
        group: 'afterSurgery',
        ask: 'nswoc',
      },
      {
        image: `${IMG}/door-chapters.png`,
        group: 'afterSurgery',
      },
    ],
    pharmacistImage: `${IMG}/care-chat-main.png`,
    pharmacistHref: PHARMACIST_HREF,
    resourceLinks: [],
    citations: [
      {
        label: 'NSWOCC — Find an NSWOC',
        href: 'https://www.nswoc.ca/',
      },
      {
        label: 'NSWOCC — free patient guides (English and French)',
        href: 'https://www.nswoc.ca/guides',
      },
      {
        label: 'RNAO — Getting ready for ostomy surgery (patient fact sheet)',
        href: 'https://rnao.ca/bpg/guidelines/fact-sheets/getting-ready-ostomy-surgery-fact-sheet-adults',
      },
    ],
  },
  {
    slug: 'get-to-know-your-stoma',
    num: '02',
    chapterWord: 'two',
    heroImage: `${IMG}/chapter-stoma.png`,
    accent: '#f3c7be',
    categories: [
      {
        image: `${IMG}/chapter-stoma.png`,
        group: 'startHere',
        ask: 'nswoc',
      },
      {
        image: `${IMG}/door-chapters.png`,
        group: 'startHere',
        ask: 'team',
      },
      {
        image: `${IMG}/care-chat-desk.png`,
        group: 'startHere',
      },
      {
        image: `${IMG}/door-shop.png`,
        group: 'theBasics',
        ask: 'nswoc',
        products: [4441, 4691, 4583],
      },
      {
        image: `${IMG}/door-care.png`,
        group: 'theBasics',
        ask: 'nswoc',
        products: [4610, 4531, 4890],
      },
      {
        image: `${IMG}/door-chapters.png`,
        group: 'theBasics',
        ask: 'nswoc',
      },
      {
        image: `${IMG}/care-chat-desk.png`,
        group: 'theBasics',
        ask: 'nswoc',
      },
      {
        image: `${IMG}/care-chat-moment.png`,
        group: 'theBasics',
        ask: 'nswoc',
      },
      {
        image: `${IMG}/care-chat-desk.png`,
        group: 'theBasics',
        ask: 'nswoc',
      },
      {
        image: `${IMG}/door-shop.png`,
        group: 'choosingASystem',
        ask: 'nswoc',
        products: [4441, 4891, 4361],
      },
      {
        image: `${IMG}/door-care.png`,
        group: 'choosingASystem',
        ask: 'assessment',
      },
      {
        image: `${IMG}/door-chapters.png`,
        group: 'accessories',
        ask: 'nswoc',
        products: [4560, 4703, 4598, 4610],
      },
      {
        image: `${IMG}/care-chat-main.png`,
        group: 'accessories',
        ask: 'nswoc',
      },
      {
        image: `${IMG}/care-chat-moment.png`,
        group: 'keepChecking',
        ask: 'nswoc',
      },
      {
        image: `${IMG}/door-care.png`,
        group: 'whenSomethingIsNotRight',
        ask: 'nswoc',
      },
      {
        image: `${IMG}/door-chapters.png`,
        group: 'whenSomethingIsNotRight',
        ask: 'nswoc',
      },
      {
        image: `${IMG}/door-shop.png`,
        group: 'whenSomethingIsNotRight',
        ask: 'nswoc',
        products: [4571, 4630],
      },
      {
        image: `${IMG}/care-chat-desk.png`,
        group: 'whenSomethingIsNotRight',
        ask: 'nswoc',
      },
      {
        image: `${IMG}/care-chat-moment.png`,
        group: 'whenSomethingIsNotRight',
        ask: 'team',
      },
      {
        image: `${IMG}/door-care.png`,
        group: 'whenSomethingIsNotRight',
        ask: 'nswoc',
      },
      {
        image: `${IMG}/chapter-everyday.png`,
        group: 'bodyAndLife',
        ask: 'peer',
      },
      {
        image: `${IMG}/door-shop.png`,
        group: 'bodyAndLife',
        products: [8046],
      },
      {
        image: `${IMG}/door-chapters.png`,
        group: 'bodyAndLife',
        ask: 'peer',
      },
      {
        image: `${IMG}/care-chat-moment.png`,
        group: 'bodyAndLife',
      },
      {
        image: `${IMG}/door-care.png`,
        group: 'bodyAndLife',
        ask: 'nswoc',
      },
      {
        image: `${IMG}/chapter-everyday.png`,
        group: 'bodyAndLife',
        ask: 'team',
        products: [4226, 4647],
      },
    ],
    pharmacistImage: `${IMG}/care-chat-main.png`,
    pharmacistHref: PHARMACIST_HREF,
    resourceLinks: [],
    citations: [
      {
        label: 'NSWOCC — free patient guides by ostomy type',
        href: 'https://www.nswoc.ca/guides',
      },
      {
        label: 'Wounds Canada — Caring for a Person with an Ostomy',
        href: 'https://www.woundscanada.ca/',
      },
      {
        label: 'RNAO — Supporting Adults Who Anticipate or Live with an Ostomy, 2nd ed. (2019)',
        href: 'https://rnao.ca/bpg/guidelines/ostomy',
      },
      {
        label: 'Ostomy Canada Society — finding an NSWOC and local support',
        href: 'https://www.ostomycanada.ca/',
      },
    ],
  },
  {
    slug: 'everyday-liivving',
    num: '03',
    chapterWord: 'three',
    heroImage: `${IMG}/chapter-everyday.png`,
    accent: '#8ea78b',
    categories: [
      {
        image: `${IMG}/chapter-everyday.png`,
        group: 'startHere',
        ask: 'peer',
      },
      {
        image: `${IMG}/chapter-stoma.png`,
        group: 'eatingAgain',
        ask: 'team',
      },
      {
        image: `${IMG}/door-care.png`,
        group: 'eatingAgain',
        ask: 'dietitian',
      },
      {
        image: `${IMG}/door-shop.png`,
        group: 'eatingAgain',
        ask: 'dietitian',
      },
      {
        image: `${IMG}/door-chapters.png`,
        group: 'eatingAgain',
        ask: 'dietitian',
      },
      {
        image: `${IMG}/care-chat-desk.png`,
        group: 'eatingAgain',
        ask: 'nswoc',
      },
      {
        image: `${IMG}/care-chat-moment.png`,
        group: 'everydayEffects',
        ask: 'nswoc',
      },
      {
        image: `${IMG}/chapter-everyday.png`,
        group: 'everydayEffects',
        ask: 'dietitian',
      },
      {
        image: `${IMG}/care-chat-main.png`,
        group: 'everydayEffects',
        ask: 'pharmacist',
      },
      {
        image: `${IMG}/door-shop.png`,
        group: 'gettingAroundCanada',
      },
      {
        image: `${IMG}/door-care.png`,
        group: 'gettingAroundCanada',
        ask: 'nswoc',
      },
      {
        image: `${IMG}/chapter-everyday.png`,
        group: 'gettingAroundCanada',
        products: [8046],
      },
      {
        image: `${IMG}/care-chat-desk.png`,
        group: 'practicalCanada',
      },
      {
        image: `${IMG}/door-chapters.png`,
        group: 'practicalCanada',
      },
      {
        image: `${IMG}/door-care.png`,
        group: 'money',
      },
      {
        image: `${IMG}/door-shop.png`,
        group: 'money',
      },
      {
        image: `${IMG}/door-chapters.png`,
        group: 'community',
      },
      {
        image: `${IMG}/care-chat-moment.png`,
        group: 'community',
        ask: 'peer',
      },
    ],
    pharmacistImage: `${IMG}/care-chat-main.png`,
    pharmacistHref: PHARMACIST_HREF,
    resourceLinks: [
      [
        'https://www.ostomycanada.ca/find-a-chapter-peer-support-group/',
        'https://www.ostomycanada.ca/ostomy-canada-visitor-program/',
        'https://www.nswoc.ca/',
        'https://www.ostomycanada.ca/camp/ostomy-canada-youth-camp/',
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
    citations: [
      {
        label: 'Ostomy Canada Society — Ontario ADP grant and why $975 a year is not enough',
        href: 'https://www.ostomycanada.ca/blog/2025/ontario-adp-grant-why-975-a-year-isnt-enough/',
      },
      {
        label: 'Canada Revenue Agency — Disability Tax Credit, eliminating category',
        href: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/segments/tax-credits-deductions-persons-disabilities/disability-tax-credit/eligible-dtc/eliminating.html',
      },
      {
        label: 'United Ostomy Associations of America — World Ostomy Day',
        href: 'https://www.ostomy.org/world-ostomy-day/',
      },
      {
        label: 'United Ostomy Associations of America — eating well after ostomy surgery',
        href: 'https://www.ostomy.org/practical-guidance-for-eating-well-after-ostomy-surgery/',
      },
      {
        label: 'RNAO — Supporting Adults Who Anticipate or Live with an Ostomy, 2nd ed. (2019)',
        href: 'https://rnao.ca/bpg/guidelines/ostomy',
      },
    ],
  },
  {
    slug: 'this-might-be-you',
    num: '04',
    chapterWord: 'four',
    heroImage: `${IMG}/care-chat-moment.png`,
    accent: '#9a7f9e',
    categories: [
      {
        image: `${IMG}/chapter-new.png`,
        group: 'growingUp',
        ask: 'team',
      },
      {
        image: `${IMG}/door-chapters.png`,
        group: 'growingUp',
        ask: 'peer',
      },
      {
        image: `${IMG}/chapter-everyday.png`,
        group: 'bodiesThatChange',
        ask: 'gi',
      },
      {
        image: `${IMG}/care-chat-desk.png`,
        group: 'bodiesThatChange',
        ask: 'nswoc',
        products: [4264, 4511],
      },
      {
        image: `${IMG}/care-chat-main.png`,
        group: 'thePeopleAroundIt',
        ask: 'nswoc',
      },
      {
        image: `${IMG}/care-chat-desk.png`,
        group: 'thePeopleAroundIt',
        ask: 'urgent',
      },
    ],
    pharmacistImage: `${IMG}/care-chat-main.png`,
    pharmacistHref: PHARMACIST_HREF,
    resourceLinks: [],
    citations: [
      {
        label: 'RNAO — Supporting Adults Who Anticipate or Live with an Ostomy, 2nd ed. (2019)',
        href: 'https://rnao.ca/bpg/guidelines/ostomy',
      },
      {
        label: 'NSWOCC — guides to living with an ostomy',
        href: 'https://www.nswoc.ca/guides',
      },
      {
        label: 'WOCN Society — Pediatric Ostomy Care: Best Practice for Clinicians',
        href: 'https://cdn.ymaws.com/member.wocn.org/resource/resmgr/document_library/PEDIATRIC_OSTOMY_CARE-_BEST_.pdf',
      },
      {
        label:
          'Acta Paediatrica — nutritional management of high-output ileostomies in paediatric patients',
        href: 'https://doi.org/10.1111/apa.17163',
      },
      {
        label:
          'ECCO — guidelines on sexuality, fertility, pregnancy and lactation in inflammatory bowel disease',
        href: 'https://doi.org/10.1093/ecco-jcc/jjac115',
      },
      {
        label:
          'Journal of the Canadian Association of Gastroenterology — IBD management in pregnancy',
        href: 'https://doi.org/10.1093/jcag/gwad056',
      },
      {
        label: 'Inflammatory Bowel Diseases — pregnancy with a stoma',
        href: 'https://doi.org/10.1093/ibd/izae301',
      },
      {
        label: 'Crohn’s and Colitis Canada — fertility and pregnancy in IBD',
        href: 'https://crohnsandcolitis.ca/About-Crohn-s-Colitis/IBD-Journey/Fertility-and-Pregnancy-in-IBD/Giving-Birth',
      },
      {
        label: 'Ostomy Canada Society — Youth Camp',
        href: 'https://www.ostomycanada.ca/camp/ostomy-canada-youth-camp/',
      },
      {
        label: 'Ostomy Canada Society — the Visitor Program',
        href: 'https://www.ostomycanada.ca/ostomy-canada-visitor-program/',
      },
      {
        label: 'Ostomy Canada Society — find a chapter or peer support group',
        href: 'https://www.ostomycanada.ca/find-a-chapter-peer-support-group/',
      },
      {
        label: '9-8-8 — Canada’s Suicide Crisis Helpline',
        labelFr: '9-8-8 — Ligne d’aide en cas de crise de suicide',
        href: 'https://988.ca/',
        hrefFr: 'https://988.ca/fr',
      },
    ],
  },
];
