'use client';

import { HEALTH_HUB_DOORS } from '../../health-hub-data';

import {
  type CategoryCard,
  type Chapter,
  chapterHref,
  CHAPTERS,
  type Citation,
  getChapterNeighbors,
  type Governance,
  LANDING_HREF,
  type ResourceGroup,
  type UrgentCallout,
} from './chapters-data';

import './chapter-page.css';

/*
 * Ostomy chapter page — soft journal / path layout (not Women's Health chapter chrome).
 */

const OSTOMY_DOOR_ID = 'ostomy_care_everyday';

function formatReviewDate(iso: string) {
  const parsed = new Date(`${iso}T00:00:00Z`);

  if (Number.isNaN(parsed.getTime())) return null;

  return parsed.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function CategoryRow({ card, index }: { card: CategoryCard; index: number }) {
  return (
    <article className="oc-ch-row">
      <span aria-hidden className="oc-ch-row-index">
        {String(index + 1).padStart(2, '0')}
      </span>
      <div>
        {card.group ? <span className="oc-ch-group">{card.group}</span> : null}
        <h3>
          {card.title}
          {card.badge ? ` · ${card.badge}` : ''}
        </h3>
        {card.items ? (
          <ul>
            {card.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
        {card.sections?.map((section) => (
          <div className="oc-ch-subsection" key={section.heading}>
            <h4>{section.heading}</h4>
            <ul>
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {section.note ? <p className="oc-ch-row-note">{section.note}</p> : null}
          </div>
        ))}
        {card.note ? <p className="oc-ch-row-note">{card.note}</p> : null}
      </div>
    </article>
  );
}

/*
 * Red-flag block. Deliberately its own component with its own styling so it can
 * never be mistaken for an ordinary tip, and `role="alert"` is omitted on purpose
 * — this is standing content, not a live announcement.
 */
function UrgentBlock({ urgent }: { urgent: UrgentCallout }) {
  return (
    <section className="oc-ch-urgent rounded-top">
      <div className="oc-ch-wrap">
        <aside aria-labelledby="oc-ch-urgent-heading" className="oc-ch-urgent-panel">
          <span aria-hidden className="oc-ch-urgent-mark">
            !
          </span>
          <div>
            <h2 id="oc-ch-urgent-heading">{urgent.heading}</h2>
            <p className="oc-ch-urgent-intro">{urgent.intro}</p>
            <ul>
              {urgent.signs.map((sign) => (
                <li key={sign}>{sign}</li>
              ))}
            </ul>
            <p className="oc-ch-urgent-action">{urgent.action}</p>
          </div>
        </aside>
      </div>
    </section>
  );
}

function ResourceGroupBlock({ group }: { group: ResourceGroup }) {
  return (
    <div className="oc-ch-res-group">
      <header className="oc-ch-care-head">
        <span className="oc-ch-eyebrow">{group.eyebrow}</span>
        <h3>{group.heading}</h3>
        {group.body ? <p>{group.body}</p> : null}
      </header>
      <ul className="oc-ch-res-list">
        {group.links.map((link) => (
          <li key={link.href}>
            <a
              className="oc-ch-res-card"
              href={link.href}
              rel="noopener noreferrer"
              target="_blank"
            >
              <span className="oc-ch-res-org">{link.org}</span>
              <span className="oc-ch-res-title">
                {link.title}
                {link.note ? <em className="oc-ch-res-note"> · {link.note}</em> : null}
              </span>
              <span className="oc-ch-res-body">{link.body}</span>
              <span aria-hidden className="oc-ch-res-go">
                Opens on their site ↗
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/*
 * The way out of the microsite. Someone who has read a chapter has already got
 * value, so this is the honest moment to mention Liivv covers more than one thing.
 */
function DiscoveryBand() {
  const others = HEALTH_HUB_DOORS.filter(
    (door) => door.status === 'live' && door.id !== OSTOMY_DOOR_ID && door.href,
  );

  if (!others.length) return null;

  return (
    <section className="oc-ch-discover rounded-top">
      <div className="oc-ch-wrap">
        <span className="oc-ch-eyebrow">Also from Liivv</span>
        <h2>Ostomy is one of the things we support</h2>
        <p className="oc-ch-discover-lead">
          If something else is part of your everyday — yours or someone you care for — there is a
          chapter for that too.
        </p>
        <div className="oc-ch-discover-grid">
          {others.map((door) => (
            <a className="oc-ch-discover-card" href={door.href ?? undefined} key={door.id}>
              <span className="oc-ch-discover-title">{door.title}</span>
              <span className="oc-ch-discover-body">{door.body}</span>
            </a>
          ))}
          <a className="oc-ch-discover-card is-hub" href="/liivv-health">
            <span className="oc-ch-discover-title">See everything in Liivv Health</span>
            <span className="oc-ch-discover-body">Eleven areas of care, with more on the way.</span>
          </a>
        </div>
      </div>
    </section>
  );
}

function GovernanceBlock({
  governance,
  citations,
}: {
  governance: Governance;
  citations?: Citation[];
}) {
  // Byline is suppressed unless a named reviewer AND a valid date both exist, so
  // an unreviewed chapter can never imply clinical sign-off it has not had.
  const reviewedOn = governance.reviewedOn ? formatReviewDate(governance.reviewedOn) : null;
  const showByline = Boolean(governance.reviewedBy) && Boolean(reviewedOn);

  return (
    <section className="oc-ch-governance rounded-top">
      <div className="oc-ch-wrap">
        <div className="oc-ch-governance-inner">
          {showByline ? (
            <p className="oc-ch-review">
              Clinically reviewed by{' '}
              <strong>
                {governance.reviewedBy}
                {governance.credential ? `, ${governance.credential}` : ''}
              </strong>{' '}
              · Last reviewed {reviewedOn}
            </p>
          ) : null}

          <p className="oc-ch-disclaimer">{governance.disclaimer}</p>

          {citations?.length ? (
            <div className="oc-ch-sources">
              <h2>Where this comes from</h2>
              <ul>
                {citations.map((citation) => (
                  <li key={citation.href}>
                    <a href={citation.href} rel="noopener noreferrer" target="_blank">
                      {citation.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function ChapterPage({ chapter }: { chapter: Chapter }) {
  const { prev, next } = getChapterNeighbors(chapter.slug);
  const nextHref = next ? chapterHref(next.slug) : `${LANDING_HREF}#where-are-you`;
  const chapterIndex = CHAPTERS.findIndex((item) => item.slug === chapter.slug);

  return (
    <div id="oc-chapter" style={{ ['--chapter-accent' as string]: chapter.accent }}>
      <section className="oc-ch-hero">
        <div className="oc-ch-hero-bg">
          <img alt="" decoding="async" src={chapter.heroImage} />
        </div>
        <div aria-hidden className="oc-ch-hero-veil" />
        <div className="oc-ch-hero-inner">
          <span className="oc-ch-kicker">Ostomy Care · Chapter {chapter.chapterWord}</span>
          <p aria-hidden className="oc-ch-num">
            {chapter.num}
          </p>
          <h1>{chapter.title}</h1>
          <p className="oc-ch-hero-lead">{chapter.heroBody}</p>
          <div className="oc-ch-hero-actions">
            <a className="oc-ch-btn oc-ch-btn-soft" href="#chapter-care">
              Read this chapter
            </a>
            <a className="oc-ch-btn oc-ch-btn-ghost-light" href={chapter.pharmacist.href}>
              Ask a pharmacist
            </a>
          </div>
          <div aria-hidden className="oc-ch-progress">
            {CHAPTERS.map((item, index) => (
              <span className={index === chapterIndex ? 'is-current' : undefined} key={item.slug} />
            ))}
          </div>
        </div>
      </section>

      <section className="oc-ch-journal rounded-top" id="chapter-pulse">
        <div className="oc-ch-journal-grid">
          <article className="oc-ch-note">
            <span className="oc-ch-note-label">The Focus</span>
            <p>{chapter.focus}</p>
          </article>
          <article className="oc-ch-note is-vibe">
            <span className="oc-ch-note-label">The Liivv Vibe</span>
            <p>{chapter.vibe}</p>
          </article>
        </div>
      </section>

      {chapter.urgent ? <UrgentBlock urgent={chapter.urgent} /> : null}

      <section className="oc-ch-care rounded-top" id="chapter-care">
        <div className="oc-ch-wrap">
          <header className="oc-ch-care-head">
            <span className="oc-ch-eyebrow">{chapter.categoriesIntro.eyebrow}</span>
            <h2>{chapter.categoriesIntro.heading}</h2>
            <p>{chapter.categoriesIntro.body}</p>
          </header>
          <div className="oc-ch-rows">
            {chapter.categories.map((card, index) => (
              <CategoryRow card={card} index={index} key={card.title} />
            ))}
          </div>
        </div>
      </section>

      {chapter.programsBand ? (
        <section className="oc-ch-programs rounded-top">
          <div className="oc-ch-wrap">
            {chapter.programsBand.heading ? (
              <header className="oc-ch-care-head">
                <span className="oc-ch-eyebrow">Soft map</span>
                <h2>{chapter.programsBand.heading}</h2>
              </header>
            ) : null}
            <div className="oc-ch-programs-grid">
              {chapter.programsBand.cards.map((card, index) => (
                <article className="oc-ch-program" key={card.heading}>
                  <span className="oc-ch-program-index">{String(index + 1).padStart(2, '0')}</span>
                  <h3>{card.heading}</h3>
                  <p>{card.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {chapter.resources?.length ? (
        <section className="oc-ch-resources rounded-top" id="chapter-resources">
          <div className="oc-ch-wrap">
            <header className="oc-ch-res-intro">
              <span className="oc-ch-eyebrow">Outside these pages</span>
              <h2>Where to go from here</h2>
              <p>
                These are run by patient organisations, specialist nurses, and government programs —
                not by Liivv. We link out because they do this better than a shop could.
              </p>
            </header>
            {chapter.resources.map((group) => (
              <ResourceGroupBlock group={group} key={group.heading} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="oc-ch-care-cta rounded-top">
        <div className="oc-ch-wrap">
          <div className="oc-ch-care-panel">
            <div className="oc-ch-care-media">
              <img alt="" src={chapter.pharmacist.image} />
            </div>
            <div className="oc-ch-care-copy">
              <span className="oc-ch-eyebrow">{chapter.pharmacist.eyebrow}</span>
              <h2>{chapter.pharmacist.heading}</h2>
              <p>{chapter.pharmacist.body}</p>
              <a className="oc-ch-btn oc-ch-btn-soft" href={chapter.pharmacist.href}>
                {chapter.pharmacist.cta}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="oc-ch-map rounded-top">
        <div className="oc-ch-wrap">
          <span className="oc-ch-eyebrow">Path</span>
          <h2>All three chapters</h2>
          <div aria-label="Chapter navigation" className="oc-ch-map-rail">
            {CHAPTERS.map((item) => {
              const active = item.slug === chapter.slug;

              return (
                <a
                  aria-current={active ? 'page' : undefined}
                  className={active ? 'is-active' : undefined}
                  href={chapterHref(item.slug)}
                  key={item.slug}
                >
                  <span className="oc-ch-map-num">{item.num}</span>
                  <span>{item.title}</span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <section className="oc-ch-close rounded-top">
        <div className="oc-ch-close-bg">
          <img alt="" src={chapter.heroImage} />
        </div>
        <div aria-hidden className="oc-ch-close-veil" />
        <div className="oc-ch-close-inner">
          <span className="oc-ch-eyebrow">Keep going</span>
          <h2>{chapter.closing.heading}</h2>
          <p>{chapter.closing.body}</p>
          <div className="oc-ch-close-cta">
            <a className="oc-ch-btn oc-ch-btn-soft" href={LANDING_HREF}>
              Back to Ostomy Care page
            </a>
            <a className="oc-ch-btn oc-ch-btn-ghost-light" href={nextHref}>
              {chapter.nextLabel}
            </a>
          </div>
          {prev ? (
            <p className="oc-ch-prev">
              <a href={chapterHref(prev.slug)}>← {prev.title}</a>
            </p>
          ) : null}
        </div>
      </section>

      <DiscoveryBand />

      <GovernanceBlock citations={chapter.citations} governance={chapter.governance} />
    </div>
  );
}
