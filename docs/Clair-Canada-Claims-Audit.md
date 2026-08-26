# Clair — Canadian Market Claims Audit
### Health Canada / Competition Act / provincial review of wearclair.com copy
**Prepared for:** Diabetes Express — Clair Canada launch (wearclair.ca → DE)
**Source reviewed:** wearclair.com homepage, /preorder, /terms, /blog/how-it-works-your-questions-answered
**Date:** August 2026

> **This is a regulatory risk assessment, not legal advice.** I'm not a lawyer and this hasn't been reviewed by anyone qualified in Canadian regulatory law. Everything in Tier 1 below should go to Canadian regulatory counsel (device/advertising specialty) before a single line of Canadian-facing copy is published. Treat this document as the working list that goes *to* counsel, not a substitute for them.

---

## 1. The structural problem, stated plainly

In Canada, **the copy is the classification.** There is no way to position around this.

Health Canada's own SaMD guidance says it directly: *"The functionality of any software product, and the manner in which it is represented or labeled for use, dictates whether it qualifies as a medical device."* And: *"In the event of a discrepancy between the manufacturer and Health Canada regarding the product classification… the final decision rests with Health Canada."*

Three consequences that drive every recommendation below:

**a) "Wellness device" is not a Canadian legal category.** The US has a formal FDA General Wellness enforcement policy that Clair's copy is clearly written against. Canada does not have an equivalent. The closest thing is an *exclusion list in a guidance document* — software "intended for maintaining or encouraging a healthy lifestyle, such as general wellness apps" — which is guidance, not regulation, and is narrower than the US policy. Clair cannot import its US safe harbour across the border.

**b) You cannot escape both regulators.** If the copy makes health claims, you're in *Food and Drugs Act* territory: s.20(1) prohibits advertising any device in a manner that is false, misleading, deceptive or *likely to create an erroneous impression* regarding its performance or intended use — and s.3(1) bars advertising a device to the general public as a treatment, preventative or cure for a Schedule A.1 disease. If the copy avoids health claims, you're still in *Competition Act* territory: s.74.01(1)(b) requires that every performance claim be supported by adequate and proper testing **conducted before the claim was made**, with the burden of proof on whoever made it. The accuracy percentages need substantiation either way.

**c) "Monitor" is not a neutral word.** Under Schedule 1 of the *Medical Devices Regulations*, active diagnostic devices are Class II, and Health Canada has stated that software systems are "considered active diagnostic devices because they are used for the purpose of **monitoring** a physiological condition, state of health, illness." Clair's product name — "the first continuous hormone **monitor**" — is the literal trigger language in the classification rule. It appears in the page title, meta description, H1 alt text, OG tags, meta keywords, and roughly forty times across the blog.

**The single most important structural finding:** Clair's own blog states that the validation data comes from prototype hardware and that *"the sensor stack has evolved substantially since that prototype."* Advertising 94.1% / 87% / 84.3% accuracy for the device you are actually selling, on the basis of testing done on different hardware, is the textbook fact pattern for a s.74.01(1)(b) contravention. **Diabetes Express becomes the person making that representation the moment it republishes those figures.**

---

## 2. TIER 1 — Critical: remove before Canadian launch

These are the items that, in my read, would most plausibly cause Health Canada to treat Clair as an unlicensed medical device, or the Competition Bureau to treat the marketing as reviewable conduct.

| # | Where | Current language | Why it's a problem in Canada | Replace with |
|---|---|---|---|---|
| 1 | Site-wide — title, H1, meta, OG, keywords, blog | "continuous hormone **monitor**" | "Monitoring a physiological condition" is the phrase Health Canada uses to define an active diagnostic device (Class II). Naming the product this way is a self-declaration of medical purpose. | "hormone-aware wellness tracker", "cycle insights wearable". Strip "monitor" from title, meta description, OG tags, keywords, alt text, URLs. |
| 2 | Homepage tile | "**Fertility Planning** — Understand your cycle and **ovulation timing** … to support your **fertility decisions**" | The FDA s.2 device definition expressly captures diagnosis of pregnancy and care during pregnancy, and fertility/ovulation products are regulated (fertility IVDDs are Class II by rule). This tile alone is a medical-purpose claim. It also **directly contradicts** the Terms, which say Clair must not be used as a sole method of fertility planning. A regulator reads both together; the disclaimer does not cure the claim, it evidences that you knew. | **Delete the tile.** Do not replace it with a softened fertility tile. If a fourth tile is needed, use something with no reproductive-planning purpose (e.g. "Energy & Sleep"). |
| 3 | FAQ / blog | "What hormones can Clair **detect**?" · "**87% LH surge detection** sensitivity" · "**ovulation confirmation**" · "event **detection**" | "Detect" and "confirm" are diagnostic verbs. Ovulation confirmation is a clinical determination. | Remove entirely. Where an equivalent is needed: "Clair estimates which phase of your cycle your body's signals are consistent with." Never "detect", "confirm", "diagnose", "identify", "measure". |
| 4 | Blog — "Will Clair report actual hormone numbers?" | "**Yes.**" … estradiol in pg/mL, progesterone in ng/mL, LH and FSH in mIU/mL … "This capability exists today." | Quantitative hormone reporting to a consumer is squarely diagnostic. Framing it as a *future* 2.0 feature doesn't help — it's offered as part of the current purchase proposition ("same hardware… free OTA upgrade"), so it forms part of how the product being sold today is represented. | Remove the entire Q&A from Canadian-facing content. No units (pg/mL, ng/mL, mIU/mL) anywhere. No promise of future quantitative reporting as a purchase inducement. |
| 5 | Blog | "analogous to how a **CGM** continuously monitors glucose" and the extended CGM comparison | Borrows the credibility of a licensed Class III medical device. **Doubly dangerous for Diabetes Express specifically**, because it links Clair to glucose/diabetes — and *diabetes is on Schedule A.1*, where s.3(1) prohibits advertising a device to the general public as treatment, preventative or cure. Note the drug/NHP exemptions in FDR A.01.067–068 **do not extend to devices**. | Remove all CGM, pulse oximeter and fetal monitor analogies from Canadian copy. |
| 6 | Terms §2 | Device "tracks various physiological metrics to provide insights into hormonal health, menstrual cycles, and **metabolic health**" | "Metabolic health" is claimed nowhere else and pulls toward diabetes/obesity — both Schedule A.1 conditions. In a diabetes-pharmacy channel this is the worst possible stray word. | Delete "and metabolic health". |
| 7 | Homepage + preorder, twice | "**HSA / FSA Eligible**" | US tax constructs. Canadian HSAs exist but eligibility runs through CRA's medical expense rules, and a general wellness wearable would not ordinarily qualify. Claiming eligibility is a misleading representation *and* an implicit admission that the product is a medical expense — undercutting the wellness position. It also exposes the customer to reassessment. | **Delete.** Do not substitute a Canadian eligibility claim without written CRA-informed advice. |
| 8 | Blog + FAQ, ~8 instances | "validated against **FDA-registered** at-home hormone tests" · "Clair 2.0 will pursue **FDA 510(k) clearance**" · "does not require FDA clearance" · "meeting **FDA thresholds**" | Irrelevant in Canada and likely to create an erroneous impression of regulatory endorsement (FDA s.20(1)). "FDA-registered" is a weak term even in the US — registration is not clearance or approval — and a Canadian consumer will read it as approval. | Remove every FDA reference from .ca copy. If a regulatory statement is needed, state the Canadian position: "Clair is not licensed by Health Canada as a medical device and has not been evaluated by Health Canada for safety or effectiveness." |
| 9 | Blog | "deviating from your **personal baseline in potentially meaningful ways**" | This is abnormality detection — the model flagging that something may be wrong. That is a diagnostic function regardless of the hedging. | "how your current patterns compare with your own typical range." Remove any implication that a deviation is clinically meaningful or warrants action. |
| 10 | Blog, repeatedly | "**PCOS**", "women with PCOS or other cycle irregularities" | Naming a diagnosed disorder as a target population is a strong medical-purpose signal. | Remove PCOS by name. "Irregular cycles" as a neutral descriptive term is acceptable. |
| 11 | Blog / FAQ, ~12 instances | "**clinical**-grade", "**clinical** validation", "**clinical** evidence", "**medical-grade** claims" | "Clinical" and "medical-grade" position the product inside clinical practice. | "laboratory reference measurements" for the comparator; "research" not "clinical evidence". Delete "medical-grade" entirely. |

---

## 3. TIER 2 — High: rewrite before launch

Softenable rather than deletable, but the current wording is doing avoidable damage.

| Where | Current | Recommended |
|---|---|---|
| Homepage tile | "Identify hormonal patterns and changes across your cycle to better understand **symptoms**, **balance**, and overall wellbeing" | "Notice how your energy, sleep and mood shift across your cycle." **"Symptoms"** is disease language. **"Hormonal balance"** is a classic unsubstantiable wellness claim and a Bureau target. Also be careful with mood — *depression is on Schedule A.1*. |
| Homepage tile | "**Navigating (Peri)Menopause** … insights for perimenopause and menopause" | Reframe to a life-stage, not a condition to be managed: "Changes over time — see how your body's daily signals shift as you get older." Note that menopause *testing* is treated as fertility testing and classed as a Class II IVDD, so anything resembling menopause status determination is out. |
| Hero | "The **world's first** wearable for hormone-aware health" | Uniqueness/superiority claims require substantiation like any other performance claim, and the same press coverage that describes Clair also names Eli Health, Peri and Biologica in the same space. Qualify precisely or drop. |
| Hero | "designed for women, **by women**" | A factual representation about the company. Confirm it's defensible given the founding team as publicly reported, or soften to "built around female physiology." |
| Logo wall | "**Trusted institutions** where the Clair team brings experience and expertise from" — Apple, Whoop, J&J, Stanford Medicine, Meta, Princeton, Mercedes-Benz | Logo walls create a general impression of institutional endorsement or partnership, which is the test the Bureau applies. Stanford Medicine and J&J specifically imply clinical validation. Also a trademark-use exposure. **Recommend: replace logos with plain text**, headed "Members of the Clair team have previously worked at:" — or omit for Canada. |
| Media bar | HHS National Conference on Women's Health logo, presented as "peer-reviewed" | Using a US federal health agency's mark implies government endorsement. Remove for Canada. Also verify "peer-reviewed" is accurate for a conference presentation. |
| FAQ | "What **clinical evidence** supports Clair?" — answer blends completed prototype work with studies not yet run | Mixing planned studies into an evidence answer is misleading by general impression. Separate cleanly: what has been done (with its limits), and what is planned (clearly labelled as not yet complete). |
| "Ask Clair" | Voice assistant "for health questions" | An assistant answering individualised health questions edges into patient decision support software, which Health Canada's SaMD guidance treats as potentially a device. Needs hard guardrails: no condition naming, no individualised recommendations, no interpretation of the user's own data as a health finding, mandatory referral language. Given DE is a **pharmacy**, an AI answering health questions in your channel also touches provincial pharmacy-practice and professional-advertising rules. |

---

## 4. TIER 3 — Performance claims requiring substantiation

Every figure below is a performance claim under s.74.01(1)(b). The onus is on the advertiser, the test must predate the claim, and **"the claim is in fact accurate" is not a defence** if adequate testing wasn't done first.

Figures currently published: 94.1% overall accuracy · 95.2% regular cycles · 84.3% irregular cycles · 87% LH surge sensitivity / 93% specificity · phase-specific 92–96% sensitivity, 95–98% specificity · "~16 percentage point" ablation degradation · "highly accurate for irregular cycles" · comparative figures against BBT, calendar apps, LH strips and named competitor Ava.

**The problem:** the study was n=40+, 127 cycles, on prototype hardware that Clair says has since changed substantially. Claims about the retail device are therefore not supported by testing on the retail device.

**Recommended position:**
1. **Default — remove all numeric accuracy claims from Canadian copy.** This is the clean answer and costs less than it appears; the qualitative story survives intact.
2. If Clair insists on retaining them, DE must hold a written substantiation file *before* launch containing: full study protocol, n, population, dates, hardware revision used, cross-validation method, and an explicit statement of whether the retail hardware was tested. Any published figure needs a visible footnote disclosing the prototype-hardware limitation and the sample size.
3. **Delete the head-to-head comparisons against Ava, BBT and named competitor methods.** Comparative performance claims carry the same substantiation burden plus disparagement exposure, and are enforcement-attractive.
4. "20% off MSRP" is a separate exposure — ordinary selling price rules require the reference price to be a genuine selling price under a volume or time test. A product that has never sold at MSRP in Canada cannot be advertised as 20% off it. **Recommend: state the Canadian price in CAD with no reference-price comparison.**
5. "Limited spots" / "Final Founding Member window" / "The first 5,000 Founding Members sold out" — scarcity and urgency representations must be true and must be capable of proof. If the counter is evergreen or resets, that is a misleading representation. Confirm with Clair in writing.

---

## 5. Geo-separation — the thing that undoes everything else

Clean Canadian copy on DE's site does not protect you if Canadians reach wearclair.com and see the US version. Because DE is the Canadian seller and controls wearclair.ca, exposure follows.

**Required before launch:**
- wearclair.ca must not simply mirror wearclair.com. It needs a distinct Canadian content set.
- Geo-detection on wearclair.com routing Canadian IPs to Canadian content, or an interstitial.
- A written agreement that Clair will not run Canada-targeted paid ads, social posts, or influencer briefs containing Tier 1 language. **Meta keywords and ad copy are advertising** — the Bureau says so explicitly.
- App store listings (Apple/Google, Canadian storefronts) are advertising and must be audited on the same basis. So is in-app copy — the app is labelling.
- Clair's Substack, Instagram, TikTok and LinkedIn are commercial communications reaching Quebec consumers, which brings the *Charter of the French Language* into play alongside everything above.

**On Liivv:** whatever Liivv's role is in the launch, if it functions as a creator or influencer channel, material-connection disclosure is an express Competition Bureau enforcement priority and undisclosed brand relationships are reviewable. If Liivv is importer of record rather than a marketing partner, a different set of duties attaches (see §9). Worth pinning down in writing which it is.

---

## 6. Terms of Service — Canadian version required

The current Terms are drafted for a US consumer and contain provisions that are unenforceable here. A Canadian addendum or a separate Canadian ToS is needed.

| Clause | Issue | Fix |
|---|---|---|
| §19 Governing law — California, San Francisco courts | Quebec courts retain jurisdiction over consumer contracts regardless of any waiver (CCQ art. 3149). Ontario CPA applies where either party is in Ontario. | Canadian consumers: law of the consumer's province; venue in the consumer's province. |
| §18 Binding arbitration (AAA) | Ontario's CPA invalidates mandatory arbitration clauses in consumer agreements. Quebec's CPA does likewise. Alberta only permits them if the consumer gets a post-dispute choice. BC differs again. | Carve out Canadian consumers, or drop arbitration for Canada. AAA is a non-starter regardless. |
| §18 Class action waiver | Expressly prohibited in Ontario consumer agreements; unenforceable in Quebec. | Remove for Canadian consumers. |
| §4 "Clair is a general wellness device and is **NOT a medical device**" | Don't assert a regulatory conclusion Health Canada controls. Also, this clause **contradicts** the homepage fertility tile. | "Clair is sold in Canada as a general wellness product. It is not licensed by Health Canada as a medical device and has not been evaluated by Health Canada for safety or effectiveness." Then align the marketing to match. |
| §5 "at least 18 years of age" | Age of majority is 19 in BC, NB, NL, NS, NT, NU and YT. | "18 (19 where the age of majority in your province or territory is 19)." Implement a real age gate, not a checkbox. |
| §10 Subscription auto-renewal | Negative-option renewal is restricted in several provinces; Quebec and Ontario have specific pre-renewal notice and cancellation requirements. | Province-specific renewal notice and cancellation language. |
| §13/14 Limitation of liability and "AS IS" | Provincial consumer law implies statutory warranties that cannot be contracted out of — notably Quebec's legal warranty of fitness and durability (CPA art. 37–38), which is robust and non-waivable. | Add: "Nothing in these Terms limits any right you have under applicable consumer protection legislation in your province or territory, including the legal warranty under the Quebec *Consumer Protection Act*." |
| Preorder — "ship December 2026", "100% refundable until we ship" | This is a future-performance / internet agreement. Ontario's CPA 2002 (still in force; the CPA 2023 has royal assent but no proclaimed in-force date — confirm status at launch) requires specific pre-contract disclosure, a copy of the agreement, delivery-date rules and cancellation rights. Quebec's distance-contract rules (CPA art. 54.1 ff.) are stricter still and require named disclosures before the consumer is bound. | Purpose-built Canadian preorder terms with express delivery date, cancellation rights, and refund mechanics. Do not take a 16-month-forward preorder on US terms. |
| Missing | No CASL-compliant consent language for the "Get early access" capture | Express consent, sender identification, and a functioning unsubscribe are mandatory; CRTC penalties run to $10M for corporations. Build the consent record now. |

---

## 7. Privacy — a separate workstream, not a footnote

Continuous physiological data tied to reproductive health is about as sensitive as consumer data gets, and this is the area where a complaint is most likely to arrive from a user rather than a regulator.

- **PIPEDA** applies federally. Sensitivity of the data means **express, not implied, consent**, with granular purposes.
- **Quebec Law 25** is the binding constraint: named privacy officer, French-language privacy policy, privacy-by-default settings, mandatory privacy impact assessment **before** transferring personal information outside Quebec, and specific consent requirements. Clair's optional cloud backup is presumably US-hosted — that triggers the PIA.
- **Alberta PIPA and BC PIPA** apply to organisations in those provinces and have their own breach-notification thresholds.
- The zero-knowledge / local-first architecture is a genuine asset here — it materially reduces exposure and should be foregrounded in Canadian copy. But Terms §7's "we cannot recover it if lost" needs plain-language prominence at the point of enabling backup, not buried in clause 7.
- Research participation (§8) needs consent language that meets Canadian ethics norms if any Canadian user data feeds studies.
- Confirm whether any of the sensor data constitutes biometric information under Quebec's IT framework legislation — that carries separate notification duties. Flag to counsel.

---

## 8. Disclaimers to add — drafted, EN and FR

French versions below are working drafts and need review by a qualified Quebec French reviewer before publication; regulatory copy is exactly where a good-faith translation goes wrong.

### A. Site-wide footer, every page
> **EN —** Clair is sold in Canada as a general wellness product. It is not licensed by Health Canada as a medical device and has not been evaluated by Health Canada for safety or effectiveness. Clair does not diagnose, treat, cure, prevent or monitor any disease, disorder or condition. Clair does not measure hormone levels; it estimates patterns from physiological signals such as skin temperature, heart rate and heart rate variability. Clair is not a substitute for advice from a physician, pharmacist, nurse practitioner or other qualified health professional. Always consult a health professional with any question about your health.

> **FR —** Clair est vendu au Canada à titre de produit de bien-être général. Il n'est pas homologué par Santé Canada comme instrument médical et n'a pas été évalué par Santé Canada quant à son innocuité ou à son efficacité. Clair ne sert pas à diagnostiquer, traiter, guérir, prévenir ni surveiller une maladie, un trouble ou un état de santé. Clair ne mesure pas les taux d'hormones; il estime des tendances à partir de signaux physiologiques tels que la température cutanée, la fréquence cardiaque et la variabilité de la fréquence cardiaque. Clair ne remplace pas l'avis d'un médecin, d'un pharmacien, d'une infirmière praticienne ou d'un autre professionnel de la santé qualifié. Consultez toujours un professionnel de la santé pour toute question concernant votre santé.

### B. Short form — adjacent to every insight, chart or metric in-app and on-site
> **EN —** Estimates only. Not a hormone test and not a medical assessment.
> **FR —** Estimations seulement. Ne constitue ni un test hormonal ni une évaluation médicale.

### C. Reproductive health — mandatory wherever cycle content appears
> **EN —** Clair is not a contraceptive and must not be used to prevent pregnancy. It is not intended to identify a fertile window, to confirm ovulation, or to support conception planning. Speak with a health professional about contraception or fertility.

> **FR —** Clair n'est pas un moyen de contraception et ne doit pas être utilisé pour prévenir une grossesse. Il n'est pas conçu pour déterminer une période de fertilité, confirmer l'ovulation ni soutenir la planification d'une grossesse. Consultez un professionnel de la santé au sujet de la contraception ou de la fertilité.

### D. Performance-claim footnote — only if any figure is retained
> **EN —** Based on an internal study of [n] participants across [n] cycles conducted in [dates] using prototype hardware that differs from the retail device. Individual results will vary. Not reviewed by Health Canada.

> **FR —** Fondé sur une étude interne menée auprès de [n] participantes sur [n] cycles en [dates], à l'aide d'un prototype différent de l'appareil vendu au détail. Les résultats individuels varieront. N'a pas fait l'objet d'un examen par Santé Canada.

### E. Checkout — an actual checkbox, not passive text
> **EN —** I understand that Clair is a general wellness product, is not licensed by Health Canada as a medical device, does not measure hormone levels, and must not be used to prevent pregnancy or to make decisions about medication or medical care.

> **FR —** Je comprends que Clair est un produit de bien-être général, qu'il n'est pas homologué par Santé Canada comme instrument médical, qu'il ne mesure pas les taux d'hormones, et qu'il ne doit pas être utilisé pour prévenir une grossesse ni pour prendre des décisions concernant des médicaments ou des soins médicaux.

### F. Ask Clair / any AI feature
> **EN —** Ask Clair provides general wellness information only. It does not provide medical advice, diagnosis or treatment, and it does not know your medical history. Contact a health professional about any health concern. In an emergency, call 911.

> **FR —** Ask Clair fournit uniquement des renseignements généraux sur le bien-être. Il ne fournit pas d'avis médical, de diagnostic ni de traitement, et ne connaît pas vos antécédents médicaux. Communiquez avec un professionnel de la santé pour toute préoccupation de santé. En cas d'urgence, composez le 911.

**Placement matters.** A disclaimer buried in the footer does not cure a headline claim — the test under both the *Competition Act* and FDA s.20 is the **general impression** conveyed. Disclaimer B needs to sit next to the claim it qualifies, in comparable type size.

---

## 9. Provincial and other layers

**Quebec — the heaviest lift.** The *Charter of the French Language* requires a French version of commercial web content, at parity with the English version in content and functionality, for anyone doing business in Quebec regardless of where they're located or how many people they employ. Beyond that: since 1 June 2025, generic or descriptive terms inside a non-French trademark on a product, its packaging, or documents supplied with it must appear in French. **"Health" in "Clair Health" is a descriptive term** — flag this to Clair for packaging now, because the 2027 grace period only covers products manufactured before June 2025 and won't apply to a new launch. Customer service must also be available in French. OQLF penalties run $3,000–$30,000 per violation and can attach to directors personally.

**Federal labelling.** The *Consumer Packaging and Labelling Act* requires bilingual mandatory label information on prepackaged consumer products. If Health Canada ever takes the view that Clair is a device, MDR labelling requirements attach on top.

**ISED.** A Bluetooth wearable needs ISED radio certification and the certification number displayed. Not a copy issue, but a launch gate — confirm Clair has Canadian certification, not just FCC.

**Advertising Standards Canada.** The *Canadian Code of Advertising Standards* applies regardless of regulatory classification — Clause 1 (accuracy), Clause 8 (testimonials), Clause 10 (safety). ASC also runs a voluntary preclearance service. Given the sensitivity here, **preclearance is worth the cost**; it's cheap insurance and creates a defensible good-faith record.

**Pharmacy practice.** Because DE is a pharmacy, provincial college advertising and professional-conduct standards apply to how you promote this. That's a materially higher bar than a general e-commerce retailer faces, and it's your regulator too — not just Health Canada's.

---

## 10. The Diabetes Express–specific exposure

Three things are unique to your position and don't appear anywhere in Clair's own risk model:

**1. You become the advertiser.** Under both the *Competition Act* and FDA s.20, liability attaches to the person making the representation. Republishing Clair's copy makes it your representation, and Clair's US substantiation does not transfer. You need a claim-substantiation file in your own hands.

**2. Retail context is evidence of intended use.** A hormone wearable sold on a pharmacy site, alongside glucose meters, test strips and prescription services, carries a stronger inference of medical purpose than the identical product sold on a lifestyle site. Health Canada looks at how a product is *represented*, and merchandising context is representation. Concretely: **do not place Clair in a category or nav path with medical devices, do not cross-sell it with diabetes products, do not let it appear in "monitors" or "testing" categories, and do not let any co-marketing suggest metabolic or glucose relevance.** Given diabetes is a Schedule A.1 condition, that last one isn't a soft preference.

**3. If the classification goes the wrong way, you have licensing duties.** If Health Canada were to treat Clair as a medical device — even Class I — the importer/distributor needs a **Medical Device Establishment Licence**. Class II or above additionally requires a product-specific Medical Device Licence held by the manufacturer, with ISO 13485 / MDSAP certification behind it. Confirm now whether DE would be importer of record or whether Clair (or Liivv) holds that role, and get the answer in the distribution agreement.

**Contract protections to secure before launch:**
- Written rep and warranty from Clair that all Canadian-facing claims are substantiated and that testing predates the claims
- Delivery of the underlying substantiation file, including hardware revision tested
- Indemnity covering regulatory proceedings and consumer claims arising from Clair-supplied copy
- DE approval right over all Canada-facing copy, including app store listings, in-app content, social and influencer briefs
- Clair's covenant not to run Canada-targeted advertising containing Tier 1 language
- Clear allocation of importer-of-record status and any resulting MDEL obligation

---

## 11. Pre-launch checklist

- [ ] Tier 1 items removed from all Canadian-facing surfaces (site, app, app store, social, email, ads, meta tags)
- [ ] Canadian counsel (device/advertising) sign-off on final copy
- [ ] Substantiation file received from Clair and reviewed, or all numeric claims dropped
- [ ] Canadian ToS + privacy policy drafted; arbitration, class waiver and governing law fixed
- [ ] Preorder terms rebuilt for Ontario and Quebec distance/future-performance rules
- [ ] Full French version of site, app and customer service at parity
- [ ] Descriptive-term issue in "Clair Health" raised with Clair for packaging
- [ ] Law 25 privacy impact assessment completed for any Quebec data leaving the province
- [ ] CASL consent flow built for the waitlist
- [ ] ISED certification confirmed
- [ ] Age gate implemented at 18/19 by province
- [ ] Geo-routing live between wearclair.com and wearclair.ca
- [ ] Merchandising rules set: Clair isolated from diabetes and medical-device categories
- [ ] MDEL question answered in writing; importer of record named
- [ ] ASC preclearance considered
- [ ] Customer service scripts written — agents must not make claims the site can't
- [ ] Standing review cadence set, since Clair will keep publishing new copy after launch

---

## 12. Open questions

1. What exactly is Liivv's role — marketing partner, retail channel, or importer of record? The answer changes the compliance duties materially.
2. Will wearclair.ca be DE-controlled end to end, or does Clair retain publishing rights?
3. Is the app a Clair storefront listing or a DE-fronted one? App store listings are advertising.
4. Does Clair have Canadian regulatory counsel already, or is DE carrying that alone?
5. Will Clair agree to a Canada-specific content set, or is the commercial expectation that DE mirrors the US site? **If it's the latter, that is the decision point** — the US copy as written is not launchable here without change.
6. Is DE the seller of record, or a referrer? A referral model reduces but does not eliminate advertiser liability.

---

*Sources consulted: Food and Drugs Act ss. 2, 3, 20 and Schedule A.1; Medical Devices Regulations SOR/98-282 (Schedule 1 classification rules); Health Canada, Guidance Document — Software as a Medical Device (SaMD): Definition and Classification; Health Canada, Notice — Software Regulated as a Class I or Class II Medical Device; Competition Act ss. 52, 74.01; Competition Bureau guidance on performance claims and ordinary selling price; Charter of the French Language (as amended by Law 14 / Bill 96) and the Regulation respecting the language of commerce and business; Ontario Consumer Protection Act, 2002 and Consumer Protection Act, 2023; Quebec Consumer Protection Act and Civil Code art. 3149; PIPEDA and Quebec Law 25; Consumer Packaging and Labelling Act; Canadian Code of Advertising Standards.*
