import { PropsWithChildren } from 'react';

// eslint-disable-next-line valid-jsdoc
/**
 * Layout without Catalyst header/footer so archived full-document HTML
 * can fill the viewport. Use `(default)` for Makeswift pages (e.g. `/diabetes-care-editable`).
 */
export default function HtmlArchiveLayout({ children }: PropsWithChildren) {
  return children;
}
