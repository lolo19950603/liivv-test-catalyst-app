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
import { buildAppUrl } from '~/lib/stripe/config';
import { isStripeConfigured } from '~/lib/stripe/client';
import { getCartId } from '~/lib/cart';
import { buildCheckoutSummarySections } from '~/lib/checkout/build-checkout-summary';
import type { CheckoutDisplayLineInput } from '~/lib/checkout/build-checkout-summary';
import { buildCheckoutShippingSections } from '~/lib/checkout/checkout-section-shipping';
import {
  getSectionShippingCosts,
  getSectionShippingState,
  isSectionShippingReady,
  SECTION_SHIPPING_QUOTE_VERSION,
} from '~/lib/checkout/section-shipping-storage';

import { initializePayment, prepareOrderConfirmation } from './_actions/initialize-payment';
import { formatSectionShippingOptions } from './_actions/section-shipping';

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
  const checkout = data.site.checkout;

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
    ...cart!.lineItems.physicalItems
      .filter((item) => !item.parentEntityId)
      .map((item) => ({ item, isPhysical: true as const })),
    ...cart!.lineItems.digitalItems
      .filter((item) => !item.parentEntityId)
      .map((item) => ({ item, isPhysical: false as const })),
  ];

  const checkoutLines: CheckoutDisplayLineInput[] = physicalAndDigital.map(({ item, isPhysical }) => {
    const productOptions = mapCartSelectedOptionsToProductOptions(item.selectedOptions);
    const unitPrice = item.salePrice?.value ?? item.listPrice.value;
    const unitAmount = Math.round(unitPrice * 100);

    return {
      id: item.entityId,
      title: item.name,
      subtitle: item.sku ?? undefined,
      imageUrl: item.image?.url,
      quantity: item.quantity,
      unitPrice,
      currencyCode: item.listPrice.currencyCode,
      isPhysical,
      snapshot: {
        lineItemEntityId: item.entityId,
        productEntityId: item.productEntityId,
        variantEntityId: item.variantEntityId ?? undefined,
        sku: item.sku ?? undefined,
        name: item.name,
        quantity: item.quantity,
        unitAmount,
        currency: item.listPrice.currencyCode,
        productOptions,
        isPhysical,
      },
      display: {
        id: item.entityId,
        title: item.name,
        subtitle: item.sku ?? undefined,
        imageUrl: item.image?.url,
        quantity: item.quantity,
        price: format.number(unitPrice * item.quantity, {
          style: 'currency',
          currency: item.listPrice.currencyCode,
        }),
      },
    };
  });

  const shippingConsignment =
    checkout?.shippingConsignments?.find((consignment) => consignment.selectedShippingOption) ||
    checkout?.shippingConsignments?.[0];

  const snapshotLines = checkoutLines.map((line) => line.snapshot);
  const shippingSections = buildCheckoutShippingSections(snapshotLines);
  const sectionShippingState = await getSectionShippingState(cartId);
  const hasShippingAddress = Boolean(shippingConsignment?.address?.countryCode);
  const needsSectionShippingQuote =
    hasShippingAddress &&
    shippingSections.some((section) => {
      if (!section.requiresShipping) {
        return false;
      }

      const entry = sectionShippingState[section.id];

      return (
        !(entry?.options?.length ?? 0) ||
        (entry?.quoteVersion ?? 0) !== SECTION_SHIPPING_QUOTE_VERSION
      );
    });
  const shippingQuoteKey = shippingConsignment?.address?.countryCode
    ? [
        shippingConsignment.address.countryCode,
        shippingConsignment.address.city ?? '',
        shippingConsignment.address.postalCode ?? '',
        shippingConsignment.address.stateOrProvince ?? '',
        String(checkout?.subtotal?.value ?? 0),
      ].join('|')
    : undefined;

  const sectionShippingCosts = getSectionShippingCosts(sectionShippingState);
  const requiresShipping = shippingSections.some((section) => section.requiresShipping);
  const shippingReady =
    !requiresShipping || isSectionShippingReady(shippingSections, sectionShippingState);
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
    if (!section.requiresShipping) {
      continue;
    }

    const entry = sectionShippingState[section.id];
    const shippingOptions = entry
      ? await formatSectionShippingOptions(entry.options, currencyCode)
      : [];
    const selectedOption = entry?.options.find(
      (option) => option.entityId === entry.selectedOptionId,
    );

    sectionShippingUi[section.id] = {
      requiresShipping: section.requiresShipping,
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
      sectionTitle: t('title'),
      subtotal: t('summary.subtotal'),
      shipping: t('summary.shipping'),
      tax: t('summary.tax'),
      total: t('summary.total'),
    },
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
            requiresShipping={requiresShipping}
            returnUrl={buildAppUrl('/checkout/success/', locale)}
            savedAddresses={savedAddresses}
            states={statesOrProvinces}
            shippingReady={shippingReady}
            shippingRequiredMessage={
              requiresShipping && !shippingReady
                ? t('payment.shippingRequired')
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
