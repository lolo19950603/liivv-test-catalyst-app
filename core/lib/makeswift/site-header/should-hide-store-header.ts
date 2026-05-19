import { locales } from '~/i18n/locales';

/** Normalize a path prefix for hide-on-path matching (leading slash, no trailing slash). */
export function normalizeHidePath(path: string): string {
  const trimmed = path.trim();

  if (trimmed.length === 0) {
    return '';
  }

  const withLeading = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  if (withLeading.length > 1 && withLeading.endsWith('/')) {
    return withLeading.slice(0, -1);
  }

  return withLeading;
}

/** Strip an optional locale prefix from a pathname (next-intl or prefixed URLs). */
export function stripLocaleFromPathname(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) {
    return '/';
  }

  if (locales.includes(segments[0] ?? '')) {
    const rest = segments.slice(1);

    return rest.length === 0 ? '/' : `/${rest.join('/')}`;
  }

  return pathname.startsWith('/') ? pathname : `/${pathname}`;
}

/**
 * True when the current page should not show the Catalyst store header.
 * Each entry matches that path and any subpath (e.g. `/diabetes-care/foo`).
 */
export function shouldHideStoreHeader(
  pathname: string,
  hideOnPaths: readonly string[] | undefined,
): boolean {
  if (hideOnPaths == null || hideOnPaths.length === 0) {
    return false;
  }

  const current = normalizeHidePath(stripLocaleFromPathname(pathname));

  return hideOnPaths.some((entry) => {
    const prefix = normalizeHidePath(entry);

    if (prefix.length === 0) {
      return false;
    }

    return current === prefix || current.startsWith(`${prefix}/`);
  });
}
