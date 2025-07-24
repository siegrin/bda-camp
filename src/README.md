
<div align="center">
  <img src="https://raw.githubusercontent.com/user-attachments/assets/51351111-939a-471a-a1e4-3c82e6d9b324" alt="BDA.Camp Logo" width="120">
  <h1 align="center">BDA.Camp - Aplikasi Penyewaan Peralatan Kemah</h1>
  <p align="center">
    Aplikasi web modern yang dibangun dengan <strong>Next.js</strong>. Proyek ini berfungsi sebagai contoh penerapan praktik terbaik dalam pengembangan web, termasuk penggunaan <strong>React Server Components</strong>, <strong>Server Actions</strong>, integrasi backend dengan <strong>Supabase</strong>, dan fitur AI yang didukung oleh <strong>Google Genkit</strong>.
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
    -   Manajemen Produk, Kategori & Subkategori (CRUD).
    -   Manajemen Pengguna (Melihat dan menghapus).
    -   Manajemen Penyewaan (Melacak status pesanan).
    -   Log Aktivitas & Backup Data.
-   **Chatbot AI**: Asisten virtual yang didukung Genkit untuk membantu pengguna menemukan produk dan menjawab pertanyaan.
-   **Pembaruan Real-time**: Dasbor admin menggunakan Supabase Realtime untuk memperbarui data secara langsung tanpa perlu me-refresh halaman.

---

## Panduan Instalasi Lokal

Ikuti langkah-langkah ini untuk menjalankan proyek di lingkungan pengembangan lokal Anda.

### Prasyarat

-   Node.js (v18 atau lebih baru)
-   **pnpm** (dianjurkan), npm, atau yarn
-   Akun Supabase
-   Akun Google Cloud (untuk API Key Gemini)

### 1. Clone Repositori

```bash
git clone https://github.com/mhmdfauzi/bda-camp.git
cd bda-camp
```

### 2. Instal Dependensi

Direkomendasikan menggunakan `pnpm` untuk manajemen paket yang efisien.

```bash
pnpm install
```

### 3. Konfigurasi Environment Variables

Buat file baru bernama `.env.local` di root proyek Anda dan isi dengan variabel berikut.

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

**Peringatan:** Jangan pernah membagikan atau mengunggah file `.env.local` Anda ke repositori publik.

### 4. Setup Database Supabase

Proyek ini memerlukan skema database tertentu. Buka **SQL Editor** di dasbor Supabase Anda dan jalankan skrip SQL dari file `supabase_setup.sql` yang ada di repositori ini.

### 5. Jalankan Server Pengembangan

```bash
pnpm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda untuk melihat hasilnya.

---

## Panduan Deployment ke Vercel

Proyek ini dioptimalkan untuk deployment yang mudah dan cepat ke Vercel.

### 1. Impor Proyek ke Vercel

Impor repositori GitHub Anda ke Vercel. Vercel akan otomatis mendeteksi bahwa ini adalah proyek Next.js dan mengonfigurasi buildnya.

### 2. Konfigurasi Environment Variables di Vercel

Di halaman **"Configure Project"** di Vercel, buka bagian **"Environment Variables"** dan tambahkan semua variabel yang ada di file `.env.local` Anda.

-   `NEXT_PUBLIC_SUPABASE_URL`
-   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
-   `SUPABASE_SERVICE_ROLE_KEY`
-   `GEMINI_API_KEY`

Setelah semua variabel ditambahkan, klik tombol **"Deploy"**.

### 3. Konfigurasi URL di Supabase

Setelah deployment pertama selesai, Vercel akan memberikan Anda URL produksi. Anda perlu memberitahu Supabase tentang URL ini.

1.  Buka dasbor **Supabase** Anda > **Authentication** > **URL Configuration**.
2.  Di kolom **"Site URL"**, masukkan URL produksi dari Vercel Anda (misal: `https://nama-proyek-anda.vercel.app`).
3.  Di bagian **"Redirect URLs"**, tambahkan URL berikut:
    ```
    https://nama-proyek-anda.vercel.app/api/auth/callback
    ```
4.  Klik **"Save"**.

---
## Mengaktifkan Login dengan Google (OAuth)

Untuk membuat tombol "Masuk dengan Google" berfungsi dengan baik dan menampilkan nama aplikasi Anda (bukan URL Supabase), ikuti panduan berikut dengan teliti.

**Langkah 1: Dapatkan URL Callback dari Supabase**
1.  Buka Dasbor Supabase Anda.
2.  Navigasi ke menu **Authentication** -> **Providers**.
3.  Klik provider **Google**.
4.  Di bawah kolom Client ID, Anda akan menemukan **Redirect URL (Callback URL)**. Salin URL ini. (Contoh: `https://<ID-PROYEK-ANDA>.supabase.co/auth/v1/callback`).

**Langkah 2: Konfigurasi Kredensial di Google Cloud Console**
1.  Buka [Google Cloud Console](https://console.cloud.google.com/) dan masuk.
2.  Buat proyek baru atau pilih yang sudah ada.
3.  Di menu navigasi, buka **APIs & Services** -> **Credentials**.
4.  Klik **+ CREATE CREDENTIALS** dan pilih **OAuth client ID**.
5.  Jika diminta, konfigurasikan **OAuth consent screen** terlebih dahulu. Ini adalah langkah paling penting.
    -   Pilih tipe **External** dan klik **Create**.
    -   **App name**: Masukkan nama aplikasi Anda (misal: "BDA.Camp"). Ini yang akan dilihat pengguna.
    -   **User support email**: Pilih alamat email Anda.
    -   **App logo**: Unggah logo aplikasi Anda.
    -   **Authorized domains**: Klik **+ ADD DOMAIN** dan tambahkan domain **Vercel** Anda (contoh: `vercel.app` jika URL Anda `nama-proyek-anda.vercel.app`) dan `supabase.co`.
    -   Isi email kontak developer. Klik **SAVE AND CONTINUE**.
    -   Lewati bagian *Scopes* dan *Test users*. Klik **SAVE AND CONTINUE**.
    -   Kembali ke *Dashboard* dan klik **PUBLISH APP** untuk membuat layar persetujuan Anda publik.
6.  Kembali ke **APIs & Services** -> **Credentials** untuk melanjutkan pembuatan Client ID:
    -   **Application type**: Pilih **Web application**.
    -   **Authorized JavaScript origins**: Klik **+ ADD URI** dan masukkan URL Vercel aplikasi Anda (contoh: `https://nama-proyek-anda.vercel.app`).
    -   **Authorized redirect URIs**: Klik **+ ADD URI** dan tempel URL Callback yang sudah Anda salin dari Supabase.
7.  Klik **Create**.
8.  Sebuah pop-up akan muncul. **Salin "Your Client ID" dan "Your Client Secret"**.

**Langkah 3: Simpan Kredensial di Supabase**
1.  Kembali ke halaman provider Google di dasbor Supabase Anda.
2.  Pastikan toggle **Enabled** dalam keadaan aktif.
3.  Tempelkan **Client ID** yang sudah disalin ke kolom Client ID.
4.  Tempelkan **Client Secret** yang sudah disalin ke kolom Client Secret.
5.  Klik **Save**.

Setelah semua langkah ini selesai, fitur login dengan Google di aplikasi Vercel Anda akan berfungsi dan menampilkan nama aplikasi Anda dengan benar.

    