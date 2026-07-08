'use client';

import { useActionState } from 'react';

import { Link } from '~/components/link';
import { OnboardingProgressBar } from '~/components/onboarding/onboarding-progress-bar';
import { OnboardingSectionHeader } from '~/components/onboarding/onboarding-section-header';
import { OnboardingSubmitOverlay } from '~/components/onboarding/onboarding-submit-overlay';
import {
  ACCOUNT_ONBOARDING_HEALTH_PROFILE,
  ACCOUNT_ONBOARDING_INSURANCE,
  appendSetupFlowQuery,
  SETUP_FLOW_VALUE,
} from '~/lib/onboarding/onboarding-flow';
import {
  saveInsuranceStep,
  type OnboardingActionState,
} from '../_actions/onboarding-actions';

export function InsuranceStepForm({ isSetupFlow }: { isSetupFlow: boolean }) {
  const [state, formAction, isPending] = useActionState<OnboardingActionState, FormData>(
    saveInsuranceStep,
    null,
  );

  return (
    <div className="w-full">
      <OnboardingSubmitOverlay message="Saving insurance details..." visible={isPending} />
      <section className="space-y-8">
        {isSetupFlow ? (
          <OnboardingProgressBar current={3} label="Onboarding progress" total={3} />
        ) : null}
        <OnboardingSectionHeader
          centerOnMobile
          description="Add your coverage details or skip for now. You can update this later."
          kicker="Onboarding"
          titleAccent="information"
          titleBefore="Step 3: Insurance "
        />

        {state?.error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {state.error}
          </div>
        ) : null}

        <form
          action={formAction}
          className="onboarding-insurance-form space-y-6 rounded-2xl border border-[#e8e2d8] bg-white p-6 shadow-sm"
        >
          {isSetupFlow ? <input name="setup" type="hidden" value={SETUP_FLOW_VALUE} /> : null}

          <label className="flex items-center gap-2 text-sm text-[#2c2a26]">
            <input name="noInsurance" type="checkbox" value="true" />
            I do not have insurance coverage
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm sm:col-span-2">
              <span className="text-[#6b6560]">Insurance provider</span>
              <input className="mt-1 w-full rounded-lg border border-[#d6d0c5] px-3 py-2" name="providerName" type="text" />
            </label>
            <label className="block text-sm">
              <span className="text-[#6b6560]">Policy number</span>
              <input className="mt-1 w-full rounded-lg border border-[#d6d0c5] px-3 py-2" name="policyNumber" type="text" />
            </label>
            <label className="block text-sm">
              <span className="text-[#6b6560]">Member ID</span>
              <input className="mt-1 w-full rounded-lg border border-[#d6d0c5] px-3 py-2" name="memberId" type="text" />
            </label>
            <label className="block text-sm">
              <span className="text-[#6b6560]">Group number</span>
              <input className="mt-1 w-full rounded-lg border border-[#d6d0c5] px-3 py-2" name="groupNumber" type="text" />
            </label>
            <label className="block text-sm">
              <span className="text-[#6b6560]">Primary holder name</span>
              <input className="mt-1 w-full rounded-lg border border-[#d6d0c5] px-3 py-2" name="primaryHolderName" type="text" />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="text-[#6b6560]">Relationship to primary holder</span>
              <select className="mt-1 w-full rounded-lg border border-[#d6d0c5] px-3 py-2" defaultValue="self" name="relationship">
                <option value="self">Self</option>
                <option value="spouse">Spouse</option>
                <option value="child">Child</option>
                <option value="other">Other</option>
              </select>
            </label>
          </div>

          <div className="flex flex-col gap-3 border-t border-[#e8e2d8] pt-6 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              className="liivv-btn-secondary inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm"
              href={
                isSetupFlow
                  ? appendSetupFlowQuery(ACCOUNT_ONBOARDING_HEALTH_PROFILE)
                  : ACCOUNT_ONBOARDING_HEALTH_PROFILE
              }
            >
              <span aria-hidden>‹</span> Back
            </Link>
            <button
              className="liivv-btn-secondary px-5 py-2.5 text-sm"
              disabled={isPending}
              name="intent"
              type="submit"
              value="skip"
            >
              Skip for now
            </button>
            <button
              className="liivv-btn-primary px-6 py-2.5 text-sm sm:min-w-[120px]"
              disabled={isPending}
              name="intent"
              type="submit"
              value="save"
            >
              {isPending ? 'Saving...' : 'Save and finish'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
