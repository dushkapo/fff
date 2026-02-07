'use client';

import { useState } from 'react';
import { Menu, X, Phone, Clock, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Product, Settings } from '@/lib/supabase';
import HeroSection from '@/components/HeroSection';
import ProductCard from '@/components/ProductCard';
import OrderModal from '@/components/OrderModal';

interface HomePageProps {
    products: Product[];
    settings: Settings | null;
}

export default function HomePage({ products, settings }: HomePageProps) {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleOrder = (product: Product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-white">

            {/* === WHITE NAVIGATION BAR === */}
            <header className="bg-white sticky top-0 z-50 border-b border-zinc-200">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    {/* Logo */}
                    <a href="#" className="font-serif text-xl text-zinc-900 uppercase tracking-widest">
                        {settings?.shop_name || 'Diana Flowers'}
                    </a>

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
                        className="md:hidden text-zinc-700 p-2"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white py-4 border-t border-zinc-100">
                        <div className="container mx-auto px-6 flex flex-col gap-4">
                            <a href="#catalog" className="text-zinc-600 hover:text-zinc-900 text-sm uppercase tracking-wider">Каталог</a>
                            {settings?.about_text && (
                                <a href="#about" className="text-zinc-600 hover:text-zinc-900 text-sm uppercase tracking-wider">О нас</a>
                            )}
                            <a href="#delivery" className="text-zinc-600 hover:text-zinc-900 text-sm uppercase tracking-wider">Доставка</a>
                            <a href="#contacts" className="text-zinc-600 hover:text-zinc-900 text-sm uppercase tracking-wider">Контакты</a>
                            <Link href="/create-bouquet" className="flex items-center gap-2 text-[#D4AF37] hover:text-[#1a1a1a] text-sm uppercase tracking-wider font-medium">
                                <Sparkles size={16} />
                                Создать букет
                            </Link>
                        </div>
                    </div>
                )}
            </header>

            {/* === HERO SECTION === */}
            <HeroSection
                title={settings?.hero_title}
                subtitle={settings?.hero_subtitle}
                buttonText={settings?.shop_name}
            />

            {/* === CATALOG SECTION === */}
            <section id="catalog" className="py-16 bg-white">
                <div className="container mx-auto px-6">
                    {/* Section Title */}
                    <h2 className="text-xl uppercase tracking-[0.2em] text-zinc-800 mb-10">
                        Наша коллекция
                    </h2>

                    {/* Products Grid - 4 columns */}
                    {products.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
                            {products.map((product, index) => (
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
                                Букеты скоро появятся
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
            <section id="delivery" className="py-16 bg-white">
                <div className="container mx-auto px-6">
                    <h2 className="text-xl uppercase tracking-[0.2em] text-zinc-800 text-center mb-10">
                        {settings?.delivery_enabled !== false ? 'Доставка и оплата' : 'Самовывоз и оплата'}
                    </h2>

                    <div className={`grid gap-8 max-w-4xl mx-auto ${settings?.delivery_enabled !== false ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
                        {/* Delivery - only show if enabled */}
                        {settings?.delivery_enabled !== false && (
                            <div className="text-center p-8 bg-zinc-50 rounded-lg">
                                <div className="text-4xl mb-4">🚚</div>
                                <h3 className="font-semibold text-zinc-800 mb-2">Доставка</h3>
                                {settings?.delivery_price_enabled && settings?.delivery_price && (
                                    <p className="text-zinc-600 text-sm">По городу — {settings.delivery_price}</p>
                                )}
                                {settings?.delivery_info && (
                                    <p className="text-zinc-600 text-sm whitespace-pre-line">{settings.delivery_info}</p>
                                )}
                            </div>
                        )}
                        <div className="text-center p-8 bg-zinc-50 rounded-lg">
                            <div className="text-4xl mb-4">🏪</div>
                            <h3 className="font-semibold text-zinc-800 mb-2">Самовывоз</h3>
                            {settings?.pickup_info && (
                                <p className="text-zinc-600 text-sm whitespace-pre-line">{settings.pickup_info}</p>
                            )}
                        </div>
                        <div className="text-center p-8 bg-zinc-50 rounded-lg">
                            <div className="text-4xl mb-4">💳</div>
                            <h3 className="font-semibold text-zinc-800 mb-2">Оплата</h3>
                            {settings?.payment_info && (
                                <p className="text-zinc-600 text-sm whitespace-pre-line">{settings.payment_info}</p>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* === FOOTER === */}
            <footer id="contacts" className="py-16 bg-zinc-900 text-white">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-10">
                        {/* Brand */}
                        <div>
                            <h3 className="font-serif text-2xl mb-4">{settings?.shop_name || 'Diana Flowers'}</h3>
                            {settings?.hero_subtitle && (
                                <p className="text-zinc-400 text-sm leading-relaxed">
                                    {settings.hero_subtitle}
                                </p>
                            )}
                        </div>

                        {/* Contacts */}
                        <div>
                            <h4 className="text-sm uppercase tracking-wider mb-4">Контакты</h4>
                            <div className="space-y-3">
                                {settings?.phone && (
                                    <a href={`tel:${settings.phone.replace(/[^\+\d]/g, '')}`} className="flex items-center gap-3 text-zinc-400 hover:text-white text-sm transition-colors">
                                        <Phone size={16} />
                                        <span>{settings.phone}</span>
                                    </a>
                                )}
                                {/* Telegram Icon - shows only when link exists */}
                                {settings?.telegram_link && (
                                    <a href={settings.telegram_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-zinc-400 hover:text-[#26A5E4] text-sm transition-colors">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                                        </svg>
                                        <span>Telegram</span>
                                    </a>
                                )}
                                {/* 2GIS Icon - shows only when link exists */}
                                {settings?.address_link && (
                                    <a href={settings.address_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-zinc-400 hover:text-[#57BA47] text-sm transition-colors">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                        </svg>
                                        <span>2ГИС</span>
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Schedule - only shows if enabled AND has text */}
                        {settings?.schedule_enabled && settings?.schedule && (
                            <div>
                                <h4 className="text-sm uppercase tracking-wider mb-4">Режим работы</h4>
                                <div className="flex items-start gap-3 text-zinc-400 text-sm">
                                    <Clock size={16} className="mt-0.5" />
                                    <p>{settings.schedule}</p>
                                </div>
                            </div>
                        )}

                        {/* Info - only shows if any content exists */}
                        {(settings?.delivery_price || settings?.pickup_info || settings?.delivery_info || settings?.payment_info) && (
                            <div>
                                <h4 className="text-sm uppercase tracking-wider mb-4">Информация</h4>
                                <ul className="space-y-2 text-zinc-400 text-sm">
                                    {settings?.delivery_price_enabled && settings?.delivery_price && <li>• Доставка по городу — {settings.delivery_price}</li>}
                                    {settings?.pickup_info && <li>• Самовывоз — {settings.pickup_info}</li>}
                                    {settings?.delivery_info && <li>• {settings.delivery_info}</li>}
                                    {settings?.payment_info && <li>• Оплата: {settings.payment_info}</li>}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-zinc-800 mt-12 pt-8 text-center">
                        <p className="text-zinc-500 text-sm">
                            © 2026 {settings?.shop_name || 'Diana Flowers'}. Все права защищены.
                        </p>
                    </div>
                </div>
            </footer>

            <OrderModal
                product={selectedProduct}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                deliveryEnabled={settings?.delivery_enabled !== false}
                settings={settings}
            />
        </div>
    );
}
