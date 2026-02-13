import 'dotenv/config';
import pg from 'pg';
import bcrypt from 'bcryptjs';

function createId(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 25; i++) id += chars[Math.floor(Math.random() * chars.length)];
    return id;
}

async function main() {
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    const client = await pool.connect();

    try {
        const orgName = 'Firma Usługowa Sp. z o.o.';
        const orgSlug = 'firma-uslugowa';

        // Check if already exists
        const existing = await client.query('SELECT id FROM "Organization" WHERE slug = $1', [orgSlug]);
        let orgId: string;

        if (existing.rows.length > 0) {
            orgId = existing.rows[0].id;
            console.log('⏩ Organization already exists:', orgId);
        } else {
            orgId = createId();
            const companyContext = {
                industry: 'Usługi profesjonalne',
                size: 'MŚP',
                employeeCount: 50,
                revenue: '50 000 000 PLN',
                founded: '2015',
                location: 'Kraków, Polska',
                description: 'Firma usługowa specjalizująca się w outsourcingu procesów biznesowych, doradztwie strategicznym i transformacji cyfrowej dla klientów B2B.',
                nip: '6793123456',
                regon: '367890123',
            };

            await client.query(
                `INSERT INTO "Organization" (id, name, slug, "companyContext", "createdAt", "updatedAt")
                 VALUES ($1, $2, $3, $4, NOW(), NOW())`,
                [orgId, orgName, orgSlug, JSON.stringify(companyContext)]
            );
            console.log('✅ Organization:', orgName, '(', orgId, ')');
        }

        // ── Departments ──
        const departments = [
            'Zarząd',
            'Dział Operacyjny',
            'Dział Sprzedaży',
            'Dział Finansów',
            'HR i Administracja',
            'IT i Rozwój',
            'Obsługa Klienta',
        ];

        const deptIds: Record<string, string> = {};
        for (const dept of departments) {
            const ex = await client.query(
                'SELECT id FROM "Department" WHERE name = $1 AND "organizationId" = $2',
                [dept, orgId]
            );
            if (ex.rows.length > 0) {
                deptIds[dept] = ex.rows[0].id;
                console.log('  ⏩ Dept exists:', dept);
            } else {
                const deptId = createId();
                await client.query(
                    `INSERT INTO "Department" (id, name, "organizationId", "createdAt", "updatedAt")
                     VALUES ($1, $2, $3, NOW(), NOW())`,
                    [deptId, dept, orgId]
                );
                deptIds[dept] = deptId;
                console.log('  📁 Department:', dept);
            }
        }

        // ── Users ──
        const hashedPw = await bcrypt.hash('Test1234!', 12);

        const users = [
            { email: 'tomasz.k@firmauslugowa.pl', name: 'Tomasz Kowalczyk', role: 'SPONSOR', dept: 'Zarząd' },
            { email: 'agnieszka.m@firmauslugowa.pl', name: 'Agnieszka Mazur', role: 'MANAGER', dept: 'Dział Operacyjny' },
            { email: 'robert.w@firmauslugowa.pl', name: 'Robert Wójcik', role: 'MANAGER', dept: 'Dział Sprzedaży' },
            { email: 'monika.s@firmauslugowa.pl', name: 'Monika Szymańska', role: 'EXPERT', dept: 'Dział Finansów' },
            { email: 'adam.n@firmauslugowa.pl', name: 'Adam Nowicki', role: 'PILOT', dept: 'IT i Rozwój' },
            { email: 'karolina.d@firmauslugowa.pl', name: 'Karolina Dąbrowska', role: 'EXPERT', dept: 'HR i Administracja' },
            { email: 'pawel.z@firmauslugowa.pl', name: 'Paweł Zawadzki', role: 'CITIZEN_DEV', dept: 'Obsługa Klienta' },
            { email: 'ewa.l@firmauslugowa.pl', name: 'Ewa Lewandowska', role: 'CITIZEN_DEV', dept: 'Dział Operacyjny' },
        ];

        for (const u of users) {
            const ex = await client.query('SELECT id FROM "User" WHERE email = $1', [u.email]);
            if (ex.rows.length > 0) {
                console.log('  ⏩ User exists:', u.email);
                continue;
            }
            const userId = createId();
            await client.query(
                `INSERT INTO "User" (id, email, name, "hashedPassword", role, "organizationId", "departmentId", "createdAt", "updatedAt")
                 VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
                [userId, u.email, u.name, hashedPw, u.role, orgId, deptIds[u.dept]]
            );
            await client.query(
                `INSERT INTO "Account" (id, "userId", "accountId", "providerId", password, "createdAt", "updatedAt")
                 VALUES ($1, $2, $3, 'credential', $4, NOW(), NOW())`,
                [createId(), userId, userId, hashedPw]
            );
            console.log('  👤', u.name, '(' + u.role + ')');
        }

        // ── SOPs ──
        const sops = [
            { title: 'Procedura Obsługi Klienta B2B', code: 'SOP-OBS-001', purpose: 'Standardowa procedura obsługi klienta biznesowego od pierwszego kontaktu do realizacji zlecenia.', status: 'APPROVED' },
            { title: 'Proces Ofertowania Usług', code: 'SOP-SPR-001', purpose: 'Procedura przygotowania oferty handlowej. Analiza potrzeb, wycena, negocjacje i finalizacja umowy.', status: 'APPROVED' },
            { title: 'Onboarding Nowego Pracownika', code: 'SOP-HR-001', purpose: 'Wdrażanie nowego pracownika w firmie usługowej. Przygotowanie stanowiska, szkolenia, mentor.', status: 'APPROVED' },
            { title: 'Raportowanie Finansowe', code: 'SOP-FIN-001', purpose: 'Miesięczny raport finansowy. Zbieranie danych, konsolidacja, analiza rentowności projektów.', status: 'IN_REVIEW' },
            { title: 'Procedura Rekrutacyjna', code: 'SOP-HR-002', purpose: 'Procedura zatrudniania nowych specjalistów. Przegląd CV, rozmowy, testy kompetencyjne.', status: 'DRAFT' },
            { title: 'Zarządzanie Projektami Usługowymi', code: 'SOP-OPS-001', purpose: 'Framework zarządzania projektami w firmie usługowej. Planowanie, realizacja, monitoring.', status: 'APPROVED' },
            { title: 'Kontrola Jakości Usług', code: 'SOP-QA-001', purpose: 'Procedura kontroli jakości świadczonych usług. Audyty, ankiety klientów, plan naprawczy.', status: 'IN_REVIEW' },
            { title: 'Proces Fakturowania', code: 'SOP-FIN-002', purpose: 'Automatyzacja procesu fakturowania. Generowanie faktur, wysyłka, monitoring płatności.', status: 'DRAFT' },
        ];

        // Get a user to be the SOP creator (SPONSOR = org lead)
        const creatorResult = await client.query(
            'SELECT id FROM "User" WHERE "organizationId" = $1 AND role = \'SPONSOR\' LIMIT 1',
            [orgId]
        );
        const creatorId = creatorResult.rows[0]?.id;
        if (!creatorId) throw new Error('No SPONSOR user found — cannot create SOPs');

        for (const sop of sops) {
            const ex = await client.query('SELECT id FROM "SOP" WHERE code = $1 AND "organizationId" = $2', [sop.code, orgId]);
            if (ex.rows.length > 0) {
                console.log('  ⏩ SOP exists:', sop.code);
                continue;
            }
            await client.query(
                `INSERT INTO "SOP" (id, title, code, purpose, status, "organizationId", "createdById", "createdAt", "updatedAt")
                 VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
                [createId(), sop.title, sop.code, sop.purpose, sop.status, orgId, creatorId]
            );
            console.log('  📋 SOP:', sop.title, '[' + sop.status + ']');
        }

        // ── Value Chain Map ──
        const mapEx = await client.query('SELECT id FROM "ValueChainMap" WHERE "organizationId" = $1', [orgId]);
        if (mapEx.rows.length > 0) {
            console.log('⏩ Value Chain Map already exists');
        } else {
            const mapId = createId();
            await client.query(
                `INSERT INTO "ValueChainMap" (id, name, description, "organizationId", "createdAt", "updatedAt")
                 VALUES ($1, $2, $3, $4, NOW(), NOW())`,
                [mapId, 'Łańcuch Wartości — Usługi B2B', 'Główny łańcuch wartości firmy usługowej', orgId]
            );

            const nodes = [
                { label: 'Pozyskanie Klienta', segment: 'Sprzedaż', x: 0 },
                { label: 'Analiza Potrzeb', segment: 'Sprzedaż', x: 250 },
                { label: 'Ofertowanie', segment: 'Sprzedaż', x: 500 },
                { label: 'Realizacja Projektu', segment: 'Operacje', x: 750 },
                { label: 'Kontrola Jakości', segment: 'Operacje', x: 1000 },
                { label: 'Fakturowanie', segment: 'Finanse', x: 1250 },
                { label: 'Obsługa Posprzedażowa', segment: 'Serwis', x: 1500 },
            ];

            const nodeIds: string[] = [];
            for (const node of nodes) {
                const nodeId = createId();
                nodeIds.push(nodeId);
                const data = JSON.stringify({ label: node.label, segment: node.segment, description: '' });
                await client.query(
                    `INSERT INTO "ValueChainNode" (id, label, type, "mapId", data, "positionX", "positionY", "createdAt", "updatedAt")
                     VALUES ($1, $2, 'valueChainNode', $3, $4, $5, 150, NOW(), NOW())`,
                    [nodeId, node.label, mapId, data, node.x]
                );
            }

            for (let i = 0; i < nodeIds.length - 1; i++) {
                await client.query(
                    `INSERT INTO "ValueChainEdge" (id, "sourceId", "targetId", "mapId", type) VALUES ($1, $2, $3, $4, 'smoothstep')`,
                    [createId(), nodeIds[i], nodeIds[i + 1], mapId]
                );
            }
            console.log('✅ Value Chain Map: Łańcuch Wartości — Usługi B2B (7 nodes, 6 edges)');
        }

        console.log('\n═══════════════════════════════════════════════');
        console.log('🎉 Firma Usługowa Sp. z o.o. — gotowe!');
        console.log('═══════════════════════════════════════════════');
        console.log('  Slug:       firma-uslugowa');
        console.log('  Pracownicy: 50 (MŚP)');
        console.log('  Przychód:   50 000 000 PLN');
        console.log('  SOPs:       8');
        console.log('  Departments: 7');
        console.log('  Users:      8');
        console.log('  Value Chain: 1 mapa (7 nodes)');

    } finally {
        client.release();
        await pool.end();
    }
}

main().catch(e => { console.error('❌ Seed failed:', e); process.exit(1); });
