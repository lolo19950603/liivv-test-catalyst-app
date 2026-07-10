import { NextResponse } from 'next/server';

import { deleteBcAppInstall, isBcAppConfigured, verifyBcAppSignedPayload } from '~/lib/bigcommerce/app-oauth';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  if (!isBcAppConfigured()) {
    return NextResponse.json({ received: false, error: 'BigCommerce app is not configured.' }, { status: 503 });
  }

  const url = new URL(request.url);
  const signedPayload =
    url.searchParams.get('signed_payload')?.trim() ??
    url.searchParams.get('signed_payload_jwt')?.trim() ??
    '';

  if (!signedPayload) {
    return NextResponse.json({ received: false, error: 'Missing signed payload.' }, { status: 400 });
  }

  const payload = await verifyBcAppSignedPayload(signedPayload);

  if (!payload) {
    return NextResponse.json({ received: false, error: 'Invalid signed payload.' }, { status: 401 });
  }

  await deleteBcAppInstall(payload.store_hash);

  return NextResponse.json({ received: true });
}
