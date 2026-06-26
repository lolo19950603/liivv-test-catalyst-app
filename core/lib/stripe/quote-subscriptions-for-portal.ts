import 'server-only';

import {
  parseSubscriptionBillingContext,
  resolveSubscriptionBillingQuote,
} from './subscription-billing-quote';
import {
  parseProductOptionSelectionsFromMetadata,
} from '~/lib/bigcommerce/product-options';
import { parseSubscriptionShippingAddressFromMetadata } from '~/lib/checkout/subscription-shipping-metadata';

import type { CheckoutAddressSnapshot } from '../checkout/types';
import { isCanceledSubscription } from './transform-customer-subscriptions';
import type { CustomerSubscription } from './subscriptions';
import type { SubscriptionBillingQuote } from './subscription-billing-quote';

function applyQuotedSubscriptionAmounts(
  subscription: CustomerSubscription,
  quote: SubscriptionBillingQuote,
): Pick<CustomerSubscription, 'subtotalExTaxCents' | 'taxCents' | 'totalIncTaxCents'> {
  const billedSubtotal = Number(subscription.metadata.billed_subtotal_cents);
  const billedTax = Number(subscription.metadata.billed_tax_cents);
  const billedTotal = Number(subscription.metadata.billed_total_cents);

  if (
    quote.taxAmount === 0 &&
    Number.isFinite(billedTax) &&
    billedTax > 0 &&
    Number.isFinite(billedSubtotal) &&
    billedSubtotal > 0 &&
    quote.unitAmountExTax === billedSubtotal
  ) {
    return {
      subtotalExTaxCents: quote.unitAmountExTax,
      taxCents: billedTax,
      totalIncTaxCents:
        Number.isFinite(billedTotal) && billedTotal > 0
          ? billedTotal
          : quote.unitAmountExTax + billedTax,
    };
  }

  return {
    subtotalExTaxCents: quote.unitAmountExTax,
    taxCents: quote.taxAmount,
    totalIncTaxCents: quote.unitAmountIncTax,
  };
}

function toCheckoutQuoteAddress({
  email,
  address,
}: {
  email: string;
  address: {
    firstName: string;
    lastName: string;
    company?: string | null;
    address1: string;
    address2?: string | null;
    city: string;
    stateOrProvince?: string | null;
    countryCode: string;
    postalCode?: string | null;
    phone?: string | null;
  };
}): CheckoutAddressSnapshot {
  return {
    firstName: address.firstName,
    lastName: address.lastName,
    email,
    company: address.company ?? undefined,
    address1: address.address1,
    address2: address.address2 ?? undefined,
    city: address.city,
    stateOrProvince: address.stateOrProvince ?? undefined,
    countryCode: address.countryCode,
    postalCode: address.postalCode ?? '',
    phone: address.phone ?? undefined,
  };
}

function resolvePortalBillingContext(
  subscription: CustomerSubscription,
  fallbackCustomerId?: number,
) {
  const parsed = parseSubscriptionBillingContext(subscription.metadata);

  if (parsed) {
    return parsed;
  }

  if (
    fallbackCustomerId != null &&
    subscription.productEntityId != null &&
    subscription.productEntityId > 0
  ) {
    return {
      customerId: fallbackCustomerId,
      productEntityId: subscription.productEntityId,
      productOptions: parseProductOptionSelectionsFromMetadata(
        subscription.metadata?.bigcommerce_product_options,
      ),
      quantity: subscription.quantity,
      variantEntityId: subscription.variantEntityId,
    };
  }

  return null;
}

export async function quoteLivePricesForPortal(
  subscriptions: CustomerSubscription[],
  {
    bigcommerceCustomerId,
    customerEmail,
    customerAddresses = [],
  }: {
    bigcommerceCustomerId?: number;
    customerEmail?: string;
    customerAddresses?: Array<{
      firstName: string;
      lastName: string;
      company?: string | null;
      address1: string;
      address2?: string | null;
      city: string;
      stateOrProvince?: string | null;
      countryCode: string;
      postalCode?: string | null;
      phone?: string | null;
    }>;
  } = {},
): Promise<CustomerSubscription[]> {
  const savedAddress = customerAddresses[0];

  return Promise.all(
    subscriptions.map(async (subscription) => {
      if (isCanceledSubscription(subscription)) {
        return subscription;
      }

      const billingContext = resolvePortalBillingContext(subscription, bigcommerceCustomerId);

      if (!billingContext) {
        return subscription;
      }

      const quoteAddress =
        (customerEmail
          ? parseSubscriptionShippingAddressFromMetadata(subscription.metadata, customerEmail, {
              firstName: savedAddress?.firstName,
              lastName: savedAddress?.lastName,
              phone: savedAddress?.phone ?? undefined,
            })
          : undefined) ??
        (customerEmail && savedAddress?.address1 && savedAddress.countryCode
          ? toCheckoutQuoteAddress({ email: customerEmail, address: savedAddress })
          : undefined);

      try {
        const hadPlaceholderPricing = subscription.priceConfirmedAtBilling;
        const quote = await resolveSubscriptionBillingQuote({
          ...billingContext,
          billingAddress: quoteAddress,
          forPortalDisplay: true,
        });

        if (!quote) {
          return subscription;
        }

        if (!quote.inStock && quote.unitAmountExTax <= 0) {
          return subscription;
        }

        const amounts = applyQuotedSubscriptionAmounts(subscription, quote);
        const currency = (quote.currency ?? subscription.currency ?? 'usd').toLowerCase();

        return {
          ...subscription,
          currency,
          ...amounts,
          priceConfirmedAtBilling: hadPlaceholderPricing,
        };
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Failed to quote subscription ${subscription.id} for portal:`, error);

        return subscription;
      }
    }),
  );
}
