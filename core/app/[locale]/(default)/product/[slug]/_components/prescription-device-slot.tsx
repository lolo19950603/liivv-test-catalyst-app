import { ArchiveButtonLink } from '@/vibes/soul/primitives/archive-button';
import type { CareNotice } from '~/lib/catalog/care-notices';

/*
 * In place of the buy box on a prescription device's product page (a CPAP,
 * APAP, bilevel or ASV machine, or a bundle or kit holding one;
 * ~/lib/catalog/prescription-devices.ts). A device is never bought online
 * (owner approval, 2026-10-12): the page says "Prescription required", sends
 * the customer to their account's Pharmacy page (Add prescription: a
 * transfer, or their prescriber's fax), offers a call, and lists the notices
 * with their sources on each (~/lib/catalog/care-notices.ts).
 *
 * A server component: every word arrives as text, read on the server, so the
 * browser's message bundle does not change. Links are locale-aware.
 *
 * No ids: the panel is named by `aria-label` (its title), not by an
 * `aria-labelledby` id. The buy box can reach the DOM more than once (a
 * streamed copy and a fallback copy, both hidden, beside the visible one),
 * and those copies share any id React gives them, useId's included.
 */
export function PrescriptionDeviceSlot({
  copy,
  notices,
}: {
  copy: {
    title: string;
    body: string;
    howToSend: string;
    sendPrescription: string;
    bookCall: string;
    noticesLabel: string;
    sourcesLabel: (count: number) => string;
  };
  notices: readonly CareNotice[];
}) {
  return (
    <section
      aria-label={copy.title}
      className="rounded-lg border border-[var(--product-detail-border,hsl(var(--contrast-100)))] px-4 py-5"
      data-prescription-device=""
    >
      <h2 className="text-lg font-semibold">{copy.title}</h2>
      <p className="mt-2">{copy.body}</p>
      <p className="mt-2 text-sm text-[var(--product-detail-secondary-text,hsl(var(--contrast-500)))]">
        {copy.howToSend}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <ArchiveButtonLink href="/account/pharmacy" variant="primary">
          {copy.sendPrescription}
        </ArchiveButtonLink>
        <ArchiveButtonLink href="/account/virtual-care/appointment" variant="secondary">
          {copy.bookCall}
        </ArchiveButtonLink>
      </div>
      {notices.length > 0 ? (
        <div className="mt-5 border-t border-[var(--product-detail-border,hsl(var(--contrast-100)))] pt-4 text-sm">
          <h3 className="font-medium">{copy.noticesLabel}</h3>
          <ul className="mt-2 space-y-3">
            {notices.map((notice) => (
              <li data-care-notice={notice.id} key={notice.id}>
                <p>{notice.text}</p>
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
        </div>
      ) : null}
    </section>
  );
}
