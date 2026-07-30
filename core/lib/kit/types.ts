export interface KitItem {
  productEntityId: number;
  quantity: number;
  name: string;
  sku?: string;
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
