import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/value-chain/nodes/[id] - Get node with metrics
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const node = await prisma.valueChainNode.findUnique({
            where: { id },
            include: {
                sop: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                    }
                },
                agent: {
                    select: {
                        id: true,
                        name: true,
                        status: true,
                    }
                },
                map: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        });

        if (!node) {
            return NextResponse.json(
                { error: 'Node not found' },
                { status: 404 }
            );
        }

        // Extract metrics from data field
        const data = node.data as Record<string, unknown> || {};
        const metrics = {
            timeMinutes: data.timeMinutes || 0,
            frequency: data.frequency || 'daily',
            occurrencesPerMonth: data.occurrencesPerMonth || 20,
            complexity: data.complexity || 5,
            errorRate: data.errorRate || 0,
            directCostMonthly: data.directCostMonthly || 0,
            requiresAI: data.requiresAI || false,
            aiMinutesPerExecution: data.aiMinutesPerExecution || 0,
            problemScore: data.problemScore || 5,
            employeeCount: data.employeeCount || 1,
            automation: data.automation || 0,
            automationPotential: data.automationPotential || 0.5,
        };

        return NextResponse.json({
            id: node.id,
            type: node.type,
            label: node.label,
            description: node.description,
            metrics,
            sop: node.sop,
            agent: node.agent,
            map: node.map,
            createdAt: node.createdAt,
            updatedAt: node.updatedAt,
        });
    } catch (error) {
        console.error('Error fetching node:', error);
        return NextResponse.json(
            { error: 'Failed to fetch node' },
            { status: 500 }
        );
    }
}

// PATCH /api/value-chain/nodes/[id] - Update node metrics
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { metrics, label, description } = body;

        // Get existing node
        const existingNode = await prisma.valueChainNode.findUnique({
            where: { id },
            select: { data: true }
        });

        if (!existingNode) {
            return NextResponse.json(
                { error: 'Node not found' },
                { status: 404 }
            );
        }

        // Merge metrics into existing data
        const existingData = (existingNode.data as Record<string, unknown>) || {};
        const updatedData = {
            ...existingData,
            ...metrics,
        };

        // Prepare update
        const updatePayload: Record<string, unknown> = {
            data: updatedData,
            updatedAt: new Date(),
        };

        if (label !== undefined) updatePayload.label = label;
        if (description !== undefined) updatePayload.description = description;

        const updatedNode = await prisma.valueChainNode.update({
            where: { id },
            data: updatePayload,
        });

        return NextResponse.json({
            success: true,
            node: {
                id: updatedNode.id,
                label: updatedNode.label,
                metrics: updatedData,
                updatedAt: updatedNode.updatedAt,
            }
        });
    } catch (error) {
        console.error('Error updating node:', error);
        return NextResponse.json(
            { error: 'Failed to update node' },
            { status: 500 }
        );
    }
}

// DELETE /api/value-chain/nodes/[id] - Delete node
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await prisma.valueChainNode.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting node:', error);
        return NextResponse.json(
            { error: 'Failed to delete node' },
            { status: 500 }
        );
    }
}
