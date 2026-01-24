'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Product } from '@/lib/supabase';

interface ProductCardProps {
    product: Product;
    onOrder: (product: Product) => void;
    index: number;
}

export default function ProductCard({ product, onOrder, index }: ProductCardProps) {
    const finalPrice = product.discount > 0
        ? Math.round(product.price * (1 - product.discount / 100))
        : product.price;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            onClick={() => onOrder(product)}
            className="group cursor-pointer"
        >
            {/* Image Container - Dark background */}
            <div className="relative aspect-square bg-[#2a2a2a] overflow-hidden mb-4">
                <Image
                    src={product.image_url || '/bouquet-1.jpg'}
                    alt={product.name}
                    fill
                    className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />

                {/* Discount Badge */}
                {product.discount > 0 && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1">
                        -{product.discount}%
                    </div>
                )}
            </div>

            {/* Text Content - White background area */}
            <div className="text-left">
                {/* Product Name */}
                <h3 className="font-serif text-base text-zinc-900 mb-1">
                    {product.name}
                </h3>

                {/* Price */}
                <p className="text-zinc-500 text-sm mb-2">
                    {finalPrice.toLocaleString('ru-RU')} ₽
                    {product.discount > 0 && (
                        <span className="ml-2 line-through text-zinc-400">
                            {product.price.toLocaleString('ru-RU')} ₽
                        </span>
                    )}
                </p>

                {/* Description */}
                <p className="text-zinc-400 text-sm line-clamp-2">
                    {product.description}
                </p>
            </div>
        </motion.div>
    );
}
