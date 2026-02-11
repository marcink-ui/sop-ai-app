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

async function main() {
    const email = 'lucas.o@syhidigital.com';
    const password = 'VantageOS2025!';
    const name = 'Lucas O';

    console.log(`🔑 Creating META_ADMIN account for ${email}...`);

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        console.log('⚠️  User already exists, updating role to META_ADMIN...');
        await prisma.user.update({
            where: { email },
            data: { role: UserRole.META_ADMIN },
        });
        console.log('✅ Role updated to META_ADMIN');
        return;
    }

    // Get the same organization as Marcin (the owner)
    const marcin = await prisma.user.findUnique({
        where: { email: 'marcin.k@syhidigital.com' },
        select: { organizationId: true, departmentId: true }
    });

    const orgId = marcin?.organizationId;
    if (!orgId) {
        // Fallback: get first org
        const org = await prisma.organization.findFirst();
        if (!org) throw new Error('No organization found. Run seed first.');
    }

    const finalOrgId = orgId || (await prisma.organization.findFirst())!.id;

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
        data: {
            email,
            name,
            hashedPassword,
            role: UserRole.META_ADMIN,
            organizationId: finalOrgId,
            departmentId: marcin?.departmentId || null,
        },
    });

    console.log(`✅ User created: ${user.id}`);

    // Create Account record for credential login
    await prisma.account.create({
        data: {
            userId: user.id,
            accountId: user.id,
            providerId: 'credential',
            password: hashedPassword,
        },
    });

    console.log('✅ Account record created for credential login');
    console.log(`\n📧 Email: ${email}`);
    console.log(`🔒 Password: ${password}`);
    console.log(`👑 Role: META_ADMIN`);
    console.log(`📌 Note: Marcin (marcin.k@syhidigital.com) remains the application owner`);
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
