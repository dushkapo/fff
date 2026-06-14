'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

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

// Set googtrans cookie
function setTranslateCookie(lang: string) {
    const value = lang === 'ru' ? '' : `/ru/${lang}`;
    const host = window.location.hostname;

    // Clear all old cookies
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${host}`;
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${host}`;

    if (lang !== 'ru') {
        const expiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
        document.cookie = `googtrans=${value}; expires=${expiry}; path=/;`;
        document.cookie = `googtrans=${value}; expires=${expiry}; path=/; domain=${host}`;
        document.cookie = `googtrans=${value}; expires=${expiry}; path=/; domain=.${host}`;
    }
}

// Update brand name elements based on language
function updateBrandNames(lang: string) {
    const els = document.querySelectorAll('[data-brand="name"]');
    for (let i = 0; i < els.length; i++) {
        const el = els[i];
        if (lang === 'ru') {
            el.textContent = el.getAttribute('data-brand-ru') || 'Мир Цветов';
        } else {
            el.textContent = el.getAttribute('data-brand-lat') || 'Mir Tsvetov';
        }
    }
}

export default function LanguageSwitcher() {
    const [currentLang, setCurrentLang] = useState('ru');
    const initDone = useRef(false);

    useEffect(() => {
        if (initDone.current) return;
        initDone.current = true;

        // Inject hide-bar CSS
        if (!document.getElementById('gt-hide-css')) {
            const style = document.createElement('style');
            style.id = 'gt-hide-css';
            style.textContent = `
                .goog-te-banner-frame, .skiptranslate, #goog-gt-tt,
                .goog-te-balloon-frame, iframe.goog-te-menu-frame {
                    display: none !important; visibility: hidden !important;
                    height: 0 !important; overflow: hidden !important;
                }
                body { top: 0 !important; }
                .goog-te-gadget { display: none !important; }
            `;
            document.head.appendChild(style);
        }

        // Create hidden container for Google Translate
        if (!document.getElementById('google_translate_element')) {
            const d = document.createElement('div');
            d.id = 'google_translate_element';
            d.style.display = 'none';
            document.body.appendChild(d);
        }

        // Read saved language
        const saved = localStorage.getItem('site-lang') || 'ru';
        setCurrentLang(saved);

        // Set cookie BEFORE loading script
        if (saved !== 'ru') {
            setTranslateCookie(saved);
        }

        // Load Google Translate
        if (!document.getElementById('gt-script')) {
            window.googleTranslateElementInit = () => {
                new window.google.translate.TranslateElement(
                    {
                        pageLanguage: 'ru',
                        includedLanguages: 'en,ka,ru',
                        autoDisplay: false,
                        layout: 0,
                    },
                    'google_translate_element'
                );

                // The googtrans cookie (set before init) makes Google Translate
                // apply the saved language automatically. No combo manipulation,
                // so there is no retry/reload loop when the script is slow.
                updateBrandNames(saved);
            };

            const script = document.createElement('script');
            script.id = 'gt-script';
            script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            script.async = true;
            document.body.appendChild(script);
        } else {
            // Script already loaded (SPA navigation)
            updateBrandNames(saved);
        }
    }, []);

    const switchLanguage = useCallback((langCode: string) => {
        if (langCode === currentLang) return;

        // Persist choice + set the googtrans cookie, then reload once.
        // Google Translate reads the cookie on load and applies the language
        // (or restores Russian when the cookie is cleared). A single reload is
        // reliable and avoids the previous flicker/reload loop.
        localStorage.setItem('site-lang', langCode);
        setCurrentLang(langCode);
        setTranslateCookie(langCode);
        window.location.reload();
    }, [currentLang]);

    return (
        <div className="flex items-center gap-1.5">
            <button
                onClick={() => switchLanguage('en')}
                className={`transition-all duration-200 hover:scale-110 p-0.5 rounded ${currentLang === 'en' ? 'ring-2 ring-[#D4AF37] opacity-100' : 'opacity-50 hover:opacity-100'
                    }`}
                title="English"
            >
                <UKFlag />
            </button>
            <button
                onClick={() => switchLanguage('ka')}
                className={`transition-all duration-200 hover:scale-110 p-0.5 rounded ${currentLang === 'ka' ? 'ring-2 ring-[#D4AF37] opacity-100' : 'opacity-50 hover:opacity-100'
                    }`}
                title="ქართული"
            >
                <GeorgiaFlag />
            </button>
            <button
                onClick={() => switchLanguage('ru')}
                className={`transition-all duration-200 hover:scale-110 p-0.5 rounded ${currentLang === 'ru' ? 'ring-2 ring-[#D4AF37] opacity-100' : 'opacity-50 hover:opacity-100'
                    }`}
                title="Русский"
            >
                <RussiaFlag />
            </button>
        </div>
    );
}
