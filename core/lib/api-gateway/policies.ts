export type ApiGatewayPolicy =
  | 'customer-session'
  | 'webhook-stripe'
  | 'webhook-bigcommerce'
  | 'bc-app-handshake'
  | 'dpd-public'
  | 'storefront-public'
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
  {
    policy: 'customer-session',
    methods: ['GET', 'POST', 'HEAD'],
    match: (pathname) =>
      pathname.startsWith('/api/live-chat/') || pathname.startsWith('/api/account/'),
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
