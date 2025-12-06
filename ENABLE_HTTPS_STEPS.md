# How to Enable HTTPS on GitHub Pages (Step-by-Step)

## Why HTTPS Isn't Available Yet

GitHub shows "HTTPS is not enabled because your page is not configured to provide HTTPS" because:

1. **DNS hasn't fully propagated** - GitHub needs to verify your domain via DNS
2. **Certificate pending** - GitHub can't issue an SSL certificate until DNS is verified
3. **This is normal** - Takes 30-60 minutes (sometimes longer)

## Step-by-Step Process

### Step 1: Verify DNS Records in GoDaddy

1. Log into **GoDaddy** → My Products → Your Domain → **DNS Management**

2. Make sure you have **EXACTLY** these records:

   **A Records (4 total, all for '@'):**
   - `@` → `185.199.108.153`
   - `@` → `185.199.109.153`
   - `@` → `185.199.110.153`
   - `@` → `185.199.111.153`

   **CNAME Record (1 total):**
   - `www` → `tobygollanm.github.io`

3. **Delete any conflicting records:**
   - Remove any other A records for `@`
   - Remove any other CNAME records for `www`
   - Remove any "parking" or forwarding records

### Step 2: Verify Domain in GitHub

1. Go to: **https://github.com/tobygollanm/personal-site/settings/pages**

2. Under **"Custom domain"**:
   - Your domain should be listed (e.g., `yourdomain.com`)
   - **DO NOT include `www` or `https://`**
   - If it's not there, enter it and click **Save**

3. Check the status:
   - ⚠️ **Yellow warning** = DNS propagating (wait longer)
   - ❌ **Red error** = DNS misconfigured (check records)
   - ✅ **Green checkmark** = Ready for HTTPS!

### Step 3: Wait for DNS Propagation

**Timeline:**
- **Minimum:** 30 minutes
- **Typical:** 30-60 minutes
- **Maximum:** Up to 48 hours (rare)

**Check if DNS is ready:**
1. Visit: https://dnschecker.org
2. Enter your domain
3. Select record type: **A**
4. Check if servers worldwide see the GitHub IPs (185.199.108.x, etc.)

### Step 4: Enable HTTPS

Once DNS has propagated:

1. Go back to: **https://github.com/tobygollanm/personal-site/settings/pages**

2. You should see:
   - ✅ Green checkmark next to your domain
   - ✅ **"Enforce HTTPS"** checkbox is now available (not grayed out)

3. **Check the box** for "Enforce HTTPS"

4. Wait **10-30 minutes** for GitHub to issue the SSL certificate

5. Visit `https://yourdomain.com` - it should work! 🎉

## Troubleshooting

### "Enforce HTTPS" checkbox is grayed out?

This means DNS hasn't propagated yet. Solutions:
- Wait longer (can take up to 60 minutes)
- Verify DNS records are correct in GoDaddy
- Check DNS propagation at https://dnschecker.org
- Try removing and re-adding the domain in GitHub Pages settings

### Still seeing GoDaddy filler page?

- DNS records aren't correct
- Domain parking is still enabled in GoDaddy
- DNS hasn't propagated to your location yet
- Try accessing via `http://yourdomain.com` (not https)

### HTTP works but HTTPS doesn't?

- Wait for the SSL certificate to be issued (10-30 min after DNS propagates)
- Make sure "Enforce HTTPS" is checked in GitHub Pages settings
- Clear browser cache and try again

## Quick Status Check

**Current status:**
- ❌ HTTPS not available yet = DNS propagating (normal, wait)
- ⚠️ Yellow warning in GitHub = DNS propagating (normal, wait)
- ✅ Green checkmark = DNS ready, HTTPS can be enabled!
- ✅ "Enforce HTTPS" available = Ready to enable!
- ✅ HTTPS working = All done! 🎉

## Timeline Summary

1. **Set DNS records** → Wait 30-60 min for propagation
2. **GitHub detects DNS** → Green checkmark appears
3. **Enable HTTPS** → Check the box in GitHub Pages settings
4. **Certificate issued** → Wait 10-30 min
5. **HTTPS works!** → Visit https://yourdomain.com

**Total time: 1-2 hours** (from setting up DNS to HTTPS working)

