
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import type { Product } from "@/lib/types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"

interface ProductGalleryProps {
  images: string[];
  productName: string;
  dataAiHint?: string;
  objectFit?: Product['objectFit'];
}

export function ProductGallery({ images, productName, dataAiHint, objectFit }: ProductGalleryProps) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)

  const onThumbClick = useCallback(
    (index: number) => {
      api?.scrollTo(index)
    },
    [api]
  )

  useEffect(() => {
    if (!api) {
      return
    }

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap())

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  const hasMultipleImages = images.length > 1;

  if (!hasMultipleImages) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="aspect-[4/3] relative">
            <Image
              src={images[0]}
              alt={`${productName} gambar utama`}
              fill
              className={cn(
                "object-center",
                objectFit === 'contain' ? 'object-contain' : 'object-cover'
              )}
              data-ai-hint={dataAiHint}
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index}>
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                   <div className="aspect-[4/3] relative">
                    <Image
                      src={image}
                      alt={`${productName} gambar ${index + 1}`}
                      fill
                       className={cn(
                        "object-center transition-opacity duration-300",
                        objectFit === 'contain' ? 'object-contain' : 'object-cover'
                      )}
                      data-ai-hint={dataAiHint}
                      priority={index === 0}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
      </Carousel>
      
      <div className="grid grid-cols-5 gap-2 sm:gap-4 mt-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => onThumbClick(index)}
              className={cn(
                "aspect-square relative rounded-md overflow-hidden transition-all duration-200",
                "ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                current === index ? "ring-2 ring-primary" : "opacity-70 hover:opacity-100"
              )}
              aria-label={`Tampilkan gambar ${index + 1}`}
            >
              <Image
                src={image}
                alt={`${productName} thumbnail ${index + 1}`}
                fill
                className={cn(
                  "object-center",
                  objectFit === 'contain' ? 'object-contain' : 'object-cover'
                )}
                data-ai-hint={dataAiHint}
                sizes="(max-width: 640px) 20vw, 10vw"
              />
            </button>
          ))}
        </div>
    </div>
  );
}
