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
            className="group relative bg-white rounded-lg overflow-hidden cursor-pointer
                 shadow-sm hover:shadow-xl hover:-translate-y-1
                 transition-all duration-300 border border-neutral-100"
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
                {/* No heavy gradient for white theme, just subtle */}
                {/* <div className="absolute inset-0 bg-black/5" /> */}

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
            <div className="p-6">
                <h3 className="font-serif text-lg text-gray-900 mb-2 truncate">
                    {product.name}
                </h3>

                {/* Price */}
                <div className="flex justify-between items-end mb-4">
                    <p className="text-2xl font-bold text-gray-900">
                        {finalPrice.toLocaleString('ru-RU')} ₽
                    </p>
                    {product.discount > 0 && (
                        <p className="text-sm text-gray-400 line-through mb-1">
                            {product.price.toLocaleString('ru-RU')} ₽
                        </p>
                    )}
                </div>

                <div className="space-y-4">
                    {/* Hover Description (Desktop) - Matches old project style */}
                    <div className="hidden lg:block h-0 overflow-hidden group-hover:h-auto group-hover:mb-4 transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100">
                        <p className="text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                            {product.description || 'Элегантный букет свежих цветов.'}
                        </p>
                    </div>

                    <button
                        className="w-full bg-zinc-900 text-white font-medium py-3 rounded hover:bg-zinc-800 
                                 transition-colors duration-300 flex items-center justify-center gap-2
                                 uppercase tracking-wide text-sm"
                    >
                        <ShoppingBag size={18} />
                        В корзину
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
