'use client';

/*
 * =============================================================================
 * RECOVERY MAP (C03) — Chapter 01, after the cards
 * =============================================================================
 * The first eight weeks, and after, sorted by lane so a reader can see that
 * different things settle on different clocks and that most dates belong to
 * the team. It replaces the three-card programs band in the same slot.
 *
 * Everything is in the server HTML: the emergency signpost, the stages as an
 * ordered list, each stage's lanes as a description list, one "Sources for this
 * stage" disclosure per stage, and the ask chip. The signpost comes first and
 * sits outside the filter, so no control can hide it.
 *
 * "My ostomy" is a separate island loaded after hydration
 * (recovery-map-filter.tsx). It only hides lines tagged for other ostomy types,
 * with hidden="until-found" so find-in-page still reaches them. Lines for
 * everyone never hide, nothing reorders, and the choice never leaves the page.
 * No surgery date, countdown, "you are here" marker or progress.
 *
 * Words come from `chapters.<slug>.recoveryMap` and `ui.chapter.recoveryMap`;
 * stages, lanes, types and sources come from chapters-meta.ts.
 * =============================================================================
 */

import dynamic from 'next/dynamic';
import { useLocale, useTranslations } from 'next-intl';
import { useRef } from 'react';

import { AskChip } from './ask-chip';
import { ChapterReveal } from './chapter-reveal';
import type {
  AskRole,
  Chapter,
  RecoveryMap as RecoveryMapData,
  ResolvedSource,
} from './chapters-data';
import { FrDraftMarker, UrgentExit } from './figure-parts';

type Stage = RecoveryMapData['stages'][number];

/* The chip's referral role. A constant because a literal `role` reads as an ARIA role. */
const ASK: AskRole = 'nswoc';

const Filter = dynamic(() => import('./recovery-map-filter').then((mod) => mod.RecoveryMapFilter), {
  ssr: false,
});

/* A same-tab link to a source, naming its language where it differs from the page. */
function SourceLink({ source }: { source: ResolvedSource }) {
  const t = useTranslations('OstomyCare.ui.chapter.recoveryMap');
  const locale = useLocale();
  const label =
    source.hrefLang === locale ? source.label : `${source.label} ${t('inOtherLanguage')}`;

  return (
    <a href={source.href} hrefLang={source.hrefLang}>
      <span lang={source.labelLang === locale ? undefined : source.labelLang}>{label}</span>
    </a>
  );
}

function RecoveryStage({ stage }: { stage: Stage }) {
  const t = useTranslations('OstomyCare.ui.chapter.recoveryMap');

  return (
    <li className={`oc-ch-recovery-stage is-${stage.anchor}`}>
      <h3>
        {stage.heading}
        {stage.qualifier ? <small> {stage.qualifier}</small> : null}
      </h3>
      <dl className="oc-ch-recovery-lanes">
        {stage.lanes.map((lane) => (
          <div className="oc-ch-recovery-lane" key={lane.lane}>
            <dt>{t(`lanes.${lane.lane}`)}</dt>
            {lane.items.map((item, index) => (
              <dd data-types={item.types?.join(' ')} key={`${index}-${item.text}`}>
                {item.types?.map((type) => (
                  <span className="oc-ch-recovery-type" key={type}>
                    {t(`types.${type}`)}
                  </span>
                ))}
                {item.types ? ' ' : null}
                {item.text}
              </dd>
            ))}
          </div>
        ))}
      </dl>
      <p className="oc-ch-recovery-empty" data-oc-recovery-empty="" hidden>
        {t('empty')}
      </p>
      <details className="oc-ch-recovery-sources">
        {/*
         * Every stage carries one of these, so the visible words alone would
         * give seven controls the same accessible name. The stage heading is
         * appended for assistive technology only: on screen the heading is
         * already directly above.
         */}
        <summary>
          {t('sources')}
          <span className="sr-only"> — {stage.heading}</span>
        </summary>
        <ul>
          {stage.sources.map((source) => (
            <li key={source.id}>
              <SourceLink source={source} />
            </li>
          ))}
        </ul>
      </details>
    </li>
  );
}

export function RecoveryMap({ exit, map }: { exit?: Chapter['urgentExit']; map: RecoveryMapData }) {
  const t = useTranslations('OstomyCare.ui.chapter');
  const rootRef = useRef<HTMLDivElement>(null);

  return (
    <section
      aria-labelledby="recovery-map-heading"
      className="oc-ch-recovery rounded-top"
      id="recovery-map"
    >
      <div className="oc-ch-wrap" ref={rootRef}>
        {exit ? <UrgentExit exit={exit} /> : null}
        <FrDraftMarker gate="recoveryMap" />
        <header className="oc-ch-care-head oc-journey-meadow-head">
          <ChapterReveal variant="clearing">
            <span className="oc-ch-eyebrow">{t('softMap')}</span>
            <h2 id="recovery-map-heading">{map.heading}</h2>
          </ChapterReveal>
          <p>{map.intro}</p>
        </header>

        <Filter root={rootRef} />

        <ol className="oc-ch-recovery-stages">
          {map.stages.map((stage, index) => (
            <RecoveryStage key={`${index}-${stage.heading}`} stage={stage} />
          ))}
        </ol>

        <div className="oc-ch-recovery-foot">
          <AskChip role={ASK} />
        </div>
      </div>
    </section>
  );
}
