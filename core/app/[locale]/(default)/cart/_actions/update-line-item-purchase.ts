'use server';

import { getTranslations } from 'next-intl/server';

import { getCartId } from '~/lib/cart';
import { parseCartLineItemId } from '~/lib/checkout/expand-cart-line-items';
import { adjustSubscriptionQuantity } from '~/lib/checkout/subscription-lines';
import { getKitSession, kitShipQuantity, removeKitItemFromSession, updateKitItemQuantity, updateKitShipQuantity } from '~/lib/kit';
import { kitShipQuantityOf, kitUnitQuantityOf } from '~/lib/kit/scale-kit-line-quantities';

import { removeItem } from './remove-item';
import { CartSelectedOptionsInput, updateQuantity } from './update-quantity';

interface CartLineItemLike {
  id: string;
  quantity: number;
  productEntityId: number;
  variantEntityId: number | null;
  purchaseType?: 'subscription' | 'one-time';
  lineItemEntityId?: string;
  kitId?: string;
  kitQuantity?: number;
  kitUnitQuantity?: number;
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
  quantityDelta,
}: {
  lineItems: CartLineItemLike[];
  cartLineItem: CartLineItemLike;
  intent: 'increment' | 'decrement' | 'delete';
  quantityDelta?: number;
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
  const isKitRecipeChange = Boolean(cartLineItem.kitId) && quantityDelta == null;
  const kitQuantity = cartLineItem.kitId ? kitShipQuantityOf(cartLineItem) : 1;
  const recipe = kitUnitQuantityOf(cartLineItem);

  if (isKitRecipeChange && intent === 'decrement' && recipe <= 1) {
    return;
  }

  const delta =
    quantityDelta ??
    (intent === 'increment'
      ? kitQuantity
      : intent === 'decrement'
        ? -kitQuantity
        : -cartLineItem.quantity);
  const newTotalQty = siblingTotal + delta;

  // Full line removal clears subscription metadata inside removeItem; skip a separate
  // adjust pass so delete isn't blocked on two storage writes.
  if (newTotalQty <= 0) {
    await removeItem({ lineItemEntityId });

    if (cartLineItem.kitId) {
      await removeKitItemFromSession(cartId, cartLineItem.kitId, cartLineItem.productEntityId);
    }

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

  if (isKitRecipeChange && cartLineItem.kitId && intent !== 'delete') {
    await updateKitItemQuantity(
      cartId,
      cartLineItem.kitId,
      cartLineItem.productEntityId,
      intent === 'increment' ? recipe + 1 : recipe - 1,
    );
  }
}

export async function updateCartKitQuantity({
  lineItems,
  kitId,
  intent,
}: {
  lineItems: CartLineItemLike[];
  kitId: string;
  intent: 'increment-kit' | 'decrement-kit' | 'delete-kit';
}): Promise<void> {
  const t = await getTranslations('Cart.Errors');
  const cartId = await getCartId();

  if (!cartId) {
    throw new Error(t('cartNotFound'));
  }

  const kitLines = lineItems.filter((item) => item.kitId === kitId);

  if (kitLines.length === 0) {
    throw new Error(t('lineItemNotFound'));
  }

  const session = await getKitSession(cartId);
  const kit = session?.kits.find((entry) => entry.kitId === kitId);
  const currentKitQty = kit ? kitShipQuantity(kit) : (kitLines[0]?.kitQuantity ?? 1);
  const nextKitQty =
    intent === 'increment-kit'
      ? currentKitQty + 1
      : intent === 'decrement-kit'
        ? currentKitQty - 1
        : 0;

  if (nextKitQty === currentKitQty) {
    return;
  }

  if (nextKitQty < 1) {
    const removedEntityIds = new Set<string>();

    for (const line of kitLines) {
      const parsedId = parseCartLineItemId(line.id);
      const lineItemEntityId = line.lineItemEntityId ?? parsedId.lineItemEntityId;

      if (removedEntityIds.has(lineItemEntityId)) {
        continue;
      }

      removedEntityIds.add(lineItemEntityId);
      await removeItem({ lineItemEntityId });
    }

    await updateKitShipQuantity(cartId, kitId, 0);

    return;
  }

  const updatedEntityIds = new Set<string>();

  for (const line of kitLines) {
    const parsedId = parseCartLineItemId(line.id);
    const lineItemEntityId = line.lineItemEntityId ?? parsedId.lineItemEntityId;

    if (updatedEntityIds.has(lineItemEntityId)) {
      continue;
    }

    updatedEntityIds.add(lineItemEntityId);

    const unitTotal = kitLines
      .filter((item) => {
        const parsed = parseCartLineItemId(item.id);

        return (item.lineItemEntityId ?? parsed.lineItemEntityId) === lineItemEntityId;
      })
      .reduce((sum, item) => sum + kitUnitQuantityOf(item), 0);
    const siblingTotal = getSiblingTotalQuantity(lineItems, lineItemEntityId);
    const delta = unitTotal * nextKitQty - siblingTotal;

    if (delta === 0) {
      continue;
    }

    await updateCartLinePurchaseQuantity({
      cartLineItem: line,
      intent: delta > 0 ? 'increment' : 'decrement',
      lineItems,
      quantityDelta: delta,
    });
  }

  await updateKitShipQuantity(cartId, kitId, nextKitQty);
}
