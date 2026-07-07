import type { LiivPrimaryCategoryId } from '~/lib/onboarding/liiv-primary-health-category';

const DEFAULT_HERO_IMAGE = '/archive/images/dashboard-prescriptions.png';

/** Category-specific hero photography for the dashboard interest panel. */
export const CATEGORY_HERO_IMAGES: Partial<Record<LiivPrimaryCategoryId, string>> = {
  diabetes_care_everyday: '/archive/images/dashboard-cards.png',
  ostomy_care_everyday: DEFAULT_HERO_IMAGE,
  sleep_rest: '/archive/images/dashboard-appointments.png',
  minor_ailment_on: '/archive/images/dashboard-appointments.png',
};

export function getCategoryHeroImage(categoryId: string | null | undefined): string {
  if (!categoryId) {
    return DEFAULT_HERO_IMAGE;
  }

  return CATEGORY_HERO_IMAGES[categoryId as LiivPrimaryCategoryId] ?? DEFAULT_HERO_IMAGE;
}
