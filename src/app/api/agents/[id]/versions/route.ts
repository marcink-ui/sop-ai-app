import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/agents/[id]/versions - Get agent's version history
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

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
        const limit = parseInt(searchParams.get('limit') || '10');
        const activeOnly = searchParams.get('activeOnly') === 'true';

        const versions = await prisma.agentVersion.findMany({
            where: {
                agentId,
                ...(activeOnly ? { isActive: true } : {}),
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });

        return NextResponse.json({
            success: true,
            agentId,
            versions,
            count: versions.length,
        });
    } catch (error) {
        console.error('Error fetching agent versions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch agent versions' },
            { status: 500 }
        );
    }
}

// POST /api/agents/[id]/versions - Create new agent version
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

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

        const body = await request.json();
        const {
            version,
            changelog,
            masterPrompt,
            model,
            temperature,
            tools,
            isActive
        } = body;

        if (!version) {
            return NextResponse.json({ error: 'Version is required' }, { status: 400 });
        }

        // Check if version already exists for this agent
        const existingVersion = await prisma.agentVersion.findFirst({
            where: {
                agentId,
                version,
            },
        });

        if (existingVersion) {
            return NextResponse.json({ error: 'This version already exists' }, { status: 409 });
        }

        // If setting as active, deactivate other versions
        if (isActive) {
            await prisma.agentVersion.updateMany({
                where: { agentId },
                data: { isActive: false },
            });
        }

        const newVersion = await prisma.agentVersion.create({
            data: {
                version,
                changelog,
                masterPrompt,
                model,
                temperature,
                tools: tools || {},
                isActive: isActive || false,
                agentId,
            },
        });

        return NextResponse.json({
            success: true,
            version: newVersion,
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating agent version:', error);
        return NextResponse.json(
            { error: 'Failed to create agent version' },
            { status: 500 }
        );
    }
}

// PATCH /api/agents/[id]/versions - Activate a specific version
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

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

        const body = await request.json();
        const { versionId } = body;

        if (!versionId) {
            return NextResponse.json({ error: 'versionId is required' }, { status: 400 });
        }

        // Verify version belongs to this agent
        const version = await prisma.agentVersion.findFirst({
            where: {
                id: versionId,
                agentId,
            },
        });

        if (!version) {
            return NextResponse.json({ error: 'Version not found' }, { status: 404 });
        }

        // Deactivate all versions
        await prisma.agentVersion.updateMany({
            where: { agentId },
            data: { isActive: false },
        });

        // Activate the specified version
        const activatedVersion = await prisma.agentVersion.update({
            where: { id: versionId },
            data: { isActive: true },
        });

        return NextResponse.json({
            success: true,
            version: activatedVersion,
            message: `Version ${activatedVersion.version} is now active`,
        });
    } catch (error) {
        console.error('Error activating agent version:', error);
        return NextResponse.json(
            { error: 'Failed to activate agent version' },
            { status: 500 }
        );
    }
}
