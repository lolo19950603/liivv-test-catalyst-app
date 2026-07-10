export const ACCOUNT_DASHBOARD_PATH = '/account/dashboard/';
export const ACCOUNT_ORDERS_PATH = '/account/orders';

/** Where customers land after sign-in when no redirectTo is provided. */
export const ACCOUNT_DEFAULT_REDIRECT_PATH = ACCOUNT_DASHBOARD_PATH;

export const ACCOUNT_LOGIN_PATH = `/login?redirectTo=${encodeURIComponent(ACCOUNT_DEFAULT_REDIRECT_PATH)}`;

export function resolveAccountHref(isLoggedIn: boolean): string {
  return isLoggedIn ? ACCOUNT_DASHBOARD_PATH : ACCOUNT_LOGIN_PATH;
}
