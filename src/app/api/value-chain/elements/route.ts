import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const type = searchParams.get('type');
        const search = searchParams.get('search') || '';

        const elements: Array<{
            id: string;
            type: 'sop' | 'agent' | 'role' | 'muda';
            name: string;
            description?: string | null;
            status?: string;
        }> = [];

        // Fetch SOPs
        if (!type || type === 'sop') {
            const sops = await prisma.sOP.findMany({
                where: search
                    ? {
                        OR: [
                            { title: { contains: search, mode: 'insensitive' } },
                            { purpose: { contains: search, mode: 'insensitive' } },
                        ],
                    }
                    : undefined,
                select: {
                    id: true,
                    title: true,
                    purpose: true,
                    status: true,
                },
                take: 20,
                orderBy: { updatedAt: 'desc' },
            });

            elements.push(
                ...sops.map((sop) => ({
                    id: sop.id,
                    type: 'sop' as const,
                    name: sop.title,
                    description: sop.purpose,
                    status: sop.status,
                }))
            );
        }

        // Fetch Agents
        if (!type || type === 'agent') {
            const agents = await prisma.agent.findMany({
                where: search
                    ? {
                        OR: [
                            { name: { contains: search, mode: 'insensitive' } },
                            { description: { contains: search, mode: 'insensitive' } },
                        ],
                    }
                    : undefined,
                select: {
                    id: true,
                    name: true,
                    description: true,
                    status: true,
                },
                take: 20,
                orderBy: { createdAt: 'desc' },
            });

            elements.push(
                ...agents.map((agent) => ({
                    id: agent.id,
                    type: 'agent' as const,
                    name: agent.name,
                    description: agent.description,
                    status: agent.status,
                }))
            );
        }

        // Fetch MUDA Reports
        if (!type || type === 'muda') {
            const mudaReports = await prisma.mUDAReport.findMany({
                where: search
                    ? {
                        OR: [
                            { title: { contains: search, mode: 'insensitive' } },
                            { description: { contains: search, mode: 'insensitive' } },
                        ],
                    }
                    : undefined,
                select: {
                    id: true,
                    title: true,
                    description: true,
                    status: true,
                },
                take: 20,
                orderBy: { createdAt: 'desc' },
            });

            elements.push(
                ...mudaReports.map((report) => ({
                    id: report.id,
                    type: 'muda' as const,
                    name: report.title,
                    description: report.description,
                    status: report.status,
                }))
            );
        }

        return NextResponse.json({ elements });
    } catch (error) {
        console.error('Error fetching elements:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
