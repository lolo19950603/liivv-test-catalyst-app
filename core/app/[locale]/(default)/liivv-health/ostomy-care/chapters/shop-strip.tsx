'use client';

import { useFormatter, useLocale, useTranslations } from 'next-intl';
import { useActionState, useEffect, useId, useState, type ReactNode } from 'react';
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

    /*
     * The line as well as the first product: two offers can open with the same
     * product (Get to Know Your Stoma card 6, the New Image barrier 4541 under
     * "closed" and "uroImage"), and a repeated key is a React error. As the
     * engine's twin does (QA, 2026-10-08).
     */
    const key = `${offer.line ?? 'offer'}-${String(offer.kitIds?.[0] ?? items[0]?.entityId)}`;

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
  const hasKits = shelf.offers.some((entry) => (entry.kitIds?.length ?? 0) > 0);
  const hasProducts = shelf.offers.some((entry) => entry.productIds.length > 0);
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
  const cad = useCad();
  const lead = kits[0] ?? items[0];
  const companions = kits.length ? items : items.filter((item) => item.entityId !== lead?.entityId);

  if (!lead) return null;

  if (!kits.length && items.length > 1) {
    const bundles = cartBundlesForIds(items.map((item) => item.entityId));

    if (bundles.some((bundle) => bundle.kind === 'both')) {
      return (
        <PairBlock
          bundles={bundles}
          heading={t(`shop.occasions.${occasion}`)}
          items={items}
          line={line}
        />
      );
    }

    return (
      <div className="oc-merch-hero is-products">
        <p className="oc-merch-occasion">{t(`shop.occasions.${occasion}`)}</p>
        {line ? <p className="oc-merch-dek">{t(`shop.offers.${line}`)}</p> : null}
        <ChoiceCards items={items} />
      </div>
    );
  }

  const bundle = cartBundlesForIds([lead.entityId])[0];
  const amount = linePrice(bundle, lead.entityId);

  return (
    <>
      <div className={lead.image ? 'oc-merch-hero' : 'oc-merch-hero is-copy'}>
        {lead.image ? <Photo item={lead} linked={kits.length <= 1} /> : null}
        <div className="oc-merch-copy">
          <p className="oc-merch-occasion">{t(`shop.occasions.${occasion}`)}</p>
          {line ? <p className="oc-merch-dek">{t(`shop.offers.${line}`)}</p> : null}
          <p className="oc-merch-title">{kits.length ? offerTitle(t, kits, line) : shortName(t, lead)}</p>
          {kits.length > 1 ? <SizeLinks kits={kits} /> : null}
          {!kits.length && typeof amount === 'number' ? (
            <p className="oc-merch-price">{cad(amount)}</p>
          ) : kits.length === 1 && kits[0]?.priceLabel ? (
            <p className="oc-merch-price">{kits[0].priceLabel}</p>
          ) : !kits.length && lead.priceLabel ? (
            <p className="oc-merch-price">{lead.priceLabel}</p>
          ) : null}
          {!kits.length && bundle?.size ? <p className="oc-merch-spec-line">{bundle.size}</p> : null}
          <div className="oc-merch-actions">
            {kits.length === 1 ? <Cta item={kits[0]!} label={t('shop.openKit')} /> : null}
            {!kits.length ? <Cta item={lead} label={t('shop.view')} /> : null}
            {bundle ? <BundleButton bundle={bundle} /> : null}
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

  if (offer.kits.length && !offer.items.length) {
    return (
      <article className="oc-merch-offer">
        {offer.line ? <p className="oc-merch-dek">{t(`shop.offers.${offer.line}`)}</p> : null}
        {offer.kits.map((kit) => (
          <KitRow key={kit.entityId} kit={kit} />
        ))}
      </article>
    );
  }

  const bundles = cartBundlesForIds(offer.items.map((item) => item.entityId));

  if (bundles.some((bundle) => bundle.kind === 'both')) {
    return <PairBlock bundles={bundles} items={offer.items} line={offer.line} />;
  }

  return (
    <article className="oc-merch-offer">
      {offer.line ? <p className="oc-merch-dek">{t(`shop.offers.${offer.line}`)}</p> : null}
      <ChoiceCards items={offer.items} />
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

        if (bundles.some((bundle) => bundle.kind === 'both')) {
          return (
            <PairBlock bundles={bundles} items={offer.items} key={offer.key} line={offer.line} />
          );
        }

        return <ChoiceCards items={offer.items} key={offer.key} />;
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
        const bundles = cartBundlesForIds(rows.map((item) => item.entityId));

        return (
          <li className="oc-merch-line" key={offer.key}>
            {bundles.length ? <QuietRow bundles={bundles} items={rows} /> : null}
          </li>
        );
      })}
    </ul>
  );
}

function PairBlock({
  bundles,
  heading,
  items,
  line,
}: {
  bundles: ChapterCartBundle[];
  heading?: string;
  items: OcCatalogItem[];
  line?: ShopOfferLine;
}) {
  const t = useTranslations('OstomyCare.ui.chapter');
  const locale = useLocale();
  const cad = useCad();
  const pairs = bundles.filter((bundle) => bundle.kind === 'both');
  const [selected, setSelected] = useState(pairs[0]?.key ?? '');
  const bundle = pairs.find((entry) => entry.key === selected) ?? pairs[0];

  if (!bundle) return null;

  const total = pairTotal(bundle);

  return (
    <article className="oc-merch-offer">
      {heading ? <p className="oc-merch-occasion">{heading}</p> : null}
      {line ? <p className="oc-merch-dek">{t(`shop.offers.${line}`)}</p> : null}
      <ul className="oc-merch-well">
        {items.map((item) => {
          const price = linePrice(bundle, item.entityId);

          return (
            <li className="oc-merch-piece" key={item.entityId}>
              <a className="oc-merch-piece-link" href={localeHref(item.path, locale)}>
                {item.image ? (
                  <img alt="" loading="lazy" src={item.image.src} />
                ) : (
                  <span className="oc-merch-blank" />
                )}
                <span className="oc-merch-name">{shortName(t, item)}</span>
              </a>
              {typeof price === 'number' ? (
                <p className="oc-merch-price">{cad(price)}</p>
              ) : item.priceLabel ? (
                <p className="oc-merch-price">{item.priceLabel}</p>
              ) : null}
            </li>
          );
        })}
      </ul>
      <div className="oc-merch-buy">
        <SizeChoice bundles={pairs} onSelect={setSelected} selected={bundle.key} />
        {typeof total === 'number' ? (
          <p className="oc-merch-total">
            <span className="oc-merch-total-label">{t('shop.together')}</span>
            <span>{cad(total)}</span>
          </p>
        ) : null}
        <BundleButton bundle={bundle} key={bundle.key} />
      </div>
    </article>
  );
}

function ChoiceCards({ items }: { items: OcCatalogItem[] }) {
  const layout = items.length === 1 ? 'is-single' : items.length === 3 ? 'is-trio' : '';

  return (
    <ul className={['oc-merch-cards', layout].filter(Boolean).join(' ')}>
      {items.map((item) => (
        <ChoiceCard item={item} key={item.entityId} />
      ))}
    </ul>
  );
}

function ChoiceCard({ item }: { item: OcCatalogItem }) {
  const t = useTranslations('OstomyCare.ui.chapter');
  const locale = useLocale();
  const cad = useCad();
  const bundles = cartBundlesForProduct(item.entityId);
  const [selected, setSelected] = useState(bundles[0]?.key ?? '');
  const bundle = bundles.find((entry) => entry.key === selected) ?? bundles[0];
  const price = linePrice(bundle, item.entityId);

  return (
    <li className="oc-merch-card">
      <a aria-hidden="true" className="oc-merch-card-photo" href={localeHref(item.path, locale)} tabIndex={-1}>
        {item.image ? (
          <img alt="" loading="lazy" src={item.image.src} />
        ) : (
          <span className="oc-merch-blank" />
        )}
      </a>
      <div className="oc-merch-card-body">
        <a className="oc-merch-name" href={localeHref(item.path, locale)}>
          {shortName(t, item)}
        </a>
        {typeof price === 'number' ? (
          <p className="oc-merch-price">{cad(price)}</p>
        ) : item.priceLabel ? (
          <p className="oc-merch-price">{item.priceLabel}</p>
        ) : null}
        {bundle ? <SizeChoice bundles={bundles} onSelect={setSelected} selected={bundle.key} /> : null}
        {bundle ? <BundleButton bundle={bundle} key={bundle.key} /> : null}
      </div>
    </li>
  );
}

function KitRow({ kit }: { kit: OcCatalogItem }) {
  const t = useTranslations('OstomyCare.ui.chapter');
  const bundle = cartBundlesForIds([kit.entityId])[0];

  return (
    <div className="oc-merch-kit">
      {kit.image ? <Photo item={kit} /> : null}
      <div className="oc-merch-copy">
        <p className="oc-merch-title">{shortName(t, kit)}</p>
        {kit.priceLabel ? <p className="oc-merch-price">{kit.priceLabel}</p> : null}
        <div className="oc-merch-actions">
          <Cta item={kit} label={t('shop.openKit')} />
          {bundle ? <BundleButton bundle={bundle} /> : null}
        </div>
      </div>
    </div>
  );
}

function QuietRow({ bundles, items }: { bundles: ChapterCartBundle[]; items: OcCatalogItem[] }) {
  const t = useTranslations('OstomyCare.ui.chapter');
  const locale = useLocale();
  const cad = useCad();
  const [selected, setSelected] = useState(bundles[0]?.key ?? '');
  const bundle = bundles.find((entry) => entry.key === selected) ?? bundles[0];

  if (!bundle) return null;

  const pair = bundle.kind === 'both';
  const amount = pair ? pairTotal(bundle) : linePrice(bundle, items[0]?.entityId ?? 0);

  return (
    <div className="oc-merch-quiet">
      <div className="oc-merch-quiet-names">
        {items.map((item, index) => (
          <span className="oc-merch-quiet-name" key={item.entityId}>
            {index > 0 ? (
              <span aria-hidden="true" className="oc-merch-dot">
                ·
              </span>
            ) : null}
            <a className="oc-merch-name" href={localeHref(item.path, locale)}>
              {item.image ? (
                <img alt="" className="oc-merch-thumb" height={52} src={item.image.src} width={52} />
              ) : null}
              <span>{shortName(t, item)}</span>
            </a>
          </span>
        ))}
      </div>
      <SizeChoice bundles={bundles} onSelect={setSelected} selected={bundle.key} />
      {pair && typeof amount === 'number' ? (
        <p className="oc-merch-total">
          <span className="oc-merch-total-label">{t('shop.together')}</span>
          <span>{cad(amount)}</span>
        </p>
      ) : typeof amount === 'number' ? (
        <p className="oc-merch-price">{cad(amount)}</p>
      ) : bundle.kind === 'kit' && items[0]?.priceLabel ? (
        <p className="oc-merch-price">{items[0].priceLabel}</p>
      ) : null}
      <BundleButton bundle={bundle} key={bundle.key} />
    </div>
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

function SizeChoice({
  bundles,
  onSelect,
  selected,
}: {
  bundles: ChapterCartBundle[];
  onSelect: (key: string) => void;
  selected: string;
}) {
  const t = useTranslations('OstomyCare.ui.chapter');
  const name = useId();
  const sized = bundles.filter((bundle) => bundle.size);

  if (!sized.length) return null;

  if (sized.length === 1) {
    return <span className="oc-merch-size-chip is-selected">{sized[0]!.size}</span>;
  }

  return (
    <div aria-label={t('shop.sizesLabel')} className="oc-merch-size-choices" role="radiogroup">
      {sized.map((bundle) => (
        <label
          className={bundle.key === selected ? 'oc-merch-size-chip is-selected' : 'oc-merch-size-chip'}
          key={bundle.key}
        >
          <input
            checked={bundle.key === selected}
            name={name}
            onChange={() => onSelect(bundle.key)}
            type="radio"
            value={bundle.key}
          />
          {bundle.size}
        </label>
      ))}
    </div>
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

function ProductRail({ items }: { items: OcCatalogItem[] }) {
  const t = useTranslations('OstomyCare.ui.chapter');

  return (
    <div className="oc-merch-rail">
      <p className="oc-merch-rail-label">{t('shop.alsoSold')}</p>
      <ChoiceCards items={items} />
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

function useCad() {
  const format = useFormatter();

  return (value: number) => format.number(value, { style: 'currency', currency: 'CAD' });
}

function linePrice(bundle: ChapterCartBundle | undefined, productId: number) {
  return bundle?.lines.find((line) => line.productEntityId === productId)?.price;
}

function pairTotal(bundle: ChapterCartBundle) {
  const prices = bundle.lines.map((line) => line.price);

  if (!prices.length || prices.some((price) => typeof price !== 'number')) return undefined;

  const total = prices.reduce<number>((sum, price) => sum + (price ?? 0), 0);

  return Math.round(total * 100) / 100;
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

  const visible = bundle.kind === 'both' ? t('shop.addBoth') : t('shop.add');
  const named =
    bundle.kind === 'both' && bundle.size
      ? t('shop.addBothSize', { size: bundle.size })
      : bundle.size
        ? t('shop.addSize', { size: bundle.size })
        : visible;

  return (
    <form action={formAction}>
      <input name="bundle" type="hidden" value={bundle.key} />
      <button
        aria-label={named === visible ? undefined : named}
        className="oc-merch-cta"
        disabled={pending}
        type="submit"
      >
        {pending ? t('shop.adding') : visible}
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
