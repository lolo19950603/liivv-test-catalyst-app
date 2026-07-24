'use server';

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getTranslations } from 'next-intl/server';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { TAGS } from '~/client/tags';

const wishlistPickerLimit = 50;

const ProductCardWishlistPickerQuery = graphql(`
  query ProductCardWishlistPickerQuery($first: Int, $productId: Int!) {
    customer {
      wishlistsContainingProduct: wishlists(
        first: $first
        filters: { productEntityIds: [$productId] }
      ) {
        edges {
          node {
            entityId
            name
            items(first: 50, filters: { productEntityIds: [$productId] }) {
              edges {
                node {
                  entityId
                  productEntityId
                  variantEntityId
                  product {
                    sku
                  }
                }
              }
            }
          }
        }
      }
      wishlists(first: $first) {
        edges {
          node {
            entityId
            name
          }
        }
      }
    }
  }
`);

export interface ProductCardWishlistInfo {
  entityId: number;
  name: string;
  wishlistItemId?: number;
}

export interface ProductCardWishlistPickerResult {
  isLoggedIn: boolean;
  isProductInWishlist: boolean;
  wishlists: ProductCardWishlistInfo[];
}

export async function getWishlistsForProduct(
  productId: number,
  productSku: string,
): Promise<ProductCardWishlistPickerResult> {
  const customerAccessToken = await getSessionCustomerAccessToken();
  const t = await getTranslations('Wishlist.Button');

  if (!customerAccessToken) {
    return {
      isLoggedIn: false,
      isProductInWishlist: false,
      wishlists: [],
    };
  }

  const { data } = await client.fetch({
    document: ProductCardWishlistPickerQuery,
    variables: { productId, first: wishlistPickerLimit },
    customerAccessToken,
    fetchOptions: { cache: 'no-store', next: { tags: [TAGS.customer] } },
  });

  if (!data.customer?.wishlists.edges?.length) {
    return {
      isLoggedIn: true,
      isProductInWishlist: false,
      wishlists: [
        {
          entityId: 0,
          name: t('defaultWishlistName'),
        },
      ],
    };
  }

  const wishlistsWithSku = removeEdgesAndNodes(data.customer.wishlistsContainingProduct)
    .map((wishlist) => ({
      ...wishlist,
      items: removeEdgesAndNodes(wishlist.items),
    }))
    .filter((wishlist) => wishlist.items.some(({ product }) => product?.sku === productSku));

  const allWishlists = removeEdgesAndNodes(data.customer.wishlists);
  const wishlists: ProductCardWishlistInfo[] = allWishlists
    .map(({ entityId, name }) => ({
      entityId,
      name,
      wishlistItemId: wishlistsWithSku
        .find((wishlist) => wishlist.entityId === entityId)
        ?.items.find(({ product }) => product?.sku === productSku)?.entityId,
    }))
    .sort((a, b) => {
      const aHasProduct = a.wishlistItemId !== undefined;
      const bHasProduct = b.wishlistItemId !== undefined;

      if (aHasProduct === bHasProduct) {
        return b.entityId - a.entityId;
      }

      return aHasProduct ? -1 : 1;
    });

  return {
    isLoggedIn: true,
    isProductInWishlist: wishlistsWithSku.length > 0,
    wishlists,
  };
}
