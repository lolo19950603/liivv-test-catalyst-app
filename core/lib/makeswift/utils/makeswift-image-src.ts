const IMAGE_SRC_KEYS = ['url', 'src', 'publicUrl', 'path', 'value'] as const;

function readImageUrlFromRecord(record: Record<string, unknown>): string {
  for (const key of IMAGE_SRC_KEYS) {
    const candidate = record[key];

    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }

  return '';
}

/** Makeswift `Image` controls may return a URL string or a value object. */
export function resolveMakeswiftImageSrc(value: unknown): string {
  if (value == null) {
    return '';
  }

  if (typeof value === 'string') {
    return value.trim();
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const resolved = resolveMakeswiftImageSrc(item);

      if (resolved.length > 0) {
        return resolved;
      }
    }

    return '';
  }

  if (typeof value === 'object') {
    return readImageUrlFromRecord(value as Record<string, unknown>);
  }

  return '';
}

/** Makeswift `Select` values are usually strings but may be wrapped objects. */
export function normalizeMakeswiftSelectValue(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const trimmed = value.trim();

    return trimmed.length > 0 ? trimmed : undefined;
  }

  if (value != null && typeof value === 'object' && 'value' in value) {
    return normalizeMakeswiftSelectValue((value as { value: unknown }).value);
  }

  return undefined;
}