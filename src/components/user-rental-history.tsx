
'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';
import { getUserRentals } from '@/lib/actions';
import { getProductById } from '@/lib/products';
import type { Rental, RentalStatus, Product } from '@/lib/types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { formatPrice } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader2, ShoppingBag, RotateCcw, PackageSearch } from 'lucide-react';
import { cn } from '@/lib/utils';

export function UserRentalHistory() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addItem } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    async function loadRentals() {
      setIsLoading(true);
      const result = await getUserRentals();
      if (result.success && result.data) {
        setRentals(result.data);
      }
      setIsLoading(false);
    }
    loadRentals();
  }, []);

  const handleReorder = async (productId: number, days: number) => {
    const product = await getProductById(productId);
    if (product) {
      addItem(product, days);
      toast({
        title: "Berhasil Ditambahkan!",
        description: `${product.name} telah ditambahkan kembali ke keranjang Anda.`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Gagal Menambahkan",
        description: "Produk ini mungkin sudah tidak tersedia.",
      });
    }
  };
  
  const statusVariants: { [key in RentalStatus]: string } = {
    pending: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30 dark:text-yellow-400',
    active: 'bg-blue-500/20 text-blue-700 border-blue-500/30 dark:text-blue-400',
    completed: 'bg-green-500/20 text-green-700 border-green-500/30 dark:text-green-400',
    cancelled: 'bg-red-500/20 text-red-700 border-red-500/30 dark:text-red-400',
  }
  
  const statusText: { [key in RentalStatus]: string } = {
      pending: 'Tertunda',
      active: 'Aktif',
      completed: 'Selesai',
      cancelled: 'Dibatalkan'
  }


  if (isLoading) {
    return (
      <Card>
        <CardHeader>
            <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <ShoppingBag className="h-6 w-6" />
                </div>
                <div>
                    <CardTitle className="font-headline text-2xl">Riwayat Pesanan</CardTitle>
                    <CardDescription>Memuat riwayat penyewaan Anda...</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
                <CardTitle className="font-headline text-2xl">Riwayat Pesanan</CardTitle>
                <CardDescription>Lihat dan lacak semua penyewaan Anda.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {rentals.length === 0 ? (
          <div className="text-center py-16 bg-muted rounded-md">
            <PackageSearch className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 font-semibold text-muted-foreground">Anda belum memiliki riwayat pesanan.</p>
            <p className="text-sm text-muted-foreground">Mulai petualangan Anda dengan menyewa peralatan kami!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rentals.map((rental) => (
              <Card key={rental.id} className="bg-muted/50">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Pesanan #{rental.id.toString().slice(-6)}</CardTitle>
                      <CardDescription>
                        {format(new Date(rental.checkout_date), "d MMMM yyyy, HH:mm", { locale: id })}
                      </CardDescription>
                    </div>
                     <Badge variant="outline" className={cn("capitalize", statusVariants[rental.status])}>
                        {statusText[rental.status]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible>
                    <AccordionItem value={`items-${rental.id}`}>
                      <AccordionTrigger>Lihat Item ({rental.items.length}) - Total: {formatPrice(rental.total)}</AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-4 pt-2">
                          {rental.items.map(item => (
                            <li key={item.id} className="flex items-center justify-between gap-4">
                               <div className="flex items-center gap-4">
                                 <div>
                                    <p className="font-semibold">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">{item.days} hari &times; {formatPrice(item.price_per_day)}</p>
                                 </div>
                               </div>
                               <div className="flex flex-col items-end gap-2">
                                  <p className="font-medium">{formatPrice(item.price_per_day * item.days)}</p>
                                   <Button size="sm" variant="outline" onClick={() => handleReorder(item.id, item.days)}>
                                        <RotateCcw className="mr-2 h-4 w-4" />
                                        Pesan Lagi
                                    </Button>
                               </div>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
