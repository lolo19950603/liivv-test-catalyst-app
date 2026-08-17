/*
 * =============================================================================
 * DIABETES CARE CHAPTERS — CONTENT MAP
 * =============================================================================
 * Layout: ./chapter-page.tsx (search "SECTION N —" there)
 * =============================================================================
 */

const IMG = '/archive/diabetes-care';
const LANDING = '/liivv-health/diabetes-care';
const PHARMACIST_HREF = '/account/virtual-care';
const SHOP_HREF = '/liivv-health/diabetes-care/shop-diabetes-care';

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
  href?: string;
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
  kind?: 'chapter' | 'path';
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

const pharmacist = (heading: string, body: string): Chapter['pharmacist'] => ({
  eyebrow: 'Available in Ontario',
  heading,
  body,
  cta: 'Talk to a Pharmacist',
  href: PHARMACIST_HREF,
  image: `${IMG}/care-chat-main.png`,
});

export const CHAPTERS: Chapter[] = [
  {
    slug: 'every-day-living',
    num: '02',
    chapterWord: 'two',
    title: 'Every Day Living',
    heroBody:
      'Food, movement, and lifestyle rhythm for the hours between appointments — practical support that works IRL.',
    focus: 'Meal rhythm, movement habits, stress and sleep, on-the-go kits, lifestyle balance.',
    vibe: 'Steady and real — wellness that works IRL, not only on clinic days.',
    heroImage: `${IMG}/chapter-everyday.png`,
    accent: '#f3c7be',
    categoriesIntro: {
      eyebrow: 'Hours between appointments',
      heading: 'Rhythm that works IRL',
      body: 'Small habits keep the loud days manageable and the quiet ones steady — meals, movement, rest, and a bag that is ready.',
    },
    categories: [
      {
        title: 'Food & Meal Rhythm',
        image: `${IMG}/chapter-everyday.png`,
        items: [
          'Practical meal-timing guides',
          'Pantry staples that support balance',
          'On-the-go snack ideas without the lecture',
        ],
      },
      {
        title: 'Movement That Fits',
        image: `${IMG}/closing.png`,
        items: [
          'Everyday movement, not gym-only plans',
          'Short walks and stretch routines',
          'Tools that travel with you',
        ],
      },
      {
        title: 'Stress & Sleep',
        image: `${IMG}/care-chat-main.png`,
        items: [
          'Wind-down rituals that stick',
          'Sleep support staples',
          'Stress resets for loud weeks',
        ],
      },
      {
        title: 'On-the-Go Kits',
        image: `${IMG}/door-shop.png`,
        items: [
          'Travel pouches for meters and snacks',
          'Work-bag essentials',
          'Weekend / trip checklists',
        ],
      },
      {
        title: 'Hydration & Everyday Staples',
        image: `${IMG}/chapter-essentials.png`,
        items: [
          'Hydration reminders that feel kind',
          'Daily vitamins via CarePack when useful',
          'Discreet restock for lifestyle staples',
        ],
      },
    ],
    pharmacist: pharmacist(
      'Fit questions that do not need a waiting room',
      'Everyday concerns in chat during business hours — until 5 p.m. Eastern. Olivia helps with shopping anytime; she does not give medical advice.',
    ),
    closing: {
      heading: 'Living, not managing',
      body: 'Every Day Living is the quiet confidence of a routine that works — food, movement, rest, and room for the rest of your life.',
    },
    nextLabel: 'New to the Journey →',
  },
  {
    slug: 'new-to-the-journey',
    num: '03',
    chapterWord: 'three',
    title: 'New to the Journey',
    heroBody:
      'A calm start when everything feels new — clear basics, kind guides, and the first supplies without the overwhelm.',
    focus:
      'Newly diagnosed, still figuring it out, first meter or CGM setup, what to stock first, and who to ask.',
    vibe: 'Supportive and demystifying — a soft place to land.',
    heroImage: `${IMG}/chapter-new.png`,
    accent: '#a89c94',
    categoriesIntro: {
      eyebrow: 'First chapters',
      heading: 'You are not supposed to know everything yet',
      body: 'Start with a short checklist and one trusted contact. The rest can wait until you are ready.',
    },
    categories: [
      {
        title: 'First Week Basics',
        image: `${IMG}/chapter-new.png`,
        items: [
          'What to expect in plain language',
          'A calm checklist — not a textbook',
          'Who is on your care team (and who Liivv is)',
        ],
      },
      {
        title: 'Starter Supply Lists',
        image: `${IMG}/chapter-essentials.png`,
        items: [
          'First meter / strip kits',
          'Wipes, lancets, and a simple go-bag',
          'What to skip until you are ready',
        ],
      },
      {
        title: 'Learning Your Tools',
        image: `${IMG}/chapter-type1.png`,
        items: [
          'Meter and CGM basics explained kindly',
          'Site care without scare tactics',
          'Open Diabetes Essentials (the shop) when ready',
        ],
      },
      {
        title: 'Who to Ask',
        image: `${IMG}/care-chat-main.png`,
        items: [
          'Ontario pharmacist chat (business hours)',
          'Olivia for orders and account help (anytime)',
          'Your diabetes care team for medical decisions',
        ],
      },
      {
        title: 'Soft Next Steps',
        image: `${IMG}/chapter-journey.png`,
        items: [
          'Browse Diabetes Essentials when ready to stock',
          'Explore Your Diabetes Journey if you know your path',
          'No rush — pick what fits',
        ],
      },
    ],
    programsBand: {
      heading: 'A gentle first-month map',
      cards: [
        {
          heading: 'Week 1',
          body: 'Learn your meter or CGM with one trusted person. Stock a short starter list — not the whole aisle.',
        },
        {
          heading: 'Weeks 2–3',
          body: 'Add a restock rhythm for strips or sensors. Open Every Day Living when meals and movement feel ready.',
        },
        {
          heading: 'Week 4+',
          body: 'Know your path? Your Diabetes Journey has Type 1, Type 2, Gestational, and Prediabetes — no pressure.',
        },
      ],
    },
    pharmacist: pharmacist(
      'You do not have to figure the aisle alone',
      'Starting out can feel like a new language. Chat with an Ontario pharmacist during business hours for product questions — until 5 p.m. Eastern. Clinical concerns still belong with your diabetes care team. Olivia helps with shopping anytime; she does not give medical advice.',
    ),
    closing: {
      heading: 'A soft place to land',
      body: 'New to the Journey is permission to learn slowly — with checklists, kind answers, and supplies that show up when you need them.',
    },
    nextLabel: 'Your Diabetes Journey →',
  },
  {
    slug: 'your-diabetes-journey',
    num: '04',
    chapterWord: 'four',
    title: 'Your Diabetes Journey',
    heroBody: 'Type 1, Type 2, Gestational, and Prediabetes — pick the path that matches where you are.',
    focus:
      'Path-specific hubs without pressure; supplies and tips tailored to Gestational, Prediabetes, Type 1, and Type 2.',
    vibe: 'Path-specific without pressure. Pick what fits; we follow your lead.',
    heroImage: `${IMG}/chapter-journey.png`,
    accent: '#6b7f5c',
    categoriesIntro: {
      eyebrow: 'Four paths',
      heading: 'Pick what fits today',
      body: 'You do not have to read every chapter. Open the path that matches where you are — then come back whenever you need.',
    },
    categories: [
      {
        title: 'Gestational',
        image: `${IMG}/chapter-gestational.png`,
        group: 'Path one',
        href: `${LANDING}/chapters/gestational`,
        items: [
          'Managing blood sugar during pregnancy',
          'Meters, meal timing, and calm support',
          'No shame — this chapter has its own pace',
        ],
      },
      {
        title: 'Prediabetes',
        image: `${IMG}/chapter-prediabetes.png`,
        group: 'Path two',
        href: `${LANDING}/chapters/prediabetes`,
        items: [
          'Proactive steps to stay ahead',
          'Everyday living tools and monitoring options',
          'Steady habits without overwhelm',
        ],
      },
      {
        title: 'Type 1',
        image: `${IMG}/chapter-type1.png`,
        group: 'Path three',
        href: `${LANDING}/chapters/type-1`,
        items: [
          'CGM, pump-adjacent shopables, injection supplies',
          'Restock that keeps pace around the clock',
          'Capable, discreet, clockwork',
        ],
      },
      {
        title: 'Type 2',
        image: `${IMG}/chapter-type2.png`,
        group: 'Path four',
        href: `${LANDING}/chapters/type-2`,
        items: [
          'Meters, lifestyle balance, medication-adjacent essentials',
          'Support that meets you where you are',
          'Steady, practical, judgment-free',
        ],
      },
    ],
    pharmacist: pharmacist(
      'Path questions, kind answers',
      'Everyday product questions in Ontario during business hours (until 5 p.m. Eastern). Your care team remains the guide for medical decisions. Olivia helps with shopping anytime; she does not give medical advice.',
    ),
    closing: {
      heading: 'We follow your lead',
      body: 'Whatever path you are on, there is a version of care that fits your everyday. Let us find it together.',
    },
    nextLabel: 'Back to Diabetes Care →',
  },
];

export const PATH_CHAPTERS: Chapter[] = [
  {
    slug: 'gestational',
    num: '01',
    chapterWord: 'one',
    kind: 'path',
    title: 'Gestational',
    heroBody: 'Managing blood sugar during pregnancy — meters, tips, and calm support for this chapter.',
    focus: 'Pregnancy monitoring, meal timing, supply basics, pharmacist chat for everyday concerns.',
    vibe: 'Reassuring, practical, no shame.',
    heroImage: `${IMG}/chapter-gestational.png`,
    accent: '#f3c7be',
    categoriesIntro: {
      eyebrow: 'This season',
      heading: 'Care for this chapter',
      body: 'Support that respects pregnancy — clear tools, calm tone, and restock when you need it.',
    },
    categories: [
      {
        title: 'Monitoring Basics',
        image: `${IMG}/chapter-gestational.png`,
        items: [
          'Meters and strips for pregnancy routines',
          'Simple logging habits',
          'Restock without the scramble',
        ],
      },
      {
        title: 'Meal Timing Support',
        image: `${IMG}/chapter-everyday.png`,
        items: ['Practical meal-rhythm ideas', 'On-the-go snacks', 'No lecture — just useful'],
      },
      {
        title: 'Comfort Essentials',
        image: `${IMG}/chapter-essentials.png`,
        items: ['Soft everyday staples', 'Discreet delivery', 'CarePack when helpful'],
      },
      {
        title: 'After Delivery Next Steps',
        image: `${IMG}/chapter-journey.png`,
        items: [
          'What to revisit with your care team',
          'Links back to Essentials and Every Day Living',
          'No pressure timeline',
        ],
      },
    ],
    pharmacist: pharmacist(
      'Questions welcome on this path',
      'Everyday concerns — kindly, privately, during business hours until 5 p.m. Eastern. Olivia helps with shopping and accounts anytime — she does not give medical advice.',
    ),
    closing: {
      heading: 'Steady through this season',
      body: 'Monitoring, meals, and kind answers — so this chapter feels held.',
    },
    nextLabel: 'Prediabetes →',
  },
  {
    slug: 'prediabetes',
    num: '02',
    chapterWord: 'two',
    kind: 'path',
    title: 'Prediabetes',
    heroBody:
      'Taking proactive steps to stay ahead — everyday living tools, monitoring options, and steady habits.',
    focus: 'Proactive monitoring, food and movement, early education, restock without overwhelm.',
    vibe: 'Empowering, forward-looking, calm.',
    heroImage: `${IMG}/chapter-prediabetes.png`,
    accent: '#8ea78b',
    categoriesIntro: {
      eyebrow: 'Stay ahead, gently',
      heading: 'Forward without the clinic vibe',
      body: 'Proactive tools and everyday habits — without turning your life into an appointment.',
    },
    categories: [
      {
        title: 'Early Monitoring',
        image: `${IMG}/chapter-essentials.png`,
        items: [
          'Meters and strips to start lightly',
          'Optional CGM exploration',
          'Restock that does not overwhelm',
        ],
      },
      {
        title: 'Food & Movement',
        image: `${IMG}/chapter-everyday.png`,
        items: [
          'Everyday meal rhythm',
          'Movement that fits real weeks',
          'Links into Every Day Living',
        ],
      },
      {
        title: 'Everyday Habits',
        image: `${IMG}/chapter-new.png`,
        items: ['Small adjustments that stick', 'Sleep and stress basics', 'No perfection required'],
      },
      {
        title: 'Soft Education',
        image: `${IMG}/chapter-journey.png`,
        items: [
          'Plain-language guides',
          'What to ask your care team',
          'When to explore other paths',
        ],
      },
    ],
    pharmacist: pharmacist(
      'Questions welcome on this path',
      'Everyday concerns — kindly, privately, during business hours until 5 p.m. Eastern. Olivia helps with shopping and accounts anytime — she does not give medical advice.',
    ),
    closing: {
      heading: 'Forward, at your pace',
      body: 'Monitoring, habits, and support that keep the future feeling open.',
    },
    nextLabel: 'Type 1 →',
  },
  {
    slug: 'type-1',
    num: '03',
    chapterWord: 'three',
    kind: 'path',
    title: 'Type 1',
    heroBody:
      'Managing insulin around the clock — CGM, pump-adjacent shopables, injection supplies, and restock that keeps pace.',
    focus: 'CGM and sensors, insulin delivery supplies, site care, on-the-go kits, veteran restock.',
    vibe: 'Capable, discreet, clockwork.',
    heroImage: `${IMG}/chapter-type1.png`,
    accent: '#6b7f5c',
    categoriesIntro: {
      eyebrow: 'Around the clock',
      heading: 'Tools that keep pace',
      body: 'Supplies and restock for a routine that already knows itself — discreet, capable, on time.',
    },
    categories: [
      {
        title: 'CGM & Sensors',
        image: `${IMG}/chapter-type1.png`,
        items: ['Sensors and adhesives', 'Site prep and overlays', 'Restock rhythm for sensors'],
      },
      {
        title: 'Insulin Delivery Supplies',
        image: `${IMG}/door-shop.png`,
        items: ['Pens, syringes, needles', 'Pump-adjacent shopables', 'Travel cases'],
      },
      {
        title: 'Site Care',
        image: `${IMG}/chapter-essentials.png`,
        items: ['Prep wipes and barrier films', 'Adhesive removers', 'Gentle skin care'],
      },
      {
        title: 'On-the-Go Kits',
        image: `${IMG}/chapter-everyday.png`,
        items: ['Work and travel pouches', 'Backup supplies', 'Weekend checklists'],
      },
      {
        title: 'Restock Rhythm',
        image: `${IMG}/chapter-journey.png`,
        items: ['Clockwork essentials', 'CarePack options', 'Discreet packaging'],
      },
    ],
    pharmacist: pharmacist(
      'Questions welcome on this path',
      'Everyday product questions in Ontario during business hours until 5 p.m. Eastern. Clinical decisions stay with your care team. Olivia helps with shopping anytime; she does not give medical advice.',
    ),
    closing: {
      heading: 'Capable, on time',
      body: 'CGM, delivery supplies, and restock that keeps up — so your energy goes to the life you are actually living.',
    },
    nextLabel: 'Type 2 →',
  },
  {
    slug: 'type-2',
    num: '04',
    chapterWord: 'four',
    kind: 'path',
    title: 'Type 2',
    heroBody:
      'Balancing lifestyle, medications, or insulin — supplies and everyday living support that meet you where you are.',
    focus:
      'Meters and monitoring, meds-adjacent shopables, food and movement, transitioning therapy, restock.',
    vibe: 'Steady, practical, judgment-free.',
    heroImage: `${IMG}/chapter-type2.png`,
    accent: '#a89c94',
    categoriesIntro: {
      eyebrow: 'Where you are',
      heading: 'Balance without the lecture',
      body: 'Supplies and everyday living support that meet you in the middle of a real week.',
    },
    categories: [
      {
        title: 'Monitoring & Meters',
        image: `${IMG}/chapter-essentials.png`,
        items: ['Meters, strips, and lancets', 'Optional CGM exploration', 'Simple logging habits'],
      },
      {
        title: 'Lifestyle Balance',
        image: `${IMG}/chapter-everyday.png`,
        items: [
          'Food and movement support',
          'Links into Every Day Living',
          'Judgment-free tone',
        ],
      },
      {
        title: 'Medication Support Essentials',
        image: `${IMG}/door-shop.png`,
        items: ['Organizers and CarePacks', 'Reminder-friendly setups', 'Discreet restock'],
      },
      {
        title: 'Transitioning Therapy',
        image: `${IMG}/chapter-new.png`,
        items: [
          'Starting insulin or new meds — supply basics',
          'What to stock during a change',
          'Ask your care team for medical decisions',
        ],
      },
      {
        title: 'Restock',
        image: `${IMG}/chapter-journey.png`,
        items: ['Essentials on repeat', 'Pause or swap anytime', 'Discreet packaging'],
      },
    ],
    pharmacist: pharmacist(
      'Questions welcome on this path',
      'Everyday product questions in Ontario during business hours until 5 p.m. Eastern. Clinical decisions stay with your care team. Olivia helps with shopping anytime; she does not give medical advice.',
    ),
    closing: {
      heading: 'Meet you where you are',
      body: 'Meters, lifestyle support, and restock — without turning an ordinary day into a lecture.',
    },
    nextLabel: 'Back to Your Diabetes Journey →',
  },
];

export const ALL_CHAPTERS: Chapter[] = [...CHAPTERS, ...PATH_CHAPTERS];

export const LANDING_HREF = LANDING;
export const SHOP_DIABETES_HREF = SHOP_HREF;
export const JOURNEY_HUB_HREF = `${LANDING}/chapters/your-diabetes-journey`;

export function chapterHref(slug: string) {
  return `${LANDING}/chapters/${slug}`;
}

export function getChapter(slug: string) {
  return ALL_CHAPTERS.find((chapter) => chapter.slug === slug);
}

function neighborList(slug: string) {
  return PATH_CHAPTERS.some((chapter) => chapter.slug === slug) ? PATH_CHAPTERS : CHAPTERS;
}

export function getChapterNeighbors(slug: string) {
  const list = neighborList(slug);
  const index = list.findIndex((chapter) => chapter.slug === slug);

  if (index < 0) return { prev: null, next: null, chapter: null };

  return {
    chapter: list[index],
    prev: index > 0 ? list[index - 1] : null,
    next: index < list.length - 1 ? list[index + 1] : null,
  };
}

export const CHAPTER_SLUGS = ALL_CHAPTERS.map((chapter) => chapter.slug);
