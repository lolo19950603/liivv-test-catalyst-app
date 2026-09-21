'use client';

/*
 * =============================================================================
 * RECOVERY MAP — "MY OSTOMY" FILTER (C03)
 * =============================================================================
 * Loaded with next/dynamic after hydration, only where the recovery map
 * renders. The map is server HTML in recovery-map.tsx; this island never
 * renders map text.
 *
 * All three types start ticked, so the map starts whole. Unticking a type hides
 * the lines tagged only for types that are no longer ticked. Lines for everyone
 * never hide and nothing reorders. A lane left with no lines hides with them,
 * and a stage left with nothing for the ticked types says so in its own
 * server-rendered line. One status line confirms each change.
 *
 * Hidden lines take hidden="until-found", set on the server nodes through the
 * map's ref because React does not type it or beforematch, so find-in-page
 * still reaches them and ticks their types again. State stays in this island:
 * nothing goes into the URL, storage, analytics or the server.
 * =============================================================================
 */

import { useLocale, useTranslations } from 'next-intl';
import { type RefObject, useEffect, useRef, useState } from 'react';

import { OSTOMY_TYPES, type OstomyType } from './ostomy-types';
import { setUntilFound } from './until-found';

const isOstomyType = (value: string): value is OstomyType =>
  OSTOMY_TYPES.some((type) => type === value);

const typedLinesIn = (el: Element | null) =>
  Array.from(el?.querySelectorAll<HTMLElement>('dd[data-types]') ?? []);

const typesOf = (line: HTMLElement) => (line.dataset.types ?? '').split(' ').filter(isOstomyType);

function paint(root: HTMLElement | null, ticked: ReadonlySet<OstomyType>) {
  typedLinesIn(root).forEach((line) =>
    setUntilFound(line, !typesOf(line).some((type) => ticked.has(type))),
  );

  root?.querySelectorAll('.oc-ch-recovery-lane').forEach((lane) => {
    setUntilFound(lane, !lane.querySelector('dd:not([hidden])'));
  });

  /* "Nothing specific…" shows only where a stage has typed lines and all are hidden. */
  root?.querySelectorAll('.oc-ch-recovery-stage').forEach((stage) => {
    const typed = typedLinesIn(stage);
    const nothingForYou = typed.length > 0 && typed.every((line) => line.hasAttribute('hidden'));

    stage.querySelector('[data-oc-recovery-empty]')?.toggleAttribute('hidden', !nothingForYou);
  });
}

export function RecoveryMapFilter({ root }: { root: RefObject<HTMLDivElement | null> }) {
  const t = useTranslations('OstomyCare.ui.chapter.recoveryMap');
  const locale = useLocale();
  const [ticked, setTicked] = useState<ReadonlySet<OstomyType>>(() => new Set(OSTOMY_TYPES));
  const [announcement, setAnnouncement] = useState('');
  const tickedRef = useRef(ticked);
  const describeRef = useRef<(next: ReadonlySet<OstomyType>) => string>(() => '');

  useEffect(() => {
    const el = root.current;
    /*
     * Ticking types back on says so too: the status line describes the
     * selection, so a find-in-page reveal that changes the boxes has to
     * recompute it or the line keeps describing the selection before the match.
     */
    const reveal = (types: OstomyType[]) => {
      const next = new Set([...tickedRef.current, ...types]);

      tickedRef.current = next;
      setTicked(next);
      setAnnouncement(describeRef.current(next));
    };

    /* Find-in-page opened a filtered line: tick its types again. */
    const lines = typedLinesIn(el).map((line) => {
      const onMatch = () => reveal(typesOf(line));

      line.addEventListener('beforematch', onMatch);

      return () => line.removeEventListener('beforematch', onMatch);
    });

    /*
     * Find-in-page opened a hidden lane's own label: every type in the lane
     * comes back. `beforematch` bubbles, and the browser has not dropped the
     * `hidden` attribute yet when it fires, so a match inside one of the lane's
     * lines would otherwise arrive here as well and tick every type in the
     * lane. The event target is what tells them apart: the line's own listener
     * above ticks only that line's types.
     */
    const lanes = Array.from(el?.querySelectorAll<HTMLElement>('.oc-ch-recovery-lane') ?? []).map(
      (lane) => {
        const onMatch = (event: Event) => {
          if (event.target !== lane) return;

          reveal(typedLinesIn(lane).flatMap(typesOf));
        };

        lane.addEventListener('beforematch', onMatch);

        return () => lane.removeEventListener('beforematch', onMatch);
      },
    );

    return () => {
      [...lines, ...lanes].forEach((off) => off());
      paint(el, new Set(OSTOMY_TYPES));
    };
  }, [root]);

  useEffect(() => paint(root.current, ticked), [root, ticked]);

  const describe = (next: ReadonlySet<OstomyType>) => {
    const names = OSTOMY_TYPES.filter((type) => next.has(type)).map((type) =>
      t(`types.${type}`).toLocaleLowerCase(locale),
    );

    if (!names.length) return t('filterNone');

    return t('filterStatus', {
      types: new Intl.ListFormat(locale, { type: 'conjunction' }).format(names),
    });
  };

  /*
   * The find-in-page listeners are registered once, so they read the current
   * `describe` through a ref rather than closing over the first render's.
   */
  useEffect(() => {
    describeRef.current = describe;
  });

  const tick = (type: OstomyType, checked: boolean) => {
    const next = new Set(ticked);

    if (checked) next.add(type);
    else next.delete(type);

    tickedRef.current = next;
    setTicked(next);
    setAnnouncement(describe(next));
  };

  return (
    <div className="oc-ch-recovery-controls">
      <fieldset className="oc-ch-recovery-filter">
        <legend>{t('legend')}</legend>
        <div className="oc-ch-recovery-checks">
          {OSTOMY_TYPES.map((type) => (
            <label key={type}>
              <input
                checked={ticked.has(type)}
                onChange={(event) => tick(type, event.currentTarget.checked)}
                type="checkbox"
                value={type}
              />
              {t(`types.${type}`)}
            </label>
          ))}
        </div>
      </fieldset>
      <p className="oc-ch-recovery-status" role="status">
        {announcement}
      </p>
    </div>
  );
}
