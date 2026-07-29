export interface KitItem {
  productEntityId: number;
  quantity: number;
  name: string;
  sku?: string;
}

export interface KitRecord {
  kitId: string;
  items: KitItem[];
}

export interface KitSession {
  kits: KitRecord[];
}
