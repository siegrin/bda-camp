
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export function AddToCartForm({ product }: { product: Product }) {
  const { toast } = useToast();
  const { addItem } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
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
        if (quantity > product.stock) {
            toast({
                variant: "destructive",
                title: "Stok Tidak Cukup",
                description: `Hanya tersedia ${product.stock} unit untuk ${product.name}.`,
            });
            return;
        }

        const dayDifference = (date.to.getTime() - date.from.getTime()) / (1000 * 60 * 60 * 24);
        const days = Math.round(dayDifference) + 1;
        addItem(product, days, quantity);
        toast({
            title: "Berhasil Ditambahkan!",
            description: `${quantity}x ${product.name} telah ditambahkan ke keranjang Anda.`,
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
      <Separator className="my-4" />
       <div className="space-y-2 text-center">
        <Label htmlFor="quantity" className="font-headline text-xl">Jumlah</Label>
        <div className="flex justify-center items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}>-</Button>
            <Input 
                id="quantity" 
                type="number" 
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 text-center text-lg font-bold"
                min="1"
                max={product.stock}
            />
            <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}  disabled={quantity >= product.stock}>+</Button>
        </div>
        <p className="text-sm text-muted-foreground">Stok tersedia: {product.stock}</p>
      </div>
      <Button size="lg" className="w-full mt-4" disabled={!date || product.availability === 'Tidak Tersedia' || product.stock < 1} onClick={handleAddToCart}>
        Tambah ke Keranjang
      </Button>
    </>
  );
}
