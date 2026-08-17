'use client';

import type { CategoryCard, Chapter } from './chapters-data';
import { CHAPTERS, LANDING_HREF, chapterHref, getChapterNeighbors } from './chapters-data';
import { useWhMotion } from '../use-wh-motion';

import './chapter-page.css';
import '../wh-motion.css';

/*
 * =============================================================================
 * CHAPTER PAGE — CONTENT MAP
 * =============================================================================
 * Routes: /liivv-health/womens-health/chapters/[slug]
 *
 * Layout lives in this file. Almost all copy lives in:
 *   ./chapters-data.ts  ← edit chapter titles, focus, vibe, categories, etc.
 *
 * Search "SECTION N —" below to jump to each layout block.
 * =============================================================================
 */

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

/** Pick a proportional grid from the total category count. */
function categoryGridClass(count: number) {
  if (count <= 1) return 'wh-ch-cat-grid wh-ch-cat-grid--cols-1';
  if (count === 2 || count === 4) return 'wh-ch-cat-grid wh-ch-cat-grid--cols-2';
  return 'wh-ch-cat-grid wh-ch-cat-grid--cols-3';
}

function CategoryCardView({ card, index }: { card: CategoryCard; index: number }) {
  return (
    <article className="wh-ch-cat" style={{ ['--stagger' as string]: index }}>
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
  );
}

export function ChapterPage({ chapter }: { chapter: Chapter }) {
  const { prev, next } = getChapterNeighbors(chapter.slug);
  const nextHref = next ? chapterHref(next.slug) : `${LANDING_HREF}#find-your-chapter`;
  const { rootClassName } = useWhMotion('wh-chapter');
  const chapterIndex = CHAPTERS.findIndex((item) => item.slug === chapter.slug);
  const categories = chapter.categories;
  const categoryCount = categories.length;
  const showFeaturedSolo = categoryCount === 1;
  const featured = showFeaturedSolo ? categories[0] : null;

  return (
    <div className={rootClassName} id="wh-chapter" style={{ ['--chapter-accent' as string]: chapter.accent }}>
      {/* =====================================================================
          SECTION 1 — HERO
          Copy from chapters-data: title, heroBody, chapterWord, num, heroImage
          CTA labels below are edited inline.
          ===================================================================== */}
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

      {/* =====================================================================
          SECTION 2 — FOCUS + VIBE PULSE
          Anchor: #chapter-pulse
          Copy from chapters-data: focus, vibe
          Card labels ("The Focus" / "The Liivv Vibe") edited inline.
          ===================================================================== */}
      <section className="wh-ch-pulse wh-ch-rounded" id="chapter-pulse">
        <div className="wh-ch-container wh-ch-pulse-grid" data-reveal data-reveal-stagger>
          <article className="wh-ch-pulse-card" style={{ ['--stagger' as string]: 0 }}>
            <span className="wh-ch-pulse-label">The Focus</span>
            <p>{chapter.focus}</p>
          </article>
          <article className="wh-ch-pulse-card wh-ch-pulse-card--accent" style={{ ['--stagger' as string]: 1 }}>
            <span className="wh-ch-pulse-label">The Liivv Vibe</span>
            <p>{chapter.vibe}</p>
          </article>
        </div>
      </section>

      {/* =====================================================================
          SECTION 3 — CARE CATEGORIES
          Anchor: #chapter-care
          Copy from chapters-data: categoriesIntro, categories[]
          Layout adapts to count: 1 featured · 2/4 → 2-col · 3/5/6+ → 3-col
          (last row centers when incomplete).
          ===================================================================== */}
      <section className="wh-ch-categories" id="chapter-care">
        <div className="wh-ch-container">
          <header className="wh-ch-section-head" data-reveal>
            <span className="wh-ch-eyebrow">{chapter.categoriesIntro.eyebrow}</span>
            <h2>{chapter.categoriesIntro.heading}</h2>
            <p className="wh-ch-intro">{chapter.categoriesIntro.body}</p>
          </header>

          {featured ? (
            <article className="wh-ch-feature" data-reveal>
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
          ) : (
            <div className={categoryGridClass(categoryCount)} data-reveal data-reveal-stagger>
              {categories.map((card, index) => (
                <CategoryCardView card={card} index={index} key={card.title} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =====================================================================
          SECTION 4 — PROGRAMS BAND (optional — only some chapters)
          Copy from chapters-data: programsBand
          Eyebrow "Programs" edited inline.
          ===================================================================== */}
      {chapter.programsBand ? (
        <section className="wh-ch-programs">
          <div className="wh-ch-container">
            {chapter.programsBand.heading ? (
              <header className="wh-ch-section-head wh-ch-section-head--left" data-reveal>
                <span className="wh-ch-eyebrow">Programs</span>
                <h2>{chapter.programsBand.heading}</h2>
              </header>
            ) : null}
            <div className="wh-ch-programs-grid" data-reveal data-reveal-stagger>
              {chapter.programsBand.cards.map((card, index) => (
                <article
                  className="wh-ch-program"
                  key={card.heading}
                  style={{ ['--stagger' as string]: index }}
                >
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

      {/* =====================================================================
          SECTION 5 — PHARMACIST CTA
          Copy from chapters-data: pharmacist (eyebrow, heading, body, cta, image)
          ===================================================================== */}
      <section className="wh-ch-pharmacist wh-ch-rounded" data-reveal>
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

      {/* =====================================================================
          SECTION 6 — JOURNEY MAP / ALL CHAPTERS NAV
          Chapter titles come from CHAPTERS in chapters-data.ts
          "Journey map" / "All six chapters" edited inline.
          ===================================================================== */}
      <section className="wh-ch-nav" data-reveal>
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

      {/* =====================================================================
          SECTION 7 — CLOSING
          Copy from chapters-data: closing, nextLabel
          Eyebrow + "Back to Women's Health" CTA edited inline.
          ===================================================================== */}
      <section className="wh-ch-closing" data-reveal>
        <Pic className="wh-ch-closing-bg" src={chapter.heroImage} />
        <div className="wh-ch-closing-veil" aria-hidden />
        <div className="wh-ch-container">
          <span className="wh-ch-eyebrow">Keep going</span>
          <h2>{chapter.closing.heading}</h2>
          <p>{chapter.closing.body}</p>
          <div className="wh-ch-closing-cta">
            <a className="wh-ch-btn wh-ch-btn-white" href={LANDING_HREF}>
              Back to Women&apos;s Health page
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
