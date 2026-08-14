'use client';

import { useActionState } from 'react';

import { OnboardingSubmitOverlay } from '~/components/onboarding/onboarding-submit-overlay';
import {
  saveInsuranceStep,
  type InsuranceActionState,
} from '~/app/[locale]/(default)/account/(portal)/dashboard/_actions/save-insurance';

export function OliviaInsuranceForm({
  labels,
}: {
  labels: {
    insuranceDescription: string;
    noInsurance: string;
    providerName: string;
    policyNumber: string;
    memberId: string;
    groupNumber: string;
    primaryHolderName: string;
    relationship: string;
    skip: string;
    saveInsurance: string;
    savingInsurance: string;
  };
}) {
  const [state, formAction, isPending] = useActionState<InsuranceActionState, FormData>(
    saveInsuranceStep,
    null,
  );

  return (
    <div className="w-full">
      <OnboardingSubmitOverlay message={labels.savingInsurance} visible={isPending} />
      <p className="mhd-olivia-sheet__lead">{labels.insuranceDescription}</p>

      {state?.error ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {state.error}
        </div>
      ) : null}

      <form action={formAction} className="mt-6 space-y-5">
        <label className="flex items-center gap-2 text-sm text-[#2c2a26]">
          <input name="noInsurance" type="checkbox" value="true" />
          {labels.noInsurance}
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm sm:col-span-2">
            <span className="text-[#6b6560]">{labels.providerName}</span>
            <input className="mt-1 w-full rounded-lg border border-[#d6d0c5] px-3 py-2" name="providerName" type="text" />
          </label>
          <label className="block text-sm">
            <span className="text-[#6b6560]">{labels.policyNumber}</span>
            <input className="mt-1 w-full rounded-lg border border-[#d6d0c5] px-3 py-2" name="policyNumber" type="text" />
          </label>
          <label className="block text-sm">
            <span className="text-[#6b6560]">{labels.memberId}</span>
            <input className="mt-1 w-full rounded-lg border border-[#d6d0c5] px-3 py-2" name="memberId" type="text" />
          </label>
          <label className="block text-sm">
            <span className="text-[#6b6560]">{labels.groupNumber}</span>
            <input className="mt-1 w-full rounded-lg border border-[#d6d0c5] px-3 py-2" name="groupNumber" type="text" />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="text-[#6b6560]">{labels.primaryHolderName}</span>
            <input className="mt-1 w-full rounded-lg border border-[#d6d0c5] px-3 py-2" name="primaryHolderName" type="text" />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="text-[#6b6560]">{labels.relationship}</span>
            <input className="mt-1 w-full rounded-lg border border-[#d6d0c5] px-3 py-2" name="relationship" type="text" />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-[#e8e2d8] pt-5">
          <button
            className="liivv-btn-secondary px-5 py-2.5 text-sm"
            disabled={isPending}
            name="intent"
            type="submit"
            value="skip"
          >
            {labels.skip}
          </button>
          <button
            className="liivv-btn-primary px-6 py-2.5 text-sm"
            disabled={isPending}
            name="intent"
            type="submit"
            value="save"
          >
            {labels.saveInsurance}
          </button>
        </div>
      </form>
    </div>
  );
}
