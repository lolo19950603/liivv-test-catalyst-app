/**
 * Label helpers for Liivv Health page Makeswift components
 * (`core/public/archive/liivv-health-page.html`).
 */

export const HEALTH_PAGE_COMPONENT_GROUP = 'Health page';

export function healthPageComponentLabel(sectionOrder: number, componentTitle: string): string {
  const folder = String(sectionOrder).padStart(2, '0');

  return `${HEALTH_PAGE_COMPONENT_GROUP} / ${folder} / ${componentTitle}`;
}
