'use client';

/*
 * =============================================================================
 * WHO TO ASK — TOPIC FILTER (C09)
 * =============================================================================
 * Loaded with next/dynamic after hydration, beside the lanes on Chapter 01
 * card 10. The lanes themselves are server HTML in figures.tsx; this island
 * renders no lane text and no advice of its own.
 *
 * Ticking a topic MARKS the lanes that fit — it un-hides each lane's own
 * server-rendered "Fits what you ticked" badge and outlines the lane. Nothing
 * is reordered, hidden, ranked or scored, so the nurse never leaves the page
 * because of a tick box, and a reader who ticks nothing sees exactly what a
 * reader with JavaScript off sees.
 *
 * Topics, never symptoms: the four choices are what a question is about, and
 * none of them maps to a product. Liivv's own lane can only ever be marked by
 * the product topic, and that is enforced where the lane is rendered.
 *
 * State stays in this island: nothing goes into the URL, storage, analytics or
 * the server.
 * =============================================================================
 */

import { useLocale } from 'next-intl';
import { type RefObject, useEffect, useState } from 'react';

export interface LaneTopicChoice {
  key: string;
  label: string;
}

/*
 * The one placeholder in `figure.statusFitsOne` and `figure.statusFitsMany`.
 * The status lines for the figures on a card are read straight out of the
 * message tree rather than through `t()`, so the number of lanes that fit is
 * put in here.
 *
 * Two keys rather than one ICU plural, for the same reason as the other
 * figures on this chapter: a plural category is chosen here with
 * `Intl.PluralRules` for the page locale, which puts French 0 and 1 in the
 * singular where English keeps 0 plural, and the message tree stays prose.
 */
const COUNT_SLOT = '{count}';

const lanesIn = (el: Element | null) =>
  Array.from(el?.querySelectorAll<HTMLElement>('.oc-fig-lane[data-topics]') ?? []);

const topicsOf = (lane: HTMLElement) => (lane.dataset.topics ?? '').split(' ').filter(Boolean);

/*
 * Mark every lane that fits. Only the badge and the outline change.
 *
 * Plain `hidden` here, not the `until-found` helper the other two islands share
 * (./until-found.ts): the badge is a mark on text that is already on the page,
 * so there is nothing for find-in-page to reveal. No lane text ever hides.
 */
function paint(root: HTMLElement | null, ticked: ReadonlySet<string>) {
  lanesIn(root).forEach((lane) => {
    const fits = ticked.size > 0 && topicsOf(lane).some((topic) => ticked.has(topic));

    lane.classList.toggle('is-match', fits);
    lane.querySelector('.oc-fig-fits')?.toggleAttribute('hidden', !fits);
  });
}

export function LanesTopics({
  legend,
  root,
  statusFitsMany,
  statusFitsOne,
  statusNone,
  topics,
}: {
  legend: string;
  root: RefObject<HTMLDivElement | null>;
  statusFitsMany: string;
  statusFitsOne: string;
  statusNone: string;
  topics: LaneTopicChoice[];
}) {
  const locale = useLocale();
  const [ticked, setTicked] = useState<ReadonlySet<string>>(() => new Set());
  const [announcement, setAnnouncement] = useState('');

  /* Leave the lanes unmarked if this island ever goes away. */
  useEffect(() => {
    const el = root.current;

    return () => paint(el, new Set());
  }, [root]);

  useEffect(() => paint(root.current, ticked), [root, ticked]);

  /*
   * The status counts the lanes that fit and repeats that everyone stays
   * listed, which is the approved wording: the count is the one thing a reader
   * cannot see at a glance, and the reassurance answers the fear that ticking
   * a box takes the nurse away. Nothing is hidden, so the count only ever says
   * how many are marked.
   */
  const describe = (next: ReadonlySet<string>) => {
    if (!next.size) return statusNone;

    const fits = lanesIn(root.current).filter((lane) =>
      topicsOf(lane).some((topic) => next.has(topic)),
    ).length;
    const template =
      new Intl.PluralRules(locale).select(fits) === 'one' ? statusFitsOne : statusFitsMany;

    return template.replace(COUNT_SLOT, new Intl.NumberFormat(locale).format(fits));
  };

  const tick = (topic: string, checked: boolean) => {
    const next = new Set(ticked);

    if (checked) next.add(topic);
    else next.delete(topic);

    setTicked(next);
    setAnnouncement(describe(next));
  };

  return (
    <div className="oc-fig-topics-wrap">
      <fieldset className="oc-fig-topics">
        <legend>{legend}</legend>
        <div className="oc-fig-topics-checks">
          {topics.map((topic) => (
            <label key={topic.key}>
              <input
                checked={ticked.has(topic.key)}
                onChange={(event) => tick(topic.key, event.currentTarget.checked)}
                type="checkbox"
                value={topic.key}
              />
              {topic.label}
            </label>
          ))}
        </div>
      </fieldset>
      <p className="oc-fig-topics-status" role="status">
        {announcement}
      </p>
    </div>
  );
}
