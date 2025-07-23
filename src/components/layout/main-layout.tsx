
"use client";

import { Header } from "@/components/layout/header";
import React from "react";
import { usePathname } from 'next/navigation';
import type { SiteSettings } from "@/lib/types";
import { AdminModeIndicator } from "@/components/admin-mode-indicator";
import { Chatbot } from "../chatbot";
import { Footer } from "./footer";
import { PromoBanner } from "../promo-banner";
import { Providers } from "@/context/providers";

export function MainLayout({ children, settings }: { children: React.ReactNode, settings: SiteSettings }) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith('/dashboard');

  if (isDashboard) {
    return <Providers>{children}</Providers>;
  }

  return (
    <Providers>
      <Header settings={settings} />
      <PromoBanner />
      <main className="flex-grow">{children}</main>
      <Footer settings={settings} />
      <Chatbot />
      <AdminModeIndicator />
    </Providers>
  );
}
