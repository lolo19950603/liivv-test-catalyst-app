# IT setup guide: Liivv pharmacy email through Microsoft 365

**For:** the Microsoft 365 / Exchange Online administrator.
**From:** the Liivv web team.
**Date:** 2026-10-14.

---

## Do these three things first

1. **Never put a secret in email, Teams or chat.** That includes:
   - a private key;
   - a client secret;
   - the cron secret.

   Secrets go straight into Vercel, typed by the owner, or by you if the owner gives you access to the Vercel project. Section 7 has the steps.

2. **Do not add any `Mail.*` permission under the app's "API permissions" in Entra.** Section 4 explains why.

3. **When you finish, send the owner the non-secret values in section 6.**

---

## What this is for

Liivv's pharmacists will message customers about CPAP prescriptions and mask orders. The website will:
- **send** these emails from the pharmacy mailbox of the customer's province, through Microsoft Graph;
- **read replies** from that mailbox's Inbox, so each reply is added to the customer's record;
- **read Sent Items**, so a pharmacist's reply sent straight from Outlook is added too.

**What the app gets:**
- read, write and send permission on the **nine pharmacy mailboxes only**: ON, BC, AB, SK, MB, NB, NS, PE and NL. Quebec and the territories are served by the Ontario mailbox.

**What the app never gets:**
- access to any other mailbox;
- user passwords;
- delegated sign-in;
- directory read access;
- a credential that works from preview or test deployments.

**Microsoft references:**
- [Role Based Access Control for Applications in Exchange Online](https://learn.microsoft.com/en-us/exchange/permissions-exo/application-rbac). It replaces Application Access Policies, so don't create those.
- [Add and manage app credentials](https://learn.microsoft.com/en-us/entra/identity-platform/how-to-add-credentials)
- [Vercel: Connect to Microsoft Azure (OIDC)](https://vercel.com/docs/oidc/azure)
- [Messages sent from a shared mailbox aren't saved to Sent Items](https://learn.microsoft.com/en-us/troubleshoot/exchange/user-and-shared-mailboxes/sent-mail-is-not-saved)
- [Plus addressing in Exchange Online](https://learn.microsoft.com/en-us/exchange/recipients-in-exchange-online/plus-addressing-in-exchange-online)

---

## 0. Before you start

**Roles you need:**
- **Application Administrator** or **Cloud Application Administrator** in Entra, for the app registration.
- **Exchange Administrator**, or membership of Organization Management, for the mailboxes and RBAC for Applications.

**Ask the owner for:**
- **The mailbox address for each of the nine provinces, and the domain.**
  - The rule is that customers see "Liivv", never the provincial pharmacy's name.
  - So the recommendation is **new shared mailboxes on a Liivv domain**, with the display name **Liivv Pharmacy**.
  - Using existing provincial pharmacy mailboxes would show their name and address to customers. The sync would also have to filter out unrelated mail.
- **The Vercel team slug and project name**, needed for the passwordless credential (section 3, Option A).
- **Whether the Liivv Vercel project has OIDC federation on.** In Vercel this is Project → Settings → Security → OIDC Federation, issuer mode **Team**.

**Write down for yourself:** the tenant's data location (Microsoft 365 admin center → Settings → Org settings → Organization profile → Data location). The owner's privacy officer will ask for it.

---

## 1. Domain and the nine shared mailboxes

### 1.1 Domain (if a Liivv domain is used)

1. Add the domain: Microsoft 365 admin center → Settings → Domains.
2. **SPF:** add `include:spf.protection.outlook.com` to the domain's **existing** SPF record.
   - Never publish a second SPF record; a domain can have only one.
   - If the shop already sends mail from this domain through another service, keep that service's include as well.
   - A subdomain such as `pharmacy.<liivv-domain>` avoids clashing with that other service. Agree the choice with the owner.
3. **DKIM:** enable it for the domain in the Microsoft Defender portal (Email & collaboration → Policies → Email authentication settings → DKIM), and publish the two CNAME records it gives you.
4. **DMARC:** publish `_dmarc` with `p=none` first, then move to `quarantine` once reports are clean.
   - This makes it harder for anyone to fake a "Liivv Pharmacy" email.
   - It also helps the app spot fake replies.

### 1.2 Create the mailboxes

The names below are examples. Use the addresses the owner gives you.

```powershell
Connect-ExchangeOnline -UserPrincipalName <your admin UPN>

$boxes = @{
  ON = 'pharmacy-on@<liivv-domain>'; BC = 'pharmacy-bc@<liivv-domain>'; AB = 'pharmacy-ab@<liivv-domain>'
  SK = 'pharmacy-sk@<liivv-domain>'; MB = 'pharmacy-mb@<liivv-domain>'; NB = 'pharmacy-nb@<liivv-domain>'
  NS = 'pharmacy-ns@<liivv-domain>'; PE = 'pharmacy-pe@<liivv-domain>'; NL = 'pharmacy-nl@<liivv-domain>'
}

foreach ($p in $boxes.Keys) {
  New-Mailbox -Shared -Name "Liivv Pharmacy $p" -DisplayName "Liivv Pharmacy" -PrimarySmtpAddress $boxes[$p]
}
```

**Display name:** every mailbox shows "Liivv Pharmacy" to customers. If the owner wants "Liivv Pharmacy (Ontario)" and so on, change `-DisplayName`.

**No licence is needed.** Shared mailboxes are free up to 50 GB.

### 1.3 Settings on every pharmacy mailbox

```powershell
foreach ($p in $boxes.Keys) {
  $m = $boxes[$p]
  # Tag for the app's permission scope (section 4). Use a CustomAttribute nothing else uses.
  Set-Mailbox -Identity $m -CustomAttribute1 'liivv-pharmacy'
  # Copies of mail a pharmacist sends AS this mailbox from Outlook land in THIS mailbox's
  # Sent Items, so the app can add them to the customer's record.
  Set-Mailbox -Identity $m -MessageCopyForSentAsEnabled $true -MessageCopyForSendOnBehalfEnabled $true
}
```

**Plus addressing must not be disabled.** Check with:

```powershell
Get-OrganizationConfig | Format-List DisablePlusAddressInRecipients   # must be False
```

Tell the owner the result. The app uses plus addressing only after it has been confirmed.

**No Inbox rules, no moving mail out of the Inbox.** The website reads only each pharmacy mailbox's **Inbox** and **Sent Items**. A customer's reply that is moved to another folder (by hand, or by an Outlook or server-side rule) before the next sync, or that lands in **Junk Email**, never reaches the customer's record. So, on the nine mailboxes:
- create no Inbox rules that move, delete or forward mail;
- tell pharmacists to leave customer replies in the Inbox (flag or categorise them instead of filing them in folders);
- check **Junk Email** daily, and move a customer's reply that landed there back to the Inbox ("Not junk"); the next sync then picks it up.

```powershell
foreach ($m in $boxes.Values) { Get-InboxRule -Mailbox $m }   # must list nothing
```

**Choosing the CustomAttribute:**
- If `CustomAttribute1` is already used in your tenant, pick a free one, and change the filter in section 4 to match.
- Only Exchange admins should be able to set it. Anyone who can set it can bring a mailbox into the app's scope.

### 1.4 Pharmacist access and sign-in

Give each pharmacist access **only to their own province's mailbox**:

```powershell
Add-MailboxPermission  -Identity $boxes.ON -User <pharmacist UPN> -AccessRights FullAccess -InheritanceType All -AutoMapping $true
Add-RecipientPermission -Identity $boxes.ON -Trustee <pharmacist UPN> -AccessRights SendAs -Confirm:$false
```

**Block sign-in on each shared mailbox's own account.** Entra admin center → Users → the mailbox user → Block sign-in.

**Require MFA for pharmacists,** through Conditional Access or security defaults.

**Mailbox auditing** is on by default in Exchange Online. Leave it on.

### 1.5 Get each mailbox's object ID (the app needs it)

```powershell
foreach ($p in $boxes.Keys) {
  Get-Mailbox -Identity $boxes[$p] | Select-Object @{n='Province';e={$p}}, PrimarySmtpAddress, ExternalDirectoryObjectId
}
```

`ExternalDirectoryObjectId` is the mailbox's Entra object ID. Send the owner the table (section 6). It isn't secret.

---

## 2. Register the app in Entra

1. Entra admin center → **App registrations** → **New registration**.
   - **Name:** `Liivv Pharmacy Mail`.
   - **Supported account types:** this organizational directory only (single tenant).
   - **Redirect URI:** none.
2. On the Overview page, note:
   - **Application (client) ID**;
   - **Directory (tenant) ID**.
3. Open **API permissions**:
   - Remove the default delegated `User.Read`. The app never signs anyone in.
   - **Add nothing.**
   - "Grant admin consent" is therefore not needed for this app; there is nothing to consent to.

### Why no Mail permission in Entra

The app gets its mail rights from Exchange **RBAC for Applications** (section 4), limited to the nine mailboxes. Microsoft adds an Entra permission and an RBAC grant together.

So if `Mail.Send` or `Mail.ReadWrite` were also granted under API permissions, the app could reach **every mailbox in the tenant**. Microsoft says this union "results in no effective resource scoping".

If you see any `Mail.*` application permission on this app, remove it and revoke its consent.

---

## 3. Give the app a credential

Use **Option A** if the owner confirms Vercel OIDC is on. Otherwise use **Option B**. **Option C** is for a developer's own machine only.

### Option A (preferred): trust Vercel's production deployments, with no stored secret

Entra admin center → App registrations → **Liivv Pharmacy Mail** → **Certificates & secrets** → **Federated credentials** → **Add credential**:

| Field | Value |
|---|---|
| Federated credential scenario | **Other issuer** |
| Issuer | `https://oidc.vercel.com/<vercel-team-slug>` |
| Type | Explicit subject identifier |
| Value (subject) | `owner:<vercel-team-slug>:project:<vercel-project-name>:environment:production` |
| Name | `vercel-liivv-production` |
| Audience | `https://vercel.com/<vercel-team-slug>` (Vercel's **Default** audience; replace the value Entra pre-fills) |

**Notes:**
- **Production only.** Don't add a credential for `preview` or `development`. Preview builds must never send real pharmacy mail.
- **The subject must match exactly.** No wildcards are allowed. A typo doesn't produce an error message; the sign-in just fails. Copy the team slug and project name from the owner exactly.
- **The audience must match exactly too.** The website asks Vercel for its token without a custom audience, so the token's audience is Vercel's default, `https://vercel.com/<vercel-team-slug>` (Vercel: "Connect to Microsoft Azure", read 2026-10-14). Entra pre-fills `api://AzureADTokenExchange`, which Vercel calls "Recommended" but which only works when the code passes that audience; if the web team later switches to it, they will tell you to change this field at the same time.

### Option B: a certificate

1. On a trusted admin machine, create a key pair valid for 12 months or less:

   ```bash
   openssl req -x509 -newkey rsa:2048 -sha256 -days 365 -nodes \
     -keyout liivv-pharmacy-mail.key -out liivv-pharmacy-mail.crt \
     -subj "/CN=Liivv Pharmacy Mail"
   openssl x509 -in liivv-pharmacy-mail.crt -noout -fingerprint -sha256
   ```

2. Upload **only** `liivv-pharmacy-mail.crt`: Certificates & secrets → Certificates → Upload certificate.
3. Note:
   - the SHA-256 fingerprint, with the colons removed. It isn't secret.
   - the expiry date.
4. **The private key (`.key`) is the secret.** Put it into Vercel yourself, or sit with the owner while they do (section 7), as one line of base64:
   - PowerShell: `[Convert]::ToBase64String([IO.File]::ReadAllBytes("liivv-pharmacy-mail.key"))`
   - Linux: `base64 -w0 liivv-pharmacy-mail.key`
5. **Then delete the `.key` file** from the machine.
6. **Set a calendar reminder 30 days before the certificate expires.** Renewal means:
   - upload the new certificate;
   - update the two Vercel values;
   - remove the old certificate.

### Option C: client secret (local development only, never production)

Create a **separate** app registration, **Liivv Pharmacy Mail (dev)**:
- scope it in section 4 to **one test shared mailbox** only, never a real pharmacy mailbox;
- give it a client secret that expires in **3 months**.

The developer keeps it in their own `.env.local`, which is never committed and never sent in chat. The website refuses a client secret in production.

---

## 4. Limit the app to the nine pharmacy mailboxes (RBAC for Applications)

**Important:** take the IDs from **Entra → Enterprise applications → Liivv Pharmacy Mail**, not from App registrations. Microsoft: "Don't use the IDs from the App Registrations page, as it shows different values."

```powershell
Connect-ExchangeOnline -UserPrincipalName <your admin UPN>

# 1. The scope: the nine mailboxes tagged in section 1.3.
New-ManagementScope -Name 'Liivv pharmacy mailboxes' `
  -RecipientRestrictionFilter "CustomAttribute1 -eq 'liivv-pharmacy'"

# 2. Point Exchange at the app's service principal (Enterprise applications values).
New-ServicePrincipal -AppId '<Application ID>' -ObjectId '<Enterprise application Object ID>' `
  -DisplayName 'Liivv Pharmacy Mail'

# 3. Read, write and send, on those mailboxes only.
#    "Application Mail Full Access" = Mail.ReadWrite + Mail.Send.
New-ManagementRoleAssignment -App 'Liivv Pharmacy Mail' -Role 'Application Mail Full Access' `
  -CustomResourceScope 'Liivv pharmacy mailboxes'
```

**If your policy prefers separate roles,** assign both `Application Mail.ReadWrite` and `Application Mail.Send`, with the same scope.

**Check the scope.** This doesn't wait for the cache:

```powershell
# Each pharmacy mailbox: every role should show InScope = True
Test-ServicePrincipalAuthorization -Identity 'Liivv Pharmacy Mail' -Resource 'pharmacy-on@<liivv-domain>'
# Any staff mailbox: InScope = False
Test-ServicePrincipalAuthorization -Identity 'Liivv Pharmacy Mail' -Resource '<a staff member UPN>'
```

**Wait up to 2 hours** after step 3 before the first live test. Microsoft caches these grants for 30 minutes to 2 hours. A 403 error before then is expected.

**Rules:**
- **Don't create an Application Access Policy** (`New-ApplicationAccessPolicy`). It is the old method, and Microsoft says not to create new ones.
- **If you scope by group instead of the attribute,** use a group with **direct** members. Microsoft treats nested members as out of scope.
- **Don't use an exclusive management scope.** It doesn't limit app access.
- **Adding a province later:** create the mailbox, run section 1.3 on it, check it with `Test-ServicePrincipalAuthorization`, and give the owner its address and object ID.
- **Removing a mailbox from the scope:** clear its CustomAttribute1, then tell the owner.

---

## 5. Retention, encryption and data location

### 5.1 Retention

**Owner decision D7.** The website keeps the customer record, and Outlook copies are only temporary.

Create a Microsoft Purview retention policy:
- Microsoft Purview → Data lifecycle management → Retention policies;
- type: **delete only**;
- location: **Exchange mailboxes**, limited to the nine pharmacy mailboxes;
- window: **delete items older than N days**, with N from the owner (for example 60).

**Before you turn it on,** the owner confirms the website's Mail status panel shows no sync errors.

**Litigation holds** override deletion as usual.

### 5.2 Purview Message Encryption (owner decision D15)

Tell the owner whether it can be turned on for these mailboxes. It is only needed if the owner later allows pharmacists' messages in the email body itself. If it is turned on, we must first test that the app can read an encrypted customer reply.

### 5.3 Data location

Send the owner the tenant's data location (section 0).

---

## 6. What to send the owner (none of this is secret)

| Item | Where you find it |
|---|---|
| Directory (tenant) ID | App registration → Overview |
| Application (client) ID | App registration → Overview |
| Credential type | A (OIDC), or B (certificate) with its expiry date and SHA-256 fingerprint |
| Nine rows: province, mailbox address, `ExternalDirectoryObjectId` | Section 1.5 |
| Plus addressing on? (`DisablePlusAddressInRecipients = False`) | Section 1.3 |
| `MessageCopyForSentAsEnabled` and `MessageCopyForSendOnBehalfEnabled` set on all nine | Section 1.3 |
| `Test-ServicePrincipalAuthorization` results | Section 4 |
| Date and time the role assignment was made | For the 2-hour wait |
| Data location; retention window; Purview answer | Section 5 |

---

## 7. Vercel environment variables

The owner sets these, or IT if given access. In the Vercel project: Settings → Environment Variables.
- Scope: **Production only**. Don't tick Preview or Development.
- Mark the secret ones as **Sensitive**.

| Name | Value | Secret? |
|---|---|---|
| `LIIVV_GRAPH_TENANT_ID` | Directory (tenant) ID | no |
| `LIIVV_GRAPH_CLIENT_ID` | Application (client) ID | no |
| `LIIVV_GRAPH_AUTH` | `oidc` (Option A) or `certificate` (Option B) | no |
| `LIIVV_GRAPH_CERT_PRIVATE_KEY_B64` | Option B only: the base64 private key | **yes: Sensitive** |
| `LIIVV_GRAPH_CERT_THUMBPRINT_SHA256` | Option B only: the SHA-256 fingerprint, without colons | no |
| `LIIVV_PHARMACY_MAILBOX_ON` … `_NL` (9) | Each mailbox address | no |
| `LIIVV_PHARMACY_MAILBOX_ON_ID` … `_NL_ID` (9) | Each `ExternalDirectoryObjectId` | no |
| `LIIVV_PHARMACY_EMAIL_PROVINCES` | The provinces to switch on, for example `ON,BC,SK,MB,NB,NS,PE,NL` (Alberta waits for its PIA) | no |
| `LIIVV_PHARMACY_EMAIL_PLUS_REPLY_TO` | `true` only after plus addressing is confirmed on | no |
| `LIIVV_PHARMACY_EMAIL_WEBHOOKS` | Leave unset until the team says so | no |
| `CRON_SECRET` | A long random value, for example from `openssl rand -hex 32` | **yes: Sensitive** |
| `LIIVV_PHARMACY_EMAIL_CONSENT_APPROVED` | `true` only when the owner and the pharmacy privacy officer have approved the consent wording and the email policy page (D8) | no |
| `LIIVV_PHARMACY_EMAIL_ENABLED` | Set to `true` **last**, after the test checklist passes | no |

**Without `LIIVV_PHARMACY_EMAIL_CONSENT_APPROVED=true`, no customer is emailed at all,** by the website or from Outlook: customers are offered no email choice, and pharmacists phone them. The owner sets it.

**Without `LIIVV_PHARMACY_EMAIL_ENABLED=true`, the website sends nothing.** Pharmacists keep the "Email customer (Outlook)" button, but only for a province whose `LIIVV_PHARMACY_MAILBOX_<province>` address is set: the button shows that exact address, and the pharmacist must send **as that mailbox**, never from their own. Set the nine mailbox addresses as soon as the mailboxes exist, even before the rest.

**Redeploy production** after changing variables.

**The timed sync.** `core/vercel.json` runs `/api/cron/pharmacy-mail-sync` once a day (`0 9 * * *`, UTC), which every Vercel plan allows. On the Pro plan the owner can change it to every 5 minutes (`*/5 * * * *`); until then replies also arrive whenever a pharmacist opens the Pharmacy admin, or presses **Sync now**. Vercel sends `CRON_SECRET` with each run; without it the sync route answers 503.

---

## 8. Test checklist (IT and the owner together, at least 2 hours after section 4)

Use a test customer account with the owner's own personal email address. Don't use a real patient.

| # | Test | Expected |
|---|---|---|
| 1 | `Test-ServicePrincipalAuthorization` for each of the 9 mailboxes and one staff mailbox | True for the 9, False for the staff mailbox. |
| 2 | Entra → the app → API permissions | No `Mail.*` permissions listed. |
| 3 | Website admin → Mail status → **Test connection** | OK for every switched-on province. A 403 means the scope or the 2-hour wait. A 404 means a wrong mailbox ID or address. A token error means the credential (Option A: check the subject exactly). |
| 4 | Test customer → Pharmacy page → **Send me a code** | The email arrives from **Liivv Pharmacy** at the province address, not in spam. The code works. |
| 5 | Admin → the test customer's CPAP record → send a message | The customer gets the **notice** email: fixed subject with `ref. LV-…`, no health words, a sign-in link. The message is on their Pharmacy page. |
| 6 | Reply to that email from the test address | It appears in the admin thread within one sync (about 5 minutes on the Pro plan, or press **Sync now**), and on the Pharmacy page. |
| 7 | A pharmacist opens the email in the shared mailbox in Outlook and **replies as the shared mailbox** | The copy is in the **shared mailbox's** Sent Items. It appears in the thread labelled "Sent from Outlook". |
| 8 | Reply to the email from a **different** address | It goes to **Email to match**, not into the thread. |
| 8a | From the shared mailbox in Outlook, **forward** the customer's reply to another address (for example your own) | It appears in the thread as **staff only** ("Not shown to the customer") and in **Sent from Outlook: check**. It is **not** on the test customer's Pharmacy page. |
| 8b | Check the Authentication-Results header Graph returns for the test reply (Mail status → Sync now, then the reply attaches) | The reply attaches. If it goes to **Email to match** as "failed the spoofing check, or it couldn't be confirmed", tell the team: the topmost header is not Exchange's own or shows no pass. |
| 9 | Send a message to a test account whose email doesn't exist | The non-delivery report arrives in the shared mailbox's Inbox. The message shows **Bounced**. |
| 10 | Plus addressing (if switched on): send to `pharmacy-on+test@<domain>` | It arrives in the ON mailbox. |
| 11 | Any Graph call against a mailbox outside the scope (the Test connection tool with a wrong ID) | 403: the scope works. |
| 12 | A preview deployment of the website | Mail status says "not production". Nothing is sent. |
| 13 | Retention policy (once turned on) | Applies to the 9 mailboxes only. |
| 14 | Webhooks (only if the team asks): set `LIIVV_PHARMACY_EMAIL_WEBHOOKS=true`, redeploy, press **Reconnect** | Mail status shows subscriptions with an expiry about 6 days ahead. A reply appears within about a minute. If subscription creation is refused, report the error code; the website falls back to the timed sync. |

---

## 9. Ongoing care

**A new pharmacist:** `Add-MailboxPermission` and `Add-RecipientPermission` on their own province's mailbox only. Tell them to **always send as the pharmacy mailbox**, never their own, so replies are recorded.

**A pharmacist leaves:** remove both permissions.

**Inbox and Junk Email:** no Inbox rules on the nine mailboxes, customer replies stay in the Inbox, and Junk Email is checked daily (section 1.3). The website reads only the Inbox and Sent Items.

**Certificate (Option B):** renew before expiry (section 3).

**Mailbox changes:**
- Changing a mailbox's address or object ID, or adding one, means telling the owner first. The website resets that province's sync.
- **Never** change the CustomAttribute on a pharmacy mailbox without telling the owner.

**Emergency stop, any of these:**
- Owner: set `LIIVV_PHARMACY_EMAIL_ENABLED` to `false` and redeploy. The website stops sending and reading at once.
- IT: `Remove-ManagementRoleAssignment` on the app's role assignment. Allow up to 2 hours to take effect.
- IT: delete the federated credential or the certificate. Effective for new tokens within the hour.

**A suspected compromise:** do all three, then review the mailbox audit log and Entra sign-in logs for the service principal.
