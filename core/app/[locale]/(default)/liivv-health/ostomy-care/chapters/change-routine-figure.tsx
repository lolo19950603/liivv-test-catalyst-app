'use client';

/*
 * =============================================================================
 * POUCH CHANGE WALK-THROUGH (C01) — Chapter 01, card 7
 * =============================================================================
 * Everything a reader needs is in the server HTML: the framing lines, then the
 * steps as an ordered list, then the NSWOC directory link, the emergency
 * signpost and the non-urgent list. Card 7's own sentences are the leads of
 * their steps, looked up by number, so each reviewed sentence has one source.
 *
 * The controls — one step at a time, and the system filter — are a separate
 * island loaded after hydration. They only show or hide parts of this list,
 * using hidden="until-found" so find-in-page still reaches the text. With
 * JavaScript off, or before the island loads, every step is readable. The
 * signpost and the non-urgent list sit outside the island, so no control can
 * hide them.
 *
 * Words come from `categories.7.figure` and `ui.chapter.changeRoutine`; which
 * sentence belongs to which system comes from chapters-meta.ts.
 * =============================================================================
 */

import dynamic from 'next/dynamic';
import { useLocale, useTranslations } from 'next-intl';
import { useRef } from 'react';

import {
  cardHref,
  type CategoryCard,
  type Chapter,
  type FigureText,
  localeHref,
} from './chapters-data';
import type { FigureMeta } from './chapters-meta';
import { FrDraftMarker, itemText, OutboundLabel, UrgentExit } from './figure-parts';

type ChangeRoutine = Extract<FigureMeta, { kind: 'changeRoutine' }>;

const Controls = dynamic(
  () => import('./change-routine-controls').then((mod) => mod.ChangeRoutineControls),
  { ssr: false },
);

/* The link to the gap figure, on the last sentence of the step that names it. */
function GapLink({ figure, text }: { figure: ChangeRoutine; text?: FigureText }) {
  /* A plain <a>, so the /fr prefix has to be put on by hand — chapters-data.ts. */
  const locale = useLocale();

  if (!text?.gapLink) return null;

  return (
    <>
      {' '}
      <a href={localeHref(cardHref(figure.gap.chapter, figure.gap.card), locale)}>{text.gapLink}</a>
    </>
  );
}

function ChangeStep({
  card,
  figure,
  index,
}: {
  card: CategoryCard;
  figure: ChangeRoutine;
  index: number;
}) {
  const t = useTranslations('OstomyCare.ui.chapter.changeRoutine');
  const step = figure.steps[index];
  const words = card.figureText?.steps.find((entry) => entry.key === step?.key);

  if (!step || !words) return null;

  const number = index + 1;
  const systemsFor = (sentence: number) =>
    step.conditional?.find((entry) => entry.sentence === sentence)?.systems.join(' ');
  const gapStep = figure.gap.step === step.key;

  return (
    <li id={`step-${step.key}`}>
      <h4 tabIndex={-1}>
        <span className="oc-fig-steps-n">{number}.</span>{' '}
        <span className="sr-only" data-oc-step-of="" hidden>
          {t('stepOf', { n: String(number), total: String(figure.steps.length) })}
        </span>{' '}
        {words.title}
      </h4>
      <div className="oc-fig-steps-body">
        {step.lead ? <p className="oc-fig-steps-lead">{itemText(card, step.lead)}</p> : null}
        <ul>
          {words.items.map((item, itemIndex) => (
            <li data-systems={systemsFor(itemIndex + 1)} key={`${itemIndex}-${item}`}>
              {item}
              {gapStep && itemIndex === words.items.length - 1 ? (
                <GapLink figure={figure} text={card.figureText} />
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}

export function ChangeRoutineFigure({
  card,
  exit,
  figure,
}: {
  card: CategoryCard;
  exit?: Chapter['urgentExit'];
  figure: ChangeRoutine;
}) {
  const t = useTranslations('OstomyCare.ui.chapter.changeRoutine');
  const rootRef = useRef<HTMLDivElement>(null);
  const text = card.figureText;

  return (
    <div className="oc-fig-steps-wrap" ref={rootRef}>
      <FrDraftMarker gate="changeRoutine" />
      {text?.framing.length ? (
        <div className="oc-fig-steps-framing">
          {text.framing.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      ) : null}

      <Controls root={rootRef} />

      <ol className="oc-fig-steps">
        {figure.steps.map((step, index) => (
          <ChangeStep card={card} figure={figure} index={index} key={step.key} />
        ))}
      </ol>

      <p className="oc-fig-steps-find">
        <a href={figure.findNswocHref} hrefLang={figure.findNswocHrefLang}>
          <OutboundLabel hrefLang={figure.findNswocHrefLang} label={t('findNswoc')} />
        </a>
      </p>
      {exit ? <UrgentExit exit={exit} /> : null}
      {text?.tell ? (
        <div className="oc-fig-steps-tell">
          <p className="oc-fig-steps-tell-head">{text.tell.heading}</p>
          <ul>
            {text.tell.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
