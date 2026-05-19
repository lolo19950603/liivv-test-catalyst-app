import 'server-only';

import { getArchiveHtmlParts } from './archived-html-parts';
import type { DiabetesCareSectionSuffix } from './diabetes-care-section-allowlist';

const SECTION_ID_PREFIX = 'shopify-section-template--26520397447459__';

/** Global Shopify layout footer (Liivv storefront), not part of the page template slice. */
const STOREFRONT_FOOTER_MARKERS = ['<footer class="footer-group"', '<footer class=footer-group'] as const;

function storefrontFooterOpenIndex(html: string, searchFrom: number): number | undefined {
  let best: number | undefined;

  for (const marker of STOREFRONT_FOOTER_MARKERS) {
    const idx = html.indexOf(marker, searchFrom);

    if (idx !== -1 && (best === undefined || idx < best)) {
      best = idx;
    }
  }

  return best;
}

function extractShopifySectionSlice(bodyInner: string, suffix: DiabetesCareSectionSuffix): string {
  const escapedPrefix = SECTION_ID_PREFIX.replace(/-/g, '\\-');
  const re = new RegExp(`<div id=${escapedPrefix}([a-zA-Z0-9_]+)`, 'g');
  const positions: Array<{ suffix: string; index: number }> = [];
  let match: RegExpExecArray | null = re.exec(bodyInner);

  while (match !== null) {
    const suf = match[1];

    if (suf !== undefined) {
      positions.push({ suffix: suf, index: match.index });
    }

    match = re.exec(bodyInner);
  }

  positions.sort((a, b) => a.index - b.index);

  const index = positions.findIndex((p) => p.suffix === suffix);

  if (index === -1) {
    throw new Error(`Archived body has no shopify-section for suffix: ${suffix}`);
  }

  const start = positions[index]?.index;

  if (start === undefined) {
    throw new Error(`Invalid section index for suffix: ${suffix}`);
  }

  const rawEnd = index + 1 < positions.length ? positions[index + 1]?.index : bodyInner.length;

  if (rawEnd === undefined) {
    throw new Error(`Invalid section end for suffix: ${suffix}`);
  }

  const footerStart = storefrontFooterOpenIndex(bodyInner, start);
  const end =
    footerStart !== undefined ? Math.min(rawEnd, footerStart) : rawEnd;

  return bodyInner.slice(start, end);
}

/**
 * Raw HTML for one storefront section from the SingleFile export (includes inline `<style>` when present).
 *
 * @param {DiabetesCareSectionSuffix} suffix - Shopify section template suffix from the archived page.
 * @returns {Promise<string>} HTML slice for that section.
 */
export async function getDiabetesCareShopifySectionHtml(
  suffix: DiabetesCareSectionSuffix,
): Promise<string> {
  const { bodyInner } = await getArchiveHtmlParts('diabetes-care.html');

  return extractShopifySectionSlice(bodyInner, suffix);
}
