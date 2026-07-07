const fs = require('fs');

const srcPath = 'd:/liivv-test-catalyst-app/core/components/onboarding/health-profile-form.source.tsx';
const outPath = 'd:/liivv-test-catalyst-app/core/components/onboarding/health-profile-form.tsx';

const src = fs.readFileSync(srcPath, 'utf8');
const start = src.indexOf('export default function HealthProfileOnboarding');

if (start < 0) {
  throw new Error('component not found');
}

let body = src.slice(start);
body = body.replace('export default function HealthProfileOnboarding()', 'function HealthProfileFormInner()');

const header = `'use client';

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
    profileInitial: { firstName: string; lastName: string };
    supabaseReady: boolean;
    healthProfileCompleted: boolean;
    showSkipForNow: boolean;
    isOnboardingChrome: boolean;
    isSetupFlow: boolean;
  };
  actionData?: { error?: string; nameError?: string } | null;
  isSubmitting?: boolean;
  formAction: (formData: FormData) => void;
  nameFormAction?: (formData: FormData) => void;
};

export function HealthProfileForm({
  data,
  actionData = null,
  isSubmitting = false,
  formAction,
  nameFormAction,
}: HealthProfileFormProps) {
`;

body = body
  .replace(/const data = useLoaderData<typeof loader>\(\);\s*/g, '')
  .replace(/const actionData = useActionData<typeof action>\(\);\s*/g, '')
  .replace(/const navigation = useNavigation\(\);\s*/g, '')
  .replace(/const params = useParams\(\);\s*/g, '')
  .replace(/const localePrefix =[\s\S]*?;\s*/m, '')
  .replace(/const isSubmitting = navigation\.state === 'submitting';\s*/g, '')
  .replace(/\bForm\b/g, 'form')
  .replace(/\bto=/g, 'href=')
  .replace(/method="put"/g, 'action={nameFormAction}')
  .replace(/method="post"/g, 'action={formAction}')
  .replace(/AccountSectionHeader/g, 'OnboardingSectionHeader')
  .replace(/categoryCollectionImages/g, '{} as Record<string, string>')
  .replace(/googleMapsApiKey/g, 'null')
  .replace(/data\.customer\.addresses\?\.nodes \?\? \[\]/g, '[]')
  .replace(/savedAddresses/g, '[] as never[]')
  .replace(/visibleSavedAddresses/g, '[] as never[]')
  .replace(/showAllSavedAddresses/g, 'false')
  .replace(/setShowAllSavedAddresses/g, '() => undefined');

const footer = '\n}\n';

fs.writeFileSync(outPath, header + body.replace(/^function HealthProfileFormInner\(\) \{/, '') + footer);
console.log('Wrote', outPath);
