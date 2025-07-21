
'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { motion } from "framer-motion";
import type { Product } from "@/lib/types";
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

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

interface FeaturedProductsSectionProps {
  products: Product[];
}

export const FeaturedProductsSection = ({ products }: FeaturedProductsSectionProps) => {

  const handleActionComplete = () => {
    // In a real app with client-side updates, you might re-fetch data here.
    // For this setup, a page reload would be simplest if an action occurs.
    window.location.reload();
  };

  return (
    <motion.section 
      id="featured-equipment" 
      className="py-12 md:py-24"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
    >
      <div className="container mx-auto px-4">
        <motion.h2 className="text-center font-headline text-3xl font-bold md:text-4xl" variants={itemVariants}>Peralatan Unggulan</motion.h2>
        <motion.p className="mx-auto mt-2 max-w-2xl text-center text-muted-foreground" variants={itemVariants}>
          Lihat sekilas peralatan terpopuler kami, sempurna untuk petualangan apa pun.
        </motion.p>
        
        {!products ? (
             <div className="flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : products.length === 0 ? (
            <div className="flex justify-center items-center h-48">
                <p>Tidak ada produk unggulan saat ini.</p>
            </div>
        ) : (
          <motion.div 
            className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6"
            variants={containerVariants}
          >
            {products.map((product) => (
                <motion.div key={product.id} variants={itemVariants}>
                  <ProductCard product={product} onActionComplete={handleActionComplete} />
                </motion.div>
              ))
            }
          </motion.div>
        )}

        <motion.div className="mt-10 text-center" variants={itemVariants}>
          <Button asChild>
            <Link href="/equipment">Lihat Semua Peralatan</Link>
          </Button>
        </motion.div>
      </div>
    </motion.section>
  );
};
