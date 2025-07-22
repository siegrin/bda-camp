
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
    icons: {
      // Use the fetched logo_url. If it's null, Next.js will not add an icon tag.
      icon: settings.logo_url || undefined,
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

  const themeLoaderScript = `
    (function() {
      const theme = localStorage.getItem('theme');
      if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      }
    })();
  `;

  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeLoaderScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <Providers>
          <MainLayout settings={settings}>
            {children}
          </MainLayout>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
