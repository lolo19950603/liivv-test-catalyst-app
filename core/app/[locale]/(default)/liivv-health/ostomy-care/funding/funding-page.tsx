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

import { useMessages, useTranslations } from 'next-intl';
import type { CSSProperties } from 'react';

import { DiscoveryBand, GovernanceBlock, HelpBand } from '../_components/page-furniture';
import {
  chapterHref,
  CLINICAL_REVIEWER,
  COMMERCIAL_DISCLOSURE,
  CONTENT_AUTHOR,
  LANDING_HREF,
} from '../chapters/chapters-data';

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
  const t = useTranslations('OstomyCare.ui.fundingPage');
  const chrome = useTranslations('OstomyCare.ui.chapter');
  const models = messages.OstomyCare.funding.models;

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
            <a className="oc-ch-btn oc-ch-btn-soft" href={LANDING_HREF}>
              {chrome('backToLanding')}
            </a>
            <a className="oc-ch-btn oc-ch-btn-ghost-light" href={chapterHref('everyday-liivving')}>
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
          disclosure: COMMERCIAL_DISCLOSURE,
          disclaimer: messages.OstomyCare.funding.governance.disclaimer,
        }}
      />
    </div>
  );
}
