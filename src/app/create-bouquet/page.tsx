import { supabase } from '@/lib/supabase';
import CreateBouquetPage from './CreateBouquetPage';

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
