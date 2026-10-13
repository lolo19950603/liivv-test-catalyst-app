import { Link } from '~/components/link';

/*
 * The complete-CPAP-mask line above the checkout's delivery and payment
 * sections (owner ruling C26 (b), 2026-10-13; ~/lib/checkout/checkout-gates.ts):
 *
 *   blocked  why the pay button is off, with a link to the account Pharmacy
 *            page when the fix is to add a CPAP prescription there;
 *   on file  the prescription's expiry, and that a Liivv pharmacist checks
 *            every complete-mask order before it ships.
 *
 * A server component: the words arrive as text read on the server
 * (CareNotices is not in the browser's message bundle).
 */
export function RxMaskCheckoutNotice({
  tone,
  message,
  link,
}: {
  tone: 'blocked' | 'info';
  message: string;
  link?: { href: string; label: string };
}) {
  return (
    <div
      className={
        tone === 'blocked'
          ? 'rounded-lg border border-[#e8dcc4] bg-[#fdf8ee] px-4 py-3 text-sm text-[#5c4515]'
          : 'rounded-lg border border-[var(--contrast-200,hsl(var(--contrast-200)))] px-4 py-3 text-sm'
      }
      data-rx-mask-checkout={tone}
      role={tone === 'blocked' ? 'alert' : undefined}
    >
      <p>{message}</p>
      {link ? (
        <p className="mt-2">
          <Link className="font-medium underline" href={link.href}>
            {link.label}
          </Link>
        </p>
      ) : null}
    </div>
  );
}
