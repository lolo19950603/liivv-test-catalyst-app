import 'server-only';

import { getPharmacistSession } from '~/lib/pharmacist-session';

export type StaffAccessContext = {
  kind: 'pharmacist';
  username: string;
};

/** Pharmacist admin is a standalone page. Access is the shared username and password. */
export async function getStaffAccessContext(): Promise<StaffAccessContext | null> {
  const pharmacist = await getPharmacistSession();

  if (!pharmacist) {
    return null;
  }

  return {
    kind: 'pharmacist',
    username: pharmacist.username,
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
