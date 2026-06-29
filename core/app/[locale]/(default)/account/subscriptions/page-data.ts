import 'server-only';

import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { getProductsByIds } from '~/client/queries/get-products';
import { graphql } from '~/client/graphql';
import { TAGS } from '~/client/tags';
import { getCustomerAddresses } from '~/app/[locale]/(default)/account/addresses/page-data';
import { isStripeConfigured } from '~/lib/stripe/client';
import {
  findStripeCustomerIdByEmail,
  resolveStripeCustomerId,
} from '~/lib/stripe/customers';
import { enrichSubscriptionsForPortal } from '~/lib/stripe/enrich-subscriptions-for-portal';
import { resolveSubscriptionVariantDisplays } from '~/lib/stripe/resolve-subscription-variant-display';
import { finalizeDueShipmentsForCustomer } from '~/lib/stripe/finalize-subscription-shipment';
import { getFinalizedShipmentsForCustomer } from '~/lib/stripe/subscription-shipment-records';
import type { FinalizedShipmentRecord } from '~/lib/stripe/subscription-shipment-records';
import {
  getCustomerSubscriptions,
  getStripeCustomerShippingAddress,
} from '~/lib/stripe/subscriptions';

const SubscriptionsCustomerQuery = graphql(`
  query SubscriptionsCustomerQuery {
    customer {
      entityId
      email
    }
  }
`);

export type SubscriptionsPageResult =
  | {
      kind: 'ready';
      bigcommerceCustomerId: number;
      stripeCustomerId: string;
      subscriptions: Awaited<ReturnType<typeof getCustomerSubscriptions>>;
      finalizedShipments: FinalizedShipmentRecord[];
    }
  | { kind: 'not-configured' }
  | { kind: 'customer-not-found' }
  | { kind: 'no-stripe-customer' };

export const getSubscriptionsPageData = cache(async (): Promise<SubscriptionsPageResult> => {
  if (!isStripeConfigured()) {
    return { kind: 'not-configured' };
  }

  const customerAccessToken = await getSessionCustomerAccessToken();

  if (!customerAccessToken) {
    return { kind: 'customer-not-found' };
  }

  const response = await client.fetch({
    document: SubscriptionsCustomerQuery,
    customerAccessToken,
    fetchOptions: {
      cache: 'no-store',
      next: { tags: [TAGS.customer] },
    },
  });

  const customer = response.data.customer;

  if (!customer) {
    return { kind: 'customer-not-found' };
  }

  let stripeCustomerId = await resolveStripeCustomerId(customer.entityId);

  if (!stripeCustomerId) {
    stripeCustomerId = await findStripeCustomerIdByEmail(customer.email);
  }

  if (!stripeCustomerId) {
    return { kind: 'no-stripe-customer' };
  }

  const subscriptions = await getCustomerSubscriptions(stripeCustomerId);

  await finalizeDueShipmentsForCustomer({
    customerId: customer.entityId,
    stripeCustomerId,
    subscriptions,
  });

  const refreshedSubscriptions = await getCustomerSubscriptions(stripeCustomerId);
  const productEntityIds = [
    ...new Set(
      refreshedSubscriptions
        .map((subscription) => subscription.productEntityId)
        .filter((productEntityId): productEntityId is number => productEntityId != null),
    ),
  ];
  const [productsResult, addressData, stripeCustomerShipping, variantDisplaysBySubscriptionId] =
    await Promise.all([
      productEntityIds.length > 0 ? getProductsByIds({ entityIds: productEntityIds }) : null,
      getCustomerAddresses({ limit: 50 }),
      getStripeCustomerShippingAddress(stripeCustomerId),
      resolveSubscriptionVariantDisplays(refreshedSubscriptions),
    ]);
  const productImagesByEntityId = new Map<
    number,
    { src: string; alt: string }
  >();

  if (productsResult?.status === 'success') {
    for (const product of productsResult.products) {
      if (product.defaultImage?.url) {
        productImagesByEntityId.set(product.entityId, {
          src: product.defaultImage.url,
          alt: product.defaultImage.altText || product.name,
        });
      }
    }
  }

  const enrichedSubscriptions = enrichSubscriptionsForPortal(refreshedSubscriptions, {
    customerAddresses: addressData?.addresses ?? [],
    stripeCustomerShipping,
    productImagesByEntityId,
    variantDisplaysBySubscriptionId,
  });

  const finalizedShipments = await getFinalizedShipmentsForCustomer(customer.entityId);

  return {
    kind: 'ready',
    bigcommerceCustomerId: customer.entityId,
    stripeCustomerId,
    subscriptions: enrichedSubscriptions,
    finalizedShipments,
  };
});

export async function resolveStripeCustomerIdForAccount(): Promise<string | null> {
  const data = await getSubscriptionsPageData();

  if (data.kind !== 'ready') {
    return null;
  }

  return data.stripeCustomerId;
}

export async function syncSubscriptionShipmentsForAccount(): Promise<void> {
  const customerAccessToken = await getSessionCustomerAccessToken();

  if (!customerAccessToken || !isStripeConfigured()) {
    return;
  }

  const response = await client.fetch({
    document: SubscriptionsCustomerQuery,
    customerAccessToken,
    fetchOptions: { cache: 'no-store' },
  });
  const customer = response.data.customer;

  if (!customer) {
    return;
  }

  const stripeCustomerId = await resolveStripeCustomerId(customer.entityId);

  if (!stripeCustomerId) {
    return;
  }

  const subscriptions = await getCustomerSubscriptions(stripeCustomerId);

  await finalizeDueShipmentsForCustomer({
    customerId: customer.entityId,
    stripeCustomerId,
    subscriptions,
  });
}
