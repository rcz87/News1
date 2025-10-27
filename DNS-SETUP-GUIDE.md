# Panduan Setup DNS untuk wisanggeni.cloud

## Informasi VPS
- **IP Address**: 31.97.107.243
- **Domain**: wisanggeni.cloud
- **Status**: ✅ Aplikasi sudah running dan dapat diakses via IP

## Status Deployment Saat Ini

✅ **Aplikasi sudah berjalan dan dapat diakses di:**
- http://31.97.107.243

✅ **Yang sudah dikonfigurasi:**
- Node.js v20.19.5
- PM2 (auto-restart on boot)
- Nginx reverse proxy
- Firewall (UFW)
- Production environment (.env)

## Langkah Setup DNS di Hostinger/Provider DNS Anda

### 1. Login ke DNS Management Panel
Masuk ke panel DNS management domain wisanggeni.cloud

### 2. Tambahkan DNS Records Berikut:

#### A Record untuk Domain Utama
```
Type: A
Name: @
Value: 31.97.107.243
TTL: 3600 (atau 1 hour)
```

#### A Record untuk Wildcard Subdomain
```
Type: A
Name: *
Value: 31.97.107.243
TTL: 3600 (atau 1 hour)
```

#### CNAME Record untuk WWW (Optional)
```
Type: CNAME
Name: www
Value: wisanggeni.cloud
TTL: 3600
```

### 3. Contoh Konfigurasi DNS di Hostinger

Di panel Hostinger DNS Zone Editor:

| Type | Name | Points to | TTL |
|------|------|-----------|-----|
| A | @ | 31.97.107.243 | 3600 |
| A | * | 31.97.107.243 | 3600 |
| CNAME | www | wisanggeni.cloud | 3600 |

### 4. Verifikasi DNS Propagation

Setelah menambahkan records, tunggu 5-30 menit, lalu test:

```bash
# Test domain utama
dig wisanggeni.cloud

# Test subdomain
dig ambal.wisanggeni.cloud
dig puring.wisanggeni.cloud

# Online tool
https://dnschecker.org
```

### 5. 10 Subdomain News Channels

Setelah DNS aktif, channel berikut akan accessible:

1. http://ambal.wisanggeni.cloud - Ambal News
2. http://puring.wisanggeni.cloud - Berita Angin (Puring)
3. http://kebayoran.wisanggeni.cloud - Dendeles Info (Kebayoran)
4. http://menteng.wisanggeni.cloud - Berita Desa (Menteng)
5. http://senayan.wisanggeni.cloud - Kresna Nusantara (Senayan)
6. http://cipete.wisanggeni.cloud - Info Rurut Sewu (Cipete)
7. http://gandaria.wisanggeni.cloud - Dunia Tengah (Gandaria)
8. http://pondok.wisanggeni.cloud - Voli Info (Pondok Indah)
9. http://tebet.wisanggeni.cloud - Berita Laut (Tebet)
10. http://kuningan.wisanggeni.cloud - Beras Balap (Kuningan)

## Setup SSL Certificate (HTTPS)

**PENTING**: SSL hanya bisa diinstall SETELAH DNS aktif!

### Setelah DNS Propagation Selesai:

```bash
# 1. Install Certbot
apt install -y certbot python3-certbot-nginx

# 2. Obtain SSL Certificate (Wildcard)
certbot --nginx -d wisanggeni.cloud -d *.wisanggeni.cloud

# 3. Test Auto-Renewal
certbot renew --dry-run
```

Certbot akan otomatis:
- Generate SSL certificate
- Update Nginx config untuk HTTPS
- Setup auto-renewal

### Jika Wildcard Gagal

Gunakan individual certificates untuk setiap subdomain:

```bash
certbot --nginx -d wisanggeni.cloud \
  -d www.wisanggeni.cloud \
  -d ambal.wisanggeni.cloud \
  -d puring.wisanggeni.cloud \
  -d kebayoran.wisanggeni.cloud \
  -d menteng.wisanggeni.cloud \
  -d senayan.wisanggeni.cloud \
  -d cipete.wisanggeni.cloud \
  -d gandaria.wisanggeni.cloud \
  -d pondok.wisanggeni.cloud \
  -d tebet.wisanggeni.cloud \
  -d kuningan.wisanggeni.cloud
```

## Troubleshooting

### DNS Belum Resolve
```bash
# Clear DNS cache di komputer Anda
# Windows:
ipconfig /flushdns

# Mac:
sudo dscacheutil -flushcache

# Linux:
sudo systemd-resolve --flush-caches
```

### Cek Status Aplikasi
```bash
# PM2 status
pm2 status

# PM2 logs
pm2 logs news-network

# Nginx status
systemctl status nginx

# Nginx logs
tail -f /var/log/nginx/error.log
```

### Restart Services
```bash
# Restart aplikasi
pm2 restart news-network

# Restart Nginx
systemctl restart nginx
```

## Maintenance Commands

```bash
# Update application code (jika ada perubahan)
cd /root/News1
git pull
npm run build
pm2 restart news-network

# View PM2 logs
pm2 logs news-network

# Monitor resources
pm2 monit

# View Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## Next Steps

1. ✅ Setup DNS records seperti panduan di atas
2. ⏳ Tunggu DNS propagation (5-30 menit)
3. ✅ Test akses domain dan semua subdomain
4. ✅ Install SSL certificate dengan Certbot
5. ✅ Update .env jika perlu (ALLOWED_ORIGINS sudah include wisanggeni.cloud)
6. ✅ Test semua 10 channels dengan HTTPS

## Support

Jika ada masalah:
1. Cek PM2 logs: `pm2 logs news-network`
2. Cek Nginx logs: `tail -f /var/log/nginx/error.log`
3. Test DNS: `dig wisanggeni.cloud`
4. Test connectivity: `curl -I http://wisanggeni.cloud`

---

**Deployment Status**: ✅ COMPLETED - Waiting for DNS Setup
**Last Updated**: October 27, 2025
