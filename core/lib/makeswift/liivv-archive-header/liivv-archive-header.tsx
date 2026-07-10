'use client';

import { clsx } from 'clsx';
import {
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  type RefObject,
  type TransitionEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Link } from '~/components/link';
import { AccountNotificationsBell } from '~/components/account-notifications';
import { IconAccount, IconCart, IconChevronDown, IconSearch } from '~/components/account-dashboard/icons';
import { initialsFromName } from '~/lib/account/customer-initials';
import { usePathname } from '~/i18n/routing';
import type { SiteHeaderNotifications } from '~/lib/account-notifications/header-notification-labels';
import {
  resolveSectionBackgroundChannels,
  type SectionBackgroundProps,
} from '~/lib/makeswift/utils/diabetes-care-section-style';
import { useHeaderStickyScrolled } from '~/lib/makeswift/site-header/use-header-sticky-scrolled';
import { resolveMakeswiftHref } from '~/lib/makeswift/utils/resolve-makeswift-href';

import type { AccountMenuLink } from '~/lib/account/account-menu-links';

import { LIIVV_HEADER_ACCOUNT_MENU_CSS } from './account-menu-css';
import { ARCHIVE_HEADER_CSS } from './archive-header-css';
import { LiivvArchiveSearchPanel } from './liivv-archive-search-panel';
import { LIIVV_HEADER_MEGA_MENU_CSS } from './mega-menu-css';
import type {
  LiivvArchiveHeaderLogo,
  LiivvArchiveLinksPosition,
  LiivvArchiveNavColumn,
  LiivvArchiveNavColumnHeading,
  LiivvArchiveNavLink,
  LiivvArchiveNavSubLink,
} from './types';

import { ACCOUNT_LOGIN_PATH } from '~/lib/makeswift/site-header/resolve-account-href';

const CART_PATH = '/cart';
const SEARCH_ARIA_LABEL = 'Search';
/** Keep in sync with --mega-menu-drawer-duration in mega-menu-css.ts */
const SEARCH_DRAWER_DURATION_MS = 450;
/** Keep in sync with --mega-menu-close-delay in mega-menu-css.ts */
const MEGA_MENU_CLOSE_DELAY_MS = 300;

function megaMenuPanelId(mobileNavId: string, index: number): string {
  return `${mobileNavId}-mega-${index}`;
}

/** True when the pointer is moving onto a nav trigger, open panel, or bridge between them. */
function isMegaMenuInteractionTarget(
  related: EventTarget | null,
  mobileNavId: string,
  megaMenuIndices: readonly number[],
): boolean {
  if (!(related instanceof Node)) {
    return false;
  }

  if (
    related instanceof Element &&
    related.closest('.liivv-archive-header .header-mega-menu-wrap') != null
  ) {
    return true;
  }

  if (
    related instanceof Element &&
    related.closest('.liivv-archive-header .header__navigation') != null
  ) {
    return true;
  }

  for (const index of megaMenuIndices) {
    const menuId = megaMenuPanelId(mobileNavId, index);
    const panel = document.getElementById(menuId);

    if (panel?.contains(related)) {
      return true;
    }

    const trigger = document.querySelector(`[aria-controls="${menuId}"]`);

    if (trigger?.contains(related)) {
      return true;
    }
  }

  if (related instanceof Element && related.closest('.liivv-archive-header .header__menu') != null) {
    return true;
  }

  return false;
}
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
  accountHref?: string;
  accountMenuLinks?: AccountMenuLink[];
  accountCustomerName?: string;
  accountLabel?: string;
  searchPlaceholder?: string;
  notifications?: SiteHeaderNotifications | null;
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
  onMouseEnter,
  onMouseLeave,
}: {
  href: string;
  label: string;
  hasMegaMenu: boolean;
  isExpanded: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <Link
      aria-expanded={hasMegaMenu ? isExpanded : undefined}
      aria-haspopup={hasMegaMenu ? 'true' : undefined}
      aria-label={label}
      className="menu__item text-sm-lg relative z-2 flex cursor-pointer items-center font-medium"
      href={href}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
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

function columnHeadingAsPreview(heading: LiivvArchiveNavColumnHeading): LiivvArchiveNavSubLink {
  return {
    label: heading.label,
    href: heading.href,
    image: heading.image ?? null,
  };
}

function megaMenuLinksInDisplayOrder(columns: LiivvArchiveNavColumn[]): LiivvArchiveNavSubLink[] {
  const ordered: LiivvArchiveNavSubLink[] = [];

  for (const column of columns) {
    if (column.heading) {
      ordered.push(columnHeadingAsPreview(column.heading));
    }

    ordered.push(...column.links);
  }

  return ordered;
}

function pickDefaultMegaMenuPreview(
  item: LiivvArchiveNavLink,
  columns: LiivvArchiveNavColumn[],
): LiivvArchiveNavSubLink | null {
  const ordered = megaMenuLinksInDisplayOrder(columns);
  const linkWithImage = ordered.find((link) => Boolean(link.image?.src));

  if (linkWithImage) {
    return linkWithImage;
  }

  if (ordered[0]) {
    return ordered[0];
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

function megaMenuPreviewKey(
  link: LiivvArchiveNavSubLink | null,
  fallbackLogo?: LiivvArchiveHeaderLogo | null,
): string {
  if (link == null) {
    return '';
  }

  const visualKey =
    link.image?.src ??
    (fallbackLogo?.src != null
      ? `logo:${fallbackLogo.src}`
      : fallbackLogo?.text != null
        ? `logo-text:${fallbackLogo.text}`
        : '');

  return `${link.href}|${link.label}|${visualKey}`;
}

/** Keep in sync with --mega-menu-feature-fade-duration in mega-menu-css.ts */
const MEGA_MENU_FEATURE_FADE_MS = 150;

type MegaMenuPreviewContent =
  | {
      kind: 'image';
      src: string;
      alt: string;
      isLogo: boolean;
    }
  | {
      kind: 'logo-text';
      text: string;
    }
  | {
      kind: 'placeholder';
    };

function megaMenuPreviewVisualKey(
  content: MegaMenuPreviewContent,
): string {
  if (content.kind === 'image') {
    return content.isLogo ? `logo:${content.src}` : content.src;
  }

  if (content.kind === 'logo-text') {
    return `logo-text:${content.text}`;
  }

  return 'placeholder';
}

async function preloadPreviewImage(src: string): Promise<void> {
  const image = new window.Image();

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error('Failed to load preview image'));
    image.src = src;
  });

  if (typeof image.decode === 'function') {
    await image.decode().catch(() => undefined);
  }
}

function buildPreviewContent(
  preview: LiivvArchiveNavSubLink,
  fallbackLogo?: LiivvArchiveHeaderLogo | null,
): MegaMenuPreviewContent {
  if (preview.image?.src != null) {
    return {
      kind: 'image',
      src: preview.image.src,
      alt: preview.image.alt || preview.label,
      isLogo: false,
    };
  }

  if (fallbackLogo?.src != null) {
    return {
      kind: 'image',
      src: fallbackLogo.src,
      alt: fallbackLogo.alt,
      isLogo: true,
    };
  }

  if (fallbackLogo?.text != null) {
    return {
      kind: 'logo-text',
      text: fallbackLogo.text,
    };
  }

  return {
    kind: 'placeholder',
  };
}

function renderMegaMenuPreviewContent(
  content: MegaMenuPreviewContent,
  layerClass: string,
  zIndex: number,
  key: string,
  onTransitionEnd?: (event: TransitionEvent) => void,
) {
  if (content.kind === 'image') {
    return (
      <img
        alt={content.alt}
        className={clsx(
          'header-mega-menu__feature-image',
          content.isLogo && 'header-mega-menu__feature-image--logo',
          layerClass,
        )}
        decoding="sync"
        key={key}
        onTransitionEnd={onTransitionEnd}
        src={content.src}
        style={{ zIndex }}
      />
    );
  }

  if (content.kind === 'logo-text') {
    return (
      <div
        aria-hidden
        className={clsx('header-mega-menu__feature-logo-text', layerClass)}
        key={key}
        onTransitionEnd={onTransitionEnd}
        style={{ zIndex }}
      >
        {content.text}
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className={clsx('header-mega-menu__feature-placeholder-layer', layerClass)}
      key={key}
      onTransitionEnd={onTransitionEnd}
      style={{ zIndex }}
    />
  );
}

function MegaMenuCategoryPreview({
  preview,
  fallbackLogo,
}: {
  preview: LiivvArchiveNavSubLink | null;
  fallbackLogo?: LiivvArchiveHeaderLogo | null;
}) {
  const [baseContent, setBaseContent] = useState<MegaMenuPreviewContent | null>(() =>
    preview == null ? null : buildPreviewContent(preview, fallbackLogo),
  );
  const lastPreviewKeyRef = useRef(
    preview == null ? '' : megaMenuPreviewKey(preview, fallbackLogo),
  );
  const lastVisualKeyRef = useRef(
    baseContent == null ? '' : megaMenuPreviewVisualKey(baseContent),
  );
  const baseContentRef = useRef<MegaMenuPreviewContent | null>(baseContent);
  const [incomingContent, setIncomingContent] = useState<MegaMenuPreviewContent | null>(
    null,
  );
  const [incomingVisible, setIncomingVisible] = useState(false);

  baseContentRef.current = baseContent;

  useEffect(() => {
    if (preview == null) {
      lastPreviewKeyRef.current = '';
      lastVisualKeyRef.current = '';
      setBaseContent(null);
      setIncomingContent(null);
      setIncomingVisible(false);

      return;
    }

    const nextContent = buildPreviewContent(preview, fallbackLogo);
    const previewKey = megaMenuPreviewKey(preview, fallbackLogo);

    if (previewKey === lastPreviewKeyRef.current) {
      return;
    }

    lastPreviewKeyRef.current = previewKey;

    const visualKey = megaMenuPreviewVisualKey(nextContent);

    if (visualKey === lastVisualKeyRef.current && baseContentRef.current != null) {
      setBaseContent(nextContent);

      return;
    }

    lastVisualKeyRef.current = visualKey;

    let cancelled = false;
    let fadeInRaf = 0;
    let commitTimer = 0;

    const commitIncoming = () => {
      setBaseContent(nextContent);
      setIncomingContent(null);
      setIncomingVisible(false);
    };

    const beginFadeIn = () => {
      if (cancelled) {
        return;
      }

      if (baseContentRef.current == null) {
        setBaseContent(nextContent);

        return;
      }

      setIncomingContent(nextContent);
      setIncomingVisible(false);

      fadeInRaf = window.requestAnimationFrame(() => {
        fadeInRaf = window.requestAnimationFrame(() => {
          if (cancelled) {
            return;
          }

          setIncomingVisible(true);
          commitTimer = window.setTimeout(() => {
            if (!cancelled) {
              commitIncoming();
            }
          }, MEGA_MENU_FEATURE_FADE_MS);
        });
      });
    };

    if (nextContent.kind === 'image') {
      void preloadPreviewImage(nextContent.src)
        .catch(() => undefined)
        .then(() => {
          if (!cancelled) {
            beginFadeIn();
          }
        });
    } else {
      beginFadeIn();
    }

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(fadeInRaf);
      window.clearTimeout(commitTimer);
    };
  }, [fallbackLogo, preview]);

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

  const incomingLayerClass = clsx(
    'header-mega-menu__feature-layer--incoming',
    incomingVisible && 'is-entered',
  );

  return (
    <div className="header-mega-menu__feature-panel relative flex h-full min-h-[280px] flex-col overflow-hidden">
      {baseContent != null &&
        renderMegaMenuPreviewContent(
          baseContent,
          'header-mega-menu__feature-layer--base',
          1,
          'base',
        )}
      {incomingContent != null &&
        renderMegaMenuPreviewContent(
          incomingContent,
          incomingLayerClass,
          2,
          'incoming',
        )}
    </div>
  );
}

function HeaderMegaMenuPanel({
  item,
  menuId,
  mobileNavId,
  megaMenuIndices,
  open,
  onHover,
  onLeave,
  fallbackLogo,
}: {
  item: LiivvArchiveNavLink;
  menuId: string;
  mobileNavId: string;
  megaMenuIndices: readonly number[];
  open: boolean;
  onHover: () => void;
  onLeave: () => void;
  fallbackLogo?: LiivvArchiveHeaderLogo | null;
}) {
  const columns = item.columns ?? [];
  const defaultPreview = useMemo(
    () => pickDefaultMegaMenuPreview(item, columns),
    [item, columns],
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
      onMouseLeave={(event) => {
        if (isMegaMenuInteractionTarget(event.relatedTarget, mobileNavId, megaMenuIndices)) {
          return;
        }

        onLeave();
      }}
      role="region"
      aria-label={`${item.label} categories`}
      aria-hidden={!open}
    >
      <div className="header-mega-menu page-width page-width--full">
        <div className="header-mega-menu__body">
          <div className="header-mega-menu__links">
            <div
              className="header-mega-menu__grid"
              style={
                {
                  '--mega-menu-column-count': String(Math.min(columns.length, 5)),
                } as CSSProperties
              }
            >
              {columns.map((column, columnIndex) => {
                const headingPreview = column.heading
                  ? columnHeadingAsPreview(column.heading)
                  : null;

                return (
                  <ul className="header-mega-menu__column" key={`col-${columnIndex}`} role="list">
                    {column.heading ? (
                      <li className="header-mega-menu__column-heading">
                        <Link
                          className={clsx(
                            'header-mega-menu__heading-link',
                            previewLink?.href === column.heading.href &&
                              previewLink.label === column.heading.label &&
                              'header-mega-menu__link--active',
                          )}
                          href={column.heading.href}
                          onFocus={() => setPreviewLink(headingPreview)}
                          onMouseEnter={() => setPreviewLink(headingPreview)}
                        >
                          {column.heading.label}
                        </Link>
                      </li>
                    ) : null}
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
                );
              })}
            </div>
          </div>
          <aside aria-label="Category preview" className="header-mega-menu__feature">
            <MegaMenuCategoryPreview fallbackLogo={fallbackLogo} preview={previewLink} />
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

function HeaderAccountMenu({
  accountHref,
  links,
  panelId,
  customerName,
  accountLabel,
}: {
  accountHref: string;
  links: AccountMenuLink[];
  panelId: string;
  customerName?: string;
  accountLabel?: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const closeMenu = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (menuRef.current != null && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const avatarInitials = useMemo(
    () => initialsFromName(customerName ?? ''),
    [customerName],
  );

  if (links.length === 0) {
    return (
      <Link
        aria-label={ACCOUNT_ARIA_LABEL}
        className="header-utility-icon-btn"
        href={accountHref}
      >
        <IconAccount />
      </Link>
    );
  }

  return (
    <div className="header-account-menu" ref={menuRef}>
      <button
        aria-controls={panelId}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={accountLabel ?? ACCOUNT_ARIA_LABEL}
        className="header-account-btn header-account-btn--avatar"
        onClick={() => setOpen((current) => !current)}
        ref={buttonRef}
        type="button"
      >
        <span aria-hidden className="header-account-avatar">
          {avatarInitials}
        </span>
        <span className="header-account-btn__label">{accountLabel ?? ACCOUNT_ARIA_LABEL}</span>
        <IconChevronDown className="header-account-btn__chevron" />
      </button>
      <div className="header-account-menu__panel" hidden={!open} id={panelId} role="menu">
        {links.map((link) => {
          const isActive = pathname.includes(link.href);

          return (
            <Link
              className={clsx(
                'header-account-menu__link',
                isActive && 'header-account-menu__link--active',
              )}
              href={link.href}
              key={link.href}
              onClick={() => setOpen(false)}
              prefetch={link.prefetch}
              role="menuitem"
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
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
  accountHref = ACCOUNT_LOGIN_PATH,
  accountMenuLinks = [],
  accountCustomerName,
  accountLabel,
  searchPlaceholder = 'Search products',
  notifications = null,
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
  const accountMenuPanelId = `liivv-archive-header-account-${safeId}`;

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
  const [searchDrawerMounted, setSearchDrawerMounted] = useState(false);
  const [activeMegaIndex, setActiveMegaIndex] = useState<number | null>(null);
  const megaCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const links = navLinks;
  const megaMenuIndices = links.flatMap((item, index) =>
    (item.columns?.length ?? 0) > 0 ? [index] : [],
  );
  const logoVisible = Boolean(showLogo && (logo?.src || logo?.text));
  const hasNav = links.length > 0;
  const megaMenuOpen = activeMegaIndex !== null;
  const searchDrawerOpen = searchOpen && !megaMenuOpen;

  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const closeMegaMenu = useCallback(() => setActiveMegaIndex(null), []);

  const openMegaMenu = useCallback((index: number) => {
    if (megaCloseTimerRef.current != null) {
      clearTimeout(megaCloseTimerRef.current);
      megaCloseTimerRef.current = null;
    }

    setActiveMegaIndex(index);
  }, []);

  const scheduleCloseMegaMenu = useCallback(() => {
    if (megaCloseTimerRef.current != null) {
      clearTimeout(megaCloseTimerRef.current);
    }

    megaCloseTimerRef.current = setTimeout(() => {
      setActiveMegaIndex(null);
      megaCloseTimerRef.current = null;
    }, MEGA_MENU_CLOSE_DELAY_MS);
  }, []);

  const toggleSearch = useCallback(() => {
    if (searchOpen) {
      setSearchOpen(false);

      return;
    }

    setMobileNavOpen(false);
    setSearchDrawerMounted(true);

    window.requestAnimationFrame(() => {
      setSearchOpen(true);
    });
  }, [searchOpen]);

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
    if (searchOpen || !searchDrawerMounted) {
      return;
    }

    const timer = window.setTimeout(() => {
      setSearchDrawerMounted(false);
    }, SEARCH_DRAWER_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, [searchDrawerMounted, searchOpen]);

  useEffect(() => {
    if (!searchDrawerOpen) {
      return;
    }

    const id = window.requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });

    return () => window.cancelAnimationFrame(id);
  }, [searchDrawerOpen]);

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
      {accountMenuLinks.length > 0 ? (
        <style dangerouslySetInnerHTML={{ __html: LIIVV_HEADER_ACCOUNT_MENU_CSS }} />
      ) : null}
      {sticky ? (
        <style dangerouslySetInnerHTML={{ __html: LIIVV_HEADER_STICKY_SCROLLED_CSS }} />
      ) : null}
      {banner}
      {(mobileNavOpen || searchDrawerMounted) && (hasNav || searchDrawerMounted) ? (
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
        onMouseLeave={(event) => {
          if (isMegaMenuInteractionTarget(event.relatedTarget, mobileNavId, megaMenuIndices)) {
            return;
          }

          scheduleCloseMegaMenu();
        }}
      >
        <header
          className="header header--left mobile:header--left page-width page-width--full section section--rounded section--padding relative z-20 grid w-full max-w-full items-center section--next-rounded"
          data-section-id="sections--26374736970019__header"
        >
          {logoVisible || hasNav ? (
            <div
              className="header__logo z-2 flex min-w-0 items-center justify-center gap-3 lg:justify-center"
              onMouseEnter={closeMegaMenu}
            >
              {logoVisible ? (
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
              ) : null}
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
                      >
                        <NavMenuTrigger
                          hasMegaMenu={hasMegaMenu}
                          href={item.href}
                          isExpanded={isExpanded}
                          label={item.label}
                          onMouseEnter={() => {
                            if (hasMegaMenu) {
                              openMegaMenu(index);
                            } else {
                              closeMegaMenu();
                            }
                          }}
                        />
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          ) : null}

          {showUtilityIcons ? (
            <div
              className="header__icons header__icons--end z-2 flex min-w-0 shrink-0 justify-end"
              onMouseEnter={closeMegaMenu}
            >
              <div className="header__buttons gap-1d5 flex items-center">
                <button
                  aria-controls={searchPanelId}
                  aria-expanded={searchOpen}
                  aria-label={SEARCH_ARIA_LABEL}
                  className="header-utility-icon-btn search-drawer-button"
                  type="button"
                  onClick={toggleSearch}
                >
                  <IconSearch />
                </button>
                {notifications ? (
                  <AccountNotificationsBell
                    labels={notifications.labels}
                    notifications={notifications.items}
                    unreadCount={notifications.unreadCount}
                    variant="storefront"
                  />
                ) : null}
                <Link
                  aria-label={cartCountLabel}
                  className="header-utility-icon-btn cart-drawer-button"
                  href={CART_PATH}
                >
                  <IconCart />
                  {cartLineCount != null && cartLineCount > 0 ? (
                    <span className="header-utility-badge header-utility-badge--count" aria-hidden>
                      {cartLineCount > 99 ? '99+' : cartLineCount}
                    </span>
                  ) : null}
                </Link>
                <HeaderAccountMenu
                  accountHref={accountHref}
                  accountLabel={accountLabel}
                  customerName={accountCustomerName}
                  links={accountMenuLinks}
                  panelId={accountMenuPanelId}
                />
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

        {searchDrawerMounted ? (
          <div
            aria-hidden={!searchDrawerOpen}
            className={clsx('header-search-wrap', searchDrawerOpen && 'is-open')}
            id={searchPanelId}
          >
            <div className="header-search-drawer liivv-archive-search-panel">
              <LiivvArchiveSearchPanel
                fallbackLogo={logo}
                inputRef={searchInputRef}
                onClose={closeSearch}
                open={searchOpen}
                searchPanelId={searchPanelId}
                searchPlaceholder={searchPlaceholder}
              />
            </div>
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
              fallbackLogo={logo}
              item={item}
              key={menuId}
              megaMenuIndices={megaMenuIndices}
              menuId={menuId}
              mobileNavId={mobileNavId}
              onHover={() => openMegaMenu(index)}
              onLeave={scheduleCloseMegaMenu}
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
                      {columns.map((column, columnIndex) => (
                        <li key={`${item.label}-m-col-${columnIndex}`}>
                          {column.heading ? (
                            <Link
                              className={clsx(
                                'flex min-h-11 items-center px-4 py-2.5 pl-6 font-[family-name:var(--font-navigation-family,var(--font-sans))]',
                                'text-xs font-semibold uppercase tracking-wide text-[rgb(var(--color-foreground)/0.7)] no-underline',
                                'rounded-md active:bg-[rgb(var(--color-foreground)/0.06)]',
                              )}
                              href={column.heading.href}
                              onClick={closeMobileNav}
                            >
                              {column.heading.label}
                            </Link>
                          ) : null}
                          <ul className="list-none" role="list">
                            {column.links.map((link, linkIndex) => (
                              <li key={`${item.label}-m-${link.label}-${linkIndex}`}>
                                <Link
                                  className={clsx(
                                    'flex min-h-11 items-center px-4 py-2.5 pl-9 font-[family-name:var(--font-navigation-family,var(--font-sans))]',
                                    'text-sm font-medium text-[rgb(var(--color-foreground))] no-underline',
                                    'rounded-md active:bg-[rgb(var(--color-foreground)/0.06)]',
                                  )}
                                  href={link.href}
                                  onClick={closeMobileNav}
                                >
                                  {link.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
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
