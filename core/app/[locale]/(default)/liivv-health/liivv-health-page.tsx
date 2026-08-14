'use client';

import {
  HEALTH_HUB_DOORS,
  HEALTH_HUB_MARQUEE,
  HEALTH_HUB_STORY_LINKS,
  type HealthHubKitCard,
} from './health-hub-data';
import { useWhMotion } from './womens-health/use-wh-motion';

import './liivv-health.css';
import './womens-health/wh-motion.css';

const PHARMACIST_HREF = '/account/virtual-care';
const HEALTH_PROFILE_HREF = '/account/health-profile';
const HOME_IMG = '/archive/liivv-home';
const WH_IMG = '/archive/womens-health';

type Props = {
  featuredKits: HealthHubKitCard[];
};

function DoorCard({
  door,
  index,
}: {
  door: (typeof HEALTH_HUB_DOORS)[number];
  index: number;
}) {
  const inner = (
    <>
      <div className="lh-hub-door-media">
        <img alt="" src={door.image} />
      </div>
      <span className="lh-hub-door-label">{door.label}</span>
      <h3>{door.title}</h3>
      <p>{door.body}</p>
    </>
  );

  if (door.href) {
    return (
      <a
        className="lh-hub-door is-live"
        href={door.href}
        style={{ ['--stagger' as string]: index }}
      >
        {inner}
      </a>
    );
  }

  return (
    <div
      aria-disabled="true"
      className="lh-hub-door is-soon"
      style={{ ['--stagger' as string]: index }}
    >
      {inner}
    </div>
  );
}

export function LiivvHealthPage({ featuredKits }: Props) {
  const { reduceMotion, rootClassName } = useWhMotion('liivv-health');
  const marqueeItems = [...HEALTH_HUB_MARQUEE, ...HEALTH_HUB_MARQUEE];
  const hasKits = featuredKits.length > 0;

  return (
    <div className={rootClassName} id="liivv-health">
      {/* SECTION 1 — HERO */}
      <section aria-label="Liivv Health hero" className="lh-hub-hero">
        <div className="lh-hub-hero-stage">
          <div aria-hidden className="lh-hub-hero-glow">
            <span />
            <span />
          </div>

          <div className="lh-hub-hero-copy">
            <span className="lh-hub-hero-kicker">
              <i />
              Liivv Health
            </span>
            <h1>
              Care that meets you <em>where you are</em>
            </h1>
            <p>
              One shelf can&apos;t know your story. Step into a hub built around you — Women&apos;s Health,
              Diabetes, Ostomy, and more. Tailored guidance, honest talk, and products for the season
              you&apos;re in.
            </p>
            <a className="lh-hub-hero-cta" href="#doors">
              Start your customized path
            </a>
          </div>

          <div aria-hidden className="lh-hub-hero-media">
            {reduceMotion ? (
              <img alt="" src={`${HOME_IMG}/corner-womens.png`} />
            ) : (
              <video
                autoPlay
                className="lh-hub-hero-video"
                loop
                muted
                playsInline
                poster={`${HOME_IMG}/corner-womens.png`}
                preload="metadata"
              >
                <source src={`${HOME_IMG}/liivvhealth.mp4`} type="video/mp4" />
              </video>
            )}
            <div className="lh-hub-hero-veil" />
          </div>
        </div>
      </section>

      {/* SECTION 2 — AILMENT MARQUEE */}
      <section aria-label="Care verticals" className="lh-hub-marquee">
        <div className="lh-hub-marquee-track">
          {marqueeItems.map((label, index) => (
            <span key={`${label}-${index}`}>{label}</span>
          ))}
        </div>
      </section>

      {/* SECTION 3 — 11 MICRO-SITE DOORS */}
      <section aria-label="Eleven specialized micro-sites" className="lh-hub-doors rounded-top" id="doors">
        <div className="container" data-reveal>
          <span className="eyebrow">Eleven specialized micro-sites</span>
          <h2>Find the care story that fits</h2>
          <p className="lh-hub-lead">
            Live destinations open today. The rest are on the way — same calm storytelling when they
            arrive.
          </p>
          <div className="lh-hub-doors-grid" data-reveal data-reveal-stagger>
            {HEALTH_HUB_DOORS.map((door, index) => (
              <DoorCard door={door} index={index} key={door.id} />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 — STORYTELLING BAND */}
      <section aria-label="Why Liivv Health" className="lh-hub-story rounded-top" id="story">
        <div className="container lh-hub-story-grid" data-reveal>
          <div className="lh-hub-story-copy">
            <span className="eyebrow">Not just a shelf</span>
            <h2>Care journeys need a deeper story</h2>
            <p>
              Liivv Your Life is shopping, pharmacy, and everyday essentials. Liivv Health is where we
              go further — specialized micro-sites with guidance, chapters, and kits built for a
              particular season of care.
            </p>
            <div className="lh-hub-story-links">
              {HEALTH_HUB_STORY_LINKS.map((link) => (
                <a href={link.href} key={link.id}>
                  {link.label}
                </a>
              ))}
            </div>
          </div>
          <div aria-hidden className="lh-hub-story-media">
            <img alt="" src={`${HOME_IMG}/hero-living.png`} />
          </div>
        </div>
      </section>

      {/* SECTION 5 — CURATED KITS */}
      <section aria-label="Curated kits" className="lh-hub-kits rounded-top" id="kits">
        <div className="container">
          <div data-reveal>
            <span className="eyebrow">Curated kits</span>
            <h2>Start curated. Finish as yours.</h2>
            <p className="lh-hub-lead">
              Each live micro-site carries kits tuned to that care journey — customize on the kit page
              and save for later. More verticals, more kits, as we open doors.
            </p>
          </div>
          {hasKits ? (
            <div className="lh-hub-kits-grid" data-reveal data-reveal-stagger>
              {featuredKits.map((kit, index) => (
                <a
                  className="lh-hub-kit-card"
                  href={kit.path}
                  key={`${kit.verticalLabel}-${kit.entityId}`}
                  style={{ ['--stagger' as string]: index }}
                >
                  <div className="lh-hub-kit-media">
                    {kit.image?.src ? (
                      <img alt={kit.image.alt || kit.name} src={kit.image.src} />
                    ) : (
                      <div aria-hidden className="lh-hub-kit-fallback" />
                    )}
                  </div>
                  <span className="lh-hub-kit-badge">{kit.verticalLabel}</span>
                  <h3>{kit.name}</h3>
                  {kit.priceLabel ? <p className="lh-hub-kit-price">{kit.priceLabel}</p> : null}
                  <span className="lh-hub-kit-link">View kit</span>
                </a>
              ))}
            </div>
          ) : (
            <div className="lh-hub-kits-fallback" data-reveal>
              <p>Explore kits inside the live micro-sites while we load the latest edits.</p>
              <div className="lh-hub-story-links">
                <a href="/liivv-health/womens-health#build-your-kit">Women&apos;s Health kits</a>
                <a href="/liivv-health/ostomy-care#build-your-kit">Ostomy Care kits</a>
              </div>
            </div>
          )}
          <div className="lh-hub-kits-cta" data-reveal>
            <a className="btn btn-outline" href="/liivv-health/womens-health#build-your-kit">
              Women&apos;s kits
            </a>
            <a className="btn btn-outline" href="/liivv-health/ostomy-care#build-your-kit">
              Ostomy kits
            </a>
          </div>
        </div>
      </section>

      {/* SECTION 6 — ASK A PHARMACIST */}
      <section aria-label="Ask a pharmacist" className="lh-hub-pharmacist rounded-top" id="ask-a-pharmacist">
        <div className="container lh-hub-pharmacist-grid" data-reveal>
          <div className="lh-hub-pharmacist-media">
            <img alt="" src={`${HOME_IMG}/care-chat.png`} />
          </div>
          <div>
            <span className="eyebrow">Available in Ontario</span>
            <h2>Ask a pharmacist</h2>
            <p>
              Clear answers, no med-speak, no judgment. Chat with an Ontario pharmacist during
              business hours — until 5 p.m. Eastern. Outside those hours, Olivia can help with
              shopping and your account.
            </p>
            <a className="btn btn-dark" href={PHARMACIST_HREF}>
              Talk to a pharmacist
            </a>
          </div>
        </div>
      </section>

      {/* SECTION 7 — HEALTH PROFILE ONBOARDING */}
      <section aria-label="Health Profile onboarding" className="lh-hub-profile rounded-top" id="health-profile">
        <div className="container lh-hub-profile-grid" data-reveal>
          <div>
            <span className="eyebrow">My Account</span>
            <h2>Build your Health Profile</h2>
            <p>
              Onboarding starts with the care interests that matter to you — the same eleven
              verticals you see here. Your Health Profile personalizes the dashboard and helps us
              point you to the right micro-site.
            </p>
            <a className="btn btn-dark" href={HEALTH_PROFILE_HREF}>
              Set up Health Profile
            </a>
          </div>
          <div aria-hidden className="lh-hub-profile-chips">
            {HEALTH_HUB_DOORS.slice(0, 6).map((door) => (
              <span className="lh-hub-profile-chip" key={door.id}>
                <img alt="" src={door.image} />
                {door.title.split('&')[0]?.trim() ?? door.title}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8 — CLOSING */}
      <section className="lh-hub-closing rounded-top" data-reveal id="manifesto">
        <div className="lh-hub-closing-bg">
          <img alt="" src={`${WH_IMG}/closing.jpg`} />
        </div>
        <div className="container">
          <p className="lh-hub-manifesto-kicker">The Liivv Health promise</p>
          <h2>
            Specialized care.
            <br />
            <span>Told with kindness.</span>
          </h2>
          <p>
            No shame. No hype. Just micro-sites, kits, and pharmacist support that meet you where you
            are — at your pace.
          </p>
          <div className="lh-hub-closing-cta">
            <a className="btn btn-white" href="#doors">
              Explore the 11
            </a>
            <a className="btn btn-ghost" href={PHARMACIST_HREF}>
              Ask a pharmacist
            </a>
            <a className="btn btn-ghost" href={HEALTH_PROFILE_HREF}>
              Health Profile
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
