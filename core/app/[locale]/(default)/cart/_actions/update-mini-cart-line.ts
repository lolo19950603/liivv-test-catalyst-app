'use server';

import { revalidateTag } from 'next/cache';
import { getTranslations } from 'next-intl/server';

import { TAGS } from '~/client/tags';
import { getCartId } from '~/lib/cart';
import { expandGroupedCartLineItems, parseCartLineItemId } from '~/lib/checkout/expand-cart-line-items';
import { reconcileSubscriptionLinesWithCart } from '~/lib/checkout/subscription-lines';
import {
  assignKitIdsToCartLines,
  getKitSession,
  kitShipQuantity,
  resolveKitStorefront,
} from '~/lib/kit';

import { getCart } from '../page-data';
import { updateCartKitQuantity, updateCartLinePurchaseQuantity } from './update-line-item-purchase';
import { removeItem } from './remove-item';

type MiniCartLineIntent = 'increment' | 'decrement' | 'delete';

function revalidateCartTags() {
  revalidateTag(TAGS.cart, { expire: 0 });
  revalidateTag(TAGS.checkout, { expire: 0 });
}

export async function updateMiniCartLine({
  lineItemEntityId,
  kitId,
  intent,
}: {
  lineItemEntityId?: string;
  kitId?: string;
  intent: MiniCartLineIntent;
}): Promise<{ ok: boolean; message?: string }> {
  const t = await getTranslations('Cart.Errors');
  const cartId = await getCartId();

  if (!cartId) {
    return { ok: false, message: t('cartNotFound') };
  }

  const data = await getCart({ cartId });
  const cart = data.site.cart;

  if (!cart) {
    return { ok: false, message: t('cartNotFound') };
  }

  const physicalAndDigital = [
    ...cart.lineItems.physicalItems,
    ...cart.lineItems.digitalItems,
  ].filter((item) => !item.parentEntityId);

  if (kitId) {
    const kitIntent =
      intent === 'increment'
        ? 'increment-kit'
        : intent === 'decrement'
          ? 'decrement-kit'
          : 'delete-kit';
    const session = await getKitSession(cartId);
    const kits = await Promise.all((session?.kits ?? []).map(resolveKitStorefront));
    const matched = assignKitIdsToCartLines(
      physicalAndDigital.map((item) => ({
        id: item.entityId,
        productEntityId: item.productEntityId,
        quantity: item.quantity,
      })),
      kits,
    );
    const kitIdByLineId = new Map(
      matched
        .filter((line): line is typeof line & { kitId: string } => Boolean(line.kitId))
        .map((line) => [line.id, line.kitId]),
    );
    const kit = kits.find((entry) => entry.kitId === kitId);
    const kitQuantity = kit ? kitShipQuantity(kit) : 1;
    const lineItems = physicalAndDigital.map((item) => {
      const assignedKitId = kitIdByLineId.get(item.entityId);
      const recipeQuantity = kit?.items.find(
        (kitItem) => kitItem.productEntityId === item.productEntityId,
      )?.quantity;

      return {
        id: item.entityId,
        quantity: item.quantity,
        productEntityId: item.productEntityId,
        variantEntityId: item.variantEntityId,
        lineItemEntityId: item.entityId,
        kitId: assignedKitId,
        kitQuantity: assignedKitId === kitId ? kitQuantity : undefined,
        kitUnitQuantity:
          assignedKitId === kitId
            ? (recipeQuantity ?? Math.max(1, Math.round(item.quantity / kitQuantity)))
            : undefined,
        selectedOptions: item.selectedOptions,
      };
    });

    try {
      await updateCartKitQuantity({
        intent: kitIntent,
        kitId,
        lineItems,
      });
      revalidateCartTags();

      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : t('failedToUpdateQuantity'),
      };
    }
  }

  if (!lineItemEntityId) {
    return { ok: false, message: t('lineItemNotFound') };
  }

  const parsedLineId = parseCartLineItemId(lineItemEntityId);
  const cartEntityId = parsedLineId.lineItemEntityId;

  const giftCertificate = cart.lineItems.giftCertificates.find(
    (item) => item.entityId === cartEntityId,
  );

  if (giftCertificate) {
    if (intent !== 'delete') {
      return { ok: true };
    }

    try {
      await removeItem({ lineItemEntityId: cartEntityId });
      revalidateCartTags();

      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : t('somethingWentWrong'),
      };
    }
  }

  const subscriptionLines = await reconcileSubscriptionLinesWithCart(cartId, physicalAndDigital);
  const session = await getKitSession(cartId);
  const kits = await Promise.all((session?.kits ?? []).map(resolveKitStorefront));
  const expanded = expandGroupedCartLineItems({
    cartLineItems: physicalAndDigital,
    subscriptionLines,
    buildBaseItem: (item, totalQuantity, entityId) => ({
      id: entityId,
      quantity: totalQuantity,
      productEntityId: item.productEntityId,
      variantEntityId: item.variantEntityId,
      selectedOptions: item.selectedOptions,
    }),
    applySubscription: () => ({}),
  });
  const productsWithKitIds = assignKitIdsToCartLines(
    expanded.map((line) => ({
      id: line.id,
      productEntityId: line.productEntityId,
      quantity: line.quantity,
    })),
    kits,
  );
  const kitIdByLineId = new Map(
    productsWithKitIds
      .filter((line): line is typeof line & { kitId: string } => Boolean(line.kitId))
      .map((line) => [line.id, line.kitId]),
  );
  const kitById = new Map(kits.map((kit) => [kit.kitId, kit]));
  const lineItems = expanded.map((line) => {
    const assignedKitId = kitIdByLineId.get(line.id);
    const kit = assignedKitId ? kitById.get(assignedKitId) : undefined;
    const kitQuantity = kit ? kitShipQuantity(kit) : undefined;
    const recipeQuantity = kit?.items.find(
      (kitItem) => kitItem.productEntityId === line.productEntityId,
    )?.quantity;

    return {
      ...line,
      kitId: assignedKitId,
      kitQuantity,
      kitUnitQuantity:
        assignedKitId && kitQuantity
          ? (recipeQuantity ?? Math.max(1, Math.round(line.quantity / kitQuantity)))
          : undefined,
      lineItemEntityId: line.lineItemEntityId,
      purchaseType: line.purchaseType,
    };
  });
  const cartLineItem =
    lineItems.find((line) => line.id === lineItemEntityId) ??
    lineItems.find((line) => line.lineItemEntityId === cartEntityId);

  if (!cartLineItem) {
    return { ok: false, message: t('lineItemNotFound') };
  }

  try {
    await updateCartLinePurchaseQuantity({
      cartLineItem,
      intent,
      lineItems,
    });
    revalidateCartTags();

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : t('failedToUpdateQuantity'),
    };
  }
}
