
'use client';

import { useEffect } from 'react';
import { logProductView } from '@/lib/actions';

const VIEWED_PRODUCTS_KEY = 'viewed_products';

export function ProductViewTracker({ productId }: { productId: number }) {
  useEffect(() => {
    try {
      const viewedProductsStr = sessionStorage.getItem(VIEWED_PRODUCTS_KEY);
      const viewedProducts: number[] = viewedProductsStr ? JSON.parse(viewedProductsStr) : [];

      if (!viewedProducts.includes(productId)) {
        logProductView(productId);
        viewedProducts.push(productId);
        sessionStorage.setItem(VIEWED_PRODUCTS_KEY, JSON.stringify(viewedProducts));
      }
    } catch (error) {
      console.error("Failed to process product view:", error);
    }
  }, [productId]);

  return null; // This component doesn't render anything visible
}
