'use client';

import { useEffect, useMemo, useState } from 'react';

import { Link } from '~/components/link';

import {
  ACCOUNT_DASHBOARD_ROOT_ID,
  ACCOUNT_DASHBOARD_STYLE,
} from './dashboard-styles';
import { IconBell, IconCart } from './icons';
import { DashboardPanelContent } from './panel-content';
import type { AccountDashboardProps, DashboardNavItem, DashboardPanelId } from './types';

const NAV_ITEMS: DashboardNavItem[] = [
  { id: 'main', label: '', icon: '◆' },
  { id: 'health-profile', label: '', icon: '♥' },
  { id: 'pharmacy', label: '', icon: '℞' },
  { id: 'insurance', label: '', icon: '▣' },
  { id: 'rewards', label: '', icon: '★' },
  { id: 'orders', label: '', icon: '↗' },
  { id: 'subscriptions', label: '', icon: '↻' },
];

export function AccountDashboardPortal({
  customerName,
  cartHref,
  ordersHref,
  logoutHref,
  labels,
}: AccountDashboardProps) {
  const [activePanel, setActivePanel] = useState<DashboardPanelId>('main');
  const [helpOpen, setHelpOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const navItems = useMemo(
    () =>
      NAV_ITEMS.map((item) => ({
        ...item,
        label: labels.nav[item.id],
      })),
    [labels.nav],
  );

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.classList.add('adc-portal-active');
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.classList.remove('adc-portal-active');
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ACCOUNT_DASHBOARD_STYLE }} />
      <div className="liivv-account-dashboard-root" id={ACCOUNT_DASHBOARD_ROOT_ID}>
        <header className="adc-topbar">
          <div className="adc-topbar__brand">
            <span className="adc-topbar__eyebrow">{labels.brandEyebrow}</span>
            <h1 className="adc-topbar__title">{labels.brandTitle}</h1>
          </div>
          <div className="adc-topbar__actions">
            <button
              aria-expanded={notificationsOpen}
              aria-label={labels.notifications}
              className="adc-icon-btn"
              onClick={() => setNotificationsOpen((open) => !open)}
              type="button"
            >
              <IconBell />
              <span className="adc-badge">3</span>
            </button>
            <Link aria-label={labels.cart} className="adc-icon-btn" href={cartHref}>
              <IconCart />
            </Link>
            <Link className="adc-sign-out" href={logoutHref} prefetch="none">
              {labels.signOut}
            </Link>
          </div>
        </header>

        <div className="adc-body">
          <nav aria-label="Account sections" className="adc-sidebar">
            {navItems.map((item) => (
              <NavButton
                active={activePanel === item.id}
                icon={item.icon}
                key={item.id}
                label={item.label}
                onSelect={() => setActivePanel(item.id)}
              />
            ))}
          </nav>

          <div className="adc-main">
            <nav aria-label="Account sections" className="adc-mobile-nav">
              {navItems.map((item) => (
                <NavButton
                  active={activePanel === item.id}
                  icon={item.icon}
                  key={item.id}
                  label={item.label}
                  onSelect={() => setActivePanel(item.id)}
                />
              ))}
            </nav>

            {notificationsOpen ? (
              <div className="adc-card" style={{ marginBottom: '1rem' }} role="status">
                <p className="adc-card__label">Notifications</p>
                <ul className="adc-list" style={{ marginTop: '0.75rem' }}>
                  <li className="adc-list-item">
                    <span>Prescription ready for pickup</span>
                    <span className="adc-pill">New</span>
                  </li>
                  <li className="adc-list-item">
                    <span>Subscription ships in 6 days</span>
                    <span className="adc-pill">Reminder</span>
                  </li>
                  <li className="adc-list-item">
                    <span>You earned 50 rewards points</span>
                    <span className="adc-pill">Rewards</span>
                  </li>
                </ul>
              </div>
            ) : null}

            {navItems.map((item) => (
              <section
                aria-hidden={activePanel !== item.id}
                className="adc-panel"
                data-active={activePanel === item.id}
                id={`adc-panel-${item.id}`}
                key={item.id}
              >
                <DashboardPanelContent
                  customerName={customerName}
                  labels={labels}
                  ordersHref={ordersHref}
                  panel={item.id}
                />
              </section>
            ))}
          </div>
        </div>

        <div className="adc-help">
          <div className="adc-help-panel" data-open={helpOpen}>
            <div className="adc-help-panel__head">{labels.needHelpTitle}</div>
            <div className="adc-help-panel__body">{labels.needHelpBody}</div>
          </div>
          <button
            aria-expanded={helpOpen}
            aria-label={labels.needHelpToggle}
            className="adc-help-toggle"
            onClick={() => setHelpOpen((open) => !open)}
            type="button"
          >
            ?
          </button>
        </div>
      </div>
    </>
  );
}

function NavButton({
  active,
  icon,
  label,
  onSelect,
}: {
  active: boolean;
  icon: string;
  label: string;
  onSelect: () => void;
}) {
  return (
    <button
      className="adc-nav-btn"
      data-active={active}
      onClick={onSelect}
      type="button"
    >
      <span aria-hidden className="adc-nav-btn__icon">
        {icon}
      </span>
      {label}
    </button>
  );
}
