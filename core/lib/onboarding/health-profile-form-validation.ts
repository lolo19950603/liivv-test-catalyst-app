/**
 * Shared validation for health profile "complete" submit (Continue to insurance / Save).
 */

import { isLiivPrimaryCategoryId } from '~/lib/onboarding/liiv-primary-health-category';

function trimStr(fd: FormData, key: string): string {
  const v = fd.get(key);
  if (typeof v !== 'string') return '';
  return v.trim();
}

function selectedCategorySlugs(fd: FormData): string[] {
  const fromBoxes = fd
    .getAll('care_interests')
    .map((v) => String(v).trim().toLowerCase())
    .filter(Boolean);
  const unique = [...new Set(fromBoxes)];
  if (unique.length) return unique;
  const legacy = trimStr(fd, 'primary_category');
  return legacy ? [legacy] : [];
}

function err(message: string): {ok: false; message: string} {
  return {ok: false, message};
}

/**
 * Validates Liiv health categories + any selected vertical sections before marking health step complete.
 */
export function validateHealthProfileComplete(fd: FormData): {ok: true} | {ok: false; message: string} {
  const selected = selectedCategorySlugs(fd);
  if (!selected.length) {
    return err('Please select at least one Liiv health category.');
  }
  for (const slug of selected) {
    if (!isLiivPrimaryCategoryId(slug)) {
      return err('Invalid category selection.');
    }
  }
  const requiredKeys: Record<string, string[]> = {
    diabetes_care_everyday: [
      'diabetes_path',
      'diabetes_journey_stage',
    ],
    ostomy_care_everyday: [
      'ostomy_type',
      'ostomy_journey_stage',
      'ostomy_preferred_brand',
    ],
    womens_health_wellness: ['womens_age_range', 'womens_life_phase'],
    sleep_rest: ['sleep_rest_barrier', 'sleep_rest_cpap_status'],
    healing_advanced_wound: ['wound_support_type'],
    minor_ailment_on: ['minor_ailment_focus'],
    personal_care_confidence: ['personal_care_priority'],
    breathing_lung_health: ['breathing_routine'],
    heart_blood_pressure: ['heart_tracking_pref', 'heart_circulation_issue'],
    skin_health_relief: ['skin_goal', 'skin_rules'],
    daily_nutrition_fuel: ['nutrition_fuel_focus'],
  };

  for (const category of selected) {
    const keys = requiredKeys[category] ?? [];
    for (const key of keys) {
      if (!trimStr(fd, key)) {
        return err('Please complete all required questions for each selected category.');
      }
    }
  }

  if (
    selected.includes('daily_nutrition_fuel') &&
    fd.getAll('nutrition_guardrails').map((v) => String(v).trim()).filter(Boolean).length === 0
  ) {
    return err('Please select at least one dietary guardrail.');
  }
  if (
    selected.includes('diabetes_care_everyday') &&
    fd.getAll('diabetes_management').map((v) => String(v).trim()).filter(Boolean).length === 0
  ) {
    return err('Please select at least one current diabetes management method.');
  }

  return {ok: true};
}
