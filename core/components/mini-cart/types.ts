export interface MiniCartLine {
  id: string;
  title: string;
  brand?: string;
  subtitle?: string;
  href?: string;
  image?: { src: string; alt: string };
  quantity: number;
  unitPrice: string;
  lineTotal: string;
  lockQuantity?: boolean;
  isGiftCertificate?: boolean;
  subscriptionBadge?: string;
  subscriptionDetails?: string[];
}

export interface MiniCartKit {
  kitId: string;
  title: string;
  href?: string;
  image?: { src: string; alt: string };
  quantity: number;
  itemCount: number;
  lineTotal: string;
  items: MiniCartLine[];
}

export type MiniCartEntry =
  | { type: 'item'; item: MiniCartLine }
  | { type: 'kit'; kit: MiniCartKit };

export interface MiniCartRecommendation {
  id: string;
  title: string;
  href: string;
  image?: { src: string; alt: string };
  price: string;
  hasVariants: boolean;
}

export interface MiniCartFreeShipping {
  qualified: boolean;
  progress: number;
  remainingFormatted: string;
}

export interface MiniCartSnapshot {
  empty: boolean;
  itemCount: number;
  currencyCode: string;
  subtotal: string;
  total: string;
  checkoutHref: string;
  cartHref: string;
  freeShipping: MiniCartFreeShipping | null;
  entries: MiniCartEntry[];
  recommendations: MiniCartRecommendation[];
}
