/**
 * Makeswift `Link` controls often save `#`, an empty href, or `/current-page#` when the URL
 * field is left unset — which shows up as `/diabetes-care#` on that page.
 */
export function isPlaceholderMakeswiftHref(href: string | undefined): boolean {
  const h = href?.trim() ?? '';

  if (h === '' || h === '#') {
    return true;
  }

  if (h.startsWith('http://') || h.startsWith('https://')) {
    return false;
  }

  // Internal path with a lone `#` (no fragment id) → “no real target”
  return /^\/[^#]*#$/.test(h);
}

export function resolveMakeswiftHref(href: string | undefined, fallback: string): string {
  return isPlaceholderMakeswiftHref(href) ? fallback : href!.trim();
}
