'use client';

import type { ReactNode } from 'react';

import type { AccountDashboardLabels } from './types';
import {
  IconAppointment,
  IconMetric,
  IconPrescription,
  IllustrationAppointments,
  IllustrationPrescriptions,
} from './icons';

function greetingPrefix(hour: number): 'morning' | 'afternoon' | 'evening' {
  if (hour < 12) {
    return 'morning';
  }

  if (hour < 17) {
    return 'afternoon';
  }

  return 'evening';
}

export function HealthDashboardMain({
  labels,
}: {
  customerName: string;
  labels: AccountDashboardLabels;
}) {
  const timeKey = greetingPrefix(new Date().getHours());
  const greeting = labels.healthCenter.greeting[timeKey];

  return (
    <div className="mhd-grid">
      <div className="mhd-greeting">
        <div>
          <h1 className="mhd-greeting__title">{greeting}</h1>
          <p className="mhd-greeting__lead">{labels.healthCenter.welcomeLead}</p>
        </div>
      </div>

      <div className="mhd-cards">
        <article className="mhd-service-card">
          <div className="mhd-service-card__inner">
            <div className="mhd-service-card__head">
              <h2 className="mhd-service-card__title">{labels.healthCenter.prescriptions.title}</h2>
            </div>
            <div className="mhd-empty">
              <div className="mhd-empty__body">
                <div className="mhd-empty__art">
                  <IllustrationPrescriptions />
                </div>
                <div className="mhd-empty__text">
                  <p className="mhd-empty__heading">{labels.healthCenter.prescriptions.heading}</p>
                  <p className="mhd-empty__desc">{labels.healthCenter.prescriptions.description}</p>
                </div>
              </div>
              <div className="mhd-empty__actions">
                <button className="mhd-btn-primary button" type="button">
                  <span aria-hidden className="btn-fill" data-fill />
                  <span className="btn-text">{labels.healthCenter.prescriptions.cta}</span>
                </button>
              </div>
            </div>
          </div>
        </article>

        <article className="mhd-service-card">
          <div className="mhd-service-card__inner">
            <div className="mhd-service-card__head">
              <h2 className="mhd-service-card__title">{labels.healthCenter.appointments.title}</h2>
            </div>
            <div className="mhd-empty">
              <div className="mhd-empty__body">
                <div className="mhd-empty__art">
                  <IllustrationAppointments />
                </div>
                <div className="mhd-empty__text">
                  <p className="mhd-empty__heading">{labels.healthCenter.appointments.heading}</p>
                  <p className="mhd-empty__desc">{labels.healthCenter.appointments.description}</p>
                </div>
              </div>
              <div className="mhd-empty__actions">
                <button className="mhd-btn-primary mhd-btn-primary--block button" type="button">
                  <span aria-hidden className="btn-fill" data-fill />
                  <span className="btn-text">{labels.healthCenter.appointments.cta}</span>
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>

      <section aria-label={labels.healthCenter.quickLinksTitle} className="mhd-quick-links">
        <h2 className="mhd-quick-links__title">{labels.healthCenter.quickLinksTitle}</h2>
        <div className="mhd-quick-links__grid">
          <QuickLinkCard
            description={labels.healthCenter.quickLinks.prescriptions.description}
            icon={<IconPrescription />}
            title={labels.healthCenter.quickLinks.prescriptions.title}
          />
          <QuickLinkCard
            description={labels.healthCenter.quickLinks.appointments.description}
            icon={<IconAppointment />}
            title={labels.healthCenter.quickLinks.appointments.title}
          />
          <QuickLinkCard
            description={labels.healthCenter.quickLinks.metrics.description}
            icon={<IconMetric />}
            title={labels.healthCenter.quickLinks.metrics.title}
          />
        </div>
      </section>
    </div>
  );
}

function QuickLinkCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <button className="mhd-quick-card" type="button">
      <div className="mhd-quick-card__content">
        <div className="mhd-quick-card__row">
          <div className="mhd-quick-card__thumb">{icon}</div>
          <div>
            <p className="mhd-quick-card__title">{title}</p>
            <p className="mhd-quick-card__desc">{description}</p>
          </div>
        </div>
      </div>
      <span aria-hidden className="mhd-quick-card__chevron">
        <svg fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
          <path d="M9.29 6.71a1 1 0 0 1 1.41 0L14.59 12l-3.89 3.88a1 1 0 0 1-1.41-1.41L12.17 12 9.29 9.12a1 1 0 0 1 0-1.41Z" />
        </svg>
      </span>
    </button>
  );
}
