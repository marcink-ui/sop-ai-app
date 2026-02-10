import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js Middleware — rate limiting for auth endpoints
 * 
 * In-memory rate limiter (resets on deploy). For production with
 * multiple instances, swap to Redis-backed solution (e.g. @upstash/ratelimit).
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const authRateLimits = new Map<string, RateLimitEntry>();

// Auth: 10 login attempts per minute per IP
const AUTH_MAX_REQUESTS = 10;
const AUTH_WINDOW_MS = 60_000;

function getClientIp(request: NextRequest): string {
    return (
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        'unknown'
    );
}

function isRateLimited(ip: string): { limited: boolean; retryAfterSeconds: number } {
    const now = Date.now();
    const entry = authRateLimits.get(ip);

    if (!entry || now > entry.resetTime) {
        authRateLimits.set(ip, { count: 1, resetTime: now + AUTH_WINDOW_MS });
        return { limited: false, retryAfterSeconds: 0 };
    }

    entry.count++;

    if (entry.count > AUTH_MAX_REQUESTS) {
        const retryAfterSeconds = Math.ceil((entry.resetTime - now) / 1000);
        return { limited: true, retryAfterSeconds };
    }

    return { limited: false, retryAfterSeconds: 0 };
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Rate limit auth endpoints (login, signup, password reset)
    if (pathname.startsWith('/api/auth')) {
        const ip = getClientIp(request);
        const { limited, retryAfterSeconds } = isRateLimited(ip);

        if (limited) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(retryAfterSeconds),
                        'X-RateLimit-Limit': String(AUTH_MAX_REQUESTS),
                        'X-RateLimit-Remaining': '0',
                    },
                }
            );
        }
    }

    return NextResponse.next();
}

// Only run middleware on auth API routes
export const config = {
    matcher: ['/api/auth/:path*'],
};
