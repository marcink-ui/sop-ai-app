import { NextResponse, NextRequest } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { KnowledgeDocumentType, Prisma } from '@prisma/client';
import { validateBody, createAgentKnowledgeSchema } from '@/lib/validations';

// GET /api/agents/[id]/knowledge - Get agent's knowledge base
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const agentId = (await params).id;

        // Verify agent belongs to user's organization
        const agent = await prisma.agent.findFirst({
            where: {
                id: agentId,
                organizationId: session.user.organizationId,
            },
        });

        if (!agent) {
            return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');

        const whereClause: Prisma.AgentKnowledgeDocumentWhereInput = {
            agentId,
        };

        if (type && type !== 'all') {
            whereClause.type = type.toUpperCase() as KnowledgeDocumentType;
        }

        const documents = await prisma.agentKnowledgeDocument.findMany({
            where: whereClause,
            orderBy: { updatedAt: 'desc' },
        });

        return NextResponse.json({
            success: true,
            agentId,
            documents,
            count: documents.length,
        });
    } catch (error) {
        console.error('Error fetching agent knowledge:', error);
        return NextResponse.json(
            { error: 'Failed to fetch agent knowledge base' },
            { status: 500 }
        );
    }
}

// POST /api/agents/[id]/knowledge - Add document to agent's knowledge base
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const agentId = (await params).id;

        // Verify agent belongs to user's organization
        const agent = await prisma.agent.findFirst({
            where: {
                id: agentId,
                organizationId: session.user.organizationId,
            },
        });

        if (!agent) {
            return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
        }

        const { data, error } = await validateBody(request, createAgentKnowledgeSchema);
        if (error) return error;

        const { name, type, content, url, fileUrl, description, mimeType, fileSize, accessLevel } = data;

        const document = await prisma.agentKnowledgeDocument.create({
            data: {
                name,
                type: type.toUpperCase() as KnowledgeDocumentType,
                content,
                url,
                fileUrl,
                description,
                mimeType,
                fileSize,
                accessLevel: accessLevel || 'PUBLIC',
                agentId,
            },
        });

        return NextResponse.json({
            success: true,
            document,
        }, { status: 201 });
    } catch (error) {
        console.error('Error adding knowledge document:', error);
        return NextResponse.json(
            { error: 'Failed to add knowledge document' },
            { status: 500 }
        );
    }
}

// DELETE /api/agents/[id]/knowledge - Remove document from agent's knowledge base
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const agentId = (await params).id;
        const { searchParams } = new URL(request.url);
        const documentId = searchParams.get('documentId');

        if (!documentId) {
            return NextResponse.json({ error: 'documentId is required' }, { status: 400 });
        }

        // Verify agent belongs to user's organization
        const agent = await prisma.agent.findFirst({
            where: {
                id: agentId,
                organizationId: session.user.organizationId,
            },
        });

        if (!agent) {
            return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
        }

        // Verify document belongs to this agent
        const document = await prisma.agentKnowledgeDocument.findFirst({
            where: {
                id: documentId,
                agentId,
            },
        });

        if (!document) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        await prisma.agentKnowledgeDocument.delete({
            where: { id: documentId },
        });

        return NextResponse.json({
            success: true,
            message: 'Document removed from knowledge base',
        });
    } catch (error) {
        console.error('Error removing knowledge document:', error);
        return NextResponse.json(
            { error: 'Failed to remove knowledge document' },
            { status: 500 }
        );
    }
}
