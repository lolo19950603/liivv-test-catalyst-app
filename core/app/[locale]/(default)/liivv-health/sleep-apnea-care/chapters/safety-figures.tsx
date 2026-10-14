'use client';

/*
 * =============================================================================
 * DRIVING & STAYING SAFE — WHAT'S CHECKED, BY LICENCE CLASS (card 3)
 * =============================================================================
 * The card's own seven sentences, sorted into three tabs: every licence class
 * (the default), private licences and commercial licences. Each tab lists its
 * sentences in the meta's order (the "In BC" line last on the first tab) with
 * that tab's own source chips under it, so a reader sees which rule comes
 * from the national standard and which from the CTS/CSS paper.
 *
 * Under every tab, fixed and never collapsible: the "licensing measures, not
 * health targets" strip (nurse ruling R5) and "your licensing authority makes
 * the decision". No number entry, no "am I fit to drive?" result, no score
 * and no traffic-light colours. The open tab lives in component state only.
 *
 * Before hydration and with JavaScript off, every tab's sentences are in the
 * page one under the other, each under its tab's name, with its chips: the
 * plain lists. Print puts all three back in order, whichever tab is open.
 * It restyles the card (`kinds.restyle` in ./site.ts): every sentence the card
 * has is on a tab, so the plain list is not repeated under it.
 *
 * The railway tab is held out of tree (02 H15, R9): there is no fourth tab.
 * =============================================================================
 */

import { type KeyboardEvent, useEffect, useId, useRef, useState } from 'react';

import { SourceChip } from '../../_microsite/_components/source-chip';
import type { CategoryCard } from '../../_microsite/chapters/compose';
import { CardItem, FrDraftMarker } from '../../_microsite/chapters/figure-parts';
import { useSiteSources } from '../../_microsite/site-context';
import { lookUpSources } from '../../_microsite/sources';

import type { FigureMeta } from './chapters-meta';
import { entry, text } from './figure-words';

type LicenceClasses = Extract<FigureMeta, { kind: 'licenceClasses' }>;
type LicenceTabMeta = LicenceClasses['tabs'][number];

/* One tab's sentences and chips. */
function TabBody({ card, tab, label }: { card: CategoryCard; tab: LicenceTabMeta; label: string }) {
  const map = useSiteSources();

  return (
    <>
      <ul className="sa-fig-tab-items">
        {tab.items.map((item) => (
          <li key={item}>
            <CardItem card={card} item={item} />
          </li>
        ))}
      </ul>
      {map ? (
        <SourceChip
          className="sa-fig-chip"
          label={`${card.title} — ${label}`}
          sources={lookUpSources(map, tab.sources)}
        />
      ) : null}
    </>
  );
}

/* The roving tab index: arrows move along the row, Home and End jump to its ends. */
function nextIndex(key: string, current: number, total: number) {
  if (key === 'ArrowRight' || key === 'ArrowDown') return (current + 1) % total;
  if (key === 'ArrowLeft' || key === 'ArrowUp') return (current - 1 + total) % total;
  if (key === 'Home') return 0;
  if (key === 'End') return total - 1;

  return undefined;
}

export function LicenceClassesFigure({
  card,
  figure,
}: {
  card: CategoryCard;
  figure: LicenceClasses;
}) {
  const baseId = useId();
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const words = card.figureWords;
  const tabWords = entry(words, 'tabs');
  const measureNote = text(words, 'measureNote');
  const decides = text(words, 'decides');
  const tabs = figure.tabs.map((tab) => ({ tab, label: text(entry(tabWords, tab.key), 'label') }));

  useEffect(() => setReady(true), []);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const next = nextIndex(event.key, open, tabs.length);

    if (next === undefined) return;

    event.preventDefault();
    setOpen(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className="sa-fig-tabs">
      <FrDraftMarker gate="licenceClasses" />

      {ready ? (
        <div aria-label={card.title} className="sa-fig-tablist" role="tablist">
          {tabs.map(({ tab, label }, index) => (
            <button
              aria-controls={`${baseId}-panel-${tab.key}`}
              aria-selected={index === open}
              className={index === open ? 'sa-fig-tab is-on' : 'sa-fig-tab'}
              id={`${baseId}-tab-${tab.key}`}
              key={tab.key}
              onClick={() => setOpen(index)}
              onKeyDown={onKeyDown}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              role="tab"
              tabIndex={index === open ? 0 : -1}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}

      {tabs.map(({ tab, label }, index) => (
        <section
          aria-labelledby={ready ? `${baseId}-tab-${tab.key}` : undefined}
          className="sa-fig-tab-panel"
          hidden={ready && index !== open}
          id={`${baseId}-panel-${tab.key}`}
          key={tab.key}
          role={ready ? 'tabpanel' : undefined}
          tabIndex={ready ? 0 : undefined}
        >
          {/* The tab's name over its list: the plain layout, and every printed sheet. */}
          <h4 className={ready ? 'sa-fig-tab-heading is-print' : 'sa-fig-tab-heading'}>{label}</h4>
          <TabBody card={card} label={label} tab={tab} />
        </section>
      ))}

      {measureNote ? <p className="sa-fig-strip">{measureNote}</p> : null}
      {decides ? <p className="oc-fig-detail sa-fig-decides">{decides}</p> : null}
    </div>
  );
}
