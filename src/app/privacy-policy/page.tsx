
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

const PrivacyPolicyPage = () => {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
      <div className="flex flex-col items-center text-center mb-8">
        <Shield className="h-16 w-16 text-primary mb-4" />
        <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl">Kebijakan Privasi</h1>
        <p className="mt-2 text-lg text-muted-foreground">Terakhir diperbarui: 1 Juli 2025</p>
      </div>

      <Card>
        <CardContent className="p-6 md:p-8 space-y-6 text-muted-foreground">
          <section className="space-y-2">
            <h2 className="font-headline text-2xl font-bold text-card-foreground">Pendahuluan</h2>
            <p>
              Selamat datang di BDA.Camp. Kami menghargai privasi Anda dan berkomitmen untuk melindungi informasi pribadi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, mengungkapkan, dan melindungi informasi Anda saat Anda mengunjungi situs web kami.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-headline text-2xl font-bold text-card-foreground">Informasi yang Kami Kumpulkan</h2>
            <p>Kami dapat mengumpulkan informasi tentang Anda dengan berbagai cara. Informasi yang kami kumpulkan meliputi:</p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li>
                <strong>Data Pribadi:</strong> Informasi yang dapat diidentifikasi secara pribadi, seperti nama, alamat email, dan nomor telepon Anda, yang Anda berikan secara sukarela saat mendaftar atau berinteraksi dengan layanan kami (misalnya, saat checkout).
              </li>
              <li>
                <strong>Data Derivatif:</strong> Informasi yang dikumpulkan server kami secara otomatis saat Anda mengakses Situs, seperti alamat IP Anda, jenis browser, sistem operasi, waktu akses, dan halaman yang telah Anda lihat secara langsung sebelum dan sesudah mengakses Situs.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-headline text-2xl font-bold text-card-foreground">Penggunaan Informasi Anda</h2>
            <p>
              Memiliki informasi yang akurat tentang Anda memungkinkan kami untuk memberikan Anda pengalaman yang lancar, efisien, dan disesuaikan. Secara khusus, kami dapat menggunakan informasi yang dikumpulkan tentang Anda melalui Situs untuk:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li>Membuat dan mengelola akun Anda.</li>
              <li>Memproses penyewaan dan pembayaran Anda.</li>
              <li>Mengirimkan email konfirmasi, pembaruan, dan informasi administratif lainnya.</li>
              <li>Meningkatkan efisiensi dan operasi Situs.</li>
              <li>Memantau dan menganalisis penggunaan dan tren untuk meningkatkan pengalaman Anda dengan Situs.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-headline text-2xl font-bold text-card-foreground">Pengungkapan Informasi Anda</h2>
            <p>
              Kami tidak akan membagikan, menjual, menyewakan, atau memperdagangkan informasi pribadi Anda dengan pihak ketiga untuk tujuan promosi mereka. Kami dapat membagikan informasi tentang Anda dalam situasi tertentu, seperti:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li>
                <strong>Penyedia Layanan Pihak Ketiga:</strong> Kami dapat membagikan informasi Anda dengan pihak ketiga yang melakukan layanan untuk kami atau atas nama kami, termasuk pemrosesan pembayaran, analisis data, dan hosting (seperti Supabase).
              </li>
              <li>
                <strong>Dengan Hukum atau untuk Melindungi Hak:</strong> Jika kami percaya pelepasan informasi tentang Anda diperlukan untuk menanggapi proses hukum, untuk menyelidiki atau memperbaiki potensi pelanggaran kebijakan kami, atau untuk melindungi hak, properti, dan keselamatan orang lain.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-headline text-2xl font-bold text-card-foreground">Keamanan Informasi Anda</h2>
            <p>
              Kami menggunakan tindakan keamanan administratif, teknis, dan fisik untuk membantu melindungi informasi pribadi Anda. Meskipun kami telah mengambil langkah-langkah yang wajar untuk mengamankan informasi pribadi yang Anda berikan kepada kami, perlu diketahui bahwa terlepas dari upaya kami, tidak ada tindakan keamanan yang sempurna atau tidak dapat ditembus.
            </p>
          </section>
          
          <section className="space-y-2">
            <h2 className="font-headline text-2xl font-bold text-card-foreground">Hak Anda</h2>
            <p>
                Anda memiliki hak untuk meninjau, mengubah, atau menghentikan akun Anda kapan saja dengan masuk ke pengaturan akun Anda dan memperbarui akun Anda.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-headline text-2xl font-bold text-card-foreground">Hubungi Kami</h2>
            <p>
              Jika Anda memiliki pertanyaan atau komentar tentang Kebijakan Privasi ini, silakan hubungi kami melalui halaman kontak kami.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacyPolicyPage;
