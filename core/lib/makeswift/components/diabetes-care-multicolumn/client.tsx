import { clsx } from 'clsx';
import type { CSSProperties } from 'react';

import { ScrollReveal, SplitWordsHeading } from '~/lib/makeswift/diabetes-care-scroll-animate';

/** CSS variables used by migrated Shopify section markup (avoids `as CSSProperties`). */
type ShopifyThemeStyle = CSSProperties & Record<string, string | number | undefined>;

/** Stable id aligned with `multicolumn_JtTdUn` in `diabetes-care.html` (dedicated slice, not HTML fetch). */
export const MULTICOLUMN_SECTION_ID = 'shopify-section-template--26520397447459__multicolumn_JtTdUn';

const MULTICOLUMN_SLIDER_ID = 'Slider-template--26520397447459__multicolumn_JtTdUn';

const MAX_COLUMNS = 4;

/**
 * Inline `<style>` from `diabetes-care.html` for this section id (theme color tokens + grid gap).
 * Appends `--section-blocks-count` and optional four-column media rule.
 */
const MULTICOLUMN_ARCHIVE_STYLE = `#${MULTICOLUMN_SECTION_ID}{--section-padding-top:72px;--section-padding-bottom:72px;--color-background:142 165 141;--color-foreground:49 47 47;--color-border:var(--color-foreground)/0.1;--color-border-dark:var(--color-foreground)/0.4;--color-border-light:var(--color-foreground)/0.06;--color-highlight:243 199 190;--color-button-background:255 255 255;--color-button-border:255 255 255;--color-button-text:49 47 47}@media screen and (min-width:1024px){#${MULTICOLUMN_SECTION_ID} .multicolumn{--card-grid-gap:clamp(40px,3.5vw,60px)}}`;

function multicolumnSectionStyle(blockCount: number): string {
  const id = `#${MULTICOLUMN_SECTION_ID}`;
  let style = `${MULTICOLUMN_ARCHIVE_STYLE}${id}{--section-blocks-count:${String(blockCount)}}`;

  if (blockCount === 4) {
    style += `@media screen and (min-width:768px){${id} .multicolumn.with-4.card-grid.card-grid--4{--card-grid-per-row:4}}`;
  }

  return style;
}

function multicolumnCardGridModifierClass(count: number): string | undefined {
  const n = Math.min(Math.max(count, 1), MAX_COLUMNS);

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

  return undefined;
}

const LARGE_SCREEN_GRID_CLASS: Record<number, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
};

function largeScreenGridClass(count: number): string {
  const columns = Math.min(Math.max(count, 1), MAX_COLUMNS);

  return LARGE_SCREEN_GRID_CLASS[columns] ?? 'lg:grid-cols-4';
}

function IconArrowRight() {
  return (
    <svg
      className="icon icon-arrow-right icon-sm transform"
      fill="none"
      role="presentation"
      stroke="currentColor"
      viewBox="0 0 21 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 10H18M18 10L12.1667 4.16675M18 10L12.1667 15.8334"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export interface DiabetesCareMulticolumnColumn {
  title?: string;
  /** Same type scale as body; rendered bold (e.g. “The Gear. No Guesswork.”). */
  subheading?: string;
  body?: string;
  imageSrc?: string;
  imageAlt?: string;
  buttonText?: string;
  buttonLink?: { href?: string; target?: string };
}

export interface DiabetesCareMulticolumnProps {
  className?: string;
  introHeading?: string;
  introBody?: string;
  columns?: DiabetesCareMulticolumnColumn[];
}

const DEFAULT_COLUMNS: DiabetesCareMulticolumnColumn[] = [
  {
    title: 'Support when you need it',
    subheading: 'The Gear. No Guesswork.',
    body: 'Replace this text in Makeswift. Add an image or button per column.',
    imageAlt: '',
  },
  {
    title: 'Built for everyday care',
    subheading: 'Navigating the Real World.',
    body: 'Up to four columns use the same multicolumn grid styling as the archived page.',
    imageAlt: '',
  },
];

function columnHasContent(row: DiabetesCareMulticolumnColumn): boolean {
  const title = row.title?.trim() ?? '';
  const subheading = row.subheading?.trim() ?? '';
  const body = row.body?.trim() ?? '';
  const image = row.imageSrc?.trim() ?? '';
  const button = row.buttonText?.trim() ?? '';

  return (
    title.length > 0 ||
    subheading.length > 0 ||
    body.length > 0 ||
    image.length > 0 ||
    button.length > 0
  );
}

/** Body split into paragraphs; empty lines omitted. */
function bodyParagraphs(body: string): string[] {
  return body
    .split(/\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

/** ~10% smaller than `text-sm` / `md:text-base` for secondary heading + body. */
const COLUMN_COPY_TEXT =
  'text-[calc(0.875rem_*_0.9)] leading-normal md:text-[calc(1rem_*_0.9)]';

export function DiabetesCareMulticolumn({
  className,
  introHeading,
  introBody,
  columns,
}: DiabetesCareMulticolumnProps) {
  const fromProps = columns !== undefined && columns.length > 0 ? columns : DEFAULT_COLUMNS;
  const nonEmpty = fromProps.filter(columnHasContent);
  const raw = nonEmpty.length > 0 ? nonEmpty : DEFAULT_COLUMNS;
  const rows = raw.slice(0, MAX_COLUMNS);
  const sectionVars: ShopifyThemeStyle = {
    '--section-blocks-count': rows.length,
  };
  const useThemeColumnsOnly = rows.length === 3 || rows.length === 4;
  const introTitle = introHeading?.trim() ?? '';
  const intro = introBody?.trim() ?? '';

  return (
    <div className={clsx('diabetes-care-multicolumn max-w-full overflow-x-hidden', className)}>
      <div className="shopify-section" id={MULTICOLUMN_SECTION_ID} style={sectionVars}>
        <style dangerouslySetInnerHTML={{ __html: multicolumnSectionStyle(rows.length) }} />
        <div className="section section--padding section--rounded relative">
          <div className="page-width page-width--full relative px-4 sm:px-5 md:px-0">
            {introTitle.length > 0 || intro.length > 0 ? (
              <div className="title-wrapper relative z-1 mb-10 flex flex-col gap-4 text-center leading-none md:mb-12 md:items-center md:justify-between lg:gap-8">
                <div className="grid gap-4">
                  {introTitle.length > 0 ? (
                    <h2 className="heading title-xl tracking-heading">
                      <SplitWordsHeading highlightLastWord text={introTitle} />
                    </h2>
                  ) : null}
                  {intro.length > 0 ? (
                    <div className="description rte subtext-lg leading-normal">
                      {intro
                        .split(/\n+/)
                        .map((p) => p.trim())
                        .filter((p) => p.length > 0)
                        .map((p, i) => (
                          <p key={`intro-${i}`}>{p}</p>
                        ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            <ScrollReveal delayMs={100}>
            <div
              className="grid slider slider--tablet"
              id={MULTICOLUMN_SLIDER_ID}
            >
              <div
                className={clsx(
                  'multicolumn card-grid mobile:card-grid--1 relative z-1 grid items-stretch',
                  multicolumnCardGridModifierClass(rows.length),
                  !useThemeColumnsOnly && [
                    rows.length === 1 ? 'md:grid-cols-1' : 'md:grid-cols-2',
                    largeScreenGridClass(rows.length),
                  ],
                )}
              >
                {rows.map((row, index) => {
                  const imageSrc = row.imageSrc?.trim();
                  const showImage = imageSrc != null && imageSrc.length > 0;
                  const title = row.title?.trim() ?? '';
                  const subheading = row.subheading?.trim() ?? '';
                  const body = row.body?.trim() ?? '';
                  const buttonLabel = row.buttonText?.trim() ?? '';
                  const showButton = buttonLabel.length > 0;
                  const buttonHref = row.buttonLink?.href ?? '#';

                  return (
                    <div
                      className="multicolumn-card with-border card flex h-full w-full min-h-0 flex-col gap-5 text-left"
                      key={`multicolumn-${index}`}
                    >
                      {showImage ? (
                        <div className="media media--square relative w-full shrink-0 overflow-hidden rounded-3xl">
                          <img
                            alt={row.imageAlt?.trim() ?? ''}
                            className="aspect-square w-full object-cover"
                            height={520}
                            loading="lazy"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 520px"
                            src={imageSrc}
                            width={520}
                          />
                        </div>
                      ) : null}
                      <div
                        className={clsx(
                          'multicolumn-card__info flex min-h-0 w-full flex-1 flex-col gap-4 lg:gap-6',
                          showButton &&
                            body.length === 0 &&
                            subheading.length === 0 &&
                            (title.length > 0 || showImage) &&
                            'justify-between',
                        )}
                      >
                        {title.length > 0 ? (
                          <p className="heading text-lg-2xl leading-tight tracking-tight">
                            <em
                              className="highlighted-text animated relative not-italic"
                              data-style="half_text"
                              is="highlighted-text"
                            >
                              {title}
                            </em>
                          </p>
                        ) : null}
                        {subheading.length > 0 || body.length > 0 ? (
                          <div
                            className={clsx(
                              COLUMN_COPY_TEXT,
                              'flex min-h-0 flex-col',
                              subheading.length > 0 && body.length > 0 && 'gap-1',
                              showButton && (subheading.length > 0 || body.length > 0) && 'flex-1',
                            )}
                          >
                            {subheading.length > 0 ? (
                              <p className="m-0 shrink-0 font-bold leading-normal">{subheading}</p>
                            ) : null}
                            {body.length > 0 ? (
                              <div className="rte min-h-0 flex-1 leading-normal [&_p]:m-0 [&_p+p]:mt-3">
                                {bodyParagraphs(body).map((para, pi) => (
                                  <p key={`col-${index}-p-${pi}`}>{para}</p>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                        {showButton ? (
                          <p
                            className={
                              body.length > 0 ||
                              subheading.length > 0 ||
                              title.length > 0 ||
                              showImage
                                ? 'mt-auto pt-1'
                                : 'mt-1'
                            }
                          >
                            <a
                              className="button button--secondary button--md icon-with-text"
                              href={buttonHref}
                              rel={row.buttonLink?.target === '_blank' ? 'noopener noreferrer' : undefined}
                              target={row.buttonLink?.target}
                            >
                              <span className="btn-fill" data-fill />
                              <span className="btn-text">
                                {buttonLabel}
                                <IconArrowRight />
                              </span>
                            </a>
                          </p>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}
