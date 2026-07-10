import { PropsWithChildren } from 'react';

import { isLoggedIn } from '~/auth';
import { redirect } from '~/i18n/routing';
import { ACCOUNT_DEFAULT_REDIRECT_PATH } from '~/lib/makeswift/site-header/resolve-account-href';

interface Props extends PropsWithChildren {
  params: Promise<{ locale: string }>;
}

export default async function Layout({ children, params }: Props) {
  const loggedIn = await isLoggedIn();
  const { locale } = await params;

  if (loggedIn) {
    redirect({ href: ACCOUNT_DEFAULT_REDIRECT_PATH, locale });
  }

  return children;
}
