'use client';

import { useId } from 'react';

import type { OcCatalogItem } from '../get-oc-catalog';

import { AskChip } from './ask-chip';
import { CardExit, CardShop, RowMore, rowLayout } from './chapter-disclosure';
import { ChapterReveal } from './chapter-reveal';
import type { CategoryCard, Chapter } from './chapters-data';
import type { FigureMeta } from './chapters-meta';
import { CardFigures, CardRoutes, isPinnedCard } from './figures';
import type { SupplyItem } from './get-supply-items';

/*
 * Module entries stay figure-led and full-stage. Everything else is a Living
 * Trail shelf stone — photo band + paper leaf with organic drift.
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

function JourneyEntry({
  card,
  products,
  supplyItems,
  exit,
  flip,
  drift,
}: {
  card: CategoryCard;
  products: Record<number, OcCatalogItem>;
  supplyItems?: Promise<SupplyItem[]>;
  exit?: Chapter['urgentExit'];
  flip: boolean;
  drift: number;
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
      </div>
    </ChapterReveal>
  ) : null;

  return (
    <article
      className={[
        'oc-journey-entry',
        module ? 'is-module' : 'is-shelf is-stone',
        flip ? 'is-flip' : '',
        module ? '' : `is-drift-${drift}`,
      ]
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
  let shelfIndex = 0;

  return (
    <div className="oc-journey-stream-entries">
      {cards.map((item) => {
        const module = isModuleEntry(item.card);
        const flip = !module && shelfIndex % 2 === 1;
        const drift = module ? 0 : shelfIndex % 3;

        if (!module) shelfIndex += 1;

        const entry = (
          <JourneyEntry
            card={item.card}
            drift={drift}
            exit={exit}
            flip={flip}
            products={products}
            supplyItems={supplyItems}
          />
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
