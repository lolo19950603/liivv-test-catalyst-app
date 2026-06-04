import type { LiivvArchiveHeaderLogo } from '~/lib/makeswift/liivv-archive-header/types';

export type StoreLogo = string | { src: string; alt: string };

const DEFAULT_LOGO_MAX = 140;

export function resolveStoreLogo(
  storeLogo: StoreLogo,
  homeLabel: string,
): LiivvArchiveHeaderLogo | null {
  if (typeof storeLogo === 'string') {
    return storeLogo.length > 0 ? { text: storeLogo, alt: homeLabel, href: '/' } : null;
  }

  if (!storeLogo.src) {
    return null;
  }

  return {
    src: storeLogo.src,
    alt: storeLogo.alt || homeLabel,
    href: '/',
    maxWidth: DEFAULT_LOGO_MAX,
    maxHeight: DEFAULT_LOGO_MAX,
  };
}
