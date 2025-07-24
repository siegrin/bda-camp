
"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import type { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './auth-context';
import { getProducts } from '@/lib/products';

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
  validateCart: () => Promise<void>;
  validatedCart: CartItem[];
  isCartValid: boolean;
  isValidationLoading: boolean;

  // Selection logic
  selectedItemIds: number[];
  toggleSelectItem: (id: number) => void;
  selectAllItems: () => void;
  deselectAllItems: () => void;
  selectedItems: CartItem[];
  selectedItemsTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();
  const { user, loading } = useAuth();
  
  // State for cart validation
  const [validatedCart, setValidatedCart] = useState<CartItem[]>([]);
  const [isValidationLoading, setValidationLoading] = useState(false);
  const [isCartValid, setIsCartValid] = useState(true);

  // State for item selection
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);

  const getCartKey = useCallback(() => {
    if (!user) return null;
    return `cart_${user.uid}`;
  }, [user]);

  // Load cart from localStorage
  useEffect(() => {
    if (loading) return;
    const cartKey = getCartKey();
    if (cartKey) {
      const storedCart = localStorage.getItem(cartKey);
      if (storedCart) {
        const parsedCart: CartItem[] = JSON.parse(storedCart);
        setCart(parsedCart);
        // Automatically select all items on initial load
        setSelectedItemIds(parsedCart.map(item => item.id));
      } else {
        setCart([]);
        setSelectedItemIds([]);
      }
    } else {
      setCart([]);
      setSelectedItemIds([]);
    }
  }, [user, loading, getCartKey]);

  // Save cart to localStorage
  useEffect(() => {
    const cartKey = getCartKey();
    if (cartKey && !loading) {
      localStorage.setItem(cartKey, JSON.stringify(cart));
      if (cart.length > 0) {
        validateCart();
      } else {
         setIsCartValid(true);
         setValidatedCart([]);
         setSelectedItemIds([]);
      }
    }
  }, [cart, getCartKey, loading]);
  
  const validateCart = async () => {
    if (cart.length === 0) {
        setValidatedCart([]);
        setIsCartValid(true);
        setValidationLoading(false);
        return;
    }
    setValidationLoading(true);
    try {
        const { products: serverProducts } = await getProducts();
        const serverProductMap = new Map(serverProducts.map(p => [p.id, p]));

        let globalCartIsValid = true;
        
        const newValidatedCart = cart.map(cartItem => {
            const serverProduct = serverProductMap.get(cartItem.id);
            if (!serverProduct) {
                return { ...cartItem, stock: 0 }; 
            }
            return { ...cartItem, stock: serverProduct.stock, price_per_day: serverProduct.price_per_day };
        });

        // Check validity only for selected items
        const selectedItems = newValidatedCart.filter(item => selectedItemIds.includes(item.id));
        for (const item of selectedItems) {
            if (item.quantity > item.stock) {
                globalCartIsValid = false;
                break;
            }
        }

        setValidatedCart(newValidatedCart);
        setIsCartValid(globalCartIsValid);

    } catch (error) {
        console.error("Failed to validate cart:", error);
        setIsCartValid(true); 
    } finally {
        setValidationLoading(false);
    }
  };

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
        return prevCart.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + quantity, days: days }
            : item
        );
      }
      return [...prevCart, { ...product, days, quantity }];
    });
    // Automatically select the new item
    setSelectedItemIds(prev => [...new Set([...prev, product.id])]);
  };

  const removeItem = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    setSelectedItemIds((prev) => prev.filter(id => id !== productId));
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
      prevCart.map((item) => {
        if (item.id === productId) {
          const validatedQuantity = Math.min(quantity, item.stock);
          if (quantity > item.stock) {
            toast({
              variant: "destructive",
              title: "Stok Terbatas",
              description: `Stok untuk ${item.name} hanya tersisa ${item.stock} unit.`,
            });
          }
          return { ...item, quantity: validatedQuantity };
        }
        return item;
      })
    );
  };


  const clearCart = () => {
    // This now clears only the selected items from the cart.
    const remainingItems = cart.filter(item => !selectedItemIds.includes(item.id));
    setCart(remainingItems);
    setSelectedItemIds([]);
  };
  
  // Selection handlers
  const toggleSelectItem = (id: number) => {
    setSelectedItemIds(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };
  
  const selectAllItems = () => {
      setSelectedItemIds(cart.map(item => item.id));
  };

  const deselectAllItems = () => {
      setSelectedItemIds([]);
  };
  
  // Memos for derived state
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const total = cart.reduce((acc, item) => acc + item.price_per_day * item.days * item.quantity, 0);

  const selectedItems = useMemo(() => {
    return cart.filter(item => selectedItemIds.includes(item.id));
  }, [cart, selectedItemIds]);

  const selectedItemsTotal = useMemo(() => {
      return selectedItems.reduce((acc, item) => acc + item.price_per_day * item.days * item.quantity, 0);
  }, [selectedItems]);
  
  // Re-validate cart whenever selection changes or cart itself changes
  useEffect(() => {
    validateCart();
  }, [selectedItemIds, cart]);


  const value = {
    cart,
    addItem,
    removeItem,
    updateItemDays,
    updateItemQuantity,
    clearCart,
    itemCount,
    total,
    validateCart,
    validatedCart,
    isCartValid,
    isValidationLoading,
    // Selection logic
    selectedItemIds,
    toggleSelectItem,
    selectAllItems,
    deselectAllItems,
    selectedItems,
    selectedItemsTotal,
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
