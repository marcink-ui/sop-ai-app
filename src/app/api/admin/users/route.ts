import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/api-auth';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Helper: generate a temporary password (8 chars, mix of letters+digits)
function generateTempPassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    const bytes = crypto.randomBytes(8);
    for (let i = 0; i < 8; i++) {
        password += chars[bytes[i] % chars.length];
    }
    return password;
}

// Email validation per role
function validateEmailForRole(email: string, role: string): string | null {
    if (role === 'META_ADMIN' && !email.endsWith('@syhidigital.com')) {
        return 'META_ADMIN musi mieć email @syhidigital.com';
    }
    return null;
}

// ===========================================
// GET: List all users with org/dept info
// ===========================================
export async function GET(request: NextRequest) {
    try {
        const guard = await requireRole('META_ADMIN');
        if (guard.error) return guard.error;

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const roleFilter = searchParams.get('role') || '';
        const orgFilter = searchParams.get('organizationId') || '';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (roleFilter) {
            where.role = roleFilter;
        }

        if (orgFilter) {
            where.organizationId = orgFilter;
        }

        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                emailVerified: true,
                createdAt: true,
                organization: { select: { id: true, name: true, slug: true } },
                department: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Also fetch orgs and departments for form selects
        const organizations = await prisma.organization.findMany({
            select: { id: true, name: true, slug: true },
            orderBy: { name: 'asc' },
        });

        return NextResponse.json({
            success: true,
            users,
            organizations,
            count: users.length,
        });
    } catch (error) {
        console.error('Admin Users GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// ===========================================
// POST: Create a new user
// ===========================================
export async function POST(request: NextRequest) {
    try {
        const guard = await requireRole('META_ADMIN');
        if (guard.error) return guard.error;

        const body = await request.json();
        const { name, email, role, organizationId, departmentId } = body;

        // Validate required fields
        if (!name || !email || !role || !organizationId) {
            return NextResponse.json(
                { error: 'Wymagane pola: name, email, role, organizationId' },
                { status: 400 }
            );
        }

        // MANAGER requires departmentId
        if (role === 'MANAGER' && !departmentId) {
            return NextResponse.json(
                { error: 'Rola MANAGER wymaga przypisania do działu' },
                { status: 400 }
            );
        }

        // Email format validation per role
        const emailError = validateEmailForRole(email, role);
        if (emailError) {
            return NextResponse.json({ error: emailError }, { status: 400 });
        }

        // Check if email already exists
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json(
                { error: 'Użytkownik z tym adresem email już istnieje' },
                { status: 409 }
            );
        }

        // Generate temporary password
        const tempPassword = generateTempPassword();
        const hashedPassword = await bcrypt.hash(tempPassword, 12);

        // Create user (emailVerified = null signals "must change password")
        const user = await prisma.user.create({
            data: {
                name,
                email: email.toLowerCase().trim(),
                hashedPassword,
                role,
                organizationId,
                ...(departmentId ? { departmentId } : {}),
                // emailVerified intentionally left null → signals first login
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                organization: { select: { id: true, name: true } },
                department: { select: { id: true, name: true } },
                createdAt: true,
            },
        });

        return NextResponse.json({
            success: true,
            user,
            tempPassword, // Meta Admin copies this and gives to the user
        }, { status: 201 });
    } catch (error) {
        console.error('Admin Users POST error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// ===========================================
// PATCH: Update user role, org, department, name
// ===========================================
export async function PATCH(request: NextRequest) {
    try {
        const guard = await requireRole('META_ADMIN');
        if (guard.error) return guard.error;

        const body = await request.json();
        const { userId, name, role, organizationId, departmentId } = body;

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        // If changing role, validate email constraint
        if (role) {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { email: true },
            });
            if (user) {
                const emailError = validateEmailForRole(user.email, role);
                if (emailError) {
                    return NextResponse.json({ error: emailError }, { status: 400 });
                }
            }
        }

        // MANAGER requires department
        if (role === 'MANAGER' && !departmentId) {
            // Check if user already has a department
            const existing = await prisma.user.findUnique({
                where: { id: userId },
                select: { departmentId: true },
            });
            if (!existing?.departmentId) {
                return NextResponse.json(
                    { error: 'Rola MANAGER wymaga przypisania do działu' },
                    { status: 400 }
                );
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (role !== undefined) updateData.role = role;
        if (organizationId !== undefined) updateData.organizationId = organizationId;
        if (departmentId !== undefined) updateData.departmentId = departmentId || null;

        const updated = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                organization: { select: { id: true, name: true } },
                department: { select: { id: true, name: true } },
                createdAt: true,
            },
        });

        return NextResponse.json({ success: true, user: updated });
    } catch (error) {
        console.error('Admin Users PATCH error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// ===========================================
// DELETE: Remove a user
// ===========================================
export async function DELETE(request: NextRequest) {
    try {
        const guard = await requireRole('META_ADMIN');
        if (guard.error) return guard.error;

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        // Don't allow deleting yourself
        if (userId === guard.session.user.id) {
            return NextResponse.json(
                { error: 'Nie możesz usunąć samego siebie' },
                { status: 400 }
            );
        }

        await prisma.user.delete({ where: { id: userId } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin Users DELETE error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
