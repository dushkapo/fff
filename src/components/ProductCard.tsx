'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ShoppingBag } from 'lucide-react';
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
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1, ease: 'easeOut' }}
            className="group relative bg-white rounded overflow-hidden cursor-pointer
                 shadow-md hover:shadow-2xl hover:-translate-y-2
                 transition-all duration-400 border border-[rgba(212,175,55,0.2)]
                 hover:border-[#D4AF37]"
            onClick={() => onOrder(product)}
        >
            {/* Image Container - Fixed height, ЧЕРНЫЙ фон если фото не заполняет */}
            <div className="relative w-full aspect-square bg-black overflow-hidden">
                <Image
                    src={product.image_url || '/bouquet-1.jpg'}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    unoptimized={product.image_url?.startsWith('data:')}
                />

                {/* Discount Badge */}
                {product.discount > 0 && (
                    <div className="absolute top-4 right-4 bg-[#D4AF37] text-black text-sm font-bold px-3 py-1.5 tracking-wide">
                        -{product.discount}%
                    </div>
                )}

                {/* Out of Stock Overlay */}
                {!product.in_stock && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <span className="text-white/80 text-sm uppercase tracking-widest">Нет в наличии</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5 sm:p-6 bg-white">
                {/* Product Name - КРУПНЫЙ */}
                <h3 className="font-serif text-lg sm:text-xl text-[#1a1a1a] mb-3 font-semibold leading-tight">
                    {product.name}
                </h3>

                {/* Price - ОЧЕНЬ КРУПНАЯ, ТЕМНЫЙ ЦВЕТ */}
                <div className="flex items-baseline gap-3 mb-4">
                    <span className="font-serif text-2xl sm:text-3xl font-bold text-[#1a1a1a]">
                        {finalPrice.toLocaleString('ru-RU')} ₽
                    </span>
                    {product.discount > 0 && (
                        <span className="text-base text-gray-400 line-through">
                            {product.price.toLocaleString('ru-RU')} ₽
                        </span>
                    )}
                </div>

                {/* Description */}
                <p className="text-gray-500 text-sm mb-4 leading-relaxed line-clamp-2">
                    {product.description || 'Изысканный букет свежих цветов.'}
                </p>

                {/* Buy Button - КНОПКА КУПИТЬ */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onOrder(product);
                    }}
                    disabled={!product.in_stock}
                    className="w-full bg-gradient-to-r from-[#1a1a1a] to-[#333] text-[#FFFFF0] 
                             font-medium py-3 sm:py-4 rounded text-sm sm:text-base uppercase tracking-wider
                             hover:from-[#D4AF37] hover:to-[#E8C878] hover:text-black
                             transition-all duration-300 flex items-center justify-center gap-2
                             disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <ShoppingBag size={18} />
                    Заказать
                </button>
            </div>
        </motion.div>
    );
}
