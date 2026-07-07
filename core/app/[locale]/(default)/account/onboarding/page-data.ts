import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { TAGS } from '~/client/tags';
import { getCustomerAddresses } from '~/app/[locale]/(default)/account/addresses/page-data';
import {
  getPrimaryCategoryDisplay,
  resolveInitialHealthCategoriesWithRank,
} from '~/lib/onboarding/liiv-primary-health-category';
import { getHealthProfileByProfileId } from '~/lib/supabase/health-profile';
import { getOnboardingStatus } from '~/lib/supabase/onboarding';
import { ensureCustomerProfile, getCustomerProfileByBigCommerceId } from '~/lib/supabase/profile';
import { isSupabaseConfigured } from '~/lib/supabase/client';

const OnboardingCustomerQuery = graphql(`
  query OnboardingCustomerQuery {
    customer {
      entityId
      firstName
      lastName
      email
    }
  }
`);

export type OnboardingCustomer = {
  entityId: number;
  firstName: string;
  lastName: string;
  email: string;
};

export const getOnboardingCustomer = cache(async (): Promise<OnboardingCustomer | null> => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  if (!customerAccessToken) {
    return null;
  }

  const response = await client.fetch({
    document: OnboardingCustomerQuery,
    customerAccessToken,
    fetchOptions: { cache: 'no-store', next: { tags: [TAGS.customer] } },
  });

  const customer = response.data.customer;

  if (!customer) {
    return null;
  }

  return {
    entityId: customer.entityId,
    firstName: customer.firstName?.trim() ?? '',
    lastName: customer.lastName?.trim() ?? '',
    email: customer.email?.trim() ?? '',
  };
});

export const getOnboardingProfileInitial = cache(async () => {
  const customer = await getOnboardingCustomer();

  if (!customer) {
    return null;
  }

  const addressData = await getCustomerAddresses({ limit: 1 });
  const address = addressData?.addresses[0];

  return {
    firstName: customer.firstName,
    lastName: customer.lastName,
    phone: address?.phone ?? '',
    address1: address?.address1 ?? '',
    address2: address?.address2 ?? '',
    city: address?.city ?? '',
    postalCode: address?.postalCode ?? '',
    stateOrProvince: address?.stateOrProvince ?? '',
    countryCode: address?.countryCode ?? 'CA',
  };
});

export const getWellnessDashboardContext = cache(async () => {
  const customer = await getOnboardingCustomer();

  if (!customer || !isSupabaseConfigured()) {
    return {
      supabaseReady: false,
      primaryCategory: null,
      careInterests: [] as string[],
      onboardingComplete: false,
      onboardingHref: null as string | null,
    };
  }

  const ensured = await ensureCustomerProfile(customer);
  const profile =
    ensured.status === 'ok'
      ? ensured.profile
      : await getCustomerProfileByBigCommerceId(String(customer.entityId));
  const status = await getOnboardingStatus(String(customer.entityId));
  const ranked = resolveInitialHealthCategoriesWithRank(profile?.care_interests ?? status?.care_interests);
  const primary = ranked[0] ? getPrimaryCategoryDisplay(ranked[0].id) : null;
  const onboardingComplete = Boolean(
    status?.onboarding_step1_completed_at &&
      status.health_profile_completed_at &&
      status.insurance_info_completed_at,
  );

  return {
    supabaseReady: ensured.status === 'ok' || profile != null,
    primaryCategory: primary,
    careInterests: profile?.care_interests ?? status?.care_interests ?? [],
    onboardingComplete,
    onboardingHref: onboardingComplete
      ? null
      : `/account/onboarding/profile?setup=1`,
  };
});

export const getHealthProfileStepData = cache(async () => {
  const customer = await getOnboardingCustomer();

  if (!customer) {
    return null;
  }

  const addressData = await getCustomerAddresses({ limit: 1 });
  const address = addressData?.addresses[0];
  const isOntario =
    (address?.stateOrProvince ?? '').trim().toUpperCase() === 'ON' ||
    (address?.stateOrProvince ?? '').trim().toUpperCase() === 'ONTARIO';

  if (!isSupabaseConfigured()) {
    return {
      customer,
      supabaseReady: false,
      isOntario,
      initialCategories: [],
      initialHealthProfile: null,
      healthProfileCompleted: false,
      profileInitial: {
        firstName: customer.firstName,
        lastName: customer.lastName,
      },
    };
  }

  const ensured = await ensureCustomerProfile(customer);

  if (ensured.status !== 'ok') {
    return {
      customer,
      supabaseReady: false,
      isOntario,
      initialCategories: [],
      initialHealthProfile: null,
      healthProfileCompleted: false,
      profileInitial: {
        firstName: customer.firstName,
        lastName: customer.lastName,
      },
    };
  }

  const [healthProfile, status] = await Promise.all([
    getHealthProfileByProfileId(ensured.profile.id),
    getOnboardingStatus(String(customer.entityId)),
  ]);

  return {
    customer,
    supabaseReady: true,
    isOntario,
    initialCategories: resolveInitialHealthCategoriesWithRank(ensured.profile.care_interests).map(
      (row) => row.id,
    ),
    initialHealthProfile: healthProfile,
    healthProfileCompleted: Boolean(status?.health_profile_completed_at),
    profileInitial: {
      firstName: customer.firstName,
      lastName: customer.lastName,
    },
    profileId: ensured.profile.id,
  };
});
