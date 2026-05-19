'use client';

import { clsx } from 'clsx';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { Link } from '~/components/link';
import { usePathname } from '~/i18n/routing';
import { resolveMakeswiftHref } from '~/lib/makeswift/utils/resolve-makeswift-href';

import { ARCHIVE_HEADER_CSS } from './archive-header-css';
import {
  DIABETES_CARE_HEADER_ARCHIVE_STYLE,
  DIABETES_CARE_HEADER_SECTION_ID,
} from './archive-styles';

export interface DiabetesCareSectionNavLink {
  label: string;
  link: { href: string };
}

export interface DiabetesCareSectionHeaderProps {
  className?: string;
  sticky?: boolean;
  showLogo?: boolean;
  logoImage?: string;
  logoAlt?: string;
  logoLink?: { href?: string };
  navLinks: DiabetesCareSectionNavLink[];
  showUtilityIcons?: boolean;
  searchPlaceholder?: string;
}

/** Storefront routes for header utility icons (not editable in Makeswift). */
const SEARCH_RESULTS_PATH = '/search';
const ACCOUNT_PATH = '/login';
const CART_PATH = '/cart';
const SEARCH_ARIA_LABEL = 'Search';
const ACCOUNT_ARIA_LABEL = 'Account';
const CART_ARIA_LABEL = 'Shopping cart';

function IconSearch({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      role="presentation"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="m21 21-3.636-3.636m0 0A9 9 0 1 0 4.636 4.636a9 9 0 0 0 12.728 12.728Z" strokeLinecap="round" />
    </svg>
  );
}

function IconAccount({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      role="presentation"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect height="10.5" rx="5.25" width="10.5" x="6.75" y="1.75" />
      <path
        d="M12 15.5c1.5 0 4 .333 4.5.5.5.167 3.7.8 4.5 2 1 1.5 1 2 1 4m-10-6.5c-1.5 0-4 .333-4.5.5-.5.167-3.7.8-4.5 2-1 1.5-1 2-1 4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconCart({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      role="presentation"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 1h.5v0c.226 0 .339 0 .44.007a3 3 0 0 1 2.62 1.976c.034.095.065.204.127.42l.17.597m0 0 1.817 6.358c.475 1.664.713 2.496 1.198 3.114a4 4 0 0 0 1.633 1.231c.727.297 1.592.297 3.322.297h2.285c1.75 0 2.626 0 3.359-.302a4 4 0 0 0 1.64-1.253c.484-.627.715-1.472 1.175-3.161l.06-.221c.563-2.061.844-3.092.605-3.906a3 3 0 0 0-1.308-1.713C19.92 4 18.853 4 16.716 4H4.857ZM12 20a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm8 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconMenu({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      role="presentation"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" d="M3 6H21M3 12H11M3 18H16" />
    </svg>
  );
}

function HeaderCorner({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="currentColor"
      role="presentation"
      stroke="none"
      viewBox="0 0 101 101"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        clipRule="evenodd"
        d="M101 0H0V101H1C1 45.7715 45.7715 1 101 1V0Z"
        fillRule="evenodd"
      />
      <path d="M1 101C1 45.7715 45.7715 1 101 1" fill="none" />
    </svg>
  );
}

function NavMenuItem({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link
        aria-label={label}
        className="menu__item text-sm-lg relative z-2 flex cursor-pointer items-center font-medium"
        href={href}
      >
        <span className="btn-text" data-text={label}>
          {label}
        </span>
        <span className="btn-text btn-duplicate">{label}</span>
      </Link>
    </li>
  );
}

const mobileNavId = 'diabetes-care-section-header-mobile-nav';
const searchPanelId = 'diabetes-care-section-header-search';

const SEARCH_PANEL_STYLE = `
#${searchPanelId} .diabetes-care-search-form {
  display: flex;
  align-items: stretch;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
}
#${searchPanelId} .diabetes-care-search-input {
  flex: 1;
  min-width: 0;
  border: 1px solid rgb(var(--color-foreground) / 0.12);
  border-radius: var(--rounded-full, 9999px);
  background: rgb(var(--color-background));
  color: rgb(var(--color-foreground));
  font: inherit;
  font-size: var(--text-base, 1rem);
  line-height: 1.5;
  padding: 0.625rem 1rem;
}
#${searchPanelId} .diabetes-care-search-input:focus {
  outline: 2px solid rgb(var(--color-keyboard-focus, var(--color-foreground)));
  outline-offset: 2px;
}
#${searchPanelId} .diabetes-care-search-submit {
  flex-shrink: 0;
  border: 0;
  border-radius: var(--rounded-full, 9999px);
  background: rgb(var(--color-button-background, var(--color-foreground)));
  color: rgb(var(--color-button-text, var(--color-background)));
  cursor: pointer;
  font: inherit;
  font-size: var(--text-sm, 0.875rem);
  font-weight: var(--font-medium, 500);
  padding: 0.625rem 1.25rem;
}
`;

export function DiabetesCareSectionHeader({
  className,
  sticky = true,
  showLogo = true,
  logoImage,
  logoAlt = 'Liivv',
  logoLink,
  navLinks,
  showUtilityIcons = true,
  searchPlaceholder = 'Search products',
}: DiabetesCareSectionHeaderProps) {
  const pathname = usePathname();
  const sectionRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [pinnedHeight, setPinnedHeight] = useState<number | null>(null);
  const [cartLineCount, setCartLineCount] = useState<number | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const links = navLinks ?? [];
  const logoVisible = Boolean(showLogo && logoImage);
  const hasNav = links.length > 0;

  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  const toggleSearch = useCallback(() => {
    setSearchOpen((open) => {
      if (!open) {
        setMobileNavOpen(false);
      }

      return !open;
    });
  }, []);

  const refreshCartCount = useCallback(async () => {
    try {
      const response = await fetch('/api/cart/line-item-count', { cache: 'no-store' });

      if (!response.ok) {
        setCartLineCount(null);

        return;
      }

      const data = (await response.json()) as { count: number | null };

      setCartLineCount(data.count ?? null);
    } catch {
      setCartLineCount(null);
    }
  }, []);

  useEffect(() => {
    void refreshCartCount();

    const refetch = () => void refreshCartCount();

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        void refreshCartCount();
      }
    };

    window.addEventListener('focus', refetch);
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.removeEventListener('focus', refetch);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [pathname, refreshCartCount]);

  useEffect(() => {
    closeMobileNav();
    closeSearch();
  }, [pathname, closeMobileNav, closeSearch]);

  useEffect(() => {
    if (!mobileNavOpen && !searchOpen) {
      return;
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMobileNav();
        closeSearch();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileNavOpen, searchOpen, closeMobileNav, closeSearch]);

  useEffect(() => {
    if (!searchOpen) {
      return;
    }

    const id = window.requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });

    return () => window.cancelAnimationFrame(id);
  }, [searchOpen]);

  useEffect(() => {
    if (!mobileNavOpen) {
      return;
    }

    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    if (!mobileNavOpen || typeof window === 'undefined') {
      return;
    }

    const mq = window.matchMedia('(min-width: 1024px)');
    const onBpChange = () => {
      if (mq.matches) {
        closeMobileNav();
      }
    };

    mq.addEventListener('change', onBpChange);

    return () => mq.removeEventListener('change', onBpChange);
  }, [mobileNavOpen, closeMobileNav]);

  useLayoutEffect(() => {
    if (!sticky) {
      setPinnedHeight(null);

      return;
    }

    const el = sectionRef.current;

    if (!el) {
      return;
    }

    const measure = () => setPinnedHeight(el.offsetHeight);

    measure();

    const ro = new ResizeObserver(measure);

    ro.observe(el);

    return () => ro.disconnect();
  }, [sticky, links.length, logoVisible, showUtilityIcons, cartLineCount, mobileNavOpen, searchOpen]);

  if (!logoVisible && links.length === 0 && !showUtilityIcons) {
    return null;
  }

  const logoHref = resolveMakeswiftHref(logoLink?.href, '/');
  const cartCountLabel =
    cartLineCount != null && cartLineCount > 0
      ? `${cartLineCount} item${cartLineCount === 1 ? '' : 's'}`
      : CART_ARIA_LABEL;

  const section = (
    <div
      className={clsx(
        'diabetes-care-section-header shopify-section shopify-section-group-header-group header-section header-opaque w-full min-w-0',
        hasNav && 'diabetes-care-has-nav',
        sticky && 'header-pinned',
        className,
      )}
      id={DIABETES_CARE_HEADER_SECTION_ID}
      ref={sectionRef}
    >
      <style dangerouslySetInnerHTML={{ __html: DIABETES_CARE_HEADER_ARCHIVE_STYLE }} />
      <style dangerouslySetInnerHTML={{ __html: ARCHIVE_HEADER_CSS }} />
      <style dangerouslySetInnerHTML={{ __html: SEARCH_PANEL_STYLE }} />
      {(mobileNavOpen || searchOpen) && (hasNav || searchOpen) ? (
        <div
          aria-hidden
          className="diabetes-care-mobile-backdrop fixed inset-0 z-[1] bg-[rgb(33_33_33/0.4)]"
          onClick={() => {
            closeMobileNav();
            closeSearch();
          }}
        />
      ) : null}
      <div className="relative z-[2]">
        <header
          className="header header--left mobile:header--left page-width page-width--full section section--rounded section--padding relative z-20 grid w-full max-w-full items-center section--next-rounded"
          data-section-id="sections--26374736970019__header"
        >
          {logoVisible ? (
            <div className="header__logo z-2 flex min-w-0 items-center justify-center gap-3 lg:justify-center">
              <Link
                className="header__logo-link has-white-logo relative flex min-w-0 max-w-full items-center"
                href={logoHref}
              >
                <span className="sr-only">{logoAlt}</span>
                <img
                  alt={logoAlt}
                  className="logo block h-auto max-h-9 w-auto max-w-[min(100%,7.5rem)] object-contain sm:max-h-11 sm:max-w-[8.5rem] md:max-h-[140px] md:max-w-[140px]"
                  src={logoImage}
                />
              </Link>
              {hasNav ? (
                <div className="diabetes-care-mobile-nav-slot">
                  <button
                    aria-controls={mobileNavId}
                    aria-expanded={mobileNavOpen}
                    className={clsx(
                      'diabetes-care-mobile-nav-trigger menu-drawer-button',
                      'border-0 bg-transparent p-0 text-inherit outline-none',
                      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--color-keyboard-focus))]',
                    )}
                    id={`${mobileNavId}-trigger`}
                    type="button"
                    onClick={() => {
                      closeSearch();
                      setMobileNavOpen((o) => !o);
                    }}
                  >
                    <span className="sr-only">{mobileNavOpen ? 'Close menu' : 'Open menu'}</span>
                    <IconMenu className="icon shrink-0" />
                  </button>
                </div>
              ) : null}
            </div>
          ) : hasNav ? (
            <div className="header__logo z-2 flex min-w-0 justify-center lg:justify-center">
              <div className="diabetes-care-mobile-nav-slot">
                <button
                  aria-controls={mobileNavId}
                  aria-expanded={mobileNavOpen}
                  className={clsx(
                    'diabetes-care-mobile-nav-trigger menu-drawer-button',
                    'border-0 bg-transparent p-0 text-inherit outline-none',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--color-keyboard-focus))]',
                  )}
                  id={`${mobileNavId}-trigger`}
                  type="button"
                  onClick={() => {
                    closeSearch();
                    setMobileNavOpen((o) => !o);
                  }}
                >
                  <span className="sr-only">{mobileNavOpen ? 'Close menu' : 'Open menu'}</span>
                  <IconMenu className="icon shrink-0" />
                </button>
              </div>
            </div>
          ) : null}

          {hasNav ? (
            <div className="header__navigation hidden lg:flex lg:justify-start lg:gap-5">
              <nav aria-label="Diabetes care" className="header__menu hidden lg:flex" role="navigation">
                <ul className="list-menu with-block flex flex-wrap" role="list">
                  {links.map((item, index) => (
                    <NavMenuItem
                      href={resolveMakeswiftHref(item.link.href, '/')}
                      key={`${item.label}-${index}`}
                      label={item.label}
                    />
                  ))}
                </ul>
              </nav>
            </div>
          ) : null}

          {showUtilityIcons ? (
            <div className="header__icons header__icons--end z-2 flex min-w-0 shrink-0 justify-end">
              <div className="header__buttons gap-1d5 flex items-center">
                <button
                  aria-controls={searchPanelId}
                  aria-expanded={searchOpen}
                  aria-label={SEARCH_ARIA_LABEL}
                  className="search-drawer-button flex shrink-0 items-center justify-center border-0 bg-transparent p-0 text-inherit outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--color-keyboard-focus))]"
                  type="button"
                  onClick={toggleSearch}
                >
                  <span className="sr-only">{SEARCH_ARIA_LABEL}</span>
                  <IconSearch className="icon icon-search icon-md" />
                </button>
                <Link
                  aria-label={ACCOUNT_ARIA_LABEL}
                  className="flex items-center justify-center"
                  href={ACCOUNT_PATH}
                >
                  <span className="sr-only">{ACCOUNT_ARIA_LABEL}</span>
                  <IconAccount className="icon icon-account icon-md" />
                </Link>
                <Link
                  aria-label={cartCountLabel}
                  className="cart-drawer-button relative flex shrink-0 items-center justify-center"
                  href={CART_PATH}
                >
                  <span className="sr-only">{CART_ARIA_LABEL}</span>
                  <IconCart className="icon icon-cart icon-md" />
                  {cartLineCount != null && cartLineCount > 0 ? (
                    <span className="count absolute right-0 top-0 text-xs tabular-nums">
                      {cartLineCount > 99 ? '99+' : cartLineCount}
                    </span>
                  ) : null}
                </Link>
              </div>
            </div>
          ) : null}

          <span className="header__corner corner left bottom pointer-events-none absolute flex">
            <HeaderCorner className="h-auto w-full" />
          </span>
          <span className="header__corner corner right bottom pointer-events-none absolute flex">
            <HeaderCorner className="h-auto w-full" />
          </span>
        </header>

        {searchOpen ? (
          <div
            className={clsx(
              'diabetes-care-search-panel absolute left-0 right-0 top-full z-[3]',
              'border-t border-[rgb(var(--color-foreground)/0.08)] bg-[rgb(var(--color-background))] shadow-lg',
            )}
            id={searchPanelId}
            role="search"
          >
            <form action={SEARCH_RESULTS_PATH} className="diabetes-care-search-form" method="get">
              <label className="sr-only" htmlFor={`${searchPanelId}-input`}>
                {searchPlaceholder}
              </label>
              <input
                autoComplete="off"
                className="diabetes-care-search-input"
                id={`${searchPanelId}-input`}
                name="term"
                placeholder={searchPlaceholder}
                ref={searchInputRef}
                type="search"
              />
              <button className="diabetes-care-search-submit" type="submit">
                {SEARCH_ARIA_LABEL}
              </button>
            </form>
          </div>
        ) : null}

        {mobileNavOpen && hasNav ? (
          <nav
            aria-label="Diabetes care"
            className={clsx(
              'diabetes-care-mobile-nav-drawer absolute left-0 right-0 top-full z-[3] max-h-[min(70vh,24rem)] overflow-y-auto overscroll-contain',
              'border-t border-[rgb(var(--color-foreground)/0.08)] bg-[rgb(var(--color-background))] shadow-lg',
            )}
            id={mobileNavId}
            role="navigation"
          >
            <ul className="flex list-none flex-col gap-0 p-2" role="list">
              {links.map((item, index) => {
                const href = resolveMakeswiftHref(item.link.href, '/');

                return (
                  <li className="border-b border-[rgb(var(--color-foreground)/0.06)] last:border-b-0" key={`${item.label}-m-${index}`}>
                    <Link
                      className={clsx(
                        'flex min-h-12 items-center px-4 py-3 font-[family-name:var(--font-navigation-family,var(--font-sans))]',
                        'text-base font-medium text-[rgb(var(--color-foreground))] no-underline',
                        'rounded-md active:bg-[rgb(var(--color-foreground)/0.06)]',
                      )}
                      href={href}
                      onClick={closeMobileNav}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        ) : null}
      </div>
    </div>
  );

  if (!sticky) {
    return section;
  }

  const spacerPx = pinnedHeight ?? 72;

  return (
    <>
      {section}
      <div aria-hidden className="w-full shrink-0" style={{ height: spacerPx }} />
    </>
  );
}