import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth-server';

type ElementType = 'sop' | 'agent' | 'role' | 'muda';

interface RouteParams {
    params: Promise<{
        type: string;
        id: string;
    }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { type: typeParam, id } = await params;
        const type = typeParam as ElementType;

        // Validate type
        if (!['sop', 'agent', 'role', 'muda'].includes(type)) {
            return NextResponse.json({ error: 'Invalid element type' }, { status: 400 });
        }

        let element = null;

        switch (type) {
            case 'sop':
                const sop = await prisma.sOP.findUnique({
                    where: { id },
                    select: {
                        id: true,
                        title: true,
                        purpose: true,
                        status: true,
                        createdAt: true,
                        updatedAt: true,
                        steps: true,
                        createdBy: {
                            select: { name: true },
                        },
                        _count: {
                            select: { versions: true },
                        },
                    },
                });

                if (sop) {
                    // Count steps if it's an array in the JSON field
                    const stepsCount = Array.isArray(sop.steps) ? sop.steps.length : 0;
                    element = {
                        id: sop.id,
                        name: sop.title,
                        description: sop.purpose,
                        status: sop.status,
                        createdAt: sop.createdAt.toISOString(),
                        updatedBy: sop.createdBy?.name,
                        metrics: {
                            Kroki: stepsCount,
                            Wersje: sop._count.versions,
                        },
                    };
                }
                break;

            case 'agent':
                const agent = await prisma.agent.findUnique({
                    where: { id },
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        status: true,
                        createdAt: true,
                        type: true,
                    },
                });

                if (agent) {
                    element = {
                        id: agent.id,
                        name: agent.name,
                        description: agent.description,
                        status: agent.status,
                        createdAt: agent.createdAt.toISOString(),
                        metrics: {
                            Typ: agent.type || 'Standardowy',
                        },
                    };
                }
                break;

            case 'muda':
                const muda = await prisma.mUDAReport.findUnique({
                    where: { id },
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        status: true,
                        priority: true,
                        createdAt: true,
                        estimatedSavings: true,
                        savingsUnit: true,
                    },
                });

                if (muda) {
                    element = {
                        id: muda.id,
                        name: muda.title,
                        description: muda.description,
                        status: muda.status,
                        createdAt: muda.createdAt.toISOString(),
                        metrics: {
                            Priorytet: muda.priority || 'MEDIUM',
                            Oszczędności: muda.estimatedSavings
                                ? `${muda.estimatedSavings} ${muda.savingsUnit || ''}`
                                : 'Nie oszacowano',
                        },
                    };
                }
                break;

            default:
                return NextResponse.json({ error: 'Invalid element type' }, { status: 400 });
        }

        if (!element) {
            return NextResponse.json({ error: 'Element not found' }, { status: 404 });
        }

        return NextResponse.json(element);
    } catch (error) {
        console.error('Error fetching element:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
