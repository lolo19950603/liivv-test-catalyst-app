'use client';

import { clsx } from 'clsx';
import {
  type CSSProperties,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Link } from '~/components/link';
import { usePathname } from '~/i18n/routing';
import { LiivvIconAccount, LiivvIconCart, LiivvIconSearch } from '~/lib/liivv/header-icons';
import {
  resolveSectionBackgroundChannels,
  type SectionBackgroundProps,
} from '~/lib/makeswift/utils/diabetes-care-section-style';
import { useHeaderStickyScrolled } from '~/lib/makeswift/site-header/use-header-sticky-scrolled';
import { resolveMakeswiftHref } from '~/lib/makeswift/utils/resolve-makeswift-href';

import { ARCHIVE_HEADER_CSS } from './archive-header-css';
import { LIIVV_HEADER_MEGA_MENU_CSS } from './mega-menu-css';
import type {
  LiivvArchiveHeaderLogo,
  LiivvArchiveLinksPosition,
  LiivvArchiveNavLink,
  LiivvArchiveNavSubLink,
} from './types';

const SEARCH_RESULTS_PATH = '/search';
const ACCOUNT_PATH = '/login';
const CART_PATH = '/cart';
const SEARCH_ARIA_LABEL = 'Search';
const ACCOUNT_ARIA_LABEL = 'Account';
const CART_ARIA_LABEL = 'Shopping cart';

/** Archive header palette — scoped to each header root so vars are not inherited from page `:root`. */
export const LIIVV_ARCHIVE_HEADER_SECTION_VARS = `#shopify-section-sections--26374736970019__header,#liivv-site-header,.liivv-archive-header{--section-padding-top:0px;--section-padding-bottom:0px;--color-background:255 255 255;--color-foreground:49 47 47;--color-transparent:168 156 148;--color-localization:255 255 255}`;

/** Flatten top radii when sticky header is stuck (pairs with `header-scrolled` from useHeaderStickyScrolled). */
const LIIVV_HEADER_STICKY_SCROLLED_CSS = `
.header-section.header-sticky.header-scrolled {
  background-color: rgb(var(--color-background));
}
.header-section.header-scrolled .section.section--rounded {
  border-start-start-radius: 0;
  border-start-end-radius: 0;
}
.header-section.header-scrolled .section.section--rounded:before {
  border-start-start-radius: 0;
  border-start-end-radius: 0;
}
`;

export interface LiivvArchiveHeaderProps {
  className?: string;
  sectionId?: string;
  background?: SectionBackgroundProps | null;
  navAriaLabel?: string;
  logo?: LiivvArchiveHeaderLogo | null;
  showLogo?: boolean;
  navLinks?: LiivvArchiveNavLink[];
  showUtilityIcons?: boolean;
  searchPlaceholder?: string;
  linksPosition?: LiivvArchiveLinksPosition;
  initialCartCount?: number | null;
  banner?: ReactNode;
  /** Renders a spacer below the section when pin behavior is enabled externally. */
  withPinSpacer?: boolean;
  /**
   * Pin the header to the viewport top while scrolling using browser-native
   * `position: sticky`. Applied as an inline style on the wrapper so it can't
   * lose to higher-specificity rules from the archived Shopify CSS (e.g.
   * `.shopify-section { position: relative }`) or to editor wrappers.
   *
   * Note: only works when the header is rendered outside Makeswift Box/Grid
   * wrappers — otherwise the containing flex item shrink-wraps to the header
   * height and sticky has no scroll range to pin within. Use the layout-level
   * placement pattern (see `site-header`).
   */
  sticky?: boolean;
  sectionRef?: RefObject<HTMLDivElement | null>;
  spacerRef?: RefObject<HTMLDivElement | null>;
  children?: ReactNode;
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

function IconArrowRight({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      height="20"
      role="presentation"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      width="20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NavMenuTrigger({
  href,
  label,
  hasMegaMenu,
  isExpanded,
}: {
  href: string;
  label: string;
  hasMegaMenu: boolean;
  isExpanded: boolean;
}) {
  return (
    <Link
      aria-expanded={hasMegaMenu ? isExpanded : undefined}
      aria-haspopup={hasMegaMenu ? 'true' : undefined}
      aria-label={label}
      className="menu__item text-sm-lg relative z-2 flex cursor-pointer items-center font-medium"
      href={href}
    >
      <span className="btn-text" data-text={label}>
        {label}
      </span>
      <span aria-hidden className="btn-text btn-duplicate">
        {label}
      </span>
    </Link>
  );
}

function pickDefaultMegaMenuPreview(
  item: LiivvArchiveNavLink,
  links: LiivvArchiveNavSubLink[],
): LiivvArchiveNavSubLink | null {
  const linkWithImage = links.find((link) => Boolean(link.image?.src));

  if (linkWithImage) {
    return linkWithImage;
  }

  if (links[0]) {
    return links[0];
  }

  if (item.featuredImage?.src) {
    return {
      label: item.label,
      href: item.href,
      image: item.featuredImage,
    };
  }

  return null;
}

function MegaMenuCategoryPreview({ preview }: { preview: LiivvArchiveNavSubLink | null }) {
  if (preview == null) {
    return (
      <div
        aria-hidden
        className="header-mega-menu__feature-placeholder flex h-full min-h-[280px] items-center justify-center bg-[rgb(var(--color-foreground)/0.04)] p-6 text-center text-sm text-[rgb(var(--color-foreground)/0.45)]"
      >
        Hover a category to preview
      </div>
    );
  }

  const imageSrc = preview.image?.src;
  const imageAlt = preview.image?.alt || preview.label;

  return (
    <div className="header-mega-menu__feature-panel relative flex h-full min-h-[280px] flex-col overflow-hidden">
      {imageSrc ? (
        <img
          alt={imageAlt}
          className="header-mega-menu__feature-image absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ease-out"
          key={imageSrc}
          src={imageSrc}
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 bg-[rgb(var(--color-foreground)/0.06)]"
        />
      )}
      <div className="header-mega-menu__feature-scrim pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgb(33_33_33/0.72)] via-[rgb(33_33_33/0.12)] to-transparent" />
      <div className="relative mt-auto p-5 text-white">
        <p className="text-lg font-semibold leading-tight">{preview.label}</p>
        <Link
          className="mt-2 inline-block text-sm font-medium underline underline-offset-2"
          href={preview.href}
        >
          Shop {preview.label}
        </Link>
      </div>
    </div>
  );
}

function HeaderMegaMenuPanel({
  item,
  menuId,
  open,
  onHover,
}: {
  item: LiivvArchiveNavLink;
  menuId: string;
  open: boolean;
  onHover: () => void;
}) {
  const columns = item.columns ?? [];
  const flatLinks = useMemo(() => columns.flatMap((column) => column.links), [columns]);
  const defaultPreview = useMemo(
    () => pickDefaultMegaMenuPreview(item, flatLinks),
    [item, flatLinks],
  );
  const [previewLink, setPreviewLink] = useState<LiivvArchiveNavSubLink | null>(defaultPreview);

  useEffect(() => {
    if (open) {
      setPreviewLink(defaultPreview);
    }
  }, [open, defaultPreview]);

  if (columns.length === 0) {
    return null;
  }

  return (
    <div
      className={clsx('header-mega-menu-wrap', open && 'is-open')}
      id={menuId}
      onMouseEnter={onHover}
      role="region"
      aria-label={`${item.label} categories`}
      aria-hidden={!open}
    >
      <div className="header-mega-menu page-width page-width--full">
        <div className="header-mega-menu__body">
          <div className="header-mega-menu__links">
            <div className="header-mega-menu__grid">
              {columns.map((column, columnIndex) => (
                <ul className="header-mega-menu__column" key={`col-${columnIndex}`} role="list">
                  {column.links.map((link, linkIndex) => {
                    const isActive =
                      previewLink?.href === link.href && previewLink.label === link.label;

                    return (
                      <li key={`${link.label}-${linkIndex}`}>
                        <Link
                          className={clsx(
                            'header-mega-menu__link',
                            isActive && 'header-mega-menu__link--active',
                          )}
                          href={link.href}
                          onFocus={() => setPreviewLink(link)}
                          onMouseEnter={() => setPreviewLink(link)}
                        >
                          {link.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ))}
            </div>
          </div>
          <aside aria-label="Category preview" className="header-mega-menu__feature">
            <MegaMenuCategoryPreview preview={previewLink} />
          </aside>
        </div>
        {item.exploreAll ? (
          <Link className="header-mega-menu__footer" href={item.exploreAll.href}>
            <span className="header-mega-menu__explore-label">{item.exploreAll.label}</span>
            <span className="header-mega-menu__arrow" aria-hidden>
              <IconArrowRight />
            </span>
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function buildSearchPanelStyle(searchPanelId: string) {
  return `
#${searchPanelId} .liivv-archive-search-form {
  display: flex;
  align-items: stretch;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
}
#${searchPanelId} .liivv-archive-search-input {
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
#${searchPanelId} .liivv-archive-search-input:focus {
  outline: 2px solid rgb(var(--color-keyboard-focus, var(--color-foreground)));
  outline-offset: 2px;
}
#${searchPanelId} .liivv-archive-search-submit {
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
}

function navigationJustifyClass(position: LiivvArchiveLinksPosition) {
  switch (position) {
    case 'center':
      return 'lg:justify-center';

    case 'right':
      return 'lg:justify-end';

    default:
      return 'lg:justify-start';
  }
}

export function LiivvArchiveHeader({
  className,
  sectionId,
  background,
  navAriaLabel = 'Main',
  logo,
  showLogo = true,
  navLinks = [],
  showUtilityIcons = true,
  searchPlaceholder = 'Search products',
  linksPosition = 'left',
  initialCartCount = null,
  banner,
  withPinSpacer = false,
  sticky = false,
  sectionRef: sectionRefProp,
  spacerRef: spacerRefProp,
  children,
}: LiivvArchiveHeaderProps) {
  const reactId = useId();
  const safeId = reactId.replace(/:/g, '');
  const mobileNavId = `liivv-archive-header-mobile-nav-${safeId}`;
  const searchPanelId = `liivv-archive-header-search-${safeId}`;

  const pathname = usePathname();
  const internalSectionRef = useRef<HTMLDivElement>(null);
  const internalSpacerRef = useRef<HTMLDivElement>(null);
  const stickySentinelRef = useRef<HTMLDivElement>(null);
  const sectionRef = sectionRefProp ?? internalSectionRef;
  const spacerRef = spacerRefProp ?? internalSpacerRef;

  useHeaderStickyScrolled(sectionRef, stickySentinelRef, sticky);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [cartLineCount, setCartLineCount] = useState<number | null>(initialCartCount);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeMegaIndex, setActiveMegaIndex] = useState<number | null>(null);
  const megaCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const links = navLinks;
  const logoVisible = Boolean(showLogo && (logo?.src || logo?.text));
  const hasNav = links.length > 0;

  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const closeMegaMenu = useCallback(() => setActiveMegaIndex(null), []);

  const openMegaMenu = useCallback((index: number) => {
    if (megaCloseTimerRef.current != null) {
      clearTimeout(megaCloseTimerRef.current);
      megaCloseTimerRef.current = null;
    }

    setActiveMegaIndex(index);
    setSearchOpen(false);
  }, []);

  const scheduleCloseMegaMenu = useCallback(() => {
    if (megaCloseTimerRef.current != null) {
      clearTimeout(megaCloseTimerRef.current);
    }

    megaCloseTimerRef.current = setTimeout(() => {
      setActiveMegaIndex(null);
      megaCloseTimerRef.current = null;
    }, 120);
  }, []);

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
    setCartLineCount(initialCartCount);
  }, [initialCartCount]);

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
    closeMegaMenu();
  }, [pathname, closeMobileNav, closeSearch, closeMegaMenu]);

  useEffect(
    () => () => {
      if (megaCloseTimerRef.current != null) {
        clearTimeout(megaCloseTimerRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (!mobileNavOpen && !searchOpen) {
      return;
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMobileNav();
        closeSearch();
        closeMegaMenu();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileNavOpen, searchOpen, closeMobileNav, closeSearch, closeMegaMenu]);

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

  if (!logoVisible && links.length === 0 && !showUtilityIcons) {
    return null;
  }

  const logoHref = resolveMakeswiftHref(logo?.href, '/');
  const logoAlt = logo?.alt ?? 'Logo';
  const cartCountLabel =
    cartLineCount != null && cartLineCount > 0
      ? `${cartLineCount} item${cartLineCount === 1 ? '' : 's'}`
      : CART_ARIA_LABEL;

  const logoStyle =
    logo?.maxWidth != null || logo?.maxHeight != null
      ? {
          maxWidth: logo.maxWidth != null ? `${logo.maxWidth}px` : undefined,
          maxHeight: logo.maxHeight != null ? `${logo.maxHeight}px` : undefined,
        }
      : undefined;

  const backgroundChannels = resolveSectionBackgroundChannels(background, '255 255 255');
  const pinStyle: CSSProperties = {
    ...(sticky ? { position: 'sticky', insetBlockStart: 0, top: 0, zIndex: 50 } : {}),
    ...(backgroundChannels != null ? { '--color-background': backgroundChannels } : {}),
  };
  const sectionStyle = Object.keys(pinStyle).length > 0 ? pinStyle : undefined;

  const section = (
    <div
      className={clsx(
        'liivv-archive-header diabetes-care-section-header liivv-header-skin shopify-section shopify-section-group-header-group header-section header-opaque relative w-full min-w-0',
        hasNav && 'diabetes-care-has-nav',
        sticky && 'header-sticky',
        className,
      )}
      id={sectionId}
      ref={sectionRef}
      style={sectionStyle}
    >
      <style dangerouslySetInnerHTML={{ __html: LIIVV_ARCHIVE_HEADER_SECTION_VARS }} />
      <style dangerouslySetInnerHTML={{ __html: ARCHIVE_HEADER_CSS }} />
      <style dangerouslySetInnerHTML={{ __html: LIIVV_HEADER_MEGA_MENU_CSS }} />
      {sticky ? (
        <style dangerouslySetInnerHTML={{ __html: LIIVV_HEADER_STICKY_SCROLLED_CSS }} />
      ) : null}
      <style dangerouslySetInnerHTML={{ __html: buildSearchPanelStyle(searchPanelId) }} />
      {banner}
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
      <div
        className="liivv-header-chrome relative z-[2]"
        onMouseLeave={() => {
          scheduleCloseMegaMenu();
        }}
      >
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
                {logo?.src ? (
                  <img
                    alt={logoAlt}
                    className="logo block h-auto max-h-9 w-auto max-w-[min(100%,7.5rem)] object-contain sm:max-h-11 sm:max-w-[8.5rem] md:max-h-[140px] md:max-w-[140px]"
                    src={logo.src}
                    style={logoStyle}
                  />
                ) : (
                  <span className="logo text-lg font-semibold sm:text-xl md:text-2xl">{logo?.text}</span>
                )}
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
            <div
              className={clsx(
                'header__navigation hidden lg:flex lg:gap-5',
                navigationJustifyClass(linksPosition),
              )}
            >
              <nav aria-label={navAriaLabel} className="header__menu hidden lg:flex" role="navigation">
                <ul className="list-menu with-block flex flex-wrap" role="list">
                  {links.map((item, index) => {
                    const hasMegaMenu = (item.columns?.length ?? 0) > 0;
                    const menuId = `${mobileNavId}-mega-${index}`;
                    const isExpanded = activeMegaIndex === index;

                    return (
                      <li
                        aria-controls={hasMegaMenu ? menuId : undefined}
                        aria-expanded={hasMegaMenu ? isExpanded : undefined}
                        key={`${item.label}-${index}`}
                        onMouseEnter={() => {
                          if (hasMegaMenu) {
                            openMegaMenu(index);
                          } else {
                            closeMegaMenu();
                          }
                        }}
                      >
                        <NavMenuTrigger
                          hasMegaMenu={hasMegaMenu}
                          href={item.href}
                          isExpanded={isExpanded}
                          label={item.label}
                        />
                      </li>
                    );
                  })}
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
                  <LiivvIconSearch className="icon icon-search icon-md" />
                </button>
                <Link
                  aria-label={ACCOUNT_ARIA_LABEL}
                  className="flex items-center justify-center"
                  href={ACCOUNT_PATH}
                >
                  <span className="sr-only">{ACCOUNT_ARIA_LABEL}</span>
                  <LiivvIconAccount className="icon icon-account icon-md" />
                </Link>
                <Link
                  aria-label={cartCountLabel}
                  className="cart-drawer-button relative flex shrink-0 items-center justify-center"
                  href={CART_PATH}
                >
                  <span className="sr-only">{CART_ARIA_LABEL}</span>
                  <LiivvIconCart className="icon icon-cart icon-md" />
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
              'liivv-archive-search-panel absolute left-0 right-0 top-full z-[3]',
              'border-t border-[rgb(var(--color-foreground)/0.08)] bg-[rgb(var(--color-background))] shadow-lg',
            )}
            id={searchPanelId}
            role="search"
          >
            <form action={SEARCH_RESULTS_PATH} className="liivv-archive-search-form" method="get">
              <label className="sr-only" htmlFor={`${searchPanelId}-input`}>
                {searchPlaceholder}
              </label>
              <input
                autoComplete="off"
                className="liivv-archive-search-input"
                id={`${searchPanelId}-input`}
                name="term"
                placeholder={searchPlaceholder}
                ref={searchInputRef}
                type="search"
              />
              <button className="liivv-archive-search-submit" type="submit">
                {SEARCH_ARIA_LABEL}
              </button>
            </form>
          </div>
        ) : null}

        {links.map((item, index) => {
          const hasMegaMenu = (item.columns?.length ?? 0) > 0;
          const menuId = `${mobileNavId}-mega-${index}`;

          if (!hasMegaMenu) {
            return null;
          }

          return (
            <HeaderMegaMenuPanel
              item={item}
              key={menuId}
              menuId={menuId}
              onHover={() => openMegaMenu(index)}
              open={activeMegaIndex === index}
            />
          );
        })}

        {mobileNavOpen && hasNav ? (
          <nav
            aria-label={navAriaLabel}
            className={clsx(
              'diabetes-care-mobile-nav-drawer absolute left-0 right-0 top-full z-[3] max-h-[min(70vh,24rem)] overflow-y-auto overscroll-contain',
              'border-t border-[rgb(var(--color-foreground)/0.08)] bg-[rgb(var(--color-background))] shadow-lg',
            )}
            id={mobileNavId}
            role="navigation"
          >
            <ul className="flex list-none flex-col gap-0 p-2" role="list">
              {links.map((item, index) => {
                const columns = item.columns ?? [];

                if (columns.length === 0) {
                  return (
                    <li
                      className="border-b border-[rgb(var(--color-foreground)/0.06)] last:border-b-0"
                      key={`${item.label}-m-${index}`}
                    >
                      <Link
                        className={clsx(
                          'flex min-h-12 items-center px-4 py-3 font-[family-name:var(--font-navigation-family,var(--font-sans))]',
                          'text-base font-medium text-[rgb(var(--color-foreground))] no-underline',
                          'rounded-md active:bg-[rgb(var(--color-foreground)/0.06)]',
                        )}
                        href={item.href}
                        onClick={closeMobileNav}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                }

                return (
                  <li
                    className="border-b border-[rgb(var(--color-foreground)/0.06)] last:border-b-0"
                    key={`${item.label}-m-${index}`}
                  >
                    <Link
                      className={clsx(
                        'flex min-h-11 items-center px-4 pt-3 font-[family-name:var(--font-navigation-family,var(--font-sans))]',
                        'text-xs font-semibold uppercase tracking-wide text-[rgb(var(--color-foreground)/0.55)] no-underline',
                        'rounded-md active:bg-[rgb(var(--color-foreground)/0.06)]',
                      )}
                      href={item.href}
                      onClick={closeMobileNav}
                    >
                      {item.label}
                    </Link>
                    <ul className="list-none pb-2" role="list">
                      {columns.flatMap((column) =>
                        column.links.map((link, linkIndex) => (
                          <li key={`${item.label}-m-${link.label}-${linkIndex}`}>
                            <Link
                              className={clsx(
                                'flex min-h-11 items-center px-4 py-2.5 pl-6 font-[family-name:var(--font-navigation-family,var(--font-sans))]',
                                'text-sm font-medium text-[rgb(var(--color-foreground))] no-underline',
                                'rounded-md active:bg-[rgb(var(--color-foreground)/0.06)]',
                              )}
                              href={link.href}
                              onClick={closeMobileNav}
                            >
                              {link.label}
                            </Link>
                          </li>
                        )),
                      )}
                    </ul>
                    {item.exploreAll ? (
                      <Link
                        className="mx-4 mb-3 inline-flex min-h-11 items-center text-sm font-medium text-[rgb(var(--color-foreground))] underline"
                        href={item.exploreAll.href}
                        onClick={closeMobileNav}
                      >
                        {item.exploreAll.label}
                      </Link>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </nav>
        ) : null}
      </div>
      {children}
    </div>
  );

  const stickySentinel = sticky ? (
    <div
      aria-hidden
      className="header-sticky-sentinel pointer-events-none h-px w-full shrink-0"
      ref={stickySentinelRef}
    />
  ) : null;

  if (!withPinSpacer) {
    return (
      <>
        {stickySentinel}
        {section}
      </>
    );
  }

  return (
    <>
      {stickySentinel}
      {section}
      <div
        aria-hidden
        className="w-full shrink-0 overflow-hidden"
        ref={spacerRef}
        style={{ height: 0 }}
      />
    </>
  );
}
