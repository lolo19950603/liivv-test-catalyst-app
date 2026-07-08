'use client';

import { Link } from '~/components/link';

import {
  IconChevronRight,
  IconCrown,
  IconOrders,
  IconPrescription,
  IconSupplies,
} from './icons';
import type { AccountDashboardLabels, DashboardHeroTab } from './types';

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
  heroImageSrc,
  heroTabs,
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
  heroImageSrc: string;
  heroTabs: DashboardHeroTab[];
}) {
  const { wellness } = labels;

  return (
    <div className="mhd-wellness">
      <section aria-label={wellness.hero.title} className="mhd-hero">
        <div aria-hidden className="mhd-hero__rail">
          <span className="mhd-hero__rail-text">{wellness.hero.basedOnSelection}</span>
        </div>

        <div className="mhd-hero__main">
          <div className="mhd-hero__body">
            <p className="mhd-hero__eyebrow mhd-hero__eyebrow--mobile">
              {wellness.hero.basedOnSelection}
            </p>
            <div className="mhd-hero__intro">
              <h2 className="mhd-hero__title">{wellness.hero.title}</h2>
              <p className="mhd-hero__subtitle">{wellness.hero.subtitle}</p>
            </div>

            <div className="mhd-hero__cards">
              <article className="mhd-glass-card mhd-glass-card--tips">
                <h3 className="mhd-glass-card__title">{wellness.hero.dailyTips.title}</h3>
                <p className="mhd-glass-card__desc">{wellness.hero.dailyTips.description}</p>
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
              src={heroImageSrc}
              width={960}
            />
          </div>
        </div>

        <nav aria-label={labels.aria.wellnessCategories} className="mhd-hero__tabs">
          {heroTabs.map((tab) => (
            <Link
              aria-current={tab.active ? 'page' : undefined}
              className={tab.active ? 'mhd-hero-tab mhd-hero-tab--active' : 'mhd-hero-tab'}
              href={tab.href}
              key={tab.id}
            >
              <span className="mhd-hero-tab__label">{tab.label}</span>
            </Link>
          ))}
        </nav>
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
