'use client';

import { useEffect, useState } from 'react';

import { Image } from '~/components/image';

import oliviaIdle from './olivia-mascot.png';
import oliviaBlink from './olivia-mascot-blink.png';
import oliviaHi from './olivia-mascot-hi.png';
import oliviaWave from './olivia-mascot-wave.png';

export type OliviaMascotMood = 'idle' | 'looking-health' | 'looking-insurance' | 'bounce' | 'celebrate';
type OliviaPose = 'idle' | 'blink' | 'wave' | 'hi';

const POSES: Array<{ id: OliviaPose; src: typeof oliviaIdle }> = [
  { id: 'idle', src: oliviaIdle },
  { id: 'blink', src: oliviaBlink },
  { id: 'wave', src: oliviaWave },
  { id: 'hi', src: oliviaHi },
];

function useOliviaLiveness(mood: OliviaMascotMood): OliviaPose {
  const [pose, setPose] = useState<OliviaPose>('idle');

  useEffect(() => {
    if (mood === 'celebrate') {
      setPose('hi');
      return;
    }

    if (mood === 'bounce') {
      setPose('wave');
      return;
    }

    if (mood === 'looking-health' || mood === 'looking-insurance') {
      setPose('wave');
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPose('idle');
      return;
    }

    let cancelled = false;
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(fn, ms);
      timers.push(id);
    };

    const rest = () => {
      if (cancelled) return;
      later(() => {
        if (cancelled) return;
        setPose('blink');
        later(() => {
          if (cancelled) return;
          setPose('idle');
          const continueIdle = () => {
            if (cancelled) return;
            if (Math.random() < 0.48) {
              later(() => {
                if (cancelled) return;
                setPose('wave');
                later(() => {
                  if (cancelled) return;
                  setPose('idle');
                  rest();
                }, 780);
              }, 240);
            } else {
              rest();
            }
          };

          if (Math.random() < 0.28) {
            later(() => {
              if (cancelled) return;
              setPose('blink');
              later(() => {
                if (cancelled) return;
                setPose('idle');
                continueIdle();
              }, 120);
            }, 150);
          } else {
            continueIdle();
          }
        }, 150);
      }, 1400 + Math.random() * 2400);
    };

    rest();

    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [mood]);

  return pose;
}

export function OliviaCompanionStage({
  labels,
  healthComplete,
  insuranceComplete,
  mood,
  onHotspotEnter,
  onHotspotLeave,
  onOpenHealth,
  onOpenInsurance,
}: {
  labels: {
    stageLabel: string;
    healthHotspot: string;
    insuranceHotspot: string;
    mascotAlt: string;
  };
  healthComplete: boolean;
  insuranceComplete: boolean;
  mood: OliviaMascotMood;
  onHotspotEnter: (side: 'health' | 'insurance') => void;
  onHotspotLeave: () => void;
  onOpenHealth: () => void;
  onOpenInsurance: () => void;
}) {
  const pose = useOliviaLiveness(mood);

  return (
    <section aria-label={labels.stageLabel} className="mhd-olivia-stage">
      <div className="mhd-olivia-stage__canvas">
        <button
          aria-label={labels.healthHotspot}
          className={
            healthComplete
              ? 'mhd-olivia-hotspot mhd-olivia-hotspot--health mhd-olivia-hotspot--done'
              : 'mhd-olivia-hotspot mhd-olivia-hotspot--health'
          }
          onClick={onOpenHealth}
          onMouseEnter={() => onHotspotEnter('health')}
          onMouseLeave={onHotspotLeave}
          type="button"
        >
          <span className="mhd-olivia-hotspot__label">{labels.healthHotspot}</span>
          <span aria-hidden className="mhd-olivia-hotspot__mark">
            {healthComplete ? '✓' : '+'}
          </span>
        </button>

        <button
          aria-label={labels.insuranceHotspot}
          className={
            insuranceComplete
              ? 'mhd-olivia-hotspot mhd-olivia-hotspot--insurance mhd-olivia-hotspot--done'
              : 'mhd-olivia-hotspot mhd-olivia-hotspot--insurance'
          }
          onClick={onOpenInsurance}
          onMouseEnter={() => onHotspotEnter('insurance')}
          onMouseLeave={onHotspotLeave}
          type="button"
        >
          <span className="mhd-olivia-hotspot__label">{labels.insuranceHotspot}</span>
          <span aria-hidden className="mhd-olivia-hotspot__mark">
            {insuranceComplete ? '✓' : '+'}
          </span>
        </button>

        <div className="mhd-olivia-mascot" data-mood={mood} data-pose={pose}>
          <div className="mhd-olivia-mascot__figure">
            {POSES.map((frame) => (
              <Image
                alt={frame.id === pose ? labels.mascotAlt : ''}
                aria-hidden={frame.id !== pose}
                className={
                  frame.id === pose
                    ? 'mhd-olivia-mascot__image is-on'
                    : 'mhd-olivia-mascot__image'
                }
                fill
                key={frame.id}
                priority={frame.id === 'idle'}
                sizes="(max-width: 720px) 70vw, 272px"
                src={frame.src}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
