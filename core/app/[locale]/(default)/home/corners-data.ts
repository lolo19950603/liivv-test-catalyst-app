/**
 * Liivv home — eleven micro-site "corners".
 * Live hrefs match storefront nav in inject-liivv-health-nav.ts.
 * Images: AI lifestyle set under /archive/liivv-home (Neutral Modern palette).
 */

const IMG = '/archive/liivv-home';

export type CornerStatus = 'live' | 'soon';

export type HomeCorner = {
  id: string;
  num: string;
  title: string;
  vibe: string;
  status: CornerStatus;
  href?: string;
  image: string;
  ontarioOnly?: boolean;
  /** Subtle accent for hover wash */
  accent: 'blush' | 'sage' | 'sand' | 'taupe';
  featured?: boolean;
};

export const HOME_CORNERS: HomeCorner[] = [
  {
    id: 'womens_health_wellness',
    num: '01',
    title: "Women's Health & Wellness",
    vibe: 'Your season, your edit — kits, care, and Clair.',
    status: 'live',
    href: '/liivv-health/womens-health',
    image: `${IMG}/corner-womens.png`,
    accent: 'blush',
    featured: true,
  },
  {
    id: 'ostomy_care_everyday',
    num: '02',
    title: 'Ostomy Care & Everyday Living',
    vibe: 'Supplies and soft routines so life feels yours again.',
    status: 'live',
    href: '/pages/ostomy-care',
    image: `${IMG}/corner-ostomy.png`,
    accent: 'sand',
  },
  {
    id: 'diabetes_care_everyday',
    num: '03',
    title: 'Diabetes Care & Everyday Living',
    vibe: 'Meters, habits, and calm support that keep pace with you.',
    status: 'live',
    href: '/pages/diabetes-care',
    image: `${IMG}/corner-diabetes.png`,
    accent: 'sage',
  },
  {
    id: 'sleep_rest',
    num: '04',
    title: 'Sleep & Rest',
    vibe: 'Quieter nights, softer mornings.',
    status: 'soon',
    image: `${IMG}/corner-sleep.png`,
    accent: 'taupe',
  },
  {
    id: 'breathing_lung_health',
    num: '05',
    title: 'Breathing & Lung Health',
    vibe: 'Room to breathe — tools for everyday air.',
    status: 'soon',
    image: `${IMG}/corner-breathing.png`,
    accent: 'sage',
  },
  {
    id: 'healing_advanced_wound',
    num: '06',
    title: 'Healing & Advanced Wound Care',
    vibe: 'Gentle care for skin that is healing.',
    status: 'soon',
    image: `${IMG}/corner-wound.png`,
    accent: 'sand',
  },
  {
    id: 'personal_care_confidence',
    num: '07',
    title: 'Personal Care & Confidence',
    vibe: 'The everyday stuff that helps you show up as you.',
    status: 'soon',
    image: `${IMG}/corner-personal.png`,
    accent: 'blush',
  },
  {
    id: 'heart_blood_pressure',
    num: '08',
    title: 'Heart & Blood Pressure',
    vibe: 'Steady habits for the long game.',
    status: 'soon',
    image: `${IMG}/corner-heart.png`,
    accent: 'blush',
  },
  {
    id: 'daily_nutrition_fuel',
    num: '09',
    title: 'Daily Nutrition & Fuel',
    vibe: 'Fuel that fits real days, not perfect ones.',
    status: 'soon',
    image: `${IMG}/corner-nutrition.png`,
    accent: 'sage',
  },
  {
    id: 'skin_health_relief',
    num: '10',
    title: 'Skin Health & Relief',
    vibe: 'Comfort for skin that asks for kindness.',
    status: 'soon',
    image: `${IMG}/corner-skin.png`,
    accent: 'sand',
  },
  {
    id: 'minor_ailment_on',
    num: '11',
    title: 'Minor Ailment (Ontario Only)',
    vibe: 'Quick, kind pharmacist help when something small will not wait.',
    status: 'soon',
    image: `${IMG}/corner-minor.png`,
    accent: 'taupe',
    ontarioOnly: true,
  },
];
