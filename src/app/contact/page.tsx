
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getSettings } from '@/lib/actions';
import type { SiteSettings } from '@/lib/types';
import { LoadingScreen } from '@/components/loading-screen';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Hubungi Kami",
  description: "Hubungi BDA.Camp untuk pertanyaan, bantuan, atau informasi lebih lanjut. Kami siap membantu petualangan Anda.",
};


const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function ContactPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (!settings) {
     return (
       <div className="container mx-auto flex min-h-[60vh] items-center justify-center">
         <p>Gagal memuat informasi kontak.</p>
       </div>
     )
  }

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email',
      value: settings.email,
      href: `mailto:${settings.email}`,
    },
    {
      icon: Phone,
      title: 'WhatsApp',
      value: settings.phone,
      href: `https://wa.me/${settings.whatsapp_number}`,
    },
    {
      icon: MapPin,
      title: 'Alamat',
      value: settings.address,
      href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`,
    },
  ];

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
      <motion.div
        className="text-center"
        initial="hidden"
        animate="visible"
        variants={itemVariants}
      >
        <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl">Hubungi Kami</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Punya pertanyaan atau butuh bantuan? Kami siap membantu Anda.
        </p>
      </motion.div>

      <motion.div
        className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {contactMethods.map((method, index) => (
          <motion.div key={index} variants={itemVariants}>
            <Card className="h-full text-center">
              <CardHeader>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <method.icon className="h-8 w-8" />
                </div>
                <CardTitle className="mt-4 font-headline">{method.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{method.value || 'N/A'}</p>
                {method.value && (
                  <Button asChild variant="link" className="mt-2">
                    <Link href={method.href} target="_blank" rel="noopener noreferrer">
                      Kirim Pesan
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

    </div>
  );
}
