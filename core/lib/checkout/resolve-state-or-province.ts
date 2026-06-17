interface StateOption {
  value: string;
  label: string;
}

export function buildStatesByCountry(
  shippingCountries: Array<{
    code: string;
    statesOrProvinces: Array<{ abbreviation: string; name: string }>;
  }>,
): Array<{ country: string; states: StateOption[] }> {
  return shippingCountries.map((country) => ({
    country: country.code,
    states: country.statesOrProvinces.map((state) => ({
      value: state.abbreviation,
      label: state.name,
    })),
  }));
}

export function resolveBigCommerceStateOrProvince(
  countryCode: string,
  stateOrProvince: string | undefined,
  statesByCountry: Array<{ country: string; states: StateOption[] }>,
): string | undefined {
  const resolved = resolveStateOrProvinceCode(countryCode, stateOrProvince, statesByCountry);

  return resolved.stateOrProvince ?? stateOrProvince;
}

export function resolveStateOrProvinceCode(
  countryCode: string,
  stateOrProvince: string | undefined,
  statesByCountry: Array<{ country: string; states: StateOption[] }>,
): { stateOrProvince?: string; stateOrProvinceCode?: string } {
  if (!stateOrProvince) {
    return {};
  }

  const trimmed = stateOrProvince.trim();

  if (!trimmed) {
    return {};
  }

  const countryStates = statesByCountry.find((entry) => entry.country === countryCode)?.states ?? [];
  const matchByValue = countryStates.find(
    (state) => state.value.toLowerCase() === trimmed.toLowerCase(),
  );
  const matchByLabel = countryStates.find(
    (state) => state.label.toLowerCase() === trimmed.toLowerCase(),
  );
  const match = matchByValue ?? matchByLabel;

  if (match) {
    return {
      stateOrProvince: match.label,
      stateOrProvinceCode: match.value,
    };
  }

  if (trimmed.length <= 3) {
    return {
      stateOrProvince: trimmed,
      stateOrProvinceCode: trimmed,
    };
  }

  return {
    stateOrProvince: trimmed,
  };
}
