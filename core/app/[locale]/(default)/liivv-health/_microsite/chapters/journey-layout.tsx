/* Twin of ostomy-care/chapters/journey-layout.tsx @3b343c6e — port fixes both ways until Phase 2 */

'use client';

import { useId } from 'react';

import { ChapterReveal } from '../../ostomy-care/chapters/chapter-reveal';
import { CardSources } from '../_components/source-chip';
import { CardShop } from '../shop/card-shop';
import { useSiteT } from '../site-context';

import { AskChip } from './ask-chip';
import { CardExit, rowLayout, RowMore } from './chapter-disclosure';
import type { CategoryCard, Chapter } from './compose';
import { CardText } from './figure-parts';
import { CardFigures, CardRoutes, isPinnedCard, type KindSets, useKindSets } from './figures';
import { useJourneyMemoryOptional } from './journey-memory-context';

/*
 * Module entries stay figure-led and full-stage. Shelf stops are cinematic
 * frames: full-bleed media with a lower-third paper plate for copy. Which
 * figures keep an entry full-stage is the layout-only `journeyModule` set
 * (figures.tsx), the engine's plus the site's own.
 *
 * No Listen button: audio is off on every engine page so far. The shop band
 * (../shop/card-shop.tsx) follows the referral chip, as on Ostomy's journey
 * entries, wherever the site's merchandising record gives the card a shelf.
 */
function isModuleEntry(sets: KindSets, card: CategoryCard) {
  return (
    isPinnedCard(sets, card) ||
    Boolean(card.figures?.some((figure) => sets.journeyModule.has(figure.kind)))
  );
}

/*
 * Every card has one of these, so each is named for its card ("Bookmark: The
 * Rule of 15"), not only by its visible word. The name starts with that word,
 * so a voice command using it still reaches the button.
 */
function SaveStopButton({ number, title }: { number: number; title: string }) {
  const t = useSiteT('ui.chapter');
  const memory = useJourneyMemoryOptional();

  if (!memory) return null;

  const saved = memory.isSaved(number);

  return (
    <button
      aria-label={saved ? t('stopSavedFor', { title }) : t('saveStopFor', { title })}
      aria-pressed={saved}
      className={saved ? 'oc-journey-save is-saved' : 'oc-journey-save'}
      onClick={() => memory.toggleSave(number)}
      type="button"
    >
      {saved ? t('stopSaved') : t('saveStop')}
    </button>
  );
}

function JourneyEntry({ card, exit }: { card: CategoryCard; exit?: Chapter['urgentExit'] }) {
  const moreId = useId();
  const sets = useKindSets();
  const { lede, rest, noteOutside, noteInMore } = rowLayout(sets, card);
  const moduleEntry = isModuleEntry(sets, card);
  const showMedia = !moduleEntry && Boolean(card.image);

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
          <SaveStopButton number={card.number} title={card.title} />
        </div>
      </header>

      {lede ? (
        <p className="oc-ch-lede">
          <CardText card={card} text={lede} />
        </p>
      ) : null}

      <CardFigures card={card} exit={exit} />

      {noteOutside && card.note ? (
        <p className="oc-ch-row-note">
          <CardText card={card} text={card.note} />
        </p>
      ) : null}

      <RowMore card={card} id={moreId} noteInMore={noteInMore} rest={rest} />

      <CardRoutes card={card} />

      <CardExit card={card} exit={exit} />

      {/* Engine-only so far (owner note 1, 2026-10-07): Ostomy's twin shows no card sources. */}
      <CardSources card={card} />

      {card.ask ? (
        <div className="oc-journey-foot">
          <AskChip role={card.ask} />
        </div>
      ) : null}

      <CardShop card={card} />
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
      className={[
        'oc-journey-entry',
        moduleEntry ? 'is-module' : 'is-shelf is-frame',
        showMedia ? 'has-media' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      id={`card-${card.number}`}
    >
      {moduleEntry ? (
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
  exit,
}: {
  cards: Array<{ card: CategoryCard }>;
  exit?: Chapter['urgentExit'];
}) {
  const sets = useKindSets();

  return (
    <div className="oc-journey-stream-entries">
      {cards.map((item) => {
        const moduleEntry = isModuleEntry(sets, item.card);

        const entry = <JourneyEntry card={item.card} exit={exit} />;

        if (moduleEntry) {
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
