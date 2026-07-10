'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Link } from '~/components/link';
import { OnboardingProgressBar } from './onboarding-progress-bar';
import { OnboardingSubmitOverlay } from './onboarding-submit-overlay';
import { OnboardingSectionHeader } from './onboarding-section-header';
import { validateHealthProfileComplete } from '~/lib/onboarding/health-profile-form-validation';
import { SETUP_FLOW_VALUE } from '~/lib/onboarding/onboarding-flow';
import {
  filterCategoriesForRegion,
  isLiivPrimaryCategoryId,
  LIIV_PRIMARY_HEALTH_CATEGORIES,
  type LiivPrimaryCategoryId,
} from '~/lib/onboarding/liiv-primary-health-category';
import type { HealthProfileRow } from '~/lib/supabase/health-profile';

export type HealthProfileFormProps = {
  data: {
    initialCategories: LiivPrimaryCategoryId[];
    primaryCategoryOptions: (typeof LIIV_PRIMARY_HEALTH_CATEGORIES)[number][];
    isOntario: boolean;
    initialHealthProfile: HealthProfileRow | null;
    supabaseReady: boolean;
    healthProfileCompleted: boolean;
    showSkipForNow: boolean;
    isOnboardingChrome: boolean;
    isSetupFlow: boolean;
  };
  actionData?: { error?: string } | null;
  isSubmitting?: boolean;
  formAction: (formData: FormData) => void;
};

export function HealthProfileForm({
  data,
  actionData = null,
  isSubmitting = false,
  formAction,
}: HealthProfileFormProps) {

  const {
    initialCategories,
    primaryCategoryOptions,
    isOntario,
    initialHealthProfile,
    supabaseReady,
    healthProfileCompleted,
    showSkipForNow,
    isOnboardingChrome,
    isSetupFlow,
  } = data;

  const [clientError, setClientError] = useState<string | null>(null);
  const [missingRequiredKeys, setMissingRequiredKeys] = useState<string[]>([]);

  const [selectedCategories, setSelectedCategories] = useState<LiivPrimaryCategoryId[]>(
    () => initialCategories,
  );
  const [microPageIdx, setMicroPageIdx] = useState(0);
  const [categoryResponses, setCategoryResponses] = useState<Record<string, string | string[]>>(
    () => {
      if (!initialHealthProfile?.notes) return {};
      try {
        const parsed = JSON.parse(initialHealthProfile.notes) as {
          category_responses?: Record<string, string | string[]>;
        };
        return parsed?.category_responses ?? {};
      } catch {
        return {};
      }
    },
  );

  useEffect(() => {
    const ids = new Set(primaryCategoryOptions.map((c) => c.id));
    setSelectedCategories((prev) => {
      const next = prev.filter((id) => ids.has(id));
      setMicroPageIdx((idx) => Math.min(idx, next.length));
      return next;
    });
  }, [primaryCategoryOptions]);

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    const fd = new FormData(e.currentTarget);
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const intent =
      submitter?.getAttribute('name') === 'intent' ? submitter.value : '';
    if (intent === 'save') {
      const v = validateHealthProfileComplete(fd);
      if (!v.ok) {
        e.preventDefault();
        setClientError(v.message);
        return;
      }
    }
    setClientError(null);
  };

  const toggleCategory = (id: LiivPrimaryCategoryId) => {
    setSelectedCategories((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      setMicroPageIdx((idx) => Math.min(idx, next.length));
      return next;
    });
  };

  const currentCategory = microPageIdx > 0 ? selectedCategories[microPageIdx - 1] ?? null : null;
  const currentCategoryDef = currentCategory
    ? primaryCategoryOptions.find((option) => option.id === currentCategory) ?? null
    : null;

  const cardBase =
    'flex cursor-pointer items-start gap-3 rounded-xl border border-[#e0d9ce] bg-white p-4 text-left transition hover:border-[#c4b8a8] hover:bg-[#fcfaf7]';
  const optionPillClass = (active: boolean) =>
    `inline-flex cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition ${
      active ? 'border-[#6b7f5c] bg-[#eef4ee] text-[#2d4a2d]' : 'border-[#d6d0c5] bg-white text-[#2c2a26]'
    }`;

  const isMissing = (key: string) => missingRequiredKeys.includes(key);
  const localePrefix = '';

  const setResponse = (key: string, value: string) => {
    setMissingRequiredKeys([]);
    setCategoryResponses((prev) => ({...prev, [key]: value}));
  };
  const toggleMultiResponse = (key: string, value: string) => {
    setMissingRequiredKeys([]);
    setCategoryResponses((prev) => {
      const cur = prev[key];
      const arr = Array.isArray(cur) ? [...cur] : [];
      const has = arr.includes(value);
      const nextArr = has ? arr.filter((x) => x !== value) : [...arr, value];
      return {...prev, [key]: nextArr};
    });
  };

  const renderSingleChoice = (
    key: string,
    options: {value: string; label: string}[],
    highlightMissing = false,
  ) => {
    const current = typeof categoryResponses[key] === 'string' ? categoryResponses[key] : '';
    return (
      <div
        className={`mt-1 flex flex-wrap gap-2 ${
          highlightMissing ? 'ring-1 ring-red-200 rounded-lg' : ''
        }`}
      >
        {options.map((opt) => (
          <button
            key={`${key}-${opt.value}`}
            type="button"
            onClick={() => setResponse(key, opt.value)}
            className={optionPillClass(current === opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    );
  };

  const renderCurrentCategoryQuestions = () => {
    if (!currentCategory) return null;
    switch (currentCategory) {
      case 'diabetes_care_everyday': {
        const selected = Array.isArray(categoryResponses.diabetes_management)
          ? categoryResponses.diabetes_management
          : [];
        const has = (v: string) => selected.includes(v);
        return (
          <div className="space-y-5">
            <div>
              <p
                className={`text-sm font-semibold ${
                  isMissing('diabetes_path') ? 'text-red-700' : 'text-[#2c2a26]'
                }`}
              >
                Which specific path are we navigating? *
              </p>
              {renderSingleChoice(
                'diabetes_path',
                [
                  {value: 'type_1', label: 'Type 1'},
                  {value: 'type_2', label: 'Type 2'},
                  {value: 'lada_mody_other', label: 'LADA, MODY, Other'},
                  {value: 'gestational', label: 'Gestational'},
                  {value: 'pre_diabetes', label: 'Pre-diabetes'},
                  {value: 'still_figuring_out', label: 'Still figuring it out'},
                ],
                isMissing('diabetes_path'),
              )}
            </div>
            <div>
              <p
                className={`text-sm font-semibold ${
                  isMissing('diabetes_journey_stage') ? 'text-red-700' : 'text-[#2c2a26]'
                }`}
              >
                Where are we in this journey? *
              </p>
              {renderSingleChoice(
                'diabetes_journey_stage',
                [
                  {value: 'newly_diagnosed', label: 'Newly diagnosed'},
                  {value: 'veteran', label: 'Veteran / established routine'},
                  {value: 'hitting_a_wall', label: 'Hitting a wall / need a reset'},
                  {value: 'transitioning', label: 'Transitioning therapy'},
                ],
                isMissing('diabetes_journey_stage'),
              )}
            </div>
            <div>
              <p
                className={`text-sm font-semibold ${
                  isMissing('diabetes_management') ? 'text-red-700' : 'text-[#2c2a26]'
                }`}
              >
                How are we currently keeping things in balance? (select all that apply) *
              </p>
              <div
                className={`mt-2 flex flex-wrap gap-2 ${
                  isMissing('diabetes_management') ? 'ring-1 ring-red-200 rounded-lg p-2' : ''
                }`}
              >
                {(
                  [
                    ['insulin_pump', 'Insulin pump'],
                    ['cgm', 'Continuous Glucose Monitor (CGM)'],
                    ['daily_injections', 'Daily insulin injections'],
                    ['finger_pricks_meter', 'Finger pricks and glucose meter'],
                    ['daily_meds_or_weekly', 'Daily medications or weekly injectables'],
                    ['food_movement_lifestyle', 'Food, movement, and lifestyle'],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleMultiResponse('diabetes_management', value)}
                    className={optionPillClass(has(value))}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      }
      case 'ostomy_care_everyday':
        return (
          <div className="space-y-5">
            <div>
              <p
                className={`text-sm font-semibold ${
                  isMissing('ostomy_type') ? 'text-red-700' : 'text-[#2c2a26]'
                }`}
              >
                What type of ostomy do you have? *
              </p>
              {renderSingleChoice(
                'ostomy_type',
                [
                  {value: 'colostomy', label: 'Colostomy'},
                  {value: 'ileostomy', label: 'Ileostomy'},
                  {value: 'urostomy', label: 'Urostomy'},
                ],
                isMissing('ostomy_type'),
              )}
            </div>
            <div>
              <p
                className={`text-sm font-semibold ${
                  isMissing('ostomy_journey_stage') ? 'text-red-700' : 'text-[#2c2a26]'
                }`}
              >
                Where are we in the ostomy journey? *
              </p>
              {renderSingleChoice(
                'ostomy_journey_stage',
                [
                  {value: 'starting_out', label: 'Just starting out and learning the ropes'},
                  {
                    value: 'restocking',
                    label: "I have had this for a while, just restocking",
                  },
                  {value: 'body_change', label: 'Navigating a recent body change or fit issue'},
                ],
                isMissing('ostomy_journey_stage'),
              )}
            </div>
            <div>
              <p
                className={`text-sm font-semibold ${
                  isMissing('ostomy_preferred_brand') ? 'text-red-700' : 'text-[#2c2a26]'
                }`}
              >
                Do you have a preferred brand? *
              </p>
              {renderSingleChoice(
                'ostomy_preferred_brand',
                [
                  {value: 'not_sure', label: 'Not sure'},
                  {value: 'coloplast', label: 'Coloplast'},
                  {value: 'hollister', label: 'Hollister'},
                  {value: 'convatec', label: 'Convatec'},
                ],
                isMissing('ostomy_preferred_brand'),
              )}
            </div>
          </div>
        );
      case 'womens_health_wellness':
        return (
          <div className="space-y-5">
            <div>
              <p
                className={`text-sm font-semibold ${
                  isMissing('womens_age_range') ? 'text-red-700' : 'text-[#2c2a26]'
                }`}
              >
                What is your age range? *
              </p>
              {renderSingleChoice(
                'womens_age_range',
                [
                  {value: 'under_18', label: '<18'},
                  {value: '18_30', label: '18-30'},
                  {value: '30_plus', label: '30+'},
                ],
                isMissing('womens_age_range'),
              )}
            </div>
            <div>
              <p
                className={`text-sm font-semibold ${
                  isMissing('womens_life_phase') ? 'text-red-700' : 'text-[#2c2a26]'
                }`}
              >
                Which phase of life are we focusing on today? *
              </p>
              {renderSingleChoice(
                'womens_life_phase',
                [
                  {
                    value: 'rhythm_balance',
                    label: 'Everyday rhythm, cycles, and hormone balance',
                  },
                  {
                    value: 'fertility_recovery',
                    label: 'Fertility, pregnancy, and recovery',
                  },
                  {
                    value: 'menopause_comfort',
                    label: 'Perimenopause, menopause, and comfort',
                  },
                  {value: 'aging_gracefully', label: 'Aging gracefully'},
                ],
                isMissing('womens_life_phase'),
              )}
            </div>
          </div>
        );
      case 'sleep_rest':
        return (
          <div className="space-y-5">
            <div>
              <p
                className={`text-sm font-semibold ${
                  isMissing('sleep_rest_barrier') ? 'text-red-700' : 'text-[#2c2a26]'
                }`}
              >
                What is getting in the way of good rest? *
              </p>
              {renderSingleChoice(
                'sleep_rest_barrier',
                [
                  {value: 'winding_down', label: 'Trouble winding down and falling asleep'},
                  {value: 'night_sweats', label: 'Waking hot or dealing with night sweats'},
                  {
                    value: 'apnea_discomfort',
                    label: 'Managing sleep apnea or CPAP discomfort',
                  },
                ],
                isMissing('sleep_rest_barrier'),
              )}
            </div>
            <div>
              <p
                className={`text-sm font-semibold ${
                  isMissing('sleep_rest_cpap_status') ? 'text-red-700' : 'text-[#2c2a26]'
                }`}
              >
                Are you currently using a CPAP or BiPAP machine? *
              </p>
              {renderSingleChoice(
                'sleep_rest_cpap_status',
                [
                  {
                    value: 'yes_replacement',
                    label: 'Yes, need replacement parts or cleaning supplies',
                  },
                  {value: 'yes_mask', label: 'Yes, struggling to find a comfortable mask'},
                  {value: 'no_natural', label: 'No, looking for natural sleep support and aids'},
                ],
                isMissing('sleep_rest_cpap_status'),
              )}
            </div>
          </div>
        );
      case 'healing_advanced_wound':
        return (
          <div>
            <p
              className={`text-sm font-semibold ${
                isMissing('wound_support_type') ? 'text-red-700' : 'text-[#2c2a26]'
              }`}
            >
              What kind of healing are we supporting? *
            </p>
            {renderSingleChoice('wound_support_type', [
              {value: 'recent_recovery', label: 'Recovering from a recent surgery or procedure'},
              {value: 'chronic_wound', label: 'Managing a chronic or slow-healing wound'},
              {value: 'first_aid', label: 'Stocking up on everyday first aid essentials'},
            ], isMissing('wound_support_type'))}
          </div>
        );
      case 'minor_ailment_on':
        return (
          <div>
            <p
              className={`text-sm font-semibold ${
                isMissing('minor_ailment_focus') ? 'text-red-700' : 'text-[#2c2a26]'
              }`}
            >
              What minor ailment would you like to consult about? *
            </p>
            {renderSingleChoice('minor_ailment_focus', [
              {value: 'allergic_rhinitis', label: 'Allergic rhinitis'},
              {value: 'uti', label: 'Urinary tract infection (uncomplicated)'},
              {value: 'acne', label: 'Acne (mild)'},
              {value: 'dermatitis', label: 'Dermatitis (atopic/eczema/allergic/contact)'},
              {value: 'gerd', label: 'GERD'},
              {value: 'other', label: 'Other listed minor ailment'},
            ], isMissing('minor_ailment_focus'))}
          </div>
        );
      case 'personal_care_confidence':
        return (
          <div>
            <p
              className={`text-sm font-semibold ${
                isMissing('personal_care_priority') ? 'text-red-700' : 'text-[#2c2a26]'
              }`}
            >
              What is the main priority for daily comfort? *
            </p>
            {renderSingleChoice('personal_care_priority', [
              {value: 'discreet_fit', label: 'A discreet, invisible fit under regular clothes'},
              {value: 'max_absorbency', label: 'Maximum absorbency for peace of mind'},
              {value: 'catheter_support', label: 'Catheter care and support'},
            ], isMissing('personal_care_priority'))}
          </div>
        );
      case 'breathing_lung_health':
        return (
          <div>
            <p
              className={`text-sm font-semibold ${
                isMissing('breathing_routine') ? 'text-red-700' : 'text-[#2c2a26]'
              }`}
            >
              What does the breathing routine look like right now? *
            </p>
            {renderSingleChoice('breathing_routine', [
              {value: 'flare_ups', label: 'Managing occasional flare-ups or seasonal issues'},
              {value: 'daily_treatment', label: 'Daily treatments with a nebulizer or inhaler'},
              {value: 'oxygen_support', label: 'Round-the-clock oxygen therapy support'},
            ], isMissing('breathing_routine'))}
          </div>
        );
      case 'heart_blood_pressure':
        return (
          <div className="space-y-5">
            <div>
              <p
                className={`text-sm font-semibold ${
                  isMissing('heart_tracking_pref') ? 'text-red-700' : 'text-[#2c2a26]'
                }`}
              >
                How do you prefer to track heart health? *
              </p>
              {renderSingleChoice('heart_tracking_pref', [
                {value: 'simple_manual', label: 'Simple: standard monitors and manual tracking'},
                {value: 'tech_sync', label: 'Tech-friendly: sync to phone/app'},
                {value: 'supportive_wear', label: 'Mostly supportive wear (compression socks, etc.)'},
              ], isMissing('heart_tracking_pref'))}
            </div>
            <div>
              <p
                className={`text-sm font-semibold ${
                  isMissing('heart_circulation_issue') ? 'text-red-700' : 'text-[#2c2a26]'
                }`}
              >
                Are we managing circulation issues? *
              </p>
              {renderSingleChoice('heart_circulation_issue', [
                {value: 'swelling_heaviness', label: 'Swelling or heaviness in legs and feet'},
                {value: 'recovery_clot_prevent', label: 'Recovery or clot prevention'},
                {value: 'monitoring_only', label: 'Everyday monitoring and preventative care'},
              ], isMissing('heart_circulation_issue'))}
            </div>
          </div>
        );
      case 'skin_health_relief':
        return (
          <div className="space-y-5">
            <div>
              <p
                className={`text-sm font-semibold ${
                  isMissing('skin_goal') ? 'text-red-700' : 'text-[#2c2a26]'
                }`}
              >
                What is the main goal for skin right now? *
              </p>
              {renderSingleChoice('skin_goal', [
                {value: 'calming_flareups', label: 'Calming flare-ups, redness, or irritation'},
                {value: 'deep_hydration', label: 'Deep hydration for persistent dryness'},
                {value: 'breakout_balance', label: 'Clearing breakouts and balancing oil'},
                {value: 'protect_sensitive', label: 'Protecting/healing sensitive area or wound'},
              ], isMissing('skin_goal'))}
            </div>
            <div>
              <p
                className={`text-sm font-semibold ${
                  isMissing('skin_rules') ? 'text-red-700' : 'text-[#2c2a26]'
                }`}
              >
                Any strict rules for skin products? *
              </p>
              {renderSingleChoice('skin_rules', [
                {value: 'fragrance_free', label: 'Must be 100% fragrance-free'},
                {value: 'hypoallergenic', label: 'Needs to be hypoallergenic'},
                {value: 'no_strict_rules', label: 'No strict rules, just results'},
              ], isMissing('skin_rules'))}
            </div>
          </div>
        );
      case 'daily_nutrition_fuel': {
        const selected = Array.isArray(categoryResponses.nutrition_guardrails)
          ? categoryResponses.nutrition_guardrails
          : [];
        const has = (v: string) => selected.includes(v);
        return (
          <div className="space-y-5">
            <div>
              <p
                className={`text-sm font-semibold ${
                  isMissing('nutrition_fuel_focus') ? 'text-red-700' : 'text-[#2c2a26]'
                }`}
              >
                How are we getting daily fuel right now? *
              </p>
              {renderSingleChoice('nutrition_fuel_focus', [
                {value: 'meal_boost', label: 'Supplements to boost regular meals'},
                {value: 'liquid_tube', label: 'Specialized liquid or tube-feeding routine'},
                {value: 'convenient_shakes', label: 'Convenient complete nutrition shakes'},
              ], isMissing('nutrition_fuel_focus'))}
            </div>
            <div>
              <p
                className={`text-sm font-semibold ${
                  isMissing('nutrition_guardrails') ? 'text-red-700' : 'text-[#2c2a26]'
                }`}
              >
                Strict dietary guardrails? (select all) *
              </p>
              <div
                className={`mt-2 flex flex-wrap gap-2 ${
                  isMissing('nutrition_guardrails') ? 'ring-1 ring-red-200 rounded-lg p-2' : ''
                }`}
              >
                {(
                  [
                    ['diabetic', 'Diabetic-friendly (low/no sugar)'],
                    ['dairy_free', 'Dairy-free or plant-based'],
                    ['high_calorie', 'High-calorie/high-protein'],
                    ['renal', 'Renal-friendly'],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleMultiResponse('nutrition_guardrails', value)}
                    className={optionPillClass(has(value))}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  };

  const CATEGORY_RESPONSE_KEYS: Record<string, string[]> = {
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

  const RESPONSE_KEY_TO_CATEGORY: Record<string, string> = (() => {
    const out: Record<string, string> = {};
    for (const [cat, keys] of Object.entries(CATEGORY_RESPONSE_KEYS)) {
      for (const k of keys) out[k] = cat;
    }
    return out;
  })();

  useEffect(() => {
    const selectedSet = new Set(selectedCategories);
    setMissingRequiredKeys([]);
    setCategoryResponses((prev) => {
      let changed = false;
      const next: Record<string, string | string[]> = {};
      for (const [key, value] of Object.entries(prev)) {
        const cat = RESPONSE_KEY_TO_CATEGORY[key];
        if (cat && !selectedSet.has(cat as LiivPrimaryCategoryId)) {
          changed = true;
          continue;
        }
        next[key] = value;
      }
      return changed ? next : prev;
    });
  }, [selectedCategories]);

  const getMissingKeysForCurrentMicroPage = (): string[] => {
    if (!currentCategory) return [];

    const hasValue = (key: string) =>
      typeof categoryResponses[key] === 'string' &&
      (categoryResponses[key] as string).trim().length > 0;
    const hasArray = (key: string) =>
      Array.isArray(categoryResponses[key]) && (categoryResponses[key] as string[]).length > 0;

    const missing: string[] = [];

    const requireValue = (key: string) => {
      if (!hasValue(key)) missing.push(key);
    };
    const requireArray = (key: string) => {
      if (!hasArray(key)) missing.push(key);
    };

    if (currentCategory === 'ostomy_care_everyday') {
      requireValue('ostomy_type');
      requireValue('ostomy_journey_stage');
      requireValue('ostomy_preferred_brand');
    }
    if (currentCategory === 'diabetes_care_everyday') {
      requireValue('diabetes_path');
      requireValue('diabetes_journey_stage');
      requireArray('diabetes_management');
    }
    if (currentCategory === 'womens_health_wellness') {
      requireValue('womens_age_range');
      requireValue('womens_life_phase');
    }
    if (currentCategory === 'sleep_rest') {
      requireValue('sleep_rest_barrier');
      requireValue('sleep_rest_cpap_status');
    }
    if (currentCategory === 'healing_advanced_wound') {
      requireValue('wound_support_type');
    }
    if (currentCategory === 'minor_ailment_on') {
      requireValue('minor_ailment_focus');
    }
    if (currentCategory === 'personal_care_confidence') {
      requireValue('personal_care_priority');
    }
    if (currentCategory === 'breathing_lung_health') {
      requireValue('breathing_routine');
    }
    if (currentCategory === 'heart_blood_pressure') {
      requireValue('heart_tracking_pref');
      requireValue('heart_circulation_issue');
    }
    if (currentCategory === 'skin_health_relief') {
      requireValue('skin_goal');
      requireValue('skin_rules');
    }
    if (currentCategory === 'daily_nutrition_fuel') {
      requireValue('nutrition_fuel_focus');
      requireArray('nutrition_guardrails');
    }

    return missing;
  };

  const validateCurrentMicroPage = (): string | null => {
    const missing = getMissingKeysForCurrentMicroPage();
    if (!missing.length) return null;

    if (currentCategory === 'ostomy_care_everyday') return 'Please complete all required ostomy questions.';
    if (currentCategory === 'diabetes_care_everyday')
      return 'Please complete all required diabetes care questions.';
    if (currentCategory === 'womens_health_wellness') return 'Please complete both women’s health questions.';
    if (currentCategory === 'sleep_rest') return 'Please complete both sleep questions.';
    if (currentCategory === 'healing_advanced_wound') return 'Please choose what healing support you need.';
    if (currentCategory === 'minor_ailment_on') return 'Please choose a minor ailment focus.';
    if (currentCategory === 'personal_care_confidence') return 'Please choose your personal care priority.';
    if (currentCategory === 'breathing_lung_health') return 'Please choose your breathing routine.';
    if (currentCategory === 'heart_blood_pressure')
      return 'Please complete both heart & blood pressure questions.';
    if (currentCategory === 'skin_health_relief') return 'Please complete both skin health questions.';
    if (currentCategory === 'daily_nutrition_fuel')
      return 'Please complete nutrition focus and select at least one dietary guardrail.';

    return 'Please answer the required questions.';
  };

  if (!supabaseReady) {
    return (
      <div className="w-full">
        <div className="rounded-2xl border border-[#e8e2d8] bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-[#2c2a26]">Health profile</h1>
          <p className="mt-4 text-sm text-[#6b6560]">
            Connect Supabase (`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`) and run
            `core/lib/supabase/onboarding-schema.sql` to enable this step.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <OnboardingSubmitOverlay visible={isSubmitting} message="Saving health profile..." />
      <section className="space-y-8">
        <OnboardingSectionHeader
          centerOnMobile
          kicker={isOnboardingChrome ? 'Onboarding' : 'Account'}
          title={
            isOnboardingChrome ? (
              <>
                <span className="font-semibold text-[#1a1a1a]">Step 2: Liivv health </span>
                <span className="font-normal text-[#8E9E88]">categories</span>
              </>
            ) : (
              <>
                <span className="font-semibold text-[#1a1a1a]">Health </span>
                <span className="font-normal text-[#8E9E88]">profile</span>
              </>
            )
          }
          description={
            isOnboardingChrome
              ? 'Choose one or more Liiv health categories for your journey. Optional fields below appear when they apply. You can edit later from your account.'
              : 'Update your care details. Save to return to your account home.'
          }
        />

        {clientError || (actionData && 'error' in actionData && actionData.error) ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {clientError ?? (actionData && 'error' in actionData ? actionData.error : null)}
          </div>
        ) : null}

        {isSetupFlow ? (
          <OnboardingProgressBar current={2} label="Onboarding progress" total={3} />
        ) : null}

        <form action={formAction} className="onboarding-health-form w-full max-w-none space-y-8" onSubmit={handleFormSubmit}>
          <input name="zoneCode" type="hidden" value={data.isOntario ? 'ON' : ''} />
          {isSetupFlow ? <input type="hidden" name="setup" value={SETUP_FLOW_VALUE} /> : null}

          {selectedCategories.map((id) => (
            <input key={`care-interest-input-${id}`} type="hidden" name="care_interests" value={id} />
          ))}
          {Object.entries(categoryResponses).map(([key, value]) =>
            Array.isArray(value) ? (
              value.map((entry) => (
                <input key={`${key}-${entry}`} type="hidden" name={key} value={entry} />
              ))
            ) : (
              <input key={key} type="hidden" name={key} value={value} />
            ),
          )}
          {microPageIdx === 0 ? (
            <section className="space-y-4">
              <div>
                <h2 className="text-base font-medium text-[#2c2a26]">Select your categories</h2>
                <p className="mt-1 text-sm text-[#6b6560]">
                  Pick the journeys you care about and set importance order directly here (1 = most
                  important).
                </p>
                <p className="mt-1 text-xs text-[#8a8176]">
                  Tip: deselect and reselect a category to move it to the end of your priority list.
                </p>
                {!isOntario ? (
                  <p className="mt-2 text-xs text-[#8a8176]">
                    Minor Ailment is available only for Ontario. Add an Ontario mailing address in your
                    account settings to see that option.
                  </p>
                ) : null}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {primaryCategoryOptions.map((option) => {
                  const checked = selectedCategories.includes(option.id);
                  const priority = checked ? selectedCategories.indexOf(option.id) + 1 : null;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => toggleCategory(option.id)}
                      className={`${cardBase} ${checked ? 'border-[#6b7f5c] bg-[#f0f4eb]' : ''}`}
                      aria-label={option.label}
                    >
                      <span className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#c4b8a8] bg-white text-xs font-semibold text-[#2c2a26]">
                        {priority ?? '+'}
                      </span>
                      <div className="flex min-w-0 items-start gap-3">
                        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e8f0e4] text-xl">
                          {option.imageEmoji ?? '💚'}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-[#2c2a26]">{option.label}</p>
                          {priority ? (
                            <p className="mt-1 text-xs font-medium text-[#5a6d4d]">
                              Priority #{priority}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}

          {currentCategory && currentCategoryDef ? (
            <section className="rounded-2xl border border-[#e5dfd5] bg-white p-0 shadow-sm">
              {/*
                Inner wrapper: reset.css sets `section { padding: 1rem 0 }` (no horizontal inset),
                which can fight card padding. Use a div for reliable left/right spacing.
              */}
              <div className="space-y-6 px-5 py-6 sm:px-8 sm:py-7">
                <div className="flex items-start gap-4">
                  <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#e8f0e4] text-3xl">
                    {currentCategoryDef.imageEmoji ?? '💚'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#8a8176]">
                      Category micro-step {microPageIdx} of {selectedCategories.length}
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-[#2c2a26]">{currentCategoryDef.label}</h2>
                  </div>
                </div>
                <div className="space-y-5">{renderCurrentCategoryQuestions()}</div>
              </div>
            </section>
          ) : null}

          <div
            className={
              selectedCategories.length > 0 ? 'mt-8 pt-4 sm:pt-6' : 'pt-4 sm:pt-6'
            }
          >
            <div className="mb-4 space-y-1 text-xs text-[#8a8176]">
              {showSkipForNow ? (
                <p>
                  To continue to insurance, complete any required fields above for your selections.{' '}
                  <span className="font-medium text-[#5c564c]">Skip for now</span> continues setup and
                  lets you personalize this later from your dashboard.
                </p>
              ) : (
                <p>Complete required fields, then save to return to your account.</p>
              )}
            </div>
            {/*
              Match insurance step: Back + Skip + primary in one footer row (InsuranceStepForm).
            */}
            <div className="flex flex-row flex-wrap items-center gap-3">
              <Link
                href="/account/dashboard/"
                className="liivv-btn-secondary inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm"
              >
                <span aria-hidden>‹</span> Back to dashboard
              </Link>
              {showSkipForNow ? (
                <button
                  type="submit"
                  name="intent"
                  value="skip"
                  disabled={isSubmitting}
                  className="liivv-btn-secondary px-5 py-2.5 text-sm"
                >
                  Skip for now
                </button>
              ) : null}

              {selectedCategories.length > 0 && microPageIdx > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    setClientError(null);
                    setMissingRequiredKeys([]);
                    setMicroPageIdx((prev) => Math.max(0, prev - 1));
                  }}
                  className="liivv-btn-secondary px-5 py-2.5 text-sm"
                >
                  Back
                </button>
              ) : null}
              {selectedCategories.length > 0 && microPageIdx < selectedCategories.length ? (
                <button
                  type="button"
                  onClick={() => {
                    const msg = validateCurrentMicroPage();
                    if (msg) {
                      setClientError(msg);
                      setMissingRequiredKeys(getMissingKeysForCurrentMicroPage());
                      return;
                    }
                    setClientError(null);
                    setMissingRequiredKeys([]);
                    setMicroPageIdx((prev) => Math.min(selectedCategories.length, prev + 1));
                  }}
                  className="liivv-btn-primary px-6 py-2.5 text-sm sm:min-w-[120px]"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  name="intent"
                  value="save"
                  disabled={isSubmitting}
                  className="liivv-btn-primary px-6 py-2.5 text-sm sm:min-w-[120px]"
                >
                  {isSubmitting
                    ? 'Saving...'
                    : isOnboardingChrome
                      ? 'Continue to insurance'
                      : 'Save'}
                </button>
              )}
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
