
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Pencil, Trash2 } from "lucide-react";
import { ProductFormDialog } from '@/components/product-form-dialog';
import { DeleteProductDialog } from '@/components/delete-product-dialog';
import { Button } from '@/components/ui/button';
import type { Product } from "@/lib/types";
import { getProductById } from '@/lib/products';

export function AdminToolbar({ product }: { product: Product }) {
    const [isFormOpen, setFormOpen] = useState(false);
    const router = useRouter();

    const handleActionComplete = async () => {
        // After editing, we just need to refresh the page to get new data
        router.refresh();
    }
    
    const handleProductDeleted = () => {
        // After deleting, the product is gone, so redirect to the main catalog
        router.push('/equipment');
    }

    return (
        <>
            <div className="mb-4 flex items-center justify-between rounded-lg border bg-secondary/50 p-3">
                <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Mode Admin</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setFormOpen(true)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                    <DeleteProductDialog product={product} onDeleted={handleProductDeleted}>
                        <Button variant="destructive" size="sm">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus
                        </Button>
                    </DeleteProductDialog>
                </div>
            </div>
            <ProductFormDialog
                isOpen={isFormOpen}
                onOpenChange={setFormOpen}
                product={product}
                onFinished={() => {
                    setFormOpen(false);
                    handleActionComplete();
                }}
            />
        </>
    );
}
