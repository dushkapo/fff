import { NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/withAdminAuth';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { z } from 'zod';

const flowerSchema = z.object({
    name: z.string().min(1).max(200),
    description: z.string().max(1000).optional().default(''),
    price: z.number().int().positive().max(9999999),
    image_url: z.string().max(5000).optional().default(''),
    in_stock: z.boolean().optional().default(true),
});

// GET: List all flowers
export const GET = withAdminAuth(async () => {
    const { data, error } = await supabaseAdmin
        .from('flowers')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Flowers GET error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }

    return NextResponse.json(data);
});

// POST: Create a new flower
export const POST = withAdminAuth(async (request: Request) => {
    try {
        const body = await request.json();
        const validated = flowerSchema.parse(body);

        const { data, error } = await supabaseAdmin
            .from('flowers')
            .insert(validated)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data, { status: 201 });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation error', details: err.errors }, { status: 400 });
        }
        console.error('Flowers POST error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
});

// PUT: Update an existing flower
export const PUT = withAdminAuth(async (request: Request) => {
    try {
        const body = await request.json();
        const { id, ...rest } = body;

        if (!id || typeof id !== 'string') {
            return NextResponse.json({ error: 'Flower ID required' }, { status: 400 });
        }

        const validated = flowerSchema.parse(rest);

        const { data, error } = await supabaseAdmin
            .from('flowers')
            .update(validated)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (err) {
        if (err instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation error', details: err.errors }, { status: 400 });
        }
        console.error('Flowers PUT error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
});

// DELETE: Remove a flower
export const DELETE = withAdminAuth(async (request: Request) => {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Flower ID required' }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from('flowers')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Flowers DELETE error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
});
