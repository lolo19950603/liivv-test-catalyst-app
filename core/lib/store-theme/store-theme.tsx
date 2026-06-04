'use client';

import { createContext, useContext, type ReactNode } from 'react';

import type { StoreButtonAppearance } from './archive-button-maps';

export type StoreTheme = {
  buttonAppearance: StoreButtonAppearance;
  productCardVariant: 'default' | 'archive';
  paginationVariant: 'default' | 'archive';
};

const defaultStoreTheme: StoreTheme = {
  buttonAppearance: 'archive',
  productCardVariant: 'archive',
  paginationVariant: 'archive',
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
