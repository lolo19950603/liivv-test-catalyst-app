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
  updateOnboardingCustomerName,
  type OnboardingActionState,
} from '../_actions/onboarding-actions';

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
    profileInitial: { firstName: string; lastName: string };
    supabaseReady: boolean;
    stateOrProvince: string;
  };
}) {
  const [state, formAction, isPending] = useActionState<OnboardingActionState, FormData>(
    saveHealthProfileStep,
    null,
  );
  const [nameState, nameFormAction] = useActionState<OnboardingActionState, FormData>(
    updateOnboardingCustomerName,
    null,
  );

  const primaryCategoryOptions = filterCategoriesForRegion(LIIV_PRIMARY_HEALTH_CATEGORIES, {
    isOntario: stepData.isOntario,
  });
  const isOnboardingChrome = isSetupFlow && !stepData.healthProfileCompleted;

  return (
    <HealthProfileForm
      actionData={state ?? nameState}
      data={{
        initialCategories: stepData.initialCategories,
        primaryCategoryOptions,
        isOntario: stepData.isOntario,
        initialHealthProfile: stepData.initialHealthProfile,
        profileInitial: stepData.profileInitial,
        supabaseReady: stepData.supabaseReady,
        healthProfileCompleted: stepData.healthProfileCompleted,
        showSkipForNow: isOnboardingChrome,
        isOnboardingChrome,
        isSetupFlow,
      }}
      formAction={formAction}
      isSubmitting={isPending}
      nameFormAction={nameFormAction}
    />
  );
}
