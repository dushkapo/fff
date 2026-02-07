import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import crypto from 'crypto';

const SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'diana-flowers-secret-2024';

// Validate session token (same logic as in login route)
function validateSessionToken(token: string): boolean {
    try {
        const [timestamp, random, hash] = token.split(':');
        if (!timestamp || !random || !hash) return false;

        // Check if token is not older than 24 hours
        const tokenAge = Date.now() - parseInt(timestamp);
        if (tokenAge > 24 * 60 * 60 * 1000) return false;

        // Verify hash
        const expectedHash = crypto.createHmac('sha256', SECRET_KEY).update(`${timestamp}:${random}`).digest('hex');
        return hash === expectedHash;
    } catch {
        return false;
    }
}

export function middleware(request: NextRequest) {
    // Check if accessing admin routes (except login)
    if (request.nextUrl.pathname.startsWith('/admin') &&
        !request.nextUrl.pathname.startsWith('/admin/login')) {

        // Check for auth cookie
        const authCookie = request.cookies.get('admin_session');

        if (!authCookie || !validateSessionToken(authCookie.value)) {
            // Invalid or missing token - redirect to login
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/admin/:path*',
};
