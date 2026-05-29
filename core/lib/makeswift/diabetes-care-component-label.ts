/** Makeswift component picker group name (first segment before `/`). */
export const SPECIALIZED_PAGE_COMPONENT_GROUP = 'Specialized page';

/**
 * Makeswift groups components by `/` and sorts labels alphabetically within each group.
 * Zero-padded folder segments (`00`, `01`, …) sort 0–14 correctly.
 */
export function diabetesCareComponentLabel(sectionOrder: number, componentTitle: string): string {
  const folder = String(sectionOrder).padStart(2, '0');

  return `${SPECIALIZED_PAGE_COMPONENT_GROUP} / ${folder} / ${componentTitle}`;
}
