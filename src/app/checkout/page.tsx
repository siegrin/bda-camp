
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

const generateWhatsAppMessage = (cart: CartItem[], total: number) => {
    let message = "Halo, saya ingin menyewa peralatan berikut:\n\n";
    cart.forEach(item => {
        message += `- ${item.name} (${item.days} hari)\n`;
    });
    message += `\n*Total: ${formatPrice(total)}*\n\n`;
    message += "Mohon konfirmasi ketersediaan dan instruksi pembayaran selanjutnya. Terima kasih!";
    return encodeURIComponent(message);
};


export default function CheckoutPage() {
    const { cart, total, clearCart } = useCart();
    const router = useRouter();
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Redirect to cart page if the cart is empty on mount.
        // The check is simple and doesn't need to depend on `cart` array directly,
        // which could cause re-renders. We only care about the initial state.
        if (cart.length === 0) {
            router.replace('/cart');
        }
    }, [cart.length, router]);
    

    useEffect(() => {
        async function loadSettings() {
            try {
                const loadedSettings = await getSettings();
                setSettings(loadedSettings);
            } catch (error) {
                console.error("Failed to load settings:", error);
            } finally {
                setIsLoading(false);
            }
        }
        
        loadSettings();
    }, []);
    
    const handleCheckout = async () => {
        if (!settings?.whatsapp_number) {
            alert("Nomor WhatsApp admin belum diatur.");
            return;
        }

        // Log the rental to create a pending order
        const result = await logRentalCheckout(cart);

        if (!result.success) {
            alert("Gagal membuat pesanan. Silakan coba lagi.");
            return;
        }

        const message = generateWhatsAppMessage(cart, total);
        const whatsappUrl = `https://wa.me/${settings.whatsapp_number}?text=${message}`;
        window.open(whatsappUrl, '_blank');
        
        // Clear cart after initiating checkout
        clearCart();
        
        // Redirect to a confirmation or profile page after a delay
        setTimeout(() => {
            router.push('/profile');
        }, 1500);
    };

    if (isLoading) {
        return <LoadingScreen />;
    }
    
    // If cart becomes empty after initial load (e.g., user removes last item in another tab)
    // or if the page was accessed directly with an empty cart.
    if (cart.length === 0) {
        // You can show a message or just let the useEffect redirect handle it.
        // Showing a loader-like state prevents a flash of content before redirect.
         return (
            <div className="container mx-auto flex min-h-[60vh] items-center justify-center">
                <p>Keranjang kosong, mengarahkan kembali...</p>
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
          <p className="mt-4 font-bold text-lg">Total Pembayaran: {formatPrice(total)}</p>
          
           <Button size="lg" className="mt-6 w-full" onClick={handleCheckout}>
                Lanjutkan ke WhatsApp
           </Button>
        </CardContent>
      </Card>
    </div>
  );
}
