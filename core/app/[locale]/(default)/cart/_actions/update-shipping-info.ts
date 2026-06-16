'use server';

import { BigCommerceGQLError } from '@bigcommerce/catalyst-client';
import { parseWithZod } from '@conform-to/zod';
import { getFormatter, getTranslations } from 'next-intl/server';
import { revalidateTag } from 'next/cache';

import { shippingActionFormDataSchema } from '@/vibes/soul/sections/cart/schema';
import { ShippingFormState } from '@/vibes/soul/sections/cart/shipping-form';
import { TAGS } from '~/client/tags';
import { getCartId } from '~/lib/cart';
import { clearSectionShippingState } from '~/lib/checkout/section-shipping-storage';

import { getCart } from '../page-data';

import { addShippingCost } from './add-shipping-cost';
import {
  addCheckoutShippingConsignments,
  updateCheckoutShippingConsignment,
} from './add-shipping-info';

export const updateShippingInfo = async (
  prevState: Awaited<ShippingFormState>,
  formData: FormData,
): Promise<ShippingFormState> => {
  const t = await getTranslations('Cart.CheckoutSummary.Shipping');
  const format = await getFormatter();

  const submission = parseWithZod(formData, {
    schema: shippingActionFormDataSchema({ required_error: t('countryRequired') }),
  });

  const cartId = await getCartId();

  if (!cartId) {
    return { ...prevState, lastResult: submission.reply({ formErrors: [t('cartNotFound')] }) };
  }

  const cart = await getCart({ cartId });
  const checkout = cart.site.checkout;

  if (!checkout || !cart.site.cart) {
    return { ...prevState, lastResult: submission.reply({ formErrors: [t('cartNotFound')] }) };
  }

  const checkoutEntityId = checkout.entityId;

  if (!checkoutEntityId) {
    return { ...prevState, lastResult: submission.reply({ formErrors: [t('cartNotFound')] }) };
  }

  if (submission.status !== 'success') {
    return {
      ...prevState,
      lastResult: submission.reply(),
    };
  }

  const lineItems = [
    ...cart.site.cart.lineItems.physicalItems,
    ...cart.site.cart.lineItems.digitalItems,
  ].map((item) => ({
    lineItemEntityId: item.entityId,
    quantity: item.quantity,
  }));

  const shippingConsignment =
    checkout.shippingConsignments?.find((consignment) => consignment.selectedShippingOption) ||
    checkout.shippingConsignments?.[0];

  const shippingId = shippingConsignment?.entityId;

  switch (submission.value.intent) {
    case 'estimate-shipping': {
      let updatedShippingConsignment:
        | NonNullable<
            Awaited<ReturnType<typeof addCheckoutShippingConsignments>>
          >['shippingConsignments'][number]
        | undefined;

      try {
        const result = shippingId
          ? await updateCheckoutShippingConsignment({
              checkoutEntityId,
              address: {
                countryCode: submission.value.country,
                city: '',
                stateOrProvince: submission.value.state,
                postalCode: submission.value.postalCode,
              },
              lineItems,
              shippingId,
            })
          : await addCheckoutShippingConsignments({
              checkoutEntityId,
              address: {
                countryCode: submission.value.country,
                city: '',
                stateOrProvince: submission.value.state,
                postalCode: submission.value.postalCode,
              },
              lineItems,
            });

        updatedShippingConsignment = result ? result.shippingConsignments?.[0] : undefined;

        const firstOption = updatedShippingConsignment?.availableShippingOptions?.[0];

        if (!updatedShippingConsignment?.entityId || !firstOption) {
          return {
            ...prevState,
            lastResult: submission.reply({ formErrors: [t('noShippingOptions')] }),
          };
        }

        await addShippingCost({
          checkoutEntityId,
          consignmentEntityId: updatedShippingConsignment.entityId,
          shippingOptionEntityId: firstOption.entityId,
        });

        revalidateTag(TAGS.cart, { expire: 0 });
        revalidateTag(TAGS.checkout, { expire: 0 });

        const currencyCode = checkout.cart?.currencyCode;

        return {
          address: {
            country: submission.value.country,
            state: submission.value.state,
            postalCode: submission.value.postalCode,
          },
          shippingOptions: null,
          shippingOption: {
            value: firstOption.entityId,
            label: firstOption.description,
            price: format.number(firstOption.cost.value, {
              style: 'currency',
              currency: currencyCode,
            }),
          },
          form: null,
          lastResult: submission.reply({ resetForm: true }),
        };
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
    }

    case 'add-address': {
      if (cartId) {
        await clearSectionShippingState(cartId);
      }

      let updatedShippingConsignment:
        | NonNullable<
            Awaited<ReturnType<typeof addCheckoutShippingConsignments>>
          >['shippingConsignments'][number]
        | undefined;

      try {
        const result = shippingId
          ? await updateCheckoutShippingConsignment({
              checkoutEntityId,
              address: {
                countryCode: submission.value.country,
                city: submission.value.city,
                stateOrProvince: submission.value.state,
                postalCode: submission.value.postalCode,
              },
              lineItems,
              shippingId,
            })
          : await addCheckoutShippingConsignments({
              checkoutEntityId,
              address: {
                countryCode: submission.value.country,
                city: submission.value.city,
                stateOrProvince: submission.value.state,
                postalCode: submission.value.postalCode,
              },
              lineItems,
            });

        updatedShippingConsignment = result ? result.shippingConsignments?.[0] : undefined;

        if (!updatedShippingConsignment?.availableShippingOptions) {
          return {
            ...prevState,
            lastResult: submission.reply({ formErrors: [t('cartNotFound')] }),
          };
        }
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

      revalidateTag(TAGS.cart, { expire: 0 });
      revalidateTag(TAGS.checkout, { expire: 0 });

      const currencyCode = checkout.cart?.currencyCode;

      return {
        address: {
          country: submission.value.country,
          city: submission.value.city,
          state: submission.value.state,
          postalCode: submission.value.postalCode,
        },
        shippingOptions:
          updatedShippingConsignment?.availableShippingOptions?.map((option) => ({
            label: option.description,
            value: option.entityId,
            price: format.number(option.cost.value, {
              style: 'currency',
              currency: currencyCode,
            }),
          })) ?? null,
        shippingOption: null,
        form: 'shipping' as const,
        lastResult: submission.reply({ resetForm: true }),
      };
    }

    case 'add-shipping': {
      try {
        if (!shippingConsignment?.entityId) {
          return {
            ...prevState,
            lastResult: submission.reply({ formErrors: [t('cartNotFound')] }),
          };
        }

        await addShippingCost({
          checkoutEntityId,
          consignmentEntityId: shippingConsignment.entityId,
          shippingOptionEntityId: submission.value.shippingOption,
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

      revalidateTag(TAGS.cart, { expire: 0 });
      revalidateTag(TAGS.checkout, { expire: 0 });

      const selectedOption = shippingConsignment.availableShippingOptions?.find(
        (option) => option.entityId === submission.value.shippingOption,
      );

      return {
        ...prevState,
        shippingOption: selectedOption
          ? {
              value: selectedOption.entityId,
              label: selectedOption.description,
              price: format.number(selectedOption.cost.value, {
                style: 'currency',
                currency: checkout.cart?.currencyCode,
              }),
            }
          : prevState.shippingOption,
        form: 'shipping' as const,
        lastResult: submission.reply({ resetForm: true }),
      };
    }

    default: {
      return prevState;
    }
  }
};
