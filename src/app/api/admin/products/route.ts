import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { withAdminAuth } from '@/lib/withAdminAuth';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { z } from 'zod';

const productSchema = z.object({
    name: z.string().min(1).max(200),
    description: z.string().max(1000).optional().default(''),
    price: z.number().int().positive().max(9999999),
    discount: z.number().int().min(0).max(100).optional().default(0),
    image_url: z.string().max(5000).optional().default(''),
    payment_url: z.string().max(500).optional().default(''),
    in_stock: z.boolean().optional().default(true),
});

// GET: List all products (admin view)
export const GET = withAdminAuth(async () => {
    const { data, error } = await supabaseAdmin
        .from('bouquets')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Products GET error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }

    return NextResponse.json(data);
});

// POST: Create a new product
export const POST = withAdminAuth(async (request: Request) => {
    try {
        const body = await request.json();
        const validated = productSchema.parse(body);

        const { data, error } = await supabaseAdmin
            .from('bouquets')
            .insert(validated)
            .select()
            .single();

        if (error) throw error;
        revalidatePath('/');
        return NextResponse.json(data, { status: 201 });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation error', details: err.errors }, { status: 400 });
        }
        console.error('Products POST error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
});

// PUT: Update an existing product
export const PUT = withAdminAuth(async (request: Request) => {
    try {
        const body = await request.json();
        const { id, ...rest } = body;

        if (!id || typeof id !== 'string') {
            return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
        }

        const validated = productSchema.parse(rest);

        const { data, error } = await supabaseAdmin
            .from('bouquets')
            .update(validated)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        revalidatePath('/');
        return NextResponse.json(data);
    } catch (err) {
        if (err instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation error', details: err.errors }, { status: 400 });
        }
        console.error('Products PUT error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
});

// DELETE: Remove a product
export const DELETE = withAdminAuth(async (request: Request) => {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from('bouquets')
            .delete()
            .eq('id', id);

        if (error) throw error;
        revalidatePath('/');
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Products DELETE error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
});
