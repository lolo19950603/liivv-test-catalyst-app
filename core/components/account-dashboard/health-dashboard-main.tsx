'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Link } from '~/components/link';
import { OpenLiveChatButton } from '~/components/virtual-care/live-chat-widget';
import type { PersonalizedCareLane } from '~/lib/account-dashboard/personalized-care';
import type { LiivPrimaryCategoryId } from '~/lib/onboarding/liiv-primary-health-category';
import type { HealthProfileRow } from '~/lib/supabase/health-profile';

import { IconChevronRight, IconCrown, IconOrders } from './icons';
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
            speechOverride={activeLane?.oliviaLine}
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
            <OpenLiveChatButton className="mhd-unread-messages__link">
              {wellness.virtualCare.openInbox}
            </OpenLiveChatButton>
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
      className={wide ? 'mhd-virtual-card mhd-virtual-card--wide' : 'mhd-virtual-card'}
      href={href}
    >
      <span className="mhd-virtual-card__label">{label}</span>
      <span aria-hidden className="mhd-virtual-card__chevron">
        <IconChevronRight />
      </span>
    </Link>
  );
}
