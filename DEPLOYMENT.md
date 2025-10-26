# Deployment Guide - Multi-Site News Network Portal

This guide explains how to deploy the news network portal to a VPS (Virtual Private Server) with wildcard DNS configuration.

## System Requirements

### Server Requirements
- **OS**: Ubuntu 20.04 LTS or newer
- **RAM**: Minimum 2GB (4GB recommended for production)
- **Storage**: 20GB minimum
- **Node.js**: v20.x or newer
- **Nginx**: Latest stable version
- **SSL**: Certbot for Let's Encrypt certificates

### Domain Configuration
- Main domain: `domainutama.com`
- Wildcard DNS: `*.domainutama.com`
- Individual subdomains for 10 channels:
  - `ambal.domainutama.com`
  - `puring.domainutama.com`
  - `kebayoran.domainutama.com`
  - `menteng.domainutama.com`
  - `senayan.domainutama.com`
  - `cipete.domainutama.com`
  - `gandaria.domainutama.com`
  - `pondok.domainutama.com`
  - `tebet.domainutama.com`
  - `kuningan.domainutama.com`

## DNS Configuration (Hostinger)

### Step 1: Setup Wildcard DNS

In your Hostinger DNS management panel, add the following records:

```
Type    Name    Value                   TTL
A       @       YOUR_VPS_IP_ADDRESS     3600
A       *       YOUR_VPS_IP_ADDRESS     3600
CNAME   www     domainutama.com         3600
```

This configuration ensures all subdomains point to your VPS.

### Step 2: Verify DNS Propagation

```bash
# Test main domain
dig domainutama.com

# Test wildcard subdomain
dig ambal.domainutama.com
dig puring.domainutama.com
```

Wait for DNS propagation (can take 24-48 hours, but usually faster with Hostinger).

## VPS Setup

### Step 1: Initial Server Setup

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install build essentials
sudo apt install -y build-essential

# Install Nginx
sudo apt install -y nginx

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx

# Verify installations
node --version
npm --version
nginx -v
```

### Step 2: Setup Application User

```bash
# Create dedicated user for the application
sudo adduser newsportal --disabled-password
sudo usermod -aG sudo newsportal

# Switch to application user
sudo su - newsportal
```

### Step 3: Deploy Application

```bash
# Clone or upload your application
cd /home/newsportal
git clone <your-repo-url> news-network
# OR upload via SCP/SFTP

cd news-network

# Install dependencies
npm install --production

# Build the application
npm run build

# Test the build
npm start
```

### Step 4: Setup PM2 Process Manager

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start application with PM2
pm2 start npm --name "news-network" -- start

# Configure PM2 to start on system boot
pm2 startup systemd
# Run the command that PM2 outputs

# Save PM2 configuration
pm2 save

# Check application status
pm2 status
pm2 logs news-network
```

## Nginx Configuration

### Step 1: Create Nginx Configuration

Create file: `/etc/nginx/sites-available/news-network`

```nginx
# Upstream to Node.js application
upstream news_backend {
    server 127.0.0.1:5000;
    keepalive 64;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name domainutama.com *.domainutama.com;
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS Server Block
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name domainutama.com *.domainutama.com;

    # SSL Configuration (will be auto-configured by Certbot)
    ssl_certificate /etc/letsencrypt/live/domainutama.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/domainutama.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Logging
    access_log /var/log/nginx/news-network-access.log;
    error_log /var/log/nginx/news-network-error.log;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/javascript application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Proxy to Node.js application
    location / {
        proxy_pass http://news_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_buffering off;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://news_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Step 2: Enable Nginx Configuration

```bash
# Create symlink to enable site
sudo ln -s /etc/nginx/sites-available/news-network /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## SSL Certificate Setup

### Step 1: Obtain Wildcard SSL Certificate

```bash
# Install SSL certificate for wildcard domain
sudo certbot --nginx -d domainutama.com -d *.domainutama.com

# Follow the prompts:
# - Enter email address
# - Agree to terms of service
# - Choose whether to redirect HTTP to HTTPS (recommended: Yes)

# Test auto-renewal
sudo certbot renew --dry-run
```

### Step 2: Setup Auto-Renewal

```bash
# Certbot automatically sets up renewal via cron/systemd
# Verify renewal timer is active
sudo systemctl status certbot.timer

# Manual renewal command (if needed)
sudo certbot renew
```

## Environment Configuration

### Production Environment Variables

Create `.env.production` file in your application directory:

```bash
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

# Session secret (generate secure random string)
SESSION_SECRET=your-very-secure-random-session-secret-here

# Optional: Add monitoring/analytics
# ANALYTICS_ID=your-analytics-id
```

**Generate secure session secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Monitoring & Maintenance

### PM2 Monitoring

```bash
# View application status
pm2 status

# View logs
pm2 logs news-network

# View specific log lines
pm2 logs news-network --lines 100

# Monitor CPU/Memory
pm2 monit

# Restart application
pm2 restart news-network

# Reload without downtime
pm2 reload news-network
```

### System Monitoring

```bash
# Check Nginx status
sudo systemctl status nginx

# Check Nginx logs
sudo tail -f /var/log/nginx/news-network-access.log
sudo tail -f /var/log/nginx/news-network-error.log

# Check system resources
htop
df -h
free -m
```

### Backup Content

```bash
# Create backup script: /home/newsportal/backup.sh
#!/bin/bash
BACKUP_DIR="/home/newsportal/backups"
DATE=$(date +%Y%m%d-%H%M%S)
mkdir -p $BACKUP_DIR

# Backup content directory
tar -czf $BACKUP_DIR/content-$DATE.tar.gz /home/newsportal/news-network/content/

# Keep only last 30 days of backups
find $BACKUP_DIR -name "content-*.tar.gz" -mtime +30 -delete

# Make executable
chmod +x /home/newsportal/backup.sh

# Add to crontab for daily backups at 2 AM
crontab -e
# Add line: 0 2 * * * /home/newsportal/backup.sh
```

## Firewall Configuration

```bash
# Setup UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable

# Verify rules
sudo ufw status
```

## Content Management

### Adding New Articles

Articles are stored in `content/{channel-id}/` directories as Markdown files.

**Via SSH:**
```bash
# Navigate to content directory
cd /home/newsportal/news-network/content/ambal/

# Create new article
nano new-article-slug.md

# Add frontmatter and content
```

**Via SFTP:**
- Use FileZilla, WinSCP, or Cyberduck
- Connect to: `sftp://YOUR_VPS_IP`
- Navigate to: `/home/newsportal/news-network/content/`
- Upload `.md` files to appropriate channel directory

**Article will be automatically available** - no restart needed!

## Troubleshooting

### Application not starting
```bash
# Check PM2 logs
pm2 logs news-network

# Check Node.js errors
npm start

# Verify port 5000 is available
sudo lsof -i :5000
```

### Nginx errors
```bash
# Check Nginx configuration
sudo nginx -t

# View error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### SSL certificate issues
```bash
# Renew certificates manually
sudo certbot renew --force-renewal

# Check certificate expiry
sudo certbot certificates
```

### DNS not resolving
```bash
# Check DNS records
dig domainutama.com
dig ambal.domainutama.com

# Clear local DNS cache (on client)
# Windows: ipconfig /flushdns
# Mac: sudo dscacheutil -flushcache
# Linux: sudo systemd-resolve --flush-caches
```

## Performance Optimization

### Enable Nginx Caching

Add to Nginx configuration:

```nginx
# Cache configuration
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=news_cache:10m 
                 max_size=1g inactive=60m use_temp_path=off;

location / {
    proxy_cache news_cache;
    proxy_cache_valid 200 10m;
    proxy_cache_bypass $http_cache_control;
    add_header X-Cache-Status $upstream_cache_status;
    # ... other proxy settings
}
```

### PM2 Cluster Mode

For better performance with multiple CPU cores:

```bash
pm2 delete news-network
pm2 start npm --name "news-network" -i max -- start
pm2 save
```

## Security Checklist

- [ ] Firewall enabled (UFW)
- [ ] SSH key authentication only (disable password auth)
- [ ] SSL certificates installed and auto-renewing
- [ ] Nginx security headers configured
- [ ] Regular security updates (`apt update && apt upgrade`)
- [ ] Backup system configured
- [ ] Strong session secret generated
- [ ] Rate limiting configured (optional)

## Support & Maintenance

For ongoing support:
1. Monitor PM2 logs regularly
2. Check SSL expiry dates monthly
3. Update dependencies quarterly
4. Backup content weekly
5. Monitor disk space and performance

---

**Deployment completed!** Your multi-site news network should now be accessible at all configured subdomains with SSL certificates.
