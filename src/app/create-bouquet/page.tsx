'use client';

import { useState, useEffect } from 'react';
import { supabase, Flower, Settings } from '@/lib/supabase';
import { ArrowLeft, ShoppingBag, Plus, Minus, X, Sparkles, Phone, Clock, Send } from 'lucide-react';
import Link from 'next/link';
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
        if (!orderForm.name || !orderForm.phone) return;
        setIsSubmitting(true);

        const flowersList = cart.map(item => `${item.flower.name} × ${item.quantity}`).join('\n');

        try {
            await fetch('/api/orders', {
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
            setOrderSuccess(true);
            setCart([]);
        } catch (error) {
            console.error('Order error:', error);
        }
        setIsSubmitting(false);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="animate-spin w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <header className="bg-black/80 backdrop-blur-sm sticky top-0 z-40 border-b border-white/10">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                        <span className="font-serif text-lg">{settings?.shop_name || 'На главную'}</span>
                    </Link>

                    {/* Cart Button */}
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="relative p-2 text-white/70 hover:text-pink-400 transition-colors"
                    >
                        <ShoppingBag size={24} />
                        {getTotalItems() > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 text-white text-xs rounded-full flex items-center justify-center">
                                {getTotalItems()}
                            </span>
                        )}
                    </button>
                </div>
            </header>

            {/* Hero Section with Slider */}
            <section className="relative h-[60vh] min-h-[400px] overflow-hidden">
                {heroImages.map((img, idx) => (
                    <div
                        key={idx}
                        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
                        style={{
                            backgroundImage: `url('${img}')`,
                            opacity: idx === currentSlide ? 1 : 0,
                        }}
                    />
                ))}
                <div className="absolute inset-0 bg-black/50" />

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
                        className="text-white/80 text-lg md:text-2xl font-light mb-6"
                    >
                        Порадуй близких уникальной композицией
                    </motion.p>
                </div>

                {/* Slider Dots */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
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
            <section className="py-12 bg-zinc-900">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-2xl font-serif text-white mb-4">Как это работает?</h2>
                    <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        <div className="p-6">
                            <div className="text-4xl mb-3">🌸</div>
                            <h3 className="font-semibold mb-2">1. Выберите цветы</h3>
                            <p className="text-white/60 text-sm">Нажмите на карточку цветка, чтобы узнать описание и добавить в букет</p>
                        </div>
                        <div className="p-6">
                            <div className="text-4xl mb-3">✨</div>
                            <h3 className="font-semibold mb-2">2. Соберите композицию</h3>
                            <p className="text-white/60 text-sm">Укажите нужное количество каждого цветка с помощью + и −</p>
                        </div>
                        <div className="p-6">
                            <div className="text-4xl mb-3">💝</div>
                            <h3 className="font-semibold mb-2">3. Оформите заказ</h3>
                            <p className="text-white/60 text-sm">Откройте корзину и оформите заказ — мы соберём ваш букет вручную</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content - Flowers Grid */}
            <main className="container mx-auto px-4 py-12">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-serif text-white mb-2">Выберите цветы</h2>
                    <p className="text-white/60">Нажмите на цветок для подробного описания</p>
                </div>

                {flowers.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                        {flowers.map((flower) => {
                            const qty = getQuantity(flower.id);
                            return (
                                <div
                                    key={flower.id}
                                    className="bg-zinc-900 rounded-2xl overflow-hidden border border-white/10 hover:border-pink-500/50 transition-all duration-300 group"
                                >
                                    {/* Image */}
                                    <div
                                        className="relative aspect-square cursor-pointer"
                                        onClick={() => setSelectedFlower(flower)}
                                    >
                                        <img
                                            src={flower.image_url || '/placeholder-flower.jpg'}
                                            alt={flower.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        {qty > 0 && (
                                            <div className="absolute inset-0 bg-pink-500/30 flex items-center justify-center">
                                                <span className="bg-pink-500 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                                                    {qty} шт.
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="p-4">
                                        <h3 className="font-medium text-white text-sm sm:text-base mb-1 truncate">
                                            {flower.name}
                                        </h3>
                                        <p className="text-pink-400 font-semibold">
                                            {flower.price} ₽ / шт
                                        </p>

                                        {/* Add/Quantity Controls */}
                                        {qty === 0 ? (
                                            <button
                                                onClick={() => addToCart(flower)}
                                                className="mt-3 w-full py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-sm font-medium transition-colors"
                                            >
                                                Добавить
                                            </button>
                                        ) : (
                                            <div className="mt-3 flex items-center justify-center gap-3 bg-zinc-800 rounded-lg py-2">
                                                <button
                                                    onClick={() => updateQuantity(flower.id, -1)}
                                                    className="w-8 h-8 flex items-center justify-center bg-zinc-700 rounded-full hover:bg-zinc-600"
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    value={qty}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/\D/g, '');
                                                        setQuantityDirect(flower.id, val);
                                                    }}
                                                    className="w-12 text-center bg-transparent font-bold text-lg focus:outline-none"
                                                />
                                                <button
                                                    onClick={() => updateQuantity(flower.id, 1)}
                                                    className="w-8 h-8 flex items-center justify-center bg-zinc-700 rounded-full hover:bg-zinc-600"
                                                >
                                                    <Plus size={16} />
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
                        <p className="text-white/40">Цветы скоро появятся</p>
                    </div>
                )}
            </main>

            {/* Contact Section */}
            <section className="py-12 bg-zinc-900 border-t border-white/10">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto text-center">
                        <h2 className="text-2xl font-serif text-white mb-6">Контакты</h2>
                        <div className="flex flex-wrap justify-center gap-6">
                            {settings?.phone && (
                                <a href={`tel:${settings.phone.replace(/[^\+\d]/g, '')}`} className="flex items-center gap-2 text-white/70 hover:text-pink-400 transition-colors">
                                    <Phone size={20} />
                                    <span>{settings.phone}</span>
                                </a>
                            )}
                            {settings?.schedule && (
                                <div className="flex items-center gap-2 text-white/70">
                                    <Clock size={20} />
                                    <span>{settings.schedule}</span>
                                </div>
                            )}
                            {settings?.telegram_link && (
                                <a href={settings.telegram_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/70 hover:text-[#26A5E4] transition-colors">
                                    <Send size={20} />
                                    <span>Telegram</span>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-6 bg-black border-t border-white/10 text-center text-white/40 text-sm">
                © 2026 {settings?.shop_name || 'Flower Shop'}. Все права защищены.
            </footer>

            {/* Flower Detail Modal */}
            {selectedFlower && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setSelectedFlower(null)}>
                    <div className="bg-zinc-900 rounded-2xl max-w-md w-full max-h-[90vh] overflow-auto border border-white/10" onClick={e => e.stopPropagation()}>
                        <div className="relative">
                            <img
                                src={selectedFlower.image_url || '/placeholder-flower.jpg'}
                                alt={selectedFlower.name}
                                className="w-full aspect-square object-cover"
                            />
                            <button
                                onClick={() => setSelectedFlower(null)}
                                className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <h3 className="font-serif text-2xl text-white mb-2">{selectedFlower.name}</h3>
                            <p className="text-pink-400 text-xl font-semibold mb-4">{selectedFlower.price} ₽ / шт</p>
                            <p className="text-white/60 mb-6">{selectedFlower.description || 'Красивый свежий цветок премиум качества для вашего авторского букета.'}</p>
                            <button
                                onClick={() => addToCart(selectedFlower)}
                                className="w-full py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-semibold transition-colors"
                            >
                                Добавить в букет
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cart Sidebar */}
            {isCartOpen && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/70" onClick={() => setIsCartOpen(false)}>
                    <div
                        className="bg-zinc-900 w-full max-w-md h-full flex flex-col border-l border-white/10"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Cart Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <h2 className="font-serif text-xl text-white">Ваш букет</h2>
                            <button onClick={() => setIsCartOpen(false)} className="p-2 text-white/70 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-auto p-4">
                            {cart.length === 0 ? (
                                <div className="text-center py-12 text-white/40">
                                    <ShoppingBag size={48} className="mx-auto mb-4 opacity-50" />
                                    <p>Букет пока пуст</p>
                                    <p className="text-sm">Добавьте цветы</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {cart.map(item => (
                                        <div key={item.flower.id} className="flex gap-4 bg-zinc-800 rounded-xl p-3">
                                            <img
                                                src={item.flower.image_url}
                                                alt={item.flower.name}
                                                className="w-20 h-20 object-cover rounded-lg"
                                            />
                                            <div className="flex-1">
                                                <h4 className="font-medium text-white">{item.flower.name}</h4>
                                                <p className="text-pink-400 text-sm">{item.flower.price} ₽ / шт</p>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <button
                                                        onClick={() => updateQuantity(item.flower.id, -1)}
                                                        className="w-7 h-7 flex items-center justify-center bg-zinc-700 rounded-full hover:bg-zinc-600"
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
                                                        className="w-10 text-center bg-transparent font-bold focus:outline-none text-white"
                                                    />
                                                    <button
                                                        onClick={() => updateQuantity(item.flower.id, 1)}
                                                        className="w-7 h-7 flex items-center justify-center bg-zinc-700 rounded-full hover:bg-zinc-600"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                    <span className="ml-auto font-semibold text-white">
                                                        {item.flower.price * item.quantity} ₽
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
                            <div className="p-4 border-t border-white/10 bg-zinc-900">
                                <div className="flex justify-between text-lg font-semibold mb-4 text-white">
                                    <span>Итого:</span>
                                    <span className="text-pink-400">{getTotalPrice()} ₽</span>
                                </div>
                                <button
                                    onClick={() => { setIsCartOpen(false); setIsOrderModalOpen(true); }}
                                    className="w-full py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-semibold mb-2 transition-colors"
                                >
                                    Оформить заказ
                                </button>
                                <button className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                                    <Sparkles size={18} />
                                    Сгенерировать букет
                                </button>
                                <p className="text-center text-xs text-white/40 mt-2">
                                    AI покажет как будет выглядеть ваш букет
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Order Modal */}
            {isOrderModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setIsOrderModalOpen(false)}>
                    <div className="bg-zinc-900 rounded-2xl max-w-md w-full max-h-[90vh] overflow-auto border border-white/10" onClick={e => e.stopPropagation()}>
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="font-serif text-2xl text-white">Оформление заказа</h2>
                                <button onClick={() => setIsOrderModalOpen(false)} className="text-white/70 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>

                            {orderSuccess ? (
                                <div className="text-center py-8">
                                    <div className="text-5xl mb-4">🎉</div>
                                    <h3 className="text-xl font-semibold text-white mb-2">Заказ принят!</h3>
                                    <p className="text-white/60 mb-6">Мы свяжемся с вами в ближайшее время</p>
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
                                    <div className="bg-zinc-800 rounded-lg p-4 mb-4">
                                        <p className="text-white/60 text-sm mb-2">Ваш букет:</p>
                                        {cart.map(item => (
                                            <div key={item.flower.id} className="flex justify-between text-sm text-white/80">
                                                <span>{item.flower.name} × {item.quantity}</span>
                                                <span>{item.flower.price * item.quantity} ₽</span>
                                            </div>
                                        ))}
                                        <div className="border-t border-white/10 mt-2 pt-2 flex justify-between font-semibold text-white">
                                            <span>Итого:</span>
                                            <span className="text-pink-400">{getTotalPrice()} ₽</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-white/70 mb-1">Ваше имя *</label>
                                        <input
                                            type="text"
                                            value={orderForm.name}
                                            onChange={(e) => setOrderForm({ ...orderForm, name: e.target.value })}
                                            className="w-full px-4 py-3 bg-zinc-800 border border-white/10 rounded-lg text-white focus:border-pink-500 focus:outline-none"
                                            placeholder="Как к вам обращаться?"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-white/70 mb-1">Телефон *</label>
                                        <input
                                            type="tel"
                                            value={orderForm.phone}
                                            onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
                                            className="w-full px-4 py-3 bg-zinc-800 border border-white/10 rounded-lg text-white focus:border-pink-500 focus:outline-none"
                                            placeholder="+7 (___) ___-__-__"
                                        />
                                    </div>

                                    {/* Delivery Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-white/70 mb-2">Способ получения</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setOrderForm({ ...orderForm, deliveryType: 'pickup' })}
                                                className={`py-3 rounded-lg font-medium transition-colors ${orderForm.deliveryType === 'pickup' ? 'bg-pink-500 text-white' : 'bg-zinc-800 text-white/70 hover:bg-zinc-700'}`}
                                            >
                                                Самовывоз
                                            </button>
                                            {settings?.delivery_enabled !== false && (
                                                <button
                                                    type="button"
                                                    onClick={() => setOrderForm({ ...orderForm, deliveryType: 'delivery' })}
                                                    className={`py-3 rounded-lg font-medium transition-colors ${orderForm.deliveryType === 'delivery' ? 'bg-pink-500 text-white' : 'bg-zinc-800 text-white/70 hover:bg-zinc-700'}`}
                                                >
                                                    Доставка
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {orderForm.deliveryType === 'delivery' && (
                                        <div>
                                            <label className="block text-sm font-medium text-white/70 mb-1">Адрес доставки</label>
                                            <input
                                                type="text"
                                                value={orderForm.address}
                                                onChange={(e) => setOrderForm({ ...orderForm, address: e.target.value })}
                                                className="w-full px-4 py-3 bg-zinc-800 border border-white/10 rounded-lg text-white focus:border-pink-500 focus:outline-none"
                                                placeholder="Улица, дом, квартира"
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-white/70 mb-1">Комментарий</label>
                                        <textarea
                                            value={orderForm.comment}
                                            onChange={(e) => setOrderForm({ ...orderForm, comment: e.target.value })}
                                            className="w-full px-4 py-3 bg-zinc-800 border border-white/10 rounded-lg text-white focus:border-pink-500 focus:outline-none resize-none"
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
