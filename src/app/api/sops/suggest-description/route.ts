import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';

// Lazy OpenAI initialization - only create client when API key is available
const getOpenAIClient = () => {
    if (!process.env.OPENAI_API_KEY) {
        return null;
    }
    // Dynamic import to avoid build-time errors
    const OpenAI = require('openai').default;
    return new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
};

// System prompt for SOP description generation
const SOP_DESCRIPTION_SYSTEM_PROMPT = `Jesteś ekspertem w tworzeniu opisów Standardowych Procedur Operacyjnych (SOP).

Na podstawie podanych informacji o procesie, wygeneruj zwięzły, profesjonalny opis SOP w języku polskim.

Opis powinien:
1. Wyjaśniać cel procesu w 1-2 zdaniach
2. Wskazywać kluczowe korzyści lub wartość dodaną
3. Być napisany w stylu formalnym, ale przystępnym
4. Mieć maksymalnie 3-4 zdania
5. Unikać żargonu technicznego, chyba że jest niezbędny

Format odpowiedzi: tylko tekst opisu, bez nagłówków ani formatowania.`;

interface SuggestDescriptionRequest {
    processName: string;
    department?: string;
    role?: string;
    trigger?: string;
    outcome?: string;
}

export async function POST(request: Request) {
    try {
        const session = await getSession();

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Nieautoryzowany dostęp' },
                { status: 401 }
            );
        }

        const body: SuggestDescriptionRequest = await request.json();
        const { processName, department, role, trigger, outcome } = body;

        if (!processName) {
            return NextResponse.json(
                { error: 'Nazwa procesu jest wymagana' },
                { status: 400 }
            );
        }

        // Build user prompt with available info
        let userPrompt = `Nazwa procesu: ${processName}`;
        if (department) userPrompt += `\nDział: ${department}`;
        if (role) userPrompt += `\nGłówna rola odpowiedzialna: ${role}`;
        if (trigger) userPrompt += `\nWyzwalacz (co uruchamia proces): ${trigger}`;
        if (outcome) userPrompt += `\nOczekiwany rezultat: ${outcome}`;

        userPrompt += '\n\nWygeneruj profesjonalny opis tego procesu dla SOP.';

        // Check if OpenAI API is configured
        if (!process.env.OPENAI_API_KEY) {
            // Fallback: generate basic description without AI
            const fallbackDescription = generateFallbackDescription(processName, department, trigger, outcome);
            return NextResponse.json({
                suggestion: fallbackDescription,
                source: 'fallback'
            });
        }

        const openai = getOpenAIClient();
        if (!openai) {
            // Fallback if OpenAI client couldn't be created
            const fallbackDescription = generateFallbackDescription(processName, department, trigger, outcome);
            return NextResponse.json({
                suggestion: fallbackDescription,
                source: 'fallback'
            });
        }

        const response = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            messages: [
                { role: 'system', content: SOP_DESCRIPTION_SYSTEM_PROMPT },
                { role: 'user', content: userPrompt },
            ],
            max_tokens: 300,
            temperature: 0.7,
        });

        const suggestion = response.choices[0]?.message?.content?.trim() || '';

        return NextResponse.json({
            suggestion,
            source: 'ai',
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini'
        });
    } catch (error) {
        console.error('Error generating description suggestion:', error);

        // Fallback on error
        const body = await request.json().catch(() => ({}));
        const fallbackDescription = generateFallbackDescription(
            body.processName || 'Proces',
            body.department,
            body.trigger,
            body.outcome
        );

        return NextResponse.json({
            suggestion: fallbackDescription,
            source: 'fallback',
            error: 'AI suggestion failed, using fallback'
        });
    }
}

function generateFallbackDescription(
    processName: string,
    department?: string,
    trigger?: string,
    outcome?: string
): string {
    let description = `Procedura "${processName}"`;

    if (department) {
        description += ` w dziale ${department}`;
    }

    description += ' definiuje standardowy sposób realizacji zadań';

    if (trigger) {
        description += `, uruchamiany gdy ${trigger.toLowerCase()}`;
    }

    if (outcome) {
        description += `. Celem procesu jest ${outcome.toLowerCase()}`;
    }

    description += '. Procedura zapewnia powtarzalność i jakość wykonywanych działań.';

    return description;
}
