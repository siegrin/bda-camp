
"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import type { DateRange } from "react-day-picker";
import { addDays, startOfToday } from "date-fns";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export function AddToCartForm({ product }: { product: Product }) {
  const { toast } = useToast();
  const { addItem } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [disabledDays, setDisabledDays] = useState<{ before: Date } | undefined>(undefined);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect runs only on the client side after hydration
    setIsClient(true);
    const today = startOfToday();
    setDate({
      from: today,
      to: addDays(today, 4),
    });
    setDisabledDays({ before: today });
  }, []);

  const handleAddToCart = () => {
    if (!user) {
        toast({
            title: "Harap Login Terlebih Dahulu",
            description: "Anda harus masuk ke akun untuk menambahkan item ke keranjang.",
            variant: "destructive"
        });
        router.push(`/login?redirect=${pathname}`);
        return;
    }
    
    if (product && date?.from && date?.to) {
        const dayDifference = (date.to.getTime() - date.from.getTime()) / (1000 * 60 * 60 * 24);
        const days = Math.round(dayDifference) + 1;
        addItem(product, days);
        toast({
            title: "Berhasil Ditambahkan!",
            description: `${product.name} telah ditambahkan ke keranjang Anda.`,
        });
    } else {
        toast({
            variant: "destructive",
            title: "Gagal Menambahkan",
            description: "Silakan pilih rentang tanggal sewa terlebih dahulu.",
        });
    }
  };
  
  if (user?.role === 'admin') {
    return (
      <div className="flex flex-col items-center justify-center text-center p-4 bg-muted/50 rounded-md">
        <h2 className="font-headline text-lg font-bold">Fitur untuk Pengguna</h2>
        <p className="text-sm text-muted-foreground mt-1">Admin tidak dapat menambahkan item ke keranjang.</p>
      </div>
    );
  }


  return (
    <>
      <h2 className="font-headline text-xl md:text-2xl font-bold text-center">Pilih Tanggal Sewa</h2>
      <div className="mt-4 flex justify-center">
        {isClient ? (
           <Calendar
            mode="range"
            selected={date}
            onSelect={setDate}
            numberOfMonths={1}
            className="p-0 sm:p-3"
            disabled={disabledDays}
          />
        ) : (
          <Skeleton className="h-[310px] w-full" />
        )}
      </div>
      <Button size="lg" className="w-full mt-4" disabled={!date || product.availability === 'Tidak Tersedia'} onClick={handleAddToCart}>
        Tambah ke Keranjang
      </Button>
    </>
  );
}
