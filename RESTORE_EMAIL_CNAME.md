# Restore Accidentally Deleted Email CNAME Records

## ✅ Don't Panic - This is Fixable!

Email CNAME records can be restored. Here's how to identify what's missing and fix it.

## Step 1: Identify Your Email Provider

Your email CNAME records depend on which email service you use:

### Common Email Providers:
- **Google Workspace** (Gmail for business)
- **Microsoft 365** (Outlook)
- **GoDaddy Email**
- **Zoho Mail**
- **Other**

## Step 2: Check Current DNS Records

1. Go to GoDaddy → DNS settings for `tobygollan.com`
2. Look at what CNAME records are currently there
3. Check if you see any of these common email CNAME patterns:
   - Records starting with `_` (like `_dmarc`, `_spf`)
   - Records with `domainkey` in the name
   - Records with your email provider's name

## Step 3: Common Email CNAME Records by Provider

### If Using Google Workspace (Gmail):

You'll need records like:
```
google._domainkey → v=DKIM1; k=rsa; p=[long-string]
selector1._domainkey → v=DKIM1; k=rsa; p=[long-string]
selector2._domainkey → v=DKIM1; k=rsa; p=[long-string]
```

**To get these:**
1. Log into Google Admin Console: https://admin.google.com
2. Go to Apps → Google Workspace → Gmail
3. Click "Authenticate email"
4. It will show you the exact CNAME records to add

### If Using Microsoft 365:

You'll need records like:
```
selector1._domainkey → [your-microsoft-value]
selector2._domainkey → [your-microsoft-value]
```

**To get these:**
1. Log into Microsoft 365 admin center
2. Go to Settings → Domains → tobygollan.com
3. Click "DNS settings" or "Manage DNS"
4. It will show you all required records

### If Using GoDaddy Email:

Usually doesn't require special CNAME records, but check:
1. GoDaddy email setup wizard
2. Or GoDaddy support can help restore them

## Step 4: Check Email Status

To see if email is actually broken:

1. **Send a test email TO your domain** (e.g., test@tobygollan.com)
   - Does it arrive? → Email delivery is working
   - Doesn't arrive? → Check MX records first

2. **Send a test email FROM your domain**
   - Does it get marked as spam? → Missing authentication records
   - Does it arrive normally? → Everything is fine

3. **Check email authentication:**
   - Visit: https://mxtoolbox.com/SuperTool.aspx
   - Enter `tobygollan.com`
   - Click "MX Lookup" to see if MX records are working
   - Check if it shows missing DKIM/SPF/DMARC warnings

## Step 5: Quick Fix - Check Email Provider Dashboard

The easiest way to restore records:

1. **Log into your email provider's admin panel:**
   - Google Workspace: https://admin.google.com
   - Microsoft 365: https://admin.microsoft.com
   - GoDaddy: Your GoDaddy account

2. **Find "Domain settings" or "DNS settings"**
3. **It will show you exactly which CNAME records need to be added**
4. **Copy those records back into GoDaddy DNS**

## Step 6: Common Records to Check

Look for these in your email provider's settings:

### Always Needed:
- **MX Records** (these are different from CNAME - keep these!)
  - Example: `@` → `mail.google.com` (priority 10)

### Often Needed (CNAME):
- `_dmarc` → `v=DMARC1; p=none;` (or similar)
- `google._domainkey` → (for Google)
- `selector1._domainkey` → (for Microsoft/Google)
- `selector2._domainkey` → (for Microsoft/Google)

### Sometimes Needed (TXT):
- SPF records (usually TXT, not CNAME)
- DKIM records (can be TXT or CNAME)

## Step 7: Verify After Restoring

After adding the records back:

1. Wait 10-60 minutes for DNS to propagate
2. Use https://mxtoolbox.com to verify:
   - Enter `tobygollan.com`
   - Check "SPF Record", "DKIM Record", "DMARC Record"
   - All should show green/pass if configured correctly
3. Send a test email to/from your domain

## What If You Don't Know Your Email Provider?

1. **Check your email address:**
   - What domain does it use? (e.g., @tobygollan.com)
   - Where do you log in? (gmail.com interface = Google, outlook.com = Microsoft)

2. **Check your GoDaddy account:**
   - GoDaddy → Products → Email
   - See if you have email services there

3. **Check MX records:**
   - In GoDaddy DNS, look for MX records
   - `mail.google.com` = Google Workspace
   - `mail.protection.outlook.com` = Microsoft 365
   - `smtp.secureserver.net` = GoDaddy email

## Emergency: Email Not Working?

If email is currently broken:

1. **MX records are MOST important** - make sure these are intact:
   ```
   @ → mail.[your-provider].com (priority 10)
   ```

2. **CNAME records for authentication can wait** - they help with spam filtering but aren't critical for basic email delivery

3. **Priority order:**
   - ✅ Fix MX records first (if missing)
   - ✅ Then restore authentication CNAME records
   - ✅ Then verify with mxtoolbox.com

## Still Need Help?

1. **Contact your email provider support** - they can give you exact records
2. **Contact GoDaddy support** - they can help restore DNS records if you have backups
3. **Use DNS checker** - https://dnschecker.org to see what's currently live

Remember: As long as MX records are intact, email delivery should work. The CNAME records are mostly for authentication/anti-spam features.

