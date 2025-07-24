
"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingCart, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { CartItem } from "@/components/cart/cart-item";

export default function CartPage() {
  const { 
      cart, 
      selectedItemsTotal, 
      validatedCart, 
      isCartValid, 
      isValidationLoading, 
      validateCart,
      selectedItemIds,
      toggleSelectItem,
      selectAllItems,
      deselectAllItems,
  } = useCart();
  
  const areAllItemsSelected = useMemo(() => {
    // Handle the edge case of an empty cart
    if (cart.length === 0) return false;
    return selectedItemIds.length === cart.length;
  }, [cart, selectedItemIds]);

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      selectAllItems();
    } else {
      deselectAllItems();
    }
  };

  useEffect(() => {
    if(cart.length > 0) {
      validateCart();
    }
  }, []); 
  
  const displayCart = validatedCart.length > 0 ? validatedCart : cart;
  const isCheckoutDisabled = !isCartValid || isValidationLoading || selectedItemIds.length === 0;

  if (cart.length === 0) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-8 text-center md:py-12">
        <ShoppingCart className="h-24 w-24 text-muted-foreground/50" />
        <h1 className="mt-6 font-headline text-3xl font-bold">Keranjang Anda Kosong</h1>
        <p className="mt-2 text-muted-foreground">Sepertinya Anda belum menambahkan peralatan apa pun.</p>
        <Button asChild className="mt-6">
          <Link href="/equipment">Jelajahi Peralatan</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl">Keranjang Sewa Anda</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Pilih item yang ingin Anda sewa dan lanjutkan ke pembayaran.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="p-4 sm:p-6 border-b">
                 <div className="flex items-center space-x-3">
                    <Checkbox 
                        id="select-all" 
                        checked={areAllItemsSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label="Pilih semua item"
                    />
                    <label
                        htmlFor="select-all"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Pilih Semua Item
                    </label>
                </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 divide-y">
                {displayCart.map((item) => (
                    <CartItem 
                        key={item.id} 
                        item={item} 
                        latestStock={item.stock} 
                        isStockLoading={isValidationLoading}
                        isSelected={selectedItemIds.includes(item.id)}
                        onToggleSelect={toggleSelectItem}
                    />
                ))}
            </CardContent>
          </Card>
        </div>
        
        <div>
            <Card className="sticky top-20">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Ringkasan</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                         <div className="flex justify-between text-muted-foreground">
                            <span>Item dipilih</span>
                            <span>{selectedItemIds.length} dari {cart.length}</span>
                        </div>
                        <div className="flex justify-between text-lg">
                            <span>Subtotal</span>
                            <span>{formatPrice(selectedItemsTotal)}</span>
                        </div>
                         <Separator />
                        <div className="flex justify-between text-xl font-bold">
                            <span>Total</span>
                            <span>{formatPrice(selectedItemsTotal)}</span>
                        </div>
                         {!isValidationLoading && !isCartValid && (
                            <div className="mt-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                <span>Beberapa item yang dipilih stoknya tidak tersedia. Harap perbarui pilihan Anda.</span>
                            </div>
                        )}
                    </div>
                    <Button asChild size="lg" className="mt-6 w-full" disabled={isCheckoutDisabled}>
                        <Link href="/checkout">
                            {isValidationLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Lanjutkan ke Pembayaran
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
