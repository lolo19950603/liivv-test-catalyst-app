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
  type HealthProfileActionState,
} from './_actions/save-health-profile';

export function HealthProfileStepClient({
  stepData,
}: {
  stepData: {
    initialCategories: LiivPrimaryCategoryId[];
    isOntario: boolean;
    initialHealthProfile: HealthProfileRow | null;
    supabaseReady: boolean;
  };
}) {
  const [state, formAction, isPending] = useActionState<HealthProfileActionState, FormData>(
    saveHealthProfileStep,
    null,
  );

  const primaryCategoryOptions = filterCategoriesForRegion(LIIV_PRIMARY_HEALTH_CATEGORIES, {
    isOntario: stepData.isOntario,
  });

  return (
    <HealthProfileForm
      actionData={state}
      data={{
        initialCategories: stepData.initialCategories,
        primaryCategoryOptions,
        isOntario: stepData.isOntario,
        initialHealthProfile: stepData.initialHealthProfile,
        supabaseReady: stepData.supabaseReady,
      }}
      formAction={formAction}
      isSubmitting={isPending}
    />
  );
}
