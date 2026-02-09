'use client';

import { useMemo } from 'react';
import { Node } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    Users,
    Clock,
    Zap,
    ArrowRight,
    Sparkles,
    X,
    BarChart3,
    Target,
    AlertTriangle,
    CheckCircle2,
    Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import type { Area } from './AreaManager';

// ============================================================================
// TYPES
// ============================================================================

interface AreaAnalysis {
    area: Area;
    nodeCount: number;
    totalTimeHours: number;
    estimatedFTE: number;
    automationPotential: number;
    savingsAfterAutomation: number;
    fteAfterOptimization: number;
    bottlenecks: number;
    recommendation: 'automate' | 'optimize' | 'maintain' | 'restructure';
    priority: 'high' | 'medium' | 'low';
}

interface OptimizationPanelProps {
    nodes: Node[];
    areas: Area[];
    isOpen: boolean;
    onToggle: () => void;
}

// ============================================================================
// HELPERS
// ============================================================================

function getRecommendation(analysis: Omit<AreaAnalysis, 'recommendation' | 'priority'>): {
    recommendation: AreaAnalysis['recommendation'];
    priority: AreaAnalysis['priority'];
} {
    if (analysis.automationPotential > 0.7 && analysis.totalTimeHours > 40) {
        return { recommendation: 'automate', priority: 'high' };
    }
    if (analysis.bottlenecks > 2) {
        return { recommendation: 'restructure', priority: 'high' };
    }
    if (analysis.automationPotential > 0.5) {
        return { recommendation: 'optimize', priority: 'medium' };
    }
    return { recommendation: 'maintain', priority: 'low' };
}

const RECOMMENDATION_LABELS: Record<AreaAnalysis['recommendation'], { label: string; color: string; icon: typeof Zap }> = {
    automate: { label: 'Automatyzuj', color: 'text-purple-600 bg-purple-500/10', icon: Zap },
    optimize: { label: 'Optymalizuj', color: 'text-blue-600 bg-blue-500/10', icon: TrendingUp },
    maintain: { label: 'Utrzymuj', color: 'text-emerald-600 bg-emerald-500/10', icon: CheckCircle2 },
    restructure: { label: 'Restrukturyzuj', color: 'text-amber-600 bg-amber-500/10', icon: AlertTriangle },
};

const PRIORITY_COLORS: Record<AreaAnalysis['priority'], string> = {
    high: 'bg-red-500',
    medium: 'bg-amber-500',
    low: 'bg-emerald-500',
};

// ============================================================================
// COMPONENT
// ============================================================================

export function OptimizationPanel({ nodes, areas, isOpen, onToggle }: OptimizationPanelProps) {
    const areaAnalyses = useMemo(() => {
        // Group nodes by area (using data.areaId)
        const analyses: AreaAnalysis[] = areas.map(area => {
            const areaNodes = nodes.filter(n => n.data?.areaId === area.id);
            const totalTimeMinutes = areaNodes.reduce((sum, n) => {
                const t = n.data?.timeMinutes ?? 30;
                const occ = n.data?.occurrencesPerMonth ?? 20;
                return sum + t * occ;
            }, 0);
            const totalTimeHours = totalTimeMinutes / 60;
            const estimatedFTE = totalTimeHours / 168; // 168h = full-time/month
            const avgAutomation = areaNodes.length > 0
                ? areaNodes.reduce((s, n) => s + (n.data?.automation ?? 0.3), 0) / areaNodes.length
                : 0;
            const automationPotential = areaNodes.length > 0
                ? areaNodes.reduce((s, n) => s + (n.data?.automationPotential ?? 0.6), 0) / areaNodes.length
                : 0;
            const bottlenecks = areaNodes.filter(n => (n.data?.problemScore ?? 0) > 7).length;
            const savingsAfterAutomation = totalTimeHours * 120 * automationPotential * 0.7; // PLN
            const fteAfterOptimization = estimatedFTE * (1 - automationPotential * 0.7);

            const partial = {
                area,
                nodeCount: areaNodes.length,
                totalTimeHours: Math.round(totalTimeHours * 10) / 10,
                estimatedFTE: Math.round(estimatedFTE * 100) / 100,
                automationPotential: Math.round(automationPotential * 100) / 100,
                savingsAfterAutomation: Math.round(savingsAfterAutomation),
                fteAfterOptimization: Math.round(fteAfterOptimization * 100) / 100,
                bottlenecks,
            };

            const { recommendation, priority } = getRecommendation(partial);
            return { ...partial, recommendation, priority };
        });

        return analyses.sort((a, b) => {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    }, [nodes, areas]);

    // Totals
    const totals = useMemo(() => ({
        currentFTE: areaAnalyses.reduce((s, a) => s + a.estimatedFTE, 0),
        optimizedFTE: areaAnalyses.reduce((s, a) => s + a.fteAfterOptimization, 0),
        totalSavings: areaAnalyses.reduce((s, a) => s + a.savingsAfterAutomation, 0),
        highPriority: areaAnalyses.filter(a => a.priority === 'high').length,
    }), [areaAnalyses]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, x: '100%' }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed inset-y-0 right-0 w-[420px] bg-card border-l border-border shadow-xl z-50 flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
                            <Target className="h-4 w-4 text-cyan-500" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-sm">Analiza Optymalizacji</h2>
                            <p className="text-xs text-muted-foreground">{areas.length} obszarów • {nodes.length} procesów</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggle}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Summary Cards */}
                <div className="p-4 grid grid-cols-2 gap-3">
                    <Card className="border-dashed">
                        <CardContent className="p-3">
                            <div className="flex items-center gap-2 mb-1">
                                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">Obecne FTE</span>
                            </div>
                            <p className="text-xl font-bold">{totals.currentFTE.toFixed(1)}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-dashed border-emerald-500/30">
                        <CardContent className="p-3">
                            <div className="flex items-center gap-2 mb-1">
                                <TrendingDown className="h-3.5 w-3.5 text-emerald-500" />
                                <span className="text-xs text-muted-foreground">Po optymalizacji</span>
                            </div>
                            <p className="text-xl font-bold text-emerald-500">{totals.optimizedFTE.toFixed(1)}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-dashed col-span-2 border-blue-500/30">
                        <CardContent className="p-3 flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                                    <span className="text-xs text-muted-foreground">Potencjał oszczędności</span>
                                </div>
                                <p className="text-xl font-bold text-blue-500">
                                    {totals.totalSavings.toLocaleString('pl-PL')} <span className="text-xs font-normal">PLN/msc</span>
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground">Redukcja FTE</p>
                                <p className="text-lg font-bold text-emerald-500">
                                    -{((1 - totals.optimizedFTE / Math.max(0.01, totals.currentFTE)) * 100).toFixed(0)}%
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Separator />

                {/* Per-Area Analysis */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Analiza per departament</p>
                    {areaAnalyses.map(analysis => {
                        const rec = RECOMMENDATION_LABELS[analysis.recommendation];
                        const RecIcon = rec.icon;
                        return (
                            <Card key={analysis.area.id} className="overflow-hidden">
                                <CardHeader className="pb-2 pt-3 px-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="h-3 w-3 rounded-sm"
                                                style={{ backgroundColor: analysis.area.color }}
                                            />
                                            <CardTitle className="text-sm">{analysis.area.name}</CardTitle>
                                            <Badge variant="secondary" className="text-[10px]">
                                                {analysis.nodeCount} proc.
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className={`h-2 w-2 rounded-full ${PRIORITY_COLORS[analysis.priority]}`} />
                                            <Badge className={`text-[10px] ${rec.color}`}>
                                                <RecIcon className="h-3 w-3 mr-1" />
                                                {rec.label}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="px-3 pb-3 space-y-2">
                                    {/* FTE Bar */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>FTE</span>
                                            <span>
                                                {analysis.estimatedFTE.toFixed(2)}
                                                <ArrowRight className="h-3 w-3 inline mx-1" />
                                                <span className="text-emerald-500 font-medium">
                                                    {analysis.fteAfterOptimization.toFixed(2)}
                                                </span>
                                            </span>
                                        </div>
                                        <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                                            <div
                                                className="absolute inset-y-0 left-0 rounded-full bg-muted-foreground/30"
                                                style={{ width: `${Math.min(100, analysis.estimatedFTE * 100)}%` }}
                                            />
                                            <div
                                                className="absolute inset-y-0 left-0 rounded-full bg-emerald-500"
                                                style={{ width: `${Math.min(100, analysis.fteAfterOptimization * 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Metrics Row */}
                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                        <div className="text-center p-1.5 rounded bg-muted/50">
                                            <Clock className="h-3 w-3 mx-auto mb-0.5 text-blue-500" />
                                            <p className="font-medium">{analysis.totalTimeHours}h</p>
                                            <p className="text-[10px] text-muted-foreground">miesięcznie</p>
                                        </div>
                                        <div className="text-center p-1.5 rounded bg-muted/50">
                                            <Zap className="h-3 w-3 mx-auto mb-0.5 text-purple-500" />
                                            <p className="font-medium">{Math.round(analysis.automationPotential * 100)}%</p>
                                            <p className="text-[10px] text-muted-foreground">automatyzacja</p>
                                        </div>
                                        <div className="text-center p-1.5 rounded bg-muted/50">
                                            <TrendingUp className="h-3 w-3 mx-auto mb-0.5 text-emerald-500" />
                                            <p className="font-medium">{analysis.savingsAfterAutomation.toLocaleString('pl-PL')}</p>
                                            <p className="text-[10px] text-muted-foreground">PLN/msc</p>
                                        </div>
                                    </div>

                                    {analysis.bottlenecks > 0 && (
                                        <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-500/10 rounded px-2 py-1">
                                            <AlertTriangle className="h-3 w-3" />
                                            {analysis.bottlenecks} wąskie gardło{analysis.bottlenecks > 1 ? 'a' : ''}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}

                    {areas.length === 0 && (
                        <div className="text-center py-8">
                            <Building2 className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                            <p className="text-sm text-muted-foreground">Dodaj obszary aby zobaczyć analizę</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
