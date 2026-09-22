'use client';

import { PropsWithChildren } from 'react';

import { Toaster } from '@/vibes/soul/primitives/toaster';
import { MiniCartProvider } from '~/components/mini-cart';
import { SearchProvider } from '~/lib/search';

export function Providers({ children }: PropsWithChildren) {
  return (
    <SearchProvider>
      <MiniCartProvider>
        <Toaster position="top-right" />
        {children}
      </MiniCartProvider>
    </SearchProvider>
  );
}
