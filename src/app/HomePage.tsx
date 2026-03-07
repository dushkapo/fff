'use client';

import { useState, useMemo } from 'react';
import { Menu, X, Sparkles, Search, ArrowUpDown } from 'lucide-react';
import Link from 'next/link';
import { Product, Settings } from '@/lib/supabase';
import { matchesSearch } from '@/lib/searchDict';
import HeroSection from '@/components/HeroSection';
import ProductCard from '@/components/ProductCard';
import OrderModal from '@/components/OrderModal';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Footer from '@/components/Footer';
import DeliverySection from '@/components/DeliverySection';

interface HomePageProps {
    products: Product[];
    settings: Settings | null;
}

export default function HomePage({ products, settings }: HomePageProps) {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState<'default' | 'asc' | 'desc'>('default');

    const filteredProducts = useMemo(() => {
        let result = products;
        if (searchQuery.trim()) {
            result = result.filter(p => matchesSearch(p.name, p.description, searchQuery));
        }
        if (sortOrder === 'asc') {
            result = [...result].sort((a, b) => a.price - b.price);
        } else if (sortOrder === 'desc') {
            result = [...result].sort((a, b) => b.price - a.price);
        }
        return result;
    }, [products, searchQuery, sortOrder]);

    const handleOrder = (product: Product) => {
        if (settings?.shop_open === false) return;
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-white">

            {/* === SHOP CLOSED BANNER === */}
            {settings?.shop_open === false && (
                <div className="bg-red-600 text-white text-center py-3 px-4 text-sm font-medium sticky top-0 z-[60]">
                    🔒 Магазин временно закрыт. Заказы не принимаются.
                </div>
            )}

            {/* === WHITE NAVIGATION BAR === */}
            <header className="bg-white sticky top-0 z-50 border-b border-zinc-200">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    {/* Logo + Language Switcher */}
                    <div className="flex items-center gap-4">
                        <a href="#" className="font-serif text-xl text-zinc-900 uppercase tracking-widest notranslate" data-brand="name" data-brand-ru="Мир Цветов" data-brand-lat="Mir Tsvetov">
                            {settings?.shop_name || 'Мир Цветов'}
                        </a>
                        <LanguageSwitcher />
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        <a href="#catalog" className="text-zinc-600 hover:text-zinc-900 text-sm uppercase tracking-wider transition-colors">
                            Каталог
                        </a>
                        {settings?.about_text && (
                            <a href="#about" className="text-zinc-600 hover:text-zinc-900 text-sm uppercase tracking-wider transition-colors">
                                О нас
                            </a>
                        )}
                        <a href="#delivery" className="text-zinc-600 hover:text-zinc-900 text-sm uppercase tracking-wider transition-colors">
                            Доставка
                        </a>
                        <a href="#contacts" className="text-zinc-600 hover:text-zinc-900 text-sm uppercase tracking-wider transition-colors">
                            Контакты
                        </a>
                        <Link
                            href="/create-bouquet"
                            className="flex items-center gap-2 text-[#D4AF37] hover:text-[#1a1a1a] text-sm uppercase tracking-wider transition-colors font-medium"
                        >
                            <Sparkles size={16} />
                            Создать букет
                        </Link>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-zinc-600"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-zinc-100 py-4">
                        <nav className="flex flex-col gap-4 px-6">
                            <a href="#catalog" className="text-zinc-600 text-sm uppercase tracking-wider" onClick={() => setMobileMenuOpen(false)}>
                                Каталог
                            </a>
                            {settings?.about_text && (
                                <a href="#about" className="text-zinc-600 text-sm uppercase tracking-wider" onClick={() => setMobileMenuOpen(false)}>
                                    О нас
                                </a>
                            )}
                            <a href="#delivery" className="text-zinc-600 text-sm uppercase tracking-wider" onClick={() => setMobileMenuOpen(false)}>
                                Доставка
                            </a>
                            <a href="#contacts" className="text-zinc-600 text-sm uppercase tracking-wider" onClick={() => setMobileMenuOpen(false)}>
                                Контакты
                            </a>
                            <Link
                                href="/create-bouquet"
                                className="flex items-center gap-2 text-[#D4AF37] text-sm uppercase tracking-wider font-medium"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <Sparkles size={16} />
                                Создать букет
                            </Link>
                        </nav>
                    </div>
                )}
            </header>

            {/* === HERO SECTION === */}
            <HeroSection
                title={settings?.hero_title}
                subtitle={settings?.hero_subtitle}
            />

            {/* === CATALOG SECTION === */}
            <section id="catalog" className="py-16 bg-white">
                <div className="container mx-auto px-6">
                    {/* Search + Sort Bar */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-8">
                        <div className="relative flex-1">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Поиск букетов..."
                                className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 text-sm
                                    focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/30 transition-colors"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                        <div className="relative">
                            <ArrowUpDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value as 'default' | 'asc' | 'desc')}
                                className="pl-9 pr-8 py-3 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-700 text-sm
                                    focus:border-[#D4AF37] focus:outline-none appearance-none cursor-pointer min-w-[180px]"
                            >
                                <option value="default">По умолчанию</option>
                                <option value="asc">Цена: по возрастанию</option>
                                <option value="desc">Цена: по убыванию</option>
                            </select>
                        </div>
                    </div>

                    {/* Section Title */}
                    <h2 className="text-xl uppercase tracking-[0.2em] text-zinc-800 mb-10">
                        Наша коллекция
                        {searchQuery && <span className="text-sm text-zinc-400 ml-3 normal-case tracking-normal">({filteredProducts.length})</span>}
                    </h2>

                    {/* Products Grid */}
                    {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                            {filteredProducts.map((product, index) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onOrder={handleOrder}
                                    index={index}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <p className="text-zinc-400 uppercase tracking-wider">
                                {searchQuery ? 'Ничего не найдено' : 'Букеты скоро появятся'}
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* === ABOUT SECTION - Only shows if enabled AND has text === */}
            {settings?.about_enabled && settings?.about_text && (
                <section id="about" className="py-16 bg-zinc-50">
                    <div className="container mx-auto px-6">
                        <div className="max-w-3xl mx-auto text-center">
                            <h2 className="text-xl uppercase tracking-[0.2em] text-zinc-800 mb-6">
                                О нашем бутике
                            </h2>
                            <p className="text-zinc-600 leading-relaxed whitespace-pre-line">
                                {settings.about_text}
                            </p>
                        </div>
                    </div>
                </section>
            )}

            {/* === DELIVERY SECTION === */}
            <DeliverySection settings={settings} />

            {/* === FOOTER === */}
            <Footer settings={settings} />

            {/* Order Modal */}
            {selectedProduct && (
                <OrderModal
                    product={selectedProduct}
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedProduct(null);
                    }}
                    settings={settings}
                    deliveryEnabled={settings?.delivery_enabled !== false}
                />
            )}
        </div>
    );
}
