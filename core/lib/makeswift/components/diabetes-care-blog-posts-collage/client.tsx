import { clsx } from 'clsx';
import { useId, type CSSProperties, type ReactNode } from 'react';

import {
  DC_MOBILE_STACK_CLASS,
  DC_SECTION_ROOT_CLASS,
} from '~/lib/makeswift/diabetes-care-mobile-classes';
import { AccentSplitWordsHeading, ScrollReveal } from '~/lib/makeswift/diabetes-care-scroll-animate';
import { ARCHIVE_BLOG_COLLAGE_BACKGROUND_CHANNELS } from '~/lib/makeswift/utils/diabetes-care-archive-theme';
import {
  buildSectionTheme,
  resolveBodyTextColor,
  type BodyTextProps,
  type HeadingTypographyProps,
  type HeadingWithHighlightProps,
  type SectionBackgroundProps,
} from '~/lib/makeswift/utils/diabetes-care-section-style';
import { resolveHeadingFontSizeCss } from '~/lib/makeswift/utils/heading-font-size';
import { resolvePlainTextColor } from '~/lib/makeswift/utils/heading-accent-color';

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

export type BlogPostsCollageHeadingProps = HeadingWithHighlightProps & {
  before?: string;
  emphasis?: string;
  after?: string;
};

export type BlogPostsCollagePostTextProps = BodyTextProps & {
  text?: string;
  fontSize?: number;
  fontSizeMobile?: number;
};

export type BlogPostsCollagePostImageProps = {
  imageSrc?: string;
  imageAlt?: string;
};

export type BlogPostsCollagePostLinkProps = {
  linkText?: string;
  link?: { href?: string; target?: string };
};

export interface DiabetesCareBlogPostsCollagePost {
  image?: BlogPostsCollagePostImageProps;
  /** @deprecated Use `image` popover. */
  imageSrc?: string;
  /** @deprecated Use `image` popover. */
  imageAlt?: string;
  /** Popover group (`text` + typography) or legacy plain string. */
  title?: BlogPostsCollagePostTextProps | string;
  /** Popover group (`text` + typography) or legacy plain string. */
  body?: BlogPostsCollagePostTextProps | string;
  link?: BlogPostsCollagePostLinkProps | { href?: string; target?: string };
  /** @deprecated Use `link` popover. */
  linkText?: string;
}

function resolvePostImage(post: DiabetesCareBlogPostsCollagePost) {
  if (post.image != null) {
    return {
      src: post.image.imageSrc?.trim() ?? '',
      alt: post.image.imageAlt?.trim() ?? '',
    };
  }

  return {
    src: post.imageSrc?.trim() ?? '',
    alt: post.imageAlt?.trim() ?? '',
  };
}

function resolvePostLink(post: DiabetesCareBlogPostsCollagePost) {
  const linkGroup = post.link;

  if (linkGroup != null && typeof linkGroup === 'object' && 'linkText' in linkGroup) {
    const popover = linkGroup as BlogPostsCollagePostLinkProps;

    return {
      label: popover.linkText?.trim() ?? 'Read more',
      href: popover.link?.href ?? '#',
      target: popover.link?.target,
    };
  }

  const legacyUrl = linkGroup as { href?: string; target?: string } | undefined;

  return {
    label: post.linkText?.trim() ?? 'Read more',
    href: legacyUrl?.href ?? '#',
    target: legacyUrl?.target,
  };
}

export type DiabetesCareBlogPostsCollageProps = {
  className?: string;
  background?: SectionBackgroundProps;
  heading?: BlogPostsCollageHeadingProps;
  posts?: DiabetesCareBlogPostsCollagePost[];
  /** @deprecated Merged into `posts` (first item). */
  feature?: DiabetesCareBlogPostsCollagePost;
  /** @deprecated Merged into `posts` (items after the first). */
  sidePosts?: DiabetesCareBlogPostsCollagePost[];
  /** @deprecated Use per-post Body text color instead. */
  bodyText?: BodyTextProps;
};

function mergeTypographyStyle(
  color?: string,
  fontSize?: string,
): CSSProperties | undefined {
  if (color == null && fontSize == null) {
    return undefined;
  }

  return {
    ...(color != null ? { color } : {}),
    ...(fontSize != null ? { fontSize } : {}),
  };
}

function resolvePostTextField(
  value: BlogPostsCollagePostTextProps | string | undefined,
): { text: string; color?: string; fontSize?: string } {
  if (typeof value === 'string') {
    return { text: value.trim() };
  }

  const group = value;

  return {
    text: group?.text?.trim() ?? '',
    color: resolveBodyTextColor(group),
    fontSize: resolveHeadingFontSizeCss(group?.fontSize, group?.fontSizeMobile),
  };
}

const MAX_COLLAGE_POSTS = 3;

const DEFAULT_POSTS: DiabetesCareBlogPostsCollagePost[] = [
  {
    title: { text: 'Ongoing Ostomy Support: Finding What Works, Every Day' },
    body: {
      text: 'Starting out is one thing. But what really shapes your experience over time is what comes next. The small adjustments. The routines that evolve.',
    },
    link: { linkText: 'Read more' },
    image: { imageAlt: '' },
  },
  {
    title: { text: 'Starting Out with an Ostomy: Finding Your Rhythm' },
    body: {
      text: 'No quick fixes. Just real progress, one step at a time. Starting something new can feel like a lot.',
    },
    link: { linkText: 'Read more' },
    image: { imageAlt: '' },
  },
  {
    title: { text: 'Understanding Different Types of Ostomy: Finding What Works for You' },
    body: {
      text: 'No one-size-fits-all. Just what works for you. Living with an ostomy can feel like a big shift at first.',
    },
    link: { linkText: 'Read more' },
    image: { imageAlt: '' },
  },
];

function collagePostsFromProps(props: {
  posts?: DiabetesCareBlogPostsCollagePost[];
  feature?: DiabetesCareBlogPostsCollagePost;
  sidePosts?: DiabetesCareBlogPostsCollagePost[];
}): DiabetesCareBlogPostsCollagePost[] {
  if (props.posts != null && props.posts.length > 0) {
    return props.posts.slice(0, MAX_COLLAGE_POSTS);
  }

  const legacy: DiabetesCareBlogPostsCollagePost[] = [];

  if (props.feature != null) {
    legacy.push(props.feature);
  }

  if (props.sidePosts != null && props.sidePosts.length > 0) {
    legacy.push(...props.sidePosts);
  }

  if (legacy.length > 0) {
    return legacy.slice(0, MAX_COLLAGE_POSTS);
  }

  return DEFAULT_POSTS;
}

function renderArticleCard(
  post: DiabetesCareBlogPostsCollagePost,
  options: {
    key: string;
    imageSizes: string;
    imageHeight: number;
    imageWidth: number;
    defaultTitle: string;
    defaultBody: string;
  },
) {
  const { src: img, alt } = resolvePostImage(post);
  const { label: linkLabel, href, target: linkTarget } = resolvePostLink(post);
  const titleResolved = resolvePostTextField(post.title);
  const bodyResolved = resolvePostTextField(post.body);
  const title = titleResolved.text.length > 0 ? titleResolved.text : options.defaultTitle;
  const body = bodyResolved.text.length > 0 ? bodyResolved.text : options.defaultBody;
  const titleStyle = mergeTypographyStyle(titleResolved.color, titleResolved.fontSize);
  const bodyStyle = mergeTypographyStyle(bodyResolved.color, bodyResolved.fontSize);
  const hasImage = img.length > 0;

  return (
    <div
      className={clsx(
        'card article-card relative flex flex-col gap-5 leading-none md:gap-8',
        !hasImage && 'without-image',
      )}
      key={options.key}
    >
      <div className="article-card__media relative overflow-hidden">
        {hasImage ? (
          <a
            aria-label={title}
            className="article-card__link relative block media media--square mobile:media--wide"
            href={href}
            rel={linkTarget === '_blank' ? 'noopener noreferrer' : undefined}
            tabIndex={-1}
            target={linkTarget}
          >
            <img
              alt={alt || title}
              className="article-card__image loaded"
              height={options.imageHeight}
              loading="lazy"
              sizes={options.imageSizes}
              src={img}
              width={options.imageWidth}
            />
          </a>
        ) : null}
      </div>
      <div className="article-card__content flex flex-col gap-5 md:gap-8">
        <div className="grid gap-4 md:gap-5">
          <a
            className="article-card__title heading reversed-link block text-lg-2xl leading-tight tracking-tight"
            href={href}
            rel={linkTarget === '_blank' ? 'noopener noreferrer' : undefined}
            style={titleStyle}
            target={linkTarget}
          >
            {title}
          </a>
          <div className="article-card__bottom rte leading-normal" style={bodyStyle}>
            {bodyParagraphs(body)}
          </div>
        </div>
        <p>
          <a
            className="link text-sm font-medium leading-tight"
            href={href}
            rel={linkTarget === '_blank' ? 'noopener noreferrer' : undefined}
            target={linkTarget}
          >
            {linkLabel}
            <span className="sr-only">about {title}</span>
          </a>
        </p>
      </div>
    </div>
  );
}

export function DiabetesCareBlogPostsCollage({
  className,
  background,
  heading,
  posts,
  feature,
  sidePosts,
}: DiabetesCareBlogPostsCollageProps) {
  const instance = useId().replace(/:/g, '');
  const sectionDomId = `dccbpc-${instance}`;
  const { sectionCss, sectionStyle } = buildSectionTheme({
    sectionId: sectionDomId,
    sectionCss: sectionVarsCss(sectionDomId),
    background,
    highlight: heading,
    defaultBackgroundChannels: ARCHIVE_BLOG_COLLAGE_BACKGROUND_CHANNELS,
  });
  const headingColor = resolvePlainTextColor({
    textColor: heading?.textColor,
    textColorHex: heading?.textColorHex,
  });
  const headingFontSize = resolveHeadingFontSizeCss(heading?.fontSize, heading?.fontSizeMobile);
  const headingStyle =
    headingColor != null || headingFontSize != null
      ? {
          ...(headingColor != null ? { color: headingColor } : {}),
          ...(headingFontSize != null ? { fontSize: headingFontSize } : {}),
        }
      : undefined;
  const hb = heading?.before?.trim() ?? 'The';
  const he =
    heading?.emphasis != null && heading.emphasis.length > 0 ? heading.emphasis : '"Every Day" ';
  const ha = heading?.after?.trim() ?? 'Feed';

  const collagePosts = collagePostsFromProps({ posts, feature, sidePosts });
  const featured = collagePosts[0];
  const sideColumnPosts = collagePosts.slice(1, MAX_COLLAGE_POSTS);

  return (
    <div className={clsx('diabetes-care-blog-posts-collage', DC_SECTION_ROOT_CLASS, className)}>
      <div className="shopify-section" id={sectionDomId} style={sectionStyle}>
        <style dangerouslySetInnerHTML={{ __html: sectionCss }} />
        <style dangerouslySetInnerHTML={{ __html: BLOG_POSTS_COLLAGE_ARCHIVE_CSS }} />
        <div className="section section--padding section--rounded relative">
          <div className="page-width relative px-4 sm:px-5 md:px-0">
            <div className="title-wrapper relative z-1 flex flex-col gap-4 text-left leading-none lg:gap-8 md:flex-row md:items-end md:justify-between">
              <div className="grid gap-4">
                <h2 className="heading title-md" style={headingStyle}>
                  <AccentSplitWordsHeading
                    accentColors={heading}
                    emphasis={he}
                    emphasisColor={headingColor}
                    emphasisFontSize={headingFontSize}
                    lead={hb}
                    leadColor={headingColor}
                    leadFontSize={headingFontSize}
                    trail={ha}
                  />
                </h2>
              </div>
            </div>
            <ScrollReveal className={clsx('grid slider', DC_MOBILE_STACK_CLASS)} delayMs={100}>
              <div
                className={clsx(
                  'blog-grid blog-collage with-only3 card-grid mobile:card-grid--1 grid',
                  DC_MOBILE_STACK_CLASS,
                )}
              >
                {featured != null
                  ? renderArticleCard(featured, {
                      key: 'featured',
                      imageSizes: '(max-width: 768px) 100vw, 60vw',
                      imageHeight: 1200,
                      imageWidth: 1600,
                      defaultTitle: 'Featured post title',
                      defaultBody: 'Add supporting copy for the large featured post.',
                    })
                  : null}
                {sideColumnPosts.map((post, index) =>
                  renderArticleCard(post, {
                    key: `side-${index}`,
                    imageSizes: '(max-width: 768px) 100vw, 35vw',
                    imageHeight: 900,
                    imageWidth: 900,
                    defaultTitle: 'Post title',
                    defaultBody: 'Post summary.',
                  }),
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}
