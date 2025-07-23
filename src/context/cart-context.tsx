
"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './auth-context';

export interface CartItem extends Product {
  days: number;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addItem: (product: Product, days: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  updateItemDays: (productId: number, days: number) => void;
  updateItemQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();
  const { user, loading } = useAuth();
  
  const getCartKey = useCallback(() => {
    if (!user) return null;
    return `cart_${user.uid}`;
  }, [user]);

  // Effect to load cart from localStorage when user changes (login/logout)
  useEffect(() => {
    if (loading) return; // Wait until auth state is determined

    const cartKey = getCartKey();
    if (cartKey) {
      const storedCart = localStorage.getItem(cartKey);
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      } else {
        setCart([]); // Clear cart if no stored cart for this user
      }
    } else {
      setCart([]); // Clear cart if no user is logged in
    }
  }, [user, loading, getCartKey]);

  // Effect to save cart to localStorage whenever it changes
  useEffect(() => {
    const cartKey = getCartKey();
    if (cartKey && !loading) {
      localStorage.setItem(cartKey, JSON.stringify(cart));
    }
  }, [cart, getCartKey, loading]);

  const addItem = (product: Product, days: number, quantity: number) => {
    if (!user) {
        toast({
            title: "Harap Login",
            description: "Anda harus login untuk menambahkan item ke keranjang.",
            variant: "destructive"
        });
        return;
    }
    
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        // If item exists, just update its quantity
        return prevCart.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      // If item doesn't exist, add it
      return [...prevCart, { ...product, days, quantity }];
    });
  };

  const removeItem = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateItemDays = (productId: number, days: number) => {
    if (days < 1) return;
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, days } : item
      )
    );
  };
  
  const updateItemQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) return;
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const total = cart.reduce((acc, item) => acc + item.price_per_day * item.days * item.quantity, 0);

  const value = {
    cart,
    addItem,
    removeItem,
    updateItemDays,
    updateItemQuantity,
    clearCart,
    itemCount,
    total,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
