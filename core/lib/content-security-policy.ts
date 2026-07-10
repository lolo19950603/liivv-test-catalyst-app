import builder from 'content-security-policy-builder';

const makeswiftEnabled = !!process.env.MAKESWIFT_SITE_API_KEY;

const makeswiftBaseUrl =
  process.env.NEXT_PUBLIC_MAKESWIFT_APP_ORIGIN ??
  process.env.MAKESWIFT_APP_ORIGIN ??
  'https://app.makeswift.com';

const storeHash = process.env.BIGCOMMERCE_STORE_HASH?.trim();
const bcGraphqlDomain = process.env.BIGCOMMERCE_GRAPHQL_API_DOMAIN?.trim() || 'mybigcommerce.com';

function buildCsp(frameAncestors: string[]): string {
  return builder({
    directives: {
      baseUri: ['self'],
      frameAncestors,
    },
  });
}

const defaultFrameAncestors = makeswiftEnabled ? [makeswiftBaseUrl] : ['none'];

const bcAppFrameAncestors = [
  'https://*.mybigcommerce.com',
  'https://login.bigcommerce.com',
  ...(storeHash ? [`https://store-${storeHash}.${bcGraphqlDomain}`] : []),
  ...(makeswiftEnabled ? [makeswiftBaseUrl] : []),
];

// customize the directives as needed
export const cspHeader = buildCsp(defaultFrameAncestors);

export const bcAppCspHeader = buildCsp(bcAppFrameAncestors);

export function withBcAppCspHeaders(init?: HeadersInit): Headers {
  const headers = new Headers(init);

  headers.set('Content-Security-Policy', bcAppCspHeader.replace(/\n/g, ''));

  return headers;
}
