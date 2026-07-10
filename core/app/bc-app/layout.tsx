import type { ReactNode } from 'react';

import '~/app/[locale]/(default)/liivv-feature-buttons.css';

export default function BcAppLayout({ children }: { children: ReactNode }) {
  return <div className="liivv-staff-portal liivv-bc-app-portal">{children}</div>;
}
