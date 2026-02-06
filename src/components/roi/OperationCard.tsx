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
