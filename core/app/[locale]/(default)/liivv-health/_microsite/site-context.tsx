'use client';

/*
 * =============================================================================
 * THE SITE A CHAPTER BELONGS TO
 * =============================================================================
 * Engine components never name a site. They read its config, its copy and its
 * own figures through the hooks here, from a SiteProvider that the site's own
 * 'use client' wrapper renders around the chapter page:
 *
 *   <SiteProvider value={DIABETES_SITE} figures={DC_FIGURES}>
 *
 * The wrapper is a client component on purpose. The config and the figure
 * registry are imported on the client side rather than handed down from a
 * server component, so neither is serialised into the page's payload, and the
 * registry, which holds functions, never has to be.
 * =============================================================================
 */

import {
  type Messages,
  type NamespaceKeys,
  type NestedKeyOf,
  useMessages,
  useTranslations,
} from 'next-intl';
import { createContext, type ReactNode, useContext, useMemo } from 'react';

import type { SiteConfig, SiteNs } from './site';

/*
 * A site's own figures: every kind the engine does not draw itself
 * (chapters/kinds.ts). The engine's figure switch hands any other kind to
 * `render`, which returns null for a kind it does not know, as the switch's own
 * default does.
 *
 * `Card` and `Exit` are the composed card and the chapter's emergency
 * signpost, typed where the engine composes them. `render` is declared as a
 * method rather than a function property so that a registry written against
 * one site's own figure union can still be held here: TypeScript compares
 * method parameters in both directions.
 */
export interface SiteFigureRegistry<
  Figure extends { kind: string } = { kind: string },
  Card = unknown,
  Exit = unknown,
> {
  render(figure: Figure, context: { card: Card; exit?: Exit }): ReactNode;
}

interface SiteContextValue {
  site: SiteConfig;
  figures?: SiteFigureRegistry;
}

const SiteContext = createContext<SiteContextValue | null>(null);

export function SiteProvider({
  value,
  figures,
  children,
}: {
  value: SiteConfig;
  figures?: SiteFigureRegistry;
  children: ReactNode;
}) {
  const context = useMemo(() => ({ site: value, figures }), [value, figures]);

  return <SiteContext.Provider value={context}>{children}</SiteContext.Provider>;
}

function useSiteContext() {
  const context = useContext(SiteContext);

  if (!context) {
    throw new Error('useSite must be used within SiteProvider');
  }

  return context;
}

export function useSite() {
  return useSiteContext().site;
}

/* The site's own figures, or undefined for a site that has none. */
export function useSiteFigures() {
  return useSiteContext().figures;
}

/*
 * The schema engine copy is typed against. `DiabetesCare.ui.chapter` is the
 * engine's contract: it holds engine keys only, and every site's tree carries
 * all of them. Until `DiabetesCare` is in en.json this is `never`, so nothing
 * can call useSiteT yet.
 */
type ContractMessages = Messages[Extract<keyof Messages, 'DiabetesCare'>];

/* A namespace inside a site's tree, such as 'ui.chapter' or 'ui.chapter.crisis'. */
export type SiteSubNamespace = NamespaceKeys<ContractMessages, NestedKeyOf<ContractMessages>>;

/*
 * useTranslations for a namespace inside the site's own tree. Keys and ICU
 * arguments are typed against the contract; at run time the site's own
 * namespace is read.
 *
 * This is the engine's one cast, and it stays here. next-intl's key types
 * distribute over a union, so typing `${site.ns}.ui.chapter` as either site
 * would accept a key that exists in only one of them. One reference schema
 * does not.
 */
export function useSiteT<Sub extends SiteSubNamespace>(sub: Sub) {
  const site = useSite();
  const namespace = [site.ns, sub].join('.');

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- the engine's one cast; see above
  return useTranslations(namespace as `DiabetesCare.${Sub}`);
}

/*
 * The site's whole message tree, for code that walks it rather than
 * translating one key: composing chapters from numbered keys, or reading a
 * label by a structural key. Typed as any one of the site trees, so only what
 * every site has can be read without checking first.
 */
export function useSiteMessages(): Messages[SiteNs] {
  const site = useSite();

  return useMessages()[site.ns];
}
