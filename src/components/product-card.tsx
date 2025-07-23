
'use client';

import { useState } from 'react';
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useAuth } from '@/context/auth-context';
import { Pencil, Trash2 } from 'lucide-react';
import { ProductFormDialog } from './product-form-dialog';
import { DeleteProductDialog } from './delete-product-dialog';

interface ProductCardProps {
  product: Product;
  onActionComplete: () => void;
}

export function ProductCard({ product, onActionComplete }: ProductCardProps) {
  const imageUrl = product.images?.[0] || 'https://placehold.co/600x400.png';
  const { user } = useAuth();
  const [isFormDialogOpen, setFormDialogOpen] = useState(false);

  const isAdmin = user?.role === 'admin';

  const handleActionFinished = () => {
    setFormDialogOpen(false);
    onActionComplete();
  };

  return (
    <>
      <Card className="group flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full">
        <CardHeader className="p-0">
          <div className="relative">
            <Link href={`/equipment/${product.id}`}>
              <div className="absolute top-2 right-2 z-10 space-y-1 text-right">
                 <Badge
                    variant={product.availability === 'Tersedia' ? 'default' : 'destructive'}
                    className="w-fit"
                  >
                    {product.availability}
                  </Badge>
                   {product.stock < 5 && product.availability === 'Tersedia' && (
                     <Badge variant="secondary" className="w-fit">Stok: {product.stock}</Badge>
                  )}
              </div>
              <Image
                src={imageUrl}
                alt={product.name}
                width={600}
                height={400}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={cn("aspect-[3/2] w-full",
                    product.object_fit === 'contain' ? 'object-contain' : 'object-cover'
                )}
                data-ai-hint={product.data_ai_hint}
              />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <Link href={`/equipment/${product.id}`} className="hover:text-primary">
            <h3 className="text-base md:text-lg font-bold font-headline leading-tight truncate" title={product.name}>
              {product.name}
            </h3>
          </Link>
          <p className="mt-2 text-primary font-bold text-base">
            {formatPrice(product.price_per_day)} <span className="text-sm font-normal text-muted-foreground">/ hari</span>
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0 mt-auto">
          {isAdmin ? (
             <div className="w-full flex items-center justify-end gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8 md:w-auto md:px-4 md:py-2" onClick={() => setFormDialogOpen(true)}>
                    <Pencil className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">Edit</span>
                </Button>
                <DeleteProductDialog product={product} onDeleted={handleActionFinished}>
                    <Button variant="destructive" size="icon" className="h-8 w-8 md:w-auto md:px-4 md:py-2">
                        <Trash2 className="h-4 w-4 md:mr-2" />
                        <span className="hidden md:inline">Hapus</span>
                    </Button>
                </DeleteProductDialog>
             </div>
          ) : (
             <Button asChild className="w-full">
                <Link href={`/equipment/${product.id}`}>Lihat Detail</Link>
            </Button>
          )}
        </CardFooter>
      </Card>
      {isAdmin && (
        <ProductFormDialog 
          isOpen={isFormDialogOpen}
          onOpenChange={setFormDialogOpen}
          product={product}
          onFinished={handleActionFinished}
        />
      )}
    </>
  );
}
