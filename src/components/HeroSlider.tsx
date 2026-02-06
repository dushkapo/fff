'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const bouquetImages = [
    '/images/bouquet-1.jpg',
    '/images/bouquet-2.jpg',
    '/images/bouquet-3.jpg',
    '/images/bouquet-4.jpg',
    '/images/bouquet-5.jpg',
    '/images/bouquet-6.jpg',
];

export default function HeroSlider() {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-rotate every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % bouquetImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section
            className="relative w-full py-20 md:py-32"
            style={{
                background: 'radial-gradient(circle at center, #111111 0%, #000000 100%)',
            }}
        >
            {/* Content Container */}
            <div className="container mx-auto px-4 flex flex-col items-center">

                {/* Title */}
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="font-serif text-4xl md:text-6xl lg:text-7xl text-white uppercase tracking-widest text-center mb-3"
                >
                    Diana Flowers
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="font-sans text-zinc-500 text-xs md:text-sm uppercase tracking-[0.3em] mb-12"
                >
                    Изысканные букеты
                </motion.p>

                {/* Floating Bouquet Slider */}
                <div className="relative w-72 h-72 md:w-96 md:h-96 mb-12">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -20 }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className="absolute inset-0"
                        >
                            <Image
                                src={bouquetImages[currentIndex]}
                                alt={`Букет ${currentIndex + 1}`}
                                fill
                                className="object-contain drop-shadow-2xl"
                                sizes="(max-width: 768px) 288px, 384px"
                                priority
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Slider Indicators */}
                <div className="flex gap-2 mb-10">
                    {bouquetImages.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`h-1 rounded-full transition-all duration-300 
                ${idx === currentIndex
                                    ? 'bg-[#D4AF37] w-8'
                                    : 'bg-white/20 w-4 hover:bg-white/40'
                                }`}
                        />
                    ))}
                </div>

                {/* CTA Button */}
                <motion.a
                    href="#catalog"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="group relative bg-transparent border border-white/30 
                     text-white px-10 py-4 uppercase tracking-[0.2em] text-xs
                     overflow-hidden transition-all duration-500
                     hover:border-[#D4AF37]/50"
                >
                    <span className="relative z-10 group-hover:text-[#D4AF37] transition-colors duration-300">
                        Смотреть каталог
                    </span>
                </motion.a>
            </div>

            {/* Gold Divider at Bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />
        </section>
    );
}
