import { PrismaClient, UserRole, SOPStatus, AgentType, AgentStatus, MUDAPriority } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

// ============================================================================
// Seed: "Spółka usługowa sp. z o.o." — realistic test client
// Usage: npx tsx prisma/seed-client.ts
// ============================================================================

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL is not set in environment');
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🏢 Seeding test client: Spółka usługowa sp. z o.o.\n');

    // =========================================================================
    // 1. ORGANIZATION
    // =========================================================================
    const org = await prisma.organization.upsert({
        where: { slug: 'spolka-uslugowa' },
        update: {},
        create: {
            name: 'Spółka usługowa sp. z o.o.',
            slug: 'spolka-uslugowa',
            settings: {
                theme: 'light',
                language: 'pl',
                timezone: 'Europe/Warsaw',
                industry: 'Usługi profesjonalne',
                employeeCount: 50,
            },
        },
    });
    console.log(`✅ Organization: ${org.name} (${org.id})`);

    // =========================================================================
    // 2. DEPARTMENTS
    // =========================================================================
    console.log('🏢 Creating departments...');
    const deptNames = [
        { name: 'Zarząd', desc: 'Zarząd spółki' },
        { name: 'Dział Obsługi Klienta', desc: 'Customer service department' },
        { name: 'Dział Handlowy', desc: 'Sales department' },
        { name: 'Dział Finansowy', desc: 'Finance & accounting' },
        { name: 'Dział IT', desc: 'IT & systems' },
        { name: 'Dział HR', desc: 'Human resources' },
        { name: 'Dział Marketingu', desc: 'Marketing & communications' },
    ];

    const departments: Record<string, { id: string }> = {};
    for (const d of deptNames) {
        const dept = await prisma.department.create({
            data: { name: d.name, description: d.desc, organizationId: org.id },
        });
        departments[d.name] = dept;
    }

    // =========================================================================
    // 3. USERS — across all roles, ~50 users
    // =========================================================================
    console.log('👥 Creating users...');
    const hashedPassword = await bcrypt.hash('demo123', 12);

    const userDefs: { email: string; name: string; role: UserRole; dept: string }[] = [
        // Sponsor (CEO)
        { email: 'ceo@spolka.pl', name: 'Tomasz Malinowski', role: UserRole.SPONSOR, dept: 'Zarząd' },
        { email: 'cfo@spolka.pl', name: 'Katarzyna Wójcik', role: UserRole.SPONSOR, dept: 'Dział Finansowy' },
        // Pilots
        { email: 'coo@spolka.pl', name: 'Adam Kowalczyk', role: UserRole.PILOT, dept: 'Zarząd' },
        { email: 'dyrektor.ops@spolka.pl', name: 'Monika Zielińska', role: UserRole.PILOT, dept: 'Dział Obsługi Klienta' },
        // Managers
        { email: 'manager.sales@spolka.pl', name: 'Paweł Nowicki', role: UserRole.MANAGER, dept: 'Dział Handlowy' },
        { email: 'manager.finance@spolka.pl', name: 'Agnieszka Kamińska', role: UserRole.MANAGER, dept: 'Dział Finansowy' },
        { email: 'manager.it@spolka.pl', name: 'Michał Lewandowski', role: UserRole.MANAGER, dept: 'Dział IT' },
        { email: 'manager.hr@spolka.pl', name: 'Dorota Sikora', role: UserRole.MANAGER, dept: 'Dział HR' },
        { email: 'manager.marketing@spolka.pl', name: 'Karolina Pawlak', role: UserRole.MANAGER, dept: 'Dział Marketingu' },
        { email: 'manager.cs@spolka.pl', name: 'Robert Jankowski', role: UserRole.MANAGER, dept: 'Dział Obsługi Klienta' },
        // Experts
        { email: 'expert.sop@spolka.pl', name: 'Ewa Kowalska', role: UserRole.EXPERT, dept: 'Dział Obsługi Klienta' },
        { email: 'expert.ai@spolka.pl', name: 'Jakub Szymański', role: UserRole.EXPERT, dept: 'Dział IT' },
        { email: 'expert.lean@spolka.pl', name: 'Beata Mazur', role: UserRole.EXPERT, dept: 'Zarząd' },
        { email: 'expert.finance@spolka.pl', name: 'Krzysztof Krawczyk', role: UserRole.EXPERT, dept: 'Dział Finansowy' },
    ];

    // Generate 36 more citizen devs to reach ~50
    for (let i = 1; i <= 36; i++) {
        const deptKeys = Object.keys(departments);
        const dept = deptKeys[i % deptKeys.length];
        userDefs.push({
            email: `pracownik${i}@spolka.pl`,
            name: `Pracownik ${i}`,
            role: UserRole.CITIZEN_DEV,
            dept,
        });
    }

    const createdUsers: { id: string; email: string; role: UserRole }[] = [];
    for (const u of userDefs) {
        const user = await prisma.user.create({
            data: {
                email: u.email,
                name: u.name,
                hashedPassword,
                role: u.role,
                organizationId: org.id,
                departmentId: departments[u.dept]?.id,
            },
        });
        createdUsers.push({ id: user.id, email: user.email, role: user.role });
    }
    console.log(`✅ Created ${createdUsers.length} users`);

    const sponsorId = createdUsers.find(u => u.role === UserRole.SPONSOR)!.id;

    // =========================================================================
    // 4. CATEGORIES
    // =========================================================================
    console.log('📂 Creating categories...');
    const categoryNames = ['Obsługa Klienta', 'Finanse', 'HR', 'IT', 'Sprzedaż', 'Marketing', 'Operacje'];
    const categories: Record<string, { id: string }> = {};
    for (const name of categoryNames) {
        const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const cat = await prisma.category.create({
            data: { name, slug, organizationId: org.id },
        });
        categories[name] = cat;
    }

    // =========================================================================
    // 5. SOPs — 10 realistic procedures
    // =========================================================================
    console.log('📋 Creating SOPs...');
    const sopDefs = [
        { code: 'SOP-001', title: 'Obsługa zgłoszenia klienta', dept: 'Dział Obsługi Klienta', cat: 'Obsługa Klienta', status: SOPStatus.APPROVED },
        { code: 'SOP-002', title: 'Onboarding nowego pracownika', dept: 'Dział HR', cat: 'HR', status: SOPStatus.APPROVED },
        { code: 'SOP-003', title: 'Wystawianie faktury VAT', dept: 'Dział Finansowy', cat: 'Finanse', status: SOPStatus.APPROVED },
        { code: 'SOP-004', title: 'Proces rekrutacji', dept: 'Dział HR', cat: 'HR', status: SOPStatus.IN_REVIEW },
        { code: 'SOP-005', title: 'Ofertowanie klienta B2B', dept: 'Dział Handlowy', cat: 'Sprzedaż', status: SOPStatus.APPROVED },
        { code: 'SOP-006', title: 'Zamknięcie miesiąca księgowego', dept: 'Dział Finansowy', cat: 'Finanse', status: SOPStatus.DRAFT },
        { code: 'SOP-007', title: 'Zgłoszenie awarii systemowej', dept: 'Dział IT', cat: 'IT', status: SOPStatus.APPROVED },
        { code: 'SOP-008', title: 'Kampania marketingowa', dept: 'Dział Marketingu', cat: 'Marketing', status: SOPStatus.IN_REVIEW },
        { code: 'SOP-009', title: 'Obsługa reklamacji', dept: 'Dział Obsługi Klienta', cat: 'Obsługa Klienta', status: SOPStatus.APPROVED },
        { code: 'SOP-010', title: 'Zarządzanie projektami wewnętrznymi', dept: 'Zarząd', cat: 'Operacje', status: SOPStatus.DRAFT },
    ];

    const createdSops: { id: string; code: string }[] = [];
    for (const s of sopDefs) {
        const sop = await prisma.sOP.create({
            data: {
                code: s.code,
                title: s.title,
                purpose: `Procedura: ${s.title}`,
                steps: [
                    { id: 1, name: 'Rozpoczęcie', actions: ['Otwórz system', 'Zweryfikuj dane'] },
                    { id: 2, name: 'Realizacja', actions: ['Wykonaj kroki procesowe', 'Dokumentuj'] },
                    { id: 3, name: 'Zakończenie', actions: ['Zweryfikuj wynik', 'Zamknij zadanie'] },
                ],
                status: s.status,
                organizationId: org.id,
                createdById: sponsorId,
                updatedById: sponsorId,
                departmentId: departments[s.dept]?.id,
                categoryId: categories[s.cat]?.id,
            },
        });
        createdSops.push({ id: sop.id, code: sop.code });
    }
    console.log(`✅ Created ${createdSops.length} SOPs`);

    // =========================================================================
    // 6. AGENTS — 5 agents across types
    // =========================================================================
    console.log('🤖 Creating agents...');
    const agentDefs = [
        { code: 'AGT-001', name: 'Asystent Obsługi Klienta', type: AgentType.ASSISTANT, model: 'gpt-4o', sop: 'SOP-001' },
        { code: 'AGT-002', name: 'Agent Onboardingu', type: AgentType.AGENT, model: 'claude-3-5-sonnet', sop: 'SOP-002' },
        { code: 'AGT-003', name: 'Bot Fakturowy', type: AgentType.AUTOMATION, model: 'gpt-4o-mini', sop: 'SOP-003' },
        { code: 'AGT-004', name: 'Asystent Sprzedaży', type: AgentType.ASSISTANT, model: 'gpt-4o', sop: 'SOP-005' },
        { code: 'AGT-005', name: 'Automatyzacja Reklamacji', type: AgentType.AUTOMATION, model: 'gpt-4o-mini', sop: 'SOP-009' },
    ];

    for (const a of agentDefs) {
        const sopId = createdSops.find(s => s.code === a.sop)?.id;
        await prisma.agent.create({
            data: {
                code: a.code,
                name: a.name,
                type: a.type,
                status: AgentStatus.ACTIVE,
                model: a.model,
                masterPrompt: `Jesteś ${a.name}. Pomagasz w realizacji procedury ${a.sop}.`,
                description: `Agent AI wspierający realizację procedury ${a.sop}`,
                organizationId: org.id,
                createdById: sponsorId,
                sops: sopId ? {
                    create: { sopId },
                } : undefined,
            },
        });
    }
    console.log(`✅ Created ${agentDefs.length} agents`);

    // =========================================================================
    // 7. MUDA REPORTS — 3 sample waste analysis reports
    // =========================================================================
    console.log('📊 Creating MUDA reports...');
    const mudaDefs = [
        { title: 'Nadmiarowe maile w obsłudze klienta', dept: 'Dział Obsługi Klienta', prio: MUDAPriority.HIGH },
        { title: 'Podwójna kontrola faktur', dept: 'Dział Finansowy', prio: MUDAPriority.MEDIUM },
        { title: 'Oczekiwanie na akceptację managera', dept: 'Dział HR', prio: MUDAPriority.LOW },
    ];

    for (const m of mudaDefs) {
        await prisma.mUDAReport.create({
            data: {
                title: m.title,
                description: `Zidentyfikowany problem: ${m.title}`,
                currentState: 'Proces realizowany manualnie',
                proposedState: 'Automatyzacja z agentem AI',
                priority: m.prio,
                organizationId: org.id,
                createdById: sponsorId,
            },
        });
    }
    console.log('✅ Created 3 MUDA reports');

    // =========================================================================
    // 8. VALUE CHAIN MAP
    // =========================================================================
    console.log('🔗 Creating value chain map...');
    await prisma.valueChainMap.create({
        data: {
            name: 'Łańcuch Wartości — Usługi B2B',
            description: 'Mapa procesów od pozyskania klienta do realizacji usługi',
            segment: 'B2B',
            product: 'Usługi profesjonalne',
            startPoint: 'Pozyskanie Klienta',
            endPoint: 'Obsługa Posprzedażowa',
            organizationId: org.id,
        },
    });
    console.log('✅ Created value chain map');

    console.log('\n🎉 Seed complete! Client "Spółka usługowa sp. z o.o." is ready.');
    console.log(`   ${createdUsers.length} users (password: demo123)`);
    console.log(`   ${createdSops.length} SOPs`);
    console.log(`   ${agentDefs.length} agents`);
    console.log(`   3 MUDA reports`);
    console.log(`   1 value chain map`);
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
