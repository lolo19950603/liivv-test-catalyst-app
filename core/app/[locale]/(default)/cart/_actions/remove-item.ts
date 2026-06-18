'use server';

import { revalidateTag } from 'next/cache';
import { getTranslations } from 'next-intl/server';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
import { TAGS } from '~/client/tags';
import { mapCartSelectedOptionsToProductOptions } from '~/lib/checkout/map-cart-options';
import { removeSubscriptionLineFromCart } from '~/lib/checkout/subscription-lines';
import { clearSectionShippingState } from '~/lib/checkout/section-shipping-storage';
import { clearCartId, getCartId } from '~/lib/cart';

import { getCart } from '../page-data';

const DeleteCartLineItemMutation = graphql(`
  mutation DeleteCartLineItemMutation($input: DeleteCartLineItemInput!) {
    cart {
      deleteCartLineItem(input: $input) {
        cart {
          entityId
        }
      }
    }
  }
`);

type Variables = VariablesOf<typeof DeleteCartLineItemMutation>;
type DeleteCartLineItemInput = Variables['input'];

async function clearSubscriptionMetadataForLineItem(lineItemEntityId: string): Promise<void> {
  const cartId = await getCartId();

  if (!cartId) {
    return;
  }

  const data = await getCart({ cartId });
  const cart = data.site.cart;

  if (!cart) {
    return;
  }

  const items = [...cart.lineItems.physicalItems, ...cart.lineItems.digitalItems];
  const lineItem = items.find((item) => item.entityId === lineItemEntityId);

  if (!lineItem) {
    return;
  }

  const productOptions = mapCartSelectedOptionsToProductOptions(lineItem.selectedOptions);

  await removeSubscriptionLineFromCart(cartId, lineItem.productEntityId, productOptions);
}

export async function removeItem({
  lineItemEntityId,
}: Omit<DeleteCartLineItemInput, 'cartEntityId'>) {
  const t = await getTranslations('Cart.Errors');

  const customerAccessToken = await getSessionCustomerAccessToken();

  const cartId = await getCartId();

  if (!cartId) {
    throw new Error(t('cartNotFound'));
  }

  if (!lineItemEntityId) {
    throw new Error(t('lineItemNotFound'));
  }

  await clearSubscriptionMetadataForLineItem(lineItemEntityId);

  const response = await client.fetch({
    document: DeleteCartLineItemMutation,
    variables: {
      input: {
        cartEntityId: cartId,
        lineItemEntityId,
      },
    },
    customerAccessToken,
    fetchOptions: { cache: 'no-store' },
  });

  const cart = response.data.cart.deleteCartLineItem?.cart;

  // If we remove the last item in a cart the cart is deleted
  // so we need to remove the cartId cookie
  // TODO: We need to figure out if it actually failed.
  if (!cart) {
    await clearCartId();
  } else {
    await clearSectionShippingState(cartId);
  }

  revalidateTag(TAGS.cart, { expire: 0 });

  return cart;
}
