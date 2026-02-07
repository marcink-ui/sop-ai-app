'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Clock,
    CircleDollarSign,
    TrendingUp,
    TrendingDown,
    Zap,
    ArrowRight,
    Sparkles,
    Calculator,
    Target,
    ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// ============================================================
// TYPES
// ============================================================

interface ROIOpportunity {
    id: string;
    name: string;
    type: string;
    segment?: string;
    timeIntensity: number;
    capitalIntensity: number;
    complexity: number;
    automationPotential: number;
    roiScore: number;
    estimatedSavingsHours?: number;
    estimatedSavingsPLN?: number;
}

interface ROISummary {
    totalProcesses: number;
    averageROIScore: number;
    totalTimePotential: number;      // hours/month saved potential
    totalCostPotential: number;      // PLN/month saved potential
    highROICount: number;            // processes with >=70 ROI score
    topOpportunities: ROIOpportunity[];
}

interface ROICalculatorWidgetProps {
    className?: string;
    limit?: number;  // Number of top opportunities to show
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function calculateROIScore(metrics: {
    timeIntensity: number;
    capitalIntensity: number;
    complexity: number;
    automationPotential: number;
}): number {
    const { timeIntensity, capitalIntensity, complexity, automationPotential } = metrics;
    const effort = (timeIntensity + capitalIntensity + complexity) / 3;
    if (effort === 0) return automationPotential * 10;
    const rawScore = (automationPotential / effort) * 100;
    return Math.min(100, Math.round(rawScore));
}

function getROICategory(score: number): { label: string; color: string; bgColor: string } {
    if (score >= 80) return { label: 'Doskonały', color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-500/10' };
    if (score >= 50) return { label: 'Dobry', color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-500/10' };
    if (score >= 25) return { label: 'Średni', color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-500/10' };
    return { label: 'Niski', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-500/10' };
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function StatCard({
    icon: Icon,
    label,
    value,
    subtext,
    trend,
    iconColor,
}: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    subtext?: string;
    trend?: 'up' | 'down';
    iconColor?: string;
}) {
    return (
        <div className="rounded-lg border bg-card p-4 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Icon className={cn("h-4 w-4", iconColor)} />
                <span className="text-xs font-medium">{label}</span>
            </div>
            <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{value}</span>
                {trend && (
                    trend === 'up'
                        ? <TrendingUp className="h-4 w-4 text-emerald-500" />
                        : <TrendingDown className="h-4 w-4 text-red-500" />
                )}
            </div>
            {subtext && (
                <p className="text-xs text-muted-foreground">{subtext}</p>
            )}
        </div>
    );
}

function OpportunityRow({ opportunity }: { opportunity: ROIOpportunity }) {
    const category = getROICategory(opportunity.roiScore);

    return (
        <div className="flex items-center justify-between py-3 border-b last:border-0">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{opportunity.name}</span>
                    {opportunity.segment && (
                        <Badge variant="outline" className="text-xs shrink-0">
                            {opportunity.segment}
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {opportunity.timeIntensity}/10
                    </span>
                    <span className="flex items-center gap-1">
                        <CircleDollarSign className="h-3 w-3" />
                        {opportunity.capitalIntensity}/10
                    </span>
                    <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        {opportunity.automationPotential}/10
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-3 ml-4">
                <Badge
                    variant="outline"
                    className={cn('font-mono font-semibold', category.bgColor, category.color)}
                >
                    {opportunity.roiScore}%
                </Badge>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link
                                href={`/value-chain?id=${opportunity.id}`}
                                className="p-1 rounded hover:bg-accent transition-colors"
                            >
                                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Zobacz w łańcuchu wartości</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function ROICalculatorWidget({ className, limit = 5 }: ROICalculatorWidgetProps) {
    const [summary, setSummary] = useState<ROISummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchROIData() {
            try {
                setIsLoading(true);
                const res = await fetch('/api/value-chain/maps');
                if (!res.ok) throw new Error('Failed to fetch');

                const data = await res.json();
                const chains = data.valueChains || [];

                // Calculate ROI metrics from chains
                const opportunities: ROIOpportunity[] = chains.map((chain: {
                    id: string;
                    name: string;
                    segment?: string;
                    totalTimeIntensity?: number;
                    totalCapitalIntensity?: number;
                    averageComplexity?: number;
                    automationScore?: number;
                    nodesCount?: number;
                }) => {
                    const timeIntensity = chain.totalTimeIntensity || 5;
                    const capitalIntensity = chain.totalCapitalIntensity || 5;
                    const complexity = chain.averageComplexity || 5;
                    const automationPotential = (chain.automationScore || 50) / 10;

                    const roiScore = calculateROIScore({
                        timeIntensity: timeIntensity / Math.max(1, chain.nodesCount || 1),
                        capitalIntensity: capitalIntensity / Math.max(1, chain.nodesCount || 1),
                        complexity,
                        automationPotential,
                    });

                    return {
                        id: chain.id,
                        name: chain.name,
                        type: 'valueChain',
                        segment: chain.segment,
                        timeIntensity: Math.round(timeIntensity),
                        capitalIntensity: Math.round(capitalIntensity),
                        complexity: Math.round(complexity),
                        automationPotential: Math.round(automationPotential),
                        roiScore,
                    };
                });

                // Sort by ROI score descending
                opportunities.sort((a, b) => b.roiScore - a.roiScore);

                // Calculate summary
                const avgROI = opportunities.length > 0
                    ? Math.round(opportunities.reduce((sum, o) => sum + o.roiScore, 0) / opportunities.length)
                    : 0;

                const highROICount = opportunities.filter(o => o.roiScore >= 70).length;

                // Estimate savings (placeholder calculations)
                const totalTimePotential = opportunities.reduce((sum, o) => {
                    return sum + (o.timeIntensity * o.automationPotential * 2);
                }, 0);

                const totalCostPotential = totalTimePotential * 100; // PLN per hour estimate

                setSummary({
                    totalProcesses: opportunities.length,
                    averageROIScore: avgROI,
                    totalTimePotential: Math.round(totalTimePotential),
                    totalCostPotential: Math.round(totalCostPotential),
                    highROICount,
                    topOpportunities: opportunities.slice(0, limit),
                });

            } catch (err) {
                setError('Nie udało się załadować danych ROI');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }

        fetchROIData();
    }, [limit]);

    if (isLoading) {
        return (
            <Card className={className}>
                <CardContent className="py-8">
                    <div className="flex items-center justify-center text-muted-foreground">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                        <span className="ml-3">Ładowanie...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error || !summary) {
        return (
            <Card className={className}>
                <CardContent className="py-8">
                    <p className="text-center text-muted-foreground">{error || 'Brak danych'}</p>
                </CardContent>
            </Card>
        );
    }

    const roiCategory = getROICategory(summary.averageROIScore);

    return (
        <Card className={className}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Calculator className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">Kalkulator ROI</CardTitle>
                    </div>
                    <Badge variant="secondary" className="font-normal">
                        {summary.totalProcesses} {summary.totalProcesses === 1 ? 'proces' : 'procesów'}
                    </Badge>
                </div>
                <CardDescription>
                    Potencjał optymalizacji procesów
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <StatCard
                        icon={Target}
                        label="Średnie ROI"
                        value={`${summary.averageROIScore}%`}
                        subtext={roiCategory.label}
                        iconColor="text-purple-500"
                    />
                    <StatCard
                        icon={Sparkles}
                        label="Wysokie ROI"
                        value={summary.highROICount}
                        subtext="procesów ≥70%"
                        trend={summary.highROICount > 0 ? 'up' : undefined}
                        iconColor="text-amber-500"
                    />
                    <StatCard
                        icon={Clock}
                        label="Potencjał czasu"
                        value={`${summary.totalTimePotential}h`}
                        subtext="godzin / miesiąc"
                        trend="up"
                        iconColor="text-blue-500"
                    />
                    <StatCard
                        icon={CircleDollarSign}
                        label="Potencjał oszczędności"
                        value={`${(summary.totalCostPotential / 1000).toFixed(1)}k`}
                        subtext="PLN / miesiąc"
                        trend="up"
                        iconColor="text-emerald-500"
                    />
                </div>

                {/* Average ROI Progress */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Średni potencjał automatyzacji</span>
                        <span className={cn("font-medium", roiCategory.color)}>
                            {summary.averageROIScore}%
                        </span>
                    </div>
                    <Progress value={summary.averageROIScore} className="h-2" />
                </div>

                {/* Top Opportunities */}
                {summary.topOpportunities.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Top {limit} możliwości
                        </h4>
                        <div className="divide-y">
                            {summary.topOpportunities.map((opportunity) => (
                                <OpportunityRow key={opportunity.id} opportunity={opportunity} />
                            ))}
                        </div>
                    </div>
                )}

                {/* CTA */}
                <Button asChild variant="outline" className="w-full">
                    <Link href="/value-chain" className="flex items-center gap-2">
                        Zobacz wszystkie łańcuchy wartości
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
