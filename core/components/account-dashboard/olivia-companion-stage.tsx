'use client';

import { useEffect, useMemo, useState, type KeyboardEvent, type ReactNode } from 'react';

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

type OliviaStageLabels = {
  stageLabel: string;
  healthHotspot: string;
  insuranceHotspot: string;
  mascotAlt: string;
  noCoverageOnFile: string;
  talkHealth: string[];
  talkInsurance: string[];
  talkIdle: string[];
  talkDone: string[];
};

function useOliviaLiveness(mood: OliviaMascotMood): OliviaPose {
  const [pose, setPose] = useState<OliviaPose>('idle');

  useEffect(() => {
    if (mood === 'celebrate') {
      setPose('hi');
      return;
    }

    if (mood === 'bounce' || mood === 'looking-health' || mood === 'looking-insurance') {
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

    // Ambient life is blink-only. Wave/hi frames are not pixel-aligned with idle,
    // so swapping them in the idle loop causes visible stutter.
    const scheduleBlink = () => {
      if (cancelled) return;
      later(() => {
        if (cancelled) return;
        setPose('blink');
        later(() => {
          if (cancelled) return;
          setPose('idle');
          scheduleBlink();
        }, 140);
      }, 2200 + Math.random() * 2800);
    };

    setPose('idle');
    scheduleBlink();

    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [mood]);

  return pose;
}

function buildTalkPool(
  labels: OliviaStageLabels,
  healthComplete: boolean,
  insuranceComplete: boolean,
  mood: OliviaMascotMood,
): string[] {
  if (mood === 'looking-health' && !healthComplete) {
    return labels.talkHealth;
  }
  if (mood === 'looking-insurance' && !insuranceComplete) {
    return labels.talkInsurance;
  }
  if (mood === 'celebrate' || (healthComplete && insuranceComplete)) {
    return [...labels.talkDone, ...labels.talkIdle];
  }

  const pool: string[] = [...labels.talkIdle];
  if (!healthComplete) pool.push(...labels.talkHealth);
  if (!insuranceComplete) pool.push(...labels.talkInsurance);
  return pool;
}

function useOliviaSpeech(
  labels: OliviaStageLabels,
  healthComplete: boolean,
  insuranceComplete: boolean,
  mood: OliviaMascotMood,
): string {
  const pool = useMemo(
    () => buildTalkPool(labels, healthComplete, insuranceComplete, mood),
    [labels, healthComplete, insuranceComplete, mood],
  );
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [pool]);

  useEffect(() => {
    if (pool.length <= 1) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % pool.length);
    }, 4500);

    return () => window.clearInterval(id);
  }, [pool]);

  return pool[index % Math.max(pool.length, 1)] ?? labels.talkIdle[0] ?? '';
}

function OliviaHotspotControl({
  ariaLabel,
  className,
  onLeave,
  onOpen,
  onEnter,
  children,
}: {
  ariaLabel: string;
  className: string;
  onLeave: () => void;
  onOpen: () => void;
  onEnter: () => void;
  children: ReactNode;
}) {
  const onKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpen();
    }
  };

  return (
    <span
      aria-label={ariaLabel}
      className={className}
      onClick={onOpen}
      onKeyDown={onKeyDown}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      role="button"
      tabIndex={0}
    >
      {children}
    </span>
  );
}

export function OliviaCompanionStage({
  labels,
  healthComplete,
  healthCategoryLabels,
  insuranceComplete,
  insuranceProviderName,
  hasInsurance,
  mood,
  layout = 'stage',
  speechOverride,
  onHotspotEnter,
  onHotspotLeave,
  onOpenHealth,
  onOpenInsurance,
}: {
  labels: OliviaStageLabels;
  healthComplete: boolean;
  healthCategoryLabels: string[];
  insuranceComplete: boolean;
  insuranceProviderName: string | null;
  hasInsurance: boolean | null;
  mood: OliviaMascotMood;
  layout?: 'stage' | 'companion';
  speechOverride?: string | null;
  onHotspotEnter: (side: 'health' | 'insurance') => void;
  onHotspotLeave: () => void;
  onOpenHealth: () => void;
  onOpenInsurance: () => void;
}) {
  const pose = useOliviaLiveness(mood);
  const idleSpeech = useOliviaSpeech(labels, healthComplete, insuranceComplete, mood);
  const usingOverride =
    Boolean(speechOverride) && (mood === 'idle' || mood === 'celebrate');
  const speechLine = usingOverride ? speechOverride : idleSpeech;

  const insuranceSummary = insuranceComplete
    ? insuranceProviderName ||
      (hasInsurance === false ? labels.noCoverageOnFile : null)
    : null;

  const isCompanion = layout === 'companion';
  const healthButton = (
    <OliviaHotspotControl
      ariaLabel={labels.healthHotspot}
      className={
        healthComplete
          ? `mhd-olivia-hotspot mhd-olivia-hotspot--health mhd-olivia-hotspot--done${isCompanion ? ' mhd-olivia-hotspot--chip' : ''}`
          : `mhd-olivia-hotspot mhd-olivia-hotspot--health${isCompanion ? ' mhd-olivia-hotspot--chip' : ''}`
      }
      onEnter={() => onHotspotEnter('health')}
      onLeave={onHotspotLeave}
      onOpen={onOpenHealth}
    >
      <span className="mhd-olivia-hotspot__row">
        <span className="mhd-olivia-hotspot__label">{labels.healthHotspot}</span>
        <span aria-hidden className="mhd-olivia-hotspot__mark">
          {healthComplete ? '✓' : '+'}
        </span>
      </span>
    </OliviaHotspotControl>
  );
  const insuranceButton = (
    <OliviaHotspotControl
      ariaLabel={labels.insuranceHotspot}
      className={
        insuranceComplete
          ? `mhd-olivia-hotspot mhd-olivia-hotspot--insurance mhd-olivia-hotspot--done${isCompanion ? ' mhd-olivia-hotspot--chip' : ''}`
          : `mhd-olivia-hotspot mhd-olivia-hotspot--insurance${isCompanion ? ' mhd-olivia-hotspot--chip' : ''}`
      }
      onEnter={() => onHotspotEnter('insurance')}
      onLeave={onHotspotLeave}
      onOpen={onOpenInsurance}
    >
      <span className="mhd-olivia-hotspot__row">
        <span className="mhd-olivia-hotspot__label">{labels.insuranceHotspot}</span>
        <span aria-hidden className="mhd-olivia-hotspot__mark">
          {insuranceComplete ? '✓' : '+'}
        </span>
      </span>
      {!isCompanion && insuranceSummary ? (
        <span className="mhd-olivia-hotspot__summary">{insuranceSummary}</span>
      ) : null}
    </OliviaHotspotControl>
  );

  return (
    <section
      aria-label={labels.stageLabel}
      className={isCompanion ? 'mhd-olivia-stage mhd-olivia-stage--companion' : 'mhd-olivia-stage'}
    >
      <div className="mhd-olivia-stage__canvas">
        {isCompanion ? null : (
          <>
            {healthButton}
            {insuranceButton}
          </>
        )}

        <div className="mhd-olivia-mascot" data-mood={mood} data-pose={pose}>
          <div className="mhd-olivia-bubble-anchor">
            <div aria-live="polite" className="mhd-olivia-bubble">
              <p className="mhd-olivia-bubble__text">{speechLine}</p>
            </div>
          </div>
          <div className="mhd-olivia-mascot__sway">
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
                  priority
                  sizes={isCompanion ? '(max-width: 720px) 56vw, 280px' : '(max-width: 720px) 78vw, 352px'}
                  src={frame.src}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      {isCompanion ? (
        <div className="mhd-olivia-stage__chips">
          {healthButton}
          {insuranceButton}
        </div>
      ) : null}
    </section>
  );
}
