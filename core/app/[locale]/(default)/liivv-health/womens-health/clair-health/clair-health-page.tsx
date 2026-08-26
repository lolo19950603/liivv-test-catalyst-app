'use client';

import { useCallback, useEffect, useRef, useState, type MutableRefObject, type RefObject } from 'react';
import { useLocale } from 'next-intl';

import { useWhMotion } from '../use-wh-motion';

import { getClairCopy, type ClairCopy } from './copy';

import './clair-health.css';
import '../wh-motion.css';

/*
 * =============================================================================
 * CLAIR — CONTENT MAP (Canada wellness positioning)
 * =============================================================================
 * Page URL: /liivv-health/womens-health/clair-health
 *
 * Copy lives in ./copy.ts (EN + FR). Guardrails: docs/Clair-Canada-Claims-Audit.md
 * Images live under: /public/archive/womens-health/clair-site/
 * =============================================================================
 */

const IMG = '/archive/womens-health';
const SITE = `${IMG}/clair-site`;
const FRAME_COUNT = 40;
const FRAME_SRC = (index: number) =>
  `${IMG}/clair-frames/frame-${String(index + 1).padStart(3, '0')}.webp`;
const HERO_POSTER = FRAME_SRC(0);
const WOMEN_HREF = '/liivv-health/womens-health';
const PREORDER_HREF = '/clair-health-wristband/';

/** Editorial coverage only — no government/health-agency marks. */
const PRESS = [
  { src: `${SITE}/press/forbes.svg`, alt: 'Forbes' },
  { src: `${SITE}/press/fortune.svg`, alt: 'Fortune' },
  { src: `${SITE}/press/techcrunch.svg`, alt: 'TechCrunch' },
  { src: `${SITE}/press/the-print.svg`, alt: 'ThePrint' },
  { src: `${SITE}/press/fitt.svg`, alt: 'Fitt Insider' },
  { src: `${SITE}/press/athletech.svg`, alt: 'Athletech NEWS' },
  { src: `${SITE}/press/indian-express.svg`, alt: 'The Indian Express' },
  { src: `${SITE}/press/wellworthy.svg`, alt: 'wellworthy' },
] as const;

type StageParticle = {
  angle: number;
  radiusNorm: number;
  phase: number;
  orbitSpeed: number;
  phaseSpeed: number;
  waveAmp: number;
  size: number;
  alpha: number;
  ox: number;
  oy: number;
};

function StageStarField({
  activeIndex,
  attract,
  containerRef,
  cardRefs,
}: {
  activeIndex: number;
  attract: boolean;
  containerRef: RefObject<HTMLDivElement | null>;
  cardRefs: MutableRefObject<(HTMLButtonElement | null)[]>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<StageParticle[]>([]);
  const rafRef = useRef(0);
  const timeRef = useRef(0);
  const strengthRef = useRef(0);
  const activeIndexRef = useRef(activeIndex);
  const attractRef = useRef(attract);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
    strengthRef.current = Math.max(strengthRef.current, 0.55);
  }, [activeIndex]);

  useEffect(() => {
    attractRef.current = attract;
  }, [attract]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let cancelled = false;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const PARTICLE_COUNT = 900;
    const WAVE_FREQ = 6;

    const seedParticles = () => {
      particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => ({
        angle: Math.random() * Math.PI * 2,
        radiusNorm: 0.35 + Math.pow(Math.random(), 0.65) * 0.65,
        phase: Math.random() * Math.PI * 2,
        orbitSpeed: 0.001 + Math.random() * 0.0024,
        phaseSpeed: 0.01 + Math.random() * 0.022,
        waveAmp: 5 + Math.random() * 12,
        size: 0.35 + Math.random() * 0.75,
        alpha: 0.28 + Math.random() * 0.5,
        ox: 0,
        oy: 0,
      }));
    };

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedParticles();
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    const tick = () => {
      if (cancelled) return;
      const { width, height } = container.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const photo = container.querySelector('.clair-stages-photo') as HTMLElement | null;
      const photoSize = photo?.getBoundingClientRect().width ?? Math.min(width, height) * 0.42;
      const maxRadius = photoSize / 2 + 72;

      if (!reduceMotion) timeRef.current += 1;
      const t = timeRef.current;

      const card = cardRefs.current[activeIndexRef.current];
      let attractX = cx;
      let attractY = cy;
      if (card && attractRef.current) {
        const layout = container.getBoundingClientRect();
        const rect = card.getBoundingClientRect();
        attractX = rect.left - layout.left + rect.width / 2;
        attractY = rect.top - layout.top + rect.height / 2;
        strengthRef.current = Math.min(1, strengthRef.current + 0.05);
      } else {
        strengthRef.current = Math.max(0, strengthRef.current - 0.035);
      }
      const strength = strengthRef.current;

      for (const particle of particlesRef.current) {
        if (!reduceMotion) {
          particle.angle += particle.orbitSpeed * (1 + strength * 0.4);
          particle.phase += particle.phaseSpeed;
        }

        const wave =
          Math.sin(particle.angle * WAVE_FREQ + particle.phase + t * 0.018) * particle.waveAmp * 0.55 +
          Math.sin(particle.angle * (WAVE_FREQ * 0.5) - particle.phase * 0.7 + t * 0.01) *
            particle.waveAmp *
            0.2;
        const radius = Math.max(2, particle.radiusNorm * maxRadius + wave * particle.radiusNorm);
        const homeX = cx + Math.cos(particle.angle) * radius;
        const homeY = cy + Math.sin(particle.angle) * radius;

        if (strength > 0.02) {
          const dx = attractX - homeX;
          const dy = attractY - homeY;
          particle.ox += (dx * 0.14 * strength - particle.ox) * 0.07;
          particle.oy += (dy * 0.14 * strength - particle.oy) * 0.07;
        } else {
          particle.ox *= 0.9;
          particle.oy *= 0.9;
        }

        const x = homeX + particle.ox;
        const y = homeY + particle.oy;
        const size = particle.size * (1 + strength * 0.35);

        ctx.beginPath();
        ctx.fillStyle = `rgba(233, 117, 48, ${Math.min(1, particle.alpha * (0.7 + strength * 0.35))})`;
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      observer.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [cardRefs, containerRef]);

  return <canvas aria-hidden className="clair-stages-stars" ref={canvasRef} />;
}

function Pic({
  src,
  className = '',
  alt = '',
}: {
  src: string;
  className?: string;
  alt?: string;
}) {
  return (
    <div aria-hidden={alt === '' || undefined} className={`clair-pic ${className}`.trim()}>
      <img alt={alt} decoding="async" loading="lazy" src={src} />
    </div>
  );
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
) {
  const imageRatio = image.width / image.height;
  const canvasRatio = width / height;
  let drawWidth: number;
  let drawHeight: number;
  let offsetX: number;
  let offsetY: number;

  if (imageRatio > canvasRatio) {
    drawHeight = height;
    drawWidth = drawHeight * imageRatio;
    offsetX = (width - drawWidth) / 2;
    offsetY = 0;
  } else {
    drawWidth = width;
    drawHeight = drawWidth / imageRatio;
    offsetX = 0;
    offsetY = (height - drawHeight) / 2;
  }

  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
}

function ScrollFrameHero({ hero }: { hero: ClairCopy['hero'] }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<(HTMLImageElement | null)[]>([]);
  const frameIndexRef = useRef(0);
  const rafRef = useRef(0);
  const [canvasReady, setCanvasReady] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const paint = useCallback((index: number) => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = stage.clientWidth;
    const height = stage.clientHeight;
    if (width === 0 || height === 0) return;

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    const frames = framesRef.current;
    const image =
      frames[index] ??
      frames.slice(0, index + 1).reverse().find(Boolean) ??
      frames.find(Boolean);

    if (!image) return;
    drawCover(ctx, image, width, height);
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    let cancelled = false;
    framesRef.current = Array.from({ length: FRAME_COUNT }, () => null);

    const warm = async () => {
      try {
        const first = await loadImage(FRAME_SRC(0));
        if (cancelled) return;
        framesRef.current[0] = first;
        setCanvasReady(true);
        paint(0);

        if (reduceMotion) return;

        const batchSize = 4;
        for (let start = 1; start < FRAME_COUNT; start += batchSize) {
          if (cancelled) return;
          const end = Math.min(start + batchSize, FRAME_COUNT);
          await Promise.allSettled(
            Array.from({ length: end - start }, (_, offset) => {
              const index = start + offset;
              return loadImage(FRAME_SRC(index)).then((image) => {
                framesRef.current[index] = image;
                return image;
              });
            }),
          );
        }
      } catch {
        /* Poster remains if frames fail. */
      }
    };

    let idleHandle: number | undefined;
    let timeoutHandle: number | undefined;

    if ('requestIdleCallback' in window) {
      idleHandle = window.requestIdleCallback(() => {
        void warm();
      }, { timeout: 2500 });
    } else {
      timeoutHandle = window.setTimeout(() => {
        void warm();
      }, 120);
    }

    return () => {
      cancelled = true;
      if (idleHandle != null && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleHandle);
      }
      if (timeoutHandle != null) {
        window.clearTimeout(timeoutHandle);
      }
    };
  }, [paint, reduceMotion]);

  useEffect(() => {
    if (reduceMotion) return;

    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const update = () => {
      const rect = wrapper.getBoundingClientRect();
      const total = Math.max(wrapper.offsetHeight - window.innerHeight, 1);
      const progress = Math.min(Math.max(-rect.top / total, 0), 1);
      const nextIndex = Math.round(progress * (FRAME_COUNT - 1));

      if (nextIndex === frameIndexRef.current) return;
      frameIndexRef.current = nextIndex;

      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => paint(nextIndex));
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    const onResize = () => {
      paint(frameIndexRef.current);
      update();
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [paint, reduceMotion, canvasReady]);

  return (
    <div className="clair-hero-scroll" ref={wrapperRef}>
      <section aria-label={hero.aria} className="clair-hero" ref={stageRef}>
        <img
          alt={hero.alt}
          className="clair-hero-poster-img"
          decoding="async"
          fetchPriority="high"
          src={HERO_POSTER}
        />
        <canvas
          aria-hidden
          className={`clair-hero-canvas${canvasReady && !reduceMotion ? ' is-ready' : ''}`}
          ref={canvasRef}
        />
        <div aria-hidden className="clair-hero-veil" />
        <div className="clair-hero-inner">
          <div className="clair-hero-copy">
            <h1>{hero.h1}</h1>
            <p className="clair-hero-keywords">{hero.keywords}</p>
            <p className="clair-hero-lead">
              <em>{hero.lead}</em>
            </p>
            <div className="clair-cta-row">
              <a className="clair-btn clair-btn-ember" href={PREORDER_HREF}>
                {hero.cta}
              </a>
              <a className="clair-btn clair-btn-ghost" href="#stages">
                {hero.secondary}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function ClairHealthPage() {
  const locale = useLocale();
  const copy = getClairCopy(locale);
  const stages = copy.stages.cards;
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeStage, setActiveStage] = useState(0);
  const [stagesPaused, setStagesPaused] = useState(false);
  const stagesLayoutRef = useRef<HTMLDivElement>(null);
  const stageCardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const { rootClassName } = useWhMotion('clair-health');

  useEffect(() => {
    if (stagesPaused) return;

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches) return;

    const timer = window.setInterval(() => {
      setActiveStage((current) => (current + 1) % stages.length);
    }, 3200);

    return () => window.clearInterval(timer);
  }, [stages.length, stagesPaused]);

  const selectStage = (index: number) => {
    setActiveStage(index);
  };

  return (
    <div className={rootClassName} id="clair-health">
      <ScrollFrameHero hero={copy.hero} />

      <aside className="clair-notice" data-reveal>
        <p>{copy.notice}</p>
      </aside>

      <section className="clair-offer" id="preorder">
        <div className="clair-container clair-offer-grid" data-reveal>
          <div className="clair-offer-copy">
            <span className="clair-pill">
              <span className="clair-pill-dot" />
              {copy.offer.pill}
            </span>
            <h2>{copy.offer.h2}</h2>
            <p>{copy.offer.body}</p>
            <ul className="clair-offer-list" data-reveal data-reveal-stagger>
              {copy.offer.items.map((item, index) => (
                <li key={item.strong} style={{ ['--stagger' as string]: index }}>
                  <strong>{item.strong}</strong>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
            <a className="clair-btn clair-btn-ember" href={PREORDER_HREF}>
              {copy.offer.cta}
            </a>
            <p className="clair-offer-note">{copy.offer.note}</p>
          </div>
          <div className="clair-offer-media">
            <Pic alt={copy.hero.alt} src={`${SITE}/product.webp`} />
          </div>
        </div>
      </section>

      <section aria-label={copy.pressLabel} className="clair-press" data-reveal>
        <div className="clair-press-pill">
          <img alt="" height={12} src={`${SITE}/press/megaphone.svg`} width={12} />
          <p>{copy.pressLabel}</p>
        </div>
        <div className="clair-press-track-wrap">
          <div className="clair-press-track">
            {[0, 1].map((duplicate) => (
              <div className="clair-press-group" key={duplicate}>
                {PRESS.map((logo) => (
                  <img
                    alt={logo.alt}
                    className="clair-press-logo"
                    draggable={false}
                    key={`${duplicate}-${logo.alt}`}
                    src={logo.src}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="clair-stages" id="stages">
        <div className="clair-container">
          <header className="clair-section-head" data-reveal>
            <span className="clair-pill">
              <span className="clair-pill-dot" />
              {copy.stages.pill}
            </span>
            <h2>{copy.stages.h2}</h2>
            <p>{copy.stages.body}</p>
          </header>

          <div
            className="clair-stages-layout"
            data-reveal
            data-reveal-stagger
            onBlurCapture={() => setStagesPaused(false)}
            onFocusCapture={() => setStagesPaused(true)}
            onMouseEnter={() => setStagesPaused(true)}
            onMouseLeave={() => setStagesPaused(false)}
            ref={stagesLayoutRef}
          >
            <StageStarField
              activeIndex={activeStage}
              attract
              cardRefs={stageCardRefs}
              containerRef={stagesLayoutRef}
            />
            <div className="clair-stages-center">
              <div aria-hidden className="clair-pic clair-stages-photo">
                {stages.map((stage, index) => (
                  <img
                    alt=""
                    className={activeStage === index ? 'is-active' : undefined}
                    decoding="async"
                    key={stage.title}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    src={stage.image}
                  />
                ))}
              </div>
            </div>
            {stages.map((stage, index) => (
              <button
                aria-pressed={activeStage === index}
                className={`clair-stage-card clair-stage-card--${stage.corner}${activeStage === index ? ' is-active' : ''}`}
                key={stage.title}
                onClick={() => selectStage(index)}
                onFocus={() => selectStage(index)}
                onMouseEnter={() => selectStage(index)}
                ref={(node) => {
                  stageCardRefs.current[index] = node;
                }}
                style={{ ['--stagger' as string]: index }}
                type="button"
              >
                <h3>{stage.title}</h3>
                <p>{stage.body}</p>
              </button>
            ))}
          </div>

          <div className="clair-callouts" data-reveal>
            <p className="clair-callout">{copy.estimates}</p>
            <p className="clair-callout">{copy.reproductive}</p>
          </div>
        </div>
      </section>

      <section className="clair-story" data-reveal id="how-it-works">
        <div className="clair-container clair-story-grid">
          <div className="clair-story-media">
            <Pic alt={copy.story.alt} src={`${SITE}/product.webp`} />
          </div>
          <div className="clair-story-copy">
            <span className="clair-pill">
              <span className="clair-pill-dot" />
              {copy.story.pill}
            </span>
            <h2>{copy.story.h2}</h2>
            <p>{copy.story.p1}</p>
            <p>{copy.story.p2}</p>
            <p className="clair-callout">{copy.estimates}</p>
            <a className="clair-btn clair-btn-ember" href={PREORDER_HREF}>
              {copy.story.cta}
            </a>
          </div>
        </div>
      </section>

      <section className="clair-position" data-reveal id="what-clair-is">
        <div className="clair-container">
          <header className="clair-section-head">
            <span className="clair-pill">
              <span className="clair-pill-dot" />
              {copy.position.pill}
            </span>
            <h2>{copy.position.h2}</h2>
            <p>{copy.position.body}</p>
          </header>
          <div className="clair-position-grid" data-reveal data-reveal-stagger>
            {copy.position.items.map((item, index) => (
              <article
                className="clair-position-card"
                key={item.title}
                style={{ ['--stagger' as string]: index }}
              >
                <span className="clair-position-index">{String(index + 1).padStart(2, '0')}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="clair-privacy" data-reveal id="privacy">
        <div className="clair-container clair-privacy-grid">
          <div className="clair-privacy-copy">
            <span className="clair-pill">
              <span className="clair-pill-dot" />
              {copy.privacy.pill}
            </span>
            <h2>{copy.privacy.h2}</h2>
            <p>{copy.privacy.p1}</p>
            <p>{copy.privacy.p2}</p>
          </div>
          <div className="clair-privacy-media">
            <Pic alt="" src={`${SITE}/about-hero.webp`} />
          </div>
        </div>
      </section>

      <section aria-label={copy.team.h2} className="clair-team" data-reveal>
        <div className="clair-team-head">
          <div className="clair-team-pill">
            <img alt="" height={12} src={`${SITE}/team/user.svg`} width={12} />
            <p>{copy.team.pill}</p>
          </div>
          <h2>{copy.team.h2}</h2>
          <p>{copy.team.body}</p>
        </div>
        <ul className="clair-team-names">
          {copy.team.names.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      </section>

      <section className="clair-faq" data-reveal id="faq">
        <div className="clair-container clair-faq-grid">
          <header className="clair-faq-head">
            <span className="clair-pill">
              <span className="clair-pill-dot" />
              {copy.faq.pill}
            </span>
            <h2>{copy.faq.h2}</h2>
            <p>{copy.faq.body}</p>
          </header>
          <div className="clair-faq-list">
            {copy.faq.items.map((faq, index) => (
              <details key={faq.q} open={openFaq === index}>
                <summary
                  onClick={(event) => {
                    event.preventDefault();
                    setOpenFaq((current) => (current === index ? null : index));
                  }}
                >
                  {faq.q}
                </summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="clair-closing" data-reveal id="reserve">
        <div aria-hidden className="clair-closing-bg">
          <img alt="" decoding="async" loading="lazy" src={`${SITE}/closing.jpg`} />
        </div>
        <div className="clair-container clair-closing-inner">
          <p className="clair-closing-kicker">{copy.closing.kicker}</p>
          <h2>
            {copy.closing.h2}
            <br />
            <span>{copy.closing.accent}</span>
          </h2>
          <p>{copy.closing.body}</p>
          <div className="clair-closing-cta">
            <a className="clair-btn clair-btn-white" href={PREORDER_HREF}>
              {copy.closing.cta}
            </a>
            <a className="clair-btn clair-btn-ghost" href="#stages">
              {copy.closing.secondary}
            </a>
            <a className="clair-btn clair-btn-ghost" href={WOMEN_HREF}>
              {copy.closing.tertiary}
            </a>
          </div>
        </div>
      </section>

      <footer className="clair-legal">
        <div className="clair-container">
          <p>{copy.legal}</p>
          <p>{copy.reproductive}</p>
        </div>
      </footer>
    </div>
  );
}
