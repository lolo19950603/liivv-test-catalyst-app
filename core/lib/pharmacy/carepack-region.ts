import { isOntarioZoneCode } from '~/lib/onboarding/liiv-primary-health-category';

/** CarePack availability from a saved mailing-address province. */
export type CarePackRegion = 'ontario' | 'other' | 'unknown';

/**
 * Ontario addresses can request CarePack. A saved address in another province
 * is "other". No address on file stays "unknown" so we do not tell a possible
 * Ontario customer that the rest of Canada is coming soon.
 */
export function carePackRegionFromProvince(
  province: string | null | undefined,
): CarePackRegion {
  const trimmed = province?.trim();

  if (!trimmed) {
    return 'unknown';
  }

  return isOntarioZoneCode(trimmed) ? 'ontario' : 'other';
}
