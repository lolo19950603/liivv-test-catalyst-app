'use server';

import { BigCommerceGQLError } from '@bigcommerce/catalyst-client';
import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { FragmentOf } from 'gql.tada';
import { getTranslations } from 'next-intl/server';

import { CartLineItem } from '@/vibes/soul/sections/cart';
import { cartLineItemActionFormDataSchema } from '@/vibes/soul/sections/cart/schema';

import { DigitalItemFragment, PhysicalItemFragment } from '../page-data';

import { updateCartLinePurchaseQuantity } from './update-line-item-purchase';

type LineItem = {
  selectedOptions:
    | FragmentOf<typeof PhysicalItemFragment>['selectedOptions']
    | FragmentOf<typeof DigitalItemFragment>['selectedOptions'];
  productEntityId: number;
  variantEntityId: number | null;
  purchaseType?: 'subscription' | 'one-time';
  lineItemEntityId?: string;
} & CartLineItem;

export const updateLineItem = async (
  prevState: Awaited<{
    lineItems: LineItem[];
    lastResult: SubmissionResult | null;
  }>,
  formData: FormData,
): Promise<{
  lineItems: LineItem[];
  lastResult: SubmissionResult | null;
}> => {
  const t = await getTranslations('Cart.Errors');

  const submission = parseWithZod(formData, { schema: cartLineItemActionFormDataSchema });

  if (submission.status !== 'success') {
    return {
      ...prevState,
      lastResult: submission.reply(),
    };
  }

  const cartLineItem = prevState.lineItems.find((item) => item.id === submission.value.id);

  if (!cartLineItem) {
    return {
      ...prevState,
      lastResult: submission.reply({ formErrors: [t('lineItemNotFound')] }),
    };
  }

  try {
    await updateCartLinePurchaseQuantity({
      lineItems: prevState.lineItems,
      cartLineItem,
      intent: submission.value.intent,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    if (error instanceof BigCommerceGQLError) {
      return {
        ...prevState,
        lastResult: submission.reply({
          formErrors: error.errors.map(({ message }) => message),
        }),
      };
    }

    if (error instanceof Error) {
      return { ...prevState, lastResult: submission.reply({ formErrors: [error.message] }) };
    }

    return { ...prevState, lastResult: submission.reply({ formErrors: [String(error)] }) };
  }

  switch (submission.value.intent) {
    case 'increment':
      return {
        lineItems: prevState.lineItems.map((lineItem) =>
          lineItem.id === submission.value.id
            ? { ...lineItem, quantity: lineItem.quantity + 1 }
            : lineItem,
        ),
        lastResult: submission.reply({ resetForm: true }),
      };

    case 'decrement':
      return {
        lineItems: prevState.lineItems.map((lineItem) =>
          lineItem.id === submission.value.id
            ? { ...lineItem, quantity: lineItem.quantity - 1 }
            : lineItem,
        ),
        lastResult: submission.reply({ resetForm: true }),
      };

    case 'delete':
      return {
        lineItems: prevState.lineItems.filter((item) => item.id !== submission.value.id),
        lastResult: submission.reply({ resetForm: true }),
      };

    default:
      return prevState;
  }
};
