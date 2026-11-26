# RenalCare

**RenalCare** adalah aplikasi web pemantau kesehatan ginjal untuk pasien penyakit ginjal kronis (CKD / PGK) dewasa dan pemulihan pasca-AKI (*Acute Kidney Injury*). Aplikasi ini membantu pengguna mencatat hasil laboratorium, menghitung perkiraan eGFR (CKD-EPI 2021) dan kategori stage G/A, memantau tren melalui grafik, mencatat tekanan darah, mengelola agenda kontrol/lab/obat, membaca materi edukasi terkurasi, serta mengakses panduan Tanda Bahaya secara cepat.

> **Disclaimer Medis:** RenalCare adalah alat pemantau mandiri dan edukasi, **bukan** alat diagnosis medis, **bukan** pengganti dokter, dan **bukan** layanan gawat darurat. Materi klinis dan dokumen ketentuan di repositori ini masih bertanda tinjauan tenaga kesehatan/hukum sebelum rilis publik penuh.

---

## Stack Teknologi

- **Framework:** Next.js `16.4.6` (App Router, Turbopack, Cache Components) & React `19.3.0`
- **Bahasa:** TypeScript `5`
- **Styling & Ikon:** Tailwind CSS `4.3.3` + custom design tokens (`src/app/globals.css`), Lucide React
- **Grafik:** Recharts `3.11.1` (`TrendChart` dengan zona referensi stage G1–G5)
- **Form & Validasi:** React Hook Form + Zod
- **Backend, Auth & Database:** Supabase (`@supabase/ssr`, `@supabase/supabase-js`) dengan PostgreSQL & Row Level Security (RLS)
- **Testing:** Vitest `5.1.1` + `jsdom`

---

## Rute & Fitur Utama

| Rute | Akses | Fungsi |
|---|---|---|
| `/` | Login + Onboarding | Beranda ringkasan eGFR terbaru, banner perubahan klinis, agenda terdekat, tekanan darah terakhir |
| `/lab` | Login + Onboarding | Pencatatan & riwayat lab, konversi satuan otomatis, kalkulator eGFR, filter periode, grafik tren Recharts |
| `/tekanan-darah` | Login + Onboarding | Jurnal sistolik/diastolik/nadi, rata-rata 7 & 30 hari, target dokter, panduan pengukuran |
| `/agenda` | Login + Onboarding | CRUD pengingat kontrol/lab/obat (Akan Datang, Selesai, Terlewat) + saran interval lab |
| `/edukasi` & `/edukasi/[slug]` | Login + Onboarding | Artikel edukasi dari tabel `articles` Supabase, pencarian (`?q=`), filter (`?kategori=`), lencana status tinjauan |
| `/profil` | Login + Onboarding | Ringkasan profil, ekspor CSV data lab & tekanan darah, konfirmasi 2 langkah hapus akun permanen |
| `/tanda-bahaya` | **Publik (tanpa login)** | Panduan gejala gawat darurat & tombol panggil cepat `tel:119` |
| `/privasi` & `/syarat` | **Publik (tanpa login)** | Draf Kebijakan Privasi dan Syarat & Ketentuan (`DRAF – perlu ditinjau`) |
| `/login`, `/daftar`, `/onboarding` | Autentikasi | Masuk, daftar dengan persetujuan data + verifikasi email, dan pengisian profil awal |

---

## Variabel Environment

Salin `.env.example` menjadi `.env.local` untuk pengembangan lokal, lalu isi variabel berikut:

| Nama Variabel | Wajib | Sifat | Keterangan |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Ya | Publik (Client & Server) | Project URL dari **Supabase Dashboard → Project Settings → API** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Ya | Publik (Client & Server) | `anon` / publishable key dari Supabase Dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Ya (untuk hapus akun & uji RLS) | **Rahasia (Server-only)** | `service_role` / secret key dari **Supabase Dashboard → Project Settings → API Keys**. **JANGAN** beri awalan `NEXT_PUBLIC_` dan **JANGAN** commit ke Git |

---

## Cara Menjalankan Lokal

1. **Pasang dependensi:**
   ```bash
   npm install
   ```
2. **Siapkan environment lokal:**
   ```bash
   cp .env.example .env.local
   ```
   *(Di PowerShell Windows: `Copy-Item .env.example .env.local`)* lalu lengkapi ketiga variabel di `.env.local`.
3. **Jalankan migrasi & seed Supabase** *(lihat bagian berikutnya)*.
4. **Jalankan server development:**
   ```bash
   npm run dev
   ```
5. Buka `http://localhost:3000` di browser.

---

## Cara Menjalankan Migrasi & Seed Supabase

Jalankan file SQL secara **berurutan** melalui **Supabase Dashboard → SQL Editor → New query**:

1. **Migrasi 0001 (Skema inti, RLS, dan trigger profil):**
   - Jalankan seluruh isi [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).
   - Membuat tabel `profiles`, `lab_results`, `bp_logs`, `reminders`, `articles`, indeks, kebijakan RLS per `auth.uid()`, serta trigger pembuatan profil otomatis saat user mendaftar.
2. **Migrasi 0002 (Status tinjauan & metadata artikel):**
   - Jalankan seluruh isi [`supabase/migrations/0002_articles_review.sql`](supabase/migrations/0002_articles_review.sql).
   - Menambahkan kolom `review_status`, `source_org`, dan `language` pada `public.articles`.
3. **Seed Artikel Edukasi (Opsional / disarankan untuk data awal):**
   - Jalankan seluruh isi [`supabase/seed/articles.sql`](supabase/seed/articles.sql).
   - Bersifat idempoten (`ON CONFLICT (slug) DO UPDATE`) sehingga aman dijalankan ulang.

---

## Cara Menjalankan Test & Verifikasi

- **Unit test (semua environment):**
  ```bash
  npm test
  ```
  *(Pada Windows bila worker fork lambat/timeout, jalankan dengan pool threads:)*
  ```bash
  npx vitest run --pool=threads
  ```
- **Lint & Typecheck:**
  ```bash
  npm run lint
  npm run typecheck
  ```
- **Build produksi lokal:**
  ```bash
  npm run build
  npm start
  ```
- **Uji RLS 2 akun langsung ke Supabase:**
  ```bash
  node --env-file=.env.local scripts/verify-rls.mjs
  ```
  Skrip ini membuat 2 akun uji sementara (User A dan User B), membuktikan isolasi `SELECT`/`INSERT`/`UPDATE`/`DELETE` di `profiles`, `lab_results`, `bp_logs`, dan `reminders`, lalu otomatis menghapus kedua akun uji tersebut.

---

## Persiapan Deploy ke Vercel

1. Push repositori ke GitHub (pastikan `.env.local` tidak ter-commit).
2. Import repositori di Vercel dan isi Environment Variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
3. Setelah domain produksi Vercel aktif (misalnya `https://nama-app.vercel.app`), buka **Supabase Dashboard → Authentication → URL Configuration**, perbarui **Site URL** ke URL produksi tersebut, dan tambahkan URL produksi + `/**` ke daftar **Redirect URLs**.
