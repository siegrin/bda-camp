
'use client';

import { useState, useEffect } from 'react';
import { getRentals, getProducts } from '@/lib/products';
import { getUsers } from '@/lib/actions';
import type { Rental, MockUser, Product } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListOrdered, PlusCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { LoadingScreen } from '@/components/loading-screen';
import { RentalCard } from '@/components/dashboard/rental-card';
import { RentalResetButton } from '@/components/dashboard/rental-reset-button';
import { Button } from '@/components/ui/button';
import { ManualOrderDialog } from '@/components/dashboard/manual-order-dialog';

function RentalList({ rentals }: { rentals: Rental[] }) {
    if (rentals.length === 0) {
        return <p className="text-center text-muted-foreground py-8">Tidak ada data untuk status ini.</p>
    }
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rentals.map(r => <RentalCard key={r.id} rental={r} />)}
        </div>
    )
}

export default function RentalsPage() {
    const [rentals, setRentals] = useState<Rental[]>([]);
    const [users, setUsers] = useState<MockUser[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setFormOpen] = useState(false);
    const supabase = createClient();

    const loadData = async () => {
        // No setIsLoading(true) to avoid flicker on real-time updates
        const [rentalData, productsData, usersData] = await Promise.all([
            getRentals(),
            getProducts(),
            getUsers()
        ]);
        setRentals(rentalData);
        setProducts(productsData.products);
        setUsers(usersData.success ? usersData.data || [] : []);
        setIsLoading(false);
    }
    
    useEffect(() => {
        // Initial data load
        loadData();

        // Set up real-time subscription
        const channel = supabase.channel('rentals-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'rentals' }, loadData)
            .subscribe();

        // Clean up subscription on component unmount
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
        <>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-lg font-semibold md:text-2xl flex items-center gap-2">
                            <ListOrdered className="h-5 w-5 text-muted-foreground" />
                            Manajemen Penyewaan
                        </h1>
                         <p className="text-sm text-muted-foreground">
                            Tinjau dan kelola semua pesanan penyewaan dari pelanggan.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center">
                         <RentalResetButton />
                         <Button onClick={() => setFormOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Buat Pesanan Manual
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="pending">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                        <TabsTrigger value="pending">Tertunda ({pendingRentals.length})</TabsTrigger>
                        <TabsTrigger value="active">Aktif ({activeRentals.length})</TabsTrigger>
                        <TabsTrigger value="completed">Selesai ({completedRentals.length})</TabsTrigger>
                        <TabsTrigger value="cancelled">Dibatalkan ({cancelledRentals.length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="pending" className="mt-4">
                        {<RentalList rentals={pendingRentals} />}
                    </TabsContent>
                    <TabsContent value="active" className="mt-4">
                        {<RentalList rentals={activeRentals} />}
                    </TabsContent>
                    <TabsContent value="completed" className="mt-4">
                        {<RentalList rentals={completedRentals} />}
                    </TabsContent>
                    <TabsContent value="cancelled" className="mt-4">
                        {<RentalList rentals={cancelledRentals} />}
                    </TabsContent>
                </Tabs>
            </div>
            <ManualOrderDialog
                isOpen={isFormOpen}
                onOpenChange={setFormOpen}
                users={users}
                products={products}
                onFinished={() => setFormOpen(false)}
            />
        </>
    );
}
