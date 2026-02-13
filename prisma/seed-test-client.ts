/**
 * Seed script: Create a test organization with blind/dummy data
 * and a META_ADMIN user: lucas.o@syhidigital.com
 * 
 * Run: npx tsx prisma/seed-test-client.ts
 */

import { config } from 'dotenv';
config({ path: '.env' });

import pg from 'pg';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

function cuid() {
    return 'c' + crypto.randomBytes(12).toString('hex').slice(0, 24);
}

async function main() {
    const client = await pool.connect();
    console.log('🌱 Starting seed...\n');

    try {
        await client.query('BEGIN');

        // ── 1. Create test organization ──────────────────
        const orgId = cuid();
        const orgSlug = 'techvision-polska';
        const orgName = 'TechVision Polska Sp. z o.o.';

        // Check if org already exists
        const existingOrg = await client.query('SELECT id FROM "Organization" WHERE slug = $1', [orgSlug]);
        let finalOrgId: string;

        if (existingOrg.rows.length > 0) {
            finalOrgId = existingOrg.rows[0].id;
            console.log(`⏩ Organization already exists: ${orgName} (${finalOrgId})`);
        } else {
            finalOrgId = orgId;
            const companyContext = JSON.stringify({
                industry: 'IT Services & Consulting',
                employeeCount: 85,
                revenue: '12M PLN',
                location: 'Warszawa, Polska',
                founded: 2018,
                description: 'Firma technologiczna specjalizująca się w transformacji cyfrowej dla sektora produkcyjnego i logistycznego.',
                valueProposition: 'End-to-end digital transformation with AI-powered process optimization.',
                challenges: [
                    'Brak standaryzacji procesów między działami',
                    'Niska adopcja narzędzi cyfrowych wśród pracowników',
                    'Rosnące koszty operacyjne w dziale logistyki',
                ],
                goals: [
                    'Automatyzacja 60% procesów operacyjnych do Q4',
                    'Wdrożenie systemu zarządzania wiedzą',
                    'Redukcja kosztów logistycznych o 25%',
                ],
            });

            await client.query(
                `INSERT INTO "Organization" (id, name, slug, "companyContext", "createdAt", "updatedAt")
                 VALUES ($1, $2, $3, $4, NOW(), NOW())`,
                [finalOrgId, orgName, orgSlug, companyContext]
            );
            console.log(`✅ Organization: ${orgName} (${finalOrgId})`);
        }

        // ── 2. Create departments ────────────────────────
        const departments = [
            { name: 'Zarząd', description: 'Board of Directors' },
            { name: 'Sprzedaż & Marketing', description: 'Sales & Marketing Department' },
            { name: 'Operacje & Logistyka', description: 'Operations & Logistics' },
            { name: 'IT & Rozwój', description: 'IT & Development' },
            { name: 'HR & Administracja', description: 'Human Resources & Administration' },
            { name: 'Finanse', description: 'Finance & Accounting' },
        ];

        const deptIds: Record<string, string> = {};
        for (const dept of departments) {
            const deptId = cuid();
            const existing = await client.query(
                `SELECT id FROM "Department" WHERE name = $1 AND "organizationId" = $2`,
                [dept.name, finalOrgId]
            );
            if (existing.rows.length > 0) {
                deptIds[dept.name] = existing.rows[0].id;
                console.log(`  ⏩ Department exists: ${dept.name}`);
            } else {
                deptIds[dept.name] = deptId;
                await client.query(
                    `INSERT INTO "Department" (id, name, description, "organizationId", "createdAt", "updatedAt")
                     VALUES ($1, $2, $3, $4, NOW(), NOW())`,
                    [deptId, dept.name, dept.description, finalOrgId]
                );
                console.log(`  📁 Department: ${dept.name}`);
            }
        }

        // ── 3. Create META_ADMIN user: lucas.o ───────────
        const lucasEmail = 'lucas.o@syhidigital.com';
        const lucasPassword = await bcrypt.hash('VantageOS2025!', 12);

        const existingLucas = await client.query('SELECT id FROM "User" WHERE email = $1', [lucasEmail]);
        let lucasId: string;

        if (existingLucas.rows.length > 0) {
            lucasId = existingLucas.rows[0].id;
            // Update role to META_ADMIN
            await client.query(
                `UPDATE "User" SET role = 'META_ADMIN', name = 'Lucas Ostrowski', "updatedAt" = NOW() WHERE id = $1`,
                [lucasId]
            );
            console.log(`\n⏩ User exists, updated to META_ADMIN: ${lucasEmail} (${lucasId})`);
        } else {
            lucasId = cuid();
            await client.query(
                `INSERT INTO "User" (id, email, name, role, "organizationId", "emailVerified", "hashedPassword", "createdAt", "updatedAt")
                 VALUES ($1, $2, $3, $4, $5, NOW(), $6, NOW(), NOW())`,
                [lucasId, lucasEmail, 'Lucas Ostrowski', 'META_ADMIN', finalOrgId, lucasPassword]
            );
            console.log(`\n✅ META_ADMIN user: ${lucasEmail} (${lucasId})`);
        }

        // Create better-auth account for email/password login
        const existingAccount = await client.query(
            `SELECT id FROM "Account" WHERE "userId" = $1 AND "providerId" = 'credential'`,
            [lucasId]
        );
        if (existingAccount.rows.length === 0) {
            await client.query(
                `INSERT INTO "Account" (id, "userId", "accountId", "providerId", password, "createdAt", "updatedAt")
                 VALUES ($1, $2, $3, 'credential', $4, NOW(), NOW())`,
                [cuid(), lucasId, lucasId, lucasPassword]
            );
            console.log('  ✅ Account (credential) created');
        } else {
            // Update password just in case
            await client.query(
                `UPDATE "Account" SET password = $1, "updatedAt" = NOW() WHERE "userId" = $2 AND "providerId" = 'credential'`,
                [lucasPassword, lucasId]
            );
            console.log('  ⏩ Account already exists, password updated');
        }

        console.log(`   Password: VantageOS2025!`);
        console.log(`   Role: META_ADMIN`);

        // ── 4. Create sample users in test org ───────────
        const sampleUsers = [
            { email: 'anna.k@techvision.pl', name: 'Anna Kowalska', role: 'SPONSOR', dept: 'Zarząd' },
            { email: 'piotr.n@techvision.pl', name: 'Piotr Nowak', role: 'PILOT', dept: 'Operacje & Logistyka' },
            { email: 'marta.w@techvision.pl', name: 'Marta Wiśniewska', role: 'MANAGER', dept: 'IT & Rozwój' },
            { email: 'jan.z@techvision.pl', name: 'Jan Zieliński', role: 'EXPERT', dept: 'Sprzedaż & Marketing' },
            { email: 'kasia.l@techvision.pl', name: 'Katarzyna Lewandowska', role: 'CITIZEN_DEV', dept: 'HR & Administracja' },
        ];

        const testPassword = await bcrypt.hash('Test1234!', 12);
        for (const u of sampleUsers) {
            const existing = await client.query('SELECT id FROM "User" WHERE email = $1', [u.email]);
            let userId: string;
            if (existing.rows.length > 0) {
                userId = existing.rows[0].id;
                console.log(`  ⏩ User exists: ${u.email}`);
            } else {
                userId = cuid();
                await client.query(
                    `INSERT INTO "User" (id, email, name, role, "organizationId", "departmentId", "emailVerified", "hashedPassword", "createdAt", "updatedAt")
                     VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, NOW(), NOW())`,
                    [userId, u.email, u.name, u.role, finalOrgId, deptIds[u.dept] || null, testPassword]
                );
                // Create account for login
                await client.query(
                    `INSERT INTO "Account" (id, "userId", "accountId", "providerId", password, "createdAt", "updatedAt")
                     VALUES ($1, $2, $3, 'credential', $4, NOW(), NOW())`,
                    [cuid(), userId, userId, testPassword]
                );
                console.log(`  👤 ${u.name} (${u.role}) — ${u.email}`);
            }
        }

        // ── 5. Create sample SOPs ────────────────────────
        const sops = [
            { title: 'Proces Onboardingu Nowego Pracownika', purpose: 'Standardowy proces wdrażania nowego pracownika. Obejmuje przygotowanie stanowiska, szkolenia BHP, narzędzi i procedur.', status: 'APPROVED', code: 'SOP-HR-001' },
            { title: 'Procedura Obsługi Reklamacji Klienta', purpose: 'Procedura obsługi reklamacji B2B. Przyjęcie zgłoszenia, analiza, rozpatrzenie i komunikacja z klientem.', status: 'APPROVED', code: 'SOP-SALES-001' },
            { title: 'Zarządzanie Zamówieniami — Logistyka', purpose: 'Zarządzanie zamówieniami od złożenia do dostarczenia. Weryfikacja, kompletacja, wysyłka i tracking.', status: 'DRAFT', code: 'SOP-LOG-001' },
            { title: 'Procedura Wdrożenia Nowego Systemu IT', purpose: 'Standard wdrożeniowy dla nowych systemów IT. Analiza wymagań, testy, migracja danych i szkolenie.', status: 'APPROVED', code: 'SOP-IT-001' },
            { title: 'Miesięczny Raport Finansowy', purpose: 'Przygotowanie miesięcznego raportu finansowego. Zbieranie danych, analiza, konsolidacja i prezentacja zarządowi.', status: 'IN_REVIEW', code: 'SOP-FIN-001' },
            { title: 'Kampania Marketingowa — Workflow', purpose: 'Workflow przygotowania kampanii marketingowej. Briefing, kreacja, media buying, launch i raportowanie.', status: 'DRAFT', code: 'SOP-MKT-001' },
        ];

        for (const sop of sops) {
            const existing = await client.query(
                `SELECT id FROM "SOP" WHERE title = $1 AND "organizationId" = $2`,
                [sop.title, finalOrgId]
            );
            if (existing.rows.length === 0) {
                await client.query(
                    `INSERT INTO "SOP" (id, title, code, purpose, status, "organizationId", "createdById", "updatedById", "createdAt", "updatedAt")
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
                    [cuid(), sop.title, sop.code, sop.purpose, sop.status, finalOrgId, lucasId, lucasId]
                );
                console.log(`  📋 SOP: ${sop.title} [${sop.status}]`);
            } else {
                console.log(`  ⏩ SOP exists: ${sop.title}`);
            }
        }

        // ── 6. Create sample Value Chain Map ──────────────
        const vcMapId = cuid();
        const existingMap = await client.query(
            `SELECT id FROM "ValueChainMap" WHERE name = 'Główny Łańcuch Wartości — TechVision' AND "organizationId" = $1`,
            [finalOrgId]
        );

        let mapId: string;
        if (existingMap.rows.length > 0) {
            mapId = existingMap.rows[0].id;
            console.log(`\n⏩ Value Chain Map exists`);
        } else {
            mapId = vcMapId;
            await client.query(
                `INSERT INTO "ValueChainMap" (id, name, description, segment, "organizationId", "createdAt", "updatedAt")
                 VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
                [mapId, 'Główny Łańcuch Wartości — TechVision', 'Pełny łańcuch wartości od leadgenu po delivery i support', 'core-operations', finalOrgId]
            );

            // Add nodes
            const nodes = [
                { label: 'Generowanie Leadów', posX: 100, posY: 200 },
                { label: 'Kwalifikacja Leadów', posX: 350, posY: 200 },
                { label: 'Przygotowanie Oferty', posX: 600, posY: 200 },
                { label: 'Negocjacje', posX: 850, posY: 200 },
                { label: 'Zamówienie & Kontrakt', posX: 1100, posY: 200 },
                { label: 'Delivery / Wdrożenie', posX: 1350, posY: 200 },
                { label: 'Support & Utrzymanie', posX: 1600, posY: 200 },
            ];

            const nodeIds: string[] = [];
            for (const n of nodes) {
                const nodeId = cuid();
                nodeIds.push(nodeId);
                await client.query(
                    `INSERT INTO "ValueChainNode" (id, type, label, "positionX", "positionY", "mapId", "timeIntensity", "capitalIntensity", complexity, "automationPotential", "createdAt", "updatedAt")
                     VALUES ($1, 'process', $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
                    [nodeId, n.label, n.posX, n.posY, mapId, Math.floor(Math.random() * 8) + 2, Math.floor(Math.random() * 8) + 2, Math.floor(Math.random() * 8) + 2, Math.floor(Math.random() * 8) + 2]
                );
            }

            // Add edges
            for (let i = 0; i < nodeIds.length - 1; i++) {
                await client.query(
                    `INSERT INTO "ValueChainEdge" (id, "sourceId", "targetId", "mapId", type)
                     VALUES ($1, $2, $3, $4, 'smoothstep')`,
                    [cuid(), nodeIds[i], nodeIds[i + 1], mapId]
                );
            }
            console.log(`\n✅ Value Chain Map: Główny Łańcuch Wartości (${nodes.length} nodes)`);
        }

        await client.query('COMMIT');

        console.log('\n═══════════════════════════════════════════════');
        console.log('🎉 Seed completed successfully!');
        console.log('═══════════════════════════════════════════════');
        console.log('\nTest Organization:', orgName);
        console.log('META_ADMIN login:');
        console.log('  Email:    lucas.o@syhidigital.com');
        console.log('  Password: VantageOS2025!');
        console.log('  Role:     META_ADMIN');
        console.log('\nSample users (password: Test1234!):');
        sampleUsers.forEach(u => console.log(`  ${u.email} — ${u.role}`));
        console.log('');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await pool.end();
    });
