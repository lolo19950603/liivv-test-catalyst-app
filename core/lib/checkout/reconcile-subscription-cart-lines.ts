import type { ProductOptionSelection } from '~/lib/bigcommerce/product-options';

import { mapCartSelectedOptionsToProductOptions } from './map-cart-options';
import { productOptionsKey } from './product-options-key';
import { subscriptionLineIdentityKey } from './subscription-line-key';
import type { SubscriptionLineMeta } from './types';

interface CartLineItemLike {
  entityId: string;
  productEntityId: number;
  selectedOptions: Parameters<typeof mapCartSelectedOptionsToProductOptions>[0];
}

function cartLineMatchesProductOptions(
  cartLine: CartLineItemLike,
  productEntityId: number,
  productOptions: ProductOptionSelection[],
): boolean {
  if (cartLine.productEntityId !== productEntityId) {
    return false;
  }

  const cartOptions = mapCartSelectedOptionsToProductOptions(cartLine.selectedOptions);

  return productOptionsKey(cartOptions) === productOptionsKey(productOptions);
}

function reconcileSubscriptionGroup(
  subscriptionLines: SubscriptionLineMeta[],
  cartLines: CartLineItemLike[],
): SubscriptionLineMeta[] {
  if (cartLines.length === 0) {
    return subscriptionLines;
  }

  if (cartLines.length === 1) {
    const cartLineItemEntityId = String(cartLines[0]!.entityId);

    return subscriptionLines.map((line) => ({
      ...line,
      cartLineItemEntityId,
    }));
  }

  const claimedCartLineIds = new Set<string>();
  const reconciled = subscriptionLines.map((line) => {
    const existingId = line.cartLineItemEntityId
      ? String(line.cartLineItemEntityId)
      : undefined;

    if (
      existingId &&
      cartLines.some((cartLine) => cartLine.entityId === existingId) &&
      !claimedCartLineIds.has(existingId)
    ) {
      claimedCartLineIds.add(existingId);

      return { ...line, cartLineItemEntityId: existingId };
    }

    return { ...line, cartLineItemEntityId: undefined };
  });

  const unclaimedCartLines = cartLines.filter(
    (cartLine) => !claimedCartLineIds.has(cartLine.entityId),
  );

  let nextCartLine = 0;

  return reconciled.map((line) => {
    if (line.cartLineItemEntityId) {
      return line;
    }

    if (nextCartLine < unclaimedCartLines.length) {
      const cartLineItemEntityId = String(unclaimedCartLines[nextCartLine]!.entityId);

      nextCartLine += 1;

      return { ...line, cartLineItemEntityId };
    }

    return {
      ...line,
      cartLineItemEntityId: String(cartLines[0]!.entityId),
    };
  });
}

export function reconcileSubscriptionLinesToCartItems(
  subscriptionLines: SubscriptionLineMeta[],
  cartLineItems: CartLineItemLike[],
): SubscriptionLineMeta[] {
  const groups = new Map<string, SubscriptionLineMeta[]>();

  for (const line of subscriptionLines) {
    const groupKey = [
      line.productEntityId,
      productOptionsKey(line.productOptions) || 'default',
    ].join('~');
    const group = groups.get(groupKey) ?? [];

    group.push(line);
    groups.set(groupKey, group);
  }

  const reconciled: SubscriptionLineMeta[] = [];

  for (const groupLines of groups.values()) {
    const [firstLine] = groupLines;

    if (!firstLine) {
      continue;
    }

    const matchingCartLines = cartLineItems.filter((cartLine) =>
      cartLineMatchesProductOptions(
        cartLine,
        firstLine.productEntityId,
        firstLine.productOptions,
      ),
    );

    reconciled.push(...reconcileSubscriptionGroup(groupLines, matchingCartLines));
  }

  return reconciled.sort((left, right) =>
    subscriptionLineIdentityKey(left).localeCompare(subscriptionLineIdentityKey(right)),
  );
}

export function findCartLineForNewSubscription({
  cartLineItems,
  productEntityId,
  productOptions,
  subscriptionLines,
  subscriptionLineIdentity,
}: {
  cartLineItems: CartLineItemLike[];
  productEntityId: number;
  productOptions: ProductOptionSelection[];
  subscriptionLines: SubscriptionLineMeta[];
  subscriptionLineIdentity: string;
}): CartLineItemLike | undefined {
  const matchingCartLines = cartLineItems.filter((cartLine) =>
    cartLineMatchesProductOptions(cartLine, productEntityId, productOptions),
  );

  if (matchingCartLines.length === 0) {
    return undefined;
  }

  if (matchingCartLines.length === 1) {
    return matchingCartLines[0];
  }

  const identityByCartLineId = new Map<string, string>();

  for (const line of subscriptionLines) {
    if (
      line.productEntityId === productEntityId &&
      line.cartLineItemEntityId &&
      productOptionsKey(line.productOptions) === productOptionsKey(productOptions)
    ) {
      identityByCartLineId.set(
        String(line.cartLineItemEntityId),
        subscriptionLineIdentityKey(line),
      );
    }
  }

  for (const cartLine of [...matchingCartLines].reverse()) {
    const assignedIdentity = identityByCartLineId.get(cartLine.entityId);

    if (!assignedIdentity || assignedIdentity === subscriptionLineIdentity) {
      return cartLine;
    }
  }

  return matchingCartLines.at(-1);
}
