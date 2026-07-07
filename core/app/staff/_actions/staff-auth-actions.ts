'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import {
  createStaffSessionCookie,
  clearStaffSessionCookie,
  isStaffAuthConfigured,
  verifyStaffPassword,
} from '~/lib/admin-auth';

export type StaffLoginActionState = { error?: string } | null;

export async function staffLoginAction(
  _prevState: StaffLoginActionState,
  formData: FormData,
): Promise<StaffLoginActionState> {
  if (!isStaffAuthConfigured()) {
    return {
      error: 'Staff login is not configured. Set ADMIN_DASHBOARD_PASSWORD and ADMIN_SESSION_SECRET.',
    };
  }

  const password = String(formData.get('password') ?? '');

  if (!verifyStaffPassword(password)) {
    return { error: 'Incorrect password.' };
  }

  await createStaffSessionCookie();
  redirect('/staff');
}

export async function staffLogoutAction(): Promise<void> {
  await clearStaffSessionCookie();
  redirect('/staff/login');
}
