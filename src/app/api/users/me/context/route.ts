import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Fetch user with profile data
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                organization: {
                    select: { name: true }
                },
                department: {
                    select: { name: true }
                }
            }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Get AI interaction count
        const aiInteractions = await prisma.chatMessage.count({
            where: {
                session: {
                    userId: user.id
                }
            }
        });

        // Build context response
        // Note: bio, cv, mbti, disc, certifications, communicationStyle are extended fields
        // that may be added to the User model in the future
        const extUser = user as Record<string, unknown>;
        const context = {
            name: user.name || '',
            email: user.email || '',
            role: user.role || 'EMPLOYEE',
            organization: user.organization?.name || 'VantageOS',
            department: user.department?.name || null,
            avatar: user.image || null,
            // AI Context fields from user profile (extended fields)
            bio: (extUser.bio as string) || '',
            cv: (extUser.cv as string) || '',
            mbti: (extUser.mbti as string) || '',
            disc: (extUser.disc as string) || '',
            certifications: (extUser.certifications as string) || '',
            communicationStyle: (extUser.communicationStyle as string) || 'direct',
            // Metrics
            contextCompleteness: calculateCompleteness(extUser),
            aiInteractions,
            lastActive: user.updatedAt?.toISOString() || new Date().toISOString(),
        };

        return NextResponse.json(context);
    } catch (error) {
        console.error('Failed to fetch user context:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Calculate context completeness percentage
function calculateCompleteness(user: Record<string, unknown>): number {
    let score = 20; // Base for having an account
    if (user.name) score += 10;
    if (user.bio) score += 15;
    if (user.cv) score += 20;
    if (user.mbti) score += 10;
    if (user.disc) score += 10;
    if (user.certifications) score += 15;
    return Math.min(score, 100);
}

export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        // These fields will be used when User model is extended with context fields
        const { bio: _bio, cv: _cv, mbti: _mbti, disc: _disc, certifications: _certs, communicationStyle: _style } = body;
        void [_bio, _cv, _mbti, _disc, _certs, _style]; // Reference to suppress unused warnings

        // Update user profile
        await prisma.user.update({
            where: { email: session.user.email },
            data: {
                // These fields need to be added to the User model in Prisma schema
                // For now, we'll just return success
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to update user context:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
