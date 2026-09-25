'use client';

import { useTranslations } from 'next-intl';

import type { OcCatalogItem } from '../get-oc-catalog';

import type { CategoryCard, Chapter } from './chapters-data';
import type { FigureMeta } from './chapters-meta';
import { UrgentExit } from './figure-parts';
import { needsCardExit, NOTE_CARRYING_KINDS, restylesCard } from './figures';
import type { SupplyItem } from './get-supply-items';
import { GoBagBand, SupplyList } from './supply-list';

/*
 * Commerce, in its own band.
 *
 * Placement is declared in chapters-meta.ts, not decided here. The test a card
 * has to pass is about its COPY, not its topic: does anything on this card
 * argue against buying something?
 *
 * An earlier version asked the topic question instead, and put a $234 kit named
 * "Peristomal Skin Health & Infection Prevention" under the card that says
 * broken skin "needs an NSWOC to look at it — not a product recommendation from
 * the internet". Eight cards are deliberately empty:
 *
 *   Flat or convex                convexity is prescribed after an assessment
 *   Leaks and short wear time     its own note calls rings and pastes an
 *                                 assessment rather than a shopping decision
 *   Sore, itchy, or weeping skin  broken skin needs an NSWOC, not a product
 *   A bulge around the stoma      symptom card
 *   Hernias, lifting and core     belts have not been shown to prevent hernia
 *   Getting back to activity      it sits under that card, so a belt band here
 *                                 makes the recommendation that one withholds
 *   Children                      a failing seal is a call to the nurse
 *   Ballooning and gas            symptom card, and its first sentence says a
 *                                 wetted-out filter is normal rather than a
 *                                 fault — so a band of filtered pouches
 *                                 answered a sentence saying nothing needs an
 *                                 answer
 *
 * No card anywhere in the four chapters carries a product band today. The
 * second test, for a card that ever gets one back, is about the SHELF: three or
 * more manufacturers, or no band — see cards 4, 5, 10 and 17 in chapters-meta.ts.
 *
 * The band sits after the ask chip so the referral is the last clinical thing
 * said, and it carries its own disclosure rather than borrowing the page's.
 */
function ProductBand({
  ids,
  products,
}: {
  ids: number[];
  products: Record<number, OcCatalogItem>;
}) {
  const t = useTranslations('OstomyCare.ui.chapter');
  const items = ids
    .map((id) => products[id])
    .filter((item): item is OcCatalogItem => Boolean(item));

  if (!items.length) return null;

  return (
    <aside className="oc-ch-shop">
      <span className="oc-ch-shop-label">{t('productsLabel')}</span>
      <ul className="oc-ch-shop-list">
        {items.map((item) => (
          <li key={item.entityId}>
            <a className="oc-ch-shop-card" href={item.path}>
              {item.image ? (
                <img alt="" loading="lazy" src={item.image.src} />
              ) : (
                <span className="oc-ch-shop-blank" />
              )}
              <span className="oc-ch-shop-name">{item.name}</span>
              {item.priceLabel ? <span className="oc-ch-shop-price">{item.priceLabel}</span> : null}
            </a>
          </li>
        ))}
      </ul>
      <p className="oc-ch-shop-note">{t('productsNote')}</p>
    </aside>
  );
}

/*
 * The shop band, whatever shape it takes on this card.
 *
 * Three kinds, and a card can only have one: the supply list (C02), the go-bag
 * card's link back to it, or the plain product band above. The band is always
 * an aside with its own label and its own disclosure, so a reader can tell the
 * shop from the chapter without reading a word of it.
 *
 * Only the product band hides with the card's disclosure: a card carrying the
 * supply list or the go-bag link is pinned open, so there is nothing to hide
 * behind.
 */
export function CardShop({
  card,
  products,
  supplyItems,
  visible,
}: {
  card: CategoryCard;
  products: Record<number, OcCatalogItem>;
  supplyItems?: Promise<SupplyItem[]>;
  visible: boolean;
}) {
  const supply = card.figures?.find(
    (figure): figure is Extract<FigureMeta, { kind: 'supplyList' }> => figure.kind === 'supplyList',
  );

  if (supply) return <SupplyList card={card} figure={supply} supplyItems={supplyItems} />;

  if (card.figures?.some((figure) => figure.kind === 'goBag')) return <GoBagBand card={card} />;

  if (!card.productIds) return null;

  return (
    <div hidden={!visible}>
      <ProductBand ids={card.productIds} products={products} />
    </div>
  );
}

/*
 * The chapter's emergency signpost in a card's own body (needsCardExit in
 * figures.tsx). Two cards earn one: the supply-list card, whose band holds a
 * shopping tool, and a card whose signposting module this locale's review gate
 * dropped. Either way it sits above the foot — outside the shop band, never
 * beside something to buy, and where the module would have put it.
 */
export function CardExit({ card, exit }: { card: CategoryCard; exit?: Chapter['urgentExit'] }) {
  if (!exit || !needsCardExit(card)) return null;

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
 * card; see NOTE_CARRYING_KINDS).
 */
export function rowLayout(card: CategoryCard) {
  const restyled = restylesCard(card.figures);
  const carriesNote = Boolean(card.figures?.some((figure) => NOTE_CARRYING_KINDS.has(figure.kind)));
  const rest = restyled ? [] : (card.items?.slice(1) ?? []);
  const noteOutside = Boolean(card.note) && Boolean(card.noteVisible || (restyled && !carriesNote));

  return {
    lede: restyled ? undefined : card.items?.[0],
    rest,
    hidden: rest.length + (card.sections?.length ?? 0),
    noteOutside,
    noteInMore: Boolean(card.note) && !noteOutside && !carriesNote,
  };
}

/*
 * The rest of a card's sentences, sections, and note — always in the page.
 * Cards used to collapse this behind a "N more" toggle; every chapter now
 * keeps the full text visible.
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
  /** Kept so older call sites compile; content is always shown. */
  open?: boolean;
  onReveal?: (open: boolean) => void;
}) {
  if (!rest.length && !card.sections?.length && !noteInMore) return null;

  return (
    <div className="oc-ch-row-more" id={id}>
      {rest.length ? (
        <ul>
          {rest.map((item, i) => (
            <li key={`${i}-${item}`}>{item}</li>
          ))}
        </ul>
      ) : null}
      {card.sections?.map((section) => (
        <div className="oc-ch-subsection" key={section.heading}>
          <h4>{section.heading}</h4>
          <ul>
            {section.items.map((item, i) => (
              <li key={`${i}-${item}`}>{item}</li>
            ))}
          </ul>
          {section.note ? <p className="oc-ch-row-note">{section.note}</p> : null}
        </div>
      ))}
      {noteInMore ? <p className="oc-ch-row-note">{card.note}</p> : null}
    </div>
  );
}
