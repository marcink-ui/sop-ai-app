import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

let _openai: OpenAI | null = null;
function getOpenAI() {
    if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    return _openai;
}

async function getLevel10Prompt(fallback: string): Promise<string> {
    try {
        const { getSystemPrompt } = await import('@/lib/system-prompts');
        return await getSystemPrompt('level10-ai', fallback);
    } catch {
        return fallback;
    }
}

const DEFAULT_PROMPT = `Jesteś asystentem przygotowującym agendę spotkania Level 10 (EOS).
Na podstawie danych systemowych (SOPy, agenci AI, aktywność użytkowników) wygeneruj:
1. SCORECARD: 3-5 kluczowych metryk z aktualnymi wartościami
2. ROCKS: cele kwartalne z postępem
3. ISSUES: potencjalne problemy do omówienia (IDS: Identify→Discuss→Solve)
4. TODOS: sugerowane zadania na najbliższy tydzień
5. HEADLINES: ważne informacje do przekazania zespołowi

Odpowiedz TYLKO w formacie JSON:
{
  "scorecard": [{ "label": "...", "value": "...", "trend": "up|down|flat", "color": "green|amber|red" }],
  "rocks": [{ "title": "...", "owner": "...", "progress": 0-100, "onTrack": true/false }],
  "issues": [{ "title": "...", "owner": "...", "priority": "high|medium|low" }],
  "todos": [{ "title": "...", "owner": "...", "dueDate": "YYYY-MM-DD" }],
  "headlines": ["..."]
}`;

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const orgId = session.user.organizationId;
        if (!orgId) {
            return NextResponse.json({ error: 'No organization found' }, { status: 400 });
        }

        // Fetch system data in parallel
        const [sops, agents, recentUsers, recentChats] = await Promise.all([
            prisma.sOP.findMany({
                where: { organizationId: orgId },
                select: {
                    title: true,
                    status: true,
                    code: true,
                    updatedAt: true,
                    department: { select: { name: true } },
                },
                orderBy: { updatedAt: 'desc' },
                take: 20,
            }),
            prisma.agent.findMany({
                where: { organizationId: orgId },
                select: { name: true, type: true, status: true },
            }),
            prisma.user.findMany({
                where: { organizationId: orgId },
                select: { name: true, email: true, role: true, createdAt: true },
                orderBy: { createdAt: 'desc' },
                take: 10,
            }),
            prisma.chatSession.findMany({
                where: { user: { organizationId: orgId } },
                select: { title: true, createdAt: true },
                orderBy: { createdAt: 'desc' },
                take: 20,
            }),
        ]);

        const systemContext = {
            organization: {
                totalSOPs: sops.length,
                activeSOPs: sops.filter(s => s.status === 'ACTIVE' as string).length,
                draftSOPs: sops.filter(s => s.status === 'DRAFT' as string).length,
                inReviewSOPs: sops.filter(s => s.status === 'IN_REVIEW' as string).length,
            },
            sops: sops.map(s => ({
                title: s.title,
                status: s.status,
                code: s.code,
                department: s.department?.name,
                lastUpdated: s.updatedAt.toISOString().slice(0, 10),
            })),
            agents: agents.map(a => ({ name: a.name, type: a.type, status: a.status })),
            recentUsers: recentUsers.map(u => ({
                name: u.name || u.email,
                role: u.role,
                joinedAt: u.createdAt.toISOString().slice(0, 10),
            })),
            recentChatActivity: recentChats.length,
            today: new Date().toISOString().slice(0, 10),
        };

        const systemPrompt = await getLevel10Prompt(DEFAULT_PROMPT);

        const completion = await getOpenAI().chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                {
                    role: 'user',
                    content: `Dane systemowe organizacji:\n${JSON.stringify(systemContext, null, 2)}\n\nWygeneruj agendę Level 10 na dziś.`,
                },
            ],
            temperature: 0.7,
            max_tokens: 2000,
            response_format: { type: 'json_object' },
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) {
            return NextResponse.json({ error: 'Empty AI response' }, { status: 502 });
        }

        const result = JSON.parse(content);
        return NextResponse.json(result);
    } catch (error) {
        console.error('[Level10 AI] Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate Level 10 agenda' },
            { status: 500 }
        );
    }
}
