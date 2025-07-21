
'use client';

import { useState, useEffect, useTransition } from 'react';
import { getRentals } from '@/lib/products';
import { completeRental, resetRentals, activateRental, cancelRental } from '@/lib/actions';
import type { Rental, RentalStatus } from '@/lib/types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Loader2, ListOrdered, CheckCircle, Trash2, PlayCircle, XCircle } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { LoadingScreen } from '@/components/loading-screen';

function ActionButtons({ rental, onAction }: { rental: Rental, onAction: () => void }) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const handleAction = async (action: () => Promise<any>) => {
        startTransition(async () => {
            const result = await action();
            if (result.success) {
                toast({ title: "Sukses!", description: result.message });
                // onAction will be called by real-time subscription
            } else {
                toast({ variant: "destructive", title: "Gagal", description: result.message });
            }
        });
    }

    return (
        <div className="mt-4 flex justify-end gap-2">
            {rental.status === 'pending' && (
                <>
                    <Button onClick={() => handleAction(() => activateRental(rental.id))} disabled={isPending} size="sm">
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlayCircle className="mr-2 h-4 w-4" />}
                        Aktifkan
                    </Button>
                     <Button onClick={() => handleAction(() => cancelRental(rental.id))} disabled={isPending} size="sm" variant="destructive">
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                        Batalkan
                    </Button>
                </>
            )}
            {rental.status === 'active' && (
                <Button onClick={() => handleAction(() => completeRental(rental.id))} disabled={isPending} size="sm">
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                    Tandai Selesai
                </Button>
            )}
        </div>
    )
}


function RentalCard({ rental, onAction }: { rental: Rental, onAction: () => void }) {
  const checkoutDate = new Date(rental.checkout_date);
  const formattedDate = format(checkoutDate, "d MMM yyyy, HH:mm", { locale: id });
  
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

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                 <CardTitle className="text-xl">{rental.user_name}</CardTitle>
                 <CardDescription>{formattedDate}</CardDescription>
            </div>
            <Badge variant="outline" className={cn("capitalize", statusVariants[rental.status])}>
                {statusText[rental.status]}
            </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible>
            <AccordionItem value="items">
                <AccordionTrigger>Lihat Item ({rental.items.length}) - Total: {formatPrice(rental.total)}</AccordionTrigger>
                <AccordionContent>
                     <ul className="space-y-2 text-sm text-muted-foreground">
                        {rental.items.map(item => (
                            <li key={item.id} className="flex justify-between">
                                <span>{item.name} ({item.days} hari)</span>
                                <span>{formatPrice(item.price_per_day * item.days)}</span>
                            </li>
                        ))}
                    </ul>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
        <ActionButtons rental={rental} onAction={onAction} />
      </CardContent>
    </Card>
  )
}

function RentalList({ rentals, onAction }: { rentals: Rental[], onAction: () => void }) {
    if (rentals.length === 0) {
        return <p className="text-center text-muted-foreground py-8">Tidak ada data untuk status ini.</p>
    }
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rentals.map(r => <RentalCard key={r.id} rental={r} onAction={onAction} />)}
        </div>
    )
}

function ResetRentalsButton({ onReset }: { onReset: () => void }) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const handleReset = () => {
        startTransition(async () => {
            const result = await resetRentals();
            if (result.success) {
                toast({ title: "Sukses!", description: result.message });
                // onReset will be handled by real-time subscription
            } else {
                toast({ variant: "destructive", title: "Gagal", description: result.message });
            }
        });
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={isPending}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Reset Data
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tindakan ini akan menghapus semua data penyewaan (aktif dan selesai) secara permanen.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleReset} disabled={isPending} className="bg-destructive hover:bg-destructive/90">
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Ya, Hapus Data
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default function RentalsPage() {
    const [rentals, setRentals] = useState<Rental[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    const loadData = async () => {
        // No setIsLoading(true) to avoid flicker
        const data = await getRentals();
        setRentals(data);
        setIsLoading(false);
    }
    
    useEffect(() => {
        loadData();

        const channel = supabase.channel('rentals-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'rentals' }, loadData)
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    const pendingRentals = rentals.filter(r => r.status === 'pending');
    const activeRentals = rentals.filter(r => r.status === 'active');
    const completedRentals = rentals.filter(r => r.status === 'completed');
    const cancelledRentals = rentals.filter(r => r.status === 'cancelled');
    
    if (isLoading) {
        return <LoadingScreen message="Memuat Penyewaan..." />;
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl flex items-center gap-2">
                    <ListOrdered className="h-5 w-5 text-muted-foreground" />
                    Manajemen Penyewaan
                </h1>
                <ResetRentalsButton onReset={loadData} />
            </div>
             <p className="text-sm text-muted-foreground -mt-3">
                Tinjau dan kelola semua pesanan penyewaan dari pelanggan.
            </p>

            <Tabs defaultValue="pending">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                    <TabsTrigger value="pending">Tertunda ({pendingRentals.length})</TabsTrigger>
                    <TabsTrigger value="active">Aktif ({activeRentals.length})</TabsTrigger>
                    <TabsTrigger value="completed">Selesai ({completedRentals.length})</TabsTrigger>
                    <TabsTrigger value="cancelled">Dibatalkan ({cancelledRentals.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="pending" className="mt-4">
                     {<RentalList rentals={pendingRentals} onAction={loadData} />}
                </TabsContent>
                <TabsContent value="active" className="mt-4">
                     {<RentalList rentals={activeRentals} onAction={loadData} />}
                </TabsContent>
                <TabsContent value="completed" className="mt-4">
                     {<RentalList rentals={completedRentals} onAction={loadData} />}
                </TabsContent>
                 <TabsContent value="cancelled" className="mt-4">
                     {<RentalList rentals={cancelledRentals} onAction={loadData} />}
                </TabsContent>
            </Tabs>
        </div>
    );
}
