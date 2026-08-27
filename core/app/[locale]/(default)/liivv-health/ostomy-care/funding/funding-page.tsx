'use client';

import type { CSSProperties } from 'react';

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

import { DiscoveryBand, GovernanceBlock } from '../_components/page-furniture';
import {
  CLINICAL_REVIEWER,
  GENERAL_INFO_DISCLAIMER,
  LANDING_HREF,
} from '../chapters/chapters-data';

import { FundingChecker } from './funding-checker';
import { FEDERAL_LINKS, MODEL_COPY } from './funding-data';

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
  return (
    <div id="oc-chapter" style={ACCENT_STYLE}>
      <section className="oc-ch-hero oc-fund-hero">
        <div aria-hidden className="oc-ch-hero-veil" />
        <div className="oc-ch-hero-inner">
          <span className="oc-ch-kicker">Ostomy Care · Money</span>
          <h1>What your province actually covers</h1>
          <p className="oc-ch-hero-lead">
            There is no national ostomy program in Canada. The amount, the model, and who signs off
            all change at the provincial border — so the first useful thing to know is which system
            you are in.
          </p>
          <div className="oc-ch-hero-actions">
            <a className="oc-ch-btn oc-ch-btn-soft" href="#find-your-coverage">
              Find your coverage
            </a>
            <a className="oc-ch-btn oc-ch-btn-ghost-light" href="#federal">
              Federal help and tax credits
            </a>
          </div>
        </div>
      </section>

      <section className="oc-ch-journal rounded-top">
        <div className="oc-ch-journal-grid">
          <article className="oc-ch-note">
            <span className="oc-ch-note-label">The Focus</span>
            <p>
              Provincial and territorial coverage, federal programs, the Disability Tax Credit, and
              what to do when the funding runs out before the year does.
            </p>
          </article>
          <article className="oc-ch-note is-vibe">
            <span className="oc-ch-note-label">The Liivv Vibe</span>
            <p>
              Plain and specific — every number links to the government page it came from, with the
              date we last checked it.
            </p>
          </article>
        </div>
      </section>

      <section className="oc-ch-care rounded-top">
        <div className="oc-ch-wrap">
          <header className="oc-ch-care-head">
            <span className="oc-ch-eyebrow">Start here</span>
            <h2>Four ways provinces pay</h2>
            <p>
              Almost every misunderstanding about ostomy funding comes from assuming your province
              works like a different one. There are really only four models.
            </p>
          </header>
          <div className="oc-fund-models">
            {MODEL_ORDER.map((model, index) => (
              <article className="oc-fund-model" key={model}>
                <span className="oc-fund-model-index">{String(index + 1).padStart(2, '0')}</span>
                <h3>{MODEL_COPY[model].label}</h3>
                <p>{MODEL_COPY[model].blurb}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="oc-fund-tool rounded-top" id="find-your-coverage">
        <div className="oc-ch-wrap">
          <header className="oc-ch-care-head">
            <span className="oc-ch-eyebrow">Your situation</span>
            <h2>Find what applies to you</h2>
            <p>Nothing you enter is saved or sent anywhere — this runs entirely in your browser.</p>
          </header>
          <FundingChecker />
        </div>
      </section>

      <section className="oc-ch-care rounded-top" id="federal">
        <div className="oc-ch-wrap">
          <header className="oc-ch-care-head">
            <span className="oc-ch-eyebrow">Federal</span>
            <h2>Help that does not depend on where you live</h2>
          </header>
          <div className="oc-ch-rows">
            <article className="oc-ch-row">
              <span aria-hidden className="oc-ch-row-index">
                01
              </span>
              <div>
                <h3>The Disability Tax Credit</h3>
                <p className="oc-ch-row-note">
                  The most valuable and most misunderstood item on this page — and the one people
                  most often get refused.
                </p>
                <ul>
                  <li>
                    <strong>Having an ostomy does not qualify you on its own.</strong> This is the
                    part almost every summary gets wrong. A well-managed routine is frequently
                    refused, and the CRA&rsquo;s own guidance says so.
                  </li>
                  <li>
                    The test: you are unable to manage bowel or bladder function, or it takes you
                    roughly <strong>three times longer</strong> than someone of similar age without
                    the impairment, at least <strong>90% of the time</strong>, for a continuous{' '}
                    <strong>12 months</strong> — assessed with your appliances and routine already
                    in place.
                  </li>
                  <li>
                    So what gets approved is complications and time burden, not the stoma itself.
                    Leaks, skin breakdown, repeated changes, night-time management, time lost from
                    work — that is what belongs on the form.
                  </li>
                  <li>
                    Apply through the <strong>eliminating</strong> category — bowel or bladder
                    function — not life-sustaining therapy. Only a{' '}
                    <strong>medical doctor or nurse practitioner</strong> can certify it. Your NSWOC
                    can help you describe your routine accurately, but cannot sign the form.
                  </li>
                  <li>
                    It is still worth applying: approval can be backdated up to ten years, and it
                    unlocks the RDSP and the Canada Disability Benefit. A refusal costs you those
                    too, which is why the wording matters so much.
                  </li>
                  <li>
                    If you are refused, the medical expense claim below needs no approval at all.
                  </li>
                </ul>
              </div>
            </article>

            <article className="oc-ch-row">
              <span aria-hidden className="oc-ch-row-index">
                02
              </span>
              <div>
                <h3>Non-Insured Health Benefits</h3>
                <ul>
                  <li>
                    For registered First Nations and recognized Inuit, NIHB covers approved ostomy
                    items subject to quantity limits and prior approval. Recognized providers bill
                    NIHB directly, so there is no upfront cost to you.
                  </li>
                  <li>
                    This replaces the provincial route rather than topping it up — so start here
                    rather than applying to your province first.
                  </li>
                  <li>
                    There is an exception process for quantities or items outside the standard list.
                    High output is a common and legitimate reason to use it.
                  </li>
                </ul>
              </div>
            </article>

            <article className="oc-ch-row">
              <span aria-hidden className="oc-ch-row-index">
                03
              </span>
              <div>
                <h3>Medical expenses on your tax return</h3>
                <ul>
                  <li>
                    Whatever your province does not cover may be claimable. Several provinces say so
                    explicitly on their own program pages.
                  </li>
                  <li>Keep receipts, including shipping where it is not covered.</li>
                </ul>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="oc-ch-programs rounded-top">
        <div className="oc-ch-wrap">
          <header className="oc-ch-care-head">
            <span className="oc-ch-eyebrow">When it is not enough</span>
            <h2>The funding ran out before the year did</h2>
          </header>
          <div className="oc-ch-programs-grid">
            <article className="oc-ch-program">
              <span className="oc-ch-program-index">01</span>
              <h3>Ask an NSWOC first</h3>
              <p>
                Often the fastest win is not more money but a better fit — fewer changes, longer
                wear time, less waste. An NSWOC can also tell you what actually gets approved in
                your region.
              </p>
            </article>
            <article className="oc-ch-program">
              <span className="oc-ch-program-index">02</span>
              <h3>Use the free manufacturer programs</h3>
              <p>
                Hollister, Coloplast, and Convatec all run free support lines with samples and nurse
                access, regardless of where you buy. They will also help you navigate coverage.
              </p>
            </article>
            <article className="oc-ch-program">
              <span className="oc-ch-program-index">03</span>
              <h3>Check social assistance and disability routes</h3>
              <p>
                Provincial disability and social assistance programs sometimes top up ostomy
                coverage above the standard grant. This is worth asking about directly.
              </p>
            </article>
            <article className="oc-ch-program">
              <span className="oc-ch-program-index">04</span>
              <h3>Talk to your local chapter</h3>
              <p>
                Ostomy Canada chapters know the local landscape, and some hold donated supplies.
                Treat second-hand product carefully — check sterility, expiry, and that it is the
                right size for you.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="oc-ch-care rounded-top">
        <div className="oc-ch-wrap">
          <header className="oc-ch-care-head">
            <span className="oc-ch-eyebrow">Moving</span>
            <h2>If you change provinces</h2>
            <p>
              Nobody writes this down, and it catches people out. Moving resets your coverage
              entirely — different model, different amount, different forms, and often a different
              person who has to sign them.
            </p>
          </header>
          <div className="oc-ch-rows">
            <article className="oc-ch-row">
              <span aria-hidden className="oc-ch-row-index">
                01
              </span>
              <div>
                <h3>Before you go</h3>
                <ul>
                  <li>Claim anything outstanding — most programs will not pay across a move.</li>
                  <li>
                    Ask your NSWOC for a written summary of your current setup, sizes, and products.
                    It shortens registration at the other end considerably.
                  </li>
                  <li>Stock up enough to cover the gap while new coverage is approved.</li>
                </ul>
              </div>
            </article>
            <article className="oc-ch-row">
              <span aria-hidden className="oc-ch-row-index">
                02
              </span>
              <div>
                <h3>When you arrive</h3>
                <ul>
                  <li>
                    Find an NSWOC early — in several provinces you cannot register at all without
                    one.
                  </li>
                  <li>
                    Check the new province&rsquo;s model above. If you move from a grant province to
                    a supplies-in-kind one, you stop buying at retail entirely.
                  </li>
                  <li>Expect a waiting period, and budget for it.</li>
                </ul>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="oc-ch-close rounded-top">
        <div aria-hidden className="oc-ch-close-veil" />
        <div className="oc-ch-close-inner">
          <span className="oc-ch-eyebrow">Keep going</span>
          <h2>Money should not be the reason you ration supplies</h2>
          <p>
            If the numbers are not working, that is worth saying out loud to your care team. There
            are usually more routes than people realise.
          </p>
          <div className="oc-ch-close-cta">
            <a className="oc-ch-btn oc-ch-btn-soft" href={LANDING_HREF}>
              Back to Ostomy Care page
            </a>
            <a
              className="oc-ch-btn oc-ch-btn-ghost-light"
              href={`${LANDING_HREF}/chapters/everyday-liivving`}
            >
              Everyday Liivving →
            </a>
          </div>
        </div>
      </section>

      <DiscoveryBand />

      <GovernanceBlock
        citations={CITATIONS}
        governance={{
          ...CLINICAL_REVIEWER,
          reviewedOn: '',
          disclaimer: `${GENERAL_INFO_DISCLAIMER} Funding amounts and eligibility rules change every year — always confirm on the official government page before planning around a number.`,
        }}
      />
    </div>
  );
}
