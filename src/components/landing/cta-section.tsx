
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
      duration: 0.5,
    }
  },
};

export const CtaSection = () => (
  <motion.section 
    id="cta" 
    className="py-12 md:py-24 bg-primary/90 text-primary-foreground"
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.3 }}
    variants={sectionVariants}
  >
    <div className="container mx-auto px-4 text-center">
      <h2 className="font-headline text-3xl font-bold md:text-4xl">Siap menjelajahi alam?</h2>
      <p className="mt-2 text-lg">Jangan menunggu. Petualangan Anda berikutnya hanya beberapa klik saja.</p>
      <div className="mt-6">
        <Button asChild size="lg" variant="secondary" className="font-bold text-lg">
          <Link href="/equipment">Sewa Sekarang</Link>
        </Button>
      </div>
    </div>
  </motion.section>
);
