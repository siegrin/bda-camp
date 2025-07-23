
"use client";

import React from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import Autoplay from "embla-carousel-autoplay";


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

const testimonials = [
    {
      name: "Fajar Suprastya",
      avatar: "https://placehold.co/100x100.png",
      dataAiHint: "man portrait",
      rating: 5,
      quote: "Peralatannya berkualitas tinggi dan membuat perjalanan kami tak terlupakan. BDA.Camp adalah pilihan utama saya untuk semua kebutuhan petualangan!",
    },
    {
      name: "Fadli Marditho",
      avatar: "https://placehold.co/100x100.png",
      dataAiHint: "man portrait",
      rating: 5,
      quote: "Layanan luar biasa dan peralatan berkualitas tinggi. Proses pemesanan sangat lancar. Sangat direkomendasikan!",
    },
    {
      name: "Herlangga Fadillah",
      avatar: "https://placehold.co/100x100.png",
      dataAiHint: "person portrait",
      rating: 4,
      quote: "Harga terjangkau dan peralatannya dalam kondisi bagus. Pengambilan yang fleksibel sangat membantu grup kami.",
    },
    {
      name: "Sandi Raja",
      avatar: "https://placehold.co/100x100.png",
      dataAiHint: "man portrait",
      rating: 5,
      quote: "Sangat puas dengan kualitas tenda yang saya sewa. Bersih, kokoh, dan mudah dipasang. Pasti akan menyewa lagi!",
    },
    {
      name: "Algiva Rahman",
      avatar: "https://placehold.co/100x100.png",
      dataAiHint: "person portrait",
      rating: 5,
      quote: "Stafnya sangat ramah dan membantu memberikan rekomendasi peralatan yang sesuai untuk pendakian saya. Pengalaman yang menyenangkan!",
    },
    {
      name: "Rizo Wisal Putra",
      avatar: "https://placehold.co/100x100.png",
      dataAiHint: "man portrait",
      rating: 4,
      quote: "Pilihan peralatannya lengkap, dari yang standar sampai yang premium. Membuat perencanaan petualangan jadi lebih mudah.",
    },
];

export const TestimonialsSection = () => {
   const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true, stopOnMouseEnter: true })
  );

  return (
    <motion.section 
      id="testimonials" 
      className="py-12 md:py-24"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={sectionVariants}
    >
      <div className="container mx-auto px-4">
        <h2 className="text-center font-headline text-3xl font-bold md:text-4xl">Apa Kata Para Petualang</h2>
        <div className="mt-10">
          <Carousel 
            opts={{ align: "start", loop: true }} 
            plugins={[plugin.current]}
            className="w-full max-w-xs sm:max-w-xl md:max-w-3xl lg:max-w-5xl mx-auto"
          >
            <CarouselContent className="-ml-4">
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="pl-4 sm:basis-1/2 md:basis-1/3">
                  <div className="p-1 h-full">
                    <Card className="h-full">
                      <CardContent className="flex flex-col items-center p-6 text-center h-full">
                        <Avatar className="h-20 w-20">
                          <AvatarImage asChild src={testimonial.avatar}>
                            <Image src={testimonial.avatar} alt={testimonial.name} width={80} height={80} sizes="80px" data-ai-hint={testimonial.dataAiHint} />
                          </AvatarImage>
                          <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <h3 className="mt-4 font-bold">{testimonial.name}</h3>
                        <div className="my-2 flex justify-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-5 w-5 ${i < testimonial.rating ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
                          ))}
                        </div>
                        <p className="text-muted-foreground flex-grow">"{testimonial.quote}"</p>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </motion.section>
  );
};
