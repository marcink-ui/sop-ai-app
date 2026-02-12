import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * GET /api/methodology/canvas
 * 
 * Returns AI Canvas data for the current organization.
 * Used by pipeline agents as knowledge context.
 * 
 * Query params:
 *   ?departmentId=xxx  — filter by department
 *   ?format=agent      — return condensed format optimized for AI agent context
 */
export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const organizationId = (session.user as Record<string, unknown>).organizationId as string | null;
        if (!organizationId) {
            return NextResponse.json({ error: 'No organization' }, { status: 400 });
        }

        const { searchParams } = new URL(request.url);
        const departmentId = searchParams.get('departmentId');
        const format = searchParams.get('format'); // 'agent' | null
        const include = searchParams.get('include'); // 'instructions' | null

        // Load methodology instructions if requested
        let methodologyInstructions: string | null = null;
        if (include === 'instructions') {
            const instructionsPath = join(process.cwd(), '..', '..', 'methodology', 'ai-canvas-instructions.md');
            if (existsSync(instructionsPath)) {
                const raw = readFileSync(instructionsPath, 'utf-8');
                // Extract key sections (condensed for agent context - first 2000 chars covers structure)
                const sections = raw.split(/^## /m).slice(0, 6);
                methodologyInstructions = sections.map(s => `## ${s.trim()}`).join('\n\n').slice(0, 4000);
            }
        }

        // Fetch canvases
        const canvases = await prisma.canvas.findMany({
            where: {
                organizationId,
                status: { in: ['ACTIVE', 'DRAFT'] },
                ...(departmentId ? { departmentId } : {}),
            },
            include: {
                department: { select: { id: true, name: true } },
            },
            orderBy: { updatedAt: 'desc' },
        });

        // Fetch organization context (companyContext + canvasData)
        const org = await prisma.organization.findUnique({
            where: { id: organizationId },
            select: {
                name: true,
                companyContext: true,
                canvasData: true,
            },
        });

        if (format === 'agent') {
            // Condensed format for AI agents — structured text
            const parts: string[] = [];

            parts.push(`# Kontekst organizacji: ${org?.name || 'N/A'}`);

            // Company context
            const ctx = org?.companyContext as Record<string, unknown> | null;
            if (ctx) {
                const docs = ctx.importedDocs as Array<Record<string, unknown>> | undefined;
                if (docs?.length) {
                    parts.push(`\n## Przeanalizowane dokumenty (${docs.length})`);
                    docs.forEach((doc) => {
                        parts.push(`- ${doc.title}: ${doc.summary} (SOPy: ${doc.sopCount}, Role: ${doc.roleCount})`);
                    });
                }

                const vcDrafts = ctx.valueChainDrafts as Array<Record<string, unknown>> | undefined;
                if (vcDrafts?.length) {
                    parts.push(`\n## Łańcuchy Wartości — drafty (${vcDrafts.length})`);
                    vcDrafts.forEach((vc) => {
                        const stages = vc.stages as Array<Record<string, unknown>> | undefined;
                        parts.push(`- ${vc.name} (segment: ${vc.segment || 'N/A'}): ${stages?.length || 0} etapów`);
                    });
                }
            }

            // Canvas data (structured AI Canvas per department)
            const canvasDataRaw = org?.canvasData as Record<string, unknown> | null;
            if (canvasDataRaw) {
                parts.push(`\n## AI Canvas (dane backoffice)`);
                const departments = Object.keys(canvasDataRaw);
                departments.forEach((dept) => {
                    const deptData = canvasDataRaw[dept] as Record<string, unknown>;
                    parts.push(`\n### ${dept}`);
                    if (deptData.processes) {
                        const procs = deptData.processes as Array<Record<string, unknown>>;
                        parts.push(`Procesy (${procs.length}):`);
                        procs.forEach((p) => {
                            parts.push(`  - ${p.name}: bol=${p.pain_level}, automatyzacja=${p.automation_potential_percent}%, czas=${p.current_time_min}min`);
                        });
                    }
                    if (deptData.pain_points) {
                        const pains = deptData.pain_points as Array<Record<string, unknown>>;
                        parts.push(`Pain points (${pains.length}):`);
                        pains.forEach((p) => {
                            parts.push(`  - ${p.problem} (impact: ${p.impact}, ~${p.estimated_cost_monthly_pln} PLN/mies.)`);
                        });
                    }
                    if (deptData.goals_2026) {
                        const goals = deptData.goals_2026 as Array<Record<string, unknown>>;
                        parts.push(`Cele 2026 (${goals.length}):`);
                        goals.forEach((g) => {
                            parts.push(`  - [${g.priority}] ${g.goal}: ${g.current_value} → ${g.target_value}`);
                        });
                    }
                });
            }

            // DB Canvas records
            if (canvases.length > 0) {
                parts.push(`\n## Canvasy w systemie (${canvases.length})`);
                canvases.forEach((c) => {
                    parts.push(`\n### ${c.title}${c.department ? ` (${c.department.name})` : ''} [${c.status}]`);
                    const sections = c.sections as Array<Record<string, unknown>> | null;
                    if (sections) {
                        sections.forEach((s) => {
                            parts.push(`- ${s.title}: ${typeof s.content === 'string' ? s.content.slice(0, 200) : JSON.stringify(s.content).slice(0, 200)}`);
                        });
                    }
                });
            }

            return NextResponse.json({
                context: parts.join('\n'),
                canvasCount: canvases.length,
                hasCompanyContext: !!ctx,
                hasCanvasData: !!canvasDataRaw,
                ...(methodologyInstructions ? { methodologyInstructions } : {}),
            });
        }

        // Default: return full structured data
        return NextResponse.json({
            canvases: canvases.map(c => ({
                id: c.id,
                title: c.title,
                subtitle: c.subtitle,
                status: c.status,
                department: c.department,
                sections: c.sections,
                metadata: c.metadata,
                updatedAt: c.updatedAt,
            })),
            companyContext: org?.companyContext || null,
            canvasData: org?.canvasData || null,
            organizationName: org?.name,
            ...(methodologyInstructions ? { methodologyInstructions } : {}),
        });

    } catch (error) {
        console.error('Methodology canvas error:', error);
        return NextResponse.json({
            error: 'Failed to retrieve canvas data',
            details: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 });
    }
}

/**
 * POST /api/methodology/canvas
 * 
 * Saves/updates AI Canvas data per department.
 * Body: { departmentKey: string, data: CanvasYAML-like object }
 */
export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const role = session.user.role as string;
        if (!['ADMIN', 'MANAGER', 'SPONSOR', 'META_ADMIN'].includes(role)) {
            return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        }

        const organizationId = (session.user as Record<string, unknown>).organizationId as string | null;
        if (!organizationId) {
            return NextResponse.json({ error: 'No organization' }, { status: 400 });
        }

        const { departmentKey, data } = await request.json();

        if (!departmentKey || !data) {
            return NextResponse.json({ error: 'departmentKey and data are required' }, { status: 400 });
        }

        // Merge into Organization.canvasData
        const org = await prisma.organization.findUnique({
            where: { id: organizationId },
            select: { canvasData: true },
        });

        const existing = (org?.canvasData as Record<string, unknown>) || {};

        await prisma.organization.update({
            where: { id: organizationId },
            data: {
                canvasData: {
                    ...existing,
                    [departmentKey]: {
                        ...data,
                        updatedAt: new Date().toISOString(),
                        updatedBy: session.user.id,
                    },
                } as Record<string, unknown>,
            },
        });

        return NextResponse.json({
            success: true,
            departmentKey,
            message: `Canvas AI dla "${departmentKey}" zapisany`,
        });

    } catch (error) {
        console.error('Canvas save error:', error);
        return NextResponse.json({
            error: 'Failed to save canvas data',
            details: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 });
    }
}
