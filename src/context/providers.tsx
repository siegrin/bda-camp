
'use client';

import { AuthProvider } from './auth-context';
import { CartProvider } from './cart-context';
import { Toaster } from '@/components/ui/toaster';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        {children}
        <Toaster />
      </CartProvider>
    </AuthProvider>
  );
}
