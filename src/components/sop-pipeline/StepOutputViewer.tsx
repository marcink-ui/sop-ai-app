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
                            {/* Step 1: SOP output */}
                            {output?.parsed?.sop && (
                                <div className="space-y-4">
                                    {output.parsed.sop.title && (
                                        <div>
                                            <h3 className="text-lg font-semibold">{output.parsed.sop.title}</h3>
                                            {output.parsed.sop.purpose && (
                                                <p className="text-sm text-muted-foreground mt-1">{output.parsed.sop.purpose}</p>
                                            )}
                                        </div>
                                    )}
                                    {output.parsed.sop.steps && output.parsed.sop.steps.length > 0 && (
                                        <SOPStepsTable
                                            steps={output.parsed.sop.steps}
                                            onUpdate={(steps) => {
                                                // Update parsed output
                                                const updated = { ...output.parsed, sop: { ...output.parsed!.sop, steps } };
                                                onSaveEdits(JSON.stringify(updated));
                                            }}
                                        />
                                    )}
                                    {output.parsed.sop.roles && output.parsed.sop.roles.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-medium mb-2">Role</h4>
                                            <div className="flex flex-wrap gap-1.5">
                                                {output.parsed.sop.roles.map((r, i) => (
                                                    <Badge key={i} variant="outline">{r}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 2: MUDA output */}
                            {output?.parsed?.muda && (
                                <MUDACards
                                    findings={output.parsed.muda.findings || []}
                                    overallScore={output.parsed.muda.overallScore}
                                    summary={output.parsed.muda.summary}
                                />
                            )}

                            {/* Step 3: Architect output */}
                            {output?.parsed?.architect && (
                                <div className="space-y-4">
                                    {output.parsed.architect.agents && (
                                        <div>
                                            <h4 className="text-sm font-medium mb-2">Zaproponowani Agenci</h4>
                                            <div className="grid gap-2">
                                                {output.parsed.architect.agents.map((agent, i) => (
                                                    <Card key={i} className="p-3">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-sm font-medium">{agent.name}</span>
                                                            <Badge variant="secondary" className="text-xs">{agent.type}</Badge>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">{agent.description}</p>
                                                        {agent.scope && (
                                                            <p className="text-xs text-primary mt-1">Zakres: {agent.scope}</p>
                                                        )}
                                                    </Card>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 4: Generator output */}
                            {output?.parsed?.generator && (
                                <div className="space-y-4">
                                    {output.parsed.generator.configs?.map((config, i) => (
                                        <Card key={i} className="p-3">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-sm font-medium">{config.name}</span>
                                                <Badge variant="outline" className="text-xs">{config.type}</Badge>
                                            </div>
                                            {config.systemPrompt && (
                                                <pre className="text-xs bg-muted rounded p-2 font-mono whitespace-pre-wrap mb-2">
                                                    {config.systemPrompt}
                                                </pre>
                                            )}
                                            {config.tools && config.tools.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {config.tools.map((t, j) => (
                                                        <Badge key={j} variant="secondary" className="text-[10px]">{t}</Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </Card>
                                    ))}
                                </div>
                            )}

                            {/* Step 5: Judge output */}
                            {output?.parsed?.judge && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Badge className={cn(
                                            "text-sm px-3 py-1",
                                            output.parsed.judge.verdict === 'APPROVED'
                                                ? "bg-green-500 text-white"
                                                : output.parsed.judge.verdict === 'NEEDS_REVISION'
                                                    ? "bg-amber-500 text-white"
                                                    : "bg-red-500 text-white"
                                        )}>
                                            {output.parsed.judge.verdict === 'APPROVED' && '✅ Zatwierdzony'}
                                            {output.parsed.judge.verdict === 'NEEDS_REVISION' && '⚠️ Wymaga poprawek'}
                                            {output.parsed.judge.verdict === 'REJECTED' && '❌ Odrzucony'}
                                        </Badge>
                                        {output.parsed.judge.score !== undefined && (
                                            <span className="text-lg font-bold">{output.parsed.judge.score}/10</span>
                                        )}
                                    </div>
                                    {output.parsed.judge.feedback && (
                                        <p className="text-sm bg-muted/50 p-3 rounded-lg">{output.parsed.judge.feedback}</p>
                                    )}
                                    {output.parsed.judge.criteria && (
                                        <div className="space-y-2">
                                            {output.parsed.judge.criteria.map((c, i) => (
                                                <div key={i} className="flex items-center justify-between p-2 rounded border">
                                                    <span className="text-sm">{c.name}</span>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={c.score >= 7 ? 'default' : 'secondary'}>
                                                            {c.score}/10
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Fallback: raw text if no parsed data matches */}
                            {!output?.parsed?.sop && !output?.parsed?.muda &&
                                !output?.parsed?.architect && !output?.parsed?.generator &&
                                !output?.parsed?.judge && output?.raw && (
                                    <div className="text-sm whitespace-pre-wrap">
                                        {output.raw}
                                    </div>
                                )}
                        </div>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    );
}
