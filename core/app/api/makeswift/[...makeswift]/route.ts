import { type Font, MakeswiftApiHandler } from '@makeswift/runtime/next/server';
import { strict } from 'assert';

import { runtime } from '~/lib/makeswift/runtime';

import '~/lib/makeswift/components';

strict(process.env.MAKESWIFT_SITE_API_KEY, 'MAKESWIFT_SITE_API_KEY is required');

// The weights core/app/fonts.ts loads.
const poppinsVariants: Font['variants'] = ['300', '400', '500', '600', '700'].map((weight) => ({
  weight,
  style: 'normal',
}));

const handler = MakeswiftApiHandler(process.env.MAKESWIFT_SITE_API_KEY, {
  runtime,
  apiOrigin: process.env.NEXT_PUBLIC_MAKESWIFT_API_ORIGIN ?? process.env.MAKESWIFT_API_ORIGIN,
  appOrigin: process.env.NEXT_PUBLIC_MAKESWIFT_APP_ORIGIN ?? process.env.MAKESWIFT_APP_ORIGIN,
  /*
   * Poppins is the store's one typeface (brand guide in docs/brand/, owner
   * decision of 2026-10-07), so it is the only font the Makeswift editor offers.
   */
  getFonts() {
    return [
      {
        family: 'var(--font-family-poppins)',
        label: 'Poppins',
        variants: poppinsVariants,
      },
    ];
  },
});

export { handler as GET, handler as POST, handler as OPTIONS };
