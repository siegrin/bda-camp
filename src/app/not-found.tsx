import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Frown } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <Frown className="w-24 h-24 text-primary opacity-50 mb-4" />
      <h1 className="text-6xl font-bold font-headline">404</h1>
      <h2 className="text-2xl font-semibold mt-2">Halaman Tidak Ditemukan</h2>
      <p className="mt-4 max-w-md text-muted-foreground">
        Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
      </p>
      <Button asChild className="mt-8">
        <Link href="/">Kembali ke Beranda</Link>
      </Button>
    </div>
  );
}
