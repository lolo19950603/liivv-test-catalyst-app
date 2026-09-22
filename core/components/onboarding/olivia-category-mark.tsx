'use client';

import { Image } from '~/components/image';
import type { LiivPrimaryCategoryId } from '~/lib/onboarding/liiv-primary-health-category';

import oliviaBreathing from './olivia-variants/breathing.png';
import oliviaDiabetes from './olivia-variants/diabetes.png';
import oliviaHeart from './olivia-variants/heart.png';
import oliviaMinorAilment from './olivia-variants/minor-ailment.png';
import oliviaNutrition from './olivia-variants/nutrition.png';
import oliviaOstomy from './olivia-variants/ostomy.png';
import oliviaPersonalCare from './olivia-variants/personal-care.png';
import oliviaSkin from './olivia-variants/skin.png';
import oliviaSleep from './olivia-variants/sleep.png';
import oliviaWomensHealth from './olivia-variants/womens-health.png';
import oliviaWoundCare from './olivia-variants/wound-care.png';

const OLIVIA_CATEGORY_MARKS: Record<LiivPrimaryCategoryId, typeof oliviaDiabetes> = {
  diabetes_care_everyday: oliviaDiabetes,
  ostomy_care_everyday: oliviaOstomy,
  womens_health_wellness: oliviaWomensHealth,
  sleep_rest: oliviaSleep,
  healing_advanced_wound: oliviaWoundCare,
  minor_ailment_on: oliviaMinorAilment,
  personal_care_confidence: oliviaPersonalCare,
  breathing_lung_health: oliviaBreathing,
  heart_blood_pressure: oliviaHeart,
  skin_health_relief: oliviaSkin,
  daily_nutrition_fuel: oliviaNutrition,
};

export function OliviaCategoryMark({
  categoryId,
  label,
  size = 40,
}: {
  categoryId: string;
  label?: string;
  size?: number;
}) {
  const src = OLIVIA_CATEGORY_MARKS[categoryId as LiivPrimaryCategoryId];

  if (!src) {
    return (
      <span
        className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e8f0e4] text-xl"
        style={{ width: size, height: size }}
      >
        💚
      </span>
    );
  }

  return (
    <span
      className="relative inline-flex shrink-0 overflow-hidden rounded-full bg-[#e8f0e4]"
      style={{ width: size, height: size }}
    >
      <Image
        alt={label ?? ''}
        className="object-contain object-center p-0.5"
        fill
        sizes={`${size}px`}
        src={src}
      />
    </span>
  );
}
