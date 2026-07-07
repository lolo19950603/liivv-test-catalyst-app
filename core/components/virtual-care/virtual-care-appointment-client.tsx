'use client';

import { useActionState } from 'react';

import {
  virtualCareAppointmentAction,
  type VirtualCareAppointmentActionState,
} from '~/app/[locale]/(default)/account/virtual-care/_actions/virtual-care-actions';
import { Link } from '~/components/link';
import { OnboardingSectionHeader } from '~/components/onboarding/onboarding-section-header';

function todayIsoDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${y}-${m}-${day}`;
}

export function VirtualCareAppointmentClient() {
  const minDate = todayIsoDate();
  const [state, formAction, isPending] = useActionState<
    VirtualCareAppointmentActionState,
    FormData
  >(virtualCareAppointmentAction, null);

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6 pb-10">
      <Link className="text-sm font-medium text-[#375a37] hover:underline" href="/account/virtual-care">
        ‹ Virtual care
      </Link>
      <OnboardingSectionHeader
        description="Tell us what you need and when you'd like to meet. Our team will confirm by email."
        kicker="Appointments"
        titleAccent="appointment"
        titleBefore="Book an "
      />

      {state?.ok ? (
        <div className="rounded-xl border border-[#c4d4b8] bg-[#f4f7f0] px-4 py-3 text-sm text-[#2c2a26]">
          Request received. We&apos;ll follow up shortly to confirm your appointment.
        </div>
      ) : (
        <form action={formAction} className="space-y-4 rounded-2xl border border-[#e5dfd5] bg-white p-6">
          <label className="block text-sm">
            <span className="font-medium text-[#2c2a26]">Preferred date</span>
            <input
              className="mt-1 w-full rounded-lg border border-[#e0d9ce] px-3 py-2"
              min={minDate}
              name="preferredDate"
              required
              type="date"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-[#2c2a26]">Preferred time (optional)</span>
            <input
              className="mt-1 w-full rounded-lg border border-[#e0d9ce] px-3 py-2"
              name="preferredTime"
              placeholder="e.g. Morning, 2:00 PM"
              type="text"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-[#2c2a26]">What is this appointment about?</span>
            <textarea
              className="mt-1 w-full rounded-lg border border-[#e0d9ce] px-3 py-2"
              name="details"
              required
              rows={4}
            />
          </label>
          {state?.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
          <button
            className="liivv-btn-primary px-5 py-2.5 text-sm disabled:opacity-60"
            disabled={isPending}
            type="submit"
          >
            {isPending ? 'Submitting…' : 'Request appointment'}
          </button>
        </form>
      )}
    </section>
  );
}
