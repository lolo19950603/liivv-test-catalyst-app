import { NextResponse } from 'next/server';

import { createBcAppSessionCookie } from '~/lib/bc-app-session';
import {
  getBcAppPublicUrl,
  isBcAppConfigured,
  verifyBcAppSignedPayload,
} from '~/lib/bigcommerce/app-oauth';
import { withBcAppCspHeaders } from '~/lib/content-security-policy';
import { bcAppHtmlResponse } from '~/lib/bigcommerce/app-html';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  if (!isBcAppConfigured()) {
    return NextResponse.json(
      { error: 'BigCommerce app is not configured.' },
      { status: 503 },
    );
  }

  const url = new URL(request.url);
  const signedPayload =
    url.searchParams.get('signed_payload_jwt')?.trim() ??
    url.searchParams.get('signed_payload')?.trim() ??
    '';

  if (!signedPayload) {
    return bcAppHtmlResponse(
      'Unable to open Liivv Staff',
      '<p>Missing signed payload from BigCommerce.</p>',
    );
  }

  const payload = await verifyBcAppSignedPayload(signedPayload);

  if (!payload) {
    return bcAppHtmlResponse(
      'Unable to open Liivv Staff',
      '<p>Could not verify the BigCommerce signed payload.</p>',
    );
  }

  await createBcAppSessionCookie({
    storeHash: payload.store_hash,
    user: payload.user,
  });

  const appUrl = getBcAppPublicUrl();
  const destination = appUrl ? `${appUrl}/bc-app` : new URL('/bc-app', url.origin).toString();

  const response = NextResponse.redirect(destination);

  withBcAppCspHeaders(response.headers);

  return response;
}
