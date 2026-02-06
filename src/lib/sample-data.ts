// Sample data for development and testing
// This module provides mock data for SOPs and Agents

import type { SOP } from './types';

// Mock SOP data
export const mockSOPs: SOP[] = [
    {
        id: 'sop-001',
        meta: {
            process_name: 'Obsługa Zapytania Klienta',
            department: 'Sprzedaż',
            role: 'Konsultant Sprzedaży',
            owner: 'Anna Kowalska',
            version: '2.1',
            created_date: '2025-01-15',
            updated_date: '2026-01-28',
            estimated_time: '15 min'
        },
        purpose: 'Zapewnienie szybkiej i profesjonalnej obsługi każdego zapytania klienta',
        scope: {
            trigger: 'Nowe zapytanie od klienta (email, formularz, telefon)',
            outcome: 'Kompletna odpowiedź wysłana do klienta'
        },
        prerequisites: {
            systems: ['CRM', 'Email', 'Cennik'],
            data_required: ['Dane kontaktowe klienta', 'Opis zapytania']
        },
        knowledge_base: {
            documents: [
                { name: 'Cennik produktów', url: '/docs/cennik.pdf' },
                { name: 'FAQ klientów', url: '/docs/faq.pdf' }
            ],
            quality_checklist: ['Sprawdź dostępność produktów', 'Użyj szablonu odpowiedzi'],
            golden_standard: 'Odpowiedź w ciągu 4h z personalizowaną ofertą',
            warnings: ['Nie podawaj cen promocyjnych bez weryfikacji'],
            naming_convention: 'ZAP-YYYY-MM-XXX'
        },
        steps: [
            {
                id: 1,
                name: 'Odbiór zapytania',
                actions: ['Otwórz CRM', 'Sprawdź nowe zapytania', 'Sklasyfikuj priorytet'],
                tool: 'CRM'
            },
            {
                id: 2,
                name: 'Analiza potrzeb klienta',
                actions: ['Przeczytaj zapytanie', 'Zidentyfikuj produkty', 'Sprawdź historię klienta'],
                tool: 'CRM'
            },
            {
                id: 3,
                name: 'Przygotowanie oferty',
                actions: ['Wybierz produkty z cennika', 'Zastosuj rabaty', 'Wygeneruj PDF'],
                tool: 'Generator Ofert'
            },
            {
                id: 4,
                name: 'Wysłanie odpowiedzi',
                actions: ['Użyj szablonu email', 'Dołącz ofertę PDF', 'Ustaw przypomnienie follow-up'],
                tool: 'Email'
            }
        ],
        troubleshooting: [
            { problem: 'Brak ceny produktu', solution: 'Skontaktuj się z działem produktu' },
            { problem: 'Klient na czarnej liście', solution: 'Eskaluj do managera' }
        ],
        definition_of_done: [
            'Oferta wysłana do klienta',
            'Wpis w CRM zaktualizowany',
            'Przypomnienie follow-up ustawione'
        ],
        metrics: {
            frequency_per_day: 15,
            avg_time_min: 12,
            people_count: 5
        },
        dictionary_candidates: [
            { term: 'Lead', context: 'Potencjalny klient przed kwalifikacją' },
            { term: 'Oferta', context: 'Dokument cenowy z warunkami handlowymi' }
        ],
        exceptions: [
            { condition: 'Zapytanie o produkt premium', action: 'Przekaż do Senior Konsultanta' }
        ],
        status: 'completed'
    },
    {
        id: 'sop-002',
        meta: {
            process_name: 'Onboarding Nowego Pracownika',
            department: 'HR',
            role: 'HR Specialist',
            owner: 'Maria Nowak',
            version: '1.5',
            created_date: '2025-03-01',
            updated_date: '2026-01-20',
            estimated_time: '3 dni'
        },
        purpose: 'Efektywne wdrożenie nowego pracownika do organizacji',
        scope: {
            trigger: 'Podpisanie umowy przez nowego pracownika',
            outcome: 'Pracownik ma dostęp do wszystkich systemów i wie jak pracować'
        },
        prerequisites: {
            systems: ['HRMS', 'Active Directory', 'Slack'],
            data_required: ['Dane osobowe', 'Stanowisko', 'Manager']
        },
        knowledge_base: {
            documents: [
                { name: 'Handbook pracownika', url: '/docs/handbook.pdf' },
                { name: 'Polityka IT', url: '/docs/it-policy.pdf' }
            ],
            quality_checklist: ['Wszystkie dostępy nadane', 'Szkolenie BHP ukończone'],
            golden_standard: 'Pełna produktywność w 10 dni roboczych',
            warnings: ['Nie nadawaj dostępów przed weryfikacją tożsamości'],
            naming_convention: 'ONB-YYYY-MM-XXX'
        },
        steps: [
            {
                id: 1,
                name: 'Przygotowanie stanowiska',
                actions: ['Zamów laptop', 'Przygotuj biurko', 'Zamów identyfikator'],
                tool: 'HRMS'
            },
            {
                id: 2,
                name: 'Nadanie dostępów',
                actions: ['Utwórz konto AD', 'Dodaj do grup', 'Nadaj dostępy do aplikacji'],
                tool: 'Active Directory'
            }
        ],
        troubleshooting: [
            { problem: 'Sprzęt niedostępny', solution: 'Użyj sprzętu zastępczego' }
        ],
        definition_of_done: [
            'Pracownik ma dostęp do wszystkich systemów',
            'Szkolenie wstępne ukończone',
            'Manager potwierdził gotowość'
        ],
        metrics: {
            frequency_per_day: 0.3,
            avg_time_min: 480,
            people_count: 3
        },
        dictionary_candidates: [
            { term: 'Onboarding', context: 'Proces wdrażania nowego pracownika' }
        ],
        exceptions: [
            { condition: 'Pracownik zdalny', action: 'Wyślij sprzęt kurierem' }
        ],
        status: 'audited'
    },
    {
        id: 'sop-003',
        meta: {
            process_name: 'Zamknięcie Miesiąca Finansowego',
            department: 'Finanse',
            role: 'Księgowy',
            owner: 'Piotr Wiśniewski',
            version: '3.0',
            created_date: '2024-06-01',
            updated_date: '2026-01-05',
            estimated_time: '2 dni'
        },
        purpose: 'Terminowe i dokładne zamknięcie miesiąca księgowego',
        scope: {
            trigger: 'Ostatni dzień roboczy miesiąca',
            outcome: 'Zweryfikowane księgi i raporty finansowe'
        },
        prerequisites: {
            systems: ['ERP', 'Bank', 'Excel'],
            data_required: ['Wyciągi bankowe', 'Faktury', 'Zestawienia']
        },
        knowledge_base: {
            documents: [
                { name: 'Procedury księgowe', url: '/docs/accounting.pdf' }
            ],
            quality_checklist: ['Wszystkie faktury zaksięgowane', 'Uzgodnienie bankowe'],
            golden_standard: 'Zero różnic w uzgodnieniach',
            warnings: ['Nie zamykaj miesiąca bez weryfikacji VAT'],
            naming_convention: 'FIN-YYYY-MM'
        },
        steps: [
            {
                id: 1,
                name: 'Zbieranie dokumentów',
                actions: ['Pobierz wyciągi bankowe', 'Sprawdź otrzymane faktury'],
                tool: 'ERP'
            }
        ],
        troubleshooting: [
            { problem: 'Brakująca faktura', solution: 'Skontaktuj się z dostawcą' }
        ],
        definition_of_done: [
            'Wszystkie dokumenty zaksięgowane',
            'Uzgodnienia bankowe zamknięte',
            'Raport wysłany do zarządu'
        ],
        metrics: {
            frequency_per_day: 0.05,
            avg_time_min: 960,
            people_count: 2
        },
        dictionary_candidates: [],
        exceptions: [],
        status: 'generated'
    }
];

// Extended Agent interface for UI display
export interface AgentDisplay {
    id: string;
    name: string;
    role: string;
    model?: string;
    sops?: string[];
    integrations?: string[];
    microAgents?: { name: string; trigger: string }[];
    prompt?: {
        system?: string;
    };
}

// Mock Agents data
export const mockAgents: AgentDisplay[] = [
    {
        id: 'agent-001',
        name: 'SalesBot',
        role: 'Asystent Sprzedaży',
        model: 'GPT-4o',
        sops: ['sop-001'],
        integrations: ['CRM', 'Email', 'Calendar'],
        microAgents: [
            { name: 'LeadQualifier', trigger: 'Nowy lead w systemie' },
            { name: 'OfferGenerator', trigger: 'Zapytanie o ofertę' }
        ],
        prompt: {
            system: `Jesteś SalesBot - inteligentnym asystentem sprzedaży dla firmy VantageOS.

## Twoja Rola
Wspierasz zespół sprzedaży w obsłudze zapytań klientów, generowaniu ofert i follow-upach.

## Cele
1. Szybka klasyfikacja leadów (A/B/C)
2. Personalizacja komunikacji na podstawie historii klienta
3. Generowanie ofert zgodnych z cennikiem i polityką rabatową

## Ograniczenia
- Maksymalny rabat bez eskalacji: 15%
- Nie podawaj informacji poufnych o innych klientach
- Zawsze weryfikuj dostępność produktów przed ofertą

## Ton komunikacji
Profesjonalny, ale przyjazny. Używaj języka polskiego z elementami branżowymi.`
        }
    },
    {
        id: 'agent-002',
        name: 'HROnboarder',
        role: 'Asystent HR',
        model: 'Claude 3.5',
        sops: ['sop-002'],
        integrations: ['HRMS', 'Slack', 'Google Workspace'],
        microAgents: [
            { name: 'AccessManager', trigger: 'Nowy pracownik' },
            { name: 'WelcomeMessenger', trigger: 'Pierwszy dzień pracy' }
        ],
        prompt: {
            system: `Jesteś HROnboarder - asystentem wspierającym wdrażanie nowych pracowników.

## Twoja Rola
Automatyzujesz i wspierasz proces onboardingu od podpisania umowy do pełnej produktywności.

## Cele
1. Koordynacja przygotowania stanowiska pracy
2. Zarządzanie dostępami do systemów
3. Przypominanie o szkoleniach i deadlinach

## Workflow
1. Odbierz dane nowego pracownika
2. Wygeneruj checklistę onboardingową
3. Koordynuj z IT, Facilities i Managerem
4. Monitoruj postępy i wysyłaj przypomnienia`
        }
    },
    {
        id: 'agent-003',
        name: 'FinanceBot',
        role: 'Asystent Finansowy',
        model: 'GPT-4o-mini',
        sops: ['sop-003'],
        integrations: ['ERP', 'Bank', 'Excel'],
        microAgents: [
            { name: 'InvoiceProcessor', trigger: 'Nowa faktura' },
            { name: 'ReconciliationBot', trigger: 'Koniec dnia' }
        ],
        prompt: {
            system: `Jesteś FinanceBot - asystentem wspierającym procesy księgowe.

## Twoja Rola
Automatyzujesz rutynowe zadania księgowe i wspierasz zamknięcie miesiąca.

## Cele
1. Automatyczne księgowanie standardowych faktur
2. Przygotowanie uzgodnień bankowych
3. Generowanie raportów finansowych

## Ograniczenia
- Nie wykonuj płatności powyżej 10,000 PLN bez autoryzacji
- Zawsze weryfikuj numery kont bankowych
- Eskaluj nietypowe transakcje do Głównego Księgowego`
        }
    }
];

// Helper function to get SOP by ID
export function getSOPById(id: string): SOP | undefined {
    return mockSOPs.find(sop => sop.id === id);
}

// Helper function to get Agent by ID
export function getAgentById(id: string): AgentDisplay | undefined {
    return mockAgents.find(agent => agent.id === id);
}

// Helper function to get SOPs for an Agent
export function getSOPsForAgent(agentId: string): SOP[] {
    const agent = getAgentById(agentId);
    if (!agent || !agent.sops) return [];
    return agent.sops.map(sopId => getSOPById(sopId)).filter((sop): sop is SOP => sop !== undefined);
}
