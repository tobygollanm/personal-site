# Domain Connection Guide

## Your GitHub Pages URL
- **Current URL**: `https://tobygollanm.github.io/personal-site/`
- **Custom Domain**: [Enter your domain here, e.g., `tobygollanmyers.com`]

## Step 1: Configure DNS in GoDaddy

Go to your GoDaddy account and manage DNS for your domain.

### Add 4 A Records:
1. **Type**: A  
   **Name**: `@`  
   **Value**: `185.199.108.153`  
   **TTL**: 600 (or default)

2. **Type**: A  
   **Name**: `@`  
   **Value**: `185.199.109.153`  
   **TTL**: 600 (or default)

3. **Type**: A  
   **Name**: `@`  
   **Value**: `185.199.110.153`  
   **TTL**: 600 (or default)

4. **Type**: A  
   **Name**: `@`  
   **Value**: `185.199.111.153`  
   **TTL**: 600 (or default)

### Add 1 CNAME Record:
- **Type**: CNAME  
  **Name**: `www`  
  **Value**: `tobygollanm.github.io`  
  **TTL**: 600 (or default)

**Note**: Remove any existing A records for `@` and any existing CNAME records for `www` before adding these new ones.

## Step 2: Add Custom Domain in GitHub

1. Go to: https://github.com/tobygollanm/personal-site/settings/pages
2. Scroll down to "Custom domain"
3. Enter your domain (e.g., `yourdomain.com` - without `www` or `https://`)
4. Click **Save**
5. Check the box for **"Enforce HTTPS"** (this will be available after DNS propagates)

## Step 3: Wait for DNS Propagation

- DNS changes can take **10-60 minutes** to propagate
- You can check propagation status at: https://dnschecker.org
- Enter your domain and check if the A records point to the GitHub IPs

## Step 4: Verify Everything Works

Once DNS has propagated:
- Visit `https://yourdomain.com` - should load your site
- Visit `https://www.yourdomain.com` - should also load your site
- HTTPS should work automatically (may take a few more minutes after DNS)

## Troubleshooting

- **DNS not working?** Wait longer (can take up to 48 hours in rare cases)
- **HTTPS not working?** Make sure "Enforce HTTPS" is checked in GitHub Pages settings
- **Site not loading?** Check that GitHub Actions deployment completed successfully

