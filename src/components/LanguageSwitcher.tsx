'use client';

import { useEffect } from 'react';

// SVG Flag Components
const GeorgiaFlag = () => (
    <svg viewBox="0 0 900 600" className="w-6 h-4 rounded-sm shadow-sm">
        <rect fill="#fff" width="900" height="600" />
        <rect fill="#ff0000" y="240" width="900" height="120" />
        <rect fill="#ff0000" x="360" width="180" height="600" />
        <g fill="#ff0000">
            <rect x="45" y="45" width="90" height="90" />
            <rect x="45" y="465" width="90" height="90" />
            <rect x="765" y="45" width="90" height="90" />
            <rect x="765" y="465" width="90" height="90" />
        </g>
    </svg>
);

const UKFlag = () => (
    <svg viewBox="0 0 60 30" className="w-6 h-4 rounded-sm shadow-sm">
        <clipPath id="s"><path d="M0,0 v30 h60 v-30 z" /></clipPath>
        <clipPath id="t"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" /></clipPath>
        <g clipPath="url(#s)">
            <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
            <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
            <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4" />
            <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
            <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
        </g>
    </svg>
);

const RussiaFlag = () => (
    <svg viewBox="0 0 9 6" className="w-6 h-4 rounded-sm shadow-sm">
        <rect fill="#fff" width="9" height="3" />
        <rect fill="#0039A6" y="2" width="9" height="2" />
        <rect fill="#D52B1E" y="4" width="9" height="2" />
    </svg>
);

declare global {
    interface Window {
        google: {
            translate: {
                TranslateElement: new (options: object, elementId: string) => void;
            };
        };
        googleTranslateElementInit: () => void;
    }
}

export default function LanguageSwitcher() {
    useEffect(() => {
        // Load Google Translate script
        if (!document.getElementById('google-translate-script')) {
            const script = document.createElement('script');
            script.id = 'google-translate-script';
            script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            script.async = true;
            document.body.appendChild(script);

            window.googleTranslateElementInit = () => {
                new window.google.translate.TranslateElement(
                    {
                        pageLanguage: 'ru',
                        includedLanguages: 'ru,ka,en',
                        autoDisplay: false,
                    },
                    'google_translate_element'
                );
            };
        }
    }, []);

    const translateTo = (langCode: string) => {
        const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
        if (select) {
            select.value = langCode;
            select.dispatchEvent(new Event('change'));
        }
    };

    return (
        <div className="flex items-center gap-2">
            {/* Hidden Google Translate element */}
            <div id="google_translate_element" className="hidden" />

            {/* Flag buttons */}
            <button
                onClick={() => translateTo('ka')}
                className="transition-all duration-200 hover:scale-110 opacity-70 hover:opacity-100"
                title="ქართული"
            >
                <GeorgiaFlag />
            </button>
            <button
                onClick={() => translateTo('en')}
                className="transition-all duration-200 hover:scale-110 opacity-70 hover:opacity-100"
                title="English"
            >
                <UKFlag />
            </button>
            <button
                onClick={() => translateTo('ru')}
                className="transition-all duration-200 hover:scale-110 opacity-70 hover:opacity-100"
                title="Русский"
            >
                <RussiaFlag />
            </button>
        </div>
    );
}
