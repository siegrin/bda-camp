
'use client';

import { AuthProvider } from './auth-context';
import { CartProvider } from './cart-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </AuthProvider>
  );
}
