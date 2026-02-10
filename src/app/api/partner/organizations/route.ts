import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userRole = session.user.role;
        const userId = session.user.id;

        interface OrganizationData {
            id: string;
            name: string;
            slug: string;
            logo: string | null;
            partnerRole: 'CONSULTANT' | 'FACILITATOR' | 'AUDITOR';
            assignedAt: string;
            stats: {
                users: number;
                sops: number;
                activeTransformations: number;
            };
        }

        let organizations: OrganizationData[] = [];

        if (userRole === 'META_ADMIN') {
            // META_ADMIN sees all organizations
            const orgs = await prisma.organization.findMany({
                include: {
                    _count: {
                        select: {
                            users: true,
                            sops: true,
                            transformationPhases: true
                        }
                    }
                },
                orderBy: { name: 'asc' }
            });

            organizations = orgs.map(org => ({
                id: org.id,
                name: org.name,
                slug: org.slug,
                logo: org.logo,
                partnerRole: 'CONSULTANT' as const,
                assignedAt: org.createdAt.toISOString(),
                stats: {
                    users: org._count.users,
                    sops: org._count.sops,
                    activeTransformations: org._count.transformationPhases
                }
            }));
        } else if (userRole === 'PARTNER') {
            // PARTNER sees only assigned organizations
            const assignments = await prisma.partnerOrganization.findMany({
                where: { userId },
                include: {
                    organization: {
                        include: {
                            _count: {
                                select: {
                                    users: true,
                                    sops: true,
                                    transformationPhases: true
                                }
                            }
                        }
                    }
                },
                orderBy: { assignedAt: 'desc' }
            });

            organizations = assignments.map(a => ({
                id: a.organization.id,
                name: a.organization.name,
                slug: a.organization.slug,
                logo: a.organization.logo,
                partnerRole: a.partnerRole,
                assignedAt: a.assignedAt.toISOString(),
                stats: {
                    users: a.organization._count.users,
                    sops: a.organization._count.sops,
                    activeTransformations: a.organization._count.transformationPhases
                }
            }));
        } else {
            // Other roles see only their own organization
            const org = await prisma.organization.findUnique({
                where: { id: session.user.organizationId },
                include: {
                    _count: {
                        select: {
                            users: true,
                            sops: true,
                            transformationPhases: true
                        }
                    }
                }
            });

            if (org) {
                organizations = [{
                    id: org.id,
                    name: org.name,
                    slug: org.slug,
                    logo: org.logo,
                    partnerRole: 'CONSULTANT' as const,
                    assignedAt: org.createdAt.toISOString(),
                    stats: {
                        users: org._count.users,
                        sops: org._count.sops,
                        activeTransformations: org._count.transformationPhases
                    }
                }];
            }
        }

        return NextResponse.json({ organizations });
    } catch (error) {
        console.error('Failed to fetch partner organizations:', error);
        return NextResponse.json(
            { error: 'Failed to fetch organizations' },
            { status: 500 }
        );
    }
}
