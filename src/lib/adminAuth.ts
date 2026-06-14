import crypto from 'crypto';


/**
 * Verify admin session token from cookie.
 * Returns true if token is valid (proper HMAC signature and not expired).
 */
export function verifySessionToken(token: string): boolean {
    const SECRET_KEY = process.env.ADMIN_SECRET_KEY;
    if (!SECRET_KEY) {
        console.error('ADMIN_SECRET_KEY is not configured');
        return false;
    }

    const parts = token.split(':');
    if (parts.length !== 3) return false;

    const [timestamp, random, providedHash] = parts;

    // Check if token is not older than 24 hours
    const ts = parseInt(timestamp);
    if (isNaN(ts) || Date.now() - ts > 24 * 60 * 60 * 1000) {
        return false;
    }

    // Verify HMAC signature
    const data = `${timestamp}:${random}`;
    const expectedHash = crypto
        .createHmac('sha256', SECRET_KEY)
        .update(data)
        .digest('hex');

    // Timing-safe comparison to prevent timing attacks
    try {
        const a = Buffer.from(providedHash, 'hex');
        const b = Buffer.from(expectedHash, 'hex');
        if (a.length !== b.length) return false;
        return crypto.timingSafeEqual(a, b);
    } catch {
        return false;
    }
}

/**
 * Extract and verify admin session from a Request.
 * For use in API routes.
 */
export function verifyAdminRequest(request: Request): boolean {
    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(/admin_session=([^;]+)/);
    if (!match) return false;
    return verifySessionToken(decodeURIComponent(match[1]));
}
