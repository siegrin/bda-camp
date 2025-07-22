
"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { X, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { cart, updateItemDays, updateItemQuantity, removeItem, total } = useCart();

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
          <Card className="hidden md:block">
            <CardContent className="p-0">
               <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Produk</TableHead>
                    <TableHead>Hari</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <Image
                            src={item.images?.[0] || 'https://placehold.co/600x400.png'}
                            alt={item.name}
                            width={80}
                            height={80}
                            sizes="80px"
                            className="rounded-md object-cover"
                            data-ai-hint={item.data_ai_hint}
                          />
                          <div>
                            <p className="font-bold">{item.name}</p>
                            <p className="text-sm text-muted-foreground">{formatPrice(item.price_per_day)}/hari</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          value={item.days} 
                          onChange={(e) => updateItemDays(item.id, parseInt(e.target.value) || 1)}
                          className="w-16"
                          min="1"
                        />
                      </TableCell>
                       <TableCell>
                        <Input 
                          type="number" 
                          value={item.quantity} 
                          onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 1)}
                          className="w-16"
                          min="1"
                          max={item.stock}
                        />
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatPrice(item.price_per_day * item.days * item.quantity)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                          <X className="h-4 w-4" />
                          <span className="sr-only">Hapus item</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="block space-y-4 md:hidden">
            {cart.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Image
                      src={item.images?.[0] || 'https://placehold.co/600x400.png'}
                      alt={item.name}
                      width={80}
                      height={80}
                      sizes="80px"
                      className="rounded-md object-cover"
                      data-ai-hint={item.data_ai_hint}
                    />
                    <div className="flex-grow space-y-2">
                      <div className="flex items-start justify-between">
                        <p className="pr-2 font-bold">{item.name}</p>
                        <Button variant="ghost" size="icon" className="-mt-1 -mr-1 h-7 w-7 flex-shrink-0" onClick={() => removeItem(item.id)}>
                           <X className="h-4 w-4" />
                           <span className="sr-only">Hapus item</span>
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">{formatPrice(item.price_per_day)}/hari</p>
                      <div className="mt-2 flex items-center justify-between">
                         <div className="flex items-center gap-4">
                             <div className="flex items-center gap-2">
                                <label htmlFor={`days-${item.id}`} className="text-sm">Hari:</label>
                                <Input 
                                    type="number" 
                                    id={`days-${item.id}`} 
                                    value={item.days} 
                                    onChange={(e) => updateItemDays(item.id, parseInt(e.target.value) || 1)}
                                    className="h-9 w-16"
                                    min="1"
                                 />
                             </div>
                             <div className="flex items-center gap-2">
                                <label htmlFor={`quantity-${item.id}`} className="text-sm">Jml:</label>
                                <Input 
                                    type="number" 
                                    id={`quantity-${item.id}`} 
                                    value={item.quantity} 
                                    onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 1)}
                                    className="h-9 w-16"
                                    min="1"
                                    max={item.stock}
                                 />
                             </div>
                         </div>
                      </div>
                      <p className="text-right text-lg font-medium">{formatPrice(item.price_per_day * item.days * item.quantity)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        <div>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Ringkasan</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex justify-between border-t pt-2 text-lg font-bold">
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
