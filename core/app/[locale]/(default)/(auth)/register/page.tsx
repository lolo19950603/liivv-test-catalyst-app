import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { Field } from '@/vibes/soul/form/dynamic-form/schema';
import { DynamicFormSection } from '@/vibes/soul/sections/dynamic-form-section';
import { OliviaAuthStage } from '~/components/olivia/olivia-auth-stage';
import { formFieldTransformer } from '~/data-transformers/form-field-transformer';
import {
  REGISTER_CUSTOMER_ALLOWED_FIELD_IDS,
  REGISTER_CUSTOMER_FORM_LAYOUT,
  transformFieldsToLayout,
} from '~/data-transformers/form-field-transformer/utils';
import { getRecaptchaSiteKey } from '~/lib/recaptcha';
import { exists } from '~/lib/utils';

import { registerCustomer } from './_actions/register-customer';
import { getRegisterCustomerQuery } from './page-data';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const t = await getTranslations({ locale, namespace: 'Auth.Register' });

  return {
    title: t('title'),
  };
}

// There is currently a GraphQL gap where the "Exclusive Offers" field isn't accounted for
// during customer registration, so the field should not be shown on the Catalyst storefront until it is hooked up.
function removeExlusiveOffersField(field: Field | Field[]): boolean {
  if (Array.isArray(field)) {
    // Exclusive offers field will always have ID '25', since it is made upon store creation and is also read-only.
    return !field.some((f) => f.id === '25');
  }

  return field.id !== '25';
}

export default async function Register({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations('Auth.Register');
  const tOlivia = await getTranslations('Auth.Register.Olivia');

  const registerCustomerData = await getRegisterCustomerQuery({
    address: { sortBy: 'SORT_ORDER' },
    customer: { sortBy: 'SORT_ORDER' },
  });

  if (!registerCustomerData) {
    notFound();
  }

  const { addressFields, customerFields, passwordComplexitySettings } = registerCustomerData;

  const recaptchaSiteKey = await getRecaptchaSiteKey();

  const fields = transformFieldsToLayout(
    [...addressFields, ...customerFields].filter((field) =>
      REGISTER_CUSTOMER_ALLOWED_FIELD_IDS.includes(field.entityId),
    ),
    REGISTER_CUSTOMER_FORM_LAYOUT,
  )
    .map((field) => {
      if (Array.isArray(field)) {
        return field.map(formFieldTransformer).filter(exists);
      }

      return formFieldTransformer(field);
    })
    .filter(exists)
    .filter(removeExlusiveOffersField);

  return (
    <OliviaAuthStage
      copy={{
        kicker: tOlivia('kicker'),
        heading: t('heading'),
        lead: tOlivia('lead'),
        mascotAlt: tOlivia('mascotAlt'),
        switcherLabel: t('signIn'),
        switcherHref: '/login',
        submitting: tOlivia('submitting'),
        error: tOlivia('error'),
        oneStepAway: tOlivia('oneStepAway'),
        almostDone: tOlivia('almostDone'),
        named: tOlivia('named'),
        idle: [tOlivia('idle0'), tOlivia('idle1')],
        firstName: tOlivia('firstName'),
        lastName: tOlivia('lastName'),
        email: tOlivia('email'),
        password: tOlivia('password'),
        confirmPassword: tOlivia('confirmPassword'),
      }}
      scene="register"
    >
      <DynamicFormSection
        action={registerCustomer}
        errorTranslations={{
          firstName: {
            invalid_type: t('FieldErrors.firstNameRequired'),
          },
          lastName: {
            invalid_type: t('FieldErrors.lastNameRequired'),
          },
          email: {
            invalid_type: t('FieldErrors.emailRequired'),
            invalid_string: t('FieldErrors.emailInvalid'),
          },
          password: {
            invalid_type: t('FieldErrors.passwordRequired'),
            too_small: t('FieldErrors.passwordTooSmall', {
              minLength: passwordComplexitySettings?.minimumPasswordLength ?? 0,
            }),
            lowercase_required: t('FieldErrors.passwordLowercaseRequired'),
            uppercase_required: t('FieldErrors.passwordUppercaseRequired'),
            number_required: t('FieldErrors.passwordNumberRequired', {
              minNumbers: passwordComplexitySettings?.minimumNumbers ?? 1,
            }),
            special_character_required: t('FieldErrors.passwordSpecialCharacterRequired'),
            passwords_must_match: t('FieldErrors.passwordsMustMatch'),
          },
          confirmPassword: {
            invalid_type: t('FieldErrors.passwordRequired'),
          },
        }}
        fields={fields}
        passwordComplexity={passwordComplexitySettings}
        recaptchaSiteKey={recaptchaSiteKey}
        submitLabel={t('cta')}
      />
    </OliviaAuthStage>
  );
}
