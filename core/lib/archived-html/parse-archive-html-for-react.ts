import parse, { type HTMLReactParserOptions } from 'html-react-parser';

const archiveHtmlParserOptions: HTMLReactParserOptions = {
  replace(domNode) {
    if (domNode.type !== 'tag') {
      return;
    }

    const { attribs } = domNode;
    const fetchpriority = attribs.fetchpriority;

    if (fetchpriority === undefined) {
      return;
    }

    delete attribs.fetchpriority;
    attribs.fetchPriority = fetchpriority;
  },
};

// eslint-disable-next-line valid-jsdoc
/**
 * Parses archived storefront HTML for React (normalizes DOM attrs React rejects).
 */
export function parseArchiveHtmlForReact(html: string) {
  return parse(html, archiveHtmlParserOptions);
}
