/* Twin of ostomy-care/chapters/shop-strip.tsx @3b343c6e — port fixes both ways until Phase 2 */

'use client';

/*
 * =============================================================================
 * A SHOP STRIP — products under a card, on a path page or on a funding page
 * =============================================================================
 * Ostomy's shop strip, cut down to what a care site needs where it does not
 * sell bundles: one shelf is a heading line (`occasion`), one or more offers
 * of a few products each, an optional link to a whole shop category, the
 * notices the site's product pages carry, and a short note that says this is
 * the shop and not the chapter.
 *
 * Each product is a card: photo, name, price and one button. The button adds
 * the product in one click only where the catalogue says there is nothing to
 * choose (`oneClick`, ./get-placement-items.ts). Otherwise it is a "Choose
 * options" link to the product page, so a reader is never shown an add that
 * the cart would refuse.
 *
 * Products the catalogue left out (hidden, unavailable, out of stock, or
 * refused for their description) are simply not here; an offer with none left
 * goes, and a shelf with nothing left renders nothing, notices included.
 *
 * Words: `ui.chapter.shop` (fixed keys through useSiteT; the site's own
 * occasions and offer lines read from its message tree, as the chapter page
 * reads its ordinal words) and `ui.commerce` for the notices, the same words
 * the product pages print.
 * =============================================================================
 */

import { useLocale } from 'next-intl';
import { useActionState, useEffect } from 'react';

import { useMiniCart } from '~/components/mini-cart/mini-cart-context';
import { useRouter } from '~/i18n/routing';

import { localeHref } from '../chapters/hrefs';
import { useSiteMessages, useSiteT } from '../site-context';

import type { CardShelf } from './shelves';
import { useShop } from './shop-context';
import type { PlacementAddState, PlacementItem, PlacementItems } from './types';

import './shop-strip.css';

interface ResolvedOffer {
  key: string;
  items: PlacementItem[];
  line?: string;
}

function resolveOffers(shelf: CardShelf, items: PlacementItems): ResolvedOffer[] {
  return shelf.offers.flatMap((offer) => {
    const found = offer.productIds.flatMap((id) => {
      const item = items[id];

      return item ? [item] : [];
    });

    const first = found[0];

    if (!first) return [];

    return [{ key: `${offer.line ?? 'offer'}-${first.entityId}`, items: found, line: offer.line }];
  });
}

/* The site's own words for this shelf, by key, from its message tree. */
function useShelfWords() {
  const shop = useSiteMessages().ui.chapter.shop;
  const occasions: Record<string, string | undefined> = shop.occasions;
  const offers: Record<string, string | undefined> = shop.offers;

  return { occasions, offers };
}

export function ShopStrip({ shelf }: { shelf: CardShelf }) {
  const shop = useShop();
  const locale = useLocale();
  const t = useSiteT('ui.chapter');
  const commerce = useSiteT('ui.commerce');
  const words = useShelfWords();

  if (!shop) return null;

  const offers = resolveOffers(shelf, shop.items);
  const collection =
    shelf.collection &&
    (!shelf.collection.locales || shelf.collection.locales.some((l) => l === locale))
      ? shelf.collection
      : undefined;
  const collectionLabel = collection ? words.offers[collection.label] : undefined;

  if (!offers.length && !collectionLabel) return null;

  const occasion = words.occasions[shelf.occasion];
  /* The shelf's own notices, then the link's, each once, in that order. */
  const notices = [
    ...new Set([
      ...(shelf.notices ?? []),
      ...(collection && collectionLabel ? (collection.notices ?? []) : []),
    ]),
  ];

  /* One offer sits on the strip itself; several share the offers grid. */
  const blocks = offers.map((offer) => (
    <OfferBlock
      key={offer.key}
      line={offer.line ? words.offers[offer.line] : undefined}
      offer={offer}
    />
  ));

  return (
    <aside aria-label={t('shop.label')} className="oc-merch">
      {occasion ? <p className="oc-merch-occasion">{occasion}</p> : null}
      {offers.length > 1 ? <div className="oc-merch-offers">{blocks}</div> : blocks}
      {collection && collectionLabel ? (
        <p className="oc-merch-collection">
          <a className="oc-merch-cta is-quiet" href={localeHref(collection.href, locale)}>
            {collectionLabel}
          </a>
        </p>
      ) : null}
      {notices.length ? (
        <div className="oc-merch-notice">
          {notices.map((key) => (
            <p key={key}>{commerce(key)}</p>
          ))}
        </div>
      ) : null}
      <p className="oc-merch-note">{t('shop.note')}</p>
    </aside>
  );
}

/*
 * A shelf as a page section of its own, between two sections of a path page
 * or the funding page. The section is left out entirely when the shelf has
 * nothing to show, so the page never carries an empty band.
 */
export function ShopBand({ shelf, id }: { shelf: CardShelf; id: string }) {
  const shop = useShop();
  const locale = useLocale();

  if (!shop) return null;

  const anyItem = shelf.offers.some((offer) => offer.productIds.some((pid) => shop.items[pid]));
  const anyCollection = Boolean(
    shelf.collection &&
      (!shelf.collection.locales || shelf.collection.locales.some((l) => l === locale)),
  );

  if (!anyItem && !anyCollection) return null;

  return (
    <section className="oc-ch-programs rounded-top oc-merch-band" id={id}>
      <div className="oc-ch-wrap">
        <ShopStrip shelf={shelf} />
      </div>
    </section>
  );
}

const CARD_LAYOUT: Record<number, string> = { 1: 'is-single', 3: 'is-trio' };

function OfferBlock({ offer, line }: { offer: ResolvedOffer; line?: string }) {
  const layout = CARD_LAYOUT[offer.items.length] ?? '';

  return (
    <article className="oc-merch-offer">
      {line ? <p className="oc-merch-dek">{line}</p> : null}
      <ul className={['oc-merch-cards', layout].filter(Boolean).join(' ')}>
        {offer.items.map((item) => (
          <ChoiceCard item={item} key={item.entityId} />
        ))}
      </ul>
    </article>
  );
}

function ChoiceCard({ item }: { item: PlacementItem }) {
  const t = useSiteT('ui.chapter');
  const locale = useLocale();
  /* The catalogue path without the trailing slash that costs a redirect, as on the landing. */
  const href = localeHref(item.path.replace(/(.)\/$/, '$1'), locale);

  return (
    <li className="oc-merch-card">
      <a aria-hidden="true" className="oc-merch-card-photo" href={href} tabIndex={-1}>
        {item.image ? (
          <img alt="" loading="lazy" src={item.image.src} />
        ) : (
          <span className="oc-merch-blank" />
        )}
      </a>
      <div className="oc-merch-card-body">
        <a className="oc-merch-name" href={href}>
          {item.name}
        </a>
        {item.priceLabel ? <p className="oc-merch-price">{item.priceLabel}</p> : null}
        {item.oneClick ? (
          <AddButton item={item} />
        ) : (
          <a
            aria-label={t('shop.chooseOptionsFor', { name: item.name })}
            className="oc-merch-cta is-quiet"
            href={href}
          >
            {t('shop.chooseOptions')}
          </a>
        )}
      </div>
    </li>
  );
}

function AddButton({ item }: { item: PlacementItem }) {
  const t = useSiteT('ui.chapter');
  const shop = useShop();
  const router = useRouter();
  const { openMiniCart } = useMiniCart();
  const action = shop?.add ?? refuse;
  const [state, formAction, pending] = useActionState<PlacementAddState, FormData>(action, {
    status: 'idle',
  });

  useEffect(() => {
    if (state.status !== 'added') return;

    router.refresh();
    openMiniCart();
  }, [openMiniCart, router, state]);

  return (
    <form action={formAction}>
      <input name="productEntityId" type="hidden" value={item.entityId} />
      <button
        aria-label={t('shop.addFor', { name: item.name })}
        className="oc-merch-cta"
        disabled={pending}
        type="submit"
      >
        {pending ? t('shop.adding') : t('shop.add')}
      </button>
      <p className="oc-merch-add-status" role="status">
        {state.status === 'added' ? t('shop.added') : null}
        {state.status === 'error' ? t('shop.addError') : null}
      </p>
    </form>
  );
}

/* No provider, no cart: the button cannot be drawn without one, but the hook needs an action. */
function refuse(): Promise<PlacementAddState> {
  return Promise.resolve({ status: 'error' });
}
