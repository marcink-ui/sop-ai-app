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
            description: string;
            organizationName: string;
            organizationSlug: string;
            actor: string | null;
            timestamp: Date;
        }

        const activities: Activity[] = [
            ...recentSOPs.map(s => ({
                id: `sop-${s.id}`,
                type: 'sop_updated' as const,
                description: `SOP: ${s.title} — Status: ${s.status}`,
                organizationName: s.organization?.name || 'Unknown',
                organizationSlug: s.organization?.id || '',
                actor: s.createdBy?.name || null,
                timestamp: s.updatedAt,
            })),
            ...recentUsers.map(u => ({
                id: `user-${u.id}`,
                type: 'user_joined' as const,
                description: `Nowy użytkownik: ${u.name} (${u.role})`,
                organizationName: u.organization?.name || 'Unknown',
                organizationSlug: u.organization?.id || '',
                actor: null,
                timestamp: u.createdAt,
            })),
            ...recentChats.map(c => ({
                id: `chat-${c.id}`,
                type: 'chat_session' as const,
                description: `AI Chat: ${c.title || 'Sesja AI'}`,
                organizationName: c.user?.organization?.name || 'Unknown',
                organizationSlug: c.user?.organization?.id || '',
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
