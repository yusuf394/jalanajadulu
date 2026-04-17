# jalanajadulu
# Jalanajadulu.com  Aplikasi manajemen waktu dan produktivitas dengan desain hangat dan manusiawi.
# Jalanajadulu.com

Aplikasi manajemen waktu dan produktivitas dengan desain hangat dan manusiawi.

## Struktur File

```
jalanajadulu/
├── index.html     — Halaman utama
├── style.css      — Semua styling (warm sand + terracotta + sage palette)
├── app.js         — Logika aplikasi + Jule AI
└── README.md      — Panduan ini
```

## Cara Menjalankan

1. Buka folder di VS Code
2. Klik kanan `index.html` → **Open with Live Server**
   (Install ekstensi Live Server di VS Code jika belum ada)
3. Browser akan terbuka otomatis

Atau cukup double-click `index.html` untuk membukanya langsung di browser.

---

## Mengaktifkan Jule AI

Tanpa API key, Jule tetap berjalan dalam **Demo Mode** dengan respons bawaan.

Untuk mengaktifkan AI penuh:

1. Daftar di https://console.anthropic.com
2. Buat API key baru
3. Buka `app.js`, cari baris:
   ```js
   const ANTHROPIC_API_KEY = 'YOUR_ANTHROPIC_API_KEY_HERE';
   ```
4. Ganti dengan API key kamu
5. Simpan dan refresh browser

---

## Fitur

- **Dashboard** — Jam live, motivasi harian, statistik, catatan dan tugas cepat
- **Catatan Harian** — Tulis catatan dengan mood, kategori, pencarian dan filter
- **List Kegiatan** — Manajemen tugas dengan prioritas, deadline, dan progress bar
- **Pomodoro Timer** — Timer visual dengan animasi ring, tiga mode, dan notifikasi suara
- **Jule AI** — Asisten AI empatik untuk curhat, motivasi, dan tips produktivitas

## Desain

Palette warna: sand (krem), terracotta (merah-hangat), sage (hijau damai)
Font: DM Serif Display + Plus Jakarta Sans + Syne
Tanpa emoji — ekspresi melalui SVG faces, tipografi, dan warna
