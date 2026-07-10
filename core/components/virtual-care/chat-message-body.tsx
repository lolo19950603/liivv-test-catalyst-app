import type { ReactNode } from 'react';
// eslint-disable-next-line @typescript-eslint/no-restricted-imports -- used outside [locale] (e.g. staff portal)
import Link from 'next/link';

function isSafeHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function toHref(url: string): string {
  try {
    const parsed = new URL(url);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '');

    if (appUrl && parsed.origin === new URL(appUrl).origin) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}` || '/';
    }
  } catch {
    // Fall through to absolute URL.
  }

  return url;
}

function renderInlineMarkdown(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  // Prefer **[label](url)**, then [label](url), **bold**, then bare URLs
  const pattern =
    /(\*\*\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)\*\*)|(\[([^\]]+)\]\((https?:\/\/[^)\s]+)\))|(\*\*([^*]+)\*\*)|(https?:\/\/[^\s<>()]+)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let part = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const key = `${keyPrefix}-${part++}`;

    if (match[1] && match[2] && match[3] && isSafeHttpUrl(match[3])) {
      const href = toHref(match[3]);
      nodes.push(
        <Link
          className="font-semibold underline underline-offset-2 hover:opacity-80"
          href={href}
          key={key}
          target={href.startsWith('http') ? '_blank' : undefined}
        >
          {match[2]}
        </Link>,
      );
    } else if (match[4] && match[5] && match[6] && isSafeHttpUrl(match[6])) {
      const href = toHref(match[6]);
      nodes.push(
        <Link
          className="font-semibold underline underline-offset-2 hover:opacity-80"
          href={href}
          key={key}
          target={href.startsWith('http') ? '_blank' : undefined}
        >
          {match[5]}
        </Link>,
      );
    } else if (match[7] && match[8]) {
      nodes.push(
        <strong className="font-semibold" key={key}>
          {match[8]}
        </strong>,
      );
    } else if (match[9] && isSafeHttpUrl(match[9])) {
      const href = toHref(match[9]);
      nodes.push(
        <Link
          className="underline underline-offset-2 hover:opacity-80"
          href={href}
          key={key}
          target={href.startsWith('http') ? '_blank' : undefined}
        >
          {match[9]}
        </Link>,
      );
    } else {
      nodes.push(match[0]);
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : [text];
}

export function ChatMessageBody({ body, className }: { body: string; className?: string }) {
  const lines = body.split('\n');

  return (
    <div className={className ?? 'whitespace-pre-wrap break-words'}>
      {lines.map((line, index) => (
        <span key={`line-${index}`}>
          {index > 0 ? '\n' : null}
          {renderInlineMarkdown(line, `l${index}`)}
        </span>
      ))}
    </div>
  );
}
