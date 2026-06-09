export const ACCOUNT_LOGIN_PATH = '/login';

export const ACCOUNT_DASHBOARD_PATH = '/account/dashboard';

export function resolveAccountHref(isLoggedIn: boolean): string {
  return isLoggedIn ? ACCOUNT_DASHBOARD_PATH : ACCOUNT_LOGIN_PATH;
}
