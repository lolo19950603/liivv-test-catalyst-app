'use client';

import { useStoreTheme } from '~/lib/store-theme/store-theme';

export function useStoreLogoFallback(): {
  fallbackLogo: ReturnType<typeof useStoreTheme>['productImageFallbackLogo'];
  isLoading: boolean;
} {
  const { productImageFallbackLogo } = useStoreTheme();

  return {
    fallbackLogo: productImageFallbackLogo,
    isLoading: false,
  };
}
