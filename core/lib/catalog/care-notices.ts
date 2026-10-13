import 'server-only';

import { getTranslations } from 'next-intl/server';

import type { RxMaskKind } from './cpap-masks';
import type { PapDeviceKind } from './prescription-devices';

/*
 * =============================================================================
 * CARE NOTICES ON THE STORE'S OWN PAGES
 * =============================================================================
 * The short notices under a product page's buy box (or in place of it) for
 * products that need a professional: insulin and glucagon (a pharmacist
 * reviews and dispenses every order), prescription devices (CPAP, APAP,
 * bilevel and ASV machines; ./prescription-devices.ts) and complete CPAP
 * masks (a Liivv pharmacist validates the CPAP prescription; ./cpap-masks.ts).
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
 *                         "only use CPAP therapy if you have a prescription
 *                         from your doctor"; get a prescription "for your CPAP
 *                         therapy equipment and your settings".
 *   bcPapGuide            Government of BC, Ministry of Health, Positive
 *                         Airway Pressure (PAP) Buyer's Guide: APAP and BiPAP
 *                         "should only be prescribed by a Sleep Specialist";
 *                         commonly used PAP devices "are not meant to be the
 *                         only treatment for central sleep apnea" and used
 *                         alone can make it worse; suspected central apnea is
 *                         evaluated with an overnight sleep laboratory test;
 *                         settings "should only be adjusted by trained
 *                         professionals". It says nothing about ASV.
 *   healthCanadaAsvRecall Health Canada recall RA-53771, Adaptive
 *                         Servo-Ventilation therapy devices (2015-05-13, now
 *                         archived): a serious safety concern in patients with
 *                         symptomatic, chronic heart failure with reduced left
 *                         ventricular ejection fraction. It gives no cut-off.
 *   crto                  College of Respiratory Therapists of Ontario, What
 *                         you need to know about community respiratory
 *                         therapy: "it is your right to choose your community
 *                         respiratory therapy provider". Ontario only, so the
 *                         notice says so.
 *
 * No pressure numbers and no settings advice, ever: settings come with the
 * prescription and only trained professionals change them.
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

/*
 * Which notices each kind of device carries, in the order they are shown.
 * 'supplier' (choosing your provider) is about buying a machine from Liivv,
 * so it is off while Liivv sells no machines (owner decision, 2026-10-13).
 */
const DEVICE_NOTICES: Readonly<Record<PapDeviceKind, readonly DeviceNoticeId[]>> = {
  'cpap-apap': ['prescription', 'pressure', 'centralApnea'],
  travel: ['prescription', 'pressure', 'centralApnea'],
  bundle: ['prescription', 'pressure', 'centralApnea'],
  bilevel: ['prescription', 'bilevel', 'pressure'],
  asv: ['prescription', 'asv', 'pressure'],
};

/* The sources shown on each notice. */
const DEVICE_NOTICE_SOURCES: Readonly<Record<DeviceNoticeId, readonly CareNoticeSourceId[]>> = {
  prescription: ['alberta', 'bcPapGuide'],
  pressure: ['bcPapGuide', 'alberta'],
  centralApnea: ['bcPapGuide'],
  bilevel: ['bcPapGuide'],
  asv: ['healthCanadaAsvRecall'],
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

/* The words of the "Not sold by Liivv yet" panel that replaces a device's buy box. */
export async function prescriptionDeviceSlotCopy() {
  const t = await getTranslations('CareNotices.device');

  return {
    title: t('title'),
    body: t('body'),
    shopSupplies: t('shopSupplies'),
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

/*
 * The notice under a complete CPAP mask's buy box (owner ruling C26 (b),
 * 2026-10-13; ./cpap-masks.ts): the mask needs a CPAP prescription and a
 * Liivv pharmacist checks it before the order ships; parts for a mask the
 * customer already has don't; and, on a child's mask, the pharmacist checks
 * the child's prescription. The first line carries its source on the notice
 * (MyHealth.Alberta.ca: get a prescription "for your CPAP therapy equipment").
 * The others are how Liivv works, so they carry none. No settings words.
 */
export async function rxMaskNotices(kind: RxMaskKind): Promise<CareNotice[]> {
  const t = await getTranslations('CareNotices');
  const notices: CareNotice[] = [
    {
      id: 'rxMaskNotice',
      text: t('rxMask.notice'),
      sources: [{ id: 'alberta', label: t('sources.alberta'), href: CARE_NOTICE_SOURCES.alberta }],
    },
    { id: 'rxMaskParts', text: t('rxMask.partsLine'), sources: [] },
  ];

  if (kind === 'paediatric') {
    notices.push({ id: 'rxMaskChild', text: t('rxMask.childLine'), sources: [] });
  }

  return notices;
}

/*
 * The words around the complete-mask notice: its label, sources and the
 * Pharmacy page link. On a child's mask, the line says to add the child's
 * CPAP prescription (wording for the nurse to confirm, C17).
 */
export async function rxMaskNoticeCopy(kind: RxMaskKind = 'adult') {
  const t = await getTranslations('CareNotices');

  return {
    label: t('rxMask.label'),
    howTo: kind === 'paediatric' ? t('rxMask.howToChild') : t('rxMask.howTo'),
    pharmacyLink: t('rxMask.pharmacyLink'),
    sourcesLabel: (count: number) => t('device.sourcesLabel', { count }),
  };
}
