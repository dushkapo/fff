import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client with service_role key.
 * This client BYPASSES Row Level Security — use ONLY in API routes.
 * NEVER import this in client-side code or components.
 *
 * The real client is created lazily on first use (at request time), NOT at
 * module import. This prevents `next build` from failing while collecting page
 * data when env vars are not present in the build environment.
 */

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
    if (client) return client;

    const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
    const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error(
            'Supabase server is not configured: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
        );
    }

    client = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
    return client;
}

// Proxy keeps the existing `supabaseAdmin.from(...)` API but defers client
// creation (and env validation) until a property is actually accessed.
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
    get(_target, prop) {
        const c = getClient();
        const value = c[prop as keyof SupabaseClient];
        return typeof value === 'function' ? (value as Function).bind(c) : value;
    },
});
