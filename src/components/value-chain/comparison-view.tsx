'use client';

import { useState } from 'react';
import { Node } from 'reactflow';
import { motion } from 'framer-motion';
import {
    GitCompare,
    Clock,
    Puzzle,
    DollarSign,
    AlertTriangle,
    TrendingUp,
    Zap,
    Check,
    X,
    ArrowRight,
    Trophy,
    Scale
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useWorkflowMetrics } from '@/hooks/use-workflow-metrics';

interface WorkflowSnapshot {
    id: string;
    name: string;
    nodes: Node[];
    createdAt: Date;
}

interface ComparisonViewProps {
    workflowA: WorkflowSnapshot | null;
    workflowB: WorkflowSnapshot | null;
    onSelectWorkflow: (slot: 'A' | 'B') => void;
    onClose: () => void;
}

type MetricKey = 'totalTimeHours' | 'avgComplexity' | 'avgProblemScore' | 'efficiencyScore';

interface ExtendedMetricComparison {
    key: MetricKey | 'cost' | 'roi';
    lowerBetter: boolean;
    getValue: (metrics: ReturnType<typeof useWorkflowMetrics>) => number;
}

function ComparisonRow({
    label,
    icon: Icon,
    valueA,
    valueB,
    unit,
    lowerIsBetter = true,
    color
}: {
    label: string;
    icon: React.ElementType;
    valueA: number;
    valueB: number;
    unit?: string;
    lowerIsBetter?: boolean;
    color: string;
}) {
    const aWins = lowerIsBetter ? valueA < valueB : valueA > valueB;
    const bWins = lowerIsBetter ? valueB < valueA : valueB > valueA;
    const tie = valueA === valueB;

    return (
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 py-3 items-center">
            <div className={`text-right ${aWins ? 'font-bold text-emerald-600' : ''}`}>
                <span className="text-lg">{valueA.toLocaleString('pl-PL')}</span>
                {unit && <span className="text-xs ml-1 text-muted-foreground">{unit}</span>}
                {aWins && <Check className="inline ml-2 h-4 w-4 text-emerald-500" />}
            </div>

            <div className="flex flex-col items-center">
                <div className={`p-2 rounded-lg ${color}`}>
                    <Icon className="h-4 w-4" />
                </div>
                <span className="text-xs text-muted-foreground mt-1">{label}</span>
            </div>

            <div className={`${bWins ? 'font-bold text-emerald-600' : ''}`}>
                {bWins && <Check className="inline mr-2 h-4 w-4 text-emerald-500" />}
                <span className="text-lg">{valueB.toLocaleString('pl-PL')}</span>
                {unit && <span className="text-xs ml-1 text-muted-foreground">{unit}</span>}
            </div>
        </div>
    );
}

function EmptySlot({ slot, onSelect }: { slot: 'A' | 'B'; onSelect: () => void }) {
    return (
        <div
            className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={onSelect}
        >
            <GitCompare className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Wybierz Workflow {slot}</p>
        </div>
    );
}

export function ComparisonView({
    workflowA,
    workflowB,
    onSelectWorkflow,
    onClose
}: ComparisonViewProps) {
    const metricsA = useWorkflowMetrics(workflowA?.nodes || []);
    const metricsB = useWorkflowMetrics(workflowB?.nodes || []);

    // Calculate winner
    const calculateWinner = (): 'A' | 'B' | 'tie' => {
        if (!workflowA || !workflowB) return 'tie';

        let scoreA = 0;
        let scoreB = 0;

        // Compare metrics (lower is better except for efficiency/ROI)
        const comparisons: ExtendedMetricComparison[] = [
            { key: 'totalTimeHours', lowerBetter: true, getValue: m => m.totalTimeHours },
            { key: 'avgComplexity', lowerBetter: true, getValue: m => m.avgComplexity },
            { key: 'cost', lowerBetter: true, getValue: m => m.costs.totalMonthly },
            { key: 'avgProblemScore', lowerBetter: true, getValue: m => m.avgProblemScore },
            { key: 'efficiencyScore', lowerBetter: false, getValue: m => m.efficiencyScore },
            { key: 'roi', lowerBetter: false, getValue: m => m.roi.roiPotential },
        ];

        comparisons.forEach(({ lowerBetter, getValue }) => {
            const valA = getValue(metricsA);
            const valB = getValue(metricsB);
            if (lowerBetter) {
                if (valA < valB) scoreA++;
                else if (valB < valA) scoreB++;
            } else {
                if (valA > valB) scoreA++;
                else if (valB > valA) scoreB++;
            }
        });

        if (scoreA > scoreB) return 'A';
        if (scoreB > scoreA) return 'B';
        return 'tie';
    };

    const winner = calculateWinner();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 space-y-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Scale className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Porównanie Workflow</h2>
                        <p className="text-sm text-muted-foreground">
                            Porównaj metryki dwóch wariantów procesu
                        </p>
                    </div>
                </div>
                <Button variant="ghost" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Workflow Headers */}
            <div className="grid grid-cols-2 gap-6">
                <Card className={`${winner === 'A' ? 'ring-2 ring-emerald-500' : ''}`}>
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base">
                                {workflowA?.name || 'Workflow A'}
                            </CardTitle>
                            {winner === 'A' && (
                                <Badge className="bg-emerald-500">
                                    <Trophy className="h-3 w-3 mr-1" />
                                    Rekomendacja
                                </Badge>
                            )}
                        </div>
                        {workflowA ? (
                            <p className="text-xs text-muted-foreground">
                                {workflowA.nodes.length} elementów
                            </p>
                        ) : (
                            <EmptySlot slot="A" onSelect={() => onSelectWorkflow('A')} />
                        )}
                    </CardHeader>
                </Card>

                <Card className={`${winner === 'B' ? 'ring-2 ring-emerald-500' : ''}`}>
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base">
                                {workflowB?.name || 'Workflow B'}
                            </CardTitle>
                            {winner === 'B' && (
                                <Badge className="bg-emerald-500">
                                    <Trophy className="h-3 w-3 mr-1" />
                                    Rekomendacja
                                </Badge>
                            )}
                        </div>
                        {workflowB ? (
                            <p className="text-xs text-muted-foreground">
                                {workflowB.nodes.length} elementów
                            </p>
                        ) : (
                            <EmptySlot slot="B" onSelect={() => onSelectWorkflow('B')} />
                        )}
                    </CardHeader>
                </Card>
            </div>

            {/* Comparison Table */}
            {workflowA && workflowB && (
                <Card>
                    <CardContent className="pt-6">
                        <ComparisonRow
                            icon={Clock}
                            label="Czas"
                            valueA={metricsA.totalTimeHours}
                            valueB={metricsB.totalTimeHours}
                            unit="godz"
                            lowerIsBetter={true}
                            color="bg-blue-500/10 text-blue-500"
                        />
                        <Separator />
                        <ComparisonRow
                            icon={Puzzle}
                            label="Złożoność"
                            valueA={metricsA.avgComplexity}
                            valueB={metricsB.avgComplexity}
                            unit="/10"
                            lowerIsBetter={true}
                            color="bg-purple-500/10 text-purple-500"
                        />
                        <Separator />
                        <ComparisonRow
                            icon={DollarSign}
                            label="Koszt"
                            valueA={metricsA.costs.totalMonthly}
                            valueB={metricsB.costs.totalMonthly}
                            unit="PLN"
                            lowerIsBetter={true}
                            color="bg-green-500/10 text-green-500"
                        />
                        <Separator />
                        <ComparisonRow
                            icon={AlertTriangle}
                            label="Problemy"
                            valueA={metricsA.avgProblemScore}
                            valueB={metricsB.avgProblemScore}
                            unit="/10"
                            lowerIsBetter={true}
                            color="bg-amber-500/10 text-amber-500"
                        />
                        <Separator />
                        <ComparisonRow
                            icon={TrendingUp}
                            label="Efektywność"
                            valueA={Math.round(metricsA.efficiencyScore * 100)}
                            valueB={Math.round(metricsB.efficiencyScore * 100)}
                            unit="%"
                            lowerIsBetter={false}
                            color="bg-emerald-500/10 text-emerald-500"
                        />
                        <Separator />
                        <ComparisonRow
                            icon={Zap}
                            label="ROI"
                            valueA={Math.round(metricsA.roi.roiPotential * 100)}
                            valueB={Math.round(metricsB.roi.roiPotential * 100)}
                            unit="%"
                            lowerIsBetter={false}
                            color="bg-blue-500/10 text-blue-500"
                        />
                    </CardContent>
                </Card>
            )}

            {/* Recommendation */}
            {workflowA && workflowB && winner !== 'tie' && (
                <Card className="bg-emerald-500/5 border-emerald-500/20">
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-500/10">
                                <Trophy className="h-5 w-5 text-emerald-500" />
                            </div>
                            <div>
                                <p className="font-medium text-emerald-700">
                                    Rekomendacja: {winner === 'A' ? workflowA.name : workflowB.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Ten workflow wygrywa w większości kategorii i powinien być priorytetem do wdrożenia.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </motion.div>
    );
}
