# Nginx API Proxy Fix - HTTPS Endpoints Returning HTML Instead of JSON

## 🔍 Problem Summary

**Issue:** HTTPS API endpoints are returning HTML instead of JSON responses, making the API inaccessible via public IP and HTTPS.

**Impact:**
- ❌ External API access not working
- ❌ Mobile apps cannot fetch data
- ❌ Third-party integrations broken
- ✅ Local API endpoints work fine (http://localhost:5000)

## 📋 Root Cause Analysis

### Why This Happens

The nginx reverse proxy was configured with a common Single Page Application (SPA) pattern that catches ALL requests and serves `index.html`:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

This configuration means:
1. Request comes in for `/api/channels`
2. Nginx tries to find the file at `/api/channels` (doesn't exist)
3. Nginx tries to find directory `/api/channels/` (doesn't exist)
4. Nginx falls back to serving `/index.html` ✗ **WRONG!**
5. Client receives HTML instead of JSON

### What Should Happen

API requests should be **proxied to the Express backend** before falling back to static files:

```nginx
# API routes - Proxy to backend (FIRST)
location /api/ {
    proxy_pass http://localhost:5000;
    # ... proxy headers
}

# Static files - Serve frontend (SECOND)
location / {
    try_files $uri $uri/ /index.html;
}
```

## ✅ Solution Provided

### Files Created

1. **`nginx/news1.conf`** - Corrected nginx configuration
   - Properly proxies `/api/*` requests to backend on port 5000
   - Serves static files for frontend
   - Configures SSL/HTTPS correctly
   - Optimizes caching strategies

2. **`scripts/deploy-nginx-config.sh`** - Automated deployment script
   - Backs up existing configuration
   - Installs new configuration
   - Tests configuration before applying
   - Verifies API endpoints work
   - Automatic rollback on failure

3. **`NGINX-API-PROXY-FIX.md`** - This documentation

### Key Configuration Changes

#### 1. API Proxying (CRITICAL)

```nginx
# API Routes - Proxy to Express Backend
# CRITICAL: This must come BEFORE the location / block
location /api/ {
    proxy_pass http://news1_backend;
    proxy_http_version 1.1;

    # Preserve original request information
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # Don't cache API responses
    add_header Cache-Control "no-cache, no-store, must-revalidate" always;
}
```

#### 2. Backend Upstream

```nginx
upstream news1_backend {
    server localhost:5000;
    keepalive 64;
}
```

#### 3. Static File Serving

```nginx
# Frontend Routes - Serve static files and fallback to index.html
# This must come AFTER /api/ location block
location / {
    try_files $uri $uri/ /index.html;
    add_header Cache-Control "no-cache, must-revalidate" always;
}
```

## 🚀 Deployment Instructions

### Prerequisites

- SSH access to production server
- Root/sudo privileges
- News1 service running on port 5000
- Nginx installed and running

### Step 1: Pull Latest Code

```bash
cd /root/News1
git pull origin claude/fix-api-https-nginx-01WENx4YKGVq1JBjKmRRjKkK
```

### Step 2: Deploy Nginx Configuration

```bash
sudo ./scripts/deploy-nginx-config.sh
```

This script will:
1. ✅ Backup existing configuration
2. ✅ Install new configuration
3. ✅ Test configuration syntax
4. ✅ Reload nginx
5. ✅ Verify services are running
6. ✅ Test API endpoints (local & HTTPS)
7. ✅ Auto-rollback if something fails

### Step 3: Verify Fix

#### Test HTTPS API Endpoint
```bash
curl -H "Accept: application/json" https://wisanggeni.cloud/api/channels
```

**Expected Response:** JSON array with channel data
```json
[
  {
    "id": "ambal",
    "name": "Ambal News",
    "subdomain": "ambal.wisanggeni.cloud",
    ...
  }
]
```

#### Test Individual Channel
```bash
curl -H "Accept: application/json" https://wisanggeni.cloud/api/channels/ambal/articles
```

**Expected Response:** JSON array with articles

### Step 4: Test from External Network

```bash
# From your local machine or mobile device
curl -H "Accept: application/json" https://wisanggeni.cloud/api/channels
```

Should return JSON, not HTML!

## 🧪 Verification Checklist

After deployment, verify:

- [ ] Local API works: `curl http://localhost:5000/api/channels`
- [ ] HTTPS API returns JSON: `curl -H "Accept: application/json" https://wisanggeni.cloud/api/channels`
- [ ] Frontend loads correctly: `curl https://wisanggeni.cloud`
- [ ] Admin panel accessible: `https://wisanggeni.cloud/admin`
- [ ] Uploads serve correctly: `https://wisanggeni.cloud/uploads/`
- [ ] External IP access works from mobile/other devices
- [ ] No errors in nginx logs: `tail -f /var/log/nginx/news-network-error.log`
- [ ] No errors in app logs: `journalctl -u news1 -f`

## 📊 Testing Commands

### Test All API Endpoints

```bash
# Get all channels
curl -s -H "Accept: application/json" https://wisanggeni.cloud/api/channels | jq .

# Get articles for a channel
curl -s -H "Accept: application/json" https://wisanggeni.cloud/api/channels/ambal/articles | jq .

# Get featured articles
curl -s -H "Accept: application/json" https://wisanggeni.cloud/api/channels/ambal/featured | jq .

# Get specific article
curl -s -H "Accept: application/json" https://wisanggeni.cloud/api/channels/ambal/articles/festival-pantai-selatan | jq .

# Get all articles (admin)
curl -s -H "Accept: application/json" https://wisanggeni.cloud/api/articles | jq .
```

### Check Response Headers

```bash
curl -I -H "Accept: application/json" https://wisanggeni.cloud/api/channels
```

**Expected Headers:**
```
HTTP/2 200
content-type: application/json; charset=utf-8
cache-control: no-cache, no-store, must-revalidate
pragma: no-cache
expires: 0
```

### Test Frontend Still Works

```bash
curl -I https://wisanggeni.cloud
```

**Expected Headers:**
```
HTTP/2 200
content-type: text/html
```

## 🔧 Troubleshooting

### Issue: Still Getting HTML Instead of JSON

**Check nginx configuration:**
```bash
sudo nginx -t
cat /etc/nginx/sites-available/news-network | grep -A 20 "location /api/"
```

**Check order of location blocks:**
```bash
cat /etc/nginx/sites-available/news-network | grep "location"
```

The `/api/` location block **must** appear before the `/` location block.

### Issue: 502 Bad Gateway

**Backend not running:**
```bash
systemctl status news1
sudo systemctl start news1
```

**Check backend port:**
```bash
netstat -tlnp | grep 5000
```

### Issue: 404 Not Found

**Check root directory:**
```bash
ls -la /root/News1/dist/public/
```

**Rebuild if needed:**
```bash
cd /root/News1
npm run build
```

### Issue: CORS Errors

**Check CORS headers in response:**
```bash
curl -I -H "Origin: https://test.example.com" https://wisanggeni.cloud/api/channels
```

**Update allowed origins in .env:**
```bash
ALLOWED_ORIGINS=https://wisanggeni.cloud,https://*.wisanggeni.cloud
```

## 📁 File Locations

| Component | Location |
|-----------|----------|
| Nginx config | `/etc/nginx/sites-available/news-network` |
| Nginx enabled | `/etc/nginx/sites-enabled/news-network` |
| Config backup | `/root/nginx-backups/` |
| Access log | `/var/log/nginx/news-network-access.log` |
| Error log | `/var/log/nginx/news-network-error.log` |
| App service | `/etc/systemd/system/news1.service` |
| App logs | `journalctl -u news1 -f` |
| Static files | `/root/News1/dist/public/` |
| Uploads | `/root/News1/uploads/` |

## 🔄 Rollback Procedure

If something goes wrong:

```bash
# 1. Find latest backup
ls -lt /root/nginx-backups/

# 2. Restore backup (replace TIMESTAMP)
sudo cp /root/nginx-backups/news-network.TIMESTAMP.bak /etc/nginx/sites-available/news-network

# 3. Test configuration
sudo nginx -t

# 4. Reload nginx
sudo systemctl reload nginx

# 5. Verify
curl -I https://wisanggeni.cloud/api/channels
```

## 📈 Performance Optimization

The new configuration includes:

### 1. Upstream Keepalive
```nginx
upstream news1_backend {
    server localhost:5000;
    keepalive 64;  # Reuse connections
}
```

### 2. Response Caching Strategy
- **API responses**: No cache (always fresh data)
- **Static assets**: 1 year cache (versioned files)
- **Uploads**: 30 days cache
- **HTML**: No cache (allows dynamic updates)

### 3. Gzip Compression
```nginx
gzip on;
gzip_types text/css application/javascript application/json;
```

### 4. Buffer Optimization
```nginx
proxy_buffering on;
proxy_buffer_size 4k;
proxy_buffers 8 4k;
```

## 🔒 Security Enhancements

### 1. Headers Set Correctly
- `X-Real-IP`: Original client IP
- `X-Forwarded-For`: Request chain
- `X-Forwarded-Proto`: https
- `X-Forwarded-Host`: Original host

### 2. Rate Limiting
Handled by Express backend (100 req/15min in production)

### 3. SSL Configuration
- TLS 1.2 and 1.3 only
- Strong ciphers
- HSTS enabled
- Certificate auto-renewal (Let's Encrypt)

### 4. Hidden Files Protected
```nginx
location ~ /\. {
    deny all;
}
```

## 📞 Support & Monitoring

### Monitor API Performance

```bash
# Watch access log for API requests
tail -f /var/log/nginx/news-network-access.log | grep "/api/"

# Watch for errors
tail -f /var/log/nginx/news-network-error.log

# Monitor backend
journalctl -u news1 -f
```

### Service Management

```bash
# Restart nginx
sudo systemctl restart nginx

# Restart backend
sudo systemctl restart news1

# Check status
sudo systemctl status nginx
sudo systemctl status news1

# View full logs
sudo journalctl -u nginx -n 100
sudo journalctl -u news1 -n 100
```

## ✅ Success Criteria

After applying this fix, you should have:

1. ✅ **HTTPS API endpoints returning JSON** (not HTML)
2. ✅ **External IP access working** for all devices
3. ✅ **Mobile apps can fetch data** successfully
4. ✅ **Frontend still loads** correctly
5. ✅ **Admin panel accessible** via HTTPS
6. ✅ **All 12 channels** serving content properly
7. ✅ **No CORS errors** for allowed origins
8. ✅ **Performance optimized** with caching and compression

## 🎯 Next Steps

After deploying this fix:

1. **Test thoroughly** with all API endpoints
2. **Monitor logs** for any errors
3. **Update documentation** if custom domains added
4. **Set up monitoring** (optional: Prometheus/Grafana)
5. **Configure backups** for nginx config
6. **Add health checks** to monitoring system

## 📚 References

- [Nginx Reverse Proxy Guide](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/)
- [Nginx Proxy Headers](https://www.nginx.com/resources/wiki/start/topics/examples/forwarded/)
- [Express Behind Proxies](https://expressjs.com/en/guide/behind-proxies.html)

---

## 🎉 Conclusion

This fix resolves the critical issue where HTTPS API endpoints were returning HTML instead of JSON. The root cause was nginx's location block order - the SPA fallback rule was catching API requests before they could be proxied to the backend.

**Key Takeaway:** In nginx configuration, **order matters**. API proxy rules must come before catch-all static file rules.

---

**Fix Created:** November 17, 2025
**Issue:** HTTPS API Proxy Misconfiguration
**Status:** Ready for Deployment
**Priority:** Critical
