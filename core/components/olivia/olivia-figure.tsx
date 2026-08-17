'use client';

import { useEffect, useState } from 'react';

import { Image } from '~/components/image';

import { OLIVIA_POSES, type OliviaPose } from './olivia-assets';

import './olivia.css';

export type OliviaMood = 'live' | 'bounce' | 'celebrate' | 'loading' | 'wave' | 'look';
export type OliviaSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZE_HINT: Record<OliviaSize, string> = {
  xs: '40px',
  sm: '72px',
  md: '120px',
  lg: '176px',
  xl: '256px',
};

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function useOliviaPose(mood: OliviaMood, poseOverride?: OliviaPose): OliviaPose {
  const [pose, setPose] = useState<OliviaPose>(poseOverride ?? 'idle');

  useEffect(() => {
    if (poseOverride) {
      setPose(poseOverride);
      return;
    }

    if (prefersReducedMotion()) {
      setPose(mood === 'celebrate' || mood === 'wave' ? 'hi' : 'idle');
      return;
    }

    if (mood === 'celebrate') {
      setPose('hi');
      return;
    }

    if (mood === 'bounce' || mood === 'wave' || mood === 'loading') {
      setPose('wave');
      return;
    }

    if (mood === 'look') {
      setPose('hi');
    }

    let cancelled = false;
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => {
      timers.push(window.setTimeout(fn, ms));
    };

    const scheduleBlink = () => {
      if (cancelled) return;
      later(() => {
        if (cancelled) return;
        setPose((current) => (current === 'idle' ? 'blink' : current));
        later(() => {
          if (cancelled) return;
          setPose((current) => (current === 'blink' ? 'idle' : current));
          scheduleBlink();
        }, 140);
      }, 2200 + Math.random() * 2800);
    };

    if (mood === 'live' || mood === 'look') {
      if (mood === 'live') setPose('idle');
      scheduleBlink();
    }

    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [mood, poseOverride]);

  return pose;
}

export function OliviaFigure({
  mood = 'live',
  pose: poseOverride,
  size = 'md',
  alt = 'Olivia, the Liivv companion',
  priority = false,
  className,
}: {
  mood?: OliviaMood;
  pose?: OliviaPose;
  size?: OliviaSize;
  alt?: string;
  priority?: boolean;
  className?: string;
}) {
  const pose = useOliviaPose(mood, poseOverride);
  const rootClass = className ? `olivia-figure ${className}` : 'olivia-figure';

  return (
    <div className={rootClass} data-mood={mood} data-pose={pose} data-size={size}>
      <div className="olivia-figure__sway">
        <div className="olivia-figure__sprite">
          {OLIVIA_POSES.map((frame) => (
            <Image
              alt={frame.id === pose ? alt : ''}
              aria-hidden={frame.id !== pose}
              className={frame.id === pose ? 'olivia-figure__img is-on' : 'olivia-figure__img'}
              fill
              key={frame.id}
              priority={priority}
              sizes={SIZE_HINT[size]}
              src={frame.src}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
