import { loadEnvConfig } from '@next/env';
import createWithMakeswift from '@makeswift/runtime/next/plugin';
import bundleAnalyzer from '@next/bundle-analyzer';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';

loadEnvConfig(path.join(process.cwd(), '..'));
loadEnvConfig(process.cwd());

import { writeBuildConfig } from './build-config/writer';
import { client } from './client';
import { graphql } from './client/graphql';
import { cspHeader, bcAppCspHeader } from './lib/content-security-policy';

const withMakeswift = createWithMakeswift();
const withNextIntl = createNextIntlPlugin({
  experimental: {
    createMessagesDeclaration: './messages/en.json',
  },
});

const SettingsQuery = graphql(`
  query SettingsQuery {
    site {
      settings {
        url {
          vanityUrl
          cdnUrl
          checkoutUrl
        }
        locales {
          code
          isDefault
        }
      }
    }
  }
`);

async function writeSettingsToBuildConfig() {
  const { data } = await client.fetch({ document: SettingsQuery });

  const cdnEnvHostnames = process.env.NEXT_PUBLIC_BIGCOMMERCE_CDN_HOSTNAME;

  const cdnUrls = (
    cdnEnvHostnames
      ? cdnEnvHostnames.split(',').map((s) => s.trim())
      : [data.site.settings?.url.cdnUrl]
  ).filter((url): url is string => !!url);

  if (!cdnUrls.length) {
    throw new Error(
      'No CDN URLs found. Please ensure that NEXT_PUBLIC_BIGCOMMERCE_CDN_HOSTNAME is set correctly.',
    );
  }

  return await writeBuildConfig({
    locales: data.site.settings?.locales,
    urls: {
      ...data.site.settings?.url,
      cdnUrls,
    },
  });
}

export default async (): Promise<NextConfig> => {
  const settings = await writeSettingsToBuildConfig();

  let nextConfig: NextConfig = {
    reactStrictMode: true,
    experimental: {
      optimizePackageImports: ['@icons-pack/react-simple-icons'],
    },
    typescript: {
      ignoreBuildErrors: !!process.env.CI,
    },
    // default URL generation in BigCommerce uses trailing slash
    trailingSlash: process.env.TRAILING_SLASH !== 'false',
    // eslint-disable-next-line @typescript-eslint/require-await
    async redirects() {
      return [
        {
          source: '/liivv-health/womens-health-demo',
          destination: '/liivv-health/womens-health',
          permanent: true,
        },
        {
          source: '/liivv-health/womens-health-demo/:path*',
          destination: '/liivv-health/womens-health/:path*',
          permanent: true,
        },
        {
          source: '/pages/liivv-health',
          destination: '/liivv-health',
          permanent: true,
        },
        {
          source: '/pages/ostomy-care',
          destination: '/liivv-health/ostomy-care',
          permanent: false,
        },
        {
          source: '/pages/ostomy-every-day-living',
          destination: '/liivv-health/ostomy-care/chapters/everyday-liivving',
          permanent: false,
        },
        {
          source: '/pages/ostomy-get-to-know-your-stoma',
          destination: '/liivv-health/ostomy-care/chapters/get-to-know-your-stoma',
          permanent: false,
        },
        {
          source: '/pages/ostomy-new-to-the-journey',
          destination: '/liivv-health/ostomy-care/chapters/new-to-the-journey',
          permanent: false,
        },
        {
          source: '/pages/ostomy-essentials',
          destination: '/liivv-health/ostomy-care/shop-ostomy-care',
          permanent: false,
        },
        {
          source: '/pages/diabetes-care',
          destination: '/liivv-health/diabetes-care',
          permanent: false,
        },
        {
          source: '/pages/diabetes-care-everyday-living',
          destination: '/liivv-health/diabetes-care',
          permanent: false,
        },
        {
          source: '/pages/diabetes-every-day-living',
          destination: '/liivv-health/diabetes-care/chapters/every-day-living',
          permanent: false,
        },
        {
          source: '/pages/diabetes-essentials',
          destination: '/liivv-health/diabetes-care/shop-diabetes-care',
          permanent: false,
        },
        {
          source: '/liivv-health/diabetes-care/chapters/diabetes-essentials',
          destination: '/liivv-health/diabetes-care/shop-diabetes-care',
          permanent: false,
        },
        {
          source: '/pages/diabetes-new-to-the-journey',
          destination: '/liivv-health/diabetes-care/chapters/new-to-the-journey',
          permanent: false,
        },
        {
          source: '/pages/your-diabetes-journey',
          destination: '/liivv-health/diabetes-care/chapters/your-diabetes-journey',
          permanent: false,
        },
        {
          source: '/pages/diabetes-gestational',
          destination: '/liivv-health/diabetes-care/chapters/gestational',
          permanent: false,
        },
        {
          source: '/pages/diabetes-prediabetes',
          destination: '/liivv-health/diabetes-care/chapters/prediabetes',
          permanent: false,
        },
        {
          source: '/pages/diabetes-type-1',
          destination: '/liivv-health/diabetes-care/chapters/type-1',
          permanent: false,
        },
        {
          source: '/pages/diabetes-type-2',
          destination: '/liivv-health/diabetes-care/chapters/type-2',
          permanent: false,
        },
      ];
    },
    // eslint-disable-next-line @typescript-eslint/require-await
    async headers() {
      const cdnLinks = settings.urls.cdnUrls.map((url) => ({
        key: 'Link',
        value: `<https://${url}>; rel=preconnect`,
      }));

      return [
        {
          source: '/bc-app',
          headers: [
            {
              key: 'Content-Security-Policy',
              value: bcAppCspHeader.replace(/\n/g, ''),
            },
            ...cdnLinks,
          ],
        },
        {
          source: '/bc-app/:path*',
          headers: [
            {
              key: 'Content-Security-Policy',
              value: bcAppCspHeader.replace(/\n/g, ''),
            },
            ...cdnLinks,
          ],
        },
        {
          source: '/api/bigcommerce/app/load',
          headers: [
            {
              key: 'Content-Security-Policy',
              value: bcAppCspHeader.replace(/\n/g, ''),
            },
          ],
        },
        {
          source: '/api/bigcommerce/app/auth',
          headers: [
            {
              key: 'Content-Security-Policy',
              value: bcAppCspHeader.replace(/\n/g, ''),
            },
          ],
        },
        {
          source: '/api/bigcommerce/app/uninstall',
          headers: [
            {
              key: 'Content-Security-Policy',
              value: bcAppCspHeader.replace(/\n/g, ''),
            },
          ],
        },
        {
          source: '/((?!bc-app|api/bigcommerce/app).*)',
          headers: [
            {
              key: 'Content-Security-Policy',
              value: cspHeader.replace(/\n/g, ''),
            },
            ...cdnLinks,
          ],
        },
      ];
    },
  };

  // Apply withNextIntl to the config
  nextConfig = withNextIntl(nextConfig);

  // Apply withMakeswift to the config
  nextConfig = withMakeswift(nextConfig);

  if (process.env.ANALYZE === 'true') {
    const withBundleAnalyzer = bundleAnalyzer();

    nextConfig = withBundleAnalyzer(nextConfig);
  }

  return nextConfig;
};
