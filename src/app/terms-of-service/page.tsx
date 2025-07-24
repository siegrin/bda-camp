
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

const TermsOfServicePage = () => {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
      <div className="flex flex-col items-center text-center mb-8">
        <FileText className="h-16 w-16 text-primary mb-4" />
        <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl">Syarat & Ketentuan</h1>
        <p className="mt-2 text-lg text-muted-foreground">Terakhir diperbarui: 1 Juli 2025</p>
      </div>

      <Card>
        <CardContent className="p-6 md:p-8 space-y-6 text-muted-foreground">
          <section className="space-y-2">
            <h2 className="font-headline text-2xl font-bold text-card-foreground">1. Persetujuan terhadap Ketentuan</h2>
            <p>
              Dengan mengakses atau menggunakan situs web BDA.Camp ("Layanan"), Anda setuju untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak setuju dengan bagian mana pun dari ketentuan ini, Anda tidak diizinkan untuk menggunakan Layanan.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-headline text-2xl font-bold text-card-foreground">2. Layanan Kami</h2>
            <p>
              BDA.Camp menyediakan platform online untuk penyewaan peralatan berkemah dan aktivitas luar ruangan. Kami menyediakan peralatan yang terawat baik untuk disewa oleh pengguna sesuai dengan ketersediaan dan ketentuan pemesanan.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-headline text-2xl font-bold text-card-foreground">3. Akun Pengguna</h2>
            <p>
              Untuk menggunakan beberapa fitur Layanan, Anda mungkin diharuskan mendaftar untuk sebuah akun. Anda bertanggung jawab untuk menjaga kerahasiaan kata sandi Anda dan untuk semua aktivitas yang terjadi di bawah akun Anda. Anda setuju untuk segera memberitahu kami tentang penggunaan akun Anda yang tidak sah.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-headline text-2xl font-bold text-card-foreground">4. Aturan Penyewaan</h2>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li>
                <strong>Jaminan:</strong> Penyewa wajib meninggalkan kartu identitas asli (KTP/SIM) yang masih berlaku sebagai jaminan selama masa sewa.
              </li>
              <li>
                <strong>Pembayaran:</strong> Semua biaya sewa harus dibayar lunas di muka sebelum peralatan diambil atau dikirim.
              </li>
              <li>
                <strong>Tanggung Jawab Penyewa:</strong> Penyewa bertanggung jawab penuh atas peralatan yang disewa. Setiap kerusakan atau kehilangan peralatan akan dikenakan biaya penggantian sesuai dengan nilai barang tersebut.
              </li>
              <li>
                <strong>Keterlambatan:</strong> Keterlambatan pengembalian peralatan akan dikenakan denda harian sesuai dengan tarif yang berlaku.
              </li>
               <li>
                <strong>Pembatalan:</strong> Kebijakan pembatalan akan mengikuti prosedur yang ditentukan saat konfirmasi pesanan dengan admin.
              </li>
            </ul>
          </section>

           <section className="space-y-2">
            <h2 className="font-headline text-2xl font-bold text-card-foreground">5. Batasan Tanggung Jawab</h2>
            <p>
              BDA.Camp tidak bertanggung jawab atas cedera, kerugian, atau kerusakan apa pun yang timbul dari penggunaan peralatan yang disewa. Pengguna bertanggung jawab untuk menggunakan peralatan dengan aman dan sesuai dengan peruntukannya.
            </p>
          </section>
          
          <section className="space-y-2">
            <h2 className="font-headline text-2xl font-bold text-card-foreground">6. Perubahan Ketentuan</h2>
            <p>
                Kami berhak untuk mengubah Syarat dan Ketentuan ini kapan saja. Versi terbaru akan selalu diposting di situs web kami. Dengan terus menggunakan Layanan setelah perubahan tersebut, Anda setuju untuk terikat oleh ketentuan yang telah direvisi.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-headline text-2xl font-bold text-card-foreground">7. Hubungi Kami</h2>
            <p>
              Jika Anda memiliki pertanyaan tentang Syarat dan Ketentuan ini, silakan hubungi kami melalui halaman kontak yang tersedia.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};

export default TermsOfServicePage;
