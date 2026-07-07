'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { Link } from '~/components/link';
import { AccountNotificationsBell } from '~/components/account-notifications';
import { OnboardingBanner } from '~/components/onboarding/onboarding-banner';
import { initShopifyButtonFillHover } from '~/lib/archived-pages/init-shopify-button-fill-hover';

import {
  ACCOUNT_DASHBOARD_ROOT_ID,
  ACCOUNT_DASHBOARD_STYLE,
} from './dashboard-styles';
import { HealthDashboardMain } from './health-dashboard-main';
import {
  IconCart,
  IconChevronDown,
  IconHome,
  IconInfo,
  IconLock,
  IconLoyalty,
  IconOrders,
  IconSearch,
  IconShop,
} from './icons';
import type { AccountDashboardProps } from './types';

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return 'LV';
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function AccountDashboardPortal({
  customerName,
  cartHref,
  contactHref,
  labels,
  logoutHref,
  loyaltyHref,
  nextSubscriptionDate,
  onboardingBannerHref,
  virtualCareCarePackHref,
  virtualCareConsultingHref,
  virtualCarePharmacyHref,
  wellnessSelectionHref,
  virtualCareChatHref,
  headerNotifications,
  notificationsUnreadCount,
  hasUnreadChatMessage,
  ordersHref,
  settingsHref,
  shopHref,
  subscriptionsHref,
}: AccountDashboardProps) {
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const avatarInitials = useMemo(() => initialsFromName(customerName), [customerName]);

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
    if (rootRef.current == null) {
      return;
    }

    return initShopifyButtonFillHover(rootRef.current);
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

    document.addEventListener('mousedown', onPointerDown);

    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [accountOpen]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ACCOUNT_DASHBOARD_STYLE }} />
      <div
        className="liivv-account-dashboard-root"
        data-button-hover="standard"
        id={ACCOUNT_DASHBOARD_ROOT_ID}
        ref={rootRef}
      >
        <div className="mhd-shell">
          <aside aria-label="Account navigation" className="mhd-sidebar">
            <Link aria-label="Liivv" className="mhd-sidebar__logo" href="/">
              <img
                alt="Liivv"
                className="mhd-sidebar__logo-img"
                height={32}
                src="https://storage.googleapis.com/s.mkswft.com/RmlsZTo4NWQ4MGJiNi03MDZjLTQ4MWEtOGFmNi1kNDI2ZjBlNDYwOTQ=/Liivv_Favicon.png"
                width={32}
              />
              <span className="mhd-sidebar__logo-text">Liivv</span>
            </Link>

            <nav aria-label="Primary" className="mhd-sidebar__nav">
              <SidebarLink
                active
                href="/account/dashboard/"
                icon={<IconHome />}
                label={labels.sidebar.home}
              />
              <SidebarLink href={ordersHref} icon={<IconOrders />} label={labels.sidebar.orders} />
              <SidebarLink href={shopHref} icon={<IconShop />} label={labels.sidebar.shop} />
              <SidebarLink href={loyaltyHref} icon={<IconLoyalty />} label={labels.sidebar.loyalty} />
            </nav>

            <nav aria-label="Secondary" className="mhd-sidebar__footer">
              <SidebarLink href={settingsHref} icon={<IconLock />} label={labels.sidebar.settings} />
              <SidebarLink href={contactHref} icon={<IconInfo />} label={labels.sidebar.help} />
            </nav>
          </aside>

          <div className="mhd-content">
            <header className="mhd-content-header">
              <div className="mhd-content-header__greeting">
                <h1 className="mhd-greeting__title">{labels.wellness.greeting}</h1>
                <p className="mhd-greeting__lead">{labels.wellness.welcomeLead}</p>
              </div>

              <div className="mhd-content-header__utilities">
                <Link aria-label={labels.search} className="mhd-icon-btn" href={shopHref}>
                  <IconSearch />
                </Link>
                <AccountNotificationsBell
                  labels={{
                    ariaLabel: labels.notifications,
                    empty: labels.notificationsEmpty,
                    panelTitle: labels.notificationsPanelTitle,
                    unreadAria: labels.notificationsUnread,
                  }}
                  notifications={headerNotifications}
                  unreadCount={notificationsUnreadCount}
                />
                <Link aria-label={labels.cart} className="mhd-icon-btn" href={cartHref}>
                  <IconCart />
                </Link>

                <div className="mhd-account-wrap" ref={accountRef}>
                  <button
                    aria-expanded={accountOpen}
                    aria-haspopup="menu"
                    className="mhd-account-btn mhd-account-btn--avatar"
                    onClick={() => setAccountOpen((open) => !open)}
                    type="button"
                  >
                    <span aria-hidden className="mhd-avatar">
                      {avatarInitials}
                    </span>
                    <span className="mhd-account-btn__label">{labels.myAccount}</span>
                    <IconChevronDown className="mhd-chevron" />
                  </button>
                  <ul className="mhd-account-menu" hidden={!accountOpen} role="menu">
                    <li role="none">
                      <Link href={ordersHref} onClick={() => setAccountOpen(false)} role="menuitem">
                        {labels.sidebar.orders}
                      </Link>
                    </li>
                    <li role="none">
                      <Link
                        href={subscriptionsHref}
                        onClick={() => setAccountOpen(false)}
                        role="menuitem"
                      >
                        {labels.wellness.actionCenter.subscriptionManage}
                      </Link>
                    </li>
                    <li role="none">
                      <Link href={settingsHref} onClick={() => setAccountOpen(false)} role="menuitem">
                        {labels.accountSettings}
                      </Link>
                    </li>
                    <li role="none">
                      <Link href={logoutHref} onClick={() => setAccountOpen(false)} prefetch="none" role="menuitem">
                        {labels.signOut}
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </header>

            <main className="mhd-main">
              <div className="mhd-container">
                {onboardingBannerHref ? (
                  <OnboardingBanner
                    href={onboardingBannerHref}
                    message="Finish setting up your Liivv wellness profile to personalize your dashboard."
                  />
                ) : null}
                <HealthDashboardMain
                  carePackHref={virtualCareCarePackHref}
                  chatHref={virtualCareChatHref}
                  consultingHref={virtualCareConsultingHref}
                  contactHref={contactHref}
                  hasUnreadChatMessage={hasUnreadChatMessage}
                  labels={labels}
                  nextSubscriptionDate={nextSubscriptionDate}
                  ordersHref={ordersHref}
                  pharmacyHref={virtualCarePharmacyHref}
                  shopHref={shopHref}
                  subscriptionsHref={subscriptionsHref}
                  wellnessSelectionHref={wellnessSelectionHref}
                />
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
