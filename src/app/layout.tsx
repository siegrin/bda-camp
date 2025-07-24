
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import { MainLayout } from "@/components/layout/main-layout";
import { getSettings } from "@/lib/actions";
import type { SiteSettings } from "@/lib/types";
import { Providers } from "@/context/providers";
import "./globals.css";

// Use generateMetadata to dynamically set page metadata, including the favicon
export async function generateMetadata(): Promise<Metadata> {
  let settings: SiteSettings = {
    email: '', phone: '', address: '', whatsapp_number: '', 
    social: { twitter: '#', facebook: '#', instagram: '#' },
    logo_url: null,
  };

  try {
    // This function will now be properly awaited by Next.js during the build process
    settings = await getSettings();
  } catch (error) {
    console.error("Failed to fetch settings for metadata generation:", error);
  }

  return {
    title: {
      default: "BDA.Camp",
      template: `%s | BDA.Camp`,
    },
    description: "Penyewaan perlengkapan kemah yang terjangkau dan andal – Siap untuk setiap medan.",
    // The 'icons' property can be an object with different icon types.
    // We provide a dynamic URL from settings. If it's null, Next.js will automatically
    // look for a static file like /icon.tsx or /favicon.ico in the app directory.
    icons: {
      icon: settings.logo_url || undefined, // Dynamic icon URL
      // You can also specify other icon types if needed, for example:
      // apple: '/apple-icon.png',
    }
  };
}


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch settings here to pass them down to client components like the Footer.
  const settings = await getSettings();

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <Providers>
          <MainLayout settings={settings}>{children}</MainLayout>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
