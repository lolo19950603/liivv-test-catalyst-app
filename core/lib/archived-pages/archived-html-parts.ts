import 'server-only';

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { cache } from 'react';

/**
 * Loads a SingleFile-style HTML export from `public/archive/<filename>`:
 * inlined `<style>` blocks from the document head, plus storefront markup between the first
 * `<body>` and a second `<body>` (Shopify preview / admin tail), when present.
 */
export const getArchiveHtmlParts = cache(async (archiveFileName: string) => {
  const filePath = path.join(process.cwd(), 'public', 'archive', archiveFileName);
  const html = await readFile(filePath, 'utf-8');

  const bodyOpens = [...html.matchAll(/<body[^>]*>/gi)];
  if (bodyOpens.length === 0) {
    throw new Error(`Archived HTML has no <body> tag: ${archiveFileName}`);
  }

  const headFragment = html.slice(0, bodyOpens[0].index);

  const bodyInner =
    bodyOpens.length >= 2
      ? html.slice(bodyOpens[0].index! + bodyOpens[0][0].length, bodyOpens[1].index!)
      : html.slice(bodyOpens[0].index! + bodyOpens[0][0].length);

  const headStyles: string[] = [];
  const styleRe = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let sm: RegExpExecArray | null;
  while ((sm = styleRe.exec(headFragment)) !== null) {
    headStyles.push(sm[1] ?? '');
  }

  const titleMatch = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(headFragment);
  const fallbackTitle = archiveFileName.replace(/\.html$/i, '').replace(/-/g, ' ');
  const title = titleMatch?.[1]?.trim() ?? fallbackTitle;

  return { headStyles, bodyInner, title };
});
