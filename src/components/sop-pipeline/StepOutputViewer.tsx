'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Sparkles,
    Edit3,
    Check,
    X,
    Copy,
    Download,
    Eye,
    Code2,
    Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { SOPStepsTable, type SOPStep } from './SOPStepsTable';
import { MUDACards, type MUDAFinding } from './MUDACards';

// ============================================================
// Types
// ============================================================
interface StepOutput {
    raw?: string;
    parsed?: {
        sop?: {
            title?: string;
            purpose?: string;
            scope?: string;
            steps?: SOPStep[];
            roles?: string[];
            tools?: string[];
            kpis?: string[];
        };
        muda?: {
            findings?: MUDAFinding[];
            overallScore?: number;
            summary?: string;
            automationPotential?: number;
        };
        architect?: {
            agents?: Array<{ name: string; type: string; description: string; scope: string }>;
            integrations?: Array<{ name: string; type: string; description: string }>;
            architecture?: string;
        };
        generator?: {
            configs?: Array<{
                name: string;
                type: string;
                systemPrompt?: string;
                tools?: string[];
                triggers?: string[];
            }>;
        };
        judge?: {
            verdict?: 'APPROVED' | 'NEEDS_REVISION' | 'REJECTED';
            score?: number;
            feedback?: string;
            criteria?: Array<{ name: string; score: number; comment: string }>;
        };
        // Generic fallback
        [key: string]: unknown;
    };
}

interface StepOutputViewerProps {
    stepNumber: number;
    output: StepOutput | null;
    isGenerating: boolean;
    onGenerate: () => void;
    onSaveEdits: (editedOutput: string) => void;
    canGenerate: boolean;
    generateLabel?: string;
}

// ============================================================
// Component
// ============================================================
export function StepOutputViewer({
    stepNumber,
    output,
    isGenerating,
    onGenerate,
    onSaveEdits,
    canGenerate,
    generateLabel = 'Generuj z AI',
}: StepOutputViewerProps) {
    const [viewMode, setViewMode] = useState<'structured' | 'raw'>('structured');
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState('');

    const hasOutput = !!output?.raw || !!output?.parsed;

    const startEditing = () => {
        setEditContent(output?.raw || JSON.stringify(output?.parsed, null, 2) || '');
        setIsEditing(true);
    };

    const cancelEditing = () => {
        setIsEditing(false);
        setEditContent('');
    };

    const saveEdits = () => {
        onSaveEdits(editContent);
        setIsEditing(false);
        toast.success('Zmiany zapisane');
    };

    const copyOutput = () => {
        const text = output?.raw || JSON.stringify(output?.parsed, null, 2) || '';
        navigator.clipboard.writeText(text);
        toast.success('Skopiowano do schowka');
    };

    // ============================================================
    // Empty state
    // ============================================================
    if (!hasOutput && !isGenerating) {
        return (
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 mb-4">
                        <Sparkles className="h-7 w-7 text-violet-500" />
                    </div>
                    <h3 className="text-lg font-semibold mb-1">
                        Krok {stepNumber} — gotowy do generowania
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                        AI przeanalizuje dane i wygeneruje wynik. Będziesz mógł edytować wszystko przed zatwierdzeniem.
                    </p>
                    <Button
                        onClick={onGenerate}
                        disabled={!canGenerate}
                        size="lg"
                        className="gap-2"
                    >
                        <Sparkles className="h-4 w-4" />
                        {generateLabel}
                    </Button>
                </CardContent>
            </Card>
        );
    }

    // ============================================================
    // Loading state
    // ============================================================
    if (isGenerating) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                    <h3 className="text-lg font-semibold mb-1">AI generuje...</h3>
                    <p className="text-sm text-muted-foreground">
                        To może potrwać 15-30 sekund
                    </p>
                </CardContent>
            </Card>
        );
    }

    // ============================================================
    // Output display
    // ============================================================
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Wynik AI — Krok {stepNumber}</CardTitle>
                    <div className="flex items-center gap-2">
                        {/* View mode toggle */}
                        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'structured' | 'raw')}>
                            <TabsList className="h-8">
                                <TabsTrigger value="structured" className="text-xs gap-1.5 h-6 px-2">
                                    <Eye className="h-3 w-3" />
                                    Widok
                                </TabsTrigger>
                                <TabsTrigger value="raw" className="text-xs gap-1.5 h-6 px-2">
                                    <Code2 className="h-3 w-3" />
                                    Raw
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>

                        {/* Actions */}
                        <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={copyOutput} title="Kopiuj">
                                <Copy className="h-3 w-3" />
                            </Button>
                            {!isEditing ? (
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={startEditing} title="Edytuj">
                                    <Edit3 className="h-3 w-3" />
                                </Button>
                            ) : (
                                <>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={saveEdits} title="Zapisz">
                                        <Check className="h-3 w-3 text-green-600" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={cancelEditing} title="Anuluj">
                                        <X className="h-3 w-3 text-red-600" />
                                    </Button>
                                </>
                            )}
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onGenerate} title="Regeneruj">
                                <Sparkles className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {isEditing ? (
                    <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[400px] font-mono text-xs"
                    />
                ) : viewMode === 'raw' ? (
                    <ScrollArea className="h-[500px]">
                        <pre className="text-xs font-mono whitespace-pre-wrap p-4 bg-muted rounded-lg">
                            {output?.raw || JSON.stringify(output?.parsed, null, 2)}
                        </pre>
                    </ScrollArea>
                ) : (
                    <ScrollArea className="h-[500px]">
                        <div className="space-y-6">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {(() => {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                const p = output?.parsed as any;
                                if (!p) return null;

                                // ── Mock / Demo output ──
                                if (p._mock) {
                                    return (
                                        <div className="flex flex-col items-center py-8 text-center space-y-4">
                                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/30">
                                                <Sparkles className="h-7 w-7 text-amber-500" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-semibold mb-1">Tryb Demo</h3>
                                                <p className="text-sm text-muted-foreground max-w-md">
                                                    {p.message || 'Konfiguracja klucza API wymagana dla prawdziwej analizy AI.'}
                                                </p>
                                            </div>
                                            <Badge variant="outline" className="text-xs">
                                                Krok {p.step}: {p.stepName}
                                            </Badge>
                                            <p className="text-xs text-muted-foreground">
                                                Możesz zatwierdzić ten krok aby przejść dalej, lub skonfiguruj klucz OpenAI aby uzyskać prawdziwą analizę AI.
                                            </p>
                                        </div>
                                    );
                                }

                                // ── Step 1: SOP Generator (flat: title, purpose, scope, steps, roles, kpis) ──
                                if (p.title && (p.steps || p.purpose || p.scope)) {
                                    const steps = p.steps as SOPStep[] | undefined;
                                    const roles = p.roles as string[] | undefined;
                                    const kpis = p.kpis as Array<{ name: string; target: string; unit?: string }> | undefined;
                                    return (
                                        <div className="space-y-4">
                                            <div>
                                                <h3 className="text-lg font-semibold">{p.title}</h3>
                                                {p.purpose && <p className="text-sm text-muted-foreground mt-1"><strong>Cel:</strong> {p.purpose}</p>}
                                                {p.scope && <p className="text-sm text-muted-foreground mt-0.5"><strong>Zakres:</strong> {p.scope}</p>}
                                            </div>
                                            {steps && steps.length > 0 && (
                                                <SOPStepsTable
                                                    steps={steps}
                                                    onUpdate={(updated) => {
                                                        onSaveEdits(JSON.stringify({ ...p, steps: updated }));
                                                    }}
                                                />
                                            )}
                                            {roles && roles.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-medium mb-2">Role</h4>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {roles.map((r, i) => <Badge key={i} variant="outline">{r}</Badge>)}
                                                    </div>
                                                </div>
                                            )}
                                            {kpis && kpis.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-medium mb-2">KPI</h4>
                                                    <div className="grid gap-1">
                                                        {kpis.map((k, i) => (
                                                            <div key={i} className="flex items-center justify-between p-2 rounded border text-sm">
                                                                <span>{k.name}</span>
                                                                <Badge variant="secondary">{k.target}{k.unit ? ` ${k.unit}` : ''}</Badge>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                }

                                // ── Step 2: MUDA Auditor (flat: findings, summary, overallScore, optimizedSteps) ──
                                if (p.findings && Array.isArray(p.findings)) {
                                    return (
                                        <div className="space-y-4">
                                            <MUDACards
                                                findings={p.findings}
                                                overallScore={p.overallScore}
                                                summary={p.summary}
                                            />
                                            {p.optimizedSteps && Array.isArray(p.optimizedSteps) && p.optimizedSteps.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-medium mb-2">Zoptymalizowane kroki</h4>
                                                    <SOPStepsTable steps={p.optimizedSteps} onUpdate={() => { }} />
                                                </div>
                                            )}
                                        </div>
                                    );
                                }

                                // ── Step 3: AI Architect (flat: agents, integrations, architecture, recommendations) ──
                                if (p.agents && Array.isArray(p.agents)) {
                                    return (
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="text-sm font-medium mb-2">Zaproponowani Agenci ({p.agents.length})</h4>
                                                <div className="grid gap-2">
                                                    {p.agents.map((agent: any, i: number) => (
                                                        <Card key={i} className="p-3">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-sm font-medium">{agent.name}</span>
                                                                <Badge variant="secondary" className="text-xs">{agent.type}</Badge>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground">{agent.purpose || agent.description}</p>
                                                            {agent.tools && <p className="text-xs text-primary mt-1">Narzędzia: {agent.tools.join(', ')}</p>}
                                                            {agent.estimatedROI && <p className="text-xs text-green-600 mt-0.5">ROI: {agent.estimatedROI}</p>}
                                                        </Card>
                                                    ))}
                                                </div>
                                            </div>
                                            {p.integrations && Array.isArray(p.integrations) && p.integrations.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-medium mb-2">Integracje</h4>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {p.integrations.map((int: any, i: number) => (
                                                            <Badge key={i} variant="outline">{int.system}: {int.purpose}</Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {p.architecture && (
                                                <div className="text-sm bg-muted/50 p-3 rounded-lg space-y-1">
                                                    <p><strong>Poziom automatyzacji:</strong> {p.architecture.automationLevel}%</p>
                                                    {p.architecture.humanSteps && <p>Kroki ludzkie: {p.architecture.humanSteps.join(', ')}</p>}
                                                    {p.architecture.aiSteps && <p>Kroki AI: {p.architecture.aiSteps.join(', ')}</p>}
                                                </div>
                                            )}
                                            {p.recommendations && <p className="text-sm text-muted-foreground italic">{p.recommendations}</p>}
                                        </div>
                                    );
                                }

                                // ── Step 4: AI Generator (flat: agentConfig) ──
                                if (p.agentConfig) {
                                    const cfg = p.agentConfig;
                                    return (
                                        <div className="space-y-4">
                                            <Card className="p-4">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="text-base font-semibold">{cfg.name}</span>
                                                    <Badge variant="outline" className="text-xs">{cfg.code}</Badge>
                                                    <Badge variant="secondary" className="text-xs">{cfg.type}</Badge>
                                                </div>
                                                <div className="space-y-3">
                                                    <div>
                                                        <h5 className="text-xs font-medium text-muted-foreground mb-1">Model / Temperature</h5>
                                                        <p className="text-sm">{cfg.model} · temp={cfg.temperature}</p>
                                                    </div>
                                                    {cfg.masterPrompt && (
                                                        <div>
                                                            <h5 className="text-xs font-medium text-muted-foreground mb-1">System Prompt</h5>
                                                            <pre className="text-xs bg-muted rounded p-3 font-mono whitespace-pre-wrap max-h-[200px] overflow-auto">
                                                                {cfg.masterPrompt}
                                                            </pre>
                                                        </div>
                                                    )}
                                                    {cfg.tools && cfg.tools.length > 0 && (
                                                        <div>
                                                            <h5 className="text-xs font-medium text-muted-foreground mb-1">Narzędzia</h5>
                                                            <div className="flex flex-wrap gap-1">
                                                                {cfg.tools.map((t: any, j: number) => (
                                                                    <Badge key={j} variant="secondary" className="text-[10px]">
                                                                        {typeof t === 'string' ? t : t.name}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {cfg.testCases && cfg.testCases.length > 0 && (
                                                        <div>
                                                            <h5 className="text-xs font-medium text-muted-foreground mb-1">Scenariusze testowe ({cfg.testCases.length})</h5>
                                                            {cfg.testCases.map((tc: any, i: number) => (
                                                                <div key={i} className="text-xs border rounded p-2 mb-1">
                                                                    <p><strong>Input:</strong> {tc.input}</p>
                                                                    <p className="text-muted-foreground"><strong>Oczekiwane:</strong> {tc.expectedBehavior}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </Card>
                                        </div>
                                    );
                                }

                                // ── Step 5: Prompt Judge (flat: scores, issues, verdict, summary) ──
                                if (p.verdict || p.scores) {
                                    return (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <Badge className={cn(
                                                    "text-sm px-3 py-1",
                                                    p.verdict === 'APPROVE' || p.verdict === 'APPROVED'
                                                        ? "bg-green-500 text-white"
                                                        : p.verdict === 'NEEDS_WORK' || p.verdict === 'NEEDS_REVISION'
                                                            ? "bg-amber-500 text-white"
                                                            : "bg-red-500 text-white"
                                                )}>
                                                    {(p.verdict === 'APPROVE' || p.verdict === 'APPROVED') && '✅ Zatwierdzony'}
                                                    {(p.verdict === 'NEEDS_WORK' || p.verdict === 'NEEDS_REVISION') && '⚠️ Wymaga poprawek'}
                                                    {p.verdict === 'REJECT' && '❌ Odrzucony'}
                                                </Badge>
                                                {p.scores?.overall !== undefined && (
                                                    <span className="text-lg font-bold">{p.scores.overall}/10</span>
                                                )}
                                            </div>
                                            {p.summary && <p className="text-sm bg-muted/50 p-3 rounded-lg">{p.summary}</p>}
                                            {p.scores && (
                                                <div className="space-y-2">
                                                    <h4 className="text-sm font-medium">Oceny szczegółowe</h4>
                                                    {Object.entries(p.scores).filter(([k]) => k !== 'overall').map(([key, val]) => (
                                                        <div key={key} className="flex items-center justify-between p-2 rounded border">
                                                            <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                                            <Badge variant={(val as number) >= 7 ? 'default' : 'secondary'}>
                                                                {val as number}/10
                                                            </Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {p.issues && Array.isArray(p.issues) && p.issues.length > 0 && (
                                                <div className="space-y-2">
                                                    <h4 className="text-sm font-medium">Problemy ({p.issues.length})</h4>
                                                    {p.issues.map((issue: any, i: number) => (
                                                        <div key={i} className={cn(
                                                            "p-2 rounded border text-xs",
                                                            issue.severity === 'HIGH' && "border-red-300 bg-red-50 dark:bg-red-900/10",
                                                            issue.severity === 'MEDIUM' && "border-amber-300 bg-amber-50 dark:bg-amber-900/10",
                                                        )}>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Badge variant="outline" className="text-[10px]">{issue.severity}</Badge>
                                                                <span className="font-medium">{issue.area}</span>
                                                            </div>
                                                            <p>{issue.description}</p>
                                                            {issue.fix && <p className="text-green-600 mt-0.5">→ {issue.fix}</p>}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                }

                                // ── Fallback: raw JSON display ──
                                if (output?.raw) {
                                    return (
                                        <div className="text-sm whitespace-pre-wrap">
                                            {output.raw}
                                        </div>
                                    );
                                }

                                return null;
                            })()}
                        </div>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    );
}
