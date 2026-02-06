'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Clock,
    Puzzle,
    DollarSign,
    AlertTriangle,
    Bot,
    Users,
    Sparkles,
    Save,
    RotateCcw,
    Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
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
import type { NodeMetrics } from '@/hooks/use-workflow-metrics';

interface MetricsEditorProps {
    nodeId: string;
    initialMetrics: Partial<NodeMetrics>;
    onSave: (metrics: NodeMetrics) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

const defaultMetrics: NodeMetrics = {
    timeMinutes: 30,
    frequency: 'daily',
    occurrencesPerMonth: 20,
    complexity: 5,
    errorRate: 0.05,
    directCostMonthly: 0,
    requiresAI: false,
    aiMinutesPerExecution: 0,
    problemScore: 5,
    employeeCount: 1,
    automation: 0,
    automationPotential: 0.5,
};

function SliderWithInfo({
    label,
    value,
    onChange,
    min = 0,
    max = 10,
    step = 1,
    icon: Icon,
    color,
    tooltip
}: {
    label: string;
    value: number;
    onChange: (v: number) => void;
    min?: number;
    max?: number;
    step?: number;
    icon: React.ElementType;
    color: string;
    tooltip: string;
}) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-md ${color}`}>
                        <Icon className="h-3.5 w-3.5" />
                    </div>
                    <Label className="text-sm">{label}</Label>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Info className="h-3 w-3 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                                <p>{tooltip}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <span className="text-sm font-semibold">{value}</span>
            </div>
            <Slider
                value={[value]}
                onValueChange={([v]) => onChange(v)}
                min={min}
                max={max}
                step={step}
                className="py-1"
            />
        </div>
    );
}

export function MetricsEditor({
    nodeId,
    initialMetrics,
    onSave,
    onCancel,
    isLoading = false
}: MetricsEditorProps) {
    const [metrics, setMetrics] = useState<NodeMetrics>({
        ...defaultMetrics,
        ...initialMetrics
    });
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave(metrics);
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setMetrics({ ...defaultMetrics, ...initialMetrics });
    };

    const updateMetric = <K extends keyof NodeMetrics>(key: K, value: NodeMetrics[K]) => {
        setMetrics(prev => ({ ...prev, [key]: value }));
    };

    // Update occurrences based on frequency
    useEffect(() => {
        const frequencyMap: Record<string, number> = {
            daily: 20,
            weekly: 4,
            monthly: 1,
            yearly: 0.08 // ~1 per year
        };
        if (metrics.frequency) {
            updateMetric('occurrencesPerMonth', frequencyMap[metrics.frequency] || 20);
        }
    }, [metrics.frequency]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Time Section */}
            <div className="space-y-4">
                <h4 className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    Czas i częstotliwość
                </h4>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="timeMinutes">Czas wykonania (min)</Label>
                        <Input
                            id="timeMinutes"
                            type="number"
                            min={1}
                            max={480}
                            value={metrics.timeMinutes || 0}
                            onChange={(e) => updateMetric('timeMinutes', parseInt(e.target.value) || 0)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="frequency">Częstotliwość</Label>
                        <Select
                            value={metrics.frequency || 'daily'}
                            onValueChange={(v) => updateMetric('frequency', v as NodeMetrics['frequency'])}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="daily">Codziennie</SelectItem>
                                <SelectItem value="weekly">Co tydzień</SelectItem>
                                <SelectItem value="monthly">Co miesiąc</SelectItem>
                                <SelectItem value="yearly">Raz w roku</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Complexity & Problems */}
            <div className="space-y-4">
                <SliderWithInfo
                    label="Złożoność"
                    value={metrics.complexity || 5}
                    onChange={(v) => updateMetric('complexity', v)}
                    icon={Puzzle}
                    color="bg-purple-500/10 text-purple-500"
                    tooltip="1 = bardzo prosta, 10 = bardzo skomplikowana"
                />

                <SliderWithInfo
                    label="Problemowość"
                    value={metrics.problemScore || 5}
                    onChange={(v) => updateMetric('problemScore', v)}
                    icon={AlertTriangle}
                    color="bg-amber-500/10 text-amber-500"
                    tooltip="1 = bez problemów, 10 = stały bottleneck"
                />

                <SliderWithInfo
                    label="Poziom błędów (%)"
                    value={Math.round((metrics.errorRate || 0) * 100)}
                    onChange={(v) => updateMetric('errorRate', v / 100)}
                    max={50}
                    icon={AlertTriangle}
                    color="bg-red-500/10 text-red-500"
                    tooltip="Procent wykonań kończących się błędem"
                />
            </div>

            <Separator />

            {/* Costs */}
            <div className="space-y-4">
                <h4 className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    Koszty bezpośrednie
                </h4>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="directCost">Koszt miesięczny (PLN)</Label>
                        <Input
                            id="directCost"
                            type="number"
                            min={0}
                            value={metrics.directCostMonthly || 0}
                            onChange={(e) => updateMetric('directCostMonthly', parseInt(e.target.value) || 0)}
                            placeholder="Narzędzia, licencje..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="employees">Liczba osób</Label>
                        <Input
                            id="employees"
                            type="number"
                            min={1}
                            max={100}
                            value={metrics.employeeCount || 1}
                            onChange={(e) => updateMetric('employeeCount', parseInt(e.target.value) || 1)}
                        />
                    </div>
                </div>
            </div>

            <Separator />

            {/* AI Usage */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-purple-500" />
                        <Label htmlFor="requiresAI">Używa AI/API</Label>
                    </div>
                    <Switch
                        id="requiresAI"
                        checked={metrics.requiresAI || false}
                        onCheckedChange={(v) => updateMetric('requiresAI', v)}
                    />
                </div>

                {metrics.requiresAI && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-2"
                    >
                        <Label htmlFor="aiMinutes">Minuty AI na wykonanie</Label>
                        <Input
                            id="aiMinutes"
                            type="number"
                            min={0}
                            max={60}
                            value={metrics.aiMinutesPerExecution || 0}
                            onChange={(e) => updateMetric('aiMinutesPerExecution', parseInt(e.target.value) || 0)}
                        />
                    </motion.div>
                )}
            </div>

            <Separator />

            {/* Automation */}
            <div className="space-y-4">
                <h4 className="text-sm font-medium flex items-center gap-2">
                    <Bot className="h-4 w-4 text-cyan-500" />
                    Automatyzacja
                </h4>

                <SliderWithInfo
                    label="Obecny poziom (%)"
                    value={Math.round((metrics.automation || 0) * 100)}
                    onChange={(v) => updateMetric('automation', v / 100)}
                    max={100}
                    step={5}
                    icon={Bot}
                    color="bg-cyan-500/10 text-cyan-500"
                    tooltip="Jak bardzo proces jest już zautomatyzowany"
                />

                <SliderWithInfo
                    label="Potencjał automatyzacji (%)"
                    value={Math.round((metrics.automationPotential || 0) * 100)}
                    onChange={(v) => updateMetric('automationPotential', v / 100)}
                    max={100}
                    step={5}
                    icon={Bot}
                    color="bg-emerald-500/10 text-emerald-500"
                    tooltip="Ile procent można zautomatyzować"
                />
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex gap-2 pt-2">
                <Button
                    variant="outline"
                    onClick={handleReset}
                    disabled={saving}
                    className="flex-1"
                >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                </Button>
                <Button
                    onClick={handleSave}
                    disabled={saving || isLoading}
                    className="flex-1"
                >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Zapisywanie...' : 'Zapisz metryki'}
                </Button>
            </div>
        </motion.div>
    );
}
