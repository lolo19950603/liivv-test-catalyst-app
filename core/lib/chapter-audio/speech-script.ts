import type {
  CategoryCard,
  Chapter,
  FigureText,
  SupplyRowText,
} from '~/app/[locale]/(default)/liivv-health/ostomy-care/chapters/chapters-data';
import { toSpeechText } from '~/lib/virtual-care-bot/speech-text';

export interface StopScript {
  /** 0 is the chapter intro; otherwise the card number (`#card-<n>`). */
  stop: number;
  title: string;
  text: string;
  /** The script split back into page lines, for the read-along highlight. */
  lines: string[];
}

/* Words the page shows that are not in the chapter data itself. */
export interface ScriptExtras {
  crisisBody?: string;
}

function supplyLabel(row: SupplyRowText) {
  return [row.label, row.condition].filter(Boolean).join(', ');
}

/*
 * Only the prose a listener needs. Controls, filter states, legends and link
 * labels ("Print this list", "fits 2 lanes") are left out on purpose.
 */
function figureLines(text: FigureText): string[] {
  return [
    text.heading,
    text.intro,
    ...text.framing,
    ...text.items,
    ...text.captions,
    ...text.routes.flatMap((route) => [route.prompt, route.detail]),
    ...text.lanes.flatMap((lane) => [lane.label, lane.scope, lane.body]),
    ...text.doors,
    text.starterHeading,
    ...text.supplies.map(supplyLabel),
    text.goBagHeading,
    ...text.goBagItems.map(supplyLabel),
    ...text.panels.flatMap((panel) => [panel.title, panel.body]),
    ...text.terms.map((term) => `${term.term}: ${term.def}`),
    ...text.clocks,
    ...text.steps.flatMap((step) => [step.title, ...step.items]),
    text.tell?.heading,
    ...(text.tell?.items ?? []),
  ].filter((line): line is string => Boolean(line?.trim()));
}

function cardLines(card: CategoryCard, extras: ScriptExtras): string[] {
  const hasCrisis = card.figures?.some((figure) => figure.kind === 'crisis');

  return [
    card.title,
    ...(card.items ?? []),
    ...(hasCrisis && extras.crisisBody ? [extras.crisisBody] : []),
    ...(card.sections ?? []).flatMap((section) => [
      section.heading,
      ...section.items,
      section.note,
    ]),
    ...(card.figureText ? figureLines(card.figureText) : []),
    card.note,
  ].filter((line): line is string => Boolean(line?.trim()));
}

/* Each line becomes its own sentence so the voice pauses between list items. */
function toScript(lines: string[]): Pick<StopScript, 'text' | 'lines'> {
  const unique = [...new Set(lines.map((line) => toSpeechText(line)))].filter(Boolean);

  return {
    text: unique.map((line) => (/[.!?:…]$/.test(line) ? line : `${line}.`)).join('\n'),
    lines: unique,
  };
}

export function buildStopScripts(chapter: Chapter, extras: ScriptExtras = {}): StopScript[] {
  const intro: StopScript = {
    stop: 0,
    title: chapter.title,
    ...toScript([chapter.title, chapter.heroBody, chapter.focus]),
  };

  const cards = [...chapter.categories]
    .sort((a, b) => a.number - b.number)
    .map((card) => ({
      stop: card.number,
      title: card.title,
      ...toScript(cardLines(card, extras)),
    }));

  return [intro, ...cards];
}
