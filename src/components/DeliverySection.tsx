'use client';

import { Settings } from '@/lib/supabase';

interface DeliverySectionProps {
    settings: Settings | null;
}

export default function DeliverySection({ settings }: DeliverySectionProps) {
    return (
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
    );
}
