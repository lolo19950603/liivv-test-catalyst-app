import 'server-only';

import { redirect } from 'next/navigation';

import {
  getOnboardingCustomer,
  type OnboardingCustomer,
} from '~/lib/account/get-session-customer';
import { hasStaffAccess } from '~/lib/staff-access';

/**
 * Session front door for server actions that touch account / PHI / staff data.
 * `/api/*` uses `core/lib/api-gateway` instead — server actions never hit that proxy.
 */
export type CustomerActionUnauthorized<R> =
  | { readonly result: R }
  | { readonly redirectTo: string };

export async function runCustomerAction<R>(
  unauthorized: CustomerActionUnauthorized<NoInfer<R>>,
  action: (customer: OnboardingCustomer) => Promise<R>,
): Promise<R> {
  const customer = await getOnboardingCustomer();

  if (!customer) {
    if ('redirectTo' in unauthorized) {
      redirect(unauthorized.redirectTo);
    }

    return unauthorized.result;
  }

  return action(customer);
}

export async function runStaffAction<R>(
  unauthorized: NoInfer<R>,
  action: () => Promise<R>,
): Promise<R> {
  if (!(await hasStaffAccess())) {
    return unauthorized;
  }

  return action();
}
