import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

// Password from environment
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'diana2024';
const SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'diana-flowers-secret-2024';

// Generate a secure session token
function generateSessionToken(): string {
    const timestamp = Date.now().toString();
    const random = crypto.randomBytes(16).toString('hex');
    const data = `${timestamp}:${random}`;
    const hash = crypto.createHmac('sha256', SECRET_KEY).update(data).digest('hex');
    return `${timestamp}:${random}:${hash}`;
}

// Validate session token
export function validateSessionToken(token: string): boolean {
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

export async function POST(request: Request) {
    try {
        const { password } = await request.json();

        if (password === ADMIN_PASSWORD) {
            // Generate secure session token
            const sessionToken = generateSessionToken();

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

        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
