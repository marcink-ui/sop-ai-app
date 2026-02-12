import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import type OpenAI from 'openai';

// Lazy OpenAI initialization
let openaiInstance: OpenAI | null = null;

async function getOpenAI(): Promise<OpenAI> {
    if (!openaiInstance) {
        const OpenAIClass = (await import('openai')).default;
        openaiInstance = new OpenAIClass({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
    return openaiInstance;
}

interface ExtractedSOP {
    title: string;
    purpose: string;
    steps: string[];
    owner?: string;
    kpis?: string[];
}

interface ExtractedRole {
    name: string;
    department?: string;
    responsibilities: string[];
    skills?: string[];
}

interface ExtractedValueChain {
    name: string;
    segment?: string;
    stages: {
        name: string;
        description: string;
        automationPotential: 'LOW' | 'MEDIUM' | 'HIGH';
    }[];
}

interface ExtractedOntology {
    term: string;
    definition: string;
    context?: string;
}

interface TranscriptAnalysisResult {
    sops: ExtractedSOP[];
    roles: ExtractedRole[];
    valueChains: ExtractedValueChain[];
    ontology: ExtractedOntology[];
    summary: string;
    confidence: number;
}

const EXTRACTION_PROMPT = `Jesteś ekspertem od analizy procesów biznesowych i transformacji cyfrowej.
Przeanalizuj poniższą transkrypcję rozmowy z klientem i wyekstrahuj:

1. **SOPy (Standard Operating Procedures)** - Procedury, procesy, workflow które klient opisuje
2. **Role** - Stanowiska, role organizacyjne, odpowiedzialności
3. **Łańcuchy Wartości (Value Chains)** - Sekwencje procesów od A do Z, etapy tworzenia wartości
4. **Ontologia** - Terminy biznesowe, definicje, żargon firmowy

Dla każdego SOP podaj:
- title: nazwa procedury
- purpose: cel/opis
- steps: lista kroków (max 10)
- owner: właściciel procesu (jeśli wspomniany)
- kpis: metryki sukcesu (jeśli wspomniane)

Dla każdej Roli:
- name: nazwa stanowiska
- department: dział (jeśli wspomniany)
- responsibilities: lista obowiązków
- skills: wymagane umiejętności

Dla każdego Łańcucha Wartości:
- name: nazwa łańcucha
- segment: segment klientów (MSP/Enterprise/SMB) jeśli wspomniany
- stages: etapy z opisem i potencjałem automatyzacji (LOW/MEDIUM/HIGH)

Dla Ontologii:
- term: termin
- definition: definicja
- context: kontekst użycia

Podaj też:
- summary: 2-3 zdaniowe podsumowanie transkrypcji
- confidence: pewność ekstrakcji 0-100

Odpowiedz TYLKO w formacie JSON bez markdown:`;

export async function POST(request: Request) {
    try {
        const session = await getSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check for admin/manager role
        const role = session.user.role as string;
        if (!['ADMIN', 'MANAGER', 'SPONSOR', 'PILOT'].includes(role)) {
            return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        }

        const { transcript, companyName, title } = await request.json();

        if (!transcript || typeof transcript !== 'string') {
            return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
        }

        if (transcript.length < 100) {
            return NextResponse.json({ error: 'Transcript too short (min 100 characters)' }, { status: 400 });
        }

        const organizationId = (session.user as Record<string, unknown>).organizationId as string | null;

        // Call OpenAI for extraction
        const openai = await getOpenAI();
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: EXTRACTION_PROMPT,
                },
                {
                    role: 'user',
                    content: `Firma: ${companyName || 'Nieznana'}\n\nTranskrypcja:\n${transcript}`,
                },
            ],
            temperature: 0.3,
            max_tokens: 4000,
        });

        const responseText = completion.choices[0]?.message?.content || '{}';

        // Parse JSON response
        let result: TranscriptAnalysisResult;
        try {
            result = JSON.parse(responseText);
        } catch {
            // If parsing fails, return structured error
            return NextResponse.json({
                error: 'Failed to parse AI response',
                rawResponse: responseText.substring(0, 500),
            }, { status: 500 });
        }

        // Ensure all arrays exist
        result.sops = result.sops || [];
        result.roles = result.roles || [];
        result.valueChains = result.valueChains || [];
        result.ontology = result.ontology || [];
        result.summary = result.summary || 'Brak podsumowania';
        result.confidence = result.confidence || 50;

        // ── PERSIST TO DB ──────────────────────────────────────────
        let transcriptId: string | null = null;

        if (organizationId) {
            // 1. Save Transcript record
            const saved = await prisma.transcript.create({
                data: {
                    title: title || `Analiza: ${companyName || 'Transkrypcja'} — ${new Date().toISOString().slice(0, 10)}`,
                    source: 'UPLOAD',
                    status: 'PROCESSED',
                    rawContent: transcript,
                    processedData: {
                        summary: result.summary,
                        confidence: result.confidence,
                        roles: result.roles,
                        ontology: result.ontology,
                    },
                    extractedSops: result.sops as unknown as Record<string, unknown>[],
                    extractedMuda: null, // MUDA comes from pipeline step 2
                    extractedAgents: null, // Agents come from pipeline step 3-4
                    language: 'pl',
                    processedAt: new Date(),
                    organizationId,
                    uploadedById: session.user.id,
                },
            });
            transcriptId = saved.id;

            // 2. Merge into Organization.companyContext
            const org = await prisma.organization.findUnique({
                where: { id: organizationId },
                select: { companyContext: true },
            });

            const existing = (org?.companyContext as Record<string, unknown>) || {};
            const existingValueChains = (existing.valueChainDrafts as unknown[]) || [];
            const existingImportedDocs = (existing.importedDocs as unknown[]) || [];

            await prisma.organization.update({
                where: { id: organizationId },
                data: {
                    companyContext: {
                        ...existing,
                        valueChainDrafts: [
                            ...existingValueChains,
                            ...result.valueChains.map(vc => ({
                                ...vc,
                                sourceTranscriptId: transcriptId,
                                extractedAt: new Date().toISOString(),
                            })),
                        ],
                        importedDocs: [
                            ...existingImportedDocs,
                            {
                                transcriptId,
                                title: title || companyName || 'Transkrypcja',
                                summary: result.summary,
                                sopCount: result.sops.length,
                                roleCount: result.roles.length,
                                importedAt: new Date().toISOString(),
                            },
                        ],
                        lastAnalyzedAt: new Date().toISOString(),
                    } as Record<string, unknown>,
                },
            });
        }

        return NextResponse.json({
            success: true,
            result,
            transcriptId,
            persisted: !!organizationId,
            tokensUsed: completion.usage?.total_tokens || 0,
        });

    } catch (error) {
        console.error('Transcript analysis error:', error);
        return NextResponse.json({
            error: 'Failed to analyze transcript',
            details: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 });
    }
}
