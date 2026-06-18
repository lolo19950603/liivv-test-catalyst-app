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
import {
  aggregatePhysicalLineItems,
  buildCheckoutShippingSections,
  getSectionLineSnapshots,
  getSectionShippingQuoteSubtotal,
} from '~/lib/checkout/checkout-section-shipping';
import { filterShippingOptionsBySubtotal } from '~/lib/checkout/shipping-rules';
import { expandCartLineItemForProduct } from '~/lib/checkout/expand-cart-line-items';
import { mapCartSelectedOptionsToProductOptions } from '~/lib/checkout/map-cart-options';
import { getLineSubtotal, isDeferredSubscriptionLine } from '~/lib/checkout/subscription-charge-timing';
import { getSubscriptionLinesForCart, findSubscriptionLineByKey } from '~/lib/checkout/subscription-lines';
import {
  getSectionShippingState,
  SECTION_SHIPPING_QUOTE_VERSION,
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
    isRecommended?: boolean | null;
  }> | null | undefined,
): SectionShippingOption[] {
  return (options ?? []).map((option) => ({
    entityId: option.entityId,
    description: option.description,
    cost: option.cost.value,
    isRecommended: option.isRecommended ?? undefined,
  }));
}

function prorateShippingOptions(
  options: SectionShippingOption[],
  sectionSubtotal: number,
  totalSubtotal: number,
): SectionShippingOption[] {
  if (totalSubtotal <= 0 || sectionSubtotal <= 0) {
    return options;
  }

  const ratio = sectionSubtotal / totalSubtotal;

  return options.map((option) => ({
    ...option,
    cost:
      option.cost === 0
        ? 0
        : Math.round(option.cost * ratio * 100) / 100,
  }));
}

function pickDefaultShippingOption(
  options: SectionShippingOption[],
  existingOptionId?: string,
): SectionShippingOption | undefined {
  if (options.length === 0) {
    return undefined;
  }

  if (existingOptionId) {
    const existing = options.find((option) => option.entityId === existingOptionId);

    if (existing) {
      return existing;
    }
  }

  return (
    options.find((option) => option.cost === 0) ??
    options.find((option) => option.isRecommended) ??
    options[0]
  );
}

async function getCheckoutLineSnapshots(cartId: string): Promise<CheckoutLineItemSnapshot[]> {
  const data = await getCart({ cartId });
  const cart = data.site.cart;

  if (!cart) {
    return [];
  }

  const subscriptionLines = await getSubscriptionLinesForCart(cartId);

  return cart.lineItems.physicalItems
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
    });
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
  if (lineItems.length === 0) {
    return null;
  }

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

async function fetchShippingOptionsForLineItems({
  checkoutEntityId,
  consignmentEntityId,
  address,
  lineItems,
}: {
  checkoutEntityId: string;
  consignmentEntityId?: string;
  address: ShippingAddress;
  lineItems: Array<{ lineItemEntityId: string; quantity: number }>;
}): Promise<{ options: SectionShippingOption[]; consignmentEntityId?: string }> {
  const checkout = await ensureShippingConsignment({
    checkoutEntityId,
    consignmentEntityId,
    address,
    lineItems,
  });

  if (!checkout) {
    return { options: [], consignmentEntityId };
  }

  const consignment = checkout.shippingConsignments?.[0];

  return {
    options: mapShippingOptions(consignment?.availableShippingOptions),
    consignmentEntityId: consignment?.entityId ?? consignmentEntityId,
  };
}

export async function quoteAllCheckoutSectionShipping(): Promise<{ hasOptions: boolean }> {
  const cartId = await getCartId();

  if (!cartId) {
    return { hasOptions: false };
  }

  const data = await getCart({ cartId });
  const checkout = data.site.checkout;

  if (!checkout?.entityId) {
    return { hasOptions: false };
  }

  const shippingConsignment =
    checkout.shippingConsignments?.find((consignment) => consignment.address?.countryCode) ??
    checkout.shippingConsignments?.[0];

  const address = shippingConsignment?.address;

  if (!address?.countryCode) {
    return { hasOptions: false };
  }

  const lineSnapshots = await getCheckoutLineSnapshots(cartId);
  const sections = buildCheckoutShippingSections(lineSnapshots).filter(
    (section) => section.requiresShipping,
  );

  if (sections.length === 0) {
    return { hasOptions: false };
  }

  const cartSubtotal = checkout.subtotal?.value ?? 0;
  const shippingAddress: ShippingAddress = {
    countryCode: address.countryCode,
    city: address.city ?? undefined,
    stateOrProvince: address.stateOrProvince ?? undefined,
    postalCode: address.postalCode ?? undefined,
  };

  const allPhysicalLineItems = aggregatePhysicalLineItems(lineSnapshots);
  const totalPhysicalSubtotal = lineSnapshots
    .filter((line) => line.isPhysical)
    .reduce((sum, line) => sum + getLineSubtotal(line), 0);

  let consignmentEntityId = shippingConsignment?.entityId;
  let hasOptions = false;

  // Quote the full cart so BigCommerce order-level rules (e.g. free shipping over $200) apply.
  const fullQuote = await fetchShippingOptionsForLineItems({
    checkoutEntityId: checkout.entityId,
    consignmentEntityId,
    address: shippingAddress,
    lineItems: allPhysicalLineItems,
  });

  consignmentEntityId = fullQuote.consignmentEntityId ?? consignmentEntityId;
  const fullCartOptions = fullQuote.options;

  if (fullCartOptions.length > 0) {
    hasOptions = true;
  }

  for (const section of [
    ...sections.filter((candidate) => candidate.id !== 'due-today'),
    ...sections.filter((candidate) => candidate.id === 'due-today'),
  ]) {
    const sectionSubtotal = getSectionLineSnapshots(section.id, lineSnapshots).reduce(
      (sum, line) => sum + getLineSubtotal(line),
      0,
    );

    try {
      let options: SectionShippingOption[];

      if (section.id === 'due-today') {
        // Full-cart quote for BC rates; eligibility uses due-today lines only (not deferred).
        options = filterShippingOptionsBySubtotal(fullCartOptions, sectionSubtotal);
      } else {
        // Deferred sections are quoted on their own line items so BC thresholds match that shipment.
        const sectionQuote = await fetchShippingOptionsForLineItems({
          checkoutEntityId: checkout.entityId,
          consignmentEntityId,
          address: shippingAddress,
          lineItems: section.physicalLineItems,
        });

        consignmentEntityId = sectionQuote.consignmentEntityId ?? consignmentEntityId;
        options = filterShippingOptionsBySubtotal(sectionQuote.options, sectionSubtotal);

        if (options.length === 0) {
          const paidOptions = fullCartOptions.filter((option) => option.cost > 0);

          options = prorateShippingOptions(paidOptions, sectionSubtotal, totalPhysicalSubtotal);
        }

        if (options.length > 0) {
          hasOptions = true;
        }
      }

      const quotedSubtotal = getSectionShippingQuoteSubtotal(section.id, lineSnapshots);
      const existing = (await getSectionShippingState(cartId))[section.id];
      const selectedOption = pickDefaultShippingOption(options, existing?.selectedOptionId);

      await updateSectionShippingEntry(cartId, section.id, {
        options,
        selectedOptionId: selectedOption?.entityId,
        selectedCost: selectedOption?.cost,
        selectedDescription: selectedOption?.description,
        quoteVersion: SECTION_SHIPPING_QUOTE_VERSION,
        quotedSubtotal,
      });

      if (section.id === 'due-today') {
        try {
          await syncImmediateCheckoutConsignment();
        } catch (syncError) {
          // eslint-disable-next-line no-console
          console.error('Failed to sync due-today shipping after quote:', syncError);
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Failed to quote shipping for section ${section.id}:`, error);
    }
  }

  try {
    await syncImmediateCheckoutConsignment();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to sync immediate checkout consignment:', error);
  }

  revalidateTag(TAGS.checkout, { expire: 0 });
  revalidateTag(TAGS.cart, { expire: 0 });

  return { hasOptions };
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
  const allPhysicalLineItems = aggregatePhysicalLineItems(lineSnapshots);

  const { consignmentEntityId } = await fetchShippingOptionsForLineItems({
    checkoutEntityId: checkout.entityId,
    consignmentEntityId: shippingConsignment?.entityId,
    address: {
      countryCode: address.countryCode,
      city: address.city ?? undefined,
      stateOrProvince: address.stateOrProvince ?? undefined,
      postalCode: address.postalCode ?? undefined,
    },
    lineItems: allPhysicalLineItems,
  });

  if (!consignmentEntityId || !immediateEntry?.selectedOptionId) {
    return;
  }

  await addShippingCost({
    checkoutEntityId: checkout.entityId,
    consignmentEntityId,
    shippingOptionEntityId: immediateEntry.selectedOptionId,
  });
}

/** Apply KV due-today shipping to BigCommerce when consignment selection is out of sync (fixes stale tax). */
export async function ensureDueTodayShippingSyncedToCheckout(): Promise<boolean> {
  const cartId = await getCartId();

  if (!cartId) {
    return false;
  }

  const state = await getSectionShippingState(cartId);
  const dueToday = state['due-today'];

  if (!dueToday?.selectedOptionId) {
    return false;
  }

  const data = await getCart({ cartId });
  const checkout = data.site.checkout;
  const consignment = checkout?.shippingConsignments?.[0];
  const bcSelectedOptionId = consignment?.selectedShippingOption?.entityId;

  if (bcSelectedOptionId === dueToday.selectedOptionId) {
    return false;
  }

  await syncImmediateCheckoutConsignment();

  return true;
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
    quoteVersion: entry?.quoteVersion,
    quotedSubtotal: entry?.quotedSubtotal,
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
