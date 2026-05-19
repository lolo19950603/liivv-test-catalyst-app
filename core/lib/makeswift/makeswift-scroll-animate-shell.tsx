'use client';

import type { ReactNode } from 'react';

import { DIABETES_CARE_SCROLL_ANIMATE_CSS } from '~/lib/makeswift/diabetes-care-scroll-animate';

/** Scroll-reveal + split-word animation styles for Makeswift diabetes-care pages. */
export function MakeswiftScrollAnimateShell({ children }: { children: ReactNode }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: DIABETES_CARE_SCROLL_ANIMATE_CSS }} />
      {children}
    </>
  );
}
