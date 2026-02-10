import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth-server';

export async function GET(request: Request) {
    try {
        const session = await getSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const segment = searchParams.get('segment');
        const search = searchParams.get('search');

        // Build where clause
        const where: Record<string, unknown> = {};

        if (segment && segment !== 'all') {
            where.segment = segment;
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        const valueChains = await prisma.valueChainMap.findMany({
            where,
            include: {
                nodes: {
                    select: {
                        id: true,
                        type: true,
                        label: true,
                    },
                },
                edges: {
                    select: {
                        id: true,
                    },
                },
            },
            orderBy: { updatedAt: 'desc' },
        });

        // Calculate stats for each chain
        const chainsWithStats = valueChains.map(chain => {
            const processNodes = chain.nodes.filter(n => n.type === 'process');
            const agentNodes = chain.nodes.filter(n => n.type === 'agent');
            const automationRate = chain.nodes.length > 0
                ? Math.round((agentNodes.length / chain.nodes.length) * 100)
                : 0;

            return {
                id: chain.id,
                name: chain.name,
                description: chain.description,
                segment: (chain as unknown as { segment?: string }).segment || 'Nieprzypisany',
                startPoint: (chain as unknown as { startPoint?: string }).startPoint || chain.nodes[0]?.label || '—',
                endPoint: (chain as unknown as { endPoint?: string }).endPoint || chain.nodes[chain.nodes.length - 1]?.label || '—',
                stagesCount: processNodes.length,
                nodesCount: chain.nodes.length,
                edgesCount: chain.edges.length,
                automationRate,
                updatedAt: chain.updatedAt,
            };
        });

        return NextResponse.json({
            valueChains: chainsWithStats,
            total: chainsWithStats.length,
        });

    } catch (error) {
        console.error('Error fetching value chains:', error);
        return NextResponse.json({ error: 'Failed to fetch value chains' }, { status: 500 });
    }
}
