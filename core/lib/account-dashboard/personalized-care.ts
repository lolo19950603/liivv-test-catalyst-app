import { HEALTH_HUB_DOORS } from '~/app/[locale]/(default)/liivv-health/health-hub-data';
import {
  formatHealthProfileAnswer,
  getRawCategoryResponses,
} from '~/lib/onboarding/health-profile-display';
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
  oliviaLine: string;
};

type CategoryResponses = Record<string, string | string[] | boolean | null>;

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
  let oliviaLine = 'This is your diabetes corner. I stacked the useful bits up front.';
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
    oliviaLine = 'New diagnosis energy is a lot. I made this corner quieter on purpose.';
    storyHref = '/liivv-health/diabetes-care/chapters/new-to-the-journey';
    storyLabel = 'Start the new-to-the-journey chapter';
  } else if (stage === 'hitting_a_wall') {
    headline = 'A reset, without starting over';
    lead = 'When the routine stops working, restock the tools and rewrite the rhythm — not the whole story.';
    oliviaLine = 'Walls happen. We restock, we simplify, we keep going.';
  } else if (stage === 'veteran' && usesCgm) {
    headline = 'Your CGM rhythm, kept stocked';
    lead = 'Sensors, backups, and the everyday bits that keep a veteran routine from wobbling.';
    oliviaLine = 'Veteran energy. I am here for the unglamorous restock.';
  } else if (usesPump) {
    headline = 'Pump sites, backups, and the rest of the kit';
    lead = 'Infusion sets and a plan B belong on the same shelf. We will help you keep both close.';
    oliviaLine = 'Pump life is logistics. I am surprisingly good at logistics.';
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

  return { headline, lead, oliviaLine, tip, nextSteps };
}

function ostomyLane(responses: CategoryResponses, now: Date) {
  const type = asString(responses.ostomy_type);
  const stage = asString(responses.ostomy_journey_stage);
  const brand = asString(responses.ostomy_preferred_brand);
  const typeLabel = formatHealthProfileAnswer(type);
  const brandLabel =
    brand && brand !== 'not_sure' ? formatHealthProfileAnswer(brand) : null;

  let headline = 'Ostomy care for everyday Liivving';
  let lead = 'Pouching, skin, and restock — kept kind, practical, and close at hand.';
  let oliviaLine = 'Ostomy corner, reporting for duty. Leak-free confidence is the vibe.';
  let storyHref = '/liivv-health/ostomy-care';
  let storyLabel = 'Open Ostomy Care';

  if (stage === 'starting_out') {
    headline = 'New ostomy journey — we will go slowly';
    lead = 'Fit, skin, and first supplies without the overwhelm. A starter path, then the restock habit.';
    oliviaLine = 'Starting out is a lot of new verbs. I will keep the list short.';
    storyHref = '/liivv-health/ostomy-care/chapters/new-to-the-journey';
    storyLabel = 'Start the new-to-the-journey chapter';
  } else if (stage === 'body_change') {
    headline = 'When the fit changes, so does the kit';
    lead = 'Body shifts are allowed. We will look at barriers, rings, and a calmer way to recast your setup.';
    oliviaLine = 'Fit issues are information, not failure. I saved the useful chapter.';
    storyHref = '/liivv-health/ostomy-care/chapters/get-to-know-your-stoma';
    storyLabel = 'Open stoma and fit guidance';
  } else if (stage === 'restocking') {
    headline = brandLabel
      ? `Restocking ${brandLabel} — stay ahead of empty`
      : 'Restocking, without the Sunday scramble';
    lead = typeLabel
      ? `${typeLabel} supplies on a quieter loop — order before you are counting wafers.`
      : 'Keep your preferred pouching system looping so everyday life stays uneventful.';
    oliviaLine = 'Restocking is my love language. Shall we?';
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

  return {
    headline,
    lead,
    oliviaLine,
    tip,
    nextSteps: [
      {
        id: 'story',
        label: storyLabel,
        hint: 'Guidance for this exact season',
        href: storyHref,
      },
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
    ] satisfies CareNextStep[],
  };
}

function womensLane(responses: CategoryResponses, now: Date) {
  const phase = asString(responses.womens_life_phase);
  const age = asString(responses.womens_age_range);

  let headline = "Women's health, in this season";
  let lead = 'Rhythm, comfort, and products that move with the phase you are actually in.';
  let oliviaLine = 'Your women\'s health lane. I brought the kind chapter, not the lecture.';
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
    oliviaLine = 'Comfort first. Rhythm second. Shopping third. I have the order.';
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

  return { headline, lead, oliviaLine, tip, nextSteps };
}

function genericLane(
  categoryId: LiivPrimaryCategoryId,
  label: string,
  now: Date,
): {
  headline: string;
  lead: string;
  oliviaLine: string;
  tip: { title: string; body: string };
  nextSteps: CareNextStep[];
} {
  const catalog: Partial<
    Record<
      LiivPrimaryCategoryId,
      {
        headline: string;
        lead: string;
        oliviaLine: string;
        tips: Array<{ title: string; body: string }>;
      }
    >
  > = {
    sleep_rest: {
      headline: 'Sleep that treats you like a person',
      lead: 'Wind-down, night sweats, apnea comfort — a quieter kit for the hours after the day.',
      oliviaLine: 'Sleep corner. I dimmed the lights. Metaphorically. I am a mascot.',
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
      oliviaLine: 'Heart lane. We are going for steady, not dramatic.',
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
      oliviaLine: 'Wound care is logistics plus gentleness. I packed both.',
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
      oliviaLine: 'Lung lane. Hydration, filters, and fewer surprises.',
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
      oliviaLine: 'Personal care, zero embarrassment. I have excellent poker face.',
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
      oliviaLine: 'Skin lane. Fragrance-free is a personality trait here.',
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
      oliviaLine: 'Nutrition lane. I will not lecture you about a grain bowl.',
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
      oliviaLine: 'Minor ailments, major dignity. Book the consult — I will hold your cart.',
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
    oliviaLine: entry?.oliviaLine ?? `This is your ${label} corner. Tap around — I will keep up.`,
    tip,
    nextSteps,
  };
}

function resolveLaneCopy(
  categoryId: LiivPrimaryCategoryId,
  label: string,
  responses: CategoryResponses,
  now: Date,
) {
  if (categoryId === 'diabetes_care_everyday') {
    return diabetesLane(responses, now);
  }

  if (categoryId === 'ostomy_care_everyday') {
    return ostomyLane(responses, now);
  }

  if (categoryId === 'womens_health_wellness') {
    return womensLane(responses, now);
  }

  return genericLane(categoryId, label, now);
}

export function buildPersonalizedCareLanes(options: {
  careInterests: string[];
  healthProfileNotes: string | null | undefined;
  now?: Date;
}): PersonalizedCareLane[] {
  const now = options.now ?? new Date();
  const ranked = resolveInitialHealthCategoriesWithRank(options.careInterests);
  const responses = getRawCategoryResponses(options.healthProfileNotes);

  return ranked.map(({ id }) => {
    const display = getPrimaryCategoryDisplay(id);
    const door = HEALTH_HUB_DOORS.find((entry) => entry.id === id);
    const copy = resolveLaneCopy(id, display.shortLabel, responses, now);
    const href = HUB_BY_CATEGORY[id] ?? door?.href ?? null;
    const shopHref = SHOP_BY_CATEGORY[id] ?? null;
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
      oliviaLine: copy.oliviaLine,
    };
  });
}
