import { notFound } from 'next/navigation';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';

import { Streamable } from '@/vibes/soul/lib/streamable';
import { OrderDetailsSection } from '@/vibes/soul/sections/order-details-section';
import { orderDetailsTransformer } from '~/data-transformers/order-details-transformer';

import { reorderOrder } from '../_actions/reorder';

import { getCustomerOrderDetails } from './page-data';

interface Props {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

export default async function OrderDetails(props: Props) {
  const { id, locale } = await props.params;

  setRequestLocale(locale);

  const t = await getTranslations('Account.Orders.Details');
  const ordersT = await getTranslations('Account.Orders');
  const format = await getFormatter();

  const streamableOrder = Streamable.from(async () => {
    const order = await getCustomerOrderDetails(Number(id));

    if (!order) {
      notFound();
    }

    return orderDetailsTransformer(order, t, format);
  });

  return (
    <OrderDetailsSection
      order={streamableOrder}
      orderSummaryLabel={t('orderSummary')}
      prevHref="/account/orders"
      reorderAction={reorderOrder}
      reorderLabel={ordersT('reorder')}
      shipmentAddressLabel={t('shippingAddress')}
      shipmentMethodLabel={t('shippingMethod')}
      summaryTotalLabel={t('summaryTotal')}
      title={t('title', { orderNumber: id })}
      viewCartLabel={ordersT('reorderViewCart')}
    />
  );
}
