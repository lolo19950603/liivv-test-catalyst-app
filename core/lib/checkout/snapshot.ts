import 'server-only';

import { v4 as uuid } from 'uuid';

import { getCart } from '~/app/[locale]/(default)/cart/page-data';
import { kv } from '~/lib/kv';

import { mapCartSelectedOptionsToProductOptions } from './map-cart-options';
import { formatCartSelectedOptionsSubtitle } from './format-cart-selected-options-subtitle';
import { calculateCheckoutAmounts } from './subscription-charge-timing';
import { buildCheckoutShippingSections } from './checkout-section-shipping';
import { ensureDueTodayShippingSyncedToCheckout } from '~/app/[locale]/(default)/checkout/_actions/section-shipping';
import {
  getSectionShippingCosts,
  getSectionShippingState,
  isSectionShippingReady,
} from './section-shipping-storage';
import { expandGroupedCartLineItems } from './expand-cart-line-items';
import {
  findSubscriptionLineByKey,
  reconcileSubscriptionLinesWithCart,
} from './subscription-lines';
import type { CheckoutAddressSnapshot, CheckoutLineItemSnapshot, CheckoutSnapshot } from './types';
import type { SubscriptionLineMeta } from './types';

function buildCheckoutLineItemSnapshots(
  items: Array<{
    entityId: string;
    productEntityId: number;
    variantEntityId?: number | null;
    sku?: string | null;
    name: string;
    quantity: number;
    salePrice?: { value: number } | null;
    listPrice: { value: number; currencyCode: string };
    selectedOptions: Array<{
      __typename?: string;
      entityId: number;
      name?: string;
      value?: string;
      valueEntityId?: number | null;
      number?: number;
      text?: string;
      date?: { utc: string };
    }>;
  }>,
  isPhysical: boolean,
  subscriptionLines: SubscriptionLineMeta[],
): CheckoutLineItemSnapshot[] {
  return expandGroupedCartLineItems({
    cartLineItems: items,
    subscriptionLines,
    buildBaseItem: (item, totalQuantity, lineItemEntityId) => {
      const productOptions = mapCartSelectedOptionsToProductOptions(item.selectedOptions);
      const variantSubtitle = formatCartSelectedOptionsSubtitle(item.selectedOptions, item.sku);
      const unitPrice = item.salePrice?.value ?? item.listPrice.value;

      return {
        id: lineItemEntityId,
        quantity: totalQuantity,
        lineItemEntityId,
        productEntityId: item.productEntityId,
        variantEntityId: item.variantEntityId,
        sku: item.sku,
        name: item.name,
        unitPrice,
        currency: item.listPrice.currencyCode,
        productOptions,
        ...(variantSubtitle ? { variantSubtitle } : {}),
      };
    },
    applySubscription: () => ({}),
  }).map((line) => {
    const subscription =
      line.purchaseType === 'subscription' && line.subscriptionLineKey
        ? findSubscriptionLineByKey(subscriptionLines, line.subscriptionLineKey)
        : undefined;

    return {
      lineItemEntityId: line.lineItemEntityId,
      productEntityId: line.productEntityId,
      variantEntityId: line.variantEntityId ?? undefined,
      sku: line.sku ?? undefined,
      name: line.name,
      quantity: line.quantity,
      unitAmount: Math.round(line.unitPrice * 100),
      currency: line.currency,
      productOptions: line.productOptions,
      isPhysical,
      isSubscription: line.purchaseType === 'subscription',
      billingInterval: subscription?.billingInterval,
      billingCycleAnchor: subscription?.billingCycleAnchor,
      ...(line.variantSubtitle ? { variantSubtitle: line.variantSubtitle } : {}),
    };
  });
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
  await ensureDueTodayShippingSyncedToCheckout();

  const data = await getCart({ cartId });
  const cart = data.site.cart;
  let checkout = data.site.checkout;

  if (!cart || !checkout?.grandTotal) {
    throw new Error('Cart checkout is not ready');
  }

  const physicalItems = cart.lineItems.physicalItems;
  const digitalItems = cart.lineItems.digitalItems;
  const subscriptionLines = await reconcileSubscriptionLinesWithCart(cartId, [
    ...physicalItems.filter((item) => !item.parentEntityId),
    ...digitalItems.filter((item) => !item.parentEntityId),
  ]);

  const lineItems: CheckoutLineItemSnapshot[] = [
    ...buildCheckoutLineItemSnapshots(
      physicalItems.filter((item) => !item.parentEntityId),
      true,
      subscriptionLines,
    ),
    ...buildCheckoutLineItemSnapshots(
      digitalItems.filter((item) => !item.parentEntityId),
      false,
      subscriptionLines,
    ),
  ];

  const requiresShippingAddress = lineItems.some((line) => line.isPhysical);
  const shippingSections = buildCheckoutShippingSections(lineItems);
  const sectionShippingState = await getSectionShippingState(cartId);
  const sectionShippingCosts = getSectionShippingCosts(sectionShippingState);
  const requiresShippingMethod = shippingSections.some((section) => section.requiresShippingMethod);
  const shippingConsignmentWithAddress = checkout.shippingConsignments?.find(
    (consignment) => consignment.address?.countryCode,
  );

  if (requiresShippingMethod && !isSectionShippingReady(shippingSections, sectionShippingState)) {
    throw new Error('A shipping method must be selected for each delivery section before checkout');
  }

  if (requiresShippingAddress && !shippingConsignmentWithAddress?.address?.countryCode) {
    throw new Error('A shipping address is required before checkout');
  }

  const shippingConsignment = checkout.shippingConsignments?.find(
    (consignment) => consignment.selectedShippingOption,
  );

  const immediateShipping = sectionShippingCosts['due-today'] ?? 0;
  const shippingAddress = shippingConsignmentWithAddress?.address ?? checkout.shippingConsignments?.[0]?.address;
  const amounts = calculateCheckoutAmounts({
    lineItems,
    cartSubtotal: checkout.subtotal?.value ?? 0,
    cartTax: checkout.taxTotal?.value ?? 0,
    sectionShippingCosts,
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
    shipping: immediateShipping,
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
          address1: shippingAddress.address1?.trim()
            ? shippingAddress.address1
            : billingAddress.address1,
          address2: shippingAddress.address2?.trim()
            ? shippingAddress.address2
            : billingAddress.address2,
          city: shippingAddress.city ?? '',
          stateOrProvince: shippingAddress.stateOrProvince ?? undefined,
          countryCode: shippingAddress.countryCode,
          postalCode: shippingAddress.postalCode ?? '',
        }
      : undefined,
    shippingMethodDescription: shippingConsignment?.selectedShippingOption?.description,
  };
}
