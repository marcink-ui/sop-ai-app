import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth-server';
import { searchWiki, buildWikiContext } from '@/lib/ai/wiki-knowledge';
import { resolveApiKey, getTierLabel, isRealAIAvailable } from '@/lib/ai/api-key-resolver';

// ── Organization-scoped knowledge fetcher ──
async function buildOrganizationContext(userId: string, organizationId: string | null): Promise<string> {
    const parts: string[] = [];

    try {
        // 1. User Profile & Context
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                organization: { select: { name: true } },
                department: { select: { name: true } },
            },
        });

        if (user) {
            // Cast to any — profile fields exist in Prisma schema but local client types may be stale
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const u = user as any;
            parts.push(`\n## Profil użytkownika`);
            parts.push(`Imię: ${u.name || 'Nie podano'}`);
            parts.push(`Rola: ${u.role}`);
            if (u.organization?.name) parts.push(`Organizacja: ${u.organization.name}`);
            if (u.department?.name) parts.push(`Dział: ${u.department.name}`);
            if (u.bio) parts.push(`Bio: ${u.bio}`);
            if (u.skills) parts.push(`Umiejętności: ${u.skills}`);
            if (u.goals) parts.push(`Cele: ${u.goals}`);
            if (u.mbti) parts.push(`MBTI: ${u.mbti}`);
            if (u.disc) parts.push(`DISC: ${u.disc}`);
            if (u.strengthsFinder) parts.push(`StrengthsFinder: ${u.strengthsFinder}`);
            if (u.enneagram) parts.push(`Enneagram: ${u.enneagram}`);
            if (u.personalityNotes) parts.push(`Notatki osobowości: ${u.personalityNotes}`);
            if (u.communicationStyle) parts.push(`Styl komunikacji: ${u.communicationStyle}`);
            if (u.preferredLanguage) parts.push(`Preferowany język: ${u.preferredLanguage}`);
            if (u.certifications) parts.push(`Certyfikaty: ${u.certifications}`);
            if (u.interests) parts.push(`Zainteresowania: ${u.interests}`);
            if (u.values) parts.push(`Wartości: ${u.values}`);
            if (u.cv) parts.push(`CV / Doświadczenie: ${u.cv}`);
        }

        if (!organizationId) return parts.join('\n');

        // 2. SOPs (org-scoped) — titles and purposes for context
        const sops = await prisma.sOP.findMany({
            where: { organizationId },
            select: { id: true, title: true, code: true, status: true, purpose: true },
            take: 30,
            orderBy: { updatedAt: 'desc' },
        });

        if (sops.length > 0) {
            parts.push(`\n## Procedury SOP w organizacji (${sops.length})`);
            parts.push(`(Użyj linków: [Nazwa SOPu](/sops/{id}))`);
            sops.forEach(s => {
                parts.push(`- id:${s.id} | ${s.code ? s.code + ' — ' : ''}${s.title} (${s.status})${s.purpose ? ': ' + s.purpose.slice(0, 100) : ''}`);
            });
        }

        // 3. Tasks — skipped (no Task model in current Prisma schema)
        // TODO: Add task context when Task model is added

        // 4. Resources (org-scoped)
        const resources = await prisma.resource.findMany({
            where: { organizationId },
            select: { id: true, title: true, category: true, status: true },
            take: 20,
            orderBy: { updatedAt: 'desc' },
        });

        if (resources.length > 0) {
            parts.push(`\n## Zasoby (${resources.length})`);
            parts.push(`(Użyj linków: [Tytuł](/resources/{id}))`);
            resources.forEach(r => {
                parts.push(`- id:${r.id} | ${r.title} (${r.category}, ${r.status})`);
            });
        }

        // 5. Agents (org-scoped)
        const agents = await prisma.agent.findMany({
            where: { organizationId },
            select: { id: true, name: true, type: true, status: true, description: true },
            take: 15,
            orderBy: { updatedAt: 'desc' },
        });

        if (agents.length > 0) {
            parts.push(`\n## Agenci AI (${agents.length})`);
            parts.push(`(Użyj linków: [Nazwa agenta](/agents/{id}))`);
            agents.forEach(a => {
                parts.push(`- id:${a.id} | ${a.name} (${a.type}, ${a.status})${a.description ? ': ' + a.description.slice(0, 80) : ''}`);
            });
        }

    } catch (err) {
        console.error('[Chat API] Failed to build org context:', err);
    }

    return parts.join('\n');
}

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

### Linki do elementów
Gdy wspominasz konkretne elementy systemu (SOPy, agentów, zasoby, artykuły wiki), ZAWSZE dodawaj do nich klikalny link w formacie markdown:
- SOP: [Nazwa SOPu](/sops/{id})
- Agent AI: [Nazwa agenta](/agents/{id})  
- Zasób: [Tytuł zasobu](/resources/{slug})
- Wiki: [Tytuł artykułu](/wiki/{slug})
- Użytkownik: [Imię](/admin-panel/users)
- Rola: [Nazwa roli](/roles)
- Canvas AI: [Nazwa canvasu](/canvas)

Przykład: "Polecam przejrzeć SOP [Obsługa klienta](/sops/clx123abc) oraz skonfigurować agenta [Customer Support Bot](/agents/cly456def)."

## Kontekst aktualnej strony (jeśli dostępny):
`;

export async function POST(request: NextRequest) {
    try {
        const { messages, context, sessionId } = await request.json();
        const latestMessage = messages[messages.length - 1];

        // 1. Identify User via session
        const authSession = await getSession();
        if (!authSession?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const user = {
            id: authSession.user.id,
            role: authSession.user.role as string,
            organizationId: authSession.user.organizationId as string | null,
        };

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

        // 5b. Build organization-scoped knowledge context (SOPs, Tasks, Resources, User Profile)
        const orgContext = await buildOrganizationContext(user.id, user.organizationId);

        // 6. Build full context string
        let contextString = VANTAGEOS_CONTEXT;

        // Inject organization knowledge
        if (orgContext) {
            contextString += `\n\n## Wiedza organizacji\n${orgContext}`;
            contextString += `\n\n> WAŻNE: Odpowiadaj TYLKO na podstawie danych z organizacji tego użytkownika. NIE używaj danych z innych organizacji.`;
        }

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
            try {
                // Build messages array for OpenAI-compatible API
                const apiMessages = [
                    { role: 'system' as const, content: contextString },
                    ...messages.slice(-20).map((m: { role: string; content: string }) => ({
                        role: m.role as 'user' | 'assistant',
                        content: m.content,
                    })),
                ];

                if (resolvedKey.provider === 'openai') {
                    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${resolvedKey.apiKey}`,
                        },
                        body: JSON.stringify({
                            model: resolvedKey.model,
                            messages: apiMessages,
                            max_tokens: 2048,
                            temperature: 0.7,
                        }),
                    });

                    if (!openaiRes.ok) {
                        const errData = await openaiRes.json().catch(() => ({}));
                        console.error('[Chat API] OpenAI error:', openaiRes.status, errData);
                        throw new Error(`OpenAI API error: ${openaiRes.status}`);
                    }

                    const completion = await openaiRes.json();
                    responseContent = completion.choices?.[0]?.message?.content || 'Brak odpowiedzi z API.';
                    modelUsed = completion.model || resolvedKey.model;

                    // Log usage
                    const usage = completion.usage;
                    if (usage && user.organizationId) {
                        await prisma.aiUsageLog.create({
                            data: {
                                organizationId: user.organizationId,
                                userId: user.id,
                                provider: resolvedKey.provider.toUpperCase() as 'OPENAI' | 'ANTHROPIC' | 'GOOGLE',
                                model: modelUsed,
                                tier: resolvedKey.tier,
                                promptTokens: usage.prompt_tokens || 0,
                                completionTokens: usage.completion_tokens || 0,
                                totalTokens: usage.total_tokens || 0,
                                estimatedCost: (usage.total_tokens || 0) * 0.00003, // GPT-4 turbo ~$0.03/1K
                            },
                        }).catch(err => console.error('[Chat API] Usage log error:', err));
                    }
                } else if (resolvedKey.provider === 'anthropic') {
                    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-api-key': resolvedKey.apiKey,
                            'anthropic-version': '2023-06-01',
                        },
                        body: JSON.stringify({
                            model: resolvedKey.model,
                            max_tokens: 2048,
                            system: contextString,
                            messages: messages.slice(-20).map((m: { role: string; content: string }) => ({
                                role: m.role === 'assistant' ? 'assistant' : 'user',
                                content: m.content,
                            })),
                        }),
                    });

                    if (!anthropicRes.ok) {
                        const errData = await anthropicRes.json().catch(() => ({}));
                        console.error('[Chat API] Anthropic error:', anthropicRes.status, errData);
                        throw new Error(`Anthropic API error: ${anthropicRes.status}`);
                    }

                    const completion = await anthropicRes.json();
                    responseContent = completion.content?.[0]?.text || 'Brak odpowiedzi z API.';
                    modelUsed = completion.model || resolvedKey.model;

                    // Log usage
                    const usage = completion.usage;
                    if (usage && user.organizationId) {
                        await prisma.aiUsageLog.create({
                            data: {
                                organizationId: user.organizationId,
                                userId: user.id,
                                provider: 'ANTHROPIC',
                                model: modelUsed,
                                tier: resolvedKey.tier,
                                promptTokens: usage.input_tokens || 0,
                                completionTokens: usage.output_tokens || 0,
                                totalTokens: (usage.input_tokens || 0) + (usage.output_tokens || 0),
                                estimatedCost: ((usage.input_tokens || 0) + (usage.output_tokens || 0)) * 0.000015,
                            },
                        }).catch(err => console.error('[Chat API] Usage log error:', err));
                    }
                } else {
                    // Google or unknown provider — use wiki-enriched for now
                    responseContent = generateWikiEnrichedResponse(messages, context, wikiArticles);
                    modelUsed = `${resolvedKey.model} (wiki-enriched)`;
                }
            } catch (aiError) {
                console.error('[Chat API] AI provider error, falling back to wiki:', aiError);
                responseContent = generateWikiEnrichedResponse(messages, context, wikiArticles);
                modelUsed = `${resolvedKey.model} (fallback-wiki)`;
            }
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
