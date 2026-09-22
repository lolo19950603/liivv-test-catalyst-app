'use client';

/*
 * Funding & Financial Support — the ostomy microsite's strongest asset.
 *
 * No Canadian retailer or patient org has assembled this properly, and it is the
 * thing people search hardest for. Structure follows diabetesexpress.ca's
 * Financial Aid page: federal first, then a province picker, plain-language
 * summaries, and a link out to the official page for every claim.
 *
 * Rendered inside `id="oc-chapter"` so it inherits the chapter palette, spacing
 * tokens and `.rounded-top` behaviour rather than defining a second design system.
 */

import { useLocale, useMessages, useTranslations } from 'next-intl';
import type { CSSProperties } from 'react';

import { DiscoveryBand, GovernanceBlock, HelpBand } from '../_components/page-furniture';
import {
  chapterHref,
  CLINICAL_REVIEWER,
  CONTENT_AUTHOR,
  DISCLOSES_COMMERCIAL_RELATIONSHIP,
  LANDING_HREF,
  localeHref,
} from '../chapters/chapters-data';
import { FigureGlyphs, UrgentExit } from '../chapters/figures';

import { FundingChecker } from './funding-checker';
import { FEDERAL_LINKS } from './funding-data';

import '../chapters/chapter-page.css';
import './funding.css';

/** CSS custom property, typed without an assertion. */
const ACCENT_STYLE: CSSProperties & Record<string, string> = {
  '--chapter-accent': '#6f8a72',
};

const MODEL_ORDER = ['flat-grant', 'cost-share', 'supplies-in-kind', 'categorical'] as const;

const CITATIONS = [
  {
    label: 'Canada Revenue Agency — Disability Tax Credit, eliminating (bowel or bladder)',
    href: FEDERAL_LINKS.dtc,
  },
  { label: 'Canada Revenue Agency — form T2201', href: FEDERAL_LINKS.t2201 },
  {
    label: 'Indigenous Services Canada — NIHB medical supplies and equipment',
    href: FEDERAL_LINKS.nihb,
  },
  {
    label: 'Canada Revenue Agency — eligible medical expenses',
    href: FEDERAL_LINKS.medicalExpenses,
  },
  {
    label: 'Ostomy Canada Society — provincial government programs',
    href: 'https://www.ostomycanada.ca/provincial-government-programs/',
  },
];

export function FundingPage() {
  const messages = useMessages();
  /* These are plain <a>, so the /fr prefix has to be put on by hand — chapters-data.ts. */
  const locale = useLocale();
  const t = useTranslations('OstomyCare.ui.fundingPage');
  const chrome = useTranslations('OstomyCare.ui.chapter');
  const models = messages.OstomyCare.funding.models;

  /*
   * The one urgent signpost this page carries.
   *
   * Until this branch a <noscript> block repeated Chapter 02's red-flag list
   * and the 9-8-8 crisis line on every /liivv-health/ostomy-care/** page,
   * because the store-wide loading gate meant a reader with scripts off saw
   * nothing else at all. That gate is gone and these pages now render their own
   * content, so the duplicate was removed rather than left to show twice. Every
   * other page in the microsite signposts the emergency list itself; this one
   * did not, so removing the duplicate would have left a reader here with no
   * route to it in either direction. This is that route.
   *
   * The wording is read out of the message tree rather than written here: it is
   * the same approved pair Chapter 01 and Chapter 04 carry, already reviewed in
   * both locales, so there is no second wording for a clinical reviewer to
   * approve and no way for the two to drift. It is a plain <a>, so it works
   * with scripts off, and no review gate may hide it (review-gates.ts).
   */
  const urgentExit = {
    lead: messages.OstomyCare.chapters['this-might-be-you'].urgentExit.lead,
    link: messages.OstomyCare.chapters['this-might-be-you'].urgentExit.link,
    href: localeHref(`${chapterHref('get-to-know-your-stoma')}#red-flags`, locale),
  };

  return (
    <div id="oc-chapter" style={ACCENT_STYLE}>
      <section className="oc-ch-hero oc-fund-hero">
        <div aria-hidden className="oc-ch-hero-veil" />
        <div className="oc-ch-hero-inner">
          <span className="oc-ch-kicker">{t('kicker')}</span>
          <h1>{t('title')}</h1>
          <p className="oc-ch-hero-lead">{t('lead')}</p>
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
          <article className="oc-ch-note is-vibe">
            <span className="oc-ch-note-label">{chrome('theVibe')}</span>
            <p>{t('vibe')}</p>
          </article>
        </div>
        <div className="oc-fund-exit">
          <UrgentExit exit={urgentExit} />
        </div>
      </section>

      <section className="oc-ch-care rounded-top">
        <div className="oc-ch-wrap">
          <header className="oc-ch-care-head">
            <span className="oc-ch-eyebrow">{t('modelsEyebrow')}</span>
            <h2>{t('modelsHeading')}</h2>
            <p>{t('modelsIntro')}</p>
          </header>
          <div className="oc-fund-models">
            {MODEL_ORDER.map((model, index) => (
              <article className="oc-fund-model" key={model}>
                <span className="oc-fund-model-index">{String(index + 1).padStart(2, '0')}</span>
                <h3>{models[model].label}</h3>
                <p>{models[model].blurb}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="oc-fund-tool rounded-top" id="find-your-coverage">
        <div className="oc-ch-wrap">
          <header className="oc-ch-care-head">
            <span className="oc-ch-eyebrow">{t('toolEyebrow')}</span>
            <h2>{t('toolHeading')}</h2>
            <p>{t('toolIntro')}</p>
          </header>
          <FundingChecker />
        </div>
      </section>

      <section className="oc-ch-care rounded-top" id="federal">
        <div className="oc-ch-wrap">
          <header className="oc-ch-care-head">
            <span className="oc-ch-eyebrow">{t('federalEyebrow')}</span>
            <h2>{t('federalHeading')}</h2>
          </header>
          <div className="oc-ch-rows">
            <article className="oc-ch-row">
              <span aria-hidden className="oc-ch-row-index">
                01
              </span>
              <div>
                <h3>{t('dtcHeading')}</h3>
                <p className="oc-ch-row-note">{t('dtcNote')}</p>
                <ul>
                  <li>{t('dtcPoint1')}</li>
                  <li>{t('dtcPoint2')}</li>
                  <li>{t('dtcPoint3')}</li>
                  <li>{t('dtcPoint4')}</li>
                  <li>{t('dtcPoint5')}</li>
                  <li>{t('dtcPoint6')}</li>
                </ul>
              </div>
            </article>

            <article className="oc-ch-row">
              <span aria-hidden className="oc-ch-row-index">
                02
              </span>
              <div>
                <h3>{t('nihbHeading')}</h3>
                <ul>
                  <li>{t('nihbPoint1')}</li>
                  <li>{t('nihbPoint2')}</li>
                  <li>{t('nihbPoint3')}</li>
                </ul>
              </div>
            </article>

            <article className="oc-ch-row">
              <span aria-hidden className="oc-ch-row-index">
                03
              </span>
              <div>
                <h3>{t('expensesHeading')}</h3>
                <ul>
                  <li>{t('expensesPoint1')}</li>
                  <li>{t('expensesPoint2')}</li>
                </ul>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="oc-ch-programs rounded-top">
        <div className="oc-ch-wrap">
          <header className="oc-ch-care-head">
            <span className="oc-ch-eyebrow">{t('ranOutEyebrow')}</span>
            <h2>{t('ranOutHeading')}</h2>
          </header>
          <div className="oc-ch-programs-grid">
            {/* Keys are listed rather than interpolated so next-intl can type-check them. */}
            {(
              [
                ['ranOut1Heading', 'ranOut1Body'],
                ['ranOut2Heading', 'ranOut2Body'],
                ['ranOut3Heading', 'ranOut3Body'],
                ['ranOut4Heading', 'ranOut4Body'],
              ] as const
            ).map(([headingKey, bodyKey], index) => (
              <article className="oc-ch-program" key={headingKey}>
                <span className="oc-ch-program-index">{String(index + 1).padStart(2, '0')}</span>
                <h3>{t(headingKey)}</h3>
                <p>{t(bodyKey)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="oc-ch-care rounded-top">
        <div className="oc-ch-wrap">
          <header className="oc-ch-care-head">
            <span className="oc-ch-eyebrow">{t('movingEyebrow')}</span>
            <h2>{t('movingHeading')}</h2>
            <p>{t('movingIntro')}</p>
          </header>
          <div className="oc-ch-rows">
            <article className="oc-ch-row">
              <span aria-hidden className="oc-ch-row-index">
                01
              </span>
              <div>
                <h3>{t('beforeHeading')}</h3>
                <ul>
                  <li>{t('before1')}</li>
                  <li>{t('before2')}</li>
                  <li>{t('before3')}</li>
                </ul>
              </div>
            </article>
            <article className="oc-ch-row">
              <span aria-hidden className="oc-ch-row-index">
                02
              </span>
              <div>
                <h3>{t('arriveHeading')}</h3>
                <ul>
                  <li>{t('arrive1')}</li>
                  <li>{t('arrive2')}</li>
                  <li>{t('arrive3')}</li>
                </ul>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="oc-ch-close rounded-top">
        <div aria-hidden className="oc-ch-close-veil" />
        <div className="oc-ch-close-inner">
          <span className="oc-ch-eyebrow">{chrome('keepGoing')}</span>
          <h2>{t('closingHeading')}</h2>
          <p>{t('closingBody')}</p>
          <div className="oc-ch-close-cta">
            <a className="oc-ch-btn oc-ch-btn-soft" href={localeHref(LANDING_HREF, locale)}>
              {chrome('backToLanding')}
            </a>
            <a className="oc-ch-btn oc-ch-btn-ghost-light" href={localeHref(chapterHref('everyday-liivving'), locale)}>
              {t('closingCta')}
            </a>
          </div>
        </div>
      </section>

      <HelpBand />

      <DiscoveryBand />

      <GovernanceBlock
        citations={CITATIONS}
        governance={{
          author: CONTENT_AUTHOR,
          reviewer: CLINICAL_REVIEWER,
          reviewedOn: '',
          disclosure: DISCLOSES_COMMERCIAL_RELATIONSHIP,
          disclaimer: messages.OstomyCare.funding.governance.disclaimer,
        }}
      />
    </div>
  );
}
