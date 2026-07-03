import { Metadata } from 'next';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';

import { SubscriptionList } from '@/vibes/soul/sections/subscription-list';
import { groupSubscriptionsForPortal } from '~/lib/stripe/transform-customer-subscriptions';

import { openBillingPortal } from './_actions/open-billing-portal';
import { cancelSubscriptionAction } from './_actions/cancel-subscription';
import {
  openAddPaymentMethodPortal,
} from './_actions/open-subscription-manage-portal';
import { updateSubscriptionPaymentMethodAction } from './_actions/update-subscription-payment-method';
import { retrySubscriptionPaymentItem } from './_actions/retry-subscription-payment';
import { skipSubscriptionDeliveryItem } from './_actions/skip-subscription-delivery';
import { getSubscriptionsPageData } from './page-data';
import { getStoreLogoFallback } from '~/lib/store-theme/get-store-logo-fallback';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Account.Subscriptions' });

  return {
    title: t('title'),
  };
}

export default async function SubscriptionsPage({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations('Account.Subscriptions');
  const format = await getFormatter();
  const [data, storeLogoFallback] = await Promise.all([
    getSubscriptionsPageData(),
    getStoreLogoFallback(),
  ]);

  if (data.kind === 'not-configured') {
    return (
      <SubscriptionList message={t('errors.notConfigured')} subscriptions={[]} title={t('title')} />
    );
  }

  if (data.kind === 'customer-not-found') {
    return (
      <SubscriptionList
        message={t('errors.customerNotFound')}
        subscriptions={[]}
        title={t('title')}
      />
    );
  }

  if (data.kind === 'no-stripe-customer') {
    return (
      <SubscriptionList
        emptyStateActionHref="/"
        emptyStateActionLabel={t('browsePlans')}
        emptyStateDescription={t('errors.noStripeCustomer')}
        emptyStateTitle={t('empty.title')}
        subscriptions={[]}
        title={t('title')}
      />
    );
  }

  const portalSections = await groupSubscriptionsForPortal(data.subscriptions, t, format, {
    customerId: data.bigcommerceCustomerId,
    finalizedShipments: data.finalizedShipments,
    productImagesByEntityId: data.productImagesByEntityId,
  });

  const cancellationReasons = [
    { value: 'too_expensive', label: t('manageModal.cancelForm.reasons.tooExpensive') },
    { value: 'found_alternative', label: t('manageModal.cancelForm.reasons.foundAlternative') },
    { value: 'no_longer_need', label: t('manageModal.cancelForm.reasons.noLongerNeed') },
    { value: 'other', label: t('manageModal.cancelForm.reasons.other') },
  ];

  return (
    <SubscriptionList
      activeSectionTitle={t('sections.active')}
      canceledSectionTitle={t('sections.canceled')}
      deliveriesSectionTitle={t('sections.deliveries')}
      emptyActiveTitle={t('empty.active')}
      emptyCanceledTitle={t('empty.canceled')}
      emptyPastShipmentsTitle={t('empty.pastShipments')}
      emptyUpcomingShipmentsTitle={t('empty.upcomingShipments')}
      emptyDeliveriesTitle={t('empty.deliveries')}
      emptyStateActionHref="/"
      emptyStateActionLabel={t('browsePlans')}
      emptyStateDescription={t('empty.description')}
      emptyStateTitle={t('empty.title')}
      manageBillingAction={openBillingPortal}
      manageBillingLabel={t('manage')}
      manageItemLabel={t('manageItem')}
      manageItemOptions={{
        modalTitle: t('manageModal.title'),
        cancelLabel: t('manageModal.cancelSubscription'),
        cancelFormTitle: t('manageModal.cancelForm.title'),
        cancellationReasonLabel: t('manageModal.cancelForm.reasonLabel'),
        cancellationReasonPlaceholder: t('manageModal.cancelForm.reasonPlaceholder'),
        cancellationReasons,
        editPaymentLabel: t('manageModal.editPaymentCard'),
        paymentPickerTitle: t('manageModal.paymentPickerTitle'),
        paymentPickerDescription: t('manageModal.paymentPickerDescription'),
        updatePaymentLabel: t('manageModal.updatePayment'),
        addPaymentMethodLabel: t('manageModal.addPaymentMethod'),
        goBackLabel: t('manageModal.goBack'),
        cancellingLabel: t('manageModal.cancelling'),
        defaultBadgeLabel: t('manageModal.defaultPayment'),
        cancelAction: cancelSubscriptionAction,
        updatePaymentMethodAction: updateSubscriptionPaymentMethodAction,
        addPaymentMethodAction: openAddPaymentMethodPortal,
        savedPaymentMethods: data.savedPaymentMethods,
      }}
      portalSections={portalSections}
      shipToLabel={t('delivery.shipTo')}
      storeLogoFallback={storeLogoFallback}
      deliveryOptionLabel={t('delivery.option')}
      pastShipmentsTitle={t('sections.pastShipments')}
      paymentIssueLabel={t('delivery.paymentIssue')}
      fixPaymentLabel={t('delivery.fixPayment')}
      shipmentPausedMessage={t('delivery.paused')}
      upcomingShipmentsTitle={t('sections.upcomingShipments')}
      subtotalLabel={t('delivery.subtotal')}
      taxLabel={t('delivery.tax')}
      totalLabel={t('delivery.total')}
      totalsPendingLabel={t('delivery.totalsPending')}
      quantityLabel={t('delivery.quantity')}
      paymentLabel={t('delivery.payment')}
      frequencyLabel={t('delivery.frequency')}
      retryPaymentAction={retrySubscriptionPaymentItem}
      retryPaymentLabel={t('delivery.retry')}
      skipDeliveryItemAction={skipSubscriptionDeliveryItem}
      skipDeliveryItemLabel={t('delivery.skipItem')}
      title={t('title')}
      updatePaymentAction={openBillingPortal}
      updatePaymentLabel={t('delivery.updatePayment')}
    />
  );
}
