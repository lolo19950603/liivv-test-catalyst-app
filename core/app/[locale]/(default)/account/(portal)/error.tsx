'use client';

import { VendorOutageErrorView } from '~/components/vendor-outage-error-view';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AccountPortalError({ error, reset }: Props) {
  return <VendorOutageErrorView error={error} reset={reset} />;
}
