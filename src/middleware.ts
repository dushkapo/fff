import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Check if accessing admin routes (except login)
    if (request.nextUrl.pathname.startsWith('/admin') &&
        !request.nextUrl.pathname.startsWith('/admin/login')) {

        // Check for auth cookie
        const authCookie = request.cookies.get('admin_session');

        // Simple validation - check if cookie exists and has valid format
        if (!authCookie || !authCookie.value || authCookie.value.length < 20) {
            // Missing or invalid token - redirect to login
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }

        // Check token format (timestamp:random:hash)
        const parts = authCookie.value.split(':');
        if (parts.length !== 3) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }

        // Check if token is not older than 24 hours
        const timestamp = parseInt(parts[0]);
        if (isNaN(timestamp) || Date.now() - timestamp > 24 * 60 * 60 * 1000) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/admin/:path*',
};
