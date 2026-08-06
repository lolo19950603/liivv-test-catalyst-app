'use client';

import { useState } from 'react';

import './womens-health-demo.css';

const SHOP_HREF = '/liivv-health/womens-health/shop-womens-health';
const PHARMACIST_HREF = '/account/virtual-care';

const TIMELINE = [
  {
    category: 'Know your rhythm',
    heading: 'Start with you',
    paragraphs: [
      'Tell us a little about your everyday — what feels good, what feels off, what you’d love more of.',
      'That’s all we need to start shaping care around your life, not the other way around.',
    ],
    cta: 'Get Started',
    href: SHOP_HREF,
    image:
      'https://images.unsplash.com/photo-1492725764893-90b379c2b6e1?auto=format&fit=crop&w=1200&q=80',
  },
  {
    category: 'Stock your calm',
    heading: 'Essentials on repeat',
    paragraphs: [
      'Your comfort staples, chosen once and delivered before you run out.',
      'The little things stay on the shelf — so your energy stays on your week.',
    ],
    cta: 'Get Started',
    href: SHOP_HREF,
    image:
      'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=1200&q=80',
  },
  {
    category: 'Ask without the awkward',
    heading: 'Chat when you need it',
    paragraphs: [
      'Some questions are easier typed than said out loud.',
      'Talk with a friendly pharmacist from wherever you’re comfiest — no waiting room, no judgment.',
    ],
    cta: 'Talk to a Pharmacist',
    href: PHARMACIST_HREF,
    image:
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    category: 'Shop what fits',
    heading: 'Your marketplace',
    paragraphs: [
      'A marketplace curated for real routines — comfort, care, and glow.',
      'Minus the overwhelm of a thousand tabs and the whisper aisle.',
    ],
    cta: 'Explore the Shop',
    href: SHOP_HREF,
    image:
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    category: 'Liivv well',
    heading: 'Living, not managing',
    paragraphs: [
      'Routines that quietly hold you in the background.',
      'So your energy goes where it belongs: the life you’re actually living.',
    ],
    cta: 'Liivv Well',
    href: SHOP_HREF,
    image:
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
  },
] as const;

const CHAPTERS = [
  {
    eyebrow: 'Chapter one',
    title: 'Foundation & First Cycles',
    focus:
      'First period nerves, irregular cycles, hormonal skin, discretion at school, and the vitamins that build a strong start.',
    vibe: 'Supportive, demystifying, and parent-friendly — without talking down to the teen.',
    image:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=1200&q=80',
  },
  {
    eyebrow: 'Chapter two',
    title: 'Rhythm & Balance',
    focus:
      'Busy schedules, hormonal breakouts, gut + vaginal health, sleep + stress, and birth control side effects or options.',
    vibe: 'Modern, aesthetic, and highly functional. Wellness that works IRL.',
    image:
      'https://images.unsplash.com/photo-1487412912498-0447578c4214?auto=format&fit=crop&w=1200&q=80',
  },
  {
    eyebrow: 'Chapter three',
    title: 'Reset & Recharge',
    focus:
      'Hormonal imbalance, weight fluctuations, skin aging, stress, and burnout — met with care, not judgment.',
    vibe: 'Aspirational but accessible. Acknowledging burnout without making it a medical deficiency.',
    image:
      'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80',
  },
  {
    eyebrow: 'Chapter four',
    title: 'Grow & Recover',
    focus:
      'Fertility challenges, physical discomfort, recovery after birth, and breastfeeding stress — with room to breathe.',
    vibe: 'Empowering, deeply supportive, and strictly no shame.',
    image:
      'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=1200&q=80',
  },
  {
    eyebrow: 'Chapter five',
    title: 'Transition & Relief',
    focus:
      'Sleep disruption, bone density, low metabolism, night sweats, and mood swings — comfort you can feel.',
    vibe: 'Reclaiming comfort. Sleek, discreet, and highly effective.',
    image:
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
  },
  {
    eyebrow: 'Chapter six',
    title: 'Longevity & Vitality',
    focus:
      'Joint comfort, cognitive health, mobility, and energy — so the years ahead stay full of your favourite things.',
    vibe: 'Active, capable, and vibrant. Removing the stigma of aging aids.',
    image:
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80',
  },
] as const;

const MARQUEE = [
  'Everyday Rhythm',
  'Glow & Nourish',
  'Cycle Comfort',
  'Finding Balance',
  'Aging Softly',
  'Personal Care',
  'Rest & Restore',
  'Skin & Glow',
  'Body Kindness',
  'Quiet Strength',
] as const;

const PILL_IMAGES = [
  'https://images.unsplash.com/photo-1492725764893-90b379c2b6e1?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1484101403537-ffe3e70ffa29?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=400&q=80',
] as const;

export function WomensHealthDemoPage() {
  const [timelineIndex, setTimelineIndex] = useState(0);
  const slide = TIMELINE[timelineIndex] ?? TIMELINE[0];

  const goPrev = () => {
    setTimelineIndex((i) => (i === 0 ? TIMELINE.length - 1 : i - 1));
  };

  const goNext = () => {
    setTimelineIndex((i) => (i === TIMELINE.length - 1 ? 0 : i + 1));
  };

  return (
    <div id="wh-demo">
      <section className="hero" aria-label="Women's Health hero">
        <div className="hero-inner">
          <h1>You, in every season</h1>
          <p>
            Care that moves with your life — never against it. From your everyday rhythm to whole new
            chapters, Liivv is right beside you.
          </p>
        </div>
      </section>

      <section className="highlight-text rounded-top">
        <div className="pill-row">
          {PILL_IMAGES.slice(0, 4).map((src) => (
            <div className="media media--pill" key={src} style={{ backgroundImage: `url('${src}')` }} />
          ))}
        </div>
        <h2>
          Liivv <span className="swash">Women</span> is your{' '}
          <span className="swash sage">everyday rhythm</span> for living well
        </h2>
        <div className="pill-row">
          {PILL_IMAGES.slice(4).map((src) => (
            <div className="media media--pill" key={src} style={{ backgroundImage: `url('${src}')` }} />
          ))}
        </div>
      </section>

      <section className="counters">
        <div className="container counters-grid">
          <div>
            <div className="num">
              10k<sup>+</sup>
            </div>
            <p>women in the Liivv community, and growing every day</p>
          </div>
          <div>
            <div className="num">
              24<sup>/7</sup>
            </div>
            <p>Olivia for shopping and account help — anytime</p>
          </div>
          <div>
            <div className="num">
              19<sup>+</sup>
            </div>
            <p>everyday concerns our Ontario pharmacists can help with in chat during business hours</p>
          </div>
          <div>
            <div className="num">1</div>
            <p>place for your wellness — your way, your pace</p>
          </div>
        </div>
      </section>

      <section aria-hidden className="marquee">
        <div className="marquee-track">
          {[0, 1].flatMap((copy) =>
            MARQUEE.flatMap((label, i) => {
              const nodes = [<span key={`${copy}-${label}`}>{label}</span>];

              if ((i + 1) % 5 === 0) {
                nodes.push(
                  <span className="logo-dot" key={`${copy}-logo-${i}`}>
                    L
                  </span>,
                );
              }

              return nodes;
            }),
          )}
        </div>
      </section>

      <section className="timeline rounded-top">
        <div className="container">
          <div className="timeline-header">
            <p className="small-heading">
              No two of us live the same week. Here&apos;s how Liivv fits itself around yours — not the
              other way around.
            </p>
            <h2>
              Your journey, <span className="swash">your pace</span>
            </h2>
          </div>

          <div className="timeline-nav">
            <button aria-label="Previous journey step" onClick={goPrev} type="button">
              ‹
            </button>
            <button aria-label="Next journey step" onClick={goNext} type="button">
              ›
            </button>
          </div>

          <div className="timeline-slide">
            <div className="copy">
              <p className="category">{slide.category}</p>
              <h3>{slide.heading}</h3>
              {slide.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
              <a className="btn btn-dark" href={slide.href}>
                {slide.cta}
              </a>
            </div>
            <div
              aria-hidden
              className="media"
              style={{ backgroundImage: `url('${slide.image}')` }}
            />
          </div>

          <div aria-label="Timeline steps" className="timeline-dots" role="tablist">
            {TIMELINE.map((step, i) => (
              <button
                aria-selected={i === timelineIndex}
                className={i === timelineIndex ? 'active' : undefined}
                key={step.category}
                onClick={() => setTimelineIndex(i)}
                role="tab"
                type="button"
              >
                {step.category}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="pillars rounded-top">
        <div className="container">
          <span className="eyebrow">The Liivv Women edit</span>
          <h2>Four ways to feel like yourself</h2>
          <p className="intro">
            Everything here earns its place the same way — it makes an ordinary day a little softer.
          </p>
          <div className="pillars-grid">
            <div className="pillar">
              <div
                aria-hidden
                className="media"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=800&q=80')",
                }}
              />
              <h3>Daily Comfort</h3>
              <div className="sub">For the every-month and the every-day</div>
              <p>Cycle care and comfort essentials that show up on time, so that week is just another week.</p>
            </div>
            <div className="pillar">
              <div
                aria-hidden
                className="media"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80')",
                }}
              />
              <h3>Body Confidence</h3>
              <div className="sub">Personal care, zero whisper aisle</div>
              <p>
                Intimate and personal care picked with honesty — delivered discreetly, discussed openly
                whenever you want.
              </p>
            </div>
            <div className="pillar">
              <div
                aria-hidden
                className="media"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80')",
                }}
              />
              <h3>Nourish &amp; Glow</h3>
              <div className="sub">From the inside out</div>
              <p>Daily nutrition and skin-loving staples that keep pace with busy weeks and full plates.</p>
            </div>
            <div className="pillar">
              <div
                aria-hidden
                className="media"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80')",
                }}
              />
              <h3>Rest that Restores</h3>
              <div className="sub">Because tomorrow needs you</div>
              <p>Wind-down rituals and sleep support for nights that actually recharge you.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="images-text rounded-top">
        <div className="container images-text-grid">
          <div className="visuals">
            <div
              aria-hidden
              className="media big"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1000&q=80')",
              }}
            />
            <div
              aria-hidden
              className="media small"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80')",
              }}
            />
          </div>
          <div>
            <span className="eyebrow">Available in Ontario</span>
            <h2>Relief that doesn&apos;t wait on a waiting room</h2>
            <p>
              Some days your body just asks for a little backup — and you shouldn&apos;t need to rearrange
              your whole week to get it.
            </p>
            <p>
              Our friendly Ontario pharmacists can chat through everyday concerns — from monthly cramps to
              skin flare-ups — during business hours (until 5 p.m. Eastern). No appointment, no waiting room
              playlist.
            </p>
            <p>
              Real expertise, delivered like a conversation with someone who gets it. Outside those hours,
              Olivia can help with shopping and your account — she does not give medical advice.
            </p>
            <a className="btn btn-white" href={PHARMACIST_HREF}>
              Talk to a Pharmacist
            </a>
          </div>
        </div>
      </section>

      <section className="images-text tips-pair rounded-top">
        <div className="container images-text-grid">
          <div className="visuals">
            <div
              aria-hidden
              className="media big"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1484101403537-ffe3e70ffa29?auto=format&fit=crop&w=1000&q=80')",
              }}
            />
            <div
              aria-hidden
              className="media small"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80')",
              }}
            />
          </div>
          <div className="copy">
            <span className="eyebrow">A little wisdom for the week</span>
            <h2>Tips that meet you where you are</h2>
            <p>
              Women&apos;s health isn&apos;t one routine — it&apos;s small habits that soften the loud weeks
              and stretch the quiet ones.
            </p>
            <p>
              Track how you feel across your month. Stock comfort essentials before you need them. Prioritize
              sleep the same week your energy dips. And when something feels off, chat with an Ontario
              pharmacist during business hours — until 5 p.m. Eastern.
            </p>
            <p>Small adjustments, real rhythm. That&apos;s the Liivv Women way.</p>
            <a className="btn btn-dark" href={SHOP_HREF}>
              Explore Women&apos;s Essentials
            </a>
          </div>
        </div>
      </section>

      <section className="story rounded-top" id="clair">
        <div className="container">
          <div className="banner">
            <h2>Also in the edit: Clair</h2>
            <div
              aria-hidden
              className="media"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1400&q=80')",
              }}
            />
          </div>
          <div className="story-grid">
            <h2>
              Continuous clarity, <span className="accent">when you want it.</span>
            </h2>
            <div>
              <p>
                Clair is a wearable from Clair Health that reads your body&apos;s key signals continuously —
                so you can see the shape of your month instead of guessing through it.
              </p>
              <p>
                It&apos;s one part of the Liivv Women lineup, right beside comfort essentials, personal care,
                nutrition, and sleep support. Same calm place. Same discreet delivery.
              </p>
              <p className="strong-close">
                Curious how it works, when it ships, or how to pre-order? A dedicated Clair page is next in
                this demo set — for now, explore the Women&apos;s edit.
              </p>
              <div className="story-cta">
                <a className="btn btn-dark" href={SHOP_HREF}>
                  Shop Women&apos;s Essentials
                </a>
                <a className="btn btn-outline" href="#find-your-chapter">
                  Find your chapter
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Find your chapter" className="chapters" id="find-your-chapter">
        {CHAPTERS.map((chapter) => (
          <div className="chapter" key={chapter.title}>
            <div
              aria-hidden
              className="media"
              style={{ backgroundImage: `url('${chapter.image}')` }}
            />
            <div>
              <span className="eyebrow">{chapter.eyebrow}</span>
              <h3>{chapter.title}</h3>
              <p className="focus-label">The Focus</p>
              <p>{chapter.focus}</p>
              <p className="vibe-label">The Liivv Vibe</p>
              <p>{chapter.vibe}</p>
              <a className="btn btn-dark" href="#find-your-chapter">
                Learn more
              </a>
            </div>
          </div>
        ))}
      </section>

      <section className="voices rounded-top">
        <div className="container">
          <h2>
            What women <em>are saying</em>
          </h2>
          <div className="voice-cards">
            <div className="voice">
              <blockquote>
                &ldquo;I finally asked a pharmacist a question I&apos;d been too shy to ask anyone for a year.
                Got a kind, straight answer on my lunch break — no waiting room, no judgment.&rdquo;
              </blockquote>
              <div className="who">
                <div
                  aria-hidden
                  className="media media--avatar"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80')",
                  }}
                />
                <div>
                  Priya
                  <span>Toronto · juggling two kids and a startup</span>
                </div>
              </div>
            </div>
            <div className="voice">
              <blockquote>
                &ldquo;My monthly box shows up like clockwork. I genuinely forgot what running-out-of-everything
                panic feels like.&rdquo;
              </blockquote>
              <div className="who">
                <div
                  aria-hidden
                  className="media media--avatar"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80')",
                  }}
                />
                <div>
                  Dana
                  <span>Ottawa · marathon-in-training</span>
                </div>
              </div>
            </div>
            <div className="voice">
              <blockquote>
                &ldquo;I used to keep three apps and a drawer of half-finished bottles. Now my essentials arrive
                before I run out — and Sundays feel like mine again.&rdquo;
              </blockquote>
              <div className="who">
                <div
                  aria-hidden
                  className="media media--avatar"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80')",
                  }}
                />
                <div>
                  Maya
                  <span>34 · Liivv member since 2024</span>
                </div>
              </div>
            </div>
            <div className="voice">
              <blockquote>
                &ldquo;The sleep support and skin staples in one place changed my month. I stopped bouncing
                between three different shops.&rdquo;
              </blockquote>
              <div className="who">
                <div
                  aria-hidden
                  className="media media--avatar"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80')",
                  }}
                />
                <div>
                  Sofia
                  <span>Mississauga · Liivv Women regular</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="faq rounded-top">
        <h2>Good questions, honest answers</h2>
        <p className="intro">The things people actually ask us — answered like a friend would, not a form letter.</p>

        <details open>
          <summary>Is this only for one age or stage of life?</summary>
          <p>
            Not at all. Liivv Women is built around life chapters — Foundation &amp; First Cycles, Rhythm
            &amp; Balance, Reset &amp; Recharge, Grow &amp; Recover, Transition &amp; Relief, and Longevity
            &amp; Vitality. Chapters follow where you are, not a number. You pick what fits; we follow your
            lead.
          </p>
        </details>
        <details>
          <summary>What is Clair?</summary>
          <p>
            Clair is a wearable continuous hormone monitor from Clair Health, available through Liivv as part
            of the Women lineup. For how it works, shipping, and pre-order details, see the Clair feature
            above — a dedicated Clair page is next in this demo set.
          </p>
        </details>
        <details>
          <summary>What kinds of products does Liivv Women include?</summary>
          <p>
            Cycle comfort, personal care, nutrition and glow, sleep support, CarePack for daily essentials —
            plus pharmacist chat in Ontario. Clair sits in the lineup as an optional wearable if you want
            continuous clarity on your rhythm.
          </p>
        </details>
        <details>
          <summary>How private is my order?</summary>
          <p>
            Very. Everything arrives in plain, discreet packaging, and your conversations with our team stay
            between you and us. What you order is nobody&apos;s business but yours.
          </p>
        </details>
        <details>
          <summary>What can I actually chat with a pharmacist about?</summary>
          <p>
            Everyday stuff — monthly comfort, skin flare-ups, sleep that won&apos;t come, &ldquo;is this
            normal?&rdquo; moments. In Ontario, our pharmacists can assess and help with 19+ everyday concerns
            in chat during business hours (until 5 p.m. Eastern). Olivia is available anytime for orders,
            products, and account help — she does not give medical advice.
          </p>
        </details>
        <details>
          <summary>What&apos;s a CarePack?</summary>
          <p>
            Your daily essentials, organized by day and dose into one tidy pack — so mornings start with one
            small rip instead of a shelf of bottles. Set it once and it keeps arriving.
          </p>
        </details>
        <details>
          <summary>Can I change or pause my routine anytime?</summary>
          <p>
            Always. Life shifts, and your Liivv should shift with it. Swap products, skip a month, or pause
            entirely — no phone calls, no guilt trips.
          </p>
        </details>
      </section>

      <section className="closing rounded-top">
        <div className="container">
          <h2>
            Your next chapter <span>starts soft</span>
          </h2>
          <p>Whatever season you&apos;re in, there&apos;s a version of well that feels like you. Let&apos;s find it together.</p>
          <a className="btn btn-white" href={SHOP_HREF}>
            Shop Women&apos;s Wellness
          </a>
        </div>
      </section>
    </div>
  );
}
