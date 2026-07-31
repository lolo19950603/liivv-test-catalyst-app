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
  items: KitItem[];
}

export interface KitSession {
  kits: KitRecord[];
}
