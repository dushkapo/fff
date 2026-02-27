'use client';

import { Phone, Clock, MapPin } from 'lucide-react';
import { Settings } from '@/lib/supabase';

interface FooterProps {
    settings: Settings | null;
}

export default function Footer({ settings }: FooterProps) {
    return (
        <footer id="contacts" className="py-16 bg-zinc-900 text-white">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-10">
                    {/* Brand */}
                    <div>
                        <h3 className="font-serif text-2xl mb-4 notranslate" data-brand="name" data-brand-ru="Мир Цветов" data-brand-lat="Mir Tsvetov">{settings?.shop_name || 'Мир Цветов'}</h3>
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
                            {settings?.telegram_link && (
                                <a href={settings.telegram_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-zinc-400 hover:text-[#26A5E4] text-sm transition-colors">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                                    </svg>
                                    <span>Telegram</span>
                                </a>
                            )}
                            {settings?.address_link && (
                                <a href={settings.address_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-zinc-400 hover:text-[#4285F4] text-sm transition-colors">
                                    <MapPin size={16} />
                                    <span>Maps</span>
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
                        © 2026 <span className="notranslate" data-brand="name" data-brand-ru="Мир Цветов" data-brand-lat="Mir Tsvetov">{settings?.shop_name || 'Мир Цветов'}</span>. Все права защищены.
                    </p>
                </div>
            </div>
        </footer>
    );
}
