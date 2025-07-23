
'use client';

import { useState, useEffect } from 'react';
import { getProducts } from '@/lib/products';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/product-card';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};

export function RecommendedProducts({ currentProduct }: { currentProduct: Product }) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      setIsLoading(true);
      try {
        const { products } = await getProducts();
        const filtered = products
          .filter(p => p.category === currentProduct.category && p.id !== currentProduct.id)
          .slice(0, 4); // Show up to 4 recommendations
        setRecommendations(filtered);
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (currentProduct) {
      fetchRecommendations();
    }
  }, [currentProduct]);
  
  const handleActionComplete = () => {
    // A recommended product was edited/deleted, no need to refresh this component
    // as it's unlikely to change the recommendation list itself.
  }

  if (isLoading) {
    return (
      <section className="bg-secondary/50 py-12 md:py-24">
        <div className="container mx-auto flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (recommendations.length === 0) {
    return null; // Don't render the section if there are no recommendations
  }

  return (
    <motion.section 
      className="bg-secondary/50 py-12 md:py-24"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
    >
      <div className="container mx-auto px-4">
        <motion.h2 
            className="text-center font-headline text-3xl font-bold md:text-4xl"
            variants={itemVariants}
        >
            Anda Mungkin Juga Suka
        </motion.h2>
        <motion.p 
            className="mx-auto mt-2 max-w-2xl text-center text-muted-foreground"
            variants={itemVariants}
        >
            Produk lain dari kategori yang sama untuk melengkapi petualangan Anda.
        </motion.p>
        
        <motion.div 
          className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6"
          variants={containerVariants}
        >
          {recommendations.map(product => (
            <motion.div key={product.id} variants={itemVariants}>
              <ProductCard product={product} onActionComplete={handleActionComplete} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
