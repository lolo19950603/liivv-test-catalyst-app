import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { ForgotPasswordSection } from '@/vibes/soul/sections/forgot-password-section';
import { OliviaAuthStage } from '~/components/olivia/olivia-auth-stage';

import { resetPassword } from './_actions/reset-password';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const t = await getTranslations({ locale, namespace: 'Auth.Login.ForgotPassword' });

  return {
    title: t('title'),
  };
}

export default async function Reset(props: Props) {
  const { locale } = await props.params;

  setRequestLocale(locale);

  const t = await getTranslations('Auth.Login.ForgotPassword');
  const tOlivia = await getTranslations('Auth.Login.ForgotPassword.Olivia');

  return (
    <OliviaAuthStage
      copy={{
        kicker: tOlivia('kicker'),
        heading: t('heading'),
        lead: tOlivia('lead'),
        mascotAlt: tOlivia('mascotAlt'),
        switcherLabel: t('backToLogin'),
        switcherHref: '/login',
        submitting: tOlivia('submitting'),
        error: tOlivia('error'),
        oneStepAway: tOlivia('oneStepAway'),
        almostDone: tOlivia('almostDone'),
        named: tOlivia('almostDone'),
        sent: tOlivia('sent'),
        idle: [tOlivia('idle0'), tOlivia('idle1')],
        firstName: tOlivia('email'),
        lastName: tOlivia('email'),
        email: tOlivia('email'),
        password: tOlivia('oneStepAway'),
        confirmPassword: tOlivia('almostDone'),
      }}
      scene="forgot-password"
    >
      <ForgotPasswordSection action={resetPassword} subtitle="" title="" />
    </OliviaAuthStage>
  );
}
