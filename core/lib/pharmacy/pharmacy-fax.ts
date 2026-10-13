/** Province → Liiv pharmacy contact for doctor fax email template. */
type PharmacyContact = {
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  fax: string;
};

const DEFAULT_PHARMACY: PharmacyContact = {
  name: 'Bayshore Express Pharmacy',
  address: '233 Alden Road',
  city: 'Markham',
  province: 'ON',
  postalCode: 'L3R 3W6',
  phone: '1(844) 561-1254',
  fax: '1(833) 734-0615',
};

/*
 * One Bayshore pharmacy per province, from the 2024 Bayshore pharmacy list.
 * Quebec and the territories have no entry of their own in that list, so they
 * fall back to Bayshore Express Pharmacy in Ontario. Liivv's pharmacies serve
 * all of Canada, Quebec and the territories included (owner, 2026-10-06), and
 * Bayshore Express Pharmacy transfers to the Liivv pharmacy in another
 * province as needed.
 */
export const provincePharmacyInfo: Record<string, PharmacyContact> = {
  Ontario: DEFAULT_PHARMACY,
  'British Columbia': {
    name: 'Bayshore Pharmacy',
    address: '7313 Meadow Avenue',
    city: 'Burnaby',
    province: 'BC',
    postalCode: 'V5J 4Z2',
    phone: '1(855) 237-2473',
    fax: '1(855) 233-3146',
  },
  Alberta: {
    name: 'Bayshore Pharmacy',
    address: '#100, 17936 106A Avenue',
    city: 'Edmonton',
    province: 'AB',
    postalCode: 'T5S 1V3',
    phone: '1(855) 430-0730',
    fax: '1(855) 307-2929',
  },
  Saskatchewan: {
    name: 'Bayshore Pharmacy',
    address: '620 Duchess Street',
    city: 'Saskatoon',
    province: 'SK',
    postalCode: 'S7K 0R1',
    phone: '1(855) 325-1510',
    fax: '1(855) 856-0880',
  },
  Manitoba: {
    name: 'Bayshore Pharmacy',
    address: '1700 Ness Avenue',
    city: 'Winnipeg',
    province: 'MB',
    postalCode: 'R3J 3Y1',
    phone: '1(855) 239-9621',
    fax: '1(844) 899-2099',
  },
  'New Brunswick': {
    name: 'Bayshore Pharmacy',
    address: '600 Main Street, Building C (Hilyard Place)',
    city: 'Saint John',
    province: 'NB',
    postalCode: 'E2K 1J5',
    phone: '1(855) 214-3306',
    fax: '1(855) 328-4736',
  },
  'Nova Scotia': {
    name: 'Bayshore Pharmacy',
    address: '920-202 Brownlow Avenue',
    city: 'Dartmouth',
    province: 'NS',
    postalCode: 'B3B 1T5',
    phone: '1(855) 759-2797',
    fax: '1(855) 205-3219',
  },
  'Prince Edward Island': {
    name: 'Bayshore Pharmacy',
    address: '5-167 Minna Jane Drive',
    city: 'Charlottetown',
    province: 'PE',
    postalCode: 'C1E 0C4',
    phone: '1(855) 549-9423',
    fax: '1(902) 894-5554',
  },
  'Newfoundland and Labrador': {
    name: 'Bayshore Pharmacy',
    address: '9B Paton Street',
    city: "St. John's",
    province: 'NL',
    postalCode: 'A1B 4S8',
    phone: '1(855) 406-0255',
    fax: '1(855) 328-5610',
  },
};

export const provinceAbbreviations: Record<string, string> = {
  ON: 'Ontario',
  BC: 'British Columbia',
  AB: 'Alberta',
  QC: 'Quebec',
  MB: 'Manitoba',
  SK: 'Saskatchewan',
  NS: 'Nova Scotia',
  NB: 'New Brunswick',
  NL: 'Newfoundland and Labrador',
  PE: 'Prince Edward Island',
  NT: 'Northwest Territories',
  YT: 'Yukon',
  NU: 'Nunavut',
};

export function resolveProvinceLabel(provinceOrCode: string | null | undefined): string {
  const raw = (provinceOrCode ?? '').trim();

  if (!raw) {
    return 'Ontario';
  }

  if (provinceAbbreviations[raw]) {
    return provinceAbbreviations[raw];
  }

  if (provincePharmacyInfo[raw]) {
    return raw;
  }

  return 'Ontario';
}

export function generateFaxRequestEmail(params: {
  provinceLabel: string;
  fullName: string;
}): string {
  const province = resolveProvinceLabel(params.provinceLabel);
  const pharmacyInfo = provincePharmacyInfo[province] ?? DEFAULT_PHARMACY;
  const fullName = params.fullName.trim() || 'Your Name';

  return `Hello,

Could you please send a copy of all my prescriptions on file to my new pharmacy?

${pharmacyInfo.name}
${pharmacyInfo.address},
${pharmacyInfo.city}, ${pharmacyInfo.province}, ${pharmacyInfo.postalCode}

Phone: ${pharmacyInfo.phone}
Fax: ${pharmacyInfo.fax}

Thank you,
${fullName}`;
}

/*
 * The request a customer copies and sends to their prescriber's office to
 * have their CPAP prescription faxed to Liivv (owner ruling C26 (b),
 * 2026-10-13: a Liivv pharmacist validates it before a complete CPAP mask can
 * be bought). Same province-to-pharmacy fax map as generateFaxRequestEmail
 * (Quebec and the territories fall back to Ontario). The pharmacy is named as
 * Liivv Pharmacy, the customer-facing name (owner question Q15 in the C26
 * design: whether the licensed pharmacy's own name must appear here). It asks
 * for the CPAP prescription only, not "all my prescriptions", and names no
 * settings. The patient's name and date of birth are left for the customer to
 * fill in, so the prescriber's office can find the right chart when the mask
 * is for a child (wording for the nurse to confirm, C17).
 */
export function generateCpapFaxRequestEmail(params: {
  provinceLabel: string;
  fullName: string;
}): string {
  const province = resolveProvinceLabel(params.provinceLabel);
  const pharmacyInfo = provincePharmacyInfo[province] ?? DEFAULT_PHARMACY;
  const fullName = params.fullName.trim() || 'Your Name';

  return `Hello,

Could you please fax a copy of the CPAP prescription for the patient below to my pharmacy? A Liivv pharmacist needs to check it before I can order a CPAP mask.

Patient's name:
Patient's date of birth:

Liivv Pharmacy
${pharmacyInfo.address},
${pharmacyInfo.city}, ${pharmacyInfo.province}, ${pharmacyInfo.postalCode}

Phone: ${pharmacyInfo.phone}
Fax: ${pharmacyInfo.fax}

Thank you,
${fullName}`;
}
