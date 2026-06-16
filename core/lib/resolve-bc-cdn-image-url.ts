import { buildBcCdnImageUrl } from '~/lib/bc-cdn-image-url';

/**
 * BigCommerce `urlTemplate(lossy: true)` URLs contain `{:size}`.
 * Next `<Image>` resolves it via `bcCdnImageLoader`; plain `<img>` needs this helper.
 */
export function resolveBcCdnImageUrl(url: string, width = 320): string {
  const trimmed = url.trim();

  if (trimmed.length === 0) {
    return '';
  }

  return buildBcCdnImageUrl(trimmed, width);
}
