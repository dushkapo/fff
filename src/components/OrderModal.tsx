'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Truck, Store, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { Product } from '@/lib/supabase';
import { orderSchema, OrderData } from '@/lib/validations';

interface OrderModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function OrderModal({ product, isOpen, onClose }: OrderModalProps) {
    const [step, setStep] = useState(1);
    const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
    const [timeType, setTimeType] = useState<'urgent' | 'specific'>('urgent');
    const [specificTime, setSpecificTime] = useState('');
    const [formData, setFormData] = useState({ name: '', phone: '', address: '', comment: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    if (!product) return null;

    const deliveryPrice = deliveryType === 'delivery' ? 500 : 0;
    const finalPrice = product.discount > 0
        ? Math.round(product.price * (1 - product.discount / 100))
        : product.price;
    const totalPrice = finalPrice + deliveryPrice;

    const handleSubmit = async () => {
        setError('');
        setIsSubmitting(true);

        try {
            const orderData: OrderData = {
                name: formData.name,
                phone: formData.phone,
                address: deliveryType === 'delivery' ? formData.address : undefined,
                deliveryType,
                timeType,
                specificTime: timeType === 'specific' ? specificTime : undefined,
                comment: formData.comment || undefined,
                productId: product.id,
                productName: product.name,
                productPrice: totalPrice,
            };

            // Validate with Zod
            orderSchema.parse(orderData);

            // Send to API
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
            });

            if (!response.ok) throw new Error('Ошибка отправки заказа');

            setIsSuccess(true);
            setStep(4);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ошибка отправки');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetAndClose = () => {
        setStep(1);
        setDeliveryType('delivery');
        setTimeType('urgent');
        setSpecificTime('');
        setFormData({ name: '', phone: '', address: '', comment: '' });
        setIsSuccess(false);
        setError('');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={resetAndClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-ivory rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-ivory p-6 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="font-serif text-2xl font-semibold">
                                {step === 4 ? 'Заказ оформлен!' : step === 1 ? 'Ваш букет' : step === 2 ? 'Способ получения' : 'Контактные данные'}
                            </h2>
                            <button onClick={resetAndClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Step 1: Product Info */}
                            {step === 1 && (
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <img
                                            src={product.image_url}
                                            alt={product.name}
                                            className="w-32 h-32 object-cover rounded-xl"
                                        />
                                        <div>
                                            <h3 className="font-serif text-xl font-semibold">{product.name}</h3>
                                            <p className="text-gray-600 text-sm mt-1">{product.description}</p>
                                            <p className="text-2xl font-bold text-deep-green mt-2">
                                                {finalPrice.toLocaleString('ru-RU')} ₽
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setStep(2)}
                                        className="w-full bg-deep-green text-white py-3 rounded-xl font-semibold hover:bg-deep-green/90 transition-colors"
                                    >
                                        Далее
                                    </button>
                                </div>
                            )}

                            {/* Step 2: Delivery Options */}
                            {step === 2 && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setDeliveryType('delivery')}
                                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${deliveryType === 'delivery'
                                                    ? 'border-soft-gold bg-soft-gold/10'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <Truck size={32} className={deliveryType === 'delivery' ? 'text-soft-gold' : 'text-gray-400'} />
                                            <span className="font-medium">Доставка</span>
                                            <span className="text-sm text-gray-500">+500 ₽</span>
                                        </button>
                                        <button
                                            onClick={() => setDeliveryType('pickup')}
                                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${deliveryType === 'pickup'
                                                    ? 'border-soft-gold bg-soft-gold/10'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <Store size={32} className={deliveryType === 'pickup' ? 'text-soft-gold' : 'text-gray-400'} />
                                            <span className="font-medium">Самовывоз</span>
                                            <span className="text-sm text-gray-500">Бесплатно</span>
                                        </button>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold mb-3">
                                            {deliveryType === 'delivery' ? 'Когда доставить?' : 'Когда забрать?'}
                                        </h4>
                                        <div className="space-y-2">
                                            <button
                                                onClick={() => setTimeType('urgent')}
                                                className={`w-full p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${timeType === 'urgent' ? 'border-soft-gold bg-soft-gold/10' : 'border-gray-200'
                                                    }`}
                                            >
                                                <Clock size={20} className={timeType === 'urgent' ? 'text-soft-gold' : 'text-gray-400'} />
                                                <span>Срочно (в течение 2 часов)</span>
                                            </button>
                                            <button
                                                onClick={() => setTimeType('specific')}
                                                className={`w-full p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${timeType === 'specific' ? 'border-soft-gold bg-soft-gold/10' : 'border-gray-200'
                                                    }`}
                                            >
                                                <Clock size={20} className={timeType === 'specific' ? 'text-soft-gold' : 'text-gray-400'} />
                                                <span>К конкретному времени</span>
                                            </button>
                                        </div>
                                        {timeType === 'specific' && (
                                            <input
                                                type="datetime-local"
                                                value={specificTime}
                                                onChange={(e) => setSpecificTime(e.target.value)}
                                                className="w-full mt-3 p-3 border border-gray-200 rounded-xl focus:border-soft-gold focus:outline-none"
                                            />
                                        )}
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setStep(1)}
                                            className="flex-1 py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                                        >
                                            Назад
                                        </button>
                                        <button
                                            onClick={() => setStep(3)}
                                            className="flex-1 bg-deep-green text-white py-3 rounded-xl font-semibold hover:bg-deep-green/90 transition-colors"
                                        >
                                            Далее
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Contact Info */}
                            {step === 3 && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Ваше имя</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Анна"
                                            className="w-full p-3 border border-gray-200 rounded-xl focus:border-soft-gold focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Телефон</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="+7 (999) 123-45-67"
                                            className="w-full p-3 border border-gray-200 rounded-xl focus:border-soft-gold focus:outline-none"
                                        />
                                    </div>
                                    {deliveryType === 'delivery' && (
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Адрес доставки</label>
                                            <textarea
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                placeholder="Улица, дом, квартира"
                                                rows={2}
                                                className="w-full p-3 border border-gray-200 rounded-xl focus:border-soft-gold focus:outline-none resize-none"
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Комментарий (необязательно)</label>
                                        <textarea
                                            value={formData.comment}
                                            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                            placeholder="Пожелания к заказу"
                                            rows={2}
                                            className="w-full p-3 border border-gray-200 rounded-xl focus:border-soft-gold focus:outline-none resize-none"
                                        />
                                    </div>

                                    {/* Order Summary */}
                                    <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                                        <div className="flex justify-between">
                                            <span>Букет:</span>
                                            <span>{finalPrice.toLocaleString('ru-RU')} ₽</span>
                                        </div>
                                        {deliveryType === 'delivery' && (
                                            <div className="flex justify-between">
                                                <span>Доставка:</span>
                                                <span>500 ₽</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                            <span>Итого:</span>
                                            <span className="text-deep-green">{totalPrice.toLocaleString('ru-RU')} ₽</span>
                                        </div>
                                    </div>

                                    {error && (
                                        <p className="text-red-500 text-sm">{error}</p>
                                    )}

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setStep(2)}
                                            className="flex-1 py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                                        >
                                            Назад
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            disabled={isSubmitting || !formData.name || !formData.phone}
                                            className="flex-1 bg-gradient-to-r from-soft-gold to-gold-light text-white py-3 rounded-xl font-semibold hover:from-deep-green hover:to-deep-green transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : null}
                                            Оформить заказ
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Success */}
                            {step === 4 && (
                                <div className="text-center py-8">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', duration: 0.5 }}
                                    >
                                        <CheckCircle size={80} className="text-green-500 mx-auto mb-4" />
                                    </motion.div>
                                    <h3 className="font-serif text-2xl font-semibold mb-2">Спасибо за заказ!</h3>
                                    <p className="text-gray-600 mb-6">Мы свяжемся с вами в ближайшее время для подтверждения.</p>
                                    <button
                                        onClick={resetAndClose}
                                        className="bg-deep-green text-white py-3 px-8 rounded-xl font-semibold hover:bg-deep-green/90 transition-colors"
                                    >
                                        Закрыть
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
