'use client';

import { useState } from 'react';
import { Node } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calculator,
    Clock,
    Puzzle,
    DollarSign,
    AlertTriangle,
    TrendingUp,
    X,
    ChevronDown,
    ChevronUp,
    BarChart3,
    Target,
    Users,
    Sparkles,
    Timer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useWorkflowMetrics } from '@/hooks/use-workflow-metrics';

interface SimulationPanelProps {
    nodes: Node[];
    isOpen: boolean;
    onToggle: () => void;
}

function MetricRow({
    icon: Icon,
    label,
    value,
    unit,
    color,
    highlight = false
}: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    unit?: string;
    color: string;
    highlight?: boolean;
}) {
    return (
        <div className={`flex items-center justify-between py-2.5 px-3 rounded-lg ${highlight ? 'bg-primary/5' : ''}`}>
            <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-md ${color}`}>
                    <Icon className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm text-muted-foreground">{label}</span>
            </div>
            <span className={`font-semibold text-sm ${highlight ? 'text-primary' : ''}`}>
                {value}{unit && <span className="text-xs font-normal ml-1">{unit}</span>}
            </span>
        </div>
    );
}

function ScoreGauge({ value, label, color }: { value: number; label: string; color: string }) {
    const percentage = Math.round(value * 100);
    return (
        <div className="text-center">
            <div className="relative inline-flex items-center justify-center">
                <svg className="w-16 h-16 transform -rotate-90">
                    <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="none"
                        className="text-muted/30"
                    />
                    <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="none"
                        strokeLinecap="round"
                        className={color}
                        strokeDasharray={`${percentage * 1.76} 176`}
                    />
                </svg>
                <span className="absolute text-sm font-bold">{percentage}%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
        </div>
    );
}

export function SimulationPanel({ nodes, isOpen, onToggle }: SimulationPanelProps) {
    const [expanded, setExpanded] = useState(true);
    const metrics = useWorkflowMetrics(nodes);

    if (!isOpen) {
        return (
            <Button
                variant="outline"
                size="sm"
                onClick={onToggle}
                className="fixed bottom-4 right-4 shadow-lg"
            >
                <Calculator className="h-4 w-4 mr-2" />
                Symulacja
            </Button>
        );
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="fixed bottom-4 right-4 w-80 z-50"
            >
                <Card className="shadow-xl border-2">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-primary/10">
                                    <BarChart3 className="h-4 w-4 text-primary" />
                                </div>
                                <CardTitle className="text-base">Symulacja Workflow</CardTitle>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => setExpanded(!expanded)}
                                >
                                    {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={onToggle}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Node counts */}
                        <div className="flex gap-1 mt-2 flex-wrap">
                            {metrics.processCount > 0 && (
                                <Badge variant="secondary" className="text-xs bg-blue-500/10 text-blue-600">
                                    {metrics.processCount} procesy
                                </Badge>
                            )}
                            {metrics.sopCount > 0 && (
                                <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-600">
                                    {metrics.sopCount} SOP
                                </Badge>
                            )}
                            {metrics.agentCount > 0 && (
                                <Badge variant="secondary" className="text-xs bg-purple-500/10 text-purple-600">
                                    {metrics.agentCount} agenci
                                </Badge>
                            )}
                        </div>
                    </CardHeader>

                    <AnimatePresence>
                        {expanded && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                            >
                                <CardContent className="pt-0 space-y-4">
                                    {/* Key Scores */}
                                    <div className="flex justify-around py-3 bg-muted/30 rounded-lg">
                                        <ScoreGauge
                                            value={metrics.efficiencyScore}
                                            label="Efektywność"
                                            color="text-emerald-500"
                                        />
                                        <ScoreGauge
                                            value={metrics.roi.roiPotential}
                                            label="ROI"
                                            color="text-blue-500"
                                        />
                                        <ScoreGauge
                                            value={metrics.automationPotential}
                                            label="Automatyzacja"
                                            color="text-purple-500"
                                        />
                                    </div>

                                    <Separator />

                                    {/* Time & Basic Metrics */}
                                    <div className="space-y-1">
                                        <MetricRow
                                            icon={Clock}
                                            label="Czas (wykonanie)"
                                            value={metrics.totalTimeHours}
                                            unit="godz"
                                            color="bg-blue-500/10 text-blue-500"
                                        />
                                        <MetricRow
                                            icon={Timer}
                                            label="Czas miesięcznie"
                                            value={metrics.monthlyTimeHours}
                                            unit="godz"
                                            color="bg-blue-500/10 text-blue-500"
                                            highlight
                                        />
                                        <MetricRow
                                            icon={Puzzle}
                                            label="Złożoność"
                                            value={metrics.avgComplexity}
                                            unit="/10"
                                            color="bg-purple-500/10 text-purple-500"
                                        />
                                        <MetricRow
                                            icon={AlertTriangle}
                                            label="Problemowość"
                                            value={metrics.avgProblemScore}
                                            unit="/10"
                                            color="bg-amber-500/10 text-amber-500"
                                        />
                                    </div>

                                    <Separator />

                                    {/* Cost Breakdown */}
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground mb-2">📊 Struktura kosztów miesięcznie</p>
                                        <div className="space-y-1">
                                            <MetricRow
                                                icon={Users}
                                                label="Praca (czas)"
                                                value={metrics.costs.laborMonthly.toLocaleString('pl-PL')}
                                                unit="PLN"
                                                color="bg-green-500/10 text-green-500"
                                            />
                                            {metrics.costs.overheadMonthly > 0 && (
                                                <MetricRow
                                                    icon={DollarSign}
                                                    label="Overhead"
                                                    value={metrics.costs.overheadMonthly.toLocaleString('pl-PL')}
                                                    unit="PLN"
                                                    color="bg-gray-500/10 text-gray-500"
                                                />
                                            )}
                                            {metrics.costs.aiTokensMonthly > 0 && (
                                                <MetricRow
                                                    icon={Sparkles}
                                                    label="AI/API tokeny"
                                                    value={metrics.costs.aiTokensMonthly.toLocaleString('pl-PL')}
                                                    unit="PLN"
                                                    color="bg-purple-500/10 text-purple-500"
                                                />
                                            )}
                                            {metrics.costs.opportunityCostMonthly > 0 && (
                                                <MetricRow
                                                    icon={TrendingUp}
                                                    label="Utracone przychody"
                                                    value={metrics.costs.opportunityCostMonthly.toLocaleString('pl-PL')}
                                                    unit="PLN"
                                                    color="bg-red-500/10 text-red-500"
                                                />
                                            )}
                                            <MetricRow
                                                icon={DollarSign}
                                                label="RAZEM"
                                                value={metrics.costs.totalMonthly.toLocaleString('pl-PL')}
                                                unit="PLN/msc"
                                                color="bg-emerald-500/10 text-emerald-600"
                                                highlight
                                            />
                                        </div>
                                    </div>

                                    {/* ROI Info */}
                                    {metrics.roi.paybackMonths < 999 && (
                                        <>
                                            <Separator />
                                            <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                                                <p className="text-xs font-medium text-blue-600 mb-1">💰 Potencjał automatyzacji</p>
                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                    <div>
                                                        <span className="text-muted-foreground">Inwestycja: </span>
                                                        <span className="font-semibold">{metrics.roi.automationCost.toLocaleString('pl-PL')} PLN</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Oszczędność: </span>
                                                        <span className="font-semibold">{metrics.roi.monthlySavings.toLocaleString('pl-PL')} PLN/msc</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Zwrot: </span>
                                                        <span className="font-semibold">{metrics.roi.paybackMonths} msc</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">ROI rok: </span>
                                                        <span className="font-semibold text-emerald-600">{metrics.roi.yearlyROI}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Recommendation */}
                                    {metrics.nodesWithMetrics === 0 && (
                                        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                            <div className="flex items-start gap-2">
                                                <Target className="h-4 w-4 text-amber-500 mt-0.5" />
                                                <div className="text-xs">
                                                    <p className="font-medium text-amber-600">Brak metryk</p>
                                                    <p className="text-muted-foreground">
                                                        Kliknij na elementy, aby dodać metryki procesu
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {metrics.roi.roiPotential > 0.7 && (
                                        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                            <div className="flex items-start gap-2">
                                                <TrendingUp className="h-4 w-4 text-emerald-500 mt-0.5" />
                                                <div className="text-xs">
                                                    <p className="font-medium text-emerald-600">Wysoki potencjał ROI</p>
                                                    <p className="text-muted-foreground">
                                                        Zwrot inwestycji w {metrics.roi.paybackMonths} miesięcy
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Card>
            </motion.div>
        </AnimatePresence>
    );
}
