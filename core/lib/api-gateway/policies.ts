export type ApiGatewayPolicy =
  | 'customer-session'
  | 'customer-optional'
  | 'webhook-stripe'
  | 'webhook-bigcommerce'
  | 'bc-app-handshake'
  | 'dpd-public'
  | 'storefront-public'
  | 'makeswift'
  | 'auth-public';

export type ApiGatewayMatch = {
  policy: ApiGatewayPolicy;
  methodAllowed: boolean;
};

type Rule = {
  policy: ApiGatewayPolicy;
  methods: readonly string[];
  match: (pathname: string) => boolean;
};

const STOREFRONT_METHODS = ['GET', 'HEAD'] as const;
const AUTH_METHODS = ['GET', 'POST', 'HEAD', 'OPTIONS'] as const;

const rules: readonly Rule[] = [
  {
    policy: 'webhook-stripe',
    methods: ['POST'],
    match: (pathname) => pathname === '/api/stripe/webhook',
  },
  {
    policy: 'webhook-bigcommerce',
    methods: ['POST'],
    match: (pathname) => pathname === '/api/bigcommerce/webhook',
  },
  {
    policy: 'bc-app-handshake',
    methods: ['GET'],
    match: (pathname) => pathname.startsWith('/api/bigcommerce/app/'),
  },
  {
    policy: 'dpd-public',
    methods: ['GET', 'HEAD'],
    match: (pathname) => pathname.startsWith('/api/medications/'),
  },
  /*
   * Listed BEFORE the customer-session rule, which would otherwise swallow it:
   * `rules.find` takes the first match and customer-session matches the whole
   * /api/live-chat/ prefix.
   *
   * The unread-count route is written to answer a signed-out caller with
   * `{ count: 0 }` — it resolves the session itself and returns that shape when
   * there is no customer. Behind customer-session it never ran: the gateway
   * answered every anonymous poll with 401, and the chat widget polls it from
   * every page. Session handling belongs to the route here, not to the gateway.
   */
  {
    policy: 'customer-optional',
    methods: ['GET', 'HEAD'],
    match: (pathname) => pathname === '/api/live-chat/unread-count',
  },
  {
    policy: 'customer-session',
    methods: ['GET', 'POST', 'HEAD'],
    match: (pathname) =>
      pathname.startsWith('/api/live-chat/') || pathname.startsWith('/api/account/'),
  },
  /*
   * The Makeswift runtime handler: the builder handshake (/manifest), draft
   * mode, fonts, translatable data and on-demand revalidation. It authenticates
   * every request itself with MAKESWIFT_SITE_API_KEY, so the gateway passes it
   * through rather than applying a session or storefront policy.
   *
   * Without this rule the handler is unreachable — matchApiGatewayRule returns
   * null and the gateway answers 404 before the route runs, which takes the CMS
   * offline silently: public pages still render, because they read through the
   * server SDK and not this route. Before the API gateway existed, core/proxy.ts
   * excluded /api from its matcher entirely and these requests were never
   * intercepted at all.
   */
  {
    policy: 'makeswift',
    methods: ['GET', 'POST', 'HEAD', 'OPTIONS'],
    match: (pathname) => pathname.startsWith('/api/makeswift/'),
  },
  {
    policy: 'auth-public',
    methods: AUTH_METHODS,
    match: (pathname) => pathname.startsWith('/api/auth/'),
  },
  {
    policy: 'storefront-public',
    methods: STOREFRONT_METHODS,
    match: (pathname) =>
      pathname.startsWith('/api/products/') ||
      pathname.startsWith('/api/categories/') ||
      pathname.startsWith('/api/cart/') ||
      pathname.startsWith('/api/customer/') ||
      pathname.startsWith('/api/archive/'),
  },
];

export const API_GATEWAY_HEADER = 'x-liivv-api-gateway';

export function matchApiGatewayRule(pathname: string, method: string): ApiGatewayMatch | null {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/';
  const normalizedMethod = method.toUpperCase();
  const rule = rules.find((candidate) => candidate.match(normalizedPath));

  if (!rule) {
    return null;
  }

  return {
    policy: rule.policy,
    methodAllowed: rule.methods.includes(normalizedMethod),
  };
}
