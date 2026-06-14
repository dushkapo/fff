import { NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/withAdminAuth';
import { supabaseAdmin } from '@/lib/supabaseServer';

// GET: List all orders (newest first)
export const GET = withAdminAuth(async () => {
    const { data, error } = await supabaseAdmin
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Orders GET error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }

    return NextResponse.json(data);
});

// PATCH: Update order status
export const PATCH = withAdminAuth(async (request: Request) => {
    try {
        const { id, status } = await request.json();

        const allowedStatuses = ['new', 'confirmed', 'completed', 'cancelled'];
        if (!id || !allowedStatuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid id or status' }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from('orders')
            .update({ status })
            .eq('id', id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Orders PATCH error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
});
