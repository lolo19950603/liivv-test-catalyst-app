'use client';

import { clsx } from 'clsx';
import type { CSSProperties, ReactNode } from 'react';

const WORD_STAGGER_MS = 30;

type HighlightStyle = 'half_text' | 'text';

export interface SplitWordsHeadingProps {
  /** Full heading when not using `lead` + `emphasis`. */
  text?: string;
  /** Text before the highlighted emphasis (collection-list style). */
  lead?: string;
  /** Highlighted phrase after `lead`. */
  emphasis?: string;
  /** Substring to wrap in theme highlight (timeline style). */
  accentPhrase?: string;
  /** Accent the last whitespace-separated word. */
  highlightLastWord?: boolean;
  /** One continuous accent behind the full phrase (logo-list style). */
  highlightEntirePhrase?: boolean;
  highlightStyle?: HighlightStyle;
  className?: string;
  animate?: 'fade-up-large' | 'fade-up';
}

function tokensFromText(value: string): string[] {
  return value
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 0);
}

function HighlightedEm({
  children,
  style,
}: {
  children: ReactNode;
  style: HighlightStyle;
}) {
  return (
    <em className="highlighted-text relative not-italic" data-style={style}>
      {children}
    </em>
  );
}

function AnimatedWord({
  word,
  index,
  highlighted,
  highlightStyle = 'half_text',
}: {
  word: string;
  index: number;
  highlighted?: boolean;
  highlightStyle?: HighlightStyle;
}) {
  const delayStyle = { '--dc-animate-delay': index * WORD_STAGGER_MS } as CSSProperties;
  const inner = (
    <span className="block" data-dc-animate-child style={delayStyle}>
      {word}
    </span>
  );

  return (
    <span className="word" data-word={word} style={{ '--word-index': index } as CSSProperties}>
      {highlighted ? <HighlightedEm style={highlightStyle}>{inner}</HighlightedEm> : inner}
    </span>
  );
}

function SplitWordsBlock({
  words,
  highlightLastWord,
  highlightStyle,
  accentTokenIndexes,
}: {
  words: string[];
  highlightLastWord?: boolean;
  highlightStyle?: HighlightStyle;
  accentTokenIndexes?: Set<number>;
}) {
  if (words.length === 0) {
    return null;
  }

  return (
    <>
      {words.map((word, index) => (
        <span key={`${word}-${String(index)}`}>
          {index > 0 ? <span className="whitespace"> </span> : null}
          <AnimatedWord
            highlightStyle={highlightStyle}
            highlighted={
              (highlightLastWord && index === words.length - 1) ||
              accentTokenIndexes?.has(index) === true
            }
            index={index}
            word={word}
          />
        </span>
      ))}
    </>
  );
}

function accentTokenIndexesForPhrase(text: string, phrase: string): Set<number> | undefined {
  const trimmedPhrase = phrase.trim();

  if (trimmedPhrase.length === 0) {
    return undefined;
  }

  const lowerText = text.toLowerCase();
  const lowerPhrase = trimmedPhrase.toLowerCase();
  const start = lowerText.indexOf(lowerPhrase);

  if (start === -1) {
    return undefined;
  }

  const end = start + trimmedPhrase.length;
  const words = tokensFromText(text);
  const indexes = new Set<number>();
  let cursor = 0;

  words.forEach((word, index) => {
    const wordStart = text.indexOf(word, cursor);

    if (wordStart === -1) {
      return;
    }

    const wordEnd = wordStart + word.length;

    if (wordStart < end && wordEnd > start) {
      indexes.add(index);
    }

    cursor = wordEnd;
  });

  return indexes;
}

/**
 * Shopify-style split heading: per-word fade-up with optional theme accent.
 * Pair with `DiabetesCareScrollAnimateProvider` (via `MakeswiftPageShim` on all Makeswift pages).
 */
export function SplitWordsHeading({
  text,
  lead,
  emphasis,
  accentPhrase,
  highlightLastWord = false,
  highlightEntirePhrase = false,
  highlightStyle = 'half_text',
  className,
  animate = 'fade-up-large',
}: SplitWordsHeadingProps) {
  const leadText = lead?.trim() ?? '';
  const emphasisText = emphasis?.trim() ?? '';
  const fullText = text?.trim() ?? '';

  if (leadText.length > 0 || emphasisText.length > 0) {
    const leadWords = tokensFromText(leadText);
    const emphasisWords = tokensFromText(emphasisText);
    const totalWords = leadWords.length + emphasisWords.length;

    return (
      <span
        className={clsx('split-words words splitting block', className)}
        data-animate={animate}
        style={{ '--word-total': totalWords } as CSSProperties}
      >
        <SplitWordsBlock highlightStyle={highlightStyle} words={leadWords} />
        {leadWords.length > 0 && emphasisWords.length > 0 ? (
          <span className="whitespace"> </span>
        ) : null}
        {emphasisWords.length > 0 ? (
          <HighlightedEm style={highlightStyle}>
            {emphasisWords.map((word, i) => {
              const index = leadWords.length + i;

              return (
                <span key={`emphasis-${word}-${String(i)}`}>
                  {i > 0 ? <span className="whitespace"> </span> : null}
                  <AnimatedWord highlightStyle={highlightStyle} index={index} word={word} />
                </span>
              );
            })}
          </HighlightedEm>
        ) : null}
      </span>
    );
  }

  if (fullText.length === 0) {
    return null;
  }

  const words = tokensFromText(fullText);
  const accentIndexes =
    accentPhrase != null ? accentTokenIndexesForPhrase(fullText, accentPhrase) : undefined;

  if (highlightEntirePhrase) {
    return (
      <span
        className={clsx('split-words words splitting block', className)}
        data-animate={animate}
        style={{ '--word-total': words.length } as CSSProperties}
      >
        <HighlightedEm style={highlightStyle}>
          {words.map((word, index) => (
            <span key={`phrase-${word}-${String(index)}`}>
              {index > 0 ? <span className="whitespace"> </span> : null}
              <AnimatedWord index={index} word={word} />
            </span>
          ))}
        </HighlightedEm>
      </span>
    );
  }

  return (
    <span
      className={clsx('split-words words splitting block', className)}
      data-animate={animate}
      style={{ '--word-total': words.length } as CSSProperties}
    >
      <SplitWordsBlock
        accentTokenIndexes={accentIndexes}
        highlightLastWord={highlightLastWord && accentIndexes == null}
        highlightStyle={highlightStyle}
        words={words}
      />
    </span>
  );
}
