import { NextResponse, NextRequest } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { resolveApiKey, isRealAIAvailable } from '@/lib/ai/api-key-resolver';

// ============================================================================
// Pipeline Step Names & Prompts (5 agents from methodology)
// ============================================================================
const STEP_CONFIG: Record<number, { name: string; label: string; systemPrompt: string }> = {
    1: {
        name: 'sop_generator',
        label: 'SOP Generator',
        systemPrompt: `Jesteś ekspertem w tworzeniu procedur operacyjnych (SOP).

Na podstawie transkrypcji rozmowy / opisu procesu wygeneruj kompletny SOP.

## Output format (JSON):
{
  "title": "Tytuł SOP",
  "purpose": "Cel procedury",
  "scope": "Zakres stosowania",
  "steps": [
    { "nr": 1, "action": "Opis akcji", "tool": "Narzędzie", "time": "Szacowany czas", "role": "Rola odpowiedzialna", "kpi": "Miernik jakości" }
  ],
  "definitions": { "termin": "definicja" },
  "roles": ["Rola 1", "Rola 2"],
  "kpis": [{ "name": "Nazwa KPI", "target": "Wartość docelowa", "unit": "Jednostka" }],
  "ontology": [{ "term": "Termin", "definition": "Definicja", "domain": "Domena" }]
}

Bądź precyzyjny, uwzględnij wszystkie kroki opisane w źródle. Jeśli w kontekście jest Canvas AI danego działu, uwzględnij cele i problemy stamtąd.`,
    },
    2: {
        name: 'muda_auditor',
        label: 'Audytor MUDA',
        systemPrompt: `Jesteś audytorem Lean — specjalistą MUDA (7 typów marnotrawstwa + Talent).

Przeanalizuj dostarczony SOP pod kątem marnotrawstw:
- Transport (zbędne przemieszczanie danych/dokumentów)
- Inventory (nadmiar zapasów informacji/danych)
- Motion (zbędne ruchy/kliknięcia pracownika)
- Waiting (oczekiwanie na zatwierdzenie/dane)
- Overproduction (generowanie zbędnych raportów/danych)
- Overprocessing (nadmierne przetwarzanie/kontrole)
- Defects (błędy wymagające poprawek)
- Talent (niewykorzystane umiejętności ludzi)

## Output format (JSON):
{
  "findings": [
    {
      "type": "TRANSPORT|INVENTORY|MOTION|WAITING|OVERPRODUCTION|OVERPROCESSING|DEFECTS|TALENT",
      "severity": "HIGH|MEDIUM|LOW",
      "stepNr": 2,
      "description": "Opis marnotrawstwa",
      "kaizen": "Propozycja usprawnienia",
      "estimatedSaving": "np. 2h/tydzień"
    }
  ],
  "summary": "Podsumowanie audytu",
  "overallScore": 7.5,
  "optimizedSteps": [
    { "nr": 1, "action": "Zoptymalizowana akcja", "tool": "...", "time": "...", "role": "...", "changed": true, "changeReason": "..." }
  ]
}

Uwzględnij kontekst łańcucha wartości i Canvas AI jeśli dostępne.`,
    },
    3: {
        name: 'ai_architect',
        label: 'Architekt AI',
        systemPrompt: `Jesteś Architektem AI — projektujesz agentów AI, automatyzacje i integracje dla procesów biznesowych.

Na podstawie SOP i raportu MUDA zaprojektuj architekturę AI:
- Które kroki mogą być zautomatyzowane przez AI?
- Jakie agenty AI są potrzebne?
- Jakie integracje z narzędziami zewnętrznymi?
- Jaka jest docelowa architektura?

## Output format (JSON):
{
  "agents": [
    {
      "name": "Nazwa agenta",
      "type": "ASSISTANT|AGENT|AUTOMATION",
      "purpose": "Cel agenta",
      "inputSpec": "Co agent przyjmuje",
      "outputSpec": "Co agent zwraca",
      "tools": ["tool1", "tool2"],
      "automatedSteps": [2, 5],
      "estimatedROI": "np. 10h/tyg zaoszczędzone"
    }
  ],
  "integrations": [
    { "system": "np. Slack", "purpose": "Powiadomienia", "type": "webhook|api|mcp" }
  ],
  "architecture": {
    "humanSteps": [1, 3],
    "aiSteps": [2, 4, 5],
    "hybridSteps": [6],
    "automationLevel": 60
  },
  "recommendations": "Dodatkowe rekomendacje"
}`,
    },
    4: {
        name: 'ai_generator',
        label: 'Generator AI Agent',
        systemPrompt: `Jesteś generatorem konfiguracji agentów AI.

Na podstawie specyfikacji z Architekta AI wygeneruj pełną konfigurację agenta:
- System prompt (master prompt)
- Narzędzia i integracje
- Parametry (temperature, model)
- Scenariusze testowe

## Output format (JSON):
{
  "agentConfig": {
    "name": "Nazwa agenta",
    "code": "AGENT-XXX",
    "type": "ASSISTANT|AGENT|AUTOMATION",
    "masterPrompt": "Pełny system prompt...",
    "model": "gpt-4o",
    "temperature": 0.3,
    "tools": [{ "name": "tool_name", "description": "Opis", "parameters": {} }],
    "testCases": [
      { "input": "Przykładowy input", "expectedBehavior": "Oczekiwane zachowanie" }
    ]
  }
}`,
    },
    5: {
        name: 'prompt_judge',
        label: 'Sędzia Promptów',
        systemPrompt: `Jesteś Sędzią Promptów — oceniasz jakość konfiguracji agenta AI.

Oceń:
1. Jakość system promptu (klarowność, kompletność, brak halucynacji)
2. Dobór narzędzi (czy pokrywa wszystkie use-case'y?)
3. Parametry (temperature odpowiednie do zadania?)
4. Test coverage (czy scenariusze testowe pokrywają edge-case'y?)
5. Bezpieczeństwo (czy prompt ma guardrails?)

## Output format (JSON):
{
  "scores": {
    "promptQuality": 8,
    "toolSelection": 7,
    "parameters": 9,
    "testCoverage": 6,
    "security": 8,
    "overall": 7.6
  },
  "issues": [
    { "severity": "HIGH|MEDIUM|LOW", "area": "prompt|tools|params|tests|security", "description": "Opis problemu", "fix": "Sugerowana poprawka" }
  ],
  "improvedPrompt": "Poprawiony system prompt (jeśli potrzebny)...",
  "verdict": "APPROVE|NEEDS_WORK|REJECT",
  "summary": "Podsumowanie oceny"
}`,
    },
};

// ============================================================================
// Helper: Build context for a pipeline step (A/B hybrid strategy)
// ============================================================================
async function buildStepContext(
    sopId: string,
    step: number,
    organizationId: string,
): Promise<string> {
    const parts: string[] = [];

    // 1. Get the SOP with processData
    const sop = await prisma.sOP.findUnique({
        where: { id: sopId },
        include: {
            department: { select: { id: true, name: true } },
            processLogs: { orderBy: { step: 'asc' }, where: { status: 'completed' } },
        },
    });

    if (!sop) return '';

    // 2. Get organization context (Canvas AI, company context)
    const org = await prisma.organization.findUnique({
        where: { id: organizationId },
        select: { name: true, canvasData: true, companyContext: true },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const processData = (sop.processData as any) || {};

    // 3. Source transcript (always include for steps 1-2, summary for 3-5)
    if (processData.sourceInput?.transcriptText) {
        if (step <= 2) {
            // Full transcript for steps 1-2
            parts.push(`## Transkrypcja źródłowa\n${processData.sourceInput.transcriptText}`);
        } else {
            // Truncated summary for steps 3-5
            const text = processData.sourceInput.transcriptText as string;
            parts.push(`## Transkrypcja (skrót)\n${text.slice(0, 2000)}...`);
        }
    }

    // 4. Canvas AI context (if available for department)
    if (org?.canvasData) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const canvas = org.canvasData as any;
        const deptName = sop.department?.name;
        const relevantCanvas = deptName && canvas[deptName] ? canvas[deptName] : canvas;

        if (step <= 2) {
            parts.push(`## Canvas AI (kontekst działu)\n${JSON.stringify(relevantCanvas, null, 2)}`);
        } else {
            // Key sections only for later steps
            parts.push(`## Canvas AI (kluczowe sekcje)\nProblemy: ${JSON.stringify(relevantCanvas?.pain_points || relevantCanvas?.problems || 'brak')}\nCele: ${JSON.stringify(relevantCanvas?.goals_2026 || relevantCanvas?.goals || 'brak')}`);
        }
    }

    // 5. Company context — importedDocs, valueChainDrafts (from transcript analysis)
    if (org?.companyContext) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ctx = org.companyContext as any;
        if (ctx.importedDocs?.length) {
            parts.push(`## Przeanalizowane dokumenty (${ctx.importedDocs.length})`);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ctx.importedDocs.forEach((doc: any) => {
                parts.push(`- ${doc.title}: ${doc.summary} (SOPy: ${doc.sopCount}, Role: ${doc.roleCount})`);
            });
        }
        if (ctx.valueChainDrafts?.length && step >= 2) {
            parts.push(`## Łańcuchy wartości z transkrypcji (${ctx.valueChainDrafts.length})`);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ctx.valueChainDrafts.forEach((vc: any) => {
                parts.push(`- ${vc.name} (segment: ${vc.segment || 'N/A'}): ${vc.stages?.length || 0} etapów`);
            });
        }
    }

    // 6. DB Canvas records (for department-specific knowledge)
    if (sop.department?.id) {
        const canvasRecords = await prisma.canvas.findMany({
            where: { organizationId, departmentId: sop.department.id, status: 'ACTIVE' },
            select: { title: true, sections: true },
            take: 3,
        });
        if (canvasRecords.length > 0) {
            parts.push(`## Canvasy działu "${sop.department.name}" (${canvasRecords.length})`);
            canvasRecords.forEach(c => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const sections = c.sections as any[];
                if (sections) {
                    const sectionSummary = sections.map(s => s.title).join(', ');
                    parts.push(`- ${c.title}: [${sectionSummary}]`);
                }
            });
        }
    }

    // 7. Previous step outputs
    for (const log of sop.processLogs) {
        if (log.step < step && log.output) {
            if (step - log.step <= 1) {
                // Full output from the immediately previous step
                parts.push(`## Output z kroku ${log.step} (${log.stepName})\n${JSON.stringify(log.output, null, 2)}`);
            } else {
                // Summary from earlier steps
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const output = log.output as any;
                parts.push(`## Podsumowanie kroku ${log.step} (${log.stepName})\n${output.summary || JSON.stringify(output).slice(0, 1000)}`);
            }
        }
    }

    // 8. Value chain context (for steps 2+)
    if (step >= 2 && processData.sourceInput?.valueChainNodeId) {
        const vcNode = await prisma.valueChainNode.findUnique({
            where: { id: processData.sourceInput.valueChainNodeId },
            include: {
                map: { select: { name: true, description: true } },
                area: { select: { name: true } },
            },
        });
        if (vcNode) {
            parts.push(`## Kontekst łańcucha wartości\nMapa: ${vcNode.map.name}\nObszar: ${vcNode.area?.name || 'Brak'}\nNode: ${vcNode.label} (${vcNode.type})\nOpis: ${vcNode.description || 'Brak'}`);
        }
    }

    // 9. Existing SOPs (for step 3 - architect needs to know what already exists)
    if (step >= 3) {
        const existingSops = await prisma.sOP.findMany({
            where: { organizationId, status: 'APPROVED', id: { not: sopId } },
            select: { title: true, code: true, purpose: true },
            take: 20,
        });
        if (existingSops.length > 0) {
            parts.push(`## Istniejące SOPy firmy (${existingSops.length})`);
            existingSops.forEach(s => parts.push(`- ${s.code}: ${s.title}`));
        }
    }

    return parts.join('\n\n');
}

// ============================================================================
// GET /api/sops/process/[id]/step — Get current step state
// ============================================================================
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const session = await getSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const sop = await prisma.sOP.findFirst({
            where: { id, organizationId: session.user.organizationId },
            include: {
                department: { select: { id: true, name: true } },
                processLogs: { orderBy: { step: 'asc' } },
                mudaReports: { select: { id: true, title: true, status: true } },
                valueChainNodes: { select: { id: true, label: true, type: true } },
            },
        });

        if (!sop) {
            return NextResponse.json({ error: 'SOP not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, sop });
    } catch (error) {
        console.error('[SOP Process Step] Error:', error);
        return NextResponse.json({ error: 'Failed to get step state' }, { status: 500 });
    }
}

// ============================================================================
// POST /api/sops/process/[id]/step — Execute pipeline step action
// Body: { step: number, action: "generate" | "save_edits" | "approve", data?: any }
// ============================================================================
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const session = await getSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { step, action, data } = body;

        if (!step || !action) {
            return NextResponse.json({ error: 'step and action are required' }, { status: 400 });
        }

        // Verify SOP belongs to user's org
        const sop = await prisma.sOP.findFirst({
            where: { id, organizationId: session.user.organizationId },
        });

        if (!sop) {
            return NextResponse.json({ error: 'SOP not found' }, { status: 404 });
        }

        const stepConfig = STEP_CONFIG[step as number];
        if (!stepConfig) {
            return NextResponse.json({ error: 'Invalid step (1-5)' }, { status: 400 });
        }

        // ── ACTION: generate ──
        if (action === 'generate') {
            const context = await buildStepContext(id, step, session.user.organizationId);

            // Resolve AI API key
            const apiKeyResult = await resolveApiKey(session.user.organizationId);

            if (!isRealAIAvailable(apiKeyResult)) {
                // Fallback: return mock output for demo
                const mockOutput = {
                    _mock: true,
                    message: `[DEMO] Output z ${stepConfig.label} — konfiguracja klucza API wymagana dla prawdziwej analizy AI.`,
                    step,
                    stepName: stepConfig.name,
                };

                await prisma.sOPProcessLog.updateMany({
                    where: { sopId: id, step },
                    data: { output: mockOutput, status: 'completed', input: { context: context.slice(0, 500) } },
                });

                return NextResponse.json({ success: true, output: mockOutput, mock: true });
            }

            // Call OpenAI
            const messages = [
                { role: 'system' as const, content: stepConfig.systemPrompt },
                { role: 'user' as const, content: context },
            ];

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKeyResult.apiKey}`,
                },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages,
                    temperature: 0.4,
                    max_tokens: 4000,
                    response_format: { type: 'json_object' },
                }),
            });

            if (!response.ok) {
                const errText = await response.text();
                console.error('[SOP Process] OpenAI error:', errText);
                return NextResponse.json({ error: 'AI generation failed' }, { status: 502 });
            }

            const aiResult = await response.json();
            const content = aiResult.choices?.[0]?.message?.content;
            let output;
            try {
                output = JSON.parse(content);
            } catch {
                output = { raw: content };
            }

            // Save to process log
            await prisma.sOPProcessLog.updateMany({
                where: { sopId: id, step },
                data: {
                    input: { context: context.slice(0, 2000), tokenEstimate: context.length / 4 },
                    output,
                    status: 'completed',
                },
            });

            // Update processData on SOP
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const processData = (sop.processData as any) || {};
            processData.stepOutputs = processData.stepOutputs || {};
            processData.stepOutputs[`step${step}`] = output;

            await prisma.sOP.update({
                where: { id },
                data: { processData },
            });

            return NextResponse.json({ success: true, output, tokens: aiResult.usage });
        }

        // ── ACTION: save_edits ──
        if (action === 'save_edits') {
            await prisma.sOPProcessLog.updateMany({
                where: { sopId: id, step },
                data: { userEdits: data },
            });

            // Also update processData
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const processData = (sop.processData as any) || {};
            processData.stepOutputs = processData.stepOutputs || {};
            if (processData.stepOutputs[`step${step}`]) {
                processData.stepOutputs[`step${step}`] = {
                    ...processData.stepOutputs[`step${step}`],
                    ...data,
                    _userEdited: true,
                };
            }

            await prisma.sOP.update({
                where: { id },
                data: { processData },
            });

            return NextResponse.json({ success: true });
        }

        // ── ACTION: approve (move to next step) ──
        if (action === 'approve') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const processData = (sop.processData as any) || {};
            const completedSteps = processData.completedSteps || [];

            if (!completedSteps.includes(step)) {
                completedSteps.push(step);
            }

            const nextStep = step < 5 ? step + 1 : null;

            processData.completedSteps = completedSteps;
            processData.currentStep = nextStep || 5;

            // Mark current step as completed, next as active
            await prisma.sOPProcessLog.updateMany({
                where: { sopId: id, step },
                data: { status: 'completed' },
            });

            if (nextStep) {
                await prisma.sOPProcessLog.updateMany({
                    where: { sopId: id, step: nextStep },
                    data: { status: 'active' },
                });
            }

            // If step 5 approved, the SOP is ready for first step output to populate SOP fields
            if (step === 1 && processData.stepOutputs?.step1) {
                const step1 = processData.stepOutputs.step1;
                await prisma.sOP.update({
                    where: { id },
                    data: {
                        processData,
                        purpose: step1.purpose || sop.purpose,
                        scope: step1.scope || sop.scope,
                        steps: step1.steps || sop.steps,
                        kpis: step1.kpis || sop.kpis,
                        definitions: step1.definitions || sop.definitions,
                    },
                });
            } else {
                await prisma.sOP.update({
                    where: { id },
                    data: { processData },
                });
            }

            return NextResponse.json({
                success: true,
                nextStep,
                completedSteps,
                completed: step === 5,
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('[SOP Process Step] Error:', error);
        return NextResponse.json({ error: 'Failed to execute step' }, { status: 500 });
    }
}
