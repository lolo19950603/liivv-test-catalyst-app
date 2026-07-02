import { Metadata } from 'next';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';

import { CustomCheckout } from '@/vibes/soul/sections/custom-checkout';
import { CheckoutFulfillmentSection } from '~/components/checkout/checkout-fulfillment-section';
import { CheckoutSectionShippingQuoter } from '~/components/checkout/checkout-section-shipping-quoter';
import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { redirect } from '~/i18n/routing';
import { getCart, getShippingCountries } from '~/app/[locale]/(default)/cart/page-data';
import { getCustomerAddresses } from '~/app/[locale]/(default)/account/addresses/page-data';
import { updateShippingInfo } from '~/app/[locale]/(default)/cart/_actions/update-shipping-info';
import { mapCartSelectedOptionsToProductOptions } from '~/lib/checkout/map-cart-options';
import { formatCartSelectedOptionsSubtitle } from '~/lib/checkout/format-cart-selected-options-subtitle';
import {
  expandGroupedCartLineItems,
} from '~/lib/checkout/expand-cart-line-items';
import {
  getSubscriptionLineDetails,
} from '~/lib/checkout/format-subscription-line';
import type { SubscriptionBillingInterval } from '~/lib/stripe/subscription-interval';
import {
  findSubscriptionLineByKey,
  getSubscriptionLinesForCart,
  reconcileSubscriptionLinesWithCart,
} from '~/lib/checkout/subscription-lines';
import { buildAppUrl } from '~/lib/stripe/config';
import { isStripeConfigured } from '~/lib/stripe/client';
import { getCartId } from '~/lib/cart';
import { buildCheckoutSummarySections } from '~/lib/checkout/build-checkout-summary';
import type { CheckoutDisplayLineInput } from '~/lib/checkout/build-checkout-summary';
import { buildCheckoutShippingSections, getSectionShippingQuoteSubtotal } from '~/lib/checkout/checkout-section-shipping';
import { filterShippingOptionsBySubtotal } from '~/lib/checkout/shipping-rules';
import { filterCustomerVisibleShippingOptions } from '~/lib/checkout/shipping-option-filters';
import {
  getSectionShippingCosts,
  getSectionShippingState,
  isSectionShippingQuoteStale,
  isSectionShippingReady,
} from '~/lib/checkout/section-shipping-storage';

import { initializePayment, prepareOrderConfirmation } from './_actions/initialize-payment';
import {
  ensureDueTodayShippingSyncedToCheckout,
  formatSectionShippingOptions,
} from './_actions/section-shipping';

interface Props {
  params: Promise<{ locale: string }>;
}

const BILLING_FORM_ID = 'custom-checkout-billing-form';

const CheckoutPageCustomerQuery = graphql(`
  query CheckoutPageCustomerQuery {
    customer {
      firstName
      lastName
      email
    }
  }
`);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Checkout' });

  return {
    title: t('title'),
  };
}

export default async function CheckoutPage({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations('Checkout');

  if (!isStripeConfigured()) {
    redirect({ href: '/cart/', locale });
  }

  const customerAccessToken = await getSessionCustomerAccessToken();

  if (!customerAccessToken) {
    redirect({ href: '/login?redirectTo=/checkout/', locale });
  }

  const cartId = await getCartId();

  if (!cartId) {
    redirect({ href: '/cart/', locale });
  }

  const data = await getCart({ cartId });
  const cart = data.site.cart;
  let checkout = data.site.checkout;

  if (!cart || cart.lineItems.totalQuantity === 0) {
    redirect({ href: '/cart/', locale });
  }

  const customerResponse = await client.fetch({
    document: CheckoutPageCustomerQuery,
    customerAccessToken,
    fetchOptions: { cache: 'no-store' },
  });

  const customer = customerResponse.data.customer;
  const format = await getFormatter();

  const physicalAndDigital = [
    ...cart.lineItems.physicalItems
      .filter((item) => !item.parentEntityId)
      .map((item) => ({ item, isPhysical: true as const })),
    ...cart.lineItems.digitalItems
      .filter((item) => !item.parentEntityId)
      .map((item) => ({ item, isPhysical: false as const })),
  ];

  const subscriptionLines = await reconcileSubscriptionLinesWithCart(
    cartId,
    physicalAndDigital.map(({ item }) => item),
  );
  const formatInterval = ({ interval, intervalCount }: SubscriptionBillingInterval) => {
    if (intervalCount === 1) {
      return t(`intervals.${interval}` as 'intervals.month');
    }

    return t(`intervals.${interval}Plural` as 'intervals.monthPlural', { count: intervalCount });
  };

  const buildCheckoutLinesForItems = (
    items: (typeof physicalAndDigital)[number]['item'][],
    isPhysical: boolean,
  ): CheckoutDisplayLineInput[] =>
    expandGroupedCartLineItems({
      cartLineItems: items,
      subscriptionLines,
      buildBaseItem: (item, totalQuantity, lineItemEntityId) => {
        const variantSubtitle = formatCartSelectedOptionsSubtitle(item.selectedOptions, item.sku);
        const unitPrice = item.salePrice?.value ?? item.listPrice.value;

        return {
          id: lineItemEntityId,
          quantity: totalQuantity,
          title: item.name,
          subtitle: variantSubtitle,
          imageUrl: item.image?.url,
          unitPrice,
          currencyCode: item.listPrice.currencyCode,
          productEntityId: item.productEntityId,
          variantEntityId: item.variantEntityId,
          sku: item.sku,
          productOptions: mapCartSelectedOptionsToProductOptions(item.selectedOptions),
          variantSubtitle,
        };
      },
      applySubscription: () => ({}),
    }).map((line) => {
      const subscription =
        line.purchaseType === 'subscription' && line.subscriptionLineKey
          ? findSubscriptionLineByKey(subscriptionLines, line.subscriptionLineKey)
          : undefined;

      const subscriptionDetails = subscription
        ? getSubscriptionLineDetails(subscription, {
            billingLabel: t('subscriptionBilling'),
            startsTodayLabel: t('subscriptionStartsToday'),
            billedOnLabel: t('subscriptionBilledOn'),
            formatInterval,
            formatStartsDate: (timestamp) =>
              format.dateTime(new Date(timestamp * 1000), { dateStyle: 'medium' }),
          })
        : undefined;

      const unitAmount = Math.round(line.unitPrice * 100);
      const billingCycleAnchor = subscription?.billingCycleAnchor;
      const isSubscription = line.purchaseType === 'subscription';

      return {
        id: line.id,
        title: line.title,
        subtitle: line.subtitle,
        imageUrl: line.imageUrl,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        currencyCode: line.currencyCode,
        isPhysical,
        isSubscription,
        billingCycleAnchor,
        badge: isSubscription ? t('subscriptionBadge') : undefined,
        subscriptionDetails: isSubscription ? subscriptionDetails : undefined,
        snapshot: {
          lineItemEntityId: line.lineItemEntityId,
          productEntityId: line.productEntityId,
          variantEntityId: line.variantEntityId ?? undefined,
          sku: line.sku ?? undefined,
          name: line.title,
          quantity: line.quantity,
          unitAmount,
          currency: line.currencyCode,
          productOptions: line.productOptions,
          isPhysical,
          isSubscription,
          billingInterval: subscription?.billingInterval,
          billingCycleAnchor,
          ...(line.variantSubtitle ? { variantSubtitle: line.variantSubtitle } : {}),
        },
        display: {
          id: line.id,
          title: line.title,
          subtitle: line.subtitle,
          imageUrl: line.imageUrl,
          quantity: line.quantity,
          price: format.number(line.unitPrice * line.quantity, {
            style: 'currency',
            currency: line.currencyCode,
          }),
          badge: isSubscription ? t('subscriptionBadge') : undefined,
          subscriptionDetails: isSubscription ? subscriptionDetails : undefined,
        },
      } satisfies CheckoutDisplayLineInput;
    });

  const checkoutLines: CheckoutDisplayLineInput[] = [
    ...buildCheckoutLinesForItems(
      cart.lineItems.physicalItems.filter((item) => !item.parentEntityId),
      true,
    ),
    ...buildCheckoutLinesForItems(
      cart.lineItems.digitalItems.filter((item) => !item.parentEntityId),
      false,
    ),
  ];

  const snapshotLines = checkoutLines.map((line) => line.snapshot);
  const shippingSections = buildCheckoutShippingSections(snapshotLines);
  const sectionShippingState = await getSectionShippingState(cartId);

  if (await ensureDueTodayShippingSyncedToCheckout()) {
    const refreshed = await getCart({ cartId });
    checkout = refreshed.site.checkout;
  }

  const shippingConsignment =
    checkout?.shippingConsignments?.find((consignment) => consignment.selectedShippingOption) ||
    checkout?.shippingConsignments?.[0];

  const cartSubtotal = checkout?.subtotal?.value ?? 0;
  const hasShippingAddress = Boolean(shippingConsignment?.address?.countryCode);
  const requiresSectionShippingQuote =
    hasShippingAddress && shippingSections.some((section) => section.requiresShippingMethod);
  const shippingQuoteKey =
    requiresSectionShippingQuote && shippingConsignment?.address?.countryCode
      ? [
          shippingConsignment.address.countryCode,
          shippingConsignment.address.city ?? '',
          shippingConsignment.address.postalCode ?? '',
          shippingConsignment.address.stateOrProvince ?? '',
          ...shippingSections.map(
            (section) =>
              `${section.id}:${getSectionShippingQuoteSubtotal(section.id, snapshotLines)}`,
          ),
        ].join('|')
      : undefined;
  const needsSectionShippingQuote =
    requiresSectionShippingQuote &&
    shippingSections.some((section) => {
      if (!section.requiresShippingMethod) {
        return false;
      }

      const entry = sectionShippingState[section.id];
      const expectedSubtotal = getSectionShippingQuoteSubtotal(section.id, snapshotLines);

      return isSectionShippingQuoteStale(entry, expectedSubtotal);
    });

  const sectionShippingCosts = getSectionShippingCosts(sectionShippingState);
  const requiresShippingAddress = shippingSections.some(
    (section) => section.requiresShippingAddress,
  );
  const requiresShippingMethod = shippingSections.some((section) => section.requiresShippingMethod);
  const shippingMethodReady =
    !requiresShippingMethod || isSectionShippingReady(shippingSections, sectionShippingState);
  const shippingAddressReady = !requiresShippingAddress || hasShippingAddress;
  const shippingReady = shippingMethodReady && shippingAddressReady;
  const currencyCode = checkout?.grandTotal?.currencyCode ?? 'USD';

  const sectionShippingUi: Record<
    string,
    {
      requiresShipping: boolean;
      shippingOptions: Array<{ value: string; label: string; price: string }>;
      selectedShippingOption?: { value: string; label: string; price: string };
    }
  > = {};

  for (const section of shippingSections) {
    if (!section.requiresShippingMethod) {
      continue;
    }

    const entry = sectionShippingState[section.id];
    const expectedSubtotal = getSectionShippingQuoteSubtotal(section.id, snapshotLines);
    const quoteIsCurrent = entry && !isSectionShippingQuoteStale(entry, expectedSubtotal);
    const filteredOptions =
      quoteIsCurrent && entry
        ? filterShippingOptionsBySubtotal(
            filterCustomerVisibleShippingOptions(entry.options),
            expectedSubtotal,
          )
        : [];
    const shippingOptions =
      filteredOptions.length > 0
        ? await formatSectionShippingOptions(filteredOptions, currencyCode)
        : [];
    const selectedOption =
      quoteIsCurrent && entry
        ? filteredOptions.find((option) => option.entityId === entry.selectedOptionId)
        : undefined;

    sectionShippingUi[section.id] = {
      requiresShipping: section.requiresShippingMethod,
      shippingOptions,
      selectedShippingOption:
        selectedOption && entry?.selectedOptionId
          ? {
              value: entry.selectedOptionId,
              label: selectedOption.description,
              price: format.number(selectedOption.cost, {
                style: 'currency',
                currency: currencyCode,
              }),
            }
          : undefined,
    };
  }

  const shippingCountries = await getShippingCountries();

  const countries = shippingCountries.map((country) => ({
    value: country.code,
    label: country.name,
  }));

  const blacklistedUSStates = new Set([
    'Armed Forces Africa',
    'Armed Forces Canada',
    'Armed Forces Middle East',
  ]);

  const statesOrProvinces = shippingCountries.map((country) => ({
    country: country.code,
    states: country.statesOrProvinces
      .filter((state) => country.code !== 'US' || !blacklistedUSStates.has(state.name))
      .map((state) => ({
        value: state.abbreviation,
        label: state.name,
      })),
  }));

  const addressData = await getCustomerAddresses({ limit: 50 });
  const savedAddresses = (addressData?.addresses ?? []).map((entry, index) => ({
    id: entry.entityId.toString(),
    firstName: entry.firstName,
    lastName: entry.lastName,
    company: entry.company ?? undefined,
    address1: entry.address1,
    address2: entry.address2 ?? undefined,
    city: entry.city,
    stateOrProvince: entry.stateOrProvince ?? undefined,
    countryCode: entry.countryCode,
    postalCode: entry.postalCode ?? undefined,
    phone: entry.phone ?? undefined,
    isDefault: index === 0,
  }));

  const defaultSavedAddress = savedAddresses[0];

  const billingDefaults = {
    firstName: customer?.firstName ?? defaultSavedAddress?.firstName ?? '',
    lastName: customer?.lastName ?? defaultSavedAddress?.lastName ?? '',
    email: customer?.email ?? '',
    company: defaultSavedAddress?.company,
    address1: defaultSavedAddress?.address1 ?? '',
    address2: defaultSavedAddress?.address2,
    city: defaultSavedAddress?.city ?? shippingConsignment?.address?.city ?? '',
    countryCode:
      defaultSavedAddress?.countryCode ?? shippingConsignment?.address?.countryCode ?? 'CA',
    postalCode: defaultSavedAddress?.postalCode ?? shippingConsignment?.address?.postalCode ?? '',
    stateOrProvince:
      defaultSavedAddress?.stateOrProvince ??
      shippingConsignment?.address?.stateOrProvince ??
      undefined,
    phone: defaultSavedAddress?.phone,
  };

  const summarySections = buildCheckoutSummarySections({
    lines: checkoutLines,
    cartSubtotal: checkout?.subtotal?.value ?? 0,
    cartTax: checkout?.taxTotal?.value ?? 0,
    sectionShippingCosts,
    sectionShippingUi,
    formatMoney: (value) =>
      format.number(value, {
        style: 'currency',
        currency: currencyCode,
      }),
    labels: {
      orderSummaryTitle: t('summary.orderSummary'),
      formatBilledOnLineLabel: (date) => t('summary.chargeBilledOn', { date }),
      notInTotalNote: t('summary.notInTotal'),
      billedOnDetailPrefix: `${t('subscriptionBilledOn')}:`,
      subjectToChangeAtBillingNote: t('summary.subjectToChangeAtBilling'),
      subtotal: t('summary.subtotal'),
      shipping: t('summary.shipping'),
      tax: t('summary.tax'),
      dueTodayTotal: t('summary.dueTodayTotal'),
    },
    formatDeferredDate: (timestamp) =>
      format.dateTime(new Date(timestamp * 1000), { dateStyle: 'medium' }),
  });

  return (
    <CustomCheckout
      currencyCode={currencyCode}
      summaryLabels={{
        shippingTitle: t('shippingMethod.title'),
        shippingEmpty: t('shippingMethod.empty'),
        shippingSelect: t('shippingMethod.select'),
        shippingNoOptions: t('shippingMethod.noOptions'),
        shippingUpdating: t('shippingMethod.updating'),
      }}
      fulfillmentSection={
        <>
          <CheckoutSectionShippingQuoter
            needsQuote={needsSectionShippingQuote}
            quoteKey={shippingQuoteKey}
          />
          <CheckoutFulfillmentSection
          action={updateShippingInfo}
          address={
            shippingConsignment?.address
              ? {
                  country: shippingConsignment.address.countryCode,
                  city:
                    shippingConsignment.address.city !== ''
                      ? (shippingConsignment.address.city ?? undefined)
                      : undefined,
                  state:
                    shippingConsignment.address.stateOrProvince !== ''
                      ? (shippingConsignment.address.stateOrProvince ?? undefined)
                      : undefined,
                  postalCode:
                    shippingConsignment.address.postalCode !== ''
                      ? (shippingConsignment.address.postalCode ?? undefined)
                      : undefined,
                }
              : undefined
          }
          billingDefaults={billingDefaults}
          billingFormId={BILLING_FORM_ID}
          countries={countries}
          customerEmail={customer?.email ?? ''}
          initializePaymentAction={initializePayment}
          prepareOrderConfirmationAction={prepareOrderConfirmation}
          labels={{
            shipToTitle: t('shipTo.title'),
            shippingMethodTitle: t('shippingMethod.title'),
            shippingMethodEmpty: t('shippingMethod.empty'),
            shippingMethodSelect: t('shippingMethod.select'),
            shippingMethodNoOptions: t('shippingMethod.noOptions'),
            shippingMethodUpdating: t('shippingMethod.updating'),
            billingAddressTitle: t('billing.addressTitle'),
            sameAsShipping: t('billing.sameAsShipping'),
            differentBilling: t('billing.differentBilling'),
            useDifferentAddress: t('address.useDifferent'),
            addAddress: t('address.add'),
            defaultBadge: t('address.default'),
            paymentSecure: t('payment.secure'),
            firstName: t('billing.firstName'),
            lastName: t('billing.lastName'),
            email: t('billing.email'),
            company: t('billing.company'),
            address1: t('billing.address1'),
            address2: t('billing.address2'),
            city: t('billing.city'),
            stateOrProvince: t('billing.stateOrProvince'),
            country: t('billing.country'),
            postalCode: t('billing.postalCode'),
            phone: t('billing.phone'),
            addressModalTitle: t('address.modalTitle'),
            addressModalCancel: t('address.cancel'),
            addressModalSave: t('address.save'),
          }}
          paymentTitle={t('payment.title')}
          requiresShipping={requiresShippingAddress}
          returnUrl={buildAppUrl('/checkout/success/', locale)}
          savedAddresses={savedAddresses}
          states={statesOrProvinces}
          shippingReady={shippingReady}
          shippingRequiredMessage={
            !shippingReady
              ? !shippingAddressReady
                ? t('shipTo.required')
                : t('payment.shippingRequired')
              : undefined
          }
          submitLabel={t('payment.submit')}
        />
        </>
      }
      summarySections={summarySections}
    />
  );
}
