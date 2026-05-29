/** Builds a stable Shopify-style section id; optional suffix keeps multiple instances unique. */
export function resolveProductSingularSectionDomId(
  baseId: string,
  instanceSuffix?: string,
): string {
  const suffix = instanceSuffix?.trim();

  if (suffix != null && suffix.length > 0) {
    const safe = suffix.replace(/[^a-zA-Z0-9_-]/g, '');

    return safe.length > 0 ? `${baseId}--${safe}` : baseId;
  }

  return baseId;
}
