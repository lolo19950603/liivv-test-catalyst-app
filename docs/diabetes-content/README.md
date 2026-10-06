# Diabetes Care: verified copy and open questions

The working record behind the Diabetes Care microsite (`/liivv-health/diabetes-care`). The page copy itself lives in `core/messages/{en,fr}.json` under `DiabetesCare`, its structure and sources in `core/app/[locale]/(default)/liivv-health/diabetes-care/`. The generated review pack for sign-off is `docs/content-review/diabetes-care/`.

| File | What it holds |
|---|---|
| `new-to-the-journey.md`, `staying-safe.md`, `your-tools.md`, `every-day-living.md`, `know-your-type.md`, `this-might-be-you.md` | One per chapter: the verified copy, its claims table (each claim, its source, what the source says), open rulings, held items, and a dated change log |
| `landing.md`, `funding.md`, `paths.md` | The same for the landing page, Funding & Coverage, and the five path pages |
| `OPEN-QUESTIONS.md` | Every open owner question in one place, by priority. Blocking items must be settled before the page or card goes live |
| `source-checks/` | The independent re-check of every cited source for each file: what was confirmed on the page itself, what was only partly confirmed, and what stays held |

Rules the copy follows:
- Every claim is backed by a registered source, Canadian first. International guidance is labelled.
- Anything not confirmed on the source page itself stays held.
- No individual dosing advice.
- Nothing says Liivv bills a program directly, offers pay-later, or promises a claim route until that is true. Since 2026-10-06 (owner answers A5, A6, B13) two things are true and said: the Liivv pharmacy in each province bills that province's drug plan directly (not in Quebec), and "Liivv Now, Pay Later" is offered for insulin pump supplies. No federal program or private insurer is said to be billed directly, and no claim is promised.
- No links to, hand-offs to, or mentions of other retailers.

When copy changes, update the file's change log, then run `node core/scripts/export-content-review.mjs` to regenerate the review pack (`--check` must exit 0).

## Rechecking the funding facts (monthly)

Owner answer B20 (2026-10-06): the funding facts are rechecked on a schedule. `NEXT_CHECK` and `RECHECK_OWNER` in `diabetes-care/funding/funding-meta.ts` say when and who ("Monthly automated recheck (scheduled), reviewed by the Liivv content owner").

From the repo root:

```bash
node core/scripts/check-funding-sources.mjs                    # report; exit 1 if anything changed
node core/scripts/check-funding-sources.mjs --json             # the same, as JSON
node core/scripts/check-funding-sources.mjs --only=on-odb-coverage,mb-pharmacare
node core/scripts/check-funding-sources.mjs --dump=<dir>       # also save each page's text, to read it
node core/scripts/check-funding-sources.mjs --url=<address>    # read a page that isn't registered yet
node core/scripts/check-funding-sources.mjs --update-baseline  # after the copy is brought up to date
```

What it does: for every register entry the Funding & Coverage page cites (each program's sources, the pages that print its phone numbers, the provincial drug plans billed directly, the private-insurance rules, and the page's own sentences, Diabetes Canada's included), it fetches the page, and its French page where there is one, following redirects with a browser-like user agent and a 45-second timeout. It records the HTTP status, the address it ended on, the title, any "last modified / updated / date modified" text (or a PDF's modification date), and a hash of the page's visible text, and checks that each program row's `checkPhrases` (short phrases copied exactly from the official page) are still there. It compares all of that with `core/scripts/data/funding-sources-baseline.json` and prints one line per page:

- **OK**: nothing recorded has changed.
- **CHANGED**: the status, address, title, printed date or text differs. Re-read the page, update the program's words, its `verifiedOn` and its record, then run `--update-baseline`.
- **MISSING PHRASE**: a phrase a program's copy rests on is gone from its page. Treat the program's card as unconfirmed until it is re-read.
- **BLOCKED**: the site refused the request (yukon.ca's bot check, a CAPTCHA, a 403, a timeout). Nothing tries to get past it: read the page in a browser instead, and record the check in funding.md.
- **NEW**: not in the baseline yet.

It exits 1 when anything is CHANGED or MISSING PHRASE, so a scheduled run flags it. The baseline of 2026-10-06 has 90 pages: 86 read and 4 yukon.ca pages blocked (read in a browser that day).

After each recheck: record the result in funding.md's change log, move `NEXT_CHECK` on a month, and regenerate the review pack.

The monthly run is scheduled (2026-10-06): the task "liivv-funding-recheck" runs the script at 09:07 on the 1st of each month, first run 2026-11-01, and writes its report to `docs/diabetes-content/funding-rechecks/YYYY-MM-DD.md`. It changes no copy (OPEN-QUESTIONS B20, funding.md G-71).
