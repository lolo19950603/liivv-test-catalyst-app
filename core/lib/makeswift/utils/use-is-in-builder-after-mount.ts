'use client';

import { useIsInBuilder } from '@makeswift/runtime/react';
import { useEffect, useState } from 'react';

/**
 * Makeswift's `useIsInBuilder()` can differ between SSR and the first client render.
 * Defer builder-only UI until after mount so hydration markup matches the server.
 */
export function useIsInBuilderAfterMount(): boolean {
  const isInBuilder = useIsInBuilder();
  const [isInBuilderAfterMount, setIsInBuilderAfterMount] = useState(false);

  useEffect(() => {
    setIsInBuilderAfterMount(isInBuilder);
  }, [isInBuilder]);

  return isInBuilderAfterMount;
}
