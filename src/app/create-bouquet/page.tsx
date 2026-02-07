'use client';

import { useState, useEffect } from 'react';
import { supabase, Flower, Settings } from '@/lib/supabase';
import { Menu, X, ShoppingBag, Plus, Minus, Sparkles, Phone, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface CartItem {
    flower: Flower;
    quantity: number;
}

// Hero slider images - flower images from /public/flow folder
const heroImages = [
    '/flow/1.jpg',
    '/flow/2.jpg',
    '/flow/3.jpg',
    '/flow/4.jpg',
    '/flow/5.jpg',
    '/flow/6.jpg',
    '/flow/7.jpg',
    '/flow/8.jpg',
    '/flow/9.jpg',
];

export default function CreateBouquetPage() {
    const [flowers, setFlowers] = useState<Flower[]>([]);
    const [settings, setSettings] = useState<Settings | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [selectedFlower, setSelectedFlower] = useState<Flower | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Order form state
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [orderForm, setOrderForm] = useState({
        name: '',
        phone: '',
        deliveryType: 'pickup' as 'delivery' | 'pickup',
        address: '',
        comment: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);

    // Order cooldown timer (5 minutes = 300 seconds)
    const [cooldownRemaining, setCooldownRemaining] = useState(0);

    // Load cart and cooldown timer from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('flower-cart');
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error('Error loading cart:', e);
            }
        }

        // Check cooldown timer
        const lastOrderTime = localStorage.getItem('flower-order-cooldown');
        if (lastOrderTime) {
            const elapsed = Date.now() - parseInt(lastOrderTime);
            const remaining = Math.max(0, 300 - Math.floor(elapsed / 1000)); // 300 seconds = 5 min
            setCooldownRemaining(remaining);
        }
    }, []);

    // Countdown timer
    useEffect(() => {
        if (cooldownRemaining > 0) {
            const timer = setInterval(() => {
                setCooldownRemaining(prev => {
                    if (prev <= 1) {
                        localStorage.removeItem('flower-order-cooldown');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [cooldownRemaining]);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        if (cart.length > 0) {
            localStorage.setItem('flower-cart', JSON.stringify(cart));
        } else {
            localStorage.removeItem('flower-cart');
        }
    }, [cart]);

    useEffect(() => {
        loadData();
    }, []);

    // Hero slider auto-rotate
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Georgian phone format: +995 XXX XXX XXX
    const formatPhone = (value: string): string => {
        const digits = value.replace(/\D/g, '');
        const limited = digits.slice(0, 12); // 995 + 9 digits

        if (limited.length === 0) return '';
        if (limited.length <= 3) return `+${limited}`;
        if (limited.length <= 6) return `+${limited.slice(0, 3)} ${limited.slice(3)}`;
        if (limited.length <= 9) return `+${limited.slice(0, 3)} ${limited.slice(3, 6)} ${limited.slice(6)}`;
        return `+${limited.slice(0, 3)} ${limited.slice(3, 6)} ${limited.slice(6, 9)} ${limited.slice(9, 12)}`;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhone(e.target.value);
        setOrderForm({ ...orderForm, phone: formatted });
    };

    const loadData = async () => {
        const [flowersRes, settingsRes] = await Promise.all([
            supabase.from('flowers').select('*').eq('in_stock', true).order('created_at', { ascending: false }),
            supabase.from('settings').select('*').single(),
        ]);
        if (flowersRes.data) setFlowers(flowersRes.data);
        if (settingsRes.data) setSettings(settingsRes.data);
        setIsLoading(false);
    };

    const addToCart = (flower: Flower) => {
        setCart(prev => {
            const existing = prev.find(item => item.flower.id === flower.id);
            if (existing) {
                return prev.map(item =>
                    item.flower.id === flower.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { flower, quantity: 1 }];
        });
        setSelectedFlower(null);
    };

    const updateQuantity = (flowerId: string, delta: number) => {
        setCart(prev => {
            return prev
                .map(item =>
                    item.flower.id === flowerId
                        ? { ...item, quantity: Math.max(0, item.quantity + delta) }
                        : item
                )
                .filter(item => item.quantity > 0);
        });
    };

    const setQuantityDirect = (flowerId: string, value: string) => {
        const num = parseInt(value) || 0;
        if (num <= 0) {
            setCart(prev => prev.filter(item => item.flower.id !== flowerId));
        } else {
            setCart(prev => prev.map(item =>
                item.flower.id === flowerId ? { ...item, quantity: num } : item
            ));
        }
    };

    const getQuantity = (flowerId: string): number => {
        return cart.find(item => item.flower.id === flowerId)?.quantity || 0;
    };

    const getTotalItems = (): number => {
        return cart.reduce((sum, item) => sum + item.quantity, 0);
    };

    const getTotalPrice = (): number => {
        return cart.reduce((sum, item) => sum + item.flower.price * item.quantity, 0);
    };

    const handleSubmitOrder = async () => {
        // Check cooldown
        if (cooldownRemaining > 0) {
            return;
        }

        // Validate phone has at least 12 digits (Georgian format: 995 + 9 digits)
        const phoneDigits = orderForm.phone.replace(/\D/g, '');
        if (!orderForm.name || phoneDigits.length < 12) {
            alert('Пожалуйста, введите имя и корректный номер телефона (+995 XXX XXX XXX)');
            return;
        }
        setIsSubmitting(true);

        const flowersList = cart.map(item => `${item.flower.name} × ${item.quantity}`).join('\n');

        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'custom_bouquet',
                    customerName: orderForm.name,
                    customerPhone: orderForm.phone,
                    deliveryType: orderForm.deliveryType,
                    address: orderForm.address,
                    comment: orderForm.comment,
                    items: flowersList,
                    total: getTotalPrice(),
                }),
            });

            if (response.ok) {
                setOrderSuccess(true);
                setCart([]);
                localStorage.removeItem('flower-cart');

                // Set cooldown timer for 5 minutes
                localStorage.setItem('flower-order-cooldown', Date.now().toString());
                setCooldownRemaining(300);

                // Reset form
                setOrderForm({
                    name: '',
                    phone: '',
                    deliveryType: 'pickup',
                    address: '',
                    comment: '',
                });
            } else {
                alert('Ошибка при отправке заказа. Попробуйте ещё раз.');
            }
        } catch (error) {
            console.error('Order error:', error);
            alert('Ошибка при отправке заказа. Попробуйте ещё раз.');
        }
        setIsSubmitting(false);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* === WHITE NAVIGATION BAR (same as main page) === */}
            <header className="bg-white sticky top-0 z-50 border-b border-zinc-200">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    {/* Logo */}
                    <Link href="/" className="font-serif text-xl text-zinc-900 uppercase tracking-widest">
                        {settings?.shop_name || 'Diana Flowers'}
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        <a href="#flowers" className="text-zinc-600 hover:text-zinc-900 text-sm uppercase tracking-wider transition-colors">
                            Цветы
                        </a>
                        <a href="#delivery" className="text-zinc-600 hover:text-zinc-900 text-sm uppercase tracking-wider transition-colors">
                            Доставка
                        </a>
                        <a href="#contacts" className="text-zinc-600 hover:text-zinc-900 text-sm uppercase tracking-wider transition-colors">
                            Контакты
                        </a>
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-[#D4AF37] hover:text-[#1a1a1a] text-sm uppercase tracking-wider transition-colors font-medium"
                        >
                            <ArrowLeft size={16} />
                            Готовые букеты
                        </Link>
                        {/* Cart Button */}
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="relative p-2 text-zinc-600 hover:text-[#D4AF37] transition-colors"
                        >
                            <ShoppingBag size={22} />
                            {getTotalItems() > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#D4AF37] text-black text-xs rounded-full flex items-center justify-center font-bold">
                                    {getTotalItems()}
                                </span>
                            )}
                        </button>
                    </nav>

                    {/* Mobile: Cart + Menu */}
                    <div className="md:hidden flex items-center gap-2">
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="relative p-2 text-zinc-600 hover:text-[#D4AF37] transition-colors"
                        >
                            <ShoppingBag size={22} />
                            {getTotalItems() > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#D4AF37] text-black text-xs rounded-full flex items-center justify-center font-bold">
                                    {getTotalItems()}
                                </span>
                            )}
                        </button>
                        <button
                            className="text-zinc-700 p-2"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white py-4 border-t border-zinc-100">
                        <div className="container mx-auto px-6 flex flex-col gap-4">
                            <a href="#flowers" className="text-zinc-600 hover:text-zinc-900 text-sm uppercase tracking-wider">Цветы</a>
                            <a href="#delivery" className="text-zinc-600 hover:text-zinc-900 text-sm uppercase tracking-wider">Доставка</a>
                            <a href="#contacts" className="text-zinc-600 hover:text-zinc-900 text-sm uppercase tracking-wider">Контакты</a>
                            <Link href="/" className="flex items-center gap-2 text-[#D4AF37] hover:text-[#1a1a1a] text-sm uppercase tracking-wider font-medium">
                                <ArrowLeft size={16} />
                                Готовые букеты
                            </Link>
                        </div>
                    </div>
                )}
            </header>

            {/* Hero Section with Slider - Same as main page */}
            <section className="relative h-[80vh] min-h-[600px] overflow-hidden">
                {/* Background Images - All stacked, only current one visible */}
                {heroImages.map((img, idx) => (
                    <div
                        key={idx}
                        className="absolute inset-0 bg-contain bg-center bg-no-repeat transition-opacity duration-1000"
                        style={{
                            backgroundImage: `url('${img}')`,
                            backgroundColor: '#000000',
                            opacity: idx === currentSlide ? 1 : 0,
                        }}
                    />
                ))}
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/40" />

                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-serif text-4xl md:text-6xl text-white uppercase tracking-[0.1em] mb-4"
                    >
                        Создай свой букет
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-white/90 text-lg md:text-2xl font-light mb-6"
                    >
                        Порадуй близких уникальной композицией
                    </motion.p>
                </div>

                {/* Slider Dots */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                    {heroImages.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentSlide(idx)}
                            className={`w-2 h-2 rounded-full transition-all duration-300 
                                ${idx === currentSlide ? 'bg-white w-6' : 'bg-white/40'}`}
                        />
                    ))}
                </div>
            </section>

            {/* Instructions Section */}
            <section className="py-16 bg-zinc-50">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-xl uppercase tracking-[0.2em] text-zinc-800 mb-10">Как это работает?</h2>
                    <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        <div className="text-center p-8 bg-white rounded-lg">
                            <div className="text-4xl mb-4">🌸</div>
                            <h3 className="font-semibold text-zinc-800 mb-2">1. Выберите цветы</h3>
                            <p className="text-zinc-600 text-sm">Нажмите на карточку цветка, чтобы узнать описание и добавить в букет</p>
                        </div>
                        <div className="text-center p-8 bg-white rounded-lg">
                            <div className="text-4xl mb-4">✨</div>
                            <h3 className="font-semibold text-zinc-800 mb-2">2. Соберите композицию</h3>
                            <p className="text-zinc-600 text-sm">Укажите нужное количество каждого цветка с помощью + и −</p>
                        </div>
                        <div className="text-center p-8 bg-white rounded-lg">
                            <div className="text-4xl mb-4">💝</div>
                            <h3 className="font-semibold text-zinc-800 mb-2">3. Оформите заказ</h3>
                            <p className="text-zinc-600 text-sm">Откройте корзину и оформите заказ — мы соберём ваш букет вручную</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content - Flowers Grid */}
            <section id="flowers" className="py-16 bg-white">
                <div className="container mx-auto px-6">
                    <h2 className="text-xl uppercase tracking-[0.2em] text-zinc-800 mb-10">
                        Выберите цветы
                    </h2>

                    {flowers.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
                            {flowers.map((flower) => {
                                const qty = getQuantity(flower.id);
                                return (
                                    <div
                                        key={flower.id}
                                        className="group relative bg-white rounded overflow-hidden cursor-pointer
                                            shadow-md hover:shadow-2xl hover:-translate-y-2
                                            transition-all duration-400 border border-[rgba(212,175,55,0.2)]
                                            hover:border-[#D4AF37]"
                                    >
                                        {/* Image Container - Same as ProductCard */}
                                        <div
                                            className="relative w-full aspect-square bg-black overflow-hidden"
                                            onClick={() => setSelectedFlower(flower)}
                                        >
                                            <Image
                                                src={flower.image_url || '/placeholder-flower.jpg'}
                                                alt={flower.name}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                                unoptimized={flower.image_url?.startsWith('data:')}
                                            />
                                            {qty > 0 && (
                                                <div className="absolute inset-0 bg-pink-500/30 flex items-center justify-center">
                                                    <span className="bg-pink-500 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                                                        {qty} шт.
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content - Same padding as ProductCard */}
                                        <div className="p-5 sm:p-6 bg-white">
                                            <h3 className="font-serif text-lg sm:text-xl text-[#1a1a1a] mb-3 font-semibold leading-tight">
                                                {flower.name}
                                            </h3>
                                            <p className="text-2xl sm:text-3xl font-semibold text-[#1a1a1a] tracking-tight mb-4" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                                {flower.price} GEL <span className="text-base font-normal text-gray-400">/ шт</span>
                                            </p>

                                            {/* Add/Quantity Controls - Same style as ProductCard */}
                                            {qty === 0 ? (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); addToCart(flower); }}
                                                    className="w-full bg-gradient-to-r from-[#1a1a1a] to-[#333] text-[#FFFFF0] 
                                                        font-medium py-3 sm:py-4 rounded text-sm sm:text-base uppercase tracking-wider
                                                        hover:from-[#D4AF37] hover:to-[#E8C878] hover:text-black
                                                        transition-all duration-300 flex items-center justify-center gap-2"
                                                >
                                                    <Plus size={18} />
                                                    Добавить
                                                </button>
                                            ) : (
                                                <div className="flex items-center justify-between gap-2 bg-zinc-100 rounded py-2 px-3">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); updateQuantity(flower.id, -1); }}
                                                        className="w-10 h-10 flex items-center justify-center bg-white border border-zinc-300 rounded hover:bg-zinc-50 text-zinc-700"
                                                    >
                                                        <Minus size={18} />
                                                    </button>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        pattern="[0-9]*"
                                                        value={qty}
                                                        onClick={(e) => e.stopPropagation()}
                                                        onChange={(e) => {
                                                            const val = e.target.value.replace(/\D/g, '');
                                                            setQuantityDirect(flower.id, val);
                                                        }}
                                                        className="w-12 text-center bg-transparent font-bold text-xl text-[#1a1a1a] focus:outline-none"
                                                    />
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); updateQuantity(flower.id, 1); }}
                                                        className="w-10 h-10 flex items-center justify-center bg-white border border-zinc-300 rounded hover:bg-zinc-50 text-zinc-700"
                                                    >
                                                        <Plus size={18} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <p className="text-zinc-400 uppercase tracking-wider">
                                Цветы скоро появятся
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* === DELIVERY SECTION (same as main page) === */}
            <section id="delivery" className="py-16 bg-zinc-50">
                <div className="container mx-auto px-6">
                    <h2 className="text-xl uppercase tracking-[0.2em] text-zinc-800 text-center mb-10">
                        {settings?.delivery_enabled !== false ? 'Доставка и оплата' : 'Самовывоз и оплата'}
                    </h2>

                    <div className={`grid gap-8 max-w-4xl mx-auto ${settings?.delivery_enabled !== false ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
                        {/* Delivery - only show if enabled */}
                        {settings?.delivery_enabled !== false && (
                            <div className="text-center p-8 bg-white rounded-lg">
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
                        <div className="text-center p-8 bg-white rounded-lg">
                            <div className="text-4xl mb-4">🏪</div>
                            <h3 className="font-semibold text-zinc-800 mb-2">Самовывоз</h3>
                            {settings?.pickup_info && (
                                <p className="text-zinc-600 text-sm whitespace-pre-line">{settings.pickup_info}</p>
                            )}
                        </div>
                        <div className="text-center p-8 bg-white rounded-lg">
                            <div className="text-4xl mb-4">💳</div>
                            <h3 className="font-semibold text-zinc-800 mb-2">Оплата</h3>
                            {settings?.payment_info && (
                                <p className="text-zinc-600 text-sm whitespace-pre-line">{settings.payment_info}</p>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* === FOOTER (same as main page) === */}
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

            {/* Flower Detail Modal */}
            {selectedFlower && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedFlower(null)}>
                    <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="relative">
                            <img
                                src={selectedFlower.image_url || '/placeholder-flower.jpg'}
                                alt={selectedFlower.name}
                                className="w-full aspect-square object-cover"
                            />
                            <button
                                onClick={() => setSelectedFlower(null)}
                                className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-zinc-700 hover:bg-white"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <h3 className="font-serif text-2xl text-zinc-900 mb-2">{selectedFlower.name}</h3>
                            <p className="text-[#D4AF37] text-xl font-semibold mb-4">{selectedFlower.price} GEL / шт</p>
                            <p className="text-zinc-600 mb-6">{selectedFlower.description || 'Красивый свежий цветок премиум качества для вашего авторского букета.'}</p>
                            <button
                                onClick={() => addToCart(selectedFlower)}
                                className="w-full py-3 bg-gradient-to-r from-[#1a1a1a] to-[#333] text-[#FFFFF0] rounded-lg font-semibold transition-all hover:from-[#D4AF37] hover:to-[#E8C878] hover:text-black"
                            >
                                Добавить в букет
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cart Sidebar */}
            {isCartOpen && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={() => setIsCartOpen(false)}>
                    <div
                        className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Cart Header */}
                        <div className="flex items-center justify-between p-4 border-b border-zinc-200">
                            <h2 className="font-serif text-xl text-zinc-900">Ваш букет</h2>
                            <button onClick={() => setIsCartOpen(false)} className="p-2 text-zinc-500 hover:text-zinc-700">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-auto p-4">
                            {cart.length === 0 ? (
                                <div className="text-center py-12 text-zinc-400">
                                    <ShoppingBag size={48} className="mx-auto mb-4 opacity-50" />
                                    <p>Букет пока пуст</p>
                                    <p className="text-sm">Добавьте цветы</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {cart.map(item => (
                                        <div key={item.flower.id} className="flex gap-4 bg-zinc-50 rounded-xl p-3">
                                            <img
                                                src={item.flower.image_url}
                                                alt={item.flower.name}
                                                className="w-20 h-20 object-cover rounded-lg"
                                            />
                                            <div className="flex-1">
                                                <h4 className="font-medium text-zinc-900">{item.flower.name}</h4>
                                                <p className="text-[#D4AF37] text-sm">{item.flower.price} GEL / шт</p>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <button
                                                        onClick={() => updateQuantity(item.flower.id, -1)}
                                                        className="w-7 h-7 flex items-center justify-center bg-white border border-zinc-200 rounded-full hover:bg-zinc-100 text-zinc-700"
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        pattern="[0-9]*"
                                                        value={item.quantity}
                                                        onChange={(e) => {
                                                            const val = e.target.value.replace(/\D/g, '');
                                                            setQuantityDirect(item.flower.id, val);
                                                        }}
                                                        className="w-10 text-center bg-transparent font-bold focus:outline-none text-zinc-900"
                                                    />
                                                    <button
                                                        onClick={() => updateQuantity(item.flower.id, 1)}
                                                        className="w-7 h-7 flex items-center justify-center bg-white border border-zinc-200 rounded-full hover:bg-zinc-100 text-zinc-700"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                    <span className="ml-auto font-semibold text-zinc-900">
                                                        {item.flower.price * item.quantity} GEL
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Cart Footer */}
                        {cart.length > 0 && (
                            <div className="p-4 border-t border-zinc-200 bg-white">
                                <div className="flex justify-between text-lg font-semibold mb-4 text-zinc-900">
                                    <span>Итого:</span>
                                    <span className="text-[#D4AF37]">{getTotalPrice()} GEL</span>
                                </div>

                                {/* Cooldown Timer Warning */}
                                {cooldownRemaining > 0 && (
                                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-center">
                                        <p className="text-amber-800 text-sm font-medium">
                                            ↻ Новый заказ будет доступен через:
                                        </p>
                                        <p className="text-amber-900 text-2xl font-bold mt-1">
                                            {Math.floor(cooldownRemaining / 60)}:{String(cooldownRemaining % 60).padStart(2, '0')}
                                        </p>
                                    </div>
                                )}

                                <button
                                    onClick={() => { setIsCartOpen(false); setIsOrderModalOpen(true); }}
                                    disabled={cooldownRemaining > 0}
                                    className="w-full py-3 bg-gradient-to-r from-[#1a1a1a] to-[#333] text-[#FFFFF0] rounded-lg font-semibold mb-2 transition-all hover:from-[#D4AF37] hover:to-[#E8C878] hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Оформить заказ
                                </button>
                                <button className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                                    <Sparkles size={18} />
                                    Сгенерировать букет
                                </button>
                                <p className="text-center text-xs text-zinc-400 mt-2">
                                    AI покажет как будет выглядеть ваш букет
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Order Modal */}
            {isOrderModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setIsOrderModalOpen(false)}>
                    <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="font-serif text-2xl text-zinc-900">Оформление заказа</h2>
                                <button onClick={() => setIsOrderModalOpen(false)} className="text-zinc-400 hover:text-zinc-700">
                                    <X size={24} />
                                </button>
                            </div>

                            {orderSuccess ? (
                                <div className="text-center py-8">
                                    <div className="text-5xl mb-4">🎉</div>
                                    <h3 className="text-xl font-semibold text-zinc-900 mb-2">Заказ принят!</h3>
                                    <p className="text-zinc-600 mb-6">Мы свяжемся с вами в ближайшее время</p>
                                    <button
                                        onClick={() => { setIsOrderModalOpen(false); setOrderSuccess(false); }}
                                        className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-semibold"
                                    >
                                        Закрыть
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Order Summary */}
                                    <div className="bg-zinc-50 rounded-lg p-4 mb-4">
                                        <p className="text-zinc-500 text-sm mb-2">Ваш букет:</p>
                                        {cart.map(item => (
                                            <div key={item.flower.id} className="flex justify-between text-sm text-zinc-700">
                                                <span>{item.flower.name} × {item.quantity}</span>
                                                <span>{item.flower.price * item.quantity} GEL</span>
                                            </div>
                                        ))}
                                        <div className="border-t border-zinc-200 mt-2 pt-2 flex justify-between font-semibold text-zinc-900">
                                            <span>Итого:</span>
                                            <span className="text-[#D4AF37]">{getTotalPrice()} GEL</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-1">Ваше имя *</label>
                                        <input
                                            type="text"
                                            value={orderForm.name}
                                            onChange={(e) => setOrderForm({ ...orderForm, name: e.target.value })}
                                            className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-lg text-zinc-900 focus:border-pink-500 focus:outline-none"
                                            placeholder="Как к вам обращаться?"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-1">Телефон *</label>
                                        <input
                                            type="tel"
                                            inputMode="numeric"
                                            value={orderForm.phone}
                                            onChange={handlePhoneChange}
                                            className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-lg text-zinc-900 focus:border-pink-500 focus:outline-none"
                                            placeholder="+995 XXX XXX XXX"
                                        />
                                    </div>

                                    {/* Delivery Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-2">Способ получения</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setOrderForm({ ...orderForm, deliveryType: 'pickup' })}
                                                className={`py-3 rounded-lg font-medium transition-colors ${orderForm.deliveryType === 'pickup' ? 'bg-pink-500 text-white' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'}`}
                                            >
                                                Самовывоз
                                            </button>
                                            {settings?.delivery_enabled !== false && (
                                                <button
                                                    type="button"
                                                    onClick={() => setOrderForm({ ...orderForm, deliveryType: 'delivery' })}
                                                    className={`py-3 rounded-lg font-medium transition-colors ${orderForm.deliveryType === 'delivery' ? 'bg-pink-500 text-white' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'}`}
                                                >
                                                    Доставка
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {orderForm.deliveryType === 'delivery' && (
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-700 mb-1">Адрес доставки</label>
                                            <input
                                                type="text"
                                                value={orderForm.address}
                                                onChange={(e) => setOrderForm({ ...orderForm, address: e.target.value })}
                                                className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-lg text-zinc-900 focus:border-pink-500 focus:outline-none"
                                                placeholder="Улица, дом, квартира"
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-1">Комментарий</label>
                                        <textarea
                                            value={orderForm.comment}
                                            onChange={(e) => setOrderForm({ ...orderForm, comment: e.target.value })}
                                            className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-lg text-zinc-900 focus:border-pink-500 focus:outline-none resize-none"
                                            rows={2}
                                            placeholder="Пожелания к букету..."
                                        />
                                    </div>

                                    <button
                                        onClick={handleSubmitOrder}
                                        disabled={isSubmitting || !orderForm.name || !orderForm.phone}
                                        className="w-full py-3 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
                                    >
                                        {isSubmitting ? 'Отправка...' : 'Подтвердить заказ'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
