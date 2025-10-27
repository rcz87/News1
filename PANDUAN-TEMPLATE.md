# 📝 Panduan Menggunakan Template Artikel

## 📋 Daftar Template yang Tersedia:

1. **TEMPLATE-ARTIKEL.md** - Template umum untuk artikel panjang
2. **TEMPLATE-BERITA-SINGKAT.md** - Untuk berita breaking news singkat
3. **TEMPLATE-ARTIKEL-OLAHRAGA.md** - Khusus artikel pertandingan/event olahraga
4. **TEMPLATE-ARTIKEL-TEKNOLOGI.md** - Review gadget/teknologi
5. **TEMPLATE-ARTIKEL-EKONOMI.md** - Berita ekonomi/bisnis
6. **TEMPLATE-ARTIKEL-LIFESTYLE.md** - Tips dan trend lifestyle

---

## 🚀 Cara Menggunakan Template:

### Langkah 1: Pilih Template

Pilih template sesuai jenis artikel yang akan Anda tulis.

### Langkah 2: Copy Template

```bash
# Contoh: Membuat artikel olahraga untuk channel Voli Info
copy TEMPLATE-ARTIKEL-OLAHRAGA.md content\voliinfo\final-voli-jakarta-vs-bandung.md
```

Atau manual:
1. Buka file template
2. Copy semua isi
3. Buat file baru di folder channel: `content/{nama-channel}/nama-artikel.md`
4. Paste isi template

### Langkah 3: Edit Konten

1. Ganti semua bagian yang ada "XXX" atau placeholder
2. Isi frontmatter (title, excerpt, author, dll)
3. Tulis konten artikel
4. Hapus catatan/komentar jika ada

### Langkah 4: Save

Save file, artikel otomatis muncul di website!

---

## 📝 Contoh Penggunaan:

### Contoh 1: Artikel Olahraga untuk Voli Info

**File:** `content/voliinfo/final-voli-jakarta-vs-bandung.md`

```markdown
---
title: "Final Dramatis: Jakarta Kalahkan Bandung 3-2"
excerpt: "Pertandingan final liga voli putra berakhir dramatis dengan kemenangan Jakarta 3-2 atas Bandung"
author: "Tim Voli Info"
publishedAt: "2025-10-27T20:00:00Z"
category: "Olahraga"
tags: ["voli", "final", "jakarta", "bandung", "liga"]
featured: true
image: "https://images.unsplash.com/photo-volleyball-match"
imageAlt: "Final voli Jakarta vs Bandung"
---

# Final Dramatis: Jakarta Kalahkan Bandung 3-2

**GBK Arena, 27 Oktober 2025** - Tim Jakarta berhasil meraih gelar juara liga voli putra 2025...

(dan seterusnya...)
```

### Contoh 2: Berita Singkat untuk Berita Laut

**File:** `content/beritalaut/kapal-tangkap-ikan-ilegal.md`

```markdown
---
title: "KKP Tangkap 5 Kapal Ikan Ilegal di Natuna"
excerpt: "Kementerian Kelautan tangkap 5 kapal asing yang melakukan penangkapan ikan ilegal"
author: "Redaksi Berita Laut"
publishedAt: "2025-10-27T09:00:00Z"
category: "Politik"
tags: ["kkp", "ilegal fishing", "natuna", "maritim"]
featured: true
image: "https://images.unsplash.com/photo-fishing-boat"
imageAlt: "Kapal nelayan"
---

# KKP Tangkap 5 Kapal Ikan Ilegal

**Jakarta, 27 Oktober** - Kementerian Kelautan dan Perikanan (KKP) berhasil menangkap...
```

### Contoh 3: Artikel Teknologi untuk Dendeles Info

**File:** `content/dendelesinfo/review-smartphone-terbaru.md`

```markdown
---
title: "Review: Smartphone X Pro - Kamera 200MP dengan Harga Terjangkau"
excerpt: "Smartphone X Pro hadir dengan kamera 200MP dan chipset flagship namun harga masih ramah kantong"
author: "Tech Reviewer"
publishedAt: "2025-10-27T14:00:00Z"
category: "Teknologi"
tags: ["smartphone", "review", "gadget", "teknologi"]
featured: true
image: "https://images.unsplash.com/photo-smartphone"
imageAlt: "Smartphone X Pro"
---

# Review: Smartphone X Pro

Smartphone X Pro adalah produk terbaru yang menawarkan...
```

---

## ✅ Checklist Sebelum Publish:

- [ ] Nama file menggunakan huruf kecil dan dash (-)
- [ ] Title menarik dan deskriptif
- [ ] Excerpt maksimal 2 kalimat
- [ ] Author sudah diisi
- [ ] Tanggal publishedAt format benar (YYYY-MM-DDTHH:MM:SSZ)
- [ ] Category dipilih (Politik/Ekonomi/Olahraga/Teknologi/Lifestyle)
- [ ] Tags relevan (3-5 tags)
- [ ] Image URL valid dan gambar menarik
- [ ] ImageAlt sudah diisi untuk SEO
- [ ] Konten artikel lengkap dan tidak ada placeholder
- [ ] Hapus semua komentar/catatan
- [ ] File sudah di-save

---

## 🎨 Tips Menulis Artikel yang Menarik:

### 1. Judul (Title)
- Maksimal 60 karakter untuk SEO
- Gunakan angka jika memungkinkan ("5 Tips...", "10 Cara...")
- Buat penasaran tapi tidak clickbait

### 2. Excerpt
- 1-2 kalimat saja
- Jelaskan inti artikel
- Menarik pembaca untuk klik

### 3. Lead Paragraph
- Jawab 5W+1H di paragraf pertama
- Langsung to the point
- Menarik perhatian

### 4. Body
- Gunakan sub-heading untuk struktur
- Paragraf pendek (3-4 kalimat)
- Gunakan bullet points untuk list
- Tambahkan quote jika ada narasumber

### 5. Gambar
- Pilih gambar berkualitas tinggi
- Relevan dengan konten
- Sumber: Unsplash, Pexels (gratis)

---

## 📸 Sumber Gambar Gratis:

1. **Unsplash** - https://unsplash.com
   - Kualitas terbaik
   - Gratis commercial use
   - Tidak perlu credit

2. **Pexels** - https://pexels.com
   - Banyak pilihan
   - Video juga tersedia
   - Gratis commercial use

3. **Pixabay** - https://pixabay.com
   - Gambar dan ilustrasi
   - Gratis commercial use

**Cara pakai:**
1. Cari kata kunci di website
2. Pilih gambar
3. Klik kanan → Copy image address
4. Paste di field `image:`

---

## ⚡ Quick Commands:

```bash
# Lihat template yang ada
dir TEMPLATE-*.md

# Copy template ke folder channel
copy TEMPLATE-ARTIKEL.md content\ambal\artikel-baru.md

# Edit dengan VSCode
code content\ambal\artikel-baru.md

# Lihat artikel di channel
dir content\ambal
```

---

## 🎯 Best Practices:

1. **Konsisten dengan Style Channel**
   - Sesuaikan tone dengan karakteristik channel
   - Ambal News = formal, Berita Angin = casual

2. **SEO Friendly**
   - Gunakan keywords di title dan excerpt
   - Alt text untuk gambar
   - Tags yang relevan

3. **Mobile Friendly**
   - Paragraf pendek
   - Sub-heading jelas
   - Image tidak terlalu besar

4. **Update Regular**
   - Minimal 1 artikel baru per minggu per channel
   - Update artikel lama jika ada info baru

5. **Quality over Quantity**
   - Lebih baik 1 artikel berkualitas
   - Daripada 10 artikel asal-asalan

---

## ❓ FAQ:

**Q: Apakah harus pakai template?**
A: Tidak wajib, tapi template membantu konsistensi struktur artikel.

**Q: Bisa modifikasi template?**
A: Bisa! Template hanya panduan, sesuaikan dengan kebutuhan.

**Q: Artikel langsung muncul setelah save?**
A: Ya! Hot reload aktif, tidak perlu restart server.

**Q: Bisa pakai gambar dari Google?**
A: Hati-hati copyright! Lebih aman pakai Unsplash/Pexels.

**Q: Maksimal berapa artikel per channel?**
A: Unlimited! Tidak ada batasan.

---

## 📞 Butuh Bantuan?

Jika ada pertanyaan atau butuh template khusus, silakan kontak admin atau buat issue di repository.

---

**Happy Writing! 📝✨**
