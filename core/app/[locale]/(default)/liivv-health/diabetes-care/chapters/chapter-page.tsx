'use client';

import type { CategoryCard, Chapter } from './chapters-data';
import {
  CHAPTERS,
  JOURNEY_HUB_HREF,
  LANDING_HREF,
  PATH_CHAPTERS,
  chapterHref,
  getChapterNeighbors,
} from './chapters-data';

import './chapter-page.css';

function CategoryRow({ card, index }: { card: CategoryCard; index: number }) {
  const inner = (
    <>
      <span aria-hidden className="dc-ch-row-index">
        {String(index + 1).padStart(2, '0')}
      </span>
      <div>
        {card.group ? <span className="dc-ch-group">{card.group}</span> : null}
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
          <div className="dc-ch-subsection" key={section.heading}>
            <h4>{section.heading}</h4>
            <ul>
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {section.note ? <p className="dc-ch-row-note">{section.note}</p> : null}
          </div>
        ))}
        {card.note ? <p className="dc-ch-row-note">{card.note}</p> : null}
        {card.href ? <span className="dc-ch-row-go">Learn more →</span> : null}
      </div>
    </>
  );

  if (card.href) {
    return (
      <a className="dc-ch-row" href={card.href}>
        {inner}
      </a>
    );
  }

  return <article className="dc-ch-row">{inner}</article>;
}

export function ChapterPage({ chapter }: { chapter: Chapter }) {
  const isPath = chapter.kind === 'path';
  const mapChapters = isPath ? PATH_CHAPTERS : CHAPTERS;
  const backHref = isPath ? JOURNEY_HUB_HREF : LANDING_HREF;
  const backLabel = isPath ? 'Your Diabetes Journey' : 'Diabetes Care';
  const { prev, next } = getChapterNeighbors(chapter.slug);
  const nextHref = next
    ? chapterHref(next.slug)
    : isPath
      ? JOURNEY_HUB_HREF
      : `${LANDING_HREF}#where-are-you`;
  const chapterIndex = mapChapters.findIndex((item) => item.slug === chapter.slug);

  return (
    <div id="dc-chapter" style={{ ['--chapter-accent' as string]: chapter.accent }}>
      <section className="dc-ch-hero">
        <div className="dc-ch-hero-bg">
          <img alt="" decoding="async" src={chapter.heroImage} />
        </div>
        <div aria-hidden className="dc-ch-hero-veil" />
        <div className="dc-ch-hero-inner">
          <span className="dc-ch-kicker">
            {isPath
              ? `Your Diabetes Journey · Path ${chapter.chapterWord}`
              : `Diabetes Care · Chapter ${chapter.chapterWord}`}
          </span>
          <p aria-hidden className="dc-ch-num">
            {chapter.num}
          </p>
          <h1>{chapter.title}</h1>
          <p className="dc-ch-hero-lead">{chapter.heroBody}</p>
          <div className="dc-ch-hero-actions">
            <a className="dc-ch-btn dc-ch-btn-soft" href="#chapter-care">
              Read this chapter
            </a>
            <a className="dc-ch-btn dc-ch-btn-ghost-light" href={chapter.pharmacist.href}>
              Ask a pharmacist
            </a>
          </div>
          <div aria-hidden className="dc-ch-progress">
            {mapChapters.map((item, index) => (
              <span className={index === chapterIndex ? 'is-current' : undefined} key={item.slug} />
            ))}
          </div>
        </div>
      </section>

      <section className="dc-ch-journal rounded-top" id="chapter-pulse">
        <div className="dc-ch-journal-grid">
          <article className="dc-ch-note">
            <span className="dc-ch-note-label">The Focus</span>
            <p>{chapter.focus}</p>
          </article>
          <article className="dc-ch-note is-vibe">
            <span className="dc-ch-note-label">The Liivv Vibe</span>
            <p>{chapter.vibe}</p>
          </article>
        </div>
      </section>

      <section className="dc-ch-care rounded-top" id="chapter-care">
        <div className="dc-ch-wrap">
          <header className="dc-ch-care-head">
            <span className="dc-ch-eyebrow">{chapter.categoriesIntro.eyebrow}</span>
            <h2>{chapter.categoriesIntro.heading}</h2>
            <p>{chapter.categoriesIntro.body}</p>
          </header>
          <div className="dc-ch-rows">
            {chapter.categories.map((card, index) => (
              <CategoryRow card={card} index={index} key={card.title} />
            ))}
          </div>
        </div>
      </section>

      {chapter.programsBand ? (
        <section className="dc-ch-programs rounded-top">
          <div className="dc-ch-wrap">
            {chapter.programsBand.heading ? (
              <header className="dc-ch-care-head">
                <span className="dc-ch-eyebrow">Soft map</span>
                <h2>{chapter.programsBand.heading}</h2>
              </header>
            ) : null}
            <div className="dc-ch-programs-grid">
              {chapter.programsBand.cards.map((card, index) => (
                <article className="dc-ch-program" key={card.heading}>
                  <span className="dc-ch-program-index">{String(index + 1).padStart(2, '0')}</span>
                  <h3>{card.heading}</h3>
                  <p>{card.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="dc-ch-care-cta rounded-top">
        <div className="dc-ch-wrap">
          <div className="dc-ch-care-panel">
            <div className="dc-ch-care-media">
              <img alt="" src={chapter.pharmacist.image} />
            </div>
            <div className="dc-ch-care-copy">
              <span className="dc-ch-eyebrow">{chapter.pharmacist.eyebrow}</span>
              <h2>{chapter.pharmacist.heading}</h2>
              <p>{chapter.pharmacist.body}</p>
              <a className="dc-ch-btn dc-ch-btn-soft" href={chapter.pharmacist.href}>
                {chapter.pharmacist.cta}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="dc-ch-map rounded-top">
        <div className="dc-ch-wrap">
          <span className="dc-ch-eyebrow">Path</span>
          <h2>{isPath ? 'All four paths' : 'All four chapters'}</h2>
          <div aria-label="Chapter navigation" className="dc-ch-map-rail">
            {mapChapters.map((item) => {
              const active = item.slug === chapter.slug;
              return (
                <a
                  aria-current={active ? 'page' : undefined}
                  className={active ? 'is-active' : undefined}
                  href={chapterHref(item.slug)}
                  key={item.slug}
                >
                  <span className="dc-ch-map-num">{item.num}</span>
                  <span>{item.title}</span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <section className="dc-ch-close rounded-top">
        <div className="dc-ch-close-bg">
          <img alt="" src={chapter.heroImage} />
        </div>
        <div aria-hidden className="dc-ch-close-veil" />
        <div className="dc-ch-close-inner">
          <span className="dc-ch-eyebrow">Keep going</span>
          <h2>{chapter.closing.heading}</h2>
          <p>{chapter.closing.body}</p>
          <div className="dc-ch-close-cta">
            <a className="dc-ch-btn dc-ch-btn-soft" href={backHref}>
              Back to {isPath ? backLabel : 'Diabetes Care page'}
            </a>
            <a className="dc-ch-btn dc-ch-btn-ghost-light" href={nextHref}>
              {chapter.nextLabel}
            </a>
          </div>
          {prev ? (
            <p className="dc-ch-prev">
              <a href={chapterHref(prev.slug)}>← {prev.title}</a>
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
