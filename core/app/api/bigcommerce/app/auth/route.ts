import { NextResponse } from 'next/server';

import {
  exchangeBcAppAuthCode,
  getBcAppPublicUrl,
  isBcAppConfigured,
  saveBcAppInstall,
} from '~/lib/bigcommerce/app-oauth';
import { bcAppHtmlResponse } from '~/lib/bigcommerce/app-html';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  if (!isBcAppConfigured()) {
    return NextResponse.json(
      { error: 'BigCommerce app is not configured. Set BIGCOMMERCE_APP_CLIENT_ID, BIGCOMMERCE_APP_CLIENT_SECRET, and BIGCOMMERCE_APP_URL.' },
      { status: 503 },
    );
  }

  const url = new URL(request.url);
  const code = url.searchParams.get('code')?.trim() ?? '';
  const scope = url.searchParams.get('scope')?.trim() ?? '';
  const context = url.searchParams.get('context')?.trim() ?? '';

  if (!code || !scope || !context) {
    return bcAppHtmlResponse(
      'Installation failed',
      '<p>Missing OAuth parameters from BigCommerce.</p>',
    );
  }

  const token = await exchangeBcAppAuthCode({ code, scope, context });

  if (!token) {
    return bcAppHtmlResponse(
      'Installation failed',
      '<p>Could not exchange the authorization code for an access token. Check your app credentials and callback URL.</p>',
    );
  }

  const storeHash = token.context.replace(/^stores\//, '');

  await saveBcAppInstall({
    accessToken: token.access_token,
    scope: token.scope,
    context: token.context,
    storeHash,
    installedAt: new Date().toISOString(),
  });

  const appUrl = getBcAppPublicUrl();

  return bcAppHtmlResponse(
    'Liivv Staff installed',
    '<p>Authorization successful. Opening the pharmacy and care portal…</p>',
    appUrl ? `${appUrl}/bc-app` : undefined,
  );
}
