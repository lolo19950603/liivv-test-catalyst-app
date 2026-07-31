const YOUR_CUSTOM_PREFIX = 'Your Custom ';

/**
 * Display name for a saved custom kit, e.g. "Your Custom First Cycle Starter Kit".
 * Idempotent if the name already starts with the prefix.
 */
export function formatYourCustomKitName(kitName: string): string {
  const trimmed = kitName.trim();

  if (!trimmed) {
    return `${YOUR_CUSTOM_PREFIX}Kit`;
  }

  if (trimmed.toLowerCase().startsWith(YOUR_CUSTOM_PREFIX.toLowerCase())) {
    return trimmed;
  }

  return `${YOUR_CUSTOM_PREFIX}${trimmed}`;
}
