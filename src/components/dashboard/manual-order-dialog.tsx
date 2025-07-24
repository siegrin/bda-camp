
'use client';

import { useState, useTransition, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import type { MockUser, Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { createManualRental } from '@/lib/actions';
import { formatPrice } from '@/lib/utils';
import { Separator } from '../ui/separator';

interface ManualOrderDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    users: MockUser[];
    products: Product[];
    onFinished: () => void;
}

interface OrderItem {
    productId: number;
    days: number;
    quantity: number;
    pricePerDay: number;
    stock: number;
    name: string;
}

export function ManualOrderDialog({ isOpen, onOpenChange, users, products, onFinished }: ManualOrderDialogProps) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

    const availableProducts = useMemo(() => {
        const selectedProductIds = new Set(orderItems.map(item => item.productId));
        return products.filter(p => !selectedProductIds.has(p.id) && p.stock > 0);
    }, [products, orderItems]);

    const total = useMemo(() => {
        return orderItems.reduce((acc, item) => acc + (item.pricePerDay * item.days * item.quantity), 0);
    }, [orderItems]);

    const handleAddProduct = () => {
        if (availableProducts.length > 0) {
            const productToAdd = availableProducts[0];
            setOrderItems(prev => [...prev, {
                productId: productToAdd.id,
                days: 1,
                quantity: 1,
                pricePerDay: productToAdd.price_per_day,
                stock: productToAdd.stock,
                name: productToAdd.name,
            }]);
        }
    };

    const handleItemChange = <K extends keyof OrderItem>(index: number, field: K, value: OrderItem[K]) => {
        setOrderItems(prev => {
            const newItems = [...prev];
            const currentItem = { ...newItems[index] };
            
            if (field === 'productId') {
                 const newProduct = products.find(p => p.id === value);
                 if (newProduct) {
                    currentItem.productId = newProduct.id;
                    currentItem.name = newProduct.name;
                    currentItem.pricePerDay = newProduct.price_per_day;
                    currentItem.stock = newProduct.stock;
                    currentItem.quantity = 1; // Reset quantity
                 }
            } else {
                 currentItem[field] = value;
            }

            if (field === 'quantity' && typeof value === 'number') {
                if (value > currentItem.stock) {
                    toast({ variant: "destructive", title: "Stok Tidak Cukup", description: `Stok untuk ${currentItem.name} hanya ${currentItem.stock}` });
                    currentItem.quantity = currentItem.stock;
                } else if (value < 1) {
                    currentItem.quantity = 1;
                }
            }
             if (field === 'days' && typeof value === 'number' && value < 1) {
                currentItem.days = 1;
            }

            newItems[index] = currentItem;
            return newItems;
        });
    };

    const handleRemoveItem = (index: number) => {
        setOrderItems(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        if (!selectedUserId) {
            toast({ variant: 'destructive', title: 'Gagal', description: 'Harap pilih pengguna.' });
            return;
        }
        if (orderItems.length === 0) {
            toast({ variant: 'destructive', title: 'Gagal', description: 'Harap tambahkan setidaknya satu produk.' });
            return;
        }

        startTransition(async () => {
            const result = await createManualRental(selectedUserId, orderItems);
            if (result.success) {
                toast({ title: 'Sukses', description: result.message });
                onFinished();
            } else {
                toast({ variant: 'destructive', title: 'Gagal', description: result.message });
            }
        });
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Buat Pesanan Manual</DialogTitle>
                    <DialogDescription>Buat pesanan baru atas nama pengguna terdaftar.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="user-select">Pilih Pengguna</Label>
                        <Select value={selectedUserId} onValueChange={setSelectedUserId} required>
                            <SelectTrigger id="user-select">
                                <SelectValue placeholder="Pilih pengguna..." />
                            </SelectTrigger>
                            <SelectContent>
                                {users.map(user => (
                                    <SelectItem key={user.uid} value={user.uid}>{user.displayName} (@{user.username})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <Label>Item Pesanan</Label>
                        <ScrollArea className="max-h-[300px] w-full pr-4 -mr-4">
                            <div className="space-y-4">
                                {orderItems.map((item, index) => (
                                    <div key={index} className="p-3 border rounded-lg space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-grow">
                                                <Select
                                                    value={item.productId.toString()}
                                                    onValueChange={(val) => handleItemChange(index, 'productId', parseInt(val))}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem key={item.productId} value={item.productId.toString()}>{item.name}</SelectItem>
                                                        {availableProducts.map(p => (
                                                            <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                             <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)} className="ml-2 flex-shrink-0">
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 items-center">
                                            <div className="space-y-1">
                                                <Label className="text-xs">Jumlah</Label>
                                                <div className="flex items-center gap-1">
                                                    <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => handleItemChange(index, 'quantity', item.quantity - 1)} disabled={item.quantity <= 1}>-</Button>
                                                    <Input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)} min="1" max={item.stock} className="h-9 w-16 text-center font-bold"/>
                                                    <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => handleItemChange(index, 'quantity', item.quantity + 1)} disabled={item.quantity >= item.stock}>+</Button>
                                                </div>
                                            </div>
                                             <div className="space-y-1">
                                                <Label className="text-xs">Hari</Label>
                                                <div className="flex items-center gap-1">
                                                    <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => handleItemChange(index, 'days', item.days - 1)} disabled={item.days <= 1}>-</Button>
                                                    <Input type="number" value={item.days} onChange={e => handleItemChange(index, 'days', parseInt(e.target.value) || 1)} min="1" className="h-9 w-16 text-center font-bold"/>
                                                    <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => handleItemChange(index, 'days', item.days + 1)}>+</Button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right font-medium">
                                            Subtotal: {formatPrice(item.pricePerDay * item.days * item.quantity)}
                                        </div>
                                    </div>
                                ))}
                                {orderItems.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-4">Belum ada item ditambahkan.</p>
                                )}
                            </div>
                        </ScrollArea>
                        <Button variant="outline" size="sm" onClick={handleAddProduct} disabled={availableProducts.length === 0}>
                            <Plus className="mr-2 h-4 w-4"/> Tambah Item
                        </Button>
                    </div>

                    {orderItems.length > 0 && (
                        <div className="flex justify-end items-center mt-4 pt-4 border-t">
                            <span className="text-lg font-bold">Total: {formatPrice(total)}</span>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
                    <Button onClick={handleSubmit} disabled={isPending || orderItems.length === 0 || !selectedUserId}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Simpan Pesanan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
