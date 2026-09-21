import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { SearchParams } from 'nuqs';
import { createSearchParamsCache, parseAsInteger, parseAsString } from 'nuqs/server';

import { Streamable } from '@/vibes/soul/lib/streamable';
import { CursorPaginationInfo } from '@/vibes/soul/primitives/cursor-pagination';
import { Wishlist, WishlistDetails } from '@/vibes/soul/sections/wishlist-details';
import { ExistingResultType } from '~/client/util';
import { DenyAdSignals } from '~/components/analytics/deny-ad-signals';
import { defaultPageInfo, pageInfoTransformer } from '~/data-transformers/page-info-transformer';
import { wishlistDetailsTransformer } from '~/data-transformers/wishlists-transformer';
import { redirect } from '~/i18n/routing';
import { getSensitiveProductIds } from '~/lib/analytics/get-sensitive-product-ids';
import { isMobileUser } from '~/lib/user-agent';

import { removeWishlistItem } from '../../../wishlists/_actions/remove-wishlist-item';
import { getDeleteWishlistModal, getRenameWishlistModal } from '../../../wishlists/modals';
import { addWishlistItemToCart } from '../../../wishlists/[id]/_actions/add-to-cart';
import { WishlistActions, WishlistActionsSkeleton } from '../../../wishlists/[id]/_components/wishlist-actions';
import { WishlistAnalyticsProvider } from '../../../wishlists/[id]/_components/wishlist-analytics-provider';
import { getCustomerWishlist } from '../../../wishlists/[id]/page-data';

interface Props {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<SearchParams>;
}

const defaultWishlistItemsLimit = 10;
const searchParamsCache = createSearchParamsCache({
  tag: parseAsString,
  before: parseAsString,
  after: parseAsString,
  limit: parseAsInteger.withDefault(defaultWishlistItemsLimit),
});

async function getWishlist(
  id: string,
  t: ExistingResultType<typeof getTranslations<'Wishlist'>>,
  pt: ExistingResultType<typeof getTranslations<'Product.ProductDetails'>>,
  searchParamsPromise: Promise<SearchParams>,
  locale: string,
): Promise<Wishlist> {
  const entityId = Number(id);
  const searchParamsParsed = searchParamsCache.parse(await searchParamsPromise);
  const formatter = await getFormatter();
  const wishlist = await getCustomerWishlist(entityId, searchParamsParsed);

  if (!wishlist) {
    return redirect({ href: '/account/wishlists/', locale });
  }

  return wishlistDetailsTransformer(wishlist, t, pt, formatter);
}

const getAnalyticsData = async (id: string, searchParamsPromise: Promise<SearchParams>) => {
  const entityId = Number(id);
  const searchParamsParsed = searchParamsCache.parse(await searchParamsPromise);
  const wishlist = await getCustomerWishlist(entityId, searchParamsParsed);

  if (!wishlist) {
    return [];
  }

  const products = removeEdgesAndNodes(wishlist.items)
    .map(({ product }) => product)
    .filter((product) => product !== null);

  // A saved list of ostomy supplies is health information: which of these may
  // be named in an analytics event is a question for the catalogue.
  const sensitiveProductIds = await getSensitiveProductIds(products.map((p) => p.entityId));

  return products.map((product) => {
    return {
      id: product.entityId,
      name: product.name,
      sku: product.sku,
      brand: product.brand?.name ?? '',
      price: product.prices?.price.value ?? 0,
      currency: product.prices?.price.currencyCode ?? '',
      sensitive: sensitiveProductIds.has(product.entityId),
    };
  });
};

async function getPaginationInfo(
  id: string,
  searchParamsPromise: Promise<SearchParams>,
): Promise<CursorPaginationInfo> {
  const entityId = Number(id);
  const searchParamsParsed = searchParamsCache.parse(await searchParamsPromise);
  const wishlist = await getCustomerWishlist(entityId, searchParamsParsed);

  return pageInfoTransformer(wishlist?.items.pageInfo ?? defaultPageInfo);
}

export default async function WishlistPage({ params, searchParams }: Props) {
  const { locale, id } = await params;

  setRequestLocale(locale);

  const t = await getTranslations('Wishlist');
  const pt = await getTranslations('Product.ProductDetails');
  const wishlistActions = (wishlist?: Wishlist) => {
    if (!wishlist) {
      return <WishlistActionsSkeleton />;
    }

    return (
      <WishlistActions
        actionsTitle={t('actionsTitle')}
        isMobileUser={isMobileUser()}
        menuActions={[
          {
            label: t('rename'),
            modal: getRenameWishlistModal(wishlist, t),
          },
          {
            label: t('delete'),
            variant: 'danger',
            modal: getDeleteWishlistModal(wishlist, t),
          },
        ]}
        shareCloseLabel={t('Modal.close')}
        shareCopiedMessage={t('shareCopied')}
        shareCopyLabel={t('Modal.copy')}
        shareDisabledTooltip={t('shareDisabled')}
        shareLabel={t('share')}
        shareModalTitle={t('Modal.shareTitle', { name: wishlist.name })}
        shareSuccessMessage={t('shareSuccess')}
        wishlist={wishlist}
      />
    );
  };

  const streamableAnalyticsData = Streamable.from(() => getAnalyticsData(id, searchParams));

  /*
   * A wishlist of ostomy supplies is a health fact, and the page_view that goes
   * out with it carries this URL whatever the ecommerce event does or does not
   * name. The advertising signals go off, the same as on an ostomy shelf or an
   * ostomy product's own page (~/lib/analytics/ad-signals). Awaited in the
   * shell, not streamed: the first consent command runs as the page loads, so
   * a flag that arrives with streamed content arrives too late to cover the
   * page_view. Both lookups are React-cached, so the catalogue is asked once.
   */
  const denyAdSignals = (await getAnalyticsData(id, searchParams)).some(
    (product) => product.sensitive,
  );

  return (
    <WishlistAnalyticsProvider data={streamableAnalyticsData}>
      {denyAdSignals && <DenyAdSignals />}
      <WishlistDetails
        action={addWishlistItemToCart}
        emptyStateText={t('emptyWishlist')}
        headerActions={wishlistActions}
        paginationInfo={Streamable.from(() => getPaginationInfo(id, searchParams))}
        prevHref="/account/wishlists"
        removeAction={removeWishlistItem}
        removeButtonTitle={t('removeButtonTitle')}
        wishlist={Streamable.from(() => getWishlist(id, t, pt, searchParams, locale))}
      />
    </WishlistAnalyticsProvider>
  );
}
