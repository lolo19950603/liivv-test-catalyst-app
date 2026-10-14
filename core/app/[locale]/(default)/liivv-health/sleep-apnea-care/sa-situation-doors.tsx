/*
 * The situation doors on the Sleep Apnea Care landing.
 *
 * The engine's doors (../_microsite/landing/situation-doors.tsx), with what
 * Sleep's urgent door needs and the engine's does not draw (landing fragment
 * BLOCKER, ruling C1): its body ends "In a medical emergency, call 911.", so
 * the body sits under the door's link rather than inside it, 911 can be
 * tapped to dial, and the sentence carries its own sources (Health811,
 * HealthLink BC 8-1-1). A door with no sources renders exactly as the engine's.
 *
 * Never gated: the urgent door's route and its 911 sentence. While the
 * `doors` French gate is closed (production /fr), the doors' new French waits
 * on review and the section falls back to the approved urgentExit words, as
 * the engine's does, and keeps the urgent door's body, its tap-to-call 911
 * and its sources under them.
 *
 * A server component with no 'use client' and no state, handed to the client
 * landing as a slot. The sources line inside it is the engine's client
 * SourceLine, which reads the SiteProvider the landing renders around the slot.
 */

import type { Messages } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Fragment } from 'react';

import { siteChapterMessages } from '../_microsite/chapters/compose';
import { localeHref } from '../_microsite/chapters/hrefs';
import { chapterPlace, isEngineChapter, landingCitations } from '../_microsite/landing/compose';
import { SourceLine } from '../_microsite/landing/landing-furniture';
import type { LandingCitation } from '../_microsite/landing/types';

import { SA_REGISTER } from './chapters/sa-register';
import { SLEEP_SITE } from './chapters/site';
import type { SituationDoor } from './landing-meta';

interface DoorText {
  label: string;
  body: string;
  secondary?: string;
}

const k = (name: string) => `sa-${name}`;

/* Every "911" in a line, tappable to dial (SiteConfig.emergency). */
function Dialable({ text }: { text: string }) {
  const emergency = SLEEP_SITE.emergency;

  if (!emergency || !text.includes(emergency.written)) return text;

  return text.split(emergency.written).map((part, index) => (
    <Fragment key={index}>
      {index > 0 ? <a href={`tel:${emergency.tel}`}>{emergency.written}</a> : null}
      {part}
    </Fragment>
  ));
}

/* Whether a door's target is there to be opened. The urgent door never waits. */
function isLive(door: SituationDoor, fundingHref: string | null) {
  if (door.urgent) return true;

  if (door.funding) return fundingHref !== null;

  if (door.requires === 'chapterOnEngine' && door.chapter) {
    return isEngineChapter(SLEEP_SITE, door.chapter);
  }

  return Boolean(door.chapter);
}

function doorHref(door: SituationDoor, locale: string, fundingHref: string | null) {
  if (door.funding && fundingHref) return localeHref(fundingHref, locale);

  if (!door.chapter) return localeHref(SLEEP_SITE.basePath, locale);

  return chapterPlace(SLEEP_SITE, locale, door.chapter, door.anchor);
}

function DoorGlyph({ name }: { name: string }) {
  const paths: Record<string, string> = SLEEP_SITE.glyphs;

  return (
    <svg
      aria-hidden
      className={k('situation-glyph')}
      dangerouslySetInnerHTML={{ __html: paths[name] ?? '' }}
      focusable="false"
      viewBox="0 0 24 24"
    />
  );
}

/* A door whose body states a fact: the link, then the body with its sources under it. */
function SourcedDoor({
  door,
  text,
  href,
  sources,
}: {
  door: SituationDoor;
  text: Pick<DoorText, 'label' | 'body'>;
  href: string;
  sources: LandingCitation[];
}) {
  return (
    <>
      <a className={k('situation-door')} href={href}>
        <DoorGlyph name={door.glyph} />
        <b>{text.label}</b>
      </a>
      <p className={k('situation-body')}>
        <Dialable text={text.body} />
      </p>
      <SourceLine className={k('source-line')} sources={sources} />
    </>
  );
}

function Door({
  door,
  text,
  locale,
  fundingHref,
}: {
  door: SituationDoor;
  text: DoorText;
  locale: string;
  fundingHref: string | null;
}) {
  const href = doorHref(door, locale, fundingHref);
  const sources = landingCitations(SA_REGISTER, door.sources ?? [], locale);

  return (
    <li className={door.urgent ? `${k('situation-item')} is-urgent` : k('situation-item')}>
      {sources.length ? (
        <SourcedDoor door={door} href={href} sources={sources} text={text} />
      ) : (
        <a className={k('situation-door')} href={href}>
          <DoorGlyph name={door.glyph} />
          <b>{text.label}</b>
          <span>{text.body}</span>
        </a>
      )}
      {door.secondary && text.secondary ? (
        <a
          className={k('situation-secondary')}
          href={chapterPlace(SLEEP_SITE, locale, door.secondary.chapter, door.secondary.anchor)}
        >
          {text.secondary}
        </a>
      ) : null}
    </li>
  );
}

export async function SaSituationDoors({
  doors,
  locale,
  id,
  urgentExitChapter,
  fundingHref,
}: {
  doors: readonly SituationDoor[];
  locale: string;
  id: string;
  urgentExitChapter: string;
  fundingHref: string | null;
}) {
  const messages: Messages = await getMessages({ locale });
  const tree = messages.SleepApneaCare;
  const words = tree.ui.landingPage.doors;
  const items: Record<string, DoorText | undefined> = words.items;
  const headingId = k('situations-heading');
  const urgentIndex = doors.findIndex((door) => door.urgent);
  const urgent = doors[urgentIndex];
  const urgentText = items[String(urgentIndex + 1)];
  const gates = SLEEP_SITE.gates;

  /*
   * The French review gate for the doors (production /fr until the owner opens
   * it): the urgent route alone, in the approved urgentExit words, with the
   * urgent door's 911 sentence and its sources, which are never gated.
   */
  if (gates.isFrGated(gates.features.doors, locale)) {
    const exit = siteChapterMessages(tree)[urgentExitChapter]?.urgentExit;

    if (!exit || !urgent) return null;

    return (
      <section aria-labelledby={headingId} className={k('situation')} id={id}>
        <div className={k('wrap')}>
          <h2 id={headingId}>{exit.lead}</h2>
          <ul className={k('situation-list')}>
            <Door
              door={urgent}
              fundingHref={fundingHref}
              locale={locale}
              text={{ label: exit.link, body: urgentText?.body ?? '' }}
            />
          </ul>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby={headingId} className={k('situation')} id={id}>
      <div className={k('wrap')}>
        {gates.showsFrDraftMarker(gates.features.doors, locale) ? (
          <p className={k('situation-draft')}>{tree.ui.chapter.frDraft}</p>
        ) : null}

        <h2 id={headingId}>{words.heading}</h2>

        <ul className={k('situation-list')}>
          {doors.map((door, index) => {
            const text = items[String(index + 1)];

            if (!text || !isLive(door, fundingHref)) return null;

            return (
              <Door
                door={door}
                fundingHref={fundingHref}
                key={door.id}
                locale={locale}
                text={text}
              />
            );
          })}
        </ul>
      </div>
    </section>
  );
}
