import 'server-only';

import { isValidStaffSession } from '~/lib/admin-auth';
import { getBcAppSession } from '~/lib/bc-app-session';
import { assertAllowedStoreHash } from '~/lib/bigcommerce/app-oauth';

export type StaffAccessContext =
  | { kind: 'password' }
  | { kind: 'bc-app'; storeHash: string; userEmail: string };

export async function getStaffAccessContext(): Promise<StaffAccessContext | null> {
  if (await isValidStaffSession()) {
    return { kind: 'password' };
  }

  const bcSession = await getBcAppSession();

  if (bcSession && assertAllowedStoreHash(bcSession.storeHash)) {
    return {
      kind: 'bc-app',
      storeHash: bcSession.storeHash,
      userEmail: bcSession.user.email,
    };
  }

  return null;
}

export async function hasStaffAccess(): Promise<boolean> {
  return (await getStaffAccessContext()) != null;
}

export const STAFF_PORTAL_PATHS = ['/staff', '/bc-app'] as const;

export function revalidateStaffPortalPaths(revalidatePath: (path: string) => void): void {
  for (const path of STAFF_PORTAL_PATHS) {
    revalidatePath(path);
  }
}
