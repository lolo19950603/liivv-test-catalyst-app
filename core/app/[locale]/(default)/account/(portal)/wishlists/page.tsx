import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { SearchParams } from 'nuqs';
import { createSearchParamsCache, parseAsInteger, parseAsString } from 'nuqs/server';

import { Streamable } from '@/vibes/soul/lib/streamable';
import { CursorPaginationInfo } from '@/vibes/soul/primitives/cursor-pagination';
import type { Product } from '@/vibes/soul/primitives/product-card';
import * as Skeleton from '@/vibes/soul/primitives/skeleton';
import { Wishlist } from '@/vibes/soul/sections/wishlist-details';
import { WishlistsSection } from '@/vibes/soul/sections/wishlists-section';
import { getDashboardCustomer } from '~/app/[locale]/(default)/account/(portal)/dashboard/page-data';
import { ExistingResultType } from '~/client/util';
import { getProductsByIds } from '~/client/queries/get-products';
import { defaultPageInfo, pageInfoTransformer } from '~/data-transformers/page-info-transformer';
import { pricesTransformer } from '~/data-transformers/prices-transformer';
import { wishlistsTransformer } from '~/data-transformers/wishlists-transformer';
import { listSavedKits } from '~/lib/supabase/saved-kits-store';
import { isMobileUser } from '~/lib/user-agent';

import { NewWishlistButton } from '../../wishlists/_components/new-wishlist-button';
import { SavedKitsWishlistSection } from '../../wishlists/_components/saved-kits-wishlist-section';
import { WishlistActionsMenu } from '../../wishlists/_components/wishlist-actions-menu';
import {
  getChangeWishlistVisibilityModal,
  getDeleteWishlistModal,
  getNewWishlistModal,
  getRenameWishlistModal,
} from '../../wishlists/modals';
import { getCustomerWishlists } from '../../wishlists/page-data';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}

const defaultWishlistsLimit = 10;
const searchParamsCache = createSearchParamsCache({
  tag: parseAsString,
  before: parseAsString,
  after: parseAsString,
  limit: parseAsInteger.withDefault(defaultWishlistsLimit),
});

async function listWishlists(
  searchParamsPromise: Promise<SearchParams>,
  t: ExistingResultType<typeof getTranslations<'Wishlist'>>,
): Promise<Wishlist[]> {
  const searchParamsParsed = searchParamsCache.parse(await searchParamsPromise);
  const formatter = await getFormatter();
  const wishlists = await getCustomerWishlists(searchParamsParsed);

  if (!wishlists) {
    return [];
  }

  return wishlistsTransformer(wishlists, t, formatter);
}

async function getPaginationInfo(
  searchParamsPromise: Promise<SearchParams>,
): Promise<CursorPaginationInfo> {
  const searchParamsParsed = searchParamsCache.parse(await searchParamsPromise);
  const wishlists = await getCustomerWishlists(searchParamsParsed);

  return pageInfoTransformer(wishlists?.pageInfo ?? defaultPageInfo);
}

async function getSavedKitCards(locale: string) {
  const t = (await getTranslations('Account.SavedKits' as 'Account.Layout')) as unknown as {
    (key: string, values?: Record<string, string | number | Date>): string;
  };
  const format = await getFormatter();
  const customer = await getDashboardCustomer();

  if (!customer) {
    return [];
  }

  const kits = await listSavedKits(String(customer.entityId));
  const allProductIds = [
    ...new Set(kits.flatMap((kit) => kit.items.map((item) => item.productEntityId))),
  ];

  const productsResult =
    allProductIds.length > 0
      ? await getProductsByIds({ entityIds: allProductIds, locale })
      : { status: 'success' as const, products: [] };

  const productById = new Map(
    (productsResult.status === 'success' ? productsResult.products ?? [] : []).map((product) => [
      product.entityId,
      product,
    ]),
  );

  return kits.map((kit) => {
    const products: Product[] = [];
    const seen = new Set<number>();

    for (const item of kit.items) {
      if (seen.has(item.productEntityId) || products.length >= 5) {
        continue;
      }

      seen.add(item.productEntityId);
      const product = productById.get(item.productEntityId);

      if (!product) {
        products.push({
          id: String(item.productEntityId),
          title: item.name,
          href: '#',
          ...(item.sku ? { sku: item.sku } : {}),
        });
        continue;
      }

      products.push({
        id: String(product.entityId),
        title: product.name,
        href: product.path,
        image: product.defaultImage
          ? { src: product.defaultImage.url, alt: product.defaultImage.altText }
          : undefined,
        price: pricesTransformer(product.prices, format),
        ...(product.sku ? { sku: product.sku } : {}),
      });
    }

    const itemCount = kit.items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      id: kit.id,
      name: kit.name,
      itemCountLabel: t('itemCount', { count: itemCount }),
      products,
    };
  });
}

export default async function Wishlists({ params, searchParams }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations('Wishlist');
  const tKits = (await getTranslations('Account.SavedKits' as 'Account.Layout')) as unknown as {
    (key: string, values?: Record<string, string | number | Date>): string;
  };
  const isMobile = await isMobileUser();
  const newWishlistModal = getNewWishlistModal(t);
  const savedKits = await getSavedKitCards(locale);

  return (
    <div className="space-y-10">
      <section className="w-full @container" id="saved-kits">
        <header className="mb-6">
          <h2 className="font-[family-name:var(--wishlists-section-title-font-family,var(--font-family-heading))] text-2xl font-medium leading-none tracking-tight text-[var(--wishlists-section-title,hsl(var(--foreground)))]">
            {tKits('title')}
          </h2>
        </header>
        <SavedKitsWishlistSection
          emptyHint={tKits('emptyHint')}
          emptyTitle={tKits('empty')}
          kits={savedKits}
          labels={{
            badge: tKits('badge'),
            addToCart: tKits('addToCart'),
            actionsTitle: tKits('actionsTitle'),
            rename: tKits('rename'),
            delete: tKits('delete'),
            saveName: tKits('saveName'),
            cancel: tKits('cancel'),
            renameSuccess: tKits('renameSuccess'),
            deleteSuccess: tKits('deleteSuccess'),
            deleteConfirm: tKits('deleteConfirm'),
            renameModalTitle: tKits('renameModalTitle'),
            emptyProducts: tKits('emptyProducts'),
          }}
        />
      </section>

      <WishlistsSection
        actions={
          <NewWishlistButton
            appearance="default"
            label={t('new')}
            modal={newWishlistModal}
            variant="secondary"
          />
        }
        emptyStateCallToAction={
          <NewWishlistButton
            appearance="default"
            label={t('noWishlistsCallToAction')}
            modal={newWishlistModal}
            variant="primary"
          />
        }
        emptyStateTitle={t('noWishlists')}
        emptyWishlistStateText={t('emptyWishlist')}
        itemActions={{
          component: (wishlist) => {
            if (!wishlist) {
              return <Skeleton.Box className="h-10 w-10 rounded-full" />;
            }

            return (
              <WishlistActionsMenu
                actionsTitle={t('actionsTitle')}
                items={[
                  {
                    label: t('rename'),
                    modal: getRenameWishlistModal(wishlist, t),
                  },
                  {
                    label: wishlist.visibility.isPublic ? t('makePrivate') : t('makePublic'),
                    modal: getChangeWishlistVisibilityModal(wishlist, t),
                  },
                  {
                    label: t('delete'),
                    variant: 'danger',
                    modal: getDeleteWishlistModal(wishlist, t),
                  },
                ]}
                share={
                  wishlist.publicUrl
                    ? {
                        wishlistName: wishlist.name,
                        modalTitle: t('Modal.shareTitle', { name: wishlist.name }),
                        publicUrl: wishlist.publicUrl,
                        closeLabel: t('Modal.close'),
                        copyLabel: t('Modal.copy'),
                        copiedMessage: t('shareCopied'),
                        disabledTooltip: t('shareDisabled'),
                        label: t('share'),
                        successMessage: t('shareSuccess'),
                        isPublic: wishlist.visibility.isPublic,
                        isMobileUser: isMobile,
                      }
                    : undefined
                }
              />
            );
          },
        }}
        paginationInfo={Streamable.from(() => getPaginationInfo(searchParams))}
        title={t('title')}
        viewWishlistLabel={t('viewWishlist')}
        wishlists={Streamable.from(() => listWishlists(searchParams, t))}
      />
    </div>
  );
}
