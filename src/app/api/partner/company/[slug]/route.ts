import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const session = await getSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { slug } = await params;
        const userRole = session.user.role;
        const userId = session.user.id;

        // Fetch organization by slug with counts
        const organization = await prisma.organization.findUnique({
            where: { slug },
        });

        if (!organization) {
            return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
        }

        // Access control
        if (userRole === 'PARTNER') {
            const assignment = await prisma.partnerOrganization.findFirst({
                where: { userId, organizationId: organization.id },
            });
            if (!assignment) {
                return NextResponse.json({ error: 'Not assigned to this organization' }, { status: 403 });
            }
        } else if (userRole !== 'META_ADMIN') {
            if (session.user.organizationId !== organization.id) {
                return NextResponse.json({ error: 'Access denied' }, { status: 403 });
            }
        }

        const orgId = organization.id;

        // Parallel data fetching for performance
        const [team, sops, agents, sopCount, agentCount, userCount, phaseCount, currentPhase] = await Promise.all([
            // Team members
            prisma.user.findMany({
                where: { organizationId: orgId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    image: true,
                    department: { select: { name: true } },
                    _count: {
                        select: {
                            chatSessions: true,
                        }
                    },
                },
                orderBy: { name: 'asc' },
            }),
            // SOPs
            prisma.sOP.findMany({
                where: { organizationId: orgId },
                select: {
                    id: true,
                    title: true,
                    code: true,
                    status: true,
                    version: true,
                    updatedAt: true,
                    department: { select: { name: true } },
                },
                orderBy: { updatedAt: 'desc' },
            }),
            // Agents
            prisma.agent.findMany({
                where: { organizationId: orgId },
                select: {
                    id: true,
                    name: true,
                    type: true,
                    status: true,
                    description: true,
                },
                orderBy: { updatedAt: 'desc' },
            }),
            // Counts
            prisma.sOP.count({ where: { organizationId: orgId } }),
            prisma.agent.count({ where: { organizationId: orgId } }),
            prisma.user.count({ where: { organizationId: orgId } }),
            prisma.transformationPhase.count({ where: { organizationId: orgId } }),
            // Latest transformation phase
            prisma.transformationPhase.findFirst({
                where: { organizationId: orgId },
                orderBy: { order: 'desc' },
                select: { order: true, name: true, slug: true },
            }),
        ]);

        const companyData = {
            id: organization.id,
            name: organization.name,
            slug: organization.slug,
            logo: organization.logo,
            stats: {
                totalUsers: userCount,
                totalSOPs: sopCount,
                totalAgents: agentCount,
                totalTransformations: phaseCount,
            },
            transformationPhase: currentPhase ? {
                number: currentPhase.order,
                name: currentPhase.name,
            } : null,
            team: team.map(u => ({
                id: u.id,
                name: u.name || u.email,
                email: u.email,
                role: u.role,
                department: u.department?.name || '—',
                avatar: u.image || null,
                aiUsage: u._count.chatSessions,
            })),
            sops: sops.map(s => ({
                id: s.id,
                name: s.title,
                code: s.code,
                status: s.status,
                version: `v${s.version}`,
                lastUpdated: s.updatedAt.toISOString(),
                department: s.department?.name || '—',
            })),
            agents: agents.map(a => ({
                id: a.id,
                name: a.name,
                type: a.type,
                status: a.status,
                description: a.description,
            })),
        };

        return NextResponse.json(companyData);
    } catch (error) {
        console.error('Failed to fetch company data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch company data' },
            { status: 500 }
        );
    }
}
