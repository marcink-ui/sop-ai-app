import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const organizationId = session.user.organizationId;
        if (!organizationId) {
            return NextResponse.json({ error: 'No organization' }, { status: 400 });
        }

        // Parse range from query params (default: 7 months back)
        const { searchParams } = new URL(request.url);
        const rangeParam = searchParams.get('range') || '7m';

        let monthsBack = 7;
        if (rangeParam === '7d') monthsBack = 1;
        else if (rangeParam === '30d') monthsBack = 2;
        else if (rangeParam === '90d') monthsBack = 4;
        else if (rangeParam === '1y') monthsBack = 12;

        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth() - monthsBack + 1, 1);

        // Fetch all SOPs and Agents created since startDate
        const [sops, agents] = await Promise.all([
            prisma.sOP.findMany({
                where: {
                    organizationId,
                    createdAt: { gte: startDate },
                },
                select: { createdAt: true },
                orderBy: { createdAt: 'asc' },
            }),
            prisma.agent.findMany({
                where: {
                    organizationId,
                    createdAt: { gte: startDate },
                },
                select: { createdAt: true },
                orderBy: { createdAt: 'asc' },
            }),
        ]);

        // Group by month
        const monthNames = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];
        const months: { name: string; year: number; month: number; sops: number; agents: number }[] = [];

        for (let i = 0; i < monthsBack; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - monthsBack + 1 + i, 1);
            months.push({
                name: monthNames[d.getMonth()],
                year: d.getFullYear(),
                month: d.getMonth(),
                sops: 0,
                agents: 0,
            });
        }

        // Count cumulative — we show total up to each month
        let sopCount = 0;
        let agentCount = 0;

        // First, count SOPs created BEFORE startDate for cumulative base
        const [baseSops, baseAgents] = await Promise.all([
            prisma.sOP.count({
                where: { organizationId, createdAt: { lt: startDate } },
            }),
            prisma.agent.count({
                where: { organizationId, createdAt: { lt: startDate } },
            }),
        ]);

        sopCount = baseSops;
        agentCount = baseAgents;

        for (const m of months) {
            // Count items created in this month
            const sopsInMonth = sops.filter(
                s => s.createdAt.getMonth() === m.month && s.createdAt.getFullYear() === m.year
            ).length;
            const agentsInMonth = agents.filter(
                a => a.createdAt.getMonth() === m.month && a.createdAt.getFullYear() === m.year
            ).length;

            sopCount += sopsInMonth;
            agentCount += agentsInMonth;

            m.sops = sopCount;
            m.agents = agentCount;
        }

        // Calculate growth percentage from first to last
        const first = months[0];
        const last = months[months.length - 1];
        const growth = first.sops > 0
            ? Math.round(((last.sops - first.sops) / first.sops) * 100)
            : last.sops > 0 ? 100 : 0;

        return NextResponse.json({
            data: months.map(m => ({ name: m.name, sops: m.sops, agents: m.agents })),
            growth,
        });

    } catch (error) {
        console.error('[ANALYTICS_TRENDS_ERROR]', error);
        return NextResponse.json({ error: 'Failed to fetch trends' }, { status: 500 });
    }
}
