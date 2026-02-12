import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Only META_ADMIN and PARTNER can list all companies
        if (!['META_ADMIN', 'PARTNER'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const organizations = await prisma.organization.findMany({
            select: {
                id: true,
                name: true,
                slug: true,
                logo: true,
                createdAt: true,
                _count: {
                    select: {
                        users: true,
                        sops: true,
                        agents: true,
                    },
                },
            },
            orderBy: { name: 'asc' },
        });

        const companies = organizations.map(org => ({
            id: org.id,
            name: org.name,
            slug: org.slug,
            logo: org.logo,
            users: org._count.users,
            sops: org._count.sops,
            agents: org._count.agents,
            status: 'active' as const,
            createdAt: org.createdAt.toISOString().split('T')[0],
        }));

        return NextResponse.json({ companies, total: companies.length });
    } catch (error) {
        console.error('Failed to fetch companies:', error);
        return NextResponse.json(
            { error: 'Failed to fetch companies' },
            { status: 500 }
        );
    }
}
