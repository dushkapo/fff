import { Phone, MapPin, Send, Clock } from 'lucide-react';
import { Settings } from '@/lib/supabase';

interface FooterProps {
    settings: Settings | null;
}

export default function Footer({ settings }: FooterProps) {
    return (
        <footer id="contacts" className="bg-black border-t border-white/5 py-16">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div>
                        <h3 className="font-serif text-xl text-white uppercase tracking-[0.15em] mb-4">
                            Arzu Flowers
                        </h3>
                        <p className="text-zinc-600 text-sm leading-relaxed">
                            Премиум букеты для особых моментов. Каждая композиция создана с любовью.
                        </p>
                    </div>

                    {/* Contacts */}
                    <div>
                        <h4 className="text-white/80 uppercase tracking-[0.15em] text-xs mb-6">
                            Контакты
                        </h4>
                        <div className="space-y-4">
                            {settings?.phone && (
                                <a href={`tel:${settings.phone.replace(/[^+\d]/g, '')}`}
                                    className="flex items-center gap-3 text-zinc-500 hover:text-[#D4AF37] text-sm transition-colors">
                                    <Phone size={14} className="text-[#D4AF37]" />
                                    <span>{settings.phone}</span>
                                </a>
                            )}
                            {settings?.telegram_link && (
                                <a href={settings.telegram_link} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-3 text-zinc-500 hover:text-[#D4AF37] text-sm transition-colors">
                                    <Send size={14} className="text-[#D4AF37]" />
                                    <span>Telegram</span>
                                </a>
                            )}
                            {settings?.address && (
                                <a href={settings.address_link || '#'} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-3 text-zinc-500 hover:text-[#D4AF37] text-sm transition-colors">
                                    <MapPin size={14} className="text-green-500" />
                                    <span>{settings.address}</span>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Schedule */}
                    <div>
                        <h4 className="text-white/80 uppercase tracking-[0.15em] text-xs mb-6">
                            Режим работы
                        </h4>
                        <div className="flex items-start gap-3 text-zinc-500 text-sm">
                            <Clock size={14} className="text-[#D4AF37] mt-0.5" />
                            <div>
                                <p>{settings?.schedule || 'Ежедневно'}</p>
                                <p>с 9:00 до 21:00</p>
                            </div>
                        </div>
                    </div>

                    {/* Info */}
                    <div>
                        <h4 className="text-white/80 uppercase tracking-[0.15em] text-xs mb-6">
                            Информация
                        </h4>
                        <ul className="space-y-3 text-zinc-600 text-sm">
                            <li>• Доставка по городу — 500 ₽</li>
                            <li>• Самовывоз — бесплатно</li>
                            <li>• Срочная доставка за 2 часа</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 mt-12 pt-8 text-center">
                    <p className="text-zinc-700 text-xs uppercase tracking-[0.15em]">
                        © 2026 Diana Flowers. Все права защищены.
                    </p>
                </div>
            </div>
        </footer>
    );
}

