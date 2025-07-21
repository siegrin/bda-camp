
'use client';

import { useState, useEffect, useTransition, ChangeEvent, useRef } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Product, Category, Subcategory } from '@/lib/types';
import { getDashboardCategories, getDashboardSubcategories } from '@/lib/products';
import { addProduct, updateProduct } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { X, Loader2, Image as ImageIcon, Plus, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { suggestTags } from '@/ai/flows/suggest-tags-flow';

interface ProductFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onFinished: () => void;
}

export function ProductFormDialog({ isOpen, onOpenChange, product, onFinished }: ProductFormDialogProps) {
    if (!isOpen) return null;
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{product ? "Edit Produk" : "Tambah Produk Baru"}</DialogTitle>
                    <DialogDescription>
                        {product ? "Ubah detail produk yang sudah ada." : "Isi detail untuk produk baru."}
                    </DialogDescription>
                </DialogHeader>
                <ProductForm product={product} onFinished={onFinished} />
            </DialogContent>
        </Dialog>
    );
}

function ProductForm({ product, onFinished }: { product?: Product | null, onFinished: () => void }) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [isSuggesting, startSuggestionTransition] = useTransition();
    
    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState(product?.category_id?.toString() || "");
    const [existingImages, setExistingImages] = useState<string[]>(product?.images || []);
    const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
    const [specs, setSpecs] = useState(Object.entries(product?.specs || {}));

    // Refs for AI suggestion
    const nameRef = useRef<HTMLInputElement>(null);
    const descriptionRef = useRef<HTMLTextAreaElement>(null);
    const hintRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        async function loadDropdowns() {
            const [cats, subcats] = await Promise.all([
                getDashboardCategories(),
                getDashboardSubcategories()
            ]);
            setCategories(cats);
            setSubcategories(subcats);
            if (product?.category_id) {
                 setFilteredSubcategories(subcats.filter(sc => sc.category_id === product.category_id));
            }
        }
        loadDropdowns();
    }, [product]);

    useEffect(() => {
        if (selectedCategoryId) {
            setFilteredSubcategories(subcategories.filter(sc => sc.category_id === parseInt(selectedCategoryId)));
        } else {
            setFilteredSubcategories([]);
        }
    }, [selectedCategoryId, subcategories]);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setNewImageFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };
    
    const handleRemoveExistingImage = (index: number) => {
        setExistingImages(existingImages.filter((_, i) => i !== index));
    }

    const handleRemoveNewImage = (index: number) => {
        setNewImageFiles(newImageFiles.filter((_, i) => i !== index));
    }

    const handleAddSpec = () => setSpecs([...specs, ["", ""]]);
    const handleRemoveSpec = (index: number) => setSpecs(specs.filter((_, i) => i !== index));
    const handleSpecChange = (index: number, key: string, value: string) => {
        const newSpecs = [...specs];
        newSpecs[index] = [key, value];
        setSpecs(newSpecs);
    };

    const handleSuggestHint = () => {
        const productName = nameRef.current?.value;
        const productDescription = descriptionRef.current?.value;

        if (!productName || !productDescription) {
            toast({
                variant: 'destructive',
                title: 'Info Dibutuhkan',
                description: 'Harap isi nama produk dan deskripsi terlebih dahulu.',
            });
            return;
        }

        startSuggestionTransition(async () => {
            try {
                const result = await suggestTags({ productName, productDescription });
                if (hintRef.current) {
                    hintRef.current.value = result.tags;
                }
                 toast({
                    title: 'Saran Dibuat!',
                    description: `Saran tag: "${result.tags}"`,
                });
            } catch (error) {
                console.error('Error suggesting tags:', error);
                toast({
                    variant: 'destructive',
                    title: 'Gagal Membuat Saran',
                    description: 'Terjadi kesalahan saat menghubungi AI.',
                });
            }
        });
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        startTransition(async () => {
            const formData = new FormData(event.currentTarget);
            
            existingImages.forEach((img, index) => {
                formData.append(`image_existing_${index}`, img);
            });
            newImageFiles.forEach((file, index) => {
                formData.append(`image_new_${index}`, file);
            });
            
            const action = product ? updateProduct.bind(null, product.id) : addProduct;
            const result = await action(formData);

            if (result.success) {
                toast({ title: "Sukses!", description: result.message });
                onFinished();
            } else {
                toast({ variant: "destructive", title: "Gagal", description: result.message });
            }
        });
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nama Produk</Label>
                        <Input id="name" name="name" defaultValue={product?.name} required ref={nameRef} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="price_per_day">Harga/Hari (IDR)</Label>
                        <Input id="price_per_day" name="price_per_day" type="number" defaultValue={product?.price_per_day} required/>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="category_id">Kategori</Label>
                        <Select name="category_id" defaultValue={product?.category_id?.toString()} onValueChange={setSelectedCategoryId} required>
                            <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                            <SelectContent>
                                {categories.map(cat => <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="subcategory_id">Subkategori</Label>
                        <Select name="subcategory_id" defaultValue={product?.subcategory_id?.toString()} disabled={!selectedCategoryId} required>
                             <SelectTrigger><SelectValue placeholder="Pilih subkategori" /></SelectTrigger>
                             <SelectContent>
                                {filteredSubcategories.map(subcat => <SelectItem key={subcat.id} value={subcat.id.toString()}>{subcat.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="availability">Ketersediaan</Label>
                        <Select name="availability" defaultValue={product?.availability || 'Tersedia'} required>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Tersedia">Tersedia</SelectItem>
                                <SelectItem value="Tidak Tersedia">Tidak Tersedia</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="data_ai_hint">Petunjuk AI Gambar</Label>
                        <div className="flex items-center gap-2">
                          <Input id="data_ai_hint" name="data_ai_hint" defaultValue={product?.data_ai_hint} placeholder="e.g. camping tent" ref={hintRef} />
                           <Button type="button" variant="outline" size="icon" onClick={handleSuggestHint} disabled={isSuggesting}>
                                {isSuggesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                           </Button>
                        </div>
                    </div>
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="description">Deskripsi</Label>
                    <Textarea id="description" name="description" defaultValue={product?.description} required ref={descriptionRef} />
                </div>
                
                <div className="space-y-2">
                    <Label>Gambar Produk</Label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                        {existingImages.map((imgSrc, index) => (
                            <div key={index} className="relative group aspect-[3/2]">
                                <Image src={imgSrc} alt={`Pratinjau ${index + 1}`} fill className="object-cover rounded-md border" />
                                <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleRemoveExistingImage(index)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                         {newImageFiles.map((file, index) => (
                            <div key={index} className="relative group aspect-[3/2]">
                                <Image src={URL.createObjectURL(file)} alt={`Pratinjau baru ${index + 1}`} fill className="object-cover rounded-md border" />
                                <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleRemoveNewImage(index)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        <Label htmlFor="image-upload" className={cn("flex items-center justify-center aspect-[3/2] rounded-md border-2 border-dashed cursor-pointer", "hover:border-primary hover:bg-accent")}>
                            <div className="text-center">
                                <Plus className="mx-auto h-8 w-8 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">Tambah</span>
                            </div>
                            <Input id="image-upload" type="file" accept="image/*" className="sr-only" onChange={handleFileChange} multiple />
                        </Label>
                    </div>
                </div>


                <div className="space-y-2">
                    <Label>Spesifikasi</Label>
                    {specs.map(([key, value], index) => (
                        <div key={index} className="flex items-center gap-2">
                            <Input name={`spec_name_${index}`} defaultValue={key} onChange={e => handleSpecChange(index, e.target.value, value)} placeholder="Nama Spek (e.g. Berat)" />
                            <Input name={`spec_value_item_${index}`} defaultValue={value} onChange={e => handleSpecChange(index, key, e.target.value)} placeholder="Nilai Spek (e.g. 2kg)" />
                            <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveSpec(index)}><X className="h-4 w-4 text-destructive" /></Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={handleAddSpec}>Tambah Spesifikasi</Button>
                </div>
            </div>

            <DialogFooter className="mt-6 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => onFinished()}>Batal</Button>
                <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Simpan
                </Button>
            </DialogFooter>
        </form>
    );
}
