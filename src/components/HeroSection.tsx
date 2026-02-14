'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

const bouquetImages = [
    '/bouquet-1.jpg',
    '/bouquet-2.jpg',
    '/bouquet-3.jpg',
    '/bouquet-4.jpg',
    '/bouquet-5.jpg',
    '/bouquet-6.jpg',
];

interface HeroSectionProps {
    title?: string;
    subtitle?: string;
}

export default function HeroSection({ title, subtitle }: HeroSectionProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-rotate every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % bouquetImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="relative h-[80vh] min-h-[600px] overflow-hidden">
            {/* Background Images - All stacked, only current one visible */}
            {bouquetImages.map((img, idx) => (
                <div
                    key={idx}
                    className="absolute inset-0 bg-contain bg-center bg-no-repeat transition-opacity duration-1000"
                    style={{
                        backgroundImage: `url('${img}')`,
                        backgroundColor: '#000000',
                        opacity: idx === currentIndex ? 1 : 0,
                    }}
                />
            ))}

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="font-serif text-5xl md:text-7xl text-white uppercase tracking-[0.15em] mb-4 notranslate"
                >
                    {title || 'Мир Цветов'}
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-white/80 text-lg md:text-2xl font-light tracking-wide mb-8"
                >
                    {subtitle || 'Изысканные букеты для особых моментов'}
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                >
                    <Link
                        href="/create-bouquet"
                        className="border border-white/50 text-white px-8 py-3 uppercase tracking-[0.2em] text-sm
                         hover:bg-white hover:text-black transition-all duration-300 flex items-center gap-3"
                    >
                        <Sparkles size={16} />
                        Создать свой букет
                    </Link>
                </motion.div>
            </div>

            {/* Slider Dots */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {bouquetImages.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 
              ${idx === currentIndex ? 'bg-white w-6' : 'bg-white/40'}`}
                    />
                ))}
            </div>
        </section>
    );
}
