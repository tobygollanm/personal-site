# Fix DNS Configuration for GitHub Pages

## The Problem
GitHub says: "Domain does not resolve to the GitHub Pages server"
This means your DNS records in GoDaddy aren't pointing to GitHub's servers.

## Solution: Configure DNS in GoDaddy

### Step 1: Log into GoDaddy
1. Go to https://www.godaddy.com and log in
2. Go to "My Products" → Find "tobygollan.com" → Click "DNS"

### Step 2: Remove Old/Conflicting Records
- Delete ANY existing A records for `@` (apex domain)
- Delete ANY existing CNAME records for `@` 
- Delete ANY existing A records for `www`
- Keep any other records (email, etc.)

### Step 3: Add These Records for tobygollan.com

**For the APEX domain (tobygollan.com) - Add 4 A Records:**

1. Click "Add" → Choose "A"
   - **Name**: `@`
   - **Value**: `185.199.108.153`
   - **TTL**: 600 (or 1 hour)

2. Click "Add" → Choose "A"
   - **Name**: `@`
   - **Value**: `185.199.109.153`
   - **TTL**: 600

3. Click "Add" → Choose "A"
   - **Name**: `@`
   - **Value**: `185.199.110.153`
   - **TTL**: 600

4. Click "Add" → Choose "A"
   - **Name**: `@`
   - **Value**: `185.199.111.153`
   - **TTL**: 600

**For www.tobygollan.com - Add 1 CNAME Record:**

5. Click "Add" → Choose "CNAME"
   - **Name**: `www`
   - **Value**: `tobygollanm.github.io`
   - **TTL**: 600

### Step 4: Configure Domain in GitHub

1. Go to: https://github.com/tobygollanm/personal-site/settings/pages
2. Scroll to "Custom domain"
3. Enter: `tobygollan.com` (without www or https://)
4. Click "Save"
5. Wait 1-2 minutes, then check the box for "Enforce HTTPS" (if it appears)

### Step 5: Wait for DNS Propagation

- DNS changes take **10-60 minutes** to propagate
- You can check if it's working at: https://dnschecker.org
- Enter `tobygollan.com` and check that A records show the GitHub IPs (185.199.108-111.153)

### Step 6: Verify

Once DNS propagates (check at dnschecker.org):
- Visit `http://tobygollan.com` - should show your site
- Visit `http://www.tobygollan.com` - should show your site
- After a few more minutes, HTTPS will auto-enable

## Important Notes

⚠️ **DO NOT** create a CNAME record for `@` - this won't work for apex domains
⚠️ **DO** create 4 separate A records for `@` pointing to different GitHub IPs
✅ The CNAME file in your repo is already correct (`tobygollan.com`)
✅ Once DNS is correct, GitHub will automatically detect it

## Quick Check Commands

After making DNS changes, you can check from terminal:

```bash
# Check A records for apex domain
dig tobygollan.com A +short

# Check CNAME for www
dig www.tobygollan.com CNAME +short

# Should show the GitHub IPs and github.io respectively
```

## Troubleshooting

**If it still doesn't work after 1 hour:**
1. Double-check all 4 A records are added correctly in GoDaddy
2. Verify the CNAME record for www points to `tobygollanm.github.io`
3. Wait up to 48 hours for full global propagation
4. Clear your browser cache and try incognito mode
5. Try accessing from a different network (mobile data vs WiFi)

