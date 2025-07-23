
<div align="center">
  <img src="https://oezlpjdnmogmnjiqxtbo.supabase.co/storage/v1/object/public/site-assets/1753230066484-logo.png" alt="BDA.Camp Logo" width="120">
  <h1 align="center">BDA.Camp - Aplikasi Penyewaan Peralatan Kemah</h1>
  <p align="center">
    Sebuah aplikasi web modern yang dibangun dengan <strong>Next.js</strong>. Proyek ini berfungsi sebagai contoh penerapan praktik terbaik dalam pengembangan web, termasuk penggunaan <strong>React Server Components</strong>, <strong>Server Actions</strong>, integrasi backend dengan <strong>Supabase</strong>, dan fitur AI yang didukung oleh <strong>Google Genkit</strong>.
  </p>
  <p align="center">
    <a href="https://bdacamp.vercel.app/" target="_blank"><strong>Lihat Demo Live &rarr;</strong></a>
  </p>
</div>

---

## Tumpukan Teknologi

Aplikasi ini dibangun menggunakan serangkaian teknologi modern untuk memastikan performa, skalabilitas, dan pengalaman pengembang yang luar biasa.

-   **Framework**: **Next.js 15** (App Router)
-   **Bahasa**: **TypeScript**
-   **Styling**: **Tailwind CSS**
-   **Komponen UI**: **ShadCN UI**
-   **Backend & Database**: **Supabase** (Auth, PostgreSQL Database, Storage)
-   **Fitur AI**: **Google Genkit** dengan model Gemini
-   **Deployment**: **Vercel**

---

## Fitur Utama

-   **Katalog Produk**: Menampilkan daftar peralatan kemah yang tersedia untuk disewa, lengkap dengan gambar, harga, stok, filter, dan fitur pencarian.
-   **Halaman Detail Produk**: Halaman khusus untuk setiap produk dengan galeri gambar, spesifikasi teknis, dan kalender untuk pemilihan tanggal sewa.
-   **Otentikasi Pengguna**: Sistem login dan registrasi menggunakan Supabase Auth, termasuk login dengan Email/Kata Sandi dan Google OAuth.
-   **Manajemen Profil**: Pengguna dapat memperbarui profil mereka, termasuk nama, username, dan foto profil.
-   **Keranjang Belanja**: Fungsionalitas keranjang untuk menampung item yang akan disewa, dengan kemampuan mengubah jumlah dan durasi sewa.
-   **Alur Checkout**: Proses checkout yang mengarahkan pengguna ke WhatsApp admin untuk konfirmasi pesanan.
-   **Dashboard Admin**: Panel administratif terpisah dan aman untuk:
    -   **Manajemen Produk**: CRUD (Create, Read, Update, Delete) untuk produk.
    -   **Manajemen Kategori & Subkategori**: Pengelolaan taksonomi produk.
    -   **Manajemen Pengguna**: Melihat dan menghapus pengguna.
    -   **Manajemen Penyewaan**: Melacak dan mengubah status pesanan (pending, active, completed).
    -   **Log Aktivitas & Backup**: Memantau aktivitas sistem dan membuat backup data.
-   **Chatbot AI**: Asisten virtual yang didukung Genkit untuk membantu pengguna menemukan produk dan menjawab pertanyaan secara dinamis.
-   **Pembaruan Real-time**: Dasbor admin menggunakan Supabase Realtime untuk memperbarui data secara langsung tanpa perlu me-refresh halaman.

---

## Panduan Instalasi Lokal

Ikuti langkah-langkah ini untuk menjalankan proyek di lingkungan pengembangan lokal Anda.

### Prasyarat

-   Node.js (v18 atau lebih baru)
-   pnpm (dianjurkan), npm, atau yarn
-   Akun Supabase (untuk database dan otentikasi)
-   Akun Google Cloud (untuk API Key Gemini)

### 1. Clone Repositori

Salin repositori ini ke mesin lokal Anda:

```bash
git clone https://github.com/NAMA_PENGGUNA/NAMA_REPOSITORI.git
cd NAMA_REPOSITORI
```

### 2. Instal Dependensi

Instal semua paket yang diperlukan (disarankan menggunakan `pnpm`):

```bash
pnpm install
```

### 3. Konfigurasi Environment Variables

Ini adalah langkah paling penting. Buat file baru bernama `.env.local` di root proyek Anda dan isi dengan variabel berikut:

```env
# Variabel Supabase (Wajib)
# Ambil dari Dasbor Supabase > Project Settings > API
NEXT_PUBLIC_SUPABASE_URL="URL_PROYEK_SUPABASE_ANDA"
NEXT_PUBLIC_SUPABASE_ANON_KEY="KUNCI_ANON_PUBLIK_SUPABASE_ANDA"
SUPABASE_SERVICE_ROLE_KEY="KUNCI_SERVICE_ROLE_RAHASIA_ANDA"

# Variabel Google AI - Genkit (Wajib untuk fitur AI)
# Ambil dari Google AI Studio atau Google Cloud Console
GEMINI_API_KEY="API_KEY_GEMINI_ANDA"
```

**Peringatan:** Jangan pernah membagikan atau mengunggah file `.env.local` Anda ke GitHub. File `.gitignore` sudah dikonfigurasi untuk mengabaikannya.

### 4. Setup Database Supabase

Proyek ini memerlukan skema database tertentu. Buka **SQL Editor** di dasbor Supabase Anda dan jalankan skrip SQL dari tautan berikut untuk membuat semua tabel dan fungsi yang diperlukan:
[**Buka Skrip SQL Setup**](https://github.com/mhmdfauzi/bda-camp/blob/main/supabase_setup.sql)

### 5. Jalankan Server Pengembangan

Setelah konfigurasi selesai, jalankan aplikasi:

```bash
pnpm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda untuk melihat hasilnya.

---

## Panduan Deployment ke Vercel

Proyek ini dioptimalkan untuk deployment yang mudah dan cepat ke Vercel.

### Langkah 1: Unggah Kode ke GitHub

Pastikan kode Anda sudah diunggah ke repositori GitHub.

### Langkah 2: Buat Proyek Baru di Vercel

1.  Buka **Dashboard Vercel** Anda.
2.  Klik **"Add New..."** lalu pilih **"Project"**.
3.  Impor repositori GitHub Anda. Vercel akan otomatis mendeteksi bahwa ini adalah proyek Next.js.

### Langkah 3: Konfigurasi Environment Variables di Vercel

Di halaman **"Configure Project"** di Vercel, buka bagian **"Environment Variables"** dan tambahkan semua variabel yang ada di file `.env.local` Anda.

-   `NEXT_PUBLIC_SUPABASE_URL`
-   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
-   `SUPABASE_SERVICE_ROLE_KEY` (Pastikan kunci ini **tidak** diekspos ke browser)
-   `GEMINI_API_KEY`

Setelah semua variabel ditambahkan, klik tombol **"Deploy"**.

### Langkah 4: Konfigurasi URL di Supabase

Setelah deployment pertama selesai, Vercel akan memberikan Anda URL produksi (misalnya, `https://nama-proyek-anda.vercel.app`). Anda perlu memberitahu Supabase tentang URL ini.

1.  Kembali ke dasbor **Supabase** Anda.
2.  Buka **Authentication** > **URL Configuration**.
3.  Di kolom **"Site URL"**, masukkan URL produksi dari Vercel Anda.
4.  Di bagian **"Redirect URLs"**, tambahkan URL berikut (ganti dengan URL Anda):
    ```
    https://nama-proyek-anda.vercel.app/api/auth/callback
    ```
5.  Klik **"Save"**.

### Langkah 5: Mengaktifkan Login dengan Google (OAuth)

Untuk membuat tombol "Masuk dengan Google" berfungsi, ikuti langkah-langkah berikut:

#### Bagian 1: Mendapatkan Kunci dari Google Cloud Console

1.  **Buka Google Cloud Console**: Kunjungi [konsol Google Cloud](https://console.cloud.google.com/) dan masuk.
2.  **Buat Proyek Baru** atau pilih proyek yang sudah ada.
3.  **Konfigurasi OAuth Consent Screen**:
    *   Cari "APIs & Services" > **"OAuth consent screen"**.
    *   Pilih **"External"** dan klik **"Create"**.
    *   Isi kolom yang wajib diisi (App name, User support email, Developer contact).
    *   Klik **"Save and Continue"** hingga selesai.
4.  **Buat OAuth Client ID**:
    *   Buka tab **"Credentials"** > **"+ Create Credentials"** > **"OAuth client ID"**.
    *   **Application type**: Pilih **"Web application"**.
    *   **Authorized JavaScript origins**: Tambahkan URL proyek Supabase Anda (Contoh: `https://xyz.supabase.co`).
    *   **Authorized redirect URIs**: Tambahkan URL callback Supabase (Contoh: `https://xyz.supabase.co/auth/v1/callback`).
    *   Klik **"Create"**.
5.  **Salin Kunci Anda**: Sebuah pop-up akan muncul. **Salin "Your Client ID" dan "Your Client Secret"**.

#### Bagian 2: Memasukkan Kunci ke Supabase

1.  Kembali ke **Dasbor Supabase** > **Authentication** > **Providers**.
2.  Temukan **Google** dalam daftar dan klik untuk membukanya.
3.  Sebuah panel akan muncul dari sisi kanan. Di dalam panel ini:
    *   **Aktifkan toggle "Google"**.
    *   Kolom untuk **Client ID** dan **Client Secret** akan muncul. Tempelkan kunci yang sudah Anda salin dari Google Cloud.
4.  Klik **"Save"**.

---

### Selesai!

Aplikasi Anda sekarang sudah live dan semua fiturnya, termasuk login dengan Google, sudah berfungsi penuh! Setiap kali Anda melakukan `git push` ke branch `main`, Vercel akan secara otomatis memulai deployment baru.
