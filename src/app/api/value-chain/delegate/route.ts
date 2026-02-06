import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CouncilRequestType } from '@prisma/client';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { elementType, title, description, assigneeId, nodeId } = body;

        if (!elementType || !title || !assigneeId) {
            return NextResponse.json(
                { error: 'Missing required fields: elementType, title, assigneeId' },
                { status: 400 }
            );
        }

        // Validate element type
        const validTypes = ['sop', 'agent', 'muda', 'role'];
        if (!validTypes.includes(elementType)) {
            return NextResponse.json({ error: 'Invalid element type' }, { status: 400 });
        }

        // Get user and organization
        const user = await prisma.user.findUnique({
            where: { email: session.user.email as string },
            select: {
                id: true,
                organizationId: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const organizationId = user.organizationId;
        if (!organizationId) {
            return NextResponse.json({ error: 'User not in organization' }, { status: 400 });
        }

        // Map element type to council request type
        const requestTypeMap: Record<string, CouncilRequestType> = {
            sop: CouncilRequestType.NEW_SOP,
            agent: CouncilRequestType.NEW_AGENT,
            muda: CouncilRequestType.PROCESS_CHANGE,
            role: CouncilRequestType.OTHER,
        };

        // Create a Council Request for the delegation
        const councilRequest = await prisma.councilRequest.create({
            data: {
                type: requestTypeMap[elementType] ?? CouncilRequestType.NEW_SOP,
                title: `Delegacja: ${title}`,
                description: description || `Utworzenie nowego elementu typu ${elementType}`,
                rationale: JSON.stringify({
                    delegatedTo: assigneeId,
                    elementType,
                    sourceNodeId: nodeId,
                    originalTitle: title,
                }),
                createdById: user.id,
                organizationId,
            },
        });

        return NextResponse.json({
            success: true,
            requestId: councilRequest.id,
            message: 'Delegation request created successfully',
        });
    } catch (error) {
        console.error('Error creating delegation:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
