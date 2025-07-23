
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
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
    }
  },
};

export const HeroSection = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <section className="relative flex h-[80vh] min-h-[600px] w-full flex-col items-center justify-center bg-background text-center text-white overflow-hidden">
      <motion.div 
        className="absolute inset-0 h-full w-full bg-gradient-to-br from-[#1a110a] via-[#26120A] to-[#402316] dark:from-black dark:to-[#26120A]"
        style={{ y }}
      >
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '2rem 2rem' }}></div>
      </motion.div>
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
      <motion.div 
        className="relative z-10 mx-auto max-w-4xl p-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 
          className="font-headline text-5xl font-bold tracking-tight text-white drop-shadow-lg md:text-7xl dark:glow"
          variants={itemVariants}
        >
          Lebih Dekat dengan Alam, Sewa Petualangannya
        </motion.h1>
        <motion.p 
          className="mt-4 text-lg text-slate-200 md:text-xl"
          variants={itemVariants}
        >
          Penyewaan perlengkapan kemah yang terjangkau dan andal – Siap untuk setiap medan.
        </motion.p>
        <motion.div 
          className="mt-8 flex flex-col justify-center gap-4 sm:flex-row"
          variants={itemVariants}
        >
          <Button asChild size="lg" className="font-bold">
            <Link href="/equipment">Lihat Peralatan</Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="font-bold">
            <Link href="/equipment">Pesan Sekarang</Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
};
