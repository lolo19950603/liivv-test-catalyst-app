/*
 * =============================================================================
 * OSTOMY CARE CHAPTERS — CONTENT MAP
 * =============================================================================
 * Layout: ./chapter-page.tsx (search "SECTION N —" there)
 * =============================================================================
 */

const IMG = '/archive/ostomy-care';
const LANDING = '/liivv-health/ostomy-care';
const PHARMACIST_HREF = '/account/virtual-care';
const SHOP_HREF = '/liivv-health/ostomy-care/shop-ostomy-care';

export interface CategorySection {
  heading: string;
  items: string[];
  note?: string;
}

export interface CategoryCard {
  title: string;
  image: string;
  items?: string[];
  sections?: CategorySection[];
  note?: string;
  group?: string;
  badge?: string;
}

/**
 * An outside resource we point at. We link; we never reproduce.
 * `org` is required so attribution is structural, not something a writer can forget.
 */
export interface ResourceLink {
  title: string;
  org: string;
  body: string;
  href: string;
  /** Small qualifier, e.g. 'English and French' or 'Free PDF'. */
  note?: string;
}

export interface ResourceGroup {
  eyebrow: string;
  heading: string;
  body?: string;
  links: ResourceLink[];
}

/** A source backing a factual claim made in this chapter. */
export interface Citation {
  label: string;
  href: string;
}

/**
 * Red-flag callout for anything symptom-adjacent. Deliberately separate from
 * `note` copy so it can never be styled as an ordinary tip.
 */
export interface UrgentCallout {
  heading: string;
  intro: string;
  signs: string[];
  action: string;
}

/**
 * Clinical governance. Rendered on every chapter.
 *
 * `reviewedBy` and `reviewedOn` are intentionally allowed to be empty, and the
 * byline is omitted entirely when they are — an unreviewed chapter must never
 * display a reviewer it does not have.
 */
export interface Governance {
  reviewedBy: string;
  credential: string;
  /** ISO date (YYYY-MM-DD). */
  reviewedOn: string;
  disclaimer: string;
}

/** Fill these in once, before publishing. Empty values suppress the byline. */
export const CLINICAL_REVIEWER = {
  reviewedBy: '',
  credential: 'RN, NSWOC',
} as const;

export const GENERAL_INFO_DISCLAIMER =
  'This is general information, not medical advice, and it is not a substitute for assessment by your NSWOC, surgeon, or physician. Fit, skin, and product choices depend on your body and your surgery — talk to your care team before changing anything.';

export interface Chapter {
  slug: string;
  num: string;
  chapterWord: string;
  title: string;
  heroBody: string;
  focus: string;
  vibe: string;
  heroImage: string;
  accent: string;
  categoriesIntro: { eyebrow: string; heading: string; body: string };
  categories: CategoryCard[];
  programsBand?: { heading?: string; cards: Array<{ heading: string; body: string }> };
  /** Outward links — support orgs, funding, programs. Rendered after the categories. */
  resources?: ResourceGroup[];
  /** Shown high on the page, before anyone scrolls into symptom content. */
  urgent?: UrgentCallout;
  citations?: Citation[];
  governance: Governance;
  pharmacist: {
    eyebrow: string;
    heading: string;
    body: string;
    cta: string;
    href: string;
    image: string;
  };
  closing: { heading: string; body: string };
  nextLabel: string;
}

export const CHAPTERS: Chapter[] = [
  {
    slug: 'new-to-the-journey',
    num: '01',
    chapterWord: 'one',
    title: 'New to the Journey',
    heroBody:
      'Just starting out and learning the ropes — calm checklists, first supplies, and who to ask.',
    focus:
      'First weeks after surgery, change routines, starter supplies, who to ask, and soft next steps into everyday living.',
    vibe: 'Supportive and demystifying — a soft place to land.',
    heroImage: `${IMG}/chapter-new.png`,
    accent: '#a89c94',
    categoriesIntro: {
      eyebrow: 'First chapters',
      heading: 'You are not supposed to know everything yet',
      body: 'Most people find pouch changes become familiar within weeks. Start with a short checklist and one trusted contact.',
    },
    categories: [
      {
        title: 'First Week Basics',
        image: `${IMG}/chapter-new.png`,
        items: [
          'Fatigue is normal — rest is part of recovery',
          'Your care team will send you home with a starter setup; learning takes practice, not perfection',
          'Many people feel more confident within four to eight weeks',
        ],
      },
      {
        title: 'Change Routine Starters',
        image: `${IMG}/door-care.png`,
        items: [
          'Gather supplies first: new system, measuring guide, scissors if needed, warm water, soft cloth, disposal bag',
          'Remove gently — never rip; wet a cloth to help release adhesive if needed',
          'Clean, dry, measure, apply, and hold the barrier so body heat activates the seal',
        ],
      },
      {
        title: 'Starter Supply Lists',
        image: `${IMG}/door-shop.png`,
        items: [
          'Pouches and barriers that match your system (one-piece or two-piece)',
          'Skin protectant wipe, powder if recommended, disposal bags',
          'A go-bag for outings from day one',
        ],
        note: 'Try The Fresh Start kit — customize quantities before checkout.',
      },
      {
        title: 'Go-Bags & Backup',
        image: `${IMG}/door-care.png`,
        items: [
          'Spare barrier and pouch, soft wipes, disposal bags',
          'Adhesive remover and skin protectant if you use them',
          'A spare underwear or liner for peace of mind away from home',
        ],
        note: 'Explore curated go-bag kits in Shop Ostomy Essentials.',
      },
      {
        title: 'Who to Ask',
        image: `${IMG}/care-chat-main.png`,
        items: [
          'WOC / NSWOC nurse — fit, skin, and clinical troubleshooting',
          'Surgeon or clinic — recovery and medical concerns',
          'Ontario pharmacist chat — everyday product and restock questions during business hours',
        ],
      },
      {
        title: 'Soft Next Steps',
        image: `${IMG}/door-chapters.png`,
        items: [
          'Reintroduce foods gradually; chew thoroughly; notice patterns',
          'Light walking often comes first; return to activity as cleared by your care team',
          'Open Everyday Liivving when you are ready to find a peer group or work out what your province covers',
        ],
      },
    ],
    programsBand: {
      heading: 'A gentle first-month map',
      cards: [
        {
          heading: 'Weeks 1–2',
          body: 'Focus on healing, hydration, and one solid change routine. Soft, low-fiber foods as advised by your team.',
        },
        {
          heading: 'Weeks 3–4',
          body: 'Add foods one at a time. Measure the stoma as swelling changes. Keep extras stocked.',
        },
        {
          heading: 'Weeks 5–8',
          body: 'Confidence usually grows here — social plans, workdays, and a go-bag that travels with you.',
        },
      ],
    },
    pharmacist: {
      eyebrow: 'Available in Ontario',
      heading: 'You do not have to figure the aisle alone',
      body: 'Starting out can feel like a new language. Chat with an Ontario pharmacist during business hours for product questions — until 5 p.m. Eastern. Clinical concerns still belong with your WOC nurse or surgeon.',
      cta: 'Talk to a Pharmacist',
      href: PHARMACIST_HREF,
      image: `${IMG}/care-chat-main.png`,
    },
    closing: {
      heading: 'A soft place to land',
      body: 'New to the Journey is permission to learn slowly — with checklists, kind answers, and supplies that show up when you need them.',
    },
    governance: {
      ...CLINICAL_REVIEWER,
      reviewedOn: '',
      disclaimer: GENERAL_INFO_DISCLAIMER,
    },
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
    nextLabel: 'Get to Know Your Stoma →',
  },
  {
    slug: 'get-to-know-your-stoma',
    num: '02',
    chapterWord: 'two',
    title: 'Get to Know Your Stoma',
    heroBody:
      'Clear, kind education about your stoma — how it works, what changes, and what to do when something is not right.',
    focus:
      'Your stoma type, skin comfort, output patterns, fit changes, when to ask for help, and the clothing, travel, intimacy, and routine questions that come with living in your body.',
    vibe: 'Clear, kind, and demystifying — education without overwhelm.',
    heroImage: `${IMG}/chapter-stoma.png`,
    accent: '#f3c7be',
    categoriesIntro: {
      eyebrow: 'Understanding without overwhelm',
      heading: 'Know your setup',
      body: 'A pouching system is a skin barrier (wafer/flange) plus a pouch. Fit and skin health drive comfort more than anything else.',
    },
    categories: [
      {
        title: 'Stoma Basics',
        image: `${IMG}/chapter-stoma.png`,
        group: 'Start here',
        items: [
          'Colostomy, ileostomy, and urostomy each shape output and daily care a little differently',
          'A stoma can be temporary or permanent — your care team decides with you',
          'Healthy peristomal skin should look like the skin on the other side of your abdomen',
        ],
      },
      {
        title: 'One-Piece vs Two-Piece',
        image: `${IMG}/door-shop.png`,
        items: [
          'One-piece: barrier and pouch are joined — simple and low-profile',
          'Two-piece: barrier stays while you change pouches — flexible for frequent emptying',
          'Your WOC nurse or pharmacist can help you find what seals best for your body',
        ],
      },
      {
        title: 'Skin Comfort',
        image: `${IMG}/door-care.png`,
        items: [
          'Clean with warm water; avoid oils, fragrances, and lotion under the barrier',
          'Pat dry completely — dry skin seals better than damp skin',
          'Powder, paste, rings, and wipes are tools for seal and comfort — add only what you need',
        ],
      },
      {
        title: 'Output & Patterns',
        image: `${IMG}/door-chapters.png`,
        items: [
          'Empty drainable pouches at about one-third to one-half full',
          'Closed pouches are replaced as needed through the day',
          'Full system changes are often every few days — or sooner if you feel burning, itching, or a leak',
        ],
      },
      {
        title: 'Fit Changes',
        image: `${IMG}/care-chat-desk.png`,
        items: [
          'Measure during the first months — stoma size can change as swelling settles',
          'An opening that is too large exposes skin; too small can injure the stoma',
          'Aim for a close fit around the stoma edge so output lands in the pouch, not on skin',
        ],
      },
      {
        title: 'When to Ask',
        image: `${IMG}/care-chat-moment.png`,
        items: [
          'Persistent leaks, redness, pain, or skin that will not heal',
          'Sudden changes in output, swelling, or how your barrier wears',
          'Your WOC nurse is the clinical guide; Ontario pharmacists can help with everyday product questions in chat',
        ],
        note: 'Soft next step: browse Shop Ostomy Essentials for barriers, pouches, and accessories.',
      },
      {
        title: 'Clothing & Confidence',
        image: `${IMG}/chapter-everyday.png`,
        group: 'Body and life',
        items: [
          'High-waisted styles and soft layers can keep a pouch secure and low-profile',
          'Support belts or wraps for active days when you want extra hold',
          'You do not have to hide your pouch — comfort and preference come first',
        ],
      },
      {
        title: 'Travel & Workdays',
        image: `${IMG}/door-shop.png`,
        group: 'Body and life',
        items: [
          'Empty when the pouch is about one-third to one-half full to reduce leak risk',
          'Pack supplies in your carry-on — never only in checked bags',
          'Plan bathroom stops the way you plan coffee: early and without apology',
        ],
      },
      {
        title: 'Intimacy & Social Ease',
        image: `${IMG}/door-chapters.png`,
        group: 'Body and life',
        items: [
          'Talk about what helps you feel secure — timing, clothing, or a support wrap',
          'Confidence grows with a routine that has already worked at home',
          'Your pace is the right pace',
        ],
      },
      {
        title: 'Rest & Routine',
        image: `${IMG}/care-chat-moment.png`,
        group: 'Body and life',
        items: [
          'Many people prefer morning changes when output is often lower',
          'Lay out supplies like a station before you start',
          'Restock before you run low — clockwork beats last-minute stress',
        ],
      },
    ],
    pharmacist: {
      eyebrow: 'Available in Ontario',
      heading: 'Ask without the awkward',
      body: 'Not sure if you need convex, a ring, or a different wipe? Chat with an Ontario pharmacist during business hours — until 5 p.m. Eastern. For clinical stoma concerns, your WOC nurse remains your primary resource.',
      cta: 'Talk to a Pharmacist',
      href: PHARMACIST_HREF,
      image: `${IMG}/care-chat-main.png`,
    },
    closing: {
      heading: 'Comfort is a skill you build',
      body: 'Knowing your stoma is not a test — it is a quieter relationship with fit, skin, and the products that earn their place on your shelf.',
    },
    urgent: {
      heading: 'Some things are not a website question',
      intro:
        'Most stoma worries can wait for your next NSWOC appointment. These cannot. Seek urgent medical care if you notice:',
      signs: [
        'A stoma that turns dark, dusky, purple, or feels cold to the touch',
        'Severe abdominal pain, or vomiting with no output for several hours — this can mean a blockage',
        'Heavy or continuous bleeding from the stoma itself, not just a spot from cleaning',
        'Fever, or skin around the stoma that is hot, spreading red, and painful',
        'Confusion, severe dizziness, or very dark urine alongside high output — signs of significant dehydration',
      ],
      action:
        'Go to your nearest emergency department or call 911. Do not wait for a callback, and do not troubleshoot a dusky stoma at home.',
    },
    governance: {
      ...CLINICAL_REVIEWER,
      reviewedOn: '',
      disclaimer: GENERAL_INFO_DISCLAIMER,
    },
    citations: [
      {
        label:
          'RNAO — Supporting Adults Who Anticipate or Live with an Ostomy (best practice guideline)',
        href: 'https://rnao.ca/bpg/guidelines/ostomy',
      },
      {
        label: 'NSWOCC — free patient guides by ostomy type',
        href: 'https://www.nswoc.ca/guides',
      },
      {
        label: 'Wounds Canada — Caring for a Person with an Ostomy',
        href: 'https://www.woundscanada.ca/',
      },
    ],
    nextLabel: 'Everyday Liivving →',
  },
  {
    slug: 'everyday-liivving',
    num: '03',
    chapterWord: 'three',
    title: 'Everyday Liivving',
    heroBody:
      'The people, programs, and money help that exist in Canada — gathered in one place, so you are not searching alone.',
    focus:
      'Peer support and chapters near you, what coverage actually looks like province by province, free manufacturer programs, youth and young adult community, and awareness dates.',
    vibe: 'Practical and connecting — the map to everything outside this website.',
    heroImage: `${IMG}/chapter-everyday.png`,
    accent: '#8ea78b',
    categoriesIntro: {
      eyebrow: 'You are not doing this alone',
      heading: 'What exists, and who it is for',
      body: 'A lot of good help exists in Canada. Almost none of it is in one place. This chapter is the map — most of it links out, because these organisations do it better than we could.',
    },
    categories: [
      {
        title: 'Peer support is its own kind of care',
        image: `${IMG}/chapter-everyday.png`,
        group: 'Start here',
        items: [
          'Ostomy Canada Society runs chapters and peer support groups across the country, searchable by distance from where you live',
          'Their Visitor Program trains people who have an ostomy to talk with people who have just had one — lived experience, not clinical advice',
          'If you are between roughly 20 and 40, ask about Gutsy Gang social clubs — they run in Vancouver, Calgary, Saskatoon, Winnipeg, Hamilton, Toronto, and Niagara',
        ],
        note: 'A peer visitor is not a substitute for your NSWOC. Most people find they want both.',
      },
      {
        title: 'What coverage actually looks like in Canada',
        image: `${IMG}/door-care.png`,
        group: 'Money',
        items: [
          'There is no national ostomy program. The amount, the model, and who approves it all change at the provincial border',
          'Moving provinces resets everything — including which forms you file and who has to sign them',
          'In most provinces an NSWOC assessment is the gate. Some, like Saskatchewan, will not accept a self-application at all',
        ],
        note: 'We have checked every province and territory against its own government page — see Funding & Coverage for what yours pays, who has to sign off, and the dates that catch people out.',
      },
      {
        title: 'Programs that cost you nothing',
        image: `${IMG}/door-shop.png`,
        group: 'Money',
        items: [
          'All three major manufacturers run free support programs — samples, phone lines, and access to ostomy nurses',
          'You do not have to buy from us, or from them, to use these',
          'They will also help you work out what your province covers, which is often the fastest way to get an answer',
        ],
      },
      {
        title: 'Awareness, on Canada’s calendar',
        image: `${IMG}/door-chapters.png`,
        group: 'Community',
        items: [
          'World Ostomy Day runs every three years, not every year — the last was 4 October 2025, and the next falls in 2028',
          'In the years between, Canada still marks the first Saturday of October, anchored by Ostomy Canada’s Step Up for Ostomy campaign',
          'Chapters usually run local events — the chapter finder is the fastest way to see what is happening near you',
        ],
      },
      {
        title: 'Stories from people who have one',
        image: `${IMG}/care-chat-moment.png`,
        group: 'Community',
        items: [
          'Reading someone describe their first month is worth more than any checklist we could write',
          'We are collecting stories from Canadians with ostomies — surgery, work, travel, dating, sport, all of it',
          'If you would like to share yours, tell the care team and we will be in touch about how it works',
        ],
      },
    ],
    programsBand: {
      heading: 'Four ways provinces pay — knowing yours saves you money',
      cards: [
        {
          heading: 'A flat grant, paid to you',
          body: 'Ontario and Quebec send a set amount each year and you buy your own supplies. If you use more than the grant covers, the overage is yours — and may be claimable as a medical expense.',
        },
        {
          heading: 'A percentage cost-share',
          body: 'British Columbia, Alberta, Saskatchewan, and Newfoundland cover a share and you pay the rest, often up to an annual cap. Low income can reduce your share to nothing.',
        },
        {
          heading: 'Supplies issued to you',
          body: 'Manitoba does not reimburse — the program sends the supplies. You are registered through an NSWOC after surgery rather than applying yourself.',
        },
        {
          heading: 'Only if you qualify',
          body: 'PEI is income-tiered. Nova Scotia and New Brunswick route by category — seniors, social assistance, or specific programs — so there is no general coverage to apply for.',
        },
      ],
    },
    resources: [
      {
        eyebrow: 'Find your people',
        heading: 'Support that is already out there',
        body: 'These are run by patient organisations and specialist nurses, not by us. They are free, and they are better at this than any retailer.',
        links: [
          {
            title: 'Find a chapter or peer support group',
            org: 'Ostomy Canada Society',
            body: 'Search by distance from your postal code, from 10 km out to 500 km. Also lists Gutsy Gang social clubs for younger adults.',
            href: 'https://www.ostomycanada.ca/find-a-chapter-peer-support-group/',
          },
          {
            title: 'Visitor Program',
            org: 'Ostomy Canada Society',
            body: 'Trained peer visitors who have an ostomy themselves. Requested through your local chapter, usually after a referral from your surgeon or NSWOC.',
            href: 'https://www.ostomycanada.ca/ostomy-canada-visitor-program/',
          },
          {
            title: 'Find an NSWOC near you',
            org: 'NSWOCC',
            body: 'Nurses Specialized in Wound, Ostomy and Continence — the clinical specialists for stoma care in Canada. Many hospitals have one; some see outpatients for life.',
            href: 'https://www.nswoc.ca/',
          },
          {
            title: 'Youth Camp',
            org: 'Ostomy Canada Society',
            body: 'A week at Camp Horizon in Bragg Creek, Alberta, for kids and teens with ostomies. Partial and full funding is available — ask, do not assume the fee is the barrier.',
            href: 'https://www.ostomycanada.ca/youth-camp/',
          },
        ],
      },
      {
        eyebrow: 'Free programs',
        heading: 'Manufacturer support, compared plainly',
        body: 'All three are free and none of them require you to buy from us. We have listed what each program offers — not whose products are better, which is not our call to make.',
        links: [
          {
            title: 'Secure Start',
            org: 'Hollister',
            body: 'Free personalized support regardless of which brand you use, including help navigating coverage. Canadian line: 1-800-263-7421.',
            href: 'https://www.hollister.ca/en-ca/securestartconsumer',
          },
          {
            title: 'Coloplast Care',
            org: 'Coloplast',
            body: 'Ongoing educational support, phone access, samples, and the MyOstomy app for tracking changes and output. Consumer support: 1-866-293-6349.',
            href: 'https://www.coloplast.ca/care-/',
          },
          {
            title: 'me+',
            org: 'Convatec',
            body: 'Staged around the journey — before surgery, right after, and living with one. Includes video appointments with a certified ostomy nurse. 1-800-465-6302.',
            href: 'https://www.convatec.com/en-ca/ostomy-care/me-plus-patient-support/',
          },
        ],
      },
      {
        eyebrow: 'Money',
        heading: 'Coverage and tax help',
        body: 'Amounts and rules change, and they change by province. Always confirm against the official source before you plan around a number.',
        links: [
          {
            title: 'Provincial government programs',
            org: 'Ostomy Canada Society',
            body: 'The best public summary of what each province and territory covers, with links through to the official program pages.',
            href: 'https://www.ostomycanada.ca/provincial-government-programs/',
          },
          {
            title: 'Disability Tax Credit (form T2201)',
            org: 'Canada Revenue Agency',
            body: 'Many ostomates qualify under the "eliminating" category. Approval can also unlock the RDSP and other credits, so it is worth the paperwork.',
            href: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/segments/tax-credits-deductions-persons-disabilities/disability-tax-credit/eligible-dtc/eliminating.html',
          },
          {
            title: 'Non-Insured Health Benefits (NIHB)',
            org: 'Indigenous Services Canada',
            body: 'Full coverage with no annual cap for registered First Nations and recognized Inuit. This replaces the provincial route rather than topping it up.',
            href: 'https://www.sac-isc.gc.ca/eng/1579620079031/1579620259238',
          },
        ],
      },
      {
        eyebrow: 'Read more',
        heading: 'Guides worth downloading',
        body: 'Written by nurses and patient organisations, free, and more thorough than anything on this page.',
        links: [
          {
            title: 'Living with an ileostomy, colostomy, or ileal conduit',
            org: 'NSWOCC',
            body: 'Clinician-written patient guides, one per ostomy type, including the less commonly covered ones — jejunostomy, gastrostomy, and gastro-jejunostomy.',
            href: 'https://www.nswoc.ca/guides',
            note: 'English and French',
          },
          {
            title: 'New Ostomy Patient Guide',
            org: 'United Ostomy Associations of America',
            body: 'American, so the funding sections will not apply here — but the clinical and practical content is excellent and freely available.',
            href: 'https://www.ostomy.org/new-ostomy-patient-guide/',
          },
          {
            title: 'Step Up for Ostomy',
            org: 'Ostomy Canada Society',
            body: 'The national awareness and fundraising campaign that anchors the first Saturday of October in Canada.',
            href: 'https://www.ostomycanada.ca/events/world-ostomy-day/',
          },
        ],
      },
    ],
    pharmacist: {
      eyebrow: 'Available in Ontario',
      heading: 'Fit questions that do not need a waiting room',
      body: 'Product fit, restock questions, and everyday concerns — chat with an Ontario pharmacist during business hours (until 5 p.m. Eastern). Olivia helps with shopping anytime; she does not give medical advice.',
      cta: 'Talk to a Pharmacist',
      href: PHARMACIST_HREF,
      image: `${IMG}/care-chat-main.png`,
    },
    closing: {
      heading: 'Living, not managing',
      body: 'The help exists. Most people just never find out it is there — which is the only reason this page needed writing.',
    },
    governance: {
      ...CLINICAL_REVIEWER,
      reviewedOn: '',
      disclaimer: GENERAL_INFO_DISCLAIMER,
    },
    citations: [
      {
        label: 'Ostomy Canada Society — provincial government programs',
        href: 'https://www.ostomycanada.ca/provincial-government-programs/',
      },
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
    ],
    nextLabel: 'Back to Ostomy Care →',
  },
];

export const LANDING_HREF = LANDING;
export const SHOP_OSTOMY_HREF = SHOP_HREF;

export function chapterHref(slug: string) {
  return `${LANDING}/chapters/${slug}`;
}

export function getChapter(slug: string) {
  return CHAPTERS.find((c) => c.slug === slug);
}

export function getChapterNeighbors(slug: string) {
  const index = CHAPTERS.findIndex((c) => c.slug === slug);

  if (index < 0) return { prev: null, next: null, chapter: null };

  return {
    chapter: CHAPTERS[index],
    prev: index > 0 ? CHAPTERS[index - 1] : null,
    next: index < CHAPTERS.length - 1 ? CHAPTERS[index + 1] : null,
  };
}

export const CHAPTER_SLUGS = CHAPTERS.map((c) => c.slug);
