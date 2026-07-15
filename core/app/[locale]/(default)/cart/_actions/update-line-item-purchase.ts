'use server';

import { getTranslations } from 'next-intl/server';

import { parseCartLineItemId } from '~/lib/checkout/expand-cart-line-items';
import { adjustSubscriptionQuantity } from '~/lib/checkout/subscription-lines';
import { getCartId } from '~/lib/cart';

import { removeItem } from './remove-item';
import { CartSelectedOptionsInput, updateQuantity } from './update-quantity';

interface CartLineItemLike {
  id: string;
  quantity: number;
  productEntityId: number;
  variantEntityId: number | null;
  purchaseType?: 'subscription' | 'one-time';
  lineItemEntityId?: string;
  selectedOptions: Array<{
    __typename?: string;
    entityId: number;
    valueEntityId?: number | null;
    number?: number;
    text?: string;
    date?: { utc: string };
  }>;
}

function parseCartSelectedOptionsInput(
  selectedOptions: CartLineItemLike['selectedOptions'],
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

function getSiblingTotalQuantity(
  lineItems: CartLineItemLike[],
  lineItemEntityId: string,
): number {
  return lineItems
    .filter((lineItem) => {
      const parsed = parseCartLineItemId(lineItem.id);

      return (lineItem.lineItemEntityId ?? parsed.lineItemEntityId) === lineItemEntityId;
    })
    .reduce((total, lineItem) => total + lineItem.quantity, 0);
}

export async function updateCartLinePurchaseQuantity({
  lineItems,
  cartLineItem,
  intent,
}: {
  lineItems: CartLineItemLike[];
  cartLineItem: CartLineItemLike;
  intent: 'increment' | 'decrement' | 'delete';
}): Promise<void> {
  const t = await getTranslations('Cart.Errors');
  const cartId = await getCartId();

  if (!cartId) {
    throw new Error(t('cartNotFound'));
  }

  const parsedId = parseCartLineItemId(cartLineItem.id);
  const lineItemEntityId = cartLineItem.lineItemEntityId ?? parsedId.lineItemEntityId;
  const purchaseType = cartLineItem.purchaseType ?? parsedId.purchaseType;
  const subscriptionLineKey = parsedId.subscriptionLineKey;
  const selectedOptions = parseCartSelectedOptionsInput(cartLineItem.selectedOptions);
  const siblingTotal = getSiblingTotalQuantity(lineItems, lineItemEntityId);

  const delta =
    intent === 'increment' ? 1 : intent === 'decrement' ? -1 : -cartLineItem.quantity;
  const newTotalQty = siblingTotal + delta;

  // Full line removal clears subscription metadata inside removeItem; skip a separate
  // adjust pass so delete isn't blocked on two storage writes.
  if (newTotalQty <= 0) {
    await removeItem({ lineItemEntityId });

    return;
  }

  if (purchaseType === 'subscription' && subscriptionLineKey) {
    await adjustSubscriptionQuantity(cartId, subscriptionLineKey, delta);
  }

  await updateQuantity({
    lineItemEntityId,
    productEntityId: cartLineItem.productEntityId,
    variantEntityId: cartLineItem.variantEntityId,
    selectedOptions,
    quantity: newTotalQty,
  });
}
