'use client';

import { createContext, useContext, type ReactNode } from 'react';

import type { ProductImageFallbackLogo } from '@/vibes/soul/primitives/product-card';

import type { StoreButtonAppearance } from './archive-button-maps';

export type StoreTheme = {
  buttonAppearance: StoreButtonAppearance;
  productCardVariant: 'default' | 'archive';
  paginationVariant: 'default' | 'archive';
  productImageFallbackLogo: ProductImageFallbackLogo | null;
};

const defaultStoreTheme: StoreTheme = {
  buttonAppearance: 'archive',
  productCardVariant: 'archive',
  paginationVariant: 'archive',
  productImageFallbackLogo: null,
};

const StoreThemeContext = createContext<StoreTheme>(defaultStoreTheme);

export function StoreThemeProvider({
  children,
  theme = defaultStoreTheme,
}: {
  children: ReactNode;
  theme?: Partial<StoreTheme>;
}) {
  const value: StoreTheme = { ...defaultStoreTheme, ...theme };

  return <StoreThemeContext.Provider value={value}>{children}</StoreThemeContext.Provider>;
}

export function useStoreTheme(): StoreTheme {
  return useContext(StoreThemeContext);
}
