
"use client";

import { ShieldCheck, CircleDollarSign, Truck } from "lucide-react";
import { motion } from "framer-motion";

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
    },
  },
};


export const WhyChooseUsSection = () => {
  const features = [
    {
      icon: ShieldCheck,
      title: "Peralatan Berkualitas Tinggi",
      description: "Kami menyediakan peralatan terbaik yang terawat secara profesional untuk menjamin keamanan dan kenyamanan Anda.",
    },
    {
      icon: CircleDollarSign,
      title: "Harga Terjangkau",
      description: "Nikmati alam bebas tanpa menguras kantong dengan harga sewa kami yang kompetitif.",
    },
    {
      icon: Truck,
      title: "Pengambilan & Pengiriman Fleksibel",
      description: "Tersedia opsi yang nyaman untuk membuat proses penyewaan peralatan Anda semudah mungkin.",
    },
  ];

  return (
    <motion.section 
      id="why-choose-us" 
      className="bg-secondary/50 py-12 md:py-24"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
    >
      <div className="container mx-auto px-4">
        <motion.h2 className="text-center font-headline text-3xl font-bold md:text-4xl" variants={itemVariants}>Mengapa Memilih BDA.Camp?</motion.h2>
        <motion.div 
          className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3"
          variants={containerVariants}
        >
          {features.map((feature, index) => (
            <motion.div key={index} className="text-center" variants={itemVariants}>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <feature.icon className="h-8 w-8" />
              </div>
              <h3 className="mt-4 font-headline text-xl font-bold">{feature.title}</h3>
              <p className="mt-2 text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};
