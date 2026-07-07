'use client';

import { useActionState } from 'react';

import {
  staffLoginAction,
  type StaffLoginActionState,
} from '~/app/staff/_actions/staff-auth-actions';

export function StaffLoginForm() {
  const [state, formAction, isPending] = useActionState<StaffLoginActionState, FormData>(
    staffLoginAction,
    null,
  );

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <label className="block text-sm">
        <span className="font-medium text-[#2c2a26]">Staff password</span>
        <input
          autoComplete="current-password"
          className="mt-1 w-full rounded-lg border border-[#e0d9ce] px-3 py-2.5 text-sm"
          name="password"
          required
          type="password"
        />
      </label>
      {state?.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
      <button
        className="liivv-btn-primary w-full px-4 py-2.5 text-sm disabled:opacity-60"
        disabled={isPending}
        type="submit"
      >
        {isPending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
