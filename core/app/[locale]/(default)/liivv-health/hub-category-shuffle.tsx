'use client';

import { useEffect, useRef, useState } from 'react';

import { HEALTH_HUB_SHUFFLE_WORDS } from './health-hub-data';

import './hub-category-shuffle.css';

const INTERVAL_MS = 3000;

function shuffleDeck(words: readonly string[], avoidFirst?: string): string[] {
  const next = [...words];

  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const current = next[i];
    const swap = next[j];

    if (current === undefined || swap === undefined) continue;

    next[i] = swap;
    next[j] = current;
  }

  if (avoidFirst && next.length > 1 && next[0] === avoidFirst) {
    const swapAt = next.findIndex((word, index) => index > 0 && word !== avoidFirst);

    if (swapAt > 0) {
      const first = next[0];
      const other = next[swapAt];

      if (first !== undefined && other !== undefined) {
        next[0] = other;
        next[swapAt] = first;
      }
    }
  }

  return next;
}

export function HubCategoryShuffle({ reduceMotion }: { reduceMotion: boolean }) {
  const words = HEALTH_HUB_SHUFFLE_WORDS;
  const firstWord = words[0] ?? "Women's Health";
  const [word, setWord] = useState(firstWord);
  const deckRef = useRef<string[]>([firstWord]);
  const indexRef = useRef(0);

  useEffect(() => {
    if (reduceMotion) {
      setWord(firstWord);
      return;
    }

    const rest = words.filter((item) => item !== firstWord);
    deckRef.current = [firstWord, ...shuffleDeck(rest)];
    indexRef.current = 0;
    setWord(firstWord);

    const id = window.setInterval(() => {
      let nextIndex = indexRef.current + 1;

      if (nextIndex >= deckRef.current.length) {
        const last = deckRef.current[deckRef.current.length - 1];
        deckRef.current = shuffleDeck(words, last);
        nextIndex = 0;
      }

      indexRef.current = nextIndex;
      const next = deckRef.current[nextIndex];

      if (next) setWord(next);
    }, INTERVAL_MS);

    return () => window.clearInterval(id);
  }, [firstWord, reduceMotion, words]);

  return (
    <span className="lh-cat-shuffle">
      <span aria-live="polite" className="lh-cat-shuffle-word" key={word}>
        {word}
      </span>
    </span>
  );
}
