
'use client';

import { Loader2 } from 'lucide-react';

export function LoadingScreen({ message = "Memuat..." }: { message?: string }) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
      <div className="mx-auto grid w-full max-w-6xl gap-4 text-center">
        <div className="flex justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
        <p className="text-lg font-semibold text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
