'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText,
    Plus,
    ArrowRight,
    Check,
    Loader2,
    Save,
    Send,
    RefreshCw,
    Upload,
    ChevronRight,
    Sparkles,
    AlertTriangle,
    Network,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { PipelineStepper, PIPELINE_STEPS, type StepStatus } from '@/components/sop-pipeline/PipelineStepper';
import { StepOutputViewer } from '@/components/sop-pipeline/StepOutputViewer';

// ============================================================
// Types
// ============================================================
interface PipelineSOP {
    id: string;
    title: string;
    code: string;
    status: string;
    currentStep: number;
    processData: {
        currentStep: number;
        title: string;
        sourceType: string;
        sourceContent: string;
        stepOutputs: Record<string, unknown>;
        comments: Record<string, string>;
    };
    processLogs: Array<{
        id: string;
        stepNumber: number;
        stepName: string;
        input: string;
        output: string;
        userEdits: string;
        status: string;
    }>;
    createdAt: string;
    updatedAt: string;
}

// ============================================================
// Component
// ============================================================
export default function SOPProcessPage() {
    // Pipeline SOPs list
    const [pipelines, setPipelines] = useState<PipelineSOP[]>([]);
    const [isLoadingList, setIsLoadingList] = useState(true);

    // Active pipeline
    const [activeSOP, setActiveSOP] = useState<PipelineSOP | null>(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);

    // New SOP form
    const [showNewForm, setShowNewForm] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newTranscript, setNewTranscript] = useState('');
    const [sourceType, setSourceType] = useState<'transcript' | 'manual'>('transcript');
    const [isCreating, setIsCreating] = useState(false);

    // Value Chain
    const [valueChainNodeId, setValueChainNodeId] = useState<string | null>(null);

    // ============================================================
    // Load pipeline SOPs
    // ============================================================
    const loadPipelines = useCallback(async () => {
        try {
            setIsLoadingList(true);
            const res = await fetch('/api/sops/process');
            if (res.ok) {
                const data = await res.json();
                setPipelines(data.sops || []);
            }
        } catch (error) {
            console.error('Failed to load pipelines:', error);
        } finally {
            setIsLoadingList(false);
        }
    }, []);

    useEffect(() => {
        loadPipelines();
    }, [loadPipelines]);

    // ============================================================
    // Load active SOP details
    // ============================================================
    const loadSOPDetails = useCallback(async (sopId: string) => {
        try {
            const res = await fetch(`/api/sops/process/${sopId}/step?step=${currentStep}`);
            if (res.ok) {
                const data = await res.json();
                setActiveSOP(data.sop);
                setCurrentStep(data.sop?.processData?.currentStep || 1);
            }
        } catch (error) {
            console.error('Failed to load SOP details:', error);
        }
    }, [currentStep]);

    // ============================================================
    // Create new pipeline SOP
    // ============================================================
    const createPipelineSOP = async () => {
        if (!newTitle.trim()) {
            toast.error('Podaj tytuł SOPa');
            return;
        }
        if (sourceType === 'transcript' && !newTranscript.trim()) {
            toast.error('Wklej transkrypcję lub opis procesu');
            return;
        }

        setIsCreating(true);
        try {
            const res = await fetch('/api/sops/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newTitle.trim(),
                    sourceType,
                    sourceContent: newTranscript.trim(),
                    valueChainNodeId,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                toast.success('Pipeline SOP utworzony!');
                setShowNewForm(false);
                setNewTitle('');
                setNewTranscript('');
                await loadPipelines();
                // Open the new SOP
                setActiveSOP(data.sop);
                setCurrentStep(1);
            } else {
                const err = await res.json();
                toast.error(err.error || 'Błąd tworzenia SOPa');
            }
        } catch {
            toast.error('Błąd połączenia z serwerem');
        } finally {
            setIsCreating(false);
        }
    };

    // ============================================================
    // Generate step output
    // ============================================================
    const handleGenerate = async () => {
        if (!activeSOP) return;

        setIsGenerating(true);
        try {
            const res = await fetch(`/api/sops/process/${activeSOP.id}/step`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    step: currentStep,
                    action: 'generate',
                }),
            });

            if (res.ok) {
                const data = await res.json();
                toast.success(`Krok ${currentStep} wygenerowany!`);
                // Refresh SOP data
                await loadSOPDetails(activeSOP.id);
            } else {
                const err = await res.json();
                toast.error(err.error || 'Błąd generowania');
            }
        } catch {
            toast.error('Błąd połączenia z AI');
        } finally {
            setIsGenerating(false);
        }
    };

    // ============================================================
    // Save edits
    // ============================================================
    const handleSaveEdits = async (editedOutput: string) => {
        if (!activeSOP) return;

        try {
            const res = await fetch(`/api/sops/process/${activeSOP.id}/step`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    step: currentStep,
                    action: 'save_edits',
                    data: editedOutput,
                }),
            });

            if (res.ok) {
                toast.success('Zmiany zapisane');
                await loadSOPDetails(activeSOP.id);
            }
        } catch {
            toast.error('Błąd zapisu');
        }
    };

    // ============================================================
    // Approve step
    // ============================================================
    const handleApproveStep = async () => {
        if (!activeSOP) return;

        try {
            const res = await fetch(`/api/sops/process/${activeSOP.id}/step`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    step: currentStep,
                    action: 'approve',
                }),
            });

            if (res.ok) {
                const data = await res.json();
                toast.success(`Krok ${currentStep} zatwierdzony!`);

                if (data.nextStep && data.nextStep <= 5) {
                    setCurrentStep(data.nextStep);
                }
                await loadSOPDetails(activeSOP.id);
            }
        } catch {
            toast.error('Błąd zatwierdzania');
        }
    };

    // ============================================================
    // Submit to Council
    // ============================================================
    const handleSubmitToCouncil = async () => {
        if (!activeSOP) return;

        try {
            const res = await fetch(`/api/sops/process/${activeSOP.id}/council`, {
                method: 'POST',
            });

            if (res.ok) {
                toast.success('SOP wysłany do Rady Transformacji!');
                await loadPipelines();
                setActiveSOP(null);
            } else {
                const err = await res.json();
                toast.error(err.error || 'Błąd wysyłania');
            }
        } catch {
            toast.error('Błąd połączenia');
        }
    };

    // ============================================================
    // Computed state
    // ============================================================
    const completedSteps = activeSOP?.processLogs
        ?.filter(l => l.status === 'completed')
        .map(l => l.stepNumber) || [];

    const stepStatuses: Record<number, StepStatus> = {};
    PIPELINE_STEPS.forEach(s => {
        if (completedSteps.includes(s.step)) {
            stepStatuses[s.step] = 'completed';
        } else if (s.step === currentStep) {
            stepStatuses[s.step] = isGenerating ? 'active' : 'pending';
        } else {
            stepStatuses[s.step] = 'pending';
        }
    });

    const progress = (completedSteps.length / 5) * 100;

    const currentStepLog = activeSOP?.processLogs?.find(l => l.stepNumber === currentStep);
    const currentOutput = currentStepLog?.output ? {
        raw: currentStepLog.output,
        parsed: (() => {
            try { return JSON.parse(currentStepLog.output); } catch { return undefined; }
        })(),
    } : null;

    // ============================================================
    // Render — List View
    // ============================================================
    if (!activeSOP) {
        return (
            <div className="container max-w-6xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
                            <FileText className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">SOP Pipeline</h1>
                            <p className="text-muted-foreground">5-krokowy pipeline tworzenia SOPów z AI</p>
                        </div>
                    </div>
                    <Button
                        onClick={() => setShowNewForm(true)}
                        className="gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                    >
                        <Plus className="h-4 w-4" />
                        Nowy Pipeline
                    </Button>
                </div>

                {/* New SOP Form */}
                <AnimatePresence>
                    {showNewForm && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6"
                        >
                            <Card className="border-2 border-violet-500/30">
                                <CardHeader>
                                    <CardTitle className="text-lg">Nowy Pipeline SOP</CardTitle>
                                    <CardDescription>
                                        Wklej transkrypcję rozmowy lub opisz proces — AI przeprowadzi go przez 5 kroków
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium mb-1.5 block">Tytuł SOPa</label>
                                            <Input
                                                value={newTitle}
                                                onChange={(e) => setNewTitle(e.target.value)}
                                                placeholder="np. Proces onboardingu klienta"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-1.5 block">Źródło</label>
                                            <Select value={sourceType} onValueChange={(v) => setSourceType(v as 'transcript' | 'manual')}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="transcript">📋 Transkrypcja</SelectItem>
                                                    <SelectItem value="manual">✍️ Opis ręczny</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium mb-1.5 block">
                                            {sourceType === 'transcript' ? 'Transkrypcja' : 'Opis procesu'}
                                        </label>
                                        <Textarea
                                            value={newTranscript}
                                            onChange={(e) => setNewTranscript(e.target.value)}
                                            placeholder={sourceType === 'transcript'
                                                ? 'Wklej transkrypcję rozmowy z Fireflies, Whisper lub innego narzędzia...'
                                                : 'Opisz krok po kroku jak wygląda proces...'
                                            }
                                            className="min-h-[150px]"
                                        />
                                    </div>

                                    <div className="flex items-center gap-3 pt-2">
                                        <Button
                                            onClick={createPipelineSOP}
                                            disabled={isCreating || !newTitle.trim()}
                                            className="gap-2"
                                        >
                                            {isCreating ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Sparkles className="h-4 w-4" />
                                            )}
                                            Rozpocznij Pipeline
                                        </Button>
                                        <Button variant="ghost" onClick={() => setShowNewForm(false)}>
                                            Anuluj
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Pipeline list */}
                {isLoadingList ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : pipelines.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 mb-4">
                                <FileText className="h-8 w-8 text-violet-500" />
                            </div>
                            <h3 className="text-lg font-semibold mb-1">Brak aktywnych pipeline'ów</h3>
                            <p className="text-sm text-muted-foreground mb-6">
                                Rozpocznij od wklejenia transkrypcji lub opisu procesu
                            </p>
                            <Button onClick={() => setShowNewForm(true)} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Utwórz pierwszy Pipeline
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {pipelines.map((sop) => {
                            const sopProgress = sop.processLogs
                                ? (sop.processLogs.filter(l => l.status === 'completed').length / 5) * 100
                                : 0;

                            return (
                                <motion.div
                                    key={sop.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <Card
                                        className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/30 group"
                                        onClick={() => {
                                            setActiveSOP(sop);
                                            setCurrentStep(sop.processData?.currentStep || 1);
                                        }}
                                    >
                                        <CardContent className="p-5">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shrink-0">
                                                        <FileText className="h-5 w-5 text-white" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="font-medium truncate">{sop.title}</h3>
                                                            <Badge variant="outline" className="text-xs shrink-0">
                                                                {sop.code}
                                                            </Badge>
                                                            <Badge
                                                                variant={sop.status === 'APPROVED' ? 'default' : 'secondary'}
                                                                className={cn(
                                                                    "text-xs shrink-0",
                                                                    sop.status === 'IN_PROGRESS' && "bg-blue-500 text-white",
                                                                    sop.status === 'RETURNED' && "bg-amber-500 text-white"
                                                                )}
                                                            >
                                                                {sop.status === 'DRAFT' && '📝 Wersja robocza'}
                                                                {sop.status === 'IN_PROGRESS' && `⚙️ Krok ${sop.processData?.currentStep || 1}/5`}
                                                                {sop.status === 'RETURNED' && '↩️ Do poprawy'}
                                                                {sop.status === 'IN_REVIEW' && '👁️ W przeglądzie'}
                                                                {sop.status === 'APPROVED' && '✅ Zatwierdzony'}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <Progress value={sopProgress} className="h-1.5 flex-1 max-w-[200px]" />
                                                            <span className="text-xs text-muted-foreground">
                                                                {Math.round(sopProgress)}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    // ============================================================
    // Render — Pipeline Detail View (Split)
    // ============================================================
    const currentStepConfig = PIPELINE_STEPS.find(s => s.step === currentStep);

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col">
            {/* Top bar */}
            <div className="border-b bg-background/95 backdrop-blur px-6 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setActiveSOP(null);
                                loadPipelines();
                            }}
                        >
                            ← Pipeline
                        </Button>
                        <div className="h-4 w-px bg-border" />
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono text-xs">{activeSOP.code}</Badge>
                            <h2 className="font-semibold text-sm">{activeSOP.title}</h2>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 mr-4">
                            <Progress value={progress} className="h-1.5 w-24" />
                            <span className="text-xs text-muted-foreground font-mono">
                                {completedSteps.length}/5
                            </span>
                        </div>
                        {completedSteps.length >= 5 && (
                            <Button
                                size="sm"
                                onClick={handleSubmitToCouncil}
                                className="gap-2 bg-gradient-to-r from-teal-500 to-cyan-600"
                            >
                                <Send className="h-3 w-3" />
                                Wyślij do Rady
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Split view */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left — Pipeline stepper */}
                <div className="w-72 border-r bg-muted/30 p-4 overflow-y-auto">
                    <PipelineStepper
                        currentStep={currentStep}
                        completedSteps={completedSteps}
                        stepStatuses={stepStatuses}
                        onStepClick={setCurrentStep}
                        orientation="vertical"
                    />

                    {/* Value Chain link */}
                    <div className="mt-6 pt-4 border-t">
                        <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
                            <Network className="h-3 w-3" />
                            Powiąż z Łańcuchem Wartości
                        </Button>
                    </div>
                </div>

                {/* Right — Step content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-4xl mx-auto p-6 space-y-6">
                        {/* Step header */}
                        {currentStepConfig && (
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg",
                                    currentStepConfig.color
                                )}>
                                    {(() => {
                                        const Icon = currentStepConfig.icon;
                                        return <Icon className="h-6 w-6 text-white" />;
                                    })()}
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold">
                                        Krok {currentStep}: {currentStepConfig.label}
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        {currentStepConfig.description}
                                    </p>
                                </div>
                                {/* Step actions */}
                                <div className="flex items-center gap-2">
                                    {currentStepLog?.status === 'completed' && (
                                        <Badge className="bg-green-500 text-white">
                                            <Check className="h-3 w-3 mr-1" />
                                            Zatwierdzony
                                        </Badge>
                                    )}
                                    {currentOutput && currentStepLog?.status !== 'completed' && (
                                        <Button
                                            size="sm"
                                            onClick={handleApproveStep}
                                            className="gap-2 bg-green-600 hover:bg-green-700"
                                        >
                                            <Check className="h-3 w-3" />
                                            Zatwierdź krok
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step output viewer */}
                        <StepOutputViewer
                            stepNumber={currentStep}
                            output={currentOutput}
                            isGenerating={isGenerating}
                            onGenerate={handleGenerate}
                            onSaveEdits={handleSaveEdits}
                            canGenerate={currentStep === 1 || completedSteps.includes(currentStep - 1)}
                            generateLabel={`Generuj: ${currentStepConfig?.label}`}
                        />

                        {/* Source content preview (Step 1 only) */}
                        {currentStep === 1 && activeSOP.processData?.sourceContent && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2">
                                        <Upload className="h-4 w-4 text-muted-foreground" />
                                        <CardTitle className="text-sm">Dane wejściowe</CardTitle>
                                        <Badge variant="secondary" className="text-xs">
                                            {activeSOP.processData.sourceType === 'transcript' ? 'Transkrypcja' : 'Opis ręczny'}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-[200px]">
                                        <pre className="text-xs whitespace-pre-wrap text-muted-foreground">
                                            {activeSOP.processData.sourceContent}
                                        </pre>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
