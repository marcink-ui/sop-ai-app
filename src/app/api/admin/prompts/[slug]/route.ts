import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth-server';
import { invalidatePromptCache } from '@/lib/system-prompts';

type RouteContext = { params: Promise<{ slug: string }> };

// GET /api/admin/prompts/[slug] — get single prompt by slug
export async function GET(_request: NextRequest, context: RouteContext) {
    try {
        const session = await getSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { slug } = await context.params;

        const prompt = await prisma.systemPrompt.findUnique({
            where: { slug },
        });

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
        }

        return NextResponse.json({ prompt });
    } catch (error) {
        console.error('[Admin Prompts] GET [slug] error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT /api/admin/prompts/[slug] — update a prompt
export async function PUT(request: NextRequest, context: RouteContext) {
    try {
        const session = await getSession();
        if (!session?.user || session.user.role !== 'META_ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { slug } = await context.params;
        const body = await request.json();
        const { name, content, description, isActive } = body;

        const existing = await prisma.systemPrompt.findUnique({ where: { slug } });
        if (!existing) {
            return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
        }

        const prompt = await prisma.systemPrompt.update({
            where: { slug },
            data: {
                ...(name !== undefined && { name }),
                ...(content !== undefined && { content }),
                ...(description !== undefined && { description }),
                ...(isActive !== undefined && { isActive }),
                version: { increment: 1 },
                updatedBy: session.user.id,
            },
        });

        invalidatePromptCache(slug);
        return NextResponse.json({ prompt });
    } catch (error) {
        console.error('[Admin Prompts] PUT error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/admin/prompts/[slug] — soft-delete (set isActive=false)
export async function DELETE(_request: NextRequest, context: RouteContext) {
    try {
        const session = await getSession();
        if (!session?.user || session.user.role !== 'META_ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { slug } = await context.params;

        const existing = await prisma.systemPrompt.findUnique({ where: { slug } });
        if (!existing) {
            return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
        }

        await prisma.systemPrompt.update({
            where: { slug },
            data: { isActive: false, updatedBy: session.user.id },
        });

        invalidatePromptCache(slug);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Admin Prompts] DELETE error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
