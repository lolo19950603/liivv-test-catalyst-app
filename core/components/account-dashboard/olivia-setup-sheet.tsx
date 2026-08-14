'use client';

import { useEffect } from 'react';

import { HealthProfileStepClient } from '~/app/[locale]/(default)/account/(portal)/health-profile/health-profile-step-client';
import type { LiivPrimaryCategoryId } from '~/lib/onboarding/liiv-primary-health-category';
import type { HealthProfileRow } from '~/lib/supabase/health-profile';

import { OliviaInsuranceForm } from './olivia-insurance-form';

export type OliviaSetupSheetKind = 'health' | 'insurance';

export function OliviaSetupSheet({
  kind,
  onClose,
  healthStepData,
  labels,
}: {
  kind: OliviaSetupSheetKind;
  onClose: () => void;
  healthStepData: {
    initialCategories: LiivPrimaryCategoryId[];
    isOntario: boolean;
    initialHealthProfile: HealthProfileRow | null;
    supabaseReady: boolean;
  };
  labels: {
    healthSheetTitle: string;
    insuranceSheetTitle: string;
    closeSheet: string;
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
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const title = kind === 'health' ? labels.healthSheetTitle : labels.insuranceSheetTitle;

  return (
    <div className="mhd-olivia-sheet">
      <button
        aria-label={labels.closeSheet}
        className="mhd-olivia-sheet__backdrop"
        onClick={onClose}
        type="button"
      />
      <aside
        aria-labelledby="olivia-setup-sheet-title"
        aria-modal="true"
        className="mhd-olivia-sheet__panel"
        role="dialog"
      >
        <header className="mhd-olivia-sheet__header">
          <h2 id="olivia-setup-sheet-title">{title}</h2>
          <button className="mhd-olivia-sheet__close" onClick={onClose} type="button">
            {labels.closeSheet}
          </button>
        </header>
        <div className="mhd-olivia-sheet__body">
          {kind === 'health' ? (
            <HealthProfileStepClient embedded stepData={healthStepData} />
          ) : (
            <OliviaInsuranceForm labels={labels} />
          )}
        </div>
      </aside>
    </div>
  );
}
