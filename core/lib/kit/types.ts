export interface KitSelectedOptions {
  multipleChoices: Array<{
    optionEntityId: number;
    optionValueEntityId: number;
  }>;
}

export interface KitItem {
  productEntityId: number;
  quantity: number;
  name: string;
  sku?: string;
  variantEntityId?: number;
  selectedOptions?: KitSelectedOptions;
}

export interface KitRecord {
  kitId: string;
  /** Optional curated kit display name for packing staff notes. */
  name?: string;
  /** Storefront path of the curated kit product page. */
  href?: string;
  /** Curated kit product image (not component thumbnails). */
  image?: { src: string; alt: string };
  /**
   * Number of complete kits to ship. Item `quantity` values stay per-kit;
   * cart line quantities are item.quantity × this value. Defaults to 1.
   */
  quantity?: number;
  items: KitItem[];
}

export function kitShipQuantity(kit: Pick<KitRecord, 'quantity'>): number {
  return kit.quantity && kit.quantity > 0 ? kit.quantity : 1;
}

export interface KitSession {
  kits: KitRecord[];
}
