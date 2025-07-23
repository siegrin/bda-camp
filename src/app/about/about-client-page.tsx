
'use client';

import { motion } from "framer-motion";
import { PackageSearch, ShoppingCart, Send, Smartphone, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function AboutClientPage() {
  const steps = [
    {
      icon: PackageSearch,
      title: "1. Pilih Peralatan Anda",
      description: "Jelajahi katalog kami yang lengkap. Temukan semua yang Anda butuhkan, mulai dari tenda, tas gunung, hingga peralatan masak."
    },
    {
      icon: ShoppingCart,
      title: "2. Tambahkan ke Keranjang",
      description: "Pilih tanggal sewa pada kalender di halaman detail produk, lalu klik 'Tambah ke Keranjang'. Ulangi untuk semua item yang Anda inginkan."
    },
    {
      icon: Send,
      title: "3. Lanjutkan ke Pembayaran",
      description: "Setelah selesai, buka keranjang Anda dan lanjutkan ke halaman pembayaran. Anda akan diarahkan ke WhatsApp untuk konfirmasi pesanan."
    },
    {
      icon: Smartphone,
      title: "4. Konfirmasi via WhatsApp",
      description: "Kirim pesan pesanan yang sudah dibuat otomatis ke admin kami. Admin akan segera memeriksa ketersediaan dan memberikan instruksi pembayaran."
    },
     {
      icon: CheckCircle,
      title: "5. Selesai & Siap Berpetualang!",
      description: "Setelah pembayaran dikonfirmasi, peralatan Anda siap diambil atau diantar sesuai kesepakatan. Selamat menikmati petualangan Anda!"
    }
  ];

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 md:py-16">
      <motion.div 
        className="text-center"
        initial="hidden"
        animate="visible"
        variants={itemVariants}
      >
        <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl">Cara Pesan & Syarat Ketentuan</h1>
        <p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">
          Ikuti langkah-langkah mudah ini untuk memulai petualangan Anda bersama kami dan pahami syarat & ketentuan sewa.
        </p>
      </motion.div>

      <motion.div 
        className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {steps.map((step, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="flex h-full transform flex-col items-center p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <step.icon className="h-8 w-8" />
                  </div>
                  <div className="mt-4">
                      <h3 className="font-headline text-xl font-bold">{step.title}</h3>
                      <p className="mt-2 text-muted-foreground">{step.description}</p>
                  </div>
              </Card>
            </motion.div>
        ))}
         <motion.div variants={itemVariants}>
          <Card className="flex h-full transform flex-col items-center p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl bg-secondary">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CheckCircle className="h-8 w-8" />
              </div>
              <div className="mt-4">
                  <h3 className="font-headline text-xl font-bold">Syarat & Ketentuan</h3>
                  <ul className="mt-2 space-y-2 text-left text-muted-foreground">
                    <li>- Identitas asli (KTP/SIM) sebagai jaminan.</li>
                    <li>- Pembayaran lunas di muka.</li>
                    <li>- Kerusakan/kehilangan menjadi tanggung jawab penyewa.</li>
                    <li>- Denda keterlambatan berlaku.</li>
                  </ul>
              </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};
