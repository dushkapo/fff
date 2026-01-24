'use client';

import { Phone, MapPin } from 'lucide-react';
import { Settings } from '@/lib/supabase';

interface HeaderProps {
    settings: Settings | null;
}

export default function Header({ settings }: HeaderProps) {
    return (
        <header className="bg-gray-900 text-ivory py-8 relative overflow-hidden">
            {/* Decorative gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900" />
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-soft-gold to-transparent" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center">
                    <h1 className="font-serif text-4xl md:text-5xl font-bold mb-2 tracking-wide">
                        Diana Flowers
                    </h1>
                    <p className="text-gray-300 text-lg">Премиум букеты для особых моментов</p>

                    {/* Shop Status */}
                    {settings && (
                        <div className="mt-4 flex items-center justify-center gap-2">
                            <span className={`w-3 h-3 rounded-full ${settings.shop_open ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                            <span className="text-sm text-gray-300">
                                {settings.shop_open ? 'Открыто' : 'Закрыто'} • {settings.schedule || 'Ежедневно с 9:00 до 21:00'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Contact Info */}
                {settings && (
                    <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm">
                        <a href={`tel:${settings.phone?.replace(/[^+\d]/g, '')}`} className="flex items-center gap-2 hover:text-soft-gold transition-colors">
                            <Phone size={18} />
                            <span>{settings.phone}</span>
                        </a>
                        {settings.address && (
                            <a href={settings.address_link || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-soft-gold transition-colors">
                                <MapPin size={18} className="text-green-500" />
                                <span>{settings.address}</span>
                            </a>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}
