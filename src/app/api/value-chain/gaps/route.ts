import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

// ============================================================================
// GET /api/value-chain/gaps — Analyze value chain for missing/deprecated SOPs
// ============================================================================
export async function GET() {
    try {
        const session = await getSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const orgId = session.user.organizationId;

        // Get all value chain nodes with their SOP connections
        const nodes = await prisma.valueChainNode.findMany({
            where: { map: { organizationId: orgId } },
            include: {
                sop: { select: { id: true, title: true, code: true, status: true, updatedAt: true } },
                agent: { select: { id: true, name: true, status: true } },
                area: { select: { id: true, name: true } },
                map: { select: { id: true, name: true } },
            },
        });

        const totalNodes = nodes.length;
        const gaps: Array<{
            nodeId: string;
            label: string;
            type: string;
            area: string | null;
            map: string;
            reason: string;
            sopId?: string;
            sopStatus?: string;
        }> = [];

        let coveredNodes = 0;
        let deprecatedNodes = 0;
        let staleNodes = 0;

        const now = new Date();
        const staleThreshold = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); // 90 days

        for (const node of nodes) {
            if (!node.sop) {
                // No SOP assigned
                gaps.push({
                    nodeId: node.id,
                    label: node.label,
                    type: node.type,
                    area: node.area?.name || null,
                    map: node.map.name,
                    reason: 'NO_SOP',
                });
            } else if (node.sop.status === 'DEPRECATED' || node.sop.status === 'ARCHIVED') {
                // SOP is deprecated/archived
                deprecatedNodes++;
                gaps.push({
                    nodeId: node.id,
                    label: node.label,
                    type: node.type,
                    area: node.area?.name || null,
                    map: node.map.name,
                    reason: 'DEPRECATED_SOP',
                    sopId: node.sop.id,
                    sopStatus: node.sop.status,
                });
            } else if (node.sop.updatedAt < staleThreshold) {
                // SOP is stale (not updated in 90+ days)
                staleNodes++;
                coveredNodes++;
            } else {
                coveredNodes++;
            }
        }

        const coverage = totalNodes > 0 ? Math.round((coveredNodes / totalNodes) * 100) : 0;

        return NextResponse.json({
            success: true,
            totalNodes,
            coveredNodes,
            gaps,
            gapCount: gaps.length,
            coverage,
            deprecatedNodes,
            staleNodes,
            summary: {
                healthy: coveredNodes - staleNodes,
                stale: staleNodes,
                deprecated: deprecatedNodes,
                missing: gaps.filter(g => g.reason === 'NO_SOP').length,
            },
        });
    } catch (error) {
        console.error('[Value Chain Gaps] Error:', error);
        return NextResponse.json({ error: 'Failed to analyze gaps' }, { status: 500 });
    }
}
