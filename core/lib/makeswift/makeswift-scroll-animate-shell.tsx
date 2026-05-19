'use client';

import type { ReactNode } from 'react';

import {
  DIABETES_CARE_SCROLL_ANIMATE_CSS,
  DiabetesCareScrollAnimateProvider,
} from '~/lib/makeswift/diabetes-care-scroll-animate';

/** Scroll-reveal + split-word animations for Makeswift pages using diabetes-care components. */
export function MakeswiftScrollAnimateShell({ children }: { children: ReactNode }) {
  return (
    <DiabetesCareScrollAnimateProvider>
      <style dangerouslySetInnerHTML={{ __html: DIABETES_CARE_SCROLL_ANIMATE_CSS }} />
      {children}
    </DiabetesCareScrollAnimateProvider>
  );
}
