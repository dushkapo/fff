'use client';

import { useState, useEffect } from 'react';
import { supabase, Flower, Settings } from '@/lib/supabase';
import { ArrowLeft, ShoppingBag, Plus, Minus, X, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface CartItem {
    flower: Flower;
    quantity: number;
}

export default function CreateBouquetPage() {
    const [flowers, setFlowers] = useState<Flower[]>([]);
    const [settings, setSettings] = useState<Settings | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [selectedFlower, setSelectedFlower] = useState<Flower | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
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

    const getQuantity = (flowerId: string): number => {
        return cart.find(item => item.flower.id === flowerId)?.quantity || 0;
    };

    const getTotalItems = (): number => {
        return cart.reduce((sum, item) => sum + item.quantity, 0);
    };

    const getTotalPrice = (): number => {
        return cart.reduce((sum, item) => sum + item.flower.price * item.quantity, 0);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50">
                <div className="animate-spin w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50">
            {/* Header */}
            <header className="bg-white sticky top-0 z-40 border-b border-zinc-200">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 transition-colors">
                        <ArrowLeft size={20} />
                        <span className="font-serif text-lg">{settings?.shop_name || 'Назад'}</span>
                    </Link>

                    <h1 className="font-serif text-xl text-zinc-900">Создать букет</h1>

                    {/* Cart Button */}
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="relative p-2 text-zinc-600 hover:text-pink-500 transition-colors"
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

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-serif text-zinc-800 mb-2">Выберите цветы</h2>
                    <p className="text-zinc-500">Нажмите на цветок, чтобы узнать больше и добавить в букет</p>
                </div>

                {/* Flowers Grid */}
                {flowers.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                        {flowers.map((flower) => {
                            const qty = getQuantity(flower.id);
                            return (
                                <div
                                    key={flower.id}
                                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group"
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
                                            <div className="absolute inset-0 bg-pink-500/20 flex items-center justify-center">
                                                <span className="bg-pink-500 text-white px-4 py-2 rounded-full font-bold text-lg">
                                                    {qty} шт.
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="p-4">
                                        <h3 className="font-medium text-zinc-800 text-sm sm:text-base mb-1 truncate">
                                            {flower.name}
                                        </h3>
                                        <p className="text-pink-500 font-semibold" style={{ fontFamily: "'Montserrat', sans-serif" }}>
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
                                            <div className="mt-3 flex items-center justify-center gap-4 bg-zinc-100 rounded-lg py-2">
                                                <button
                                                    onClick={() => updateQuantity(flower.id, -1)}
                                                    className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow hover:bg-zinc-50"
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="font-bold text-lg w-8 text-center">{qty}</span>
                                                <button
                                                    onClick={() => updateQuantity(flower.id, 1)}
                                                    className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow hover:bg-zinc-50"
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
                        <p className="text-zinc-400">Цветы скоро появятся</p>
                    </div>
                )}
            </main>

            {/* Flower Detail Modal */}
            {selectedFlower && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedFlower(null)}>
                    <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
                        <div className="relative">
                            <img
                                src={selectedFlower.image_url || '/placeholder-flower.jpg'}
                                alt={selectedFlower.name}
                                className="w-full aspect-square object-cover"
                            />
                            <button
                                onClick={() => setSelectedFlower(null)}
                                className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <h3 className="font-serif text-2xl text-zinc-800 mb-2">{selectedFlower.name}</h3>
                            <p className="text-pink-500 text-xl font-semibold mb-4">{selectedFlower.price} ₽ / шт</p>
                            <p className="text-zinc-600 mb-6">{selectedFlower.description || 'Красивый свежий цветок для вашего букета.'}</p>
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
                <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={() => setIsCartOpen(false)}>
                    <div
                        className="bg-white w-full max-w-md h-full flex flex-col"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Cart Header */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="font-serif text-xl">Ваш букет</h2>
                            <button onClick={() => setIsCartOpen(false)} className="p-2">
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
                                                <h4 className="font-medium text-zinc-800">{item.flower.name}</h4>
                                                <p className="text-pink-500 text-sm">{item.flower.price} ₽ / шт</p>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <button
                                                        onClick={() => updateQuantity(item.flower.id, -1)}
                                                        className="w-7 h-7 flex items-center justify-center bg-white rounded-full shadow"
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="font-bold">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.flower.id, 1)}
                                                        className="w-7 h-7 flex items-center justify-center bg-white rounded-full shadow"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                    <span className="ml-auto font-semibold">
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
                            <div className="p-4 border-t bg-white">
                                <div className="flex justify-between text-lg font-semibold mb-4">
                                    <span>Итого:</span>
                                    <span className="text-pink-500">{getTotalPrice()} ₽</span>
                                </div>
                                <button className="w-full py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-semibold mb-2 transition-colors">
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
        </div>
    );
}
