'use server';

import { BigCommerceGQLError } from '@bigcommerce/catalyst-client';
import { getFormatter } from 'next-intl/server';
import { revalidateTag } from 'next/cache';

import { TAGS } from '~/client/tags';
import { getCart } from '~/app/[locale]/(default)/cart/page-data';
import { addShippingCost } from '~/app/[locale]/(default)/cart/_actions/add-shipping-cost';
import {
  addCheckoutShippingConsignments,
  updateCheckoutShippingConsignment,
} from '~/app/[locale]/(default)/cart/_actions/add-shipping-info';
import { buildCheckoutShippingSections } from '~/lib/checkout/checkout-section-shipping';
import { expandCartLineItemForProduct } from '~/lib/checkout/expand-cart-line-items';
import { mapCartSelectedOptionsToProductOptions } from '~/lib/checkout/map-cart-options';
import { getSubscriptionLinesForCart, findSubscriptionLineByKey } from '~/lib/checkout/subscription-lines';
import {
  getSectionShippingState,
  type SectionShippingEntry,
  type SectionShippingOption,
  updateSectionShippingEntry,
} from '~/lib/checkout/section-shipping-storage';
import type { CheckoutLineItemSnapshot } from '~/lib/checkout/types';
import { getCartId } from '~/lib/cart';

interface ShippingAddress {
  countryCode: string;
  city?: string;
  stateOrProvince?: string;
  postalCode?: string;
}

function mapShippingOptions(
  options: Array<{
    entityId: string;
    description: string;
    cost: { value: number };
  }>,
): SectionShippingOption[] {
  return options.map((option) => ({
    entityId: option.entityId,
    description: option.description,
    cost: option.cost.value,
  }));
}

async function getCheckoutLineSnapshots(cartId: string): Promise<CheckoutLineItemSnapshot[]> {
  const data = await getCart({ cartId });
  const cart = data.site.cart;

  if (!cart) {
    return [];
  }

  const subscriptionLines = await getSubscriptionLinesForCart(cartId);

  return [
    ...cart.lineItems.physicalItems
      .filter((item) => !item.parentEntityId)
      .flatMap((item) => {
        const productOptions = mapCartSelectedOptionsToProductOptions(item.selectedOptions);
        const unitPrice = item.salePrice?.value ?? item.listPrice.value;

        return expandCartLineItemForProduct({
          item: {
            id: item.entityId,
            quantity: item.quantity,
          },
          subscriptionLines,
          productEntityId: item.productEntityId,
          productOptions,
          applySubscription: () => ({}),
        }).map((line) => {
          const subscription =
            line.purchaseType === 'subscription' && line.subscriptionLineKey
              ? findSubscriptionLineByKey(subscriptionLines, line.subscriptionLineKey)
              : undefined;

          return {
            lineItemEntityId: item.entityId,
            productEntityId: item.productEntityId,
            variantEntityId: item.variantEntityId ?? undefined,
            sku: item.sku ?? undefined,
            name: item.name,
            quantity: line.quantity,
            unitAmount: Math.round(unitPrice * 100),
            currency: item.listPrice.currencyCode,
            productOptions,
            isPhysical: true,
            isSubscription: line.purchaseType === 'subscription',
            billingInterval: subscription?.billingInterval,
            billingCycleAnchor: subscription?.billingCycleAnchor,
          } satisfies CheckoutLineItemSnapshot;
        });
      }),
  ];
}

async function ensureShippingConsignment({
  checkoutEntityId,
  address,
  lineItems,
  consignmentEntityId,
}: {
  checkoutEntityId: string;
  address: ShippingAddress;
  lineItems: Array<{ lineItemEntityId: string; quantity: number }>;
  consignmentEntityId?: string;
}) {
  if (consignmentEntityId) {
    return updateCheckoutShippingConsignment({
      checkoutEntityId,
      shippingId: consignmentEntityId,
      address,
      lineItems,
    });
  }

  return addCheckoutShippingConsignments({
    checkoutEntityId,
    address,
    lineItems,
  });
}

export async function quoteAllCheckoutSectionShipping(): Promise<void> {
  const cartId = await getCartId();

  if (!cartId) {
    return;
  }

  const data = await getCart({ cartId });
  const checkout = data.site.checkout;

  if (!checkout?.entityId) {
    return;
  }

  const shippingConsignment =
    checkout.shippingConsignments?.find((consignment) => consignment.address?.countryCode) ??
    checkout.shippingConsignments?.[0];

  const address = shippingConsignment?.address;

  if (!address?.countryCode) {
    return;
  }

  const lineSnapshots = await getCheckoutLineSnapshots(cartId);
  const sections = buildCheckoutShippingSections(lineSnapshots).filter(
    (section) => section.requiresShipping,
  );

  if (sections.length === 0) {
    return;
  }

  const shippingAddress: ShippingAddress = {
    countryCode: address.countryCode,
    city: address.city ?? undefined,
    stateOrProvince: address.stateOrProvince ?? undefined,
    postalCode: address.postalCode ?? undefined,
  };

  let consignmentEntityId = shippingConsignment?.entityId;

  for (const section of sections) {
    await ensureShippingConsignment({
      checkoutEntityId: checkout.entityId,
      consignmentEntityId,
      address: shippingAddress,
      lineItems: section.physicalLineItems,
    });

    const refreshedCart = await getCart({ cartId });
    consignmentEntityId = refreshedCart.site.checkout?.shippingConsignments?.[0]?.entityId;

    const options = mapShippingOptions(
      refreshedCart.site.checkout?.shippingConsignments?.[0]?.availableShippingOptions ?? [],
    );
    const existing = (await getSectionShippingState(cartId))[section.id];
    const selectedOption = existing?.selectedOptionId
      ? options.find((option) => option.entityId === existing.selectedOptionId)
      : undefined;

    await updateSectionShippingEntry(cartId, section.id, {
      options,
      selectedOptionId: selectedOption?.entityId,
      selectedCost: selectedOption?.cost,
      selectedDescription: selectedOption?.description,
    });
  }

  await syncImmediateCheckoutConsignment();
  revalidateTag(TAGS.checkout, { expire: 0 });
  revalidateTag(TAGS.cart, { expire: 0 });
}

export async function syncImmediateCheckoutConsignment(): Promise<void> {
  const cartId = await getCartId();

  if (!cartId) {
    return;
  }

  const data = await getCart({ cartId });
  const checkout = data.site.checkout;

  if (!checkout?.entityId) {
    return;
  }

  const shippingConsignment = checkout.shippingConsignments?.[0];
  const address = shippingConsignment?.address;

  if (!address?.countryCode) {
    return;
  }

  const lineSnapshots = await getCheckoutLineSnapshots(cartId);
  const immediateSection = buildCheckoutShippingSections(lineSnapshots).find(
    (section) => section.id === 'due-today',
  );

  if (!immediateSection?.requiresShipping) {
    return;
  }

  const state = await getSectionShippingState(cartId);
  const immediateEntry = state['due-today'];

  await ensureShippingConsignment({
    checkoutEntityId: checkout.entityId,
    consignmentEntityId: shippingConsignment?.entityId,
    address: {
      countryCode: address.countryCode,
      city: address.city ?? undefined,
      stateOrProvince: address.stateOrProvince ?? undefined,
      postalCode: address.postalCode ?? undefined,
    },
    lineItems: immediateSection.physicalLineItems,
  });

  const refreshedCart = await getCart({ cartId });
  const consignmentEntityId = refreshedCart.site.checkout?.shippingConsignments?.[0]?.entityId;

  if (!consignmentEntityId || !immediateEntry?.selectedOptionId) {
    return;
  }

  await addShippingCost({
    checkoutEntityId: checkout.entityId,
    consignmentEntityId,
    shippingOptionEntityId: immediateEntry.selectedOptionId,
  });
}

export async function selectCheckoutSectionShipping(
  sectionId: string,
  shippingOptionEntityId: string,
): Promise<{ success: boolean; error?: string }> {
  const cartId = await getCartId();

  if (!cartId) {
    return { success: false, error: 'Cart not found' };
  }

  const state = await getSectionShippingState(cartId);
  const entry = state[sectionId];
  const selectedOption = entry?.options.find((option) => option.entityId === shippingOptionEntityId);

  if (!selectedOption) {
    return { success: false, error: 'Shipping option not found' };
  }

  const nextEntry: SectionShippingEntry = {
    options: entry?.options ?? [],
    selectedOptionId: selectedOption.entityId,
    selectedCost: selectedOption.cost,
    selectedDescription: selectedOption.description,
  };

  await updateSectionShippingEntry(cartId, sectionId, nextEntry);

  if (sectionId === 'due-today') {
    try {
      await syncImmediateCheckoutConsignment();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);

      if (error instanceof BigCommerceGQLError) {
        return {
          success: false,
          error: error.errors.map(({ message }) => message).join(' '),
        };
      }

      if (error instanceof Error) {
        return { success: false, error: error.message };
      }

      return { success: false, error: String(error) };
    }
  }

  revalidateTag(TAGS.checkout, { expire: 0 });
  revalidateTag(TAGS.cart, { expire: 0 });

  return { success: true };
}

export async function formatSectionShippingOptions(
  options: SectionShippingOption[],
  currencyCode: string,
): Promise<Array<{ value: string; label: string; price: string }>> {
  const format = await getFormatter();

  return options.map((option) => ({
    value: option.entityId,
    label: option.description,
    price: format.number(option.cost, {
      style: 'currency',
      currency: currencyCode,
    }),
  }));
}
