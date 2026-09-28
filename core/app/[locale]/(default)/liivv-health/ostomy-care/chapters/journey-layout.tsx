'use client';

import { useId } from 'react';
import { useTranslations } from 'next-intl';

import type { OcCatalogItem } from '../get-oc-catalog';

import { AskChip } from './ask-chip';
import { ListenStopButton } from './chapter-audio-player';
import { CardExit, CardShop, RowMore, rowLayout } from './chapter-disclosure';
import { ChapterReveal } from './chapter-reveal';
import type { CategoryCard, Chapter } from './chapters-data';
import type { FigureMeta } from './chapters-meta';
import { CardFigures, CardRoutes, isPinnedCard } from './figures';
import type { SupplyItem } from './get-supply-items';
import { useJourneyMemoryOptional } from './journey-memory-context';

/*
 * Module entries stay figure-led and full-stage. Shelf stops are cinematic
 * frames: full-bleed media with a lower-third paper plate for copy.
 */
const MODULE_KINDS: ReadonlySet<FigureMeta['kind']> = new Set([
  'bowelReference',
  'crisis',
  'lanes',
  'criteria',
]);

function isModuleEntry(card: CategoryCard) {
  return isPinnedCard(card) || Boolean(card.figures?.some((figure) => MODULE_KINDS.has(figure.kind)));
}

function SaveStopButton({ number }: { number: number }) {
  const t = useTranslations('OstomyCare.ui.chapter');
  const memory = useJourneyMemoryOptional();

  if (!memory) return null;

  const saved = memory.isSaved(number);

  return (
    <button
      aria-pressed={saved}
      className={saved ? 'oc-journey-save is-saved' : 'oc-journey-save'}
      onClick={() => memory.toggleSave(number)}
      type="button"
    >
      {saved ? t('stopSaved') : t('saveStop')}
    </button>
  );
}

function JourneyEntry({
  card,
  products,
  supplyItems,
  exit,
}: {
  card: CategoryCard;
  products: Record<number, OcCatalogItem>;
  supplyItems?: Promise<SupplyItem[]>;
  exit?: Chapter['urgentExit'];
}) {
  const moreId = useId();
  const { lede, rest, noteOutside, noteInMore } = rowLayout(card);
  const module = isModuleEntry(card);
  const showMedia = !module && Boolean(card.image);

  const body = (
    <div className="oc-journey-entry-copy">
      <header className="oc-journey-entry-head">
        <span aria-hidden className="oc-journey-num">
          {String(card.number).padStart(2, '0')}
        </span>
        <h3>
          {card.title}
          {card.badge ? ` · ${card.badge}` : ''}
        </h3>
        <div className="oc-journey-entry-actions">
          <ListenStopButton stop={card.number} title={card.title} />
          <SaveStopButton number={card.number} />
        </div>
      </header>

      {lede ? <p className="oc-ch-lede">{lede}</p> : null}

      <CardFigures card={card} exit={exit} />

      {noteOutside ? <p className="oc-ch-row-note">{card.note}</p> : null}

      <RowMore card={card} id={moreId} noteInMore={noteInMore} rest={rest} />

      <CardRoutes card={card} />

      <CardExit card={card} exit={exit} />

      {card.ask ? (
        <div className="oc-journey-foot">
          <AskChip role={card.ask} />
        </div>
      ) : null}

      <CardShop card={card} products={products} supplyItems={supplyItems} visible />
    </div>
  );

  const media = showMedia ? (
    <ChapterReveal variant="media">
      <div aria-hidden className="oc-journey-entry-media">
        <img alt="" loading="lazy" src={card.image} />
        <span className="oc-journey-frame-veil" />
      </div>
    </ChapterReveal>
  ) : null;

  return (
    <article
      className={['oc-journey-entry', module ? 'is-module' : 'is-shelf is-frame', showMedia ? 'has-media' : '']
        .filter(Boolean)
        .join(' ')}
      id={`card-${card.number}`}
    >
      {module ? (
        body
      ) : (
        <>
          {media}
          {body}
        </>
      )}
    </article>
  );
}

export function JourneyGrid({
  cards,
  products,
  supplyItems,
  exit,
}: {
  cards: { card: CategoryCard }[];
  products: Record<number, OcCatalogItem>;
  supplyItems?: Promise<SupplyItem[]>;
  exit?: Chapter['urgentExit'];
}) {
  return (
    <div className="oc-journey-stream-entries">
      {cards.map((item) => {
        const module = isModuleEntry(item.card);

        const entry = (
          <JourneyEntry card={item.card} exit={exit} products={products} supplyItems={supplyItems} />
        );

        if (module) {
          return (
            <div className="oc-journey-entry-wrap" key={item.card.title}>
              {entry}
            </div>
          );
        }

        return (
          <ChapterReveal key={item.card.title} variant="stone">
            {entry}
          </ChapterReveal>
        );
      })}
    </div>
  );
}
