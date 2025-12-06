# Troubleshooting: GoDaddy Filler Site Still Showing

If you're still seeing the GoDaddy filler/placeholder page, follow these steps in order:

## Step 1: Verify DNS Records in GoDaddy

1. **Log into GoDaddy** → My Products → Your Domain → **DNS Management**

2. **Check A Records:**
   - You should have **EXACTLY 4 A records** with name `@`
   - Each should point to one of these IPs:
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`
   - **Delete any other A records** for `@` or the root domain

3. **Check CNAME Record:**
   - You should have **1 CNAME record** with name `www`
   - It should point to: `tobygollanm.github.io`
   - **Delete any other CNAME records** for `www`

4. **Delete Any Conflicts:**
   - Remove any A or CNAME records that conflict
   - GoDaddy sometimes has default records that interfere

## Step 2: Verify GitHub Pages Settings

1. Go to: **https://github.com/tobygollanm/personal-site/settings/pages**

2. Under **"Custom domain"**:
   - Your domain should be listed (e.g., `yourdomain.com`)
   - **DO NOT include `www` or `https://`**
   - Click **Save** if you haven't already

3. **Check for warnings:**
   - If there's a yellow warning, DNS hasn't propagated yet
   - If there's a red error, check the DNS records again
   - A green checkmark means it's working

## Step 3: Wait for DNS Propagation

- **Minimum wait time:** 10-15 minutes
- **Typical wait time:** 30-60 minutes
- **Maximum wait time:** Up to 48 hours (rare)

**Check propagation status:**
- Visit: https://dnschecker.org
- Enter your domain
- Select record type: **A**
- Check if servers worldwide see the GitHub IPs

## Step 4: Clear Cache & Test

1. **Try different methods:**
   - Use **incognito/private browsing mode**
   - Clear browser cache (Cmd+Shift+Delete on Mac)
   - Try a different browser
   - Try from your phone's mobile data (not WiFi)

2. **Try different URLs:**
   - First try: `http://yourdomain.com` (without https)
   - Then try: `https://yourdomain.com`
   - Also try: `http://www.yourdomain.com`

## Step 5: Common GoDaddy Issues

**GoDaddy sometimes:**
- Has a "parked domain" page that takes priority
- Requires you to "unpark" the domain first
- Has default DNS records that conflict

**To fix:**
1. In GoDaddy, look for domain settings → **"Unpark Domain"** or **"Remove Parking"**
2. Make sure your domain is set to **"Use DNS"** not **"Use GoDaddy Nameservers"** (unless you're managing DNS through GoDaddy)
3. Wait 30-60 minutes after unparking

## Step 6: Verify GitHub Deployment

1. Check that GitHub Actions deployment succeeded:
   - Go to: **https://github.com/tobygollanm/personal-site/actions**
   - The latest workflow should show a green checkmark

2. Your site should still work on:
   - `https://tobygollanm.github.io/personal-site/` (temporarily broken with root base path, but will work on custom domain)

## Quick Diagnostic Questions

Answer these to help diagnose:

1. **What domain are you using?** (e.g., tobygollanmyers.com)
2. **How long ago did you set up the DNS records?**
3. **What do you see when you go to GitHub Pages settings?** (green checkmark, warning, error?)
4. **What happens when you visit `http://yourdomain.com`** (not https)?
5. **Do you see the same filler page in incognito mode?**

## Still Not Working?

If after 24 hours it's still not working:
1. Double-check all DNS records match exactly
2. Verify the domain is saved in GitHub Pages settings
3. Check if GoDaddy has domain parking enabled
4. Try removing and re-adding the domain in GitHub Pages settings

