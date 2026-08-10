/*
 * =============================================================================
 * CHAPTERS DATA — CONTENT MAP
 * =============================================================================
 * This file is the main place to edit chapter page copy.
 * Layout: ./chapter-page.tsx (search "SECTION N —" there)
 *
 * Field → page section:
 *   title, heroBody, chapterWord, num, heroImage  → SECTION 1 Hero
 *   focus, vibe                                   → SECTION 2 Pulse cards
 *   categoriesIntro, categories[]                 → SECTION 3 Care categories
 *   programsBand (optional)                       → SECTION 4 Programs
 *   pharmacist                                    → SECTION 5 Pharmacist CTA
 *   closing, nextLabel                            → SECTION 7 Closing
 *
 * Search "CHAPTER 0N —" below to jump to a chapter's content.
 * =============================================================================
 */

const IMG = '/archive/womens-health-demo';
const LANDING = '/liivv-health/womens-health-demo';
const PHARMACIST_HREF = '/account/virtual-care';

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
  // -------------------------------------------------------------------------
  // CHAPTER 01 — Foundation & First Cycles
  // -------------------------------------------------------------------------
  {
    slug: 'foundation-first-cycles',
    num: '01',
    chapterWord: 'one',
    title: 'Foundation & First Cycles',
    heroBody:
      'A calm, honest start to period care — kits, comfort, skin basics, and vitamins that make the first years feel less mysterious.',
    focus:
      'First period anxiety, irregular cycles, acne and hormonal skin, discretion at school, and the vitamins that support growing bodies.',
    vibe: 'Supportive, demystifying, and parent-friendly — without talking down to the teen.',
    heroImage: `${IMG}/chapter-1.jpg`,
    accent: '#f3c7be',
    categoriesIntro: {
      eyebrow: "What you'll find here",
      heading: 'Care that grows with her',
      body: 'Everything below is meant to demystify the first cycles — for teens and the parents walking beside them.',
    },
    categories: [
      {
        title: 'Starter Period Kits',
        image: `${IMG}/door-shop-kit.jpg`,
        items: [
          'The Hero Bundle: First Period Confidence Kits — often gifted by a parent',
          'Curated boxes with organic cotton pads, tampons, and period underwear',
          'Canadian brands like Aisle, KnixTeen, and Joni (organic, sustainable pads)',
          'Example: Ruby Love First Period Kit',
        ],
      },
      {
        title: 'Pain Relief',
        image: `${IMG}/kit-products/kit-cycle-comfort-cramp.png`,
        items: [
          'Heat patches for cramps',
          'ThermaCare Menstrual heat wraps (Class I Medical Devices in Canada)',
          'Speak with a pharmacist about dysmenorrhea — Minor Ailment Consulting available in Ontario',
        ],
      },
      {
        title: 'Skincare',
        image: `${IMG}/kit-products/kit-clear-skin-hormonal-acne.png`,
        items: [
          'Gentle skincare systems for hormonal skin',
          'Dermatologist-recommended basics like CeraVe or Cetaphil, bundled as "Hormonal Skin Basics"',
          'Speak with a pharmacist about dermatitis or acne',
        ],
      },
      {
        title: 'Digital Integration',
        image: `${IMG}/care-2.jpg`,
        items: [
          'Cycle tracking app recommendations',
          'Exploring whether Liivv builds its own tracker or partners with trusted apps',
        ],
        badge: 'Exploring',
        note: 'The goal: a simple way to notice patterns without overwhelm.',
      },
      {
        title: 'Menstrual Care',
        image: `${IMG}/door-shop-kit.jpg`,
        items: [
          'Reign Wellness — 100% organic cotton, plastic-free tampons',
          'DivaCup menstrual cup',
          'Pads, period underwear, and options that fit real school days',
        ],
      },
      {
        title: 'Vitamins',
        image: `${IMG}/kit-products/kit-teen-energy-iron.png`,
        items: [
          'Vitamin D (600–1000 IU/day) — bone development and immunity; often lacking in teens',
          'Iron (15 mg/day) — energy and replacing menstrual blood loss',
          'Calcium — building bone mass during puberty',
          'Magnesium — muscle relaxation and easing menstrual cramps',
          'B-Complex / B12 — energy metabolism and nerve health; especially helpful for vegetarians and vegans',
        ],
      },
    ],
    pharmacist: {
      eyebrow: 'Available in Ontario',
      heading: 'Questions are welcome — for teens and parents',
      body: 'First cycles come with a lot of "is this normal?" moments. Our Ontario pharmacists can chat through everyday concerns like cramps and skin flare-ups — kindly, privately, and without a waiting room.',
      cta: 'Talk to a Pharmacist',
      href: PHARMACIST_HREF,
      image: `${IMG}/door-care.jpg`,
    },
    closing: {
      heading: 'A softer first chapter',
      body: 'Confidence kits, gentle basics, and someone to ask — so the early years feel less like a secret and more like care.',
    },
    nextLabel: 'Next: Rhythm & Balance',
  },
  // -------------------------------------------------------------------------
  // CHAPTER 02 — Rhythm & Balance
  // -------------------------------------------------------------------------
  {
    slug: 'rhythm-and-balance',
    num: '02',
    chapterWord: 'two',
    title: 'Rhythm & Balance',
    heroBody:
      'Wellness that works IRL — cycle care, sleep, stress, skin, and the practical routines that keep a busy month feeling like yours.',
    focus:
      'Busy schedules and convenience, hormonal breakouts, gut + vaginal health, sleep + stress, and birth control side effects or options.',
    vibe: 'Modern, aesthetic, and highly functional. Wellness that works IRL.',
    heroImage: `${IMG}/chapter-2.jpg`,
    accent: '#8ea58d',
    categoriesIntro: {
      eyebrow: "What you'll find here",
      heading: 'Everyday rhythm, edited',
      body: 'Premium essentials and calm support for the chapter where life gets full — and your care should keep up.',
    },
    categories: [
      {
        title: 'Menstrual Care',
        image: `${IMG}/door-shop-kit.jpg`,
        items: [
          'Premium period underwear',
          'Menstrual cups, plus pads and tampons when you want them',
          'Premium hygiene wash or wipes',
        ],
      },
      {
        title: 'Supplements',
        image: `${IMG}/kit-products/kit-rhythm-balance.png`,
        items: ['Probiotics — e.g. CanPrev Women\'s Multi', 'Hormone-balancing supplements'],
      },
      {
        title: 'Mental Health Products & Services',
        image: `${IMG}/pillar-4.jpg`,
        items: [
          'Weighted blankets, wake-up lights, wellness journals, calming essential oils',
          'Mental health app recommendations',
          'Mental Health Clinical Check',
          'Articles on mental health',
        ],
        badge: 'Coming soon',
      },
      {
        title: 'Sleep & Stress',
        image: `${IMG}/kit-products/kit-transition-hot-flash.png`,
        items: [
          'Sleep aids — melatonin, chamomile teas, and gentle options',
          'Sleep essential oils',
          'Articles on good sleep habits',
        ],
      },
      {
        title: 'Birth Control',
        image: `${IMG}/kit-products/kit-transition-intimate.png`,
        items: [
          'Articles on birth control',
          'Birth control Minor Ailment Consulting',
          'Fill your prescription for birth control',
          'Safe sex products',
        ],
        badge: 'Coming soon',
      },
      {
        title: 'Hormonal Breakouts',
        image: `${IMG}/kit-products/kit-clear-skin-hormonal-acne.png`,
        items: [
          'Article on the impact of hormones on skin health',
          'Link into Liivv Skin Health essentials',
          'A few trusted product recommendations for hormonal skin',
        ],
        note: 'Same calm place as the rest of your month — no whisper aisle required.',
      },
    ],
    pharmacist: {
      eyebrow: 'Available in Ontario',
      heading: 'Ask without rearranging your week',
      body: 'From cycle comfort to skin flare-ups, our Ontario pharmacists can chat through everyday concerns — and help you sort what you need on the spot.',
      cta: 'Talk to a Pharmacist',
      href: PHARMACIST_HREF,
      image: `${IMG}/care-chat-desk.jpg`,
    },
    closing: {
      heading: 'Wellness that works IRL',
      body: 'Stock what keeps your month soft, sleep when you can, and ask when something feels off.',
    },
    nextLabel: 'Next: Reset & Recharge',
  },
  // -------------------------------------------------------------------------
  // CHAPTER 03 — Reset & Recharge
  // -------------------------------------------------------------------------
  {
    slug: 'reset-and-recharge',
    num: '03',
    chapterWord: 'three',
    title: 'Reset & Recharge',
    heroBody:
      'Aspirational but accessible care for the years when hormones, stress, and skin ask for a softer reset — without making burnout a personal failure.',
    focus:
      'Hormonal imbalance, weight fluctuations, skin aging, stress, and burnout — met with practical support, not judgment.',
    vibe: 'Aspirational but accessible. Acknowledging burnout without making it a medical deficiency.',
    heroImage: `${IMG}/chapter-3.jpg`,
    accent: '#d7cfc7',
    categoriesIntro: {
      eyebrow: "What you'll find here",
      heading: 'Support for the loud weeks',
      body: 'Kits, supplements, and programs designed to help you feel more like yourself again — one calm step at a time.',
    },
    categories: [
      {
        title: 'Home Self-Assessment Kits',
        image: `${IMG}/kit-products/kit-preeclampsia-monitoring.png`,
        items: [
          'At-home kits to help you notice patterns and start a clearer conversation',
          'More kit options as the lineup grows',
        ],
        badge: 'Expanding',
      },
      {
        title: 'Essentials for Balance',
        image: `${IMG}/kit-products/kit-reset-recharge.png`,
        items: [
          'Hormone supplements',
          'Vitamins for everyday energy and resilience',
          'Stress kits',
          'Stress and sleep support',
          'GLP-1 / weight management support',
        ],
        badge: 'Future',
      },
    ],
    programsBand: {
      cards: [
        {
          heading: 'Energy & Hormone Reset Program',
          body: 'A guided path for the seasons when energy dips and hormones feel louder — practical steps, curated products, and room to breathe.',
        },
        {
          heading: 'Skin & Aging',
          body: 'Skin-loving staples and gentle rituals for the years when glow asks for a little more intention — still soft, still you.',
        },
      ],
    },
    pharmacist: {
      eyebrow: 'Available in Ontario',
      heading: 'When something feels off, ask',
      body: "Our Ontario pharmacists can chat through everyday concerns — sleep that won't come, skin that suddenly changes, stress that won't quiet — with the same discretion as the rest of Liivv.",
      cta: 'Talk to a Pharmacist',
      href: PHARMACIST_HREF,
      image: `${IMG}/care-chat-moment.jpg`,
    },
    closing: {
      heading: 'Reset, without the shame',
      body: 'Busy life is real. Your care can still feel aspirational — and reachable.',
    },
    nextLabel: 'Next: Grow & Recover',
  },
  // -------------------------------------------------------------------------
  // CHAPTER 04 — Grow & Recover
  // -------------------------------------------------------------------------
  {
    slug: 'grow-and-recover',
    num: '04',
    chapterWord: 'four',
    title: 'Grow & Recover',
    heroBody:
      'Empowering, deeply supportive care for the chapters that ask a lot of you — with strictly no shame.',
    focus:
      'Fertility challenges, physical discomfort, recovery after birth, and breastfeeding stress — with room to breathe.',
    vibe: 'Empowering, deeply supportive, and strictly no shame.',
    heroImage: `${IMG}/chapter-4.jpg`,
    accent: '#f3c7be',
    categoriesIntro: {
      eyebrow: 'Three parts of one chapter',
      heading: 'Fertility · Pregnancy · Postpartum',
      body: 'Wherever you are in this chapter, the essentials and answers stay close — so you can stay present for the good parts.',
    },
    categories: [
      {
        title: 'Fertility',
        image: `${IMG}/kit-products/kit-trying-to-conceive.png`,
        items: [
          'Ovulation and fertility tracking kits',
          'Nutrition support for trying to conceive',
          'Vitamins for fertility journeys',
          'Biofeedback devices and electronic pelvic floor stimulators',
          'Guidance on physical activity',
        ],
      },
      {
        title: 'Pregnancy',
        image: `${IMG}/kit-products/kit-prenatal-trimester.png`,
        sections: [
          {
            heading: 'Nutrition',
            items: [
              'Articles on proper nutrition during pregnancy',
              'Nutrition boosters like Ensure',
            ],
          },
          {
            heading: 'Vitamins',
            items: [
              'Prenatal vitamins — CarePack bundle',
              'Option to add your prescriptions',
              'Article on pre-eclampsia',
              'Gestational diabetes support',
              'Track blood sugars with a CGM',
            ],
          },
          {
            heading: 'Skin Care',
            items: ['Bio-Oil and stretch-mark care'],
          },
          {
            heading: 'Kits',
            items: ['Trimester kits', 'Hospital bag essentials'],
          },
        ],
      },
      {
        title: 'Postpartum',
        image: `${IMG}/kit-products/kit-fourth-trimester.png`,
        sections: [
          {
            heading: 'Nutrition',
            items: ['Articles on proper nutrition after pregnancy'],
          },
          {
            heading: 'Recovery Kits',
            items: ['Pads, sprays, sitz bath', 'Pelvic floor tools', 'Compression wear'],
          },
          {
            heading: 'Lactation',
            items: ['Breast pumps', 'Article on milk vs. formula'],
            note: 'No judgement — ever.',
          },
          {
            heading: 'Vitamins & Skin',
            items: ['Postnatal vitamins', 'Bio-Oil for recovering skin'],
          },
        ],
      },
    ],
    pharmacist: {
      eyebrow: 'Available in Ontario',
      heading: 'Support without the waiting room',
      body: 'Pregnancy and postpartum come with a lot of quiet questions. Our Ontario pharmacists are a chat away — kind, private, and never judgmental.',
      cta: 'Talk to a Pharmacist',
      href: PHARMACIST_HREF,
      image: `${IMG}/care-chat-main.jpg`,
    },
    closing: {
      heading: "You're not alone in this chapter",
      body: 'Essentials stocked. Answers close. Shame left at the door.',
    },
    nextLabel: 'Next: Transition & Relief',
  },
  // -------------------------------------------------------------------------
  // CHAPTER 05 — Transition & Relief
  // -------------------------------------------------------------------------
  {
    slug: 'transition-and-relief',
    num: '05',
    chapterWord: 'five',
    title: 'Transition & Relief',
    heroBody:
      'Reclaiming comfort — sleek, discreet, and highly effective support for sleep, mood, metabolism, and the changing years.',
    focus:
      'Sleep disruption, bone density loss, low metabolism, night sweats, and mood swings — comfort you can feel.',
    vibe: 'Reclaiming comfort. Sleek, discreet, and highly effective.',
    heroImage: `${IMG}/chapter-5.jpg`,
    accent: '#a89c94',
    categoriesIntro: {
      eyebrow: "What you'll find here",
      heading: 'Comfort through the change',
      body: 'Articles, products, and future prescriptions — organized so you can find what helps without euphemisms.',
    },
    categories: [
      {
        group: 'Symptom Relief',
        title: 'Articles on Perimenopause',
        image: `${IMG}/clair-official-peri.jpg`,
        items: [
          'Clear, kind resources on what perimenopause can feel like',
          'What to expect — and when to ask a pharmacist',
        ],
      },
      {
        group: 'Symptom Relief',
        title: 'Products for Comfort',
        image: `${IMG}/kit-products/kit-transition-hot-flash.png`,
        items: [
          'Cooling products for night sweats and hot flashes',
          'Sleep aids for disrupted nights',
          'Vitamins that support this chapter',
        ],
      },
      {
        group: 'Metabolic & Structural',
        title: 'Weight & Hormone Support',
        image: `${IMG}/kit-products/kit-transition-midlife.png`,
        items: [
          'Weight management support and hormone supplements',
          'Vitamin D + K2 for bone density (NPN)',
          'Black cohosh extracts',
          'Access to Menopause Hormone Therapy (MHT) prescriptions',
        ],
        badge: 'Future',
      },
    ],
    programsBand: {
      cards: [
        {
          heading: 'Cooling Sleepwear',
          body: "Discreet, sleek pieces designed for nights that run hot — comfort you don't have to explain.",
        },
        {
          heading: 'Cooling Bedding',
          body: 'Sheets and layers that help you reclaim sleep when night sweats interrupt the night.',
        },
      ],
    },
    pharmacist: {
      eyebrow: 'Available in Ontario',
      heading: 'No euphemisms required',
      body: "When your body is writing a new chapter, it helps to have someone who's read the book. Chat with an Ontario pharmacist about sleep, mood, and everyday comfort — privately.",
      cta: 'Talk to a Pharmacist',
      href: PHARMACIST_HREF,
      image: `${IMG}/door-care.jpg`,
    },
    closing: {
      heading: 'Reclaim the night',
      body: 'Sleek support for sleep, comfort, and the years that ask for a different kind of care.',
    },
    nextLabel: 'Next: Longevity & Vitality',
  },
  // -------------------------------------------------------------------------
  // CHAPTER 06 — Longevity & Vitality
  // -------------------------------------------------------------------------
  {
    slug: 'longevity-and-vitality',
    num: '06',
    chapterWord: 'six',
    title: 'Longevity & Vitality',
    heroBody:
      'Active, capable, and vibrant — joint comfort, brain health, and daily wellness without the stigma of aging aids.',
    focus:
      'Joint comfort, cognitive health, mobility, and energy — so the years ahead stay full of your favourite things.',
    vibe: 'Active, capable, and vibrant. Removing the stigma of aging aids.',
    heroImage: `${IMG}/chapter-6.jpg`,
    accent: '#8ea58d',
    categoriesIntro: {
      eyebrow: "What you'll find here",
      heading: 'More living, less managing',
      body: 'Support that looks and feels like it belongs in your life — designed for capability, not compromise.',
    },
    categories: [
      {
        title: 'Bone & Joint Health',
        image: `${IMG}/kit-products/kit-transition-midlife.png`,
        items: [
          'Balance & mobility aids — high-end, aesthetically pleasing rollators, canes, and supports',
          'Vertigo support and related everyday care',
          'Vitamins for joint support',
        ],
        note: 'Tools that help you stay mobile — without looking clinical.',
      },
      {
        title: 'Brain Health',
        image: `${IMG}/pillar-3.jpg`,
        items: [
          'Cognitive wellness essentials and supportive nutrition',
          'Habits and products that keep clarity part of everyday life',
        ],
      },
      {
        title: 'Daily Wellness Packs',
        image: `${IMG}/kit-products/kit-reset-recharge.png`,
        items: [
          'Day-by-day essentials organized into one calm pack',
          'Vitamins and supplements that travel with your routine',
          'Less shelf clutter, more living',
        ],
      },
    ],
    pharmacist: {
      eyebrow: 'Available in Ontario',
      heading: 'Minor Ailment Consultation',
      body: 'Joint discomfort, vertigo, energy dips — when something needs a professional ear, our Ontario pharmacists can assess and help with everyday concerns right in chat.',
      cta: 'Talk to a Pharmacist',
      href: PHARMACIST_HREF,
      image: `${IMG}/care-chat-moment.jpg`,
    },
    closing: {
      heading: 'Stay in your favourite things',
      body: 'Vitality that respects who you are — capable, vibrant, and still writing new chapters.',
    },
    nextLabel: 'Explore all chapters',
  },
];

export const LANDING_HREF = LANDING;

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
