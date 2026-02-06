import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// VantageOS System Context - injected into every conversation
const VANTAGEOS_CONTEXT = `
Jesteś VantageOS AI Assistant - ekspertem w metodologii Lean AI i transformacji cyfrowej.

## Twoja wiedza obejmuje:

### Metodologia Lean AI (Manifest 3.3)
- MUDA w procesach biznesowych (7 rodzajów marnotrawstwa)
- Transformacja SOP do AI Agentów
- Pipeline transformacji: Step 1 → Step 2 → Step 3 → Step 4 → Step 5
- Council governance (Sponsor, Pilot, Manager, Expert, Citizen Developer)

### VantageOS Components
- SOPs - Standardowe Procedury Operacyjne z metadanymi
- AI Agents - Specyfikacje asystentów AI z Master Prompts
- Value Chain - Wizualizacja łańcucha wartości
- MUDA Reports - Analiza marnotrawstwa w procesach
- Ontology - Słownik pojęć firmowych
- Roles Registry - Rejestr ról w organizacji

### Style komunikacji
- Odpowiadaj po polsku, chyba że użytkownik pisze po angielsku
- Bądź konkretny i praktyczny
- Używaj przykładów z kontekstu VantageOS
- Przy tworzeniu SOPów, proponuj strukturę zgodną z formatem VantageOS

## Kontekst aktualnej strony (jeśli dostępny):
`;

export async function POST(request: NextRequest) {
    try {
        const { messages, context, sessionId } = await request.json();
        const latestMessage = messages[messages.length - 1];

        // 1. Identify User (Simulated Auth for now - getting the first user or a demo user)
        // In a real app, use auth() from next-auth or Clerk
        const user = await prisma.user.findFirst();

        if (!user) {
            return NextResponse.json(
                { error: 'User not found. Component requires at least one user in DB.' },
                { status: 401 }
            );
        }

        // 2. Manage Session
        let currentSessionId = sessionId;
        let session;

        if (currentSessionId) {
            session = await prisma.chatSession.findUnique({
                where: { id: currentSessionId }
            });
        }

        if (!session) {
            // Create new session
            session = await prisma.chatSession.create({
                data: {
                    userId: user.id,
                    title: latestMessage.content.slice(0, 50) || 'New Chat',
                    context: context || {},
                }
            });
            currentSessionId = session.id;
        }

        // 3. Save User Message
        await prisma.chatMessage.create({
            data: {
                sessionId: currentSessionId,
                role: 'user',
                content: latestMessage.content,
                metadata: {
                    context
                }
            }
        });

        // 4. Generate AI Response (Simulated for this implementation, but structured for replacement)
        // Build full context string
        let contextString = VANTAGEOS_CONTEXT;
        if (context?.currentPage) {
            contextString += `\nAktualna strona: ${context.currentPage}`;
        }
        if (context?.sopTitle) {
            contextString += `\nAktualny SOP: ${context.sopTitle}`;
        }
        if (context?.agentName) {
            contextString += `\nAktualny Agent: ${context.agentName}`;
        }

        // Generate response content
        const responseContent = generateSimulatedResponse(messages, context);

        // 5. Save Assistant Message
        await prisma.chatMessage.create({
            data: {
                sessionId: currentSessionId,
                role: 'assistant',
                content: responseContent,
                metadata: {
                    model: 'simulated'
                }
            }
        });

        return NextResponse.json({
            content: responseContent,
            model: 'simulated',
            sessionId: currentSessionId
        });

    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

function generateSimulatedResponse(messages: { role: string; content: string }[], context?: { currentPage?: string; sopTitle?: string; agentName?: string }): string {
    const lastMessageObj = messages[messages.length - 1];
    const lastMessage = lastMessageObj?.content?.toLowerCase() || '';

    // Context-aware responses
    if (context?.sopTitle) {
        if (lastMessage.includes('krok') || lastMessage.includes('step')) {
            return `Analizuję SOP "${context.sopTitle}". Każdy krok powinien zawierać:

1. **Nazwa kroku** - krótki, opisowy tytuł
2. **Rola** - kto wykonuje (np. Agent AI, Manager)
3. **Trigger** - co uruchamia krok
4. **Akcje** - konkretne działania do wykonania
5. **Narzędzie** - system/aplikacja używana
6. **Output** - oczekiwany rezultat

Czy chciałbyś, żebym zaproponował strukturę dla konkretnego kroku?`;
        }
    }

    if (context?.agentName) {
        if (lastMessage.includes('prompt') || lastMessage.includes('instrukcj')) {
            return `Dla agenta "${context.agentName}" rekomenduję następującą strukturę Master Prompt:

## ROLA
Jesteś [opis roli], odpowiedzialnym za [zakres].

## KONTEKST
- Organizacja: [nazwa]
- Procesy: [lista SOPów]
- Dostępne narzędzia: [MCPs]

## ZASADY
1. [Zasada 1]
2. [Zasada 2]

## WORKFLOW
[Opis przepływu pracy]

Czy chciałbyś, żebym rozwinął któryś z tych elementów?`;
        }
    }

    // General topic responses
    if (lastMessage.includes('sop') || lastMessage.includes('procedur')) {
        return `Aby stworzyć skuteczny SOP w VantageOS, potrzebujesz:

📋 **Podstawowe informacje:**
- Nazwa procesu
- Cel (Purpose)
- Zakres (Scope)
- Właściciel procesu

📝 **Struktura kroków:**
Każdy krok zawiera: trigger → akcje → narzędzie → output

🤖 **Gotowość do AI:**
- Trigger musi być jednoznaczny
- Akcje powinny być atomowe
- Output musi być mierzalny

Czy chcesz, żebym pomógł Ci stworzyć nowy SOP krok po kroku?`;
    }

    if (lastMessage.includes('muda') || lastMessage.includes('marnotraw')) {
        return `MUDA w Lean to 7 rodzajów marnotrawstwa:

1. **Transport** - zbędne przenoszenie danych/dokumentów
2. **Inventory** - gromadzenie nieużywanych informacji
3. **Motion** - zbędne ruchy w systemach
4. **Waiting** - oczekiwanie na decyzje/dane
5. **Overproduction** - tworzenie niepotrzebnych raportów
6. **Overprocessing** - nadmierne przetwarzanie
7. **Defects** - błędy wymagające poprawek

W VantageOS identyfikujemy MUDA w procesach i przekształcamy je w kandydatów do automatyzacji AI.

Czy chcesz przeanalizować konkretny proces pod kątem MUDA?`;
    }

    if (lastMessage.includes('agent') || lastMessage.includes('ai')) {
        return `Agent AI w VantageOS składa się z:

🎯 **Specyfikacja:**
- Nazwa i opis
- Przypisane SOPy
- Master Prompt

⚙️ **Konfiguracja:**
- Model (GPT-4, Claude, etc.)
- Integracje (MCPs)
- Micro-agents (podagenci)

📊 **Metryki:**
- Procesy obsługiwane
- Czas odpowiedzi
- Wskaźnik sukcesu

Czy chcesz stworzyć nowego agenta lub edytować istniejącego?`;
    }

    if (lastMessage.includes('value chain') || lastMessage.includes('łańcuch')) {
        return `Value Chain w VantageOS wizualizuje przepływ wartości w organizacji:

🔵 **Process Node** - główne procesy biznesowe
🟢 **SOP Node** - procedury przypisane do procesów
🟣 **Agent Node** - agenci AI obsługujący procesy
🟡 **Decision Node** - punkty decyzyjne
🔴 **Handoff Node** - przekazania między zespołami

Możesz przeciągać i łączyć węzły, tworząc mapę przepływu pracy.

Przejdź do Value Chain → dodaj węzły → połącz je strzałkami.`;
    }

    // Default response
    return `Rozumiem Twoje pytanie. Jako VantageOS AI Assistant mogę pomóc w:

• 📋 Tworzeniu i optymalizacji SOPów
• 🤖 Konfiguracji AI Agentów
• 🔍 Analizie MUDA w procesach
• 🗺️ Mapowaniu Value Chain
• 📊 Interpretacji metryk transformacji

W czym konkretnie mogę Ci dziś pomóc?`;
}
