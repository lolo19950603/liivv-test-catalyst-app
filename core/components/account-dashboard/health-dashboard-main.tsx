'use client';

import { Link } from '~/components/link';

import {
  IconChevronRight,
  IconCrown,
  IconOrders,
  IconPrescription,
  IconSupplies,
} from './icons';
import type { AccountDashboardLabels } from './types';

export function HealthDashboardMain({
  labels,
  nextSubscriptionDate,
  ordersHref,
  subscriptionsHref,
  shopHref,
  contactHref,
}: {
  labels: AccountDashboardLabels;
  nextSubscriptionDate: string | null;
  ordersHref: string;
  subscriptionsHref: string;
  shopHref: string;
  contactHref: string;
}) {
  const { wellness } = labels;

  return (
    <div className="mhd-wellness">
      <section aria-label={wellness.hero.title} className="mhd-hero">
        <div className="mhd-hero__media">
          <img
            alt=""
            className="mhd-hero__image"
            height={480}
            src="/archive/images/dashboard-prescriptions.png"
            width={960}
          />
          <div className="mhd-hero__overlay" />
        </div>

        <div className="mhd-hero__body">
          <div className="mhd-hero__intro">
            <p className="mhd-hero__eyebrow">{wellness.hero.basedOnSelection}</p>
            <h2 className="mhd-hero__title">{wellness.hero.title}</h2>
            <p className="mhd-hero__subtitle">{wellness.hero.subtitle}</p>
          </div>

          <div className="mhd-hero__cards">
            <article className="mhd-glass-card">
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
            <Link className="mhd-glass-card mhd-glass-card--link" href={contactHref}>
              <div className="mhd-glass-card__icon">
                <IconPrescription />
              </div>
              <div>
                <h3 className="mhd-glass-card__title">{wellness.hero.exploreMore}</h3>
              </div>
            </Link>
          </div>
        </div>

        <div aria-label="Wellness categories" className="mhd-hero__tabs" role="tablist">
          <Link className="mhd-hero-tab" href="/shop-all" role="tab">
            {wellness.hero.tabs.diabetes}
          </Link>
          <Link className="mhd-hero-tab" href="/shop-all" role="tab">
            {wellness.hero.tabs.sleepRest}
          </Link>
          <Link className="mhd-hero-tab mhd-hero-tab--active" href="/account/settings/" role="tab">
            {wellness.hero.tabs.changeSelection}
          </Link>
        </div>
      </section>

      <div className="mhd-bottom">
        <section aria-label="Action center" className="mhd-action-center">
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
            <VirtualCareLink href={contactHref} label={wellness.virtualCare.consulting} wide />
            <VirtualCareLink href={shopHref} label={wellness.virtualCare.carePack} />
            <VirtualCareLink href={subscriptionsHref} label={wellness.virtualCare.pharmacy} />
          </div>
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
