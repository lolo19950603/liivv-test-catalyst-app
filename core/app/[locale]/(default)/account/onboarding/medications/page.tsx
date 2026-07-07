import { Link } from '~/components/link';
import { OnboardingProgressBar } from '~/components/onboarding/onboarding-progress-bar';
import { OnboardingSectionHeader } from '~/components/onboarding/onboarding-section-header';
import {
  ACCOUNT_ONBOARDING_HEALTH_PROFILE,
  ACCOUNT_ONBOARDING_INSURANCE,
  appendSetupFlowQuery,
  SETUP_FLOW_VALUE,
} from '~/lib/onboarding/onboarding-flow';

import { saveMedicationsStep } from '../_actions/onboarding-actions';

interface Props {
  searchParams: Promise<{ setup?: string }>;
}

export default async function OnboardingMedicationsPage({ searchParams }: Props) {
  const { setup } = await searchParams;
  const isSetupFlow = setup === '1';

  return (
    <div className="w-full">
      <section className="space-y-8">
        {isSetupFlow ? (
          <OnboardingProgressBar current={3} label="Onboarding progress" total={4} />
        ) : null}
        <OnboardingSectionHeader
          centerOnMobile
          description="Medication search and allergy tracking will be saved in a future update. Continue to insurance when ready."
          kicker="Onboarding"
          title={
            <>
              <span className="font-semibold text-[#1a1a1a]">Step 3: Current medications </span>
              <span className="font-normal text-[#8E9E88]">& allergies</span>
            </>
          }
        />

        <form action={saveMedicationsStep} className="onboarding-medications-form space-y-6">
          {isSetupFlow ? <input name="setup" type="hidden" value={SETUP_FLOW_VALUE} /> : null}

          <div>
            <label className="block text-sm font-medium text-[#2c2a26]" htmlFor="dummy_allergies">
              Allergies (placeholder)
            </label>
            <textarea
              className="mt-1 w-full rounded-lg border border-[#e0d9ce] bg-white px-3 py-2 text-sm text-[#2c2a26] placeholder:text-[#9a928a] focus:border-[#8a9a7b] focus:outline-none focus:ring-2 focus:ring-[#8a9a7b]/30"
              id="dummy_allergies"
              name="dummy_allergies"
              placeholder="Add sample allergies here..."
              rows={3}
            />
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
              <span aria-hidden>‹</span> Back to health profile
            </Link>
            <button
              className="liivv-btn-secondary px-5 py-2.5 text-sm"
              name="intent"
              type="submit"
              value="skip"
            >
              Skip for now
            </button>
            <button
              className="liivv-btn-primary px-6 py-2.5 text-sm sm:min-w-[120px]"
              name="intent"
              type="submit"
              value="continue"
            >
              Continue to insurance
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
