
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import type { Product } from '@/lib/types';
import { getDashboardProducts } from '@/lib/products';
import { PlusCircle, Package, Loader2, Search } from 'lucide-react';
import { ProductFormDialog } from '@/components/product-form-dialog';
import { useAuth } from '@/context/auth-context';
import { ProductCard } from '@/components/product-card';
import { AdminProductTableRow } from '@/components/admin-product-table-row';
import { createClient } from '@/lib/supabase/client';
import { LoadingScreen } from '@/components/loading-screen';

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormDialogOpen, setFormDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const supabase = createClient();


    const loadData = useCallback(async () => {
        // No setIsLoading(true) to prevent flicker on real-time updates
        const loadedProducts = await getDashboardProducts();
        setProducts(loadedProducts);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        loadData();
        
        const channel = supabase.channel('products-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, loadData)
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [loadData, supabase]);
    
    const filteredProducts = useMemo(() => {
        return products.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [products, searchTerm]);


    const handleOpenDialog = (product: Product | null) => {
        setEditingProduct(product);
        setFormDialogOpen(true);
    }
    
    const onActionComplete = () => {
        setFormDialogOpen(false);
        setEditingProduct(null);
        // No need to call loadData, real-time subscription will handle it
    };

    if (isLoading) {
        return <LoadingScreen message="Memuat Produk..." />;
    }

  return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-lg font-semibold md:text-2xl flex items-center gap-2">
                        <Package className="h-5 w-5 text-muted-foreground" />
                        Manajemen Produk
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Lihat, tambah, edit, atau hapus produk Anda.
                    </p>
                </div>
                 {user?.role === 'admin' && (
                    <Button onClick={() => handleOpenDialog(null)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Tambah Produk
                    </Button>
                )}
            </div>

             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Cari berdasarkan nama produk..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-full sm:w-80"
                />
            </div>

            <Card className="hidden md:block">
               <div className="overflow-auto scrollbar-hide">
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="w-[80px]">Gambar</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead className="hidden sm:table-cell">Kategori</TableHead>
                        <TableHead className="hidden lg:table-cell">Harga</TableHead>
                        <TableHead className="hidden sm:table-cell">Status</TableHead>
                        <TableHead className="hidden lg:table-cell">Stok</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProducts.map((product) => (
                            <AdminProductTableRow 
                                key={product.id} 
                                product={product} 
                                onEdit={() => handleOpenDialog(product)}
                                onDeleted={onActionComplete}
                            />
                        ))}
                         {filteredProducts.length === 0 && (
                             <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    Tidak ada produk yang cocok dengan pencarian Anda.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                    </Table>
                </div>
            </Card>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:hidden">
                 {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} onActionComplete={onActionComplete} />
                ))}
                 {filteredProducts.length === 0 && (
                    <div className="col-span-full text-center py-10">
                        Tidak ada produk yang cocok dengan pencarian Anda.
                    </div>
                 )}
            </div>
            
             {user?.role === 'admin' && (
                <ProductFormDialog 
                    isOpen={isFormDialogOpen}
                    onOpenChange={setFormDialogOpen}
                    product={editingProduct}
                    onFinished={onActionComplete}
                />
             )}
        </div>
  );
}
