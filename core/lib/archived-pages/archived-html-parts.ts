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

  const firstOpen = bodyOpens.at(0);

  if (firstOpen == null) {
    throw new Error(`Archived HTML has no <body> tag: ${archiveFileName}`);
  }

  const firstBodyStart = html.indexOf(firstOpen[0]);

  if (firstBodyStart === -1) {
    throw new Error(`Archived HTML has invalid <body> match: ${archiveFileName}`);
  }

  const headFragment = html.slice(0, firstBodyStart);
  const afterFirstBody = firstBodyStart + firstOpen[0].length;

  const secondOpen = bodyOpens[1];
  const secondBodyStart =
    secondOpen !== undefined ? html.indexOf(secondOpen[0], afterFirstBody) : -1;

  const bodyInner =
    bodyOpens.length >= 2 && secondBodyStart !== -1
      ? html.slice(afterFirstBody, secondBodyStart)
      : html.slice(afterFirstBody);

  const headStyles: string[] = [];
  const styleRe = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let styleMatch: RegExpExecArray | null = styleRe.exec(headFragment);

  while (styleMatch !== null) {
    headStyles.push(styleMatch[1] ?? '');
    styleMatch = styleRe.exec(headFragment);
  }

  const titleMatch = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(headFragment);
  const fallbackTitle = archiveFileName.replace(/\.html$/i, '').replace(/-/g, ' ');
  const title = titleMatch?.[1]?.trim() ?? fallbackTitle;

  return { headStyles, bodyInner, title };
});
