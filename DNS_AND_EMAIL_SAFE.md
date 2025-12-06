# DNS Configuration: Safe for Email

## ✅ Your Email Will NOT Be Affected

Email uses **MX records**, which are completely separate from A and CNAME records used for websites.

## What You Need to Change

### ✅ DELETE (for website):
- Old A records for `@` that don't point to GitHub
- Old CNAME records for `@` (if any)

### ✅ ADD (for website):
- 4 new A records for `@` pointing to GitHub IPs
- 1 CNAME record for `www` pointing to `tobygollanm.github.io`

### ✅ KEEP (for email):
- **ALL MX records** (for email delivery)
- **ALL email-related CNAME records** like:
  - `google._domainkey` (Google email verification)
  - `_dmarc` (DMARC policy)
  - `_spf` (SPF records)
  - `selector1._domainkey` (DKIM keys)
  - Any other records starting with `_`
  - Any other subdomain CNAMEs (like `mail`, `email`, etc.)

## How Email Works vs Websites

**Email (MX Records):**
- Uses MX records to tell mail servers where to deliver email
- Example MX record: `@` → `mail.google.com` (priority 10)
- These are completely separate from A/CNAME records

**Website (A/CNAME Records):**
- Uses A records to point `tobygollan.com` to GitHub's servers
- Uses CNAME records to point `www.tobygollan.com` to GitHub
- These don't interfere with email

## Example DNS Setup (Safe for Email)

### A Records:
- `@` → `185.199.108.153` (GitHub - for website)
- `@` → `185.199.109.153` (GitHub - for website)
- `@` → `185.199.110.153` (GitHub - for website)
- `@` → `185.199.111.153` (GitHub - for website)

### CNAME Records:
- `www` → `tobygollanm.github.io` (GitHub - for website)
- `google._domainkey` → `[your-google-value]` (KEEP - for email)
- `_dmarc` → `[your-dmarc-value]` (KEEP - for email)
- Any other email-related CNAMEs (KEEP - for email)

### MX Records:
- `@` → `mail.google.com` (KEEP - for email)
- Or whatever your email provider uses (KEEP all of them)

## Quick Check: What's Safe to Delete?

**DELETE only if:**
- It's an A record for `@` that's NOT a GitHub IP (185.199.108-111.153)
- It's a CNAME for `@` 

**NEVER DELETE:**
- Any MX records
- Any records starting with `_` (underscore)
- Any CNAME records for subdomains other than `www`
- Any TXT records (may be used for email verification)

## Before Making Changes

1. **Take a screenshot** of your current DNS settings in GoDaddy
2. **Make a list** of all MX records and email-related CNAME records
3. Only delete/change the A records for `@` that are for the website
4. Keep everything else exactly as it is

Your email will continue working normally! 🎉

