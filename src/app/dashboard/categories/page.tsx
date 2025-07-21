
'use client';

import { useState, useEffect, useTransition, useMemo } from 'react';
import { getDashboardCategories, getDashboardProducts } from "@/lib/products";
import { addCategory, updateCategory, deleteCategory } from '@/lib/actions';
import {
  Card,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, PlusCircle, Loader2, Shapes, Search } from "lucide-react";
import type { Product, Category } from "@/lib/types";
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { LoadingScreen } from '@/components/loading-screen';


function CategoryForm({ category, onClose }: { category?: Category | null, onClose: () => void }) {
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


export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { toast } = useToast();
  const [isPendingDelete, startDeleteTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState('');
  const supabase = createClient();


  async function loadData() {
      // No need to set loading to true here to avoid flickering on real-time updates
      const [cats, prods] = await Promise.all([
          getDashboardCategories(),
          getDashboardProducts()
      ]);
      setCategories(cats);
      setProducts(prods);
      setIsLoading(false); // Only set to false, don't set to true at the start
  }

  useEffect(() => {
      loadData();
      
      const channel = supabase.channel('categories-changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, loadData)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, loadData)
          .subscribe();
          
      return () => {
          supabase.removeChannel(channel);
      }
  }, [supabase]);

  const filteredCategories = useMemo(() => {
    return categories.filter(cat => 
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  const getProductCountForCategory = (categoryName: string) => {
    return products.filter(p => p.category === categoryName).length;
  };
  
  const openDialog = (category: Category | null) => {
    setEditingCategory(category);
    setDialogOpen(true);
  }
  
  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingCategory(null);
    // No need to call loadData here, the real-time subscription will handle it
  }

  const handleDelete = (id: number) => {
      startDeleteTransition(async () => {
          const result = await deleteCategory(id);
          if (result.success) {
              toast({ title: "Sukses!", description: result.message });
              // Data will reload via real-time subscription
          } else {
              toast({ variant: "destructive", title: "Gagal", description: result.message });
          }
          setDeletingId(null);
      });
  }

  if (isLoading) {
      return <LoadingScreen message="Memuat Kategori..." />;
  }

  return (
    <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="text-lg font-semibold md:text-2xl flex items-center gap-2">
                    <Shapes className="h-5 w-5 text-muted-foreground" />
                    Manajemen Kategori
                </h1>
                <p className="text-sm text-muted-foreground">
                    Tambah, edit, atau hapus kategori produk Anda.
                </p>
            </div>
            <Button onClick={() => openDialog(null)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Tambah Kategori
            </Button>
        </div>
        
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Cari berdasarkan nama kategori..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full sm:w-80"
            />
        </div>

        <Card>
            <div className="hidden md:block">
               <div className="overflow-auto scrollbar-hide">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Nama Kategori</TableHead>
                            <TableHead>Jumlah Produk</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {filteredCategories.length > 0 ? (
                            filteredCategories.map((category) => (
                            <TableRow key={category.id.toString()}>
                                <TableCell className="font-medium">
                                    {category.name}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary">{getProductCountForCategory(category.name)}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => openDialog(category)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => setDeletingId(category.id)}>
                                        <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    {deletingId === category.id && (
                                        <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Tindakan ini akan menghapus kategori secara permanen.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel onClick={() => setDeletingId(null)}>Batal</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(category.id)} disabled={isPendingDelete}>
                                                {isPendingDelete ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menghapus...</>) : 'Ya, Hapus'}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                        </AlertDialogContent>
                                    )}
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                            ))
                        ) : (
                            <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center">
                                Tidak ada kategori yang cocok dengan pencarian Anda.
                            </TableCell>
                            </TableRow>
                        )}
                        </TableBody>
                    </Table>
                </div>
            </div>
            <div className="grid gap-4 md:hidden p-4">
                {filteredCategories.length > 0 ? (
                    filteredCategories.map((category) => (
                        <Card key={category.id} className="p-4 flex items-center justify-between">
                            <div>
                                <p className="font-bold">{category.name}</p>
                                <p className="text-sm text-muted-foreground">{getProductCountForCategory(category.name)} Produk</p>
                            </div>
                            <div className="flex items-center">
                                <Button variant="ghost" size="icon" onClick={() => openDialog(category)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => setDeletingId(category.id)}>
                                    <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                {deletingId === category.id && (
                                    <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                                        <AlertDialogDescription>Tindakan ini akan menghapus kategori secara permanen.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel onClick={() => setDeletingId(null)}>Batal</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(category.id)} disabled={isPendingDelete}>
                                            {isPendingDelete ? 'Menghapus...' : 'Ya, Hapus'}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                    </AlertDialogContent>
                                )}
                                </AlertDialog>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-10 col-span-full">
                        Tidak ada kategori yang cocok dengan pencarian Anda.
                    </div>
                )}
            </div>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-md">
                <CategoryForm category={editingCategory} onClose={handleDialogClose} />
            </DialogContent>
        </Dialog>
    </div>
  );
}
