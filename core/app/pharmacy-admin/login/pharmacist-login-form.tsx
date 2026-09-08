'use client';

import { useActionState } from 'react';

import { loginPharmacist, type PharmacistLoginState } from '~/app/pharmacy-admin/_actions/login';

const forest = '#375a37';

export function PharmacistLoginForm() {
  const [state, action, pending] = useActionState<PharmacistLoginState, FormData>(
    loginPharmacist,
    null,
  );

  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-[#4a4540]">Username</span>
        <input
          autoComplete="username"
          className="w-full rounded-lg border border-[#e5dfd5] bg-white px-3 py-2.5 text-sm text-[#2c2a26] outline-none focus:border-[#8aa58a] focus:ring-2 focus:ring-[#d7e4d7]"
          name="username"
          required
          type="text"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-[#4a4540]">Password</span>
        <input
          autoComplete="current-password"
          className="w-full rounded-lg border border-[#e5dfd5] bg-white px-3 py-2.5 text-sm text-[#2c2a26] outline-none focus:border-[#8aa58a] focus:ring-2 focus:ring-[#d7e4d7]"
          name="password"
          required
          type="password"
        />
      </label>
      {state?.error ? (
        <p className="rounded-lg border border-[#ead7d2] bg-[#fdf6f4] px-3 py-2 text-sm text-[#8a3d32]">
          {state.error}
        </p>
      ) : null}
      <button
        className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        disabled={pending}
        style={{ backgroundColor: forest }}
        type="submit"
      >
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
