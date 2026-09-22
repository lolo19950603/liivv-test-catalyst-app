'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { consumeIpRateLimit } from '~/lib/api-gateway/ip-rate-limit';
import { getBcAppSession } from '~/lib/bc-app-session';
import {
  PHARMACIST_PORTAL_PATH,
  createPharmacistSessionCookie,
  credentialsMatch,
  getPharmacistCredentials,
  getPharmacistSession,
} from '~/lib/pharmacist-session';

export type PharmacistLoginState = { error: string } | null;

const LOGIN_RATE_MAX = 10;
const LOGIN_RATE_WINDOW_SEC = 15 * 60;

export async function loginPharmacist(
  _prev: PharmacistLoginState,
  formData: FormData,
): Promise<PharmacistLoginState> {
  if (!(await getBcAppSession())) {
    return {
      error: 'Open pharmacist admin from the BigCommerce control panel first.',
    };
  }

  if (await getPharmacistSession()) {
    redirect(PHARMACIST_PORTAL_PATH);
  }

  if (!getPharmacistCredentials()) {
    return { error: 'Pharmacist sign-in is not configured.' };
  }

  const headerList = await headers();
  const request = new Request('https://liivv.local/pharmacy-admin/login', { headers: headerList });
  const limit = await consumeIpRateLimit(request, 'pharmacist-login', LOGIN_RATE_MAX, LOGIN_RATE_WINDOW_SEC);

  if (!limit.allowed) {
    return { error: `Too many sign-in attempts. Try again in ${limit.retryAfterSec} seconds.` };
  }

  const username = String(formData.get('username') ?? '');
  const password = String(formData.get('password') ?? '');

  if (!credentialsMatch(username, password)) {
    return { error: 'Invalid username or password.' };
  }

  await createPharmacistSessionCookie(username.trim());
  redirect(PHARMACIST_PORTAL_PATH);
}
