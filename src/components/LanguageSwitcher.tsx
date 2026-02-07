'use client';

import { useLanguage, Language } from '@/lib/language';

export default function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();

    const languages: { code: Language; flag: string; name: string }[] = [
        { code: 'ka', flag: '🇬🇪', name: 'ქართული' },
        { code: 'en', flag: '🇬🇧', name: 'English' },
        { code: 'ru', flag: '🇷🇺', name: 'Русский' },
    ];

    return (
        <div className="flex items-center gap-1">
            {languages.map((lang) => (
                <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`w-7 h-5 text-lg flex items-center justify-center rounded transition-all duration-200 ${language === lang.code
                            ? 'ring-2 ring-[#D4AF37] scale-110 shadow-sm'
                            : 'opacity-50 hover:opacity-100 hover:scale-105 grayscale hover:grayscale-0'
                        }`}
                    title={lang.name}
                    aria-label={`Switch to ${lang.name}`}
                >
                    {lang.flag}
                </button>
            ))}
        </div>
    );
}
