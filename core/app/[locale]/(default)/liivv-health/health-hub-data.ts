/**
 * Liivv Health hub — eleven specialized micro-site doors.
 * Live verticals link through; the rest are Coming soon (no stub routes).
 */

const IMG = '/archive/liivv-home';

export type HealthHubDoorStatus = 'live' | 'coming_soon';

export type HealthHubDoor = {
  id: string;
  label: string;
  title: string;
  body: string;
  image: string;
  href: string | null;
  status: HealthHubDoorStatus;
};

export const HEALTH_HUB_DOORS: HealthHubDoor[] = [
  {
    id: 'womens_health_wellness',
    label: 'Live',
    title: "Women's Health & Wellness",
    body: 'Rhythm, chapters, and care that moves with your life.',
    image: `${IMG}/corner-womens.png`,
    href: '/liivv-health/womens-health',
    status: 'live',
  },
  {
    id: 'ostomy_care_everyday',
    label: 'Live',
    title: 'Ostomy Care & Everyday "Liivving"',
    body: 'Supplies, kits, and kind guidance for every day.',
    image: `${IMG}/corner-ostomy.png`,
    href: '/liivv-health/ostomy-care',
    status: 'live',
  },
  {
    id: 'diabetes_care_everyday',
    label: 'Live',
    title: 'Diabetes Care & Everyday "Liivving"',
    body: 'A specialized journey for living well with diabetes.',
    image: `${IMG}/corner-diabetes.png`,
    href: '/liivv-health/diabetes-care',
    status: 'live',
  },
  {
    id: 'sleep_rest',
    label: 'Coming soon',
    title: 'Sleep & Rest',
    body: 'Storytelling and kits for deeper, kinder rest.',
    image: `${IMG}/corner-sleep.png`,
    href: null,
    status: 'coming_soon',
  },
  {
    id: 'breathing_lung_health',
    label: 'Coming soon',
    title: 'Breathing & Lung Health',
    body: 'Guidance and essentials for clearer days.',
    image: `${IMG}/corner-breathing.png`,
    href: null,
    status: 'coming_soon',
  },
  {
    id: 'healing_advanced_wound',
    label: 'Coming soon',
    title: 'Healing & Advanced Wound Care',
    body: 'Specialized care when healing needs more than a shelf.',
    image: `${IMG}/corner-wound.png`,
    href: null,
    status: 'coming_soon',
  },
  {
    id: 'personal_care_confidence',
    label: 'Coming soon',
    title: 'Personal Care & Confidence',
    body: 'Everyday confidence, curated with care.',
    image: `${IMG}/corner-personal.png`,
    href: null,
    status: 'coming_soon',
  },
  {
    id: 'heart_blood_pressure',
    label: 'Coming soon',
    title: 'Heart & Blood Pressure',
    body: 'A calmer path for heart-forward living.',
    image: `${IMG}/corner-heart.png`,
    href: null,
    status: 'coming_soon',
  },
  {
    id: 'daily_nutrition_fuel',
    label: 'Coming soon',
    title: 'Daily Nutrition & Fuel',
    body: 'Fuel that fits the seasons of care.',
    image: `${IMG}/corner-nutrition.png`,
    href: null,
    status: 'coming_soon',
  },
  {
    id: 'skin_health_relief',
    label: 'Coming soon',
    title: 'Skin Health & Relief',
    body: 'Relief-focused storytelling for skin that needs more.',
    image: `${IMG}/corner-skin.png`,
    href: null,
    status: 'coming_soon',
  },
  {
    id: 'minor_ailment_on',
    label: 'Ontario only · Coming soon',
    title: 'Minor Ailment',
    body: 'Pharmacist-led minor ailment support for Ontario.',
    image: `${IMG}/corner-minor.png`,
    href: null,
    status: 'coming_soon',
  },
];

/** Short labels for the hero word-shuffle — all eleven care verticals. */
export const HEALTH_HUB_SHUFFLE_WORDS = [
  "Women's Health",
  'Ostomy Care',
  'Diabetes Care',
  'Sleep & Rest',
  'Breathing & Lung Health',
  'Healing & Wound Care',
  'Personal Care',
  'Heart & Blood Pressure',
  'Daily Nutrition',
  'Skin Health',
  'Minor Ailment',
] as const;

/** Marquee labels — all eleven care verticals. */
export const HEALTH_HUB_MARQUEE = [
  "Women's Health & Wellness",
  'Ostomy Care & Everyday "Liivving"',
  'Diabetes Care & Everyday "Liivving"',
  'Sleep & Rest',
  'Healing & Advanced Wound Care',
  'Personal Care & Confidence',
  'Heart & Blood Pressure',
  'Breathing & Lung Health',
  'Skin Health & Relief',
  'Daily Nutrition & Fuel',
  'Minor Ailment (Ontario)',
] as const;

export const HEALTH_HUB_STORY_LINKS = [
  {
    id: 'womens',
    label: "Women's Health",
    href: '/liivv-health/womens-health',
  },
  {
    id: 'ostomy',
    label: 'Ostomy Care',
    href: '/liivv-health/ostomy-care',
  },
  {
    id: 'diabetes',
    label: 'Diabetes Care',
    href: '/liivv-health/diabetes-care',
  },
] as const;

export type HealthHubKitCard = {
  entityId: number;
  name: string;
  path: string;
  image?: { src: string; alt: string };
  priceLabel?: string;
  verticalLabel: string;
  verticalHref: string;
  kitsSectionHref: string;
};
