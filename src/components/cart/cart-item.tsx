
'use client';

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, AlertCircle, Loader2 } from "lucide-react";
import { useCart, type CartItem as CartItemType } from "@/context/cart-context";
import { formatPrice } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

export function CartItem({ 
    item, 
    latestStock, 
    isStockLoading,
    isSelected,
    onToggleSelect,
}: { 
    item: CartItemType, 
    latestStock?: number, 
    isStockLoading: boolean,
    isSelected: boolean,
    onToggleSelect: (id: number) => void;
}) {
    const { updateItemDays, updateItemQuantity, removeItem } = useCart();
    
    const isStockAvailable = latestStock !== undefined && item.quantity <= latestStock;
    const stockIsZero = latestStock === 0;

    return (
        <div className="flex flex-col sm:flex-row gap-4 py-4">
            <div className="flex items-start sm:items-center pt-1 sm:pt-0">
                 <Checkbox 
                    id={`select-${item.id}`} 
                    checked={isSelected} 
                    onCheckedChange={() => onToggleSelect(item.id)}
                    aria-label={`Pilih ${item.name}`}
                 />
            </div>
            <Image
                src={item.images?.[0] || 'https://placehold.co/600x400.png'}
                alt={item.name}
                width={120}
                height={120}
                sizes="(max-width: 640px) 30vw, 120px"
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-md object-cover"
                data-ai-hint={item.data_ai_hint}
            />
            <div className="flex-grow flex flex-col gap-2">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold text-lg">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{formatPrice(item.price_per_day)}/hari</p>
                        {isStockLoading && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Memeriksa stok...</p>}
                        {!isStockLoading && !isStockAvailable && (
                            <div className="mt-2 text-sm text-destructive flex items-center gap-2 font-medium">
                                <AlertCircle className="h-4 w-4" />
                                {stockIsZero ? "Stok habis" : `Stok tidak cukup (tersisa: ${latestStock})`}
                            </div>
                        )}
                    </div>
                     <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-1" onClick={() => removeItem(item.id)}>
                        <X className="h-4 w-4" />
                        <span className="sr-only">Hapus item</span>
                    </Button>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-auto">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                           <label htmlFor={`days-${item.id}`} className="text-sm font-medium">Hari:</label>
                           <div className="flex items-center gap-1">
                                <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => updateItemDays(item.id, item.days - 1)} disabled={item.days <= 1}>-</Button>
                                <Input 
                                    type="number" 
                                    id={`days-${item.id}`} 
                                    value={item.days} 
                                    onChange={(e) => updateItemDays(item.id, parseInt(e.target.value) || 1)}
                                    className="h-9 w-16 text-center font-bold"
                                    min="1"
                                    disabled={stockIsZero}
                                />
                                <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => updateItemDays(item.id, item.days + 1)}>+</Button>
                           </div>
                        </div>
                         <div className="flex items-center gap-2">
                           <label htmlFor={`quantity-${item.id}`} className="text-sm font-medium">Jml:</label>
                           <div className="flex items-center gap-1">
                                <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => updateItemQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>-</Button>
                                <Input 
                                    type="number" 
                                    id={`quantity-${item.id}`} 
                                    value={item.quantity} 
                                    onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 1)}
                                    className="h-9 w-16 text-center font-bold"
                                    min="1"
                                    max={item.stock}
                                    disabled={stockIsZero}
                                />
                                <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => updateItemQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.stock}>+</Button>
                           </div>
                        </div>
                    </div>
                     <p className="font-bold text-lg sm:text-right w-full sm:w-auto mt-2 sm:mt-0">
                        {formatPrice(item.price_per_day * item.days * item.quantity)}
                     </p>
                </div>
            </div>
        </div>
    );
}
