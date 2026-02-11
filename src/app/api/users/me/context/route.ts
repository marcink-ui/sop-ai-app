import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

const PROFILE_FIELDS = [
    'bio', 'cv', 'phone', 'linkedin',
    'mbti', 'disc', 'strengthsFinder', 'enneagram', 'personalityNotes',
    'communicationStyle', 'workingHours', 'preferredLanguage',
    'certifications', 'skills', 'interests', 'goals', 'values',
] as const;

export async function GET() {
    try {
        const session = await getSession();

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

        // Build context response with all profile fields
        // Cast to any — profile fields exist in Prisma schema but local client types may be stale
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const u = user as any;
        const context = {
            name: u.name || '',
            email: u.email || '',
            role: u.role || 'CITIZEN_DEV',
            organization: u.organization?.name || 'VantageOS',
            department: u.department?.name || null,
            avatar: u.image || null,
            // Profile fields
            bio: u.bio || '',
            cv: u.cv || '',
            phone: u.phone || '',
            linkedin: u.linkedin || '',
            // Personality tests
            mbti: u.mbti || '',
            disc: u.disc || '',
            strengthsFinder: u.strengthsFinder || '',
            enneagram: u.enneagram || '',
            personalityNotes: u.personalityNotes || '',
            // Communication
            communicationStyle: u.communicationStyle || '',
            workingHours: u.workingHours || '',
            preferredLanguage: u.preferredLanguage || 'pl',
            // Career
            certifications: u.certifications || '',
            skills: u.skills || '',
            interests: u.interests || '',
            goals: u.goals || '',
            values: u.values || '',
            // Metrics
            contextCompleteness: calculateCompleteness(u),
            aiInteractions,
            lastActive: u.updatedAt?.toISOString() || new Date().toISOString(),
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
    let score = 10; // Base for having an account
    if (user.name) score += 8;
    if (user.image) score += 7;
    if (user.bio) score += 10;
    if (user.cv) score += 10;
    if (user.phone) score += 5;
    if (user.linkedin) score += 5;
    if (user.mbti) score += 8;
    if (user.disc) score += 8;
    if (user.strengthsFinder) score += 5;
    if (user.enneagram) score += 4;
    if (user.communicationStyle) score += 5;
    if (user.certifications) score += 5;
    if (user.skills) score += 5;
    if (user.goals) score += 5;
    return Math.min(score, 100);
}

export async function PUT(request: Request) {
    try {
        const session = await getSession();

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Build update data from allowed profile fields only
        const updateData: Record<string, string | null> = {};

        // Allow updating name and image too
        if (body.name !== undefined) updateData.name = body.name;
        if (body.image !== undefined) updateData.image = body.image;

        // Profile fields
        for (const field of PROFILE_FIELDS) {
            if (body[field] !== undefined) {
                updateData[field] = body[field];
            }
        }

        // Update user profile
        const updated = await prisma.user.update({
            where: { email: session.user.email },
            data: updateData,
        });

        return NextResponse.json({
            success: true,
            user: {
                id: updated.id,
                name: updated.name,
                email: updated.email,
            }
        });
    } catch (error) {
        console.error('Failed to update user context:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
