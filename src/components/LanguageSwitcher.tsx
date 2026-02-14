'use client';

import { useEffect, useState, useCallback } from 'react';

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
        _googleTranslateReady: boolean;
    }
}

// Map of Google Translate language codes
const LANG_MAP: Record<string, string> = {
    'ru': 'ru',
    'en': 'en',
    'ka': 'ka',
};

export default function LanguageSwitcher() {
    const [currentLang, setCurrentLang] = useState('ru');
    const [isReady, setIsReady] = useState(false);

    // Initialize Google Translate
    useEffect(() => {
        // Add CSS to hide Google Translate bar
        if (!document.getElementById('gt-hide-style')) {
            const style = document.createElement('style');
            style.id = 'gt-hide-style';
            style.innerHTML = `
                .goog-te-banner-frame, .skiptranslate, #goog-gt-tt, 
                .goog-te-balloon-frame, .goog-te-gadget,
                iframe.goog-te-menu-frame {
                    display: none !important;
                    visibility: hidden !important;
                    height: 0 !important;
                    overflow: hidden !important;
                }
                body { top: 0 !important; }
            `;
            document.head.appendChild(style);
        }

        // Create the hidden element for Google Translate
        if (!document.getElementById('google_translate_element')) {
            const div = document.createElement('div');
            div.id = 'google_translate_element';
            div.style.display = 'none';
            document.body.appendChild(div);
        }

        // Load Google Translate script only once
        if (!document.getElementById('gt-script')) {
            window.googleTranslateElementInit = () => {
                new window.google.translate.TranslateElement(
                    {
                        pageLanguage: 'ru',
                        includedLanguages: 'ru,ka,en',
                        autoDisplay: false,
                        layout: 0, // SIMPLE layout
                    },
                    'google_translate_element'
                );
                window._googleTranslateReady = true;

                // After init, apply saved language
                setTimeout(() => {
                    setIsReady(true);
                    const saved = localStorage.getItem('site-lang');
                    if (saved && saved !== 'ru') {
                        doTranslate(saved);
                    }
                }, 800);
            };

            const script = document.createElement('script');
            script.id = 'gt-script';
            script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            script.async = true;
            document.body.appendChild(script);
        } else if (window._googleTranslateReady) {
            // Script already loaded - apply saved language
            setIsReady(true);
            const saved = localStorage.getItem('site-lang');
            if (saved && saved !== 'ru') {
                setTimeout(() => doTranslate(saved), 500);
            }
        }

        // Load saved language for UI state
        const saved = localStorage.getItem('site-lang');
        if (saved) setCurrentLang(saved);

        // Update brand names based on saved language
        if (saved) updateBrandNames(saved);
    }, []);

    // When language changes, update brand name elements
    useEffect(() => {
        updateBrandNames(currentLang);
    }, [currentLang]);

    const updateBrandNames = (lang: string) => {
        // Find all elements with data-brand attribute and update text
        const brandElements = document.querySelectorAll('[data-brand="name"]');
        brandElements.forEach(el => {
            if (lang === 'ru') {
                el.textContent = el.getAttribute('data-brand-ru') || 'Мир Цветов';
            } else {
                el.textContent = el.getAttribute('data-brand-lat') || 'Mir Tsvetov';
            }
        });
    };

    const doTranslate = useCallback((langCode: string) => {
        // Find the Google Translate combo box
        const maxAttempts = 10;
        let attempts = 0;

        const tryTranslate = () => {
            const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
            if (combo) {
                combo.value = LANG_MAP[langCode] || langCode;
                combo.dispatchEvent(new Event('change'));
                // Update brand names after translation applies
                setTimeout(() => updateBrandNames(langCode), 300);
            } else if (attempts < maxAttempts) {
                attempts++;
                setTimeout(tryTranslate, 300);
            }
        };

        tryTranslate();
    }, []);

    const switchLanguage = useCallback((langCode: string) => {
        localStorage.setItem('site-lang', langCode);
        setCurrentLang(langCode);

        if (langCode === 'ru') {
            // Reset to Russian — clear Google Translate cookies and restore
            // Remove googtrans cookies
            document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname;
            document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.' + window.location.hostname;

            // Try to restore via the iframe close button
            const frame = document.querySelector('.goog-te-banner-frame') as HTMLIFrameElement;
            if (frame && frame.contentDocument) {
                const closeBtn = frame.contentDocument.querySelector('.goog-close-link') as HTMLElement;
                if (closeBtn) {
                    closeBtn.click();
                    updateBrandNames('ru');
                    return;
                }
            }

            // Alternative: set combo to Russian
            const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
            if (combo) {
                combo.value = 'ru';
                combo.dispatchEvent(new Event('change'));
                // Give it a moment, then check if page reverted
                setTimeout(() => {
                    updateBrandNames('ru');
                    // If still showing translated, do a soft reload
                    const body = document.body;
                    if (body.classList.contains('translated-ltr') || body.classList.contains('translated-rtl')) {
                        // Force restore by removing translation class
                        body.classList.remove('translated-ltr', 'translated-rtl');
                        // Reload only as last resort
                        window.location.reload();
                    }
                }, 500);
            } else {
                updateBrandNames('ru');
            }
        } else {
            doTranslate(langCode);
        }
    }, [doTranslate]);

    return (
        <div className="flex items-center gap-1.5">
            <button
                onClick={() => switchLanguage('en')}
                className={`transition-all duration-200 hover:scale-110 p-0.5 rounded ${currentLang === 'en' ? 'ring-2 ring-[#D4AF37] opacity-100' : 'opacity-50 hover:opacity-100'}`}
                title="English"
                aria-label="Switch to English"
            >
                <UKFlag />
            </button>
            <button
                onClick={() => switchLanguage('ka')}
                className={`transition-all duration-200 hover:scale-110 p-0.5 rounded ${currentLang === 'ka' ? 'ring-2 ring-[#D4AF37] opacity-100' : 'opacity-50 hover:opacity-100'}`}
                title="ქართული"
                aria-label="Switch to Georgian"
            >
                <GeorgiaFlag />
            </button>
            <button
                onClick={() => switchLanguage('ru')}
                className={`transition-all duration-200 hover:scale-110 p-0.5 rounded ${currentLang === 'ru' ? 'ring-2 ring-[#D4AF37] opacity-100' : 'opacity-50 hover:opacity-100'}`}
                title="Русский"
                aria-label="Switch to Russian"
            >
                <RussiaFlag />
            </button>
        </div>
    );
}
