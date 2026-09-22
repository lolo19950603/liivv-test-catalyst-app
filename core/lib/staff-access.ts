import 'server-only';

import { getBcAppSession } from '~/lib/bc-app-session';
import { getPharmacistSession } from '~/lib/pharmacist-session';

export type StaffAccessContext = {
  kind: 'pharmacist';
  username: string;
  storeHash: string;
  bcUserEmail: string;
};

/**
 * Pharmacist admin requires both:
 * 1. BigCommerce iframe load session (`liivv_pharmacy_admin`)
 * 2. Shared pharmacist username/password session (`liivv_pharmacist`)
 */
export async function getStaffAccessContext(): Promise<StaffAccessContext | null> {
  const bc = await getBcAppSession();
  const pharmacist = await getPharmacistSession();

  if (!bc || !pharmacist) {
    return null;
  }

  return {
    kind: 'pharmacist',
    username: pharmacist.username,
    storeHash: bc.storeHash,
    bcUserEmail: bc.user.email,
  };
}

export async function hasStaffAccess(): Promise<boolean> {
  return (await getStaffAccessContext()) != null;
}

export const STAFF_PORTAL_PATHS = ['/pharmacy-admin'] as const;

export function revalidateStaffPortalPaths(revalidatePath: (path: string) => void): void {
  for (const path of STAFF_PORTAL_PATHS) {
    revalidatePath(path);
  }
}
