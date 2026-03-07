import { supabase } from '@/lib/supabase';
import CreateBouquetPage from './CreateBouquetPage';

export const revalidate = 30; // Кеш 30 сек — мгновенная загрузка + актуальные данные

export default async function Page() {
    const [flowersRes, settingsRes] = await Promise.all([
        supabase.from('flowers').select('*').eq('in_stock', true).order('created_at', { ascending: false }),
        supabase.from('settings').select('*').single(),
    ]);

    return (
        <CreateBouquetPage
            initialFlowers={flowersRes.data || []}
            initialSettings={settingsRes.data || null}
        />
    );
}
