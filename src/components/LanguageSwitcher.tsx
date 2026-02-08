'use client';

import { useLanguage, Language } from '@/lib/language';

export default function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();

    const languages: { code: Language; flag: string }[] = [
        { code: 'ka', flag: '🇬🇪' },
        { code: 'en', flag: '🇬🇧' },
        { code: 'ru', flag: '🇷🇺' },
    ];

    return (
        <div className="flex items-center gap-2">
            {languages.map((lang) => (
                <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`text-2xl transition-all duration-200 hover:scale-125 ${language === lang.code
                            ? 'scale-110 drop-shadow-lg'
                            : 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0'
                        }`}
                    aria-label={`Switch language to ${lang.code}`}
                >
                    {lang.flag}
                </button>
            ))}
        </div>
    );
}
