'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import type { CategoryCard } from './chapters-data';

export type PathBand = {
  id: string;
  label: string;
  cards: { card: CategoryCard }[];
};

function useActiveCard(numbers: number[]) {
  const [active, setActive] = useState(numbers[0] ?? 0);

  useEffect(() => {
    if (!numbers.length) return;

    const nodes = numbers
      .map((number) => document.getElementById(`card-${number}`))
      .filter((node): node is HTMLElement => Boolean(node));

    if (!nodes.length) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ratios = new Map<number, number>();

    const pick = () => {
      let best = numbers[0] ?? 0;
      let bestRatio = -1;

      ratios.forEach((ratio, number) => {
        if (ratio > bestRatio) {
          bestRatio = ratio;
          best = number;
        }
      });

      if (bestRatio <= 0) {
        const mid = window.innerHeight * 0.4;
        let nearest = best;
        let dist = Number.POSITIVE_INFINITY;

        nodes.forEach((node) => {
          const number = Number(node.id.replace('card-', ''));
          const top = Math.abs(node.getBoundingClientRect().top - mid);

          if (top < dist) {
            dist = top;
            nearest = number;
          }
        });

        setActive(nearest);

        return;
      }

      setActive(best);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const number = Number(entry.target.id.replace('card-', ''));

          ratios.set(number, entry.isIntersecting ? entry.intersectionRatio : 0);
        });
        pick();
      },
      {
        root: null,
        rootMargin: '-20% 0px -45% 0px',
        threshold: reduced ? [0, 0.25, 0.5] : [0, 0.15, 0.35, 0.55, 0.75],
      },
    );

    nodes.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, [numbers]);

  return active;
}

/*
 * Sticky Living Trail spine (desktop) and stepping-stone dots (mobile). Spy
 * only — never hijacks scroll. Active stop follows whichever #card-N owns the
 * most of the middle of the viewport.
 */
export function JourneyPath({ bands }: { bands: PathBand[] }) {
  const t = useTranslations('OstomyCare.ui.chapter');
  const stops = useMemo(
    () =>
      bands.flatMap((band) =>
        band.cards.map(({ card }) => ({
          bandId: band.id,
          bandLabel: band.label,
          number: card.number,
          title: card.title,
        })),
      ),
    [bands],
  );
  const numbers = useMemo(() => stops.map((stop) => stop.number), [stops]);
  const active = useActiveCard(numbers);

  if (!stops.length) return null;

  const activeIndex = Math.max(
    0,
    stops.findIndex((stop) => stop.number === active),
  );
  const fill = stops.length <= 1 ? 1 : (activeIndex + 1) / stops.length;
  const dashOffset = 100 * (1 - fill);

  return (
    <nav aria-label={t('pathSpine')} className="oc-journey-path">
      <div className="oc-journey-path-inner">
        <svg aria-hidden className="oc-journey-path-curve" preserveAspectRatio="none" viewBox="0 0 32 100">
          <path
            className="oc-journey-path-curve-base"
            d="M16 0 C 26 7, 6 14, 16 22 C 26 30, 6 38, 16 46 C 26 54, 6 62, 16 70 C 26 78, 6 86, 16 93 C 20 96, 16 98, 16 100"
            fill="none"
            pathLength={100}
          />
          <path
            className="oc-journey-path-curve-fill"
            d="M16 0 C 26 7, 6 14, 16 22 C 26 30, 6 38, 16 46 C 26 54, 6 62, 16 70 C 26 78, 6 86, 16 93 C 20 96, 16 98, 16 100"
            fill="none"
            pathLength={100}
            style={{ strokeDashoffset: dashOffset }}
          />
        </svg>
        <ol className="oc-journey-path-list">
          {bands.map((band) => (
            <li className="oc-journey-path-group" key={band.id}>
              <a className="oc-journey-path-band" href={band.id === bands[0]?.id ? '#chapter-care' : `#${band.id}`}>
                {band.label}
              </a>
              <ol>
                {band.cards.map(({ card }) => {
                  const isActive = card.number === active;

                  return (
                    <li key={card.number}>
                      <a
                        aria-current={isActive ? 'true' : undefined}
                        className={isActive ? 'is-active' : undefined}
                        href={`#card-${card.number}`}
                        title={card.title}
                      >
                        <span aria-hidden className="oc-journey-path-dot" />
                        <span className="oc-journey-path-num">{String(card.number).padStart(2, '0')}</span>
                        <span className="oc-journey-path-title">{card.title}</span>
                      </a>
                    </li>
                  );
                })}
              </ol>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}

export function JourneyBandDots({
  cards,
  label,
}: {
  cards: { card: CategoryCard }[];
  label: string;
}) {
  const t = useTranslations('OstomyCare.ui.chapter');
  const numbers = useMemo(() => cards.map(({ card }) => card.number), [cards]);
  const active = useActiveCard(numbers);

  if (cards.length < 2) return null;

  return (
    <nav aria-label={`${t('pathSpine')}: ${label}`} className="oc-journey-band-dots">
      {cards.map(({ card }) => {
        const isActive = card.number === active;

        return (
          <a
            aria-current={isActive ? 'true' : undefined}
            className={isActive ? 'is-active' : undefined}
            href={`#card-${card.number}`}
            key={card.number}
            title={card.title}
          >
            <span aria-hidden />
            <span className="sr-only">{card.title}</span>
          </a>
        );
      })}
    </nav>
  );
}
