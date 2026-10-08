/* Twin of ostomy-care/chapters/chapter-page.tsx @3b343c6e — port fixes both ways until Phase 2 */

'use client';

import { useLocale } from 'next-intl';
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';

import { HashTargetScroll } from '../../ostomy-care/_components/hash-target-scroll';
import { ChapterReveal } from '../../ostomy-care/chapters/chapter-reveal';
import { DiscoveryBand, GovernanceBlock, HelpBand } from '../_components/page-furniture';
import { CardSources, SourceChip } from '../_components/source-chip';
import { CONTACT_ANCHOR, SpecialistContact } from '../_components/specialist-contact';
import { CardShop } from '../shop/card-shop';
import { useSite, useSiteMessages, useSiteSources, useSiteT } from '../site-context';
import { lookUpSources } from '../sources';

import { AskChip } from './ask-chip';
import { CardExit, rowLayout, RowMore } from './chapter-disclosure';
import {
  type BandLink,
  buildChapters,
  type CategoryCard,
  type Chapter,
  getChapterNeighbors,
  type ResourceGroup,
  siteChapterMessages,
  type UrgentCallout,
} from './compose';
import { CardText, FrDraftMarker, OutboundLabel } from './figure-parts';
import {
  CardFigures,
  CardRoutes,
  FigureGlyphs,
  isPinnedCard,
  type KindSets,
  showsChapterExit,
  StartHereLine,
  UrgentExit,
  useKindSets,
} from './figures';
import { chapterHref, localeHref } from './hrefs';
import { JourneyGrid } from './journey-layout';
import { JourneyContinueChip, JourneyMemoryProvider } from './journey-memory-context';
import { JourneyBandDots, JourneyPath } from './journey-path';
import { JourneySheet } from './journey-sheet';
import { JourneySpyProvider } from './journey-spy';
import { ResourceShelf } from './resource-shelf';
import { TextSizeControl } from './text-size-control';

/*
 * One stylesheet for every site's chapters. Ostomy's chapter-page.css is
 * imported rather than copied, so the cascade cannot drift between sites; a
 * site's own rules are scoped under `#oc-chapter[data-site='<site>']`.
 */
import '../../ostomy-care/chapters/chapter-page.css';

/*
 * Microsite chapter page — soft journal / path layout, Ostomy's, for the site
 * in SiteProvider.
 *
 * Not here yet, and not drawn on any engine page: the Listen controls (audio is
 * off until a site's audio has its own storage path), and the recovery map and
 * the supply list (Ostomy's own modules). A card's shop band is the site's
 * (SiteConfig.shop and ../shop), drawn under the card's referral chip.
 *
 * The referral chip (AskChip) lives in ./ask-chip.tsx.
 */

function CategoryRow({
  card,
  index,
  exit,
}: {
  card: CategoryCard;
  index: number;
  exit?: Chapter['urgentExit'];
}) {
  const moreId = useId();
  const sets = useKindSets();
  const { lede, rest, noteOutside, noteInMore } = rowLayout(sets, card);

  return (
    <article className="oc-ch-row is-open" id={`card-${card.number}`}>
      <span aria-hidden className="oc-ch-row-thumb">
        <img alt="" loading="lazy" src={card.image} />
        <b>{String(index + 1).padStart(2, '0')}</b>
      </span>
      <div>
        <h3>
          {card.title}
          {card.badge ? ` · ${card.badge}` : ''}
        </h3>

        {lede ? (
          <p className="oc-ch-lede">
            <CardText card={card} text={lede} />
          </p>
        ) : null}

        <CardFigures card={card} exit={exit} />

        {noteOutside && card.note ? (
          <p className="oc-ch-row-note">
            <CardText card={card} text={card.note} />
          </p>
        ) : null}

        <RowMore card={card} id={moreId} noteInMore={noteInMore} rest={rest} />

        <CardRoutes card={card} />

        <CardExit card={card} exit={exit} />

        {/* Engine-only so far (owner note 1, 2026-10-07): Ostomy's twin shows no card sources. */}
        <CardSources card={card} />

        {card.ask ? (
          <div className="oc-ch-row-foot">
            <AskChip role={card.ask} />
          </div>
        ) : null}

        <CardShop card={card} />
      </div>
    </article>
  );
}

/*
 * Red-flag block. Deliberately its own component with its own styling so it can
 * never be mistaken for an ordinary tip, and `role="alert"` is omitted on purpose
 * — this is standing content, not a live announcement. Its id is the site's
 * red-flag anchor, which every urgentExit signpost points at.
 */
function UrgentBlock({ urgent }: { urgent: UrgentCallout }) {
  const { anchors, emergency } = useSite();
  /*
   * Where the site names its emergency number (SiteConfig.emergency), that
   * number in the action line can be tapped to dial. Engine-only so far.
   */
  const at = emergency ? urgent.action.indexOf(emergency.written) : -1;
  const action =
    emergency && at >= 0 ? (
      <>
        {urgent.action.slice(0, at)}
        <a href={`tel:${emergency.tel}`}>{emergency.written}</a>
        {urgent.action.slice(at + emergency.written.length)}
      </>
    ) : (
      urgent.action
    );

  return (
    <section className="oc-ch-urgent rounded-top" id={anchors.redFlags.id}>
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
            <p className="oc-ch-urgent-action">{action}</p>
          </div>
        </aside>
      </div>
    </section>
  );
}

function ResourceGroupBlock({ group }: { group: ResourceGroup }) {
  const t = useSiteT('ui.chapter');

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
 * The plain links under a band card.
 *
 * Same tab, `hrefLang` on the anchor, and the language note inside the link
 * text wherever the page it opens is in the other language — the same treatment
 * every other link out of a chapter gets, so one destination is never described
 * two ways. Each link names the publisher.
 *
 * Nothing wraps them: no card, no thumbnail, no "recommended" styling, and no
 * product anywhere in this band.
 */
function BandLinks({ links }: { links: BandLink[] }) {
  const { gates } = useSite();

  return (
    <>
      <FrDraftMarker gate={gates.features.bandLinks} />
      <ul className="oc-ch-program-links">
        {links.map((link) => (
          <li key={link.href}>
            <a href={link.href} hrefLang={link.hrefLang}>
              <OutboundLabel hrefLang={link.hrefLang} label={link.label} />
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}

/*
 * The band after the cards: short referral or timing cards under one heading.
 *
 * The band is a rescue, not a placement: it prints the chapter's emergency
 * signpost only where no card on the page already does (showsChapterExit), so
 * a band about something else never carries a second copy of the line.
 */
function ProgramsBand({
  band,
  categories,
  exit,
}: {
  band: NonNullable<Chapter['programsBand']>;
  categories: CategoryCard[];
  exit?: Chapter['urgentExit'];
}) {
  const t = useSiteT('ui.chapter');
  const sources = useSiteSources();

  return (
    <section className="oc-ch-programs rounded-top">
      <div className="oc-ch-wrap">
        {exit ? <UrgentExit exit={exit} /> : null}
        {band.heading ? (
          <header className="oc-ch-care-head oc-journey-meadow-head">
            <ChapterReveal variant="clearing">
              <span className="oc-ch-eyebrow">{t('softMap')}</span>
              <h2>{band.heading}</h2>
            </ChapterReveal>
          </header>
        ) : null}
        <div className="oc-ch-programs-grid">
          {band.cards.map((card, index) => {
            /* The chapter card this band card points to, linked where its title is in the body. */
            const target =
              card.card === undefined
                ? undefined
                : categories.find((item) => item.number === card.card);

            return (
              <article className="oc-ch-program" key={card.heading}>
                <span className="oc-ch-program-index">{String(index + 1).padStart(2, '0')}</span>
                <h3>{card.heading}</h3>
                <LinkedIntroBody
                  body={card.body}
                  href={target ? `#card-${target.number}` : undefined}
                  phrase={target?.title}
                />
                {card.links ? <BandLinks links={card.links} /> : null}
              </article>
            );
          })}
        </div>
        {/* The band's own sentences, sourced in the band (owner note 1). Engine-only so far. */}
        {sources && band.sourceIds ? (
          <SourceChip
            className="ms-src-band"
            label={band.heading}
            sources={lookUpSources(sources, band.sourceIds)}
          />
        ) : null}
      </div>
    </section>
  );
}

/*
 * Everything between the cards and the pharmacist panel: the programs band,
 * then the outward resources shelf on the chapters that carry one. Ostomy's
 * recovery map, which takes the band slot on its own chapters, stays with
 * Ostomy.
 */
function ChapterBandSlot({ chapter }: { chapter: Chapter }) {
  const sets = useKindSets();
  const exit = showsChapterExit(sets, chapter.categories) ? undefined : chapter.urgentExit;

  return (
    <>
      {chapter.programsBand ? (
        <ProgramsBand band={chapter.programsBand} categories={chapter.categories} exit={exit} />
      ) : null}
      {chapter.shelf ? <ResourceShelf shelf={chapter.shelf} /> : null}
    </>
  );
}

/*
 * A card that has to occupy the full row, and that must not wait on a fade:
 * an emergency or interactive module (pinned open), or a figure in the
 * `fullWidth` set — the crisis line, the who-to-ask lanes, and any the site
 * adds. Everything else in a group shares one horizontal row.
 */
function readsFullWidth(sets: KindSets, card: CategoryCard) {
  return (
    isPinnedCard(sets, card) ||
    Boolean(card.figures?.some((figure) => sets.fullWidth.has(figure.kind)))
  );
}

interface PlacedCard {
  card: CategoryCard;
  index: number;
}

function groupBands(categories: CategoryCard[], idPrefix: string) {
  const bands: Array<{ label: string; id: string; cards: PlacedCard[] }> = [];

  categories.forEach((card, index) => {
    const label = card.group ?? '';
    const last = bands[bands.length - 1];

    if (last && last.label === label) {
      last.cards.push({ card, index });

      return;
    }

    bands.push({
      label,
      id: `${idPrefix}group-${bands.length + 1}`,
      cards: [{ card, index }],
    });
  });

  return bands;
}

/* Consecutive shelf cards become one strip. A full-width card breaks the strip. */
function bandChunks(sets: KindSets, cards: PlacedCard[]) {
  const chunks: Array<{ kind: 'full' | 'strip'; items: PlacedCard[] }> = [];

  cards.forEach((item) => {
    const full = readsFullWidth(sets, item.card);
    const last = chunks[chunks.length - 1];

    if (!full && last?.kind === 'strip') {
      last.items.push(item);

      return;
    }

    chunks.push({ kind: full ? 'full' : 'strip', items: [item] });
  });

  return chunks;
}

function CardStrip({
  items,
  exit,
  label,
}: {
  items: PlacedCard[];
  exit?: Chapter['urgentExit'];
  label: string;
}) {
  const t = useSiteT('ui.chapter');
  const viewportRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const [index, setIndex] = useState(0);
  const count = items.length;

  const sync = useCallback(() => {
    frameRef.current = null;

    const viewport = viewportRef.current;

    if (!viewport) return;

    const left = viewport.getBoundingClientRect().left;
    let nearest = 0;
    let best = Infinity;

    [...viewport.children].forEach((slide, i) => {
      const distance = Math.abs(slide.getBoundingClientRect().left - left);

      if (distance < best) {
        best = distance;
        nearest = i;
      }
    });

    setIndex((current) => (current === nearest ? current : nearest));
  }, []);

  useEffect(
    () => () => {
      if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  const go = (next: number) => {
    const viewport = viewportRef.current;
    const slide = viewport?.children[next];

    if (!viewport || !(slide instanceof HTMLElement)) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const delta = slide.getBoundingClientRect().left - viewport.getBoundingClientRect().left;

    viewport.scrollBy({ left: delta, behavior: reduce ? 'auto' : 'smooth' });
  };

  if (count < 2) {
    const only = items[0];

    if (!only) return null;

    return (
      <ChapterReveal>
        <CategoryRow card={only.card} exit={exit} index={only.index} />
      </ChapterReveal>
    );
  }

  return (
    <div className="oc-ch-strip">
      <div className="oc-ch-strip-bar">
        <button
          aria-label={t('stripPrev')}
          disabled={index === 0}
          onClick={() => go(index - 1)}
          type="button"
        >
          <span aria-hidden>←</span>
        </button>
        <p className="oc-ch-strip-status">
          {t('stripStatus', { current: String(index + 1), total: String(count) })}
        </p>
        <button
          aria-label={t('stripNext')}
          disabled={index === count - 1}
          onClick={() => go(index + 1)}
          type="button"
        >
          <span aria-hidden>→</span>
        </button>
        <div className="oc-ch-strip-dots">
          {items.map((item, dot) => (
            <button
              aria-current={dot === index ? 'true' : undefined}
              aria-label={item.card.title}
              key={item.card.title}
              onClick={() => go(dot)}
              type="button"
            />
          ))}
        </div>
      </div>
      <div
        aria-label={label || undefined}
        className="oc-ch-strip-viewport"
        onScroll={() => {
          if (frameRef.current != null) return;

          frameRef.current = requestAnimationFrame(sync);
        }}
        ref={viewportRef}
      >
        {items.map((item) => (
          <div className="oc-ch-strip-slide" key={item.card.title}>
            <ChapterReveal>
              <CategoryRow card={item.card} exit={exit} index={item.index} />
            </ChapterReveal>
          </div>
        ))}
      </div>
    </div>
  );
}

function BandCards({
  band,
  exit,
  layout = 'strip',
}: {
  band: ReturnType<typeof groupBands>[number];
  exit?: Chapter['urgentExit'];
  layout?: 'strip' | 'journey';
}) {
  const sets = useKindSets();

  if (layout === 'journey') {
    return <JourneyGrid cards={band.cards} exit={exit} />;
  }

  return (
    <div className="oc-ch-rows">
      {bandChunks(sets, band.cards).map((chunk, chunkIndex) =>
        chunk.kind === 'full' ? (
          <div className="oc-ch-rows" key={`${band.id}-full-${chunkIndex}`}>
            {chunk.items.map((item) => (
              <CategoryRow card={item.card} exit={exit} index={item.index} key={item.card.title} />
            ))}
          </div>
        ) : (
          <CardStrip
            exit={exit}
            items={chunk.items}
            key={`${band.id}-strip-${chunkIndex}`}
            label={band.label}
          />
        ),
      )}
    </div>
  );
}

/*
 * The intro body, with one card's title turned into a link to that card where
 * the meta names one (`introCard`) and the title appears in the body. A
 * referral-band card's body links the same way (`programsBandCards`).
 */
function LinkedIntroBody({ body, phrase, href }: { body: string; phrase?: string; href?: string }) {
  if (!phrase || !href) return <p>{body}</p>;

  const at = body.indexOf(phrase);

  if (at < 0) return <p>{body}</p>;

  return (
    <p>
      {body.slice(0, at)}
      <a href={href}>{phrase}</a>
      {body.slice(at + phrase.length)}
    </p>
  );
}

/*
 * Each group is a full section: sand, then cream, with the group label as the
 * heading and the cards in the bento. The intro heading and body sit in the
 * first band's callout; a chapter whose meta sets `introHeading: false` keeps
 * the body only.
 */
function MajorSections({ chapter }: { chapter: Chapter }) {
  const t = useSiteT('ui.chapter');
  const { idPrefix } = useSite();
  const bands = useMemo(
    () => groupBands(chapter.categories, idPrefix),
    [chapter.categories, idPrefix],
  );
  const labeled = bands.filter((band) => band.label);
  const railed = chapter.rail && labeled.length > 1;
  const introCard =
    chapter.introCard === undefined
      ? undefined
      : chapter.categories.find((card) => card.number === chapter.introCard);
  const pathBands = labeled.map((band) => ({
    id: band.id,
    label: band.label,
    cards: band.cards,
  }));
  const showPath = pathBands.length > 1 || pathBands.some((band) => band.cards.length > 1);
  /* Spine replaces the group rail when the editorial path is on. */
  const showRail = railed && !showPath;

  return (
    <JourneyMemoryProvider slug={chapter.slug}>
      <JourneySpyProvider bands={pathBands}>
        {/* Before the shell: it looks at what follows the shell to know when to step aside. */}
        {showPath ? <JourneySheet /> : null}
        <div className="oc-journey-shell is-cinema">
          {showPath ? (
            <div className="oc-journey-hud-slot">
              <JourneyPath bands={pathBands} />
            </div>
          ) : null}
          <div className="oc-journey-cinema">
            {bands.map((band, index) => (
              <section
                className={index % 2 === 0 ? 'oc-journey-act' : 'oc-journey-act is-alt'}
                id={index === 0 ? 'chapter-care' : band.id}
                key={band.id}
              >
                <header className="oc-journey-act-title oc-journey-gate oc-journey-clearing">
                  <span aria-hidden className="oc-journey-clearing-wash" />
                  <ChapterReveal variant="clearing">
                    <span aria-hidden className="oc-journey-gate-num">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="oc-ch-eyebrow">{t('pathEyebrow')}</span>
                    <h2>{band.label}</h2>
                    {index === 0 ? <JourneyContinueChip cards={chapter.categories} /> : null}
                    {index === 0 ? (
                      <div className="oc-journey-banner oc-journey-banner--wash">
                        {chapter.introHeading ? (
                          <h3 className="oc-journey-banner-title">
                            {chapter.categoriesIntro.heading}
                          </h3>
                        ) : null}
                        <LinkedIntroBody
                          body={chapter.categoriesIntro.body}
                          href={introCard ? `#card-${introCard.number}` : undefined}
                          phrase={introCard?.title}
                        />
                      </div>
                    ) : null}
                    {index === 0 ? <TextSizeControl /> : null}
                  </ChapterReveal>
                  <JourneyBandDots cards={band.cards} label={band.label} />
                </header>
                <div className="oc-journey-act-frames">
                  {index === 0 && showRail ? (
                    <nav aria-label={t('groupJump')} className="oc-ch-rail">
                      {labeled.map((item, itemIndex) => (
                        <a href={itemIndex === 0 ? '#chapter-care' : `#${item.id}`} key={item.id}>
                          {item.label}
                          <span className="oc-ch-rail-count">{item.cards.length}</span>
                        </a>
                      ))}
                    </nav>
                  ) : null}
                  <BandCards band={band} exit={chapter.urgentExit} layout="journey" />
                </div>
              </section>
            ))}
          </div>
        </div>
      </JourneySpyProvider>
    </JourneyMemoryProvider>
  );
}

/*
 * Groups stay in the page, in order. Vertical scroll moves from one group to
 * the next. Inside a group the shelf cards sit in a horizontal snap row, so a
 * twenty-card chapter is eight short rows rather than one long document.
 *
 * Nothing is filtered off. A deep link to #card-N still resolves, and
 * find-in-page still reaches every row. The rail is a set of jump links, not a
 * filter and not a sticky spy — a sticky rail fights thumb-scrolling.
 * Emergency and interactive cards stay full width and outside the row.
 */
function GroupRail({
  categories,
  showRail,
  exit,
}: {
  categories: CategoryCard[];
  showRail: boolean;
  exit?: Chapter['urgentExit'];
}) {
  const t = useSiteT('ui.chapter');
  const { idPrefix } = useSite();
  const bands = useMemo(() => groupBands(categories, idPrefix), [categories, idPrefix]);
  const labeled = bands.filter((band) => band.label);
  const railed = showRail && labeled.length > 1;

  return (
    <>
      {railed ? (
        <nav aria-label={t('groupJump')} className="oc-ch-rail">
          {labeled.map((band) => (
            <a href={`#${band.id}`} key={band.id}>
              {band.label}
              <span className="oc-ch-rail-count">{band.cards.length}</span>
            </a>
          ))}
        </nav>
      ) : null}

      {bands.map((band) => (
        <section className="oc-ch-band" id={band.label ? band.id : undefined} key={band.id}>
          {band.label ? (
            <ChapterReveal>
              <h3 className="oc-ch-band-heading">{band.label}</h3>
            </ChapterReveal>
          ) : null}
          <BandCards band={band} exit={exit} />
        </section>
      ))}
    </>
  );
}

/*
 * A chapter of the site in SiteProvider. The site's own 'use client' wrapper
 * renders this inside the provider; the route passes only the slug, so no
 * config or copy is ever serialised into the page's payload.
 */
export function ChapterPage({ slug }: { slug: string }) {
  // Copy comes from the site's message tree so it can be translated; the
  // structure it is composed with lives in the site's chapters-meta.ts.
  const site = useSite();
  const messages = useSiteMessages();
  const locale = useLocale();
  const t = useSiteT('ui.chapter');
  const registered = useSiteSources();
  const chapters = buildChapters(
    site,
    siteChapterMessages(messages),
    locale,
    messages.ui.chapter.groups,
  );
  const { prev, next, chapter } = getChapterNeighbors(chapters, slug);

  // The route already 404s on an unknown slug, so this only guards against a
  // chapter present in the site's meta but absent from its messages.
  if (!chapter) return null;

  /*
   * Every href below goes through `localeHref`: these are plain <a>, so nothing
   * adds the /fr prefix for them and a bare micro-site path lands a French
   * reader on the English page (./hrefs.ts).
   */
  const landingHref = localeHref(site.basePath, locale);
  const nextHref = next
    ? localeHref(chapterHref(site, next.slug), locale)
    : `${landingHref}#${site.anchors.whereAreYou}`;

  /*
   * The ordinal is structural ('one'..'six' in chapters-meta.ts) but has to
   * read in the page language. Read from the message object rather than t(),
   * which cannot type a dynamic key.
   */
  const words: Record<string, string> = messages.ui.chapter.words;
  const chapterWord = words[chapter.chapterWord] ?? chapter.chapterWord;
  // Derived, not authored — see ./compose.ts.
  const nextLabel = next ? `${next.title} →` : t('backToChapters');
  const chapterIndex = chapters.findIndex((item) => item.slug === chapter.slug);

  // CSS custom property, typed without an assertion.
  const accentStyle: CSSProperties & Record<string, string> = {
    '--chapter-accent': chapter.accent,
  };

  /*
   * `data-chapter` lets a site's own CSS reach one chapter, such as the one
   * band whose last card is an emergency rung. It renders only beside
   * `data-site`, so a site without `rootAttr` (Ostomy) keeps its HTML as it is.
   */
  const chapterAttr = site.rootAttr === undefined ? undefined : chapter.slug;

  return (
    <div
      className="is-journey"
      data-chapter={chapterAttr}
      data-site={site.rootAttr}
      id={site.rootId}
      style={accentStyle}
    >
      {/* Every cross-page link into this chapter names a fragment; see the file. */}
      <HashTargetScroll />
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
          <TextSizeControl />
          <div aria-hidden className="oc-ch-progress">
            {chapters.map((item, index) => (
              <span className={index === chapterIndex ? 'is-current' : undefined} key={item.slug} />
            ))}
          </div>
        </div>
      </section>

      <FigureGlyphs />

      <section className="oc-ch-journal rounded-top" id="chapter-pulse">
        {chapter.startHere ? (
          <div className="oc-ch-starthere">
            <header className="oc-ch-starthere-head">
              <span className="oc-ch-eyebrow">{t('startHere.eyebrow')}</span>
              <h2>{chapter.startHere.heading ?? t('startHere.heading')}</h2>
              <p className="oc-ch-starthere-lede">{chapter.focus}</p>
            </header>
            <StartHereLine startHere={chapter.startHere} />
            {chapter.urgentExit ? <UrgentExit exit={chapter.urgentExit} /> : null}
          </div>
        ) : (
          <div className="oc-ch-journal-grid">
            <article className="oc-ch-note">
              <span className="oc-ch-note-label">{t('theFocus')}</span>
              <p>{chapter.focus}</p>
            </article>
          </div>
        )}
      </section>

      {chapter.urgent ? <UrgentBlock urgent={chapter.urgent} /> : null}

      {chapter.majorSections ? (
        <MajorSections chapter={chapter} />
      ) : (
        <section className="oc-ch-care rounded-top" id="chapter-care">
          <div className="oc-ch-wrap">
            <header className="oc-ch-care-head">
              <span className="oc-ch-eyebrow">{chapter.categoriesIntro.eyebrow}</span>
              <h2>{chapter.categoriesIntro.heading}</h2>
              <p>{chapter.categoriesIntro.body}</p>
            </header>
            <GroupRail
              categories={chapter.categories}
              exit={chapter.urgentExit}
              showRail={chapter.rail}
            />
          </div>
        </section>
      )}

      <ChapterBandSlot chapter={chapter} />

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

      {/*
       * A site with a direct contact (SiteContact) shows it here in place of
       * the button, and the panel takes the anchor that the hero's button and
       * the lanes open. Without one, the panel is Ostomy's, unchanged.
       */}
      <section
        className="oc-ch-care-cta rounded-top"
        id={site.contact ? CONTACT_ANCHOR : undefined}
      >
        <div className="oc-ch-wrap">
          <div className="oc-ch-care-panel">
            <div className="oc-ch-care-media">
              <img alt="" src={chapter.pharmacist.image} />
            </div>
            <div className="oc-ch-care-copy">
              <span className="oc-ch-eyebrow">{chapter.pharmacist.eyebrow}</span>
              <h2>{chapter.pharmacist.heading}</h2>
              <p>{chapter.pharmacist.body}</p>
              {site.contact ? (
                <SpecialistContact />
              ) : (
                <a className="oc-ch-btn oc-ch-btn-soft" href={chapter.pharmacist.href}>
                  {chapter.pharmacist.cta}
                </a>
              )}
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
                  href={localeHref(chapterHref(site, item.slug), locale)}
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
            <a className="oc-ch-btn oc-ch-btn-soft" href={landingHref}>
              {t('backToLanding')}
            </a>
            <a className="oc-ch-btn oc-ch-btn-ghost-light" href={nextHref}>
              {nextLabel}
            </a>
          </div>
          {prev ? (
            <p className="oc-ch-prev">
              <a href={localeHref(chapterHref(site, prev.slug), locale)}>← {prev.title}</a>
            </p>
          ) : null}
        </div>
      </section>

      <HelpBand />

      <DiscoveryBand />

      {/*
       * A page handed the resolved register lists every source it names,
       * grouped (owner note 1); Ostomy's lists its hand-kept citations.
       */}
      <GovernanceBlock
        citations={chapter.citations}
        governance={chapter.governance}
        sources={registered ? lookUpSources(registered, chapter.sourceIds) : undefined}
      />
    </div>
  );
}
