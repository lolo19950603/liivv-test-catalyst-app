'use client';

import { clsx } from 'clsx';

import { DC_SECTION_ROOT_CLASS } from '~/lib/makeswift/diabetes-care-mobile-classes';
import { AccentSplitWordsHeading, ScrollReveal } from '~/lib/makeswift/diabetes-care-scroll-animate';
import {
  buildSectionTheme,
  resolveHeadingTypography,
  type HeadingWithHighlightProps,
  type SectionBackgroundProps,
} from '~/lib/makeswift/utils/diabetes-care-section-style';
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';

import { DIABETES_CARE_ARCHIVE_DEFAULT_LOGOS } from './archive-default-logos';

const SECTION_VARS = `--section-padding-top:72px;--section-padding-bottom:72px;--section-grid-gap:70px`;

/** Matches SingleFile section id for archive CSS. Only one logo-list per page (duplicate ids invalid). */
const LOGO_LIST_SECTION_ID = 'shopify-section-template--26520397447459__logo_list_BznDid';

function marqueeCursorScopedCss(sectionDomId: string) {
  const root = `#${sectionDomId}`;

  return (
    `${root} .dcll-marquee-viewport,` +
    `${root} .dcll-marquee-track,` +
    `${root} .dcll-marquee-strip,` +
    `${root} .dcll-marquee-slot{cursor:grab}` +
    /* Descendants keep their own `cursor: grab`, so override every node while dragging. */
    `${root} .dcll-marquee-viewport[data-dcll-dragging="1"],` +
    `${root} .dcll-marquee-viewport[data-dcll-dragging="1"] *{cursor:grabbing !important;}`
  );
}

/** Enough copies to fill the viewport plus buffer so the seam never shows empty space. */
const MAX_STRIPS = 32;

/** Same count as the archive Shopify `logo-bar` (fills wide viewports without a bare right edge). */
const MIN_LOGOS_PER_STRIP = 5;

export interface DiabetesCareLogoListLogo {
  imageSrc?: string;
  imageAlt?: string;
}

export type DiabetesCareLogoListProps = {
  className?: string;
  background?: SectionBackgroundProps;
  heading?: HeadingWithHighlightProps;
  marquee?: {
    cycleDurationSeconds?: number;
    logoMaxHeightPx?: number;
    logoSlotWidthPx?: number;
  };
  logos?: DiabetesCareLogoListLogo[];
};

function normalizeLogoRows(logos?: DiabetesCareLogoListLogo[]) {
  return (logos ?? [])
    .map((row) => ({
      imageSrc: row.imageSrc?.trim() ?? '',
      imageAlt: row.imageAlt?.trim() ?? '',
    }))
    .filter((row) => row.imageSrc.length > 0);
}

/** Cycle logos until the strip is wide enough for the marquee (archive used five per row). */
function expandLogosToMinimum(
  logos: DiabetesCareLogoListLogo[],
  minimum: number,
): DiabetesCareLogoListLogo[] {
  if (logos.length === 0 || logos.length >= minimum) {
    return logos;
  }

  const expanded: DiabetesCareLogoListLogo[] = [];

  while (expanded.length < minimum) {
    for (const logo of logos) {
      if (expanded.length >= minimum) {
        break;
      }

      expanded.push(logo);
    }
  }

  return expanded;
}

function logosResolved(logos?: DiabetesCareLogoListLogo[]) {
  const fromProps = normalizeLogoRows(logos);
  const base =
    fromProps.length > 0 ? fromProps : normalizeLogoRows(DIABETES_CARE_ARCHIVE_DEFAULT_LOGOS);

  return expandLogosToMinimum(base, MIN_LOGOS_PER_STRIP);
}

export function DiabetesCareLogoList({
  className,
  background,
  heading,
  marquee,
  logos,
}: DiabetesCareLogoListProps) {
  const headingResolved = resolveHeadingTypography(heading);
  const sectionDomId = LOGO_LIST_SECTION_ID;
  const { sectionCss, sectionStyle } = buildSectionTheme({
    sectionId: sectionDomId,
    sectionCss: `#${sectionDomId}{${SECTION_VARS}}${marqueeCursorScopedCss(sectionDomId)}`,
    background,
    highlight: heading,
  });

  const title =
    headingResolved.text.length > 0
      ? headingResolved.text
      : 'Trusted Brands, Made for Everyday Life';
  const items = logosResolved(logos);
  const duration = Math.min(120, Math.max(2, marquee?.cycleDurationSeconds ?? 30));

  const slotH = Math.min(120, Math.max(28, marquee?.logoMaxHeightPx ?? 80));
  const slotW = Math.min(280, Math.max(80, marquee?.logoSlotWidthPx ?? 160));
  const headingStyle =
    headingResolved.color != null || headingResolved.fontSize != null
      ? {
          ...(headingResolved.color != null ? { color: headingResolved.color } : {}),
          ...(headingResolved.fontSize != null ? { fontSize: headingResolved.fontSize } : {}),
        }
      : undefined;

  const stripStyle: CSSProperties = {
    gap: 'var(--section-grid-gap)',
  };

  const trackStyle: CSSProperties = {
    gap: 'var(--section-grid-gap)',
  };

  const stripARef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const periodRef = useRef(0);
  /** When true, auto-scroll does not advance (hover / touch over strip, or active drag). */
  const pauseMarqueeRef = useRef(false);
  const dragPointerIdRef = useRef<number | null>(null);
  const lastPointerClientXRef = useRef(0);
  const [stripWidthPx, setStripWidthPx] = useState(0);
  const [periodPx, setPeriodPx] = useState(0);
  const [viewportWidthPx, setViewportWidthPx] = useState(0);
  const xRef = useRef(0);
  const lastTsRef = useRef<number | null>(null);

  const repeatUnitPx = periodPx > 0 ? periodPx : stripWidthPx > 0 ? stripWidthPx + 72 : 0;

  const stripCount = useMemo(() => {
    if (repeatUnitPx <= 0) {
      return 2;
    }

    if (viewportWidthPx <= 0) {
      return 3;
    }

    return Math.min(
      MAX_STRIPS,
      Math.max(2, Math.ceil(viewportWidthPx / repeatUnitPx) + 2),
    );
  }, [repeatUnitPx, viewportWidthPx]);

  useLayoutEffect(() => {
    const el = stripARef.current;

    if (el == null) {
      return;
    }

    const measure = () => {
      setStripWidthPx(Math.ceil(el.getBoundingClientRect().width));
    };

    measure();

    const ro = new ResizeObserver(() => {
      measure();
    });

    ro.observe(el);

    return () => {
      ro.disconnect();
    };
  }, [items, slotH, slotW]);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const first = stripARef.current;

    if (track == null || first == null || stripCount < 2) {
      setPeriodPx(0);

      return;
    }

    const strips = track.querySelectorAll<HTMLElement>('.dcll-marquee-strip');
    const second = strips[1];

    if (second == null) {
      setPeriodPx(0);

      return;
    }

    const period = Math.ceil(second.getBoundingClientRect().left - first.getBoundingClientRect().left);

    setPeriodPx(period > 0 ? period : 0);
  }, [items, stripCount, stripWidthPx, slotH, slotW]);

  useLayoutEffect(() => {
    const p = periodPx > 0 ? periodPx : stripWidthPx > 0 ? stripWidthPx : 0;

    periodRef.current = p;
  }, [periodPx, stripWidthPx]);

  useLayoutEffect(() => {
    const el = viewportRef.current;

    if (el == null) {
      return;
    }

    const measure = () => {
      setViewportWidthPx(Math.ceil(el.getBoundingClientRect().width));
    };

    measure();

    const ro = new ResizeObserver(() => {
      measure();
    });

    ro.observe(el);

    return () => {
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;

    if (viewport == null || items.length === 0) {
      return;
    }

    const pointInsideViewport = (clientX: number, clientY: number) => {
      const r = viewport.getBoundingClientRect();

      return (
        clientX >= r.left &&
        clientX <= r.right &&
        clientY >= r.top &&
        clientY <= r.bottom
      );
    };

    const wrapTrackX = (x: number) => {
      const period = periodRef.current;

      if (period <= 0) {
        return x;
      }

      let v = x;

      while (v <= -period) {
        v += period;
      }

      while (v > 0) {
        v -= period;
      }

      return v;
    };

    const applyTrackTransform = () => {
      const track = trackRef.current;

      if (track != null) {
        track.style.transform = `translate3d(${String(xRef.current)}px,0,0)`;
      }
    };

    const onPointerEnter = () => {
      pauseMarqueeRef.current = true;
      lastTsRef.current = null;
    };

    const onPointerLeave = () => {
      if (dragPointerIdRef.current != null) {
        return;
      }

      pauseMarqueeRef.current = false;
      lastTsRef.current = null;
    };

    let bodyCursorBeforeDrag = '';

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) {
        return;
      }

      if (dragPointerIdRef.current != null) {
        return;
      }

      e.preventDefault();
      dragPointerIdRef.current = e.pointerId;
      lastPointerClientXRef.current = e.clientX;
      pauseMarqueeRef.current = true;
      lastTsRef.current = null;
      viewport.setAttribute('data-dcll-dragging', '1');
      bodyCursorBeforeDrag = document.body.style.getPropertyValue('cursor');
      document.body.style.setProperty('cursor', 'grabbing', 'important');

      try {
        viewport.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (dragPointerIdRef.current !== e.pointerId) {
        return;
      }

      const dx = e.clientX - lastPointerClientXRef.current;

      lastPointerClientXRef.current = e.clientX;
      xRef.current = wrapTrackX(xRef.current + dx);
      applyTrackTransform();
    };

    const endPointerDrag = (e: PointerEvent) => {
      if (dragPointerIdRef.current !== e.pointerId) {
        return;
      }

      try {
        viewport.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }

      dragPointerIdRef.current = null;
      pauseMarqueeRef.current = pointInsideViewport(e.clientX, e.clientY);
      lastTsRef.current = null;
      viewport.removeAttribute('data-dcll-dragging');
      document.body.style.removeProperty('cursor');
      if (bodyCursorBeforeDrag !== '') {
        document.body.style.setProperty('cursor', bodyCursorBeforeDrag);
      }

      bodyCursorBeforeDrag = '';
    };

    viewport.addEventListener('pointerenter', onPointerEnter);
    viewport.addEventListener('pointerleave', onPointerLeave);
    viewport.addEventListener('pointerdown', onPointerDown);
    viewport.addEventListener('pointermove', onPointerMove);
    viewport.addEventListener('pointerup', endPointerDrag);
    viewport.addEventListener('pointercancel', endPointerDrag);

    return () => {
      viewport.removeEventListener('pointerenter', onPointerEnter);
      viewport.removeEventListener('pointerleave', onPointerLeave);
      viewport.removeEventListener('pointerdown', onPointerDown);
      viewport.removeEventListener('pointermove', onPointerMove);
      viewport.removeEventListener('pointerup', endPointerDrag);
      viewport.removeEventListener('pointercancel', endPointerDrag);
      viewport.removeAttribute('data-dcll-dragging');
      document.body.style.removeProperty('cursor');
      if (bodyCursorBeforeDrag !== '') {
        document.body.style.setProperty('cursor', bodyCursorBeforeDrag);
      }

      bodyCursorBeforeDrag = '';
    };
  }, [items.length]);

  useEffect(() => {
    const track = trackRef.current;

    if (track == null) {
      return;
    }

    const period = periodPx > 0 ? periodPx : stripWidthPx;

    if (period <= 0) {
      return;
    }

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true;

    if (reduceMotion) {
      track.style.transform = '';

      return;
    }

    const speedPxPerSec = period / duration;
    let raf = 0;
    lastTsRef.current = null;
    xRef.current = 0;
    track.style.transform = 'translate3d(0,0,0)';

    const tick = (ts: number) => {
      if (!pauseMarqueeRef.current) {
        const prev = lastTsRef.current ?? ts;
        lastTsRef.current = ts;
        const dt = Math.min(0.05, (ts - prev) / 1000);

        xRef.current -= speedPxPerSec * dt;

        while (xRef.current <= -period) {
          xRef.current += period;
        }
      }

      track.style.transform = `translate3d(${String(xRef.current)}px,0,0)`;
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
    };
  }, [stripWidthPx, periodPx, duration, stripCount]);

  const renderStrip = (stripIndex: number) => (
    <div
      aria-hidden={stripIndex > 0 ? true : undefined}
      className="dcll-marquee-strip flex shrink-0 cursor-grab flex-nowrap items-center active:cursor-grabbing"
      key={stripIndex}
      ref={stripIndex === 0 ? stripARef : undefined}
      style={stripStyle}
    >
      {items.map((logo, i) => (
        <div
          className="dcll-marquee-slot flex shrink-0 cursor-grab items-center justify-center overflow-hidden active:cursor-grabbing"
          key={`${stripIndex}-${i}-${logo.imageSrc}`}
          style={{ height: slotH, width: slotW }}
        >
          <img
            alt={logo.imageAlt}
            className="pointer-events-none object-contain select-none"
            draggable={false}
            height={slotH}
            loading="lazy"
            src={logo.imageSrc}
            style={{ maxHeight: slotH, maxWidth: slotW }}
            width={slotW}
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className={clsx('diabetes-care-logo-list', DC_SECTION_ROOT_CLASS, className)}>
      <div className="shopify-section" id={sectionDomId} style={sectionStyle}>
        <style dangerouslySetInnerHTML={{ __html: sectionCss }} />
        <div className="section section--divider section--rounded section--padding relative">
          <div className="page-width relative px-4 sm:px-5 md:px-0">
            <div className="title-wrapper relative z-1 flex flex-col gap-4 text-center leading-none lg:gap-8 md:items-center md:justify-between">
              <div className="grid gap-4">
                <h2 className="heading title-md" style={headingStyle}>
                  <AccentSplitWordsHeading
                    accentColors={heading}
                    highlightEntirePhrase
                    text={title}
                  />
                </h2>
              </div>
            </div>

            {items.length > 0 ? (
              <ScrollReveal delayMs={100}>
              <div
                className="dcll-marquee-viewport touch-none overflow-hidden text-center select-none md:items-center"
                ref={viewportRef}
              >
                <div
                  className="dcll-marquee-track flex w-max cursor-grab flex-nowrap items-center will-change-transform active:cursor-grabbing"
                  ref={trackRef}
                  style={trackStyle}
                >
                  {Array.from({ length: stripCount }, (_, i) => renderStrip(i))}
                </div>
              </div>
              </ScrollReveal>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
