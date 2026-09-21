/*
 * C13 — situation doors on the Ostomy Care landing page.
 *
 * Five plain links, named after where the reader is rather than after a section
 * of this site, above every shop surface on the page. People arriving from
 * search are often frightened; a door called "Something doesn't seem right"
 * takes them to Chapter 02's emergency list in one click, and nothing here has
 * to be opened, ticked or answered first.
 *
 * A server component with no 'use client' and no state: this is what replaced
 * the guest quiz and the kit flow demo, and it must not put their weight back
 * into the landing's client bundle. The symbols are inlined per door rather
 * than drawn from the chapter sprite, because the landing renders no sprite.
 *
 * Wording lives in messages/*.json under `OstomyCare.ui.landingPage.doors`;
 * the targets live in ../landing-meta.ts.
 */

import { getLocale, getMessages, getTranslations } from 'next-intl/server';

import { chapterHref, FUNDING_HREF, LANDING_HREF, localeHref } from '../chapters/chapters-data';
import type { GlyphName } from '../chapters/chapters-meta';
import { GLYPH_PATHS } from '../chapters/glyph-paths';
import { isFrGated, showsFrDraftMarker } from '../chapters/review-gates';
import { SITUATION_DOORS, type SituationDoor } from '../landing-meta';

interface DoorText {
  label: string;
  body: string;
  /* Only door 3 carries one — the quieter route for a worry that is not urgent. */
  secondary?: string;
}

const anchored = (slug: string, anchor?: string) =>
  anchor ? `${chapterHref(slug)}#${anchor}` : chapterHref(slug);

/*
 * A door points at the funding page or at a chapter, in the page locale. It can
 * never point at the landing itself; the content-review export refuses a door
 * with neither, so the fallback is there to be seen in review rather than to be
 * reached by a reader.
 *
 * These are plain <a>, so `localeHref` is what keeps a French reader on /fr —
 * without it every door on the French landing opens the English chapter
 * (chapters-data.ts).
 */
function doorHref(door: SituationDoor, locale: string) {
  if (door.funding) return localeHref(FUNDING_HREF, locale);

  if (!door.chapter) return localeHref(LANDING_HREF, locale);

  return localeHref(anchored(door.chapter, door.anchor), locale);
}

/* A wordless line symbol, always beside the door's own label. */
function DoorGlyph({ name }: { name: GlyphName }) {
  return (
    <svg
      aria-hidden
      className="oc-situation-glyph"
      dangerouslySetInnerHTML={{ __html: GLYPH_PATHS[name] }}
      focusable="false"
      viewBox="0 0 24 24"
    />
  );
}

export async function SituationDoors() {
  const locale = await getLocale();

  /*
   * French review gate `doors`. The rest of this page is hardcoded English, so
   * on /fr in production the doors stay off entirely rather than stand as five
   * French links on an English page. Development and preview open the gate so
   * the francophone reviewer can read them in place, with the draft marker.
   *
   * One of the five is the emergency door, and a gate must never be what takes
   * an emergency signpost off a page (review-gates.ts). It does not here: this
   * landing has never carried one in either language, and what /fr shows while
   * the gate is closed is exactly what it shows today. Opening the gate is the
   * fix, not shipping unreviewed French — so this is the first gate to open.
   */
  if (isFrGated('doors', locale)) return null;

  const t = await getTranslations({ locale, namespace: 'OstomyCare.ui.landingPage.doors' });
  const chapter = await getTranslations({ locale, namespace: 'OstomyCare.ui.chapter' });
  /*
   * The numbered keys are read off the message tree rather than through t(),
   * which cannot type a key built from a position — the same reason the chapter
   * page reads its own numbered lists that way.
   */
  const messages = await getMessages({ locale });
  const items: Record<string, DoorText> = messages.OstomyCare.ui.landingPage.doors.items;

  return (
    <section aria-labelledby="oc-situations-heading" className="oc-situation" id="situations">
      <div className="oc-wrap">
        {showsFrDraftMarker('doors', locale) ? (
          <p className="oc-situation-draft">{chapter('frDraft')}</p>
        ) : null}

        <h2 id="oc-situations-heading">{t('heading')}</h2>

        <ul className="oc-situation-list">
          {SITUATION_DOORS.map((door, index) => {
            const text = items[String(index + 1)];

            if (!text) return null;

            return (
              <li
                className={door.urgent ? 'oc-situation-item is-urgent' : 'oc-situation-item'}
                key={door.id}
              >
                <a className="oc-situation-door" href={doorHref(door, locale)}>
                  <DoorGlyph name={door.glyph} />
                  <b>{text.label}</b>
                  <span>{text.body}</span>
                </a>
                {door.secondary && text.secondary ? (
                  <a
                    className="oc-situation-secondary"
                    href={localeHref(anchored(door.secondary.chapter, door.secondary.anchor), locale)}
                  >
                    {text.secondary}
                  </a>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
