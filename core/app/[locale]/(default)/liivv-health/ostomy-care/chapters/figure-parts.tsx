/*
 * Small pieces every chapter figure uses: the symbol, the lookup of a card's
 * own sentence by number, and the one-line signpost to the emergency list.
 *
 * They live apart from figures.tsx so a figure in its own file (for example
 * change-routine-figure.tsx) can use them without a circular import. figures.tsx
 * re-exports UrgentExit for the page.
 */

import { useLocale, useTranslations } from 'next-intl';

import type { CategoryCard, Chapter } from './chapters-data';
import type { GlyphName, LinkLang } from './chapters-meta';
import { type GateId, showsFrDraftMarker } from './review-gates';

/* A wordless symbol from the page's sprite. Always paired with a text label. */
export function Glyph({ name }: { name: GlyphName }) {
  return (
    <svg aria-hidden className="oc-fig-glyph" focusable="false" viewBox="0 0 24 24">
      <use href={`#oc-g-${name}`} />
    </svg>
  );
}

/* A card's own reviewed sentence, by its 1-based item number. */
export const itemText = (card: CategoryCard, item: number) => card.items?.[item - 1] ?? '';

/*
 * On /fr, a module whose French is not yet reviewed renders only on local
 * development and preview deployments (review-gates.ts). There it carries this
 * small visible marker so the francophone reviewer knows it is a draft.
 * Production never reaches it: the gate drops the module instead.
 */
export function FrDraftMarker({ gate }: { gate: GateId }) {
  const t = useTranslations('OstomyCare.ui.chapter');
  const locale = useLocale();

  if (!showsFrDraftMarker(gate, locale)) return null;

  return <p className="oc-fig-draft">{t('frDraft')}</p>;
}

/*
 * "(in French)" / "(en anglais)", inside the link text so it is read as part of
 * the link rather than as loose text beside it. Shown only where the page the
 * link opens is not in the language of this page.
 *
 * Every outward link on a chapter uses it — the resources shelf, the who-to-ask
 * lanes and the pouch change walk-through all send people to the same few
 * pages, so one destination can never be described two different ways.
 */
function LanguageNote({ hrefLang }: { hrefLang: LinkLang | undefined }) {
  const t = useTranslations('OstomyCare.ui.chapter.shelf');
  const locale = useLocale();

  if (hrefLang === undefined || hrefLang === locale) return null;

  return (
    <span className="oc-ch-shelf-lang"> {hrefLang === 'fr' ? t('inFrench') : t('inEnglish')}</span>
  );
}

/*
 * The text of a link out of a chapter: its label, and the language note where
 * the page it opens is in the other language.
 *
 * One span around both, because every one of these links is a flex box with a
 * 44px floor (WCAG 2.2 target size) and two flex items would put the note on
 * its own line whenever the label wraps. Inside one item the note flows after
 * the last word, the way it reads.
 */
export function OutboundLabel({
  hrefLang,
  label,
}: {
  hrefLang: LinkLang | undefined;
  label: string;
}) {
  return (
    <span className="oc-ch-outbound-label">
      {label}
      <LanguageNote hrefLang={hrefLang} />
    </span>
  );
}

/* One line to another chapter's emergency list. Never collapsible or animated. */
export function UrgentExit({ exit }: { exit: NonNullable<Chapter['urgentExit']> }) {
  return (
    <p className="oc-fig-exit">
      <Glyph name="urgent" />
      <span>
        {exit.lead} <a href={exit.href}>{exit.link}</a>
      </span>
    </p>
  );
}
