# Fixing GoDaddy Filler Page - DNS Setup Guide

The GoDaddy filler page appears because your domain isn't pointing to GitHub Pages yet. Follow these steps:

## Step 1: Configure DNS Records in GoDaddy

1. Log into your **GoDaddy account**
2. Go to **My Products** → Find your domain → Click **DNS** (or **Manage DNS**)
3. **Remove any existing A records** for `@` (root domain)
4. **Add these 4 A records** (one at a time):

   | Type | Name | Value | TTL |
   |------|------|-------|-----|
   | A | `@` | `185.199.108.153` | 600 |
   | A | `@` | `185.199.109.153` | 600 |
   | A | `@` | `185.199.110.153` | 600 |
   | A | `@` | `185.199.111.153` | 600 |

5. **Remove any existing CNAME** for `www`
6. **Add this CNAME record**:

   | Type | Name | Value | TTL |
   |------|------|-------|-----|
   | CNAME | `www` | `tobygollanm.github.io` | 600 |

7. **Save all changes**

## Step 2: Add Custom Domain in GitHub

1. Go to: **https://github.com/tobygollanm/personal-site/settings/pages**
2. Scroll to **"Custom domain"** section
3. Enter your domain (e.g., `yourdomain.com` - **without** `www` or `https://`)
4. Click **"Save"**
5. Wait a few minutes, then check the box for **"Enforce HTTPS"** (may take 10-60 min to appear)

## Step 3: Wait for DNS Propagation

- DNS changes can take **10-60 minutes** (sometimes up to 48 hours)
- You can check if it's working at: **https://dnschecker.org**
  - Enter your domain
  - Look for Type: A records
  - Check if they point to the GitHub IPs above

## Step 4: Verify Everything Works

Once DNS propagates:
- ✅ Visit `https://yourdomain.com` - should show your site (not GoDaddy filler)
- ✅ Visit `https://www.yourdomain.com` - should also work
- ✅ HTTPS should work automatically

## Troubleshooting

**Still seeing GoDaddy filler page?**
- DNS hasn't propagated yet (wait up to 60 min)
- Check DNS records in GoDaddy match exactly
- Verify domain is saved in GitHub Pages settings
- Clear your browser cache or try incognito mode

**HTTPS not working?**
- Wait for DNS to fully propagate
- Make sure "Enforce HTTPS" is checked in GitHub Pages settings
- May take additional time after DNS propagates

**Site shows but looks broken?**
- Make sure GitHub Actions deployment completed successfully
- Check browser console for 404 errors
- Verify all asset paths are correct (they should be now with base path fix)

