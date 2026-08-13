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

export type CategorySection = {
  heading: string;
  items: string[];
  note?: string;
};

export type CategoryCard = {
  title: string;
  image: string;
  items?: string[];
  sections?: CategorySection[];
  note?: string;
  group?: string;
  badge?: string;
};

export type Chapter = {
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
  programsBand?: { heading?: string; cards: { heading: string; body: string }[] };
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
};

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
          'Open Everyday Liivving when you are ready for clothing, travel, and go-bag habits',
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
    nextLabel: 'Get to Know Your Stoma →',
  },
  {
    slug: 'get-to-know-your-stoma',
    num: '02',
    chapterWord: 'two',
    title: 'Get to Know Your Stoma',
    heroBody:
      'Clear, kind education about your stoma — so comfort and confidence feel possible day to day.',
    focus:
      'Understanding your stoma type, skin comfort around the stoma, output patterns, fit changes, and when to ask for help.',
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
    nextLabel: 'Everyday Liivving →',
  },
  {
    slug: 'everyday-liivving',
    num: '03',
    chapterWord: 'three',
    title: 'Everyday Liivving',
    heroBody:
      'Clothing, travel, workdays, and quiet confidence — life beyond the bathroom shelf.',
    focus:
      'Clothing tips, travel and workdays, intimacy confidence, go-bags, social ease, and a routine that feels like yours again.',
    vibe: 'Discreet, practical, and life-forward — care that fits real days.',
    heroImage: `${IMG}/chapter-everyday.png`,
    accent: '#8ea78b',
    categoriesIntro: {
      eyebrow: 'Life beyond the shelf',
      heading: 'Ordinary days, made quieter',
      body: 'Small habits — a go-bag, a clothing swap, a travel checklist — keep loud days manageable and quiet ones easy.',
    },
    categories: [
      {
        title: 'Clothing & Confidence',
        image: `${IMG}/chapter-everyday.png`,
        items: [
          'High-waisted styles and soft layers can keep a pouch secure and low-profile',
          'Support belts or wraps for active days when you want extra hold',
          'You do not have to hide your pouch — comfort and preference come first',
        ],
      },
      {
        title: 'Travel & Workdays',
        image: `${IMG}/door-shop.png`,
        items: [
          'Empty when the pouch is about one-third to one-half full to reduce leak risk',
          'Pack supplies in your carry-on — never only in checked bags',
          'Plan bathroom stops the way you plan coffee: early and without apology',
        ],
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
        title: 'Intimacy & Social Ease',
        image: `${IMG}/door-chapters.png`,
        items: [
          'Talk about what helps you feel secure — timing, clothing, or a support wrap',
          'Confidence grows with a routine that has already worked at home',
          'Your pace is the right pace',
        ],
      },
      {
        title: 'Rest & Routine',
        image: `${IMG}/care-chat-moment.png`,
        items: [
          'Many people prefer morning changes when output is often lower',
          'Lay out supplies like a station before you start',
          'Restock before you run low — clockwork beats last-minute stress',
        ],
      },
    ],
    programsBand: {
      heading: 'Small rituals that stick',
      cards: [
        {
          heading: 'Empty early',
          body: 'Do not wait for a full pouch. Emptying at one-third to one-half full protects the seal.',
        },
        {
          heading: 'Keep a go-kit',
          body: 'A compact spare kit turns surprises into a short pause — not a crisis.',
        },
        {
          heading: 'Hydrate on purpose',
          body: 'Especially with an ileostomy, steady fluids and electrolytes matter on hot or busy days.',
        },
      ],
    },
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
      body: 'Everyday Liivving is the quiet confidence of a routine that works — supplies on time, a go-bag ready, and room for the rest of your life.',
    },
    nextLabel: 'Back to Ostomy Care →',
  },
]

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
