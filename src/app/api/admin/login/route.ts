import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { rateLimit, resetRateLimit, getClientIp } from '@/lib/rateLimit';

// Rate limiting: max 5 attempts per IP per 15 minutes
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// Generate a secure session token with HMAC signature
function generateSessionToken(secretKey: string): string {
    const timestamp = Date.now().toString();
    const random = crypto.randomBytes(16).toString('hex');
    const data = `${timestamp}:${random}`;
    const hash = crypto.createHmac('sha256', secretKey).update(data).digest('hex');
    return `${timestamp}:${random}:${hash}`;
}

export async function POST(request: Request) {
    try {
        const SECRET_KEY = process.env.ADMIN_SECRET_KEY || '';
        const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';

        // Check required env vars
        if (!ADMIN_PASSWORD_HASH || !SECRET_KEY) {
            console.error('Missing ADMIN_PASSWORD_HASH or ADMIN_SECRET_KEY env vars');
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        // Rate limiting
        const ip = getClientIp(request);

        const { allowed, remaining } = await rateLimit(`login:${ip}`, MAX_ATTEMPTS, WINDOW_MS);
        if (!allowed) {
            return NextResponse.json(
                { error: 'Слишком много попыток. Попробуйте через 15 минут.' },
                {
                    status: 429,
                    headers: { 'Retry-After': '900' },
                }
            );
        }

        const { password } = await request.json();

        if (!password || typeof password !== 'string') {
            return NextResponse.json({ error: 'Password required' }, { status: 400 });
        }

        // Compare with bcrypt hash (constant-time comparison)
        const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);

        if (isValid) {
            // Clear rate limit on successful login
            await resetRateLimit(`login:${ip}`);

            // Generate secure session token
            const sessionToken = generateSessionToken(SECRET_KEY);

            // Set auth cookie with secure token
            const cookieStore = await cookies();
            cookieStore.set('admin_session', sessionToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24, // 24 hours
                path: '/',
            });

            return NextResponse.json({ success: true });
        }

        return NextResponse.json(
            { error: 'Неверный пароль', remaining },
            { status: 401 }
        );
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
