/**
 * Reviewer-only data for Chapter 04 · Every Day Living, read by the Diabetes
 * Care pass of the content-review export (./diabetes-care.mjs).
 *
 * From the chapter's copy record after the source check of 2026-10-05: its open
 * rulings (section D), the factual checks still to make before it is published,
 * and the wording it holds back (section E). None of it renders on any page and
 * none of it is in the message files. ./diabetes-care.mjs says what each list
 * is for and checks every `where` path and card number against the chapter.
 *
 * The clinical rulings of 2026-10-06 settled Staying Safe's defaults carried
 * here and D1–D13 and D15–D17 of this chapter's own; what is left (D14) is the
 * owner's. When the owner rules on it, the entry comes out.
 */

export const EVERY_DAY_LIVING = {
  openRulings: [
    /* This chapter's own. */
    {
      id: 'D14',
      default:
        '**Placeholders:** the accent colour (`#c9dcc0`) and the archive images in `chapters-meta.ts`.',
      where: [],
      alternative: 'The owner picks them when the Diabetes image set is chosen.',
    },
  ],

  prePublishChecks: [
    'Done by the source check: every factual sentence was checked against the live page or PDF on 2026-10-05, and the register notes it listed (Ch18 2023, Ch21, Ch32, Ch9, DC Exercise, DC Mental Health, DC Air Travel, CATSA, DC Heart, DC Kidney, the Kidney Foundation page, CNIB, the foot-care sheet, 9-8-8, the cannabis position, the alcohol sheet and the rights page) are now in `sources-review.ts`.',
    'Card 3’s 911 line rests on the Heart and Stroke Foundation’s "Signs of a heart attack" (registered 2026-10-05; its French page is the hrefFr), as ruled (C3). No registered page gives the signs of a stroke, so H1 on card 11 stays held.',
    'DC "Alcohol and diabetes" sheet (04/18, reflects the 2018 guidelines): still served on 2026-10-06 (code 111025), and card 4 says it is from 2018 (ruling C16). Re-check it on publish day.',
    'Diabetes Canada’s eye page (`dc-eye-damage-retinopathy`, ruling C24) has no printed date: re-open it on publish day with the rest of card 9’s sources.',
    'DC "Taking care of your mental health": re-open its "Find a mental health provider near you" link and record where it goes. If it is not Breakthrough T1D’s directory, it can be a second route on card 5.',
    'Card 12 rests on Diabetes Canada alone (six items, no second publisher). The support line (1-800-226-8464) is printed on every Diabetes Canada page; re-check it on publish day.',
    'The checkup-year map (an optional band figure in the copy record) is not built. The band ships as its four cards, which would stay as the map’s no-JS and /fr fallback. Its copy has not been written or checked.',
  ],

  heldCopy: {
    released:
      'Released by the owner’s answers of 2026-10-06 (A2, B5, B9, B12): the CDE contact, the general phone line, email, hours and About page of Bayshore Express Pharmacy, in the CDE panel and the CDE lane (`ui.contact`). Since owner note 5 (2026-10-07) the service is presented as Liivv’s: phone and hours only, no email, no About link.',
    items: [
      {
        topic: 'Signs of a heart attack or stroke',
        cards: [11],
        why: 'Only the heart-attack signs are registered (hsf-heart-attack-signs, for card 3); no registered page gives the signs of a stroke',
        wording:
          '"Chest pain or pressure, trouble breathing, sudden weakness or trouble speaking: call 911"',
        check: 'A Heart and Stroke Foundation stroke-signs page (register it)',
      },
      {
        topic: 'Older alcohol limits, and Ch18 2023’s per-occasion line',
        cards: [4],
        why: 'Ruling C16 (2026-10-06) released the 2023 positions, each in its own words (4.items.5). Still left out: Ch11 (2018) and the 04/18 sheet’s daily and weekly limits, which are older than the 2023 advice, and Ch18’s line on more than 4 drinks per occasion, which can read as permission. CCSA’s 2 a week is never stated as a limit',
        wording: '—',
        check: '—',
      },
      {
        topic: 'In-use insulin "30 days at room temperature" (DC Air Travel)',
        cards: [6],
        why: 'Ruling C15 (2026-10-06): Diabetes Canada’s 30 days is not used, because some labels say 28; Your Tools and Staying Safe say "most up to 28 days once opened, some longer" (Diabète Québec), then "follow your leaflet"',
        wording: '—',
        check: '—',
      },
      {
        topic: 'Sleep tips and sleep apnea',
        cards: [5],
        why: 'Only "sleeping problems are common" (Ch18) and activity aiding sleep (DC Exercise) are sourced. Ch21 mentions sleep apnea and driving, at clinician level',
        wording: '"If you snore or feel sleepy during the day, tell your team"',
        check: 'A Canadian patient page on sleep and diabetes (none registered)',
      },
      {
        topic:
          'Other crisis and support lines (Kids Help Phone, Hope for Wellness, Wellness Together Canada)',
        cards: [5],
        why: 'Not checked; not in the register',
        wording: 'Routes for youth and Indigenous readers',
        check: 'Each service’s own site',
      },
      {
        topic: 'Diabetes Canada’s mental health provider directory',
        cards: [5],
        why: 'The DC page links one, but where it goes was not recorded; it may be Breakthrough T1D’s',
        wording: 'A second route chip',
        check: 'Re-open the DC page link',
      },
      {
        topic: 'Lower-risk cannabis guidelines (avoid high-potency THC, smoking, daily use)',
        cards: [4],
        why: 'Ch18 2023 cites Canada’s Lower-Risk Cannabis Use Guidelines, which are not registered',
        wording: '"If you use cannabis, Canada’s lower-risk guidelines suggest…"',
        check: 'Canada’s Lower-Risk Cannabis Use Guidelines (CAMH / Health Canada)',
      },
      {
        topic: 'Provincial driving and licensing rules',
        cards: [7],
        why: 'No ministry page verified',
        wording: 'A reporting line per province',
        check: 'Each province’s licensing authority',
      },
      {
        topic: 'Commercial driving specifics beyond the guideline',
        cards: [7],
        why: 'Ruling C9 (2026-10-06) released the 12 months and Diabetes Canada’s medical-fitness and medical-exam lines (7.items.8–9); anything further rests on the clinician-facing CMA Driver’s Guide',
        wording: '—',
        check: 'CMA Driver’s Guide (registered); DC driving position statement (not registered)',
      },
      {
        topic: 'Employment accommodation, human rights complaints',
        cards: [12],
        why: 'DC’s employment position statement and the human rights commissions are not registered',
        wording:
          '"If you’re treated unfairly at work because of diabetes, you can contact your provincial human rights commission"',
        check: 'DC employment position; Canadian Human Rights Commission',
      },
      {
        topic: 'Insurance rights',
        cards: [12],
        why: 'DC insurance position not registered',
        wording: '—',
        check: 'DC insurance position statement',
      },
      {
        topic: 'Monofilament, foot exam method',
        cards: [8],
        why: 'Ch32 is clinician-level',
        wording: '"Your doctor may touch your foot with a thin nylon thread to test feeling"',
        check: 'Ch32; a patient page',
      },
      {
        topic: 'Pregnancy eye exams (CPG Ch36) and children’s screening schedules',
        cards: [9, 10],
        why: 'They belong in This Might Be You (cards 1 and 2, where a child’s checks were added by ruling C37). Here, since ruling C24: Diabetes Canada’s "before you get pregnant and while you’re pregnant", COS’s first trimester, and "ask your child’s team"',
        wording: '—',
        check: 'CPG Ch36, Ch34',
      },
      {
        topic: 'Foot creams and a monofilament in the card 8 shop strip',
        cards: [8],
        why: 'Placements resumed (B21) and cards 2, 3, 6 and 8 carry shop strips (chapter-shop.ts). The two diabetic foot creams the catalogue has (7342, 7332) make symptom claims, so they wait on the nurse; no monofilament is stocked',
        wording: '—',
        check: 'Nurse ruling on the creams; a stocked monofilament',
      },
      {
        topic: 'Kits in the shop strips',
        cards: [2, 3, 6, 8],
        why: 'No kit is listed until the owner verifies kits-for-review.md (A4)',
        wording: '—',
        check: 'Owner sign-off of each kit',
      },
    ],
  },
};
