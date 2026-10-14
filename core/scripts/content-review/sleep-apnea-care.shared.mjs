/*
 * Reviewer-only data for the Sleep Apnea Care pack, shared (generated from the build's
 * `chrome` fragment review.json: its open rulings with their defaults and alternatives,
 * the pre-publish checks, and the held copy that is not in the message files).
 * Read by ./sleep-apnea-care.mjs only; nothing renders it.
 */

export const REVIEW = {
  "openRulings": [],
  "prePublishChecks": [
    "Engine chrome copied from DiabetesCare (spec 2.2). Adapted values make no health claim: kicker, backToLanding, backToChapters, print.site, titleSuffix, resourcesIntro, shop.note, governance.machineTranslated, governance.disclosure.sells, discovery.heading, commerce.*.",
    "ui.commerce.rxMaskCheck and rxMaskParts are word for word the store’s CareNotices.rxMask.notice and partsLine (EN and FR)."
  ],
  "heldCopy": {
    "released": "",
    "items": []
  }
};
