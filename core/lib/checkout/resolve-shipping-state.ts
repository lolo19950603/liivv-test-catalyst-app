import 'server-only';

import { getShippingCountries } from '~/app/[locale]/(default)/cart/page-data';

import {
  buildStatesByCountry,
  resolveBigCommerceStateOrProvince,
} from './resolve-state-or-province';

export async function resolveShippingStateOrProvince(
  countryCode: string,
  stateOrProvince: string | undefined,
): Promise<string | undefined> {
  const shippingCountries = await getShippingCountries();

  return resolveBigCommerceStateOrProvince(
    countryCode,
    stateOrProvince,
    buildStatesByCountry(shippingCountries),
  );
}
