import type { ReactNode } from 'react';

import '~/app/[locale]/(default)/liivv-feature-buttons.css';

export default function StaffLayout({ children }: { children: ReactNode }) {
  return <div className="liivv-staff-portal">{children}</div>;
}
