'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { Link } from '~/components/link';

import {
  IconChevronRight,
  IconCrown,
  IconOrders,
  IconPrescription,
  IconSupplies,
} from './icons';
import type { AccountDashboardLabels, DashboardHeroPanel, DashboardHeroTab } from './types';

const FLIP_DURATION_MS = 520;

type FlipDirection = 'forward' | 'backward';

export function HealthDashboardMain({
  labels,
  nextSubscriptionDate,
  ordersHref,
  subscriptionsHref,
  shopHref,
  consultingHref,
  carePackHref,
  pharmacyHref,
  chatHref,
  hasUnreadChatMessage,
  heroPanels,
  heroTabs,
  initialPanelId,
}: {
  labels: AccountDashboardLabels;
  nextSubscriptionDate: string | null;
  ordersHref: string;
  subscriptionsHref: string;
  shopHref: string;
  consultingHref: string;
  carePackHref: string;
  pharmacyHref: string;
  chatHref: string;
  hasUnreadChatMessage: boolean;
  heroPanels: DashboardHeroPanel[];
  heroTabs: DashboardHeroTab[];
  initialPanelId?: string;
}) {
  const { wellness } = labels;
  const defaultPanelId = initialPanelId ?? heroPanels[0]?.id ?? null;
  const [activePanelId, setActivePanelId] = useState(defaultPanelId);
  const [exitingPanelId, setExitingPanelId] = useState<string | null>(null);
  const [flipDirection, setFlipDirection] = useState<FlipDirection>('forward');
  const [isFlipping, setIsFlipping] = useState(false);
  const flipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const categoryTabIds = heroTabs.filter((tab) => tab.kind === 'category').map((tab) => tab.id);

  const clearFlipTimer = useCallback(() => {
    if (flipTimerRef.current) {
      clearTimeout(flipTimerRef.current);
      flipTimerRef.current = null;
    }
  }, []);

  useEffect(() => clearFlipTimer, [clearFlipTimer]);

  const selectCategory = (tabId: string) => {
    if (tabId === activePanelId || isFlipping || !heroPanels.some((panel) => panel.id === tabId)) {
      return;
    }

    const currentIndex = categoryTabIds.indexOf(activePanelId ?? '');
    const nextIndex = categoryTabIds.indexOf(tabId);
    setFlipDirection(nextIndex > currentIndex ? 'forward' : 'backward');
    setExitingPanelId(activePanelId);
    setActivePanelId(tabId);
    setIsFlipping(true);
    clearFlipTimer();
    flipTimerRef.current = setTimeout(() => {
      setExitingPanelId(null);
      setIsFlipping(false);
      flipTimerRef.current = null;
    }, FLIP_DURATION_MS);
  };

  const isTabActive = (tab: DashboardHeroTab) =>
    tab.kind === 'category' ? tab.id === activePanelId : tab.active;

  const renderHeroPanel = (panel: DashboardHeroPanel, motionState: 'static' | 'exit' | 'enter') => (
    <div
      className={[
        'mhd-hero-flip__page',
        motionState === 'static' ? 'mhd-hero-flip__page--static' : '',
        motionState === 'exit' ? `mhd-hero-flip__page--out-${flipDirection}` : '',
        motionState === 'enter' ? `mhd-hero-flip__page--in-${flipDirection}` : '',
      ]
        .filter(Boolean)
        .join(' ')}
      key={panel.id}
    >
      <div className="mhd-hero__body">
        <div className="mhd-hero__intro">
          <h2 className="mhd-hero__title">{panel.title}</h2>
          <p className="mhd-hero__subtitle">{panel.subtitle}</p>
        </div>

        <div className="mhd-hero__cards">
          <article className="mhd-glass-card mhd-glass-card--tips">
            <h3 className="mhd-glass-card__title">{panel.dailyTips.title}</h3>
            <p className="mhd-glass-card__desc">{panel.dailyTips.description}</p>
          </article>
          <Link className="mhd-glass-card mhd-glass-card--link" href={shopHref}>
            <div className="mhd-glass-card__icon">
              <IconSupplies />
            </div>
            <div>
              <h3 className="mhd-glass-card__title">{wellness.hero.yourSupplies.title}</h3>
              <p className="mhd-glass-card__desc">{wellness.hero.yourSupplies.description}</p>
            </div>
          </Link>
          <Link className="mhd-glass-card mhd-glass-card--link" href={consultingHref}>
            <div className="mhd-glass-card__icon">
              <IconPrescription />
            </div>
            <div>
              <h3 className="mhd-glass-card__title">{wellness.hero.exploreMore}</h3>
            </div>
          </Link>
        </div>
      </div>

      <div className="mhd-hero__media">
        <img
          alt=""
          className="mhd-hero__image"
          height={480}
          loading="lazy"
          src={panel.heroImageSrc}
          width={960}
        />
      </div>
    </div>
  );

  const activePanel = heroPanels.find((panel) => panel.id === activePanelId);
  const exitingPanel = exitingPanelId
    ? heroPanels.find((panel) => panel.id === exitingPanelId)
    : null;

  return (
    <div className="mhd-wellness">
      <section aria-label={wellness.hero.title} className="mhd-hero">
        <div className="mhd-hero__header">
          <p className="mhd-hero__eyebrow">{wellness.hero.basedOnSelection}</p>
          <nav aria-label={labels.aria.wellnessCategories} className="mhd-hero__tabs">
            {heroTabs.map((tab) => {
              const active = isTabActive(tab);

              if (tab.kind === 'category') {
                return (
                  <button
                    aria-pressed={active}
                    className={active ? 'mhd-hero-tab mhd-hero-tab--active' : 'mhd-hero-tab'}
                    disabled={isFlipping}
                    key={tab.id}
                    onClick={() => selectCategory(tab.id)}
                    type="button"
                  >
                    {tab.label}
                  </button>
                );
              }

              return (
                <Link
                  aria-current={active ? 'page' : undefined}
                  className={active ? 'mhd-hero-tab mhd-hero-tab--active' : 'mhd-hero-tab'}
                  href={tab.href ?? '#'}
                  key={tab.id}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className={`mhd-hero__main mhd-hero-flip${isFlipping ? ' mhd-hero-flip--active' : ''}`}>
          {isFlipping && exitingPanel ? renderHeroPanel(exitingPanel, 'exit') : null}
          {activePanel
            ? renderHeroPanel(activePanel, isFlipping ? 'enter' : 'static')
            : null}
        </div>
      </section>

      <div className="mhd-bottom">
        <section aria-label={labels.aria.actionCenter} className="mhd-action-center">
          <Link className="mhd-action-card mhd-action-card--subscription" href={subscriptionsHref}>
            <div className="mhd-action-card__icon">
              <IconCrown />
            </div>
            <div className="mhd-action-card__content">
              <p className="mhd-action-card__label">{wellness.actionCenter.subscriptionTitle}</p>
              <p className="mhd-action-card__value">
                {nextSubscriptionDate ?? wellness.actionCenter.subscriptionEmpty}
              </p>
              <span className="mhd-action-card__link">{wellness.actionCenter.subscriptionManage}</span>
            </div>
          </Link>

          <Link className="mhd-action-card mhd-action-card--orders" href={ordersHref}>
            <div className="mhd-action-card__icon">
              <IconOrders />
            </div>
            <p className="mhd-action-card__label mhd-action-card__label--bottom">
              {wellness.actionCenter.orderHistory}
            </p>
          </Link>
        </section>

        <section aria-label={wellness.virtualCare.title} className="mhd-virtual-care">
          <h2 className="mhd-virtual-care__title">{wellness.virtualCare.title}</h2>
          <div className="mhd-virtual-care__grid">
            <VirtualCareLink href={consultingHref} label={wellness.virtualCare.consulting} wide />
            <VirtualCareLink href={carePackHref} label={wellness.virtualCare.carePack} />
            <VirtualCareLink href={pharmacyHref} label={wellness.virtualCare.pharmacy} />
          </div>
          <article className="mhd-unread-messages">
            <div className="mhd-unread-messages__header">
              <h3 className="mhd-unread-messages__title">{wellness.virtualCare.unreadMessages}</h3>
            </div>
            <p className="mhd-unread-messages__body">
              {hasUnreadChatMessage
                ? wellness.virtualCare.hasNewMessage
                : wellness.virtualCare.noNewMessages}
            </p>
            <Link className="mhd-unread-messages__link" href={chatHref}>
              {wellness.virtualCare.openInbox}
            </Link>
          </article>
        </section>
      </div>
    </div>
  );
}

function VirtualCareLink({
  href,
  label,
  wide = false,
}: {
  href: string;
  label: string;
  wide?: boolean;
}) {
  return (
    <Link
      className={
        wide
          ? 'mhd-virtual-card mhd-virtual-card--wide'
          : 'mhd-virtual-card'
      }
      href={href}
    >
      <span className="mhd-virtual-card__label">{label}</span>
      <span aria-hidden className="mhd-virtual-card__chevron">
        <IconChevronRight />
      </span>
    </Link>
  );
}
