import { ResultOf } from 'gql.tada';

import { StoreLogoFragment } from '~/components/store-logo/fragment';
import { resolveBcCdnImageUrl } from '~/lib/resolve-bc-cdn-image-url';

/** Width for header logo CDN template (`{:size}` → `320w`). */
const HEADER_LOGO_CDN_WIDTH = 320;

export const logoTransformer = (data: ResultOf<typeof StoreLogoFragment>) => {
  const { logoV2: logo } = data;

  if (logo.__typename === 'StoreTextLogo') {
    return logo.text;
  }

  return {
    src: resolveBcCdnImageUrl(logo.image.url, HEADER_LOGO_CDN_WIDTH),
    alt: logo.image.altText,
  };
};
