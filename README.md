# Base Camp Rentals - Aplikasi Penyewaan Peralatan Kemah

Selamat datang di Base Camp Rentals, sebuah aplikasi web Next.js yang dibangun untuk mendemonstrasikan praktik terbaik dalam pengembangan web modern, termasuk Server Components, Server Actions, dan integrasi dengan Supabase untuk backend dan Genkit untuk fitur AI.

## Panduan Deployment ke Vercel dari GitHub

Proyek ini dioptimalkan untuk deployment yang mudah dan cepat ke Vercel. Ikuti langkah-langkah berikut untuk mempublikasikan aplikasi Anda.

### Prasyarat

1.  **Akun GitHub**: Anda memerlukan akun GitHub untuk menyimpan kode Anda.
2.  **Akun Vercel**: Daftar atau masuk ke [Vercel](https://vercel.com) menggunakan akun GitHub Anda.
3.  **Proyek Supabase**: Pastikan proyek Supabase Anda sudah aktif dan berjalan.

---

### Langkah 1: Unggah Kode ke Repositori GitHub

Jika kode Anda belum ada di GitHub, buatlah repositori baru:

1.  Buka [GitHub](https://github.com/new) dan buat repositori baru (bisa publik atau privat).
2.  Ikuti instruksi di GitHub untuk menghubungkan folder lokal Anda ke repositori baru tersebut dan unggah kodenya. Perintah dasarnya akan terlihat seperti ini:
    ```bash
    git remote add origin https://github.com/NAMA_PENGGUNA/NAMA_REPOSITORI.git
    git branch -M main
    git push -u origin main
    ```

---

### Langkah 2: Buat Proyek Baru di Vercel

1.  Buka **Dashboard Vercel** Anda.
2.  Klik **"Add New..."** lalu pilih **"Project"**.
3.  Di bawah bagian **"Import Git Repository"**, temukan dan pilih repositori GitHub yang baru saja Anda buat. Jika tidak muncul, klik "Configure GitHub App" untuk memberikan akses Vercel.
4.  Vercel akan secara otomatis mendeteksi bahwa ini adalah proyek Next.js dan menampilkan pengaturan build yang benar. Anda tidak perlu mengubah pengaturan ini.

---

### Langkah 3: Konfigurasi Environment Variables

Ini adalah langkah paling **krusial**. Aplikasi Anda memerlukan kunci API dari Supabase untuk berfungsi.

1.  Di halaman **"Configure Project"** di Vercel, buka bagian **"Environment Variables"**.
2.  Tambahkan tiga variabel berikut satu per satu:

    *   **Variabel 1: URL Supabase**
        *   **Key**: `NEXT_PUBLIC_SUPABASE_URL`
        *   **Value**: Buka proyek Supabase Anda > Settings > API. Salin URL dari bagian "Project URL".

    *   **Variabel 2: Kunci Anon Supabase**
        *   **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
        *   **Value**: Di halaman yang sama di Supabase, salin kunci dari bagian "Project API Keys" yang berlabel "public" / "anon".

    *   **Variabel 3: Kunci Service Role Supabase (Rahasia)**
        *   **Key**: `SUPABASE_SERVICE_ROLE_KEY`
        *   **Value**: Di halaman yang sama, klik "Show" di sebelah kunci berlabel "service_role" dan salin kuncinya.
        *   **PENTING**: Pastikan Anda **TIDAK** mencentang kotak "Expose to the browser" untuk kunci ini, karena kunci ini sangat rahasia.

3.  Setelah ketiga variabel ditambahkan, klik tombol **"Deploy"**.

---

### Langkah 4: Konfigurasi URL di Supabase untuk Autentikasi

Setelah proses deployment pertama selesai, Vercel akan memberikan Anda URL produksi (misalnya, `https://nama-proyek-anda.vercel.app`). Anda perlu memberitahu Supabase tentang URL ini agar fitur login (terutama dengan Google) berfungsi.

1.  Kembali ke dasbor **Supabase** Anda.
2.  Buka **Authentication** > **URL Configuration**.
3.  Di kolom **"Site URL"**, masukkan URL produksi dari Vercel Anda (contoh: `https://nama-proyek-anda.vercel.app`).
4.  Di bagian **"Redirect URLs"**, tambahkan URL berikut:
    ```
    https://NAMA_PROYEK_ANDA.vercel.app/api/auth/callback
    ```
    (Ganti `NAMA_PROYEK_ANDA.vercel.app` dengan URL Anda yang sebenarnya).
5.  Klik **"Save"**.

---

### Langkah 5: Selesai!

Aplikasi Anda sekarang sudah live! Setiap kali Anda melakukan `git push` ke branch `main` di GitHub, Vercel akan secara otomatis memulai deployment baru dengan perubahan terbaru Anda.

Jika Anda perlu mengupdate environment variables di kemudian hari, Anda dapat melakukannya dari menu **Settings > Environment Variables** di dasbor proyek Vercel Anda.
