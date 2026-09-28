# PANDUAN LENGKAP: DATABASE ONLINE SUPABASE & DEPLOY KE VERCEL VIA GITHUB
Aplikasi Sistem Pendaftaran & Pelacakan Sambungan Baru — PT Aetra Air Tangerang

Dokumen ini memandu Anda langkah demi langkah untuk menghubungkan aplikasi ini ke **database online PostgreSQL Supabase** dan mendeploynya ke **Vercel** secara otomatis menggunakan repositori **GitHub**.

---

## 📋 DAFTAR ISI
1. [Langkah 1: Membuat Database di Supabase](#langkah-1-membuat-database-di-supabase)
2. [Langkah 2: Menjalankan SQL Schema](#langkah-2-menjalankan-sql-schema)
3. [Langkah 3: Mengambil URL & Anon Key Supabase](#langkah-3-mengambil-url--anon-key-supabase)
4. [Langkah 4: Push Kode ke GitHub](#langkah-4-push-kode-ke-github)
5. [Langkah 5: Deploy ke Vercel](#langkah-5-deploy-ke-vercel)
6. [Langkah 6: Uji Coba Aplikasi Online](#langkah-6-uji-coba-aplikasi-online)

---

## 1. LANGKAH 1: MEMBUAT DATABASE DI SUPABASE
1. Buka [https://supabase.com](https://supabase.com) dan login/daftar akun (bisa langsung pakai akun GitHub Anda).
2. Klik tombol **"New Project"**.
3. Isi informasi project:
   - **Name**: `aetra-tangerang-app` (atau nama pilihan Anda)
   - **Database Password**: Buat password yang kuat dan simpan.
   - **Region**: Pilih **Southeast Asia (Singapore)** untuk kecepatan latency tercepat di Indonesia.
4. Klik **"Create new project"** dan tunggu sekitar 1-2 menit hingga proses inisialisasi selesai.

---

## 2. LANGKAH 2: MENJALANKAN SQL SCHEMA
Aplikasi ini sudah dilengkapi dengan skrip skema tabel lengkap (`supabase/schema.sql` dan `supabase_schema.sql`).

1. Di Dashboard Supabase project Anda, buka menu **"SQL Editor"** (ikon terminal `>_` di bilah kiri).
2. Klik **"New query"**.
3. Buka file `supabase/schema.sql` pada proyek ini, salin seluruh isinya, lalu tempel (*paste*) ke dalam SQL Editor Supabase.
4. Klik tombol **"Run"** (atau tekan `Ctrl + Enter` / `Cmd + Enter`).
5. Periksa pemberitahuan di bawah: pastikan muncul pesan **"Success. No rows returned"**.
6. Buka menu **"Table Editor"** di bilah kiri, Anda akan melihat 4 tabel telah terbuat otomatis:
   - `user_accounts` (Akun pengguna admin & pelanggan)
   - `registrations` (Data lengkap permohonan pendaftaran sambungan)
   - `tracking_records` (Data pelacakan progres 4 tahapan & timeline)
   - `surveys` (Hasil survey kepuasan pelanggan 18 pertanyaan)

---

## 3. LANGKAH 3: MENGAMBIL URL & ANON KEY SUPABASE
1. Di Dashboard Supabase, klik ikon **"Project Settings"** (ikon gerigi di bilah kiri bawah).
2. Pilih tab menu **"API"**.
3. Salin dua nilai berikut:
   - **Project URL**: contoh `https://abcdefghijklm.supabase.co`
   - **anon / public key**: deretan karakter panjang di bagian *Project API keys* bertanda `anon` `public`.

Simpan kedua nilai ini karena akan dimasukkan ke dalam **Environment Variables di Vercel**.

---

## 4. LANGKAH 4: PUSH KODE KE GITHUB
1. Buka [https://github.com](https://github.com) dan buat repository baru (contoh: `aetra-tangerang-web`).
2. Di terminal komputer Anda pada folder proyek ini, jalankan perintah git berikut:
   ```bash
   git init
   git add .
   git commit -m "feat: integrasi database Supabase dan konfigurasi Vercel"
   git branch -M main
   git remote add origin https://github.com/USERNAME-ANDA/aetra-tangerang-web.git
   git push -u origin main
   ```

*(Pastikan file `.env` yang berisi kredensial asli tidak di-push ke publik; file `.env.example` sudah disiapkan dengan aman).*

---

## 5. LANGKAH 5: DEPLOY KE VERCEL
1. Buka [https://vercel.com](https://vercel.com) dan login menggunakan akun GitHub Anda.
2. Klik **"Add New..."** -> **"Project"**.
3. Cari repository GitHub yang baru saja Anda push (`aetra-tangerang-web`) lalu klik **"Import"**.
4. Konfigurasi Project di Vercel:
   - **Framework Preset**: `Vite` (otomatis terdeteksi berkat file `vercel.json`).
   - **Root Directory**: `./` (default).
   - **Build Command**: `vite build` (atau biarkan default `npm run build`).
   - **Output Directory**: `dist` (default).
5. Buka bagian **"Environment Variables"** dan tambahkan 2 variabel dari Langkah 3:
   - **Key 1**: `VITE_SUPABASE_URL`
     - **Value**: Masukkan URL project Supabase Anda (misal: `https://xxxx.supabase.co`)
   - **Key 2**: `VITE_SUPABASE_ANON_KEY`
     - **Value**: Masukkan anon public key dari Supabase Anda.
6. Klik tombol **"Deploy"**.
7. Tunggu sekitar 1 menit hingga Vercel selesai melakukan build dan menerbitkan URL live aplikasi Anda (contoh: `https://aetra-tangerang-web.vercel.app`)! 🎉

---

## 6. LANGKAH 6: UJI COBA APLIKASI ONLINE
Setelah deploy selesai:
1. Buka URL Vercel aplikasi Anda.
2. Login sebagai Admin:
   - **Username / Email**: `admin@aetra.co.id`
   - **Kata Sandi**: `admin`
3. Coba isi formulir pendaftaran sambungan baru di tab **Pendaftaran Sambungan Baru**.
4. Cek langsung ke **Supabase Table Editor** -> tabel `registrations` & `tracking_records`: data akan tersimpan langsung di database online PostgreSQL Supabase secara realtime!
5. Data juga akan tetap tersimpan secara aman di cloud bahkan jika pengguna membersihkan cache browser.

---

### File Pendukung dalam Repository:
- `vercel.json` : Konfigurasi routing rewrite SPA untuk Vercel.
- `supabase/schema.sql` : Skrip SQL DDL & RLS lengkap untuk Supabase.
- `src/lib/supabase.ts` : Inisialisasi client Supabase dengan handling fallback otomatis.
- `src/services/supabaseService.ts` : Service CRUD sync data pendaftaran, tracking, dan survey.
- `.env.example` : Template environment variable untuk Vercel.
