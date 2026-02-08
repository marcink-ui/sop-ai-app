// =====================================
// VantageOS Wiki Knowledge Base
// =====================================
// Searchable knowledge base for AI Chat — enriches responses with Wiki content

export interface WikiArticle {
    id: string;
    title: string;
    category: string;
    keywords: string[];
    content: string;
    link: string;
}

export const WIKI_KNOWLEDGE_BASE: WikiArticle[] = [
    // ====== METODOLOGIA ======
    {
        id: 'lean-ai-manifest',
        title: 'Manifest Lean AI 3.3',
        category: 'Metodologia',
        keywords: ['lean', 'manifest', 'metodologia', 'transformacja', 'ai', 'manifest 3.3', 'zasady'],
        content: `Manifest Lean AI 3.3 to fundament VantageOS. Definiuje 5-etapowy pipeline transformacji:
        
**Step 1: Discover** — Identyfikacja procesów w organizacji, mapowanie SOPów.
**Step 2: Analyze** — Analiza MUDA (marnotrawstwa), identyfikacja kandydatów do automatyzacji.
**Step 3: Design** — Projektowanie AI Agentów, Master Prompts, integracje (MCPs).
**Step 4: Deploy** — Wdrożenie agentów, szkolenie użytkowników, pilotaż.
**Step 5: Optimize** — Monitoring, optymalizacja, iteracja, skalowanie.

Kluczowe zasady:
- Każdy proces musi mieć SOP zanim dostanie AI Agenta
- Agent AI nie zastępuje ludzi — wspiera ich i automatyzuje powtarzalne zadania
- Transformacja jest iteracyjna, nie big-bang
- Council (Rada) zatwierdza zmiany — governance jest wbudowane`,
        link: '/resources/wiki/soul',
    },
    {
        id: 'muda-analysis',
        title: 'MUDA — 7 rodzajów marnotrawstwa',
        category: 'Metodologia',
        keywords: ['muda', 'marnotrawstwo', 'lean', 'waste', 'transport', 'inventory', 'motion', 'waiting', 'overproduction', 'overprocessing', 'defects', 'analiza'],
        content: `MUDA to japońskie słowo oznaczające "marnotrawstwo". W Lean identyfikujemy 7 typów:

1. **Transport** — zbędne przenoszenie danych między systemami (np. kopiowanie z maila do CRM ręcznie)
2. **Inventory** — gromadzenie nieużywanych danych/raportów (np. raporty których nikt nie czyta)
3. **Motion** — zbędne ruchy użytkowników w systemach (zbyt dużo kliknięć)
4. **Waiting** — oczekiwanie na decyzje, dane, odpowiedzi (np. czekanie na podpis managera)
5. **Overproduction** — tworzenie więcej niż potrzeba (np. nadmiar raportów)
6. **Overprocessing** — nadmierne przetwarzanie (np. ręczna weryfikacja tego co AI może sprawdzić)
7. **Defects** — błędy wymagające poprawek (np. błędnie wypełnione formularze)

W VantageOS każdy raport MUDA ma:
- Priorytet (Critical, High, Medium, Low)
- Przypisany SOP i dział
- Kandydat do automatyzacji AI (tak/nie)
- Szacowany czas oszczędności`,
        link: '/muda',
    },
    {
        id: 'sop-structure',
        title: 'Struktura SOP w VantageOS',
        category: 'Metodologia',
        keywords: ['sop', 'procedura', 'standard', 'operacyjny', 'kroki', 'step', 'workflow', 'proces'],
        content: `SOP (Standard Operating Procedure) w VantageOS ma następującą strukturę:

**Metadane:**
- Tytuł i opis
- Cel (Purpose)
- Zakres (Scope)
- Właściciel procesu
- Status: Draft → Active → Under Review → Archived
- Wersja (auto-increment)

**Kroki (Steps):**
Każdy krok zawiera:
- Numer porządkowy
- Rola wykonawcy (kto)
- Trigger (co uruchamia krok)
- Akcje (co robić)
- Narzędzie (jakie tool/system)
- Output (oczekiwany rezultat)
- Czas trwania

**Gotowość do AI:**
- SOP z jasnymi triggerami → łatwy do automatyzacji
- SOP z subiektywnymi decyzjami → wymaga ASSISTANT, nie AUTOMATION
- SOP z wieloma krokami ręcznymi → kandydat do MUDA analizy`,
        link: '/sops',
    },
    // ====== AGENCI ======
    {
        id: 'agent-types',
        title: 'Typy Agentów AI w VantageOS',
        category: 'Agenci',
        keywords: ['agent', 'assistant', 'automation', 'orchestrator', 'typ', 'rodzaj', 'bot', 'ai'],
        content: `VantageOS rozróżnia 4 typy agentów AI:

**ASSISTANT** 🧠 — Prompt + wiedza. Odpowiada na pytania, tłumaczy, pomaga.
- Nie podejmuje akcji samodzielnie
- Przykład: ChatBot Q&A, tłumacz dokumentów, analityk danych

**AGENT** 🤖 — Prompt + wiedza + AKCJE. Może modyfikować dane, wysyłać maile.
- Samodzielnie wykonuje zadania w ramach uprawnień
- Przykład: SalesBot (kwalifikuje leady), SupportBot (kategoryzuje zgłoszenia)

**ORCHESTRATOR** 🎯 — Koordynuje innych agentów. Decyduje kto co robi.
- Nie wykonuje sam — deleguje do AGENT/ASSISTANT
- Przykład: Dispatch Agent, Workflow Manager

**AUTOMATION** ⚙️ — Zero AI. Skrypt, formuła, cron job. 100% deterministyczny.
- Nie używa modeli AI
- Przykład: Auto-backup, Zapier-like trigger, walidacja formularzy`,
        link: '/agents',
    },
    {
        id: 'master-prompt',
        title: 'Master Prompt — jak go tworzyć',
        category: 'Agenci',
        keywords: ['prompt', 'master prompt', 'instrukcja', 'system prompt', 'konfiguracja', 'agenta'],
        content: `Master Prompt to kluczowa specyfikacja AI Agenta w VantageOS. Struktura:

## ROLA
"Jesteś [nazwa roli], odpowiedzialnym za [zakres]."

## KONTEKST
- Organizacja i jej branża
- Procesy (SOPy) przypisane do agenta
- Dostępne narzędzia (MCPs, API)

## ZASADY
1. Tonacja komunikacji
2. Granice autonomii (co może robić sam, co wymaga zatwierdzenia)
3. Eskalacja — kiedy przekazać do człowieka

## WORKFLOW
Opis przepływu pracy krok po kroku.

## FORMAT ODPOWIEDZI
Jak agent formatuje output (JSON, markdown, tekst).

Dobre praktyki:
- Prompt powinien mieć 500–2000 słów
- Zawierać przykłady input/output
- Definiować edge cases
- Być specyficzny dla branży klienta`,
        link: '/agents',
    },
    // ====== GOVERNANCE ======
    {
        id: 'council-governance',
        title: 'Rada (Council) — governance transformacji',
        category: 'Governance',
        keywords: ['council', 'rada', 'governance', 'głosowanie', 'zatwierdzanie', 'wniosek', 'sponsor', 'pilot'],
        content: `Council (Rada) to mechanizm governance w VantageOS:

**Role w Council:**
- **Sponsor** — CEO/Decision maker. Ostateczne zatwierdzenie.
- **Pilot** — COO/Project lead. Prowadzi transformację operacyjnie.
- **Manager** — Kierownik zespołu. Zgłasza potrzeby, głosuje.
- **Expert** — Specjalista dziedzinowy. Doradza, ocenia technicznie.
- **Citizen Developer** — Użytkownik końcowy. Zgłasza pomysły, testuje.

**Typy wniosków:**
- Nowy SOP
- Modyfikacja istniejącego SOP
- Nowy Agent AI
- Zmiana uprawnień
- Wniosek o automatyzację

**Przepływ:**
1. Citizen Dev zgłasza wniosek
2. Manager/Expert ocenia i głosuje
3. Pilot moderuje dyskusję
4. Sponsor zatwierdza lub odrzuca
5. Implementacja (Step 4: Deploy)`,
        link: '/council',
    },
    // ====== VALUE CHAIN ======
    {
        id: 'value-chain-mapping',
        title: 'Łańcuch Wartości — mapowanie procesów',
        category: 'Value Chain',
        keywords: ['value chain', 'łańcuch', 'wartości', 'mapa', 'proces', 'workflow', 'whiteboard', 'node'],
        content: `Value Chain w VantageOS to wizualna mapa przepływu wartości w firmie:

**Typy węzłów (Nodes):**
🔵 **Process** — główny proces biznesowy (np. "Sprzedaż B2B")
🟢 **SOP** — procedura przypisana do procesu
🟣 **Agent** — AI Agent obsługujący procedurę
🟡 **Decision** — punkt decyzyjny (if/then)
🔴 **Handoff** — przekazanie między zespołami/systemami

**Widoki:**
- Whiteboard (drag & drop, połączenia strzałkami)
- Lista (tabelaryczny przegląd)
- Export do JSON/PNG

**Zastosowanie:**
- Identyfikacja bottlenecków
- Planowanie automatyzacji
- Prezentacja dla zarządu (ROI)
- Onboarding nowych pracowników`,
        link: '/value-chain',
    },
    // ====== ROLES ======
    {
        id: 'roles-hierarchy',
        title: 'Hierarchia ról w VantageOS',
        category: 'Governance',
        keywords: ['rola', 'role', 'uprawnienia', 'sponsor', 'pilot', 'manager', 'expert', 'citizen', 'developer', 'meta admin'],
        content: `System ról w VantageOS (od najniższej do najwyższej):

**CITIZEN_DEV** — Użytkownik końcowy
- Przeglądanie SOPów, Wiki, agentów
- Zgłaszanie wniosków do Council
- Chat z AI

**EXPERT** — Specjalista
- Wszystko co CITIZEN_DEV +
- Edycja SOPów
- Głosowanie w Council

**MANAGER** — Kierownik
- Wszystko co EXPERT +
- Zarządzanie zespołem
- Tworzenie agentów
- Raporty MUDA

**PILOT** — Lider transformacji (COO)
- Wszystko co MANAGER +
- Zatwierdzanie wniosków
- Konfiguracja pipeline

**SPONSOR** — Decydent (CEO)
- Pełne uprawnienia
- Zatwierdzanie strategiczne

**META_ADMIN** — Administrator systemu
- Dostęp do backoffice
- Zarządzanie organizacjami
- Konfiguracja globalna`,
        link: '/roles',
    },
    // ====== GTM ======
    {
        id: 'gtm-strategy',
        title: 'Go-To-Market — strategia sprzedaży VantageOS',
        category: 'GTM',
        keywords: ['gtm', 'sprzedaż', 'market', 'klient', 'persona', 'pricing', 'strategy'],
        content: `VantageOS Go-To-Market strategia:

**Persony (ICP):**
1. CEO/COO firmy 50-500 osób — szuka oszczędności i automatyzacji
2. CTO/IT Manager — szuka struktury i governance dla AI
3. Operations Manager — szuka eliminacji marnotrawstwa

**Model sprzedaży:**
- Discovery Call → AI Sprint Workshop → Pilot (3 mies.) → Scale
- Pricing: Setup fee + monthly per-user + Success fee

**Value Proposition:**
"VantageOS zamienia chaotyczne wdrożenie AI w uporządkowany, mierzalny proces z governance i ROI tracking."

**Kontekst dla AI agentów sprzedażowych:**
- Landing page → Lead form → Kwalifikacja (SalesBot)
- Workshop → SOP mapping → Proposal generation
- Pilot → Onboarding organizacji → Deployment`,
        link: '/resources/wiki/gtm',
    },
    // ====== TRUST & SECURITY ======
    {
        id: 'trust-security',
        title: 'Trust & Bezpieczeństwo AI',
        category: 'Trust',
        keywords: ['trust', 'bezpieczeństwo', 'security', 'prywatność', 'gdpr', 'dane', 'zaufanie'],
        content: `Zasady bezpieczeństwa AI w VantageOS:

**Governance:**
- Council zatwierdza każdego nowego agenta
- Audyt logów co 30 dni
- Role-Based Access Control (RBAC)

**Dane:**
- Dane klienta nie opuszczają organizacji
- LLM API calls z redacted PII
- Encryption at rest & in transit

**Transparentność:**
- Każda decyzja AI jest logowana
- Agent cytuje źródło (SOP, Wiki)
- "Explain" mode — agent wyjaśnia swoje rozumowanie

**Compliance:**
- GDPR-ready
- ISO 27001 alignment
- Data Processing Agreement (DPA) w każdym kontrakcie`,
        link: '/resources/wiki/trust',
    },
];

/**
 * Search wiki articles by query string.
 * Uses keyword matching and content search (case-insensitive).
 * Returns top N most relevant articles.
 */
export function searchWiki(query: string, maxResults: number = 3): WikiArticle[] {
    const normalizedQuery = query.toLowerCase().trim();
    const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 2);

    if (queryWords.length === 0) return [];

    const scored = WIKI_KNOWLEDGE_BASE.map(article => {
        let score = 0;

        // Keyword matching (highest weight)
        for (const keyword of article.keywords) {
            for (const word of queryWords) {
                if (keyword.includes(word) || word.includes(keyword)) {
                    score += 10;
                }
            }
        }

        // Title matching
        const titleLower = article.title.toLowerCase();
        for (const word of queryWords) {
            if (titleLower.includes(word)) {
                score += 8;
            }
        }

        // Content matching (lower weight)
        const contentLower = article.content.toLowerCase();
        for (const word of queryWords) {
            if (contentLower.includes(word)) {
                score += 3;
            }
        }

        // Category matching
        const categoryLower = article.category.toLowerCase();
        for (const word of queryWords) {
            if (categoryLower.includes(word)) {
                score += 5;
            }
        }

        return { article, score };
    });

    return scored
        .filter(s => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, maxResults)
        .map(s => s.article);
}

/**
 * Build context string from wiki articles for AI prompt injection.
 */
export function buildWikiContext(articles: WikiArticle[]): string {
    if (articles.length === 0) return '';

    const sections = articles.map(a =>
        `### ${a.title} (${a.category})\n${a.content}`
    ).join('\n\n---\n\n');

    return `\n\n## Wiedza z Wiki VantageOS (kontekst):\n\n${sections}\n`;
}
