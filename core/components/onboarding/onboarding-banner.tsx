'use client';

import { Link } from '~/components/link';

export function OnboardingBanner({
  href,
  message,
  ctaLabel,
}: {
  href: string;
  message: string;
  ctaLabel: string;
}) {
  return (
    <div className="mhd-onboarding-banner">
      <div className="mhd-onboarding-banner__inner">
        <p className="mhd-onboarding-banner__message">{message}</p>
        <Link className="liivv-btn-primary mhd-onboarding-banner__cta" href={href}>
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
}
