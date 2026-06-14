import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const TOKEN_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Verify the HMAC signature of a session token using the Web Crypto API
 * (Edge-runtime compatible). Returns true only for a valid, untampered token.
 */
async function verifyHmac(ts: string, random: string, providedHash: string, secret: string): Promise<boolean> {
    if (!providedHash || providedHash.length !== 64) return false;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(`${ts}:${random}`));
    const expectedHash = Array.from(new Uint8Array(signature))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

    // Constant-time comparison
    if (expectedHash.length !== providedHash.length) return false;
    let diff = 0;
    for (let i = 0; i < expectedHash.length; i++) {
        diff |= expectedHash.charCodeAt(i) ^ providedHash.charCodeAt(i);
    }
    return diff === 0;
}

export async function middleware(request: NextRequest) {
    // Check if accessing admin routes (except login)
    if (request.nextUrl.pathname.startsWith('/admin') &&
        !request.nextUrl.pathname.startsWith('/admin/login')) {

        const redirectToLogin = () => NextResponse.redirect(new URL('/admin/login', request.url));

        // Check for auth cookie
        const authCookie = request.cookies.get('admin_session');
        if (!authCookie || !authCookie.value || authCookie.value.length < 20) {
            return redirectToLogin();
        }

        // Check token format (timestamp:random:hash)
        const parts = authCookie.value.split(':');
        if (parts.length !== 3) {
            return redirectToLogin();
        }

        const [ts, random, providedHash] = parts;

        // Check if token is not older than 24 hours
        const timestamp = parseInt(ts);
        if (isNaN(timestamp) || Date.now() - timestamp > TOKEN_MAX_AGE_MS) {
            const response = redirectToLogin();
            response.cookies.delete('admin_session');
            return response;
        }

        // Verify HMAC signature (Edge-compatible). No fallback secret.
        const SECRET_KEY = process.env.ADMIN_SECRET_KEY;
        if (!SECRET_KEY) {
            return redirectToLogin();
        }

        const valid = await verifyHmac(ts, random, providedHash, SECRET_KEY);
        if (!valid) {
            const response = redirectToLogin();
            response.cookies.delete('admin_session');
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/admin/:path*',
};
