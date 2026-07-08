'use client';

import { useActionState } from 'react';

import { Link } from '~/components/link';
import { OnboardingProgressBar } from '~/components/onboarding/onboarding-progress-bar';
import { OnboardingSectionHeader } from '~/components/onboarding/onboarding-section-header';
import { OnboardingSubmitOverlay } from '~/components/onboarding/onboarding-submit-overlay';
import { SETUP_FLOW_VALUE } from '~/lib/onboarding/onboarding-flow';
import {
  saveOnboardingProfileStep,
  type OnboardingActionState,
} from '../_actions/onboarding-actions';

export function ProfileStepForm({
  initial,
  isSetupFlow,
}: {
  initial: {
    firstName: string;
    lastName: string;
    phone: string;
    address1: string;
    address2: string;
    city: string;
    postalCode: string;
    stateOrProvince: string;
    countryCode: string;
  };
  isSetupFlow: boolean;
}) {
  const [state, formAction, isPending] = useActionState<OnboardingActionState, FormData>(
    saveOnboardingProfileStep,
    null,
  );

  return (
    <div className="w-full">
      <OnboardingSubmitOverlay message="Saving profile details..." visible={isPending} />
      <section className="space-y-8">
        {isSetupFlow ? (
          <OnboardingProgressBar current={1} label="Onboarding progress" total={3} />
        ) : null}
        <OnboardingSectionHeader
          centerOnMobile
          description="Name and mailing address are required. Phone is optional."
          kicker="Onboarding"
          titleAccent="details"
          titleBefore="Step 1: Profile "
        />

        {state?.error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {state.error}
          </div>
        ) : null}

        <form
          action={formAction}
          className="onboarding-profile-form mx-auto w-full max-w-4xl space-y-6 rounded-2xl border border-[#e8e2d8] bg-white p-6 shadow-sm"
        >
          {isSetupFlow ? <input name="setup" type="hidden" value={SETUP_FLOW_VALUE} /> : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="text-[#6b6560]">First name *</span>
              <input
                className="mt-1 w-full rounded-lg border border-[#d6d0c5] px-3 py-2"
                defaultValue={initial.firstName}
                name="firstName"
                required
                type="text"
              />
            </label>
            <label className="block text-sm">
              <span className="text-[#6b6560]">Last name *</span>
              <input
                className="mt-1 w-full rounded-lg border border-[#d6d0c5] px-3 py-2"
                defaultValue={initial.lastName}
                name="lastName"
                required
                type="text"
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="text-[#6b6560]">Phone (optional)</span>
              <input
                className="mt-1 w-full rounded-lg border border-[#d6d0c5] px-3 py-2"
                defaultValue={initial.phone}
                name="phone"
                type="tel"
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="text-[#6b6560]">Address line 1 *</span>
              <input
                className="mt-1 w-full rounded-lg border border-[#d6d0c5] px-3 py-2"
                defaultValue={initial.address1}
                name="address1"
                required
                type="text"
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="text-[#6b6560]">Address line 2</span>
              <input
                className="mt-1 w-full rounded-lg border border-[#d6d0c5] px-3 py-2"
                defaultValue={initial.address2}
                name="address2"
                type="text"
              />
            </label>
            <label className="block text-sm">
              <span className="text-[#6b6560]">City *</span>
              <input
                className="mt-1 w-full rounded-lg border border-[#d6d0c5] px-3 py-2"
                defaultValue={initial.city}
                name="city"
                required
                type="text"
              />
            </label>
            <label className="block text-sm">
              <span className="text-[#6b6560]">Postal code *</span>
              <input
                className="mt-1 w-full rounded-lg border border-[#d6d0c5] px-3 py-2"
                defaultValue={initial.postalCode}
                name="postalCode"
                required
                type="text"
              />
            </label>
            <label className="block text-sm">
              <span className="text-[#6b6560]">Province / State</span>
              <input
                className="mt-1 w-full rounded-lg border border-[#d6d0c5] px-3 py-2"
                defaultValue={initial.stateOrProvince}
                name="stateOrProvince"
                type="text"
              />
            </label>
            <label className="block text-sm">
              <span className="text-[#6b6560]">Country</span>
              <input
                className="mt-1 w-full rounded-lg border border-[#d6d0c5] px-3 py-2"
                defaultValue={initial.countryCode}
                name="countryCode"
                type="text"
              />
            </label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              className="liivv-btn-secondary inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm"
              href="/account/dashboard/"
            >
              <span aria-hidden>‹</span> Back to dashboard
            </Link>
            <button
              className="liivv-btn-primary px-6 py-2.5 text-sm sm:min-w-[120px]"
              disabled={isPending}
              type="submit"
            >
              {isPending ? 'Saving...' : 'Continue'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
