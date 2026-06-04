import type { getComponentSnapshot } from './client';

export type MakeswiftComponentSnapshot = Awaited<ReturnType<typeof getComponentSnapshot>>;

function hasSlotContent(value: unknown, seen = new Set<unknown>()): boolean {
  if (value == null || typeof value !== 'object') {
    return false;
  }

  if (seen.has(value)) {
    return false;
  }

  seen.add(value);

  if (Array.isArray(value)) {
    return value.some((item) => hasSlotContent(item, seen));
  }

  const record = value as Record<string, unknown>;

  if (Array.isArray(record.elements) && record.elements.length > 0) {
    return true;
  }

  return Object.values(record).some((prop) => hasSlotContent(prop, seen));
}

/** True when the element tree has no slot children (never created or cleared in Makeswift). */
export function isComponentSnapshotEmpty(snapshot: MakeswiftComponentSnapshot): boolean {
  if (snapshot.document.data == null) {
    return true;
  }

  return !hasSlotContent(snapshot.document.data);
}
