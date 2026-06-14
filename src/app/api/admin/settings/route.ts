import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { withAdminAuth } from '@/lib/withAdminAuth';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { settingsSchema } from '@/lib/validations';

// PUT: Update settings
export const PUT = withAdminAuth(async (request: Request) => {
    try {
        const body = await request.json();
        const { id, ...rest } = body;

        if (!id || typeof id !== 'string') {
            return NextResponse.json({ error: 'Settings ID required' }, { status: 400 });
        }

        // Validate against the whitelist of editable fields
        const settings = settingsSchema.parse(rest);

        const { data, error } = await supabaseAdmin
            .from('settings')
            .update(settings)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        revalidatePath('/'); // Сбрасываем кэш главной страницы мгновенно
        return NextResponse.json(data);
    } catch (err) {
        if (err instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation error', details: err.errors }, { status: 400 });
        }
        console.error('Settings PUT error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
});

// PATCH: Toggle a single boolean field (shop_open, delivery_enabled)
export const PATCH = withAdminAuth(async (request: Request) => {
    try {
        const body = await request.json();
        const { field, value } = body;

        // Whitelist allowed toggle fields
        const allowedFields = ['shop_open', 'delivery_enabled'];
        if (!allowedFields.includes(field) || typeof value !== 'boolean') {
            return NextResponse.json({ error: 'Invalid field or value' }, { status: 400 });
        }

        // Get settings row safely
        const { data: existing } = await supabaseAdmin
            .from('settings')
            .select('id')
            .limit(1)
            .maybeSingle();

        if (!existing) {
            // If no settings row exists, create one with the new value
            const { error: insertErr } = await supabaseAdmin
                .from('settings')
                .insert({ [field]: value });
            if (insertErr) throw insertErr;
            revalidatePath('/');
            return NextResponse.json({ success: true });
        }

        const { error } = await supabaseAdmin
            .from('settings')
            .update({ [field]: value })
            .eq('id', existing.id);

        if (error) throw error;
        revalidatePath('/');
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Settings PATCH error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
});
