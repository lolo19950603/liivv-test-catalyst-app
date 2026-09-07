'use client';

import { useLocale, useMessages, useTranslations } from 'next-intl';
import { type CSSProperties, useId, useMemo, useState } from 'react';

import type { OcCatalogItem } from '../get-oc-catalog';

import { DiscoveryBand, GovernanceBlock, HelpBand } from '../_components/page-furniture';

import { ChapterGame } from './chapter-games';
import { ChapterVisual } from './chapter-visuals';
import {
  type AskRole,
  buildChapters,
  type CategoryCard,
  chapterHref,
  getChapterNeighbors,
  LANDING_HREF,
  type ResourceGroup,
  type UrgentCallout,
} from './chapters-data';
import { LESSON_GUIDES } from './lessons-meta';

import './chapter-page.css';

/*
 * Ostomy chapter page — soft journal / path layout (not Women's Health chapter chrome).
 */

/*
 * The referral chip.
 *
 * Every bullet in this microsite was written to end on a named person to ask —
 * that is the rule that keeps clinical copy referral-shaped rather than
 * instructional, and it is why the content survived its fact-checks. The rule
 * was invisible, buried in the last clause of a sentence. This surfaces it.
 *
 * 'assessment' and 'urgent' render in the warning tone: those two are not
 * "someone you could ask", they are "do not act on this page alone".
 */
function AskChip({ role }: { role: AskRole }) {
  const t = useTranslations('OstomyCare.ui.chapter.ask');
  const loud = role === 'assessment' || role === 'urgent';

  return <span className={loud ? 'oc-ch-ask is-loud' : 'oc-ch-ask'}>{t(role)}</span>;
}

/*
 * Commerce, in its own band.
 *
 * Placement is declared in chapters-meta.ts, not decided here. The test a card
 * has to pass is about its COPY, not its topic: does anything on this card
 * argue against buying something?
 *
 * An earlier version asked the topic question instead, and put a $234 kit named
 * "Peristomal Skin Health & Infection Prevention" under the card that says
 * broken skin "needs an NSWOC to look at it — not a product recommendation from
 * the internet". Six cards are deliberately empty:
 *
 *   Flat or convex                convexity is prescribed after an assessment
 *   Leaks and short wear time     its own note calls rings and pastes an
 *                                 assessment rather than a shopping decision
 *   Sore, itchy, or weeping skin  broken skin needs an NSWOC, not a product
 *   A bulge around the stoma      symptom card
 *   Hernias, lifting and core     belts have not been shown to prevent hernia
 *   Children                      a failing seal is a call to the nurse
 *
 * The band sits after the ask chip so the referral is the last clinical thing
 * said, and it carries its own disclosure rather than borrowing the page's.
 */
function ProductBand({
  ids,
  products,
}: {
  ids: number[];
  products: Record<number, OcCatalogItem>;
}) {
  const t = useTranslations('OstomyCare.ui.chapter');
  const items = ids
    .map((id) => products[id])
    .filter((item): item is OcCatalogItem => Boolean(item));

  if (!items.length) return null;

  return (
    <aside className="oc-ch-shop">
      <span className="oc-ch-shop-label">{t('productsLabel')}</span>
      <ul className="oc-ch-shop-list">
        {items.map((item) => (
          <li key={item.entityId}>
            <a className="oc-ch-shop-card" href={item.path}>
              {item.image ? (
                <img alt="" loading="lazy" src={item.image.src} />
              ) : (
                <span className="oc-ch-shop-blank" />
              )}
              <span className="oc-ch-shop-name">{item.name}</span>
              {item.priceLabel ? <span className="oc-ch-shop-price">{item.priceLabel}</span> : null}
            </a>
          </li>
        ))}
      </ul>
      <p className="oc-ch-shop-note">{t('productsNote')}</p>
    </aside>
  );
}

function CategoryRow({
  card,
  products,
}: {
  card: CategoryCard;
  products: Record<number, OcCatalogItem>;
}) {
  const learn = useTranslations('OstomyCare.ui.chapter.learn');
  const [open, setOpen] = useState(false);
  const moreId = useId();

  const items = card.items ?? [];
  const preview = items.slice(0, 4);
  const rest = items.slice(4);
  const extraSections = items.length ? (card.sections ?? []) : (card.sections?.slice(1) ?? []);
  const firstSection = !items.length ? card.sections?.[0] : undefined;
  const hidden = rest.length + extraSections.length;
  const collapsible = hidden > 0;

  return (
    <article className={open ? 'oc-ch-row is-open' : 'oc-ch-row'}>
      <div>
        <h3>
          {card.title}
          {card.badge ? ` · ${card.badge}` : ''}
        </h3>

        {preview.length ? (
          <ul className="oc-ch-lede-list">
            {preview.map((item, i) => (
              <li key={`${i}-${item}`}>{item}</li>
            ))}
          </ul>
        ) : null}

        {firstSection ? (
          <div className="oc-ch-subsection">
            <h4>{firstSection.heading}</h4>
            <ul>
              {firstSection.items.map((item, i) => (
                <li key={`${i}-${item}`}>{item}</li>
              ))}
            </ul>
            {firstSection.note ? <p className="oc-ch-row-note">{firstSection.note}</p> : null}
          </div>
        ) : null}

        <div className="oc-ch-row-more" hidden={!open} id={moreId}>
          {rest.length ? (
            <ul>
              {rest.map((item, i) => (
                <li key={`${i}-${item}`}>{item}</li>
              ))}
            </ul>
          ) : null}
          {extraSections.map((section) => (
            <div className="oc-ch-subsection" key={section.heading}>
              <h4>{section.heading}</h4>
              <ul>
                {section.items.map((item, i) => (
                  <li key={`${i}-${item}`}>{item}</li>
                ))}
              </ul>
              {section.note ? <p className="oc-ch-row-note">{section.note}</p> : null}
            </div>
          ))}
        </div>

        {card.note ? <p className="oc-ch-row-note">{card.note}</p> : null}

        <div className="oc-ch-row-foot">
          {collapsible ? (
            <button
              aria-controls={moreId}
              aria-expanded={open}
              aria-label={`${open ? learn('hideDetail') : learn('wantDetail')} — ${card.title}`}
              className="oc-ch-toggle"
              onClick={() => setOpen(!open)}
              type="button"
            >
              {open ? learn('hideDetail') : learn('wantDetail')}
            </button>
          ) : null}
          {card.ask ? <AskChip role={card.ask} /> : null}
        </div>

        {card.productIds ? <ProductBand ids={card.productIds} products={products} /> : null}
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
              {urgent.signs.map((sign, i) => (
                <li key={`${i}-${sign}`}>{sign}</li>
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
  const t = useTranslations('OstomyCare.ui.chapter');

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
                {t('opensOnTheirSite')}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/*
 * Lesson path: a sticky jump-nav, then one illustrated lesson at a time.
 * Cards stay mounted so search still sees the full chapter.
 */
function LessonPath({
  slug,
  categories,
  products,
}: {
  slug: string;
  categories: CategoryCard[];
  products: Record<number, OcCatalogItem>;
}) {
  const learn = useTranslations('OstomyCare.ui.chapter.learn');

  const lessons = useMemo(() => {
    const guides = LESSON_GUIDES[slug] ?? {};
    const keys = categories.reduce<string[]>((acc, card) => {
      if (card.groupKey && !acc.includes(card.groupKey)) {
        return [...acc, card.groupKey];
      }

      return acc;
    }, []);

    if (!keys.length) {
      return [
        {
          key: 'all',
          label: learn('allLessons'),
          cards: categories,
          guide: undefined,
        },
      ];
    }

    return keys.map((key) => ({
      key,
      label: categories.find((card) => card.groupKey === key)?.group ?? key,
      cards: categories.filter((card) => card.groupKey === key),
      guide: guides[key],
    }));
  }, [categories, learn, slug]);

  return (
    <>
      {lessons.length > 1 ? (
        <nav aria-label={learn('pathLabel')} className="oc-ch-lesson-nav">
          {lessons.map((lesson, index) => (
            <a href={`#lesson-${lesson.key}`} key={lesson.key}>
              <span className="oc-ch-lesson-num">{String(index + 1).padStart(2, '0')}</span>
              <span>{lesson.label}</span>
              <span className="oc-ch-rail-count">{lesson.cards.length}</span>
            </a>
          ))}
        </nav>
      ) : null}

      {lessons.map((lesson) => (
        <section className="oc-ch-lesson" id={`lesson-${lesson.key}`} key={lesson.key}>
          <header className="oc-ch-lesson-head">
            <span className="oc-ch-eyebrow">{learn('thirtySeconds')}</span>
            <h3>{lesson.label}</h3>
          </header>
          {lesson.guide?.visual ? <ChapterVisual id={lesson.guide.visual} /> : null}
          <div className="oc-ch-rows">
            {lesson.cards.map((card) => (
              <CategoryRow card={card} key={card.title} products={products} />
            ))}
          </div>
          {lesson.guide?.games?.map((gameId) => (
            <ChapterGame id={gameId} key={gameId} />
          ))}
        </section>
      ))}
    </>
  );
}

export function ChapterPage({
  slug,
  products = {},
}: {
  slug: string;
  products?: Record<number, OcCatalogItem>;
}) {
  // Copy comes from the message tree so it can be translated; the structure it
  // is composed with lives in chapters-meta.ts.
  const messages = useMessages();
  const locale = useLocale();
  const t = useTranslations('OstomyCare.ui.chapter');
  const chapters = buildChapters(
    messages.OstomyCare.chapters,
    locale,
    messages.OstomyCare.ui.chapter.groups,
  );
  const { prev, next, chapter } = getChapterNeighbors(chapters, slug);

  // The route already 404s on an unknown slug, so this only guards against a
  // chapter present in chapters-meta.ts but absent from the messages.
  if (!chapter) return null;

  const nextHref = next ? chapterHref(next.slug) : `${LANDING_HREF}#where-are-you`;

  /*
   * The ordinal is structural ('one'..'four' in chapters-meta.ts) but has to
   * read in the page language, or the French kicker says 'Chapitre three'. Read
   * from the message object rather than t(), which cannot type a dynamic key.
   */
  const words: Record<string, string> = messages.OstomyCare.ui.chapter.words;
  const chapterWord = words[chapter.chapterWord] ?? chapter.chapterWord;
  // Derived, not authored — see chapters-data.ts.
  const nextLabel = next ? `${next.title} →` : t('backToChapters');
  const chapterIndex = chapters.findIndex((item) => item.slug === chapter.slug);

  // CSS custom property, typed without an assertion.
  const accentStyle: CSSProperties & Record<string, string> = {
    '--chapter-accent': chapter.accent,
  };

  return (
    <div id="oc-chapter" style={accentStyle}>
      <section className="oc-ch-hero">
        <div className="oc-ch-hero-bg">
          <img alt="" decoding="async" src={chapter.heroImage} />
        </div>
        <div aria-hidden className="oc-ch-hero-veil" />
        <div className="oc-ch-hero-inner">
          <span className="oc-ch-kicker">{t('kicker', { word: chapterWord })}</span>
          <p aria-hidden className="oc-ch-num">
            {chapter.num}
          </p>
          <h1>{chapter.title}</h1>
          <p className="oc-ch-hero-lead">{chapter.heroBody}</p>
          <div className="oc-ch-hero-actions">
            <a className="oc-ch-btn oc-ch-btn-soft" href="#chapter-care">
              {t('readChapter')}
            </a>
            <a className="oc-ch-btn oc-ch-btn-ghost-light" href={chapter.pharmacist.href}>
              {t('askPharmacist')}
            </a>
          </div>
          <div aria-hidden className="oc-ch-progress">
            {chapters.map((item, index) => (
              <span className={index === chapterIndex ? 'is-current' : undefined} key={item.slug} />
            ))}
          </div>
        </div>
      </section>

      <section className="oc-ch-journal rounded-top" id="chapter-pulse">
        <div className="oc-ch-journal-grid">
          <article className="oc-ch-note">
            <span className="oc-ch-note-label">{t('theFocus')}</span>
            <p>{chapter.focus}</p>
          </article>
          <article className="oc-ch-note is-vibe">
            <span className="oc-ch-note-label">{t('theVibe')}</span>
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
          <LessonPath categories={chapter.categories} products={products} slug={chapter.slug} />
        </div>
      </section>

      {chapter.programsBand ? (
        <section className="oc-ch-programs rounded-top">
          <div className="oc-ch-wrap">
            {chapter.programsBand.heading ? (
              <header className="oc-ch-care-head">
                <span className="oc-ch-eyebrow">{t('softMap')}</span>
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
              <span className="oc-ch-eyebrow">{t('resourcesEyebrow')}</span>
              <h2>{t('resourcesHeading')}</h2>
              <p>{t('resourcesIntro')}</p>
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
          <span className="oc-ch-eyebrow">{t('pathEyebrow')}</span>
          <h2>{t('allChapters')}</h2>
          <div aria-label={t('chapterNav')} className="oc-ch-map-rail">
            {chapters.map((item) => {
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
          <span className="oc-ch-eyebrow">{t('keepGoing')}</span>
          <h2>{chapter.closing.heading}</h2>
          <p>{chapter.closing.body}</p>
          <div className="oc-ch-close-cta">
            <a className="oc-ch-btn oc-ch-btn-soft" href={LANDING_HREF}>
              {t('backToLanding')}
            </a>
            <a className="oc-ch-btn oc-ch-btn-ghost-light" href={nextHref}>
              {nextLabel}
            </a>
          </div>
          {prev ? (
            <p className="oc-ch-prev">
              <a href={chapterHref(prev.slug)}>← {prev.title}</a>
            </p>
          ) : null}
        </div>
      </section>

      <HelpBand />

      <DiscoveryBand />

      <GovernanceBlock citations={chapter.citations} governance={chapter.governance} />
    </div>
  );
}
