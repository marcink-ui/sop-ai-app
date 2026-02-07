'use client';

import { useState, useCallback, useEffect } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import {
    Clock,
    CircleDollarSign,
    Brain,
    Zap,
    Save,
    Loader2,
    Sparkles,
    Info,
    Link2,
    User,
    FileText,
    TrendingUp,
    Calculator,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateROIScore, ROIScoreCell } from './ROIScoreCell';

// ============================================================
// TYPES
// ============================================================

export interface ValueChainNodeData {
    id: string;
    label: string;
    description?: string | null;
    type: string;

    // ROI Metrics (0-10 scale)
    timeIntensity?: number | null;
    capitalIntensity?: number | null;
    complexity?: number | null;
    automationPotential?: number | null;

    // Additional ROI data
    estimatedHours?: number | null;
    estimatedCostPLN?: number | null;
    currentFTE?: number | null;

    // AI Analysis
    aiAnalysisResult?: Record<string, unknown> | null;
    lastAnalyzedAt?: string | null;

    // Links
    sopId?: string | null;
    agentId?: string | null;

    // Metadata
    data?: Record<string, unknown> | null;
}

export interface SOP {
    id: string;
    name: string;
}

export interface Agent {
    id: string;
    name: string;
}

interface ValueChainNodeSheetProps {
    node: ValueChainNodeData | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (id: string, data: Partial<ValueChainNodeData>) => Promise<void>;
    onAnalyze?: (id: string) => Promise<void>;
    availableSOPs?: SOP[];
    availableAgents?: Agent[];
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getIntensityColor(value: number): string {
    if (value <= 3) return 'text-emerald-600 dark:text-emerald-400';
    if (value <= 6) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
}

function getAutomationColor(value: number): string {
    if (value >= 7) return 'text-emerald-600 dark:text-emerald-400';
    if (value >= 4) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
}

// ============================================================
// SLIDER FIELD COMPONENT
// ============================================================

interface SliderFieldProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    icon: React.ReactNode;
    tooltip: string;
    inverted?: boolean; // For automation potential where higher is better
}

function SliderField({ label, value, onChange, icon, tooltip, inverted = false }: SliderFieldProps) {
    const colorClass = inverted ? getAutomationColor(value) : getIntensityColor(value);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {icon}
                    <Label className="text-sm font-medium">{label}</Label>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                                <p className="text-xs">{tooltip}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <Badge variant="outline" className={cn('font-mono text-sm', colorClass)}>
                    {value}/10
                </Badge>
            </div>
            <Slider
                value={[value]}
                onValueChange={([v]) => onChange(v)}
                min={0}
                max={10}
                step={1}
                className="w-full"
            />
        </div>
    );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function ValueChainNodeSheet({
    node,
    isOpen,
    onClose,
    onSave,
    onAnalyze,
    availableSOPs = [],
    availableAgents = [],
}: ValueChainNodeSheetProps) {
    // Form state
    const [formData, setFormData] = useState<Partial<ValueChainNodeData>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Initialize form when node changes
    useEffect(() => {
        if (node) {
            setFormData({
                label: node.label,
                description: node.description,
                timeIntensity: node.timeIntensity ?? 5,
                capitalIntensity: node.capitalIntensity ?? 5,
                complexity: node.complexity ?? 5,
                automationPotential: node.automationPotential ?? 5,
                estimatedHours: node.estimatedHours,
                estimatedCostPLN: node.estimatedCostPLN,
                currentFTE: node.currentFTE,
                sopId: node.sopId,
                agentId: node.agentId,
            });
            setHasChanges(false);
        }
    }, [node]);

    // Update field
    const updateField = useCallback(<K extends keyof ValueChainNodeData>(
        field: K,
        value: ValueChainNodeData[K]
    ) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    }, []);

    // Save handler
    const handleSave = useCallback(async () => {
        if (!node || !hasChanges) return;

        setIsSaving(true);
        try {
            await onSave(node.id, formData);
            setHasChanges(false);
            toast.success('Zapisano zmiany');
        } catch (error) {
            toast.error('Błąd podczas zapisywania');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    }, [node, formData, hasChanges, onSave]);

    // Analyze handler
    const handleAnalyze = useCallback(async () => {
        if (!node || !onAnalyze) return;

        setIsAnalyzing(true);
        try {
            await onAnalyze(node.id);
            toast.success('Analiza AI zakończona');
        } catch (error) {
            toast.error('Błąd podczas analizy AI');
            console.error(error);
        } finally {
            setIsAnalyzing(false);
        }
    }, [node, onAnalyze]);

    // Calculate ROI score
    const roiScore = calculateROIScore({
        timeIntensity: formData.timeIntensity ?? 5,
        capitalIntensity: formData.capitalIntensity ?? 5,
        complexity: formData.complexity ?? 5,
        automationPotential: formData.automationPotential ?? 5,
    });

    if (!node) return null;

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
                <SheetHeader>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                            {node.type}
                        </Badge>
                        {hasChanges && (
                            <Badge variant="secondary" className="text-xs">
                                Niezapisane zmiany
                            </Badge>
                        )}
                    </div>
                    <SheetTitle className="text-xl">{node.label}</SheetTitle>
                    <SheetDescription>
                        Edytuj metryki ROI i powiązania dla tego węzła
                    </SheetDescription>
                </SheetHeader>

                <div className="py-6 space-y-8">
                    {/* Basic Info Section */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                            Informacje podstawowe
                        </h3>

                        <div className="space-y-3">
                            <div>
                                <Label htmlFor="label">Nazwa</Label>
                                <Input
                                    id="label"
                                    value={formData.label || ''}
                                    onChange={(e) => updateField('label', e.target.value)}
                                    className="mt-1.5"
                                />
                            </div>

                            <div>
                                <Label htmlFor="description">Opis</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description || ''}
                                    onChange={(e) => updateField('description', e.target.value)}
                                    className="mt-1.5 min-h-[80px]"
                                    placeholder="Opisz ten węzeł łańcucha wartości..."
                                />
                            </div>
                        </div>
                    </section>

                    <Separator />

                    {/* ROI Metrics Section */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                Metryki ROI
                            </h3>
                            <div className="flex items-center gap-2">
                                <Calculator className="h-4 w-4 text-muted-foreground" />
                                <ROIScoreCell
                                    metrics={{
                                        timeIntensity: formData.timeIntensity ?? 5,
                                        capitalIntensity: formData.capitalIntensity ?? 5,
                                        complexity: formData.complexity ?? 5,
                                        automationPotential: formData.automationPotential ?? 5,
                                    }}
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <SliderField
                                label="Czasochłonność"
                                value={formData.timeIntensity ?? 5}
                                onChange={(v) => updateField('timeIntensity', v)}
                                icon={<Clock className="h-4 w-4 text-blue-500" />}
                                tooltip="Ile czasu zajmuje wykonanie tego procesu? 0 = minimalny, 10 = bardzo czasochłonny"
                            />

                            <SliderField
                                label="Kapitałochłonność"
                                value={formData.capitalIntensity ?? 5}
                                onChange={(v) => updateField('capitalIntensity', v)}
                                icon={<CircleDollarSign className="h-4 w-4 text-emerald-500" />}
                                tooltip="Ile zasobów finansowych wymaga? 0 = minimalny koszt, 10 = bardzo kosztowny"
                            />

                            <SliderField
                                label="Złożoność"
                                value={formData.complexity ?? 5}
                                onChange={(v) => updateField('complexity', v)}
                                icon={<Brain className="h-4 w-4 text-purple-500" />}
                                tooltip="Jak skomplikowany jest ten proces? 0 = prosty, 10 = bardzo złożony"
                            />

                            <SliderField
                                label="Potencjał automatyzacji"
                                value={formData.automationPotential ?? 5}
                                onChange={(v) => updateField('automationPotential', v)}
                                icon={<Zap className="h-4 w-4 text-amber-500" />}
                                tooltip="Jak łatwo można zautomatyzować? 0 = niemożliwe, 10 = pełna automatyzacja"
                                inverted
                            />
                        </div>
                    </section>

                    <Separator />

                    {/* Estimates Section */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                            Oszacowania
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="estimatedHours">Godziny / tydzień</Label>
                                <Input
                                    id="estimatedHours"
                                    type="number"
                                    min={0}
                                    step={0.5}
                                    value={formData.estimatedHours ?? ''}
                                    onChange={(e) => updateField('estimatedHours', e.target.value ? parseFloat(e.target.value) : null)}
                                    className="mt-1.5"
                                    placeholder="np. 8"
                                />
                            </div>

                            <div>
                                <Label htmlFor="currentFTE">Aktualne FTE</Label>
                                <Input
                                    id="currentFTE"
                                    type="number"
                                    min={0}
                                    step={0.1}
                                    value={formData.currentFTE ?? ''}
                                    onChange={(e) => updateField('currentFTE', e.target.value ? parseFloat(e.target.value) : null)}
                                    className="mt-1.5"
                                    placeholder="np. 0.5"
                                />
                            </div>

                            <div className="col-span-2">
                                <Label htmlFor="estimatedCostPLN">Szacowany koszt (PLN / miesiąc)</Label>
                                <Input
                                    id="estimatedCostPLN"
                                    type="number"
                                    min={0}
                                    step={100}
                                    value={formData.estimatedCostPLN ?? ''}
                                    onChange={(e) => updateField('estimatedCostPLN', e.target.value ? parseFloat(e.target.value) : null)}
                                    className="mt-1.5"
                                    placeholder="np. 5000"
                                />
                            </div>
                        </div>
                    </section>

                    <Separator />

                    {/* Links Section */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                            <Link2 className="h-4 w-4" />
                            Powiązania
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <Label className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-blue-500" />
                                    Powiązany SOP
                                </Label>
                                <Select
                                    value={formData.sopId || 'none'}
                                    onValueChange={(v) => updateField('sopId', v === 'none' ? null : v)}
                                >
                                    <SelectTrigger className="mt-1.5">
                                        <SelectValue placeholder="Wybierz SOP..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Brak powiązania</SelectItem>
                                        {availableSOPs.map((sop) => (
                                            <SelectItem key={sop.id} value={sop.id}>
                                                {sop.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-purple-500" />
                                    Przypisany Agent AI
                                </Label>
                                <Select
                                    value={formData.agentId || 'none'}
                                    onValueChange={(v) => updateField('agentId', v === 'none' ? null : v)}
                                >
                                    <SelectTrigger className="mt-1.5">
                                        <SelectValue placeholder="Wybierz Agenta..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Brak powiązania</SelectItem>
                                        {availableAgents.map((agent) => (
                                            <SelectItem key={agent.id} value={agent.id}>
                                                {agent.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </section>

                    {/* AI Analysis Section */}
                    {node.aiAnalysisResult && (
                        <>
                            <Separator />
                            <section className="space-y-4">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-amber-500" />
                                    Analiza AI
                                </h3>

                                <div className="rounded-lg bg-muted/50 p-4 text-sm">
                                    <pre className="whitespace-pre-wrap text-xs">
                                        {JSON.stringify(node.aiAnalysisResult, null, 2)}
                                    </pre>
                                </div>

                                {node.lastAnalyzedAt && (
                                    <p className="text-xs text-muted-foreground">
                                        Ostatnia analiza: {new Date(node.lastAnalyzedAt).toLocaleString('pl-PL')}
                                    </p>
                                )}
                            </section>
                        </>
                    )}
                </div>

                <SheetFooter className="border-t pt-4">
                    <div className="flex items-center gap-2 w-full">
                        {onAnalyze && (
                            <Button
                                variant="outline"
                                onClick={handleAnalyze}
                                disabled={isAnalyzing}
                                className="flex-1"
                            >
                                {isAnalyzing ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Sparkles className="h-4 w-4 mr-2" />
                                )}
                                Analiza AI
                            </Button>
                        )}

                        <Button
                            onClick={handleSave}
                            disabled={isSaving || !hasChanges}
                            className="flex-1"
                        >
                            {isSaving ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            Zapisz
                        </Button>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
