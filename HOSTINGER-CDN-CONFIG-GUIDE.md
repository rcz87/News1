# 🚀 PANDUAN KONFIGURASI CDN HOSTINGER UNTUK CAKRANEWS

## 📋 **SITUASI SAAT INI:**
- Domain: `cakrapamungkas.digital`
- Masalah: Masih di-handle CDN Hostinger (PHP/8.2.28)
- Target: Mengarah ke VPS server (IP: 31.97.107.243)

## 🔧 **LANGKAH-LANGKAH KONFIGURASI DI HOSTINGER PANEL:**

### **1. Login ke Hostinger Panel**
- Buka: `hpanel.hostinger.com`
- Login dengan akun Hostinger Anda

### **2. Pilih Domain Management**
- Cari domain `cakrapamungkas.digital`
- Klik **"Manage"** atau **"Settings"**

### **3. Konfigurasi DNS Records**
Ubah DNS records menjadi:

#### **A Record (Root Domain):**
```
Type: A
Name: @ (atau kosong)
Value: 31.97.107.243
TTL: 3600 (atau Auto)
```

#### **A Record (WWW):**
```
Type: A
Name: www
Value: 31.97.107.243
TTL: 3600 (atau Auto)
```

#### **Hapus/Disable Records yang Tidak Perlu:**
- Hapus CNAME records yang mengarah ke Hostinger
- Hapus MX records jika tidak digunakan untuk email
- Disable proxy/Cloudflare jika aktif

### **4. Konfigurasi CDN/Proxy**
Jika ada opsi CDN atau Proxy:
- **Disable CDN** atau **Set to DNS Only**
- **Disable Cloudflare** (jika aktif)
- **Set SSL to "Full"** atau "Flexible" (jika tersedia)

### **5. Konfigurasi SSL Certificate**
Pilih opsi SSL:
- **"No SSL"** (biarkan VPS yang handle)
- **"Flexible SSL"** (jika ingin Hostinger handle HTTPS)
- **"Full SSL"** (jika ada certificate di VPS)

### **6. Konfigurasi Web Server**
Jika ada opsi Web Server:
- **Disable PHP**
- **Set to "Static Website"** atau "Proxy Mode"
- **Document Root:** Kosongkan atau set ke `/`

## ⏱️ **WAITING PERIOD**
Setelah perubahan DNS:
- **Propagation Time:** 30 menit - 24 jam
- **Check Status:** Gunakan tools seperti `dnschecker.org`

## 🔍 **VERIFICATION STEPS**

### **1. Check DNS Resolution:**
```bash
# Di komputer lokal
nslookup cakrapamungkas.digital
dig cakrapamungkas.digital

# Harus menunjukkan IP: 31.97.107.243
```

### **2. Test HTTP Response:**
```bash
# Test dari VPS
curl -I http://cakrapamungkas.digital
# Harus menunjukkan nginx/1.24.0 (Ubuntu)
```

### **3. Test HTTPS Response:**
```bash
# Test SSL
curl -k -I https://cakrapamungkas.digital
# Harus menunjukkan HTTP/2 200
```

## 🚨 **TROUBLESHOOTING**

### **Jika Masih Mengarah ke Hostinger:**
1. **Clear DNS Cache:**
   ```bash
   # Di Windows
   ipconfig /flushdns
   
   # Di Mac/Linux
   sudo dscacheutil -flushcache
   ```

2. **Check Different DNS Servers:**
   - Gunakan Google DNS (8.8.8.8)
   - Gunakan Cloudflare DNS (1.1.1.1)

3. **Wait Longer:**
   - DNS propagation bisa memakan waktu hingga 24 jam

### **Jika SSL Error:**
1. **Install SSL Certificate di VPS:**
   ```bash
   # Setelah DNS mengarah ke VPS
   certbot --nginx -d cakrapamungkas.digital -d www.cakrapamungkas.digital
   ```

2. **Use Self-Signed Certificate (Temporary):**
   ```bash
   # Certificate sudah ada di:
   /etc/ssl/certs/cakrapamungkas.crt
   /etc/ssl/private/cakrapamungkas.key
   ```

## 📞 **HOSTINGER SUPPORT**
Jika tidak bisa mengubah DNS:
- Contact Hostinger Support
- Request untuk mengubah A records ke `31.97.107.243`
- Mention: "Point to external VPS server"

## 🎯 **EXPECTED RESULT**
Setelah konfigurasi berhasil:
- `http://cakrapamungkas.digital` → Menampilkan CAKRANEWS
- `https://cakrapamungkas.digital` → Menampilkan CAKRANEWS dengan SSL
- Server response: `nginx/1.24.0 (Ubuntu)`
- Bukan lagi: `x-powered-by: PHP/8.2.28`

## 🔄 **ALTERNATIVE SOLUTION**
Jika tidak bisa mengubah DNS Hostinger:
1. **Gunakan subdomain dari wisanggeni.cloud:**
   - `https://cakranews.wisanggeni.cloud` (sudah aktif)

2. **Domain Forwarding:**
   - Set domain forwarding di Hostinger
   - Forward `cakrapamungkas.digital` → `https://wisanggeni.cloud/cakranews`

## ✅ **CHECKLIST KONFIGURASI:**
- [ ] Login Hostinger Panel
- [ ] Ubah A Record @ → 31.97.107.243
- [ ] Ubah A Record www → 31.97.107.243
- [ ] Disable CDN/Proxy
- [ ] Disable PHP
- [ ] Set SSL mode
- [ ] Save changes
- [ ] Wait for DNS propagation
- [ ] Test DNS resolution
- [ ] Test HTTP/HTTPS response
- [ ] Verify CAKRANEWS loading

## 📞 **BUTUH BANTUAN?**
Jika mengalami kesulitan:
1. Screenshot error/setting Hostinger
2. Test DNS dari komputer lokal
3. Report hasilnya untuk troubleshooting lebih lanjut

**🚀 Setelah konfigurasi berhasil, CAKRANEWS akan fully functional dengan custom domain!**
