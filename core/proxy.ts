import { composeProxies } from './proxies/compose-proxies';
import { withAnalyticsCookies } from './proxies/with-analytics-cookies';
import { withAuth } from './proxies/with-auth';
import { withChannelId } from './proxies/with-channel-id';
import { withIntl } from './proxies/with-intl';
import { withMakeswift } from './proxies/with-makeswift';
import { withRoutes } from './proxies/with-routes';
import { withVercelInternals } from './proxies/with-vercel-internals';

export const proxy = composeProxies(
  withVercelInternals,
  withAuth,
  withMakeswift,
  withIntl,
  withAnalyticsCookies,
  withChannelId,
  withRoutes,
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - archive (static assets under public/archive, e.g. diabetes-care-sections.css)
     * - images (static assets under public/images)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - admin (admin panel)
     * - sitemap.xml (sitemap route)
     * - liivv-health-sitemap.xml (App Router microsite sitemap)
     * - xmlsitemap.php (legacy sitemap route)
     * - robots.txt (robots route)
     *
     * Sitemap routes must be listed here or the proxy will locale-prefix them
     * and try to resolve them against BigCommerce, which 404s.
     */
    '/((?!api|admin|staff|bc-app|archive|images|_next/static|_next/image|favicon.ico|xmlsitemap.php|sitemap.xml|liivv-health-sitemap.xml|robots.txt).*)',
  ],
};
