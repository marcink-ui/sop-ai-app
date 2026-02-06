// AI Service - Simulated AI responses for testing without real AI connection
// This allows VantageOS to be tested and demonstrated without Antigravity

import { SOP, SOPStep, MasterPrompt } from './types';
import { generateId } from './db';

// Simulated delay to feel realistic
const simulateDelay = (ms: number = 1500) => new Promise(resolve => setTimeout(resolve, ms));

// Types for AI service
export interface AIGenerateSOP {
    processName: string;
    department: string;
    role: string;
    trigger: string;
    outcome: string;
    transcript: string;
}

export interface AIAuditResult {
    overallScore: number;
    mudaTypes: {
        type: string;
        count: number;
        description: string;
        severity: 'low' | 'medium' | 'high';
    }[];
    recommendations: string[];
    automationPotential: number;
    estimatedSavings: string;
}

export interface AIAgentArchitecture {
    agents: {
        name: string;
        description: string;
        triggerCondition: string;
        capabilities: string[];
        integrations: string[];
        permissions: string[];
    }[];
    orchestrationNotes: string;
}

export interface AIChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

// ----------------------
// SOP Generation
// ----------------------

export async function generateSOPFromTranscript(input: AIGenerateSOP): Promise<SOP> {
    await simulateDelay(2000);

    const steps = extractStepsFromTranscript(input.transcript);

    const sop: SOP = {
        id: generateId(),
        meta: {
            process_name: input.processName,
            department: input.department,
            role: input.role,
            owner: 'System',
            version: '1.0',
            created_date: new Date().toISOString(),
            updated_date: new Date().toISOString(),
            estimated_time: '30 minut',
        },
        purpose: `Automatyzacja procesu ${input.processName}`,
        scope: {
            trigger: input.trigger,
            outcome: input.outcome,
        },
        prerequisites: {
            systems: ['System ERP', 'Email'],
            data_required: ['Dane wejściowe procesu'],
        },
        knowledge_base: {
            documents: [],
            quality_checklist: ['Sprawdź kompletność danych'],
            golden_standard: 'Zgodność z polityką firmy',
            warnings: [],
            naming_convention: 'PROC-XXX',
        },
        steps: steps,
        troubleshooting: [],
        definition_of_done: ['Proces zakończony', 'Dokumentacja uzupełniona'],
        metrics: {
            frequency_per_day: 5,
            avg_time_min: 30,
            people_count: 1,
        },
        dictionary_candidates: [],
        exceptions: [],
        status: 'generated',
    };

    return sop;
}

function extractStepsFromTranscript(transcript: string): SOPStep[] {
    // Simple extraction based on sentences
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const steps: SOPStep[] = [];

    // Group sentences into steps (roughly 2-3 sentences per step)
    const stepCount = Math.min(Math.ceil(sentences.length / 2), 8);

    for (let i = 0; i < stepCount; i++) {
        const startIdx = i * 2;
        const endIdx = Math.min(startIdx + 2, sentences.length);
        const stepSentences = sentences.slice(startIdx, endIdx);

        if (stepSentences.length === 0) continue;

        steps.push({
            id: i + 1,
            name: generateStepTitle(stepSentences[0]),
            actions: stepSentences.map(s => s.trim()),
            tool: extractToolFromText(stepSentences.join(' ')),
        });
    }

    // Ensure at least 3 steps
    while (steps.length < 3) {
        steps.push({
            id: steps.length + 1,
            name: `Weryfikacja i finalizacja`,
            actions: ['Sprawdź dokumentację', 'Potwierdź zakończenie'],
            tool: undefined,
        });
    }

    return steps;
}

function generateStepTitle(sentence: string): string {
    const words = sentence.trim().split(/\s+/).slice(0, 4);
    return words.join(' ').substring(0, 40) + (words.length > 4 ? '...' : '');
}

function extractToolFromText(text: string): string | undefined {
    const toolKeywords = [
        { keyword: 'excel', tool: 'Microsoft Excel' },
        { keyword: 'email', tool: 'Email' },
        { keyword: 'mail', tool: 'Email' },
        { keyword: 'system', tool: 'System ERP' },
        { keyword: 'telefon', tool: 'Telefon' },
        { keyword: 'formularz', tool: 'Formularz online' },
        { keyword: 'dokument', tool: 'Dokumenty' },
        { keyword: 'podpis', tool: 'System podpisów' },
    ];

    const lowerText = text.toLowerCase();

    for (const { keyword, tool } of toolKeywords) {
        if (lowerText.includes(keyword)) {
            return tool;
        }
    }

    return undefined;
}

// ----------------------
// MUDA Audit
// ----------------------

export async function auditSOPForMuda(sop: SOP): Promise<AIAuditResult> {
    await simulateDelay(2500);

    const mudaTypes = [
        { type: 'Nadprodukcja', description: 'Tworzenie więcej niż potrzeba', severity: 'medium' as const },
        { type: 'Oczekiwanie', description: 'Przestoje między krokami', severity: 'high' as const },
        { type: 'Transport', description: 'Zbędne przemieszczanie dokumentów', severity: 'low' as const },
        { type: 'Nadmierne przetwarzanie', description: 'Dodatkowe, niepotrzebne kroki', severity: 'medium' as const },
        { type: 'Zapasy', description: 'Gromadzenie zadań do przetworzenia', severity: 'low' as const },
        { type: 'Ruch', description: 'Zbędne czynności manualne', severity: 'medium' as const },
        { type: 'Defekty', description: 'Błędy wymagające poprawek', severity: 'high' as const },
    ];

    // Randomly select 2-4 MUDA types with counts
    const selectedMuda = mudaTypes
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 3) + 2)
        .map(m => ({
            ...m,
            count: Math.floor(Math.random() * 5) + 1,
        }));

    const totalIssues = selectedMuda.reduce((sum, m) => sum + m.count, 0);
    const overallScore = Math.max(20, 100 - (totalIssues * 8));
    const automationPotential = Math.min(95, 40 + ((sop.steps?.length || 0) * 5) + Math.random() * 20);

    const recommendations = [
        'Zautomatyzuj powtarzalne czynności przy użyciu AI agenta',
        'Zredukuj czas oczekiwania między krokami',
        'Wprowadź walidację danych na wejściu',
        'Ustandaryzuj format dokumentów',
        'Wyeliminuj manualne kopiowanie danych',
    ].slice(0, Math.min(5, Math.ceil(totalIssues / 2)));

    return {
        overallScore: Math.round(overallScore),
        mudaTypes: selectedMuda,
        recommendations,
        automationPotential: Math.round(automationPotential),
        estimatedSavings: `${Math.round(automationPotential * 0.4)} godzin/miesiąc`,
    };
}

// ----------------------
// AI Agent Architecture
// ----------------------

export async function architectAgentFromSOP(sop: SOP, mudaResult?: AIAuditResult): Promise<AIAgentArchitecture> {
    await simulateDelay(2000);

    const processName = sop.meta.process_name;
    const department = sop.meta.department;

    const agents = [
        {
            name: `Agent ${processName.split(' ').slice(0, 2).join(' ')}`,
            description: `Główny agent odpowiedzialny za automatyzację procesu "${processName}" w dziale ${department}.`,
            triggerCondition: sop.scope?.trigger || 'Na żądanie użytkownika',
            capabilities: [
                'Analiza dokumentów wejściowych',
                'Generowanie raportów',
                'Komunikacja z interesariuszami',
                'Walidacja danych',
            ],
            integrations: ['Email', 'System ERP', 'Kalendarz', 'Dokumenty'],
            permissions: ['Odczyt danych', 'Zapis raportów', 'Wysyłka powiadomień'],
        },
    ];

    // Add sub-agents for complex processes
    const stepCount = sop.steps?.length || 0;
    if (stepCount > 4) {
        agents.push({
            name: `Agent Walidacji`,
            description: 'Mikroagent odpowiedzialny za weryfikację poprawności danych i dokumentów.',
            triggerCondition: 'Po otrzymaniu danych wejściowych',
            capabilities: ['Sprawdzanie kompletności', 'Walidacja formatów', 'Wykrywanie anomalii'],
            integrations: ['System ERP', 'Baza danych'],
            permissions: ['Odczyt danych'],
        });
    }

    if (mudaResult && mudaResult.automationPotential > 60) {
        agents.push({
            name: `Agent Raportowania`,
            description: 'Mikroagent generujący raporty i powiadomienia dla interesariuszy.',
            triggerCondition: 'Po zakończeniu procesu',
            capabilities: ['Generowanie raportów', 'Wysyłka powiadomień', 'Archiwizacja'],
            integrations: ['Email', 'Teams', 'Dokumenty'],
            permissions: ['Wysyłka powiadomień', 'Zapis dokumentów'],
        });
    }

    return {
        agents,
        orchestrationNotes: `Agenci działają sekwencyjnie. ${agents[0].name} koordynuje pozostałe mikroagenty. Proces uruchamiany jest automatycznie przy: "${sop.scope?.trigger || 'na żądanie'}".`,
    };
}

// ----------------------
// Chat Interface
// ----------------------

export async function chatWithAI(
    messages: AIChatMessage[],
    context: { sop?: SOP; mode: 'refine' | 'create' | 'general' }
): Promise<string> {
    await simulateDelay(1000);

    const lastMessage = messages[messages.length - 1]?.content.toLowerCase() || '';

    // Context-aware responses
    if (context.mode === 'refine' && context.sop) {
        if (lastMessage.includes('dodaj') || lastMessage.includes('add')) {
            return `Dobrze, dodam nowy krok do procedury "${context.sop.meta.process_name}". Jaki dokładnie krok chcesz dodać? Opisz go szczegółowo.`;
        }
        if (lastMessage.includes('usuń') || lastMessage.includes('delete')) {
            return `Rozumiem, że chcesz usunąć element z procedury. Który krok lub element chcesz usunąć? Mamy ${context.sop.steps?.length || 0} kroków.`;
        }
        if (lastMessage.includes('zmień') || lastMessage.includes('modyfikuj') || lastMessage.includes('popraw')) {
            return `Oczywiście, mogę zmodyfikować procedurę. Wskaż, który krok chcesz zmienić i opisz pożądane zmiany.`;
        }
        if (lastMessage.includes('ok') || lastMessage.includes('akceptuj') || lastMessage.includes('zatwierdź')) {
            return `Świetnie! Procedura "${context.sop.meta.process_name}" została zatwierdzona. Możesz teraz przejść do audytu MUDA lub generacji agenta AI.`;
        }
    }

    if (context.mode === 'create') {
        if (lastMessage.includes('procedura') || lastMessage.includes('proces')) {
            return `Rozumiem, że chcesz utworzyć nową procedurę. Opisz szczegółowo:\n\n1. **Nazwa procesu** - jak nazywa się ten proces?\n2. **Dział** - który dział jest odpowiedzialny?\n3. **Rola** - kto wykonuje ten proces?\n4. **Wyzwalacz** - co uruchamia ten proces?\n5. **Oczekiwany rezultat** - jaki jest efekt końcowy?\n\nLub opisz cały proces słowami, a ja go zorganizuję w strukturę SOP.`;
        }
    }

    // General helpful responses
    const helpfulResponses = [
        'Jestem tutaj, aby pomóc Ci w tworzeniu i optymalizacji procedur. Co chciałbyś zrobić?',
        'Mogę pomóc Ci:\n- Utworzyć nową procedurę SOP\n- Zoptymalizować istniejący proces\n- Przeprowadzić audyt MUDA\n- Zaprojektować agenta AI\n\nW czym mogę pomóc?',
        'Opisz mi swój proces, a pomogę Ci go ustrukturyzować. Im więcej szczegółów podasz, tym lepsza będzie procedura.',
        'Rozumiem. Czy mogę prosić o więcej szczegółów? To pomoże mi lepiej zrozumieć Twoje potrzeby.',
    ];

    return helpfulResponses[Math.floor(Math.random() * helpfulResponses.length)];
}

// ----------------------
// Prompt Generation
// ----------------------

export async function generateMasterPrompt(agentArchitecture: AIAgentArchitecture, sop: SOP): Promise<MasterPrompt[]> {
    await simulateDelay(1500);

    return agentArchitecture.agents.map((agent) => ({
        id: generateId(),
        agent_spec_id: '',
        meta: {
            agent_name: agent.name,
            version: '1.0',
            created_date: new Date().toISOString(),
            author: 'AI Generator',
            source_sop: sop.meta.process_name,
            prompt_type: 'system' as const,
        },
        sections: [
            {
                id: generateId(),
                name: 'Rola',
                content: `Jesteś ${agent.name}, asystentem AI odpowiedzialnym za: ${agent.description}`,
            },
            {
                id: generateId(),
                name: 'Kontekst',
                content: `Proces: ${sop.meta.process_name}, Dział: ${sop.meta.department}`,
            },
            {
                id: generateId(),
                name: 'Możliwości',
                content: agent.capabilities.join(', '),
            },
        ],
        full_prompt: `# ${agent.name}

## Rola
Jesteś ${agent.name}, asystentem AI odpowiedzialnym za: ${agent.description}

## Kontekst procesu
- **Proces**: ${sop.meta.process_name}
- **Dział**: ${sop.meta.department}
- **Wyzwalacz**: ${agent.triggerCondition}

## Twoje możliwości
${agent.capabilities.map(c => `- ${c}`).join('\n')}

## Integracje
Masz dostęp do: ${agent.integrations.join(', ')}.

## Uprawnienia
${agent.permissions.map(p => `- ${p}`).join('\n')}

## Instrukcje
1. Zawsze działaj zgodnie z procedurą "${sop.meta.process_name}"
2. Weryfikuj dane przed ich przetworzeniem
3. Dokumentuj wszystkie podjęte działania
4. W przypadku wątpliwości, eskaluj do człowieka

## Styl komunikacji
- Profesjonalny ale przyjazny
- Konkretny i zwięzły
- Używaj języka polskiego
`,
    }));
}
