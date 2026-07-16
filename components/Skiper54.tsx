"use client";

import Autoplay from "embla-carousel-autoplay";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

export const Skiper54 = () => {
  const images = [
    { src: "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1000&auto=format&fit=crop", alt: "Campus", title: "100-Acre Lush Campus" },
    { src: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1000&auto=format&fit=crop", alt: "Labs", title: "State-of-the-Art Labs" },
    { src: "https://images.unsplash.com/photo-1523580846011-d3a5ce2522a1?q=80&w=1000&auto=format&fit=crop", alt: "Placements", title: "1000+ Placements Yearly" },
    { src: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1000&auto=format&fit=crop", alt: "Hackathon", title: "Vibrant Tech Culture" },
  ];

  // BUG FIX: Using useRef guarantees the autoplay engine doesn't break on re-renders
  const plugin = useRef(Autoplay({ delay: 3000, stopOnInteraction: false }));
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden bg-transparent">
      <Carousel
        setApi={setApi}
        plugins={[plugin.current]}
        className="w-full h-full flex flex-col justify-center"
        opts={{ loop: true, slidesToScroll: 1 }}
      >
        <CarouselContent className="flex h-full w-full items-center">
          {images.map((img, index) => (
            <CarouselItem key={index} className="relative flex h-full w-full basis-full items-center justify-center px-2">
              <motion.div
                initial={false}
                animate={{
                  clipPath: current !== index ? "inset(5% 5% 5% 5% round 2rem)" : "inset(0 0 0 0 round 2rem)",
                  opacity: current !== index ? 0.5 : 1,
                }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="h-full w-full overflow-hidden rounded-3xl shadow-xl"
              >
                <div className="relative h-full w-full">
                  <img src={img.src} alt={img.alt} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-10 left-10 text-white z-10">
                    <h4 className="text-3xl font-extrabold tracking-tight drop-shadow-lg">{img.title}</h4>
                  </div>
                </div>
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};