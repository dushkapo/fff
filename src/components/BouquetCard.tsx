'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ShoppingBag } from 'lucide-react';
import { Product } from '@/lib/supabase';

interface BouquetCardProps {
    product: Product;
    onOrder: (product: Product) => void;
    index: number;
}

export default function BouquetCard({ product, onOrder, index }: BouquetCardProps) {
    const finalPrice = product.discount > 0
        ? Math.round(product.price * (1 - product.discount / 100))
        : product.price;

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
            className="group relative bg-white/[0.02] rounded-sm overflow-hidden cursor-pointer
                 shadow-[0_0_40px_rgba(255,255,255,0.03)]
                 hover:shadow-[0_0_60px_rgba(255,255,255,0.06)]
                 hover:-translate-y-2
                 transition-all duration-500"
            onClick={() => onOrder(product)}
        >
            {/* Image Container - 80% height */}
            <div className="relative h-80 overflow-hidden">
                <Image
                    src={product.image_url || '/images/bouquet-1.jpg'}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMCwsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAcJ/8QAIhAAAgEDBAMBAAAAAAAAAAAAAQIDBAURAAYHIRITMUH/xAAVAQEBAAAAAAAAAAAAAAAAAAAFBv/EABsRAAICAwEAAAAAAAAAAAAAAAECAAMEBRHR/9oADAMBAAIRAxEAPwCp8Z7Ur+R95bd2xBcKe3R3WpFNJVTRmRYgQTzCAoJwPnWdP//Z"
                />

                {/* Gradient mask - fade to black */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                {/* Discount Badge */}
                {product.discount > 0 && (
                    <div className="absolute top-4 left-4 bg-[#D4AF37] text-black text-xs font-bold px-3 py-1 tracking-wider">
                        -{product.discount}%
                    </div>
                )}

                {/* Out of Stock Overlay */}
                {!product.in_stock && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <span className="text-white/70 text-sm uppercase tracking-[0.2em]">Нет в наличии</span>
                    </div>
                )}

                {/* Order Button - appears on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onOrder(product);
                        }}
                        disabled={!product.in_stock}
                        className="bg-transparent border border-white/30 text-white px-6 py-3 
                       uppercase tracking-[0.15em] text-xs font-light
                       hover:bg-white hover:text-black
                       transition-all duration-300
                       disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        Заказать
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 bg-black">
                {/* Product Name */}
                <h3 className="font-serif text-sm uppercase tracking-[0.2em] text-white/90 mb-2">
                    {product.name}
                </h3>

                {/* Price */}
                <div className="flex items-baseline gap-3">
                    <span className="font-sans font-light text-[#D4AF37] text-lg">
                        {finalPrice.toLocaleString('ru-RU')} ₽
                    </span>
                    {product.discount > 0 && (
                        <span className="text-white/30 text-sm line-through font-light">
                            {product.price.toLocaleString('ru-RU')} ₽
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
