'use client';

/*
 * =============================================================================
 * THE SITE'S SPECIALIST SERVICE, REACHED DIRECTLY
 * =============================================================================
 * The general phone line, the email address, the hours and the service's own
 * About page, from the site's `contact` (../site.ts, SiteContact) and its
 * `ui.contact` words. Drawn inside a pharmacist panel in place of a request
 * button: on the chapters, the path pages, the landing's care band and the
 * funding page. It renders nothing for a site without a contact, so Ostomy's
 * pages are unchanged.
 *
 * A general contact only, never a named person. The phone number is dialled
 * from `contact.tel` and printed from `ui.contact.phone`, which is the same
 * number written the way the page's language writes it.
 *
 * The About page is an outward link, opened in the same tab like every other
 * outward link on these pages, in French on /fr where the service has a
 * French page.
 * =============================================================================
 */

import { useLocale } from 'next-intl';

import { useSite, useSiteT } from '../site-context';

import './specialist-contact.css';

/*
 * The id of the chapter's pharmacist panel where a site has a contact. A
 * site's chapters-meta.ts points its `pharmacistHref`, its lanes and its
 * pickers at `#chapter-cde` as a literal, because that file may not import a
 * value; keep the two the same.
 */
export const CONTACT_ANCHOR = 'chapter-cde';

export function SpecialistContact({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  const { contact } = useSite();
  const locale = useLocale();
  const t = useSiteT('ui.contact');

  if (!contact) return null;

  const french = locale === 'fr' && contact.aboutHrefFr !== undefined;

  return (
    <ul aria-label={t('label')} className={`ms-contact is-${tone}`}>
      <li className="ms-contact-phone">
        <a href={`tel:${contact.tel}`}>{t('call', { phone: t('phone') })}</a>
      </li>
      <li>
        <a href={`mailto:${contact.email}`}>{t('email', { email: contact.email })}</a>
      </li>
      <li>{t('hours')}</li>
      <li>
        <a href={french ? contact.aboutHrefFr : contact.aboutHref} hrefLang={french ? 'fr' : 'en'}>
          {t('about')}
        </a>
      </li>
    </ul>
  );
}
