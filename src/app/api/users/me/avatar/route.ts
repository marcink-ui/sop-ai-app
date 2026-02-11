import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { image } = await request.json();

        if (!image || typeof image !== 'string') {
            return NextResponse.json({ error: 'Image data required' }, { status: 400 });
        }

        // Validate base64 data URL
        if (!image.startsWith('data:image/')) {
            return NextResponse.json({ error: 'Invalid image format' }, { status: 400 });
        }

        // Limit size (base64 is ~33% larger than binary, so 2MB file ≈ 2.7MB base64)
        if (image.length > 3 * 1024 * 1024) {
            return NextResponse.json({ error: 'Image too large (max 2MB)' }, { status: 400 });
        }

        await prisma.user.update({
            where: { id: session.user.id },
            data: { image },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Avatar API] Error:', error);
        return NextResponse.json(
            { error: 'Failed to update avatar' },
            { status: 500 }
        );
    }
}
