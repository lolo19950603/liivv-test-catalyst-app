'use client';

import { ImageLoaderProps } from 'next/image';

import { buildBcCdnImageUrl } from '~/lib/bc-cdn-image-url';

export default function bcCdnImageLoader({ src, width }: ImageLoaderProps): string {
  return buildBcCdnImageUrl(src, width);
}
