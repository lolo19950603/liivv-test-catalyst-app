'use client';

/*
 * =============================================================================
 * POUCH CHANGE WALK-THROUGH — CONTROLS (C01)
 * =============================================================================
 * Loaded with next/dynamic after hydration, only where the walk-through renders.
 * The steps are server HTML in change-routine-figure.tsx; this island never
 * renders step text. It only shows or hides parts of that list:
 *
 * - Walk through it: one step's body at a time. The other steps keep their
 *   titles, and their bodies take hidden="until-found", so find-in-page still
 *   reaches them and jumps the walk to that step. Focus moves to the step's
 *   heading, which then reads "Step n of N". Previous and Next are not rendered
 *   at the ends rather than disabled.
 * - Which system: hides the sentences for systems a reader has unticked,
 *   never a step, so the count never changes. One status line confirms it.
 *
 * The attributes are set on the server nodes directly, through the figure's
 * ref, because React does not type hidden="until-found" or beforematch. State
 * stays in this island: nothing goes into the URL, storage or analytics. No
 * timers, progress or praise.
 * =============================================================================
 */

import { useLocale, useTranslations } from 'next-intl';
import { type RefObject, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import type { PouchSystem } from './chapters-meta';
import { setUntilFound } from './until-found';

const SYSTEMS: PouchSystem[] = ['one', 'two', 'drain', 'closed', 'uro'];
const FULL_LIST = -1;

const isPouchSystem = (value: string): value is PouchSystem =>
  SYSTEMS.some((system) => system === value);

const stepsIn = (root: HTMLElement | null) =>
  Array.from(root?.querySelectorAll<HTMLLIElement>('.oc-fig-steps > li') ?? []);

const linesIn = (root: HTMLElement | null) =>
  Array.from(root?.querySelectorAll<HTMLLIElement>('.oc-fig-steps li[data-systems]') ?? []);

const systemsOf = (line: HTMLElement) =>
  (line.dataset.systems ?? '').split(' ').filter(isPouchSystem);

/*
 * One step's body showing, or every step's (FULL_LIST). In walk mode each
 * heading's "Step n of N" is exposed and its visual number is hidden from
 * assistive tech, so the heading is announced once, not twice.
 */
function paintWalk(root: HTMLElement | null, current: number) {
  const walking = current !== FULL_LIST;

  root?.querySelector('.oc-fig-steps')?.classList.toggle('is-walking', walking);

  stepsIn(root).forEach((step, index) => {
    const here = walking && index === current;

    setUntilFound(step.querySelector('.oc-fig-steps-body'), walking && !here);
    step.classList.toggle('is-current', here);
    step.querySelector('[data-oc-step-of]')?.toggleAttribute('hidden', !walking);

    if (here) step.setAttribute('aria-current', 'step');
    else step.removeAttribute('aria-current');

    if (walking) step.querySelector('.oc-fig-steps-n')?.setAttribute('aria-hidden', 'true');
    else step.querySelector('.oc-fig-steps-n')?.removeAttribute('aria-hidden');
  });
}

/* Sentences for unticked systems take hidden="until-found". Steps never hide. */
function paintFilter(root: HTMLElement | null, ticked: ReadonlySet<PouchSystem>) {
  linesIn(root).forEach((line) =>
    setUntilFound(line, !systemsOf(line).some((system) => ticked.has(system))),
  );
}

function focusStep(root: HTMLElement | null, index: number) {
  const step = stepsIn(root)[index];

  step?.scrollIntoView({ block: 'nearest' });
  step?.querySelector<HTMLElement>('h4')?.focus({ preventScroll: true });
}

export function ChangeRoutineControls({ root }: { root: RefObject<HTMLDivElement | null> }) {
  const t = useTranslations('OstomyCare.ui.chapter.changeRoutine');
  const locale = useLocale();
  const [current, setCurrent] = useState(FULL_LIST);
  const [steps, setSteps] = useState<HTMLLIElement[]>([]);
  const [ticked, setTicked] = useState<ReadonlySet<PouchSystem>>(() => new Set(SYSTEMS));
  const [announcement, setAnnouncement] = useState('');
  const currentRef = useRef(FULL_LIST);
  const tickedRef = useRef(ticked);
  const describeRef = useRef<(next: ReadonlySet<PouchSystem>) => string>(() => '');
  const toggleRef = useRef<HTMLButtonElement>(null);

  /* Paint first, then move focus, so the heading already reads "Step n of N". */
  const go = (index: number) => {
    currentRef.current = index;
    paintWalk(root.current, index);
    setCurrent(index);
    focusStep(root.current, index);
  };

  const showAll = () => {
    currentRef.current = FULL_LIST;
    paintWalk(root.current, FULL_LIST);
    setCurrent(FULL_LIST);
    toggleRef.current?.focus();
  };

  useEffect(() => {
    const el = root.current;

    setSteps(stepsIn(el));

    /* Find-in-page opened a hidden step: walk to it, leaving focus in the find bar. */
    const bodies = stepsIn(el).map((step, index) => {
      const body = step.querySelector('.oc-fig-steps-body');
      const onMatch = () => {
        if (currentRef.current === FULL_LIST) return;

        currentRef.current = index;
        paintWalk(el, index);
        setCurrent(index);
      };

      body?.addEventListener('beforematch', onMatch);

      return () => body?.removeEventListener('beforematch', onMatch);
    });

    /*
     * Find-in-page opened a filtered sentence: tick its systems again, and say
     * so. The status line describes the selection, so a reveal that changes the
     * boxes has to recompute it or the line keeps describing the old one.
     */
    const lines = linesIn(el).map((line) => {
      const onMatch = () => {
        const next = new Set([...tickedRef.current, ...systemsOf(line)]);

        tickedRef.current = next;
        setTicked(next);
        setAnnouncement(describeRef.current(next));
      };

      line.addEventListener('beforematch', onMatch);

      return () => line.removeEventListener('beforematch', onMatch);
    });

    return () => {
      [...bodies, ...lines].forEach((off) => off());
      paintWalk(el, FULL_LIST);
      paintFilter(el, new Set(SYSTEMS));
    };
  }, [root]);

  useEffect(() => paintFilter(root.current, ticked), [root, ticked]);

  const describe = (next: ReadonlySet<PouchSystem>) => {
    const names = SYSTEMS.filter((system) => next.has(system)).map((system) => {
      const label = t(`systems.${system}`);

      return `${label.charAt(0).toLocaleLowerCase(locale)}${label.slice(1)}`;
    });

    if (!names.length) return t('filterNone');

    const systems = new Intl.ListFormat(locale, { type: 'conjunction' }).format(names);

    return t('filterStatus', { systems });
  };

  /*
   * The find-in-page listeners are registered once, so they read the current
   * `describe` through a ref rather than closing over the first render's.
   */
  useEffect(() => {
    describeRef.current = describe;
  });

  const tick = (system: PouchSystem, checked: boolean) => {
    const next = new Set(ticked);

    if (checked) next.add(system);
    else next.delete(system);

    tickedRef.current = next;
    setTicked(next);
    setAnnouncement(describe(next));
  };

  const walking = current !== FULL_LIST;
  const here = walking ? steps[current] : undefined;

  return (
    <div className="oc-fig-steps-controls">
      <fieldset className="oc-fig-steps-filter">
        <legend>{t('systemLegend')}</legend>
        <div className="oc-fig-steps-checks">
          {SYSTEMS.map((system) => (
            <label key={system}>
              <input
                checked={ticked.has(system)}
                onChange={(event) => tick(system, event.currentTarget.checked)}
                type="checkbox"
                value={system}
              />
              {t(`systems.${system}`)}
            </label>
          ))}
        </div>
      </fieldset>
      <p className="oc-fig-steps-status" role="status">
        {announcement}
      </p>

      <div className="oc-fig-steps-bar">
        <button
          aria-pressed={walking}
          className="oc-fig-steps-btn is-solid"
          onClick={walking ? showAll : () => go(0)}
          ref={toggleRef}
          type="button"
        >
          {t('walkThrough')}
        </button>
        {walking ? null : <span className="oc-fig-steps-hint">{t('orReadAll')}</span>}
      </div>

      {here
        ? createPortal(
            <div className="oc-fig-steps-nav">
              {current > 0 ? (
                <button className="oc-fig-steps-btn" onClick={() => go(current - 1)} type="button">
                  <span aria-hidden>← </span>
                  {t('previous')}
                </button>
              ) : null}
              {current < steps.length - 1 ? (
                <button
                  className="oc-fig-steps-btn is-solid"
                  onClick={() => go(current + 1)}
                  type="button"
                >
                  {t('next')}
                  <span aria-hidden> →</span>
                </button>
              ) : null}
              <button className="oc-fig-steps-btn" onClick={showAll} type="button">
                {t('showAll')}
              </button>
            </div>,
            here,
          )
        : null}
    </div>
  );
}
