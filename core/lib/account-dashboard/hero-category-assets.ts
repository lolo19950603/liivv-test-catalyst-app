import {
  getPrimaryCategoryDisplay,
  isLiivPrimaryCategoryId,
} from '~/lib/onboarding/liiv-primary-health-category';

const DEFAULT_HERO_IMAGE = '/archive/images/dashboard-prescriptions.png';

export function getCategoryHeroImage(categoryId: string | null | undefined): string {
  if (!categoryId || !isLiivPrimaryCategoryId(categoryId)) {
    return DEFAULT_HERO_IMAGE;
  }

  const image = getPrimaryCategoryDisplay(categoryId).image.trim();
  return image || DEFAULT_HERO_IMAGE;
}
