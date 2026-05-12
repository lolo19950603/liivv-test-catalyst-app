import { parseArchiveHtmlForReact } from '~/lib/archived-html/parse-archive-html-for-react';

interface Props {
  /** Storefront-only HTML fragment (no `<body>` wrapper) from the SingleFile export. */
  html: string;
}

// eslint-disable-next-line valid-jsdoc
/**
 * HTML string → React element tree (`html-react-parser`). Same approach as archived Shopify
 * snapshots: DOM-shaped output; scripts may not run like in a full static document.
 */
export function ArchiveHtmlReactBody({ html }: Props) {
  return (
    <div className="archive-html-react-root min-h-[100dvh]" suppressHydrationWarning>
      {parseArchiveHtmlForReact(html)}
    </div>
  );
}
