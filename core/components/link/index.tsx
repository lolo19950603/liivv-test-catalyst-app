'use client';

import { ComponentPropsWithRef, ComponentRef, forwardRef, useReducer } from 'react';
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { useRouter as useNextRouter } from 'next/navigation';

import { Link as NavLink } from '../../i18n/routing';

type NextLinkProps = Omit<ComponentPropsWithRef<typeof NavLink>, 'prefetch'>;

interface PrefetchOptions {
  prefetch?: 'hover' | 'viewport' | 'none';
  prefetchKind?: 'auto' | 'full';
}

type Props = NextLinkProps &
  PrefetchOptions & {
    /**
     * Full document navigation. Logout must reload the shared layout so the
     * header does not keep showing a stale logged-in "My Account" state.
     */
    hard?: boolean;
  };

function isLogoutHref(href: NextLinkProps['href']): boolean {
  if (typeof href !== 'string') {
    return false;
  }

  const pathname = href.split('?')[0] ?? href;

  return pathname === '/logout' || pathname === '/logout/';
}

/**
 * This custom `Link` is based on  Next-Intl's `Link` component
 * https://next-intl-docs.vercel.app/docs/routing/navigation#link
 * which adds automatically prefixes for the href with the current locale as necessary
 * and extends with additional prefetching controls, making navigation
 * prefetching more adaptable to different use cases. By offering `prefetch` and `prefetchKind`
 * props, it grants explicit management over when and how prefetching occurs, defaulting to 'hover' for
 * prefetch behavior and 'auto' for prefetch kind. This approach provides a balance between optimizing
 * page load performance and resource usage. https://nextjs.org/docs/app/api-reference/components/link#prefetch
 */
export const Link = forwardRef<ComponentRef<'a'>, Props>(
  (
    {
      href,
      prefetch = 'hover',
      prefetchKind = 'auto',
      hard,
      children,
      className,
      onClick,
      ...rest
    },
    ref,
  ) => {
    const router = useNextRouter();
    const [prefetched, setPrefetched] = useReducer(() => true, false);
    const hardNavigate = hard ?? isLogoutHref(href);
    const computedPrefetch = computePrefetchProp({
      prefetch: hardNavigate ? 'none' : prefetch,
      prefetchKind,
    });

    const triggerPrefetch = () => {
      if (prefetched) {
        return;
      }

      if (typeof href === 'string') {
        // PrefetchKind enum is not exported
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        router.prefetch(href, { kind: prefetchKind });
      } else {
        // PrefetchKind enum is not exported
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        router.prefetch(href.href, { kind: prefetchKind });
      }

      setPrefetched();
    };

    return (
      <NavLink
        className={className}
        href={href}
        prefetch={computedPrefetch}
        ref={ref}
        {...rest}
        onClick={(event) => {
          onClick?.(event);

          if (!hardNavigate || event.defaultPrevented) {
            return;
          }

          event.preventDefault();
          window.location.assign(event.currentTarget.href);
        }}
        onMouseEnter={!hardNavigate && prefetch === 'hover' ? triggerPrefetch : undefined}
        onTouchStart={!hardNavigate && prefetch === 'hover' ? triggerPrefetch : undefined}
      >
        {children}
      </NavLink>
    );
  },
);

function computePrefetchProp({
  prefetch,
  prefetchKind,
}: Required<PrefetchOptions>): boolean | undefined {
  if (prefetch !== 'viewport') {
    return false;
  }

  if (prefetchKind === 'auto') {
    return undefined;
  }

  return true;
}
