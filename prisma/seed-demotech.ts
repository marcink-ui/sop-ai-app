// =====================================
// DemoTech Solutions — Demo Company Seed
// =====================================
// Run: npx prisma db seed -- --demo
// This creates a separate demo organization with comprehensive data for client presentations.

import { PrismaClient, UserRole, SOPStatus, AgentType, AgentStatus, MUDAStatus, MUDAPriority, CouncilRequestType, CouncilRequestStatus, VoteDecision } from '@prisma/client';
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

async function seedDemoTech() {
    console.log('🏢 Seeding DemoTech Solutions...\n');

    const hashedPassword = await bcrypt.hash('demo123', 10);

    // ==========================================================================
    // 1. ORGANIZATION
    // ==========================================================================
    console.log('📦 Creating DemoTech organization...');
    const org = await prisma.organization.create({
        data: {
            name: 'DemoTech Solutions Sp. z o.o.',
            slug: 'demotech',
            settings: {
                theme: 'dark',
                language: 'pl',
                timezone: 'Europe/Warsaw',
                industry: 'IT Services & Consulting',
                employeeCount: '120',
            },
        },
    });

    // ==========================================================================
    // 2. DEPARTMENTS
    // ==========================================================================
    console.log('🏗️ Creating departments...');
    const [deptZarzad, deptSprzedaz, deptProdukcja, deptHR] = await Promise.all([
        prisma.department.create({
            data: { name: 'Zarząd', organizationId: org.id },
        }),
        prisma.department.create({
            data: { name: 'Sprzedaż i Marketing', organizationId: org.id },
        }),
        prisma.department.create({
            data: { name: 'Produkcja / Delivery', organizationId: org.id },
        }),
        prisma.department.create({
            data: { name: 'HR & Administracja', organizationId: org.id },
        }),
    ]);

    // ==========================================================================
    // 3. USERS (6)
    // ==========================================================================
    console.log('👤 Creating users...');
    const users = await Promise.all([
        // CEO / Sponsor
        prisma.user.create({
            data: {
                email: 'ceo@demotech.pl',
                name: 'Marek Demoński',
                hashedPassword,
                role: UserRole.SPONSOR,
                organizationId: org.id,
                departmentId: deptZarzad.id,
            },
        }),
        // COO / Pilot
        prisma.user.create({
            data: {
                email: 'coo@demotech.pl',
                name: 'Katarzyna Pilotowska',
                hashedPassword,
                role: UserRole.PILOT,
                organizationId: org.id,
                departmentId: deptZarzad.id,
            },
        }),
        // Sales Manager
        prisma.user.create({
            data: {
                email: 'sales@demotech.pl',
                name: 'Piotr Handlowy',
                hashedPassword,
                role: UserRole.MANAGER,
                organizationId: org.id,
                departmentId: deptSprzedaz.id,
            },
        }),
        // Head of Production
        prisma.user.create({
            data: {
                email: 'delivery@demotech.pl',
                name: 'Agnieszka Projektowa',
                hashedPassword,
                role: UserRole.EXPERT,
                organizationId: org.id,
                departmentId: deptProdukcja.id,
            },
        }),
        // HR Manager
        prisma.user.create({
            data: {
                email: 'hr@demotech.pl',
                name: 'Tomasz Kadrowy',
                hashedPassword,
                role: UserRole.MANAGER,
                organizationId: org.id,
                departmentId: deptHR.id,
            },
        }),
        // Junior Dev / Citizen Dev
        prisma.user.create({
            data: {
                email: 'dev@demotech.pl',
                name: 'Anna Koderska',
                hashedPassword,
                role: UserRole.CITIZEN_DEV,
                organizationId: org.id,
                departmentId: deptProdukcja.id,
            },
        }),
    ]);

    const [ceo, coo, salesMgr, headProd, hrMgr, citizenDev] = users;

    // ==========================================================================
    // 4. SOPs (5)
    // ==========================================================================
    console.log('📋 Creating SOPs...');
    const sops = await Promise.all([
        prisma.sOP.create({
            data: {
                title: 'Onboarding klienta B2B',
                code: 'DT-SALES-001',
                version: '3.0',
                status: SOPStatus.APPROVED,
                purpose: 'Zapewnienie płynnego i powtarzalnego procesu wprowadzania nowego klienta B2B do ekosystemu DemoTech.',
                scope: 'Od pierwszego kontaktu do podpisania umowy i kickoffu projektu. Dotyczy klientów z segmentu Enterprise (>50 pracowników).',
                definitions: {
                    'ICP': 'Ideal Customer Profile — profil idealnego klienta',
                    'MQL': 'Marketing Qualified Lead',
                    'SQL': 'Sales Qualified Lead',
                    'POC': 'Proof of Concept — dowód wartości',
                },
                steps: [
                    { order: 1, title: 'Kwalifikacja leada', description: 'Weryfikacja leada wg kryteriów ICP: branża IT/produkcja, >50 pracowników, budżet >20k PLN/mies.', responsible: 'Sales Rep', tool: 'CRM + SalesBot AI', duration: '30 min' },
                    { order: 2, title: 'Discovery Call', description: 'Rozmowa odkrywcza 45 min: pain points, obecne narzędzia, decyzyjność, timeline.', responsible: 'Account Executive', tool: 'Zoom + CRM', duration: '45 min' },
                    { order: 3, title: 'Przygotowanie propozycji', description: 'Customowa oferta z ROI kalkulacją, case studies, timeline wdrożenia.', responsible: 'Account Executive', tool: 'DocuMaster AI + Google Slides', duration: '2h' },
                    { order: 4, title: 'Prezentacja oferty', description: 'Spotkanie z decision-makerem: prezentacja wartości, demo produktu, Q&A.', responsible: 'Account Executive', tool: 'Zoom + Demo env', duration: '1h' },
                    { order: 5, title: 'Negocjacje i legal', description: 'Ustalenie finalnych warunków, review kontraktu przez prawnika klienta.', responsible: 'Account Executive + Legal', tool: 'DocuSign', duration: '3-5 dni' },
                    { order: 6, title: 'Kickoff projektu', description: 'Handover do delivery team, setup workspace, onboarding zespołu klienta.', responsible: 'PM + AE', tool: 'Jira + Slack + VantageOS', duration: '2h' },
                ],
                kpis: [
                    { name: 'Lead-to-Close Rate', target: '25%', current: '22%' },
                    { name: 'Avg Sales Cycle', target: '18 dni', current: '23 dni' },
                    { name: 'First Response Time', target: '<2h', current: '3.5h' },
                    { name: 'Proposal Win Rate', target: '60%', current: '52%' },
                ],
                owner: 'Piotr Handlowy',
                organizationId: org.id,
                departmentId: deptSprzedaz.id,
                createdById: salesMgr.id,
                updatedById: coo.id,
                approvedBy: 'Katarzyna Pilotowska',
                approvedAt: new Date('2025-01-15'),
            },
        }),
        prisma.sOP.create({
            data: {
                title: 'Kwalifikacja leadów',
                code: 'DT-SALES-002',
                version: '2.0',
                status: SOPStatus.APPROVED,
                purpose: 'Systematyczna ocena jakości leadów przychodzących i wychodzących, zapobieganie marnowaniu czasu na niekwalifikowane kontakty.',
                scope: 'Wszystkie leady z kanałów: website, referral, event, outbound. Nie dotyczy partnerów strategicznych.',
                steps: [
                    { order: 1, title: 'Scoring automatyczny', description: 'SalesBot analizuje dane leada i przypisuje score 0-100.', responsible: 'SalesBot AI', tool: 'CRM API', duration: '5 min' },
                    { order: 2, title: 'Weryfikacja manualna', description: 'Sales rep potwierdza scoring i sprawdza LinkedIn profil.', responsible: 'Sales Rep', tool: 'LinkedIn + CRM', duration: '10 min' },
                    { order: 3, title: 'Decyzja: pursue/nurture/reject', description: 'Score >70 = pursue, 40-70 = nurture, <40 = reject.', responsible: 'Sales Manager', tool: 'CRM', duration: '5 min' },
                ],
                kpis: [
                    { name: 'AI Scoring Accuracy', target: '85%', current: '81%' },
                    { name: 'Time to Qualify', target: '<20 min', current: '35 min' },
                ],
                owner: 'Piotr Handlowy',
                organizationId: org.id,
                departmentId: deptSprzedaz.id,
                createdById: salesMgr.id,
                approvedBy: 'Marek Demoński',
                approvedAt: new Date('2025-02-01'),
            },
        }),
        prisma.sOP.create({
            data: {
                title: 'Obsługa zgłoszeń supportowych',
                code: 'DT-PROD-001',
                version: '1.5',
                status: SOPStatus.APPROVED,
                purpose: 'Zapewnienie SLA dla klientów: response time <1h dla Critical, <4h dla High.',
                scope: 'Wszystkie zgłoszenia z kanałów: Zendesk, email, Slack. Dotyczy klientów z aktywnym SLA.',
                steps: [
                    { order: 1, title: 'Kategoryzacja', description: 'SupportBot kategoryzuje zgłoszenie: Bug/Feature/Question + priorytet.', responsible: 'SupportBot AI', tool: 'Zendesk API', duration: '2 min' },
                    { order: 2, title: 'Przypisanie', description: 'Dispatch do odpowiedniego specjalisty na podstawie kategorii i dostępności.', responsible: 'SupportBot AI', tool: 'Zendesk', duration: '1 min' },
                    { order: 3, title: 'Diagnoza', description: 'Specjalista analizuje problem, reprodukuje bug, identyfikuje root cause.', responsible: 'Developer', tool: 'Jira + IDE', duration: '30-120 min' },
                    { order: 4, title: 'Rozwiązanie', description: 'Fix, deploy, test. Komunikacja z klientem o statusie.', responsible: 'Developer', tool: 'Git + CI/CD', duration: '1-8h' },
                    { order: 5, title: 'Close & feedback', description: 'Zamknięcie ticketa, CSAT survey, update knowledge base.', responsible: 'Support Engineer', tool: 'Zendesk + Wiki', duration: '10 min' },
                ],
                kpis: [
                    { name: 'First Response Time', target: '<1h (Critical)', current: '47 min' },
                    { name: 'Resolution Time', target: '<8h (Critical)', current: '6.2h' },
                    { name: 'CSAT Score', target: '>4.5/5', current: '4.3/5' },
                ],
                owner: 'Agnieszka Projektowa',
                organizationId: org.id,
                departmentId: deptProdukcja.id,
                createdById: headProd.id,
                approvedBy: 'Katarzyna Pilotowska',
                approvedAt: new Date('2025-01-20'),
            },
        }),
        prisma.sOP.create({
            data: {
                title: 'Proces rekrutacji IT',
                code: 'DT-HR-001',
                version: '1.0',
                status: SOPStatus.DRAFT,
                purpose: 'Ustandaryzowanie procesu rekrutacji na stanowiska techniczne, skrócenie time-to-hire.',
                scope: 'Stanowiska: Developer, QA, DevOps, Data Engineer. Nie dotyczy stanowisk C-level.',
                steps: [
                    { order: 1, title: 'Sourcing', description: 'Publikacja ogłoszenia na LinkedIn, JustJoinIT, No Fluff Jobs.', responsible: 'HR', tool: 'ATS', duration: '1h' },
                    { order: 2, title: 'Screening CV', description: 'AI screening + manual review top 20 kandydatów.', responsible: 'HR + AI', tool: 'ATS + GPT', duration: '2h' },
                    { order: 3, title: 'Interview techniczny', description: 'Live coding + system design (Senior), coding task (Mid/Junior).', responsible: 'Tech Lead', tool: 'Zoom + CoderPad', duration: '1.5h' },
                    { order: 4, title: 'Oferta i onboarding', description: 'Przygotowanie oferty, negocjacje, setup kont i sprzętu.', responsible: 'HR + IT Admin', tool: 'HR System', duration: '3 dni' },
                ],
                owner: 'Tomasz Kadrowy',
                organizationId: org.id,
                departmentId: deptHR.id,
                createdById: hrMgr.id,
            },
        }),
        prisma.sOP.create({
            data: {
                title: 'Raportowanie miesięczne dla zarządu',
                code: 'DT-OPS-001',
                version: '2.1',
                status: SOPStatus.APPROVED,
                purpose: 'Dostarczenie zarządowi spójnego, actionable raportu o kondycji firmy: finanse, projekty, HR, klienci.',
                scope: 'Raport tworzony co miesiąc do 5. dnia roboczego. Odbiorcy: CEO, COO, CFO.',
                steps: [
                    { order: 1, title: 'Zbieranie danych', description: 'DataAnalyst AI agreguje dane z CRM, Jira, HR System, Finanse.', responsible: 'DataAnalyst AI', tool: 'API + Databases', duration: '15 min' },
                    { order: 2, title: 'Generowanie dashboardu', description: 'Auto-generowanie wizualizacji KPI: revenue, burn rate, utilization, CSAT.', responsible: 'DataAnalyst AI', tool: 'Analytics', duration: '10 min' },
                    { order: 3, title: 'Review i komentarz COO', description: 'COO dodaje kontekst strategiczny, flaguje ryzyka, proponuje akcje.', responsible: 'COO', tool: 'VantageOS', duration: '30 min' },
                    { order: 4, title: 'Prezentacja na Board Meeting', description: 'CEO prezentuje raport na spotkaniu zarządu + Q&A.', responsible: 'CEO', tool: 'Google Meet + Slides', duration: '1h' },
                ],
                owner: 'Katarzyna Pilotowska',
                organizationId: org.id,
                departmentId: deptZarzad.id,
                createdById: coo.id,
                approvedBy: 'Marek Demoński',
                approvedAt: new Date('2025-01-10'),
            },
        }),
    ]);

    // ==========================================================================
    // 5. AI AGENTS (3)
    // ==========================================================================
    console.log('🤖 Creating AI Agents...');
    const agents = await Promise.all([
        prisma.agent.create({
            data: {
                name: 'SalesBot DT',
                code: 'DT-AGENT-001',
                type: AgentType.AGENT,
                status: AgentStatus.ACTIVE,
                description: 'Agent sprzedażowy DemoTech — kwalifikacja leadów, scoring, przygotowanie briefów do discovery call.',
                masterPrompt: `Jesteś SalesBot — ekspertem ds. sprzedaży B2B w DemoTech Solutions.

## ROLA
Wspierasz zespół sprzedaży w kwalifikacji leadów i przygotowaniu do rozmów handlowych.

## KONTEKST
- Firma: DemoTech Solutions Sp. z o.o. — IT Services & Consulting, 120 pracowników
- ICP: Firmy 50-500 osób, branża IT/produkcja/fintech, budżet AI >20k PLN/mies
- Narzędzia: CRM (HubSpot), LinkedIn Sales Navigator, DocuSign

## ZASADY
1. Scoring BANT: Budget (>20k), Authority (C-level/Director), Need (pain point zidentyfikowany), Timeline (<3 mies)
2. Lead score >70 = SQL (pursue), 40-70 = nurture, <40 = reject
3. Nigdy nie obiecuj konkretnych cen — zawsze "pricing dependent on scope"
4. Eskaluj do Account Executive jeśli: klient chce demo, rozmawia o kontrakcie, ma budżet >100k

## FORMAT
Odpowiadaj w formatce:
- Lead Score: [0-100]
- Rekomendacja: [Pursue/Nurture/Reject]
- Uzasadnienie: [2-3 zdania]
- Next Step: [konkretna akcja]`,
                model: 'gpt-4-turbo',
                temperature: 0.6,
                integrations: ['hubspot', 'slack', 'linkedin'],
                organizationId: org.id,
                createdById: salesMgr.id,
            },
        }),
        prisma.agent.create({
            data: {
                name: 'SupportBot DT',
                code: 'DT-AGENT-002',
                type: AgentType.AGENT,
                status: AgentStatus.ACTIVE,
                description: 'Agent supportowy — kategoryzacja zgłoszeń, auto-response dla FAQ, eskalacja do specjalistów.',
                masterPrompt: `Jesteś SupportBot — pierwszą linią wsparcia klienta w DemoTech Solutions.

## ROLA
Kategoryzujesz zgłoszenia, odpowiadasz na FAQ, eskalujesz złożone problemy do specjalistów.

## ZASADY
1. Kategorie: Bug (critical/high/medium/low), Feature Request, Question, Account Issue
2. SLA: Critical = response <1h, High = <4h, Medium = <8h, Low = <24h
3. FAQ: odpowiadaj natychmiast z linkami do dokumentacji
4. Eskalacja: jeśli klient jest zdenerwowany (sentiment analysis), problem trwa >24h, lub dotyczy security

## FORMAT
Ticket: [#ID]
Kategoria: [Bug/Feature/Question]
Priorytet: [Critical/High/Medium/Low]
Assigned: [nazwa specjalisty]
ETA: [szacowany czas rozwiązania]`,
                model: 'claude-3-sonnet',
                temperature: 0.3,
                integrations: ['zendesk', 'slack', 'jira'],
                organizationId: org.id,
                createdById: headProd.id,
            },
        }),
        prisma.agent.create({
            data: {
                name: 'DataAnalyst DT',
                code: 'DT-AGENT-003',
                type: AgentType.ASSISTANT,
                status: AgentStatus.ACTIVE,
                description: 'Asystent analityczny — agregacja danych z wielu źródeł, generowanie dashboardów, proaktywne alerty.',
                masterPrompt: `Jesteś DataAnalyst — analitykiem biznesowym DemoTech Solutions.

## ROLA
Agregujesz dane z CRM, Jira, HR System i finansów. Generujesz raporty i alerty.

## ZASADY
1. Dane zawsze aktualne (max 24h opóźnienia)
2. Wizualizacje: preferuj wykresy słupkowe dla porównań, liniowe dla trendów, pie dla udziałów
3. Alerty proaktywne: jeśli KPI odbiega >20% od targetu, wyślij alert do COO
4. Język: polski, ale metryki w formacie międzynarodowym (PLN, %, h)

## KPIs DO ŚLEDZENIA
- Revenue MRR (Monthly Recurring Revenue)
- Burn Rate
- Team Utilization Rate
- Client Satisfaction (CSAT)
- Time-to-Hire
- Lead-to-Close Conversion`,
                model: 'gpt-4-turbo',
                temperature: 0.2,
                integrations: ['analytics', 'jira', 'hubspot'],
                organizationId: org.id,
                createdById: coo.id,
            },
        }),
    ]);

    // ==========================================================================
    // 6. MUDA REPORTS (3)
    // ==========================================================================
    console.log('📊 Creating MUDA Reports...');
    await Promise.all([
        prisma.mUDAReport.create({
            data: {
                title: 'Ręczna kwalifikacja leadów — 3h/dzień marnowane',
                status: MUDAStatus.OPEN,
                priority: MUDAPriority.CRITICAL,
                description: 'Sales team marnuje 3h dziennie na manualne przeglądanie leadów, które SalesBot mógłby kwalifikować w 5 minut.',
                currentState: 'Sales rep ręcznie sprawdza każdy lead w CRM, otwiera LinkedIn, czyta website firmy, ocenia wg BANT.',
                proposedState: 'SalesBot automatycznie scoruje leady 0-100. Sales rep weryfikuje tylko top 20% (score >70).',
                findings: [
                    { type: 'Overprocessing', description: 'Ręczne sprawdzanie leadów które nie spełniają kryteriów ICP' },
                    { type: 'Waiting', description: 'Lead czeka 2-3 dni na pierwszy kontakt z powodu kolejki' },
                    { type: 'Motion', description: 'Przełączanie między 5 narzędziami: CRM, LinkedIn, website, email, notes' },
                    { type: 'Defects', description: '15% leadów błędnie zakwalifikowanych (false positives)' },
                ],
                recommendations: [
                    { priority: 1, action: 'Wdrożenie SalesBot AI do automatycznego scoringu', impact: 'critical' },
                    { priority: 2, action: 'Integracja CRM z LinkedIn (eliminacja przełączania)', impact: 'high' },
                    { priority: 3, action: 'Dashboard real-time z pipeline overview', impact: 'medium' },
                ],
                estimatedSavings: 18000,
                savingsUnit: 'PLN/miesiąc',
                implementationCost: 25000,
                organizationId: org.id,
                createdById: coo.id,
            },
        }),
        prisma.mUDAReport.create({
            data: {
                title: 'Manualne raportowanie — 8h/miesiąc na zbieranie danych',
                status: MUDAStatus.IN_PROGRESS,
                priority: MUDAPriority.HIGH,
                description: 'COO/PM ręcznie zbiera dane z 6 systemów do raportu miesięcznego.',
                currentState: 'Dane kopiowane z Jira, HubSpot, Google Sheets, HR System, Slack analytics do PowerPointa.',
                proposedState: 'DataAnalyst AI automatycznie agreguje dane i generuje draft raportu do review.',
                findings: [
                    { type: 'Transport', description: 'Copy-paste danych między 6 systemami' },
                    { type: 'Overprocessing', description: 'Ręczne tworzenie wykresów z surowych danych' },
                ],
                recommendations: [
                    { priority: 1, action: 'Wdrożenie DataAnalyst AI z API integracjami', impact: 'high' },
                ],
                estimatedSavings: 8000,
                savingsUnit: 'PLN/miesiąc',
                implementationCost: 12000,
                organizationId: org.id,
                createdById: headProd.id,
            },
        }),
        prisma.mUDAReport.create({
            data: {
                title: 'Brak standardu onboardingu nowych pracowników',
                status: MUDAStatus.OPEN,
                priority: MUDAPriority.MEDIUM,
                description: 'Każdy team lead robi onboarding po swojemu. Brak checklisty, brak pomiaru efektywności.',
                currentState: 'Nowy pracownik dostaje laptop i "porozmawiaj z kolegami". Time-to-productive: 4-6 tygodni.',
                proposedState: 'Ustandaryzowany 2-tygodniowy onboarding z checklistą, mentorem i automatycznym setup.',
                findings: [
                    { type: 'Waiting', description: 'Nowy pracownik czeka na konta, dostępy, sprzęt' },
                    { type: 'Defects', description: 'Brak wiedzy o procesach = błędy w pierwszych tygodniach' },
                ],
                estimatedSavings: 5000,
                savingsUnit: 'PLN/pracownik',
                organizationId: org.id,
                createdById: hrMgr.id,
            },
        }),
    ]);

    // ==========================================================================
    // 7. COUNCIL REQUESTS (2)
    // ==========================================================================
    console.log('🏛️ Creating Council Requests...');
    const [councilReq1, councilReq2] = await Promise.all([
        prisma.councilRequest.create({
            data: {
                title: 'Wdrożenie SalesBot AI do kwalifikacji leadów',
                type: CouncilRequestType.NEW_AGENT,
                status: CouncilRequestStatus.VOTING,
                priority: MUDAPriority.CRITICAL,
                description: 'Propozycja wdrożenia SalesBot AI do automatycznego scoringu leadów. Potencjalne oszczędności: 18k PLN/mies.',
                rationale: 'Sales team marnuje 3h/dzień na ręczną kwalifikację. SalesBot może to zrobić w 5 min z 85% accuracy.',
                impact: 'Oszczędność 60h/miesiąc. ROI < 2 miesiące. Szybszy response time = lepszy conversion rate.',
                votingDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
                organizationId: org.id,
                createdById: salesMgr.id,
            },
        }),
        prisma.councilRequest.create({
            data: {
                title: 'Standardyzacja procesu onboardingu',
                type: CouncilRequestType.NEW_SOP,
                status: CouncilRequestStatus.PENDING,
                priority: MUDAPriority.MEDIUM,
                description: 'Propozycja stworzenia SOP dla onboardingu nowych pracowników z checklistą i automatyzacją.',
                rationale: 'Obecny czas onboardingu: 4-6 tygodni. Cel: 2 tygodnie. Brak standardu powoduje frustrację i zwiększony churn w okresie próbnym.',
                impact: 'Skrócenie time-to-productive o 50%. Redukcja churn w okresie próbnym z 15% do 5%.',
                organizationId: org.id,
                createdById: hrMgr.id,
            },
        }),
    ]);

    // Council votes
    await Promise.all([
        prisma.councilVote.create({
            data: {
                requestId: councilReq1.id,
                userId: ceo.id,
                decision: VoteDecision.APPROVE,
                comment: 'Strategicznie kluczowe. Automatyzacja sprzedaży = nasz priorytet Q1.',
            },
        }),
        prisma.councilVote.create({
            data: {
                requestId: councilReq1.id,
                userId: coo.id,
                decision: VoteDecision.APPROVE,
                comment: 'Proponuję pilotaż na 50 leadach przez 2 tygodnie, zanim full rollout.',
            },
        }),
        prisma.councilVote.create({
            data: {
                requestId: councilReq1.id,
                userId: headProd.id,
                decision: VoteDecision.ABSTAIN,
                comment: 'Wstrzymuję się — zatwierdzam pod warunkiem, że SalesBot nie będzie kontaktował klientów bez human review.',
            },
        }),
    ]);

    // ==========================================================================
    // 8. ONTOLOGY ENTRIES (5)
    // ==========================================================================
    console.log('📖 Creating Ontology entries...');
    await Promise.all([
        prisma.ontologyEntry.create({
            data: {
                term: 'ICP',
                category: 'Sales',
                definition: 'Ideal Customer Profile — profil idealnego klienta DemoTech.',
                context: 'Firma 50-500 osób, branża IT/produkcja/fintech, budżet >20k PLN/mies na usługi IT.',
                examples: ['Firma produkcyjna 200 osób szukająca automatyzacji QA', 'Fintech startup 80 osób potrzebujący DevOps'],
                organizationId: org.id,
            },
        }),
        prisma.ontologyEntry.create({
            data: {
                term: 'SLA',
                category: 'Service',
                definition: 'Service Level Agreement — umowa gwarantująca poziom jakości usług.',
                context: 'DemoTech oferuje 4 poziomy SLA: Critical (<1h), High (<4h), Medium (<8h), Low (<24h).',
                organizationId: org.id,
            },
        }),
        prisma.ontologyEntry.create({
            data: {
                term: 'Burn Rate',
                category: 'Finance',
                definition: 'Miesięczne koszty operacyjne firmy. Wskaźnik "spalania" gotówki.',
                context: 'Monitorowany przez DataAnalyst AI. Alert jeśli burn rate wzrasta >10% m/m.',
                organizationId: org.id,
            },
        }),
        prisma.ontologyEntry.create({
            data: {
                term: 'CSAT',
                category: 'Quality',
                definition: 'Customer Satisfaction Score — wskaźnik zadowolenia klienta (skala 1-5).',
                context: 'Mierzony po każdym zamkniętym tickecie support. Target: >4.5/5.',
                organizationId: org.id,
            },
        }),
        prisma.ontologyEntry.create({
            data: {
                term: 'Utilization Rate',
                category: 'Operations',
                definition: 'Procent czasu pracownika poświęconego na billable work vs. overhead.',
                context: 'Target DemoTech: 75%. Poniżej 65% = alert do managera.',
                organizationId: org.id,
            },
        }),
    ]);

    // ==========================================================================
    // 9. ORGANIZATIONAL ROLES (4)
    // ==========================================================================
    console.log('👔 Creating Organizational Roles...');
    await Promise.all([
        prisma.organizationalRole.create({
            data: {
                name: 'Account Executive',
                description: 'Prowadzi cały cykl sprzedaży: discovery → oferta → negocjacje → close. Zarządza portfelem klientów.',
                raciMatrix: { [sops[0].id]: { R: true, A: true, C: false, I: false } },
                organizationId: org.id,
            },
        }),
        prisma.organizationalRole.create({
            data: {
                name: 'Support Engineer',
                description: 'Pierwsza linia wsparcia technicznego. Diagnoza, fix, komunikacja z klientem.',
                raciMatrix: { [sops[2].id]: { R: true, A: false, C: false, I: false } },
                organizationId: org.id,
            },
        }),
        prisma.organizationalRole.create({
            data: {
                name: 'Tech Lead',
                description: 'Odpowiedzialny za architekturę, code review, mentoring, technical decisions.',
                organizationId: org.id,
            },
        }),
        prisma.organizationalRole.create({
            data: {
                name: 'HR Business Partner',
                description: 'Responsible za rekrutację, onboarding, rozwój pracowników, employer branding.',
                raciMatrix: { [sops[3].id]: { R: true, A: true, C: false, I: false } },
                organizationId: org.id,
            },
        }),
    ]);

    // ==========================================================================
    // SUMMARY
    // ==========================================================================
    console.log('\n✅ DemoTech Solutions seed completed!\n');
    console.log('📊 Created:');
    console.log(`   - 1 Organization: ${org.name}`);
    console.log(`   - 4 Departments`);
    console.log(`   - 6 Users (all passwords: demo123)`);
    console.log(`   - 5 SOPs (4 Approved, 1 Draft)`);
    console.log(`   - 3 AI Agents (SalesBot, SupportBot, DataAnalyst)`);
    console.log(`   - 3 MUDA Reports (1 Critical, 1 High, 1 Medium)`);
    console.log(`   - 2 Council Requests (1 Voting, 1 Pending)`);
    console.log(`   - 5 Ontology entries`);
    console.log(`   - 4 Organizational Roles`);
    console.log('\n🔐 Demo accounts:');
    console.log('   - ceo@demotech.pl (SPONSOR)');
    console.log('   - coo@demotech.pl (PILOT)');
    console.log('   - sales@demotech.pl (MANAGER - Sales)');
    console.log('   - delivery@demotech.pl (EXPERT - Production)');
    console.log('   - hr@demotech.pl (MANAGER - HR)');
    console.log('   - dev@demotech.pl (CITIZEN_DEV)');
}

seedDemoTech()
    .catch((e) => {
        console.error('❌ DemoTech seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
