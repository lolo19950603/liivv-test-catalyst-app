export const ACCOUNT_DASHBOARD_PATH = '/account/dashboard/';
export const ACCOUNT_ORDERS_PATH = '/account/orders';

/** Where customers land after sign-in when no redirectTo is provided. */
export const ACCOUNT_DEFAULT_REDIRECT_PATH = ACCOUNT_DASHBOARD_PATH;

export const ACCOUNT_LOGIN_PATH = `/login?redirectTo=${encodeURIComponent(ACCOUNT_DEFAULT_REDIRECT_PATH)}`;

export function resolveAccountHref(isLoggedIn: boolean): string {
  return isLoggedIn ? ACCOUNT_DASHBOARD_PATH : ACCOUNT_LOGIN_PATH;
}

export function withOpenHealthProfile(path: string): string {
  const [pathname = path, search = ''] = path.split('?');
  const normalized = pathname.replace(/\/$/, '');

  if (normalized !== '/account/dashboard') {
    return path;
  }

  const params = new URLSearchParams(search);
  params.set('openHealth', '1');
  const slash = pathname.endsWith('/') ? pathname : `${pathname}/`;

  return `${slash}?${params.toString()}`;
}
