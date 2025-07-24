
<div align="center">
  <a href="https://bda-camp.vercel.app/" target="_blank">
    <img src="https://raw.githubusercontent.com/user-attachments/assets/51351111-939a-471a-a1e4-3c82e6d9b324" alt="BDA.Camp Logo" width="120">
  </a>
  <h1 align="center">BDA.Camp - Aplikasi Penyewaan Peralatan Kemah</h1>
  <p align="center">
    Aplikasi web modern yang dibangun dengan <strong>Next.js</strong> untuk layanan penyewaan peralatan kemah.
    <br />
    Proyek ini berfungsi sebagai contoh penerapan praktik terbaik dalam pengembangan web modern.
    <br />
    <a href="https://bda-camp.vercel.app/" target="_blank"><strong>Lihat Demo Live &rarr;</strong></a>
  </p>
</div>

<div align="center">

[![License: MIT](https://img.shields.io/github/license/mhmdfauzi/bda-camp?style=flat-square&color=%23F26419)](https://github.com/mhmdfauzi/bda-camp/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/mhmdfauzi/bda-camp?style=flat-square&logo=github&logoColor=white&color=%23F26419)](https://github.com/mhmdfauzi/bda-camp/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/mhmdfauzi/bda-camp?style=flat-square&logo=github&logoColor=white&color=%23F26419)](https://github.com/mhmdfauzi/bda-camp/network/members)
[![GitHub issues](https://img.shields.io/github/issues/mhmdfauzi/bda-camp?style=flat-square&logo=github&logoColor=white&color=%23F26419)](https://github.com/mhmdfauzi/bda-camp/issues)
[![GitHub Last Commit](https://img.shields.io/github/last-commit/mhmdfauzi/bda-camp?style=flat-square&logo=github&logoColor=white&color=%23F26419)](https://github.com/mhmdfauzi/bda-camp/commits/main)
[![Repo Size](https://img.shields.io/github/repo-size/mhmdfauzi/bda-camp?style=flat-square&logo=github&logoColor=white&color=%23F26419)](https://github.com/mhmdfauzi/bda-camp)
[![Top Language](https://img.shields.io/github/languages/top/mhmdfauzi/bda-camp?style=flat-square&color=%23F26419)](https://github.com/mhmdfauzi/bda-camp)

</div>

---

## &#128640; Tumpukan Teknologi

Aplikasi ini dibangun menggunakan serangkaian teknologi modern untuk memastikan performa, skalabilitas, dan pengalaman pengembang yang luar biasa.

| Kategori           | Teknologi                                                                                                                                                                                                                                                             |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Framework**      | ![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)                                                                                                                                                                               |
| **Bahasa**         | ![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=for-the-badge&logo=typescript&logoColor=white)                                                                                                                                                         |
| **Styling**        | ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)                                                                                                                                                   |
| **Komponen UI**    | ![ShadCN UI](https://img.shields.io/badge/ShadCN_UI-000000?style=for-the-badge&logo=shadcn-ui&logoColor=white)                                                                                                                                                            |
| **Backend & DB**   | ![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)                                                                                                                                                              |
| **Fitur AI**       | ![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google-gemini&logoColor=white) (via **Genkit**)                                                                                                                                   |
| **Deployment**     | ![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)                                                                                                                                                                     |

---

## &#127965; Fitur Utama

-   **Katalog Produk Dinamis**: Pencarian, filter, dan paginasi untuk jelajah peralatan.
-   **Otentikasi Lengkap**: Login/Register dengan Email & Google OAuth.
-   **Manajemen Profil Pengguna**: Update nama, username, dan foto profil dengan *image cropper*.
-   **Keranjang Belanja Fungsional**: Validasi stok *real-time* dan pemilihan item.
-   **Alur Checkout WhatsApp**: Konfirmasi pesanan langsung ke admin.
-   **Dashboard Admin Komprehensif**:
    -   Manajemen CRUD untuk Produk, Kategori, dan Subkategori.
    -   Manajemen Pengguna & Penyewaan.
    -   Log Aktivitas, Backup Data, dan Laporan Performa.
    -   Pesanan manual untuk admin.
-   **Fitur AI dengan Genkit**:
    -   **Chatbot Asisten**: Membantu pengguna menemukan produk.
    -   **Saran Tag AI**: Membuat kata kunci pencarian gambar secara otomatis.
-   **Pembaruan Real-time**: Dashboard admin menggunakan Supabase Realtime untuk data yang selalu sinkron.
-   **Tema Gelap & Terang**: Toggle mode yang responsif dan tersimpan.

---

## &#128295; Panduan Instalasi Lokal

Ikuti langkah-langkah ini untuk menjalankan proyek di lingkungan pengembangan lokal Anda.

### Prasyarat

-   Node.js (v18 atau lebih baru)
-   **pnpm** (dianjurkan), npm, atau yarn
-   Akun Supabase & Git
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

Proyek ini memerlukan skema database tertentu. Buka **SQL Editor** di dasbor Supabase Anda dan jalankan skrip SQL dari file `supabase_setup.sql` yang ada di repositori ini. Ini akan membuat semua tabel dan fungsi yang diperlukan.

### 5. Jalankan Server Pengembangan

```bash
pnpm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda untuk melihat hasilnya.

---

## &#128640; Panduan Deployment ke Vercel

Proyek ini dioptimalkan untuk deployment yang mudah dan cepat ke Vercel.

1.  **Impor Proyek ke Vercel**: Hubungkan repositori GitHub Anda ke Vercel. Vercel akan otomatis mendeteksinya sebagai proyek Next.js.
2.  **Konfigurasi Environment Variables**: Di pengaturan proyek Vercel, tambahkan semua variabel yang ada di file `.env.local` Anda.
3.  **Deploy**: Klik tombol **"Deploy"**.
4.  **Konfigurasi URL di Supabase**: Setelah deployment selesai, Vercel akan memberikan URL produksi.
    -   Buka dasbor **Supabase** > **Authentication** > **URL Configuration**.
    -   Di kolom **"Site URL"**, masukkan URL produksi dari Vercel Anda (misal: `https://bda-camp.vercel.app`).
    -   Di bagian **"Redirect URLs"**, tambahkan URL berikut: `https://bda-camp.vercel.app/api/auth/callback`
    -   Klik **"Save"**.

---
## &#128273; Mengaktifkan Login dengan Google (OAuth)

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
5.  **Penting: Konfigurasi OAuth Consent Screen terlebih dahulu.**
    *   Pilih tipe **External** dan klik **Create**.
    *   **App name**: Masukkan nama aplikasi Anda (misal: "BDA.Camp"). Ini yang akan dilihat pengguna.
    *   **User support email**: Pilih alamat email Anda.
    *   **App logo**: **(Wajib)** Unggah logo aplikasi Anda.
    *   **Application home page**: Isi dengan URL Vercel Anda (misal: `https://bda-camp.vercel.app`)
    *   **Application privacy policy link**: Isi dengan URL Kebijakan Privasi Anda (misal: `https://bda-camp.vercel.app/privacy-policy`)
    *   **Application terms of service link**: Isi dengan URL Syarat & Ketentuan Anda (misal: `https://bda-camp.vercel.app/terms-of-service`)
    *   **Authorized domains**: Klik **+ ADD DOMAIN** dan tambahkan `vercel.app` dan `supabase.co`.
    *   Isi email kontak developer. Klik **SAVE AND CONTINUE** hingga selesai.
    *   Kembali ke dasbor *Consent Screen*, klik **PUBLISH APP** untuk membuat aplikasi Anda publik. Ini adalah langkah krusial.
6.  Kembali ke **APIs & Services** -> **Credentials** untuk melanjutkan pembuatan Client ID:
    *   **Application type**: Pilih **Web application**.
    *   **Authorized JavaScript origins**: Klik **+ ADD URI** dan masukkan URL Vercel aplikasi Anda (contoh: `https://bda-camp.vercel.app`).
    *   **Authorized redirect URIs**: Klik **+ ADD URI** dan tempel URL Callback yang sudah Anda salin dari Supabase.
7.  Klik **Create**.
8.  Sebuah pop-up akan muncul. **Salin "Your Client ID" dan "Your Client Secret"**.

**Langkah 3: Simpan Kredensial di Supabase**
1.  Kembali ke halaman provider Google di dasbor Supabase Anda.
2.  Pastikan toggle **Enabled** dalam keadaan aktif.
3.  Tempelkan **Client ID** yang sudah disalin ke kolom Client ID.
4.  Tempelkan **Client Secret** yang sudah disalin ke kolom Client Secret.
5.  Klik **Save**.

Setelah semua langkah ini selesai, fitur login dengan Google di aplikasi Vercel Anda akan berfungsi dan menampilkan nama aplikasi Anda dengan benar.
