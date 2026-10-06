/* Twin of ostomy-care/chapters/chapter-disclosure.tsx @3b343c6e — port fixes both ways until Phase 2 */

'use client';

import type { CategoryCard, Chapter } from './compose';
import { CardText, UrgentExit } from './figure-parts';
import { type KindSets, needsCardExit, restylesCard, useKindSets } from './figures';

/*
 * Where a card's words go, and the signpost a card prints for itself.
 *
 * Ostomy's file also holds CardShop, the commerce band under the teaching.
 * The engine's is ../shop/card-shop.tsx, driven by the site's merchandising
 * record (SiteConfig.shop); Ostomy's supply list and go-bag band stay with
 * Ostomy.
 */

/*
 * The chapter's emergency signpost in a card's own body (needsCardExit in
 * figures.tsx): a card whose signposting module this locale's review gate
 * dropped, or one carrying a module the site has the row signpost. It sits
 * above the foot, where the module would have put it.
 */
export function CardExit({ card, exit }: { card: CategoryCard; exit?: Chapter['urgentExit'] }) {
  const sets = useKindSets();

  if (!exit || !needsCardExit(sets, card)) return null;

  return <UrgentExit exit={exit} />;
}

/*
 * Where a card's words go.
 *
 * A figure that restyles the card carries the card's own item sentences, so the
 * plain list is not repeated and there is nothing left to collapse. Otherwise
 * the first bullet is the lede and the rest collapse; a card built from sections
 * has no single lede, so it collapses whole. The closing note sits outside the
 * collapsible region when the meta asks for it, or when a restyle figure has
 * taken the list — except where a figure carries the note itself (the take-in
 * card; see `noteCarrying` in figures.tsx).
 *
 * A figure in the site's `wholeCard` set draws the card's sections and its note
 * itself, wherever the meta keeps the note, so the row prints neither. Without
 * that figure (a review gate dropped it) the card is laid out as any other.
 */
export function rowLayout(sets: KindSets, card: CategoryCard) {
  const wholeCard = carriesWholeCard(sets, card);
  const restyled = restylesCard(sets, card.figures);
  const carriesNote = Boolean(card.figures?.some((figure) => sets.noteCarrying.has(figure.kind)));
  const rest = restyled ? [] : (card.items?.slice(1) ?? []);
  const noteOutside =
    !wholeCard && Boolean(card.note) && Boolean(card.noteVisible || (restyled && !carriesNote));

  return {
    lede: restyled ? undefined : card.items?.[0],
    rest,
    hidden: rest.length + (wholeCard ? 0 : (card.sections?.length ?? 0)),
    noteOutside,
    noteInMore: Boolean(card.note) && !noteOutside && !carriesNote && !wholeCard,
  };
}

/* A figure on the card draws its sections and note itself (`wholeCard` in figures.tsx). */
function carriesWholeCard(sets: KindSets, card: Pick<CategoryCard, 'figures'>) {
  return Boolean(card.figures?.some((figure) => sets.wholeCard.has(figure.kind)));
}

/*
 * The rest of a card's sentences, sections, and note — always in the page.
 * Cards used to collapse this behind a "N more" toggle; every chapter now
 * keeps the full text visible. Sections a `wholeCard` figure draws are left to it.
 */
export function RowMore({
  card,
  id,
  rest,
  noteInMore,
}: {
  card: CategoryCard;
  id: string;
  rest: string[];
  noteInMore: boolean;
}) {
  const sets = useKindSets();
  const sections = carriesWholeCard(sets, card) ? [] : (card.sections ?? []);

  if (!rest.length && !sections.length && !noteInMore) return null;

  return (
    <div className="oc-ch-row-more" id={id}>
      {rest.length ? (
        <ul>
          {rest.map((item, i) => (
            <li key={`${i}-${item}`}>
              <CardText card={card} text={item} />
            </li>
          ))}
        </ul>
      ) : null}
      {sections.map((section) => (
        <div className="oc-ch-subsection" key={section.heading}>
          <h4>{section.heading}</h4>
          <ul>
            {section.items.map((item, i) => (
              <li key={`${i}-${item}`}>
                <CardText card={card} text={item} />
              </li>
            ))}
          </ul>
          {section.note ? (
            <p className="oc-ch-row-note">
              <CardText card={card} text={section.note} />
            </p>
          ) : null}
        </div>
      ))}
      {noteInMore && card.note ? (
        <p className="oc-ch-row-note">
          <CardText card={card} text={card.note} />
        </p>
      ) : null}
    </div>
  );
}
