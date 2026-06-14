/**
 * Rate limiting helper.
 *
 * Uses Upstash Redis (via REST API) when UPSTASH_REDIS_REST_URL and
 * UPSTASH_REDIS_REST_TOKEN are configured — this is required for correct
 * behaviour on serverless platforms (Vercel) where in-memory state is not
 * shared across instances.
 *
 * Falls back to an in-memory store for local development only.
 */

const UPSTASH_URL = (process.env.UPSTASH_REDIS_REST_URL || '').trim();
const UPSTASH_TOKEN = (process.env.UPSTASH_REDIS_REST_TOKEN || '').trim();
const useUpstash = Boolean(UPSTASH_URL && UPSTASH_TOKEN);

// In-memory fallback (dev only)
const memoryStore = new Map<string, { count: number; resetTime: number }>();

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
}

/**
 * Increment a counter for `key` with a fixed window of `windowMs`.
 * Returns whether the request is allowed and how many attempts remain.
 */
export async function rateLimit(
    key: string,
    max: number,
    windowMs: number
): Promise<RateLimitResult> {
    if (useUpstash) {
        return upstashRateLimit(key, max, windowMs);
    }
    return memoryRateLimit(key, max, windowMs);
}

/** Reset the counter for a key (e.g. on successful login). */
export async function resetRateLimit(key: string): Promise<void> {
    if (useUpstash) {
        await upstashCommand(['DEL', redisKey(key)]);
        return;
    }
    memoryStore.delete(key);
}

function redisKey(key: string): string {
    return `rl:${key}`;
}

function memoryRateLimit(key: string, max: number, windowMs: number): RateLimitResult {
    const now = Date.now();
    const record = memoryStore.get(key);

    if (!record || now > record.resetTime) {
        memoryStore.set(key, { count: 1, resetTime: now + windowMs });
        return { allowed: true, remaining: max - 1 };
    }

    if (record.count >= max) {
        return { allowed: false, remaining: 0 };
    }

    record.count++;
    return { allowed: true, remaining: max - record.count };
}

async function upstashRateLimit(
    key: string,
    max: number,
    windowMs: number
): Promise<RateLimitResult> {
    try {
        const rkey = redisKey(key);
        // INCR returns the new value; set expiry on first hit.
        const count = await upstashCommand<number>(['INCR', rkey]);
        if (count === 1) {
            await upstashCommand(['PEXPIRE', rkey, String(windowMs)]);
        }
        if (count > max) {
            return { allowed: false, remaining: 0 };
        }
        return { allowed: true, remaining: Math.max(0, max - count) };
    } catch (err) {
        console.error('Upstash rate limit error, allowing request:', err);
        // Fail open so legitimate users are not blocked by infra issues.
        return { allowed: true, remaining: max - 1 };
    }
}

async function upstashCommand<T = unknown>(command: string[]): Promise<T> {
    const res = await fetch(UPSTASH_URL, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${UPSTASH_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(command),
        cache: 'no-store',
    });
    if (!res.ok) {
        throw new Error(`Upstash error: ${res.status}`);
    }
    const data = await res.json();
    return data.result as T;
}

/**
 * Extract the client IP from a request.
 * On Vercel `x-real-ip` is set by the platform and is more trustworthy than
 * the raw `x-forwarded-for` header (which clients can spoof). We prefer the
 * platform header and fall back to the left-most XFF entry.
 */
export function getClientIp(request: Request): string {
    const realIp = request.headers.get('x-real-ip');
    if (realIp) return realIp.trim();

    const xff = request.headers.get('x-forwarded-for');
    if (xff) {
        const first = xff.split(',')[0]?.trim();
        if (first) return first;
    }
    return 'unknown';
}
