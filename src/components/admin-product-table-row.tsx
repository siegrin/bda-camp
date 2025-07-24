
'use client';

import Image from "next/image";
import Link from "next/link";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { DeleteProductDialog } from "@/components/delete-product-dialog";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AdminProductTableRow({ product, onEdit, onDeleted }: { product: Product, onEdit: () => void, onDeleted: () => void }) {
    const imageUrl = product.images?.[0] || 'https://placehold.co/600x400.png';
    return (
        <TableRow>
            <TableCell>
                <Image
                    src={imageUrl}
                    alt={product.name}
                    width={64}
                    height={64}
                    sizes="64px"
                    className={cn(
                      "rounded-md w-16 h-16",
                      product.object_fit === 'contain' ? 'object-contain' : 'object-cover'
                    )}
                    data-ai-hint={product.data_ai_hint}
                />
            </TableCell>
            <TableCell className="font-medium">
                <Link href={`/equipment/${product.id}`} className="hover:underline">{product.name}</Link>
                <div className="text-xs text-muted-foreground lg:hidden">{formatPrice(product.price_per_day)}</div>
            </TableCell>
            <TableCell className="hidden sm:table-cell">
                <Badge variant="outline">{product.category}</Badge>
            </TableCell>
            <TableCell className="hidden lg:table-cell">
                <div className="font-medium">{formatPrice(product.price_per_day)}</div>
                <div className="text-xs text-muted-foreground">per hari</div>
            </TableCell>
            <TableCell className="hidden sm:table-cell">
                <Badge variant={product.availability === 'Tersedia' ? 'default' : 'destructive'}>
                    {product.availability}
                </Badge>
            </TableCell>
            <TableCell className="hidden lg:table-cell">
                {product.stock}
            </TableCell>
            <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={onEdit}>
                    <Pencil className="h-4 w-4" />
                </Button>
                <DeleteProductDialog product={product} onDeleted={onDeleted}>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </DeleteProductDialog>
            </TableCell>
        </TableRow>
    );
}
