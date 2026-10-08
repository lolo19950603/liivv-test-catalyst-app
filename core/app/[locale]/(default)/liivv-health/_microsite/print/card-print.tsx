'use client';

/*
 * The printed sheet's header and footer (./print-frame.tsx) for a chapter
 * card on a site drawn by the engine, worded from the site's own
 * `ui.chapter.print` messages.
 *
 * The footer's sources are the card's own (`card.sourceIds`), looked up in the
 * register entries the route handed down, so the paper names exactly what the
 * card's Sources line names on screen (owner note 1): every source, in the page
 * locale, Canadian first, then international under its own label, then the
 * makers' pages, each with "(en anglais)" / "(in French)" where its page is in
 * the other language, as on screen. A site whose route hands no entries down
 * prints the page address alone.
 */

import { useLocale } from 'next-intl';

import type { CategoryCard } from '../chapters/compose';
import { useSiteSources, useSiteT } from '../site-context';
import { groupByScope, lookUpSources } from '../sources';

import { PrintFoot, PrintHead } from './print-frame';

export function CardPrintHead({ title }: { title?: string }) {
  const t = useSiteT('ui.chapter.print');

  return <PrintHead name={t('name')} printed={t('printed')} site={t('site')} title={title} />;
}

export function CardPrintFoot({ card }: { card: CategoryCard }) {
  const t = useSiteT('ui.chapter.print');
  const groupLabel = useSiteT('ui.chapter.sources');
  const shelf = useSiteT('ui.chapter.shelf');
  const locale = useLocale();
  const map = useSiteSources();
  const groups = groupByScope(map && card.sourceIds ? lookUpSources(map, card.sourceIds) : []);
  const separator = locale === 'fr' ? ' ; ' : '; ';
  /* "(en anglais)" after a source in the other language, as the Sources line says on screen. */
  const languageNote = (hrefLang: 'en' | 'fr') => {
    if (hrefLang === locale) return '';

    return ` ${hrefLang === 'fr' ? shelf('inFrench') : shelf('inEnglish')}`;
  };

  return (
    <PrintFoot
      page={t('page')}
      sources={groups.map((group) => (
        <p key={group.scope}>
          {t('sourcesGroup', {
            group: groupLabel(group.scope),
            titles: group.sources
              .map(
                (source) =>
                  `${source.title}, ${source.publisher}${source.year === undefined ? '' : ` (${source.year})`}${languageNote(source.hrefLang)}`,
              )
              .join(separator),
          })}
        </p>
      ))}
    />
  );
}
