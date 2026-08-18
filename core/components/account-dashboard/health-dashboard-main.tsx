'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import { Link } from '~/components/link';
import { OpenLiveChatButton } from '~/components/virtual-care/live-chat-widget';
import type { PersonalizedCareLane } from '~/lib/account-dashboard/personalized-care';
import type { LiivPrimaryCategoryId } from '~/lib/onboarding/liiv-primary-health-category';
import type { HealthProfileRow } from '~/lib/supabase/health-profile';

import {
  IconCalendar,
  IconChevronRight,
  IconOrders,
  IconPrescription,
  IconSupplies,
  IconVideo,
} from './icons';
import { OliviaCompanionStage, type OliviaMascotMood } from './olivia-companion-stage';
import { OliviaSetupSheet, type OliviaSetupSheetKind } from './olivia-setup-sheet';
import { PersonalizedCareCanvas } from './personalized-care-canvas';
import type { AccountDashboardLabels } from './types';

export function HealthDashboardMain({
  labels,
  nextSubscriptionDate,
  ordersHref,
  subscriptionsHref,
  consultingHref,
  carePackHref,
  pharmacyHref,
  hasUnreadChatMessage,
  healthProfileComplete,
  healthCategoryLabels,
  insuranceComplete,
  insuranceProviderName,
  hasInsurance,
  celebrateOnMount = false,
  careLanes,
  todayLabel,
  healthProfileStepData,
}: {
  labels: AccountDashboardLabels;
  nextSubscriptionDate: string | null;
  ordersHref: string;
  subscriptionsHref: string;
  consultingHref: string;
  carePackHref: string;
  pharmacyHref: string;
  hasUnreadChatMessage: boolean;
  healthProfileComplete: boolean;
  healthCategoryLabels: string[];
  insuranceComplete: boolean;
  insuranceProviderName: string | null;
  hasInsurance: boolean | null;
  celebrateOnMount?: boolean;
  careLanes: PersonalizedCareLane[];
  todayLabel: string;
  healthProfileStepData: {
    initialCategories: LiivPrimaryCategoryId[];
    isOntario: boolean;
    initialHealthProfile: HealthProfileRow | null;
    supabaseReady: boolean;
  };
}) {
  const { wellness } = labels;
  const router = useRouter();
  const [sheet, setSheet] = useState<OliviaSetupSheetKind | null>(null);
  const [mood, setMood] = useState<OliviaMascotMood>(celebrateOnMount ? 'celebrate' : 'idle');
  const [activeLaneId, setActiveLaneId] = useState<string | null>(careLanes[0]?.id ?? null);
  const bounceTimer = useRef<number | null>(null);

  useEffect(() => {
    if (careLanes.some((lane) => lane.id === activeLaneId)) {
      return;
    }

    setActiveLaneId(careLanes[0]?.id ?? null);
  }, [activeLaneId, careLanes]);

  useEffect(() => {
    return () => {
      if (bounceTimer.current) {
        window.clearTimeout(bounceTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!celebrateOnMount) {
      return;
    }

    setMood('celebrate');
    const settle = window.setTimeout(() => {
      setMood('idle');
      router.replace('/account/dashboard/', { scroll: false });
    }, 1400);

    return () => window.clearTimeout(settle);
  }, [celebrateOnMount, router]);

  const openSheet = (kind: OliviaSetupSheetKind) => {
    if (bounceTimer.current) {
      window.clearTimeout(bounceTimer.current);
    }
    setSheet(kind);
    setMood('bounce');
    bounceTimer.current = window.setTimeout(() => {
      setMood(kind === 'health' ? 'looking-health' : 'looking-insurance');
    }, 520);
  };

  const closeSheet = () => {
    if (bounceTimer.current) {
      window.clearTimeout(bounceTimer.current);
      bounceTimer.current = null;
    }
    setSheet(null);
    setMood('idle');
  };

  const activeLane = careLanes.find((lane) => lane.id === activeLaneId) ?? careLanes[0];

  return (
    <div className="mhd-wellness">
      <PersonalizedCareCanvas
        activeLaneId={activeLaneId}
        companion={
          <OliviaCompanionStage
            hasInsurance={hasInsurance}
            healthCategoryLabels={healthCategoryLabels}
            healthComplete={healthProfileComplete}
            insuranceComplete={insuranceComplete}
            insuranceProviderName={insuranceProviderName}
            labels={wellness.olivia}
            layout="companion"
            mood={mood}
            onHotspotEnter={(side) => {
              if (sheet) return;
              setMood(side === 'health' ? 'looking-health' : 'looking-insurance');
            }}
            onHotspotLeave={() => {
              if (sheet) return;
              setMood('idle');
            }}
            onOpenHealth={() => openSheet('health')}
            onOpenInsurance={() => openSheet('insurance')}
            speechLines={activeLane?.oliviaLines}
          />
        }
        labels={wellness.care}
        lanes={careLanes}
        onEditProfile={() => openSheet('health')}
        onSelectLane={setActiveLaneId}
        todayLabel={todayLabel}
      />

      {sheet ? (
        <OliviaSetupSheet
          healthStepData={healthProfileStepData}
          kind={sheet}
          labels={wellness.olivia}
          onClose={closeSheet}
        />
      ) : null}

      <div className="mhd-bottom">
        <section aria-label={labels.aria.actionCenter} className="mhd-action-center">
          <ActionCard
            href={subscriptionsHref}
            icon={<IconCalendar />}
            kicker={wellness.actionCenter.subscriptionTitle}
            title={nextSubscriptionDate ?? wellness.actionCenter.subscriptionEmpty}
            variant="subscription"
          />
          <ActionCard
            href={ordersHref}
            hint={wellness.actionCenter.orderHistoryHint}
            icon={<IconOrders />}
            title={wellness.actionCenter.orderHistory}
            variant="orders"
          />
          <ActionCard
            href={carePackHref}
            hint={wellness.actionCenter.carePackHint}
            icon={<IconSupplies />}
            title={wellness.actionCenter.carePackTitle}
            variant="carepack"
          />
          <ActionCard
            href={pharmacyHref}
            hint={wellness.actionCenter.pharmacyHint}
            icon={<IconPrescription />}
            title={wellness.actionCenter.pharmacyTitle}
            variant="pharmacy"
          />
        </section>

        <section aria-label={wellness.virtualCare.title} className="mhd-virtual-care">
          <div className="mhd-virtual-care__header">
            <span aria-hidden className="mhd-virtual-care__icon">
              <IconVideo />
            </span>
            <div className="mhd-virtual-care__heading">
              <h2 className="mhd-virtual-care__title">{wellness.virtualCare.title}</h2>
              <p className="mhd-virtual-care__subtitle">{wellness.virtualCare.subtitle}</p>
            </div>
          </div>
          <VirtualCareLink
            hint={wellness.virtualCare.consultingHint}
            href={consultingHref}
            label={wellness.virtualCare.consulting}
          />
          <OpenLiveChatButton
            className={
              hasUnreadChatMessage
                ? 'mhd-unread-messages mhd-unread-messages--alert'
                : 'mhd-unread-messages'
            }
          >
            <div className="mhd-unread-messages__header">
              <p className="mhd-unread-messages__title">{wellness.virtualCare.unreadMessages}</p>
              <span
                aria-hidden
                className={
                  hasUnreadChatMessage
                    ? 'mhd-unread-messages__status is-unread'
                    : 'mhd-unread-messages__status'
                }
              />
            </div>
            <p className="mhd-unread-messages__body">
              {hasUnreadChatMessage
                ? wellness.virtualCare.hasNewMessage
                : wellness.virtualCare.noNewMessages}
            </p>
          </OpenLiveChatButton>
        </section>
      </div>
    </div>
  );
}

function ActionCard({
  href,
  variant,
  icon,
  kicker,
  title,
  hint,
}: {
  href: string;
  variant: 'subscription' | 'orders' | 'carepack' | 'pharmacy';
  icon: ReactNode;
  kicker?: string;
  title: string;
  hint?: string;
}) {
  return (
    <Link className={`mhd-action-card mhd-action-card--${variant}`} href={href}>
      <span aria-hidden className="mhd-action-card__icon">
        {icon}
      </span>
      <div className="mhd-action-card__content">
        {kicker ? <p className="mhd-action-card__kicker">{kicker}</p> : null}
        <p className={kicker ? 'mhd-action-card__value' : 'mhd-action-card__title'}>{title}</p>
        {hint ? <p className="mhd-action-card__hint">{hint}</p> : null}
      </div>
    </Link>
  );
}

function VirtualCareLink({
  href,
  label,
  hint,
}: {
  href: string;
  label: string;
  hint?: string;
}) {
  return (
    <Link className="mhd-virtual-card" href={href}>
      <span className="mhd-virtual-card__copy">
        <span className="mhd-virtual-card__label">{label}</span>
        {hint ? <span className="mhd-virtual-card__hint">{hint}</span> : null}
      </span>
      <span aria-hidden className="mhd-virtual-card__chevron">
        <IconChevronRight />
      </span>
    </Link>
  );
}
