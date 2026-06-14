import { NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';

type Handler = (request: Request) => Promise<Response> | Response;

/**
 * Wraps an API route handler with admin authentication.
 * Returns 401 if the request does not carry a valid admin session.
 */
export function withAdminAuth(handler: Handler): Handler {
    return (request: Request) => {
        if (!verifyAdminRequest(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return handler(request);
    };
}
