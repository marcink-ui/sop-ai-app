import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { searchWiki, buildWikiContext } from '@/lib/ai/wiki-knowledge';
import { resolveApiKey, getTierLabel, isRealAIAvailable } from '@/lib/ai/api-key-resolver';

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

        // 1. Identify User (with role for API key resolution)
        const user = await prisma.user.findFirst({
            select: { id: true, role: true, organizationId: true }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found. Component requires at least one user in DB.' },
                { status: 401 }
            );
        }

        // 2. Resolve API Key based on user role
        //    META_ADMIN / PARTNER → platform keys (SYHI-owned, PLATFORM_OPENAI_API_KEY etc.)
        //    Client roles → org keys (OPENAI_API_KEY etc.)
        //    No keys → simulated mode
        const resolvedKey = resolveApiKey({
            userRole: user.role,
            organizationId: user.organizationId || undefined,
        });

        console.log(`[Chat API] User role: ${user.role} → ${getTierLabel(resolvedKey.tier)} (${resolvedKey.provider})`);

        // 3. Manage Session
        let currentSessionId = sessionId;
        let session;

        if (currentSessionId) {
            session = await prisma.chatSession.findUnique({
                where: { id: currentSessionId }
            });
        }

        if (!session) {
            session = await prisma.chatSession.create({
                data: {
                    userId: user.id,
                    title: latestMessage.content.slice(0, 50) || 'New Chat',
                    context: context || {},
                }
            });
            currentSessionId = session.id;
        }

        // 4. Save User Message
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

        // 5. Search Wiki for relevant context
        const wikiArticles = searchWiki(latestMessage.content);
        const wikiContext = buildWikiContext(wikiArticles);
        const wikiSources = wikiArticles.map(a => ({ title: a.title, link: a.link, category: a.category }));

        // 6. Build full context string
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
        if (wikiContext) {
            contextString += wikiContext;
        }

        // 7. Generate response
        //    If real AI key is available → future: call OpenAI/Anthropic/Google
        //    Otherwise → wiki-enriched simulated response
        let responseContent: string;
        let modelUsed: string;

        if (isRealAIAvailable(resolvedKey)) {
            // TODO: Integrate real AI provider call here
            // For now, use simulated but log that a key IS available
            console.log(`[Chat API] Real AI key available (${resolvedKey.provider}/${resolvedKey.model}), but using simulated for now`);
            responseContent = generateWikiEnrichedResponse(messages, context, wikiArticles);
            modelUsed = `${resolvedKey.model} (simulated — key ready)`;
        } else {
            responseContent = generateWikiEnrichedResponse(messages, context, wikiArticles);
            modelUsed = 'simulated-wiki';
        }

        // 8. Save Assistant Message
        await prisma.chatMessage.create({
            data: {
                sessionId: currentSessionId,
                role: 'assistant',
                content: responseContent,
                metadata: {
                    model: modelUsed,
                    tier: resolvedKey.tier,
                    provider: resolvedKey.provider,
                    wikiSources: wikiSources,
                }
            }
        });

        return NextResponse.json({
            content: responseContent,
            model: modelUsed,
            tier: resolvedKey.tier,
            tierLabel: getTierLabel(resolvedKey.tier),
            sessionId: currentSessionId,
            wikiSources,
        });

    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

function generateWikiEnrichedResponse(
    messages: { role: string; content: string }[],
    context?: { currentPage?: string; sopTitle?: string; agentName?: string },
    wikiArticles?: { id: string; title: string; content: string; link: string; category: string }[]
): string {
    const lastMessageObj = messages[messages.length - 1];
    const lastMessage = lastMessageObj?.content?.toLowerCase() || '';

    // If we found wiki articles, build a rich response from them
    if (wikiArticles && wikiArticles.length > 0) {
        const primaryArticle = wikiArticles[0];
        const content = primaryArticle.content;

        // Build sources footer
        const sourcesFooter = '\n\n---\n📚 **Źródła z Wiki VantageOS:**\n' +
            wikiArticles.map(a => `- [${a.title}](${a.link})`).join('\n');

        // Context-aware responses (with wiki enrichment)
        if (context?.sopTitle) {
            if (lastMessage.includes('krok') || lastMessage.includes('step')) {
                return `Analizuję SOP "${context.sopTitle}". Na podstawie Wiki VantageOS, każdy krok powinien zawierać:

1. **Nazwa kroku** - krótki, opisowy tytuł
2. **Rola** - kto wykonuje (np. Agent AI, Manager)
3. **Trigger** - co uruchamia krok
4. **Akcje** - konkretne działania do wykonania
5. **Narzędzie** - system/aplikacja używana
6. **Output** - oczekiwany rezultat

${content.includes('Gotowość do AI') ? '🤖 **Gotowość do AI:** SOP z jasnymi triggerami → łatwy do automatyzacji.' : ''}

Czy chciałbyś, żebym zaproponował strukturę dla konkretnego kroku?${sourcesFooter}`;
            }
        }

        if (context?.agentName) {
            if (lastMessage.includes('prompt') || lastMessage.includes('instrukcj')) {
                return `Dla agenta "${context.agentName}", według Wiki VantageOS, Master Prompt powinien zawierać:

## ROLA
"Jesteś [opis roli], odpowiedzialnym za [zakres]."

## KONTEKST
- Organizacja i jej branża
- Procesy (SOPy) przypisane do agenta
- Dostępne narzędzia (MCPs)

## ZASADY
1. Tonacja komunikacji
2. Granice autonomii
3. Eskalacja — kiedy przekazać do człowieka

## WORKFLOW
Opis przepływu pracy krok po kroku.

💡 **Tip:** Prompt powinien mieć 500–2000 słów i zawierać przykłady input/output.${sourcesFooter}`;
            }
        }

        // Return wiki-enriched response based on primary article content
        return `${content}${sourcesFooter}`;
    }

    // Fallback: Context-aware responses without wiki
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

    // Default response
    return `Rozumiem Twoje pytanie. Jako VantageOS AI Assistant mogę pomóc w:

• 📋 Tworzeniu i optymalizacji SOPów
• 🤖 Konfiguracji AI Agentów
• 🔍 Analizie MUDA w procesach
• 🗺️ Mapowaniu Value Chain
• 📊 Interpretacji metryk transformacji
• 📚 Przeszukiwaniu Wiki wiedzy

Spróbuj zapytać o konkretny temat, np. "Co to MUDA?", "Jak stworzyć agenta?", "Jak działa Council?"

W czym konkretnie mogę Ci dziś pomóc?`;
}
