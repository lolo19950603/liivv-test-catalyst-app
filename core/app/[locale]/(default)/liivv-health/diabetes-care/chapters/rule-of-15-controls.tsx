'use client';

/*
 * =============================================================================
 * THE RULE OF 15 — CONTROLS
 * =============================================================================
 * Loaded with next/dynamic after hydration, only where the Rule of 15 renders.
 * The steps, the 15 g list, the children's amounts and the automated-system
 * line are all server HTML in ./site-figures.tsx; this island never renders a
 * word of them. It only shows or hides parts of that markup:
 *
 * - An adult / a child: flips one class on the figure, and dc-figures.css
 *   shows the children's table, swaps every line that names 15 g for its
 *   child wording (which points to the table), and hides the options a child
 *   should not be offered (`hideWhenChild`, ruling R13). The 15 g list is
 *   never scaled. Before this loads, and with JavaScript off, the figure is
 *   the plain adult list with the children's table shown. A link can open it
 *   on "A child" (`?view=child`, CardLinkMeta in
 *   ../../_microsite/chapters/types.ts), as This Might Be You card 2 does.
 * - Walk through it: one step's body at a time, the way Ostomy's pouch-change
 *   walk-through does it (ostomy-care/chapters/change-routine-controls.tsx).
 *   Other steps keep their titles; their bodies take hidden="until-found", so
 *   find-in-page still reaches them and jumps the walk to that step. Focus
 *   moves to the step's heading, which then reads "Step n of N".
 *
 * State stays in this island: nothing goes into the URL, storage or
 * analytics, and the URL's `view` is read once, on load. No timers: the
 * reader's own clock times the 15 minutes.
 * =============================================================================
 */

import { useTranslations } from 'next-intl';
import { type RefObject, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { setUntilFound } from '../../ostomy-care/chapters/until-found';

const FULL_LIST = -1;

/* The class that says the island is running, so the CSS can start choosing. */
const READY_CLASS = 'is-ready';
const CHILD_CLASS = 'is-child';

/*
 * Whether the page was opened on the amounts for a child: `?view=child`, and
 * either no fragment or the one that names this figure's own card, so a link
 * meant for one card never flips a figure on another.
 */
function openedOnChild(root: HTMLElement | null) {
  const { hash, search } = window.location;

  if (new URLSearchParams(search).get('view') !== 'child') return false;

  const card = root?.closest('[id^="card-"]');

  return !hash || hash === `#${card?.id ?? ''}`;
}

const stepsIn = (root: HTMLElement | null) =>
  Array.from(root?.querySelectorAll<HTMLLIElement>('.oc-fig-steps > li') ?? []);

/*
 * One step's body showing, or every step's (FULL_LIST). In walk mode each
 * heading's "Step n of N" is exposed and its visual number is hidden from
 * assistive tech, so the heading is announced once, not twice. A step with
 * only a title has no body to hide.
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

function focusStep(root: HTMLElement | null, index: number) {
  const step = stepsIn(root)[index];

  step?.scrollIntoView({ block: 'nearest' });
  step?.querySelector<HTMLElement>('h4')?.focus({ preventScroll: true });
}

export interface RuleOf15Toggle {
  legend: string;
  adult: string;
  child: string;
}

export function RuleOf15Controls({
  root,
  toggle,
}: {
  root: RefObject<HTMLDivElement | null>;
  /* The card's own `figure.toggle` words. Absent where the card has no children's amounts. */
  toggle?: RuleOf15Toggle;
}) {
  const t = useTranslations('DiabetesCare.ui.ruleOf15');
  const legendId = useId();
  const [current, setCurrent] = useState(FULL_LIST);
  const [steps, setSteps] = useState<HTMLLIElement[]>([]);
  const [child, setChild] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const currentRef = useRef(FULL_LIST);
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

    el?.classList.add(READY_CLASS);
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

    return () => {
      bodies.forEach((off) => off());
      paintWalk(el, FULL_LIST);
      el?.classList.remove(READY_CLASS, CHILD_CLASS);
    };
  }, [root]);

  useEffect(() => {
    root.current?.classList.toggle(CHILD_CLASS, child);
  }, [root, child]);

  /* Opened on "A child" by a link. Once, on load, and only where there is a toggle. */
  const hasToggle = toggle !== undefined;

  useEffect(() => {
    if (hasToggle && openedOnChild(root.current)) setChild(true);
  }, [root, hasToggle]);

  const pick = (next: boolean) => {
    setChild(next);
    setAnnouncement(next ? t('statusChild') : t('statusAdult'));
  };

  const walking = current !== FULL_LIST;
  const here = walking ? steps[current] : undefined;
  /* Where the last step loops back to: step 2, or step 1 in a two-step list (as ./site-figures). */
  const loopIndex = steps.length > 2 ? 1 : 0;

  return (
    <div className="oc-fig-steps-controls">
      {toggle ? (
        <div className="dc-fig-r15-toggle">
          <span className="dc-fig-r15-legend" id={legendId}>
            {toggle.legend}
          </span>
          <div aria-labelledby={legendId} className="oc-fig-gap-seg" role="group">
            <button
              aria-pressed={!child}
              className="oc-fig-gap-btn"
              onClick={() => pick(false)}
              type="button"
            >
              {toggle.adult}
            </button>
            <button
              aria-pressed={child}
              className="oc-fig-gap-btn"
              onClick={() => pick(true)}
              type="button"
            >
              {toggle.child}
            </button>
          </div>
        </div>
      ) : null}
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
              {/* The last step loops back ("back to step 2"): a button that does it. */}
              {current === steps.length - 1 && steps.length > 1 ? (
                <button
                  className="oc-fig-steps-btn is-solid"
                  onClick={() => go(loopIndex)}
                  type="button"
                >
                  <span aria-hidden>↻ </span>
                  {t('backToStep', { n: String(loopIndex + 1) })}
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
