import { PropsWithChildren } from 'react';

/**
 * Layout without Catalyst header/footer so archived full-document HTML
 * can fill the viewport (typically via iframe).
 */
export default function HtmlArchiveLayout({ children }: PropsWithChildren) {
  return children;
}
