import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth-server';

// GET /api/partner/activity — Get activity feed for partner companies
export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email as string },
            select: {
                id: true,
                role: true,
                organizationId: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Only PARTNER role and above can access
        const allowedRoles = ['PARTNER', 'ADMIN', 'META_ADMIN'];
        if (!allowedRoles.includes(user.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const searchParams = request.nextUrl.searchParams;
        const orgId = searchParams.get('orgId'); // filter by specific org
        const limit = parseInt(searchParams.get('limit') || '20', 10);

        // For PARTNER users, get assigned organizations
        let targetOrgIds: string[] = [];

        if (user.role === 'META_ADMIN') {
            // META_ADMIN sees all organizations
            const allOrgs = await prisma.organization.findMany({
                select: { id: true },
            });
            targetOrgIds = allOrgs.map(o => o.id);
        } else if (user.role === 'PARTNER') {
            const assignments = await prisma.partnerOrganization.findMany({
                where: { userId: user.id },
                select: { organizationId: true },
            });
            targetOrgIds = assignments.map(a => a.organizationId);
        } else {
            targetOrgIds = user.organizationId ? [user.organizationId] : [];
        }

        // If orgId specified, validate it's one of the target orgs
        if (orgId) {
            if (targetOrgIds.includes(orgId)) {
                targetOrgIds = [orgId];
            } else {
                return NextResponse.json({ activities: [], total: 0 });
            }
        }

        if (targetOrgIds.length === 0) {
            return NextResponse.json({ activities: [], total: 0 });
        }

        // Aggregate activity from multiple sources
        const [recentSOPs, recentUsers, recentChats] = await Promise.all([
            // Recent SOPs created/updated
            prisma.sOP.findMany({
                where: { organizationId: { in: targetOrgIds } },
                select: {
                    id: true,
                    title: true,
                    status: true,
                    updatedAt: true,
                    createdAt: true,
                    organization: { select: { id: true, name: true } },
                    createdBy: { select: { name: true } },
                },
                orderBy: { updatedAt: 'desc' },
                take: limit,
            }),

            // New users added
            prisma.user.findMany({
                where: { organizationId: { in: targetOrgIds } },
                select: {
                    id: true,
                    name: true,
                    role: true,
                    createdAt: true,
                    organization: { select: { id: true, name: true } },
                },
                orderBy: { createdAt: 'desc' },
                take: 10,
            }),

            // Recent AI chat sessions
            prisma.chatSession.findMany({
                where: { user: { organizationId: { in: targetOrgIds } } },
                select: {
                    id: true,
                    title: true,
                    createdAt: true,
                    user: {
                        select: {
                            name: true,
                            organization: { select: { id: true, name: true } },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                take: 10,
            }),
        ]);

        // Normalize into a unified activity feed
        interface Activity {
            id: string;
            type: string;
            title: string;
            detail: string | null;
            orgId: string;
            orgName: string;
            actor: string | null;
            timestamp: Date;
        }

        const activities: Activity[] = [
            ...recentSOPs.map(s => ({
                id: `sop-${s.id}`,
                type: 'sop_update' as const,
                title: s.title,
                detail: `Status: ${s.status}`,
                orgId: s.organization?.id || '',
                orgName: s.organization?.name || 'Unknown',
                actor: s.createdBy?.name || null,
                timestamp: s.updatedAt,
            })),
            ...recentUsers.map(u => ({
                id: `user-${u.id}`,
                type: 'new_user' as const,
                title: `Nowy użytkownik: ${u.name}`,
                detail: `Rola: ${u.role}`,
                orgId: u.organization?.id || '',
                orgName: u.organization?.name || 'Unknown',
                actor: null,
                timestamp: u.createdAt,
            })),
            ...recentChats.map(c => ({
                id: `chat-${c.id}`,
                type: 'ai_chat' as const,
                title: c.title || 'AI Chat',
                detail: null,
                orgId: c.user?.organization?.id || '',
                orgName: c.user?.organization?.name || 'Unknown',
                actor: c.user?.name || null,
                timestamp: c.createdAt,
            })),
        ];

        // Sort by timestamp descending, limit
        activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        const limited = activities.slice(0, limit);

        return NextResponse.json({
            activities: limited,
            total: activities.length,
        });
    } catch (error) {
        console.error('[Partner Activity] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
