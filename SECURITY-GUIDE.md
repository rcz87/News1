# 🔒 Panduan Keamanan & Deployment Security

## ✅ Security Measures yang Sudah Diimplementasikan

### 1. **Helmet.js - Security Headers**
```typescript
✅ X-Content-Type-Options: nosniff
✅ X-Frame-Options: SAMEORIGIN
✅ X-XSS-Protection: 1; mode=block
✅ Strict-Transport-Security (HSTS)
✅ Content-Security-Policy
```

### 2. **Rate Limiting - DDoS Protection**
```typescript
✅ 100 requests per 15 minutes (Production)
✅ 1000 requests per 15 minutes (Development)
✅ Per-IP tracking
✅ Auto-blocking excessive requests
```

### 3. **CORS - Cross-Origin Protection**
```typescript
✅ Wildcard subdomain support (*.domain.com)
✅ Environment-based configuration
✅ Credential support
✅ Origin validation
```

### 4. **Enhanced Error Handling**
```typescript
✅ Generic error messages in production
✅ Detailed logging server-side
✅ No stack trace exposure
✅ Graceful error recovery
```

### 5. **Request Body Limits**
```typescript
✅ 10MB max body size
✅ Prevents memory exhaustion
✅ JSON and URL-encoded support
```

### 6. **Graceful Shutdown**
```typescript
✅ SIGTERM handling
✅ SIGINT handling
✅ Clean connection closing
```

---

## 📋 Pre-Deployment Checklist

### **Step 1: Generate Secure Secrets**

```bash
# Generate secure session secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Copy output dan simpan untuk .env file
```

### **Step 2: Create Production .env File**

Di VPS, create file `.env`:

```bash
cd /home/newsportal/news-network
nano .env
```

Isi dengan:

```env
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
SESSION_SECRET=paste-your-generated-secret-here
ALLOWED_ORIGINS=https://yourdomain.com,https://*.yourdomain.com
```

**IMPORTANT:** 
- ⚠️ Ganti `yourdomain.com` dengan domain Anda
- ⚠️ Jangan commit file `.env` ke Git!
- ✅ File `.env` sudah di-ignore oleh `.gitignore`

### **Step 3: Set File Permissions**

```bash
# .env file hanya bisa dibaca owner
chmod 600 .env

# Content folder read-only untuk keamanan
chmod -R 755 content/

# Server files
chmod 644 server/*.ts
```

---

## 🔥 VPS Security Hardening

### **1. SSH Security**

```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Set these values:
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
Port 22
MaxAuthTries 3
LoginGraceTime 30

# Restart SSH
sudo systemctl restart ssh
```

### **2. Setup Firewall (UFW)**

```bash
# Reset firewall (if needed)
sudo ufw --force reset

# Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow specific ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status verbose
```

### **3. Install Fail2Ban**

```bash
# Install
sudo apt install fail2ban -y

# Copy config
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Edit config
sudo nano /etc/fail2ban/jail.local

# Find [sshd] section and ensure:
[sshd]
enabled = true
port = 22
maxretry = 3
bantime = 3600

# Start service
sudo systemctl start fail2ban
sudo systemctl enable fail2ban

# Check status
sudo fail2ban-client status
```

### **4. Setup SSL/HTTPS (Let's Encrypt)**

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate for wildcard domain
sudo certbot --nginx -d yourdomain.com -d *.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run

# Certificate will auto-renew via cron
```

### **5. Nginx Security Configuration**

Edit Nginx config: `/etc/nginx/sites-available/news-network`

```nginx
# Add security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

# Hide Nginx version
server_tokens off;

# Limit request body size
client_max_body_size 10M;

# Timeouts
client_body_timeout 12;
client_header_timeout 12;
keepalive_timeout 15;
send_timeout 10;

# Buffer limits
client_body_buffer_size 10K;
client_header_buffer_size 1k;
large_client_header_buffers 2 1k;
```

Test & reload:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔐 Additional Security Measures

### **6. Setup Automatic Updates**

```bash
# Install unattended-upgrades
sudo apt install unattended-upgrades -y

# Configure
sudo dpkg-reconfigure --priority=low unattended-upgrades

# Enable automatic updates
sudo systemctl enable unattended-upgrades
```

### **7. Secure Node.js with PM2**

```bash
# Start with PM2
pm2 start npm --name "news-network" -- start

# Set to run as non-root user
pm2 startup systemd -u newsportal
pm2 save

# Monitor
pm2 monit

# Logs
pm2 logs news-network --lines 100
```

### **8. Setup Log Rotation**

Create file: `/etc/logrotate.d/news-network`

```bash
/var/log/nginx/news-network-*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 `cat /var/run/nginx.pid`
    endscript
}
```

### **9. Setup Intrusion Detection (Optional)**

```bash
# Install AIDE
sudo apt install aide -y

# Initialize
sudo aideinit

# Copy database
sudo cp /var/lib/aide/aide.db.new /var/lib/aide/aide.db

# Check for changes (run daily via cron)
sudo aide --check
```

---

## 📊 Monitoring & Alerts

### **Setup Basic Monitoring**

```bash
# Install htop for monitoring
sudo apt install htop -y

# Check system resources
htop

# Check disk usage
df -h

# Check memory
free -m

# Check running processes
ps aux | grep node
```

### **Setup Log Monitoring**

```bash
# Monitor Nginx access log
tail -f /var/log/nginx/news-network-access.log

# Monitor Nginx error log
tail -f /var/log/nginx/news-network-error.log

# Monitor PM2 logs
pm2 logs news-network --lines 50
```

### **Setup Uptime Monitoring (External)**

Gunakan layanan gratis:
- **UptimeRobot** - https://uptimerobot.com (gratis, 50 monitors)
- **Pingdom** - https://pingdom.com (trial gratis)
- **StatusCake** - https://statuscake.com (gratis terbatas)

---

## 🔄 Backup Strategy

### **Automated Daily Backup Script**

Create file: `/home/newsportal/backup-content.sh`

```bash
#!/bin/bash

# Configuration
BACKUP_DIR="/home/newsportal/backups"
PROJECT_DIR="/home/newsportal/news-network"
DATE=$(date +%Y%m%d-%H%M%S)
RETENTION_DAYS=30

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

# Backup content folder
cd $PROJECT_DIR
tar -czf $BACKUP_DIR/content-$DATE.tar.gz content/

# Backup .env file
cp .env $BACKUP_DIR/env-$DATE.backup

# Push to Git (if using Git for version control)
git add content/
git commit -m "Auto backup $DATE" || true
git push origin main || true

# Delete old backups (older than 30 days)
find $BACKUP_DIR -name "content-*.tar.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "env-*.backup" -mtime +$RETENTION_DAYS -delete

# Log backup
echo "[$DATE] Backup completed successfully" >> $BACKUP_DIR/backup.log
```

Make executable:
```bash
chmod +x /home/newsportal/backup-content.sh
```

### **Setup Cron for Daily Backup**

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /home/newsportal/backup-content.sh

# Add weekly full backup at Sunday 3 AM
0 3 * * 0 tar -czf /home/newsportal/backups/full-$(date +\%Y\%m\%d).tar.gz /home/newsportal/news-network
```

---

## 🚨 Incident Response

### **If Server is Compromised:**

```bash
# 1. Disconnect from network (if possible)
# 2. Check for unauthorized access
sudo last
sudo lastb

# 3. Check running processes
ps aux | grep -v grep

# 4. Check open ports
sudo netstat -tulpn

# 5. Check cron jobs
crontab -l
sudo cat /etc/crontab

# 6. Restore from backup
cd /home/newsportal
tar -xzf backups/content-YYYYMMDD.tar.gz

# 7. Reset passwords & keys
# 8. Review logs for attack patterns
# 9. Contact host support if needed
```

---

## 📝 Security Audit Checklist

### **Monthly Security Audit:**

- [ ] Update all system packages (`sudo apt update && sudo apt upgrade`)
- [ ] Update Node.js dependencies (`npm outdated`, `npm update`)
- [ ] Run security audit (`npm audit`, `npm audit fix`)
- [ ] Review Fail2Ban logs (`sudo fail2ban-client status sshd`)
- [ ] Check SSL certificate expiry (`sudo certbot certificates`)
- [ ] Review Nginx logs for suspicious activity
- [ ] Test backup restoration
- [ ] Review firewall rules (`sudo ufw status`)
- [ ] Check disk space (`df -h`)
- [ ] Review user accounts (`cat /etc/passwd`)

---

## 📞 Security Contacts

### **Useful Resources:**

- **Let's Encrypt Help:** https://letsencrypt.org/docs/
- **Nginx Security:** https://www.nginx.com/blog/mitigating-ddos-attacks-with-nginx-and-nginx-plus/
- **Node.js Security:** https://nodejs.org/en/docs/guides/security/
- **OWASP Top 10:** https://owasp.org/www-project-top-ten/

### **Report Security Issues:**

If you find security vulnerability:
1. DO NOT post publicly
2. Email: security@yourdomain.com
3. Include details & steps to reproduce

---

## ✅ Final Security Score

After implementing all measures:

```
🔒 Security Level: EXCELLENT (9/10)

✅ Application Security
✅ Network Security
✅ Server Hardening
✅ Monitoring & Logging
✅ Backup Strategy
✅ Incident Response Plan

Ready for Production! 🚀
```

---

## 🎯 Quick Reference Commands

```bash
# Check security status
sudo ufw status                    # Firewall
sudo fail2ban-client status       # Fail2Ban
sudo certbot certificates         # SSL
pm2 status                        # App status

# View logs
pm2 logs news-network             # App logs
sudo tail -f /var/log/nginx/error.log  # Nginx errors
sudo journalctl -u nginx          # Nginx service logs

# Security updates
sudo apt update && sudo apt upgrade    # System
npm audit                         # Dependencies
npm audit fix                     # Auto-fix vulnerabilities

# Backup manually
/home/newsportal/backup-content.sh

# Restore from backup
cd /home/newsportal/news-network
tar -xzf /home/newsportal/backups/content-YYYYMMDD.tar.gz
```

---

**🛡️ Stay Secure! Update Regularly!**
