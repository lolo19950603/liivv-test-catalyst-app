import { Metadata } from 'next';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';

import { SubscriptionList } from '@/vibes/soul/sections/subscription-list';
import {
  formatSubscriptionIntervalKey,
  getSubscriptionBillingIntervals,
} from '~/lib/stripe/subscription-interval';
import { groupSubscriptionsForPortal } from '~/lib/stripe/transform-customer-subscriptions';
import { getStoreLogoFallback } from '~/lib/store-theme/get-store-logo-fallback';

import { openBillingPortal } from './_actions/open-billing-portal';
import { cancelSubscriptionAction } from './_actions/cancel-subscription';
import { createAddPaymentMethodSetupIntentAction } from './_actions/create-add-payment-method-setup-intent';
import { pauseSubscriptionAction } from './_actions/pause-subscription';
import { reactivateSubscriptionAction } from './_actions/reactivate-subscription';
import { resumeSubscriptionAction } from './_actions/resume-subscription';
import { saveAndApplySubscriptionAddressAction } from './_actions/save-and-apply-subscription-address';
import { skipSubscriptionDeliveryManageAction } from './_actions/skip-subscription-delivery-manage';
import { updateSubscriptionFrequencyAction } from './_actions/update-subscription-frequency';
import { updateSubscriptionPaymentMethodAction } from './_actions/update-subscription-payment-method';
import { updateSubscriptionShippingAddressAction } from './_actions/update-subscription-shipping-address';
import { retrySubscriptionPaymentItem } from './_actions/retry-subscription-payment';
import { skipSubscriptionDeliveryItem } from './_actions/skip-subscription-delivery';
import { getSubscriptionsPageData } from './page-data';

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
  const checkoutAddressT = await getTranslations('Checkout.billing');
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

  const frequencyOptions = getSubscriptionBillingIntervals().map((interval) => ({
    value: formatSubscriptionIntervalKey(interval),
    label:
      interval.intervalCount === 1
        ? t(`manageModal.frequencyOptions.${interval.interval}`)
        : t(`manageModal.frequencyOptions.${interval.interval}Plural`, {
            count: interval.intervalCount,
          }),
  }));

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
        addPaymentMethodSecureNote: t('manageModal.addPaymentMethodSecureNote'),
        goBackLabel: t('manageModal.goBack'),
        cancellingLabel: t('manageModal.cancelling'),
        updatingPaymentLabel: t('manageModal.updatingPayment'),
        savingPaymentMethodLabel: t('manageModal.savingPaymentMethod'),
        updatingAddressLabel: t('manageModal.updatingAddress'),
        defaultBadgeLabel: t('manageModal.defaultPayment'),
        cancelAction: cancelSubscriptionAction,
        updatePaymentMethodAction: updateSubscriptionPaymentMethodAction,
        createSetupIntentAction: createAddPaymentMethodSetupIntentAction,
        savePaymentMethodLabel: t('manageModal.savePaymentMethod'),
        savedPaymentMethods: data.savedPaymentMethods,
        editAddressLabel: t('manageModal.editAddress'),
        addressPickerTitle: t('manageModal.addressPickerTitle'),
        addressPickerDescription: t('manageModal.addressPickerDescription'),
        updateAddressLabel: t('manageModal.updateAddress'),
        addAddressLabel: t('manageModal.addAddress'),
        saveAddressLabel: t('manageModal.saveAddress'),
        updateShippingAddressAction: updateSubscriptionShippingAddressAction,
        saveAndApplyAddressAction: saveAndApplySubscriptionAddressAction,
        savedShippingAddresses: data.savedShippingAddresses,
        addressFormCountries: data.addressFormCountries,
        addressFormStates: data.addressFormStates,
        defaultCountryCode: data.defaultCountryCode,
        addressFormLabels: {
          firstName: checkoutAddressT('firstName'),
          lastName: checkoutAddressT('lastName'),
          company: checkoutAddressT('company'),
          address1: checkoutAddressT('address1'),
          address2: checkoutAddressT('address2'),
          city: checkoutAddressT('city'),
          stateOrProvince: checkoutAddressT('stateOrProvince'),
          country: checkoutAddressT('country'),
          postalCode: checkoutAddressT('postalCode'),
          phone: checkoutAddressT('phone'),
          saveLabel: t('manageModal.saveAddress'),
        },
        frequencyLabel: t('manageModal.frequency'),
        editFrequencyLabel: t('manageModal.editFrequency'),
        frequencyPickerTitle: t('manageModal.frequencyPickerTitle'),
        frequencyPickerDescription: t('manageModal.frequencyPickerDescription'),
        updateFrequencyLabel: t('manageModal.updateFrequency'),
        updatingFrequencyLabel: t('manageModal.updatingFrequency'),
        frequencyOptions,
        updateFrequencyAction: updateSubscriptionFrequencyAction,
        skipDeliveryLabel: t('manageModal.skipDelivery'),
        skipDeliveryTitle: t('manageModal.skipDeliveryTitle'),
        skipDeliveryDescription: t('manageModal.skipDeliveryDescription'),
        skipDeliveryDateLabel: t('manageModal.skipDeliveryDateLabel'),
        skipDeliveryNextLabel: t('manageModal.skipDeliveryNextLabel'),
        skipDeliveryPendingLabel: t('manageModal.skipDeliveryPendingLabel'),
        skipDeliveryScheduledLabel: t('manageModal.skipDeliveryScheduledLabel'),
        confirmSkipDeliveryLabel: t('manageModal.confirmSkipDelivery'),
        skippingDeliveryLabel: t('manageModal.skippingDelivery'),
        skipDeliveryAction: skipSubscriptionDeliveryManageAction,
        reactivateLabel: t('manageModal.reactivateSubscription'),
        reactivatingLabel: t('manageModal.reactivatingSubscription'),
        reactivateAction: reactivateSubscriptionAction,
        pauseLabel: t('manageModal.pauseSubscription'),
        pausingLabel: t('manageModal.pausingSubscription'),
        pauseAction: pauseSubscriptionAction,
        resumeLabel: t('manageModal.resumeSubscription'),
        resumingLabel: t('manageModal.resumingSubscription'),
        resumeAction: resumeSubscriptionAction,
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
