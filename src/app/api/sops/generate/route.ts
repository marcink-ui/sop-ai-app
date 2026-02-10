import { NextRequest, NextResponse } from 'next/server';
import { resolveApiKey, isRealAIAvailable } from '@/lib/ai/api-key-resolver';

// ============================================
// VantageOS — AI SOP Generation API
// ============================================
// POST /api/sops/generate
// Generates a full SOP structure from a process description
// Uses the multi-tier API key system (platform → org → simulated)

interface SOPGenerationRequest {
    processName: string;
    processDescription: string;
    department?: string;
    roles?: string[];
    tags?: string[];
    category?: string;
    language?: 'pl' | 'en';
}

interface GeneratedSOP {
    title: string;
    description: string;
    purpose: string;
    scope: string;
    steps: {
        order: number;
        title: string;
        description: string;
        responsibleRole?: string;
        tools?: string[];
        duration?: string;
        notes?: string;
    }[];
    kpis?: string[];
    risks?: string[];
    aiConfidence: number;
    suggestedTags?: string[];
    suggestedCategory?: string;
    mudaAnalysis?: {
        wasteType: string;
        description: string;
        automationPotential: 'high' | 'medium' | 'low';
    }[];
}

const SYSTEM_PROMPT = `Jesteś ekspertem VantageOS w tworzeniu SOPów (Standard Operating Procedures).
Twoim zadaniem jest wygenerowanie kompletnego SOPa na podstawie opisu procesu.

Odpowiadaj WYŁĄCZNIE w formacie JSON zgodnym z poniższą strukturą:
{
  "title": "nazwa SOP",
  "description": "krótki opis (1-2 zdania)",
  "purpose": "cel procedury - jaki problem rozwiązuje",
  "scope": "zakres - kto, kiedy, w jakich okolicznościach",
  "steps": [
    {
      "order": 1,
      "title": "nazwa kroku",
      "description": "szczegółowy opis tego, co należy zrobić",
      "responsibleRole": "rola odpowiedzialna (opcjonalnie)",
      "tools": ["narzędzia potrzebne"],
      "duration": "szacowany czas",
      "notes": "dodatkowe uwagi"
    }
  ],
  "kpis": ["mierzalne wskaźniki sukcesu"],
  "risks": ["potencjalne ryzyka i jak im zapobiegać"],
  "aiConfidence": 0.85,
  "suggestedTags": ["sugerowane tagi"],
  "suggestedCategory": "sugerowana kategoria",
  "mudaAnalysis": [
    {
      "wasteType": "typ marnotrawstwa MUDA",
      "description": "opis zidentyfikowanego marnotrawstwa",
      "automationPotential": "high|medium|low"
    }
  ]
}

Zasady:
- Kroki powinny być konkretne i wykonalne
- Każdy krok powinien mieć jasno określoną odpowiedzialność
- Uwzględnij analizę MUDA (7 rodzajów marnotrawstwa)
- aiConfidence: 0.0-1.0, jak pewny jesteś wygenerowanego SOPa
- Odpowiadaj w języku, w którym zadano pytanie`;

export async function POST(request: NextRequest) {
    try {
        const body: SOPGenerationRequest = await request.json();

        if (!body.processName || !body.processDescription) {
            return NextResponse.json(
                { error: 'processName and processDescription are required' },
                { status: 400 }
            );
        }

        // Resolve API key using multi-tier system
        const resolvedKey = resolveApiKey({
            userRole: 'META_ADMIN',
            preferredProvider: 'openai',
        });

        // Build user prompt
        const lang = body.language || 'pl';
        const userPrompt = lang === 'pl'
            ? `Wygeneruj SOP dla procesu:
Nazwa: ${body.processName}
Opis: ${body.processDescription}
${body.department ? `Dział: ${body.department}` : ''}
${body.roles?.length ? `Role: ${body.roles.join(', ')}` : ''}
${body.tags?.length ? `Tagi: ${body.tags.join(', ')}` : ''}
${body.category ? `Kategoria: ${body.category}` : ''}`
            : `Generate SOP for process:
Name: ${body.processName}
Description: ${body.processDescription}
${body.department ? `Department: ${body.department}` : ''}
${body.roles?.length ? `Roles: ${body.roles.join(', ')}` : ''}
${body.tags?.length ? `Tags: ${body.tags.join(', ')}` : ''}
${body.category ? `Category: ${body.category}` : ''}`;

        // Generate using real AI or fallback
        if (!isRealAIAvailable(resolvedKey)) {
            // Return a basic generated SOP structure (simulated)
            const fallbackSOP: GeneratedSOP = {
                title: body.processName,
                description: `Procedura: ${body.processDescription.substring(0, 150)}`,
                purpose: `Standaryzacja procesu "${body.processName}" w organizacji.`,
                scope: body.department
                    ? `Dotyczy działu: ${body.department}`
                    : 'Dotyczy wszystkich pracowników zaangażowanych w proces.',
                steps: [
                    {
                        order: 1,
                        title: 'Przygotowanie',
                        description: 'Zbierz wszystkie niezbędne materiały i narzędzia.',
                        responsibleRole: body.roles?.[0] || 'Operator',
                        duration: '5 min',
                    },
                    {
                        order: 2,
                        title: 'Wykonanie',
                        description: body.processDescription,
                        responsibleRole: body.roles?.[0] || 'Operator',
                        duration: '15 min',
                    },
                    {
                        order: 3,
                        title: 'Weryfikacja',
                        description: 'Sprawdź poprawność wykonanego zadania.',
                        responsibleRole: body.roles?.[1] || 'Supervisor',
                        duration: '5 min',
                    },
                ],
                kpis: ['Czas realizacji procesu', 'Liczba błędów', 'Satysfakcja klienta'],
                risks: ['Brak odpowiedniego przeszkolenia', 'Niedostępność narzędzi'],
                aiConfidence: 0.3,
                suggestedTags: body.tags || ['do-uzupełnienia'],
                suggestedCategory: body.category || 'Ogólne',
            };

            return NextResponse.json({
                success: true,
                sop: fallbackSOP,
                tier: 'simulated',
                message: 'Wygenerowano podstawowy SOP. Ustaw OPENAI_API_KEY aby uzyskać pełną wersję AI.',
            });
        }

        // Call real AI
        let aiResponse: string;

        if (resolvedKey.provider === 'openai') {
            const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${resolvedKey.apiKey}`,
                },
                body: JSON.stringify({
                    model: resolvedKey.model || 'gpt-4o',
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        { role: 'user', content: userPrompt },
                    ],
                    max_tokens: 4096,
                    temperature: 0.7,
                    response_format: { type: 'json_object' },
                }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                console.error('[SOP Generate] OpenAI error:', res.status, err);
                throw new Error(`OpenAI API error: ${res.status}`);
            }

            const completion = await res.json();
            aiResponse = completion.choices?.[0]?.message?.content || '';

        } else if (resolvedKey.provider === 'anthropic') {
            const res = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': resolvedKey.apiKey,
                    'anthropic-version': '2023-06-01',
                },
                body: JSON.stringify({
                    model: resolvedKey.model || 'claude-3-sonnet-20240229',
                    max_tokens: 4096,
                    system: SYSTEM_PROMPT,
                    messages: [
                        { role: 'user', content: userPrompt },
                    ],
                }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                console.error('[SOP Generate] Anthropic error:', res.status, err);
                throw new Error(`Anthropic API error: ${res.status}`);
            }

            const completion = await res.json();
            aiResponse = completion.content?.[0]?.text || '';
        } else {
            throw new Error(`Unsupported provider: ${resolvedKey.provider}`);
        }

        // Parse the JSON response
        let generatedSOP: GeneratedSOP;
        try {
            generatedSOP = JSON.parse(aiResponse);
        } catch {
            console.error('[SOP Generate] Failed to parse AI response as JSON:', aiResponse.substring(0, 500));
            return NextResponse.json(
                {
                    error: 'AI returned invalid JSON',
                    rawResponse: aiResponse.substring(0, 1000),
                },
                { status: 422 }
            );
        }

        return NextResponse.json({
            success: true,
            sop: generatedSOP,
            tier: resolvedKey.tier,
            provider: resolvedKey.provider,
            model: resolvedKey.model,
        });

    } catch (error) {
        console.error('[SOP Generate] Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
