import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    discount: number;
    image_url: string;
    in_stock: boolean;
    created_at: string;
}

export interface Settings {
    id: string;
    shop_open: boolean;
    delivery_enabled: boolean;
    // Branding
    shop_name: string;
    hero_title: string;
    hero_subtitle: string;
    // Contacts
    phone: string;
    telegram_link: string;
    address: string;
    address_link: string;
    schedule: string;
    // Content fields with toggles
    about_enabled: boolean;
    about_text: string;
    schedule_enabled: boolean;
    delivery_price_enabled: boolean;
    delivery_price: string;
    delivery_info: string;
    pickup_info: string;
    payment_info: string;
}

// Individual flowers for custom bouquet builder
export interface Flower {
    id: string;
    name: string;
    description: string;
    price: number; // Price per stem
    image_url: string;
    in_stock: boolean;
    created_at: string;
}
