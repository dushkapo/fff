'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center max-w-md"
            >
                {/* Large 404 */}
                <h1 className="font-serif text-8xl sm:text-9xl text-[#D4AF37] font-bold mb-4">
                    404
                </h1>

                {/* Flower emoji */}
                <div className="text-6xl mb-6">🌸</div>

                {/* Message */}
                <h2 className="font-serif text-2xl text-zinc-800 mb-4">
                    Страница не найдена
                </h2>
                <p className="text-zinc-500 mb-8">
                    К сожалению, такой страницы не существует.
                    Возможно, она была перемещена или удалена.
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 
                            bg-gradient-to-r from-[#1a1a1a] to-[#333] text-[#FFFFF0]
                            rounded-lg font-medium uppercase tracking-wider
                            hover:from-[#D4AF37] hover:to-[#E8C878] hover:text-black
                            transition-all duration-300"
                    >
                        <Home size={18} />
                        На главную
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3
                            border border-zinc-300 text-zinc-700 rounded-lg font-medium
                            uppercase tracking-wider hover:bg-zinc-50 transition-colors"
                    >
                        <ArrowLeft size={18} />
                        Назад
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
