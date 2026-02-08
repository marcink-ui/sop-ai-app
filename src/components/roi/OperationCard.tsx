'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Trash2,
    Copy,
    ChevronDown,
    ChevronUp,
    Users,
    Clock,
    TrendingUp,
    AlertTriangle,
    DollarSign,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Operation, Category, FrequencyUnit, TimeUnit } from '@/lib/roi/types';
import { useROIStore } from '@/lib/roi/store';

const CATEGORIES: Category[] = ['Sprzedaż', 'Marketing', 'Produkt', 'Operacje', 'Finanse', 'HR', 'Support', 'Inne'];
const FREQUENCY_UNITS: { value: FrequencyUnit; label: string }[] = [
    { value: 'day', label: 'dziennie' },
    { value: 'week', label: 'tygodniowo' },
    { value: 'month', label: 'miesięcznie' },
    { value: 'year', label: 'rocznie' },
];
const TIME_UNITS: { value: TimeUnit; label: string }[] = [
    { value: 'minutes', label: 'minut' },
    { value: 'hours', label: 'godzin' },
];

interface OperationCardProps {
    operation: Operation;
}

export function OperationCard({ operation }: OperationCardProps) {
    const [expanded, setExpanded] = useState(false);
    const { updateOperation, removeOperation, duplicateOperation, calculateAnnualCost, calculateFutureCost, calculateROI } = useROIStore();

    const annualCost = calculateAnnualCost(operation);
    const futureCost = calculateFutureCost(operation);
    const savings = annualCost - futureCost;
    const roi = calculateROI(operation);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(val);
    };

    return (
        <Card className="overflow-hidden">
            {/* Header */}
            <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex-1 min-w-0">
                    <Input
                        value={operation.name}
                        onChange={(e) => updateOperation(operation.id, { name: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        className="font-semibold text-lg border-none bg-transparent p-0 h-auto focus-visible:ring-0"
                    />
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" /> {operation.employeeCount}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {operation.timePerExecution} {operation.timeUnit === 'minutes' ? 'min' : 'h'}
                        </span>
                        <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                            {operation.category}
                        </span>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-right">
                    <div>
                        <p className="text-xs text-muted-foreground">Oszczędności/rok</p>
                        <p className={cn("font-bold", savings > 0 ? "text-green-600" : "text-red-500")}>
                            {formatCurrency(savings)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">ROI 1Y</p>
                        <p className={cn("font-bold", roi.roiPercent1Y > 0 ? "text-green-600" : "text-red-500")}>
                            {roi.roiPercent1Y.toFixed(0)}%
                        </p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            {/* Expanded Content */}
            {expanded && (
                <div className="border-t p-4 space-y-6 animate-in slide-in-from-top-2 duration-200">
                    {/* Row 1: Basic Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label>Kategoria</Label>
                            <Select
                                value={operation.category}
                                onValueChange={(v) => updateOperation(operation.id, { category: v as Category })}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map((c) => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Liczba pracowników</Label>
                            <Input
                                type="number"
                                min={1}
                                value={operation.employeeCount}
                                onChange={(e) => updateOperation(operation.id, { employeeCount: parseInt(e.target.value) || 1 })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Stawka (PLN/h)</Label>
                            <Input
                                type="number"
                                min={1}
                                value={operation.avgHourlyRate}
                                onChange={(e) => updateOperation(operation.id, { avgHourlyRate: parseFloat(e.target.value) || 50 })}
                            />
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                            <Switch
                                checked={operation.employerCostEnabled}
                                onCheckedChange={(v) => updateOperation(operation.id, { employerCostEnabled: v })}
                            />
                            <Label>Koszt pracodawcy (+20.4%)</Label>
                        </div>
                    </div>

                    {/* Row 2: Time & Frequency */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label>Częstotliwość</Label>
                            <Input
                                type="number"
                                min={1}
                                value={operation.frequency}
                                onChange={(e) => updateOperation(operation.id, { frequency: parseInt(e.target.value) || 1 })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Jednostka</Label>
                            <Select
                                value={operation.frequencyUnit}
                                onValueChange={(v) => updateOperation(operation.id, { frequencyUnit: v as FrequencyUnit })}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {FREQUENCY_UNITS.map((u) => (
                                        <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Czas wykonania</Label>
                            <Input
                                type="number"
                                min={1}
                                value={operation.timePerExecution}
                                onChange={(e) => updateOperation(operation.id, { timePerExecution: parseInt(e.target.value) || 15 })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Jednostka czasu</Label>
                            <Select
                                value={operation.timeUnit}
                                onValueChange={(v) => updateOperation(operation.id, { timeUnit: v as TimeUnit })}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {TIME_UNITS.map((u) => (
                                        <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Row 3: Efficiency Gain Slider */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-green-500" />
                                Efektywność po optymalizacji
                            </Label>
                            <span className="font-bold text-green-600">{(operation.efficiencyGain * 100).toFixed(0)}%</span>
                        </div>
                        <Slider
                            value={[operation.efficiencyGain * 100]}
                            onValueChange={([v]) => updateOperation(operation.id, { efficiencyGain: v / 100 })}
                            min={0}
                            max={100}
                            step={5}
                            className="w-full"
                        />
                    </div>

                    {/* Row 4: LOC Toggle */}
                    <div className="flex items-center gap-3 p-3 border rounded-lg bg-orange-50 dark:bg-orange-950/20">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        <div className="flex-1">
                            <p className="font-medium">Koszt Utraconych Szans (LOC)</p>
                            <p className="text-xs text-muted-foreground">Błędy, reklamacje, utracone okazje</p>
                        </div>
                        <Switch
                            checked={operation.locEnabled}
                            onCheckedChange={(v) => updateOperation(operation.id, { locEnabled: v })}
                        />
                    </div>

                    {/* Row 5: Automation Levels */}
                    <div className="space-y-4 p-4 border rounded-lg bg-purple-50/50 dark:bg-purple-950/20">
                        <h4 className="font-medium flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-purple-500" />
                            Poziom Automatyzacji
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm">Automatyzacja AI</Label>
                                    <span className="font-bold text-purple-600">{operation.automationPercent}%</span>
                                </div>
                                <Slider
                                    value={[operation.automationPercent ?? 70]}
                                    onValueChange={([v]) => updateOperation(operation.id, { automationPercent: v })}
                                    min={0}
                                    max={100}
                                    step={5}
                                    className="w-full"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm">Human-in-the-Loop</Label>
                                    <span className="font-bold text-blue-600">{operation.humanInLoopPercent}%</span>
                                </div>
                                <Slider
                                    value={[operation.humanInLoopPercent ?? 20]}
                                    onValueChange={([v]) => updateOperation(operation.id, { humanInLoopPercent: v })}
                                    min={0}
                                    max={50}
                                    step={5}
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Razem: {(operation.automationPercent ?? 70) + (operation.humanInLoopPercent ?? 20)}% |
                            Manualne: {100 - (operation.automationPercent ?? 70) - (operation.humanInLoopPercent ?? 20)}%
                        </p>
                    </div>

                    {/* Row 6: Token Costs */}
                    <div className="flex items-center gap-3 p-3 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                        <DollarSign className="h-5 w-5 text-blue-500" />
                        <div className="flex-1">
                            <p className="font-medium">Koszty API / LLM</p>
                            <p className="text-xs text-muted-foreground">Tokeny, modele AI, integracje</p>
                        </div>
                        <Switch
                            checked={operation.tokenCostsEnabled}
                            onCheckedChange={(v) => updateOperation(operation.id, { tokenCostsEnabled: v })}
                        />
                    </div>

                    {operation.tokenCostsEnabled && operation.tokenCosts && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-blue-50/30 dark:bg-blue-950/10">
                            <div className="space-y-2">
                                <Label>Model LLM</Label>
                                <Select
                                    value={operation.tokenCosts.modelName}
                                    onValueChange={(v) => updateOperation(operation.id, {
                                        tokenCosts: {
                                            ...operation.tokenCosts!,
                                            modelName: v,
                                            inputPricePerMToken: v === 'GPT-4o' ? 2.5 : v === 'GPT-4o-mini' ? 0.15 : v === 'Claude 3.5 Sonnet' ? 3 : 1,
                                            outputPricePerMToken: v === 'GPT-4o' ? 10 : v === 'GPT-4o-mini' ? 0.6 : v === 'Claude 3.5 Sonnet' ? 15 : 5,
                                        }
                                    })}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="GPT-4o">GPT-4o ($2.5/$10 M)</SelectItem>
                                        <SelectItem value="GPT-4o-mini">GPT-4o-mini ($0.15/$0.6 M)</SelectItem>
                                        <SelectItem value="Claude 3.5 Sonnet">Claude 3.5 Sonnet ($3/$15 M)</SelectItem>
                                        <SelectItem value="Custom">Custom</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Wywołania/mies.</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={operation.tokenCosts.monthlyApiCalls}
                                    onChange={(e) => updateOperation(operation.id, {
                                        tokenCosts: { ...operation.tokenCosts!, monthlyApiCalls: parseInt(e.target.value) || 0 }
                                    })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Śr. tokenów/wywołanie</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={operation.tokenCosts.avgTokensPerCall}
                                    onChange={(e) => updateOperation(operation.id, {
                                        tokenCosts: { ...operation.tokenCosts!, avgTokensPerCall: parseInt(e.target.value) || 0 }
                                    })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Koszt/rok (szac.)</Label>
                                <div className="flex items-center h-10 px-3 border rounded-md bg-muted text-sm font-medium">
                                    {formatCurrency((() => {
                                        const tc = operation.tokenCosts!;
                                        const annualCalls = tc.monthlyApiCalls * 12;
                                        const totalTokens = annualCalls * tc.avgTokensPerCall;
                                        const inputCost = (totalTokens * 0.7 / 1_000_000) * tc.inputPricePerMToken;
                                        const outputCost = (totalTokens * 0.3 / 1_000_000) * tc.outputPricePerMToken;
                                        return (inputCost + outputCost) * 4; // PLN conversion approx
                                    })())}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Cost Summary */}
                    <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                        <div className="text-center">
                            <p className="text-xs text-muted-foreground">Koszt obecnie</p>
                            <p className="font-bold text-lg">{formatCurrency(annualCost)}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-muted-foreground">Koszt po</p>
                            <p className="font-bold text-lg">{formatCurrency(futureCost)}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-muted-foreground">Payback</p>
                            <p className="font-bold text-lg">{roi.paybackMonths.toFixed(1)} mies.</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => duplicateOperation(operation.id)}>
                            <Copy className="h-4 w-4 mr-1" /> Duplikuj
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => removeOperation(operation.id)}>
                            <Trash2 className="h-4 w-4 mr-1" /> Usuń
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );
}
