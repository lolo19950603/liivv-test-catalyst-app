export interface KitScalableLine {
  kitId?: string;
  kitQuantity?: number;
  kitUnitQuantity?: number;
  quantity: number;
}

export function kitShipQuantityOf(item: Pick<KitScalableLine, 'kitQuantity'>): number {
  return item.kitQuantity && item.kitQuantity > 0 ? item.kitQuantity : 1;
}

export function kitUnitQuantityOf(item: KitScalableLine): number {
  const kitQuantity = kitShipQuantityOf(item);

  if (item.kitUnitQuantity && item.kitUnitQuantity > 0) {
    return item.kitUnitQuantity;
  }

  return Math.max(1, Math.round(item.quantity / kitQuantity));
}

/** Change one item’s per-kit recipe. Cart quantity becomes recipe × kit quantity. */
export function applyKitRecipeDelta<T extends KitScalableLine>(item: T, recipeDelta: number): T {
  if (!item.kitId || recipeDelta === 0) {
    return { ...item, quantity: item.quantity + recipeDelta };
  }

  const kitQuantity = kitShipQuantityOf(item);
  const nextRecipe = Math.max(1, kitUnitQuantityOf(item) + recipeDelta);

  return {
    ...item,
    kitUnitQuantity: nextRecipe,
    quantity: nextRecipe * kitQuantity,
  };
}

/** Scale cart line quantities for a kit without changing per-kit (recipe) amounts. */
export function scaleKitLineQuantities<T extends KitScalableLine>(
  items: T[],
  kitId: string,
  nextKitQuantity: number,
): T[] {
  if (nextKitQuantity <= 0) {
    return items.filter((item) => item.kitId !== kitId);
  }

  return items.map((item) => {
    if (item.kitId !== kitId) {
      return item;
    }

    const unitQuantity = kitUnitQuantityOf(item);

    return {
      ...item,
      kitQuantity: nextKitQuantity,
      kitUnitQuantity: unitQuantity,
      quantity: unitQuantity * nextKitQuantity,
    };
  });
}
