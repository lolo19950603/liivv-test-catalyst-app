/** Connected onboarding (Continue setup, banner CTA). Dashboard cards omit this query. */
export const SETUP_FLOW_PARAM = 'setup';
export const SETUP_FLOW_VALUE = '1';

/** Canonical onboarding URLs (no locale prefix; the storefront router adds it). */
export const ACCOUNT_ONBOARDING_BASE = '/account/onboarding';
export const ACCOUNT_ONBOARDING_PROFILE = `${ACCOUNT_ONBOARDING_BASE}/profile`;
export const ACCOUNT_ONBOARDING_HEALTH_PROFILE = `${ACCOUNT_ONBOARDING_BASE}/health-profile`;
export const ACCOUNT_ONBOARDING_MEDICATIONS = `${ACCOUNT_ONBOARDING_BASE}/medications`;
export const ACCOUNT_ONBOARDING_INSURANCE = `${ACCOUNT_ONBOARDING_BASE}/insurance`;

export function appendSetupFlowQuery(path: string): string {
  if (path.includes(`${SETUP_FLOW_PARAM}=`)) return path;
  return path.includes('?')
    ? `${path}&${SETUP_FLOW_PARAM}=${SETUP_FLOW_VALUE}`
    : `${path}?${SETUP_FLOW_PARAM}=${SETUP_FLOW_VALUE}`;
}

export function isSetupFlowSearchParams(searchParams: URLSearchParams): boolean {
  return searchParams.get(SETUP_FLOW_PARAM) === SETUP_FLOW_VALUE;
}
