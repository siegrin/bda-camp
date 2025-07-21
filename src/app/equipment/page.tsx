
'use client';

import { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { getProducts, getProductFilters } from "@/lib/products";
import { Breadcrumb } from "@/components/breadcrumb";
import { Pagination } from "@/components/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search } from "lucide-react";
import type { Product, Category, Subcategory } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { LoadingScreen } from "@/components/loading-screen";

const ITEMS_PER_PAGE = 9;

type SortOption = 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'relevance';


export default function EquipmentPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const subcategory = searchParams.get('subcategory') || '';
  const sort = (searchParams.get('sort') as SortOption) || 'relevance';
  const currentPage = parseInt(searchParams.get('page') || '1');

  const [localSearchTerm, setLocalSearchTerm] = useState(q);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const [productsData, filtersData] = await Promise.all([
      getProducts(),
      getProductFilters()
    ]);
    setAllProducts(productsData.products || []);
    setCategories(filtersData.categories || []);
    setSubcategories(filtersData.subcategories || []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);
  
  const filteredSubcategories = useMemo(() => {
    if (!category) return subcategories;
    const selectedCategory = categories.find(c => c.name === category);
    if (!selectedCategory) return [];
    return subcategories.filter(sc => sc.category_id === selectedCategory.id);
  }, [category, categories, subcategories]);

  const filteredAndSortedProducts = useMemo(() => {
    let products = allProducts;
    if (category) {
        products = products.filter(p => p.category === category);
    }
    if (subcategory) {
        products = products.filter(p => p.subcategory === subcategory);
    }
    if (q) {
        products = products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
    }

    switch(sort) {
        case 'price-asc':
            products.sort((a, b) => a.price_per_day - b.price_per_day);
            break;
        case 'price-desc':
            products.sort((a, b) => b.price_per_day - a.price_per_day);
            break;
        case 'name-asc':
            products.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            products.sort((a, b) => b.name.localeCompare(a.name));
            break;
    }

    return products;
  }, [allProducts, category, subcategory, q, sort]);

  const totalPages = Math.ceil(filteredAndSortedProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  const handleActionComplete = useCallback(() => {
    loadData();
  }, [loadData]);
  
  const updateQueryParams = (updates: { key: string, value: string | null }[]) => {
    const params = new URLSearchParams(searchParams.toString());
    updates.forEach(({ key, value }) => {
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
    });
    
    // Always reset page on filter change
    params.set('page', '1');
    router.push(`/equipment?${params.toString()}`);
  }

  const handleCategoryChange = (newCategory: string) => {
    const updates = [
        { key: 'category', value: newCategory === 'all' ? null : newCategory },
        { key: 'subcategory', value: null } // Reset subcategory
    ];
    updateQueryParams(updates);
  }

  const handleSubcategoryChange = (newSubcategory: string) => {
      updateQueryParams([{ key: 'subcategory', value: newSubcategory === 'all' ? null : newSubcategory }]);
  }
  
  const handleSearchSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      updateQueryParams([{ key: 'q', value: localSearchTerm.trim() ? localSearchTerm.trim() : null }]);
  }

  const breadcrumbItems = [
    { name: "Beranda", href: "/" },
    { name: "Katalog", href: "/equipment" }
  ];

  if (category) {
    breadcrumbItems.push({ name: category, href: `/equipment?category=${encodeURIComponent(category)}` });
    if (subcategory) {
        breadcrumbItems.push({ name: subcategory, href: `/equipment?category=${encodeURIComponent(category)}&subcategory=${encodeURIComponent(subcategory)}` });
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Breadcrumb items={breadcrumbItems} />
      <div className="text-center mt-4">
        <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl">Katalog Peralatan</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Jelajahi berbagai macam perlengkapan berkualitas tinggi kami untuk petualangan Anda berikutnya.
        </p>
      </div>
      
      <main className="mt-8">
            <div className="mb-6 flex flex-col gap-4 rounded-lg border bg-card p-4">
                <form onSubmit={handleSearchSubmit} className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari produk berdasarkan nama..."
                        value={localSearchTerm}
                        onChange={(e) => setLocalSearchTerm(e.target.value)}
                        className="w-full pl-9"
                    />
                </form>
                <div className="grid flex-grow grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Select value={category || 'all'} onValueChange={handleCategoryChange}>
                        <SelectTrigger><SelectValue placeholder="Pilih Kategori" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Kategori</SelectItem>
                            {categories.map(cat => <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                     <Select value={subcategory || 'all'} onValueChange={handleSubcategoryChange} disabled={!category}>
                        <SelectTrigger><SelectValue placeholder="Pilih Subkategori" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Subkategori</SelectItem>
                            {filteredSubcategories.map(sub => <SelectItem key={sub.id} value={sub.name}>{sub.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <div>
                       <Select value={sort} onValueChange={(v) => updateQueryParams([{ key: 'sort', value: v as SortOption }])}>
                            <SelectTrigger>
                                <SelectValue placeholder="Urutkan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="relevance">Relevansi</SelectItem>
                                <SelectItem value="price-asc">Harga: Terendah</SelectItem>
                                <SelectItem value="price-desc">Harga: Tertinggi</SelectItem>
                                <SelectItem value="name-asc">Nama: A-Z</SelectItem>
                                <SelectItem value="name-desc">Nama: Z-A</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

             {isLoading ? (
                <LoadingScreen message="Memuat Katalog..." />
            ) : paginatedProducts.length > 0 ? (
                <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-6">
                    {paginatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} onActionComplete={handleActionComplete} />
                    ))}
                </div>
                <div className="mt-12 flex justify-center">
                    <Pagination currentPage={currentPage} totalPages={totalPages} />
                </div>
                </>
            ) : (
                <div className="text-center py-16 h-96 flex flex-col items-center justify-center rounded-lg border-dashed border-2">
                    <h2 className="text-2xl font-bold">Produk Tidak Ditemukan</h2>
                    <p className="text-muted-foreground mt-2">Maaf, kami tidak dapat menemukan produk yang cocok dengan kriteria Anda.</p>
                    <Button asChild className="mt-4" onClick={() => {
                        setLocalSearchTerm('');
                        router.push('/equipment');
                    }}>
                        <Link href="/equipment">Lihat Semua Produk</Link>
                    </Button>
                </div>
            )}
        </main>
    </div>
  );
}
