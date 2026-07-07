'use client';

import { Link } from '~/components/link';

export function OnboardingBanner({
  href,
  message,
}: {
  href: string;
  message: string;
}) {
  return (
    <div className="mb-6 rounded-xl border border-[#d6d0c5] bg-[#eef4ee] px-4 py-3 text-sm text-[#2c2a26]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>{message}</p>
        <Link
          className="liivv-btn-primary inline-flex shrink-0 items-center justify-center px-4 py-2 text-sm"
          href={href}
        >
          Continue setup
        </Link>
      </div>
    </div>
  );
}
