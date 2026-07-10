'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { Link } from '~/components/link';
import { AccountNotificationsBell } from '~/components/account-notifications';
import { OnboardingBanner } from '~/components/onboarding/onboarding-banner';
import { initialsFromName } from '~/lib/account/customer-initials';
import { usePathname } from '~/i18n/routing';

import {
  ACCOUNT_DASHBOARD_ROOT_ID,
  ACCOUNT_DASHBOARD_STYLE,
} from './dashboard-styles';
import { useAccountDashboardSearch } from './use-account-dashboard-search';
import {
  IconCart,
  IconChevronDown,
  IconHome,
  IconInfo,
  IconLock,
  IconLoyalty,
  IconOrders,
  IconShop,
} from './icons';
import type { AccountDashboardShellProps } from './types';

function isAccountSubPage(pathname: string): boolean {
  return (
    pathname.includes('/account/orders') ||
    pathname.includes('/account/subscriptions') ||
    pathname.includes('/account/pharmacy') ||
    pathname.includes('/account/virtual-care')
  );
}

function isNavActive(pathname: string, href: string): boolean {
  const normalizedPath = pathname.replace(/\/$/, '');
  const normalizedHref = href.replace(/\/$/, '');

  if (normalizedHref === '/account/dashboard') {
    return normalizedPath === normalizedHref || normalizedPath.endsWith('/account/dashboard');
  }

  return normalizedPath === normalizedHref || normalizedPath.startsWith(`${normalizedHref}/`);
}

export function AccountDashboardPortal({
  children,
  customerName,
  cartHref,
  cartCount: initialCartCount,
  labels,
  wishlistsHref,
  onboardingBannerHref,
  headerNotifications,
  notificationsUnreadCount,
  logoSrc,
  logoAlt,
  searchPlaceholder,
  accountMenuLinks,
  ordersHref,
  settingsHref,
  contactHref,
}: AccountDashboardShellProps) {
  const pathname = usePathname() ?? '';
  const [accountOpen, setAccountOpen] = useState(false);
  const [cartCount, setCartCount] = useState<number | null>(initialCartCount);
  const accountRef = useRef<HTMLDivElement>(null);
  const accountButtonRef = useRef<HTMLButtonElement>(null);
  const avatarInitials = useMemo(() => initialsFromName(customerName), [customerName]);
  const search = useAccountDashboardSearch({
    ariaLabel: labels.search,
    searchPlaceholder,
  });
  const cartAriaLabel =
    cartCount != null && cartCount > 0
      ? `${cartCount} item${cartCount === 1 ? '' : 's'}`
      : labels.cart;

  const refreshCartCount = useCallback(async () => {
    try {
      const response = await fetch('/api/cart/line-item-count', { cache: 'no-store' });

      if (!response.ok) {
        setCartCount(null);

        return;
      }

      const data = (await response.json()) as { count: number | null };

      setCartCount(data.count ?? null);
    } catch {
      setCartCount(null);
    }
  }, []);

  useEffect(() => {
    setCartCount(initialCartCount);
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
    const previousOverflow = document.body.style.overflow;

    document.body.classList.add('adc-portal-active');
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.classList.remove('adc-portal-active');
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    if (!accountOpen) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (accountRef.current != null && !accountRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setAccountOpen(false);
        accountButtonRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [accountOpen]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ACCOUNT_DASHBOARD_STYLE }} />
      <div className="liivv-account-dashboard-root" id={ACCOUNT_DASHBOARD_ROOT_ID}>
        <div className="mhd-shell">
          <aside aria-label={labels.aria.accountNavigation} className="mhd-sidebar">
            <Link aria-label={logoAlt} className="mhd-sidebar__logo" href="/">
              <img alt={logoAlt} className="mhd-sidebar__logo-img" height={60} src={logoSrc} width={138} />
            </Link>

            <nav aria-label={labels.aria.primaryNavigation} className="mhd-sidebar__nav">
              <SidebarLink
                active={isNavActive(pathname, '/account/dashboard/')}
                href="/account/dashboard/"
                icon={<IconHome />}
                label={labels.sidebar.home}
              />
              <SidebarLink
                active={isNavActive(pathname, ordersHref)}
                href={ordersHref}
                icon={<IconOrders />}
                label={labels.sidebar.orders}
              />
              <SidebarLink href="/" icon={<IconShop />} label={labels.sidebar.shop} />
              <SidebarLink href={wishlistsHref} icon={<IconLoyalty />} label={labels.sidebar.wishlists} />
            </nav>

            <nav aria-label={labels.aria.secondaryNavigation} className="mhd-sidebar__footer">
              <SidebarLink
                active={isNavActive(pathname, settingsHref)}
                href={settingsHref}
                icon={<IconLock />}
                label={labels.sidebar.settings}
              />
              <SidebarLink href={contactHref} icon={<IconInfo />} label={labels.sidebar.help} />
            </nav>
          </aside>

          <div className="mhd-content">
            <header className="mhd-content-header">
              <div className="mhd-content-header__body">
                <div className="mhd-content-header__greeting">
                  <h1 className="mhd-greeting__title">{labels.wellness.greeting}</h1>
                  <p className="mhd-greeting__lead">{labels.wellness.welcomeLead}</p>
                </div>

                <div className="mhd-content-header__utilities">
                  {search.trigger}
                  <AccountNotificationsBell
                    labels={{
                      ariaLabel: labels.notifications,
                      empty: labels.notificationsEmpty,
                      kindOrder: labels.notificationKindOrder,
                      kindSubscription: labels.notificationKindSubscription,
                      panelTitle: labels.notificationsPanelTitle,
                    }}
                    notifications={headerNotifications}
                    unreadCount={notificationsUnreadCount}
                  />
                  <Link aria-label={cartAriaLabel} className="mhd-icon-btn" href={cartHref}>
                    <IconCart />
                    {cartCount != null && cartCount > 0 ? (
                      <span aria-hidden className="mhd-icon-btn__badge">
                        {cartCount > 99 ? '99+' : cartCount}
                      </span>
                    ) : null}
                  </Link>
                  <div className="mhd-account-wrap" ref={accountRef}>
                    <button
                      aria-expanded={accountOpen}
                      aria-haspopup="menu"
                      className="mhd-account-btn mhd-account-btn--avatar"
                      onClick={() => setAccountOpen((open) => !open)}
                      ref={accountButtonRef}
                      type="button"
                    >
                      <span aria-hidden className="mhd-avatar">
                        {avatarInitials}
                      </span>
                      <span className="mhd-account-btn__label">{labels.myAccount}</span>
                      <IconChevronDown className="mhd-chevron" />
                    </button>
                    <ul className="mhd-account-menu" hidden={!accountOpen} role="menu">
                      {accountMenuLinks.map((link) => (
                        <li key={link.href} role="none">
                          <Link
                            aria-current={isNavActive(pathname, link.href) ? 'page' : undefined}
                            href={link.href}
                            onClick={() => setAccountOpen(false)}
                            prefetch={link.prefetch}
                            role="menuitem"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              {search.drawer}
            </header>

            <main className="mhd-main">
              <div className="mhd-container">
                {onboardingBannerHref ? (
                  <OnboardingBanner
                    ctaLabel={labels.onboardingBannerCta}
                    href={onboardingBannerHref}
                    message={labels.onboardingBannerMessage}
                  />
                ) : null}
                {isAccountSubPage(pathname) ? (
                  <div className="mhd-account-page">{children}</div>
                ) : (
                  children
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}

function SidebarLink({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      aria-current={active ? 'page' : undefined}
      aria-label={label}
      className={active ? 'mhd-sidebar__link mhd-sidebar__link--active' : 'mhd-sidebar__link'}
      href={href}
      title={label}
    >
      <span className="mhd-sidebar__icon">{icon}</span>
    </Link>
  );
}
