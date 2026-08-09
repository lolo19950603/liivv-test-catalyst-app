'use client';

import { useEffect, useState } from 'react';

import type { Chapter } from './chapters-data';
import { CHAPTERS, LANDING_HREF, chapterHref, getChapterNeighbors } from './chapters-data';

import './chapter-page.css';

function Pic({
  src,
  className = '',
  alt = '',
  priority = false,
}: {
  src: string;
  className?: string;
  alt?: string;
  priority?: boolean;
}) {
  return (
    <div aria-hidden={alt === '' || undefined} className={`wh-ch-pic ${className}`.trim()}>
      <img alt={alt} decoding="async" loading={priority ? 'eager' : 'lazy'} src={src} />
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
  const [scrolled, setScrolled] = useState(false);
  const chapterIndex = CHAPTERS.findIndex((item) => item.slug === chapter.slug);
  const [featured, ...restCategories] = chapter.categories;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div id="wh-chapter" style={{ ['--chapter-accent' as string]: chapter.accent }}>
      <a className={`wh-ch-back${scrolled ? ' is-scrolled' : ''}`} href={LANDING_HREF}>
        ← Women&apos;s Health
      </a>

      <section className="wh-ch-hero">
        <Pic className="wh-ch-hero-bg" priority src={chapter.heroImage} />
        <div className="wh-ch-hero-veil" aria-hidden />
        <div className="wh-ch-hero-inner">
          <div className="wh-ch-hero-copy">
            <span className="wh-ch-eyebrow wh-ch-hero-kicker">
              Liivv Women · Chapter {chapter.chapterWord}
            </span>
            <p className="wh-ch-num" aria-hidden>
              {chapter.num}
            </p>
            <h1>{chapter.title}</h1>
            <p className="wh-ch-hero-lead">{chapter.heroBody}</p>
            <div className="wh-ch-hero-actions">
              <a className="wh-ch-btn wh-ch-btn-light" href="#chapter-care">
                Explore this chapter
              </a>
              <a className="wh-ch-btn wh-ch-btn-ghost" href={chapter.pharmacist.href}>
                Ask a pharmacist
              </a>
            </div>
          </div>
          <div aria-hidden className="wh-ch-hero-progress">
            {CHAPTERS.map((item, index) => (
              <span
                className={index === chapterIndex ? 'is-current' : undefined}
                key={item.slug}
                style={{ ['--i' as string]: index }}
              />
            ))}
          </div>
        </div>
        <a aria-label="Scroll to chapter details" className="wh-ch-scroll" href="#chapter-pulse">
          <span />
        </a>
      </section>

      <section className="wh-ch-pulse wh-ch-rounded" id="chapter-pulse">
        <div className="wh-ch-container wh-ch-pulse-grid">
          <article className="wh-ch-pulse-card">
            <span className="wh-ch-pulse-label">The Focus</span>
            <p>{chapter.focus}</p>
          </article>
          <article className="wh-ch-pulse-card wh-ch-pulse-card--accent">
            <span className="wh-ch-pulse-label">The Liivv Vibe</span>
            <p>{chapter.vibe}</p>
          </article>
        </div>
      </section>

      <section className="wh-ch-categories" id="chapter-care">
        <div className="wh-ch-container">
          <header className="wh-ch-section-head">
            <span className="wh-ch-eyebrow">{chapter.categoriesIntro.eyebrow}</span>
            <h2>{chapter.categoriesIntro.heading}</h2>
            <p className="wh-ch-intro">{chapter.categoriesIntro.body}</p>
          </header>

          {featured ? (
            <article className="wh-ch-feature">
              <Pic className="wh-ch-feature-media" src={featured.image} />
              <div className="wh-ch-feature-copy">
                {featured.group ? <span className="wh-ch-group">{featured.group}</span> : null}
                <h3>
                  {featured.title}
                  {renderBadge(featured.badge)}
                </h3>
                {featured.items ? (
                  <ul>
                    {featured.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
                {featured.sections?.map((section) => (
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
                {featured.note ? <p className="wh-ch-note">{featured.note}</p> : null}
              </div>
            </article>
          ) : null}

          <div className={`wh-ch-cat-grid${growLayout ? ' wh-ch-cat-grid--grow' : ''}`}>
            {restCategories.map((card, index) => (
              <article
                className={`wh-ch-cat${index % 3 === 0 ? ' wh-ch-cat--tall' : ''}`}
                key={card.title}
                style={{ ['--stagger' as string]: `${index * 40}ms` }}
              >
                {card.group ? <span className="wh-ch-group">{card.group}</span> : null}
                <Pic src={card.image} />
                <div className="wh-ch-cat-body">
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
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {chapter.programsBand ? (
        <section className="wh-ch-programs">
          <div className="wh-ch-container">
            {chapter.programsBand.heading ? (
              <header className="wh-ch-section-head wh-ch-section-head--left">
                <span className="wh-ch-eyebrow">Programs</span>
                <h2>{chapter.programsBand.heading}</h2>
              </header>
            ) : null}
            <div className="wh-ch-programs-grid">
              {chapter.programsBand.cards.map((card, index) => (
                <article className="wh-ch-program" key={card.heading}>
                  <span aria-hidden className="wh-ch-program-index">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3>{card.heading}</h3>
                  <p>{card.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="wh-ch-pharmacist wh-ch-rounded">
        <div className="wh-ch-container wh-ch-pharmacist-grid">
          <div className="wh-ch-pharmacist-media">
            <Pic src={chapter.pharmacist.image} />
            <span aria-hidden className="wh-ch-pharmacist-glow" />
          </div>
          <div className="wh-ch-pharmacist-copy">
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
          <div className="wh-ch-nav-head">
            <p className="wh-ch-eyebrow">Journey map</p>
            <h2>All six chapters</h2>
          </div>
          <div className="wh-ch-nav-rail" aria-label="Chapter navigation">
            {CHAPTERS.map((item) => {
              const active = item.slug === chapter.slug;
              return (
                <a
                  aria-current={active ? 'page' : undefined}
                  className={active ? 'is-active' : undefined}
                  href={chapterHref(item.slug)}
                  key={item.slug}
                >
                  <span className="wh-ch-nav-num">{item.num}</span>
                  <span className="wh-ch-nav-title">{item.title}</span>
                  <span aria-hidden className="wh-ch-nav-dot" />
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <section className="wh-ch-closing">
        <Pic className="wh-ch-closing-bg" src={chapter.heroImage} />
        <div className="wh-ch-closing-veil" aria-hidden />
        <div className="wh-ch-container">
          <span className="wh-ch-eyebrow">Keep going</span>
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
