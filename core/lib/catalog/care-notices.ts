import 'server-only';

import { getTranslations } from 'next-intl/server';

import type { PapDeviceKind } from './prescription-devices';

/*
 * =============================================================================
 * CARE NOTICES ON THE STORE'S OWN PAGES
 * =============================================================================
 * The short notices under a product page's buy box (or in place of it) for
 * products that need a professional: insulin and glucagon (a pharmacist
 * reviews and dispenses every order) and prescription devices (CPAP, APAP,
 * bilevel and ASV machines; ./prescription-devices.ts).
 *
 * Read here, on the server, and handed down as text: neither CareNotices nor
 * DiabetesCare is in the browser's message bundle (CareNotices is stripped in
 * liivv-health/_microsite/client-messages.ts), so no page's payload changes.
 *
 * Each clinical notice shows its sources on the notice itself, never named in
 * the sentence. Each source was opened and read on 2026-10-13:
 *
 *   alberta               MyHealth.Alberta.ca (Alberta Health Services),
 *                         Buyer's Information for CPAP Therapy Equipment:
 *                         use CPAP only with a prescription from your doctor;
 *                         each machine must be set for the person using it.
 *   bcPapGuide            Government of BC, Ministry of Health, Positive
 *                         Airway Pressure (PAP) Buyer's Guide: PAP prescribed
 *                         after a physical evaluation and diagnostic testing;
 *                         APAP and BiPAP "should only be prescribed by a Sleep
 *                         Specialist"; commonly used PAP devices can make
 *                         central sleep apnea worse; settings "should only be
 *                         adjusted by trained professionals".
 *   healthCanadaAsvRecall Health Canada recall RA-53771, Adaptive
 *                         Servo-Ventilation therapy devices (2015-05-13): a
 *                         serious safety concern in people with symptomatic
 *                         chronic heart failure with reduced ejection fraction.
 *   crto                  College of Respiratory Therapists of Ontario, What
 *                         you need to know about community respiratory
 *                         therapy: it is your right to choose your provider.
 *
 * No pressure numbers and no settings advice, ever: the prescriber sets them.
 * =============================================================================
 */

export const CARE_NOTICE_SOURCES = {
  alberta:
    'https://myhealth.alberta.ca/Alberta/Pages/Buyers-Information-for-CPAP-Therapy-Equipment.aspx',
  bcPapGuide:
    'https://www2.gov.bc.ca/assets/gov/health/practitioner-pro/medical-services-plan/diagnostic-facilities/announcements/pap_buyers_guide.pdf',
  healthCanadaAsvRecall:
    'https://recalls-rappels.canada.ca/en/alert-recall/adaptive-servo-ventilation-avs-therapy-devices-2015-05-13',
  crto: 'https://www.crto.on.ca/public/respiratory-health-information/need-know-respiratory-therapy/',
} as const;

export type CareNoticeSourceId = keyof typeof CARE_NOTICE_SOURCES;

export interface CareNoticeSource {
  id: CareNoticeSourceId;
  label: string;
  href: string;
}

export interface CareNotice {
  id: string;
  text: string;
  sources: CareNoticeSource[];
}

type DeviceNoticeId = 'prescription' | 'pressure' | 'centralApnea' | 'bilevel' | 'asv' | 'supplier';

/* Which notices each kind of device carries, in the order they are shown. */
const DEVICE_NOTICES: Readonly<Record<PapDeviceKind, readonly DeviceNoticeId[]>> = {
  'cpap-apap': ['prescription', 'pressure', 'centralApnea', 'supplier'],
  travel: ['prescription', 'pressure', 'centralApnea', 'supplier'],
  bundle: ['prescription', 'pressure', 'centralApnea', 'supplier'],
  bilevel: ['prescription', 'bilevel', 'pressure', 'supplier'],
  asv: ['prescription', 'asv', 'pressure', 'supplier'],
};

/* The sources shown on each notice. */
const DEVICE_NOTICE_SOURCES: Readonly<Record<DeviceNoticeId, readonly CareNoticeSourceId[]>> = {
  prescription: ['alberta', 'bcPapGuide'],
  pressure: ['bcPapGuide', 'alberta'],
  centralApnea: ['bcPapGuide'],
  bilevel: ['bcPapGuide'],
  asv: ['healthCanadaAsvRecall', 'bcPapGuide'],
  supplier: ['crto'],
};

/* The notices a prescription device's product page shows, with their sources. */
export async function prescriptionDeviceNotices(kind: PapDeviceKind): Promise<CareNotice[]> {
  const t = await getTranslations('CareNotices');

  return DEVICE_NOTICES[kind].map((id) => ({
    id,
    text: t(`notices.${id}`),
    sources: DEVICE_NOTICE_SOURCES[id].map((sourceId) => ({
      id: sourceId,
      label: t(`sources.${sourceId}`),
      href: CARE_NOTICE_SOURCES[sourceId],
    })),
  }));
}

/* The words of the "Prescription required" panel that replaces a device's buy box. */
export async function prescriptionDeviceSlotCopy() {
  const t = await getTranslations('CareNotices.device');

  return {
    title: t('title'),
    body: t('body'),
    howToSend: t('howToSend'),
    sendPrescription: t('sendPrescription'),
    bookCall: t('bookCall'),
    noticesLabel: t('noticesLabel'),
    sourcesLabel: (count: number) => t('sourcesLabel', { count }),
  };
}

/*
 * The pharmacist notice under an insulin or glucagon product page's buy box
 * (owner answers A1, A8, B3, B11, B29; the rule is in diabetes-care/dc-ids.ts).
 * The words stay where they were, in `DiabetesCare.ui.commerce`, unchanged;
 * the Diabetes shop strips print the same keys. Cold-chain is said of insulin
 * only: glucagon (Baqsimi) is kept at room temperature. Operational notices,
 * not clinical claims, so they carry no sources. Empty when neither.
 */
export async function pharmacistNotices({
  insulin,
  glucagon,
}: {
  insulin: boolean;
  glucagon: boolean;
}): Promise<CareNotice[]> {
  if (!insulin && !glucagon) {
    return [];
  }

  const t = await getTranslations('DiabetesCare.ui.commerce');
  const notices: CareNotice[] = [
    { id: 'pharmacistNotice', text: t('pharmacistNotice'), sources: [] },
  ];

  if (insulin) {
    notices.push(
      { id: 'insulinColdChain', text: t('insulinColdChain'), sources: [] },
      { id: 'quebecInsulin', text: t('quebecInsulin'), sources: [] },
    );
  }

  return notices;
}
