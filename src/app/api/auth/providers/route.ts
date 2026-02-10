import { NextResponse } from 'next/server';

/**
 * GET /api/auth/providers
 * Returns which OAuth providers are configured on this deployment.
 * Used by the login form to conditionally show social login buttons.
 */
export async function GET() {
    return NextResponse.json({
        google: !!process.env.GOOGLE_CLIENT_ID,
        microsoft: !!process.env.MICROSOFT_CLIENT_ID,
    });
}
