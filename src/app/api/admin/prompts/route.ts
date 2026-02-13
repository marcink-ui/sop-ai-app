import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth-server';
import { invalidatePromptCache } from '@/lib/system-prompts';

// GET /api/admin/prompts — list all system prompts (META_ADMIN only)
export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user || session.user.role !== 'META_ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');

        const prompts = await prisma.systemPrompt.findMany({
            where: category ? { category } : undefined,
            orderBy: [{ category: 'asc' }, { slug: 'asc' }],
        });

        return NextResponse.json({ prompts });
    } catch (error) {
        console.error('[Admin Prompts] GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/admin/prompts — create a new system prompt
export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user || session.user.role !== 'META_ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { slug, name, category, content, description } = body;

        if (!slug || !name || !category || !content) {
            return NextResponse.json(
                { error: 'Missing required fields: slug, name, category, content' },
                { status: 400 }
            );
        }

        const prompt = await prisma.systemPrompt.create({
            data: {
                slug,
                name,
                category,
                content,
                description: description || null,
                updatedBy: session.user.id,
            },
        });

        invalidatePromptCache(slug);
        return NextResponse.json({ prompt }, { status: 201 });
    } catch (error) {
        console.error('[Admin Prompts] POST error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT /api/admin/prompts — update an existing system prompt
export async function PUT(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user || session.user.role !== 'META_ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { id, name, content, description, isActive, category } = body;

        if (!id) {
            return NextResponse.json({ error: 'id is required' }, { status: 400 });
        }

        const current = await prisma.systemPrompt.findUnique({ where: { id }, select: { slug: true } });
        if (!current) {
            return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
        }

        const updateData: Record<string, unknown> = { updatedBy: session.user.id };
        if (name !== undefined) updateData.name = name;
        if (content !== undefined) {
            updateData.content = content;
            updateData.version = { increment: 1 };
        }
        if (description !== undefined) updateData.description = description;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (category !== undefined) updateData.category = category;

        const prompt = await prisma.systemPrompt.update({
            where: { id },
            data: updateData,
        });

        invalidatePromptCache(current.slug);
        return NextResponse.json({ prompt });
    } catch (error) {
        console.error('[Admin Prompts] PUT error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/admin/prompts — delete a system prompt
export async function DELETE(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user || session.user.role !== 'META_ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'id is required' }, { status: 400 });
        }

        const prompt = await prisma.systemPrompt.findUnique({ where: { id }, select: { slug: true } });
        if (!prompt) {
            return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
        }

        await prisma.systemPrompt.delete({ where: { id } });
        invalidatePromptCache(prompt.slug);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Admin Prompts] DELETE error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
