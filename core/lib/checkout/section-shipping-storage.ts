import 'server-only';

import { kv } from '~/lib/kv';

export interface SectionShippingOption {
  entityId: string;
  description: string;
  cost: number;
  isRecommended?: boolean;
}

export interface SectionShippingEntry {
  options: SectionShippingOption[];
  selectedOptionId?: string;
  selectedCost?: number;
  selectedDescription?: string;
  quoteVersion?: number;
}

/** Bump when shipping quote logic changes so checkout re-fetches BC rates. */
export const SECTION_SHIPPING_QUOTE_VERSION = 3;

export type SectionShippingState = Record<string, SectionShippingEntry>;

function sectionShippingKey(cartId: string): string {
  return `checkout:section-shipping:${cartId}`;
}

export async function getSectionShippingState(cartId: string): Promise<SectionShippingState> {
  return (await kv.get<SectionShippingState>(sectionShippingKey(cartId))) ?? {};
}

export async function setSectionShippingState(
  cartId: string,
  state: SectionShippingState,
): Promise<void> {
  await kv.set(sectionShippingKey(cartId), state);
}

export async function updateSectionShippingEntry(
  cartId: string,
  sectionId: string,
  entry: SectionShippingEntry,
): Promise<SectionShippingState> {
  const state = await getSectionShippingState(cartId);

  state[sectionId] = entry;
  await setSectionShippingState(cartId, state);

  return state;
}

export async function clearSectionShippingState(cartId: string): Promise<void> {
  await setSectionShippingState(cartId, {});
}

export function getSectionShippingCosts(
  state: SectionShippingState,
): Record<string, number> {
  return Object.fromEntries(
    Object.entries(state)
      .filter(([, entry]) => entry.selectedCost != null)
      .map(([sectionId, entry]) => [sectionId, entry.selectedCost as number]),
  );
}

export function isSectionShippingReady(
  sections: Array<{ id: string; requiresShipping: boolean }>,
  state: SectionShippingState,
): boolean {
  return sections.every((section) => {
    if (!section.requiresShipping) {
      return true;
    }

    const entry = state[section.id];

    return Boolean(entry?.selectedOptionId && entry.selectedCost != null);
  });
}
