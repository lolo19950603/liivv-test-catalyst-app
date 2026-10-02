'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useActionState, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import { useMiniCart } from '~/components/mini-cart/mini-cart-context';

import type { OcCatalogItem } from '../get-oc-catalog';

import { addChapterBundleToCart, type ChapterAddState } from './_actions/add-chapter-bundle';
import {
  cartBundlesForIds,
  cartBundlesForProduct,
  type ChapterCartBundle,
} from './chapter-cart';
import type { CardShelf, ShopOccasion, ShopOffer, ShopOfferLine } from './chapter-shop';
import { localeHref } from './chapters-data';

interface ResolvedOffer {
  key: string;
  kits: OcCatalogItem[];
  items: OcCatalogItem[];
  line?: ShopOfferLine;
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
    body = <ProductShelf offers={resolved} />;
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
  const hasKits = shelf.offers.some((offer) => (offer.kitIds?.length ?? 0) > 0);
  const hasProducts = shelf.offers.some((offer) => offer.productIds.length > 0);
  let noteKey: 'shop.noteMixed' | 'shop.noteKit' | 'shop.noteProducts' = 'shop.noteProducts';

  if (hasKits && hasProducts) noteKey = 'shop.noteMixed';
  else if (hasKits) noteKey = 'shop.noteKit';

  return (
    <aside
      className={['oc-merch', shelf.kind === 'reprise' ? 'is-reprise' : '', nested ? 'is-nested' : '']
        .filter(Boolean)
        .join(' ')}
    >
      {headline}
      {body}
      <p className="oc-merch-note">{t(noteKey)}</p>
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
  line?: ShopOfferLine;
  occasion: ShopOccasion;
}) {
  const t = useTranslations('OstomyCare.ui.chapter');
  const lead = kits[0] ?? items[0];
  const companions = kits.length ? items : items.filter((item) => item.entityId !== lead?.entityId);

  if (!lead) return null;

  if (!kits.length && items.length > 1) {
    return (
      <div className="oc-merch-hero is-products">
        <p className="oc-merch-occasion">{t(`shop.occasions.${occasion}`)}</p>
        {line ? <p className="oc-merch-dek">{t(`shop.offers.${line}`)}</p> : null}
        <ProductTiles items={items} />
        <BundleButtons bundles={cartBundlesForIds(items.map((item) => item.entityId))} />
      </div>
    );
  }

  return (
    <>
      <div className={lead.image ? 'oc-merch-hero' : 'oc-merch-hero is-copy'}>
        {lead.image ? <Photo item={lead} linked={kits.length <= 1} /> : null}
        <div className="oc-merch-copy">
          <p className="oc-merch-occasion">{t(`shop.occasions.${occasion}`)}</p>
          {line ? <p className="oc-merch-dek">{t(`shop.offers.${line}`)}</p> : null}
          <p className="oc-merch-title">{kits.length ? offerTitle(t, kits, line) : shortName(t, lead)}</p>
          {kits.length > 1 ? <SizeLinks kits={kits} /> : kits.length === 1 ? <SingleKit kit={kits[0]!} /> : null}
          {!kits.length && lead.priceLabel ? <p className="oc-merch-price">{lead.priceLabel}</p> : null}
          <div className="oc-merch-actions">
            {kits.length === 1 ? <Cta item={kits[0]!} label={t('shop.openKit')} /> : null}
            {!kits.length && items.length === 1 ? <Cta item={lead} label={t('shop.view')} /> : null}
            <BundleButtons
              bundles={cartBundlesForIds((kits.length ? kits : [lead]).map((item) => item.entityId))}
            />
          </div>
        </div>
      </div>
      {companions.length ? <ProductRail items={companions} /> : null}
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
  const tiles = offer.kits.length ? offer.kits : offer.items;
  const bundles = cartBundlesForIds(tiles.map((item) => item.entityId));
  const shared = bundles.some((bundle) => bundle.kind === 'both' || bundle.kind === 'kit');

  if (!tiles.length) return null;

  return (
    <article className="oc-merch-offer">
      {offer.line ? <p className="oc-merch-dek">{t(`shop.offers.${offer.line}`)}</p> : null}
      <ProductTiles
        cta={offer.kits.length ? t('shop.openKit') : undefined}
        items={tiles}
        perCardAdds={!shared}
      />
      {shared ? <BundleButtons bundles={bundles} /> : null}
      {offer.kits.length && offer.items.length ? <ProductRail items={offer.items} /> : null}
    </article>
  );
}

function SpareShelf({ offers }: { offers: ResolvedOffer[] }) {
  return <Reprise offers={offers} />;
}

function ProductShelf({ offers }: { offers: ResolvedOffer[] }) {
  if (!offers.length) return null;

  return (
    <>
      {offers.map((offer) => {
        const bundles = cartBundlesForIds(offer.items.map((item) => item.entityId));
        const shared = bundles.some((bundle) => bundle.kind === 'both');

        return (
          <div key={offer.key}>
            <ProductTiles items={offer.items} perCardAdds={!shared} />
            {shared ? <BundleButtons bundles={bundles} /> : null}
          </div>
        );
      })}
    </>
  );
}

function Reprise({ offers }: { offers: ResolvedOffer[] }) {
  if (!offers.length) return null;

  return (
    <ul className="oc-merch-lines">
      {offers.map((offer) => {
        const rows = offer.items.length ? offer.items : offer.kits;

        return (
          <li className="oc-merch-line" key={offer.key}>
            {rows.map((item) => (
              <ProductLine item={item} key={item.entityId} />
            ))}
            <BundleButtons
              bundles={cartBundlesForIds(rows.map((item) => item.entityId))}
            />
          </li>
        );
      })}
    </ul>
  );
}

function SingleKit({ kit }: { kit: OcCatalogItem }) {
  if (!kit.priceLabel) return null;

  return <p className="oc-merch-price">{kit.priceLabel}</p>;
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
  const size = optionalChapterText(t, `shop.kitSizes.${kit.entityId}`, shortName(t, kit));

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

function ProductLine({ item }: { item: OcCatalogItem }) {
  const locale = useLocale();
  const t = useTranslations('OstomyCare.ui.chapter');

  return (
    <a
      aria-label={item.priceLabel ? `${item.name}, ${item.priceLabel}` : item.name}
      href={localeHref(item.path, locale)}
    >
      <span className="oc-merch-line-name">{shortName(t, item)}</span>
      {item.priceLabel ? <span className="oc-merch-price">{item.priceLabel}</span> : null}
      <span className="oc-merch-line-cta">{t('shop.view')}</span>
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
    <a
      aria-label={`${label}, ${item.name}`}
      className="oc-merch-cta is-quiet"
      href={localeHref(item.path, locale)}
    >
      {label}
    </a>
  );
}

function ProductTiles({
  cta,
  items,
  perCardAdds = false,
}: {
  cta?: string;
  items: OcCatalogItem[];
  perCardAdds?: boolean;
}) {
  const locale = useLocale();
  const t = useTranslations('OstomyCare.ui.chapter');
  const action = cta ?? t('shop.view');

  const layout = items.length === 1 ? 'is-single' : items.length === 3 ? 'is-trio' : '';

  return (
    <ul className={['oc-merch-products', layout].filter(Boolean).join(' ')}>
      {items.map((item) => (
        <li key={item.entityId}>
          <a
            aria-label={item.priceLabel ? `${action}, ${item.name}, ${item.priceLabel}` : `${action}, ${item.name}`}
            href={localeHref(item.path, locale)}
          >
            {item.image ? (
              <img alt="" loading="lazy" src={item.image.src} />
            ) : (
              <span className="oc-merch-blank" />
            )}
            <span className="oc-merch-name">{shortName(t, item)}</span>
            {item.priceLabel ? <span className="oc-merch-price">{item.priceLabel}</span> : null}
            <span className="oc-merch-tile-cta">{action}</span>
          </a>
          {perCardAdds ? (
            <BundleButtons bundles={cartBundlesForProduct(item.entityId)} />
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function ProductRail({ items }: { items: OcCatalogItem[] }) {
  const t = useTranslations('OstomyCare.ui.chapter');

  return (
    <div className="oc-merch-rail">
      <p className="oc-merch-rail-label">{t('shop.alsoSold')}</p>
      <ProductTiles items={items} />
    </div>
  );
}

type ChapterTranslator = ReturnType<typeof useTranslations<'OstomyCare.ui.chapter'>>;

function optionalChapterText(t: ChapterTranslator, key: string, fallback: string) {
  const read = t as unknown as {
    (key: string): string;
    has(key: string): boolean;
  };

  return read.has(key) ? read(key) : fallback;
}

function offerTitle(t: ChapterTranslator, kits: OcCatalogItem[], line?: ShopOfferLine) {
  const lead = kits[0];

  if (!lead) return '';

  if (kits.length > 1 && line === 'newImage') return t('shop.families.newImage');

  return shortName(t, lead);
}

function shortName(t: ChapterTranslator, item: OcCatalogItem) {
  return optionalChapterText(t, `shop.names.${item.entityId}`, item.name);
}

function bundleLabel(t: ChapterTranslator, bundle: ChapterCartBundle) {
  if (bundle.kind === 'both' && bundle.size) return t('shop.addBothSize', { size: bundle.size });
  if (bundle.kind === 'both') return t('shop.addBoth');
  if (bundle.size) return t('shop.addSize', { size: bundle.size });

  return t('shop.add');
}

function BundleButtons({ bundles }: { bundles: ChapterCartBundle[] }) {
  if (!bundles.length) return null;

  return (
    <div className="oc-merch-adds">
      {bundles.map((bundle) => (
        <BundleButton bundle={bundle} key={bundle.key} />
      ))}
    </div>
  );
}

function BundleButton({ bundle }: { bundle: ChapterCartBundle }) {
  const t = useTranslations('OstomyCare.ui.chapter');
  const router = useRouter();
  const { openMiniCart } = useMiniCart();
  const [state, formAction, pending] = useActionState<ChapterAddState, FormData>(
    addChapterBundleToCart,
    { status: 'idle' },
  );

  useEffect(() => {
    if (state.status !== 'added') return;

    router.refresh();
    openMiniCart();
  }, [openMiniCart, router, state]);

  const label = bundleLabel(t, bundle);

  return (
    <form action={formAction}>
      <input name="bundle" type="hidden" value={bundle.key} />
      <button className="oc-merch-cta" disabled={pending} type="submit">
        {pending ? t('shop.adding') : label}
      </button>
      <p className="oc-merch-add-status" role="status">
        {state.status === 'added'
          ? bundle.kind === 'both'
            ? t('shop.addedBoth')
            : t('shop.added')
          : null}
        {state.status === 'error' ? t('shop.addError') : null}
      </p>
    </form>
  );
}
