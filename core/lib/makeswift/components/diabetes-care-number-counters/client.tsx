'use client';

import { clsx } from 'clsx';
import type { CSSProperties } from 'react';

import {
  AnimatedNumberCounter,
  ScrollReveal,
} from '~/lib/makeswift/diabetes-care-scroll-animate';
/** CSS variables used by migrated Shopify section markup (avoids `as CSSProperties`). */
type ShopifyThemeStyle = CSSProperties & Record<string, string | number | undefined>;

const NUMBER_COUNTER_SECTION_ID = 'shopify-section-template--26520397447459__number_counter_dTAx7w';

/** Matches inline `<style>` from `diabetes-care.html` for this section id. */
const NUMBER_COUNTER_STYLE_BASE = `#${NUMBER_COUNTER_SECTION_ID}{--section-padding-top:40px;--section-padding-bottom:40px}@media screen and (min-width:1024px){#${NUMBER_COUNTER_SECTION_ID} .multicolumn{--card-grid-gap:clamp(40px,3.5vw,60px)}}@media screen and (max-width: 767px){#${NUMBER_COUNTER_SECTION_ID}{--section-padding-top:28px;--section-padding-bottom:32px}}`;

/**
 * Builds scoped `<style>` for the counter section (padding, gap, block count, and four-column grid).
 * Without the extra media rule, four stats use the theme’s 3-column `.card-grid` from 768px, or the
 * export’s 2-column `.multicolumn.with-4.card-grid--4` from 768–1279px — both wrap as 3+1 or 2+2.
 * @param {number} blockCount Injected as `--section-blocks-count` for the section root.
 * @returns {string} CSS for `dangerouslySetInnerHTML`.
 */
function numberCounterSectionStyle(blockCount: number): string {
  const id = `#${NUMBER_COUNTER_SECTION_ID}`;
  let style = `${NUMBER_COUNTER_STYLE_BASE}${id}{--section-blocks-count:${String(blockCount)}}`;

  if (blockCount === 4) {
    style += `@media screen and (min-width:768px){${id} .multicolumn.with-4.card-grid.card-grid--4{--card-grid-per-row:4}}`;
  }

  return style;
}

/**
 * Maps counter count to Shopify `multicolumn` `with-N` / `card-grid--N` classes from `diabetes-care.html`.
 * @param {number} count Number of counters (clamped to 1–6 by callers).
 * @returns {(string|undefined)} Space-separated classes, or `undefined` for six counters (Tailwind-only grid).
 */
function multicolumnCardGridModifierClass(count: number): string | undefined {
  const n = Math.min(Math.max(count, 1), 6);

  if (n === 4) {
    return 'with-4 card-grid--4';
  }

  if (n === 3) {
    return 'with-3 card-grid--3';
  }

  if (n === 2) {
    return 'with-2';
  }

  if (n === 1) {
    return 'with-1';
  }

  if (n === 5) {
    return 'with-5';
  }

  return undefined;
}

export interface DiabetesCareNumberCounterRow {
  value?: string;
  description?: string;
}

export interface DiabetesCareNumberCountersProps {
  className?: string;
  counters?: DiabetesCareNumberCounterRow[];
  showPercentSuffix?: boolean;
}

const DEFAULT_COUNTERS: DiabetesCareNumberCounterRow[] = [
  { value: '9.7', description: 'of Canadians live with diagnosed diabetes' },
  { value: '6.3', description: 'of adults aged 20 to 79 years had prediabetes' },
  { value: '60', description: 'of Canadians believe diabetes is caused only by lifestyle choices' },
  { value: '40', description: 'of adults with Type 1 diabetes are initially misdiagnosed' },
];

const LARGE_SCREEN_GRID_CLASS: Record<number, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
  6: 'lg:grid-cols-6',
};

function largeScreenGridClass(count: number): string {
  const columns = Math.min(Math.max(count, 1), 6);

  return LARGE_SCREEN_GRID_CLASS[columns] ?? 'lg:grid-cols-6';
}

export function DiabetesCareNumberCounters({
  className,
  counters,
  showPercentSuffix = true,
}: DiabetesCareNumberCountersProps) {
  const rows = counters !== undefined && counters.length > 0 ? counters : DEFAULT_COUNTERS;
  const sectionVars: ShopifyThemeStyle = {
    '--section-blocks-count': rows.length,
  };
  const useThemeColumnsOnly = rows.length === 3 || rows.length === 4;

  const grid = (
    <slider-element className="slider slider--tablet grid" selector=".card-grid>.card">
      <div
        className={clsx(
          'multicolumn card-grid mobile:card-grid--1 z-1 relative grid',
          multicolumnCardGridModifierClass(rows.length),
          !useThemeColumnsOnly && [
            rows.length === 1 ? 'md:grid-cols-1' : 'md:grid-cols-2',
            largeScreenGridClass(rows.length),
          ],
        )}
      >
        {rows.map((row, index) => (
          <div
            className="counter-card card flex w-full min-w-0 flex-col items-center gap-4 px-1 text-center sm:gap-5 sm:px-0 md:items-start md:text-center xl:flex-row"
            key={`counter-${index}`}
          >
            <div className="grid w-full min-w-0 gap-3 sm:gap-4 lg:gap-6">
              <p className="counter-heading heading title-lg font-bold leading-none tracking-tight sm:whitespace-nowrap">
                <AnimatedNumberCounter value={row.value ?? ''} />
                {showPercentSuffix ? '%' : null}
              </p>
              <div className="heading text-xl leading-snug tracking-tight sm:text-2xl sm:leading-none lg:text-3xl">
                {row.description ?? ''}
              </div>
            </div>
          </div>
        ))}
      </div>
    </slider-element>
  );

  return (
    <div className={clsx('diabetes-care-number-counters max-w-full overflow-x-hidden', className)}>
      <div className="shopify-section" id={NUMBER_COUNTER_SECTION_ID} style={sectionVars}>
        <style dangerouslySetInnerHTML={{ __html: numberCounterSectionStyle(rows.length) }} />
        <div className="section section--padding section--rounded relative">
          <div className="page-width page-width--full relative px-4 sm:px-5 md:px-0">
            <ScrollReveal delayMs={80}>{grid}</ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}
