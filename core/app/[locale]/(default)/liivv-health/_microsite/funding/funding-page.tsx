/* Twin of ostomy-care/funding/funding-page.tsx @3b343c6e — port fixes both ways until Phase 2 */

'use client';

/*
 * A care site's funding page: the frame every site's shares.
 *
 * Ostomy's page, with what was Ostomy's own read from the site in
 * SiteProvider: its `ui.fundingPage` words, its landing, its furniture and its
 * governance. What is in between — how paying works, the checker, the federal
 * programs and the rest — is the site's own, handed in as children, because
 * what a province pays for and how it pays differ completely from one
 * condition to the next.
 *
 * Rendered inside `id="oc-chapter"` so it inherits the chapter palette,
 * spacing tokens and `.rounded-top` behaviour rather than defining a second
 * design system; `data-site` lets a site's own CSS reach it, as on the
 * chapters. Both stylesheets are Ostomy's, imported rather than copied, so the
 * cascade cannot drift; ./funding-extras.css adds only what Ostomy's page does
 * not have.
 */

import { useLocale } from 'next-intl';
import type { CSSProperties, ReactNode } from 'react';

import { DiscoveryBand, GovernanceBlock, HelpBand } from '../_components/page-furniture';
import type { Citation } from '../chapters/compose';
import { FigureGlyphs, UrgentExit } from '../chapters/figures';
import { localeHref } from '../chapters/hrefs';
import { useSite, useSiteT } from '../site-context';

import '../../ostomy-care/chapters/chapter-page.css';
import '../../ostomy-care/funding/funding.css';
import './funding-extras.css';

/* A section's eyebrow, heading and optional intro, as every chapter section opens. */
export function FundingSectionHead({
  eyebrow,
  heading,
  intro,
}: {
  eyebrow: string;
  heading: string;
  intro?: string;
}) {
  return (
    <header className="oc-ch-care-head">
      <span className="oc-ch-eyebrow">{eyebrow}</span>
      <h2>{heading}</h2>
      {intro ? <p>{intro}</p> : null}
    </header>
  );
}

/* One numbered row, as on the Ostomy page's federal and moving sections. */
export function FundingRow({ index, children }: { index: number; children: ReactNode }) {
  return (
    <article className="oc-ch-row">
      <span aria-hidden className="oc-ch-row-index">
        {String(index).padStart(2, '0')}
      </span>
      <div>{children}</div>
    </article>
  );
}

export function FundingPage({
  accent,
  exit,
  frDraft,
  closingHref,
  citations,
  disclaimer,
  children,
}: {
  /** The page's accent colour (`--chapter-accent`). */
  accent: string;
  /*
   * The one urgent signpost the page carries: the site's approved "emergency
   * signs are in …" pair, linked to its emergency list. A plain <a>, so it
   * works with scripts off, and nothing on the page may gate it.
   */
  exit: { lead: string; link: string; href: string };
  /** The page's French is showing on a preview only because its gate is open there. */
  frDraft: boolean;
  /** Where the closing's second button goes (`ui.fundingPage.closingCta`), unprefixed. */
  closingHref: string;
  /** Every source the page names, once each, in the page locale. */
  citations: Citation[];
  disclaimer: string;
  children: ReactNode;
}) {
  const site = useSite();
  /* These are plain <a>, so the /fr prefix has to be put on by hand — ../chapters/hrefs.ts. */
  const locale = useLocale();
  const t = useSiteT('ui.fundingPage');
  const chrome = useSiteT('ui.chapter');

  /* CSS custom property, typed without an assertion. */
  const accentStyle: CSSProperties & Record<string, string> = { '--chapter-accent': accent };

  return (
    <div data-site={site.rootAttr} id={site.rootId} style={accentStyle}>
      <section className="oc-ch-hero oc-fund-hero">
        <div aria-hidden className="oc-ch-hero-veil" />
        <div className="oc-ch-hero-inner">
          <span className="oc-ch-kicker">{t('kicker')}</span>
          <h1>{t('title')}</h1>
          <p className="oc-ch-hero-lead">{t('lead')}</p>
          {frDraft ? <p className="oc-fig-draft oc-fund-draft">{chrome('frDraft')}</p> : null}
          <div className="oc-ch-hero-actions">
            <a className="oc-ch-btn oc-ch-btn-soft" href="#find-your-coverage">
              {t('ctaFind')}
            </a>
            <a className="oc-ch-btn oc-ch-btn-ghost-light" href="#federal">
              {t('ctaFederal')}
            </a>
          </div>
        </div>
      </section>

      <FigureGlyphs />

      <section className="oc-ch-journal rounded-top">
        <div className="oc-ch-journal-grid">
          <article className="oc-ch-note">
            <span className="oc-ch-note-label">{chrome('theFocus')}</span>
            <p>{t('focus')}</p>
          </article>
          {/*
           * No label: "The Liivv Vibe" is Ostomy's own word, and the engine
           * contract (`ui.chapter`) has no label for a second note.
           */}
          <article className="oc-ch-note is-vibe">
            <p>{t('vibe')}</p>
          </article>
        </div>
        <div className="oc-fund-exit">
          <UrgentExit exit={exit} />
        </div>
      </section>

      {children}

      <section className="oc-ch-close rounded-top">
        <div aria-hidden className="oc-ch-close-veil" />
        <div className="oc-ch-close-inner">
          <span className="oc-ch-eyebrow">{chrome('keepGoing')}</span>
          <h2>{t('closingHeading')}</h2>
          <p>{t('closingBody')}</p>
          <div className="oc-ch-close-cta">
            <a className="oc-ch-btn oc-ch-btn-soft" href={localeHref(site.basePath, locale)}>
              {chrome('backToLanding')}
            </a>
            <a className="oc-ch-btn oc-ch-btn-ghost-light" href={localeHref(closingHref, locale)}>
              {t('closingCta')}
            </a>
          </div>
        </div>
      </section>

      <HelpBand />

      <DiscoveryBand />

      <GovernanceBlock citations={citations} governance={{ ...site.governance, disclaimer }} />
    </div>
  );
}
