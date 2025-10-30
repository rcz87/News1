# PANDUAN DNS SETUP UNTUK CAKRANEWS

## 🌐 INFORMASI VPS
- **IPv4**: `31.97.107.243`
- **IPv6**: `2a02:4780:59:97f9::1`
- **Domain**: `cakrapamungkas.digital`
- **Target**: News Network Multi-Site Platform

## 📋 STEP-BY-STEP DNS CONFIGURATION

### 1. LOGIN KE DOMAIN REGISTRAR
Login ke dashboard tempat Anda membeli domain `cakrapamungkas.digital`

### 2. DNS RECORDS YANG HARUS DITAMBAHKAN

#### **A RECORD (IPv4)**
```
Type: A
Name: @ (atau cakrapamungkas.digital)
Value: 31.97.107.243
TTL: 3600 (atau default)
```

#### **A RECORD untuk WWW**
```
Type: A
Name: www
Value: 31.97.107.243
TTL: 3600 (atau default)
```

#### **AAAA RECORD (IPv6) - OPTIONAL**
```
Type: AAAA
Name: @ (atau cakrapamungkas.digital)
Value: 2a02:4780:59:97f9::1
TTL: 3600 (atau default)
```

#### **AAAA RECORD untuk WWW - OPTIONAL**
```
Type: AAAA
Name: www
Value: 2a02:4780:59:97f9::1
TTL: 3600 (atau default)
```

### 3. CONTOH DI BERBAGAI PROVIDER

#### **Jika di Hostinger**
1. Login ke Hostinger Panel
2. Go to Domains → cakrapamungkas.digital
3. Click "DNS Management"
4. Add records:
   - A: @ → 31.97.107.243
   - A: www → 31.97.107.243

#### **Jika di GoDaddy**
1. Login ke GoDaddy
2. Go to DNS Management
3. Add A Records:
   - Type: A, Name: @, Value: 31.97.107.243
   - Type: A, Name: www, Value: 31.97.107.243

#### **Jika di Cloudflare**
1. Login ke Cloudflare
2. Select domain cakrapamungkas.digital
3. Add DNS Records:
   - Type: A, Name: @, IPv4 address: 31.97.107.243
   - Type: A, Name: www, IPv4 address: 31.97.107.243
   - Proxy status: Gray cloud (DNS only)

### 4. VERIFIKASI DNS PROPAGATION

Setelah setup, tunggu beberapa menit lalu test:

#### **Di Windows/Mac/Linux**
```bash
# Test A record
nslookup cakrapamungkas.digital
nslookup www.cakrapamungkas.digital

# Atau menggunakan dig
dig cakrapamungkas.digital A
dig www.cakrapamungkas.digital A
```

#### **Online DNS Checker**
Kunjungi: https://www.whatsmydns.net/
- Masukkan: cakrapamungkas.digital
- Pilih: A record
- Harus menunjukkan IP: 31.97.107.243

### 5. SETUP SSL CERTIFICATE

Setelah DNS pointing berhasil (biasanya 5-30 menit):

```bash
# Jalankan di VPS
certbot --nginx -d cakrapamungkas.digital -d www.cakrapamungkas.digital --non-interactive --agree-tos --email admin@cakrapamungkas.digital
```

### 6. FINAL TESTING

Setelah SSL terinstall, test dengan:

```bash
# Test HTTPS
curl -I https://cakrapamungkas.digital
curl -I https://www.cakrapamungkas.digital

# Test API
curl https://cakrapamungkas.digital/api/channels/cakranews
```

## ⚠️ IMPORTANT NOTES

### **DNS Propagation Time**
- **Global**: 24-48 jam
- **Indonesia**: 5-30 menit
- **Test dengan**: `nslookup` atau online tools

### **Jika Error 404/521**
1. Pastikan DNS sudah pointing ke IP yang benar
2. Cek Nginx configuration: `/etc/nginx/sites-enabled/cakrapamungkas.digital`
3. Restart Nginx: `systemctl restart nginx`

### **Jika SSL Error**
1. Pastikan domain sudah pointing
2. Test dengan HTTP dulu: `http://cakrapamungkas.digital`
3. Baru setup SSL dengan certbot

## 🎯 TARGET RESULT

Setelah setup selesai:
- ✅ `http://cakrapamungkas.digital` → Menampilkan CAKRANEWS homepage
- ✅ `https://cakrapamungkas.digital` → HTTPS dengan SSL certificate
- ✅ API endpoints berfungsi
- ✅ Mobile responsive
- ✅ Admin dashboard accessible

## 🆘 TROUBLESHOOTING

### **Common Issues & Solutions**

1. **Domain tidak resolving**
   - Cek DNS records lagi
   - Tunggu propagation
   - Clear local DNS cache

2. **Nginx 404 error**
   - Restart Nginx: `systemctl restart nginx`
   - Cek config: `nginx -t`

3. **SSL Certificate error**
   - Pastikan domain sudah pointing
   - Delete dan recreate certificate

4. **API tidak berfungsi**
   - Restart service: `systemctl restart news1.service`
   - Cek port: `netstat -tlnp | grep :5000`

---

**📞 Support**: Jika ada masalah, cek log files:
- Nginx: `/var/log/nginx/cakrapamungkas-error.log`
- Application: `journalctl -u news1.service -f`
