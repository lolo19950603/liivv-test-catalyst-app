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

export const provincePharmacyInfo: Record<string, PharmacyContact> = {
  Ontario: DEFAULT_PHARMACY,
  'British Columbia': {
    name: 'Liivv Pharmacy BC',
    address: '1234 West Georgia Street',
    city: 'Vancouver',
    province: 'BC',
    postalCode: 'V6E 4H2',
    phone: '1(844) 561-1255',
    fax: '1(833) 734-0616',
  },
  Alberta: {
    name: 'Liivv Pharmacy Alberta',
    address: '456 Jasper Avenue',
    city: 'Edmonton',
    province: 'AB',
    postalCode: 'T5J 3N4',
    phone: '1(844) 561-1256',
    fax: '1(833) 734-0617',
  },
  Quebec: {
    name: 'Liivv Pharmacy Quebec',
    address: '789 Rue Sainte-Catherine',
    city: 'Montreal',
    province: 'QC',
    postalCode: 'H3B 1B7',
    phone: '1(844) 561-1257',
    fax: '1(833) 734-0618',
  },
  Manitoba: {
    name: 'Liivv Pharmacy Manitoba',
    address: '321 Portage Avenue',
    city: 'Winnipeg',
    province: 'MB',
    postalCode: 'R3B 2B9',
    phone: '1(844) 561-1258',
    fax: '1(833) 734-0619',
  },
  Saskatchewan: {
    name: 'Liivv Pharmacy Saskatchewan',
    address: '654 Albert Street',
    city: 'Regina',
    province: 'SK',
    postalCode: 'S4R 2P6',
    phone: '1(844) 561-1259',
    fax: '1(833) 734-0620',
  },
  'Nova Scotia': {
    name: 'Liivv Pharmacy Nova Scotia',
    address: '987 Barrington Street',
    city: 'Halifax',
    province: 'NS',
    postalCode: 'B3J 3K9',
    phone: '1(844) 561-1260',
    fax: '1(833) 734-0621',
  },
  'New Brunswick': {
    name: 'Liivv Pharmacy New Brunswick',
    address: '147 King Street',
    city: 'Saint John',
    province: 'NB',
    postalCode: 'E2L 1G5',
    phone: '1(844) 561-1261',
    fax: '1(833) 734-0622',
  },
  'Newfoundland and Labrador': {
    name: 'Liivv Pharmacy Newfoundland',
    address: '258 Water Street',
    city: "St. John's",
    province: 'NL',
    postalCode: 'A1C 1B5',
    phone: '1(844) 561-1262',
    fax: '1(833) 734-0623',
  },
  'Prince Edward Island': {
    name: 'Liivv Pharmacy PEI',
    address: '369 University Avenue',
    city: 'Charlottetown',
    province: 'PE',
    postalCode: 'C1A 4M9',
    phone: '1(844) 561-1263',
    fax: '1(833) 734-0624',
  },
  'Northwest Territories': {
    name: 'Liivv Pharmacy NWT',
    address: '4807 49th Street',
    city: 'Yellowknife',
    province: 'NT',
    postalCode: 'X1A 3T5',
    phone: '1(844) 561-1264',
    fax: '1(833) 734-0625',
  },
  Yukon: {
    name: 'Liivv Pharmacy Yukon',
    address: '2093 2nd Avenue',
    city: 'Whitehorse',
    province: 'YT',
    postalCode: 'Y1A 1B5',
    phone: '1(844) 561-1265',
    fax: '1(833) 734-0626',
  },
  Nunavut: {
    name: 'Liivv Pharmacy Nunavut',
    address: 'Building 1085',
    city: 'Iqaluit',
    province: 'NU',
    postalCode: 'X0A 0H0',
    phone: '1(844) 561-1266',
    fax: '1(833) 734-0627',
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
