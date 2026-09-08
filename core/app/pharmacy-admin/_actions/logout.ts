'use server';

import { redirect } from 'next/navigation';

import { PHARMACIST_LOGIN_PATH, clearPharmacistSessionCookie } from '~/lib/pharmacist-session';

export async function logoutPharmacist(): Promise<void> {
  await clearPharmacistSessionCookie();
  redirect(PHARMACIST_LOGIN_PATH);
}
