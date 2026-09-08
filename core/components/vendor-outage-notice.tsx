import { Link } from '~/components/link';
import type { VendorName } from '~/lib/vendor-outage';
import { vendorOutageCopy } from '~/lib/vendor-outage/ui';

export function VendorOutageNotice({
  vendor,
  href,
  layout = 'banner',
}: {
  vendor: VendorName;
  href?: string;
  layout?: 'banner' | 'page';
}) {
  const copy = vendorOutageCopy(vendor);
  const ctaHref =
    href ??
    (vendor === 'supabase' ? '/' : vendor === 'stripe' ? '/cart/' : undefined);

  if (layout === 'page') {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="font-heading text-3xl font-medium text-[#2c2a26]">{copy.title}</h1>
        <p className="mt-3 text-lg text-[#6b6560]">{copy.body}</p>
        {ctaHref ? (
          <Link
            className="mt-8 inline-flex rounded-full bg-[#2c2a26] px-5 py-2.5 text-sm font-medium text-white"
            href={ctaHref}
          >
            {copy.cta}
          </Link>
        ) : null}
      </section>
    );
  }

  return (
    <div
      className="border-b border-[#e8dcc4] bg-[#fdf8ee] px-4 py-3 text-center text-sm text-[#7a5c20]"
      role="status"
    >
      <p className="font-medium">{copy.title}</p>
      <p className="mt-1">{copy.body}</p>
    </div>
  );
}
