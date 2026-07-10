import 'server-only';

const CLINICAL_PHARMACY_PATTERNS: RegExp[] = [
  /\b(is it safe|safe to take|can i take|should i take|okay to take|ok to take)\b/i,
  /\b(side effect|side-effects|adverse reaction|allergic reaction|allergy to)\b/i,
  /\b(drug interaction|interact with|mix with|combine with)\b/i,
  /\b(dosage|dose|how much should i|how many should i|double my|cut my)\b/i,
  /\b(symptom|symptoms|diagnos|diagnose|medical advice|health advice)\b/i,
  /\b(pregnant|pregnancy|breastfeed|breastfeeding|nursing)\b/i,
  /\b(pain relief|fever|nausea|vomit|dizzy|dizziness|swelling|rash)\b/i,
  /\b(substitute for|alternative to).{0,40}\b(med|drug|medication|pill)\b/i,
  /\b(talk to a pharmacist|speak to a pharmacist|pharmacist please|need a pharmacist)\b/i,
  /\b(will this (cure|treat|help)|does this (cure|treat))\b/i,
];

const OPERATIONAL_PHARMACY_PATTERNS: RegExp[] = [
  /\b(status|pending|approved|denied|submitted|upload|refill request|carepack)\b/i,
  /\b(how (do|to)|where (do|to)|view|find|check).{0,30}\b(prescription|refill|pharmacy)\b/i,
];

export type MessageClassification = 'store' | 'escalate_pharmacist';

export function classifyCustomerMessage(message: string): MessageClassification {
  const text = message.trim();

  if (!text) {
    return 'store';
  }

  const isOperationalPharmacy = OPERATIONAL_PHARMACY_PATTERNS.some((pattern) => pattern.test(text));

  if (isOperationalPharmacy) {
    return 'store';
  }

  const isClinical = CLINICAL_PHARMACY_PATTERNS.some((pattern) => pattern.test(text));

  if (isClinical) {
    return 'escalate_pharmacist';
  }

  return 'store';
}

export const PHARMACIST_ESCALATION_REPLY =
  "I can't provide medical or medication advice. I've notified a pharmacist on our team — they'll join this chat as soon as they're available.\n\nFor store questions (orders, products, or how to use your account), I'm still happy to help.";
