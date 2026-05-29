'use client';

import Autoplay from 'embla-carousel-autoplay';
import type { EmblaCarouselType } from 'embla-carousel';
import { useEffect, useRef } from 'react';

/** One Autoplay instance per carousel — avoids Embla v9 plugin double-init bugs. */
export function useStableAutoplayPlugins(
  carouselEnabled: boolean,
  delayMs: number,
): ReturnType<typeof Autoplay>[] {
  const pluginsRef = useRef<ReturnType<typeof Autoplay>[]>([]);
  const delayRef = useRef(delayMs);

  if (!carouselEnabled) {
    return [];
  }

  if (pluginsRef.current.length === 0 || delayRef.current !== delayMs) {
    delayRef.current = delayMs;
    pluginsRef.current = [Autoplay({ delay: delayMs, active: true })];
  }

  return pluginsRef.current;
}

/** Embla v9 Autoplay does not auto-start — call play() after init/reinit. */
export function useSyncEmblaAutoplay(
  emblaApi: EmblaCarouselType | undefined,
  carouselEnabled: boolean,
  shouldPlay: boolean,
) {
  useEffect(() => {
    if (!carouselEnabled || emblaApi == null) {
      return;
    }

    const sync = () => {
      const plugin = emblaApi.plugins().autoplay;

      if (plugin == null) {
        return;
      }

      if (shouldPlay) {
        plugin.play();
      } else {
        plugin.stop();
      }
    };

    sync();
    const retryId = window.setTimeout(sync, 0);
    emblaApi.on('reinit', sync);

    return () => {
      window.clearTimeout(retryId);
      emblaApi.off('reinit', sync);
    };
  }, [carouselEnabled, emblaApi, shouldPlay]);
}
