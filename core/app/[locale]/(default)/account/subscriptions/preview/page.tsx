import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import {
  SubscriptionList,
  type SubscriptionPortalSections,
} from '@/vibes/soul/sections/subscription-list';

import {
  previewNoopAction,
  previewNoopSubscriptionAction,
} from './_actions/preview-noop';

interface Props {
  params: Promise<{ locale: string }>;
}

export const metadata: Metadata = {
  title: 'Subscriptions preview — failed payment',
  robots: { index: false, follow: false },
};

const mockPortalSections: SubscriptionPortalSections = {
  upcomingShipments: [
    {
      id: 'shipment-2026-06-29',
      title: 'Shipping on Jun 29, 2026',
      deliveries: [
        {
          id: 'shipment-2026-06-29-toronto',
          shipmentHeading: 'Shipment 1',
          shippingAddressLabel:
            'PinLun Chen, 77 Shuter St, Toronto, Ontario, M5B 0B8, CA',
          shippingMethodLabel: 'Free shipping',
          shipmentPaused: true,
          subtotalExTax: 'CA$68.50',
          tax: 'CA$8.45',
          totalIncTax: 'CA$76.95',
          items: [
            {
              id: 'sub_preview_tena',
              productName: 'Tena Underpad (Moderate Absorbency)',
              quantity: 2,
              price: 'CA$13.00',
              intervalLabel: 'per week',
              paymentMethodLabel: 'Visa •••• 4242',
              statusLabel: 'Active',
              statusKey: 'active',
              scheduleDetail: 'First charge on Jun 29, 2026',
            },
            {
              id: 'sub_preview_prevail',
              productName: 'Prevail Super Absorbency Underpad',
              quantity: 1,
              price: 'CA$11.09',
              intervalLabel: 'per week',
              paymentMethodLabel: 'Visa •••• 4242',
              statusLabel: 'Past due',
              statusKey: 'past_due',
              scheduleDetail: 'First charge on Jun 29, 2026',
              paymentFailed: true,
            },
            {
              id: 'sub_preview_wings',
              productName: 'Wings Overnight Quilted Brief (Adult)',
              quantity: 5,
              price: 'CA$55.50',
              intervalLabel: 'per month',
              paymentMethodLabel: 'Visa •••• 4242',
              statusLabel: 'Active',
              statusKey: 'active',
              scheduleDetail: 'First charge on Jun 29, 2026',
            },
          ],
        },
        {
          id: 'shipment-2026-06-29-coquitlam',
          shipmentHeading: 'Shipment 2',
          shippingAddressLabel:
            'Claire Chen, 609 Victor St, Coquitlam, British Columbia, V3J 3V4, CA',
          shippingMethodLabel: 'Free shipping',
          shipmentPaused: true,
          totalsPending: true,
          items: [
            {
              id: 'sub_preview_cpap',
              productName: 'Fisher & Paykel Simplus Full Face CPAP Mask',
              quantity: 1,
              price: 'CA$148.00',
              intervalLabel: 'every 14 days',
              paymentMethodLabel: 'Visa •••• 4242',
              statusLabel: 'Unpaid',
              statusKey: 'unpaid',
              scheduleDetail: 'First charge on Jun 29, 2026',
              paymentFailed: true,
            },
          ],
        },
      ],
    },
    {
      id: 'shipment-2026-07-13',
      title: 'Shipping on Jul 13, 2026',
      deliveries: [
        {
          id: 'shipment-2026-07-13-toronto',
          shippingAddressLabel:
            'PinLun Chen, 77 Shuter St, Toronto, Ontario, M5B 0B8, CA',
          shippingMethodLabel: 'Free shipping',
          subtotalExTax: 'CA$24.09',
          tax: 'CA$2.97',
          totalIncTax: 'CA$27.06',
          items: [
            {
              id: 'sub_preview_tena_july',
              productName: 'Tena Underpad (Moderate Absorbency)',
              quantity: 2,
              price: 'CA$13.00',
              intervalLabel: 'per week',
              paymentMethodLabel: 'Visa •••• 4242',
              statusLabel: 'Active',
              statusKey: 'active',
              scheduleDetail: 'Renews on Jul 13, 2026',
            },
          ],
        },
      ],
    },
  ],
  pastShipments: [
    {
      id: 'past-shipment-2026-06-15',
      title: 'Shipping on Jun 15, 2026',
      deliveries: [
        {
          id: 'past-shipment-15-toronto-partial',
          shipmentHeading: 'Shipment 1',
          shippingAddressLabel:
            'PinLun Chen, 77 Shuter St, Toronto, Ontario, M5B 0B8, CA',
          shippingMethodLabel: 'Free shipping',
          isPast: true,
          bigcommerceOrderId: 1042,
          bigcommerceOrderHref: '/account/orders/1042/',
          bigcommerceOrderLabel: 'Order #1042',
          outcomeNote: 'Some items were skipped from this shipment.',
          subtotalExTax: 'CA$68.50',
          tax: 'CA$8.45',
          totalIncTax: 'CA$76.95',
          items: [
            {
              id: 'past_tena',
              productName: 'Tena Underpad (Moderate Absorbency)',
              quantity: 2,
              intervalLabel: '',
              paymentMethodLabel: '',
              statusLabel: 'Charged',
              statusKey: 'active',
            },
            {
              id: 'past_prevail',
              productName: 'Prevail Super Absorbency Underpad',
              quantity: 1,
              intervalLabel: '',
              paymentMethodLabel: '',
              statusLabel: 'Skipped',
              statusKey: 'skipped',
              skippedReasonLabel:
                'Payment was not received before 1:00 PM and this item was not included in this shipment.',
            },
          ],
        },
        {
          id: 'past-shipment-15-coquitlam-failed',
          shipmentHeading: 'Shipment 2',
          shippingAddressLabel:
            'Claire Chen, 609 Victor St, Coquitlam, British Columbia, V3J 3V4, CA',
          shippingMethodLabel: 'Free shipping',
          isPast: true,
          totalsPending: true,
          outcomeNote: 'No order was created. All items failed payment or were skipped.',
          items: [
            {
              id: 'past_cpap',
              productName: 'Fisher & Paykel Simplus Full Face CPAP Mask',
              quantity: 1,
              intervalLabel: '',
              paymentMethodLabel: '',
              statusLabel: 'Skipped',
              statusKey: 'skipped',
              skippedReasonLabel:
                'Payment was not received before 1:00 PM and this item was not included in this shipment.',
            },
          ],
        },
      ],
    },
    {
      id: 'past-shipment-2026-06-01',
      title: 'Shipping on Jun 1, 2026',
      deliveries: [
        {
          id: 'past-shipment-01-toronto-full',
          shippingAddressLabel:
            'PinLun Chen, 77 Shuter St, Toronto, Ontario, M5B 0B8, CA',
          shippingMethodLabel: 'Free shipping',
          isPast: true,
          bigcommerceOrderId: 1038,
          bigcommerceOrderHref: '/account/orders/1038/',
          bigcommerceOrderLabel: 'Order #1038',
          subtotalExTax: 'CA$79.59',
          tax: 'CA$9.83',
          totalIncTax: 'CA$89.42',
          items: [
            {
              id: 'past_jun1_tena',
              productName: 'Tena Underpad (Moderate Absorbency)',
              quantity: 2,
              intervalLabel: '',
              paymentMethodLabel: '',
              statusLabel: 'Charged',
              statusKey: 'active',
            },
            {
              id: 'past_jun1_prevail',
              productName: 'Prevail Super Absorbency Underpad',
              quantity: 1,
              intervalLabel: '',
              paymentMethodLabel: '',
              statusLabel: 'Charged',
              statusKey: 'active',
            },
            {
              id: 'past_jun1_wings',
              productName: 'Wings Overnight Quilted Brief (Adult)',
              quantity: 5,
              intervalLabel: '',
              paymentMethodLabel: '',
              statusLabel: 'Charged',
              statusKey: 'active',
            },
          ],
        },
      ],
    },
    {
      id: 'past-shipment-2026-05-20',
      title: 'Shipping on May 20, 2026',
      deliveries: [
        {
          id: 'past-shipment-20-customer-skip',
          shippingAddressLabel:
            'PinLun Chen, 77 Shuter St, Toronto, Ontario, M5B 0B8, CA',
          shippingMethodLabel: 'Free shipping',
          isPast: true,
          bigcommerceOrderId: 1025,
          bigcommerceOrderHref: '/account/orders/1025/',
          bigcommerceOrderLabel: 'Order #1025',
          outcomeNote: 'Some items were skipped from this shipment.',
          subtotalExTax: 'CA$55.50',
          tax: 'CA$6.85',
          totalIncTax: 'CA$62.35',
          items: [
            {
              id: 'past_may20_wings',
              productName: 'Wings Overnight Quilted Brief (Adult)',
              quantity: 5,
              intervalLabel: '',
              paymentMethodLabel: '',
              statusLabel: 'Charged',
              statusKey: 'active',
            },
            {
              id: 'past_may20_mask',
              productName: 'Fisher & Paykel Simplus Full Face CPAP Mask',
              quantity: 1,
              intervalLabel: '',
              paymentMethodLabel: '',
              statusLabel: 'Skipped',
              statusKey: 'skipped',
              skippedReasonLabel: 'Skipped by customer for this shipment',
            },
          ],
        },
      ],
    },
    {
      id: 'past-shipment-2026-05-05',
      title: 'Shipping on May 5, 2026',
      deliveries: [
        {
          id: 'past-shipment-05-toronto',
          shipmentHeading: 'Shipment 1',
          shippingAddressLabel:
            'PinLun Chen, 77 Shuter St, Toronto, Ontario, M5B 0B8, CA',
          shippingMethodLabel: 'Free shipping',
          isPast: true,
          bigcommerceOrderId: 1012,
          bigcommerceOrderHref: '/account/orders/1012/',
          bigcommerceOrderLabel: 'Order #1012',
          subtotalExTax: 'CA$24.09',
          tax: 'CA$2.97',
          totalIncTax: 'CA$27.06',
          items: [
            {
              id: 'past_may5_tena',
              productName: 'Tena Underpad (Moderate Absorbency)',
              quantity: 2,
              intervalLabel: '',
              paymentMethodLabel: '',
              statusLabel: 'Charged',
              statusKey: 'active',
            },
          ],
        },
        {
          id: 'past-shipment-05-coquitlam',
          shipmentHeading: 'Shipment 2',
          shippingAddressLabel:
            'Claire Chen, 609 Victor St, Coquitlam, British Columbia, V3J 3V4, CA',
          shippingMethodLabel: 'Free shipping',
          isPast: true,
          bigcommerceOrderId: 1013,
          bigcommerceOrderHref: '/account/orders/1013/',
          bigcommerceOrderLabel: 'Order #1013',
          subtotalExTax: 'CA$148.00',
          tax: 'CA$18.28',
          totalIncTax: 'CA$166.28',
          items: [
            {
              id: 'past_may5_cpap',
              productName: 'Fisher & Paykel Simplus Full Face CPAP Mask',
              quantity: 1,
              intervalLabel: '',
              paymentMethodLabel: '',
              statusLabel: 'Charged',
              statusKey: 'active',
            },
          ],
        },
      ],
    },
    {
      id: 'past-shipment-2026-04-10',
      title: 'Shipping on Apr 10, 2026',
      deliveries: [
        {
          id: 'past-shipment-10-mixed-fail',
          shippingAddressLabel:
            'PinLun Chen, 77 Shuter St, Toronto, Ontario, M5B 0B8, CA',
          shippingMethodLabel: 'Free shipping',
          isPast: true,
          totalsPending: true,
          outcomeNote: 'No order was created. All items failed payment or were skipped.',
          items: [
            {
              id: 'past_apr10_tena',
              productName: 'Tena Underpad (Moderate Absorbency)',
              quantity: 2,
              intervalLabel: '',
              paymentMethodLabel: '',
              statusLabel: 'Skipped',
              statusKey: 'skipped',
              skippedReasonLabel:
                'Payment was not received before 1:00 PM and this item was not included in this shipment.',
            },
            {
              id: 'past_apr10_prevail',
              productName: 'Prevail Super Absorbency Underpad',
              quantity: 1,
              intervalLabel: '',
              paymentMethodLabel: '',
              statusLabel: 'Skipped',
              statusKey: 'skipped',
              skippedReasonLabel:
                'Payment was not received before 1:00 PM and this item was not included in this shipment.',
            },
          ],
        },
      ],
    },
  ],
  active: [
    {
      id: 'sub_preview_softnit_1',
      productName: 'Softnit 300 Reusable Underpads',
      variantSubtitle: 'Quantity: One · Size: 86.3 cm x 91.4 cm · SKU: 600011',
      quantity: 1,
      price: 'CA$8.55',
      intervalLabel: 'every 30 days',
      paymentMethodLabel: 'Visa •••• 4242',
      statusLabel: 'Active',
      statusKey: 'active',
      scheduleDetail: 'Renews on Jul 31, 2026',
      shippingAddressGroupNumber: 1,
      shippingAddressLabel:
        'PinLun Chen, 77 Shuter St, Toronto, Ontario, M5B 0B8, CA',
    },
    {
      id: 'sub_preview_softnit_2',
      productName: 'Softnit 300 Reusable Underpads',
      variantSubtitle: 'Quantity: One · Size: 86.3 cm x 91.4 cm · SKU: 600011',
      quantity: 1,
      price: 'CA$8.55',
      intervalLabel: 'every 30 days',
      paymentMethodLabel: 'Visa •••• 4242',
      statusLabel: 'Active',
      statusKey: 'active',
      scheduleDetail: 'Renews on Jul 31, 2026',
      shippingAddressGroupNumber: 1,
      shippingAddressLabel:
        'PinLun Chen, 77 Shuter St, Toronto, Ontario, M5B 0B8, CA',
    },
    {
      id: 'sub_preview_prevail_1',
      productName: 'Prevail Briefs',
      variantSubtitle: 'Quantity: Pack of 16 · Size: Small (Waist 20-31 inches) · SKU: 600003',
      quantity: 1,
      price: 'CA$24.88',
      intervalLabel: 'every 14 days',
      paymentMethodLabel: 'Visa •••• 4242',
      statusLabel: 'Active',
      statusKey: 'active',
      scheduleDetail: 'Renews on Jul 15, 2026',
      shippingAddressGroupNumber: 2,
      shippingAddressLabel:
        'Claire Chen, 609 Victor St, Coquitlam, British Columbia, V3J 3V4, CA',
    },
    {
      id: 'sub_preview_prevail_2',
      productName: 'Prevail Briefs',
      variantSubtitle: 'Quantity: Pack of 16 · Size: Small (Waist 20-31 inches) · SKU: 600003',
      quantity: 1,
      price: 'CA$24.88',
      intervalLabel: 'every 14 days',
      paymentMethodLabel: 'Visa •••• 4242',
      statusLabel: 'Active',
      statusKey: 'active',
      scheduleDetail: 'Renews on Jul 15, 2026',
      shippingAddressGroupNumber: 2,
      shippingAddressLabel:
        'Claire Chen, 609 Victor St, Coquitlam, British Columbia, V3J 3V4, CA',
    },
    {
      id: 'sub_preview_wings',
      productName: 'Wings Overnight Quilted Brief (Adult)',
      variantSubtitle: 'Quantity: Pack of 18 · Size: Medium (Waist 32-44 inches) · SKU: 600004',
      quantity: 1,
      price: 'CA$33.30',
      intervalLabel: 'per month',
      paymentMethodLabel: 'Visa •••• 4242',
      statusLabel: 'Active',
      statusKey: 'active',
      scheduleDetail: 'Renews on Aug 1, 2026',
      shippingAddressGroupNumber: 3,
      shippingAddressLabel: 'Alex Kim, 1200 Main St, Vancouver, British Columbia, V6A 2W9, CA',
    },
    {
      id: 'sub_preview_tena_active',
      productName: 'Tena Underpad (Moderate Absorbency)',
      variantSubtitle: 'Quantity: Pack of 25 · Size: 44cm x 61cm · SKU: 700082',
      quantity: 1,
      price: 'CA$19.50',
      intervalLabel: 'per week',
      paymentMethodLabel: 'Visa •••• 4242',
      statusLabel: 'Active',
      statusKey: 'active',
      scheduleDetail: 'Renews on Jul 8, 2026',
      shippingAddressGroupNumber: 3,
      shippingAddressLabel: 'Alex Kim, 1200 Main St, Vancouver, British Columbia, V6A 2W9, CA',
    },
  ],
  canceled: [],
};

export default async function SubscriptionsPreviewPage({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations('Account.Subscriptions');

  const cancellationReasons = [
    { value: 'too_expensive', label: t('manageModal.cancelForm.reasons.tooExpensive') },
    { value: 'found_alternative', label: t('manageModal.cancelForm.reasons.foundAlternative') },
    { value: 'no_longer_need', label: t('manageModal.cancelForm.reasons.noLongerNeed') },
    { value: 'other', label: t('manageModal.cancelForm.reasons.other') },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-dashed border-[hsl(var(--contrast-300))] bg-[hsl(var(--contrast-50))] px-4 py-3 text-sm text-[hsl(var(--contrast-600))]">
        <p>
          <strong className="font-medium text-[hsl(var(--foreground))]">Static preview</strong> —
          mock data only. Use the <strong>Deliveries</strong> tab, then toggle{' '}
          <strong>Upcoming shipments</strong> / <strong>Past shipments</strong>.
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>
            <strong>Upcoming:</strong> paused shipment (mixed paid + failed), fully failed shipment,
            and a clean future shipment.
          </li>
          <li>
            <strong>Past — Jun 15:</strong> partial order (#1042) + all-failed shipment (no order
            link).
          </li>
          <li>
            <strong>Past — Jun 1:</strong> full success (#1038), all items charged.
          </li>
          <li>
            <strong>Past — May 20:</strong> customer skipped one item (#1025).
          </li>
          <li>
            <strong>Past — May 5:</strong> two addresses, two separate orders (#1012, #1013).
          </li>
          <li>
            <strong>Past — Apr 10:</strong> entire shipment failed, no order created.
          </li>
        </ul>
      </div>

      <SubscriptionList
        activeSectionTitle={t('sections.active')}
        canceledSectionTitle={t('sections.canceled')}
        deliveriesSectionTitle={t('sections.deliveries')}
        deliveryOptionLabel={t('delivery.option')}
        emptyActiveTitle={t('empty.active')}
        emptyCanceledTitle={t('empty.canceled')}
        emptyPastShipmentsTitle={t('empty.pastShipments')}
        emptyUpcomingShipmentsTitle={t('empty.upcomingShipments')}
        frequencyLabel={t('delivery.frequency')}
        manageBillingAction={previewNoopAction}
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
          cancelAction: previewNoopSubscriptionAction,
          updatePaymentMethodAction: async () => ({ success: true }),
          addPaymentMethodAction: previewNoopAction,
          savedPaymentMethods: [
            {
              id: 'pm_preview_1',
              brand: 'Visa',
              last4: '4242',
              expMonth: 4,
              expYear: 2028,
              label: 'Visa •••• 4242',
              expiryLabel: 'Expires 04/2028',
              isDefault: true,
            },
          ],
        }}
        pastShipmentsTitle={t('sections.pastShipments')}
        paymentLabel={t('delivery.payment')}
        portalSections={mockPortalSections}
        quantityLabel={t('delivery.quantity')}
        retryPaymentAction={previewNoopSubscriptionAction}
        retryPaymentLabel={t('delivery.retry')}
        shipmentPausedMessage={t('delivery.paused')}
        shipToLabel={t('delivery.shipTo')}
        skipDeliveryItemAction={previewNoopSubscriptionAction}
        skipDeliveryItemLabel={t('delivery.skipItem')}
        subtotalLabel={t('delivery.subtotal')}
        taxLabel={t('delivery.tax')}
        title={`${t('title')} (preview)`}
        totalLabel={t('delivery.total')}
        totalsPendingLabel={t('delivery.totalsPending')}
        upcomingShipmentsTitle={t('sections.upcomingShipments')}
        updatePaymentAction={previewNoopAction}
        updatePaymentLabel={t('delivery.updatePayment')}
      />
    </div>
  );
}
