import { HEALTH_HUB_DOORS } from '~/app/[locale]/(default)/liivv-health/health-hub-data';
import {
  consentedCategoryResponses,
  healthAnswersSafetyReferralApplies,
} from '~/lib/onboarding/health-profile-consent';
import { formatHealthProfileAnswer } from '~/lib/onboarding/health-profile-display';
import {
  getPrimaryCategoryDisplay,
  resolveInitialHealthCategoriesWithRank,
  type LiivPrimaryCategoryId,
} from '~/lib/onboarding/liiv-primary-health-category';

export type CareTone = 'sage' | 'peach' | 'rose' | 'lavender' | 'sand' | 'mist';

export type CareSnapshotChip = {
  label: string;
  value: string;
};

export type CareAction = {
  id: string;
  label: string;
  href: string;
  kind: 'primary' | 'secondary';
};

export type CareNextStep = {
  id: string;
  label: string;
  hint: string;
  href: string;
  /** Set when `href` leaves Liivv, so the canvas renders a plain anchor. */
  external?: boolean;
};

export type PersonalizedCareLane = {
  id: LiivPrimaryCategoryId;
  label: string;
  emoji: string;
  tone: CareTone;
  image: string | null;
  status: 'live' | 'coming_soon';
  href: string | null;
  shopHref: string | null;
  headline: string;
  lead: string;
  tipTitle: string;
  tipBody: string;
  snapshot: CareSnapshotChip[];
  actions: CareAction[];
  nextSteps: CareNextStep[];
  oliviaLines: string[];
};

type CategoryResponses = Record<string, string | string[] | boolean | null>;

interface LaneCopy {
  headline: string;
  lead: string;
  oliviaLines: string[];
  tip: { title: string; body: string };
  nextSteps: CareNextStep[];
  // Set by a lane when the answers behind it must not be met with a shop door.
  // A change in fit or skin is a clinical question, so the ostomy body_change
  // stage sends people to their NSWOC instead of to the shelf.
  suppressShop?: boolean;
}

/*
 * What a lane must do for someone whether or not they consented to Liivv using
 * their answers. These are protections, not personalization: every one of them
 * only ever takes a commercial nudge away and puts a clinician in its place, so
 * reading the answer to decide it is safe when a tick is missing, and failing
 * the other way — restoring the nudge for someone who told us their body has
 * changed — is not. See `protectionsFromAnswers`.
 */
interface LaneProtections {
  ostomyFitReferral: boolean;
}

/* NSWOCC's own directory of nurses, named in the link text (D1). */
const NSWOC_DIRECTORY_HREF = 'https://membersnswoc.ca/find.phtml';

const CATEGORY_RESPONSE_KEYS: Record<LiivPrimaryCategoryId, string[]> = {
  diabetes_care_everyday: ['diabetes_path', 'diabetes_journey_stage', 'diabetes_management'],
  ostomy_care_everyday: ['ostomy_type', 'ostomy_journey_stage', 'ostomy_preferred_brand'],
  womens_health_wellness: ['womens_age_range', 'womens_life_phase'],
  sleep_rest: ['sleep_rest_barrier', 'sleep_rest_cpap_status'],
  healing_advanced_wound: ['wound_support_type'],
  minor_ailment_on: ['minor_ailment_focus'],
  personal_care_confidence: ['personal_care_priority'],
  breathing_lung_health: ['breathing_routine'],
  heart_blood_pressure: ['heart_tracking_pref', 'heart_circulation_issue'],
  skin_health_relief: ['skin_goal', 'skin_rules'],
  daily_nutrition_fuel: ['nutrition_fuel_focus', 'nutrition_guardrails'],
};

const FIELD_LABELS: Record<string, string> = {
  diabetes_path: 'Path',
  diabetes_journey_stage: 'Journey',
  diabetes_management: 'Management',
  ostomy_type: 'Type',
  ostomy_journey_stage: 'Journey',
  ostomy_preferred_brand: 'Brand',
  womens_age_range: 'Age',
  womens_life_phase: 'Focus',
  sleep_rest_barrier: 'Sleep',
  sleep_rest_cpap_status: 'Support',
  wound_support_type: 'Support',
  minor_ailment_focus: 'Focus',
  personal_care_priority: 'Priority',
  breathing_routine: 'Routine',
  heart_tracking_pref: 'Tracking',
  heart_circulation_issue: 'Circulation',
  skin_goal: 'Goal',
  skin_rules: 'Rules',
  nutrition_fuel_focus: 'Fuel',
  nutrition_guardrails: 'Guardrails',
};

const TONE_BY_CATEGORY: Record<LiivPrimaryCategoryId, CareTone> = {
  diabetes_care_everyday: 'sage',
  ostomy_care_everyday: 'sand',
  womens_health_wellness: 'peach',
  sleep_rest: 'lavender',
  healing_advanced_wound: 'mist',
  minor_ailment_on: 'sage',
  personal_care_confidence: 'peach',
  breathing_lung_health: 'mist',
  heart_blood_pressure: 'rose',
  skin_health_relief: 'sand',
  daily_nutrition_fuel: 'sage',
};

const HUB_BY_CATEGORY: Partial<Record<LiivPrimaryCategoryId, string>> = {
  diabetes_care_everyday: '/liivv-health/diabetes-care',
  ostomy_care_everyday: '/liivv-health/ostomy-care',
  womens_health_wellness: '/liivv-health/womens-health',
};

const SHOP_BY_CATEGORY: Partial<Record<LiivPrimaryCategoryId, string>> = {
  diabetes_care_everyday: '/liivv-health/diabetes-care/shop-diabetes-care',
  ostomy_care_everyday: '/liivv-health/ostomy-care/shop-ostomy-care',
  womens_health_wellness: '/liivv-health/womens-health/shop-womens-health',
};

function asString(value: string | string[] | boolean | null | undefined): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

function asList(value: string | string[] | boolean | null | undefined): string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];
}

const OLIVIA_GREETINGS = [
  'Hi — I am Olivia. I saved you a seat.',
  'Hey. No rush. Excellent posture, infinite patience.',
  'Welcome in. I live in this corner now.',
];

function uniqueLines(lines: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  for (const line of lines) {
    const trimmed = line?.trim();

    if (!trimmed || seen.has(trimmed)) {
      continue;
    }

    seen.add(trimmed);
    out.push(trimmed);
  }

  return out;
}

function oliviaVoice(focus: string, flavor: readonly string[]): string[] {
  return uniqueLines([focus, ...flavor, ...OLIVIA_GREETINGS]);
}

function pickByDay<T>(items: readonly T[], now: Date): T {
  const first = items[0];

  if (first === undefined) {
    throw new Error('pickByDay requires at least one item.');
  }

  if (items.length === 1) {
    return first;
  }

  const start = Date.UTC(now.getFullYear(), 0, 0);
  const day = Math.floor((now.getTime() - start) / 86_400_000);

  return items[Math.abs(day) % items.length] ?? first;
}

function snapshotForCategory(
  categoryId: LiivPrimaryCategoryId,
  responses: CategoryResponses,
): CareSnapshotChip[] {
  const keys = CATEGORY_RESPONSE_KEYS[categoryId];
  const chips: CareSnapshotChip[] = [];

  for (const key of keys) {
    const formatted = formatHealthProfileAnswer(responses[key]);

    if (!formatted) {
      continue;
    }

    chips.push({
      label: FIELD_LABELS[key] ?? 'Detail',
      value: formatted,
    });
  }

  return chips.slice(0, 4);
}

function diabetesLane(responses: CategoryResponses, now: Date) {
  const path = asString(responses.diabetes_path);
  const stage = asString(responses.diabetes_journey_stage);
  const management = asList(responses.diabetes_management);
  const usesCgm = management.includes('cgm');
  const usesPump = management.includes('insulin_pump');

  let headline = 'Diabetes care, tuned to this week';
  let lead =
    'Supplies, rhythm, and a quieter place to keep everyday diabetes living on track.';
  let oliviaFocus = 'This is your diabetes corner. I stacked the useful bits up front.';
  let storyHref = '/liivv-health/diabetes-care/chapters/your-diabetes-journey';
  let storyLabel = 'Open your diabetes journey';

  if (path === 'type_1') {
    headline = 'Type 1 care with fewer loose ends';
    lead = 'Keep insulin tools, sensors, and backups in one calm lane — ready when the day shifts.';
    storyHref = '/liivv-health/diabetes-care/chapters/type-1';
    storyLabel = 'Open the Type 1 chapter';
  } else if (path === 'type_2') {
    headline = 'Type 2 care that fits real life';
    lead = 'A steadier mix of supplies, food rhythm, and support for the hours between appointments.';
    storyHref = '/liivv-health/diabetes-care/chapters/type-2';
    storyLabel = 'Open the Type 2 chapter';
  } else if (path === 'gestational') {
    headline = 'Gestational care, held with extra gentleness';
    lead = 'Short-season support for monitoring, comfort, and questions that cannot wait.';
    storyHref = '/liivv-health/diabetes-care/chapters/gestational';
    storyLabel = 'Open gestational care';
  } else if (path === 'pre_diabetes') {
    headline = 'Prediabetes — a calmer course-correct';
    lead = 'Small, repeatable habits and the right tools before anything feels urgent.';
    storyHref = '/liivv-health/diabetes-care/chapters/prediabetes';
    storyLabel = 'Open the prediabetes chapter';
  }

  if (stage === 'newly_diagnosed') {
    headline = path ? `New to ${formatHealthProfileAnswer(path) ?? 'diabetes'} — start gently` : 'New to diabetes — start gently';
    lead = 'You do not have to learn everything today. A starter path, a pharmacist, and Olivia for the store bits.';
    oliviaFocus = 'New diagnosis energy is a lot. I made this corner quieter on purpose.';
    storyHref = '/liivv-health/diabetes-care/chapters/new-to-the-journey';
    storyLabel = 'Start the new-to-the-journey chapter';
  } else if (stage === 'hitting_a_wall') {
    headline = 'A reset, without starting over';
    lead = 'When the routine stops working, restock the tools and rewrite the rhythm — not the whole story.';
    oliviaFocus = 'Walls happen. We restock, we simplify, we keep going.';
  } else if (stage === 'veteran' && usesCgm) {
    headline = 'Your CGM rhythm, kept stocked';
    lead = 'Sensors, backups, and the everyday bits that keep a veteran routine from wobbling.';
    oliviaFocus = 'Veteran energy. I am here for the unglamorous restock.';
  } else if (usesPump) {
    headline = 'Pump sites, backups, and the rest of the kit';
    lead = 'Infusion sets and a plan B belong on the same shelf. We will help you keep both close.';
    oliviaFocus = 'Pump life is logistics. I am surprisingly good at logistics.';
  }

  const tips = usesCgm
    ? [
        {
          title: 'Sensor backup',
          body: 'Keep one extra sensor in the rotation so a failed session never derails the day.',
        },
        {
          title: 'Site rest',
          body: 'Rotate insertion sites before they complain. A small calendar reminder is enough.',
        },
        {
          title: 'On-the-go kit',
          body: 'A slim pouch with wipes, a spare, and glucose tabs turns surprises into errands.',
        },
      ]
    : [
        {
          title: 'Rhythm over perfection',
          body: 'A repeatable morning check beats an ambitious plan you abandon by Thursday.',
        },
        {
          title: 'Supplies before scramble',
          body: 'Reorder when you still have a week left. Future-you will be insufferably grateful.',
        },
        {
          title: 'Hours between appointments',
          body: 'Food, movement, and rest are part of diabetes care — not extras you earn later.',
        },
      ];

  const tip = pickByDay(tips, now);
  const nextSteps: CareNextStep[] = [
    {
      id: 'story',
      label: storyLabel,
      hint: 'A chapter written for this path',
      href: storyHref,
    },
    {
      id: 'carepack',
      label: 'Set up CarePack',
      hint: 'Never forget another dose',
      href: '/account/pharmacy?section=carepack',
    },
    {
      id: 'pharmacy',
      label: 'My pharmacy',
      hint: 'Manage prescriptions in one place',
      href: '/account/pharmacy',
    },
  ];

  return {
    headline,
    lead,
    oliviaLines: oliviaVoice(oliviaFocus, [
      'This is your diabetes corner. I stacked the useful bits up front.',
      'Hey — I am Olivia. Supplies and rhythm, without the lecture.',
      'Food, movement, and rest count. I will not make it a speech.',
      'I am here for the unglamorous restock. Shall we?',
    ]),
    tip,
    nextSteps,
  };
}

function ostomyLane(
  responses: CategoryResponses,
  now: Date,
  protections: LaneProtections,
): LaneCopy {
  const type = asString(responses.ostomy_type);
  const stage = asString(responses.ostomy_journey_stage);
  const brand = asString(responses.ostomy_preferred_brand);
  const typeLabel = formatHealthProfileAnswer(type);
  const brandLabel =
    brand && brand !== 'not_sure' ? formatHealthProfileAnswer(brand) : null;

  let headline = 'Ostomy care for everyday Liivving';
  let lead = 'Pouching, skin, and restock — kept kind, practical, and close at hand.';
  let oliviaFocus = 'Ostomy corner. Questions about fit or skin go to your NSWOC.';
  let storyHref = '/liivv-health/ostomy-care';
  let storyLabel = 'Open Ostomy Care';

  // The referral comes first because it is the one branch that does not depend
  // on consent: it is set from the stored answer either way, so it cannot be
  // undercut by a later branch reading the consented copy of the same answer.
  if (protections.ostomyFitReferral) {
    headline = 'When the fit changes, start with your NSWOC';
    lead =
      'A change in your body can change how your pouching system fits. Your NSWOC can check it with you.';
    oliviaFocus = 'Fit issues are information, not failure. I saved the useful chapter.';
    storyHref = '/liivv-health/ostomy-care/chapters/get-to-know-your-stoma';
    storyLabel = 'Open stoma and fit guidance';
  } else if (stage === 'starting_out') {
    headline = 'New ostomy journey — we will go slowly';
    lead = 'Fit, skin, and first supplies without the overwhelm. A starter path, then the restock habit.';
    oliviaFocus = 'Starting out is a lot of new verbs. I will keep the list short.';
    storyHref = '/liivv-health/ostomy-care/chapters/new-to-the-journey';
    storyLabel = 'Start the new-to-the-journey chapter';
  } else if (stage === 'restocking') {
    headline = brandLabel
      ? `Restocking ${brandLabel} — stay ahead of empty`
      : 'Restocking, without the Sunday scramble';
    lead = typeLabel
      ? `${typeLabel} supplies on a quieter loop — order before you are counting wafers.`
      : 'Keep your preferred pouching system looping so everyday life stays uneventful.';
    oliviaFocus = 'Restocking is my love language. Shall we?';
    storyHref = '/liivv-health/ostomy-care/chapters/everyday-liivving';
    storyLabel = 'Open everyday Liivving';
  } else if (typeLabel) {
    headline = `${typeLabel} care, kept ready`;
    lead = brandLabel
      ? `Your ${brandLabel} setup plus skin care and backups for the days that do not go to plan.`
      : 'Pouching, skin, and a backup pouch in the same mental drawer.';
  }

  const tip = pickByDay(
    [
      {
        title: 'Skin first',
        body: 'A calm peristomal routine — clean, dry, then pouch — prevents most of the drama.',
      },
      {
        title: 'The emergency pouch',
        body: 'One complete change kit in a bag you actually carry. Uneventful is the goal.',
      },
      {
        title: 'Hydration is gear',
        body: 'Especially with an ileostomy: electrolytes belong next to the wafers, not as an afterthought.',
      },
    ],
    now,
  );

  // A fit or skin change belongs with an NSWOC, so this stage keeps the chapter
  // and drops every step that would answer it with a product or a pharmacist.
  const fitReferral = protections.ostomyFitReferral;
  const nextSteps: CareNextStep[] = [
    {
      id: 'story',
      label: storyLabel,
      hint: 'Guidance for this exact season',
      href: storyHref,
    },
  ];

  if (fitReferral) {
    // The lane's own words say to start with an NSWOC, so it has to give a way
    // to reach one. NSWOCC's directory is the same one the chapters use.
    nextSteps.push({
      id: 'nswoc',
      label: 'Find an NSWOC',
      hint: 'NSWOCC directory of nurses — opens membersnswoc.ca',
      href: NSWOC_DIRECTORY_HREF,
      external: true,
    });
  } else {
    nextSteps.push(
      {
        id: 'shop',
        label: 'Shop ostomy essentials',
        hint: brandLabel ? `Browse ${brandLabel} and backups` : 'Pouching, skin, and kits',
        href: '/liivv-health/ostomy-care/shop-ostomy-care',
      },
      {
        id: 'virtual',
        label: 'Ask a pharmacist',
        hint: 'Ontario, during care hours',
        href: '/account/virtual-care',
      },
    );
  }

  return {
    headline,
    lead,
    oliviaLines: oliviaVoice(oliviaFocus, [
      'Hey — I am Olivia. Skin care and a backup pouch, same thought.',
      'Uneventful is the goal. I am surprisingly good at uneventful.',
    ]),
    tip,
    nextSteps,
    suppressShop: fitReferral,
  };
}

function womensLane(responses: CategoryResponses, now: Date) {
  const phase = asString(responses.womens_life_phase);
  const age = asString(responses.womens_age_range);

  let headline = "Women's health, in this season";
  let lead = 'Rhythm, comfort, and products that move with the phase you are actually in.';
  let oliviaFocus = 'Your women\'s health lane. I brought the kind chapter, not the lecture.';
  let storyHref = '/liivv-health/womens-health';
  let storyLabel = "Open Women's Health";
  let extraStep: CareNextStep | null = null;

  if (phase === 'rhythm_balance') {
    headline = 'Everyday rhythm, cycles, and balance';
    lead = 'Cycle care, comfort, and a shop that assumes your month has more than one mood.';
    storyHref = '/liivv-health/womens-health/chapters/rhythm-and-balance';
    storyLabel = 'Open rhythm and balance';
  } else if (phase === 'fertility_recovery') {
    headline = 'Fertility, pregnancy, and recovery support';
    lead = 'A gentler lane for growing, recovering, and finding products that do not shout.';
    storyHref = '/liivv-health/womens-health/chapters/grow-and-recover';
    storyLabel = 'Open grow and recover';
  } else if (phase === 'menopause_comfort') {
    headline = 'Perimenopause and menopause, held with comfort';
    lead = 'Sleep, temperature, intimacy, and the unglamorous supplies that make this chapter livable.';
    oliviaFocus = 'Comfort first. Rhythm second. Shopping third. I have the order.';
    storyHref = '/liivv-health/womens-health/chapters/transition-and-relief';
    storyLabel = 'Open transition and relief';
    extraStep = {
      id: 'clair',
      label: 'Explore Clair Health',
      hint: 'A calmer read on this season',
      href: '/liivv-health/womens-health/clair-health',
    };
  } else if (phase === 'aging_gracefully') {
    headline = 'Longevity with softness, not a checklist';
    lead = 'Skin, strength, rest, and products chosen for this chapter — not a younger one.';
    storyHref = '/liivv-health/womens-health/chapters/longevity-and-vitality';
    storyLabel = 'Open longevity and vitality';
  } else if (age === '18_30' || age === 'under_18') {
    headline = 'Foundation years — first cycles, first kits';
    lead = 'A quiet start: the essentials, explained without embarrassment.';
    storyHref = '/liivv-health/womens-health/chapters/foundation-first-cycles';
    storyLabel = 'Open foundation and first cycles';
  }

  const tip = pickByDay(
    [
      {
        title: 'Name the season',
        body: 'Care gets easier when the products match the chapter you are in, not the one you used to be in.',
      },
      {
        title: 'Comfort is clinical',
        body: 'Sleep, temperature, and skin are not extras. They are the job this month.',
      },
      {
        title: 'Restock the unglamorous',
        body: 'The useful kit is the one you will actually use at 11 p.m. Keep it boring and nearby.',
      },
    ],
    now,
  );

  const nextSteps: CareNextStep[] = [
    {
      id: 'story',
      label: storyLabel,
      hint: 'A chapter for this phase of life',
      href: storyHref,
    },
    {
      id: 'shop',
      label: "Shop Women's Health",
      hint: 'Kits and everyday essentials',
      href: '/liivv-health/womens-health/shop-womens-health',
    },
  ];

  if (extraStep) {
    nextSteps.push(extraStep);
  } else {
    nextSteps.push({
      id: 'virtual',
      label: 'Virtual care',
      hint: 'Book a consult when you need a person',
      href: '/account/virtual-care',
    });
  }

  return {
    headline,
    lead,
    oliviaLines: oliviaVoice(oliviaFocus, [
      'Your women\'s health lane. I brought the kind chapter, not the lecture.',
      'Hey — I am Olivia. This season, not a younger one.',
      'Comfort first. Rhythm second. Shopping third.',
    ]),
    tip,
    nextSteps,
  };
}

function genericLane(categoryId: LiivPrimaryCategoryId, label: string, now: Date): LaneCopy {
  const catalog: Partial<
    Record<
      LiivPrimaryCategoryId,
      {
        headline: string;
        lead: string;
        oliviaLines: string[];
        tips: Array<{ title: string; body: string }>;
      }
    >
  > = {
    sleep_rest: {
      headline: 'Sleep that treats you like a person',
      lead: 'Wind-down, night sweats, apnea comfort — a quieter kit for the hours after the day.',
      oliviaLines: [
        'Sleep corner. I dimmed the lights. Metaphorically. I am a mascot.',
        'Hey — I am Olivia. The last hour of the day is the job.',
        'Cooler room, same cue, fewer negotiations with the closet.',
      ],
      tips: [
        {
          title: 'Protect the last hour',
          body: 'Dimmer lights, cooler room, same cue each night. The body loves boring rituals.',
        },
        {
          title: 'Heat at 3 a.m.',
          body: 'Keep a cool layer and a warm layer within reach so you are not negotiating with the closet.',
        },
        {
          title: 'If a machine is in the mix',
          body: 'Clean parts and a spare mask cushion prevent the night from becoming a project.',
        },
      ],
    },
    heart_blood_pressure: {
      headline: 'Heart-forward living, without the noise',
      lead: 'Monitoring, circulation, and everyday habits that keep blood pressure in the conversation — calmly.',
      oliviaLines: [
        'Heart lane. We are going for steady, not dramatic.',
        'Hey — I am Olivia. Same time, same chair, calmer numbers.',
        'Steady is the vibe. I packed the boring rituals.',
      ],
      tips: [
        {
          title: 'Same time, same chair',
          body: 'Blood pressure readings are more useful when the ritual is identical.',
        },
        {
          title: 'Legs at the end of the day',
          body: 'If swelling shows up, elevation and supportive wear are allowed to be boring and daily.',
        },
        {
          title: 'Write one number down',
          body: 'A tiny log beats a perfect app you never open.',
        },
      ],
    },
    healing_advanced_wound: {
      headline: 'Healing with a plan, not a drawer of maybes',
      lead: 'Dressings, skin protection, and restock cues for wounds that need more than a shelf.',
      oliviaLines: [
        'Wound care is logistics plus gentleness. I packed both.',
        'Hey — I am Olivia. Healing hates hunting. I kept the kit together.',
        'A schedule beats waiting until it feels urgent.',
      ],
      tips: [
        {
          title: 'Change on a schedule',
          body: 'A reminder for dressing changes beats waiting until it feels urgent.',
        },
        {
          title: 'Keep a clean kit',
          body: 'Gloves, dressings, and tape in one bag. Healing hates hunting.',
        },
      ],
    },
    breathing_lung_health: {
      headline: 'Clearer days, one routine at a time',
      lead: 'Nebulizer care, seasonal flare-ups, and the unglamorous parts that keep breathing easier.',
      oliviaLines: [
        'Lung lane. Hydration, filters, and fewer surprises.',
        'Hey — I am Olivia. Clearer days, one routine at a time.',
        'Saline, masks, filters — I kept them in the same thought.',
      ],
      tips: [
        {
          title: 'Clean the device',
          body: 'A washed nebulizer is treatment. A neglected one is a hobby you did not ask for.',
        },
        {
          title: 'Seasonal kit',
          body: 'Keep saline, masks, and filters together before pollen or a cold makes it a scramble.',
        },
      ],
    },
    personal_care_confidence: {
      headline: 'Confidence that fits under clothes',
      lead: 'Discreet fit, absorbency, and the products that let the day be about the day.',
      oliviaLines: [
        'Personal care, zero embarrassment. I have excellent poker face.',
        'Hey — I am Olivia. Discreet, practical, and not a lecture.',
        'Fit is the product. I will help you find it.',
      ],
      tips: [
        {
          title: 'Fit is the product',
          body: 'The right size and absorbency matter more than a brand story.',
        },
        {
          title: 'A spare in the bag',
          body: 'One extra in the everyday bag is the whole strategy.',
        },
      ],
    },
    skin_health_relief: {
      headline: 'Skin that needs relief, not a 12-step',
      lead: 'Calm flare-ups, hydrate the dry bits, and skip anything that stings for sport.',
      oliviaLines: [
        'Skin lane. Fragrance-free is a personality trait here.',
        'Hey — I am Olivia. Relief, not a 12-step.',
        'Patch, then commit. Dramatic skin prefers a dress rehearsal.',
      ],
      tips: [
        {
          title: 'Patch, then commit',
          body: 'New products on a small area first. Dramatic skin prefers a dress rehearsal.',
        },
        {
          title: 'Moisture while damp',
          body: 'Seal hydration right after washing — it does more than a thicker cream later.',
        },
      ],
    },
    daily_nutrition_fuel: {
      headline: 'Fuel that matches the day you are having',
      lead: 'Shakes, supplements, and guardrails — diabetic-friendly, dairy-free, or just easier.',
      oliviaLines: [
        'Nutrition lane. I will not lecture you about a grain bowl.',
        'Hey — I am Olivia. Fuel that matches the day you are having.',
        'One reliable option for the days cooking is not happening.',
      ],
      tips: [
        {
          title: 'One reliable option',
          body: 'Keep a complete shake you actually like for the days cooking is not happening.',
        },
        {
          title: 'Guardrails on the label',
          body: 'If sugar, dairy, or renal needs matter, filter the shelf before you fall in love with packaging.',
        },
      ],
    },
    minor_ailment_on: {
      headline: 'Minor ailment support, Ontario-side',
      lead: 'Pharmacist-led help for the small things that still ruin a Tuesday.',
      oliviaLines: [
        'Minor ailments, major dignity. Book the consult — I will hold your cart.',
        'Hey — I am Olivia. Small things still ruin a Tuesday. I know.',
        'If it is on the list, a pharmacist can be the shortest path.',
      ],
      tips: [
        {
          title: 'Do not wait it out by default',
          body: 'If it is on the minor-ailment list, a pharmacist consult can be the shortest path.',
        },
        {
          title: 'Bring the extras',
          body: 'Allergies, pregnancy, and current meds make the visit useful on the first try.',
        },
      ],
    },
  };

  const entry = catalog[categoryId];
  const tip = entry ? pickByDay(entry.tips, now) : {
    title: 'A quieter care lane',
    body: 'We will keep this path warm with practical tips and the right shop door, as soon as it opens.',
  };

  const nextSteps: CareNextStep[] = [
    {
      id: 'hub',
      label: 'Browse Liivv Health',
      hint: 'All care stories in one place',
      href: '/liivv-health',
    },
    {
      id: 'virtual',
      label: 'Virtual care',
      hint: 'A person, when you need one',
      href: '/account/virtual-care',
    },
    {
      id: 'pharmacy',
      label: 'My pharmacy',
      hint: 'Prescriptions and CarePack',
      href: '/account/pharmacy',
    },
  ];

  if (categoryId === 'minor_ailment_on') {
    nextSteps[0] = {
      id: 'consult',
      label: 'Book minor ailment consulting',
      hint: 'Ontario, 19+',
      href: '/account/virtual-care',
    };
  }

  return {
    headline: entry?.headline ?? `${label} — your lane`,
    lead:
      entry?.lead ??
      'Products, treatment, and everyday support for this part of your health profile.',
    oliviaLines: oliviaVoice(
      entry?.oliviaLines?.[0] ?? `This is your ${label} corner. Tap around — I will keep up.`,
      entry?.oliviaLines ?? [`Your ${label} lane. I will keep up.`],
    ),
    tip,
    nextSteps,
  };
}

function resolveLaneCopy(
  categoryId: LiivPrimaryCategoryId,
  label: string,
  responses: CategoryResponses,
  now: Date,
  protections: LaneProtections,
): LaneCopy {
  if (categoryId === 'diabetes_care_everyday') {
    return diabetesLane(responses, now);
  }

  if (categoryId === 'ostomy_care_everyday') {
    return ostomyLane(responses, now, protections);
  }

  if (categoryId === 'womens_health_wellness') {
    return womensLane(responses, now);
  }

  return genericLane(categoryId, label, now);
}

/*
 * An answer shapes a lane only when the person gave express consent for Liivv
 * to use that answer. Consent is per answer, not per row: a tick given on one
 * landing quiz covers the answers on that page, so answers from some earlier
 * visit that no tick covers are left out here even though they are still on
 * file. Without any covered answer the lane is still built — from the category
 * they chose — but it says nothing back to them about their own answers, and
 * the snapshot chips stay empty. Consent is read from the same notes field the
 * answers live in, so no caller can pass one without the other.
 */
function responsesForLanes(notes: string | null | undefined): CategoryResponses {
  return consentedCategoryResponses(notes);
}

/*
 * Read from the stored answers without asking whether consent covers them,
 * which is deliberate and is the one place in this file that does it.
 *
 * D16 takes "Shop this path", "Ask a pharmacist" and "Shop ostomy essentials"
 * away from someone who told us their body or their fit has recently changed,
 * and sends them to an NSWOC instead. Hanging that on a consent record would
 * fail the wrong way: every profile stored before the consent box existed
 * carries no tick, and those are exactly the people who would get the shop
 * steering back. A protection that only ever removes a commercial nudge is not
 * a use of the answer that needs permission — refusing to sell to someone is
 * not personalization — so it is read from the raw answers and fails safe.
 * Withdrawing consent does not switch it off either, for the same reason.
 *
 * Nothing else may be read this way. Anything that speaks a person's answers
 * back to them, or that adds a door rather than removing one, goes through
 * `responsesForLanes` and stays behind consent.
 *
 * The test itself lives in the consent module, beside the consent it is the
 * exception to, so the staff page that has to describe this carve-out and the
 * dashboard that applies it cannot drift apart.
 */
function protectionsFromAnswers(notes: string | null | undefined): LaneProtections {
  return {
    ostomyFitReferral: healthAnswersSafetyReferralApplies(notes),
  };
}

export function buildPersonalizedCareLanes(options: {
  careInterests: string[];
  healthProfileNotes: string | null | undefined;
  now?: Date;
}): PersonalizedCareLane[] {
  const now = options.now ?? new Date();
  const ranked = resolveInitialHealthCategoriesWithRank(options.careInterests);
  const responses = responsesForLanes(options.healthProfileNotes);
  const protections = protectionsFromAnswers(options.healthProfileNotes);

  return ranked.map(({ id }) => {
    const display = getPrimaryCategoryDisplay(id);
    const door = HEALTH_HUB_DOORS.find((entry) => entry.id === id);
    const copy = resolveLaneCopy(id, display.shortLabel, responses, now, protections);
    const href = HUB_BY_CATEGORY[id] ?? door?.href ?? null;
    // No shop door — and so no 'Shop this path' action — when the lane's own
    // answers call for a clinician rather than a product.
    const shopHref = copy.suppressShop ? null : (SHOP_BY_CATEGORY[id] ?? null);
    const story = copy.nextSteps.find((step) => step.id === 'story');
    const exploreHref = story?.href ?? href;
    const live = Boolean(href);
    const snapshot = snapshotForCategory(id, responses);
    const actions: CareAction[] = [];

    if (exploreHref) {
      actions.push({
        id: 'explore',
        label: `Explore ${display.shortLabel}`,
        href: exploreHref,
        kind: 'primary',
      });
    }

    if (shopHref) {
      actions.push({
        id: 'shop',
        label: 'Shop this path',
        href: shopHref,
        kind: href ? 'secondary' : 'primary',
      });
    }

    if (actions.length === 0) {
      actions.push({
        id: 'hub',
        label: 'Browse Liivv Health',
        href: '/liivv-health',
        kind: 'secondary',
      });
    }

    return {
      id,
      label: display.shortLabel,
      emoji: 'emoji' in display && typeof display.emoji === 'string' ? display.emoji : '💚',
      tone: TONE_BY_CATEGORY[id],
      image: door?.image ?? null,
      status: live ? 'live' : 'coming_soon',
      href,
      shopHref,
      headline: copy.headline,
      lead: copy.lead,
      tipTitle: copy.tip.title,
      tipBody: copy.tip.body,
      snapshot,
      actions,
      nextSteps: copy.nextSteps.slice(0, 3),
      oliviaLines: copy.oliviaLines,
    };
  });
}
