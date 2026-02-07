'use client';

import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ROIMetrics {
    timeIntensity?: number | null;
    capitalIntensity?: number | null;
    complexity?: number | null;
    automationPotential?: number | null;
}

interface ROIScoreCellProps {
    metrics: ROIMetrics;
    showDetails?: boolean;
}

/**
 * Calculate ROI Score from node metrics
 * Formula: (automationPotential × 10) / (timeIntensity + capitalIntensity + complexity) × 100
 * Higher automation potential + lower costs = higher ROI
 */
export function calculateROIScore(metrics: ROIMetrics): number {
    const {
        timeIntensity = 5,
        capitalIntensity = 5,
        complexity = 5,
        automationPotential = 5,
    } = metrics;

    const time = timeIntensity ?? 5;
    const capital = capitalIntensity ?? 5;
    const comp = complexity ?? 5;
    const potential = automationPotential ?? 5;

    // Effort = average of cost factors (1-10 scale)
    const effort = (time + capital + comp) / 3;

    // Avoid division by zero
    if (effort === 0) return 100;

    // ROI = Potential / Effort × 100, capped at 100
    const rawScore = (potential / effort) * 100;
    return Math.min(100, Math.round(rawScore));
}

/**
 * Get ROI category based on score
 */
export function getROICategory(score: number): {
    label: string;
    color: string;
    bgColor: string;
    description: string;
} {
    if (score >= 80) {
        return {
            label: 'Doskonały',
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
            description: 'Bardzo wysoki potencjał zwrotu z inwestycji',
        };
    }
    if (score >= 50) {
        return {
            label: 'Dobry',
            color: 'text-amber-600',
            bgColor: 'bg-amber-100 dark:bg-amber-900/30',
            description: 'Solidny potencjał zwrotu z inwestycji',
        };
    }
    if (score >= 25) {
        return {
            label: 'Średni',
            color: 'text-orange-600',
            bgColor: 'bg-orange-100 dark:bg-orange-900/30',
            description: 'Umiarkowany zwrot z inwestycji',
        };
    }
    return {
        label: 'Niski',
        color: 'text-red-600',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        description: 'Niski potencjał automatyzacji',
    };
}

/**
 * Get trend icon based on score comparison
 */
function getTrendIcon(score: number) {
    if (score >= 70) return <TrendingUp className="h-3 w-3" />;
    if (score >= 40) return <Minus className="h-3 w-3" />;
    return <TrendingDown className="h-3 w-3" />;
}

/**
 * ROI Score Cell Component
 * Displays a calculated ROI score with color-coded badge
 */
export function ROIScoreCell({ metrics, showDetails = false }: ROIScoreCellProps) {
    const score = calculateROIScore(metrics);
    const category = getROICategory(score);

    const content = (
        <Badge
            variant="outline"
            className={cn(
                'font-mono font-semibold gap-1',
                category.bgColor,
                category.color
            )}
        >
            {getTrendIcon(score)}
            {score}%
        </Badge>
    );

    if (!showDetails) {
        return content;
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>{content}</TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-4">
                            <span className="font-semibold">{category.label}</span>
                            <span className="font-mono text-lg">{score}%</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {category.description}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Czasochłonność:</span>
                                <span>{metrics.timeIntensity ?? 5}/10</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Kapitałochłonność:</span>
                                <span>{metrics.capitalIntensity ?? 5}/10</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Złożoność:</span>
                                <span>{metrics.complexity ?? 5}/10</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Potencjał AI:</span>
                                <span>{metrics.automationPotential ?? 5}/10</span>
                            </div>
                        </div>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

/**
 * Intensity Badge Component
 * Displays a 0-10 intensity value as a color-coded badge
 */
interface IntensityBadgeProps {
    value: number | null | undefined;
    label?: string;
    inverted?: boolean; // If true, higher is worse (e.g., cost)
}

export function IntensityBadge({ value, label, inverted = false }: IntensityBadgeProps) {
    const numValue = value ?? 5;

    const getColor = () => {
        const thresholds = inverted
            ? { good: 3, medium: 6 } // For cost: lower is better
            : { good: 7, medium: 4 }; // For potential: higher is better

        if (inverted) {
            if (numValue <= thresholds.good) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            if (numValue <= thresholds.medium) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
        } else {
            if (numValue >= thresholds.good) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            if (numValue >= thresholds.medium) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
        }
    };

    return (
        <Badge variant="outline" className={cn('font-mono', getColor())}>
            {numValue}/10
            {label && <span className="ml-1 text-muted-foreground text-[10px]">{label}</span>}
        </Badge>
    );
}

export default ROIScoreCell;
