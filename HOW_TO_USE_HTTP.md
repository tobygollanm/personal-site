# How to Visit Your Site via HTTP (Instead of HTTPS)

## Simple Method

**In your browser's address bar, type:**
```
http://yourdomain.com
```

**Important:** Make sure it's `http://` (no 's'), not `https://`

Press Enter and your site should load.

## If Browser Automatically Redirects to HTTPS

Some browsers automatically change `http://` to `https://`. Here's how to force HTTP:

### Chrome/Edge:
1. Type: `http://yourdomain.com`
2. If it redirects to HTTPS, click the lock icon in the address bar
3. Click "Site settings"
4. Change permissions to allow HTTP
5. Or try: `http://yourdomain.com/?noredirect=1`

### Safari:
1. Type: `http://yourdomain.com`
2. If it redirects, go to Safari → Settings → Privacy
3. Uncheck "Prevent cross-site tracking" temporarily
4. Or use a different browser (Chrome/Firefox)

### Firefox:
1. Type: `http://yourdomain.com`
2. If it redirects, go to about:config
3. Search for `dom.security.https_only_mode`
4. Set it to `false` temporarily

## Alternative: Use Different Browser

If your main browser redirects:
- Use a different browser (Chrome, Firefox, Safari, Edge)
- Or use incognito/private browsing mode
- Or clear your browser cache

## Why Use HTTP?

- **Works immediately** - No certificate needed
- **DNS is verified** - You can see if your site loads
- **Test your site** - Make sure everything works before HTTPS is ready

## Once HTTPS is Ready

After DNS propagates and GitHub enables HTTPS:
- `https://yourdomain.com` will work automatically
- HTTP will redirect to HTTPS
- No more security warnings!

## Quick Test

Try typing this in your browser:
```
http://yourdomain.com
```

Replace `yourdomain.com` with your actual domain.

- ✅ **See your site?** → DNS is working, just waiting for HTTPS!
- ❌ **See GoDaddy filler?** → DNS not propagated yet, wait longer
- ⚠️ **Security warning?** → Click "Advanced" → "Proceed anyway"

