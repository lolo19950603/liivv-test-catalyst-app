import { Address } from '@/vibes/soul/sections/address-list-section';
import {
  formFieldTransformer,
  injectCountryCodeOptions,
} from '~/data-transformers/form-field-transformer';
import {
  ADDRESS_FORM_LAYOUT,
  mapFormFieldValueToName,
  transformFieldsToLayout,
} from '~/data-transformers/form-field-transformer/utils';
import { getCustomerAddresses } from '~/app/[locale]/(default)/account/addresses/page-data';
import { exists } from '~/lib/utils';

export async function getAddressListSectionProps({
  after,
  before,
}: {
  after?: string;
  before?: string;
} = {}) {
  const data = await getCustomerAddresses({
    ...(after && { after }),
    ...(before && { before }),
  });

  if (!data) {
    return null;
  }

  const { shippingAddressFields = [], countries } = data;

  const addresses = data.addresses.map<Address>((address) => ({
    id: address.entityId.toString(),
    firstName: address.firstName,
    lastName: address.lastName,
    address1: address.address1,
    address2: address.address2 ?? undefined,
    city: address.city,
    stateOrProvince: address.stateOrProvince ?? undefined,
    countryCode: address.countryCode,
    postalCode: address.postalCode ?? undefined,
    phone: address.phone ?? undefined,
    company: address.company ?? undefined,
    ...address.formFields.reduce((acc, field) => {
      return {
        ...acc,
        ...mapFormFieldValueToName(field),
      };
    }, {}),
  }));

  const fields = transformFieldsToLayout(shippingAddressFields, ADDRESS_FORM_LAYOUT)
    .map((field) => {
      if (Array.isArray(field)) {
        return field.map(formFieldTransformer).filter(exists);
      }

      return formFieldTransformer(field);
    })
    .filter(exists)
    .map((field) => {
      if (Array.isArray(field)) {
        return field.map((f) => injectCountryCodeOptions(f, countries ?? []));
      }

      return injectCountryCodeOptions(field, countries ?? []);
    })
    .filter(exists);

  return {
    addresses,
    fields: [...fields, { name: 'id', type: 'hidden', label: 'ID' }],
  };
}
