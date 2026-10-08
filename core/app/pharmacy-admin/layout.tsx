import type { ReactNode } from 'react';

import '~/app/[locale]/(default)/liivv-feature-buttons.css';

export default function PharmacyAdminLayout({ children }: { children: ReactNode }) {
  return <div className="liivv-staff-portal liivv-pharmacy-admin-portal">{children}</div>;
}
