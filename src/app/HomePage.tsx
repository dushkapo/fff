'use client';

import { useState, useMemo, useEffect } from 'react';
import { Menu, X, Search, ArrowUpDown } from 'lucide-react';
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
    const [priceFilter, setPriceFilter] = useState<number | null>(null);
    const [hydrated, setHydrated] = useState(false);

    const priceRanges = [100, 200, 300, 400];

    // After mount: read sessionStorage (only runs on client, avoids hydration mismatch)
    useEffect(() => {
        try {
            const savedSearch = sessionStorage.getItem('catalog_search') || '';
            const savedSort = (sessionStorage.getItem('catalog_sort') as 'default' | 'asc' | 'desc') || 'default';
            const savedPrice = sessionStorage.getItem('catalog_price');
            if (savedSearch) setSearchQuery(savedSearch);
            if (savedSort !== 'default') setSortOrder(savedSort);
            if (savedPrice) setPriceFilter(Number(savedPrice));

            const savedProductId = sessionStorage.getItem('order_active_product_id');
            if (savedProductId && products.length > 0) {
                const savedProduct = products.find(p => String(p.id) === savedProductId);
                if (savedProduct) {
                    setSelectedProduct(savedProduct);
                    setIsModalOpen(true);
                }
            }
        } catch { }
        setHydrated(true);
    }, [products]);

    // Persist search and sort on change (only after hydration to avoid writing empty values)
    useEffect(() => {
        if (!hydrated) return;
        try {
            sessionStorage.setItem('catalog_search', searchQuery);
            sessionStorage.setItem('catalog_sort', sortOrder);
            if (priceFilter) {
                sessionStorage.setItem('catalog_price', String(priceFilter));
            } else {
                sessionStorage.removeItem('catalog_price');
            }
        } catch { }
    }, [searchQuery, sortOrder, priceFilter, hydrated]);

    const filteredProducts = useMemo(() => {
        let result = products;
        if (searchQuery.trim()) {
            result = result.filter(p => matchesSearch(p.name, p.description, searchQuery));
        }
        if (priceFilter) {
            result = result.filter(p => {
                const finalPrice = p.discount > 0 ? Math.round(p.price * (1 - p.discount / 100)) : p.price;
                return finalPrice <= priceFilter;
            });
        }
        if (sortOrder === 'asc') {
            result = [...result].sort((a, b) => a.price - b.price);
        } else if (sortOrder === 'desc') {
            result = [...result].sort((a, b) => b.price - a.price);
        }
        return result;
    }, [products, searchQuery, sortOrder, priceFilter]);

    const handleOrder = (product: Product) => {
        if (settings?.shop_open === false) return;
        try { sessionStorage.setItem('order_active_product_id', String(product.id)); } catch { }
        setSelectedProduct(product);
        setIsModalOpen(true);
    };




    if (settings?.shop_open === false) {
        return (
            <div className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden bg-[#FFFFF0] w-full max-w-[100vw]">
                {/* Animated Background Graphics */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">

                    {/* Bouncing emojis */}
                    {[...Array(8)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute text-3xl opacity-20 animate-bounce"
                            style={{
                                left: `${10 + i * 11}%`,
                                top: `${20 + (i % 4) * 20}%`,
                                animationDelay: `${i * 0.7}s`,
                                animationDuration: `${3 + i * 0.4}s`,
                            }}
                        >
                            🌸
                        </div>
                    ))}
                </div>

                {/* Foreground Content */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center justify-center text-center w-full px-6">
                    <h1 className="text-2xl sm:text-4xl font-bold text-zinc-900 mb-4 font-serif tracking-widest uppercase text-balance" style={{ letterSpacing: '0.15em' }}>
                        Временно недоступно
                    </h1>
                    <p className="text-zinc-600 text-base sm:text-lg max-w-md mb-2 text-balance font-medium">
                        Наш магазин временно закрыт на техническое обслуживание или не принимает заказы.
                    </p>
                    <p className="text-zinc-400 text-sm sm:text-base mt-4">
                        Мы скоро вернемся со свежими цветами 🌸
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">

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
            <section id="catalog" className="pt-8 pb-12 sm:py-16 bg-white">
                <div className="container mx-auto px-6">
                    {/* Search + Sort Bar */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-4 sm:mb-6">
                        <div className="relative flex-1">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Поиск букетов..."
                                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 text-sm
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
                                className="pl-9 pr-8 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-700 text-sm
                                    focus:border-[#D4AF37] focus:outline-none appearance-none cursor-pointer min-w-[160px]"
                            >
                                <option value="default">По умолчанию</option>
                                <option value="asc">Цена: по возрастанию</option>
                                <option value="desc">Цена: по убыванию</option>
                            </select>
                        </div>
                    </div>

                    {/* Price Filter Buttons */}
                    <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
                        {priceRanges.map((range) => {
                            const active = priceFilter === range;
                            return (
                                <button
                                    key={range}
                                    onClick={() => setPriceFilter(active ? null : range)}
                                    className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium tracking-wide border transition-all duration-200
                                        ${active
                                            ? 'bg-[#D4AF37] border-[#D4AF37] text-white shadow-sm'
                                            : 'bg-white border-zinc-200 text-zinc-600 hover:border-[#D4AF37] hover:text-[#D4AF37]'}`}
                                >
                                    до {range} лари
                                </button>
                            );
                        })}
                        {priceFilter && (
                            <button
                                onClick={() => setPriceFilter(null)}
                                className="px-3.5 py-1.5 rounded-full text-[13px] font-medium tracking-wide border border-zinc-200 text-zinc-400 hover:text-zinc-600 hover:border-zinc-300 transition-all duration-200 flex items-center gap-1.5"
                            >
                                <X size={14} />
                                Сбросить
                            </button>
                        )}
                    </div>

                    {/* Section Title */}
                    <h2 className="text-xl uppercase tracking-[0.2em] text-zinc-800 mb-6 sm:mb-10">
                        Наша коллекция
                        {(searchQuery || priceFilter) && <span className="text-sm text-zinc-400 ml-3 normal-case tracking-normal">({filteredProducts.length})</span>}
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
                                {searchQuery || priceFilter ? 'Ничего не найдено' : 'Букеты скоро появятся'}
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* === ABOUT SECTION - Only shows if enabled AND has text === */}
            {settings?.about_enabled && settings?.about_text && (
                <section id="about" className="py-10 sm:py-16 bg-zinc-50">
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
                        try {
                            sessionStorage.removeItem('order_active_product_id');
                            sessionStorage.removeItem(`order_draft_${selectedProduct.id}`);
                        } catch { }
                    }}
                    settings={settings}
                    deliveryEnabled={settings?.delivery_enabled !== false}
                />
            )}
        </div>
    );
}
