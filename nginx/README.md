# Nginx Configuration for News1 Network

This directory contains the production-ready nginx configuration for the News1 multi-channel news network.

## Files

- **`news1.conf`** - Main nginx site configuration file

## Purpose

This configuration fixes the critical issue where HTTPS API endpoints were returning HTML instead of JSON by properly routing requests:

1. **API requests** (`/api/*`) → Proxied to Express backend on port 5000
2. **Admin requests** (`/admin`) → Proxied to Express backend
3. **Static files** (`/`, `/assets/*`) → Served from `dist/public/`
4. **Uploads** (`/uploads/*`) → Served from `uploads/` directory

## Key Features

✅ **Proper API Proxying** - Fixes HTTPS endpoints returning HTML
✅ **SSL/HTTPS Support** - Let's Encrypt certificates
✅ **Performance Optimized** - Gzip compression, caching strategies
✅ **Security Hardened** - Proper headers, HSTS, hidden file protection
✅ **WebSocket Support** - For real-time features if needed
✅ **Health Checks** - Endpoint monitoring
✅ **Multi-domain Support** - Wildcard subdomains

## Deployment

### Quick Deploy

```bash
sudo ./scripts/deploy-nginx-config.sh
```

### Manual Deploy

```bash
# Backup existing config
sudo cp /etc/nginx/sites-available/news-network /root/nginx-backups/news-network.backup

# Copy new config
sudo cp nginx/news1.conf /etc/nginx/sites-available/news-network

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Verify
curl -H "Accept: application/json" https://wisanggeni.cloud/api/channels
```

## Configuration Details

### Upstream Backend

```nginx
upstream news1_backend {
    server localhost:5000;
    keepalive 64;
}
```

The backend Express application runs on port 5000.

### Location Block Order (CRITICAL)

The order of location blocks is critical for proper routing:

1. **First:** `/api/` - Proxy to backend
2. **Second:** `/admin` - Proxy to backend
3. **Third:** `/uploads/` - Serve static files
4. **Fourth:** `/assets/` - Serve static files
5. **Last:** `/` - Serve SPA with fallback to index.html

If `/` comes before `/api/`, all requests will serve `index.html` (the bug we're fixing).

### Proxy Headers

Essential headers for the backend to work correctly behind nginx:

```nginx
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
```

These allow the Express app to:
- Know the original hostname
- Get the client's real IP address
- Trust the proxy for rate limiting
- Understand it's behind HTTPS

### Caching Strategy

| Content Type | Cache Duration | Rationale |
|--------------|----------------|-----------|
| API responses | No cache | Always fresh data |
| Static assets (`/assets/*`) | 1 year | Versioned filenames |
| Uploads | 30 days | User-uploaded content |
| HTML files | No cache | Allow dynamic updates |

## Testing

### Test API Returns JSON

```bash
# Should return JSON, not HTML
curl -H "Accept: application/json" https://wisanggeni.cloud/api/channels | jq .
```

### Test Frontend Still Works

```bash
# Should return HTML
curl -I https://wisanggeni.cloud
```

### Test from External Network

```bash
# From mobile or external network
curl -H "Accept: application/json" https://wisanggeni.cloud/api/channels
```

## Troubleshooting

### Still Getting HTML for API

Check location block order:
```bash
cat /etc/nginx/sites-available/news-network | grep -n "location"
```

Ensure `/api/` appears before `/`.

### 502 Bad Gateway

Backend not running:
```bash
systemctl status news1
sudo systemctl start news1
```

### 404 Not Found

Missing static files:
```bash
ls -la /root/News1/dist/public/
npm run build  # Rebuild if needed
```

## Monitoring

```bash
# Watch API requests
tail -f /var/log/nginx/news-network-access.log | grep "/api/"

# Watch errors
tail -f /var/log/nginx/news-network-error.log

# Monitor backend
journalctl -u news1 -f
```

## Security

- ✅ HTTPS enforced (HTTP redirects to HTTPS)
- ✅ TLS 1.2+ only
- ✅ HSTS headers
- ✅ Hidden files denied
- ✅ Proper CORS headers from backend
- ✅ Rate limiting (handled by Express)
- ✅ File upload size limit (10MB)

## SSL Certificates

Certificates are managed by Let's Encrypt and stored at:
```
/etc/letsencrypt/live/wisanggeni.cloud/fullchain.pem
/etc/letsencrypt/live/wisanggeni.cloud/privkey.pem
```

Auto-renewal is configured via certbot.

## Support

For detailed troubleshooting and deployment instructions, see:
- **[NGINX-API-PROXY-FIX.md](../NGINX-API-PROXY-FIX.md)** - Complete fix documentation

## Changes Log

- **2025-11-17**: Initial configuration created to fix HTTPS API proxy issue
  - Added proper API proxying before static file serving
  - Configured upstream backend with keepalive
  - Optimized caching strategies
  - Added security headers and HSTS
  - Included WebSocket support for future use
