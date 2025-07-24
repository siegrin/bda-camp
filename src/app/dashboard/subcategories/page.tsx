
'use client';

import { useState, useEffect, useTransition, useMemo } from 'react';
import { getDashboardSubcategories, getDashboardCategories, getDashboardProducts } from "@/lib/products";
import { deleteSubcategory } from '@/lib/actions';
import { Card } from "@/components/ui/card";
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
import { Dialog } from "@/components/ui/dialog";
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
import { Pencil, Trash2, PlusCircle, Loader2, Layers3, Search } from "lucide-react";
import type { Product, Category, Subcategory } from "@/lib/types";
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { LoadingScreen } from '@/components/loading-screen';
import { SubcategoryForm } from '@/components/dashboard/subcategory-form';

export default function SubcategoriesPage() {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { toast } = useToast();
  const [isPendingDelete, startDeleteTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState('');
  const supabase = createClient();


  async function loadData() {
    const [subcats, cats, prods] = await Promise.all([
        getDashboardSubcategories(),
        getDashboardCategories(),
        getDashboardProducts()
    ]);
    setSubcategories(subcats);
    setCategories(cats);
    setProducts(prods);
    setIsLoading(false);
  }

  useEffect(() => {
      loadData();

      const channel = supabase.channel('subcategories-changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'subcategories' }, loadData)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, loadData)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, loadData)
          .subscribe();

      return () => {
          supabase.removeChannel(channel);
      };
  }, [supabase]);
  
  const filteredSubcategories = useMemo(() => {
    return subcategories.filter(sub => 
        sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [subcategories, searchTerm]);

  const getProductCountForSubcategory = (subcategoryName: string) => {
    return products.filter(p => p.subcategory === subcategoryName).length;
  };
  
  const openDialog = (subcategory: Subcategory | null) => {
    setEditingSubcategory(subcategory);
    setDialogOpen(true);
  }

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingSubcategory(null);
  }

  const handleDelete = (id: number) => {
      startDeleteTransition(async () => {
          const result = await deleteSubcategory(id);
          if (result.success) {
              toast({ title: "Sukses!", description: result.message });
          } else {
              toast({ variant: "destructive", title: "Gagal", description: result.message });
          }
          setDeletingId(null);
      });
  }

  if (isLoading) {
      return <LoadingScreen message="Memuat Subkategori..." />;
  }

  return (
    <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="text-lg font-semibold md:text-2xl flex items-center gap-2">
                    <Layers3 className="h-5 w-5 text-muted-foreground" />
                    Manajemen Subkategori
                </h1>
                <p className="text-sm text-muted-foreground">
                    Tambah, edit, atau hapus subkategori produk Anda.
                </p>
            </div>
            <Button onClick={() => openDialog(null)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Tambah Subkategori
            </Button>
        </div>
        
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Cari subkategori atau induk kategori..."
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
                            <TableHead>Nama Subkategori</TableHead>
                            <TableHead>Induk Kategori</TableHead>
                            <TableHead>Jumlah Produk</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {filteredSubcategories.length > 0 ? (
                            filteredSubcategories.map((subcategory) => (
                            <TableRow key={subcategory.id.toString()}>
                                <TableCell className="font-medium">{subcategory.name}</TableCell>
                                <TableCell><Badge variant="outline">{subcategory.category}</Badge></TableCell>
                                <TableCell><Badge variant="secondary">{getProductCountForSubcategory(subcategory.name)}</Badge></TableCell>
                                <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => openDialog(subcategory)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => setDeletingId(subcategory.id)}>
                                        <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    {deletingId === subcategory.id && (
                                        <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Tindakan ini akan menghapus subkategori secara permanen.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel onClick={() => setDeletingId(null)}>Batal</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(subcategory.id)} disabled={isPendingDelete}>
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
                            <TableCell colSpan={4} className="h-24 text-center">
                                Tidak ada subkategori yang cocok dengan pencarian Anda.
                            </TableCell>
                            </TableRow>
                        )}
                        </TableBody>
                    </Table>
                </div>
             </div>
             <div className="grid gap-4 md:hidden">
                {filteredSubcategories.length > 0 ? (
                    filteredSubcategories.map((subcategory) => (
                        <Card key={subcategory.id} className="p-4 flex items-start justify-between">
                            <div>
                                <p className="font-bold">{subcategory.name}</p>
                                <div className="mt-1 text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                                    <Badge variant="outline">{subcategory.category}</Badge>
                                    <Badge variant="secondary">{getProductCountForSubcategory(subcategory.name)} Produk</Badge>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <Button variant="ghost" size="icon" onClick={() => openDialog(subcategory)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => setDeletingId(subcategory.id)}>
                                    <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                {deletingId === subcategory.id && (
                                    <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                                        <AlertDialogDescription>Tindakan ini akan menghapus subkategori secara permanen.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel onClick={() => setDeletingId(null)}>Batal</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(subcategory.id)} disabled={isPendingDelete}>
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
                        Tidak ada subkategori yang cocok dengan pencarian Anda.
                    </div>
                )}
            </div>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
            <SubcategoryForm subcategory={editingSubcategory} categories={categories} onClose={handleDialogClose} />
        </Dialog>
    </div>
  );
}
