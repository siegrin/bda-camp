
"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart, type CartItem as CartItemType } from "@/context/cart-context";
import { formatPrice } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

function CartItem({ item }: { item: CartItemType }) {
    const { updateItemDays, updateItemQuantity, removeItem } = useCart();
    
    return (
        <div className="flex flex-col sm:flex-row gap-4 py-4">
            <Image
                src={item.images?.[0] || 'https://placehold.co/600x400.png'}
                alt={item.name}
                width={120}
                height={120}
                sizes="(max-width: 640px) 30vw, 120px"
                className="w-full sm:w-32 h-auto sm:h-32 rounded-md object-cover"
                data-ai-hint={item.data_ai_hint}
            />
            <div className="flex-grow flex flex-col gap-2">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold text-lg">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{formatPrice(item.price_per_day)}/hari</p>
                    </div>
                     <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-1" onClick={() => removeItem(item.id)}>
                        <X className="h-4 w-4" />
                        <span className="sr-only">Hapus item</span>
                    </Button>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-auto">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                           <label htmlFor={`days-${item.id}`} className="text-sm font-medium">Hari:</label>
                           <Input 
                               type="number" 
                               id={`days-${item.id}`} 
                               value={item.days} 
                               onChange={(e) => updateItemDays(item.id, parseInt(e.target.value) || 1)}
                               className="h-9 w-20"
                               min="1"
                            />
                        </div>
                         <div className="flex items-center gap-2">
                           <label htmlFor={`quantity-${item.id}`} className="text-sm font-medium">Jml:</label>
                           <Input 
                               type="number" 
                               id={`quantity-${item.id}`} 
                               value={item.quantity} 
                               onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 1)}
                               className="h-9 w-20"
                               min="1"
                               max={item.stock}
                            />
                        </div>
                    </div>
                     <p className="font-bold text-lg sm:text-right w-full sm:w-auto mt-2 sm:mt-0">
                        {formatPrice(item.price_per_day * item.days * item.quantity)}
                     </p>
                </div>
            </div>
        </div>
    );
}


export default function CartPage() {
  const { cart, total } = useCart();

  if (cart.length === 0) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-8 text-center md:py-12">
        <ShoppingCart className="h-24 w-24 text-muted-foreground/50" />
        <h1 className="mt-6 font-headline text-3xl font-bold">Keranjang Anda Kosong</h1>
        <p className="mt-2 text-muted-foreground">Sepertinya Anda belum menambahkan peralatan apa pun.</p>
        <Button asChild className="mt-6">
          <Link href="/equipment">Jelajahi Peralatan</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl">Keranjang Sewa Anda</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Periksa kembali item Anda dan lanjutkan ke pembayaran jika sudah siap.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-4 sm:p-6 divide-y">
                {cart.map((item) => (
                    <CartItem key={item.id} item={item} />
                ))}
            </CardContent>
          </Card>
        </div>
        
        <div>
            <Card className="sticky top-20">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Ringkasan</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex justify-between text-lg">
                            <span>Subtotal</span>
                            <span>{formatPrice(total)}</span>
                        </div>
                         <Separator />
                        <div className="flex justify-between text-xl font-bold">
                            <span>Total</span>
                            <span>{formatPrice(total)}</span>
                        </div>
                    </div>
                    <Button asChild size="lg" className="mt-6 w-full">
                        <Link href="/checkout">Lanjutkan ke Pembayaran</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
