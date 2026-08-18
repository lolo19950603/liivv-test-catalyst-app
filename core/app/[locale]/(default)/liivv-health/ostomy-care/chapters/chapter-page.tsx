'use client';

import type { CategoryCard, Chapter } from './chapters-data';
import { CHAPTERS, LANDING_HREF, chapterHref, getChapterNeighbors } from './chapters-data';

import './chapter-page.css';

/*
 * Ostomy chapter page — soft journal / path layout (not Women's Health chapter chrome).
 */

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
    </div>
  );
}
