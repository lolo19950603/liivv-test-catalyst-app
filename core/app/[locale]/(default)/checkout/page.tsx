import { Metadata } from 'next';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';

import { CustomCheckout } from '@/vibes/soul/sections/custom-checkout';
import { BillingAddressForm } from '~/components/checkout/billing-address-form';
import { CheckoutPaymentSection } from '~/components/checkout/checkout-payment-section';
import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { redirect } from '~/i18n/routing';
import { getCart } from '~/app/[locale]/(default)/cart/page-data';
import { mapCartSelectedOptionsToProductOptions } from '~/lib/checkout/map-cart-options';
import { matchSubscriptionLine, getSubscriptionLinesForCart } from '~/lib/checkout/subscription-lines';
import { buildAppUrl } from '~/lib/stripe/config';
import { isStripeConfigured } from '~/lib/stripe/client';
import { getCartId } from '~/lib/cart';
import { exists } from '~/lib/utils';

import { initializePayment } from './_actions/initialize-payment';

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
  const subscriptionLines = await getSubscriptionLinesForCart(cartId);

  const physicalAndDigital = [...cart.lineItems.physicalItems, ...cart.lineItems.digitalItems];

  const lineItems = physicalAndDigital.map((item) => {
    const productOptions = mapCartSelectedOptionsToProductOptions(item.selectedOptions);
    const subscription = matchSubscriptionLine(
      subscriptionLines,
      item.productEntityId,
      productOptions,
    );
    const unitPrice = item.salePrice?.value ?? item.listPrice.value;

    return {
      id: item.entityId,
      title: item.name,
      subtitle: item.sku ?? undefined,
      price: format.number(unitPrice * item.quantity, {
        style: 'currency',
        currency: item.listPrice.currencyCode,
      }),
      badge: subscription ? t('subscriptionBadge') : undefined,
    };
  });

  const shippingConsignment = checkout?.shippingConsignments?.find(
    (consignment) => consignment.selectedShippingOption,
  );

  const shippingReady = Boolean(shippingConsignment?.selectedShippingOption);

  const summaryItems = [
    checkout?.subtotal
      ? {
          label: t('summary.subtotal'),
          value: format.number(checkout.subtotal.value, {
            style: 'currency',
            currency: checkout.subtotal.currencyCode,
          }),
        }
      : null,
    checkout?.shippingCostTotal
      ? {
          label: t('summary.shipping'),
          value: format.number(checkout.shippingCostTotal.value, {
            style: 'currency',
            currency: checkout.shippingCostTotal.currencyCode,
          }),
        }
      : null,
    checkout?.taxTotal
      ? {
          label: t('summary.tax'),
          value: format.number(checkout.taxTotal.value, {
            style: 'currency',
            currency: checkout.taxTotal.currencyCode,
          }),
        }
      : null,
  ].filter(exists);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <CustomCheckout
        billingForm={
          <BillingAddressForm
            defaultValues={{
              firstName: customer?.firstName ?? '',
              lastName: customer?.lastName ?? '',
              email: customer?.email ?? '',
              address1: '',
              city: '',
              countryCode: shippingConsignment?.address?.countryCode ?? 'CA',
              postalCode: shippingConsignment?.address?.postalCode ?? '',
              stateOrProvince: shippingConsignment?.address?.stateOrProvince ?? undefined,
            }}
            id={BILLING_FORM_ID}
            labels={{
              firstName: t('billing.firstName'),
              lastName: t('billing.lastName'),
              email: t('billing.email'),
              company: t('billing.company'),
              address1: t('billing.address1'),
              address2: t('billing.address2'),
              city: t('billing.city'),
              stateOrProvince: t('billing.stateOrProvince'),
              countryCode: t('billing.countryCode'),
              postalCode: t('billing.postalCode'),
              phone: t('billing.phone'),
            }}
          />
        }
        billingTitle={t('billing.title')}
        lineItems={lineItems}
        paymentSection={
          <CheckoutPaymentSection
            billingFormId={BILLING_FORM_ID}
            continueLabel={t('payment.continue')}
            initializePaymentAction={initializePayment}
            returnUrl={buildAppUrl('/checkout/success/', locale)}
            submitLabel={t('payment.submit')}
          />
        }
        paymentTitle={t('payment.title')}
        shippingWarning={shippingReady ? undefined : t('shippingRequired')}
        shippingWarningCta={shippingReady ? undefined : t('shippingRequiredCta')}
        summaryItems={summaryItems}
        title={t('title')}
        total={
          checkout?.grandTotal
            ? format.number(checkout.grandTotal.value, {
                style: 'currency',
                currency: checkout.grandTotal.currencyCode,
              })
            : '—'
        }
        totalLabel={t('summary.total')}
      />
    </div>
  );
}
