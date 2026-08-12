'use client';

import { useCallback, useEffect, useRef, useState, type MutableRefObject, type RefObject } from 'react';

import { useWhMotion } from '../use-wh-motion';

import './clair-health.css';
import '../wh-motion.css';

/*
 * =============================================================================
 * CLAIR HEALTH — CONTENT MAP
 * =============================================================================
 * Page URL: /liivv-health/womens-health/clair-health
 *
 * Edit copy in two places:
 *   1. Constants below (OFFER, PRESS, TEAM, STAGES, FAQS)
 *   2. JSX sections in ClairHealthPage / ScrollFrameHero (search "SECTION N —")
 *
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

/** SECTION 2 — Pre-order offer bullets */
const OFFER = [
  { strong: 'Pre-order', label: 'through Liivv' },
  { strong: 'Nov 2026', label: 'expected ship' },
  { strong: 'No labs', label: 'worn like jewellery' },
] as const;

/** SECTION 3 — Press / media logo marquee */
const PRESS = [
  { src: `${SITE}/press/ncwh.svg`, alt: "HHS National Conference on Women's Health" },
  { src: `${SITE}/press/forbes.svg`, alt: 'Forbes' },
  { src: `${SITE}/press/fortune.svg`, alt: 'Fortune' },
  { src: `${SITE}/press/techcrunch.svg`, alt: 'TechCrunch' },
  { src: `${SITE}/press/the-print.svg`, alt: 'ThePrint' },
  { src: `${SITE}/press/fitt.svg`, alt: 'Fitt Insider' },
  { src: `${SITE}/press/athletech.svg`, alt: 'Athletech NEWS' },
  { src: `${SITE}/press/indian-express.svg`, alt: 'The Indian Express' },
  { src: `${SITE}/press/wellworthy.svg`, alt: 'wellworthy' },
] as const;

/** SECTION 6 — Team / institutions logo marquee */
const TEAM = [
  { src: `${SITE}/team/whoop.svg`, alt: 'Whoop' },
  { src: `${SITE}/team/apple.svg`, alt: 'Apple' },
  { src: `${SITE}/team/stanford-medicine.svg`, alt: 'Stanford Medicine' },
  { src: `${SITE}/team/fastr.svg`, alt: 'FASTR' },
  { src: `${SITE}/team/daydream.svg`, alt: 'Daydream' },
  { src: `${SITE}/team/princeton.svg`, alt: 'Princeton University' },
  { src: `${SITE}/team/hinge.svg`, alt: 'Hinge' },
  { src: `${SITE}/team/jj.svg`, alt: 'Johnson & Johnson' },
  { src: `${SITE}/team/meta.svg`, alt: 'Meta' },
  { src: `${SITE}/team/eight-sleep.svg`, alt: 'Eight Sleep' },
  { src: `${SITE}/team/stanford.svg`, alt: 'Stanford' },
  { src: `${SITE}/team/mercedes.svg`, alt: 'Mercedes-Benz' },
] as const;

/** SECTION 4 — Life-stage cards around the product photo */
const STAGES = [
  {
    title: 'Training & Recovery',
    body: 'Align training, recovery, and daily movement with your cycle to optimize energy, performance, and resilience across every phase.',
    image: `${SITE}/training.webp`,
    corner: 'tl',
  },
  {
    title: 'Fertility Planning',
    body: 'Understand your cycle and ovulation timing with continuous, data-driven insights to support your fertility decisions.',
    image: `${SITE}/fertility.webp`,
    corner: 'tr',
  },
  {
    title: 'Understanding Hormonal Health',
    body: 'Identify hormonal patterns and changes across your cycle to better understand symptoms, balance, and overall wellbeing.',
    image: `${SITE}/product.webp`,
    corner: 'bl',
  },
  {
    title: 'Navigating (Peri)Menopause',
    body: 'Understand how hormonal changes affect your body, energy, and sleep — with insights for perimenopause and menopause.',
    image: `${SITE}/peri.webp`,
    corner: 'br',
  },
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
    // Pulse attraction when autoplay/hover switches stages
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
        // Bias toward the outer band of a tighter disk (halo around the photo)
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
      // Tight halo around the photo — denser, less spread into the corners
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

/** SECTION 7 — FAQ questions + answers */
const FAQS = [
  {
    q: 'How does Clair track hormones without a blood draw?',
    a: "Hormones produce measurable physiological effects across your body, continuously. Clair's multi-modal sensor array captures biomarkers spanning cardiovascular, thermoregulatory, autonomic, and other domains, then uses models trained against clinical-grade hormone measurements to decode continuous hormonal insights — estrogen, progesterone, LH, and FSH.",
  },
  {
    q: 'How is Clair different from Oura, Whoop, or Apple Watch?',
    a: "Other wearables are fitness and recovery platforms — their algorithms treat hormonal variation as noise. Clair was built to treat female hormonal physiology as the primary signal, so you see the shape of your month instead of a smoothed-over recovery score.",
  },
  {
    q: 'What hormones can Clair detect?',
    a: 'Clair tracks estrogen, progesterone, LH (luteinizing hormone), and FSH (follicle-stimulating hormone). Each produces a distinct multi-system physiological signature the models are trained to recognize.',
  },
  {
    q: 'When does Clair ship?',
    a: "Clair is expected to ship around November 2026. Pre-order through Liivv now so you're first in line — we'll keep you posted as dates firm up.",
  },
  {
    q: 'Who is Liivv?',
    a: "Liivv is the Canadian health home where you pre-order Clair. Beyond the wristband, Liivv offers women's wellness, sleep support, skin care, diabetes care, ostomy supplies, wound care, and Ontario pharmacist chat — all with discreet delivery.",
  },
  {
    q: 'How private is my order?',
    a: 'Very. Everything arrives in plain, discreet packaging, and your conversations with our team stay between you and us.',
  },
] as const;

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

function ScrollFrameHero() {
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
      {/* =====================================================================
          SECTION 1 — HERO (scroll-driven frame animation)
          Headline, keywords, lead, CTAs edited inline below.
          ===================================================================== */}
      <section aria-label="Introducing Clair" className="clair-hero" ref={stageRef}>
        <img
          alt="Clair Health wearable hormone monitor"
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
            <h1>Introducing Clair</h1>
            <p className="clair-hero-keywords">Continuous. Noninvasive. Real-time.</p>
            <p className="clair-hero-lead">
              <em>
                The world&apos;s first wearable for hormone-aware health, designed for women, by women —
                available through Liivv.
              </em>
            </p>
            <div className="clair-cta-row">
              <a className="clair-btn clair-btn-ember" href={PREORDER_HREF}>
                Pre-order Clair
              </a>
              <a className="clair-btn clair-btn-ghost" href="#stages">
                Explore stages
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function ClairHealthPage() {
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeStage, setActiveStage] = useState(0);
  const [stagesPaused, setStagesPaused] = useState(false);
  const stagesLayoutRef = useRef<HTMLDivElement>(null);
  const stageCardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const { rootClassName } = useWhMotion('clair-health');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (stagesPaused) return;

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches) return;

    const timer = window.setInterval(() => {
      setActiveStage((current) => (current + 1) % STAGES.length);
    }, 3200);

    return () => window.clearInterval(timer);
  }, [stagesPaused]);

  const selectStage = (index: number) => {
    setActiveStage(index);
  };

  return (
    <div className={rootClassName} id="clair-health">
      {/* Sticky back link — label edited inline */}
      <a className={`clair-back${scrolled ? ' is-scrolled' : ''}`} href={WOMEN_HREF}>
        ← Women&apos;s Health
      </a>

      {/* SECTION 1 — Hero (see ScrollFrameHero above) */}
      <ScrollFrameHero />

      {/* =====================================================================
          SECTION 2 — PRE-ORDER OFFER
          Anchor: #preorder
          Headline / body / note / CTA edited inline.
          Offer bullets: OFFER (top of file).
          ===================================================================== */}
      <section className="clair-offer" id="preorder">
        <div className="clair-container clair-offer-grid" data-reveal>
          <div className="clair-offer-copy">
            <span className="clair-pill">
              <span className="clair-pill-dot" />
              Available through Liivv
            </span>
            <h2>Pre-order Clair</h2>
            <p>
              Limited founding window before retail. Continuous hormone clarity on your wrist — expected to ship
              November 2026.
            </p>
            <ul className="clair-offer-list" data-reveal data-reveal-stagger>
              {OFFER.map((item, index) => (
                <li key={item.strong} style={{ ['--stagger' as string]: index }}>
                  <strong>{item.strong}</strong>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
            <a className="clair-btn clair-btn-ember" href={PREORDER_HREF}>
              Reserve my Clair
            </a>
            <p className="clair-offer-note">Founding Members ship November–December 2026.</p>
          </div>
          <div className="clair-offer-media">
            <Pic alt="Clair Health wristband" src={`${SITE}/product.webp`} />
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 3 — PRESS / FEATURED IN
          Logos: PRESS (top of file). Pill label edited inline.
          ===================================================================== */}
      <section aria-label="Featured in" className="clair-press" data-reveal>
        <div className="clair-press-pill">
          <img alt="" height={12} src={`${SITE}/press/megaphone.svg`} width={12} />
          <p>Featured in 50+ media platforms</p>
        </div>
        <div className="clair-press-track-wrap">
          <div className="clair-press-track">
            {[0, 1].map((copy) => (
              <div className="clair-press-group" key={copy}>
                {PRESS.map((logo) => (
                  <img
                    alt={logo.alt}
                    className="clair-press-logo"
                    draggable={false}
                    key={`${copy}-${logo.alt}`}
                    src={logo.src}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 4 — STAGES OF WOMEN'S HEALTH
          Anchor: #stages
          Section head edited inline. Stage cards: STAGES (top of file).
          ===================================================================== */}
      <section className="clair-stages" id="stages">
        <div className="clair-container">
          <header className="clair-section-head" data-reveal>
            <span className="clair-pill">
              <span className="clair-pill-dot" />
              Clair supports your needs
            </span>
            <h2>Built for every stage of women&apos;s health</h2>
            <p>Personalized insights across training, fertility, hormonal health, and perimenopause.</p>
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
                {STAGES.map((stage, index) => (
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
            {STAGES.map((stage, index) => (
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
        </div>
      </section>

      {/* =====================================================================
          SECTION 5 — HOW CLAIR WORKS
          Anchor: #how-it-works
          Pill, headline, body, CTA — all edited inline below.
          ===================================================================== */}
      <section className="clair-story" data-reveal id="how-it-works">
        <div className="clair-container clair-story-grid">
          <div className="clair-story-media">
            <Pic alt="Clair worn like jewellery" src={`${SITE}/product.webp`} />
          </div>
          <div className="clair-story-copy">
            <span className="clair-pill">
              <span className="clair-pill-dot" />
              How Clair works
            </span>
            <h2>Your body&apos;s signals, worn like jewellery</h2>
            <p>
              Clair continuously reads key physiological signals and decodes estrogen, progesterone, LH, and FSH —
              without blood draws or urine strips.
            </p>
            <p>
              Sleep, recovery, activity, heart rate, and HRV come along for the ride. One wearable instead of a
              calendar app, sticks, and a fitness tracker.
            </p>
            <a className="clair-btn clair-btn-ember" href={PREORDER_HREF}>
              Pre-order Clair
            </a>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 6 — EXPERT TEAM
          Logos: TEAM (top of file). Head copy edited inline.
          ===================================================================== */}
      <section aria-label="Expert team behind Clair" className="clair-team" data-reveal>
        <div className="clair-team-head">
          <div className="clair-team-pill">
            <img alt="" height={12} src={`${SITE}/team/user.svg`} width={12} />
            <p>Team</p>
          </div>
          <h2>Expert team behind Clair</h2>
          <p>Trusted institutions where the Clair team brings experience and expertise from.</p>
        </div>
        <div className="clair-team-track-wrap">
          <div className="clair-team-track">
            {[0, 1, 2].map((copy) => (
              <div className="clair-team-group" key={copy}>
                {TEAM.map((logo) => (
                  <img
                    alt={logo.alt}
                    className="clair-team-logo"
                    draggable={false}
                    key={`${copy}-${logo.alt}`}
                    src={logo.src}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 7 — FAQ
          Anchor: #faq
          Head copy edited inline. Q&A: FAQS (top of file).
          ===================================================================== */}
      <section className="clair-faq" data-reveal id="faq">
        <div className="clair-container clair-faq-grid">
          <header className="clair-faq-head">
            <span className="clair-pill">
              <span className="clair-pill-dot" />
              FAQ
            </span>
            <h2>Frequently asked questions</h2>
            <p>Product science, shipping, and ordering through Liivv.</p>
          </header>
          <div className="clair-faq-list">
            {FAQS.map((faq, index) => (
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

      {/* =====================================================================
          SECTION 8 — CLOSING / RESERVE
          Anchor: #reserve
          Kicker, headline, body, CTAs — all edited inline below.
          ===================================================================== */}
      <section className="clair-closing" data-reveal id="reserve">
        <div aria-hidden className="clair-closing-bg">
          <img alt="" decoding="async" loading="lazy" src={`${SITE}/closing.jpg`} />
        </div>
        <div className="clair-container clair-closing-inner">
          <p className="clair-closing-kicker">Through Liivv</p>
          <h2>
            Reserve your Clair
            <br />
            <span>Hormone clarity — on your wrist.</span>
          </h2>
          <p>
            Continuous hormone health, designed for women. Pre-order through Liivv and stay first in line for
            expected November 2026 shipping.
          </p>
          <div className="clair-closing-cta">
            <a className="clair-btn clair-btn-white" href={PREORDER_HREF}>
              Reserve my Clair
            </a>
            <a className="clair-btn clair-btn-ghost" href="#stages">
              Explore stages
            </a>
            <a className="clair-btn clair-btn-ghost" href={WOMEN_HREF}>
              Women&apos;s Health
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
