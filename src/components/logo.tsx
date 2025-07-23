
"use client";

import Image from "next/image";
import { LogoIcon } from "@/components/icons";

export function Logo({ className, logoUrl }: { className?: string, logoUrl?: string | null }) {
  if (logoUrl) {
    return (
      <Image 
        src={logoUrl} 
        alt="BDA.Camp Logo"
        width={100}
        height={100}
        priority // Prioritize loading the logo
        className={className}
        unoptimized // Necessary for external URLs if not configured in next.config.ts
      />
    )
  }
  
  return <LogoIcon className={className} />;
}
