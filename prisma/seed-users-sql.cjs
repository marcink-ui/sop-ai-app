// Direct SQL seed - uses pg and bcryptjs (no Prisma CLI needed)
const pg = require('pg');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:pqhpGbsRrbsKuMpbZZGtySvhnMFhHUbO@nozomi.proxy.rlwy.net:16603/railway';

const pool = new pg.Pool({ connectionString: DATABASE_URL });

function cuid() {
    return crypto.randomBytes(16).toString('hex').substring(0, 25);
}

const USERS = [
    { email: 'marcin.k@syhidigital.com', name: 'Marcin Kapusta', password: 'VantageOS2025!', role: 'META_ADMIN' },
    { email: 'lucas.o@syhidigital.com', name: 'Lucas O', password: 'VantageOS2025!', role: 'META_ADMIN' },
];

async function main() {
    const client = await pool.connect();

    try {
        console.log('🔑 Seeding VantageOS users...\n');

        // Ensure organization exists
        let orgResult = await client.query('SELECT id FROM "Organization" LIMIT 1');
        let orgId;

        if (orgResult.rows.length === 0) {
            const result = await client.query(
                `INSERT INTO "Organization" (id, name, slug, "createdAt", "updatedAt") 
                 VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id`,
                [cuid(), 'SYHI Digital', 'syhi-digital']
            );
            orgId = result.rows[0].id;
            console.log(`🏢 Created organization: SYHI Digital (${orgId})`);
        } else {
            orgId = orgResult.rows[0].id;
            console.log(`🏢 Using existing organization: ${orgId}`);
        }

        for (const user of USERS) {
            const hashedPassword = await bcrypt.hash(user.password, 12);

            // Check if user exists
            const existing = await client.query('SELECT id FROM "User" WHERE email = $1', [user.email]);

            if (existing.rows.length > 0) {
                const userId = existing.rows[0].id;

                // Update role and password
                await client.query(
                    `UPDATE "User" SET role = $1, "hashedPassword" = $2, "updatedAt" = NOW() WHERE email = $3`,
                    [user.role, hashedPassword, user.email]
                );

                // Ensure Account record exists for credential login
                const account = await client.query(
                    'SELECT id FROM "Account" WHERE "userId" = $1 AND "providerId" = $2',
                    [userId, 'credential']
                );

                if (account.rows.length > 0) {
                    await client.query(
                        `UPDATE "Account" SET password = $1, "updatedAt" = NOW() WHERE id = $2`,
                        [hashedPassword, account.rows[0].id]
                    );
                } else {
                    await client.query(
                        `INSERT INTO "Account" (id, "userId", "accountId", "providerId", password, "createdAt", "updatedAt")
                         VALUES ($1, $2, $3, 'credential', $4, NOW(), NOW())`,
                        [cuid(), userId, userId, hashedPassword]
                    );
                }
                console.log(`✅ Updated: ${user.email} → ${user.role}`);
            } else {
                const userId = cuid();

                await client.query(
                    `INSERT INTO "User" (id, email, name, "hashedPassword", role, "organizationId", "createdAt", "updatedAt")
                     VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
                    [userId, user.email, user.name, hashedPassword, user.role, orgId]
                );

                await client.query(
                    `INSERT INTO "Account" (id, "userId", "accountId", "providerId", password, "createdAt", "updatedAt")
                     VALUES ($1, $2, $3, 'credential', $4, NOW(), NOW())`,
                    [cuid(), userId, userId, hashedPassword]
                );
                console.log(`✅ Created: ${user.email} → ${user.role} (${userId})`);
            }
        }

        console.log('\n✨ All users seeded!');
    } finally {
        client.release();
        await pool.end();
    }
}

main().catch(e => { console.error('❌ Error:', e); process.exit(1); });
