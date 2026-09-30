'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import type { OcCatalogItem } from '../get-oc-catalog';

import type { CardShelf, ShopOffer } from './chapter-shop';
import { localeHref } from './chapters-data';

interface ResolvedOffer {
  key: string;
  kits: OcCatalogItem[];
  items: OcCatalogItem[];
  line?: string;
}

function resolveOffers(
  offers: ShopOffer[],
  products: Record<number, OcCatalogItem>,
): ResolvedOffer[] {
  return offers.flatMap((offer) => {
    const kits = (offer.kitIds ?? [])
      .map((id) => products[id])
      .filter((item): item is OcCatalogItem => Boolean(item));
    const items = offer.productIds
      .map((id) => products[id])
      .filter((item): item is OcCatalogItem => Boolean(item));

    if (!kits.length && !items.length) return [];

    const key = String(offer.kitIds?.[0] ?? items[0]?.entityId);

    return [{ key, kits, items, line: offer.line }];
  });
}

function ShopStripBody({
  nested,
  products,
  shelf,
}: {
  nested: boolean;
  products: Record<number, OcCatalogItem>;
  shelf: CardShelf;
}) {
  const t = useTranslations('OstomyCare.ui.chapter');
  const resolved = resolveOffers(shelf.offers, products);

  if (!resolved.length) return null;

  const single = shelf.kind === 'hero' || (shelf.kind === 'collection' && resolved.length === 1);
  const offer = resolved[0];
  let body: ReactNode;

  if (shelf.kind === 'reprise') {
    body = <Reprise offers={resolved} />;
  } else if (shelf.kind === 'products') {
    body = <ProductShelf items={resolved.flatMap((item) => item.items)} />;
  } else if (shelf.kind === 'spare') {
    body = <SpareShelf offers={resolved} />;
  } else if (single && offer) {
    body = (
      <HeroOffer
        items={offer.items}
        kits={offer.kits}
        line={shelf.kind === 'hero' ? undefined : offer.line}
        occasion={shelf.occasion}
      />
    );
  } else {
    body = <CollectionShelf offers={resolved} />;
  }

  const headline = single ? null : (
    <p className="oc-merch-occasion">{t(`shop.occasions.${shelf.occasion}`)}</p>
  );

  return (
    <aside
      className={['oc-merch', shelf.kind === 'reprise' ? 'is-reprise' : '', nested ? 'is-nested' : '']
        .filter(Boolean)
        .join(' ')}
    >
      {nested ? null : <p className="oc-merch-kicker">{t('shop.label')}</p>}
      {headline}
      {body}
      <p className="oc-merch-note">
        {t(shelf.kind === 'products' ? 'shop.noteProducts' : 'productsNote')}
      </p>
    </aside>
  );
}

/*
 * One offer, large. Several kits that share a product list are sizes of that
 * offer. `nested` is the supply list, which already has its own shop label.
 */
export function ShopStrip({
  nested = false,
  products,
  shelf,
}: {
  nested?: boolean;
  products: Record<number, OcCatalogItem>;
  shelf: CardShelf;
}) {
  return <ShopStripBody nested={nested} products={products} shelf={shelf} />;
}

function HeroOffer({
  items,
  kits,
  line,
  occasion,
}: {
  items: OcCatalogItem[];
  kits: OcCatalogItem[];
  line?: string;
  occasion: string;
}) {
  const t = useTranslations('OstomyCare.ui.chapter');
  const lead = kits[0];

  if (!lead && !items.length) return null;

  return (
    <>
      <div className="oc-merch-hero">
        {lead ? <Photo item={lead} linked={kits.length === 1} /> : null}
        <div className="oc-merch-copy">
          <p className="oc-merch-occasion">{t(`shop.occasions.${occasion}`)}</p>
          {line ? <p className="oc-merch-dek">{t(`shop.offers.${line}`)}</p> : null}
          {lead ? <p className="oc-merch-title">{offerTitle(t, kits, line)}</p> : null}
          {kits.length > 1 ? <SizeLinks kits={kits} /> : lead ? <SingleKit kit={lead} /> : null}
        </div>
      </div>
      {items.length ? <ProductRail items={items} /> : null}
    </>
  );
}

function CollectionShelf({ offers }: { offers: ResolvedOffer[] }) {
  return (
    <div className="oc-merch-offers">
      {offers.map((offer) => (
        <OfferCard key={offer.key} offer={offer} />
      ))}
    </div>
  );
}

function OfferCard({ offer }: { offer: ResolvedOffer }) {
  const t = useTranslations('OstomyCare.ui.chapter');
  const lead = offer.kits[0];

  return (
    <article className="oc-merch-offer">
      {lead ? <Photo item={lead} linked={offer.kits.length === 1} /> : null}
      <div className="oc-merch-copy">
        {offer.line ? <p className="oc-merch-dek">{t(`shop.offers.${offer.line}`)}</p> : null}
        {lead ? <p className="oc-merch-title">{offerTitle(t, offer.kits, offer.line)}</p> : null}
        {offer.kits.length > 1 ? (
          <SizeLinks kits={offer.kits} />
        ) : lead ? (
          <SingleKit kit={lead} />
        ) : null}
        {offer.items.length ? <ProductRail items={offer.items} /> : null}
      </div>
    </article>
  );
}

function SpareShelf({ offers }: { offers: ResolvedOffer[] }) {
  return (
    <div className="oc-merch-offers">
      {offers.map((offer) => (
        <OfferCard key={offer.key} offer={{ ...offer, items: [] }} />
      ))}
    </div>
  );
}

function ProductShelf({ items }: { items: OcCatalogItem[] }) {
  if (!items.length) return null;

  return <ProductRail featured items={items} />;
}

function Reprise({ offers }: { offers: ResolvedOffer[] }) {
  const kits = offers.flatMap((offer) => offer.kits);

  if (!kits.length) return null;

  return (
    <ul className="oc-merch-lines">
      {kits.map((kit) => (
        <li className="oc-merch-line" key={kit.entityId}>
          <KitLine kit={kit} />
        </li>
      ))}
    </ul>
  );
}

function SingleKit({ kit }: { kit: OcCatalogItem }) {
  const t = useTranslations('OstomyCare.ui.chapter');

  return (
    <>
      {kit.priceLabel ? <p className="oc-merch-price">{kit.priceLabel}</p> : null}
      <Cta item={kit} label={t('shop.openKit')} />
    </>
  );
}

function SizeLinks({ kits }: { kits: OcCatalogItem[] }) {
  const t = useTranslations('OstomyCare.ui.chapter');

  return (
    <div className="oc-merch-sizes">
      <p className="oc-merch-sizes-label">{t('shop.sizesLabel')}</p>
      <div className="oc-merch-size-row">
        {kits.map((kit) => (
          <SizeLink key={kit.entityId} kit={kit} />
        ))}
      </div>
    </div>
  );
}

function SizeLink({ kit }: { kit: OcCatalogItem }) {
  const locale = useLocale();
  const t = useTranslations('OstomyCare.ui.chapter');
  const sizeKey = `shop.kitSizes.${kit.entityId}`;
  const size = t.has(sizeKey) ? t(sizeKey) : shortName(t, kit);

  return (
    <a
      aria-label={kit.priceLabel ? `${kit.name}, ${kit.priceLabel}` : kit.name}
      className="oc-merch-size"
      href={localeHref(kit.path, locale)}
    >
      <strong>{size}</strong>
      {kit.priceLabel ? <span>{kit.priceLabel}</span> : null}
    </a>
  );
}

function KitLine({ kit }: { kit: OcCatalogItem }) {
  const locale = useLocale();
  const t = useTranslations('OstomyCare.ui.chapter');

  return (
    <a
      aria-label={kit.priceLabel ? `${kit.name}, ${kit.priceLabel}` : kit.name}
      href={localeHref(kit.path, locale)}
    >
      <span className="oc-merch-line-name">{shortName(t, kit)}</span>
      {kit.priceLabel ? <span className="oc-merch-price">{kit.priceLabel}</span> : null}
      <span className="oc-merch-line-cta">{t('shop.openKit')}</span>
    </a>
  );
}

function Photo({ item, linked = true }: { item: OcCatalogItem; linked?: boolean }) {
  const locale = useLocale();
  const image = item.image ? (
    <img alt="" loading="lazy" src={item.image.src} />
  ) : (
    <span className="oc-merch-blank" />
  );

  if (!linked) return <div className="oc-merch-photo">{image}</div>;

  return (
    <a aria-label={item.name} className="oc-merch-photo" href={localeHref(item.path, locale)}>
      {image}
    </a>
  );
}

function Cta({ item, label }: { item: OcCatalogItem; label: string }) {
  const locale = useLocale();

  return (
    <a aria-label={`${label}, ${item.name}`} className="oc-merch-cta" href={localeHref(item.path, locale)}>
      {label}
    </a>
  );
}

function ProductRail({ featured = false, items }: { featured?: boolean; items: OcCatalogItem[] }) {
  const locale = useLocale();
  const t = useTranslations('OstomyCare.ui.chapter');

  return (
    <div className={featured ? 'oc-merch-rail is-featured' : 'oc-merch-rail'}>
      {featured ? null : <p className="oc-merch-rail-label">{t('shop.alsoSold')}</p>}
      <ul className="oc-merch-products">
        {items.map((item) => (
          <li key={item.entityId}>
            <a
              aria-label={item.priceLabel ? `${item.name}, ${item.priceLabel}` : item.name}
              href={localeHref(item.path, locale)}
            >
              {item.image ? (
                <img alt="" loading="lazy" src={item.image.src} />
              ) : (
                <span className="oc-merch-blank" />
              )}
              <span className="oc-merch-name">{shortName(t, item)}</span>
              {item.priceLabel ? <span className="oc-merch-price">{item.priceLabel}</span> : null}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function offerTitle(
  t: ReturnType<typeof useTranslations<'OstomyCare.ui.chapter'>>,
  kits: OcCatalogItem[],
  line?: string,
) {
  const lead = kits[0];

  if (!lead) return '';

  if (kits.length > 1 && line === 'newImage') return t('shop.families.newImage');

  return shortName(t, lead);
}

function shortName(
  t: ReturnType<typeof useTranslations<'OstomyCare.ui.chapter'>>,
  item: OcCatalogItem,
) {
  const key = `shop.names.${item.entityId}`;

  return t.has(key) ? t(key) : item.name;
}
