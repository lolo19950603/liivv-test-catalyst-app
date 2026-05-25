'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { Link } from '~/components/link';
import { initShopifyButtonFillHover } from '~/lib/archived-pages/init-shopify-button-fill-hover';

import {
  ACCOUNT_DASHBOARD_ROOT_ID,
  ACCOUNT_DASHBOARD_STYLE,
} from './dashboard-styles';
import { HealthDashboardMain } from './health-dashboard-main';
import {
  IconAppointment,
  IconBell,
  IconCart,
  IconChevronDown,
  IconMetric,
  IconPrescription,
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
  logoutHref,
  labels,
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

  /** Sweep-fill hover (top → bottom on enter, exits bottom on leave) shared with rich-text-lower CTA. */
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
        <header className="mhd-header">
          <div className="mhd-header__top">
            <Link aria-label="Liivv" className="mhd-logo" href="/">
              <img
                alt="Liivv"
                className="mhd-logo__img"
                height={40}
                src="https://storage.googleapis.com/s.mkswft.com/RmlsZTo4NWQ4MGJiNi03MDZjLTQ4MWEtOGFmNi1kNDI2ZjBlNDYwOTQ=/Liivv_Favicon.png"
                width={40}
              />
            </Link>

            <nav aria-label="Featured services" className="mhd-header__services">
              <FeaturedServiceLink icon={<IconPrescription />} label={labels.featuredNav.prescriptions} />
              <FeaturedServiceLink icon={<IconAppointment />} label={labels.featuredNav.appointments} />
              <FeaturedServiceLink icon={<IconMetric />} label={labels.featuredNav.metrics} />
            </nav>

            <div className="mhd-header__account">
              <button
                aria-expanded={false}
                aria-label={labels.notifications}
                className="mhd-icon-btn"
                type="button"
              >
                <IconBell />
                <span className="mhd-badge">3</span>
              </button>
              <Link aria-label={labels.cart} className="mhd-icon-btn" href={cartHref}>
                <IconCart />
              </Link>

              <div className="mhd-account-wrap" ref={accountRef}>
                <button
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                  className="mhd-account-btn"
                  onClick={() => setAccountOpen((open) => !open)}
                  type="button"
                >
                  <span aria-hidden className="mhd-avatar">
                    {avatarInitials}
                  </span>
                  {labels.myAccount}
                  <IconChevronDown className="mhd-chevron" />
                </button>
                <ul className="mhd-account-menu" hidden={!accountOpen} role="menu">
                  <li role="none">
                    <Link href="/account/settings/" onClick={() => setAccountOpen(false)} role="menuitem">
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
          </div>

          <nav aria-label="Main navigation" className="mhd-mega-nav">
            <ul className="mhd-mega-nav__list" role="list">
              {labels.megaNav.map((item) => (
                <li className="mhd-mega-nav__item" key={item}>
                  <button className="mhd-mega-nav__btn mhd-btn-fill" type="button">
                    <span data-text>
                      {item}
                      <IconChevronDown />
                    </span>
                    <span aria-hidden className="mhd-btn-fill__dup">
                      {item}
                      <IconChevronDown />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <main className="mhd-main">
          <div className="mhd-container">
            <HealthDashboardMain customerName={customerName} labels={labels} />
          </div>
        </main>
      </div>
    </>
  );
}

function FeaturedServiceLink({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <button className="mhd-service-link" type="button">
      <span aria-hidden className="mhd-service-link__icon">
        {icon}
      </span>
      <span className="mhd-service-link__label">{label}</span>
    </button>
  );
}
