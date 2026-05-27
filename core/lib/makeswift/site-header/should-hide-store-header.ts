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

/** True when `pathname` matches `prefix` or any subpath (e.g. `/diabetes-care/foo`). */
export function pathnameMatchesPrefix(pathname: string, prefix: string): boolean {
  const current = normalizeHidePath(stripLocaleFromPathname(pathname));
  const normalized = normalizeHidePath(prefix);

  if (normalized.length === 0) {
    return false;
  }

  return current === normalized || current.startsWith(`${normalized}/`);
}

/**
 * Returns the first config whose `paths` list matches the current pathname.
 * Each path entry matches that path and any subpath (e.g. `/diabetes-care/foo`).
 */
export function findMatchingPathConfig<T extends { paths?: readonly (string | undefined)[] }>(
  pathname: string,
  configs: readonly T[] | undefined,
): T | null {
  if (configs == null || configs.length === 0) {
    return null;
  }

  for (const config of configs) {
    const paths = (config.paths ?? []).filter(
      (p): p is string => typeof p === 'string' && p.length > 0,
    );

    if (paths.some((path) => pathnameMatchesPrefix(pathname, path))) {
      return config;
    }
  }

  return null;
}

/**
 * True when the current page should not show the Catalyst store header.
 * Each entry matches that path and any subpath (e.g. `/diabetes-care/foo`).
 *
 * @deprecated Prefer `pageOverrides` on the Site Header — a matching override
 * replaces the default header instead of hiding it.
 */
export function shouldHideStoreHeader(
  pathname: string,
  hideOnPaths: readonly string[] | undefined,
): boolean {
  if (hideOnPaths == null || hideOnPaths.length === 0) {
    return false;
  }

  return hideOnPaths.some((entry) => pathnameMatchesPrefix(pathname, entry));
}
