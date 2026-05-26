/**
 * Label helpers for "archive" Makeswift components — generic React extractions
 * from Shopify archive pages.
 *
 * These components currently come from `core/public/archive/liivv-home-page.html`
 * and are grouped under `Home page / NN / Title` in the Makeswift picker so
 * they stay independent of the diabetes-care `Specialized page` namespace.
 *
 * If we later extract a second archive page that warrants its own picker
 * group, add another label helper here rather than re-pointing this one.
 */

/** Makeswift component picker group name for liivv home-page archive components. */
export const HOME_PAGE_COMPONENT_GROUP = 'Home page';

/**
 * Makeswift groups components by `/` and sorts labels alphabetically within
 * each group. Zero-padded folder segments (`00`, `01`, …) keep ordering
 * correct even past 9.
 */
export function archiveComponentLabel(sectionOrder: number, componentTitle: string): string {
  const folder = String(sectionOrder).padStart(2, '0');

  return `${HOME_PAGE_COMPONENT_GROUP} / ${folder} / ${componentTitle}`;
}
