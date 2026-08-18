/* eslint-disable react/jsx-no-bind */
import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { SignInSection } from '@/vibes/soul/sections/sign-in-section';
import { buildConfig } from '~/build-config/reader';
import { OliviaAuthStage } from '~/components/olivia/olivia-auth-stage';
import { ACCOUNT_DEFAULT_REDIRECT_PATH } from '~/lib/makeswift/site-header/resolve-account-href';

import { login } from './_actions/login';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    redirectTo?: string;
    error?: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const t = await getTranslations({ locale, namespace: 'Auth.Login' });

  return {
    title: t('title'),
  };
}

export default async function Login({ params, searchParams }: Props) {
  const { locale } = await params;
  const { redirectTo = ACCOUNT_DEFAULT_REDIRECT_PATH, error } = await searchParams;

  setRequestLocale(locale);

  const t = await getTranslations('Auth.Login');
  const tOlivia = await getTranslations('Auth.Login.Olivia');

  const vanityUrl = buildConfig.get('urls').vanityUrl;
  const redirectUrl = new URL(redirectTo, vanityUrl);
  const redirectTarget = redirectUrl.pathname + redirectUrl.search;
  const tokenErrorMessage = error === 'InvalidToken' ? t('invalidToken') : undefined;

  return (
    <OliviaAuthStage
      copy={{
        kicker: tOlivia('kicker'),
        heading: t('heading'),
        lead: tOlivia('lead'),
        mascotAlt: tOlivia('mascotAlt'),
        switcherLabel: tOlivia('switcher'),
        switcherHref: '/register',
        submitting: tOlivia('submitting'),
        error: tOlivia('error'),
        oneStepAway: tOlivia('oneStepAway'),
        almostDone: tOlivia('almostDone'),
        named: tOlivia('named'),
        idle: [tOlivia('idle0'), tOlivia('idle1')],
        firstName: tOlivia('email'),
        lastName: tOlivia('email'),
        email: tOlivia('email'),
        password: tOlivia('password'),
        confirmPassword: tOlivia('almostDone'),
      }}
      scene="login"
    >
      <SignInSection
        action={login.bind(null, { redirectTo: redirectTarget })}
        emailLabel={t('email')}
        error={tokenErrorMessage}
        forgotPasswordHref="/login/forgot-password"
        forgotPasswordLabel={t('forgotPassword')}
        passwordLabel={t('password')}
        submitLabel={t('cta')}
        title=""
      />
    </OliviaAuthStage>
  );
}
