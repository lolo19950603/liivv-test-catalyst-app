'use server';

import { BigCommerceGQLError } from '@bigcommerce/catalyst-client';
import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { FragmentOf } from 'gql.tada';
import { getTranslations } from 'next-intl/server';

import { CartLineItem } from '@/vibes/soul/sections/cart';
import { cartLineItemActionFormDataSchema } from '@/vibes/soul/sections/cart/schema';

import { DigitalItemFragment, PhysicalItemFragment } from '../page-data';

import { CartSelectedOptionsInput, updateQuantity } from './update-quantity';

type LineItem = {
  selectedOptions:
    | FragmentOf<typeof PhysicalItemFragment>['selectedOptions']
    | FragmentOf<typeof DigitalItemFragment>['selectedOptions'];
  productEntityId: number;
  variantEntityId: number | null;
} & CartLineItem;

function parseCartSelectedOptionsInput(
  selectedOptions: LineItem['selectedOptions'],
): CartSelectedOptionsInput {
  return selectedOptions.reduce<CartSelectedOptionsInput>((accum, option) => {
    let multipleChoicesOptionInput;
    let checkboxOptionInput;
    let numberFieldOptionInput;
    let textFieldOptionInput;
    let multiLineTextFieldOptionInput;
    let dateFieldOptionInput;

    switch (option.__typename) {
      case 'CartSelectedMultipleChoiceOption':
        multipleChoicesOptionInput = {
          optionEntityId: option.entityId,
          optionValueEntityId: option.valueEntityId ?? 0,
        };

        if (accum.multipleChoices) {
          return {
            ...accum,
            multipleChoices: [...accum.multipleChoices, multipleChoicesOptionInput],
          };
        }

        return {
          ...accum,
          multipleChoices: [multipleChoicesOptionInput],
        };

      case 'CartSelectedCheckboxOption':
        checkboxOptionInput = {
          optionEntityId: option.entityId,
          optionValueEntityId: option.valueEntityId ?? 0,
        };

        if (accum.checkboxes) {
          return {
            ...accum,
            checkboxes: [...accum.checkboxes, checkboxOptionInput],
          };
        }

        return { ...accum, checkboxes: [checkboxOptionInput] };

      case 'CartSelectedNumberFieldOption':
        numberFieldOptionInput = {
          optionEntityId: option.entityId,
          number: 'number' in option ? Number(option.number) : 0,
        };

        if (accum.numberFields) {
          return {
            ...accum,
            numberFields: [...accum.numberFields, numberFieldOptionInput],
          };
        }

        return { ...accum, numberFields: [numberFieldOptionInput] };

      case 'CartSelectedTextFieldOption':
        textFieldOptionInput = {
          optionEntityId: option.entityId,
          text: 'text' in option ? String(option.text) : '',
        };

        if (accum.textFields) {
          return {
            ...accum,
            textFields: [...accum.textFields, textFieldOptionInput],
          };
        }

        return { ...accum, textFields: [textFieldOptionInput] };

      case 'CartSelectedMultiLineTextFieldOption':
        multiLineTextFieldOptionInput = {
          optionEntityId: option.entityId,
          text: 'text' in option ? String(option.text) : '',
        };

        if (accum.multiLineTextFields) {
          return {
            ...accum,
            multiLineTextFields: [
              ...accum.multiLineTextFields,
              multiLineTextFieldOptionInput,
            ],
          };
        }

        return {
          ...accum,
          multiLineTextFields: [multiLineTextFieldOptionInput],
        };

      case 'CartSelectedDateFieldOption':
        dateFieldOptionInput = {
          optionEntityId: option.entityId,
          date:
            'date' in option && option.date?.utc
              ? new Date(String(option.date.utc)).toISOString()
              : new Date().toISOString(),
        };

        if (accum.dateFields) {
          return {
            ...accum,
            dateFields: [...accum.dateFields, dateFieldOptionInput],
          };
        }

        return { ...accum, dateFields: [dateFieldOptionInput] };

      default:
        return accum;
    }
  }, {});
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

  const cartLineItem = prevState.lineItems.find((item) => item.id === submission.value.id);

  if (!cartLineItem) {
    return {
      ...prevState,
      lastResult: submission.reply({ formErrors: [t('lineItemNotFound')] }),
    };
  }

  const selectedOptions = parseCartSelectedOptionsInput(cartLineItem.selectedOptions);
  const nextQuantity =
    submission.value.intent === 'increment'
      ? cartLineItem.quantity + 1
      : submission.value.intent === 'decrement'
        ? cartLineItem.quantity - 1
        : 0;

  try {
    await updateQuantity({
      lineItemEntityId: cartLineItem.id,
      productEntityId: cartLineItem.productEntityId,
      variantEntityId: cartLineItem.variantEntityId,
      selectedOptions,
      quantity: nextQuantity,
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
