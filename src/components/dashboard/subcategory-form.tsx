
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { addSubcategory, updateSubcategory } from '@/lib/actions';
import type { Category, Subcategory } from "@/lib/types";

export function SubcategoryForm({ subcategory, categories, onClose }: { subcategory?: Subcategory | null, categories: Category[], onClose: () => void }) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        startTransition(async () => {
            const formData = new FormData(event.currentTarget);
            const action = subcategory ? updateSubcategory.bind(null, subcategory.id) : addSubcategory;
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
                <DialogTitle>{subcategory ? 'Edit Subkategori' : 'Tambah Subkategori Baru'}</DialogTitle>
                <DialogDescription>
                    {subcategory ? 'Ubah nama atau induk subkategori.' : 'Buat subkategori baru untuk produk Anda.'}
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Nama Subkategori</Label>
                    <Input id="name" name="name" defaultValue={subcategory?.name} required/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="category_id">Induk Kategori</Label>
                    <Select name="category_id" defaultValue={subcategory?.category_id?.toString()} required>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih induk kategori" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map(cat => <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline">Batal</Button></DialogClose>
                <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {subcategory ? 'Simpan Perubahan' : 'Tambah Subkategori'}
                </Button>
            </DialogFooter>
        </form>
    );
}
