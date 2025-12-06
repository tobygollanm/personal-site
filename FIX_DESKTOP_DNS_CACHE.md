# Fix: Desktop Shows GoDaddy Page While Mobile Works

If your site loads correctly on mobile but shows the GoDaddy homepage on desktop, this is a **DNS caching issue**.

## Why This Happens

- **Desktop browser** has cached old DNS records
- **Desktop OS** has cached DNS responses
- **Desktop network/router** has cached DNS
- **Desktop ISP** may have DNS cache
- **Different DNS servers** between mobile and desktop

## Quick Fixes (Try in Order)

### 1. Clear Browser Cache

**Chrome/Edge:**
- Press `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows) for hard refresh
- Or go to Settings → Privacy → Clear browsing data → Cached images and files

**Firefox:**
- Press `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows) for hard refresh
- Or go to Settings → Privacy → Clear Data → Cached Web Content

**Safari:**
- Press `Cmd+Option+R` for hard refresh
- Or go to Safari → Preferences → Advanced → Show Develop menu → Empty Caches

### 2. Try Incognito/Private Mode

- Open a new incognito/private window
- Visit your site - if it works, it's definitely a cache issue

### 3. Flush DNS Cache on Your Computer

**Mac:**
```bash
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

**Windows:**
```bash
ipconfig /flushdns
```

**Linux:**
```bash
sudo systemd-resolve --flush-caches
# or
sudo service nscd restart
```

### 4. Try a Different Browser

- If Chrome shows GoDaddy, try Firefox or Safari
- If one browser works, it confirms browser cache issue

### 5. Check DNS Settings

**Mac:**
- System Preferences → Network → Advanced → DNS
- Try adding Google DNS: `8.8.8.8` and `8.8.4.4`

**Windows:**
- Settings → Network & Internet → Change adapter options
- Right-click your connection → Properties → IPv4 → Use custom DNS
- Set: `8.8.8.8` and `8.8.4.4`

### 6. Restart Your Router

- Unplug router for 30 seconds
- Plug back in and wait 2 minutes
- This clears router-level DNS cache

### 7. Wait It Out

- DNS caches can take **several hours** to expire
- Desktop ISP DNS caches can take **24-48 hours**
- Mobile working confirms DNS is correct - desktop just needs to catch up

## Verify DNS is Correct

1. Go to: https://dnschecker.org
2. Enter your domain
3. Select record type: **A**
4. Check if servers worldwide see GitHub IPs (185.199.108.x, etc.)
5. If they do → DNS is correct, just desktop caching issue

## Test Your Site

Try these URLs on desktop:
- `http://yourdomain.com` (HTTP)
- `https://yourdomain.com` (HTTPS)
- `http://www.yourdomain.com` (WWW)
- `https://www.yourdomain.com` (WWW HTTPS)

If mobile works but desktop doesn't → Definitely DNS cache issue on desktop.

## Long-Term Solution

DNS caches will eventually expire (usually 24-48 hours max). Since mobile works, your DNS is configured correctly - desktop just needs to refresh its cache.

The site will work on desktop once the cache expires, or after you flush the DNS cache using the commands above.

