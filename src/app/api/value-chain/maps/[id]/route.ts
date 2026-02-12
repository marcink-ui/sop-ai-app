import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth-server';

// GET /api/value-chain/maps/[id] — load map with all nodes, edges, areas
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const map = await prisma.valueChainMap.findUnique({
            where: { id },
            include: {
                nodes: {
                    include: {
                        sop: { select: { id: true, title: true, status: true } },
                        agent: { select: { id: true, name: true, status: true } },
                    },
                    orderBy: { createdAt: 'asc' },
                },
                edges: true,
                areas: { orderBy: { order: 'asc' } },
            },
        });

        if (!map) {
            return NextResponse.json({ error: 'Map not found' }, { status: 404 });
        }

        // Transform nodes to ReactFlow format
        const reactFlowNodes = map.nodes.map((node) => ({
            id: node.id,
            type: node.type,
            position: { x: node.positionX, y: node.positionY },
            data: {
                label: node.label,
                description: node.description,
                ...(node.data as Record<string, unknown> || {}),
                // ROI metrics
                timeIntensity: node.timeIntensity,
                capitalIntensity: node.capitalIntensity,
                complexity: node.complexity,
                automationPotential: node.automationPotential,
                estimatedHours: node.estimatedHours,
                estimatedCostPLN: node.estimatedCostPLN,
                currentFTE: node.currentFTE,
                // Linked resources
                sopId: node.sopId,
                sopTitle: node.sop?.title,
                sopStatus: node.sop?.status,
                agentId: node.agentId,
                agentName: node.agent?.name,
                agentStatus: node.agent?.status,
                areaId: node.areaId,
            },
            ...(node.width ? { width: node.width } : {}),
            ...(node.height ? { height: node.height } : {}),
            ...(node.style ? { style: node.style } : {}),
        }));

        // Transform edges to ReactFlow format
        const reactFlowEdges = map.edges.map((edge) => ({
            id: edge.id,
            source: edge.sourceId,
            target: edge.targetId,
            type: edge.type || 'smoothstep',
            label: edge.label || undefined,
            ...(edge.style ? { style: edge.style } : {}),
            animated: true,
            markerEnd: { type: 'arrowclosed' },
        }));

        return NextResponse.json({
            id: map.id,
            name: map.name,
            description: map.description,
            segment: (map as unknown as { segment?: string }).segment,
            layout: map.layout,
            // Aggregated metrics
            totalTimeIntensity: map.totalTimeIntensity,
            totalCapitalIntensity: map.totalCapitalIntensity,
            averageComplexity: map.averageComplexity,
            automationScore: map.automationScore,
            // ReactFlow data
            nodes: reactFlowNodes,
            edges: reactFlowEdges,
            areas: map.areas.map((a) => ({
                id: a.id,
                name: a.name,
                color: a.color,
                icon: a.icon,
                order: a.order,
                nodeCount: map.nodes.filter((n) => n.areaId === a.id).length,
            })),
            // Stats
            stats: {
                stages: map.nodes.filter((n) => n.type === 'process').length,
                processes: map.nodes.length,
                agents: map.nodes.filter((n) => n.agentId).length,
                sops: map.nodes.filter((n) => n.sopId).length,
                automation: map.automationScore ?? 0,
                areas: map.areas.length,
            },
            updatedAt: map.updatedAt,
        });
    } catch (error) {
        console.error('Error fetching map:', error);
        return NextResponse.json({ error: 'Failed to fetch map' }, { status: 500 });
    }
}

// PUT /api/value-chain/maps/[id] — bulk save nodes, edges, layout
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { nodes, edges, layout } = body;

        // Verify map exists
        const map = await prisma.valueChainMap.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!map) {
            return NextResponse.json({ error: 'Map not found' }, { status: 404 });
        }

        // Use transaction for atomic bulk save
        await prisma.$transaction(async (tx) => {
            // Delete existing edges first (foreign key constraints)
            await tx.valueChainEdge.deleteMany({ where: { mapId: id } });

            // Delete nodes that no longer exist
            const existingNodes = await tx.valueChainNode.findMany({
                where: { mapId: id },
                select: { id: true },
            });
            const newNodeIds = new Set((nodes || []).map((n: { id: string }) => n.id));
            const nodesToDelete = existingNodes.filter((n) => !newNodeIds.has(n.id));
            if (nodesToDelete.length > 0) {
                await tx.valueChainNode.deleteMany({
                    where: { id: { in: nodesToDelete.map((n) => n.id) } },
                });
            }

            // Upsert nodes
            for (const node of (nodes || [])) {
                const nodeData = node.data || {};
                await tx.valueChainNode.upsert({
                    where: { id: node.id },
                    create: {
                        id: node.id,
                        type: node.type || 'process',
                        label: nodeData.label || 'Nowy proces',
                        description: nodeData.description || null,
                        positionX: node.position?.x ?? 0,
                        positionY: node.position?.y ?? 0,
                        width: node.width || null,
                        height: node.height || null,
                        style: node.style || null,
                        data: nodeData,
                        timeIntensity: nodeData.timeIntensity ?? null,
                        capitalIntensity: nodeData.capitalIntensity ?? null,
                        complexity: nodeData.complexity ?? null,
                        automationPotential: nodeData.automationPotential ?? null,
                        estimatedHours: nodeData.estimatedHours ?? null,
                        estimatedCostPLN: nodeData.estimatedCostPLN ?? null,
                        currentFTE: nodeData.currentFTE ?? null,
                        sopId: nodeData.sopId || null,
                        agentId: nodeData.agentId || null,
                        areaId: nodeData.areaId || null,
                        mapId: id,
                    },
                    update: {
                        type: node.type || 'process',
                        label: nodeData.label || 'Nowy proces',
                        description: nodeData.description || null,
                        positionX: node.position?.x ?? 0,
                        positionY: node.position?.y ?? 0,
                        width: node.width || null,
                        height: node.height || null,
                        style: node.style || null,
                        data: nodeData,
                        timeIntensity: nodeData.timeIntensity ?? null,
                        capitalIntensity: nodeData.capitalIntensity ?? null,
                        complexity: nodeData.complexity ?? null,
                        automationPotential: nodeData.automationPotential ?? null,
                        estimatedHours: nodeData.estimatedHours ?? null,
                        estimatedCostPLN: nodeData.estimatedCostPLN ?? null,
                        currentFTE: nodeData.currentFTE ?? null,
                        sopId: nodeData.sopId || null,
                        agentId: nodeData.agentId || null,
                        areaId: nodeData.areaId || null,
                    },
                });
            }

            // Create new edges
            for (const edge of (edges || [])) {
                // Only create if both source and target nodes exist
                if (newNodeIds.has(edge.source) && newNodeIds.has(edge.target)) {
                    await tx.valueChainEdge.create({
                        data: {
                            id: edge.id,
                            type: edge.type || 'smoothstep',
                            label: edge.label || null,
                            style: edge.style || null,
                            mapId: id,
                            sourceId: edge.source,
                            targetId: edge.target,
                        },
                    });
                }
            }

            // Update map layout and recalculate aggregates
            const allNodes = await tx.valueChainNode.findMany({
                where: { mapId: id },
                select: {
                    timeIntensity: true,
                    capitalIntensity: true,
                    complexity: true,
                    automationPotential: true,
                },
            });

            let totalTime = 0, totalCapital = 0, totalComplexity = 0, totalAutomation = 0;
            let count = 0;
            for (const n of allNodes) {
                if (n.timeIntensity !== null || n.capitalIntensity !== null) {
                    totalTime += n.timeIntensity ?? 5;
                    totalCapital += n.capitalIntensity ?? 5;
                    totalComplexity += n.complexity ?? 5;
                    totalAutomation += n.automationPotential ?? 5;
                    count++;
                }
            }

            await tx.valueChainMap.update({
                where: { id },
                data: {
                    layout: layout || undefined,
                    totalTimeIntensity: count > 0 ? totalTime : null,
                    totalCapitalIntensity: count > 0 ? totalCapital : null,
                    averageComplexity: count > 0 ? totalComplexity / count : null,
                    automationScore: count > 0 ? (totalAutomation / count) * 10 : null,
                    updatedAt: new Date(),
                },
            });
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving map:', error);
        return NextResponse.json({ error: 'Failed to save map' }, { status: 500 });
    }
}

// DELETE /api/value-chain/maps/[id] — delete map
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        await prisma.valueChainMap.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting map:', error);
        return NextResponse.json({ error: 'Failed to delete map' }, { status: 500 });
    }
}
