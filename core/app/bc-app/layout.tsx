import type { ReactNode } from 'react';

import { bcAppCspHeader } from '~/lib/content-security-policy';

import '~/app/[locale]/(default)/liivv-feature-buttons.css';

export async function headers() {
  return {
    'Content-Security-Policy': bcAppCspHeader.replace(/\n/g, ''),
  };
}

export default function BcAppLayout({ children }: { children: ReactNode }) {
  return <div className="liivv-staff-portal liivv-bc-app-portal">{children}</div>;
}
