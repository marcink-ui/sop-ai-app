import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { getSystemPrompt } from '@/lib/system-prompts';

const DEFAULT_VALUE_CHAIN_PROMPT = `Jesteś ekspertem Lean AI ds. optymalizacji łańcucha wartości.
Analizujesz procesy w firmie i proponujesz usprawnienia.

Twoje zadania:
1. Zidentyfikuj wąskie gardła (bottlenecks)
2. Znajdź procesy z wysokim potencjałem automatyzacji
3. Oceń ryzyko MUDA (marnotrawstwa)
4. Zaproponuj konkretne usprawnienia z szacowanym ROI

Odpowiadaj w formacie JSON:
{
  "bottlenecks": [{ "nodeId": "...", "label": "...", "reason": "...", "severity": "high|medium|low" }],
  "automationOpportunities": [{ "nodeId": "...", "label": "...", "currentAutomation": 0.3, "targetAutomation": 0.8, "estimatedSavings": "..." }],
  "mudaRisks": [{ "type": "...", "description": "...", "affectedNodes": ["..."] }],
  "recommendations": [{ "priority": 1, "action": "...", "impact": "high|medium|low", "effort": "high|medium|low", "estimatedROI": "..." }],
  "summary": "..."
}`;

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { nodes, edges, mapName } = body;

        if (!nodes || !Array.isArray(nodes)) {
            return NextResponse.json({ error: 'nodes array required' }, { status: 400 });
        }

        // Load prompt from DB with fallback
        const systemPrompt = await getSystemPrompt('value-chain-ai', DEFAULT_VALUE_CHAIN_PROMPT);

        // Build context from actual node data
        const nodesSummary = nodes.map((n: { id: string; type: string; data?: { label?: string; automationPotential?: number; timeMinutes?: number; errorRate?: number; areaId?: string } }) => ({
            id: n.id,
            type: n.type,
            label: n.data?.label || 'Unnamed',
            automationPotential: n.data?.automationPotential ?? 5,
            timeMinutes: n.data?.timeMinutes ?? 0,
            errorRate: n.data?.errorRate ?? 0,
            area: n.data?.areaId || 'unassigned',
        }));

        const edgesSummary = (edges || []).map((e: { source: string; target: string }) => ({
            from: e.source,
            to: e.target,
        }));

        const userMessage = `Analizuj łańcuch wartości "${mapName || 'Bez nazwy'}":

Węzły (${nodesSummary.length}):
${JSON.stringify(nodesSummary, null, 2)}

Połączenia (${edgesSummary.length}):
${JSON.stringify(edgesSummary, null, 2)}

Podaj analizę w formacie JSON.`;

        // Call AI (OpenAI)
        const { OpenAI } = await import('openai');
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
            max_tokens: 2000,
        });

        const rawContent = completion.choices[0]?.message?.content || '{}';
        let analysis;
        try {
            analysis = JSON.parse(rawContent);
        } catch {
            analysis = { summary: rawContent, recommendations: [] };
        }

        return NextResponse.json({
            success: true,
            analysis,
            tokensUsed: completion.usage?.total_tokens || 0,
        });
    } catch (error) {
        console.error('[Value Chain Optimize] Error:', error);
        return NextResponse.json({ error: 'Failed to analyze value chain' }, { status: 500 });
    }
}
