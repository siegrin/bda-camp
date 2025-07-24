
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { getSettings, logRentalCheckout } from "@/lib/actions";
import { formatPrice } from "@/lib/utils";
import type { SiteSettings, CartItem } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/loading-screen";

const generateWhatsAppMessage = (items: CartItem[], total: number) => {
    let message = "Halo, saya ingin menyewa peralatan berikut:\n\n";
    items.forEach(item => {
        message += `- ${item.name} (${item.quantity} unit, ${item.days} hari)\n`;
    });
    message += `\n*Total: ${formatPrice(total)}*\n\n`;
    message += "Mohon konfirmasi ketersediaan dan instruksi pembayaran selanjutnya. Terima kasih!";
    return encodeURIComponent(message);
};


export default function CheckoutPage() {
    const { selectedItems, selectedItemsTotal, clearCart } = useCart();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [isSettingsLoading, setSettingsLoading] = useState(true);

    useEffect(() => {
        if (!isSettingsLoading && selectedItems.length === 0) {
            router.replace('/cart');
        }
    }, [selectedItems.length, router, isSettingsLoading]);
    
    useEffect(() => {
        async function loadSettings() {
            setSettingsLoading(true);
            const loadedSettings = await getSettings();
            setSettings(loadedSettings);
            setSettingsLoading(false);
        }
        loadSettings();
    }, []);
    
    const handleCheckout = async () => {
        if (!settings?.whatsapp_number) {
            alert("Nomor WhatsApp admin belum diatur.");
            return;
        }
        setIsLoading(true);

        const result = await logRentalCheckout(selectedItems);

        if (!result.success) {
            alert("Gagal membuat pesanan. Silakan coba lagi.");
             setIsLoading(false);
            return;
        }

        const message = generateWhatsAppMessage(selectedItems, selectedItemsTotal);
        const whatsappUrl = `https://wa.me/${settings.whatsapp_number}?text=${message}`;
        
        window.open(whatsappUrl, '_blank');

        // This will now only remove the items that were just checked out.
        clearCart();
        router.push('/profile');
    };
    
    if (isSettingsLoading) {
        return <LoadingScreen message="Memuat informasi checkout..." />;
    }
    
    if (selectedItems.length === 0) {
         return (
            <div className="container mx-auto flex min-h-[60vh] items-center justify-center">
                <p>Tidak ada item dipilih, mengarahkan kembali ke keranjang...</p>
            </div>
        );
    }

    if (!settings?.whatsapp_number) {
         return (
             <div className="container mx-auto flex min-h-[60vh] items-center justify-center">
                <Card className="w-full max-w-lg text-center">
                    <CardHeader>
                        <CardTitle className="font-headline text-3xl">Konfigurasi Pembayaran Tidak Lengkap</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Maaf, admin belum mengatur nomor WhatsApp untuk pembayaran. Silakan hubungi kami melalui kontak yang tersedia.
                        </p>
                        <Button asChild className="mt-6">
                            <Link href="/">Kembali ke Beranda</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
         );
    }
    
  return (
    <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-8 md:py-12">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Send className="h-10 w-10" />
          </div>
          <CardTitle className="mt-4 font-headline text-3xl">Konfirmasi Pesanan</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Anda akan diarahkan ke WhatsApp untuk menyelesaikan pesanan Anda langsung dengan admin kami.
          </p>
          <p className="mt-4 font-bold text-lg">Total Pembayaran: {formatPrice(selectedItemsTotal)}</p>
          
           <Button size="lg" className="mt-6 w-full" onClick={handleCheckout} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Lanjutkan ke WhatsApp
           </Button>
        </CardContent>
      </Card>
    </div>
  );
}
