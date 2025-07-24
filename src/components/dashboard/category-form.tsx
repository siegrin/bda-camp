
'use client';

import { useTransition } from 'react';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { addCategory, updateCategory } from '@/lib/actions';
import type { Category } from "@/lib/types";

export function CategoryForm({ category, onClose }: { category?: Category | null, onClose: () => void }) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        startTransition(async () => {
            const formData = new FormData(event.currentTarget);
            const action = category ? updateCategory.bind(null, category.id) : addCategory;
            const result = await action(formData);
            
            if (result.success) {
                toast({ title: "Sukses!", description: result.message });
                onClose();
            } else {
                toast({ variant: "destructive", title: "Gagal", description: result.message });
            }
        });
    }

    return (
        <form onSubmit={handleSubmit}>
            <DialogHeader>
                <DialogTitle>{category ? 'Edit Kategori' : 'Tambah Kategori Baru'}</DialogTitle>
                <DialogDescription>
                    {category ? 'Ubah nama kategori yang sudah ada.' : 'Buat kategori baru untuk produk Anda.'}
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Nama Kategori</Label>
                    <Input id="name" name="name" defaultValue={category?.name} required />
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="outline" type="button">Batal</Button></DialogClose>
                <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {category ? 'Simpan Perubahan' : 'Tambah Kategori'}
                </Button>
            </DialogFooter>
        </form>
    );
}
