import {
  LIIV_PRIMARY_HEALTH_CATEGORIES,
  type LiivPrimaryCategoryId,
} from '~/lib/onboarding/liiv-primary-health-category';

export const LANDING_HEALTH_CATEGORY_IDS = [
  'diabetes_care_everyday',
  'ostomy_care_everyday',
  'womens_health_wellness',
] as const satisfies readonly LiivPrimaryCategoryId[];

export type LandingHealthCategoryId = (typeof LANDING_HEALTH_CATEGORY_IDS)[number];

export type CategoryResponses = Record<string, string | string[]>;

export type QuestionnaireOption = {
  value: string;
  label: string;
};

export type QuestionnaireQuestion = {
  key: string;
  prompt: string;
  mode: 'single' | 'multi';
  options: QuestionnaireOption[];
};

export const LANDING_CATEGORY_QUESTIONNAIRES: Record<
  LandingHealthCategoryId,
  QuestionnaireQuestion[]
> = {
  diabetes_care_everyday: [
    {
      key: 'diabetes_path',
      prompt: 'Which specific path are we navigating? *',
      mode: 'single',
      options: [
        { value: 'type_1', label: 'Type 1' },
        { value: 'type_2', label: 'Type 2' },
        { value: 'lada_mody_other', label: 'LADA, MODY, Other' },
        { value: 'gestational', label: 'Gestational' },
        { value: 'pre_diabetes', label: 'Pre-diabetes' },
        { value: 'still_figuring_out', label: 'Still figuring it out' },
      ],
    },
    {
      key: 'diabetes_journey_stage',
      prompt: 'Where are we in this journey? *',
      mode: 'single',
      options: [
        { value: 'newly_diagnosed', label: 'Newly diagnosed' },
        { value: 'veteran', label: 'Veteran / established routine' },
        { value: 'hitting_a_wall', label: 'Hitting a wall / need a reset' },
        { value: 'transitioning', label: 'Transitioning therapy' },
      ],
    },
    {
      key: 'diabetes_management',
      prompt: 'How are we currently keeping things in balance? (select all that apply) *',
      mode: 'multi',
      options: [
        { value: 'insulin_pump', label: 'Insulin pump' },
        { value: 'cgm', label: 'Continuous Glucose Monitor (CGM)' },
        { value: 'daily_injections', label: 'Daily insulin injections' },
        { value: 'finger_pricks_meter', label: 'Finger pricks and glucose meter' },
        { value: 'daily_meds_or_weekly', label: 'Daily medications or weekly injectables' },
        { value: 'food_movement_lifestyle', label: 'Food, movement, and lifestyle' },
      ],
    },
  ],
  ostomy_care_everyday: [
    {
      key: 'ostomy_type',
      prompt: 'What type of ostomy do you have? *',
      mode: 'single',
      options: [
        { value: 'colostomy', label: 'Colostomy' },
        { value: 'ileostomy', label: 'Ileostomy' },
        { value: 'urostomy', label: 'Urostomy' },
      ],
    },
    {
      key: 'ostomy_journey_stage',
      prompt: 'Where are we in the ostomy journey? *',
      mode: 'single',
      options: [
        { value: 'starting_out', label: 'Just starting out and learning the ropes' },
        { value: 'restocking', label: 'I have had this for a while, just restocking' },
        { value: 'body_change', label: 'Navigating a recent body change or fit issue' },
      ],
    },
    {
      key: 'ostomy_preferred_brand',
      prompt: 'Do you have a preferred brand? *',
      mode: 'single',
      options: [
        { value: 'not_sure', label: 'Not sure' },
        { value: 'coloplast', label: 'Coloplast' },
        { value: 'hollister', label: 'Hollister' },
        { value: 'convatec', label: 'Convatec' },
      ],
    },
  ],
  womens_health_wellness: [
    {
      key: 'womens_age_range',
      prompt: 'What is your age range? *',
      mode: 'single',
      options: [
        { value: 'under_18', label: '<18' },
        { value: '18_30', label: '18-30' },
        { value: '30_plus', label: '30+' },
      ],
    },
    {
      key: 'womens_life_phase',
      prompt: 'Which phase of life are we focusing on today? *',
      mode: 'single',
      options: [
        { value: 'rhythm_balance', label: 'Everyday rhythm, cycles, and hormone balance' },
        { value: 'fertility_recovery', label: 'Fertility, pregnancy, and recovery' },
        { value: 'menopause_comfort', label: 'Perimenopause, menopause, and comfort' },
        { value: 'aging_gracefully', label: 'Aging gracefully' },
      ],
    },
  ],
};

export function isLandingHealthCategoryId(value: string): value is LandingHealthCategoryId {
  return (LANDING_HEALTH_CATEGORY_IDS as readonly string[]).includes(value);
}

export function getLandingCategoryMeta(categoryId: LandingHealthCategoryId) {
  const row = LIIV_PRIMARY_HEALTH_CATEGORIES.find((category) => category.id === categoryId);

  return {
    id: categoryId,
    label: row?.label ?? 'Health profile',
    emoji: row?.imageEmoji ?? '💚',
  };
}

export function isQuestionAnswered(
  question: QuestionnaireQuestion,
  responses: CategoryResponses,
): boolean {
  const allowed = new Set(question.options.map((option) => option.value));

  if (question.mode === 'multi') {
    const selected = responses[question.key];

    return (
      Array.isArray(selected) &&
      selected.length > 0 &&
      selected.every((value) => allowed.has(value))
    );
  }

  const selected = responses[question.key];

  return typeof selected === 'string' && allowed.has(selected);
}

export function validateCategoryResponses(
  categoryId: LandingHealthCategoryId,
  responses: CategoryResponses,
): boolean {
  const questions = LANDING_CATEGORY_QUESTIONNAIRES[categoryId];

  return questions.every((question) => isQuestionAnswered(question, responses));
}

export function pickCategoryResponses(
  categoryId: LandingHealthCategoryId,
  responses: CategoryResponses,
): CategoryResponses {
  const questions = LANDING_CATEGORY_QUESTIONNAIRES[categoryId];
  const next: CategoryResponses = {};

  for (const question of questions) {
    const value = responses[question.key];

    if (question.mode === 'multi' && Array.isArray(value)) {
      const allowed = new Set(question.options.map((option) => option.value));
      next[question.key] = [...new Set(value.filter((entry) => allowed.has(entry)))];
      continue;
    }

    if (typeof value === 'string') {
      next[question.key] = value;
    }
  }

  return next;
}
