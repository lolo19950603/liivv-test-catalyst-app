/* Twin of ostomy-care/_components/situation-doors.tsx @3b343c6e — port fixes both ways until Phase 2 */

/*
 * The situation doors on a care site's landing page.
 *
 * Plain links, named after where the reader is rather than after a section of
 * the site, above every shop surface on the page. People arriving from search
 * are often frightened; the urgent door takes them to the site's emergency
 * list in one click, and nothing here has to be opened, ticked or answered
 * first.
 *
 * A server component with no 'use client' and no state, handed to the client
 * landing page as a slot, so the links cost the landing no client JavaScript.
 * The symbols are inlined per door rather than drawn from the chapter sprite,
 * because the landing renders no sprite.
 *
 * Ostomy's, with what was Ostomy's own read from the site: its doors and
 * their targets (the site's landing-meta.ts), its symbols, its emergency
 * anchor, its `doors` French gate, its class prefix and its words in
 * `<ns>.ui.landingPage.doors`. Two things are new. A door can wait on its
 * target (`requires`): a chapter the engine does not serve yet, or a funding
 * page not built yet, leaves that door off rather than link to an older page
 * or to nowhere. The urgent door never waits.
 */

import type { Messages } from 'next-intl';
import { getMessages } from 'next-intl/server';

import { siteChapterMessages } from '../chapters/compose';
import { localeHref } from '../chapters/hrefs';
import type { SiteConfig, SiteNs } from '../site';

import { chapterPlace, isEngineChapter } from './compose';

/* A door, as a site's landing-meta.ts declares it. */
export interface SituationDoorMeta {
  id: string;
  glyph: string;
  /** A chapter slug. Exactly one of `chapter` and `funding`. */
  chapter?: string;
  /** A fragment on that chapter: `red-flags`, or `card-<n>` for a card. */
  anchor?: string;
  funding?: true;
  /** Emergency wording. Marked in text and symbol, never in colour alone. */
  urgent?: true;
  /** The quieter second link under a door, for the reader whose case is not urgent. */
  secondary?: { chapter: string; anchor: string };
  /** What has to be live before the door renders. */
  requires?: 'chapterOnEngine' | 'fundingPage';
}

interface DoorText {
  label: string;
  body: string;
  /* Only the urgent door carries one — the quieter route for a worry that is not urgent. */
  secondary?: string;
}

type DoorsSite = Pick<SiteConfig, 'anchors' | 'basePath' | 'chapters' | 'gates' | 'glyphs' | 'ns'>;

/* Whether a door's target is there to be opened. */
function isLive(site: DoorsSite, door: SituationDoorMeta, fundingHref: string | null) {
  if (door.urgent) return true;

  if (door.funding) return fundingHref !== null;

  if (door.requires === 'chapterOnEngine' && door.chapter) {
    return isEngineChapter(site, door.chapter);
  }

  return Boolean(door.chapter);
}

/*
 * A door points at the funding page or at a chapter, in the page locale.
 * These are plain <a>, so the locale prefix is put on by hand.
 */
function doorHref(
  site: DoorsSite,
  door: SituationDoorMeta,
  locale: string,
  fundingHref: string | null,
) {
  if (door.funding && fundingHref) return localeHref(fundingHref, locale);

  if (!door.chapter) return localeHref(site.basePath, locale);

  return chapterPlace(site, locale, door.chapter, door.anchor);
}

/* A wordless line symbol, always beside the door's own label. */
function DoorGlyph({ paths, className }: { paths: string; className: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      dangerouslySetInnerHTML={{ __html: paths }}
      focusable="false"
      viewBox="0 0 24 24"
    />
  );
}

export async function SituationDoors({
  site,
  doors,
  locale,
  classPrefix,
  id,
  urgentExitChapter,
  fundingHref,
}: {
  site: DoorsSite;
  doors: readonly SituationDoorMeta[];
  locale: string;
  /* The landing stylesheet's class prefix, such as 'dc-'. */
  classPrefix: string;
  /* The section's id, an anchor other pages may link to. */
  id: string;
  /*
   * The chapter whose approved `urgentExit` pair ("signs that need emergency
   * care are in …") the closed-gate fallback uses: one that points at the
   * emergency list from elsewhere, so its wording is true on the landing.
   */
  urgentExitChapter: string;
  /* The funding page, or null while it does not exist. */
  fundingHref: string | null;
}) {
  const k = (name: string) => `${classPrefix}${name}`;
  const messages: Messages = await getMessages({ locale });
  const tree: Messages[SiteNs] = messages[site.ns];
  const headingId = k('situations-heading');
  const redFlags = chapterPlace(
    site,
    locale,
    site.anchors.redFlags.chapter,
    site.anchors.redFlags.id,
  );
  const glyph = (name: string) => site.glyphs[name] ?? '';

  /*
   * The French review gate for the doors. The doors' own French waits on
   * review, so on /fr in production they stay off. Development and preview
   * open the gate so the francophone reviewer can read them in place, with
   * the draft marker.
   *
   * What the gate must not do is take the emergency route off the page. The
   * fallback is that route: the same target as the urgent door, in the same
   * place, wearing the same urgent styling, in the approved urgentExit words
   * the chapters already carry, so nothing here waits on the `doors` review.
   * When the owner opens the gate, the fallback disappears on its own.
   */
  if (site.gates.isFrGated(site.gates.features.doors, locale)) {
    const exit = siteChapterMessages(tree)[urgentExitChapter]?.urgentExit;

    if (!exit) return null;

    return (
      <section aria-labelledby={headingId} className={k('situation')} id={id}>
        <div className={k('wrap')}>
          <h2 id={headingId}>{exit.lead}</h2>

          <ul className={k('situation-list')}>
            <li className={`${k('situation-item')} is-urgent`}>
              <a className={k('situation-door')} href={redFlags}>
                <DoorGlyph className={k('situation-glyph')} paths={glyph('urgent')} />
                <b>{exit.link}</b>
              </a>
            </li>
          </ul>
        </div>
      </section>
    );
  }

  /*
   * The numbered keys are read off the message tree rather than through t(),
   * which cannot type a key built from a position.
   */
  const words = tree.ui.landingPage.doors;
  const items: Record<string, DoorText | undefined> = words.items;

  return (
    <section aria-labelledby={headingId} className={k('situation')} id={id}>
      <div className={k('wrap')}>
        {site.gates.showsFrDraftMarker(site.gates.features.doors, locale) ? (
          <p className={k('situation-draft')}>{tree.ui.chapter.frDraft}</p>
        ) : null}

        <h2 id={headingId}>{words.heading}</h2>

        <ul className={k('situation-list')}>
          {doors.map((door, index) => {
            const text = items[String(index + 1)];

            if (!text || !isLive(site, door, fundingHref)) return null;

            return (
              <li
                className={door.urgent ? `${k('situation-item')} is-urgent` : k('situation-item')}
                key={door.id}
              >
                <a className={k('situation-door')} href={doorHref(site, door, locale, fundingHref)}>
                  <DoorGlyph className={k('situation-glyph')} paths={glyph(door.glyph)} />
                  <b>{text.label}</b>
                  <span>{text.body}</span>
                </a>
                {door.secondary && text.secondary ? (
                  <a
                    className={k('situation-secondary')}
                    href={chapterPlace(site, locale, door.secondary.chapter, door.secondary.anchor)}
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
