'use server';

import { BigCommerceGQLError } from '@bigcommerce/catalyst-client';
import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { getLocale, getTranslations } from 'next-intl/server';
import { z } from 'zod';

import { DynamicFormActionArgs } from '@/vibes/soul/form/dynamic-form';
import { Field, FieldGroup, schema } from '@/vibes/soul/form/dynamic-form/schema';
import { redirect } from '~/i18n/routing';
import { createCustomerAccount } from '~/lib/auth/create-customer-account';
import { ACCOUNT_DEFAULT_REDIRECT_PATH } from '~/lib/makeswift/site-header/resolve-account-href';
import { assertRecaptchaTokenPresent, getRecaptchaFromForm } from '~/lib/recaptcha';

import { CUSTOMER_FIELDS_NAME_PREFIX } from './prefixes';

const stringToNumber = z.string().pipe(z.coerce.number());

const inputSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  password: z.string(),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z
    .object({
      firstName: z.string(),
      lastName: z.string(),
      address1: z.string(),
      address2: z.string().optional(),
      city: z.string(),
      company: z.string().optional(),
      countryCode: z.string(),
      stateOrProvince: z.string().optional(),
      phone: z.string().optional(),
      postalCode: z.string().optional(),
      formFields: z.object({
        checkboxes: z.array(
          z.object({
            fieldEntityId: stringToNumber,
            fieldValueEntityIds: z.array(stringToNumber),
          }),
        ),
        multipleChoices: z.array(
          z.object({
            fieldEntityId: stringToNumber,
            fieldValueEntityId: stringToNumber,
          }),
        ),
        numbers: z.array(
          z.object({
            fieldEntityId: stringToNumber,
            number: stringToNumber,
          }),
        ),
        dates: z.array(
          z.object({
            fieldEntityId: stringToNumber,
            date: z.string(),
          }),
        ),
        passwords: z.array(
          z.object({
            fieldEntityId: stringToNumber,
            password: z.string(),
          }),
        ),
        multilineTexts: z.array(
          z.object({
            fieldEntityId: stringToNumber,
            multilineText: z.string(),
          }),
        ),
        texts: z.array(
          z.object({
            fieldEntityId: stringToNumber,
            text: z.string(),
          }),
        ),
      }),
    })
    .optional(),
  formFields: z.object({
    checkboxes: z.array(
      z.object({
        fieldEntityId: stringToNumber,
        fieldValueEntityIds: z.array(stringToNumber),
      }),
    ),
    multipleChoices: z.array(
      z.object({
        fieldEntityId: stringToNumber,
        fieldValueEntityId: stringToNumber,
      }),
    ),
    numbers: z.array(
      z.object({
        fieldEntityId: stringToNumber,
        number: stringToNumber,
      }),
    ),
    dates: z.array(
      z.object({
        fieldEntityId: stringToNumber,
        date: z.string(),
      }),
    ),
    passwords: z.array(
      z.object({
        fieldEntityId: stringToNumber,
        password: z.string(),
      }),
    ),
    multilineTexts: z.array(
      z.object({
        fieldEntityId: stringToNumber,
        multilineText: z.string(),
      }),
    ),
    texts: z.array(
      z.object({
        fieldEntityId: stringToNumber,
        text: z.string(),
      }),
    ),
  }),
});

function parseRegisterCustomerInput(
  value: Record<string, string | number | string[] | undefined>,
  fields: Array<Field | FieldGroup<Field>>,
) {
  const customCustomerFields = fields
    .flatMap((f) => (Array.isArray(f) ? f : [f]))
    .filter((field) => field.name.startsWith(CUSTOMER_FIELDS_NAME_PREFIX));

  const mappedInput = {
    firstName: value.firstName,
    lastName: value.lastName,
    email: value.email,
    password: value.password,
    phone: value.phone,
    company: value.company,
    formFields: {
      checkboxes: customCustomerFields
        .filter((field) => ['checkbox-group'].includes(field.type))
        .filter((field) => Boolean(value[field.name]))
        .map((field) => {
          return {
            fieldEntityId: field.id,
            fieldValueEntityIds: Array.isArray(value[field.name])
              ? value[field.name]
              : [value[field.name]],
          };
        }),
      multipleChoices: customCustomerFields
        .filter((field) => ['radio-group', 'button-radio-group'].includes(field.type))
        .filter((field) => Boolean(value[field.name]))
        .map((field) => {
          return {
            fieldEntityId: field.id,
            fieldValueEntityId: value[field.name],
          };
        }),
      numbers: customCustomerFields
        .filter((field) => ['number'].includes(field.type))
        .filter((field) => Boolean(value[field.name]))
        .map((field) => {
          return {
            fieldEntityId: field.id,
            number: value[field.name],
          };
        }),
      dates: customCustomerFields
        .filter((field) => ['date'].includes(field.type))
        .filter((field) => Boolean(value[field.name]))
        .map((field) => {
          return {
            fieldEntityId: field.id,
            date: new Date(String(value[field.name])).toISOString(),
          };
        }),
      passwords: customCustomerFields
        .filter((field) => ['password'].includes(field.type))
        .filter((field) => Boolean(value[field.name]))
        .map((field) => ({
          fieldEntityId: field.id,
          password: value[field.name],
        })),
      multilineTexts: customCustomerFields
        .filter((field) => ['textarea'].includes(field.type))
        .filter((field) => Boolean(value[field.name]))
        .map((field) => ({
          fieldEntityId: field.id,
          multilineText: value[field.name],
        })),
      texts: customCustomerFields
        .filter((field) => ['text'].includes(field.type))
        .filter((field) => Boolean(value[field.name]))
        .map((field) => ({
          fieldEntityId: field.id,
          text: value[field.name],
        })),
    },
  };

  return inputSchema.parse(mappedInput);
}

export async function registerCustomer<F extends Field>(
  { fields, passwordComplexity }: DynamicFormActionArgs<F>,
  _prevState: {
    lastResult: SubmissionResult | null;
  },
  formData: FormData,
) {
  const t = await getTranslations('Auth.Register');
  const locale = await getLocale();

  const submission = parseWithZod(formData, {
    schema: schema(fields, passwordComplexity),
  });

  if (submission.status !== 'success') {
    return {
      lastResult: submission.reply(),
    };
  }

  const { siteKey, token } = await getRecaptchaFromForm(formData);
  const recaptchaValidation = assertRecaptchaTokenPresent(siteKey, token, t('recaptchaRequired'));

  if (!recaptchaValidation.success) {
    return {
      lastResult: submission.reply({ formErrors: recaptchaValidation.formErrors }),
    };
  }

  try {
    const input = parseRegisterCustomerInput(submission.value, fields);
    const created = await createCustomerAccount({
      firstName: String(input.firstName),
      lastName: String(input.lastName),
      email: String(input.email),
      password: String(input.password),
      recaptchaToken: recaptchaValidation.token,
    });

    if (!created.ok) {
      return {
        lastResult: submission.reply({ formErrors: [created.error] }),
      };
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    if (error instanceof BigCommerceGQLError) {
      return {
        lastResult: submission.reply({
          formErrors: error.errors.map(({ message }) => message),
        }),
      };
    }

    if (error instanceof Error) {
      return {
        lastResult: submission.reply({ formErrors: [error.message] }),
      };
    }

    return {
      lastResult: submission.reply({ formErrors: [t('somethingWentWrong')] }),
    };
  }

  return redirect({ href: ACCOUNT_DEFAULT_REDIRECT_PATH, locale });
}
