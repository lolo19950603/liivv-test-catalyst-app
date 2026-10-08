'use client';

/*
 * =============================================================================
 * A CARE SITE'S PATH PAGE
 * =============================================================================
 * One reader's reading list across the site's chapters, in the chapters' own
 * look: the hero, a sourced two-paragraph intro with the site's emergency
 * signpost under it, the reading list grouped by stage, the door to the
 * site's funding page, the pharmacist band where the site has released it,
 * the rail of the site's other paths, then the help, discovery and governance
 * furniture every chapter carries.
 *
 * It writes no card of its own. Each entry is a card's title as its chapter
 * holds it, the chapter's number and title, the reason the card is on this
 * path, and a plain link to the card's `#card-<n>` anchor (./compose.ts).
 *
 * Between the list and the funding door, the site's shop strip for this path
 * where it has one (`shelf`, drawn by ../shop inside the site's ShopProvider);
 * a path without one, and every path while the site's placements are off,
 * has nothing there. It never renders anything interactive that a French
 * review gate would have to hold back. The emergency signpost is a plain <a> that no gate may hide.
 *
 * Rendered inside `id="oc-chapter"` so it inherits the chapter palette and
 * spacing; the stylesheet is Ostomy's, imported rather than copied, and
 * ./path-page.css adds only what a chapter does not have.
 * =============================================================================
 */

import { useLocale } from 'next-intl';
import type { CSSProperties } from 'react';

import { DiscoveryBand, GovernanceBlock, HelpBand } from '../_components/page-furniture';
import { SourceChip } from '../_components/source-chip';
import { SpecialistContact } from '../_components/specialist-contact';
import { FigureGlyphs, UrgentExit } from '../chapters/figures';
import { localeHref } from '../chapters/hrefs';
import { TextSizeControl } from '../chapters/text-size-control';
import type { CardShelf } from '../shop/shelves';
import { ShopBand } from '../shop/shop-strip';
import { useSite, useSiteT } from '../site-context';
import type { ResolvedSource } from '../sources';

import type { ComposedPath, PathGroup } from './compose';

import '../../ostomy-care/chapters/chapter-page.css';
import './path-page.css';

/*
 * The pharmacist band, once the site has released it on this path. It shows
 * the site's direct contact where it has one (SiteContact), and a request
 * button only where `href` is set: a site whose request page cannot take the
 * request yet passes none.
 */
export interface PathPharmacistBand {
  eyebrow: string;
  heading: string;
  body: string;
  cta: string;
  /* Already in the page locale; null while the request button is held. */
  href: string | null;
  image: string;
}

function ReadingGroup({ group }: { group: PathGroup }) {
  const t = useSiteT('ui.path');
  const headingId = `${group.id}-heading`;

  return (
    <section aria-labelledby={headingId} className="oc-ch-band oc-path-stage" id={group.id}>
      <h3 className="oc-ch-band-heading" id={headingId}>
        {t(`stages.${group.stage}`)}
      </h3>
      <ol className="oc-path-list" start={group.entries[0]?.number}>
        {group.entries.map((entry) => (
          <li key={entry.number}>
            <a className="oc-ch-row oc-path-entry" href={entry.href}>
              <span aria-hidden className="oc-ch-row-index">
                {String(entry.number).padStart(2, '0')}
              </span>
              <span className="oc-path-entry-body">
                <span className="oc-path-entry-chapter">
                  {t('chapterLabel', { num: entry.chapterNum, chapter: entry.chapterTitle })}
                </span>
                <span className="oc-path-entry-title">{entry.title}</span>
                <span className="oc-path-entry-reason">{entry.reason}</span>
                <span aria-hidden className="oc-path-entry-go">
                  {t('readCard')} →
                </span>
              </span>
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function PathPage({
  path,
  fundingHref,
  pharmacist,
  sources,
  introSources,
  disclaimer,
  frDraft,
  shelf = null,
}: {
  path: ComposedPath;
  /** The site's funding page, in the page locale, or null while it does not exist. */
  fundingHref: string | null;
  /** Null until the site releases the band on this path. */
  pharmacist: PathPharmacistBand | null;
  /** Every source the page names, once each, resolved for the page locale: the foot list. */
  sources: ResolvedSource[];
  /** The sources behind the intro's two paragraphs, shown under them (owner note 1). */
  introSources: ResolvedSource[];
  disclaimer: string;
  /** The page's French is showing on a preview only because its gate is open there. */
  frDraft: boolean;
  /** The path's shop strip, or null for none. Its products come from the site's ShopProvider. */
  shelf?: CardShelf | null;
}) {
  const site = useSite();
  /* These are plain <a>, so the /fr prefix has to be put on by hand — ../chapters/hrefs.ts. */
  const locale = useLocale();
  const t = useSiteT('ui.path');
  const chrome = useSiteT('ui.chapter');

  /* CSS custom property, typed without an assertion. */
  const accentStyle: CSSProperties & Record<string, string> = { '--chapter-accent': path.accent };

  return (
    <div data-path={path.slug} data-site={site.rootAttr} id={site.rootId} style={accentStyle}>
      <section className="oc-ch-hero">
        <div className="oc-ch-hero-bg">
          <img alt="" decoding="async" src={path.heroImage} />
        </div>
        <div aria-hidden className="oc-ch-hero-veil" />
        <div className="oc-ch-hero-inner">
          <span className="oc-ch-kicker">{t('kicker')}</span>
          <h1>{path.title}</h1>
          <p className="oc-ch-hero-lead">{path.heroBody}</p>
          {frDraft ? <p className="oc-fig-draft oc-path-draft">{chrome('frDraft')}</p> : null}
          <div className="oc-ch-hero-actions">
            <a className="oc-ch-btn oc-ch-btn-soft" href="#path-list">
              {path.list.heading}
            </a>
          </div>
          <TextSizeControl />
        </div>
      </section>

      <FigureGlyphs />

      <section className="oc-ch-journal rounded-top" id="path-intro">
        <div className="oc-ch-wrap oc-path-intro">
          <span className="oc-ch-eyebrow">{path.intro.eyebrow}</span>
          <h2>{path.intro.heading}</h2>
          {path.intro.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <SourceChip className="ms-src-intro" label={path.intro.heading} sources={introSources} />
          {/*
           * The site's emergency signpost, on every path, prediabetes too.
           * Never gated and never collapsible.
           */}
          <div className="oc-path-exit">
            <UrgentExit
              exit={{ lead: t('safety.lead'), link: t('safety.link'), href: path.safetyHref }}
            />
          </div>
        </div>
      </section>

      <section className="oc-ch-care rounded-top" id="path-list">
        <div className="oc-ch-wrap">
          <header className="oc-ch-care-head">
            <span className="oc-ch-eyebrow">{t('kicker')}</span>
            <h2>{path.list.heading}</h2>
            <p>{path.list.intro}</p>
          </header>
          {path.list.groups.map((group) => (
            <ReadingGroup group={group} key={group.id} />
          ))}
        </div>
      </section>

      {/* The shop strip's slot: nothing renders without a shelf, or when the catalogue left it empty. */}
      {shelf ? <ShopBand id="path-shop" shelf={shelf} /> : null}

      {fundingHref ? (
        <section className="oc-ch-programs rounded-top" id="path-funding">
          <div className="oc-ch-wrap">
            <article className="oc-ch-program oc-path-door">
              <h2>{path.funding.heading}</h2>
              <p>{path.funding.body}</p>
              <a className="oc-ch-btn oc-ch-btn-soft" href={fundingHref}>
                {path.funding.cta}
              </a>
            </article>
          </div>
        </section>
      ) : null}

      {pharmacist ? (
        <section className="oc-ch-care-cta rounded-top" id="path-pharmacist">
          <div className="oc-ch-wrap">
            <div className="oc-ch-care-panel">
              <div className="oc-ch-care-media">
                <img alt="" src={pharmacist.image} />
              </div>
              <div className="oc-ch-care-copy">
                <span className="oc-ch-eyebrow">{pharmacist.eyebrow}</span>
                <h2>{pharmacist.heading}</h2>
                <p>{pharmacist.body}</p>
                <SpecialistContact />
                {pharmacist.href ? (
                  <a className="oc-ch-btn oc-ch-btn-soft" href={pharmacist.href}>
                    {pharmacist.cta}
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="oc-ch-map rounded-top">
        <div className="oc-ch-wrap">
          <span className="oc-ch-eyebrow">{t('kicker')}</span>
          <h2>{t('allPaths')}</h2>
          <nav aria-label={t('allPaths')} className="oc-ch-map-rail">
            {path.rail.map((item) => (
              <a
                aria-current={item.current ? 'page' : undefined}
                className={item.current ? 'is-active' : undefined}
                href={item.href}
                key={item.slug}
              >
                <span aria-hidden className="oc-ch-map-num">
                  →
                </span>
                <span>{item.title}</span>
              </a>
            ))}
          </nav>
          <p className="oc-path-back">
            <a className="oc-ch-btn oc-ch-btn-soft" href={localeHref(site.basePath, locale)}>
              {chrome('backToLanding')}
            </a>
          </p>
        </div>
      </section>

      <HelpBand />

      <DiscoveryBand />

      <GovernanceBlock governance={{ ...site.governance, disclaimer }} sources={sources} />
    </div>
  );
}
