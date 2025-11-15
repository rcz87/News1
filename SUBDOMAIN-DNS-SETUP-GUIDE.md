# 🌐 PANDUAN LENGKAP SETUP DOMAIN & SUBDOMAIN

## 📋 INFORMASI VPS
- **IPv4**: `31.97.107.243`
- **Domain Utama**: `wisanggeni.cloud`
- **Target**: Multi-Site News Network

---

## 🔧 STEP 1: LOGIN DOMAIN REGISTRAR

Login ke dashboard tempat Anda membeli domain `wisanggeni.cloud`

---

## 📝 STEP 2: TAMBAHKAN DNS RECORDS

### **A. DOMAIN UTAMA**
```
Type: A
Name: @ (atau wisanggeni.cloud)
Value: 31.97.107.243
TTL: 3600
```

```
Type: A  
Name: www
Value: 31.97.107.243
TTL: 3600
```

### **B. SUBDOMAIN UNTUK SETIAP CHANNEL**
Tambahkan A record untuk setiap channel:

```
Type: A
Name: ambal
Value: 31.97.107.243
TTL: 3600
```

```
Type: A
Name: beritadesa
Value: 31.97.107.243
TTL: 3600
```

```
Type: A
Name: beritalaut
Value: 31.97.107.243
TTL: 3600
```

```
Type: A
Name: dendelesinfo
Value: 31.97.107.243
TTL: 3600
```

```
Type: A
Name: inforurutsewu
Value: 31.97.107.243
TTL: 3600
```

```
Type: A
Name: kresnanusantara
Value: 31.97.107.243
TTL: 3600
```

```
Type: A
Name: mjbnews
Value: 31.97.107.243
TTL: 3600
```

```
Type: A
Name: voliinfo
Value: 31.97.107.243
TTL: 3600
```

```
Type: A
Name: berasbalap
Value: 31.97.107.243
TTL: 3600
```

```
Type: A
Name: beritaangin
Value: 31.97.107.243
TTL: 3600
```

```
Type: A
Name: duniatengah
Value: 31.97.107.243
TTL: 3600
```

```
Type: A
Name: cakranews
Value: 31.97.107.243
TTL: 3600
```

---

## 🌍 STEP 3: CONTOH DI BERBAGAI PROVIDER

### **HOSTINGER**
1. Login → Domains → wisanggeni.cloud
2. Click "DNS Management"
3. Add semua A records di atas

### **GODADDY**
1. Login → DNS Management
2. Add A records satu per satu

### **CLOUDFLARE**
1. Login → Select domain
2. Add DNS records
3. Proxy status: Gray cloud (DNS only)

### **NAMECHEAP**
1. Login → Domain List → wisanggeni.cloud
2. Click "Manage"
3. Go to "Advanced DNS"
4. Add A records

---

## ⏳ STEP 4: TUNGGU DNS PROPAGATION

- **Indonesia**: 5-30 menit
- **Global**: 24-48 jam
- **Test dengan**: `nslookup subdomain.wisanggeni.cloud`

---

## 🔒 STEP 5: SETUP WILDCARD SSL

Setelah DNS propagation, jalankan di VPS:

```bash
# Hapus certificate lama (jika ada)
certbot delete --cert-name wisanggeni.cloud

# Install Wildcard SSL
certbot certonly --manual --preferred-challenges dns \
  -d wisanggeni.cloud -d *.wisanggeni.cloud \
  --agree-tos --email admin@wisanggeni.cloud

# Atau jika sudah ada, tambahkan wildcard
certbot --nginx -d wisanggeni.cloud -d *.wisanggeni.cloud \
  --agree-tos --email admin@wisanggeni.cloud
```

---

## 🧪 STEP 6: VERIFIKASI

### **Test DNS Resolution**
```bash
# Test domain utama
nslookup wisanggeni.cloud
nslookup www.wisanggeni.cloud

# Test subdomain
nslookup ambal.wisanggeni.cloud
nslookup beritadesa.wisanggeni.cloud
nslookup cakranews.wisanggeni.cloud
```

### **Test HTTPS**
```bash
# Test domain utama
curl -I https://wisanggeni.cloud
curl -I https://www.wisanggeni.cloud

# Test subdomain
curl -I https://ambal.wisanggeni.cloud
curl -I https://beritadesa.wisanggeni.cloud
curl -I https://cakranews.wisanggeni.cloud
```

### **Test API Endpoints**
```bash
# Test API di subdomain
curl https://ambal.wisanggeni.cloud/api/channels/ambal
curl https://beritadesa.wisanggeni.cloud/api/channels/beritadesa
```

---

## 🎯 TARGET RESULT

Setelah setup selesai:
- ✅ `https://wisanggeni.cloud` → Homepage
- ✅ `https://ambal.wisanggeni.cloud` → Channel Ambal
- ✅ `https://beritadesa.wisanggeni.cloud` → Channel Berita Desa
- ✅ `https://cakranews.wisanggeni.cloud` → Channel Cakra News
- ✅ Semua subdomain berfungsi dengan HTTPS

---

## 🆘 TROUBLESHOOTING

### **DNS Tidak Resolving**
1. Cek lagi DNS records
2. Tunggu propagation lebih lama
3. Clear local DNS cache:
   ```bash
   # Windows
   ipconfig /flushdns
   
   # Linux/Mac  
   sudo dscacheutil -flushcache
   ```

### **SSL Certificate Error**
1. Pastikan semua DNS sudah pointing
2. Delete dan recreate certificate
3. Gunakan wildcard certificate

### **Nginx Error**
1. Restart Nginx: `systemctl restart nginx`
2. Test config: `nginx -t`
3. Cek logs: `tail -f /var/log/nginx/error.log`

---

## 📞 SUPPORT

### **Cek Status**
```bash
# Cek Nginx status
systemctl status nginx

# Cek application status  
systemctl status news1.service

# Cek SSL certificate
certbot certificates

# Cek DNS propagation
dig wisanggeni.cloud A
dig ambal.wisanggeni.cloud A
```

### **Log Files**
- Nginx: `/var/log/nginx/error.log`
- Application: `journalctl -u news1.service -f`
- SSL: `/var/log/letsencrypt/`

---

**🎉 SELAMAT! Setelah mengikuti panduan ini, semua subdomain akan berfungsi dengan HTTPS!**
