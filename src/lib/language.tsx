'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'ru' | 'ka' | 'en';

// All translations
export const translations = {
    ru: {
        // Navigation
        catalog: 'Каталог',
        about: 'О нас',
        delivery: 'Доставка',
        contacts: 'Контакты',
        createBouquet: 'Создать букет',
        readyBouquets: 'Готовые букеты',

        // Hero
        heroSubtitle: 'Изысканные букеты для особых моментов',

        // Catalog
        ourCollection: 'Наша коллекция',
        bouquetsComing: 'Букеты скоро появятся',
        order: 'Заказать',
        outOfStock: 'Нет в наличии',

        // Create Bouquet Page
        howItWorks: 'Как это работает?',
        step1Title: 'Выберите цветы',
        step1Desc: 'Нажмите на карточку цветка, чтобы узнать описание и добавить в букет',
        step2Title: 'Соберите композицию',
        step2Desc: 'Укажите нужное количество каждого цветка с помощью + и −',
        step3Title: 'Оформите заказ',
        step3Desc: 'Откройте корзину и оформите заказ — мы соберём ваш букет вручную',
        selectFlowers: 'Выберите цветы',
        flowersComing: 'Цветы скоро появятся',
        add: 'Добавить',
        addToBouquet: 'Добавить в букет',
        perPiece: '/ шт',

        // Cart
        myBouquet: 'Мой букет',
        bouquetEmpty: 'Букет пока пуст',
        addFlowers: 'Добавьте цветы',
        total: 'Итого',
        placeOrder: 'Оформить заказ',
        generateBouquet: 'Сгенерировать букет',
        aiPreview: 'AI покажет как будет выглядеть ваш букет',
        newOrderAvailable: 'Новый заказ будет доступен через',

        // Order Form
        orderSuccess: 'Заказ оформлен!',
        thankYou: 'Спасибо за заказ!',
        weWillContact: 'Мы свяжемся с вами в ближайшее время для подтверждения.',
        close: 'Закрыть',
        yourBouquet: 'Ваш букет',
        yourName: 'Ваше имя *',
        namePlaceholder: 'Как к вам обращаться?',
        phone: 'Телефон *',
        phonePlaceholder: '+995 XXX XXX XXX',
        deliveryMethod: 'Способ получения',
        pickup: 'Самовывоз',
        deliveryOption: 'Доставка',
        free: 'Бесплатно',
        deliveryAddress: 'Адрес доставки',
        addressPlaceholder: 'Улица, дом, квартира',
        comment: 'Комментарий (необязательно)',
        commentPlaceholder: 'Пожелания к заказу',

        // Order Modal
        selectedBouquet: 'Выбранный букет',
        chooseDelivery: 'Способ получения',
        contactInfo: 'Контактные данные',
        whenDeliver: 'Когда доставить?',
        whenPickup: 'Когда забрать?',
        urgent: 'Срочно (в течение 2 часов)',
        specificTime: 'К конкретному времени',
        day: 'День',
        time: 'Время',
        back: 'Назад',
        next: 'Далее',
        bouquet: 'Букет',

        // Delivery Section
        deliveryAndPayment: 'Доставка и оплата',
        pickupAndPayment: 'Самовывоз и оплата',
        deliveryInCity: 'По городу',
        payment: 'Оплата',
        aboutBoutique: 'О нашем бутике',

        // Footer
        schedule: 'Режим работы',
        information: 'Информация',
        allRightsReserved: 'Все права защищены',

        // Days
        today: 'Сегодня',
        tomorrow: 'Завтра',
        sunday: 'Воскресенье',
        monday: 'Понедельник',
        tuesday: 'Вторник',
        wednesday: 'Среда',
        thursday: 'Четверг',
        friday: 'Пятница',
        saturday: 'Суббота',

        // Months
        jan: 'янв', feb: 'фев', mar: 'мар', apr: 'апр', may: 'мая', jun: 'июн',
        jul: 'июл', aug: 'авг', sep: 'сен', oct: 'окт', nov: 'ноя', dec: 'дек',

        // Validation
        enterNameAndPhone: 'Пожалуйста, введите имя и корректный номер телефона',
        orderError: 'Ошибка при отправке заказа. Попробуйте ещё раз.',
        phoneError: 'Введите номер полностью (+995 XXX XXX XXX)',
    },
    ka: {
        // Navigation
        catalog: 'კატალოგი',
        about: 'ჩვენს შესახებ',
        delivery: 'მიწოდება',
        contacts: 'კონტაქტი',
        createBouquet: 'თაიგულის შექმნა',
        readyBouquets: 'მზა თაიგულები',

        // Hero
        heroSubtitle: 'დახვეწილი თაიგულები განსაკუთრებული მომენტებისთვის',

        // Catalog
        ourCollection: 'ჩვენი კოლექცია',
        bouquetsComing: 'თაიგულები მალე გამოჩნდება',
        order: 'შეკვეთა',
        outOfStock: 'არ არის მარაგში',

        // Create Bouquet Page
        howItWorks: 'როგორ მუშაობს?',
        step1Title: 'აირჩიეთ ყვავილები',
        step1Desc: 'დააჭირეთ ყვავილის ბარათს აღწერის სანახავად და თაიგულში დასამატებლად',
        step2Title: 'შეადგინეთ კომპოზიცია',
        step2Desc: 'მიუთითეთ თითოეული ყვავილის სასურველი რაოდენობა + და − გამოყენებით',
        step3Title: 'გააფორმეთ შეკვეთა',
        step3Desc: 'გახსენით კალათა და გააფორმეთ შეკვეთა — ჩვენ ხელით შევაგროვებთ თქვენს თაიგულს',
        selectFlowers: 'აირჩიეთ ყვავილები',
        flowersComing: 'ყვავილები მალე გამოჩნდება',
        add: 'დამატება',
        addToBouquet: 'თაიგულში დამატება',
        perPiece: '/ ცალი',

        // Cart
        myBouquet: 'ჩემი თაიგული',
        bouquetEmpty: 'თაიგული ცარიელია',
        addFlowers: 'დაამატეთ ყვავილები',
        total: 'სულ',
        placeOrder: 'შეკვეთის გაფორმება',
        generateBouquet: 'თაიგულის გენერირება',
        aiPreview: 'AI აჩვენებს როგორ გამოიყურება თქვენი თაიგული',
        newOrderAvailable: 'ახალი შეკვეთა ხელმისაწვდომი იქნება',

        // Order Form
        orderSuccess: 'შეკვეთა მიღებულია!',
        thankYou: 'მადლობა შეკვეთისთვის!',
        weWillContact: 'დაგიკავშირდებით უახლოეს დროში დასადასტურებლად.',
        close: 'დახურვა',
        yourBouquet: 'თქვენი თაიგული',
        yourName: 'თქვენი სახელი *',
        namePlaceholder: 'როგორ მოგმართოთ?',
        phone: 'ტელეფონი *',
        phonePlaceholder: '+995 XXX XXX XXX',
        deliveryMethod: 'მიღების წესი',
        pickup: 'თვითგატანა',
        deliveryOption: 'მიწოდება',
        free: 'უფასო',
        deliveryAddress: 'მიწოდების მისამართი',
        addressPlaceholder: 'ქუჩა, სახლი, ბინა',
        comment: 'კომენტარი (არასავალდებულო)',
        commentPlaceholder: 'სურვილები შეკვეთასთან დაკავშირებით',

        // Order Modal
        selectedBouquet: 'არჩეული თაიგული',
        chooseDelivery: 'მიღების წესი',
        contactInfo: 'საკონტაქტო ინფორმაცია',
        whenDeliver: 'როდის მოგაწოდოთ?',
        whenPickup: 'როდის წაიღებთ?',
        urgent: 'სასწრაფო (2 საათში)',
        specificTime: 'კონკრეტულ დროს',
        day: 'დღე',
        time: 'დრო',
        back: 'უკან',
        next: 'შემდეგი',
        bouquet: 'თაიგული',

        // Delivery Section
        deliveryAndPayment: 'მიწოდება და გადახდა',
        pickupAndPayment: 'თვითგატანა და გადახდა',
        deliveryInCity: 'ქალაქში',
        payment: 'გადახდა',
        aboutBoutique: 'ჩვენს ბუტიკის შესახებ',

        // Footer
        schedule: 'სამუშაო საათები',
        information: 'ინფორმაცია',
        allRightsReserved: 'ყველა უფლება დაცულია',

        // Days
        today: 'დღეს',
        tomorrow: 'ხვალ',
        sunday: 'კვირა',
        monday: 'ორშაბათი',
        tuesday: 'სამშაბათი',
        wednesday: 'ოთხშაბათი',
        thursday: 'ხუთშაბათი',
        friday: 'პარასკევი',
        saturday: 'შაბათი',

        // Months
        jan: 'იან', feb: 'თებ', mar: 'მარ', apr: 'აპრ', may: 'მაი', jun: 'ივნ',
        jul: 'ივლ', aug: 'აგვ', sep: 'სექ', oct: 'ოქტ', nov: 'ნოე', dec: 'დეკ',

        // Validation
        enterNameAndPhone: 'გთხოვთ მიუთითოთ სახელი და სწორი ტელეფონის ნომერი',
        orderError: 'შეკვეთის გაგზავნის შეცდომა. სცადეთ ხელახლა.',
        phoneError: 'შეიყვანეთ ნომერი სრულად (+995 XXX XXX XXX)',
    },
    en: {
        // Navigation
        catalog: 'Catalog',
        about: 'About Us',
        delivery: 'Delivery',
        contacts: 'Contacts',
        createBouquet: 'Create Bouquet',
        readyBouquets: 'Ready Bouquets',

        // Hero
        heroSubtitle: 'Exquisite bouquets for special moments',

        // Catalog
        ourCollection: 'Our Collection',
        bouquetsComing: 'Bouquets coming soon',
        order: 'Order',
        outOfStock: 'Out of stock',

        // Create Bouquet Page
        howItWorks: 'How it works?',
        step1Title: 'Select flowers',
        step1Desc: 'Click on a flower card to see description and add to bouquet',
        step2Title: 'Create composition',
        step2Desc: 'Specify the quantity of each flower using + and −',
        step3Title: 'Place order',
        step3Desc: 'Open the cart and place your order — we will hand-assemble your bouquet',
        selectFlowers: 'Select flowers',
        flowersComing: 'Flowers coming soon',
        add: 'Add',
        addToBouquet: 'Add to bouquet',
        perPiece: '/ pc',

        // Cart
        myBouquet: 'My Bouquet',
        bouquetEmpty: 'Bouquet is empty',
        addFlowers: 'Add flowers',
        total: 'Total',
        placeOrder: 'Place Order',
        generateBouquet: 'Generate Bouquet',
        aiPreview: 'AI will show how your bouquet looks',
        newOrderAvailable: 'New order available in',

        // Order Form
        orderSuccess: 'Order placed!',
        thankYou: 'Thank you for your order!',
        weWillContact: 'We will contact you shortly to confirm.',
        close: 'Close',
        yourBouquet: 'Your bouquet',
        yourName: 'Your name *',
        namePlaceholder: 'How should we call you?',
        phone: 'Phone *',
        phonePlaceholder: '+995 XXX XXX XXX',
        deliveryMethod: 'Delivery method',
        pickup: 'Pickup',
        deliveryOption: 'Delivery',
        free: 'Free',
        deliveryAddress: 'Delivery address',
        addressPlaceholder: 'Street, building, apartment',
        comment: 'Comment (optional)',
        commentPlaceholder: 'Order preferences',

        // Order Modal
        selectedBouquet: 'Selected Bouquet',
        chooseDelivery: 'Delivery method',
        contactInfo: 'Contact information',
        whenDeliver: 'When to deliver?',
        whenPickup: 'When to pick up?',
        urgent: 'Urgent (within 2 hours)',
        specificTime: 'Specific time',
        day: 'Day',
        time: 'Time',
        back: 'Back',
        next: 'Next',
        bouquet: 'Bouquet',

        // Delivery Section
        deliveryAndPayment: 'Delivery & Payment',
        pickupAndPayment: 'Pickup & Payment',
        deliveryInCity: 'In city',
        payment: 'Payment',
        aboutBoutique: 'About our boutique',

        // Footer
        schedule: 'Working hours',
        information: 'Information',
        allRightsReserved: 'All rights reserved',

        // Days
        today: 'Today',
        tomorrow: 'Tomorrow',
        sunday: 'Sunday',
        monday: 'Monday',
        tuesday: 'Tuesday',
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday',

        // Months
        jan: 'Jan', feb: 'Feb', mar: 'Mar', apr: 'Apr', may: 'May', jun: 'Jun',
        jul: 'Jul', aug: 'Aug', sep: 'Sep', oct: 'Oct', nov: 'Nov', dec: 'Dec',

        // Validation
        enterNameAndPhone: 'Please enter name and valid phone number',
        orderError: 'Error sending order. Please try again.',
        phoneError: 'Enter full number (+995 XXX XXX XXX)',
    },
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: keyof typeof translations.ru) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('ru');

    useEffect(() => {
        // Load saved language from localStorage
        const saved = localStorage.getItem('language') as Language;
        if (saved && (saved === 'ru' || saved === 'ka' || saved === 'en')) {
            setLanguageState(saved);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);
    };

    const t = (key: keyof typeof translations.ru): string => {
        return translations[language][key] || translations.ru[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
}

// Flag emoji components
export const FlagButton = ({ lang, currentLang, onClick }: { lang: Language; currentLang: Language; onClick: () => void }) => {
    const flags: Record<Language, string> = {
        ka: '🇬🇪',
        en: '🇬🇧',
        ru: '🇷🇺',
    };

    return (
        <button
            onClick={onClick}
            className={`w-8 h-6 text-xl flex items-center justify-center rounded transition-all ${currentLang === lang
                ? 'ring-2 ring-[#D4AF37] scale-110'
                : 'opacity-60 hover:opacity-100 hover:scale-105'
                }`}
            title={lang === 'ru' ? 'Русский' : lang === 'ka' ? 'ქართული' : 'English'}
        >
            {flags[lang]}
        </button>
    );
};
