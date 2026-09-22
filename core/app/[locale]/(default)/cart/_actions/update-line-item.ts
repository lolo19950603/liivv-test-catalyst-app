'use server';

import { BigCommerceGQLError } from '@bigcommerce/catalyst-client';
import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { FragmentOf } from 'gql.tada';
import { getTranslations } from 'next-intl/server';

import { CartLineItem } from '@/vibes/soul/sections/cart';
import { cartLineItemActionFormDataSchema } from '@/vibes/soul/sections/cart/schema';
import { applyKitRecipeDelta, scaleKitLineQuantities } from '~/lib/kit/scale-kit-line-quantities';

import { DigitalItemFragment, PhysicalItemFragment } from '../page-data';

import { updateCartKitQuantity, updateCartLinePurchaseQuantity } from './update-line-item-purchase';

type LineItem = {
  selectedOptions:
    | FragmentOf<typeof PhysicalItemFragment>['selectedOptions']
    | FragmentOf<typeof DigitalItemFragment>['selectedOptions'];
  productEntityId: number;
  variantEntityId: number | null;
  purchaseType?: 'subscription' | 'one-time';
  lineItemEntityId?: string;
} & CartLineItem;

function isKitIntent(
  intent: string,
): intent is 'increment-kit' | 'decrement-kit' | 'delete-kit' {
  return intent === 'increment-kit' || intent === 'decrement-kit' || intent === 'delete-kit';
}

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

  if (isKitIntent(submission.value.intent)) {
    const { intent, kitId } = submission.value;
    const kitLines = prevState.lineItems.filter((item) => item.kitId === kitId);

    if (kitLines.length === 0) {
      return {
        ...prevState,
        lastResult: submission.reply({ formErrors: [t('lineItemNotFound')] }),
      };
    }

    try {
      await updateCartKitQuantity({
        intent,
        kitId,
        lineItems: prevState.lineItems,
      });
    } catch (error) {
      return actionError(prevState, (options) => submission.reply(options), error);
    }

    const currentKitQty = kitLines[0]?.kitQuantity ?? 1;
    const nextKitQty =
      intent === 'increment-kit'
        ? currentKitQty + 1
        : intent === 'decrement-kit'
          ? currentKitQty - 1
          : 0;

    return {
      lastResult: submission.reply({ resetForm: true }),
      lineItems: scaleKitLineQuantities(prevState.lineItems, kitId, nextKitQty),
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
      cartLineItem,
      intent: submission.value.intent,
      lineItems: prevState.lineItems,
    });
  } catch (error) {
    return actionError(prevState, (options) => submission.reply(options), error);
  }

  switch (submission.value.intent) {
    case 'increment':
      return {
        lineItems: prevState.lineItems.map((lineItem) =>
          lineItem.id === submission.value.id ? applyKitRecipeDelta(lineItem, 1) : lineItem,
        ),
        lastResult: submission.reply({ resetForm: true }),
      };

    case 'decrement':
      return {
        lineItems: prevState.lineItems.map((lineItem) =>
          lineItem.id === submission.value.id ? applyKitRecipeDelta(lineItem, -1) : lineItem,
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

function actionError(
  prevState: { lineItems: LineItem[]; lastResult: SubmissionResult | null },
  reply: (options: { formErrors: string[] }) => SubmissionResult,
  error: unknown,
): { lineItems: LineItem[]; lastResult: SubmissionResult } {
  // eslint-disable-next-line no-console
  console.error(error);

  if (error instanceof BigCommerceGQLError) {
    return {
      ...prevState,
      lastResult: reply({
        formErrors: error.errors.map(({ message }) => message),
      }),
    };
  }

  if (error instanceof Error) {
    return { ...prevState, lastResult: reply({ formErrors: [error.message] }) };
  }

  return { ...prevState, lastResult: reply({ formErrors: [String(error)] }) };
}
