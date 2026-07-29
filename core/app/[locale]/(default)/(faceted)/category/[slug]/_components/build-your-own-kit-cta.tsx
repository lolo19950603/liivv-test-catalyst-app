import { getTranslations } from 'next-intl/server';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';

export async function BuildYourOwnKitCta() {
  const t = await getTranslations('Faceted.Category');

  return (
    <div className="mx-auto flex max-w-7xl justify-end px-4 pt-6 lg:px-6">
      <ButtonLink href="/build-your-own-kit" size="medium" variant="secondary">
        {t('buildYourOwnKit')}
      </ButtonLink>
    </div>
  );
}
