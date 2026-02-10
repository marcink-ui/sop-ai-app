'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    X, Wand2, Loader2, CheckCircle2, AlertTriangle,
    ChevronDown, ChevronUp, FileText, Target, BarChart3
} from 'lucide-react';
import { CanvasWidget } from './index';
import { cn } from '@/lib/utils';

interface SOPGeneratorWidgetProps {
    widget: CanvasWidget;
    onRemove: () => void;
}

interface GeneratedStep {
    order: number;
    title: string;
    description: string;
    responsibleRole?: string;
    duration?: string;
}

interface GeneratedSOP {
    title: string;
    description: string;
    purpose: string;
    scope: string;
    steps: GeneratedStep[];
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

type ViewState = 'form' | 'loading' | 'result' | 'error';

export function SOPGeneratorWidget({ widget, onRemove }: SOPGeneratorWidgetProps) {
    const [viewState, setViewState] = useState<ViewState>('form');
    const [processName, setProcessName] = useState('');
    const [processDescription, setProcessDescription] = useState('');
    const [department, setDepartment] = useState('');
    const [generatedSOP, setGeneratedSOP] = useState<GeneratedSOP | null>(null);
    const [tier, setTier] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [expandedSection, setExpandedSection] = useState<string | null>('steps');

    const handleGenerate = async () => {
        if (!processName.trim() || !processDescription.trim()) return;

        setViewState('loading');
        setError('');

        try {
            const res = await fetch('/api/sops/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    processName: processName.trim(),
                    processDescription: processDescription.trim(),
                    department: department.trim() || undefined,
                    language: 'pl',
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || `HTTP ${res.status}`);
            }

            setGeneratedSOP(data.sop);
            setTier(data.tier || 'unknown');
            setViewState('result');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Nieznany błąd');
            setViewState('error');
        }
    };

    const handleReset = () => {
        setViewState('form');
        setGeneratedSOP(null);
        setProcessName('');
        setProcessDescription('');
        setDepartment('');
        setError('');
    };

    const toggleSection = (section: string) => {
        setExpandedSection(prev => prev === section ? null : section);
    };

    const confidenceColor = (score: number) => {
        if (score >= 0.8) return 'text-emerald-500';
        if (score >= 0.5) return 'text-amber-500';
        return 'text-red-500';
    };

    const automationBadge = (level: string) => {
        const colors: Record<string, string> = {
            high: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
            medium: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
            low: 'bg-zinc-500/10 text-zinc-600 border-zinc-500/20',
        };
        return colors[level] || colors.low;
    };

    // ===== FORM STATE =====
    if (viewState === 'form') {
        return (
            <Card className="h-full flex flex-col">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                            <Wand2 className="h-4 w-4 text-white" />
                        </div>
                        <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onRemove}>
                        <X className="h-3 w-3" />
                    </Button>
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                    <Input
                        placeholder="Nazwa procesu..."
                        value={processName}
                        onChange={(e) => setProcessName(e.target.value)}
                        className="h-8 text-sm"
                    />
                    <Textarea
                        placeholder="Opisz proces, który chcesz ustandaryzować..."
                        value={processDescription}
                        onChange={(e) => setProcessDescription(e.target.value)}
                        className="text-sm min-h-[60px] resize-none"
                        rows={3}
                    />
                    <Input
                        placeholder="Dział (opcj.)"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="h-8 text-sm"
                    />
                    <Button
                        size="sm"
                        className="w-full gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                        onClick={handleGenerate}
                        disabled={!processName.trim() || !processDescription.trim()}
                    >
                        <Wand2 className="h-4 w-4" />
                        Generuj SOP
                    </Button>
                </CardContent>
            </Card>
        );
    }

    // ===== LOADING STATE =====
    if (viewState === 'loading') {
        return (
            <Card className="h-full flex flex-col">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Wand2 className="h-4 w-4 text-primary animate-pulse" />
                        <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onRemove}>
                        <X className="h-3 w-3" />
                    </Button>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <div className="relative">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <Wand2 className="h-4 w-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" />
                        </div>
                        <span className="text-sm font-medium">Generuję SOP z AI...</span>
                        <span className="text-xs">Analiza procesu i rekomendacje MUDA</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // ===== ERROR STATE =====
    if (viewState === 'error') {
        return (
            <Card className="h-full flex flex-col border-red-500/20">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onRemove}>
                        <X className="h-3 w-3" />
                    </Button>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col items-center justify-center gap-3">
                    <p className="text-sm text-red-500">{error}</p>
                    <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
                        Spróbuj ponownie
                    </Button>
                </CardContent>
            </Card>
        );
    }

    // ===== RESULT STATE =====
    if (!generatedSOP) return null;

    return (
        <Card className="h-full flex flex-col overflow-hidden">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                        <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                    <CardTitle className="text-sm font-medium truncate max-w-[180px]">
                        {generatedSOP.title}
                    </CardTitle>
                    <Badge
                        variant="outline"
                        className={cn("text-[10px]", confidenceColor(generatedSOP.aiConfidence))}
                    >
                        {Math.round(generatedSOP.aiConfidence * 100)}% AI
                    </Badge>
                    {tier === 'simulated' && (
                        <Badge variant="secondary" className="text-[10px]">Demo</Badge>
                    )}
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleReset}>
                        <Wand2 className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onRemove}>
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto space-y-2 text-xs">
                {/* Description */}
                <p className="text-muted-foreground leading-relaxed">{generatedSOP.description}</p>

                {/* Steps */}
                <button
                    className="w-full flex items-center justify-between py-1 px-2 rounded hover:bg-muted/50 transition-colors"
                    onClick={() => toggleSection('steps')}
                >
                    <span className="flex items-center gap-1 font-medium">
                        <FileText className="h-3 w-3" />
                        Kroki ({generatedSOP.steps.length})
                    </span>
                    {expandedSection === 'steps' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>
                {expandedSection === 'steps' && (
                    <ol className="space-y-1.5 pl-1">
                        {generatedSOP.steps.map((step) => (
                            <li key={step.order} className="border-l-2 border-primary/30 pl-2">
                                <div className="font-medium">{step.order}. {step.title}</div>
                                <div className="text-muted-foreground">{step.description}</div>
                                {(step.responsibleRole || step.duration) && (
                                    <div className="flex gap-2 mt-0.5">
                                        {step.responsibleRole && (
                                            <Badge variant="outline" className="text-[9px] h-4">{step.responsibleRole}</Badge>
                                        )}
                                        {step.duration && (
                                            <Badge variant="secondary" className="text-[9px] h-4">{step.duration}</Badge>
                                        )}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ol>
                )}

                {/* KPIs */}
                {generatedSOP.kpis && generatedSOP.kpis.length > 0 && (
                    <>
                        <button
                            className="w-full flex items-center justify-between py-1 px-2 rounded hover:bg-muted/50 transition-colors"
                            onClick={() => toggleSection('kpis')}
                        >
                            <span className="flex items-center gap-1 font-medium">
                                <Target className="h-3 w-3" />
                                KPI ({generatedSOP.kpis.length})
                            </span>
                            {expandedSection === 'kpis' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </button>
                        {expandedSection === 'kpis' && (
                            <ul className="space-y-0.5 pl-3">
                                {generatedSOP.kpis.map((kpi, i) => (
                                    <li key={i} className="text-muted-foreground">• {kpi}</li>
                                ))}
                            </ul>
                        )}
                    </>
                )}

                {/* MUDA Analysis */}
                {generatedSOP.mudaAnalysis && generatedSOP.mudaAnalysis.length > 0 && (
                    <>
                        <button
                            className="w-full flex items-center justify-between py-1 px-2 rounded hover:bg-muted/50 transition-colors"
                            onClick={() => toggleSection('muda')}
                        >
                            <span className="flex items-center gap-1 font-medium">
                                <BarChart3 className="h-3 w-3" />
                                MUDA ({generatedSOP.mudaAnalysis.length})
                            </span>
                            {expandedSection === 'muda' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </button>
                        {expandedSection === 'muda' && (
                            <div className="space-y-1.5 pl-1">
                                {generatedSOP.mudaAnalysis.map((muda, i) => (
                                    <div key={i} className="border-l-2 border-amber-500/30 pl-2">
                                        <div className="flex items-center gap-1">
                                            <span className="font-medium">{muda.wasteType}</span>
                                            <Badge variant="outline" className={cn("text-[9px] h-4", automationBadge(muda.automationPotential))}>
                                                AI {muda.automationPotential}
                                            </Badge>
                                        </div>
                                        <div className="text-muted-foreground">{muda.description}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Tags */}
                {generatedSOP.suggestedTags && generatedSOP.suggestedTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                        {generatedSOP.suggestedTags.map((tag, i) => (
                            <Badge key={i} variant="secondary" className="text-[9px]">{tag}</Badge>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
