import { supabase, Product, Settings } from '@/lib/supabase';
import HomePage from './HomePage';

export const revalidate = 30; // Кеш 30 сек — мгновенная загрузка + актуальные данные

async function getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
        .from('bouquets')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching products:', error);
        return [];
    }

    return data || [];
}

async function getSettings(): Promise<Settings | null> {
    const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();

    if (error) {
        console.error('Error fetching settings:', error);
        return null;
    }

    return data;
}

export default async function Page() {
    const [products, settings] = await Promise.all([
        getProducts(),
        getSettings(),
    ]);

    return <HomePage products={products} settings={settings} />;
}
