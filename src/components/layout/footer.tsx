
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { Twitter, Facebook, Instagram, Loader2 } from "lucide-react";
import type { SiteSettings } from "@/lib/types";
import { subscribeToNewsletter } from '@/lib/actions';
import { NewsletterForm } from './newsletter-form';


export function Footer({ settings }: { settings: SiteSettings }) {
  const social = settings.social || { twitter: '#', facebook: '#', instagram: '#' };

  return (
    <footer className="border-t bg-secondary/50">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4 md:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <Logo className="h-8 w-8 text-primary" logoUrl={settings.logo_url} svgContent={settings.logo_svg_content} />
              <span className="font-headline text-lg font-bold">
                BDA.Camp
              </span>
            </Link>
            <p className="text-muted-foreground">
              Petualangan Anda dimulai di sini. Peralatan berkualitas untuk pengalaman tak terlupakan.
            </p>
            <div className="flex space-x-4">
              <Link href={social.twitter || '#'} className="text-muted-foreground hover:text-primary" target="_blank" rel="noopener noreferrer">
                <Twitter className="h-6 w-6" />
              </Link>
              <Link href={social.facebook || '#'} className="text-muted-foreground hover:text-primary" target="_blank" rel="noopener noreferrer">
                <Facebook className="h-6 w-6" />
              </Link>
              <Link href={social.instagram || '#'} className="text-muted-foreground hover:text-primary" target="_blank" rel="noopener noreferrer">
                <Instagram className="h-6 w-6" />
              </Link>
            </div>
          </div>
          <div>
            <h3 className="font-headline font-bold">Tautan Cepat</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/equipment" className="text-muted-foreground hover:text-primary">Katalog</Link></li>
              <li><Link href="/about" className="text-muted-foreground hover:text-primary">Cara Pesan</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary">Hubungi Kami</Link></li>
              <li><Link href="/cart" className="text-muted-foreground hover:text-primary">Keranjang Saya</Link></li>
              <li><Link href="/privacy-policy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-headline font-bold">Hubungi Kami</h3>
            <ul className="mt-4 space-y-2 text-muted-foreground">
              <li>Email: {settings.email || 'N/A'}</li>
              <li>
                Telepon: <a href={`tel:${settings.whatsapp_number}`} className="hover:text-primary">{settings.phone || 'N/A'}</a>
              </li>
              <li>{settings.address || 'N/A'}</li>
            </ul>
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <h3 className="font-headline font-bold">Berita</h3>
            <p className="mt-4 text-muted-foreground">
              Dapatkan info terbaru tentang peralatan dan penawaran kami.
            </p>
            <NewsletterForm />
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} BDA.Camp. Hak cipta dilindungi.</p>
        </div>
      </div>
    </footer>
  );
}
