import 'server-only';

import { v4 as uuid } from 'uuid';

import { getCart } from '~/app/[locale]/(default)/cart/page-data';
import { kv } from '~/lib/kv';

import { calculateCheckoutAmounts } from './checkout-amounts';
import { buildCheckoutShippingSections } from './checkout-section-shipping';
import { mapCartSelectedOptionsToProductOptions } from './map-cart-options';
import {
  getSectionShippingCosts,
  getSectionShippingState,
  isSectionShippingReady,
} from './section-shipping-storage';
import type { CheckoutAddressSnapshot, CheckoutLineItemSnapshot, CheckoutSnapshot } from './types';

function buildCheckoutLineItemSnapshot(
  item: {
    entityId: string;
    productEntityId: number;
    variantEntityId?: number | null;
    sku?: string | null;
    name: string;
    quantity: number;
    salePrice?: { value: number } | null;
    listPrice: { value: number; currencyCode: string };
    selectedOptions: Array<{ entityId: number; valueEntityId?: number | null }>;
  },
  isPhysical: boolean,
): CheckoutLineItemSnapshot {
  const productOptions = mapCartSelectedOptionsToProductOptions(item.selectedOptions);
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
    isPhysical,
  };
}

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

  const physicalItems = cart.lineItems.physicalItems;
  const digitalItems = cart.lineItems.digitalItems;

  const lineItems: CheckoutLineItemSnapshot[] = [
    ...physicalItems
      .filter((item) => !item.parentEntityId)
      .map((item) => buildCheckoutLineItemSnapshot(item, true)),
    ...digitalItems
      .filter((item) => !item.parentEntityId)
      .map((item) => buildCheckoutLineItemSnapshot(item, false)),
  ];

  const requiresShipping = lineItems.some((line) => line.isPhysical);
  const shippingSections = buildCheckoutShippingSections(lineItems);
  const sectionShippingState = await getSectionShippingState(cartId);
  const sectionShippingCosts = getSectionShippingCosts(sectionShippingState);

  if (requiresShipping && !isSectionShippingReady(shippingSections, sectionShippingState)) {
    throw new Error('A shipping method must be selected before checkout');
  }

  const shippingConsignment = checkout.shippingConsignments?.find(
    (consignment) => consignment.selectedShippingOption,
  );

  const shipping = sectionShippingCosts['due-today'] ?? 0;
  const shippingAddress = checkout.shippingConsignments?.[0]?.address;
  const amounts = calculateCheckoutAmounts({
    lineItems,
    cartSubtotal: checkout.subtotal?.value ?? 0,
    cartTax: checkout.taxTotal?.value ?? 0,
    shipping,
  });

  const sectionShipping = Object.fromEntries(
    Object.entries(sectionShippingState)
      .filter(([, entry]) => entry.selectedOptionId && entry.selectedCost != null)
      .map(([sectionId, entry]) => [
        sectionId,
        {
          cost: entry.selectedCost as number,
          description: entry.selectedDescription ?? '',
          optionEntityId: entry.selectedOptionId as string,
        },
      ]),
  );

  return {
    id: uuid(),
    cartId,
    bigcommerceCustomerId,
    currency: checkout.grandTotal.currencyCode,
    subtotal: checkout.subtotal?.value ?? 0,
    tax: checkout.taxTotal?.value ?? 0,
    shipping,
    grandTotal: checkout.grandTotal.value,
    amounts,
    lineItems,
    sectionShipping,
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
    shippingMethodDescription: shippingConsignment?.selectedShippingOption?.description,
  };
}
