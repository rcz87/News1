# Setup DNS di Hostinger untuk wisanggeni.cloud

## Status Aplikasi
✅ **Aplikasi running di VPS**: 31.97.107.243  
✅ **Path-based routing active**: All 10 channels working  
⏳ **DNS Setup**: Sedang dikonfigurasi

---

## DNS Records yang Diperlukan

Untuk path-based routing, kita **HANYA BUTUH 2 RECORDS**:

### 1. A Record untuk Root Domain (@)

```
Type:       A
Name:       @         (atau kosongkan)
Points to:  31.97.107.243
TTL:        3600
```

### 2. CNAME untuk WWW (Sudah Ada ✅)

Dari screenshot, sudah ada:
```
CNAME  www  →  wisanggeni.cloud
```
Ini sudah benar! ✅

---

## Cara Setup di Hostinger

### Step 1: Hapus Record www yang Error

Di screenshot Anda sedang mencoba menambah A record untuk "www" tapi error karena sudah ada CNAME.

**Action**: 
- Klik "Tambah Record" saja (jangan isi field "Nama")
- ATAU clear field "Nama" dari "www"

### Step 2: Tambah A Record untuk Root Domain

**Di panel "Kelola DNS record":**

1. **Type**: Pilih **A**
2. **Nama**: Ketik **@** (atau biarkan kosong)
3. **Mengarah ke**: Ketik **31.97.107.243**
4. **TTL**: **3600** (default)
5. Klik **Tambah Record**

### Visual Guide

```
┌─────────────────────────────────────────────┐
│ Type: [A ▼]                                 │
│                                             │
│ Nama: [@]  ← INI PENTING!                   │
│                                             │
│ Mengarah ke: [31.97.107.243]               │
│                                             │
│ TTL: [3600]                                 │
│                                             │
│ [Tambah Record]                             │
└─────────────────────────────────────────────┘
```

---

## DNS Records yang Benar (Final)

Setelah setup, DNS records Anda harus seperti ini:

| Type  | Name | Points to / Value    | TTL   |
|-------|------|----------------------|-------|
| A     | @    | 31.97.107.243        | 3600  |
| CNAME | www  | wisanggeni.cloud     | 300   |
| CAA   | @    | 0 issuewild "digicert.com" | 14400 |
| CAA   | @    | 0 issuewild "sectigo.com"  | 14400 |

**Notes:**
- CAA records sudah ada dan tidak perlu diubah
- **JANGAN** tambah A record untuk www (karena sudah ada CNAME)
- **JANGAN** tambah wildcard (*) record (tidak diperlukan untuk path-based)

---

## Verifikasi DNS

### 1. Tunggu DNS Propagation (5-30 menit)

### 2. Test dengan DIG command

Dari komputer/VPS Anda:

```bash
# Test root domain
dig wisanggeni.cloud

# Expected output:
# wisanggeni.cloud.  3600  IN  A  31.97.107.243

# Test www
dig www.wisanggeni.cloud

# Expected output:
# www.wisanggeni.cloud.  300  IN  CNAME  wisanggeni.cloud.
# wisanggeni.cloud.      3600 IN  A      31.97.107.243
```

### 3. Online Tools

Test di browser:
- https://dnschecker.org
- Masukkan: `wisanggeni.cloud`
- Pilih: `A`
- Klik Check
- Semua lokasi harus show: `31.97.107.243`

---

## Setelah DNS Aktif

### Test Browser

1. **Root + Channel Selector**
   ```
   http://wisanggeni.cloud/
   ```
   Should show: Channel selector page

2. **Channel Pages**
   ```
   http://wisanggeni.cloud/ambal
   http://wisanggeni.cloud/beritaangin
   http://wisanggeni.cloud/dendelesinfo
   ... (all 10 channels)
   ```

3. **WWW Redirect**
   ```
   http://www.wisanggeni.cloud/
   ```
   Should redirect to channel selector

### Install SSL Certificate

Setelah DNS propagation selesai:

```bash
# Di VPS
apt install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d wisanggeni.cloud -d www.wisanggeni.cloud

# Follow prompts:
# - Enter email
# - Agree to terms
# - Redirect HTTP to HTTPS: Yes (recommended)

# Test auto-renewal
certbot renew --dry-run
```

---

## Troubleshooting

### Error: "DNS resource record tidak valid"

**Penyebab**: Field "Nama" berisi "www" padahal sudah ada CNAME www

**Solusi**: 
- Gunakan "@" untuk root domain
- ATAU biarkan field "Nama" kosong
- JANGAN gunakan "www" (karena sudah ada CNAME)

### DNS Tidak Resolve setelah 30 menit

```bash
# Flush DNS cache di komputer Anda
# Windows:
ipconfig /flushdns

# Mac:
sudo dscacheutil -flushcache

# Linux:
sudo systemd-resolve --flush-caches

# Test lagi
dig wisanggeni.cloud
```

### Website Masih Tidak Accessible

1. **Cek DNS dulu**:
   ```bash
   dig wisanggeni.cloud
   ```

2. **Pastikan mengarah ke 31.97.107.243**

3. **Cek aplikasi running**:
   ```bash
   pm2 status
   curl -I http://31.97.107.243/
   ```

4. **Cek Nginx**:
   ```bash
   systemctl status nginx
   ```

---

## Quick Reference

### Current Access (via IP)
```
✅ http://31.97.107.243/          # Channel selector
✅ http://31.97.107.243/ambal     # Ambal News
✅ http://31.97.107.243/beritaangin
... (all working)
```

### After DNS Setup
```
⏳ http://wisanggeni.cloud/       # Channel selector
⏳ http://wisanggeni.cloud/ambal  # Ambal News
⏳ http://wisanggeni.cloud/beritaangin
... (will work after DNS propagation)
```

### After SSL Setup
```
🔒 https://wisanggeni.cloud/
🔒 https://wisanggeni.cloud/ambal
🔒 https://wisanggeni.cloud/beritaangin
... (secure HTTPS access)
```

---

## Summary Checklist

- [ ] Tambah A record: @ → 31.97.107.243
- [ ] Verify CNAME sudah ada: www → wisanggeni.cloud
- [ ] Wait 5-30 minutes untuk DNS propagation
- [ ] Test: `dig wisanggeni.cloud`
- [ ] Test browser: http://wisanggeni.cloud/
- [ ] Install SSL certificate dengan Certbot
- [ ] Test HTTPS: https://wisanggeni.cloud/

---

**Last Updated**: October 27, 2025  
**VPS IP**: 31.97.107.243  
**Domain**: wisanggeni.cloud  
**Routing**: Path-based (10 channels)
