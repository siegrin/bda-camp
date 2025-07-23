
"use client";

import { useState, useTransition, useCallback } from 'react';
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
} from "@/components/ui/alert-dialog";
import { deleteProduct } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface DeleteProductDialogProps {
  product: Product;
  onDeleted?: () => void;
  children: React.ReactNode;
}

export function DeleteProductDialog({ product, onDeleted, children }: DeleteProductDialogProps) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [isOpen, setOpen] = useState(false);

    const handleDelete = useCallback(() => {
        startTransition(async () => {
            const result = await deleteProduct(product.id);
            if (result.success) {
                toast({ title: "Sukses!", description: result.message });
                setOpen(false);
                if (onDeleted) {
                    onDeleted();
                }
            } else {
                toast({ variant: "destructive", title: "Gagal", description: result.message });
            }
        });
    }, [product.id, onDeleted, toast]);

    return (
        <AlertDialog open={isOpen} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                {children}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tindakan ini tidak dapat dibatalkan. Ini akan menghapus produk "{product.name}" secara permanen dari database.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isPending} className="bg-destructive hover:bg-destructive/90">
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isPending ? 'Menghapus...' : 'Ya, Hapus'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
