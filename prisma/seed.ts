import { PrismaClient, UserRole, SOPStatus, AgentType, AgentStatus, MUDAStatus, MUDAPriority, CouncilRequestType, CouncilRequestStatus, VoteDecision } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

// Create Prisma client with pg adapter (required for Prisma 7+)
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL is not set in environment');
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Seeding VantageOS database...\n');

    // ==========================================================================
    // 1. CREATE ORGANIZATION
    // ==========================================================================
    console.log('📦 Creating organization...');
    const org = await prisma.organization.create({
        data: {
            name: 'SYHI Digital Agency',
            slug: 'syhi',
            settings: {
                theme: 'dark',
                language: 'pl',
                timezone: 'Europe/Warsaw',
            },
        },
    });

    // ==========================================================================
    // 2. CREATE DEPARTMENTS
    // ==========================================================================
    console.log('🏢 Creating departments...');
    const departments = await Promise.all([
        prisma.department.create({ data: { name: 'Zarząd', description: 'Executive board', organizationId: org.id } }),
        prisma.department.create({ data: { name: 'Operacje', description: 'Operations & delivery', organizationId: org.id } }),
        prisma.department.create({ data: { name: 'Sprzedaż', description: 'Sales & client success', organizationId: org.id } }),
        prisma.department.create({ data: { name: 'Rozwój', description: 'R&D and innovation', organizationId: org.id } }),
    ]);

    const [deptZarzad, deptOperacje, deptSprzedaz, deptRozwoj] = departments;

    // ==========================================================================
    // 3. CREATE USERS (5 roles from Manifest 3.3)
    // ==========================================================================
    console.log('👥 Creating users...');
    const hashedPassword = await bcrypt.hash('demo123', 12);

    const users = await Promise.all([
        // Sponsor (CEO)
        prisma.user.create({
            data: {
                email: 'sponsor@vantage.os',
                name: 'Jan Kowalski',
                hashedPassword,
                role: UserRole.SPONSOR,
                organizationId: org.id,
                departmentId: deptZarzad.id,
            },
        }),
        // Pilot (COO)
        prisma.user.create({
            data: {
                email: 'pilot@vantage.os',
                name: 'Anna Nowak',
                hashedPassword,
                role: UserRole.PILOT,
                organizationId: org.id,
                departmentId: deptOperacje.id,
            },
        }),
        // Manager
        prisma.user.create({
            data: {
                email: 'manager@vantage.os',
                name: 'Piotr Wiśniewski',
                hashedPassword,
                role: UserRole.MANAGER,
                organizationId: org.id,
                departmentId: deptSprzedaz.id,
            },
        }),
        // Expert
        prisma.user.create({
            data: {
                email: 'expert@vantage.os',
                name: 'Maria Dąbrowska',
                hashedPassword,
                role: UserRole.EXPERT,
                organizationId: org.id,
                departmentId: deptOperacje.id,
            },
        }),
        // Citizen Dev
        prisma.user.create({
            data: {
                email: 'demo@vantage.os',
                name: 'Tomasz Zieliński',
                hashedPassword,
                role: UserRole.CITIZEN_DEV,
                organizationId: org.id,
                departmentId: deptRozwoj.id,
            },
        }),
    ]);

    const [userSponsor, userPilot, userManager, userExpert, userCitizen] = users;

    // ==========================================================================
    // 4. CREATE SOPS
    // ==========================================================================
    console.log('📋 Creating SOPs...');
    const sops = await Promise.all([
        prisma.sOP.create({
            data: {
                title: 'Onboarding nowego klienta',
                code: 'SOP-SALES-001',
                version: '2.1',
                status: SOPStatus.APPROVED,
                purpose: 'Ustandaryzowany proces wprowadzania nowego klienta do ekosystemu SYHI, od pierwszego kontaktu do aktywnej współpracy.',
                scope: 'Dotyczy wszystkich nowych klientów B2B. Obejmuje etapy: kwalifikacja, ofertowanie, onboarding, handover do delivery.',
                definitions: {
                    'MQL': 'Marketing Qualified Lead - lead wstępnie zakwalifikowany przez marketing',
                    'SQL': 'Sales Qualified Lead - lead zaakceptowany przez sprzedaż do ofertowania',
                    'Discovery Call': 'Rozmowa odkrywcza - 30-60 min sesja zrozumienia potrzeb klienta',
                },
                steps: [
                    { order: 1, title: 'Kwalifikacja leada', description: 'Ocena potencjału na podstawie kryteriów BANT', responsible: 'Sales Rep' },
                    { order: 2, title: 'Discovery Call', description: 'Przeprowadzenie rozmowy odkrywczej z decision-makerem', responsible: 'Account Executive' },
                    { order: 3, title: 'Przygotowanie oferty', description: 'Stworzenie customowej propozycji na bazie szablonu', responsible: 'Account Executive' },
                    { order: 4, title: 'Negocjacje', description: 'Ustalenie finalnych warunków współpracy', responsible: 'Account Executive' },
                    { order: 5, title: 'Podpisanie umowy', description: 'Finalizacja kontraktu w systemie DocuSign', responsible: 'Legal' },
                    { order: 6, title: 'Handover do Delivery', description: 'Przekazanie kontekstu zespołowi realizacyjnemu', responsible: 'Account Executive' },
                ],
                kpis: [
                    { name: 'Conversion Rate MQL→SQL', target: '30%', current: '28%' },
                    { name: 'Average Sales Cycle', target: '21 dni', current: '25 dni' },
                    { name: 'Client Satisfaction Score', target: '9/10', current: '8.5/10' },
                ],
                owner: 'Piotr Wiśniewski',
                organizationId: org.id,
                departmentId: deptSprzedaz.id,
                createdById: userManager.id,
                updatedById: userExpert.id,
                approvedBy: 'Anna Nowak',
                approvedAt: new Date('2024-12-15'),
            },
        }),
        prisma.sOP.create({
            data: {
                title: 'Raportowanie tygodniowe',
                code: 'SOP-OPS-001',
                version: '1.3',
                status: SOPStatus.APPROVED,
                purpose: 'Zapewnienie regularnego przeglądu postępów projektów i identyfikacji blokerów.',
                scope: 'Wszystkie projekty aktywne w portfolio. Dotyczy Project Managerów i Team Leadów.',
                steps: [
                    { order: 1, title: 'Zebranie danych', description: 'Pobranie statusów z Jira, Github, Slack', responsible: 'PM' },
                    { order: 2, title: 'Analiza postępów', description: 'Porównanie z planem sprintowym', responsible: 'PM' },
                    { order: 3, title: 'Identyfikacja ryzyk', description: 'Mapowanie blokerów i zależności', responsible: 'PM' },
                    { order: 4, title: 'Prezentacja na stand-up', description: 'Weekly sync z zespołem', responsible: 'PM' },
                ],
                owner: 'Anna Nowak',
                organizationId: org.id,
                departmentId: deptOperacje.id,
                createdById: userPilot.id,
            },
        }),
        prisma.sOP.create({
            data: {
                title: 'Proces rekrutacji',
                code: 'SOP-HR-001',
                version: '1.0',
                status: SOPStatus.DRAFT,
                purpose: 'Standardowy proces rekrutacji nowych członków zespołu.',
                organizationId: org.id,
                createdById: userSponsor.id,
            },
        }),
        prisma.sOP.create({
            data: {
                title: 'Fakturowanie i windykacja',
                code: 'SOP-FIN-001',
                version: '2.0',
                status: SOPStatus.APPROVED,
                purpose: 'Proces wystawiania faktur i zarządzania należnościami.',
                organizationId: org.id,
                createdById: userExpert.id,
                approvedBy: 'Jan Kowalski',
                approvedAt: new Date('2024-11-01'),
            },
        }),
        prisma.sOP.create({
            data: {
                title: 'Code Review Process',
                code: 'SOP-DEV-001',
                version: '1.5',
                status: SOPStatus.APPROVED,
                purpose: 'Zapewnienie jakości kodu przez systematyczne przeglądy.',
                organizationId: org.id,
                departmentId: deptRozwoj.id,
                createdById: userCitizen.id,
            },
        }),
    ]);

    // ==========================================================================
    // 5. CREATE AI AGENTS
    // ==========================================================================
    console.log('🤖 Creating AI Agents...');
    const agents = await Promise.all([
        prisma.agent.create({
            data: {
                name: 'SalesBot',
                code: 'AGENT-001',
                type: AgentType.AGENT,
                status: AgentStatus.ACTIVE,
                description: 'Agent wspierający proces sprzedaży - kwalifikacja leadów, przygotowanie ofert, follow-up.',
                masterPrompt: `Jesteś ekspertem ds. sprzedaży B2B w agencji technologicznej SYHI.
Twoje zadania:
1. Kwalifikacja leadów według metodologii BANT
2. Przygotowanie spersonalizowanych ofert
3. Analiza konkurencji i pozycjonowanie
4. Wsparcie w negocjacjach

Kryteria kwalifikacji BANT:
- Budget: minimim 10k PLN/miesiąc
- Authority: decision-maker na poziomie C-level lub Director
- Need: zidentyfikowana potrzeba transformacji AI/automatyzacji
- Timeline: projekt startujący w ciągu 3 miesięcy`,
                model: 'gpt-4-turbo',
                temperature: 0.7,
                integrations: ['slack', 'hubspot', 'gmail'],
                organizationId: org.id,
                createdById: userManager.id,
            },
        }),
        prisma.agent.create({
            data: {
                name: 'DocuMaster',
                code: 'AGENT-002',
                type: AgentType.ASSISTANT,
                status: AgentStatus.ACTIVE,
                description: 'Agent do tworzenia i zarządzania dokumentacją - SOPs, raporty, specyfikacje.',
                masterPrompt: `Jesteś ekspertem ds. dokumentacji procesowej.
Twoim zadaniem jest tworzenie precyzyjnej dokumentacji zgodnej ze standardami ISO 9001.
Każdy SOP musi zawierać: cel, zakres, definicje, kroki procedury, KPI.`,
                model: 'claude-3-sonnet',
                temperature: 0.3,
                organizationId: org.id,
                createdById: userExpert.id,
            },
        }),
        prisma.agent.create({
            data: {
                name: 'DataAnalyst',
                code: 'AGENT-003',
                type: AgentType.AGENT,
                status: AgentStatus.ACTIVE,
                description: 'Agent analityczny - raporty MUDA, KPIs, trendy, predykcje.',
                model: 'gpt-4-turbo',
                organizationId: org.id,
                createdById: userPilot.id,
            },
        }),
    ]);

    // ==========================================================================
    // 6. CREATE MUDA REPORTS
    // ==========================================================================
    console.log('📊 Creating MUDA Reports...');
    await Promise.all([
        prisma.mUDAReport.create({
            data: {
                title: 'Redundantne spotkania statusowe',
                status: MUDAStatus.OPEN,
                priority: MUDAPriority.HIGH,
                description: 'Zidentyfikowano 3 różne spotkania tygodniowe z nakładającą się tematyką: Monday standup, Wednesday sync, Friday review.',
                currentState: 'Zespół spędza średnio 4.5h/tydzień na spotkaniach statusowych. Wiele informacji jest powtarzanych.',
                proposedState: 'Konsolidacja do jednego 45-minutowego spotkania z async updates przez Slack.',
                findings: [
                    { type: 'Motion', description: 'Przełączanie kontekstu między spotkaniami' },
                    { type: 'Waiting', description: 'Oczekiwanie na wszystkich uczestników' },
                    { type: 'Overprocessing', description: 'Powtarzanie tych samych statusów' },
                ],
                recommendations: [
                    { priority: 1, action: 'Połączyć Monday standup z Wednesday sync', impact: 'high' },
                    { priority: 2, action: 'Wdrożyć async standup w Slack', impact: 'medium' },
                ],
                estimatedSavings: 12500,
                savingsUnit: 'PLN/miesiąc',
                organizationId: org.id,
                createdById: userPilot.id,
            },
        }),
        prisma.mUDAReport.create({
            data: {
                title: 'Manualne generowanie raportów',
                status: MUDAStatus.IN_PROGRESS,
                priority: MUDAPriority.MEDIUM,
                description: 'Finance team spędza 8h/tydzień na manualnym zbieraniu danych do raportów miesięcznych.',
                estimatedSavings: 8000,
                savingsUnit: 'PLN/miesiąc',
                implementationCost: 15000,
                organizationId: org.id,
                createdById: userExpert.id,
            },
        }),
        prisma.mUDAReport.create({
            data: {
                title: 'Duplikacja danych w systemach',
                status: MUDAStatus.RESOLVED,
                priority: MUDAPriority.CRITICAL,
                description: 'Dane klientów przechowywane w 4 różnych systemach bez synchronizacji.',
                estimatedSavings: 25000,
                savingsUnit: 'PLN/miesiąc',
                organizationId: org.id,
                createdById: userSponsor.id,
            },
        }),
    ]);

    // ==========================================================================
    // 7. CREATE VALUE CHAIN MAP
    // ==========================================================================
    console.log('🗺️ Creating Value Chain Map...');
    const valueChainMap = await prisma.valueChainMap.create({
        data: {
            name: 'Client Journey Map',
            description: 'End-to-end map of client engagement from lead to advocacy',
            organizationId: org.id,
            layout: { zoom: 1, x: 0, y: 0 },
        },
    });

    await Promise.all([
        prisma.valueChainNode.create({
            data: {
                mapId: valueChainMap.id,
                type: 'process',
                label: 'Lead Generation',
                description: 'Marketing attracts potential clients',
                positionX: 100,
                positionY: 200,
                style: { background: '#7c3aed' },
            },
        }),
        prisma.valueChainNode.create({
            data: {
                mapId: valueChainMap.id,
                type: 'process',
                label: 'Qualification',
                description: 'Sales qualifies leads using BANT',
                positionX: 300,
                positionY: 200,
                sopId: sops[0].id,
            },
        }),
        prisma.valueChainNode.create({
            data: {
                mapId: valueChainMap.id,
                type: 'decision',
                label: 'Qualified?',
                positionX: 500,
                positionY: 200,
            },
        }),
        prisma.valueChainNode.create({
            data: {
                mapId: valueChainMap.id,
                type: 'process',
                label: 'Discovery',
                description: 'Deep dive into client needs',
                positionX: 700,
                positionY: 200,
                agentId: agents[0].id,
            },
        }),
    ]);

    // ==========================================================================
    // 8. CREATE COUNCIL REQUESTS
    // ==========================================================================
    console.log('🏛️ Creating Council Requests...');
    const councilRequest = await prisma.councilRequest.create({
        data: {
            title: 'Wdrożenie systemu AI do kwalifikacji leadów',
            type: CouncilRequestType.NEW_AGENT,
            status: CouncilRequestStatus.VOTING,
            priority: MUDAPriority.HIGH,
            description: 'Propozycja wdrożenia agenta AI do automatycznej kwalifikacji leadów według kryteriów BANT.',
            rationale: 'Obecny proces zajmuje średnio 2h na lead. AI może zredukować to do 5 minut z 85% accuracy.',
            impact: 'Oszczędność 40h/tydzień dla zespołu sprzedaży. ROI w ciągu 3 miesięcy.',
            votingDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            organizationId: org.id,
            createdById: userManager.id,
        },
    });

    await Promise.all([
        prisma.councilVote.create({
            data: {
                requestId: councilRequest.id,
                userId: userSponsor.id,
                decision: VoteDecision.APPROVE,
                comment: 'Strategicznie kluczowa inicjatywa. Pełne poparcie.',
            },
        }),
        prisma.councilVote.create({
            data: {
                requestId: councilRequest.id,
                userId: userPilot.id,
                decision: VoteDecision.APPROVE,
                comment: 'Zasoby dostępne. Proponuję pilotaż na 10 leadach.',
            },
        }),
    ]);

    // ==========================================================================
    // 9. CREATE ONTOLOGY ENTRIES
    // ==========================================================================
    console.log('📖 Creating Ontology entries...');
    await Promise.all([
        prisma.ontologyEntry.create({
            data: {
                term: 'BANT',
                category: 'Methodology',
                definition: 'Framework kwalifikacji leadów: Budget (budżet), Authority (decyzyjność), Need (potrzeba), Timeline (harmonogram).',
                context: 'Używany przez zespół sprzedaży do oceny potencjału leada przed inwestycją czasu w ofertowanie.',
                examples: ['Lead z budżetem 50k, kontakt z CEO, potrzeba automatyzacji, start Q1 = SQL', 'Lead bez budżetu, kontakt z praktykantem = MQL'],
                organizationId: org.id,
            },
        }),
        prisma.ontologyEntry.create({
            data: {
                term: 'SOP',
                category: 'Process',
                definition: 'Standard Operating Procedure - ustandaryzowany opis procedury realizacji określonego zadania lub procesu.',
                context: 'Podstawowy element dokumentacji procesowej. Każdy SOP ma właściciela i podlega weryfikacji.',
                organizationId: org.id,
            },
        }),
        prisma.ontologyEntry.create({
            data: {
                term: 'MUDA',
                category: 'Methodology',
                definition: 'Japońskie słowo oznaczające "marnotrawstwo". W Lean oznacza wszelkie czynności nie dodające wartości dla klienta.',
                context: 'Raport MUDA identyfikuje 8 typów marnotrawstwa: transport, inventory, motion, waiting, overproduction, overprocessing, defects, skills.',
                organizationId: org.id,
            },
        }),
        prisma.ontologyEntry.create({
            data: {
                term: 'Discovery Call',
                category: 'Process',
                definition: 'Rozmowa odkrywcza z potencjalnym klientem mająca na celu zrozumienie głębokich potrzeb i kontekstu biznesowego.',
                relatedTerms: ['BANT', 'Sales Process'],
                organizationId: org.id,
            },
        }),
        prisma.ontologyEntry.create({
            data: {
                term: 'Citizen Dev',
                category: 'Role',
                definition: 'Pracownik nie-techniczny, który dzięki low-code/no-code tools może tworzyć proste automatyzacje i rozwiązania.',
                context: 'Część Manifest 3.3 - promuje demokratyzację technologii w organizacji.',
                organizationId: org.id,
            },
        }),
    ]);

    // ==========================================================================
    // 10. CREATE ORGANIZATIONAL ROLES
    // ==========================================================================
    console.log('👔 Creating Organizational Roles...');
    await Promise.all([
        prisma.organizationalRole.create({
            data: {
                name: 'Account Executive',
                description: 'Odpowiedzialny za cały cykl sprzedaży od kwalifikacji do zamknięcia deala.',
                raciMatrix: { [sops[0].id]: { R: true, A: true, C: false, I: false } },
                organizationId: org.id,
            },
        }),
        prisma.organizationalRole.create({
            data: {
                name: 'Project Manager',
                description: 'Zarządza projektami klientowskimi, koordynuje zespół, raportuje postępy.',
                raciMatrix: { [sops[1].id]: { R: true, A: true, C: false, I: false } },
                organizationId: org.id,
            },
        }),
        prisma.organizationalRole.create({
            data: {
                name: 'Developer',
                description: 'Realizuje techniczne aspekty projektów, code review, dokumentacja techniczna.',
                organizationId: org.id,
            },
        }),
    ]);

    // ==========================================================================
    // SUMMARY
    // ==========================================================================
    console.log('\n✅ Seed completed successfully!\n');
    console.log('📊 Created:');
    console.log(`   - 1 Organization: ${org.name}`);
    console.log(`   - ${departments.length} Departments`);
    console.log(`   - ${users.length} Users (all passwords: demo123)`);
    console.log(`   - ${sops.length} SOPs`);
    console.log(`   - ${agents.length} AI Agents`);
    console.log(`   - 3 MUDA Reports`);
    console.log(`   - 1 Value Chain Map with 4 nodes`);
    console.log(`   - 1 Council Request with 2 votes`);
    console.log(`   - 5 Ontology entries`);
    console.log(`   - 3 Organizational Roles`);
    console.log('\n🔐 Demo accounts:');
    console.log('   - sponsor@vantage.os (SPONSOR - full access)');
    console.log('   - pilot@vantage.os (PILOT - KPI dashboard)');
    console.log('   - manager@vantage.os (MANAGER - department scoped)');
    console.log('   - expert@vantage.os (EXPERT - SOP expert)');
    console.log('   - demo@vantage.os (CITIZEN_DEV - read + innovation)');
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
