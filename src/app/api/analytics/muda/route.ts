import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const organizationId = session.user.organizationId;
        if (!organizationId) {
            return NextResponse.json({ error: 'No organization' }, { status: 400 });
        }

        // Get departments with SOP counts, agent counts, etc.
        const departments = await prisma.department.findMany({
            where: { organizationId },
            include: {
                _count: {
                    select: {
                        sops: true,
                        agents: true,
                        users: true,
                    },
                },
                sops: {
                    select: {
                        status: true,
                        steps: true,
                        kpis: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                },
            },
        });

        // For MUDA analysis, derive waste metrics from department data
        // These are calculated heuristics based on SOP complexity and agent coverage
        const mudaData = departments.map(dept => {
            const sopCount = dept._count.sops;
            const agentCount = dept._count.agents;
            const userCount = dept._count.users;

            // Analyze SOP steps complexity
            let totalSteps = 0;
            let draftCount = 0;
            let deprecatedCount = 0;
            let oldSops = 0;
            const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);

            for (const sop of dept.sops) {
                if (Array.isArray(sop.steps)) {
                    totalSteps += sop.steps.length;
                }
                if (sop.status === 'DRAFT') draftCount++;
                if (sop.status === 'DEPRECATED') deprecatedCount++;
                if (sop.updatedAt < sixMonthsAgo) oldSops++;
            }

            // MUDA scoring heuristics (0-10 scale per type):
            // Transport: hand-offs between people (more users → more transport waste)
            const transport = Math.min(Math.round(userCount * 0.8), 10);

            // Inventory: stale/draft SOPs sitting unused 
            const inventory = Math.min(draftCount + deprecatedCount, 10);

            // Motion: redundant steps in SOPs
            const avgSteps = sopCount > 0 ? totalSteps / sopCount : 0;
            const motion = Math.min(Math.round(Math.max(avgSteps - 5, 0) * 0.5), 10);

            // Waiting: SOPs without agent automation (manual bottleneck)
            const unautomated = Math.max(sopCount - agentCount, 0);
            const waiting = Math.min(Math.round(unautomated * 1.2), 10);

            // Overproduction: too many SOPs per user  
            const sopsPerUser = userCount > 0 ? sopCount / userCount : 0;
            const overproduction = Math.min(Math.round(Math.max(sopsPerUser - 3, 0)), 10);

            // Overprocessing: complex SOPs (high step count)
            const overprocessing = Math.min(Math.round(Math.max(avgSteps - 8, 0) * 0.7), 10);

            // Defects: old, unmaintained SOPs
            const defects = Math.min(Math.round(oldSops * 0.8), 10);

            return {
                department: dept.name,
                transport,
                inventory,
                motion,
                waiting,
                overproduction,
                overprocessing,
                defects,
            };
        });

        // If no departments, return sample structure with zeros
        if (mudaData.length === 0) {
            return NextResponse.json({
                data: [
                    { department: 'Brak działów', transport: 0, inventory: 0, motion: 0, waiting: 0, overproduction: 0, overprocessing: 0, defects: 0 },
                ],
            });
        }

        return NextResponse.json({ data: mudaData });

    } catch (error) {
        console.error('[ANALYTICS_MUDA_ERROR]', error);
        return NextResponse.json({ error: 'Failed to fetch MUDA data' }, { status: 500 });
    }
}
