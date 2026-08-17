'use client';

import { Link } from '~/components/link';
import type { PersonalizedCareLane } from '~/lib/account-dashboard/personalized-care';
import type { ReactNode } from 'react';

type CareLabels = {
  switcherLabel: string;
  todayFocus: string;
  comingSoon: string;
  comingSoonBody: string;
  emptyTitle: string;
  emptyBody: string;
  emptyCta: string;
};

export function PersonalizedCareCanvas({
  lanes,
  activeLaneId,
  todayLabel,
  labels,
  companion,
  onSelectLane,
  onEditProfile,
}: {
  lanes: PersonalizedCareLane[];
  activeLaneId: string | null;
  todayLabel: string;
  labels: CareLabels;
  companion: ReactNode;
  onSelectLane: (id: string) => void;
  onEditProfile: () => void;
}) {
  const activeLane = lanes.find((lane) => lane.id === activeLaneId) ?? lanes[0] ?? null;

  if (!activeLane) {
    return (
      <section aria-label={labels.switcherLabel} className="mhd-care-canvas">
        <article className="mhd-care-focus mhd-care-focus--empty" data-tone="sage">
          {companion}
          <div className="mhd-care-focus__copy">
            <p className="mhd-care-focus__eyebrow">{labels.todayFocus}</p>
            <h2 className="mhd-care-focus__title">{labels.emptyTitle}</h2>
            <p className="mhd-care-focus__lead">{labels.emptyBody}</p>
            <div className="mhd-care-focus__actions">
              <button className="mhd-care-btn mhd-care-btn--primary" onClick={onEditProfile} type="button">
                {labels.emptyCta}
              </button>
            </div>
          </div>
        </article>
      </section>
    );
  }

  return (
    <section aria-label={labels.switcherLabel} className="mhd-care-canvas">
      {lanes.length > 1 ? (
        <div className="mhd-care-switcher" role="tablist">
          {lanes.map((lane) => {
            const selected = lane.id === activeLane.id;

            return (
              <button
                aria-selected={selected}
                className={selected ? 'mhd-care-switcher__tab is-active' : 'mhd-care-switcher__tab'}
                key={lane.id}
                onClick={() => onSelectLane(lane.id)}
                role="tab"
                type="button"
              >
                {lane.label}
              </button>
            );
          })}
        </div>
      ) : null}

      <article
        className="mhd-care-focus"
        data-status={activeLane.status}
        data-tone={activeLane.tone}
        key={activeLane.id}
      >
        {companion}

        <div className="mhd-care-focus__copy">
          <div className="mhd-care-focus__meta">
            <p className="mhd-care-focus__eyebrow">{labels.todayFocus}</p>
            <p className="mhd-care-focus__date">{todayLabel}</p>
          </div>
          <div className="mhd-care-focus__heading-row">
            <h2 className="mhd-care-focus__title">{activeLane.headline}</h2>
            {activeLane.status === 'coming_soon' ? (
              <span className="mhd-care-badge">{labels.comingSoon}</span>
            ) : null}
          </div>
          <p className="mhd-care-focus__lead">{activeLane.lead}</p>
          {activeLane.status === 'coming_soon' ? (
            <p className="mhd-care-focus__soon">{labels.comingSoonBody}</p>
          ) : (
            <p className="mhd-care-focus__tip">{activeLane.tipBody}</p>
          )}

          <div className="mhd-care-focus__actions">
            {activeLane.actions.map((action) => (
              <Link
                className={
                  action.kind === 'primary' ? 'mhd-care-btn mhd-care-btn--primary' : 'mhd-care-btn mhd-care-btn--ghost'
                }
                href={action.href}
                key={action.id}
              >
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </article>
    </section>
  );
}
