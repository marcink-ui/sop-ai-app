import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Get all agents with their prompts
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== 'SPONSOR') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const organizationId = session.user.organizationId;
        if (!organizationId) {
            return NextResponse.json({ error: 'No organization' }, { status: 400 });
        }

        const agents = await prisma.agent.findMany({
            where: { organizationId },
            select: {
                id: true,
                name: true,
                code: true,
                type: true,
                status: true,
                masterPrompt: true,
                model: true,
                temperature: true,
                description: true,
                updatedAt: true
            },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json({ agents });
    } catch (error) {
        console.error('[PROMPTS_GET_ERROR]', error);
        return NextResponse.json(
            { error: 'Failed to fetch prompts' },
            { status: 500 }
        );
    }
}

// Update agent prompt
export async function PATCH(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== 'SPONSOR') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { agentId, masterPrompt, model, temperature, description } = body;

        if (!agentId) {
            return NextResponse.json({ error: 'Agent ID required' }, { status: 400 });
        }

        const updatedAgent = await prisma.agent.update({
            where: { id: agentId },
            data: {
                ...(masterPrompt !== undefined && { masterPrompt }),
                ...(model !== undefined && { model }),
                ...(temperature !== undefined && { temperature }),
                ...(description !== undefined && { description })
            },
            select: {
                id: true,
                name: true,
                masterPrompt: true,
                model: true,
                temperature: true,
                description: true,
                updatedAt: true
            }
        });

        return NextResponse.json({ agent: updatedAgent });
    } catch (error) {
        console.error('[PROMPTS_PATCH_ERROR]', error);
        return NextResponse.json(
            { error: 'Failed to update prompt' },
            { status: 500 }
        );
    }
}
