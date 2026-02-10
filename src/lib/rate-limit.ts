/**
 * Rate limiting utility for API routes
 * 
 * Simple in-memory rate limiter. For production with multiple instances,
 * replace with Redis-backed solution (e.g. @upstash/ratelimit).
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const ipStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of ipStore.entries()) {
        if (now > entry.resetTime) {
            ipStore.delete(key);
        }
    }
}, 60_000); // Clean every minute

interface RateLimitConfig {
    /** Max requests allowed in the window */
    maxRequests: number;
    /** Time window in seconds */
    windowSeconds: number;
}

interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetInSeconds: number;
}

/**
 * Check rate limit for a given identifier (usually IP address).
 * 
 * Usage in API routes:
 * ```ts
 * const ip = request.headers.get('x-forwarded-for') || 'unknown';
 * const { allowed, remaining } = checkRateLimit(ip, { maxRequests: 5, windowSeconds: 60 });
 * if (!allowed) {
 *     return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
 * }
 * ```
 */
export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig
): RateLimitResult {
    const now = Date.now();
    const key = identifier;
    const entry = ipStore.get(key);

    if (!entry || now > entry.resetTime) {
        // New window
        ipStore.set(key, {
            count: 1,
            resetTime: now + config.windowSeconds * 1000,
        });
        return {
            allowed: true,
            remaining: config.maxRequests - 1,
            resetInSeconds: config.windowSeconds,
        };
    }

    entry.count++;

    if (entry.count > config.maxRequests) {
        return {
            allowed: false,
            remaining: 0,
            resetInSeconds: Math.ceil((entry.resetTime - now) / 1000),
        };
    }

    return {
        allowed: true,
        remaining: config.maxRequests - entry.count,
        resetInSeconds: Math.ceil((entry.resetTime - now) / 1000),
    };
}

/**
 * Pre-configured rate limiters for common use cases.
 */
export const RATE_LIMITS = {
    /** Auth endpoints: 10 attempts per minute */
    auth: { maxRequests: 10, windowSeconds: 60 },
    /** Signup: 3 per hour */
    signup: { maxRequests: 3, windowSeconds: 3600 },
    /** General API: 100 per minute */
    api: { maxRequests: 100, windowSeconds: 60 },
} as const;
