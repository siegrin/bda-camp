
'use client';

import { useState, useEffect, useTransition } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { addRentalByAdmin, getUsers } from '@/lib/actions';
import { getProducts } from '@/lib/products';
import type { MockUser, Product, RentalStatus } from '@/lib/types';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface AddRentalDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onFinished: () => void;
}

type RentalItem = {
    productId: string;
    quantity: number;
    days: number;
    pricePerDay: number;
    stock: number;
};

function RentalForm({ onFinished }: { onFinished: () => void }) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const [users, setUsers] = useState<MockUser[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [rentalItems, setRentalItems] = useState<RentalItem[]>([]);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        async function loadData() {
            const [usersRes, productsRes] = await Promise.all([
                getUsers(),
                getProducts()
            ]);
            if (usersRes.success && usersRes.data) {
                setUsers(usersRes.data.filter(u => u.role !== 'admin'));
            }
            setProducts(productsRes.products);
        }
        loadData();
    }, []);

    useEffect(() => {
        const newTotal = rentalItems.reduce((acc, item) => acc + (item.pricePerDay * item.quantity * item.days), 0);
        setTotal(newTotal);
    }, [rentalItems]);

    const handleAddItem = () => {
        setRentalItems([...rentalItems, { productId: '', quantity: 1, days: 1, pricePerDay: 0, stock: 0 }]);
    };

    const handleRemoveItem = (index: number) => {
        setRentalItems(rentalItems.filter((_, i) => i !== index));
    };
    
    const handleItemChange = (index: number, field: keyof RentalItem, value: string | number) => {
        const newItems = [...rentalItems];
        const item = newItems[index];

        if (field === 'productId') {
            const product = products.find(p => p.id.toString() === value);
            if(product) {
                item.productId = value as string;
                item.pricePerDay = product.price_per_day;
                item.stock = product.stock;
            }
        } else {
             (item[field] as number) = Number(value);
        }
        
        // Ensure quantity doesn't exceed stock
        if (item.stock > 0 && item.quantity > item.stock) {
            item.quantity = item.stock;
            toast({
                variant: 'destructive',
                title: 'Stok Tidak Cukup',
                description: `Hanya tersedia ${item.stock} unit.`
            })
        }

        setRentalItems(newItems);
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        startTransition(async () => {
            const formData = new FormData(event.currentTarget);
            
            // Append dynamic items to formData
            rentalItems.forEach((item, index) => {
                formData.append(`product_${index}`, item.productId);
                formData.append(`quantity_${index}`, item.quantity.toString());
                formData.append(`days_${index}`, item.days.toString());
            });

            const result = await addRentalByAdmin(formData);
            if (result.success) {
                toast({ title: 'Sukses!', description: result.message });
                onFinished();
            } else {
                toast({ variant: 'destructive', title: 'Gagal', description: result.message });
            }
        });
    }

    return (
        <form onSubmit={handleSubmit}>
             <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1 pr-4">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="user_id">Pelanggan</Label>
                        <Select name="user_id" required>
                            <SelectTrigger><SelectValue placeholder="Pilih pelanggan" /></SelectTrigger>
                            <SelectContent>
                                {users.map(user => <SelectItem key={user.uid} value={user.uid}>{user.displayName} ({user.username})</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="status">Status Pesanan</Label>
                        <Select name="status" defaultValue="pending" required>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending">Tertunda</SelectItem>
                                <SelectItem value="active">Aktif</SelectItem>
                                <SelectItem value="completed">Selesai</SelectItem>
                                <SelectItem value="cancelled">Dibatalkan</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                 </div>

                <div className="space-y-2">
                    <Label>Item Pesanan</Label>
                    <div className="space-y-3 rounded-md border p-4">
                        {rentalItems.map((item, index) => (
                             <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                                <div className="sm:col-span-5 space-y-1">
                                    {index === 0 && <Label className="text-xs">Produk</Label>}
                                    <Select 
                                        value={item.productId}
                                        onValueChange={(val) => handleItemChange(index, 'productId', val)}
                                    >
                                        <SelectTrigger><SelectValue placeholder="Pilih item..." /></SelectTrigger>
                                        <SelectContent>
                                            {products.filter(p => p.stock > 0).map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name} (Stok: {p.stock})</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                 <div className="sm:col-span-3 space-y-1">
                                    {index === 0 && <Label className="text-xs">Jml Hari</Label>}
                                    <Input type="number" value={item.days} onChange={(e) => handleItemChange(index, 'days', e.target.value)} min="1" />
                                </div>
                                <div className="sm:col-span-3 space-y-1">
                                    {index === 0 && <Label className="text-xs">Kuantitas</Label>}
                                    <Input type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} min="1" max={item.stock > 0 ? item.stock : undefined} />
                                </div>
                                <div className="sm:col-span-1">
                                     <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => handleRemoveItem(index)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Item
                        </Button>
                    </div>
                </div>
                
                <div className="mt-4 text-right">
                    <p className="text-sm text-muted-foreground">Total Biaya</p>
                    <p className="text-2xl font-bold">{formatPrice(total)}</p>
                </div>
             </div>

            <DialogFooter className="mt-6 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onFinished}>Batal</Button>
                <Button type="submit" disabled={isPending || rentalItems.length === 0}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Simpan Pesanan
                </Button>
            </DialogFooter>
        </form>
    );
}

export function AddRentalDialog({ isOpen, onOpenChange, onFinished }: AddRentalDialogProps) {
    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Tambah Pesanan Baru</DialogTitle>
                    <DialogDescription>
                        Buat pesanan secara manual untuk pelanggan.
                    </DialogDescription>
                </DialogHeader>
                <RentalForm onFinished={onFinished} />
            </DialogContent>
        </Dialog>
    );
}
