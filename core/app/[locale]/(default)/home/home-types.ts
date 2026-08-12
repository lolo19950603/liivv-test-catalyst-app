export type HomeProductCategory = {
  name: string;
  path: string;
};

export type HomeProduct = {
  entityId: number;
  name: string;
  path: string;
  image?: { src: string; alt: string };
  priceLabel?: string;
  categories: HomeProductCategory[];
};

export type HomeCategory = {
  name: string;
  path: string;
  image: { src: string; alt: string };
};
