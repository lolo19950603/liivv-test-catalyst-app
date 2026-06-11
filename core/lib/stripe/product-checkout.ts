import 'server-only';

import { getLocale, getTranslations } from 'next-intl/server';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { PricingFragment } from '~/client/fragments/pricing';
import { graphql } from '~/client/graphql';
import { redirect } from '~/i18n/routing';
import { getPreferredCurrencyCode } from '~/lib/currency';

import { isStripeConfigured } from './client';
import { buildAppUrl } from './config';
import { getOrCreateStripeCustomer } from './customers';
import { getCheckoutCustomer } from './start-checkout';
import {
  getSubscriptionBillingIntervals,
  resolveSelectedSubscriptionBillingInterval,
} from './subscription-interval';
import { parseSubscriptionStartDateInput } from './subscription-start-date';
import { createProductSubscriptionCheckoutSession } from './subscriptions';

const ProductSubscriptionCheckoutQuery = graphql(
  `
    query ProductSubscriptionCheckoutQuery(
      $entityId: Int!
      $optionValueIds: [OptionValueId!]
      $useDefaultOptionSelections: Boolean
      $currencyCode: currencyCode
    ) {
      site {
        product(
          entityId: $entityId
          optionValueIds: $optionValueIds
          useDefaultOptionSelections: $useDefaultOptionSelections
        ) {
          entityId
          name
          sku
          ...PricingFragment
        }
      }
    }
  `,
  [PricingFragment],
);

function parseOptionValueIds(formData: FormData): Array<{
  optionEntityId: number;
  valueEntityId: number;
}> {
  return [...formData.entries()]
    .filter(([key]) => /^\d+$/.test(key))
    .map(([optionEntityId, value]) => ({
      optionEntityId: Number(optionEntityId),
      valueEntityId: Number(value),
    }))
    .filter(
      (option) => !Number.isNaN(option.optionEntityId) && !Number.isNaN(option.valueEntityId),
    );
}

function getSubscriptionUnitAmount(priceValue: number): number | null {
  if (!Number.isFinite(priceValue) || priceValue <= 0) {
    return null;
  }

  return Math.round(priceValue * 100);
}

export async function startProductSubscriptionCheckout(
  formData: FormData,
  {
    loginRedirectTo,
    successPath,
    cancelPath,
  }: {
    loginRedirectTo: string;
    successPath: string;
    cancelPath: string;
  },
) {
  const locale = await getLocale();
  const t = await getTranslations('Subscribe');

  if (!isStripeConfigured()) {
    throw new Error(t('errors.notConfigured'));
  }

  const customerAccessToken = await getSessionCustomerAccessToken();

  if (!customerAccessToken) {
    redirect({ href: `/login?redirectTo=${encodeURIComponent(loginRedirectTo)}`, locale });
  }

  const productEntityId = Number(formData.get('productEntityId'));

  if (!Number.isFinite(productEntityId)) {
    throw new Error(t('errors.invalidPlan'));
  }

  const optionValueIds = parseOptionValueIds(formData);
  const currencyCode = await getPreferredCurrencyCode();

  const { data } = await client.fetch({
    document: ProductSubscriptionCheckoutQuery,
    variables: {
      entityId: productEntityId,
      optionValueIds: optionValueIds.length > 0 ? optionValueIds : undefined,
      useDefaultOptionSelections: optionValueIds.length === 0,
      currencyCode,
    },
    customerAccessToken,
    fetchOptions: { cache: 'no-store' },
  });

  const product = data.site.product;

  if (!product) {
    throw new Error(t('errors.invalidPlan'));
  }

  const priceValue = product.prices?.salePrice?.value ?? product.prices?.price.value;
  const currency = product.prices?.price.currencyCode ?? currencyCode;
  const unitAmount = getSubscriptionUnitAmount(priceValue ?? 0);

  if (!unitAmount) {
    throw new Error(t('errors.unavailablePrice'));
  }

  const customer = await getCheckoutCustomer();

  if (!customer) {
    throw new Error(t('errors.customerNotFound'));
  }

  const stripeCustomerId = await getOrCreateStripeCustomer({
    bigcommerceCustomerId: customer.entityId,
    email: customer.email,
    name: [customer.firstName, customer.lastName].filter(Boolean).join(' '),
  });

  const allowedIntervals = getSubscriptionBillingIntervals();
  const billingInterval = resolveSelectedSubscriptionBillingInterval(
    formData.get('subscriptionInterval'),
    allowedIntervals,
  );

  const billingCycleAnchor = parseSubscriptionStartDateInput(
    formData.get('subscriptionStartDate'),
  );

  const checkoutUrl = await createProductSubscriptionCheckoutSession({
    stripeCustomerId,
    lineItem: {
      productEntityId: product.entityId,
      productName: product.name,
      sku: product.sku,
      unitAmount,
      currency,
      billingInterval,
    },
    bigcommerceCustomerId: customer.entityId,
    successUrl: `${buildAppUrl(successPath, locale)}?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: buildAppUrl(cancelPath, locale),
    billingCycleAnchor,
  });

  redirect({ href: checkoutUrl, locale });
}
