/** Field labels for onboarding category answers stored in health_profiles.notes. */
const FIELD_LABELS: Record<string, string> = {
  diabetes_path: 'Diabetes path',
  diabetes_journey_stage: 'Diabetes journey',
  diabetes_management: 'Diabetes management',
  ostomy_type: 'Ostomy type',
  ostomy_journey_stage: 'Ostomy journey',
  ostomy_preferred_brand: 'Ostomy brand',
  womens_age_range: 'Age range',
  womens_life_phase: 'Life phase',
  sleep_rest_barrier: 'Sleep barrier',
  sleep_rest_cpap_status: 'CPAP / BiPAP',
  wound_support_type: 'Wound support',
  minor_ailment_focus: 'Minor ailment',
  personal_care_priority: 'Personal care priority',
  breathing_routine: 'Breathing routine',
  heart_tracking_pref: 'Heart tracking',
  heart_circulation_issue: 'Circulation',
  skin_goal: 'Skin goal',
  skin_rules: 'Skin product rules',
  nutrition_fuel_focus: 'Nutrition focus',
  nutrition_guardrails: 'Dietary guardrails',
};

const VALUE_LABELS: Record<string, string> = {
  // diabetes
  type_1: 'Type 1',
  type_2: 'Type 2',
  lada_mody_other: 'LADA, MODY, Other',
  gestational: 'Gestational',
  pre_diabetes: 'Pre-diabetes',
  still_figuring_out: 'Still figuring it out',
  newly_diagnosed: 'Newly diagnosed',
  veteran: 'Veteran / established routine',
  hitting_a_wall: 'Hitting a wall / need a reset',
  transitioning: 'Transitioning therapy',
  insulin_pump: 'Insulin pump',
  cgm: 'Continuous Glucose Monitor (CGM)',
  daily_injections: 'Daily insulin injections',
  finger_pricks_meter: 'Finger pricks and glucose meter',
  daily_meds_or_weekly: 'Daily medications or weekly injectables',
  food_movement_lifestyle: 'Food, movement, and lifestyle',
  // ostomy
  colostomy: 'Colostomy',
  ileostomy: 'Ileostomy',
  urostomy: 'Urostomy',
  starting_out: 'Just starting out',
  restocking: 'Had this for a while, restocking',
  body_change: 'Recent body change or fit issue',
  not_sure: 'Not sure',
  coloplast: 'Coloplast',
  hollister: 'Hollister',
  convatec: 'Convatec',
  // women's
  under_18: '<18',
  '18_30': '18-30',
  '30_plus': '30+',
  rhythm_balance: 'Everyday rhythm, cycles, and hormone balance',
  fertility_recovery: 'Fertility, pregnancy, and recovery',
  menopause_comfort: 'Perimenopause, menopause, and comfort',
  aging_gracefully: 'Aging gracefully',
  // sleep
  winding_down: 'Trouble winding down and falling asleep',
  night_sweats: 'Waking hot or night sweats',
  apnea_discomfort: 'Sleep apnea or CPAP discomfort',
  yes_replacement: 'Yes — need parts or cleaning supplies',
  yes_mask: 'Yes — looking for a comfortable mask',
  no_natural: 'No — looking for natural sleep support',
  // wound
  recent_recovery: 'Recovering from recent surgery/procedure',
  chronic_wound: 'Chronic or slow-healing wound',
  first_aid: 'Everyday first aid essentials',
  // minor ailment
  allergic_rhinitis: 'Allergic rhinitis',
  uti: 'Urinary tract infection (uncomplicated)',
  acne: 'Acne (mild)',
  dermatitis: 'Dermatitis',
  gerd: 'GERD',
  other: 'Other listed minor ailment',
  // personal care
  discreet_fit: 'Discreet fit under clothes',
  max_absorbency: 'Maximum absorbency',
  catheter_support: 'Catheter care and support',
  // breathing
  flare_ups: 'Occasional flare-ups or seasonal issues',
  daily_treatment: 'Daily nebulizer or inhaler treatments',
  oxygen_support: 'Round-the-clock oxygen therapy',
  // heart
  simple_manual: 'Simple monitors and manual tracking',
  tech_sync: 'Tech-friendly — sync to phone/app',
  supportive_wear: 'Supportive wear (compression, etc.)',
  swelling_heaviness: 'Swelling or heaviness in legs/feet',
  recovery_clot_prevent: 'Recovery or clot prevention',
  monitoring_only: 'Everyday monitoring and preventative care',
  // skin
  calming_flareups: 'Calming flare-ups, redness, or irritation',
  deep_hydration: 'Deep hydration for dryness',
  breakout_balance: 'Clearing breakouts and balancing oil',
  protect_sensitive: 'Protecting/healing sensitive area',
  fragrance_free: 'Must be 100% fragrance-free',
  hypoallergenic: 'Needs to be hypoallergenic',
  no_strict_rules: 'No strict rules',
  // nutrition
  meal_boost: 'Supplements to boost regular meals',
  liquid_tube: 'Specialized liquid or tube-feeding',
  convenient_shakes: 'Convenient complete nutrition shakes',
  diabetic: 'Diabetic-friendly (low/no sugar)',
  dairy_free: 'Dairy-free or plant-based',
  high_calorie: 'High-calorie / high-protein',
  renal: 'Renal-friendly',
};

function humanizeSlug(value: string): string {
  return value
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function formatAnswerValue(value: string | string[] | boolean | null | undefined): string | null {
  if (value == null) {
    return null;
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (Array.isArray(value)) {
    const parts = value
      .map((item) => VALUE_LABELS[item] ?? humanizeSlug(String(item)))
      .filter(Boolean);

    return parts.length > 0 ? parts.join(', ') : null;
  }

  const raw = String(value).trim();

  if (!raw) {
    return null;
  }

  return VALUE_LABELS[raw] ?? humanizeSlug(raw);
}

export type HealthProfileDisplayRow = {
  label: string;
  value: string;
};

type CategoryResponsesPayload = {
  category_responses?: Record<string, string | string[] | boolean | null>;
};

function rowsFromCategoryResponses(
  responses: Record<string, string | string[] | boolean | null>,
): HealthProfileDisplayRow[] {
  const rows: HealthProfileDisplayRow[] = [];

  for (const [key, value] of Object.entries(responses)) {
    const formatted = formatAnswerValue(value);

    if (!formatted) {
      continue;
    }

    rows.push({
      label: FIELD_LABELS[key] ?? humanizeSlug(key),
      value: formatted,
    });
  }

  return rows;
}

function tryParseJsonObject(raw: string): unknown | null {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');

    if (start < 0 || end <= start) {
      return null;
    }

    try {
      return JSON.parse(raw.slice(start, end + 1)) as unknown;
    } catch {
      return null;
    }
  }
}

function normalizeNotesPayload(notes: unknown): CategoryResponsesPayload | null {
  if (notes == null) {
    return null;
  }

  if (typeof notes === 'object' && !Array.isArray(notes)) {
    return notes as CategoryResponsesPayload;
  }

  if (typeof notes !== 'string') {
    return null;
  }

  const raw = notes.trim();

  if (!raw) {
    return null;
  }

  let parsed = tryParseJsonObject(raw);

  // Some rows are double-encoded JSON strings.
  if (typeof parsed === 'string') {
    parsed = tryParseJsonObject(parsed.trim());
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return null;
  }

  return parsed as CategoryResponsesPayload;
}

export function parseHealthProfileCategoryResponses(
  notes: unknown,
): { rows: HealthProfileDisplayRow[]; freeTextNotes: string | null } {
  if (notes == null || notes === '') {
    return { rows: [], freeTextNotes: null };
  }

  const payload = normalizeNotesPayload(notes);

  if (!payload) {
    return {
      rows: [],
      freeTextNotes: typeof notes === 'string' ? notes.trim() || null : null,
    };
  }

  if (!payload.category_responses || typeof payload.category_responses !== 'object') {
    return {
      rows: [],
      freeTextNotes: typeof notes === 'string' ? notes.trim() || null : null,
    };
  }

  return {
    rows: rowsFromCategoryResponses(payload.category_responses),
    freeTextNotes: null,
  };
}
