'use client';

/*
 * Diabetes Care landing — Steady Balance / Everyday Rhythm.
 *
 * The page itself is the shared engine's (../_microsite/landing/landing-page),
 * drawn with this site's config, its words in `DiabetesCare.ui.landingPage`
 * and its look in ./diabetes-care.css (cream and blush, pill buttons), which
 * every `dc-` class on the page is styled by. Its structure is worked out on
 * the server, in ./page.tsx, from ./landing-meta.ts.
 *
 * A client component on purpose, like the chapters' wrapper: the site config
 * is imported here, on the client side, so it is never serialised into the
 * page's payload (../_microsite/site.ts says why).
 */

import type { ReactNode } from 'react';

import { LandingPage } from '../_microsite/landing/landing-page';
import type { LandingSetup } from '../_microsite/landing/types';
import { SiteProvider } from '../_microsite/site-context';

import { DIABETES_SITE } from './chapters/site';

import './diabetes-care.css';

export function DiabetesCarePage({ setup, doors }: { setup: LandingSetup; doors?: ReactNode }) {
  return (
    <SiteProvider value={DIABETES_SITE}>
      <LandingPage doors={doors} setup={setup} />
    </SiteProvider>
  );
}
