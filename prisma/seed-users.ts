import { PrismaClient, UserRole } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL is not set in environment');
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface UserSeed {
    email: string;
    name: string;
    password: string;
    role: UserRole;
}

const USERS: UserSeed[] = [
    {
        email: 'marcin.k@syhidigital.com',
        name: 'Marcin Kapusta',
        password: 'VantageOS2025!',
        role: UserRole.META_ADMIN,
    },
    {
        email: 'lucas.o@syhidigital.com',
        name: 'Lucas O',
        password: 'VantageOS2025!',
        role: UserRole.META_ADMIN,
    },
];

async function ensureOrganization(): Promise<string> {
    let org = await prisma.organization.findFirst();
    if (!org) {
        org = await prisma.organization.create({
            data: {
                name: 'SYHI Digital',
                slug: 'syhi-digital',
            },
        });
        console.log(`🏢 Created organization: ${org.name} (${org.id})`);
    }
    return org.id;
}

async function ensureUser(user: UserSeed, orgId: string) {
    const existing = await prisma.user.findUnique({ where: { email: user.email } });
    const hashedPassword = await bcrypt.hash(user.password, 12);

    if (existing) {
        // Update role and password
        await prisma.user.update({
            where: { email: user.email },
            data: {
                role: user.role,
                hashedPassword,
            },
        });

        // Ensure Account record exists for credential login
        const account = await prisma.account.findFirst({
            where: { userId: existing.id, providerId: 'credential' },
        });
        if (account) {
            await prisma.account.update({
                where: { id: account.id },
                data: { password: hashedPassword },
            });
        } else {
            await prisma.account.create({
                data: {
                    userId: existing.id,
                    accountId: existing.id,
                    providerId: 'credential',
                    password: hashedPassword,
                },
            });
        }
        console.log(`✅ Updated: ${user.email} → ${user.role}`);
    } else {
        // Create new user
        const newUser = await prisma.user.create({
            data: {
                email: user.email,
                name: user.name,
                hashedPassword,
                role: user.role,
                organizationId: orgId,
            },
        });

        await prisma.account.create({
            data: {
                userId: newUser.id,
                accountId: newUser.id,
                providerId: 'credential',
                password: hashedPassword,
            },
        });
        console.log(`✅ Created: ${user.email} → ${user.role} (${newUser.id})`);
    }
}

async function main() {
    console.log('🔑 Seeding VantageOS users...\n');

    const orgId = await ensureOrganization();

    for (const user of USERS) {
        await ensureUser(user, orgId);
    }

    console.log('\n✨ All users seeded successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
