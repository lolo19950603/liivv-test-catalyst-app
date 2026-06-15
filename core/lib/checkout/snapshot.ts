import 'server-only';

import { v4 as uuid } from 'uuid';

import { getCart } from '~/app/[locale]/(default)/cart/page-data';
import { kv } from '~/lib/kv';

import { mapCartSelectedOptionsToProductOptions } from './map-cart-options';
import { getSubscriptionLinesForCart, matchSubscriptionLine } from './subscription-lines';
import type { CheckoutAddressSnapshot, CheckoutLineItemSnapshot, CheckoutSnapshot } from './types';

function snapshotKey(snapshotId: string): string {
  return `checkout:snapshot:${snapshotId}`;
}

export async function storeCheckoutSnapshot(snapshot: CheckoutSnapshot): Promise<void> {
  await kv.set(snapshotKey(snapshot.id), snapshot);
}

export async function getCheckoutSnapshot(
  snapshotId: string,
): Promise<CheckoutSnapshot | null> {
  return kv.get<CheckoutSnapshot>(snapshotKey(snapshotId));
}

export async function buildCheckoutSnapshot({
  cartId,
  bigcommerceCustomerId,
  billingAddress,
}: {
  cartId: string;
  bigcommerceCustomerId: number;
  billingAddress: CheckoutAddressSnapshot;
}): Promise<CheckoutSnapshot> {
  const data = await getCart({ cartId });
  const cart = data.site.cart;
  const checkout = data.site.checkout;

  if (!cart || !checkout?.grandTotal) {
    throw new Error('Cart checkout is not ready');
  }

  const subscriptionLines = await getSubscriptionLinesForCart(cartId);
  const physicalItems = cart.lineItems.physicalItems;
  const digitalItems = cart.lineItems.digitalItems;

  const lineItems: CheckoutLineItemSnapshot[] = [...physicalItems, ...digitalItems].map((item) => {
    const productOptions = mapCartSelectedOptionsToProductOptions(item.selectedOptions);
    const subscription = matchSubscriptionLine(
      subscriptionLines,
      item.productEntityId,
      productOptions,
    );
    const unitPrice = item.salePrice?.value ?? item.listPrice.value;

    return {
      lineItemEntityId: item.entityId,
      productEntityId: item.productEntityId,
      variantEntityId: item.variantEntityId ?? undefined,
      sku: item.sku ?? undefined,
      name: item.name,
      quantity: item.quantity,
      unitAmount: Math.round(unitPrice * 100),
      currency: item.listPrice.currencyCode,
      productOptions,
      isSubscription: Boolean(subscription),
      billingInterval: subscription?.billingInterval,
      billingCycleAnchor: subscription?.billingCycleAnchor,
    };
  });

  const shippingConsignment = checkout.shippingConsignments?.find(
    (consignment) => consignment.selectedShippingOption,
  );

  if (!shippingConsignment?.selectedShippingOption) {
    throw new Error('A shipping method must be selected before checkout');
  }

  const shippingAddress = shippingConsignment.address;

  return {
    id: uuid(),
    cartId,
    bigcommerceCustomerId,
    currency: checkout.grandTotal.currencyCode,
    subtotal: checkout.subtotal?.value ?? 0,
    tax: checkout.taxTotal?.value ?? 0,
    shipping: shippingConsignment.selectedShippingOption.cost.value,
    grandTotal: checkout.grandTotal.value,
    lineItems,
    billingAddress,
    shippingAddress: shippingAddress
      ? {
          firstName: billingAddress.firstName,
          lastName: billingAddress.lastName,
          email: billingAddress.email,
          address1: '',
          city: shippingAddress.city ?? '',
          stateOrProvince: shippingAddress.stateOrProvince ?? undefined,
          countryCode: shippingAddress.countryCode,
          postalCode: shippingAddress.postalCode ?? '',
        }
      : undefined,
    shippingMethodDescription: shippingConsignment.selectedShippingOption.description,
  };
}
