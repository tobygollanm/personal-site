# Quick Fix: GoDaddy Default Page Returned

If the GoDaddy filler/default page is back, follow these steps:

## Step 1: Check DNS Records in GoDaddy

1. **Log into GoDaddy** → My Products → Your Domain → **DNS Management**

2. **Verify you have these records:**

   **A Records (4 total, all for '@'):**
   - `@` → `185.199.108.153`
   - `@` → `185.199.109.153`
   - `@` → `185.199.110.153`
   - `@` → `185.199.111.153`

   **CNAME Record (1 total):**
   - `www` → `tobygollanm.github.io`

3. **If records are missing:**
   - Delete any existing A or CNAME records that conflict
   - Add the 4 A records above (one at a time)
   - Add the CNAME record above

## Step 2: Check Domain Parking Status

1. In GoDaddy, go to your domain settings
2. Look for "Domain Settings" or "Additional Settings"
3. Check if "Parking" or "Domain Forwarding" is enabled
4. **Disable parking** if it's turned on
5. Make sure domain status is "DNS" or "Active", not "Parked"

## Step 3: Verify GitHub Pages Settings

1. Go to: **https://github.com/tobygollanm/personal-site/settings/pages**
2. Under "Custom domain":
   - Your domain should still be listed
   - If not, re-add it (without `www` or `https://`)
   - Click Save

## Step 4: Wait for DNS Propagation

- DNS changes take **30-60 minutes** to propagate
- You may need to wait again even if you just re-added records
- Check propagation at: **https://dnschecker.org**

## Common Reasons This Happens

1. **GoDaddy auto-parked the domain** - Common if DNS wasn't set correctly
2. **DNS records were deleted** - May happen during account changes
3. **Nameserver issues** - Domain might be pointing to wrong nameservers
4. **DNS propagation reset** - Sometimes happens during GoDaddy maintenance

## Quick Test

Try visiting: `http://yourdomain.com` (HTTP, not HTTPS)

- ✅ **See your site?** → DNS is working, just wait
- ❌ **See GoDaddy page?** → DNS records are wrong or missing
- ⚠️ **Can't connect?** → DNS hasn't propagated yet

## If It Keeps Happening

If the GoDaddy page keeps returning:
1. Make sure you're using GoDaddy's default nameservers (not custom ones)
2. Contact GoDaddy support - they may have auto-parking enabled on your account
3. Check if your domain expired or needs renewal

