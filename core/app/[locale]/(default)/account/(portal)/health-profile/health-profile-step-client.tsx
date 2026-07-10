'use client';

import { useActionState } from 'react';

import { HealthProfileForm } from '~/components/onboarding/health-profile-form';
import {
  filterCategoriesForRegion,
  LIIV_PRIMARY_HEALTH_CATEGORIES,
  type LiivPrimaryCategoryId,
} from '~/lib/onboarding/liiv-primary-health-category';
import type { HealthProfileRow } from '~/lib/supabase/health-profile';
import {
  saveHealthProfileStep,
  type OnboardingActionState,
} from '~/app/[locale]/(default)/account/onboarding/_actions/onboarding-actions';

export function HealthProfileStepClient({
  isSetupFlow,
  stepData,
}: {
  isSetupFlow: boolean;
  stepData: {
    initialCategories: LiivPrimaryCategoryId[];
    isOntario: boolean;
    initialHealthProfile: HealthProfileRow | null;
    healthProfileCompleted: boolean;
    supabaseReady: boolean;
  };
}) {
  const [state, formAction, isPending] = useActionState<OnboardingActionState, FormData>(
    saveHealthProfileStep,
    null,
  );

  const primaryCategoryOptions = filterCategoriesForRegion(LIIV_PRIMARY_HEALTH_CATEGORIES, {
    isOntario: stepData.isOntario,
  });
  const isOnboardingChrome = isSetupFlow && !stepData.healthProfileCompleted;

  return (
    <HealthProfileForm
      actionData={state}
      data={{
        initialCategories: stepData.initialCategories,
        primaryCategoryOptions,
        isOntario: stepData.isOntario,
        initialHealthProfile: stepData.initialHealthProfile,
        supabaseReady: stepData.supabaseReady,
        healthProfileCompleted: stepData.healthProfileCompleted,
        showSkipForNow: isOnboardingChrome,
        isOnboardingChrome,
        isSetupFlow,
      }}
      formAction={formAction}
      isSubmitting={isPending}
    />
  );
}
