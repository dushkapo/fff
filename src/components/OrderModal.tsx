'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Truck, Store, Clock, CheckCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Product, Settings } from '@/lib/supabase';
import { orderSchema, OrderData } from '@/lib/validations';
import { useLanguage } from '@/lib/language';

interface OrderModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
    deliveryEnabled?: boolean;
    settings?: Settings | null; // Pass settings to get delivery price
}

// Generate next 7 days for day selector
function getNextDays(): { value: string; label: string }[] {
    const days = [];
    const dayNames = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    const monthNames = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const dayName = i === 0 ? 'Сегодня' : i === 1 ? 'Завтра' : dayNames[date.getDay()];
        days.push({
            value: date.toISOString().split('T')[0],
            label: `${dayName}, ${date.getDate()} ${monthNames[date.getMonth()]}`
        });
    }
    return days;
}

// Time slots from 9:00 to 21:00
const TIME_SLOTS = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
];

export default function OrderModal({ product, isOpen, onClose, deliveryEnabled = true, settings }: OrderModalProps) {
    const { t } = useLanguage();
    const [step, setStep] = useState(1);
    const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>(deliveryEnabled ? 'delivery' : 'pickup');
    const [timeType, setTimeType] = useState<'urgent' | 'specific'>('urgent');
    const [selectedDay, setSelectedDay] = useState('');
    const [selectedTime, setSelectedTime] = useState('12:00');
    const [formData, setFormData] = useState({ name: '', phone: '', address: '', comment: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');
    const [errors, setErrors] = useState<{ phone?: string }>({});
    const [days, setDays] = useState<{ value: string; label: string }[]>([]);

    // Initialize days on mount
    useEffect(() => {
        setDays(getNextDays());
        if (!selectedDay) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            setSelectedDay(tomorrow.toISOString().split('T')[0]);
        }
    }, []);

    // If delivery is disabled, force pickup
    useEffect(() => {
        if (!deliveryEnabled) {
            setDeliveryType('pickup');
        }
    }, [deliveryEnabled]);

    if (!product) return null;

    // Get delivery price from settings, default to 0
    const deliveryPriceFromSettings = settings?.delivery_price ? parseInt(settings.delivery_price.replace(/\D/g, '')) || 0 : 0;
    const deliveryPrice = deliveryType === 'delivery' ? deliveryPriceFromSettings : 0;

    const finalPrice = product.discount > 0
        ? Math.round(product.price * (1 - product.discount / 100))
        : product.price;
    const totalPrice = finalPrice + deliveryPrice;

    // Georgian phone format: +995 XXX XXX XXX (9 digits after country code)
    const formatGeorgianPhone = (value: string): string => {
        const digits = value.replace(/\D/g, '');
        const limited = digits.slice(0, 12); // 995 + 9 digits = 12

        if (limited.length === 0) return '';
        if (limited.length <= 3) return `+${limited}`;
        if (limited.length <= 6) return `+${limited.slice(0, 3)} ${limited.slice(3)}`;
        if (limited.length <= 9) return `+${limited.slice(0, 3)} ${limited.slice(3, 6)} ${limited.slice(6)}`;
        return `+${limited.slice(0, 3)} ${limited.slice(3, 6)} ${limited.slice(6, 9)} ${limited.slice(9, 12)}`;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatGeorgianPhone(e.target.value);
        setFormData(prev => ({ ...prev, phone: formatted }));

        const digits = e.target.value.replace(/\D/g, '');
        if (digits.length >= 12) {
            setErrors(prev => ({ ...prev, phone: undefined }));
        }
    };

    const handleSubmit = async () => {
        setError('');
        setErrors({});

        const phoneDigits = formData.phone.replace(/\D/g, '');
        if (phoneDigits.length < 12) {
            setErrors({ phone: 'Введите номер полностью (+995 XXX XXX XXX)' });
            return;
        }

        setIsSubmitting(true);

        try {
            const specificTimeFormatted = timeType === 'specific'
                ? `${days.find(d => d.value === selectedDay)?.label || selectedDay} в ${selectedTime}`
                : undefined;

            const orderData: OrderData = {
                name: formData.name,
                phone: formData.phone,
                address: deliveryType === 'delivery' ? formData.address : undefined,
                deliveryType,
                timeType,
                specificTime: specificTimeFormatted,
                comment: formData.comment || undefined,
                productId: String(product.id),
                productName: product.name,
                productPrice: totalPrice,
            };

            orderSchema.parse(orderData);

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
        setDeliveryType(deliveryEnabled ? 'delivery' : 'pickup');
        setTimeType('urgent');
        setSelectedDay('');
        setSelectedTime('12:00');
        setFormData({ name: '', phone: '', address: '', comment: '' });
        setIsSuccess(false);
        setError('');
        setErrors({});
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
                        className="bg-[#FFFFF0] rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-[#FFFFF0] p-5 border-b border-gray-200 flex justify-between items-center z-10">
                            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[#1a1a1a]">
                                {step === 4 ? t('orderSuccess') : step === 1 ? t('selectedBouquet') : step === 2 ? t('chooseDelivery') : t('contactInfo')}
                            </h2>
                            <button onClick={resetAndClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-5 sm:p-6">
                            {/* ===================== STEP 1: PRODUCT DETAILS ===================== */}
                            {step === 1 && (
                                <div className="space-y-5">
                                    {/* Large Product Image */}
                                    <div className="relative w-full aspect-square bg-black rounded-xl overflow-hidden">
                                        <Image
                                            src={product.image_url || '/bouquet-1.jpg'}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, 500px"
                                            unoptimized={product.image_url?.startsWith('data:')}
                                        />
                                        {product.discount > 0 && (
                                            <div className="absolute top-4 right-4 bg-[#D4AF37] text-black text-sm font-bold px-3 py-1">
                                                -{product.discount}%
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div>
                                        <h3 className="font-serif text-2xl font-bold text-[#1a1a1a] mb-2">
                                            {product.name}
                                        </h3>
                                        <p className="text-gray-600 text-base leading-relaxed mb-4">
                                            {product.description || 'Изысканный букет свежих цветов, созданный нашими флористами с любовью.'}
                                        </p>
                                        <div className="flex items-baseline gap-3">
                                            <span className="font-serif text-3xl font-bold text-[#1a1a1a]">
                                                {finalPrice.toLocaleString('ka-GE')} GEL
                                            </span>
                                            {product.discount > 0 && (
                                                <span className="text-lg text-gray-400 line-through">
                                                    {product.price.toLocaleString('ka-GE')} GEL
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setStep(2)}
                                        className="w-full bg-gradient-to-r from-[#1a1a1a] to-[#333] text-[#FFFFF0] py-4 rounded-xl font-semibold text-lg uppercase tracking-wide hover:from-[#D4AF37] hover:to-[#E8C878] hover:text-black transition-all"
                                    >
                                        {t('placeOrder')}
                                    </button>
                                </div>
                            )}

                            {/* ===================== STEP 2: DELIVERY OPTIONS ===================== */}
                            {step === 2 && (
                                <div className="space-y-6">
                                    {/* Delivery Type Selection */}
                                    {deliveryEnabled ? (
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                onClick={() => setDeliveryType('delivery')}
                                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${deliveryType === 'delivery'
                                                    ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <Truck size={32} className={deliveryType === 'delivery' ? 'text-[#D4AF37]' : 'text-gray-400'} />
                                                <span className="font-medium">{t('deliveryOption')}</span>
                                                {deliveryType === 'delivery' && deliveryPriceFromSettings > 0 && (
                                                    <span className="text-sm text-[#D4AF37] font-semibold">+{deliveryPriceFromSettings} GEL</span>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => setDeliveryType('pickup')}
                                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${deliveryType === 'pickup'
                                                    ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <Store size={32} className={deliveryType === 'pickup' ? 'text-[#D4AF37]' : 'text-gray-400'} />
                                                <span className="font-medium">{t('pickup')}</span>
                                                <span className="text-sm text-gray-500">{t('free')}</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="p-4 rounded-xl border-2 border-[#D4AF37] bg-[#D4AF37]/10 flex flex-col items-center gap-2">
                                            <Store size={32} className="text-[#D4AF37]" />
                                            <span className="font-medium">{t('pickup')}</span>
                                            <span className="text-sm text-gray-500">{t('free')}</span>
                                        </div>
                                    )}

                                    {/* Time Selection */}
                                    <div>
                                        <h4 className="font-semibold mb-3 text-[#1a1a1a]">
                                            {deliveryType === 'delivery' ? t('whenDeliver') : t('whenPickup')}
                                        </h4>
                                        <div className="space-y-2">
                                            <button
                                                onClick={() => setTimeType('urgent')}
                                                className={`w-full p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${timeType === 'urgent' ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-gray-200'
                                                    }`}
                                            >
                                                <Clock size={20} className={timeType === 'urgent' ? 'text-[#D4AF37]' : 'text-gray-400'} />
                                                <span>{t('urgent')}</span>
                                            </button>
                                            <button
                                                onClick={() => setTimeType('specific')}
                                                className={`w-full p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${timeType === 'specific' ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-gray-200'
                                                    }`}
                                            >
                                                <Clock size={20} className={timeType === 'specific' ? 'text-[#D4AF37]' : 'text-gray-400'} />
                                                <span>{t('specificTime')}</span>
                                            </button>
                                        </div>

                                        {/* Day and Time Selectors */}
                                        {timeType === 'specific' && (
                                            <div className="mt-4 grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-sm font-medium mb-1 text-gray-700">{t('day')}</label>
                                                    <select
                                                        value={selectedDay}
                                                        onChange={(e) => setSelectedDay(e.target.value)}
                                                        className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#D4AF37] focus:outline-none bg-white"
                                                    >
                                                        {days.map(day => (
                                                            <option key={day.value} value={day.value}>
                                                                {day.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1 text-gray-700">{t('time')}</label>
                                                    <select
                                                        value={selectedTime}
                                                        onChange={(e) => setSelectedTime(e.target.value)}
                                                        className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#D4AF37] focus:outline-none bg-white"
                                                    >
                                                        {TIME_SLOTS.map(time => (
                                                            <option key={time} value={time}>
                                                                {time}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setStep(1)}
                                            className="flex-1 py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                                        >
                                            {t('back')}
                                        </button>
                                        <button
                                            onClick={() => setStep(3)}
                                            className="flex-1 bg-gradient-to-r from-[#1a1a1a] to-[#333] text-[#FFFFF0] py-3 rounded-xl font-semibold hover:from-[#D4AF37] hover:to-[#E8C878] hover:text-black transition-all"
                                        >
                                            {t('next')}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ===================== STEP 3: CONTACT INFO ===================== */}
                            {step === 3 && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">{t('yourName')}</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Имя"
                                            className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#D4AF37] focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">{t('phone')}</label>
                                        <input
                                            type="tel"
                                            inputMode="numeric"
                                            value={formData.phone}
                                            onChange={handlePhoneChange}
                                            placeholder="+995 XXX XXX XXX"
                                            className={`w-full p-3 border rounded-xl focus:border-[#D4AF37] focus:outline-none transition-colors ${errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-200'
                                                }`}
                                        />
                                        {errors.phone && (
                                            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                                        )}
                                    </div>
                                    {deliveryType === 'delivery' && (
                                        <div>
                                            <label className="block text-sm font-medium mb-1">{t('deliveryAddress')}</label>
                                            <textarea
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                placeholder={t('addressPlaceholder')}
                                                rows={2}
                                                className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#D4AF37] focus:outline-none resize-none"
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">{t('comment')}</label>
                                        <textarea
                                            value={formData.comment}
                                            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                            placeholder={t('commentPlaceholder')}
                                            rows={2}
                                            className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#D4AF37] focus:outline-none resize-none"
                                        />
                                    </div>

                                    {/* Order Summary */}
                                    <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                                        <div className="flex justify-between">
                                            <span>{t('bouquet')}:</span>
                                            <span className="font-medium">{finalPrice.toLocaleString('ka-GE')} GEL</span>
                                        </div>
                                        {deliveryType === 'delivery' && deliveryPriceFromSettings > 0 && (
                                            <div className="flex justify-between">
                                                <span>{t('deliveryOption')}:</span>
                                                <span>{deliveryPriceFromSettings} GEL</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                            <span>{t('total')}:</span>
                                            <span className="text-[#1a1a1a]">{totalPrice.toLocaleString('ka-GE')} GEL</span>
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
                                            {t('back')}
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            disabled={isSubmitting || !formData.name || !formData.phone}
                                            className="flex-1 bg-gradient-to-r from-[#D4AF37] to-[#E8C878] text-black py-3 rounded-xl font-semibold hover:from-[#1a1a1a] hover:to-[#333] hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : null}
                                            {t('placeOrder')}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ===================== STEP 4: SUCCESS ===================== */}
                            {step === 4 && (
                                <div className="text-center py-8">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', duration: 0.5 }}
                                    >
                                        <CheckCircle size={80} className="text-green-500 mx-auto mb-4" />
                                    </motion.div>
                                    <h3 className="font-serif text-2xl font-semibold mb-2">{t('thankYou')}</h3>
                                    <p className="text-gray-600 mb-6">{t('weWillContact')}</p>
                                    <button
                                        onClick={resetAndClose}
                                        className="bg-[#1a1a1a] text-white py-3 px-8 rounded-xl font-semibold hover:bg-[#333] transition-colors"
                                    >
                                        {t('close')}
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
