/** Resolve BigCommerce product id from Makeswift Combobox values (string, number, or `{ value }`). */
export function comboboxEntityIdFromMakeswift(value?: unknown): string {
  if (value == null) {
    return '';
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value).trim();
  }

  if (typeof value === 'object' && 'value' in value) {
    const nested = (value as { value?: unknown }).value;

    if (typeof nested === 'string' || typeof nested === 'number') {
      return String(nested).trim();
    }
  }

  return '';
}
