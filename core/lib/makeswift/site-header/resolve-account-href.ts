export const ACCOUNT_ORDERS_PATH = '/account/orders';

export const ACCOUNT_LOGIN_PATH = `/login?redirectTo=${encodeURIComponent(ACCOUNT_ORDERS_PATH)}`;

export function resolveAccountHref(isLoggedIn: boolean): string {
  return isLoggedIn ? ACCOUNT_ORDERS_PATH : ACCOUNT_LOGIN_PATH;
}
