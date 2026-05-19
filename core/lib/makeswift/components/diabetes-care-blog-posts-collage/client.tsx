import { clsx } from 'clsx';
import { useId, type ReactNode } from 'react';

import { ScrollReveal, SplitWordsHeading } from '~/lib/makeswift/diabetes-care-scroll-animate';

import {
  BLOG_POSTS_COLLAGE_ARCHIVE_CSS,
  BLOG_POSTS_COLLAGE_SECTION_VARS_TEMPLATE,
} from './archive-styles';

function bodyParagraphs(body: string): ReactNode {
  return body
    .split(/\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
    .map((p, i) => <p key={`p-${i}`}>{p}</p>);
}

function sectionVarsCss(domId: string): string {
  return BLOG_POSTS_COLLAGE_SECTION_VARS_TEMPLATE.replaceAll(
    '#shopify-section-template--26520397447459__blog_posts_collage_bTyfPm',
    `#${domId}`,
  );
}

export interface DiabetesCareBlogPostsCollageSidePost {
  imageSrc?: string;
  imageAlt?: string;
  title?: string;
  body?: string;
  linkText?: string;
  link?: { href?: string; target?: string };
}

export interface DiabetesCareBlogPostsCollageProps {
  className?: string;
  headingBefore?: string;
  headingEmphasis?: string;
  headingAfter?: string;
  featureImageSrc?: string;
  featureImageAlt?: string;
  featureTitle?: string;
  featureBody?: string;
  featureLinkText?: string;
  featureLink?: { href?: string; target?: string };
  sidePosts?: DiabetesCareBlogPostsCollageSidePost[];
}

const DEFAULT_SIDE_POSTS: DiabetesCareBlogPostsCollageSidePost[] = [
  {
    title: 'Starting Out with an Ostomy: Finding Your Rhythm',
    body: 'No quick fixes. Just real progress, one step at a time. Starting something new can feel like a lot.',
    linkText: 'Read more',
    imageAlt: '',
  },
  {
    title: 'Understanding Different Types of Ostomy: Finding What Works for You',
    body: 'No one-size-fits-all. Just what works for you. Living with an ostomy can feel like a big shift at first.',
    linkText: 'Read more',
    imageAlt: '',
  },
];

function sidePostsResolved(sidePosts?: DiabetesCareBlogPostsCollageSidePost[]) {
  const raw =
    sidePosts != null && sidePosts.length > 0 ? [...sidePosts] : [...DEFAULT_SIDE_POSTS];

  while (raw.length < 2) {
    raw.push(DEFAULT_SIDE_POSTS[raw.length] ?? DEFAULT_SIDE_POSTS[0] ?? {});
  }

  return raw.slice(0, 2);
}

export function DiabetesCareBlogPostsCollage({
  className,
  headingBefore,
  headingEmphasis,
  headingAfter,
  featureImageSrc,
  featureImageAlt,
  featureTitle,
  featureBody,
  featureLinkText,
  featureLink,
  sidePosts,
}: DiabetesCareBlogPostsCollageProps) {
  const instance = useId().replace(/:/g, '');
  const sectionDomId = `dccbpc-${instance}`;

  const hb = headingBefore?.trim() ?? 'The';
  const he =
    headingEmphasis != null && headingEmphasis.length > 0 ? headingEmphasis : '"Every Day" ';
  const ha = headingAfter?.trim() ?? 'Feed';

  const featureImg = featureImageSrc?.trim() ?? '';
  const featureAlt = featureImageAlt?.trim() ?? '';
  const fTitle = featureTitle?.trim() ?? 'Featured post title';
  const fBody = featureBody?.trim() ?? 'Add supporting copy for the large featured post.';
  const fLinkLabel = featureLinkText?.trim() ?? 'Read more';
  const fHref = featureLink?.href ?? '#';
  const featureHasImage = featureImg.length > 0;

  const sides = sidePostsResolved(sidePosts);

  return (
    <div className={clsx('diabetes-care-blog-posts-collage', className)}>
      <div className="shopify-section" id={sectionDomId}>
        <style dangerouslySetInnerHTML={{ __html: sectionVarsCss(sectionDomId) }} />
        <style dangerouslySetInnerHTML={{ __html: BLOG_POSTS_COLLAGE_ARCHIVE_CSS }} />
        <div className="section section--padding section--rounded relative">
          <div className="page-width relative">
            <div className="title-wrapper relative z-1 flex flex-col gap-4 text-left leading-none lg:gap-8 md:flex-row md:items-end md:justify-between">
              <div className="grid gap-4">
                <h2 className="heading title-md">
                  <SplitWordsHeading
                    accentPhrase={he.length > 0 ? he : undefined}
                    text={[hb, he, ha].filter((part) => part.length > 0).join(' ')}
                  />
                </h2>
              </div>
            </div>
            <ScrollReveal className="grid slider" delayMs={100}>
              <div className="blog-grid blog-collage with-only3 card-grid mobile:card-grid--1 grid">
                <div
                  className={clsx(
                    'card article-card relative flex flex-col gap-5 leading-none md:gap-8',
                    !featureHasImage && 'without-image',
                  )}
                >
                  <div className="article-card__media relative overflow-hidden">
                    {featureHasImage ? (
                      <a
                        aria-label={fTitle}
                        className="article-card__link relative block media media--square"
                        href={fHref}
                        rel={featureLink?.target === '_blank' ? 'noopener noreferrer' : undefined}
                        tabIndex={-1}
                        target={featureLink?.target}
                      >
                        <img
                          alt={featureAlt || fTitle}
                          className="article-card__image loaded"
                          height={1200}
                          loading="lazy"
                          sizes="(max-width: 768px) 100vw, 60vw"
                          src={featureImg}
                          width={1600}
                        />
                      </a>
                    ) : null}
                  </div>
                  <div className="article-card__content flex flex-col gap-5 md:gap-8">
                    <div className="grid gap-4 md:gap-5">
                      <a
                        className="article-card__title heading reversed-link block text-lg-2xl leading-tight tracking-tight"
                        href={fHref}
                        rel={featureLink?.target === '_blank' ? 'noopener noreferrer' : undefined}
                        target={featureLink?.target}
                      >
                        {fTitle}
                      </a>
                      <div className="article-card__bottom rte leading-normal">{bodyParagraphs(fBody)}</div>
                    </div>
                    <p>
                      <a
                        className="link text-sm font-medium leading-tight"
                        href={fHref}
                        rel={featureLink?.target === '_blank' ? 'noopener noreferrer' : undefined}
                        target={featureLink?.target}
                      >
                        {fLinkLabel}
                        <span className="sr-only">about {fTitle}</span>
                      </a>
                    </p>
                  </div>
                </div>

                {sides.map((post, index) => {
                  const img = post.imageSrc?.trim() ?? '';
                  const alt = post.imageAlt?.trim() ?? '';
                  const title = post.title?.trim() ?? 'Post title';
                  const body = post.body?.trim() ?? 'Post summary.';
                  const linkLabel = post.linkText?.trim() ?? 'Read more';
                  const href = post.link?.href ?? '#';
                  const hasImage = img.length > 0;

                  return (
                    <div
                      className={clsx(
                        'card article-card relative flex flex-col gap-5 leading-none md:gap-8',
                        !hasImage && 'without-image',
                      )}
                      key={`side-${index}`}
                    >
                      <div className="article-card__media relative overflow-hidden">
                        {hasImage ? (
                          <a
                            aria-label={title}
                            className="article-card__link relative block media media--square"
                            href={href}
                            rel={post.link?.target === '_blank' ? 'noopener noreferrer' : undefined}
                            tabIndex={-1}
                            target={post.link?.target}
                          >
                            <img
                              alt={alt || title}
                              className="article-card__image loaded"
                              height={900}
                              loading="lazy"
                              sizes="(max-width: 768px) 100vw, 35vw"
                              src={img}
                              width={900}
                            />
                          </a>
                        ) : null}
                      </div>
                      <div className="article-card__content flex flex-col gap-5 md:gap-8">
                        <div className="grid gap-4 md:gap-5">
                          <a
                            className="article-card__title heading reversed-link block text-lg-2xl leading-tight tracking-tight"
                            href={href}
                            rel={post.link?.target === '_blank' ? 'noopener noreferrer' : undefined}
                            target={post.link?.target}
                          >
                            {title}
                          </a>
                          <div className="article-card__bottom rte leading-normal">{bodyParagraphs(body)}</div>
                        </div>
                        <p>
                          <a
                            className="link text-sm font-medium leading-tight"
                            href={href}
                            rel={post.link?.target === '_blank' ? 'noopener noreferrer' : undefined}
                            target={post.link?.target}
                          >
                            {linkLabel}
                            <span className="sr-only">about {title}</span>
                          </a>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}
