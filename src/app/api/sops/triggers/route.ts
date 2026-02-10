import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

interface TriggerSuggestion {
    text: string;
    category: string;
    frequency: number;
}

// Default trigger suggestions for common business processes
const DEFAULT_TRIGGERS: TriggerSuggestion[] = [
    // Customer Service
    { text: 'Otrzymanie zapytania od klienta', category: 'Obsługa Klienta', frequency: 100 },
    { text: 'Reklamacja produktu lub usługi', category: 'Obsługa Klienta', frequency: 90 },
    { text: 'Zgłoszenie serwisowe', category: 'Obsługa Klienta', frequency: 80 },
    { text: 'Prośba o zwrot towaru', category: 'Obsługa Klienta', frequency: 70 },

    // Sales
    { text: 'Nowe zamówienie w systemie', category: 'Sprzedaż', frequency: 100 },
    { text: 'Zapytanie ofertowe od klienta', category: 'Sprzedaż', frequency: 95 },
    { text: 'Lead zakwalifikowany do kontaktu', category: 'Sprzedaż', frequency: 85 },
    { text: 'Wniosek o rabat specjalny', category: 'Sprzedaż', frequency: 70 },

    // Finance
    { text: 'Wpłynięcie faktury do systemu', category: 'Finanse', frequency: 100 },
    { text: 'Koniec miesiąca rozliczeniowego', category: 'Finanse', frequency: 95 },
    { text: 'Przekroczenie budżetu działu', category: 'Finanse', frequency: 80 },
    { text: 'Wniosek o płatność', category: 'Finanse', frequency: 85 },

    // HR
    { text: 'Nowy pracownik w zespole', category: 'HR', frequency: 100 },
    { text: 'Wniosek urlopowy', category: 'HR', frequency: 95 },
    { text: 'Zgłoszenie L4', category: 'HR', frequency: 90 },
    { text: 'Zakończenie okresu próbnego', category: 'HR', frequency: 80 },

    // IT
    { text: 'Zgłoszenie błędu lub problemu', category: 'IT', frequency: 100 },
    { text: 'Prośba o dostęp do systemu', category: 'IT', frequency: 90 },
    { text: 'Incydent bezpieczeństwa', category: 'IT', frequency: 85 },
    { text: 'Wdrożenie nowej funkcjonalności', category: 'IT', frequency: 75 },

    // Operations
    { text: 'Rozpoczęcie nowego projektu', category: 'Operacje', frequency: 100 },
    { text: 'Zmiana w harmonogramie produkcji', category: 'Operacje', frequency: 85 },
    { text: 'Odbiór dostawy materiałów', category: 'Operacje', frequency: 90 },
    { text: 'Kontrola jakości produktu', category: 'Operacje', frequency: 80 },

    // Management
    { text: 'Spotkanie statusowe zespołu', category: 'Zarządzanie', frequency: 100 },
    { text: 'Eskalacja problemu', category: 'Zarządzanie', frequency: 90 },
    { text: 'Zmiana w regulacjach prawnych', category: 'Zarządzanie', frequency: 75 },
    { text: 'Przegląd kwartalny', category: 'Zarządzanie', frequency: 70 },

    // Marketing
    { text: 'Planowanie kampanii marketingowej', category: 'Marketing', frequency: 90 },
    { text: 'Zapytanie o materiały promocyjne', category: 'Marketing', frequency: 80 },
    { text: 'Wniosek o publikację treści', category: 'Marketing', frequency: 85 },
    { text: 'Analiza wyników kampanii', category: 'Marketing', frequency: 75 },

    // Logistics
    { text: 'Wniosek o wysyłkę towaru', category: 'Logistyka', frequency: 100 },
    { text: 'Niski stan magazynowy', category: 'Logistyka', frequency: 90 },
    { text: 'Zwrot towaru od klienta', category: 'Logistyka', frequency: 85 },
    { text: 'Rozbieżność w inwentaryzacji', category: 'Logistyka', frequency: 70 },

    // Production
    { text: 'Zlecenie produkcyjne', category: 'Produkcja', frequency: 100 },
    { text: 'Awaria maszyny', category: 'Produkcja', frequency: 95 },
    { text: 'Zmiana specyfikacji produktu', category: 'Produkcja', frequency: 80 },
    { text: 'Zakończenie serii produkcyjnej', category: 'Produkcja', frequency: 75 },
];

export async function GET(request: Request) {
    try {
        const session = await getSession();

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Nieautoryzowany dostęp' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const department = searchParams.get('department');
        const role = searchParams.get('role');
        const search = searchParams.get('search');

        // Get organization-specific triggers from existing SOPs
        const organizationId = session.user.organizationId;
        let orgTriggers: TriggerSuggestion[] = [];

        if (organizationId) {
            try {
                const sops = await prisma.sOP.findMany({
                    where: { organizationId },
                    select: {
                        scope: true,
                        department: {
                            select: { name: true }
                        }
                    },
                    take: 50,
                });

                // Extract triggers from scope JSON
                sops.forEach(sop => {
                    try {
                        const scope = typeof sop.scope === 'string'
                            ? JSON.parse(sop.scope)
                            : sop.scope;

                        if (scope?.trigger) {
                            orgTriggers.push({
                                text: scope.trigger,
                                category: sop.department?.name || 'Ogólne',
                                frequency: 50, // Lower priority than defaults
                            });
                        }
                    } catch {
                        // Skip invalid scope
                    }
                });
            } catch (error) {
                console.error('Error fetching org triggers:', error);
            }
        }

        // Combine default and organization triggers
        let allTriggers = [...DEFAULT_TRIGGERS, ...orgTriggers];

        // Filter by department if provided
        if (department) {
            const deptTriggers = allTriggers.filter(
                t => t.category.toLowerCase() === department.toLowerCase() ||
                    t.category === 'Zarządzanie' // Always include management triggers
            );
            if (deptTriggers.length > 0) {
                allTriggers = deptTriggers;
            }
        }

        // Filter by search term
        if (search) {
            allTriggers = allTriggers.filter(
                t => t.text.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Sort by frequency and deduplicate
        const uniqueTriggers = allTriggers
            .sort((a, b) => b.frequency - a.frequency)
            .filter((t, i, arr) =>
                arr.findIndex(x => x.text.toLowerCase() === t.text.toLowerCase()) === i
            )
            .slice(0, 20);

        return NextResponse.json({
            triggers: uniqueTriggers,
            department: department || null,
        });
    } catch (error) {
        console.error('Error fetching triggers:', error);
        return NextResponse.json(
            { error: 'Błąd pobierania wyzwalaczy' },
            { status: 500 }
        );
    }
}
