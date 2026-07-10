/* eslint-disable react/jsx-no-bind */
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { AccountSettingsSection } from '@/vibes/soul/sections/account-settings';
import { AddressListSection } from '@/vibes/soul/sections/address-list-section';
import { addressAction } from '~/app/[locale]/(default)/account/addresses/_actions/address-action';

import { getAddressListSectionProps } from './address-list-props';
import { changePassword } from './_actions/change-password';
import { updateCustomer } from './_actions/update-customer';
import { updateNewsletterSubscription } from './_actions/update-newsletter-subscription';
import { getAccountSettingsQuery } from './page-data';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
    before?: string;
    after?: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const t = await getTranslations({ locale, namespace: 'Account.Settings' });

  return {
    title: t('title'),
  };
}

export default async function Settings({ params, searchParams }: Props) {
  const { locale } = await params;
  const { before, after } = await searchParams;

  setRequestLocale(locale);

  const [t, tAddresses, accountSettings, addressListProps] = await Promise.all([
    getTranslations('Account.Settings'),
    getTranslations('Account.Addresses'),
    getAccountSettingsQuery(),
    getAddressListSectionProps({ before, after }),
  ]);

  if (!accountSettings || !addressListProps) {
    notFound();
  }

  const newsletterSubscriptionEnabled = accountSettings.newsletterSettings?.showNewsletterSignup;
  const isAccountSubscribed = accountSettings.customerInfo.isSubscribedToNewsletter;

  const updateNewsletterSubscriptionActionWithCustomerInfo = updateNewsletterSubscription.bind(
    null,
    {
      customerInfo: accountSettings.customerInfo,
    },
  );

  return (
    <div className="mhd-account-settings w-full space-y-16">
      <AccountSettingsSection
        account={accountSettings.customerInfo}
        changePasswordAction={changePassword}
        changePasswordSubmitLabel={t('cta')}
        changePasswordTitle={t('changePassword')}
        companyLabel={t('company')}
        confirmPasswordLabel={t('confirmPassword')}
        currentPasswordLabel={t('currentPassword')}
        emailLabel={t('email')}
        firstNameLabel={t('firstName')}
        isAccountSubscribed={isAccountSubscribed}
        lastNameLabel={t('lastName')}
        newPasswordLabel={t('newPassword')}
        newsletterSubscriptionCtaLabel={t('cta')}
        newsletterSubscriptionEnabled={newsletterSubscriptionEnabled}
        newsletterSubscriptionLabel={t('NewsletterSubscription.label')}
        newsletterSubscriptionTitle={t('NewsletterSubscription.title')}
        passwordComplexitySettings={accountSettings.passwordComplexitySettings}
        profileDescription={t('profileDescription')}
        profileTitle={t('profileTitle')}
        title={t('title')}
        updateAccountAction={updateCustomer}
        updateAccountSubmitLabel={t('cta')}
        updateNewsletterSubscriptionAction={updateNewsletterSubscriptionActionWithCustomerInfo}
      />

      <div className="scroll-mt-24 border-t border-[var(--account-settings-section-border,hsl(var(--contrast-100)))] pt-12" id="addresses">
        <AddressListSection
          addressAction={addressAction}
          addresses={addressListProps.addresses}
          cancelLabel={tAddresses('cancel')}
          createLabel={tAddresses('create')}
          deleteLabel={tAddresses('delete')}
          editLabel={tAddresses('edit')}
          emptyStateTitle={tAddresses('EmptyState.title')}
          fields={addressListProps.fields}
          minimumAddressCount={0}
          setDefaultLabel={tAddresses('setDefault')}
          showAddFormLabel={tAddresses('cta')}
          title={tAddresses('title')}
          updateLabel={tAddresses('update')}
        />
      </div>
    </div>
  );
}
