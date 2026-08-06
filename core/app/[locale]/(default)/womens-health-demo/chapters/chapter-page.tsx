'use client';

import type { Chapter } from './chapters-data';
import { CHAPTERS, LANDING_HREF, chapterHref, getChapterNeighbors } from './chapters-data';

import './chapter-page.css';

function Pic({ src, className = '', alt = '' }: { src: string; className?: string; alt?: string }) {
  return (
    <div aria-hidden={alt === '' || undefined} className={`wh-ch-pic ${className}`.trim()}>
      <img alt={alt} src={src} />
    </div>
  );
}

function renderBadge(text?: string) {
  if (!text) return null;
  return <span className="wh-ch-soon">{text}</span>;
}

export function ChapterPage({ chapter }: { chapter: Chapter }) {
  const { prev, next } = getChapterNeighbors(chapter.slug);
  const nextHref = next ? chapterHref(next.slug) : `${LANDING_HREF}#find-your-chapter`;
  const growLayout = chapter.slug === 'grow-and-recover';

  return (
    <div id="wh-chapter" style={{ ['--chapter-accent' as string]: chapter.accent }}>
      <section className="wh-ch-hero">
        <Pic className="wh-ch-hero-bg" src={chapter.heroImage} />
        <a className="wh-ch-back" href={LANDING_HREF}>
          ← Women&apos;s Health &amp; Wellness
        </a>
        <div className="wh-ch-hero-inner">
          <span className="wh-ch-eyebrow">Liivv Women · Chapter {chapter.chapterWord}</span>
          <p className="wh-ch-num" aria-hidden>
            {chapter.num}
          </p>
          <h1>{chapter.title}</h1>
          <p>{chapter.heroBody}</p>
        </div>
      </section>

      <section className="wh-ch-meta wh-ch-rounded">
        <div className="wh-ch-meta-grid">
          <div>
            <h2>The Focus</h2>
            <p>{chapter.focus}</p>
          </div>
          <div>
            <h2>The Liivv Vibe</h2>
            <p>{chapter.vibe}</p>
          </div>
        </div>
      </section>

      <section className="wh-ch-categories">
        <div className="wh-ch-container">
          <span className="wh-ch-eyebrow">{chapter.categoriesIntro.eyebrow}</span>
          <h2>{chapter.categoriesIntro.heading}</h2>
          <p className="wh-ch-intro">{chapter.categoriesIntro.body}</p>

          <div className={`wh-ch-cat-grid${growLayout ? ' wh-ch-cat-grid--grow' : ''}`}>
            {chapter.categories.map((card) => (
              <article className="wh-ch-cat" key={card.title}>
                {card.group ? <span className="wh-ch-group">{card.group}</span> : null}
                <Pic src={card.image} />
                <h3>
                  {card.title}
                  {renderBadge(card.badge)}
                </h3>
                {card.items ? (
                  <ul>
                    {card.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
                {card.sections?.map((section) => (
                  <div className="wh-ch-subsection" key={section.heading}>
                    <h4>{section.heading}</h4>
                    <ul>
                      {section.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    {section.note ? <p className="wh-ch-note">{section.note}</p> : null}
                  </div>
                ))}
                {card.note ? <p className="wh-ch-note">{card.note}</p> : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      {chapter.programsBand ? (
        <section className="wh-ch-programs">
          <div className="wh-ch-container wh-ch-programs-grid">
            {chapter.programsBand.cards.map((card) => (
              <article className="wh-ch-program" key={card.heading}>
                <h3>{card.heading}</h3>
                <p>{card.body}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="wh-ch-pharmacist wh-ch-rounded">
        <div className="wh-ch-container wh-ch-pharmacist-grid">
          <Pic src={chapter.pharmacist.image} />
          <div>
            <span className="wh-ch-eyebrow">{chapter.pharmacist.eyebrow}</span>
            <h2>{chapter.pharmacist.heading}</h2>
            <p>{chapter.pharmacist.body}</p>
            <a className="wh-ch-btn wh-ch-btn-white" href={chapter.pharmacist.href}>
              {chapter.pharmacist.cta}
            </a>
          </div>
        </div>
      </section>

      <section className="wh-ch-nav">
        <div className="wh-ch-container">
          <p className="wh-ch-eyebrow">All chapters</p>
          <div className="wh-ch-nav-grid">
            {CHAPTERS.map((item) => (
              <a
                aria-current={item.slug === chapter.slug ? 'page' : undefined}
                className={item.slug === chapter.slug ? 'is-active' : undefined}
                href={chapterHref(item.slug)}
                key={item.slug}
              >
                <span>{item.num}</span>
                {item.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="wh-ch-closing">
        <Pic className="wh-ch-closing-bg" src={chapter.heroImage} />
        <div className="wh-ch-container">
          <h2>{chapter.closing.heading}</h2>
          <p>{chapter.closing.body}</p>
          <div className="wh-ch-closing-cta">
            <a className="wh-ch-btn wh-ch-btn-white" href={LANDING_HREF}>
              Back to Women&apos;s Health
            </a>
            <a className="wh-ch-btn wh-ch-btn-ghost" href={nextHref}>
              {chapter.nextLabel}
            </a>
          </div>
          {prev ? (
            <p className="wh-ch-prev">
              <a href={chapterHref(prev.slug)}>← {prev.title}</a>
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
