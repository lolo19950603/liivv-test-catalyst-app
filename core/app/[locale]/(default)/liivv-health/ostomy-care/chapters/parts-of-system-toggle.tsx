'use client';

/*
 * =============================================================================
 * PARTS OF A POUCHING SYSTEM — VIEW SEGMENTS (C08)
 * =============================================================================
 * Loaded with next/dynamic after hydration, only where the parts figure
 * renders. Both systems and all three pouch shapes are already in the server
 * HTML (parts-of-system-figure.tsx); this island never draws anything and never
 * writes a definition. It flips classes on the figure, and the stylesheet shows
 * a different outline.
 *
 * So with JavaScript off, or before this loads, the drawing is a two-piece
 * system with a drainable pouch — the pair the terms list describes first — and
 * every term and definition is there whatever is drawn.
 *
 * The segments change the drawn shape and nothing else: no system is marked
 * correct or recommended, no term is selected or scored, and nothing is stored,
 * put in the URL or sent anywhere. Each choice has its own status sentence
 * rather than one sentence with the label dropped into it, because French
 * agrees with the noun ("un système une pièce", "une poche fermée") and a
 * placeholder would get one of the two wrong.
 * =============================================================================
 */

import { useTranslations } from 'next-intl';
import { type RefObject, useEffect, useState } from 'react';

type System = 'one' | 'two';
type Pouch = 'drainable' | 'closed' | 'urostomy';

interface Choice<T extends string> {
  key: T;
  label: string;
  status: string;
}

function Segment<T extends string>({
  choices,
  legend,
  onPick,
  value,
}: {
  choices: Array<Choice<T>>;
  legend: string;
  onPick: (choice: Choice<T>) => void;
  value: T;
}) {
  return (
    <div aria-label={legend} className="oc-fig-parts-seg" role="group">
      {choices.map((choice) => (
        <button
          aria-pressed={choice.key === value}
          className="oc-fig-parts-btn"
          key={choice.key}
          onClick={() => onPick(choice)}
          type="button"
        >
          {choice.label}
        </button>
      ))}
    </div>
  );
}

export function PartsOfSystemToggle({ root }: { root: RefObject<HTMLDivElement | null> }) {
  const t = useTranslations('OstomyCare.ui.chapter.parts');
  const [system, setSystem] = useState<System>('two');
  const [pouch, setPouch] = useState<Pouch>('drainable');
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    const el = root.current;

    el?.classList.toggle('is-one', system === 'one');
    el?.classList.toggle('is-closed', pouch === 'closed');
    el?.classList.toggle('is-uro', pouch === 'urostomy');

    return () => el?.classList.remove('is-one', 'is-closed', 'is-uro');
  }, [root, system, pouch]);

  const systems: Array<Choice<System>> = [
    { key: 'one', label: t('onePiece'), status: t('statusOnePiece') },
    { key: 'two', label: t('twoPiece'), status: t('statusTwoPiece') },
  ];
  const pouches: Array<Choice<Pouch>> = [
    { key: 'drainable', label: t('drainable'), status: t('statusDrainable') },
    { key: 'closed', label: t('closed'), status: t('statusClosed') },
    { key: 'urostomy', label: t('urostomy'), status: t('statusUrostomy') },
  ];

  return (
    <div className="oc-fig-parts-controls">
      <Segment
        choices={systems}
        legend={t('systemLegend')}
        onPick={(choice) => {
          setSystem(choice.key);
          setAnnouncement(choice.status);
        }}
        value={system}
      />
      <Segment
        choices={pouches}
        legend={t('pouchLegend')}
        onPick={(choice) => {
          setPouch(choice.key);
          setAnnouncement(choice.status);
        }}
        value={pouch}
      />
      <p className="oc-fig-parts-status" role="status">
        {announcement}
      </p>
    </div>
  );
}
