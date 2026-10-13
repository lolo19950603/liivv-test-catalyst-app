'use server';

import { BigCommerceGQLError } from '@bigcommerce/catalyst-client';
import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { getTranslations } from 'next-intl/server';
import { ReactNode } from 'react';

import { compareAddToCartFormDataSchema } from '@/vibes/soul/primitives/compare-card/schema';
import { Link } from '~/components/link';
import { addToOrCreateCart } from '~/lib/cart';
import { MissingCartError } from '~/lib/cart/error';
import { viewOnlyProductIds } from '~/lib/catalog/view-only';

interface State {
  lastResult: SubmissionResult | null;
  successMessage?: ReactNode;
  errorMessage?: string;
}

export const addToCart = async (
  prevState: State,
  payload: FormData,
): Promise<{
  lastResult: SubmissionResult | null;
  successMessage?: ReactNode;
}> => {
  const t = await getTranslations('Compare');

  const submission = parseWithZod(payload, { schema: compareAddToCartFormDataSchema });

  if (submission.status !== 'success') {
    return { lastResult: submission.reply() };
  }

  const productEntityId = Number(submission.value.id);
  const quantity = 1;

  // Insulin, glucagon, prescription devices (CPAP, APAP, bilevel and ASV
  // machines) and a kit holding any of them are never added from a listing
  // (owner note 9; production check, 2026-10-12; owner approval, 2026-10-12):
  // the card links the product page. This refuses a form that asks anyway.
  if ((await viewOnlyProductIds([productEntityId])).has(productEntityId)) {
    const shop = await getTranslations('DiabetesCare.ui.chapter.shop');

    return { lastResult: submission.reply({ formErrors: [shop('addError')] }) };
  }

  try {
    await addToOrCreateCart({
      lineItems: [
        {
          productEntityId,
          quantity,
        },
      ],
    });

    return {
      lastResult: submission.reply(),
      successMessage: t.rich('successMessage', {
        cartItems: quantity,
        cartLink: (chunks) => (
          <Link className="underline" href="/cart" prefetch="viewport" prefetchKind="full">
            {chunks}
          </Link>
        ),
      }),
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    if (error instanceof BigCommerceGQLError) {
      return {
        lastResult: submission.reply({
          formErrors: error.errors.map(({ message }) => {
            if (message.includes('Not enough stock:')) {
              return message.replace('Not enough stock: ', '').replace(/\(\w.+\)\s{1}/, '');
            }

            return message;
          }),
        }),
      };
    }

    if (error instanceof MissingCartError) {
      return {
        lastResult: submission.reply({ formErrors: [t('missingCart')] }),
      };
    }

    if (error instanceof Error) {
      return {
        lastResult: submission.reply({ formErrors: [error.message] }),
      };
    }

    return {
      lastResult: submission.reply({ formErrors: [t('unknownError')] }),
    };
  }
};
