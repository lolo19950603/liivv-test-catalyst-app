/* Twin of ostomy-care/chapters/figure-parts.tsx @3b343c6e — port fixes both ways until Phase 2 */

/*
 * Small pieces every chapter figure uses: the symbol, the lookup of a card's
 * own sentence by number, the French draft marker, the language note on an
 * outward link, and the one-line signpost to the emergency list.
 *
 * They live apart from figures.tsx so a figure in its own file — a site's own
 * figures included — can use them without a circular import. figures.tsx
 * re-exports UrgentExit for the page.
 */

import { useLocale } from 'next-intl';
import type { ReactNode } from 'react';

import { useSite, useSiteT } from '../site-context';

import type { CategoryCard, Chapter } from './compose';
import type { LinkLang } from './types';

/*
 * A wordless symbol from the page's sprite (FigureGlyphs in figures.tsx).
 * Always paired with a text label.
 */
export function Glyph({ name }: { name: string }) {
  const { idPrefix } = useSite();

  return (
    <svg aria-hidden className="oc-fig-glyph" focusable="false" viewBox="0 0 24 24">
      <use href={`#${idPrefix}g-${name}`} />
    </svg>
  );
}

/* A card's own reviewed sentence, by its 1-based item number. */
export const itemText = (card: CategoryCard, item: number) => card.items?.[item - 1] ?? '';

/*
 * One of a card's own sentences as the page shows it: the words exactly as
 * they are, with the link the site's meta gives that sentence, if any (`links`
 * on the card, composed in ./compose.ts). Use it wherever a card's item, note
 * or section line is drawn, so a link reaches every layout the sentence can
 * appear in. A sentence with no link is returned as plain text.
 */
export function CardText({ card, text }: { card: CategoryCard; text: string }) {
  const link = card.links?.find((candidate) => candidate.text === text);

  if (!link) return text;

  const end = link.start + link.length;

  return (
    <>
      {text.slice(0, link.start)}
      <a href={link.href}>{text.slice(link.start, end)}</a>
      {text.slice(end)}
    </>
  );
}

/* A card's own sentence by its 1-based item number, with its link (CardText). */
export function CardItem({ card, item }: { card: CategoryCard; item: number }) {
  return <CardText card={card} text={itemText(card, item)} />;
}

/*
 * On /fr, a module whose French is not yet reviewed renders only on local
 * development and preview deployments (the site's review-gates.ts). There it
 * carries this small visible marker so the francophone reviewer knows it is a
 * draft. Production never reaches it: the gate drops the module instead.
 *
 * `gate` is one of the site's own gate ids.
 */
export function FrDraftMarker({ gate }: { gate: string }) {
  const t = useSiteT('ui.chapter');
  const { gates } = useSite();
  const locale = useLocale();

  if (!gates.showsFrDraftMarker(gate, locale)) return null;

  return <p className="oc-fig-draft">{t('frDraft')}</p>;
}

/*
 * "(in French)" / "(en anglais)", inside the link text so it is read as part of
 * the link rather than as loose text beside it. Shown only where the page the
 * link opens is not in the language of this page.
 *
 * Every outward link on a chapter uses it — the resources shelf, the who-to-ask
 * lanes and the band links all send people to the same few pages, so one
 * destination can never be described two different ways.
 */
function useLanguageNote(hrefLang: LinkLang | undefined) {
  const t = useSiteT('ui.chapter.shelf');
  const locale = useLocale();

  if (hrefLang === undefined || hrefLang === locale) return undefined;

  return hrefLang === 'fr' ? t('inFrench') : t('inEnglish');
}

/*
 * The text of a link out of a chapter: its label, and the language note where
 * the page it opens is in the other language.
 *
 * One span around both, because every one of these links is a flex box with a
 * 44px floor (WCAG 2.2 target size) and two flex items would put the note on
 * its own line whenever the label wraps. Inside one item the note flows after
 * the last word, the way it reads.
 *
 * A label never stacks two brackets. Where it already ends in its own, such
 * as "(opens their site)", the note goes inside them instead of after them:
 * "(s’ouvre sur leur site, en anglais)". Engine-only so far: Ostomy's twin
 * always appends the note.
 *
 * A label may also be marked up, as a Sources entry is ("Title, Publisher
 * (2023)", each part in its own language; ../_components/source-chip.tsx).
 * A marked-up label always takes the note after it. Engine-only so far.
 */
export function OutboundLabel({
  hrefLang,
  label,
}: {
  hrefLang: LinkLang | undefined;
  label: string | ReactNode;
}) {
  const note = useLanguageNote(hrefLang);
  const inner = note === undefined ? undefined : /^\((.+)\)$/.exec(note)?.[1];

  if (inner !== undefined && typeof label === 'string' && label.endsWith(')')) {
    return <span className="oc-ch-outbound-label">{`${label.slice(0, -1)}, ${inner})`}</span>;
  }

  return (
    <span className="oc-ch-outbound-label">
      {label}
      {note === undefined ? null : <span className="oc-ch-shelf-lang"> {note}</span>}
    </span>
  );
}

/* One line to a chapter's emergency list. Never collapsible or animated. */
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
