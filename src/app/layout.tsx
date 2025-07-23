
import type { Metadata } from "next";
import { Playfair_Display, PT_Sans } from "next/font/google";
import { MainLayout } from "@/components/layout/main-layout";
import { getSettings } from "@/lib/actions";
import type { SiteSettings } from "@/lib/types";
import Script from "next/script";
import { cn } from "@/lib/utils";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-headline",
  display: 'swap',
});

const ptSans = PT_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-body",
  display: 'swap',
});


// Use generateMetadata to dynamically set page metadata, including the favicon
export async function generateMetadata(): Promise<Metadata> {
  let settings: SiteSettings = {
    email: '', phone: '', address: '', whatsapp_number: '', 
    social: { twitter: '#', facebook: '#', instagram: '#' },
    logo_url: null,
  };

  try {
    settings = await getSettings();
  } catch (error) {
    console.error("Failed to fetch settings for metadata generation:", error);
  }

  return {
    title: {
      default: "BDA.Camp - Sewa Peralatan Kemah & Outdoor",
      template: `%s | BDA.Camp`,
    },
    description: "Penyewaan perlengkapan kemah yang terjangkau dan andal – Siap untuk setiap medan. Sewa tenda, sleeping bag, kompor, dan lainnya.",
    keywords: ["sewa alat camping", "sewa tenda", "rental outdoor", "perlengkapan kemah", "BDA.Camp"],
    openGraph: {
      title: "BDA.Camp - Sewa Peralatan Kemah & Outdoor",
      description: "Penyewaan perlengkapan kemah yang terjangkau dan andal.",
      url: "https://bdacamp.vercel.app/",
      siteName: 'BDA.Camp',
      images: [
        {
          url: settings.logo_url || 'https://placehold.co/1200x630.png',
          width: 1200,
          height: 630,
          alt: 'BDA.Camp Logo'
        },
      ],
      locale: 'id_ID',
      type: 'website',
    },
    icons: {
      icon: settings.logo_url || "/favicon.ico", 
    }
  };
}


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();

  return (
    <html lang="id" className={cn(playfair.variable, ptSans.variable)} suppressHydrationWarning>
      <head />
      <body>
        <MainLayout settings={settings}>{children}</MainLayout>
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-7B51P422E1" />
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-7B51P422E1');
          `}
        </Script>
      </body>
    </html>
  );
}
