import { Link } from '~/components/link';
import type { CareNotice } from '~/lib/catalog/care-notices';

/*
 * Under the buy box of a complete CPAP mask, or a kit holding one (owner
 * ruling C26 (b), 2026-10-13; ~/lib/catalog/cpap-masks.ts), in the same
 * `afterForm` slot as the pharmacist notice on insulin and glucagon. The
 * add-to-cart form above it stays: the mask is bought from its page, and the
 * checkout refuses payment until a Liivv pharmacist has approved the
 * customer's CPAP prescription (~/lib/checkout/checkout-gates.ts).
 *
 * The notices arrive as text read on the server (CareNotices is not in the
 * browser's message bundle), each with its sources on the notice itself, and
 * the link goes to the account Pharmacy page where the prescription is sent.
 */
export function RxMaskNotice({
  copy,
  notices,
}: {
  copy: {
    label: string;
    howTo: string;
    pharmacyLink: string;
    sourcesLabel: (count: number) => string;
  };
  notices: readonly CareNotice[];
}) {
  return (
    <aside
      aria-label={copy.label}
      className="border-t border-[var(--product-detail-border,hsl(var(--contrast-100)))] py-6 text-sm"
      data-rx-mask-notice=""
    >
      <ul className="space-y-2">
        {notices.map((notice) => (
          <li data-care-notice={notice.id} key={notice.id}>
            <p className={notice.id === 'rxMaskNotice' ? 'font-medium' : undefined}>
              {notice.text}
            </p>
            {notice.sources.length > 0 ? (
              <p className="mt-1 text-xs text-[var(--product-detail-secondary-text,hsl(var(--contrast-500)))]">
                {copy.sourcesLabel(notice.sources.length)}{' '}
                {notice.sources.map((source, index) => (
                  <span key={source.id}>
                    {index > 0 ? '; ' : null}
                    <a
                      className="underline"
                      href={source.href}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {source.label}
                    </a>
                  </span>
                ))}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
      <p className="mt-3">
        {copy.howTo}{' '}
        <Link className="font-medium underline" href="/account/pharmacy">
          {copy.pharmacyLink}
        </Link>
      </p>
    </aside>
  );
}
