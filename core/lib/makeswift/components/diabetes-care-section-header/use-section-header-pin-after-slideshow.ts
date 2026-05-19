import type { RefObject } from 'react';

import { useHeaderPinAfterSlideshow } from '~/lib/makeswift/site-header/use-header-pin-after-slideshow';

/** @deprecated Import `useHeaderPinAfterSlideshow` from `~/lib/makeswift/site-header/use-header-pin-after-slideshow`. */
export function useSectionHeaderPinAfterSlideshow(
  sectionRef: RefObject<HTMLDivElement | null>,
  spacerRef: RefObject<HTMLDivElement | null>,
  enabled: boolean,
): void {
  useHeaderPinAfterSlideshow(sectionRef, spacerRef, enabled);
}
