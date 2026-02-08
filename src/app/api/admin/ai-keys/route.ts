import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ===========================================
// GET: List all org API keys + usage stats
// ===========================================
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const orgId = searchParams.get('orgId');
        const view = searchParams.get('view'); // 'keys' | 'usage' | 'summary'

        // Usage summary across all organizations
        if (view === 'summary') {
            const orgs = await prisma.organization.findMany({
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    orgAiApiKeys: {
                        where: { isActive: true },
                        select: { id: true, provider: true, label: true, maskedKey: true, monthlyBudget: true },
                    },
                    _count: {
                        select: { aiUsageLogs: true, users: true },
                    },
                },
            });

            // Get usage stats per org (last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const usageByOrg = await prisma.aiUsageLog.groupBy({
                by: ['organizationId'],
                where: { createdAt: { gte: thirtyDaysAgo } },
                _sum: {
                    totalTokens: true,
                    estimatedCost: true,
                    promptTokens: true,
                    completionTokens: true,
                },
                _count: { id: true },
            });

            const usageMap = new Map(
                usageByOrg.map(u => [u.organizationId, {
                    totalTokens: u._sum.totalTokens || 0,
                    estimatedCost: u._sum.estimatedCost || 0,
                    promptTokens: u._sum.promptTokens || 0,
                    completionTokens: u._sum.completionTokens || 0,
                    requestCount: u._count.id,
                }])
            );

            const summary = orgs.map(org => ({
                id: org.id,
                name: org.name,
                slug: org.slug,
                activeKeys: org.orgAiApiKeys.length,
                keys: org.orgAiApiKeys,
                userCount: org._count.users,
                totalRequests: org._count.aiUsageLogs,
                usage30d: usageMap.get(org.id) || {
                    totalTokens: 0,
                    estimatedCost: 0,
                    promptTokens: 0,
                    completionTokens: 0,
                    requestCount: 0,
                },
            }));

            return NextResponse.json({ organizations: summary });
        }

        // Keys for a specific org
        if (orgId) {
            const keys = await prisma.orgAiApiKey.findMany({
                where: { organizationId: orgId },
                orderBy: { createdAt: 'desc' },
            });

            // Usage logs for this org (last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const usage = await prisma.aiUsageLog.findMany({
                where: {
                    organizationId: orgId,
                    createdAt: { gte: thirtyDaysAgo },
                },
                orderBy: { createdAt: 'desc' },
                take: 50,
            });

            const usageStats = await prisma.aiUsageLog.aggregate({
                where: {
                    organizationId: orgId,
                    createdAt: { gte: thirtyDaysAgo },
                },
                _sum: {
                    totalTokens: true,
                    estimatedCost: true,
                },
                _count: { id: true },
            });

            return NextResponse.json({
                keys,
                usage,
                stats: {
                    totalTokens: usageStats._sum.totalTokens || 0,
                    estimatedCost: usageStats._sum.estimatedCost || 0,
                    requestCount: usageStats._count.id,
                },
            });
        }

        return NextResponse.json({ error: 'Missing orgId or view=summary' }, { status: 400 });
    } catch (error) {
        console.error('Admin AI Keys GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// ===========================================
// POST: Provision a new API key for an org
// ===========================================
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { organizationId, provider, label, apiKey, monthlyBudget, note } = body;

        if (!organizationId || !provider || !label || !apiKey) {
            return NextResponse.json(
                { error: 'Missing required fields: organizationId, provider, label, apiKey' },
                { status: 400 }
            );
        }

        // Mask the key for display (show first 7 and last 4 chars)
        const maskedKey = apiKey.length > 12
            ? `${apiKey.slice(0, 7)}...${apiKey.slice(-4)}`
            : '••••••••••••';

        // In production: encrypt the key. For now, store with basic encoding.
        // TODO: Replace with proper encryption (AES-256-GCM with secret from env)
        const encryptedKey = Buffer.from(apiKey).toString('base64');

        const newKey = await prisma.orgAiApiKey.create({
            data: {
                organizationId,
                provider,
                label,
                encryptedKey,
                maskedKey,
                monthlyBudget: monthlyBudget || null,
                note: note || null,
                provisionedBy: 'meta-admin', // TODO: Get from session
            },
        });

        return NextResponse.json({
            success: true,
            key: {
                id: newKey.id,
                label: newKey.label,
                provider: newKey.provider,
                maskedKey: newKey.maskedKey,
                isActive: newKey.isActive,
                monthlyBudget: newKey.monthlyBudget,
                createdAt: newKey.createdAt,
            },
        });
    } catch (error) {
        console.error('Admin AI Keys POST error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// ===========================================
// PATCH: Toggle key active/inactive or update
// ===========================================
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { keyId, isActive, monthlyBudget, note } = body;

        if (!keyId) {
            return NextResponse.json({ error: 'Missing keyId' }, { status: 400 });
        }

        const updated = await prisma.orgAiApiKey.update({
            where: { id: keyId },
            data: {
                ...(isActive !== undefined && { isActive }),
                ...(monthlyBudget !== undefined && { monthlyBudget }),
                ...(note !== undefined && { note }),
            },
        });

        return NextResponse.json({ success: true, key: updated });
    } catch (error) {
        console.error('Admin AI Keys PATCH error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// ===========================================
// DELETE: Remove an API key
// ===========================================
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const keyId = searchParams.get('keyId');

        if (!keyId) {
            return NextResponse.json({ error: 'Missing keyId' }, { status: 400 });
        }

        await prisma.orgAiApiKey.delete({
            where: { id: keyId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin AI Keys DELETE error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
